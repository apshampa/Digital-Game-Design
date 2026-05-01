// --- Configuration ---
const levelConfig = {
    1: { rows: 3, cols: 4, itemsToMemorize: 5, budget: 200 },
    2: { rows: 4, cols: 4, itemsToMemorize: 6, budget: 250 },
    3: { rows: 4, cols: 5, itemsToMemorize: 7, budget: 300 },
    4: { rows: 5, cols: 5, itemsToMemorize: 8, budget: 350 }
};

const fullItemPool = [
    { name: 'Milk', price: 40, img: 'Card images/milk.png' },
    { name: 'Bread', price: 35, img: 'Card images/bread.png' },
    { name: 'Egg', price: 50, img: 'Card images/egg.png' },
    { name: 'Tomato', price: 30, img: 'Card images/tomatoc.png' },
    { name: 'Carrot', price: 35, img: 'Card images/carrot.png' },
    { name: 'Avocado', price: 45, img: 'Card images/avacado.png' },
    { name: 'Mushroom', price: 35, img: 'Card images/mushroom.png' },
    { name: 'Kitkat', price: 15, img: 'Card images/kitkat.png' },
    { name: 'Nutella', price: 120, img: 'Card images/nutella.png' },
    { name: 'Orange', price: 25, img: 'Card images/orange.png' },
    { name: 'Zucchini', price: 45, img: 'Card images/zucchini.png' },
    { name: 'Diet Coke', price: 20, img: 'Card images/diet-coke.png' }
];

let gameState = {
    currentScreen: 'loading',
    currentLevel: 1,
    currentBudget: 200,
    totalSpent: 0,
    score: 0,
    list: [],
    selected: [],
    isMemorizing: false,
    hints: {
        eye: 3,
        list: 3,
        broom: 3
    }
};

// --- DOM Elements ---
const screens = {
    loading: document.getElementById('screen-loading'),
    instructions: document.getElementById('screen-instructions'),
    memory: document.getElementById('screen-memory'),
    game: document.getElementById('screen-game'),
    result: document.getElementById('screen-result')
};

const progressBar = document.getElementById('loading-progress');
const btnStartInit = document.getElementById('btn-start-init');
const btnStartShopping = document.getElementById('btn-start-shopping');
const infoBtn = document.getElementById('info-btn');
const groceryListEl = document.getElementById('grocery-list');
const gameGridEl = document.getElementById('game-grid');
const cartListEl = document.getElementById('cart-list');
const cartTotalEl = document.getElementById('cart-total');
const gameStatusEl = document.getElementById('game-status');
const headerBudgetEl = document.getElementById('header-budget');

// --- Level Synchronization ---
function updateLevelBadges() {
    const badges = document.querySelectorAll('.level-badge');
    badges.forEach(b => b.innerText = `Level ${gameState.currentLevel}`);
}

// --- Screen Management ---
function showScreen(screenId) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[screenId].classList.add('active');
    gameState.currentScreen = screenId;
    
    const topBar = document.getElementById('game-top-bar');
    if (screenId === 'loading') {
        topBar.style.display = 'none';
    } else {
        topBar.style.display = 'flex';
    }
}

// --- Loading Screen ---
function initLoading() {
    let progress = 0;
    headerBudgetEl.innerText = "0"; // Budget 0 for Screen 1 & 2
    const interval = setInterval(() => {
        progress += 2;
        progressBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => showScreen('instructions'), 500);
        }
    }, 100); 
}

// --- Memory Phase (Screen 3) ---
function startMemoryPhase() {
    const config = levelConfig[gameState.currentLevel];
    if (!config) return; // safety check

    // 1. Reset Level State (Single Source of Truth)
    gameState.totalSpent = 0;
    gameState.currentBudget = config.budget;
    gameState.selected = [];
    
    // Pick unique items for the list
    gameState.list = [...fullItemPool].sort(() => 0.5 - Math.random()).slice(0, config.itemsToMemorize);
    
    // Reset specific states for the level
    gameState.hints = { eye: 3, list: 3, broom: 3 }; 

    // 2. Synchronize UI
    updateLevelBadges();
    headerBudgetEl.innerText = gameState.currentBudget;
    
    const listTotal = gameState.list.reduce((acc, item) => acc + item.price, 0);

    groceryListEl.innerHTML = gameState.list.map(item => `
        <div class="list-item">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
        </div>
    `).join('');
    
    document.getElementById('list-total-price').innerText = `₹${listTotal}`;
    
    updateHintUI();
    showScreen('memory');
}

