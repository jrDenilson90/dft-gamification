// Roda da Fortuna – JS (ajuste)
// Requisito: manter .text-orint e .infoChanges visíveis se cair em "TenteNovamente".

// ====== CONFIGURAÇÃO ======
const MIN_TURNS = 5;
const EXTRA_TURNS_MAX = 2;
const DURATION_MS = 4500;
const EASING = "cubic-bezier(0.15, 0.85, 0.15, 1)";
const SECTORS = 6;
const SECTOR_SIZE = 360 / SECTORS;
const OFFSET_DEG = 0;

const FEEDBACKS = [
    "25OFFPremium",
    "25OFFVestuário",
    "TenteNovamente", // <- Setor 3 (1-based) — não consome chance
    "35OFFJoias",
    "FreteGrátis",
    "20OFFCalçados",
];

// ====== ELEMENTOS ======
const wheelImg = document.querySelector(".roleta img");
const spinBtn = document.getElementById("spin-button");
const chancesEl = document.querySelector(".chances");

// UI de feedback
const feedbackWrap = document.querySelector(".feedback");
const boxCupom = document.querySelector(".boxCupom");
const boxCupomSpan = document.querySelector(".boxCupom p span");
const textOrint = document.querySelector(".text-orint");
const infoChanges = document.querySelector(".infoChanges"); // <- novo (pode ser null se não existir)

// alvo preferencial do badge "copied" (se existir no seu HTML/CSS)
function getCopyTarget() {
    return document.querySelector(".copy") || boxCupom;
}

// ====== ESTADO ======
let isSpinning = false;
let currentRotation = 0;
let lastFeedbackText = "";

// ====== ESTADO DA ANIMAÇÃO DO BOTÃO ======
let spinDotsTimer = null;
let spinDotsStep = 0;
const BTN_TEXT_IDLE = "Girar Roda!";
const BTN_TEXT_SPIN_BASE = "Girando";
const BTN_TEXT_AGAIN = "Girar novamente!";
const BTN_TEXT_NO_CHANCES = "Sem giros";

// ====== HELPERS ======
function normalizeDeg(deg) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
}
function getSectorIndex(finalDeg) {
    const aligned = normalizeDeg(finalDeg - OFFSET_DEG);
    return Math.floor(aligned / SECTOR_SIZE); // 0..5
}

// Chances
function getChances() {
    if (!chancesEl) return Infinity;
    const n = parseInt(chancesEl.textContent.trim(), 10);
    return Number.isFinite(n) ? n : 0;
}
function setChances(n) {
    if (!chancesEl) return;
    const val = Math.max(0, Math.floor(n));
    chancesEl.textContent = String(val);
    enableButton(val > 0 && !isSpinning);
}

// Botão
function enableButton(enabled) {
    if (!spinBtn) return;
    spinBtn.disabled = !enabled;
    spinBtn.style.opacity = enabled ? "1" : "0.6";
    spinBtn.style.cursor = enabled ? "pointer" : "not-allowed";
}
function setButtonText(text) {
    if (!spinBtn) return;
    spinBtn.textContent = text;
}
function fixedDots(step) {
    const dots = ".".repeat(step); // 0..3
    const nbsp = "\u00A0".repeat(3 - step);
    return dots + nbsp;
}
function startButtonSpinningText() {
    stopButtonSpinningText();
    spinDotsStep = 0;
    setButtonText(`${BTN_TEXT_SPIN_BASE}${fixedDots(3)}`);
    spinDotsTimer = setInterval(() => {
        spinDotsStep = (spinDotsStep + 1) % 4;
        setButtonText(`${BTN_TEXT_SPIN_BASE}${fixedDots(spinDotsStep)}`);
    }, 350);
}
function stopButtonSpinningText(hasChancesLeft) {
    if (spinDotsTimer) {
        clearInterval(spinDotsTimer);
        spinDotsTimer = null;
    }
    setButtonText(hasChancesLeft ? BTN_TEXT_AGAIN : BTN_TEXT_NO_CHANCES);
}

// ====== FEEDBACK (mostrar/esconder e copy) ======
function showFeedback(texto) {
    if (!feedbackWrap || !boxCupomSpan) return;

    // Preenche o span e guarda o valor
    boxCupomSpan.textContent = texto;
    lastFeedbackText = texto;

    // Se o feedback for "TenteNovamente", NÃO exibe o bloco (mantém .feedback com "hide")
    if (texto === "TenteNovamente") return;

    // Para outros feedbacks, mostra o bloco
    feedbackWrap.classList.remove("hide");
}
function hideFeedback() {
    if (feedbackWrap) feedbackWrap.classList.add("hide");
}

