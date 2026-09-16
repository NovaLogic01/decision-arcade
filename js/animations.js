(function() {
  'use strict';
  
  window.DecisionArcade = window.DecisionArcade || {};
  const DecisionArcade = window.DecisionArcade;

  DecisionArcade.Animations = {
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    
    init: function() {
      // Listen for system changes to reduced motion
      window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', e => {
        this.reducedMotion = e.matches;
      });

      this.setupCategoryBadge();
    },

    setupCategoryBadge: function() {
      const input = document.getElementById('home-input') || document.querySelector('.input-field');
      if (!input) return;

      // Create badge element
      const wrapper = document.createElement('div');
      wrapper.style.position = 'relative';
      wrapper.style.display = 'inline-block';
      wrapper.style.width = '100%';
      wrapper.style.maxWidth = '500px';
      
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      const badge = document.createElement('div');
      badge.className = 'category-badge fade-in';
      badge.style.position = 'absolute';
      badge.style.right = '1rem';
      badge.style.top = '50%';
      badge.style.transform = 'translateY(-50%)';
      badge.style.fontSize = '0.75rem';
      badge.style.padding = '0.25rem 0.5rem';
      badge.style.borderRadius = '4px';
      badge.style.background = 'var(--glass)';
      badge.style.border = '1px solid var(--glass-border)';
      badge.style.color = 'var(--accent)';
      badge.style.pointerEvents = 'none';
      badge.style.opacity = '0';
      badge.style.transition = this.reducedMotion ? 'none' : 'opacity 0.3s ease';
      
      wrapper.appendChild(badge);

      let debounceTimer;
      input.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        const val = e.target.value.trim();
        
        if (!val) {
          badge.style.opacity = '0';
          return;
        }

        debounceTimer = setTimeout(() => {
          if (typeof DecisionArcade.classifyCategory === 'function') {
            const classification = DecisionArcade.classifyCategory(val);
            if (classification.category !== 'GENERAL' && classification.confidence > 0) {
              badge.textContent = classification.category;
              badge.style.opacity = '1';
            } else {
              badge.style.opacity = '0';
            }
          }
        }, 300);
      });
    },

    staggerReveal: function(containerId, elementsSelector, baseDelay = 100) {
      const container = document.getElementById(containerId) || document.querySelector(containerId);
      if (!container) return;

      const elements = container.querySelectorAll(elementsSelector);
      elements.forEach((el, index) => {
        if (this.reducedMotion) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        } else {
          el.style.opacity = '0';
          el.style.transform = 'translateY(10px)';
          el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          
          setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
          }, baseDelay * (index + 1));
        }
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    DecisionArcade.Animations.init();
  });
})();