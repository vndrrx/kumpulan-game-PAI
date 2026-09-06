const boardEl = document.getElementById('board');
const svgOverlay = document.getElementById('snakes-ladders-svg');
const diceEl = document.getElementById('dice');
const diceStatus = document.getElementById('dice-status');
const messagesEl = document.getElementById('game-messages');

const mathModal = document.getElementById('math-modal');
const winModal = document.getElementById('win-modal');
const optionsContainer = document.getElementById('options-container');
const questionText = document.getElementById('question-text');
const modalFeedback = document.getElementById('modal-feedback');

const ladders = {
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91
};

const snakes = {
    16: 6,
    46: 25,
    49: 11,
    62: 19,
    64: 60,
    74: 53,
    89: 68,
    92: 88,
    95: 75,
    99: 80
};

const players = [
    { id: 1, pos: 1, avatar: '👦', tokenEl: document.getElementById('token-p1'), cardEl: document.getElementById('player1-card'), posEl: document.getElementById('pos-p1') },
    { id: 2, pos: 1, avatar: '👧', tokenEl: document.getElementById('token-p2'), cardEl: document.getElementById('player2-card'), posEl: document.getElementById('pos-p2') }
];

let turn = 0; // 0 for Player 1, 1 for Player 2
let isAnimating = false;
const cellPositions = {}; // Stores {x, y} for each cell 1-100

const diceFaces = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

function createBoard() {
    let html = '';
    let isRightToLeft = true;
    for (let row = 0; row < 10; row++) {
        let rowCells = [];
        for (let col = 0; col < 10; col++) {
            let num = 100 - (row * 10) - col;
            rowCells.push(num);
        }
        if (!isRightToLeft) {
            rowCells.reverse();
        }
        
        rowCells.forEach(num => {
            let colorClass = `color-${num % 5}`;
            html += `<div class="square ${colorClass}" id="cell-${num}">
                        ${num}
                     </div>`;
        });
        isRightToLeft = !isRightToLeft;
    }
    boardEl.insertAdjacentHTML('beforeend', html); // Append after SVG

    // Calculate positions after layout
    setTimeout(calculatePositions, 100);
}

function calculatePositions() {
    const boardRect = boardEl.getBoundingClientRect();
    for (let i = 1; i <= 100; i++) {
        const cell = document.getElementById(`cell-${i}`);
        if(cell) {
            const rect = cell.getBoundingClientRect();
            cellPositions[i] = {
                x: rect.left - boardRect.left + (rect.width / 2),
                y: rect.top - boardRect.top + (rect.height / 2)
            };
        }
    }
    drawSnakesAndLadders();
    updateTokenPosition(players[0], 0);
    updateTokenPosition(players[1], 0);
}

function drawSnakesAndLadders() {
    svgOverlay.innerHTML = '';
    
    // Draw Ladders
    for (let [start, end] of Object.entries(ladders)) {
        drawLadder(start, end);
    }

    // Draw Snakes
    for (let [start, end] of Object.entries(snakes)) {
        drawLine(start, end, '#4CAF50', 12, 'snake');
        drawLine(start, end, '#2E7D32', 4, 'snake'); // inner detail
    }
}

function drawLadder(start, end) {
    if(!cellPositions[start] || !cellPositions[end]) return;
    const p1 = cellPositions[start];
    const p2 = cellPositions[end];
    
    // Calculate angle and distance
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    const angle = Math.atan2(dy, dx);
    
    // Ladder width
    const width = 20;
    const offsetX = Math.cos(angle + Math.PI/2) * (width/2);
    const offsetY = Math.sin(angle + Math.PI/2) * (width/2);
    
    // Left rail
    createSvgLine(p1.x - offsetX, p1.y - offsetY, p2.x - offsetX, p2.y - offsetY, '#FFC107', 4);
    // Right rail
    createSvgLine(p1.x + offsetX, p1.y + offsetY, p2.x + offsetX, p2.y + offsetY, '#FFC107', 4);
    
    // Rungs
    const numRungs = Math.floor(distance / 20);
    for(let i = 1; i <= numRungs; i++) {
        const fraction = i / (numRungs + 1);
        const rungX = p1.x + dx * fraction;
        const rungY = p1.y + dy * fraction;
        createSvgLine(rungX - offsetX, rungY - offsetY, rungX + offsetX, rungY + offsetY, '#FFCA28', 3);
    }
}

function createSvgLine(x1, y1, x2, y2, color, strokeWidth) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', strokeWidth);
    line.setAttribute('stroke-linecap', 'round');
    svgOverlay.appendChild(line);
    return line;
}

