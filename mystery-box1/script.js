document.addEventListener('DOMContentLoaded', function () {

    const prizes = {
        bronze: [
            { emoji: '👗', text: '10% OFF\nVestidos', code: 'BRONZE10', rarity: 'common' },
            { emoji: '👠', text: '15% OFF\nCalçados', code: 'SHOES15', rarity: 'common' },
            { emoji: '💄', text: '5% OFF\nBeleza', code: 'BEAUTY5', rarity: 'common' },
            { emoji: '😔', text: 'Tente\nNovamente', code: null, rarity: 'common' }
        ],
        silver: [
            { emoji: '👜', text: '20% OFF\nBolsas', code: 'BAGS20', rarity: 'rare' },
            { emoji: '🕶️', text: 'Frete\nGrátis', code: 'FRETEGRATIS', rarity: 'rare' },
            { emoji: '💍', text: '25% OFF\nJoias', code: 'JOIAS25', rarity: 'rare' },
            { emoji: '👗', text: '15% OFF\nVestidos', code: 'VESTIDOS15', rarity: 'common' }
        ],
        gold: [
            { emoji: '💎', text: '30% OFF\nPremium', code: 'PREMIUM30', rarity: 'epic' },
            { emoji: '👑', text: '35% OFF\nJoias', code: 'JOIAS35', rarity: 'epic' },
            { emoji: '🎁', text: '25% OFF\nTudo', code: 'TUDO25', rarity: 'rare' },
            { emoji: '👜', text: '20% OFF\nBolsas', code: 'BAGS20', rarity: 'rare' }
        ],
        diamond: [
            { emoji: '🏆', text: '50% OFF\nTudo', code: 'MEGA50', rarity: 'legendary' },
            { emoji: '💎', text: '40% OFF\nPremium', code: 'PREMIUM40', rarity: 'epic' },
            { emoji: '👑', text: '35% OFF\nJoias', code: 'JOIAS35', rarity: 'epic' },
            { emoji: '🎁', text: '30% OFF\nTudo', code: 'TUDO30', rarity: 'epic' }
        ]
    };

    let boxesLeft = 3;
    let selectedBoxType = null;
    let currentPrize = null;
    let isOpening = false;

    const boxSelection = document.getElementById('boxSelection');
    const openingAnimation = document.getElementById('openingAnimation');
    const box3d = document.getElementById('box3d');
    const boxFront = document.getElementById('boxFront');
    const boxLid = document.getElementById('boxLid');
    const prizeReveal = document.getElementById('prizeReveal');
    const prizeEmoji = document.getElementById('prizeEmoji');
    const openButton = document.getElementById('openButton');
    const resultMessage = document.getElementById('resultMessage');
    const triesCounter = document.getElementById('triesCounter');
    const newBoxBtn = document.getElementById('newBoxBtn');
    const playAgainBtn = document.getElementById('playAgainBtn');

    function updateTriesCounter() {
        triesCounter.textContent = `Caixas restantes: ${boxesLeft}`;
        if (boxesLeft === 0) {
            triesCounter.style.color = '#dc3545';
            triesCounter.style.fontWeight = '700';
        }
    }

    function createConfetti() {
        const colors = ['#667eea', '#764ba2', '#ffd700', '#ff6b9d', '#4ecdc4'];

        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.animationDelay = Math.random() * 2 + 's';
                document.body.appendChild(confetti);

                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }

    function getRandomPrize(boxType) {
        const boxPrizes = prizes[boxType];

        // Probabilidades baseadas no tipo de caixa
        let probabilities;
        switch (boxType) {
            case 'bronze':
                probabilities = [0.3, 0.3, 0.2, 0.2]; // 40% chance de desconto, 20% retry
                break;
            case 'silver':
                probabilities = [0.4, 0.3, 0.2, 0.1]; // Melhores chances
                break;
            case 'gold':
                probabilities = [0.3, 0.3, 0.3, 0.1]; // Chances equilibradas
                break;
            case 'diamond':
                probabilities = [0.1, 0.3, 0.3, 0.3]; // Maior chance de legendary
                break;
        }

        const random = Math.random();
        let cumulative = 0;

        for (let i = 0; i < probabilities.length; i++) {
            cumulative += probabilities[i];
            if (random < cumulative) {
                return boxPrizes[i];
            }
        }

        return boxPrizes[boxPrizes.length - 1];
    }

    function selectBox(boxType) {
        if (isOpening) return;

        selectedBoxType = boxType;
        currentPrize = getRandomPrize(boxType);

        // Esconder seleção e mostrar animação
        boxSelection.style.display = 'none';
        openingAnimation.style.display = 'flex';

        // Configurar visual da caixa 3D
        const boxColors = {
            bronze: 'linear-gradient(135deg, #cd7f32 0%, #8b4513 100%)',
            silver: 'linear-gradient(135deg, #c0c0c0 0%, #808080 100%)',
            gold: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)',
            diamond: 'linear-gradient(135deg, #e6e6fa 0%, #9370db 100%)'
        };

        boxFront.style.background = boxColors[boxType];
        boxLid.style.background = boxColors[boxType];

        // Configurar prêmio
        prizeEmoji.textContent = currentPrize.emoji;
    }

    function openBox() {
        if (isOpening) return;

        isOpening = true;
        boxesLeft--;

        openButton.disabled = true;
        openButton.classList.add('opening');
        openButton.textContent = '🔓 Abrindo...';

        // Animação de abertura
        box3d.classList.add('opening');

        setTimeout(() => {
            box3d.classList.remove('opening');
            box3d.classList.add('opened');
            boxLid.classList.add('open');

            setTimeout(() => {
                prizeReveal.classList.add('show');

                setTimeout(() => {
                    showResult(currentPrize);
                    updateTriesCounter();

                    if (boxesLeft > 0) {
                        newBoxBtn.style.display = 'inline-block';
                    } else {
                        playAgainBtn.style.display = 'inline-block';
                    }

                    isOpening = false;
                }, 1000);
            }, 500);
        }, 1000);
    }

    function showResult(prize) {
        if (prize.code === null) {
            resultMessage.innerHTML = `
    <h3>🎯 Tente Novamente!</h3>
    <p style="font-size: 14px; color: #666; margin-top: 8px;">
      Não foi desta vez! Tente outra caixa! 🍀
    </p>
  `;
            boxesLeft++; // Adiciona uma caixa extra

        } else {
            const rarityColors = {
                common: '#28a745',
                rare: '#007bff',
                epic: '#6f42c1',
                legendary: '#fd7e14'
            };

            const rarityNames = {
                common: 'Comum',
                rare: 'Raro',
                epic: 'Épico',
                legendary: 'Lendário'
            };

            if (prize.rarity === 'legendary') {
                createConfetti();
            }

            resultMessage.innerHTML = `
    <h3>${prize.rarity === 'legendary' ? '🏆 LENDÁRIO!' : '🎉 Parabéns!'} ${prize.emoji}</h3>
    <div class="prize-info">
      🎁 ${prize.code} 🎁<br>
      <span style="font-size: 14px;">${prize.text.replace('\n', ' ')}</span>
      <div class="rarity-badge" style="background: ${rarityColors[prize.rarity]}; color: #fff;">
        ${rarityNames[prize.rarity]}
      </div>
    </div>
    <p style="font-size: 12px; color: #666; margin-top: 8px;">
      ${prize.rarity === 'legendary' ? 'Prêmio ultra raro!' : 'Válido por 48 horas!'}
    </p>
  `;
        }
    }

    function newBox() {
        // Reset da interface
        boxSelection.style.display = 'flex';
        openingAnimation.style.display = 'none';
        resultMessage.innerHTML = '';
        newBoxBtn.style.display = 'none';

        // Reset da caixa 3D
        box3d.classList.remove('opened');
        boxLid.classList.remove('open');
        prizeReveal.classList.remove('show');

        // Reset do botão
        openButton.disabled = false;
        openButton.classList.remove('opening');
        openButton.textContent = '🔓 Abrir Caixa!';

        // Reset das seleções
        document.querySelectorAll('.mystery-box').forEach(box => {
            box.classList.remove('selected');
        });

        selectedBoxType = null;
        currentPrize = null;
    }

    function resetGame() {
        boxesLeft = 3;
        isOpening = false;

        resultMessage.innerHTML = '';

        newBoxBtn.style.display = 'none';
        playAgainBtn.style.display = 'none';

        triesCounter.style.color = '#6c757d';
        triesCounter.style.fontWeight = '600';
        updateTriesCounter();

        newBox();
    }

    // Event listeners
    document.querySelectorAll('.mystery-box').forEach(box => {
        box.addEventListener('click', () => {
            if (isOpening) return;

            document.querySelectorAll('.mystery-box').forEach(b => b.classList.remove('selected'));
            box.classList.add('selected');

            const boxType = box.getAttribute('data-type');
            selectBox(boxType);
        });
    });

    openButton.addEventListener('click', openBox);
    newBoxBtn.addEventListener('click', newBox);
    playAgainBtn.addEventListener('click', resetGame);

    // Inicializar
    updateTriesCounter();
});
