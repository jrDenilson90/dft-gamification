// ==================== DADOS (sentido HORÁRIO) ====================
const DADOS_GAMES = {
    roleta: "https://dafitistatic.dafiti.com.br/cms/2025_09_24_16_09_26_Group_26653585.svg",
    setores: [
        "20OFFCalçados",   // index 0
        "FreteGrátis",     // index 1
        "35OFFJoias",      // index 2
        "TenteNovamente",  // index 3 (não consome chance e NÃO dispara confete)
        "25OFFVestuário",  // index 4
        "25OFFPremium",    // index 5
    ],
};

// ==================== CONFIGURAÇÃO ====================
const MIN_TURNS = 5;
const EXTRA_TURNS_MAX = 2;
const DURATION_MS = 4500;
const EASING = "cubic-bezier(0.15, 0.85, 0.15, 1)";

const SECTORS = DADOS_GAMES.setores.length; // 6
const SECTOR_SIZE = 360 / SECTORS;          // 60

// Ajuste fino do zero da arte vs. ponteiro (em graus, sentido horário).
// Se a arte ficar deslocada, ajuste em passos de ±5~10 (ex.: 10, -10).
let OFFSET_DEG = 0;

// ==================== ELEMENTOS ====================
const wheelImg = document.querySelector(".wheel img.roleta");
const spinBtn = document.getElementById("spin-button");
const chancesEl = document.querySelector(".chances");

// UI
const feedbackWrap = document.querySelector(".feedback");
const boxCupom = document.querySelector(".boxCupom");
const boxCupomSpan = document.querySelector(".boxCupom p span");
const textOrint = document.querySelector(".text-orint");
const infoChanges = document.querySelector(".infoChanges");

// ==================== ESTADO ====================
let isSpinning = false;
let currentRotation = 0;
let lastFeedbackText = "";

// ==================== BOTÃO (animação de texto) ====================
let spinDotsTimer = null;
let spinDotsStep = 0;
const BTN_TEXT_IDLE = "Girar Roda!";
const BTN_TEXT_SPIN_BASE = "Girando";
const BTN_TEXT_AGAIN = "Girar novamente!";
const BTN_TEXT_NO_CHANCES = "Sem giros";

// ==================== HELPERS ====================
function normalizeDeg(deg) {
    let d = deg % 360;
    if (d < 0) d += 360;
    return d;
}

// Mapeamento explícito de SLOT (0..5) → índice no array DADOS_GAMES.setores
// Slots por ângulo (após aplicar OFFSET_DEG):
//   0: [  0°,  60°) → setores[[5]]() = "25OFFPremium"
//   1: [ 60°, 120°) → setores[[4]]() = "25OFFVestuário"
//   2: [120°, 180°) → setores[[3]]() = "TenteNovamente"
//   3: [180°, 240°) → setores[[2]]() = "35OFFJoias"
//   4: [240°, 300°) → setores[[1]]() = "FreteGrátis"
//   5: [300°, 360°) → setores[[0]]() = "20OFFCalçados"
const ANGLE_SLOT_TO_INDEX = [5, 4, 3, 2, 1, 0];

function getSectorIndexByAngle(finalDeg) {
    const aligned = normalizeDeg(finalDeg - OFFSET_DEG);
    const slot = Math.floor(aligned / SECTOR_SIZE) % SECTORS; // 0..5
    return ANGLE_SLOT_TO_INDEX[slot];
}

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

// ====== FEEDBACK/CÓPIA ======
function showFeedback(texto) {
    if (!feedbackWrap || !boxCupomSpan) return;
    boxCupomSpan.textContent = texto;
    lastFeedbackText = texto;

    if (texto === "TenteNovamente") return; // não exibe bloco para tente novamente
    feedbackWrap.classList.remove("hide");
}
function hideFeedback() {
    if (feedbackWrap) feedbackWrap.classList.add("hide");
}

function showCopiedBadge(el) {
    if (!el) return;
    clearTimeout(el._copiedTimer);
    el.classList.add("copied");
    el._copiedTimer = setTimeout(() => el.classList.remove("copied"), 1500);
}
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
async function onBoxCupomClick() {
    const toCopy =
        (lastFeedbackText || (boxCupomSpan && boxCupomSpan.textContent) || "").trim();
    const badgeTarget = document.querySelector(".copy") || boxCupom;

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
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", () => {
    if (chancesEl) setChances(2); // 2 giros

    if (wheelImg) {
        wheelImg.src = DADOS_GAMES.roleta; // carrega imagem da roleta do JSON
        wheelImg.style.transformOrigin = "50% 50%";
        wheelImg.style.willChange = "transform";
    }

    setButtonText(getChances() > 0 ? BTN_TEXT_IDLE : BTN_TEXT_NO_CHANCES);
    enableButton(getChances() > 0);

    if (boxCupom) {
        boxCupom.addEventListener("click", onBoxCupomClick);
    }
});

// ==================== GIRO ====================
function spin() {
    if (isSpinning) return;

    if (getChances() <= 0) {
        enableButton(false);
        setButtonText(BTN_TEXT_NO_CHANCES);
        return;
    }

    // Mostrar instruções/infos durante o giro
    if (textOrint) textOrint.classList.remove("hide");
    if (infoChanges) infoChanges.classList.remove("hide");

    hideFeedback();

    isSpinning = true;
    enableButton(false);
    startButtonSpinningText();

    const extraTurns = Math.floor(Math.random() * (EXTRA_TURNS_MAX + 1));
    const randomLanding = Math.random() * 360; // CW
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

        // Index em função do ÂNGULO (respeitando sua ordem e faixas)
        const sectorIndex = getSectorIndexByAngle(finalDeg);
        const prize = DADOS_GAMES.setores[sectorIndex];
        const isTryAgain = prize === "TenteNovamente";

        // Feedback
        showFeedback(prize);

        // Esconde orientações apenas quando ganhou
        if (!isTryAgain) {
            if (textOrint) textOrint.classList.add("hide");
            if (infoChanges) infoChanges.classList.add("hide");
        }

        // "TenteNovamente" NÃO consome chance
        const remaining = getChances();
        if (Number.isFinite(remaining) && !isTryAgain) {
            setChances(remaining - 1);
        }

        // Confete: APENAS quando NÃO for "TenteNovamente"
        if (!isTryAgain) {
            createConfetti();
        }

        // Normaliza e finaliza
        currentRotation = normalizeDeg(currentRotation);
        wheelImg.style.transform = `rotate(${currentRotation}deg)`;

        isSpinning = false;
        const stillHasChances = getChances() > 0;
        stopButtonSpinningText(stillHasChances);
        enableButton(stillHasChances);

        // Debug opcional:
        // console.log({ finalDeg, slot: Math.floor(normalizeDeg(finalDeg - OFFSET_DEG)/SECTOR_SIZE)%SECTORS, sectorIndex, prize });
    };

    wheelImg.addEventListener("transitionend", onEnd, { once: true });
}

if (spinBtn) {
    spinBtn.addEventListener("click", spin);
}

// ==================== CONFETE ====================
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(function () {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            const colors = ["#E73670", "#ffffff", "#E73670", "#ffffff"];
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