function drawLine(start, end, color, strokeWidth, type) {
    if(!cellPositions[start] || !cellPositions[end]) return;
    const p1 = cellPositions[start];
    const p2 = cellPositions[end];
    
    const line = createSvgLine(p1.x, p1.y, p2.x, p2.y, color, strokeWidth);
    if(type === 'snake') {
        // give it a bit of a curve by using path instead if we wanted, but line is simple
        // line.setAttribute('stroke-dasharray', '5,5');
    }
}

function updateTokenPosition(player, animateDuration = 500) {
    const pos = cellPositions[player.pos];
    if(pos) {
        player.tokenEl.style.transition = `all ${animateDuration}ms ease-in-out`;
        player.tokenEl.style.left = `${pos.x - 30}px`;
        player.tokenEl.style.top = `${pos.y - 30}px`;
        player.posEl.innerText = player.pos;
    }
}

async function movePlayerStepByStep(player, targetPos) {
    const startPos = player.pos;
    const direction = targetPos > startPos ? 1 : -1;
    
    for (let i = startPos + direction; direction > 0 ? i <= targetPos : i >= targetPos; i += direction) {
        player.pos = i;
        updateTokenPosition(player, 300);
        
        // Highlight cell
        const cell = document.getElementById(`cell-${i}`);
        if(cell) {
            cell.classList.add('square-highlight');
            setTimeout(() => cell.classList.remove('square-highlight'), 300);
        }
        
        await new Promise(r => setTimeout(r, 300));
    }
}

let currentRoll = 0;
let currentTargetPos = 0;
let currentOriginalPos = 0;
let diceRollCount = 0;

async function rollDice() {
    if (isAnimating) return;
    isAnimating = true;
    
    const player = players[turn];
    messagesEl.innerText = `Pemain ${player.id} mengocok dadu...`;
    
    diceEl.classList.add('rolling');
    
    // Simulate dice roll duration
    await new Promise(r => setTimeout(r, 600));
    
    currentRoll = Math.floor(Math.random() * 6) + 1;
    diceEl.classList.remove('rolling');
    diceEl.innerText = diceFaces[currentRoll];
    
    diceRollCount++;
    
    if (diceRollCount % 3 === 0) {
        messagesEl.innerText = `MISTERI! Pemain ${player.id} mendapat dadu ${currentRoll}. Jawab soal untuk BONUS +6 langkah!`;
        currentTargetPos = player.pos + currentRoll + 6;
        if (currentTargetPos > 100) currentTargetPos = 100 - (currentTargetPos - 100);
        
        currentOriginalPos = player.pos;
        askMathQuestion(player);
    } else {
        messagesEl.innerText = `Pemain ${player.id} melangkah maju ${currentRoll} kotak!`;
        currentTargetPos = player.pos + currentRoll;
        if (currentTargetPos > 100) currentTargetPos = 100 - (currentTargetPos - 100);
        
        await executeMove(player, currentTargetPos);
    }
}

async function executeMove(player, targetPos) {
    await movePlayerStepByStep(player, targetPos);
    
    if (player.pos === 100) {
        showWin(player);
        return;
    }
    
    await checkSnakesLadders(player, player.pos);
    nextTurn();
}

const paiQuestions = [
    {
        question: "Ketika kamu tidak sengaja menjatuhkan sampah di halaman sekolah saat jam istirahat dan tidak ada orang yang melihatnya, sikap yang menunjukkan akhlak terpuji yaitu kejujuran dan tanggung jawab adalah ....",
        options: [
            "Membiarkannya begitu saja",
            "Langsung memungut dan membuangnya ke tempat sampah",
            "Menyuruh teman yang lewat",
            "Menginjak sampah agar tidak terlihat"
        ],
        answer: "Langsung memungut dan membuangnya ke tempat sampah"
    },
    {
        question: "Kamu berjanji untuk ikut kerja bakti, namun hari itu cuaca sedang panas. Sikap menepati janji dan peduli lingkungan adalah ....",
        options: [
            "Datang terlambat dan langsung pulang",
            "Tetap datang dan membantu membersihkan taman",
            "Membatalkan janji karena cuaca panas",
            "Menyuruh teman lain menggantikannya"
        ],
        answer: "Tetap datang dan membantu membersihkan taman"
    },
    {
        question: "Saat kerja bakti di masjid, ada teman yang kurang pandai menyapu. Sikapmu yang rendah hati adalah ....",
        options: [
            "Mengejek cara menyapunya",
            "Menunjukkan cara yang benar dengan sopan",
            "Membiarkannya sambil mengeluh",
            "Mengambil alih sapu itu"
        ],
        answer: "Menunjukkan cara yang benar dengan sopan"
    },
    {
        question: "Kamu melihat orang membuang sampah ke selokan. Sikap sabar dan lembut yang kamu lakukan adalah ....",
        options: [
            "Langsung memarahinya dengan keras",
            "Menasihatinya dengan sopan",
            "Membiarkannya saja",
            "Membuang sampah juga sebagai protes"
        ],
        answer: "Menasihatinya dengan sopan"
    },
    {
        question: "Orang tua mengajakmu menyiram tanaman bersama-sama. Sikap berbakti kepada orang tua adalah ....",
        options: [
            "Menolak dan bermain HP",
            "Mengerjakan dengan malas",
            "Membantu dengan senang hati",
            "Mengerjakan asal-asalan lalu pergi"
        ],
        answer: "Membantu dengan senang hati"
    }
];

