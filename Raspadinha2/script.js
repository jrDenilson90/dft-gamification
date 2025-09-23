 // raspadinha.js
 document.addEventListener('DOMContentLoaded', function () {

            const prizes = [{
                emoji: '👗',
                text1: '25%',
                text2: 'Vestidos',
                code: 'VESTIDOS25',
                type: 'discount',
                background: 'background-dresses'
            }, {
                emoji: '💎',
                text1: '30%',
                text2: 'Premium',
                code: 'PREMIUM30',
                type: 'jackpot',
                background: 'background-premium'
            }, {
                emoji: '👠',
                text1: '20%',
                text2: 'Calçados',
                code: 'SHOES20',
                type: 'discount',
                background: 'background-shoes'
            }, {
                emoji: '🕶️',
                text1: 'Frete',
                text2: 'Grátis',
                code: 'FRETEGRATIS',
                type: 'special',
                background: 'background-free-shipping'
            }, {
                emoji: '💍',
                text1: '35%',
                text2: 'Joias',
                code: 'JOIAS35',
                type: 'jackpot',
                background: 'background-jewelry'
            }, {
                emoji: '💄',
                text1: '15%',
                text2: 'Beleza',
                code: 'BEAUTY15',
                type: 'discount',
                background: 'background-beauty'
            }, {
                emoji: '👜',
                text1: '40%',
                text2: 'Bolsas',
                code: 'BAGS40',
                type: 'jackpot',
                background: 'background-bags'
            }, {
                emoji: '😔',
                text1: 'Tente',
                text2: 'Novamente',
                code: null,
                type: 'retry',
                background: 'background-retry'
            }];

            let isScratching = false;
            let scratchedPixels = 0;
            let totalPixels = 0;
            let currentPrize = null;
            let hasWon = false;

            const canvas = document.getElementById('scratchCanvas');
            const ctx = canvas.getContext('2d');
            const scratchLayer = document.getElementById('scratchLayer');
            const prizeLayer = document.getElementById('prizeLayer');
            const prizeText1 = document.getElementById('prizeText1');
            const prizeText2 = document.getElementById('prizeText2');
            const prizeCode = document.getElementById('prizeCode');
            const progressFill = document.getElementById('progressFill');
            const progressBar = document.getElementById('progressBar');
            const progressText = document.getElementById('progressText');
            const hintText = document.getElementById('hintText');
            const resultMessage = document.getElementById('resultMessage');
            const headerMessage = document.getElementById('headerMessage');
            const couponHintText = document.getElementById('couponHintText');
            const playAgainBtn = document.getElementById('playAgainBtn');
            const couponImageContainer = document.getElementById('couponImageContainer');
            const couponCodeText = document.getElementById('couponCodeText');
            const closeButton = document.getElementById('closeButton');

            function initCanvas() {
                const rect = canvas.getBoundingClientRect();
                canvas.width = rect.width;
                canvas.height = rect.height;
                ctx.fillStyle = 'rgba(192, 192, 192, 1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                totalPixels = canvas.width * canvas.height;
                scratchedPixels = 0;
            }

            function createConfetti() {
                const colors = ['#ff6b9d', '#ff8fab', '#ffd700', '#ffb347', '#4ecdc4'];

                for (let i = 0; i < 30; i++) {
                    setTimeout(() => {
                        const confetti = document.createElement('div');
                        confetti.className = 'confetti';
                        confetti.style.left = Math.random() * 100 + '%';
                        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                        confetti.style.animationDelay = Math.random() * 2 + 's';
                        document.body.appendChild(confetti);

                        setTimeout(() => {
                            if (confetti.parentNode) {
                                confetti.parentNode.removeChild(confetti);
                            }
                        }, 3000);
                    }, i * 50);
                }
            }

            function getRandomPrize() {
                const random = Math.random();
                if (random < 0.05) {
                    return prizes[6];
                } else if (random < 0.12) {
                    return Math.random() < 0.5 ? prizes[1] : prizes[4];
                } else if (random < 0.25) {
                    return prizes[7];
                } else if (random < 0.40) {
                    return prizes[3];
                } else {
                    const mediumPrizes = [prizes[0], prizes[2], prizes[5]];
                    return mediumPrizes[Math.floor(Math.random() * mediumPrizes.length)];
                }
            }

            function generateNewCard() {
                currentPrize = getRandomPrize();

                prizeLayer.className = `prize-layer ${currentPrize.background}`;
                prizeText1.textContent = currentPrize.text1;
                prizeText2.textContent = currentPrize.text2;
                prizeCode.textContent = currentPrize.code || '';
                prizeCode.style.display = 'none';

                scratchLayer.style.display = 'flex';
                canvas.style.display = 'block';

                scratchedPixels = 0;
                progressFill.style.width = '0%';
                progressBar.style.display = 'block';
                progressText.style.display = 'block';
                hintText.style.display = 'block';
                couponImageContainer.style.display = 'none';
                couponHintText.style.display = 'none';
                playAgainBtn.style.display = 'none';

                headerMessage.style.display = 'block';
                resultMessage.style.display = 'none';
                resultMessage.innerHTML = '';

                initCanvas();
                hasWon = false;
            }

            function scratch(x, y) {
                const brushSize = 20;
                ctx.globalCompositeOperation = 'destination-out';
                ctx.beginPath();
                ctx.arc(x, y, brushSize, 0, 2 * Math.PI);
                ctx.fill();

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                let transparentPixels = 0;
                for (let i = 3; i < imageData.data.length; i += 4) {
                    if (imageData.data[i] === 0) {
                        transparentPixels++;
                    }
                }

                scratchedPixels = transparentPixels;
                const percentage = (scratchedPixels / totalPixels) * 100;
                progressFill.style.width = Math.min(percentage, 100) + '%';

                if (percentage >= 60 && !hasWon) {
                    revealPrize();
                }
            }

            function revealPrize() {
                hasWon = true;

                scratchLayer.style.display = 'none';
                canvas.style.display = 'none';
                progressBar.style.display = 'none';
                progressText.style.display = 'none';
                hintText.style.display = 'none';

                showResult(currentPrize);
            }

            function showResult(prize) {
                headerMessage.style.display = 'none';
                resultMessage.style.display = 'block';

                if (prize.type === 'retry') {
                    resultMessage.innerHTML = `
                        <h3>🎯 Tente Novamente!</h3>
                        <p class="text-win">
                            Você ganhou mais uma chance!
                        </p>
                    `;
                    playAgainBtn.style.display = 'inline-block';
                } else {
                    if (prize.type === 'jackpot') {
                        createConfetti();
                        resultMessage.innerHTML = `
                            <h3>Parabéns!</h3>
                            <p class="text-win">
                                Você ganhou o prêmio máximo!
                            </p>
                        `;
                    } else if (prize.type === 'special') {
                        createConfetti();
                        resultMessage.innerHTML = `
                            <h3>🚚 Que sorte!</h3>
                            <p class="text-win">
                                Frete grátis na sua próxima compra!
                            </p>
                        `;
                    } else {
                        createConfetti();
                        resultMessage.innerHTML = `
                            <h3>Parabéns!</h3>
                            <p class="text-win">
                                Você ganhou um desconto especial!
                            </p>
                        `;
                    }

                    if (prize.code) {
                        couponCodeText.textContent = prize.code;
                        couponImageContainer.style.display = 'block';
                        couponHintText.style.display = 'block';
                    }
                    playAgainBtn.style.display = 'none';
                }
            }

            function resetGame() {
                generateNewCard();
            }

            let isMouseDown = false;

            function getEventPos(e) {
                const rect = canvas.getBoundingClientRect();
                const clientX = e.clientX || (e.touches && e.touches[0].clientX);
                const clientY = e.clientY || (e.touches && e.touches[0].clientY);
                return {
                    x: clientX - rect.left,
                    y: clientY - rect.top
                };
            }

            canvas.addEventListener('mousedown', (e) => {
                isMouseDown = true;
                const pos = getEventPos(e);
                scratch(pos.x, pos.y);
            });

            canvas.addEventListener('mousemove', (e) => {
                if (isMouseDown) {
                    const pos = getEventPos(e);
                    scratch(pos.x, pos.y);
                }
            });

            canvas.addEventListener('mouseup', () => {
                isMouseDown = false;
            });

            canvas.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const pos = getEventPos(e);
                scratch(pos.x, pos.y);
            });

            canvas.addEventListener('touchmove', (e) => {
                e.preventDefault();
                const pos = getEventPos(e);
                scratch(pos.x, pos.y);
            });

            closeButton.addEventListener('click', () => {
                document.body.classList.add('hidden');
            });

            playAgainBtn.addEventListener('click', resetGame);
            generateNewCard();
        });

        (function () {
            // Espera a que exista el contenedor del cupón
            const waitForEl = (sel, cb, tries = 50) => {
                const el = document.querySelector(sel);
                if (el) return cb(el);
                if (tries <= 0) return;
                setTimeout(() => waitForEl(sel, cb, tries - 1), 100);
            };

            // Muestra un toast temporal (máx 7s)
            function showToast(message = 'cupon copiado', duration = 3000) {
                // Evita toasts duplicados
                const existing = document.getElementById('scratch-toast');
                if (existing) existing.remove();

                const toast = document.createElement('div');
                toast.id = 'scratch-toast';
                toast.textContent = message;

                // Estilos inline para no tocar tu CSS
                toast.style.position = 'fixed';
                toast.style.left = '50%';
                toast.style.bottom = '24px';
                toast.style.transform = 'translateX(-50%)';
                toast.style.zIndex = '9999';
                toast.style.background = '#000';
                toast.style.color = '#fff';
                toast.style.padding = '10px 16px';
                toast.style.borderRadius = '999px';
                toast.style.fontFamily = '"gopher", system-ui, -apple-system, Segoe UI, Roboto, sans-serif';
                toast.style.fontSize = '14px';
                toast.style.fontWeight = '700';
                toast.style.letterSpacing = '0.3px';
                toast.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
                toast.style.opacity = '0';
                toast.style.transition = 'opacity 200ms ease, transform 200ms ease';
                toast.style.pointerEvents = 'none';

                document.body.appendChild(toast);

                // Fade-in
                requestAnimationFrame(() => {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateX(-50%) translateY(0)';
                });

                // Asegura que nunca supere 7s
                const safeDuration = Math.min(Math.max(1000, duration), 7000);

                setTimeout(() => {
                    // Fade-out
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(-50%) translateY(6px)';
                    setTimeout(() => toast.remove(), 250);
                }, safeDuration);
            }

            // Copia al portapapeles con fallback
            async function copyToClipboard(text) {
                if (!text) return false;

                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(text);
                        return true;
                    }
                } catch (e) {
                    // continúa al fallback
                }

                // Fallback execCommand
                try {
                    const ta = document.createElement('textarea');
                    ta.value = text;
                    // Minimiza parpadeo
                    ta.style.position = 'fixed';
                    ta.style.top = '-1000px';
                    ta.style.left = '-1000px';
                    document.body.appendChild(ta);
                    ta.focus();
                    ta.select();
                    const ok = document.execCommand('copy');
                    ta.remove();
                    return ok;
                } catch (e) {
                    return false;
                }
            }

            // Conecta el click en la imagen/contenedor del cupón
            waitForEl('#couponImageContainer', (container) => {
                container.style.cursor = 'pointer';

                container.addEventListener('click', async () => {
                    const codeEl = document.getElementById('couponCodeText');
                    const code = (codeEl && codeEl.textContent || '').trim();
                    if (!code) return;

                    const ok = await copyToClipboard(code);
                    if (ok) {
                        showToast('cupon copiado', 3000); // 3s (<= 7s)
                    } else {
                        // Si falla el copiado, igual mostramos el toast para feedback
                        showToast('cupon copiado', 3000);
                    }
                }, {
                    passive: true
                });
            });
        })();