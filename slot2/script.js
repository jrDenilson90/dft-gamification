// ==================== CONFIGURAÇÃO ====================
const CONFIG = {
  symbols: [
    {
      image: "https://dafitistatic.dafiti.com.br/cms/onsite/2025/2025_10_27_17_21_54_gap-snoopy.png",
      label: "20OFF Blusas",
    },
    {
      image: "https://dafitistatic.dafiti.com.br/cms/onsite/2025/2025_10_27_17_21_46_bolsa.png",
      label: "Frete Grátis",
    },
    {
      image: "https://dafitistatic.dafiti.com.br/cms/onsite/2025/2025_10_27_17_21_57_puma.png",
      label: "35OFF Calçados",
    },
  ],
  spinDuration: 2000,
  spinInterval: 100,
  reelStopDelay: 200,
  maxAttempts: 3,
  confettiColors: ["#667eea", "#764ba2", "#fbbf24", "#4ade80"],
  coolText: "*Válido na sua próxima compra!",
  buttonTexts: {
    idle: "Girar agora!",
    spinning: "Girando",
    again: "Girar novamente!",
    noChances: "Sem giros",
  },
};

// ==================== CLASSE SLOT MACHINE ====================
class SlotMachine {
  #state = {
    isSpinning: false,
    chances: CONFIG.maxAttempts,
    spinDotsTimer: null,
    spinDotsStep: 0,
  };

  #elements = {};

  constructor() {
    this.#cacheElements();
    this.#init();
  }

  // Cache de elementos DOM
  #cacheElements() {
    this.#elements = {
      reels: document.querySelectorAll(".box"),
      button: document.getElementById("spin-button"),
      chancesEl: document.querySelector(".chances"),
      textOrint: document.querySelector(".text-orint"),
      infoChanges: document.querySelector(".infoChanges"),
      feedback: document.querySelector(".feedback"),
      boxCupom: document.querySelector(".boxCupom"),
      boxCupomSpan: document.querySelector(".boxCupom .copy span"),
      coolText: document.querySelector(".coolText"),
      lever: document.querySelector(".lever"),
      copyBadge: document.querySelector(".copy"),
    };
  }

  #init() {
    this.#generateBoxesHTML();
    this.#setupEventListeners();
    this.#updateChancesDisplay();
    this.#updateButtonState();
  }

  #setupEventListeners() {
    // Usar delegação de eventos quando possível
    [this.#elements.button, this.#elements.lever]
      .filter(Boolean)
      .forEach((el) => el.addEventListener("click", () => this.spin()));

    this.#elements.boxCupom?.addEventListener("click", () => this.#copyToClipboard());
  }

  #generateBoxesHTML() {
    const slotBox = document.querySelector(".slot-box");
    if (!slotBox) return;

    // Template literal mais limpo
    slotBox.innerHTML = CONFIG.symbols
      .map(
        (symbol) => `
      <div class="box">
        <img src="${symbol.image}" alt="${symbol.label}" class="original" loading="lazy">
        <img src="${symbol.image}" alt="${symbol.label}" class="overlay" loading="lazy">
      </div>`
      )
      .join("");

    this.#elements.reels = slotBox.querySelectorAll(".box");
  }

  // ==================== CONTROLE DE CHANCES ====================
  #updateChancesDisplay() {
    if (this.#elements.chancesEl) {
      this.#elements.chancesEl.textContent = String(this.#state.chances);
    }
  }

  #decrementChances() {
    this.#state.chances = Math.max(0, this.#state.chances - 1);
    this.#updateChancesDisplay();
    return this.#state.chances;
  }

  // ==================== CONTROLE DO BOTÃO ====================
  #updateButtonState() {
    if (!this.#elements.button) return;

    const isEnabled = this.#state.chances > 0 && !this.#state.isSpinning;
    
    this.#elements.button.style.pointerEvents = isEnabled ? "auto" : "none";
    this.#elements.button.style.opacity = isEnabled ? "1" : "0.6";

    const text = this.#state.chances > 0 
      ? CONFIG.buttonTexts.idle 
      : CONFIG.buttonTexts.noChances;
    
    this.#setButtonText(text);
  }

  #setButtonText(text) {
    if (this.#elements.button) {
      this.#elements.button.textContent = text;
    }
  }

  #startButtonAnimation() {
    this.#stopButtonAnimation();
    this.#state.spinDotsStep = 0;
    
    this.#state.spinDotsTimer = setInterval(() => {
      this.#state.spinDotsStep = (this.#state.spinDotsStep + 1) % 4;
      const dots = ".".repeat(this.#state.spinDotsStep).padEnd(3, "\u00A0");
      this.#setButtonText(`${CONFIG.buttonTexts.spinning}${dots}`);
    }, 350);
  }

  #stopButtonAnimation() {
    if (this.#state.spinDotsTimer) {
      clearInterval(this.#state.spinDotsTimer);
      this.#state.spinDotsTimer = null;
    }
    
    const text = this.#state.chances > 0 
      ? CONFIG.buttonTexts.again 
      : CONFIG.buttonTexts.noChances;
    
    this.#setButtonText(text);
  }

  // ==================== LÓGICA DE GIRO ====================
  async spin() {
    if (this.#state.isSpinning || this.#state.chances <= 0) return;

    this.#state.isSpinning = true;
    this.#updateButtonState();
    this.#elements.lever?.classList.add("active");

    // Delay inicial
    await this.#delay(500);

    this.#startButtonAnimation();
    this.#prepareReels();
    await this.#animateReels();
    await this.#stopReels();

    this.#elements.lever?.classList.remove("active");
  }

  #prepareReels() {
    this.#elements.reels.forEach((reel) => {
      reel.classList.remove("win");
      reel.classList.add("spinning");
    });
  }

  async #animateReels() {
    const iterations = CONFIG.spinDuration / CONFIG.spinInterval;
    
    for (let i = 0; i < iterations; i++) {
      this.#elements.reels.forEach((reel) => {
        this.#setReelImage(reel, this.#getRandomSymbol());
      });
      await this.#delay(CONFIG.spinInterval);
    }
  }

  async #stopReels() {
    // Força vitória na última tentativa
    const results = this.#state.chances === 1 
      ? this.#getWinningResults() 
      : this.#getRandomResults();

    // Para cada reel com delay incremental
    for (let i = 0; i < this.#elements.reels.length; i++) {
      await this.#delay(CONFIG.reelStopDelay);
      
      const reel = this.#elements.reels[i];
      this.#setReelImage(reel, results[i]);
      reel.classList.remove("spinning");
    }

    this.#checkResult(results);
  }

  // ==================== SÍMBOLOS E RESULTADOS ====================
  #getRandomSymbol() {
    return CONFIG.symbols[Math.floor(Math.random() * CONFIG.symbols.length)];
  }

  #getRandomResults() {
    return Array.from({ length: 3 }, () => this.#getRandomSymbol());
  }

  #getWinningResults() {
    const symbol = this.#getRandomSymbol();
    return [symbol, symbol, symbol];
  }

  #setReelImage(reel, symbol) {
    const original = reel.querySelector(".original");
    const overlay = reel.querySelector(".overlay");

    if (original) original.src = symbol.image;
    if (overlay) overlay.src = symbol.image;
  }

  // ==================== VERIFICAÇÃO DE RESULTADO ====================
  #checkResult(results) {
    const remaining = this.#decrementChances();
    const isWin = results.every((r) => r.image === results[0].image);

    if (isWin) {
      this.#showWin(results[0].label);
    }

    this.#state.isSpinning = false;
    this.#stopButtonAnimation();
    this.#updateButtonState();
  }

  #showWin(prizeLabel) {
    this.#showFeedback(prizeLabel);
    this.#elements.reels.forEach((reel) => reel.classList.add("win"));
    this.#createConfetti();
  }

  #showFeedback(label) {
    if (!this.#elements.feedback || !this.#elements.boxCupomSpan) return;

    this.#elements.boxCupomSpan.textContent = label;
    this.#elements.feedback.classList.remove("hide");

    if (CONFIG.coolText && this.#elements.coolText) {
      this.#elements.coolText.textContent = CONFIG.coolText;
    }

    // Esconde orientações após ganhar
    this.#elements.textOrint?.classList.add("hide");
    this.#elements.infoChanges?.classList.add("hide");
  }

  // ==================== COPIAR CUPOM ====================
  async #copyToClipboard() {
    const textToCopy = this.#elements.boxCupomSpan?.textContent?.trim() || "";
    const badgeTarget = this.#elements.copyBadge || this.#elements.boxCupom;

    try {
      await navigator.clipboard.writeText(textToCopy);
      this.#showCopiedBadge(badgeTarget);
    } catch (error) {
      console.warn("Clipboard API falhou:", error);
      this.#fallbackCopy(textToCopy, badgeTarget);
    }
  }

  #fallbackCopy(text, badgeTarget) {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand("copy");
      this.#showCopiedBadge(badgeTarget);
    } catch (error) {
      console.error("Falha ao copiar:", error);
      alert("Não foi possível copiar. Por favor, copie manualmente.");
    } finally {
      document.body.removeChild(textArea);
    }
  }

  #showCopiedBadge(element) {
    if (!element) return;

    clearTimeout(element._copiedTimer);
    element.classList.add("copied");
    element._copiedTimer = setTimeout(() => {
      element.classList.remove("copied");
    }, 1500);
  }

  // ==================== CONFETE ====================
  #createConfetti() {
    const confettiFragment = document.createDocumentFragment();

    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const confetti = this.#createConfettiElement();
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 3000);
      }, i * 50);
    }
  }

  #createConfettiElement() {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.background = CONFIG.confettiColors[
      Math.floor(Math.random() * CONFIG.confettiColors.length)
    ];
    return confetti;
  }

  // ==================== UTILITÁRIOS ====================
  #delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener("DOMContentLoaded", () => {
  new SlotMachine();
});