// --- O SCRIPT PODE SER MANTIDO O MESMO ---
(function () {
    function closeMessage() { try { appboyBridge && appboyBridge.closeMessage && appboyBridge.closeMessage(); } catch(e) {} }
    async function optInEmailAndClose() { 
        try {
            var user = appboyBridge && appboyBridge.getUser && appboyBridge.getUser();
            if (user) {
                if (typeof user.setEmailNotificationSubscriptionType === 'function') {
                    user.setEmailNotificationSubscriptionType('opted_in');
                }
                if (typeof user.setCustomUserAttribute === 'function') {
                    user.setCustomUserAttribute('optin_source', 'dft_cashback_rules_inapp'); // Source ajustado
                }
                appboyBridge && appboyBridge.logClick && appboyBridge.logClick('cashback_optin_email_cta');
                appboyBridge && appboyBridge.requestImmediateDataFlush && appboyBridge.requestImmediateDataFlush();
            }
        } catch (e) { console.error('Falha ao realizar opt-in:', e); }
        finally { setTimeout(closeMessage, 250); }
    }
    document.getElementById('btnOptinAndShop').addEventListener('click', function (e) { e.target.disabled = true; optInEmailAndClose(); });
    document.getElementById('btnDecline').addEventListener('click', function () { try { appboyBridge && appboyBridge.logClick && appboyBridge.logClick('cashback_optin_decline'); } catch(e) {} closeMessage(); });
    document.getElementById('closeX').addEventListener('click', function () { try { appboyBridge && appboyBridge.logClick && appboyBridge.logClick('cashback_rules_close'); } catch(e) {} closeMessage(); }); 
    document.getElementById('rulesToggle').addEventListener('click', function() { try { appboyBridge && appboyBridge.logClick && appboyBridge.logClick('cashback_rules_toggle'); } catch(e) {} });
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