// Roda da Fortuna – JS com UI de feedback (sem alert) + cópia e "resgatado!"
// Atualização pedida: ao clicar em "Girar novamente!", o bloco .feedback volta a ter a classe "hide".

// ====== CONFIGURAÇÃO ======
const MIN_TURNS = 5;
const EXTRA_TURNS_MAX = 2;
const DURATION_MS = 4500;
const EASING = "cubic-bezier(0.15, 0.85, 0.15, 1)";
const SECTORS = 6;
const SECTOR_SIZE = 360 / SECTORS;
const OFFSET_DEG = 0;

const FEEDBACKS = [
  "Feedback A",
  "Feedback B",
  "Feedback C", // <- Setor 3 (1-based) — não consome chance
  "Feedback D",
  "Feedback E",
  "Feedback F",
];

// ====== ELEMENTOS ======
const wheelImg = document.querySelector(".roleta img");
const spinBtn = document.getElementById("spin-button");
const chancesEl = document.querySelector(".chances");

// Elementos de feedback no HTML enviado
const feedbackWrap = document.querySelector(".feedback");
const boxCupom = document.querySelector(".boxCupom");
const boxCupomSpan = document.querySelector(".boxCupom p span");

// ====== ESTADO ======
let isSpinning = false;
let currentRotation = 0;
let lastFeedbackText = ""; // armazena o texto do último feedback para cópia

// ====== ESTADO DA ANIMAÇÃO DO BOTÃO ======
let spinDotsTimer = null;
let spinDotsStep = 0;
const BTN_TEXT_IDLE = "Girar Roda!";
const BTN_TEXT_SPIN_BASE = "Girando";
const BTN_TEXT_AGAIN = "Girar novamente!";
const BTN_TEXT_NO_CHANCES = "Sem giros";

// ====== FUNÇÕES AUXILIARES ======
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

// Botão habilitar/desabilitar
function enableButton(enabled) {
  if (!spinBtn) return;
  spinBtn.disabled = !enabled;
  spinBtn.style.opacity = enabled ? "1" : "0.6";
  spinBtn.style.cursor = enabled ? "pointer" : "not-allowed";
}

// Atualiza texto do botão
function setButtonText(text) {
  if (!spinBtn) return;
  spinBtn.textContent = text;
}

// Pontinhos com largura fixa (3 colunas) usando NBSP para não "andar"
function fixedDots(step) {
  const dots = ".".repeat(step);      // 0..3
  const nbsp = "\u00A0".repeat(3 - step);
  return dots + nbsp;
}

// Inicia animação "Girando..."
function startButtonSpinningText() {
  stopButtonSpinningText();
  spinDotsStep = 0;
  setButtonText(`${BTN_TEXT_SPIN_BASE}${fixedDots(3)}`);
  spinDotsTimer = setInterval(() => {
    spinDotsStep = (spinDotsStep + 1) % 4; // 0..3
    setButtonText(`${BTN_TEXT_SPIN_BASE}${fixedDots(spinDotsStep)}`);
  }, 350);
}

// Para animação e ajusta rótulo final
function stopButtonSpinningText(hasChancesLeft) {
  if (spinDotsTimer) {
    clearInterval(spinDotsTimer);
    spinDotsTimer = null;
  }
  setButtonText(hasChancesLeft ? BTN_TEXT_AGAIN : BTN_TEXT_NO_CHANCES);
}

// Mostrar bloco de feedback e preencher o span
function showFeedback(texto) {
  if (!feedbackWrap || !boxCupomSpan) return;
  feedbackWrap.classList.remove("hide");
  boxCupomSpan.textContent = texto;
  lastFeedbackText = texto;
}

// NOVO: esconder o bloco de feedback ao iniciar um novo giro
function hideFeedback() {
  if (feedbackWrap) feedbackWrap.classList.add("hide");
}

// Handler de clique no boxCupom: copia o texto e troca para "resgatado!"
async function onBoxCupomClick() {
  if (!boxCupomSpan) return;
  const toCopy = lastFeedbackText || boxCupomSpan.textContent.trim();

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(toCopy);
    } else {
      const ta = document.createElement("textarea");
      ta.value = toCopy;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  } catch (e) {
    console.warn("Falha ao copiar:", e);
  }

  boxCupomSpan.textContent = "resgatado!";
}

// ====== INICIALIZAÇÃO ======
document.addEventListener("DOMContentLoaded", () => {
  if (chancesEl) setChances(2); // começa mostrando 2 (2 -> 1 -> 0)
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

// ====== LÓGICA DO GIRO ======
function spin() {
  if (isSpinning) return;

  if (getChances() <= 0) {
    enableButton(false);
    setButtonText(BTN_TEXT_NO_CHANCES);
    return;
  }

  // Ao clicar em "Girar novamente!" (ou primeiro giro), esconder o feedback atual
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

    const sectorIndex = getSectorIndex(finalDeg); // 0..5
    const sectorNumber = sectorIndex + 1;         // 1..6
    const feedbackMsg = FEEDBACKS[sectorIndex] || `Setor ${sectorNumber}`;

    // 1) Mostra o bloco de feedback e preenche o span com o feedback
    showFeedback(feedbackMsg);

    // 2) Regra de chances: NÃO consome se for setor 3 (1-based)
    const remaining = getChances();
    const shouldConsumeChance = sectorNumber !== 3;
    if (Number.isFinite(remaining) && shouldConsumeChance) {
      setChances(remaining - 1);
    }

    // 3) Normaliza ângulo e libera interação
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