(function() {
    window.DecisionArcade = window.DecisionArcade || {};
    const Fate = {};
    let resultsData = null;

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
            resultsData = await response.json();
        } catch (error) {
            console.error('Error loading verdicts, falling back to defaults', error);
            resultsData = { loading_messages: { GENERAL: ["Consulting the cosmos..."] }, verdicts: [] };
        }
    };

    Fate.getVerdict = function(question, seed = '') {
        const classification = window.DecisionArcade.classifyCategory ? window.DecisionArcade.classifyCategory(question) : { category: 'GENERAL', confidence: 0 };
        const category = classification.category;
        const toneAnalysis = window.DecisionArcade.analyzeIntensity ? window.DecisionArcade.analyzeIntensity(question) : { score: 0, tone: 'playful' };
        
        const hash = Fate.hashString(question + seed);
        
        let verdicts = resultsData.verdicts || [];
        
        // Filter by category and tone
        let filteredVerdicts = verdicts.filter(v => v.category === category && v.intensity === toneAnalysis.tone);
        
        if (filteredVerdicts.length === 0) {
            filteredVerdicts = verdicts.filter(v => v.category === 'GENERAL' && v.intensity === toneAnalysis.tone);
        }
        if (filteredVerdicts.length === 0) {
            filteredVerdicts = verdicts.filter(v => v.category === 'GENERAL');
        }
        if (filteredVerdicts.length === 0) {
            filteredVerdicts = [{ id: 'fallback', verdict: 'YES', tagline: 'Sure.', explanation: 'Why not?', category: 'GENERAL' }];
        }
        
        // No-repeat memory
        let recentIds = [];
        try {
            recentIds = JSON.parse(localStorage.getItem('da_history_fate') || '[]');
        } catch(e) {}
        
        let availableVerdicts = filteredVerdicts.filter(v => !recentIds.includes(v.id));
        if (availableVerdicts.length === 0) availableVerdicts = filteredVerdicts; // Fallback if all exhausted
        
        const index = hash % availableVerdicts.length;
        const result = availableVerdicts[index];
        
        // Update memory
        recentIds.unshift(result.id);
        if (recentIds.length > 5) recentIds.pop();
        localStorage.setItem('da_history_fate', JSON.stringify(recentIds));
        
        // Confidence percentage (deterministic)
        const confidenceVal = Math.floor(40 + (classification.confidence * 40) + ((hash % 20) * 1));
        
        return {
            verdict: result.verdict,
            tagline: result.tagline,
            explanation: result.explanation,
            category: category,
            confidence: confidenceVal + "%",
            hash: hash
        };
    };

    Fate.init = async function(containerEl) {
        if (!containerEl) return;
        if (!resultsData) await Fate.loadVerdicts();

        let question = sessionStorage.getItem('da_current_question');
        if (!question && document.getElementById('question-input')) {
            question = document.getElementById('question-input').value;
        }
        question = question || 'What should I do?';
        
        const classification = window.DecisionArcade.classifyCategory ? window.DecisionArcade.classifyCategory(question) : { category: 'GENERAL' };
        const category = classification.category;
        
        containerEl.innerHTML = '';
        
        // Loader
        const loader = document.createElement('div');
        loader.className = 'text-accent text-center';
        loader.style.padding = '3rem';
        loader.style.fontSize = '1.25rem';
        loader.style.letterSpacing = '2px';
        loader.style.textTransform = 'uppercase';
        containerEl.appendChild(loader);

        const msgs = (resultsData.loading_messages && resultsData.loading_messages[category]) ? resultsData.loading_messages[category] : ["Consulting the cosmos..."];
        
        let cycle = 0;
        loader.textContent = msgs[cycle % msgs.length];
        
        const loaderInterval = setInterval(() => {
            cycle++;
            loader.textContent = msgs[cycle % msgs.length];
        }, 700);

        // Load time (700ms * 2 = 1400ms roughly)
        setTimeout(() => {
            clearInterval(loaderInterval);
            const result = Fate.getVerdict(question);
            
            containerEl.innerHTML = '';
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'verdict-result text-center';
            resultDiv.id = 'fate-result-container';
            
            const confEl = document.createElement('div');
            confEl.className = 'confidence-meter reveal';
            confEl.style.fontSize = '0.8rem';
            confEl.style.color = 'var(--text-muted)';
            confEl.style.marginBottom = '1rem';
            confEl.style.letterSpacing = '1px';
            confEl.textContent = "ALGORITHM CONFIDENCE: " + result.confidence;

            const taglineEl = document.createElement('h3');
            taglineEl.className = 'verdict-tagline reveal';
            taglineEl.textContent = result.tagline;
            
            const verdictEl = document.createElement('h2');
            verdictEl.className = 'verdict-text reveal';
            verdictEl.textContent = result.verdict;
            
            const explanationEl = document.createElement('p');
            explanationEl.className = 'verdict-explanation reveal';
            explanationEl.textContent = result.explanation;
            
            resultDiv.appendChild(confEl);
            resultDiv.appendChild(taglineEl);
            resultDiv.appendChild(verdictEl);
            resultDiv.appendChild(explanationEl);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons reveal';
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
                window.location.href = '/';
            };
            
            actionsDiv.appendChild(shareBtn);
            actionsDiv.appendChild(retryBtn);
            actionsDiv.appendChild(decideOtherBtn);
            resultDiv.appendChild(actionsDiv);

            // Contextual link
            const linkMap = {
                'FOOD': { url: '/what-should-i-eat/', text: 'What Should I Eat' },
                'GENERAL': { url: '/yes-or-no/', text: 'Yes or No' }
            };
            
            // Check if yes/no in input to suggest yes-or-no explicitly
            let crossLink = linkMap[category] || linkMap['GENERAL'];
            if (question.toLowerCase().match(/^(should i|can i|will i|do i|is it|are they|am i)\b/)) {
                crossLink = linkMap['GENERAL'];
            }

            if (crossLink) {
                const crossLinkEl = document.createElement('div');
                crossLinkEl.className = 'reveal';
                crossLinkEl.style.marginTop = '3rem';
                crossLinkEl.style.fontSize = '0.9rem';
                crossLinkEl.style.color = 'var(--text-muted)';
                crossLinkEl.innerHTML = `Still stuck? Try the <a href="${crossLink.url}" style="color: var(--accent); text-decoration: underline;">${crossLink.text}</a> tool.`;
                resultDiv.appendChild(crossLinkEl);
            }
            
            containerEl.appendChild(resultDiv);
            
            if (window.DecisionArcade.Animations && window.DecisionArcade.Animations.staggerReveal) {
                window.DecisionArcade.Animations.staggerReveal('#fate-result-container', '.reveal', 150);
            } else {
                // Fallback if animations not loaded
                document.querySelectorAll('.reveal').forEach(el => el.style.opacity = '1');
            }
            
            if (window.DecisionArcade.History) {
                window.DecisionArcade.History.save({ question, result: result.verdict, mode: 'Fate', category: result.category });
            }
        }, 1400);
    };

    window.DecisionArcade.Fate = Fate;
    
    document.addEventListener('DOMContentLoaded', () => {
        Fate.loadVerdicts();
    });
})();