// --- Game Phase (Screen 4) ---
function setupGameGrid() {
    const config = levelConfig[gameState.currentLevel];
    if (!config) return;

    const totalCards = config.rows * config.cols;

    gameGridEl.innerHTML = '';
    cartListEl.innerHTML = '';
    cartTotalEl.innerText = '₹0';
    gameState.isMemorizing = true;
    gameStatusEl.innerText = "Wait for items to reveal...";

    // Configure Grid Layout dynamically
    gameGridEl.style.gridTemplateColumns = `repeat(${config.cols}, 1fr)`;
    gameGridEl.style.gridTemplateRows = `repeat(${config.rows}, 1fr)`;

    // Build the card pool: Targets + Randomized Decoys (to fill the grid)
    let cardPool = [...gameState.list];
    
    const remaining = totalCards - cardPool.length;
    // Fill remaining with other random items from pool
    const decoys = [...fullItemPool].sort(() => 0.5 - Math.random());
    for (let i = 0; i < remaining; i++) {
        cardPool.push(decoys[i % decoys.length]);
    }

    // Shuffle final grid pool
    cardPool.sort(() => 0.5 - Math.random());

    cardPool.forEach((item) => {
        const cardEl = document.createElement('div');
        cardEl.classList.add('grid-item-card');
        cardEl.dataset.name = item.name;
        
        if (gameState.currentLevel === 4) {
             cardEl.style.fontSize = '0.8rem';
        }

        cardEl.innerHTML = `
            <div class="card-inner">
                <div class="card-back"></div>
                <div class="card-front">
                    <span class="card-name">${item.name}</span>
                    <img src="${item.img}" alt="${item.name}">
                    <span class="card-price">${item.price}/-</span>
                </div>
            </div>
        `;
        
        cardEl.onclick = () => handleCardClick(item, cardEl);
        gameGridEl.appendChild(cardEl);
    });

    initHintListeners();
    setTimeout(startMemorizationSequence, 800);
}

function startMemorizationSequence() {
    const cards = document.querySelectorAll('.grid-item-card');
    cards.forEach(card => card.classList.add('flipped'));

    let timeLeft = 5;
    gameStatusEl.innerText = `Memorize the items. Time left: ${timeLeft}...`;

    const timer = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            gameStatusEl.innerText = `Memorize the items. Time left: ${timeLeft}...`;
        } else {
            clearInterval(timer);
            gameStatusEl.innerText = "Find the items from your list!";
            cards.forEach(card => card.classList.remove('flipped'));
            gameState.isMemorizing = false;
        }
    }, 1000);
}

function handleCardClick(item, el) {
    const config = levelConfig[gameState.currentLevel];
    if (gameState.isMemorizing || el.classList.contains('flipped') || el.classList.contains('dissolved') || gameState.selected.length >= config.itemsToMemorize) return;

    // Card Click Sound
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(e => console.log("Audio play blocked:", e));
    }

    el.classList.add('flipped');
    gameState.selected.push(item);
    
    // Budget Calculation (Requirement)
    gameState.totalSpent += item.price;
    gameState.currentBudget = config.budget - gameState.totalSpent;
    
    const icon = document.createElement('img');
    icon.src = item.img;
    icon.classList.add('cart-icon-small');
    cartListEl.appendChild(icon);
    
    cartTotalEl.innerText = `₹${gameState.totalSpent}`;
    updateStats();

    if (gameState.selected.length === config.itemsToMemorize) {
        setTimeout(processFinalResult, 1500);
    }
}

