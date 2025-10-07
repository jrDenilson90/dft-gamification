// ==================== DADOS (sentido HORÁRIO) ====================
const DADOS_GAMES = {
    roleta: "https://dafitistatic.dafiti.com.br/cms/2025_09_24_16_33_09_Group_26653586.svg",
    setores: [
        { cupom: "20OFFCalçados",   link: "link1" },
        { cupom: "FreteGrátis",     link: "link2" },
        { cupom: "35OFFJoias",      link: "link3" },
        { cupom: "TenteNovamente",  link: "link4" },
        { cupom: "25OFFVestuário",  link: "link5" },
        { cupom: "25OFFPremium",    link: "link6" }
    ],
};

// ==================== CONFIGURAÇÃO ====================
const MIN_TURNS = 5;
const EXTRA_TURNS_MAX = 2;
const DURATION_MS = 4500;
const EASING = "cubic-bezier(0.15, 0.85, 0.15, 1)";

const SECTORS = DADOS_GAMES.setores.length; // 6
const SECTOR_SIZE = 360 / SECTORS;          // 60

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
    if (chancesEl) setChances(0); // 2 giros

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
        const isTryAgain = prize.cupom === "TenteNovamente";

        // Feedback
        showFeedback(prize.cupom);

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

        const wheelWrapper = document.querySelector('.wheel-wrapper');
        const spinButton = document.querySelector('.spin-button');
        const linkButton = document.querySelector('.link-button');

        if (!isTryAgain) {
            if (wheelWrapper) wheelWrapper.classList.add('zoomOut');
            if (spinButton) spinButton.classList.add('hide');
            if (linkButton) {
                linkButton.classList.remove('hide');
                linkButton.setAttribute('href', prize.link);
            }
        } else {
            // Se for "TenteNovamente", mantém o botão ativo e não mexe no wheel-wrapper
            if (spinButton) {
                spinButton.classList.remove('hide');
                enableButton(true); // Garante que o botão está habilitado
            }
            if (linkButton) linkButton.classList.add('hide');
        }
    };

    wheelImg.addEventListener("transitionend", onEnd, { once: true });
}

if (spinBtn) {
    spinBtn.addEventListener("click", spin);
}

// ==================== CONFETE ====================
function createConfetti() {
    for (let i = 0; i < 75; i++) {
        setTimeout(function () {
            const confetti = document.createElement("div");
            confetti.className = "confetti";
            confetti.style.left = Math.random() * 100 + "%";
            const colors = ["#ffffff", "#ffffff", "#ffffff", "#ffffff"];
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