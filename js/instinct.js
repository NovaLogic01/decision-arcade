(function() {
    window.DecisionArcade = window.DecisionArcade || {};
    const Instinct = {};
    
    const questions = [
        {
            prompt: "Quick — without thinking — which way are you leaning right now?",
            options: [
                { text: "I should skip it", score: 0 },
                { text: "I should do it", score: 1 }
            ]
        },
        {
            prompt: "Imagine you went with it. Tomorrow morning, how do you feel?",
            options: [
                { text: "A little uneasy", score: 0 },
                { text: "Excited, no regrets", score: 1 }
            ]
        },
        {
            prompt: "Your best friend says \"Don't do it.\" What's your gut reaction?",
            options: [
                { text: "They're probably right", score: 0 },
                { text: "No way, I want to", score: 1 }
            ]
        },
        {
            prompt: "Last one. Flip a mental coin — it lands on DON'T. Are you relieved or disappointed?",
            options: [
                { text: "Relieved, honestly", score: 0 },
                { text: "Wait, no, I want to!", score: 1 }
            ]
        }
    ];

    let currentQuestionIndex = 0;
    let totalScore = 0;
    let quizContainer = null;

    Instinct.init = function(containerEl) {
        if (!containerEl) return;
        quizContainer = containerEl;
        currentQuestionIndex = 0;
        totalScore = 0;
        
        quizContainer.innerHTML = '';
        
        const intro = document.createElement('div');
        intro.className = 'text-center reveal';
        intro.style.maxWidth = '600px';
        intro.style.margin = '0 auto';
        
        const warning = document.createElement('p');
        warning.className = 'text-muted';
        warning.style.marginBottom = '3rem';
        warning.textContent = "This isn't a personality test — it's a mirror. We're just helping you hear what your gut is already saying.";
        
        const startBtn = document.createElement('button');
        startBtn.className = 'btn btn-primary';
        startBtn.style.padding = '1.25rem 3rem';
        startBtn.textContent = 'Start Gut Check';
        startBtn.onclick = () => Instinct.showQuestion(0);
        
        intro.appendChild(warning);
        intro.appendChild(startBtn);
        quizContainer.appendChild(intro);
    };

    Instinct.showQuestion = function(index) {
        if (index >= questions.length) {
            return Instinct.showResult();
        }
        currentQuestionIndex = index;
        const q = questions[index];
        
        quizContainer.innerHTML = '';
        
        const qDiv = document.createElement('div');
        qDiv.className = 'text-center reveal';
        qDiv.style.maxWidth = '600px';
        qDiv.style.margin = '0 auto';
        
        const progress = document.createElement('p');
        progress.className = 'text-muted';
        progress.style.textTransform = 'uppercase';
        progress.style.letterSpacing = '1px';
        progress.style.marginBottom = '2rem';
        progress.textContent = 'Question ' + (index + 1) + ' of ' + questions.length;
        
        const promptEl = document.createElement('h3');
        promptEl.style.marginBottom = '3rem';
        promptEl.style.fontSize = '1.75rem';
        promptEl.style.lineHeight = '1.4';
        promptEl.textContent = q.prompt;
        
        const optsDiv = document.createElement('div');
        optsDiv.style.display = 'flex';
        optsDiv.style.flexDirection = 'column';
        optsDiv.style.gap = '1rem';
        
        q.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-outline';
            btn.style.padding = '1.25rem';
            btn.style.fontSize = '1.125rem';
            btn.textContent = opt.text;
            btn.onclick = () => Instinct.recordAnswer(index, opt.score);
            optsDiv.appendChild(btn);
        });
        
        qDiv.appendChild(progress);
        qDiv.appendChild(promptEl);
        qDiv.appendChild(optsDiv);
        
        quizContainer.appendChild(qDiv);
    };

    Instinct.recordAnswer = function(index, value) {
        totalScore += value;
        setTimeout(() => {
            Instinct.showQuestion(index + 1);
        }, 150);
    };

    Instinct.showResult = function() {
        quizContainer.innerHTML = '';
        
        let verdict = "";
        let explanation = "";
        
        if (totalScore <= 1) {
            verdict = "SKIP IT";
            explanation = "You already know. Your gut says skip it.";
        } else if (totalScore === 2) {
            verdict = "TORN";
            explanation = "You're genuinely torn. Maybe sleep on it?";
        } else {
            verdict = "DO IT";
            explanation = "You already know. Your gut says DO IT.";
        }
        
        const resDiv = document.createElement('div');
        resDiv.className = 'verdict-result text-center reveal';
        
        const verdictEl = document.createElement('h2');
        verdictEl.className = 'verdict-text';
        verdictEl.textContent = verdict;
        
        const expEl = document.createElement('p');
        expEl.className = 'verdict-explanation text-muted';
        expEl.textContent = explanation;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'action-buttons';
        actionsDiv.style.display = 'flex';
        actionsDiv.style.gap = '1rem';
        actionsDiv.style.justifyContent = 'center';
        actionsDiv.style.marginTop = '3rem';
        
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-secondary';
        restartBtn.textContent = 'Try Again';
        restartBtn.onclick = () => Instinct.init(quizContainer);
        
        const newBtn = document.createElement('button');
        newBtn.className = 'btn btn-outline';
        newBtn.textContent = 'New Question';
        newBtn.onclick = () => {
            sessionStorage.removeItem('da_current_question');
            window.location.reload();
        };
        
        actionsDiv.appendChild(restartBtn);
        actionsDiv.appendChild(newBtn);
        
        resDiv.appendChild(verdictEl);
        resDiv.appendChild(expEl);
        resDiv.appendChild(actionsDiv);
        
        quizContainer.appendChild(resDiv);
        
        const question = sessionStorage.getItem('da_current_question') || 'General Gut Check';
        if (window.DecisionArcade.History) {
            window.DecisionArcade.History.save({ question, result: verdict, mode: 'Instinct' });
        }
    };

    window.DecisionArcade.Instinct = Instinct;
})();
