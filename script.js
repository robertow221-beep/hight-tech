const productsList = [
      'images/1.jpg', 
      'images/2.jpg', 
      'images/3.jpg',
      'images/4.jpg',
      'images/5.jpg',
      'images/6.jpg',
      'images/7.jpg',
      'images/8.jpg',
      'images/9.jpg',
      'images/10.jpg',
      'images/11.jpg',
      'images/12.jpg',
       
      
    
];

const bubblesContainer = document.getElementById('bubbles-container');
const levelEl = document.getElementById('level');
const pointsEl = document.getElementById('points');
const productsEl = document.getElementById('products');
const goalEl = document.getElementById('goal');
const discountMsg = document.getElementById('discount-msg');
const levelupMsg = document.getElementById('levelup-msg');
const timerEl = document.getElementById('timer');
const gameOverEl = document.getElementById('game-over');
const addProductBtn = document.getElementById('addProductBtn');
const actionButtonsContainer = document.getElementById('action-buttons');
const playAgainBtn = document.getElementById('playAgainBtn');
const visitSiteBtn = document.getElementById('visitSiteBtn');
const couponButtons = document.getElementById('coupon-buttons');
const visitSiteCouponBtn = document.getElementById('visitSiteCouponBtn');
const continuePlayingBtn = document.getElementById('continuePlayingBtn');

let level = 1;
let points = 0;
let products = 0;
const maxLevel = 10;
const baseGoal = 10;
const timePerLevel = 30;

// Array para armazenar as bolhas e seus estados de movimento
const activeBubbles = [];

function getGoal(level) {
    return baseGoal + (level - 1);
}

let timerInterval = null;
let autoBubbleTimeout = null;

function updateUI() {
    levelEl.textContent = level;
    pointsEl.textContent = points;
    productsEl.textContent = products;
    goalEl.textContent = getGoal(level);
    updateDiscountMsg();
}

function updateDiscountMsg() {
    if (level >= 10) {
        discountMsg.innerHTML = 'Você desbloqueou <span style="color:#00ff00;">10% de desconto</span> com o cupom <code>MULTIVERSOHIGHTECH 🎟</code>';
    } else if (level >= 5) {
        discountMsg.innerHTML = 'Você ganhou <span style="color:#00ff00;">5% de desconto</span> com o cupom <code>MULTIVERSO5 🎟</code>';
    } else if (level >= 3) {
        discountMsg.innerHTML = 'Você ganhou <span style="color:#00ff00;">3% de desconto</span> com o cupom <code>MULTIVERSO 🎟</code>';
    } else {
        discountMsg.textContent = '';
    }
}

function addBubble() {
    if (gameOverEl.style.display === 'block' || couponButtons.style.display === 'flex') {
        return;
    }
    
    const imgSrc = productsList[Math.floor(Math.random() * productsList.length)];
    const bubble = document.createElement('div');
    bubble.classList.add('bubble');
    
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;

    const bubbleSize = Math.min(containerWidth * 0.1, 80);
    
    // Posição inicial aleatória dentro do container
    const initialTop = Math.random() * (containerHeight - bubbleSize);
    const initialLeft = Math.random() * (containerWidth - bubbleSize);
    
    bubble.style.top = `${initialTop}px`;
    bubble.style.left = `${initialLeft}px`;
    
    const img = document.createElement('img');
    img.src = imgSrc;
    img.alt = 'Produto futurista';
    bubble.appendChild(img);

    bubblesContainer.appendChild(bubble);

    // Dados de movimento para esta bolha
    const speed = 1 + (level * 0.1); // Velocidade ajustada para ficar mais lenta
    const angle = Math.random() * Math.PI * 2; // Ângulo de direção aleatório
    const dx = Math.cos(angle) * speed;
    const dy = Math.sin(angle) * speed;

    activeBubbles.push({
        element: bubble,
        x: initialLeft,
        y: initialTop,
        dx: dx,
        dy: dy,
        size: bubbleSize
    });

    // AQUI ESTÁ A ALTERAÇÃO:
    bubble.onclick = () => {
        // Se a tela de nível estiver visível, ignore o clique
        if (levelupMsg.classList.contains('show')) {
            return;
        }

        products++;
        points += 10;
        updateUI();

        if (products >= getGoal(level)) {
            if (level < maxLevel) {
                level++;
                products = 0;
                showLevelUpMsg();
                resetTimer();
                updateUI();
                startAutoBubbles();
            } else {
                endGame(true); // Fim de jogo com vitória
            }
        }
        
        // Remove a bolha clicada do DOM e do array activeBubbles
        bubble.remove();
        const index = activeBubbles.findIndex(b => b.element === bubble);
        if (index > -1) {
            activeBubbles.splice(index, 1);
        }
    };
}
    

