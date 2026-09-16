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
    clearBtn.textContent = 'Clear History';
    clearBtn.addEventListener('click', () => {
      DecisionArcade.History.clear();
      DecisionArcade.History.render(containerEl);
      DecisionArcade.showToast('History cleared');
    });
    containerEl.appendChild(clearBtn);
  };

})();
