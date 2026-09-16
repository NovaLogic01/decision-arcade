(function() {
    window.DecisionArcade = window.DecisionArcade || {};
    const Duel = {};

    Duel.pickWinner = function(optionA, optionB) {
        const hash = window.DecisionArcade.Fate && window.DecisionArcade.Fate.hashString 
            ? window.DecisionArcade.Fate.hashString(optionA + optionB)
            : (function(str) {
                let h = 5381;
                for (let i = 0; i < str.length; i++) { h = ((h << 5) + h) + str.charCodeAt(i); }
                return Math.abs(h);
            })(optionA + optionB);
            
        return hash % 2 === 0 ? optionA : optionB;
    };

    Duel.buildDuelUrl = function(a, b) {
        const url = new URL(window.location.origin + '/duel/');
        url.searchParams.set('a', a);
        url.searchParams.set('b', b);
        return url.toString();
    };

    Duel.init = function(containerEl) {
        if (!containerEl) return;
        
        const params = new URLSearchParams(window.location.search);
        const paramA = params.get('a');
        const paramB = params.get('b');
        
        containerEl.innerHTML = '';
        
        if (paramA && paramB) {
            const header = document.createElement('h3');
            header.className = 'verdict-tagline text-center';
            header.textContent = 'YOUR FRIEND HAS A DECISION';
            
            const sub = document.createElement('p');
            sub.className = 'text-center text-muted mb-6';
            sub.style.marginBottom = '2rem';
            sub.textContent = "They can't choose between...";
            
            const vsDiv = document.createElement('div');
            vsDiv.className = 'mode-card';
            vsDiv.style.flexDirection = 'row';
            vsDiv.style.justifyContent = 'space-between';
            vsDiv.style.alignItems = 'center';
            vsDiv.style.marginBottom = '2rem';
            vsDiv.style.cursor = 'default';
            
            const aEl = document.createElement('div');
            aEl.className = 'text-xl font-bold text-primary';
            aEl.style.fontSize = '1.5rem';
            aEl.textContent = paramA;
            
            const vsText = document.createElement('div');
            vsText.className = 'text-muted italic';
            vsText.textContent = 'vs';
            
            const bEl = document.createElement('div');
            bEl.className = 'text-xl font-bold text-primary';
            bEl.style.fontSize = '1.5rem';
            bEl.textContent = paramB;
            
            vsDiv.appendChild(aEl);
            vsDiv.appendChild(vsText);
            vsDiv.appendChild(bEl);
            
            const revealBtn = document.createElement('button');
            revealBtn.className = 'btn btn-primary';
            revealBtn.style.display = 'block';
            revealBtn.style.width = '100%';
            revealBtn.style.maxWidth = '400px';
            revealBtn.style.margin = '0 auto';
            revealBtn.textContent = 'Reveal the Answer';
            revealBtn.onclick = () => Duel.showResult(containerEl, paramA, paramB);
            
            containerEl.appendChild(header);
            containerEl.appendChild(sub);
            containerEl.appendChild(vsDiv);
            containerEl.appendChild(revealBtn);
            
        } else {
            const form = document.createElement('div');
            form.className = 'duel-form';
            form.style.display = 'flex';
            form.style.flexDirection = 'column';
            form.style.gap = '1rem';
            form.style.maxWidth = '500px';
            form.style.margin = '0 auto';
            
            const inputA = document.createElement('input');
            inputA.type = 'text';
            inputA.className = 'input-field';
            inputA.placeholder = 'Option A (e.g. Pizza)';
            
            const vsDiv = document.createElement('div');
            vsDiv.className = 'text-center text-muted italic';
            vsDiv.textContent = 'vs';
            
            const inputB = document.createElement('input');
            inputB.type = 'text';
            inputB.className = 'input-field';
            inputB.placeholder = 'Option B (e.g. Sushi)';
            
            const submitBtn = document.createElement('button');
            submitBtn.className = 'btn btn-primary';
            submitBtn.style.marginTop = '1rem';
            submitBtn.textContent = 'Start Duel';
            submitBtn.onclick = () => {
                const a = inputA.value.trim();
                const b = inputB.value.trim();
                if (a && b) {
                    Duel.showResult(containerEl, a, b);
                }
            };
            
            form.appendChild(inputA);
            form.appendChild(vsDiv);
            form.appendChild(inputB);
            form.appendChild(submitBtn);
            
            containerEl.appendChild(form);
        }
    };

    Duel.showResult = function(containerEl, optionA, optionB) {
        containerEl.innerHTML = '';
        
        const loader = document.createElement('div');
        loader.className = 'text-center reveal text-accent text-lg';
        loader.style.padding = '3rem';
        loader.style.letterSpacing = '2px';
        loader.style.textTransform = 'uppercase';
        loader.textContent = 'The arena is deciding...';
        containerEl.appendChild(loader);
        
        setTimeout(() => {
            const winner = Duel.pickWinner(optionA, optionB);
            const loser = winner === optionA ? optionB : optionA;
            
            containerEl.innerHTML = '';
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'verdict-result text-center reveal';
            
            const badge = document.createElement('div');
            badge.className = 'verdict-tagline';
            badge.textContent = 'THE WINNER';
            
            const winnerEl = document.createElement('h2');
            winnerEl.className = 'verdict-text';
            winnerEl.textContent = winner;
            
            const loserEl = document.createElement('p');
            loserEl.className = 'text-muted';
            loserEl.style.fontSize = '1.25rem';
            loserEl.style.marginTop = '2rem';
            loserEl.textContent = 'Sorry, ' + loser + '. Not today.';
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'action-buttons';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.gap = '1rem';
            actionsDiv.style.justifyContent = 'center';
            actionsDiv.style.marginTop = '3rem';
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-primary';
            shareBtn.textContent = 'Share Duel';
            shareBtn.onclick = () => {
                const url = Duel.buildDuelUrl(optionA, optionB);
                navigator.clipboard.writeText(url).then(() => {
                    shareBtn.textContent = 'Copied!';
                    setTimeout(() => shareBtn.textContent = 'Share Duel', 2000);
                });
            };
            
            const newBtn = document.createElement('button');
            newBtn.className = 'btn btn-outline';
            newBtn.textContent = 'New Duel';
            newBtn.onclick = () => {
                window.location.href = '/duel/';
            };
            
            actionsDiv.appendChild(shareBtn);
            actionsDiv.appendChild(newBtn);
            
            resultDiv.appendChild(badge);
            resultDiv.appendChild(winnerEl);
            resultDiv.appendChild(loserEl);
            resultDiv.appendChild(actionsDiv);
            
            containerEl.appendChild(resultDiv);
            
            if (window.DecisionArcade.History) {
                window.DecisionArcade.History.save({ question: optionA + ' vs ' + optionB, result: winner, mode: 'Duel' });
            }
        }, 1500);
    };

    window.DecisionArcade.Duel = Duel;
})();
