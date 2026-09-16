(function() {
    window.DecisionArcade = window.DecisionArcade || {};
    const Fate = {};

    Fate.hashString = function(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) + str.charCodeAt(i);
        }
        return Math.abs(hash);
    };

    Fate.loadVerdicts = async function() {
        try {
            const response = await fetch('/data/results.json');
            const data = await response.json();
            window.DecisionArcade.verdictData = data.verdicts || data;
        } catch (error) {
            console.error('Error loading verdicts, falling back to defaults', error);
            window.DecisionArcade.verdictData = [
                { category: 'GENERAL', verdict: 'YES', tagline: 'Absolutely.', explanation: 'The stars are aligned in your favor.' },
                { category: 'GENERAL', verdict: 'NO', tagline: 'Not a chance.', explanation: 'Best to walk away now.' },
                { category: 'GENERAL', verdict: 'MAYBE', tagline: 'Give it time.', explanation: 'The answer will reveal itself soon.' },
                { category: 'GENERAL', verdict: 'DO IT', tagline: 'Take the leap.', explanation: 'You only live once.' },
                { category: 'GENERAL', verdict: 'SKIP IT', tagline: 'Not worth it.', explanation: 'Save your energy for something else.' }
            ];
        }
    };

    Fate.getVerdict = function(question, seed = '') {
        const category = window.DecisionArcade.classifyCategory ? window.DecisionArcade.classifyCategory(question) : 'GENERAL';
        const hash = Fate.hashString(question + seed);
        
        let verdicts = window.DecisionArcade.verdictData || [];
        let filteredVerdicts = verdicts.filter(v => v.category === category);
        
        if (filteredVerdicts.length === 0) {
            filteredVerdicts = verdicts.filter(v => v.category === 'GENERAL');
        }
        if (filteredVerdicts.length === 0) {
            filteredVerdicts = [{ verdict: 'YES', tagline: 'Sure.', explanation: 'Why not?', category: 'GENERAL' }];
        }
        
        const index = hash % filteredVerdicts.length;
        const result = filteredVerdicts[index];
        return {
            verdict: result.verdict,
            tagline: result.tagline,
            explanation: result.explanation,
            category: category,
            hash: hash
        };
    };

    Fate.init = function(containerEl) {
        if (!containerEl) return;
        let question = sessionStorage.getItem('da_current_question');
        if (!question && document.getElementById('question-input')) {
            question = document.getElementById('question-input').value;
        }
        question = question || 'What should I do?';
        
        containerEl.innerHTML = '';
        const loader = document.createElement('div');
        loader.className = 'text-accent text-center reveal';
        loader.style.padding = '3rem';
        loader.style.fontSize = '1.25rem';
        loader.style.letterSpacing = '2px';
        loader.style.textTransform = 'uppercase';
        loader.textContent = 'consulting the cosmos...';
        containerEl.appendChild(loader);

        setTimeout(() => {
            const result = Fate.getVerdict(question);
            
            containerEl.innerHTML = '';
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'verdict-result text-center reveal';
            
            const taglineEl = document.createElement('h3');
            taglineEl.className = 'verdict-tagline';
            taglineEl.textContent = result.tagline;
            
            const verdictEl = document.createElement('h2');
            verdictEl.className = 'verdict-text';
            verdictEl.textContent = result.verdict;
            
            const explanationEl = document.createElement('p');
            explanationEl.className = 'verdict-explanation';
            explanationEl.textContent = result.explanation;
            
            resultDiv.appendChild(taglineEl);
            resultDiv.appendChild(verdictEl);
            resultDiv.appendChild(explanationEl);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '1rem';
            actionsDiv.style.justifyContent = 'center';
            actionsDiv.style.flexWrap = 'wrap';
            actionsDiv.style.marginTop = '2rem';
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-primary';
            shareBtn.textContent = 'Share Result';
            if (window.DecisionArcade.Share) {
                shareBtn.onclick = () => window.DecisionArcade.Share.copyLink();
            }
            
            const retryBtn = document.createElement('button');
            retryBtn.className = 'btn btn-outline';
            retryBtn.textContent = 'Try Again';
            retryBtn.onclick = () => Fate.init(containerEl);
            
            const decideOtherBtn = document.createElement('button');
            decideOtherBtn.className = 'btn btn-ghost';
            decideOtherBtn.textContent = 'New Question';
            decideOtherBtn.onclick = () => {
                sessionStorage.removeItem('da_current_question');
                window.location.reload();
            };
            
            actionsDiv.appendChild(shareBtn);
            actionsDiv.appendChild(retryBtn);
            actionsDiv.appendChild(decideOtherBtn);
            
            resultDiv.appendChild(actionsDiv);
            containerEl.appendChild(resultDiv);
            
            if (window.DecisionArcade.History) {
                window.DecisionArcade.History.save({ question, result: result.verdict, mode: 'Fate' });
            }
        }, 1200);
    };

    window.DecisionArcade.Fate = Fate;
    
    if (!window.DecisionArcade.verdictData) {
        Fate.loadVerdicts();
    }
})();