function generatePAIQuestion() {
    const q = paiQuestions[Math.floor(Math.random() * paiQuestions.length)];
    let shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
    return {
        text: q.question,
        answer: q.answer,
        options: shuffledOptions
    };
}

function askMathQuestion(player) {
    const q = generatePAIQuestion();
    questionText.innerText = q.text;
    optionsContainer.innerHTML = '';
    modalFeedback.className = 'feedback-text';
    modalFeedback.innerText = '';
    
    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(opt, q.answer, btn, player);
        optionsContainer.appendChild(btn);
    });
    
    mathModal.classList.add('show');
}

async function handleAnswer(selected, correct, btn, player) {
    // disable all buttons
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');
    
    if (selected === correct) {
        btn.classList.add('correct');
        modalFeedback.innerText = 'Benar! Kamu mendapat BONUS 6 langkah!';
        modalFeedback.className = 'feedback-text success';
        fireConfetti(true);
        
        await new Promise(r => setTimeout(r, 1500));
        mathModal.classList.remove('show');
        
        await executeMove(player, currentTargetPos);
    } else {
        btn.classList.add('wrong');
        // Highlight correct one
        buttons.forEach(b => {
            if(b.innerText === correct) b.classList.add('correct');
        });
        modalFeedback.innerText = 'Yah, Salah! Giliranmu hangus & bonus batal.';
        modalFeedback.className = 'feedback-text error';
        
        await new Promise(r => setTimeout(r, 2000));
        mathModal.classList.remove('show');
        
        // Do not move, just next turn
        nextTurn();
    }
}

async function checkSnakesLadders(player, pos) {
    if (ladders[pos]) {
        messagesEl.innerText = `Naik Tangga!`;
        await new Promise(r => setTimeout(r, 500));
        player.pos = ladders[pos];
        updateTokenPosition(player, 1000); // 1s animation
        await new Promise(r => setTimeout(r, 1000));
    } else if (snakes[pos]) {
        messagesEl.innerText = `Oh tidak, digigit Ular!`;
        await new Promise(r => setTimeout(r, 500));
        player.pos = snakes[pos];
        updateTokenPosition(player, 1000);
        await new Promise(r => setTimeout(r, 1000));
    }
}

function nextTurn() {
    players[turn].cardEl.classList.remove('active');
    turn = (turn + 1) % 2;
    players[turn].cardEl.classList.add('active');
    diceStatus.innerText = `Giliran Pemain ${players[turn].id}`;
    messagesEl.innerText = `Pemain ${players[turn].id}, silakan lempar dadu!`;
    diceEl.innerText = '🎲';
    isAnimating = false;
}

function showWin(player) {
    document.getElementById('winner-avatar').innerText = player.avatar;
    document.getElementById('winner-text').innerText = `Pemain ${player.id} Menang!`;
    winModal.classList.add('show');
    fireConfetti(false); // continuous
}

function fireConfetti(single) {
    if(typeof confetti === 'function') {
        if(single) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 1000
            });
        } else {
            var duration = 15 * 1000;
            var animationEnd = Date.now() + duration;
            var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

            var interval = setInterval(function() {
                var timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                var particleCount = 50 * (timeLeft / duration);
                confetti(Object.assign({}, defaults, { particleCount,
                    origin: { x: Math.random(), y: Math.random() - 0.2 }
                }));
            }, 250);
        }
    }
}

// Window resize handling
window.addEventListener('resize', () => {
    calculatePositions();
});

// Fullscreen
document.getElementById('btn-fullscreen-ular').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Initialize
createBoard();
