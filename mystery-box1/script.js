document.addEventListener('DOMContentLoaded', function () {
    const cupons = [
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_36_57_mask1.png', description: 'Brisa Coral', cupom: 'CAIXA1' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_36_59_mask2.png', description: 'Céu Radiante', cupom: 'CAIXA2' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_37_01_mask3.png', description: 'Sol Laranja', cupom: 'CAIXA3' },
        { img: 'https://dafitistatic.dafiti.com.br/cms/2025_09_29_13_37_03_mask4.png', description: 'Oásis Esmeralda', cupom: 'CAIXA4' }
    ];

    const ButtonOpenBox = document.querySelectorAll('.openBox');

    // Seletores dos textos
    const textA = document.querySelector('.textInit.textA');
    const textB = document.querySelector('.textInit.textB');
    const textC = document.querySelector('.textInit.textC');
    const feedback = document.querySelector('.feedback');

    // Alvos para exibir o cupom
    const copyCupomEl = document.getElementById('couponCodeText');           // <p id="copyCupom">
    const couponCodeTextEl = document.getElementById('couponCodeText'); // <span id="couponCodeText">

    // Renderiza os cards a partir do array (caso ainda não tenha 4 cards no HTML)
    const boxCards = document.querySelector('.boxCards');
    function renderCards(list) {
        if (!boxCards) return;
        boxCards.innerHTML = '';

        list.forEach((item, idx) => {
            const btn = document.createElement('button');
            btn.className = 'card';
            btn.dataset.index = idx;
            btn.dataset.cupom = item.cupom;

            const img = document.createElement('img');
            const p = document.createElement('p');
            p.className = 'text';

            const looksLikeUrl = /^https?:\/\//.test(item.img) || /\.(png|jpe?g|webp|svg|gif)$/i.test(item.img);
            if (looksLikeUrl) {
                img.src = item.img;
                img.alt = item.cupom;
            } else {
                img.alt = item.img;
                img.style.display = 'none';
                const label = document.createElement('span');
                label.className = 'img-label';
                label.textContent = item.img;
                btn.appendChild(label);
            }

            p.textContent = item.description;

            btn.appendChild(img);
            btn.appendChild(p);
            boxCards.appendChild(btn);
        });
    }

    // Mantém referência ao cupom selecionado
    let selectedCoupon = null;

    // Animação zoomCard + seleção do cupom
    function animacard() {
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', function () {
                // Guarda o cupom do card clicado
                selectedCoupon = this.dataset.cupom || null;

                document.querySelectorAll('.card').forEach(otherCard => {
                    otherCard.classList.remove('zoomIn');
                    if (otherCard !== this) {
                        otherCard.classList.add('hide');
                        otherCard.classList.add('zoomOut');
                    } else {
                        otherCard.classList.add('zoomIn');
                    }
                });

                // Mostrar botões (NodeList -> iterar)
                ButtonOpenBox.forEach(btn => btn.classList.remove('hide'));

                // Esconder textA e mostrar textB
                if (textA) textA.classList.add('hide');
                if (textB) textB.classList.remove('hide');
                if (textC) textC.classList.add('hide');
            });
        });
    }

    // Clique em "Abrir Caixa!" -> mostra textC e coloca o cupom no #copyCupom (e no #couponCodeText se existir)
    ButtonOpenBox.forEach(buttonOpen => {
        buttonOpen.addEventListener('click', () => {
            // Atualiza o texto do cupom
            if (selectedCoupon) {
                if (couponCodeTextEl) {
                    couponCodeTextEl.textContent = selectedCoupon; // mantém a estrutura com o span
                } else if (copyCupomEl) {
                    copyCupomEl.textContent = selectedCoupon; // fallback direto no <p id="copyCupom">
                }
            }

            // Troca de estados de texto
            if (textA) textA.classList.add('hide');
            if (textB) textB.classList.add('hide');
            if (textC) textC.classList.remove('hide');
            if (feedback) feedback.classList.remove('hide');

            createConfetti();
        });
    });

    // Renderiza e conecta eventos
    renderCards(cupons);
    animacard();
});

// ========== Confete ==========
function createConfetti() {
    for (let i = 0; i < 50; i++) {
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