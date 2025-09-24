document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".header");
  const wheelWrapper = document.querySelector(".wheel-wrapper");
  const wheel = document.getElementById("wheel");
  const wheelSVG = document.getElementById("wheel-svg");
  const spinButton = document.getElementById("spin-button");
  const resultOverlay = document.getElementById("result-overlay");
  const resultTitle = document.getElementById("result-title");
  const resultDescription = document.getElementById("result-description");
  const couponCodeDiv = document.getElementById("coupon-code");
  const ctaButton = document.getElementById("cta-button");

  const segments = [
    {
      text: "R$ 5",
      color: "#FFD93D",
      isJackpot: false,
      probability: 35,
      code: "RODA5",
      ctaText: "Usar R$ 5 agora",
    },
    {
      text: "R$ 10",
      color: "#F6B800",
      isJackpot: false,
      probability: 25,
      code: "RODA10",
      ctaText: "Usar R$ 10 agora",
    },
    {
      text: "R$ 2",
      color: "#FFD93D",
      isJackpot: false,
      probability: 15,
      code: "RODA2",
      ctaText: "Usar R$ 2 agora",
    },
    {
      text: "R$ 200",
      color: "#3083DC",
      isJackpot: true,
      probability: 2,
      code: "RODA200",
      ctaText: "Pegar meu prêmio!",
    },
    {
      text: "R$ 20",
      color: "#F6B800",
      isJackpot: false,
      probability: 8,
      code: "RODA20",
      ctaText: "Usar R$ 20 agora",
    },
    {
      text: "R$ 3",
      color: "#FFD93D",
      isJackpot: false,
      probability: 15,
      code: "RODA3",
      ctaText: "Usar R$ 3 agora",
    },
  ];

  let isSpinning = false;
  let accumulatedAngle = 0;

  function createWheel() {
    const numSegments = segments.length;
    const anglePerSegment = 360 / numSegments;
    const center = 150;
    const radius = 150;

    segments.forEach((segment, i) => {
      const startAngle = i * anglePerSegment;

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        getSegmentPath(center, radius, startAngle, anglePerSegment)
      );
      path.setAttribute("fill", segment.color);
      wheelSVG.appendChild(path);

      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      const textAngle = startAngle + anglePerSegment / 2;
      const textPos = getPositionOnCircle(center, radius * 0.6, textAngle - 90);
      text.setAttribute("x", textPos.x);
      text.setAttribute("y", textPos.y);
      text.setAttribute(
        "transform",
        `rotate(${textAngle}, ${textPos.x}, ${textPos.y})`
      );
      text.style.fill = segment.isJackpot ? "#FFFFFF" : "#000000";
      text.textContent = segment.text;
      wheelSVG.appendChild(text);
    });
  }

  function getPositionOnCircle(center, radius, angle) {
    const angleRad = angle * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  }

  function getSegmentPath(center, radius, startAngle, angle) {
    const start = getPositionOnCircle(center, radius, startAngle - 90);
    const end = getPositionOnCircle(center, radius, startAngle + angle - 90);
    const largeArcFlag = angle > 180 ? 1 : 0;
    return `M ${center},${center} L ${start.x},${start.y} A ${radius},${radius} 0 ${largeArcFlag},1 ${end.x},${end.y} Z`;
  }

  function selectPrize() {
    const totalProbability = segments.reduce(
      (sum, s) => sum + s.probability,
      0
    );
    let random = Math.random() * totalProbability;
    for (const segment of segments) {
      random -= segment.probability;
      if (random <= 0) return segment;
    }
  }

  spinButton.addEventListener("click", () => {
    if (isSpinning) return;
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.textContent = "Girando...";

    const selectedPrize = selectPrize();
    const prizeIndex = segments.indexOf(selectedPrize);
    const segmentAngle = 360 / segments.length;
    const targetAngleInSegment = segmentAngle / 2;
    const targetAngle = prizeIndex * segmentAngle + targetAngleInSegment;

    const randomSpins = 6;
    const rotationOffset = 360 - targetAngle;
    const totalRotation = randomSpins * 360 + rotationOffset;

    accumulatedAngle += totalRotation;
    wheel.style.transform = `rotate(${accumulatedAngle}deg)`;

    setTimeout(() => showResult(selectedPrize), 5500);
  });

  function showResult(prize) {
    header.style.opacity = "0";
    wheelWrapper.style.opacity = "0";
    spinButton.style.opacity = "0";

    resultTitle.textContent = prize.isJackpot
      ? "🎉 UAU! PARABÉNS! 🎉"
      : "Você ganhou!";
    resultDescription.textContent = prize.text;
    couponCodeDiv.textContent = prize.code;
    couponCodeDiv.style.display = "block";
    ctaButton.textContent = prize.ctaText;
    ctaButton.href = "dafiti://br/home";
    ctaButton.style.display = "inline-block";

    resultOverlay.style.display = "flex";
  }

  ctaButton.addEventListener("click", () => forceClose());

  window.forceClose = function () {
    try {
      if (window.brazeBridge && window.brazeBridge.closeMessage)
        window.brazeBridge.closeMessage();
    } catch (e) {}
    document.body.style.display = "none";
  };

  createWheel();
});
