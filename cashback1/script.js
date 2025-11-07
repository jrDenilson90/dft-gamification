(function () {
    function closeMessage() {
        try { if (typeof appboyBridge !== 'undefined') appboyBridge.closeMessage(); } catch (e) { }
    }

    // Listener para o botão principal
    var btnGoToShop = document.getElementById('btnGoToShop');
    if (btnGoToShop) {
        btnGoToShop.addEventListener('click', function () {
            try {
                if (typeof appboyBridge !== 'undefined') appboyBridge.logClick('cashback_rules_cta'); // Log de clique do CTA
            } catch (e) { }
            // A navegação ocorre pelo href, o in-app fecha automaticamente
        });
    }
    // Listener para o botão principal
    var btnGoToShop = document.getElementById('btnGoToShop');
    if (btnGoToShop) {
        btnGoToShop.addEventListener('click', function () {
            try {
                if (typeof appboyBridge !== 'undefined') appboyBridge.logClick('cashback_rules_cta'); // Log de clique do CTA
            } catch (e) { }

            // ----- CORREÇÃO ADICIONADA AQUI -----
            // Chama a função para fechar o in-app após logar o clique
            closeMessage();
            // ------------------------------------

            // A navegação (se houver) deveria ser tratada aqui ou
            // o botão deveria ser um link <a> com href.
            // Como é informativo, apenas fechar está correto.
        });
    }
    // Listener para o botão de fechar (X)
    var closeX = document.getElementById('closeX');
    if (closeX) {
        closeX.addEventListener('click', function () {
            try { if (typeof appboyBridge !== 'undefined') appboyBridge.logClick('cashback_rules_close'); } catch (e) { }
            closeMessage();
        });
    }

    // Listener para "Ver regras"
    var rulesToggle = document.getElementById('rulesToggle');
    if (rulesToggle) {
        rulesToggle.addEventListener('click', function () {
            try { if (typeof appboyBridge !== 'undefined') appboyBridge.logClick('cashback_rules_toggle'); } catch (e) { }
        });
    }

})();

const glitchContainers = document.querySelectorAll('.glitch-img');
const NUM_COPIES = 9;

glitchContainers.forEach(container => {
    const originalLine = container.querySelector('.line');

    if (!originalLine || container.dataset.hasBeenDuplicated) {
        return;
    }

    for (let i = 0; i < NUM_COPIES; i++) {
        const newLine = originalLine.cloneNode(true);
        container.appendChild(newLine);
    }

    container.dataset.hasBeenDuplicated = 'true';
});

// Função para adicionar/remover classe 'block' de forma aleatória
function randomGlitchEffect() {
    glitchContainers.forEach(container => {
        const allLines = container.querySelectorAll('.line');
        
        // Decide aleatoriamente se TODOS os .line deste container terão a classe 'block'
        const shouldAddBlock = Math.random() > 0.5;
        
        allLines.forEach(line => {
            if (shouldAddBlock) {
                line.classList.add('block');
            } else {
                line.classList.remove('block');
            }
        });
    });
}

// Defina o intervalo em milissegundos (exemplo: 3000 = 3 segundos)
const INTERVAL_MS = 2000;

// Executa a função a cada X segundos
setInterval(randomGlitchEffect, INTERVAL_MS);

// Executa uma vez imediatamente ao carregar
randomGlitchEffect();