// --- Hints Logic ---
function initHintListeners() {
    const eyeBtn = document.getElementById('hint-eye');
    const listBtn = document.getElementById('hint-list');
    const broomBtn = document.getElementById('hint-broom');

    eyeBtn.onclick = () => useEyeHint();
    listBtn.onclick = () => useListHint();
    broomBtn.onclick = () => useBroomHint();
}

function useEyeHint() {
    if (gameState.isMemorizing || gameState.hints.eye <= 0) return;
    gameState.hints.eye--;
    updateHintUI();
    const cards = document.querySelectorAll('.grid-item-card:not(.flipped):not(.dissolved)');
    cards.forEach(card => card.classList.add('flipped'));
    setTimeout(() => {
        cards.forEach(card => card.classList.remove('flipped'));
    }, 3000);
}

function useListHint() {
    if (gameState.isMemorizing || gameState.hints.list <= 0) return;
    gameState.hints.list--;
    updateHintUI();
    const overlay = document.getElementById('hint-list-overlay');
    const recallList = document.getElementById('recall-list');
    recallList.innerHTML = gameState.list.map(item => `
        <div class="recall-item">
            <span>${item.name}</span>
            <span>₹${item.price}</span>
        </div>
    `).join('');
    overlay.classList.remove('hidden');
    setTimeout(() => {
        overlay.classList.add('hidden');
    }, 3000);
}

function useBroomHint() {
    if (gameState.isMemorizing || gameState.hints.broom <= 0) return;
    gameState.hints.broom--;
    updateHintUI();
    const targetNames = gameState.list.map(t => t.name);
    const availableDecoys = [...document.querySelectorAll('.grid-item-card:not(.flipped):not(.dissolved)')]
        .filter(card => !targetNames.includes(card.dataset.name));
    const toDissolve = availableDecoys.sort(() => 0.5 - Math.random()).slice(0, 3);
    toDissolve.forEach(card => card.classList.add('dissolved'));
}

function updateHintUI() {
    document.getElementById('count-eye').innerText = gameState.hints.eye;
    document.getElementById('count-list').innerText = gameState.hints.list;
    document.getElementById('count-broom').innerText = gameState.hints.broom;
    if (gameState.hints.eye === 0) document.getElementById('hint-eye').classList.add('disabled');
    if (gameState.hints.list === 0) document.getElementById('hint-list').classList.add('disabled');
    if (gameState.hints.broom === 0) document.getElementById('hint-broom').classList.add('disabled');
}

function updateStats() {
    // Clamping UI display to minimum 0 (Requirement)
    const budgetVal = Math.max(0, gameState.currentBudget);
    headerBudgetEl.innerText = budgetVal;
}

// --- Result Processing (Screen 5) ---
function processFinalResult() {
    const config = levelConfig[gameState.currentLevel];
    const targetNames = gameState.list.map(t => t.name);
    
    // 1. Correct Items count
    const correctCount = gameState.selected.filter(s => targetNames.includes(s.name)).length;
    
    // 2. Within Budget status (MANDATORY: totalSpent <= levelConfig.budget)
    const withinBudget = gameState.totalSpent <= config.budget;
    
    // 3. Sequence matching 
    let sequenceCount = 0;
    for (let i = 0; i < config.itemsToMemorize; i++) {
        if (gameState.selected[i] && gameState.list[i] && gameState.selected[i].name === gameState.list[i].name) {
            sequenceCount++;
        }
    }

    // Determine Result State
    let resultState = '';
    if (correctCount === config.itemsToMemorize && withinBudget) {
        resultState = 'SMART SHOPPER';
    } else if (correctCount === config.itemsToMemorize) {
        resultState = 'GOOD PICKS';
    } else if (correctCount >= Math.floor(config.itemsToMemorize * 0.6)) {
        resultState = 'ALMOST THERE';
    } else if (correctCount > 0) {
        resultState = 'LET’S TRY AGAIN';
    } else {
        resultState = 'QUICK PICKS';
    }

    renderResultUI(resultState, correctCount, sequenceCount, withinBudget);
    showScreen('result');
}

