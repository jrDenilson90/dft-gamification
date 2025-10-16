document.addEventListener('DOMContentLoaded', function () {
    const DADOS_GAMES = [
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_36_57_mask1.png', descriptionPremium: '25% em tudo!', descriptionImg: 'Brisa Coral', cupom: 'TUDO25' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_36_59_mask2.png', descriptionPremium: '20% em tudo!', descriptionImg: 'Céu Radiante', cupom: 'TUDO20' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_37_01_mask3.png', descriptionPremium: '15% em tudo!', descriptionImg: 'Sol Laranja', cupom: 'TUDO15' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_37_03_mask4.png', descriptionPremium: '10% em tudo!', descriptionImg: 'Oásis Esmeralda', cupom: 'TUDO10' }
    ];

    const ButtonOpenBox = document.querySelectorAll('.openBox');

    // Estados/textos
    const textA = document.querySelector('.textInit.textA');
    const textB = document.querySelector('.textInit.textB');
    const textC = document.querySelector('.textInit.textC');
    const feedback = document.querySelector('.feedback');

    // Alvos
    const copyCupomEl = document.getElementById('copyCupom');            // <p id="copyCupom" class="copy">
    const couponCodeTextEl = document.getElementById('couponCodeText');  // <span id="couponCodeText">
    const textPremiumEl = document.querySelector('.textPremium');        // <p class="textPremium">
    const boxCupom = document.getElementById('boxCupom');                // wrapper clicável
    const boxCards = document.querySelector('.boxCards');

    // Render de cards
    function renderCards(list) {
        if (!boxCards) return;
        boxCards.innerHTML = '';
        list.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'card';
            btn.type = 'button';
            btn.dataset.index = String(idx);
            btn.dataset.cupom = item.cupom;

            const img = document.createElement('img');
            img.src = item.img;
            img.alt = item.cupom;

            const p = document.createElement('p');
            p.className = 'text';
            p.textContent = item.descriptionImg;

            btn.appendChild(img);
            btn.appendChild(p);
            boxCards.appendChild(btn);
        });
    }

    let selectedCoupon = null;
    let selectedItem = null;

    function animacard() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function () {
                const idx = Number(this.dataset.index ?? -1);
                selectedItem = DADOS_GAMES[idx] || null;
                selectedCoupon = this.dataset.cupom || selectedItem?.cupom || null;

                document.querySelectorAll('.card').forEach(other => {
                    other.classList.remove('zoomIn');
                    if (other !== this) {
                        other.classList.add('hide', 'zoomOut');
                    } else {
                        other.classList.add('zoomIn');
                    }
                });

                ButtonOpenBox.forEach(btn => btn.classList.remove('hide'));

                if (textA) textA.classList.add('hide');
                if (textB) textB.classList.remove('hide');
                if (textC) textC.classList.add('hide');
            });
        });
    }

    // Abrir caixa -> mostra cupom e premium
    ButtonOpenBox.forEach(buttonOpen => {
        buttonOpen.addEventListener('click', (ev) => {
            // Esconde o botão clicado (adiciona .hide nele)
            const clickedBtn = ev.currentTarget;
            if (clickedBtn && clickedBtn.classList) {
                clickedBtn.classList.add('hide');
            }

            // Adiciona a classe 'scale' na .boxCards
            if (boxCards && boxCards.classList) {
                boxCards.classList.add('scale');
            }

            // Atualiza cupom
            if (selectedCoupon) {
                if (couponCodeTextEl) couponCodeTextEl.textContent = selectedCoupon;
                if (copyCupomEl) copyCupomEl.textContent = selectedCoupon;
            }

            // Atualiza textPremium
            if (textPremiumEl) {
                const premiumText = selectedItem?.descriptionPremium?.trim();
                if (premiumText) textPremiumEl.textContent = premiumText;
            }

            // Troca de estados de texto
            if (textA) textA.classList.add('hide');
            if (textB) textB.classList.add('hide');
            if (textC) textC.classList.remove('hide');
            if (feedback) feedback.classList.remove('hide');

            createConfetti();
        });
    });

    // ===== Copiar + acionar CSS .copy.copied =====
    let copiedTimer = null;

    function triggerCopiedAnimation(copyEl) {
        copyEl.classList.remove('copied');
        // forçar reflow
        // eslint-disable-next-line no-unused-expressions
        copyEl.offsetWidth;
        copyEl.classList.add('copied');

        clearTimeout(copiedTimer);
        copiedTimer = setTimeout(() => {
            copyEl.classList.remove('copied');
        }, 2400);
    }

    function copyFallback(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } finally { document.body.removeChild(ta); }
    }

    async function onBoxCupomClick() {
        const copyEl = boxCupom?.querySelector('.copy') || copyCupomEl;
        const toCopy = (couponCodeTextEl?.textContent || copyEl?.textContent || '').trim();

        if (copyEl) triggerCopiedAnimation(copyEl);
        if (!toCopy) return;

        try {
            if (!navigator.clipboard || !navigator.clipboard.writeText || !window.isSecureContext) {
                throw new Error('Clipboard API indisponível');
            }
            await navigator.clipboard.writeText(toCopy);
        } catch (err) {
            try { copyFallback(toCopy); } catch (e) { /* fallback falhou */ }
        }
    }

    if (boxCupom) {
        boxCupom.addEventListener('click', onBoxCupomClick);
    }

    // Init
    renderCards(DADOS_GAMES);
    animacard();
});

// ========== Confete ==========
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(function () {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            const colors = ['#FFE85E', '#ffffff', '#FFE85E', '#ffffff'];
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