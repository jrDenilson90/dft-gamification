document.addEventListener('DOMContentLoaded', function () {
    const cupons = [
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_25_16_01_38_Bolsas.png', cupom: 'BOLSAS40', link: 'Link1' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_25_16_01_41_Belleza.png', cupom: 'BELEZA15', link: 'Link2' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_25_16_01_44_accesorios.png', cupom: 'ACESSORIOS20', link: 'Link3' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_25_16_01_33_Pemium.png', cupom: 'PREMIUM30', link: 'Link4' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_25_16_01_36_vestidos.png', cupom: 'VESTIDOS25', link: 'Link5' }
    ];

    let scratchedPixels = 0;
    let totalPixels = 0;
    let hasWon = false;
    let currentCupom = null;
    let lastCupomIndex = -1;

    const canvas = document.getElementById('scratchCanvas');
    const ctx = canvas.getContext('2d');
    const scratchLayer = document.getElementById('scratchLayer');
    const progressFill = document.getElementById('progressFill');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const hintText = document.getElementById('hintText');
    const playAgainBtn = document.getElementById('playAgainBtn');
    const couponImage = document.getElementById('couponImage');
    const couponCodeText = document.getElementById('couponCodeText');
    const couponImageContainer = document.getElementById('couponImageContainer');
    const boxCupom = document.getElementById('boxCupom');
    const copyCupom = document.getElementById('copyCupom');
    const headerMessageText = document.querySelector('.header-message-text');
    const textPremium = document.querySelector('.textPremium');

    playAgainBtn.classList.add('hide');

    function initCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        ctx.globalCompositeOperation = 'source-over';

        // Cria uma imagem em branco
        const imageData = ctx.createImageData(canvas.width, canvas.height);
        const data = imageData.data;

        // Preenche cada pixel com um tom de cinza aleatório
        for (let i = 0; i < data.length; i += 4) {
            const gray = 200 + Math.floor(Math.random() * 60); // Cinza claro
            data[i] = gray;     // R
            data[i + 1] = gray; // G
            data[i + 2] = gray; // B
            data[i + 3] = 255;  // Alpha (opaco)
        }

        ctx.putImageData(imageData, 0, 0);

        totalPixels = canvas.width * canvas.height;
        scratchedPixels = 0;
    }

    function getRandomCupom() {
        let idx;
        do {
            idx = Math.floor(Math.random() * cupons.length);
        } while (idx === lastCupomIndex && cupons.length > 1);
        lastCupomIndex = idx;
        return cupons[idx];
    }

    function generateNewCard() {
        currentCupom = getRandomCupom();

        couponImage.src = currentCupom.img;
        couponImageContainer.classList.add('hide');
        couponCodeText.textContent = '';

        scratchLayer.style.display = 'flex';
        canvas.style.display = 'block';

        scratchedPixels = 0;
        progressFill.style.width = '0%';
        progressBar.style.display = 'block';
        progressText.style.display = 'block';
        hintText.style.display = 'block';
        playAgainBtn.style.display = 'none';

        // Inverte os hides
        if (headerMessageText) headerMessageText.classList.remove('hide');
        if (textPremium) textPremium.classList.add('hide');

        // Esconde o link de novo
        const linkAgainBtn = document.getElementById('linkAgainBtn');
        if (linkAgainBtn) {
            linkAgainBtn.classList.add('hide');
            linkAgainBtn.href = "#";
        }

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

        if (percentage >= 70 && !hasWon) {
            revealPrize();
            createConfetti();
        }
    }

    function revealPrize() {
        hasWon = true;
        scratchLayer.style.display = 'none';
        canvas.style.display = 'none';
        progressBar.style.display = 'none';
        progressText.style.display = 'none';
        hintText.style.display = 'none';

        couponImageContainer.classList.remove('hide');
        couponCodeText.textContent = currentCupom.cupom;

        if (headerMessageText) headerMessageText.classList.add('hide');
        if (textPremium) textPremium.classList.remove('hide');

        // Mostra o link e atualiza o href
        const linkAgainBtn = document.getElementById('linkAgainBtn');
        if (linkAgainBtn) {
            linkAgainBtn.classList.remove('hide');
            linkAgainBtn.href = currentCupom.link;
        }
    }

    function resetGame() {
        generateNewCard();
    }

    // Mouse e Touch
    let isMouseDown = false;
    let isTouching = false;

    function getEventPos(e) {
        const rect = canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Mouse events
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
    canvas.addEventListener('mouseleave', () => {
        isMouseDown = false;
    });

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        isTouching = true;
        const pos = getEventPos(e);
        scratch(pos.x, pos.y);
    });
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (isTouching) {
            const pos = getEventPos(e);
            scratch(pos.x, pos.y);
        }
    });
    canvas.addEventListener('touchend', () => {
        isTouching = false;
    });
    canvas.addEventListener('touchcancel', () => {
        isTouching = false;
    });

    playAgainBtn.addEventListener('click', resetGame);

    // Copiar cupom ao clicar no boxCupom
    if (boxCupom && couponCodeText) {
        boxCupom.addEventListener('click', async function () {
            const code = couponCodeText.textContent.trim();
            if (!code) return;
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(code);
                } else {
                    // Fallback
                    const ta = document.createElement('textarea');
                    ta.value = code;
                    ta.setAttribute('readonly', '');
                    ta.style.position = 'fixed';
                    ta.style.left = '-9999px';
                    document.body.appendChild(ta);
                    ta.select();
                    document.execCommand('copy');
                    document.body.removeChild(ta);
                }
                // Badge "copied"
                const copyTarget = document.getElementById('copyCupom');
                if (copyTarget) {
                    copyTarget.classList.add('copied');
                    setTimeout(() => copyTarget.classList.remove('copied'), 1500);
                }
            } catch (e) {
                alert('Não foi possível copiar o cupom. Copie manualmente.');
            }
        });
    }

    generateNewCard();
});

// ========== Confete ==========
function createConfetti() {
    for (let i = 0; i < 75; i++) {
        setTimeout(function () {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            const colors = ["#FFE85E", "#ffffff", "#FFE85E", "#ffffff"];
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