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
            // SHARED DUEL MODE
            const header = document.createElement('h3');
            header.className = 'text-accent text-sm uppercase mb-4 text-center';
            header.textContent = 'YOUR FRIEND HAS A DECISION';
            
            const sub = document.createElement('p');
            sub.className = 'text-center mb-6 text-muted';
            sub.textContent = "They can't choose between...";
            
            const vsDiv = document.createElement('div');
            vsDiv.className = 'vs-container flex justify-between items-center bg-gray-900 p-6 rounded-lg mb-8';
            vsDiv.style.display = 'flex';
            vsDiv.style.justifyContent = 'space-around';
            vsDiv.style.alignItems = 'center';
            vsDiv.style.padding = '2rem';
            vsDiv.style.background = '#1a1a24';
            vsDiv.style.borderRadius = '8px';
            vsDiv.style.marginBottom = '2rem';
            
            const aEl = document.createElement('div');
            aEl.className = 'text-xl font-bold';
            aEl.textContent = paramA;
            
            const vsText = document.createElement('div');
            vsText.className = 'text-muted italic';
            vsText.textContent = 'vs';
            
            const bEl = document.createElement('div');
            bEl.className = 'text-xl font-bold';
            bEl.textContent = paramB;
            
            vsDiv.appendChild(aEl);
            vsDiv.appendChild(vsText);
            vsDiv.appendChild(bEl);
            
            const revealBtn = document.createElement('button');
            revealBtn.className = 'btn btn-primary w-full max-w-md mx-auto block';
            revealBtn.style.display = 'block';
            revealBtn.style.margin = '0 auto';
            revealBtn.textContent = 'Reveal the Answer';
            revealBtn.onclick = () => Duel.showResult(containerEl, paramA, paramB);
            
            containerEl.appendChild(header);
            containerEl.appendChild(sub);
            containerEl.appendChild(vsDiv);
            containerEl.appendChild(revealBtn);
            
        } else {
            // INPUT MODE
            const form = document.createElement('div');
            form.className = 'duel-form flex-col gap-4 max-w-md mx-auto';
            form.style.display = 'flex';
            form.style.flexDirection = 'column';
            form.style.gap = '1rem';
            form.style.maxWidth = '400px';
            form.style.margin = '0 auto';
            
            const inputA = document.createElement('input');
            inputA.type = 'text';
            inputA.className = 'input-field min-h-12 p-3 bg-gray-900 text-white border border-gray-700 rounded';
            inputA.placeholder = 'Option A (e.g. Pizza)';
            inputA.style.width = '100%';
            
            const vsDiv = document.createElement('div');
            vsDiv.className = 'text-center text-muted italic my-2';
            vsDiv.textContent = 'vs';
            
            const inputB = document.createElement('input');
            inputB.type = 'text';
            inputB.className = 'input-field min-h-12 p-3 bg-gray-900 text-white border border-gray-700 rounded';
            inputB.placeholder = 'Option B (e.g. Sushi)';
            inputB.style.width = '100%';
            
            const submitBtn = document.createElement('button');
            submitBtn.className = 'btn btn-primary mt-4 py-3';
            submitBtn.textContent = 'DUEL!';
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
        loader.className = 'text-center py-12 fade-in';
        loader.textContent = 'The arena is deciding...';
        containerEl.appendChild(loader);
        
        setTimeout(() => {
            const winner = Duel.pickWinner(optionA, optionB);
            const loser = winner === optionA ? optionB : optionA;
            
            containerEl.innerHTML = '';
            
            const resultDiv = document.createElement('div');
            resultDiv.className = 'duel-result text-center fade-in';
            
            const badge = document.createElement('div');
            badge.className = 'text-accent uppercase text-sm font-bold tracking-widest mb-4';
            badge.textContent = 'THE WINNER';
            
            const winnerEl = document.createElement('h2');
            winnerEl.className = 'text-5xl font-bold mb-8 text-white';
            winnerEl.style.textShadow = '0 0 20px rgba(124, 92, 255, 0.5)';
            winnerEl.textContent = winner;
            
            const loserEl = document.createElement('div');
            loserEl.className = 'text-xl text-gray-500 line-through mb-12';
            loserEl.textContent = loser;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'flex flex-col gap-4 max-w-sm mx-auto';
            actionsDiv.style.display = 'flex';
            actionsDiv.style.flexDirection = 'column';
            actionsDiv.style.gap = '1rem';
            actionsDiv.style.maxWidth = '300px';
            actionsDiv.style.margin = '0 auto';
            
            const shareBtn = document.createElement('button');
            shareBtn.className = 'btn btn-primary';
            shareBtn.textContent = 'Share Duel';
            shareBtn.onclick = () => {
                const url = Duel.buildDuelUrl(optionA, optionB);
                navigator.clipboard.writeText(url).then(() => {
                    shareBtn.textContent = 'Link Copied!';
                    setTimeout(() => shareBtn.textContent = 'Share Duel', 2000);
                });
            };
            
            const newDuelBtn = document.createElement('button');
            newDuelBtn.className = 'btn btn-outline';
            newDuelBtn.textContent = 'New Duel';
            newDuelBtn.onclick = () => {
                window.history.pushState({}, '', '/duel/');
                Duel.init(containerEl);
            };
            
            actionsDiv.appendChild(shareBtn);
            actionsDiv.appendChild(newDuelBtn);
            
            resultDiv.appendChild(badge);
            resultDiv.appendChild(winnerEl);
            resultDiv.appendChild(loserEl);
            resultDiv.appendChild(actionsDiv);
            
            containerEl.appendChild(resultDiv);
            
            if (window.DecisionArcade.History) {
                window.DecisionArcade.History.save({ question: `${optionA} vs ${optionB}`, result: winner, mode: 'Duel' });
            }
        }, 1500);
    };

    window.DecisionArcade.Duel = Duel;
})();
