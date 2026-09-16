(function() {
  'use strict';
  
  window.DecisionArcade = window.DecisionArcade || {};
  const DecisionArcade = window.DecisionArcade;
  
  DecisionArcade.sanitize = function(str, maxLen = 200) {
    if (!str) return '';
    str = String(str);
    str = str.replace(/[<>&"']/g, function(c) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' }[c];
    });
    if (str.length > maxLen) {
      str = str.substring(0, maxLen);
    }
    return str;
  };
  
  DecisionArcade.getParam = function(key) {
    const urlParams = new URLSearchParams(window.location.search);
    return DecisionArcade.sanitize(urlParams.get(key));
  };
  
  DecisionArcade.setParams = function(params) {
    const url = new URL(window.location);
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        url.searchParams.set(key, encodeURIComponent(value));
      } else {
        url.searchParams.delete(key);
      }
    }
    window.history.replaceState({}, '', url);
  };

  // V3 Intelligence Layer Data
  let categoryDict = null;

  async function loadDictionaries() {
    try {
      const res = await fetch('/data/categories.json');
      if (res.ok) {
        categoryDict = await res.json();
      }
    } catch (e) {
      console.warn('Failed to load categories dictionary', e);
    }
  }

  // V3 Tone / Intensity Detection
  DecisionArcade.analyzeIntensity = function(text) {
    if (!text) return { score: 0, tone: 'playful' };
    
    let score = 0;
    
    // Heuristic 1: Punctuation (Exclamation, repeated question marks)
    const exclamations = (text.match(/!/g) || []).length;
    const questions = (text.match(/\?/g) || []).length;
    if (exclamations > 0) score += 0.2 * Math.min(exclamations, 3);
    if (questions > 1) score += 0.2 * Math.min(questions - 1, 2);
    
    // Heuristic 2: ALL CAPS words (excluding single letters like I, A)
    const words = text.split(/\s+/);
    const capsWords = words.filter(w => w.length > 1 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
    if (capsWords > 0) score += 0.15 * Math.min(capsWords, 3);
    
    // Heuristic 3: Distress / Urgency keywords
    const distressWords = ['desperate', 'scared', 'urgent', 'please', 'need', 'help', 'emergency', 'anxious', 'worried', 'afraid', 'terrified', 'crying', 'lost'];
    const lowerText = text.toLowerCase();
    let distressCount = 0;
    distressWords.forEach(w => {
      if (new RegExp('\\b' + w + '\\b').test(lowerText)) distressCount++;
    });
    
    if (distressCount > 0) score += 0.4 * Math.min(distressCount, 2);
    
    // Clamp score 0-1
    score = Math.min(Math.max(score, 0), 1);
    
    // Map to tone register
    let tone = 'playful'; // low
    if (score >= 0.7 || distressCount >= 1) {
      // Safety rule: high intensity or distress -> gentle (non-flippant)
      tone = 'gentle';
    } else if (score >= 0.3) {
      tone = 'direct';
    }
    
    return { score, tone };
  };
  
  // V3 Classification Engine V2
  DecisionArcade.classifyCategory = function(text) {
    if (!text) return { category: 'GENERAL', confidence: 0, secondaryCategory: null, toneModifier: null };
    const lowerText = text.toLowerCase();
    
    // Detect negation
    const negationRegex = /\b(don't|not|never|no way|shouldn't|can't|won't)\b/;
    const hasNegation = negationRegex.test(lowerText);
    const toneModifier = hasNegation ? 'negated' : 'standard';

    if (!categoryDict) {
      // Fallback if not loaded yet
      return { category: 'GENERAL', confidence: 0, secondaryCategory: null, toneModifier };
    }

    // Weighted scoring
    const scores = {};
    for (const cat in categoryDict) {
      scores[cat] = 0;
      for (const phrase in categoryDict[cat]) {
        const weight = categoryDict[cat][phrase];
        // match exact phrase boundaries
        const regex = new RegExp('\\b' + phrase + '\\b', 'g');
        const matches = lowerText.match(regex);
        if (matches) {
          scores[cat] += matches.length * weight;
        }
      }
    }

    // Sort categories by score
    const sorted = Object.keys(scores).map(cat => ({ cat, score: scores[cat] })).sort((a, b) => b.score - a.score);
    
    const top = sorted[0];
    const second = sorted[1];
    
    let finalCat = 'GENERAL';
    let confidence = 0;
    let secondary = null;

    if (top && top.score > 0) {
      finalCat = top.cat;
      // Confidence is a pseudo-percentage based on score thresholds (e.g., 20+ is 100%)
      confidence = Math.min(top.score / 25, 1);
      
      if (second && second.score > 0 && (top.score - second.score) < 5) {
        secondary = second.cat;
      }
    }

    return { category: finalCat, confidence, secondaryCategory: secondary, toneModifier };
  };
  
  DecisionArcade.showScreen = function(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
      screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
      targetScreen.classList.add('active');
    }
  };
  
  DecisionArcade.showToast = function(message, duration = 3000) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Force reflow
    void toast.offsetWidth;

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  };
  
  DecisionArcade.navigateToMode = function(mode, question) {
    if (question) {
      sessionStorage.setItem('da_current_question', DecisionArcade.sanitize(question));
    }
    if (mode) {
      DecisionArcade.setParams({ mode: mode });
      DecisionArcade.showScreen('screen-result'); 
    } else {
      DecisionArcade.showScreen('screen-modes');
    }
  };
  
  DecisionArcade.init = function() {
    loadDictionaries();

    // Nav toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMobile = document.querySelector('.nav-mobile');
    
    if (navToggle && navMobile) {
      navToggle.addEventListener('click', () => {
        navMobile.classList.toggle('active');
      });
      
      document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMobile.contains(e.target)) {
          navMobile.classList.remove('active');
        }
      });
      
      const navLinks = navMobile.querySelectorAll('a');
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          navMobile.classList.remove('active');
        });
      });
    }
    
    // FAQ logic
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentElement;
        const isOpen = item.classList.contains('open');
        
        document.querySelectorAll('.faq-item').forEach(faq => {
          faq.classList.remove('open');
        });
        
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  };
  
  document.addEventListener('DOMContentLoaded', DecisionArcade.init);
  
})();