// Badge "copied" — seu CSS deve estilizar .copied
function showCopiedBadge(el) {
    if (!el) return;
    clearTimeout(el._copiedTimer);
    el.classList.add("copied");
    el._copiedTimer = setTimeout(() => el.classList.remove("copied"), 1500);
}

// Fallback de cópia
function copiaFallback(txt) {
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (!ok) throw new Error('execCommand("copy") retornou false');
}

// Clique no cupom: copia e adiciona classe "copied" no .copy (ou .boxCupom)
async function onBoxCupomClick() {
    const toCopy = (lastFeedbackText || (boxCupomSpan && boxCupomSpan.textContent) || "").trim();
    const badgeTarget = getCopyTarget();

    try {
        if (!navigator.clipboard || !navigator.clipboard.writeText || !window.isSecureContext) {
            throw new Error("Clipboard API indisponível");
        }
        await navigator.clipboard.writeText(toCopy);
        showCopiedBadge(badgeTarget);
    } catch (err) {
        try {
            copiaFallback(toCopy);
            showCopiedBadge(badgeTarget);
        } catch (e) {
            console.error("Falha ao copiar:", e);
            alert("Não foi possível copiar automaticamente. Selecione e copie manualmente.");
        }
    }

    // Não alterar texto do span.
}

// ====== INICIALIZAÇÃO ======
document.addEventListener("DOMContentLoaded", () => {
    if (chancesEl) setChances(2); // 2 -> 1 -> 0
    if (wheelImg) {
        wheelImg.style.transformOrigin = "50% 50%";
        wheelImg.style.willChange = "transform";
    }
    setButtonText(getChances() > 0 ? BTN_TEXT_IDLE : BTN_TEXT_NO_CHANCES);
    enableButton(getChances() > 0);

    if (boxCupom) {
        boxCupom.addEventListener("click", onBoxCupomClick);
    }
});

// ====== GIRO ======
function spin() {
    if (isSpinning) return;

    if (getChances() <= 0) {
        enableButton(false);
        setButtonText(BTN_TEXT_NO_CHANCES);
        return;
    }

    // Início de um novo giro: mostrar instruções/infos durante o giro
    if (textOrint) textOrint.classList.remove("hide");
    if (infoChanges) infoChanges.classList.remove("hide");

    // Esconder feedback anterior (se houver)
    hideFeedback();

    isSpinning = true;
    enableButton(false);
    startButtonSpinningText();

    const extraTurns = Math.floor(Math.random() * (EXTRA_TURNS_MAX + 1));
    const randomLanding = Math.random() * 360;
    const totalTurns = MIN_TURNS + extraTurns;
    const deltaRotation = totalTurns * 360 + randomLanding;
    const targetRotation = currentRotation + deltaRotation;

    wheelImg.style.transition = `transform ${DURATION_MS}ms ${EASING}`;
    wheelImg.style.transform = `rotate(${targetRotation}deg)`;

    const onEnd = () => {
        wheelImg.removeEventListener("transitionend", onEnd);

        wheelImg.style.transition = "none";
        currentRotation = targetRotation;
        const finalDeg = normalizeDeg(currentRotation);

        const sectorIndex = getSectorIndex(finalDeg);
        const sectorNumber = sectorIndex + 1;
        const feedbackMsg = FEEDBACKS[sectorIndex] || `Setor ${sectorNumber}`;

        // Preenche/mostra feedback conforme regra "TenteNovamente"
        showFeedback(feedbackMsg);

        // Quando parar:
        // - Se NÃO for "TenteNovamente": esconder .text-orint e .infoChanges
        // - Se for "TenteNovamente": manter ambos visíveis
        const isTryAgain = feedbackMsg === "TenteNovamente";
        if (!isTryAgain) {
            if (textOrint) textOrint.classList.add("hide");
            if (infoChanges) infoChanges.classList.add("hide");
        } // else: mantém visíveis

        // Setor 3 não consome chance
        const remaining = getChances();
        const shouldConsumeChance = sectorNumber !== 3;
        if (Number.isFinite(remaining) && shouldConsumeChance) {
            setChances(remaining - 1);
        }

        // Confete (opcional)
        createConfetti();

        currentRotation = normalizeDeg(currentRotation);
        wheelImg.style.transform = `rotate(${currentRotation}deg)`;

        isSpinning = false;

        const stillHasChances = getChances() > 0;
        stopButtonSpinningText(stillHasChances);
        enableButton(stillHasChances);
    };

    wheelImg.addEventListener("transitionend", onEnd, { once: true });
}

if (spinBtn) {
    spinBtn.addEventListener("click", spin);
}

// ========== Confete ==========
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(function () {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            const colors = ["#667eea", "#764ba2", "#fbbf24", "#4ade80"];
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