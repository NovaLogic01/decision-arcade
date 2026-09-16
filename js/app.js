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
  
  DecisionArcade.classifyCategory = function(text) {
    if (!text) return 'GENERAL';
    const lowerText = text.toLowerCase();
    
    const categories = {
      FOOD: ['eat', 'food', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sushi', 'taco', 'restaurant', 'cook', 'recipe', 'snack', 'hungry', 'meal', 'drink', 'coffee', 'tea'],
      SHOPPING: ['buy', 'purchase', 'shop', 'shoes', 'phone', 'laptop', 'order', 'cart', 'price', 'deal', 'sale', 'spend', 'afford'],
      SOCIAL: ['text', 'call', 'friend', 'date', 'party', 'invite', 'hang', 'meet', 'relationship', 'talk', 'message', 'dm'],
      ENTERTAINMENT: ['watch', 'movie', 'show', 'play', 'game', 'read', 'book', 'listen', 'music', 'netflix', 'stream', 'concert', 'festival'],
      STUDY: ['study', 'learn', 'course', 'class', 'homework', 'exam', 'test', 'degree', 'university', 'college', 'school', 'grade'],
      TRAVEL: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'visit', 'explore', 'destination', 'abroad', 'road trip', 'beach', 'mountain'],
      WORK: ['job', 'work', 'career', 'apply', 'interview', 'resign', 'quit', 'salary', 'boss', 'promotion', 'meeting', 'project']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return category;
      }
    }
    return 'GENERAL';
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