function renderResultUI(state, correct, sequence, inBudget) {
    const config = levelConfig[gameState.currentLevel];
    const titleEl = document.getElementById('result-title');
    const msgEl = document.getElementById('result-msg-small');
    const btnEl = document.getElementById('btn-result-action');

    // UI elements update (Requirement)
    document.getElementById('final-budget').innerText = `₹${config.budget}`;
    document.getElementById('final-spent').innerText = `₹${gameState.totalSpent}`;
    document.getElementById('final-saved').innerText = `₹${config.budget - gameState.totalSpent}`;
    
    document.getElementById('stat-essential-items').innerText = `${correct}/${config.itemsToMemorize}`;
    document.getElementById('stat-sequence').innerText = `${sequence}/${config.itemsToMemorize}`;
    document.getElementById('stat-within-budget').innerText = inBudget ? 'Yes' : 'No';
    
    // Coin logic
    const baseCoins = correct * 10;
    const bonusCoins = (sequence === config.itemsToMemorize && inBudget) ? 50 : 5;
    document.getElementById('final-coins').innerText = baseCoins;
    document.getElementById('bonus-coins').innerText = bonusCoins;

    titleEl.innerText = state;
    
    // Clear previous event listener (to prevent level skipping)
    const newBtn = btnEl.cloneNode(true);
    btnEl.parentNode.replaceChild(newBtn, btnEl);
    
    // Progression Logic (Requirement)
    const won = (state === 'SMART SHOPPER' || state === 'GOOD PICKS');
    
    if (won) {
        if (gameState.currentLevel < 4) {
            newBtn.innerText = "Next Level";
            newBtn.onclick = () => {
                gameState.currentLevel++; // Increment ONLY on click
                startMemoryPhase();
            };
        } else {
            // Level 4 Completed
            titleEl.innerText = "Game Completed 🎉";
            msgEl.innerText = "You've mastered the memory basket!";
            newBtn.innerText = "Play Again";
            newBtn.onclick = () => {
                gameState.currentLevel = 1;
                startMemoryPhase();
            };
        }
    } else {
        newBtn.innerText = "Try Again";
        newBtn.onclick = () => {
            // Redoing same level (currentLevel stays same)
            startMemoryPhase();
        };
    }

    switch (state) {
        case 'SMART SHOPPER':
            msgEl.innerText = "Perfect recall. Smart choices";
            break;
        case 'GOOD PICKS':
             msgEl.innerText = sequence < config.itemsToMemorize ? "Great picks! Try matching the sequence next time." : "Great picks! Watch the budget.";
            break;
        case 'ALMOST THERE':
            msgEl.innerText = "Some non-essential items slipped in";
            break;
        case 'LET’S TRY AGAIN':
            msgEl.innerText = "This round was a bit off";
            break;
        case 'QUICK PICKS':
            msgEl.innerText = "You stayed within budget but missed essentials";
            break;
    }
}

// --- Interaction ---
btnStartInit.onclick = () => startMemoryPhase();
btnStartShopping.onclick = () => {
    showScreen('game');
    setupGameGrid();
};
infoBtn.onclick = () => showScreen('instructions');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', initLoading);

// --- Background Music ---
const bgMusic = document.getElementById('bg-music');
const musicIcon = document.getElementById('music-icon');
const clickSound = document.getElementById('click-sound');

// Set volume levels for better balance
if (bgMusic) bgMusic.volume = 0.80;    // Very soft background
if (clickSound) clickSound.volume = 1.0; // Prominent click sound

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play();
        musicIcon.classList.remove('muted');
    } else {
        bgMusic.pause();
        musicIcon.classList.add('muted');
    }
}

musicIcon.onclick = (e) => {
    e.stopPropagation();
    toggleMusic();
};

// Start music on first interaction
document.addEventListener('click', () => {
    if (bgMusic.paused && !musicIcon.classList.contains('muted')) {
        bgMusic.play().catch(e => console.log("Audio play blocked:", e));
    }
}, { once: true });
