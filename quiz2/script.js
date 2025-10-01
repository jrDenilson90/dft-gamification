document.addEventListener('DOMContentLoaded', function () {

    const questions = [
        {
            question: "Qual dessas marcas é famosa por seus tênis casuais?",
            options: [
                "A. Santa Lolla",
                "B. Vans",
                "C. Lança Perfume",
                "D. Mango"
            ],
            // Agora tratamos como 1-based (1..4)
            answer: 2,
            emoji: ""
        },
        {
            question: "O que é um 'blazer'?",
            options: [
                "A. Tipo de calçado",
                "B. Acessório de cabelo",
                "C. Peça de roupa social",
                "D. Bolsa de mão"
            ],
            answer: 3,
            emoji: ""
        },
        {
            question: "Qual estampa está sempre em alta no verão?",
            options: [
                "A. Poá",
                "B. Xadrez",
                "C. Listras",
                "D. Floral"
            ],
            answer: 4,
            emoji: ""
        }
    ];

    let currentQuestion = 0;
    let correctAnswers = 0;
    const startTime = Date.now();

    const quizDiv = document.getElementById('quiz');
    const feedbackDiv = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');
    const restartBtn = document.getElementById('restartBtn');
    const progressBar = document.getElementById('progressBar');
    const questionCounter = document.getElementById('questionCounter');
    const headerEmoji = document.getElementById('headerEmoji');

    const positiveFeedback = [
        "Arrasou!",
        "Perfeito!",
        "Você é expert!",
        "Incrível!"
    ];

    const encouragement = [
        "Quase lá!",
        "Não desista!",
        "Próxima você acerta!"
    ];

    // ========== Helpers: Tracking, Badge e Fallback Copy ==========

    function trackEvent(eventName, properties = {}) {
        try {
            const eventProperties = {
                quiz_session: Date.now(),
                current_question: currentQuestion + 1,
                correct_answers: correctAnswers,
                timestamp: new Date().toISOString(),
                ...properties
            };

            if (typeof window.braze !== 'undefined') {
                window.braze.logCustomEvent(eventName, eventProperties);
                window.braze.requestImmediateDataFlush();
            } else if (typeof window.appboy !== 'undefined') {
                window.appboy.logCustomEvent(eventName, eventProperties);
                window.appboy.requestImmediateDataFlush();
            }
        } catch (error) {
            console.error('Tracking error:', error);
        }
    }

    function ensureCopiedBadgeStyles() {
        if (document.getElementById('copied-badge-styles')) return;
        const style = document.createElement('style');
        style.id = 'copied-badge-styles';
        document.head.appendChild(style);
    }

    function showCopiedBadge(el) {
        if (!el) return;
        clearTimeout(el._copiedTimer);
        if (!el.hasAttribute('data-after')) {
            el.setAttribute('data-after', 'Copiado!');
        }
        el.classList.add('copied');
        el._copiedTimer = setTimeout(() => el.classList.remove('copied'), 1500);
    }

    function copiaFallback(txt) {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (!ok) throw new Error('execCommand("copy") retornou false');
    }

    // ========== Fechar Quiz ==========
    window.closeQuiz = function () {
        const timeSpent = Date.now() - startTime;

        trackEvent('quiz_closed', {
            action: 'close_button_clicked',
            time_spent_ms: timeSpent,
            questions_answered: currentQuestion,
            quiz_completed: false
        });

        try {
            if (window.braze && window.braze.closeMessage) {
                window.braze.closeMessage();
            } else if (window.appboy && window.appboy.closeMessage) {
                window.appboy.closeMessage();
            } else if (window.brazeBridge && window.brazeBridge.closeMessage) {
                window.brazeBridge.closeMessage();
            } else if (window.appboyBridge && window.appboyBridge.closeMessage) {
                window.appboyBridge.closeMessage();
            } else {
                document.body.style.display = 'none';
            }
        } catch (error) {
            document.body.style.display = 'none';
        }
    };

    // ========== Progresso ==========
    function updateProgress() {
        const progress = (currentQuestion / questions.length) * 100;
        progressBar.style.width = progress + '%';
    }

    // Remove prefixos tipo "A. ", "B. " apenas na exibição
    function stripLetterPrefix(text) {
        return text.replace(/^[A-D]\.\s*/i, '');
    }

    // ========== Render Pergunta ==========
    function showQuestion() {
        feedbackDiv.textContent = '';
        feedbackDiv.className = '';
        nextBtn.style.display = 'none';

        const q = questions[currentQuestion];
        headerEmoji.textContent = q.emoji || '';
        questionCounter.textContent = 'Pergunta ' + (currentQuestion + 1) + ' de ' + questions.length;

        let html = '<div class="question">' + q.question + '</div><div class="options">';
        for (let i = 0; i < q.options.length; i++) {
            // Mostra 1,2,3,4 e remove "A. ", "B. " do texto
            const labelNumber = i + 1;
            const displayText = stripLetterPrefix(q.options[i]);
            html += '<button onclick="selectOption(' + i + ')" id="opt' + i + '">' + labelNumber + '. ' + displayText + '</button>';
        }
        html += '</div>';
        quizDiv.innerHTML = html;

        updateProgress();
    }

    // ========== Confete ==========
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            setTimeout(function () {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                const colors = ['#667eea', '#764ba2', '#fbbf24', '#4ade80'];
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                document.body.appendChild(confetti);
                setTimeout(function () {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    // ========== Seleção de Opção ==========
    window.selectOption = function (idx) {
        const q = questions[currentQuestion];
        const buttons = document.querySelectorAll('.options button');

        for (let i = 0; i < buttons.length; i++) {
            buttons[i].disabled = true;
        }

        // Agora a verificação é 1-based: (idx + 1)
        const isCorrect = (idx + 1) === q.answer;

        if (isCorrect) {
            buttons[idx].classList.add('correct');
            correctAnswers++;

            const randomFeedback = positiveFeedback[Math.floor(Math.random() * positiveFeedback.length)];
            feedbackDiv.textContent = randomFeedback;
            feedbackDiv.className = 'feedback-correct';

            headerEmoji.style.animation = 'none';
            setTimeout(function () {
                headerEmoji.style.animation = 'bounce 2s infinite';
            }, 10);
        } else {
            buttons[idx].classList.add('incorrect');
            // Destaca a correta com base em 1-based
            const correctIdx = q.answer - 1;
            if (buttons[correctIdx]) buttons[correctIdx].classList.add('correct');

            const randomEncouragement = encouragement[Math.floor(Math.random() * encouragement.length)];
            feedbackDiv.textContent = randomEncouragement;
            feedbackDiv.className = 'feedback-incorrect';
        }

        trackEvent('quiz_question_answered', {
            action: 'question_answered',
            question_text: q.question,
            // Guarda texto sem prefixo e também o número 1..4
            selected_answer_number: idx + 1,
            selected_answer_text: stripLetterPrefix(q.options[idx]),
            correct_answer_number: q.answer,
            correct_answer_text: stripLetterPrefix(q.options[q.answer - 1]),
            is_correct: isCorrect
        });

        nextBtn.style.display = 'inline-block';
    };

    // ========== Próxima / Resultado ==========
    nextBtn.onclick = function () {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            showQuestion();
        } else {
            showResult();
        }
    };

    function showResult() {
        quizDiv.innerHTML = '';
        nextBtn.style.display = 'none';
        feedbackDiv.textContent = '';
    
        const timeSpent = Date.now() - startTime;
    
        if (correctAnswers === questions.length) {
            createConfetti();
    
            trackEvent('quiz_completed_success', {
                action: 'quiz_won',
                time_spent_ms: timeSpent,
                final_score: correctAnswers,
                coupon_awarded: 'FASHION15OFF'
            });
    
            quizDiv.innerHTML =
                '<div class="result-container">' +
                '<img class="trophy-emoji" src="https://dafitistatic.dafiti.com.br/cms/2025_09_12_16_07_01_Outline.png" alt="">' +
                '<p style="margin:25px 0 15px; font-size: 20px; line-height: 1.4; font-weight: 300;">Parabéns, você é <br> <b>Fashion Expert!</b></p>' +
                '<p style="font-size: 12px; margin-bottom: 12px;">Você ganhou!</p>' +
                '<div class="cupom">' +
                '<img class="trophy-emoji" src="https://dafitistatic.dafiti.com.br/cms/2025_09_12_16_23_55_Subtract.png" alt="">' +
                '<p class="copy" id="meuCopy">FASHION15OFF</p>' +
                '</div>' +
                '<p style="font-size: 10px; margin-top: 12px;">Válido por 7 dias suas marcas favoritas!</p>' +
                '</div>';
        } else {
            const percentage = Math.round((correctAnswers / questions.length) * 100);
    
            trackEvent('quiz_completed_failure', {
                action: 'quiz_lost',
                time_spent_ms: timeSpent,
                final_score: correctAnswers
            });
    
            quizDiv.innerHTML =
                '<div class="result-container">' +
                '<img class="trophy-emoji" src="https://dafitistatic.dafiti.com.br/cms/2025_09_12_16_06_59_Outline.png" alt="">' +
                '<h3 style="margin-bottom: 15px;">Quase lá!</h3>' +
                '<div class="score-display">' +
                'Você acertou ' + correctAnswers + ' de ' + questions.length + ' perguntas (' + percentage + '%)' +
                '</div>' +
                '<p style="font-size: 12px; margin-top: 12px;">Tente novamente para ganhar o cupom!</p>' +
                '</div>';
            restartBtn.style.display = 'inline-block';
        }
    
        // Ao terminar, garante 100%
        progressBar.style.width = '100%';
    
        // Esconde contadores se existirem
        document.querySelectorAll('.question-counter').forEach(el => {
            el.style.display = 'none';
        });
        document.querySelectorAll('.progress-container').forEach(el => {
            el.style.display = 'none';
        });
    
        // Garante CSS do badge "Copiado!"
        ensureCopiedBadgeStyles();
    
        // copy text cupom
        const el = document.querySelector('.copy');
        if (!el) {
            console.error('Elemento com classe .copy não encontrado.');
            return;
        }
    
        if (!window.isSecureContext) {
            console.warn('Clipboard API pode não funcionar sem HTTPS/localhost.');
        }
    
        el.addEventListener('click', async () => {
            const texto = el.innerText.trim();
    
            try {
                if (!navigator.clipboard || !navigator.clipboard.writeText) {
                    throw new Error('Clipboard API indisponível');
                }
                await navigator.clipboard.writeText(texto);
                showCopiedBadge(el);
            } catch (err) {
                console.warn('Falha na Clipboard API, usando fallback. Erro:', err);
                try {
                    copiaFallback(texto);
                    showCopiedBadge(el);
                } catch (e) {
                    console.error('Fallback falhou:', e);
                    alert('Não foi possível copiar automaticamente. Selecione e copie manualmente.');
                }
            }
        });
    }

    // ========== Restart ==========
    restartBtn.onclick = function () {
        trackEvent('quiz_restarted', {
            action: 'play_again_clicked'
        });

        currentQuestion = 0;
        correctAnswers = 0;
        restartBtn.style.display = 'none';
        showQuestion();
    };

    // ========== Inicialização ==========
    showQuestion();

    // Track impression
    trackEvent('quiz_impression', {
        action: 'quiz_displayed'
    });
});