// Função para animar todas as bolhas ativas
function animateBubbles() {
    const gameContainer = document.getElementById('game-container');
    const containerWidth = gameContainer.offsetWidth;
    const containerHeight = gameContainer.offsetHeight;

    activeBubbles.forEach(bubbleData => {
        let { element, x, y, dx, dy, size } = bubbleData;

        x += dx;
        y += dy;

        // Rebatendo nas bordas horizontais
        if (x + size > containerWidth || x < 0) {
            dx *= -1; // Inverte a direção horizontal
            // Ajusta a posição para que a bolha não fique presa na borda
            if (x < 0) x = 0;
            if (x + size > containerWidth) x = containerWidth - size;
        }

        // Rebatendo nas bordas verticais
        if (y + size > containerHeight || y < 0) {
            dy *= -1; // Inverte a direção vertical
            // Ajusta a posição para que a bolha não fique presa na borda
            if (y < 0) y = 0;
            if (y + size > containerHeight) y = containerHeight - size;
        }

        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        // Atualiza os dados de movimento na array
        bubbleData.x = x;
        bubbleData.y = y;
        bubbleData.dx = dx;
        bubbleData.dy = dy;
    });

    // Continua a animação no próximo frame
    if (gameOverEl.style.display !== 'block' && couponButtons.style.display !== 'flex') {
        requestAnimationFrame(animateBubbles);
    }
}

function showLevelUpMsg() {
    // Para todas as bolhas pararem de se mover quando o level up aparece
    clearInterval(timerInterval);
    if (autoBubbleTimeout) clearTimeout(autoBubbleTimeout);
    
    levelupMsg.classList.add('show');
    
    if (level === 3 || level === 5 || level === 10) {
        showCouponButtons();
    } else {
        setTimeout(() => {
            levelupMsg.classList.remove('show');
            startTimer(); // Reinicia o timer
            startAutoBubbles(); // Reinicia a criação de bolhas
            requestAnimationFrame(animateBubbles); // Reinicia a animação
        }, 3000);
    }
}

function showCouponButtons() {
    clearInterval(timerInterval);
    if (autoBubbleTimeout) clearTimeout(autoBubbleTimeout);
    couponButtons.style.display = 'flex';
}

function hideCouponButtons() {
    couponButtons.style.display = 'none';
    levelupMsg.classList.remove('show');
    startTimer();
    startAutoBubbles();
    requestAnimationFrame(animateBubbles); // Reinicia a animação
}

function startTimer() {
    clearInterval(timerInterval);
    let timeLeft = timePerLevel;
    timerEl.textContent = `Tempo: ${timeLeft}s`;
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = `Tempo: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame(false);
        }
    }, 1000);
}

function resetTimer() {
    startTimer();
}

function endGame(won) {
    clearInterval(timerInterval);
    if (autoBubbleTimeout) clearTimeout(autoBubbleTimeout);
    bubblesContainer.innerHTML = ''; // Remove todas as bolhas
    activeBubbles.length = 0; // Limpa o array de bolhas ativas

    addProductBtn.style.display = 'none';

    if (won) {
        gameOverEl.style.color = '#0f0';
        gameOverEl.innerHTML = `🎉 Parabéns! Você venceu o jogo!\nNível final: ${level}\nDesconto máximo liberado!`;
        visitSiteBtn.style.display = 'inline-block';
    } else {
        gameOverEl.style.color = '#f00';
        gameOverEl.innerHTML = `⏰ Tempo esgotado!\nFim de jogo no nível ${level}.\nTente novamente!`;
        visitSiteBtn.style.display = 'none';
    }
    gameOverEl.style.display = 'block';
    actionButtonsContainer.style.display = 'flex';
}

function resetGame() {
    level = 1;
    points = 0;
    products = 0;
    gameOverEl.style.display = 'none';
    actionButtonsContainer.style.display = 'none';
    addProductBtn.style.display = 'block';
    updateUI();
    bubblesContainer.innerHTML = ''; // Limpa bolhas antigas
    activeBubbles.length = 0; // Zera o array de bolhas ativas
    startTimer();
    startAutoBubbles();
    requestAnimationFrame(animateBubbles); // Inicia a animação de novo
}

function startAutoBubbles() {
    if (autoBubbleTimeout) clearTimeout(autoBubbleTimeout); // Limpa o timeout anterior
    const interval = Math.max(600, 3000 - level * 250); // Intervalo de criação diminui com o nível
    
    // Usamos setTimeout para criar uma bolha e agendar a próxima
    const createAndScheduleBubble = () => {
        addBubble();
        if (gameOverEl.style.display !== 'block' && couponButtons.style.display !== 'flex') {
            autoBubbleTimeout = setTimeout(createAndScheduleBubble, interval);
        }
    };
    createAndScheduleBubble(); // Cria a primeira bolha e inicia o ciclo
}

// Event listeners
addProductBtn.onclick = () => {
    addBubble();
};

playAgainBtn.onclick = resetGame;

visitSiteBtn.onclick = () => {
    window.open('https://hightechtecnologias.lojavirtualnuvem.com.br/', '_blank');
};

visitSiteCouponBtn.onclick = () => {
    window.open('https://hightechtecnologias.lojavirtualnuvem.com.br/', '_blank');
};

continuePlayingBtn.onclick = hideCouponButtons;

// Inicializa jogo
updateUI();
startTimer();
startAutoBubbles();
requestAnimationFrame(animateBubbles); // Inicia o loop de animação
