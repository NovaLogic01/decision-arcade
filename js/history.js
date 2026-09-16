(function() {
  'use strict';
  window.DecisionArcade = window.DecisionArcade || {};
  DecisionArcade.History = {};

  const HISTORY_KEY = 'da_history';
  const MAX_ENTRIES = 20;

  DecisionArcade.History.save = function({question, mode, result, category, timestamp = new Date().toISOString()}) {
    let history = DecisionArcade.History.getAll();
    history.unshift({question, mode, result, category, timestamp});
    if (history.length > MAX_ENTRIES) {
      history = history.slice(0, MAX_ENTRIES);
    }
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history:', e);
    }
  };

  DecisionArcade.History.getAll = function() {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (e) {
      console.error('Failed to parse history, clearing data:', e);
      DecisionArcade.History.clear();
    }
    return [];
  };

  DecisionArcade.History.clear = function() {
    localStorage.removeItem(HISTORY_KEY);
  };

  DecisionArcade.History.getInsight = function(history) {
    if (history.length < 5) return null;
    
    // Count categories
    const catCounts = {};
    const resCounts = {};
    
    history.forEach(item => {
      if (item.category && item.category !== 'GENERAL') {
        catCounts[item.category] = (catCounts[item.category] || 0) + 1;
      }
      if (item.result) {
        resCounts[item.result] = (resCounts[item.result] || 0) + 1;
      }
    });

    let topCat = null;
    let maxCat = 0;
    for (const [cat, count] of Object.entries(catCounts)) {
      if (count > maxCat) {
        maxCat = count;
        topCat = cat;
      }
    }

    let topRes = null;
    let maxRes = 0;
    for (const [res, count] of Object.entries(resCounts)) {
      if (count > maxRes) {
        maxRes = count;
        topRes = res;
      }
    }

    // Pick an insight based on some simple logic
    if (maxCat >= 3) {
      return `Pattern noticed: You've been thinking about ${topCat.toLowerCase()} a lot lately.`;
    }
    if (maxRes >= 4) {
      return `Pattern noticed: You've leaned towards "${topRes}" in ${maxRes} of your recent decisions.`;
    }
    if (history.length === MAX_ENTRIES) {
      return `You've made a lot of decisions recently. Take a breath!`;
    }

    return null;
  };

  DecisionArcade.History.render = function(containerEl) {
    if (!containerEl) return;
    containerEl.innerHTML = '';
    
    const history = DecisionArcade.History.getAll();
    if (history.length === 0) {
      const emptyMsg = document.createElement('p');
      emptyMsg.className = 'text-muted';
      emptyMsg.textContent = 'No decisions yet. Start your journey!';
      containerEl.appendChild(emptyMsg);
      return;
    }

    // V3 Local Pattern Insights
    const insight = DecisionArcade.History.getInsight(history);
    if (insight) {
      const insightDiv = document.createElement('div');
      insightDiv.style.padding = '1rem';
      insightDiv.style.marginBottom = '1.5rem';
      insightDiv.style.border = '1px solid var(--accent-glow)';
      insightDiv.style.borderRadius = '8px';
      insightDiv.style.background = 'var(--glass)';
      insightDiv.style.color = 'var(--text)';
      insightDiv.style.fontSize = '0.9rem';
      insightDiv.innerHTML = `<strong>🔮 Insight:</strong> ${insight}`;
      containerEl.appendChild(insightDiv);
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = 'history-item glass-card';
      
      const qSpan = document.createElement('span');
      qSpan.textContent = item.question || 'Unknown decision';
      qSpan.style.fontWeight = '600';
      
      const rSpan = document.createElement('span');
      rSpan.className = 'text-accent';
      rSpan.textContent = item.result;
      
      const dateStr = new Date(item.timestamp).toLocaleDateString();
      const dSpan = document.createElement('span');
      dSpan.className = 'text-muted';
      dSpan.style.fontSize = '0.8rem';
      dSpan.textContent = dateStr;
      
      div.appendChild(qSpan);
      div.appendChild(rSpan);
      div.appendChild(dSpan);
      
      containerEl.appendChild(div);
    });

    const clearBtn = document.createElement('button');
    clearBtn.className = 'history-clear btn-ghost';
    clearBtn.style.marginTop = '1rem';
    clearBtn.textContent = 'Clear History';
    clearBtn.addEventListener('click', () => {
      DecisionArcade.History.clear();
      DecisionArcade.History.render(containerEl);
      DecisionArcade.showToast('History cleared');
    });
    containerEl.appendChild(clearBtn);
  };

})();