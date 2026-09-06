// SOAL-SOAL BUKA KOTAK MISTERI
const questions = [
    {
        question: "Saat salat berjamaah, ada orang tua terlambat dan tidak mendapat tempat di depan. Sikapmu…",
        options: ["Tetap di tempat & tidak peduli", "Segera berpindah ke belakang agar orang tua bisa di depan", "Menyuruh orang lain pindah", "Menyuruh imam menunggu"],
        answer: "Segera berpindah ke belakang agar orang tua bisa di depan"
    },
    {
        question: "Menemukan dompet berisi uang di jalan, tidak ada yang melihat. Tindakan tepat…",
        options: ["Ambil uang, buang dompet", "Bawa pulang, simpan sendiri", "Serahkan ke pengurus / cari pemiliknya", "Tunggu sebentar, lalu bawa pulang"],
        answer: "Serahkan ke pengurus / cari pemiliknya"
    },
    {
        question: "Adik tidak sengaja merusak mainanmu, kamu tidak marah dan memaafkan. Sikap ini disebut…",
        options: ["Sabar & Pemaaf", "Jujur", "Dermawan", "Rendah Hati"],
        answer: "Sabar & Pemaaf"
    },
    {
        question: "Setiap berjanji, kamu selalu menepati tepat waktu. Ini akhlak…",
        options: ["Menjaga Amanah", "Menepati Janji", "Berani Mengakui Kesalahan", "Semua jawaban benar"],
        answer: "Semua jawaban benar"
    },
    {
        question: "Berpapasan dengan orang yang lebih tua di jalan. Sikap yang baik…",
        options: ["Melewati cepat", "Memberi jalan, menyapa dengan sopan", "Menunduk diam", "Menatap tajam"],
        answer: "Memberi jalan, menyapa dengan sopan"
    }
];

let score = 0;
let timeRemaining = 180; // 3 minutes
let gameTimerInterval;
let openedBoxes = [];
let activeBoxIndex = null;

const timerDisplay = document.getElementById('timer-display');
const scoreDisplay = document.getElementById('score-display');
const gridView = document.getElementById('grid-view');
const questionView = document.getElementById('question-view');
const boxesGrid = document.getElementById('boxes-grid');
const qText = document.getElementById('q-text');
const qOptions = document.getElementById('q-options');
const scorePopup = document.getElementById('score-popup');
const finalScore = document.getElementById('final-score');
const finalMessage = document.getElementById('final-message');

function initGame() {
    score = 0;
    timeRemaining = 180;
    openedBoxes = [];
    activeBoxIndex = null;
    
    scoreDisplay.innerText = score;
    updateTimerDisplay();
    scorePopup.style.display = 'none';
    questionView.style.display = 'none';
    gridView.style.display = 'flex';
    
    renderGrid();
    
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        if (timeRemaining <= 0) {
            endGame("Waktu Habis!");
        }
    }, 1000);
}

function updateTimerDisplay() {
    let m = Math.floor(timeRemaining / 60);
    let s = timeRemaining % 60;
    timerDisplay.innerText = `0${m}:${s.toString().padStart(2, '0')}`;
}

function renderGrid() {
    boxesGrid.innerHTML = '';
    questions.forEach((q, idx) => {
        let boxStatus = openedBoxes.find(b => b.index === idx);
        let boxEl = document.createElement('div');
        
        if (boxStatus) {
            boxEl.className = 'box-item box-opened ' + (boxStatus.correct ? 'box-correct' : '');
            if (boxStatus.correct) {
                boxEl.innerHTML = `<div class="correct-out"><span class="correct-q-text">${q.question}</span></div><div class="cross-out" style="color:#10b981">✓</div>`;
            } else {
                boxEl.innerHTML = `<div class="box-number">${idx + 1}</div><div class="cross-out">✗</div>`;
            }
        } else {
            boxEl.className = 'box-item';
            boxEl.innerHTML = `<div class="box-number">${idx + 1}</div>`;
            boxEl.onclick = () => openBox(idx);
        }
        
        boxesGrid.appendChild(boxEl);
    });
}

function openBox(idx) {
    activeBoxIndex = idx;
    const q = questions[idx];
    
    // Show Question View
    gridView.style.display = 'none';
    questionView.style.display = 'flex';
    
    qText.innerText = q.question;
    qOptions.innerHTML = '';
    
    const letters = ['A', 'B', 'C', 'D'];
    q.options.forEach((opt, i) => {
        let btn = document.createElement('div');
        btn.className = 'box-option-card';
        btn.innerHTML = `<div class="opt-letter">${letters[i]}</div><div class="opt-text">${opt}</div>`;
        btn.onclick = () => handleAnswer(opt, q.answer);
        qOptions.appendChild(btn);
    });
}

function handleAnswer(selected, correct) {
    if (selected === correct) {
        score += 20;
        scoreDisplay.innerText = score;
        openedBoxes.push({ index: activeBoxIndex, correct: true });
    } else {
        openedBoxes.push({ index: activeBoxIndex, correct: false });
    }
    
    activeBoxIndex = null;
    questionView.style.display = 'none';
    gridView.style.display = 'flex';
    renderGrid();
    
    if (openedBoxes.length === questions.length) {
        endGame("Permainan Selesai!");
    }
}

function endGame(msg) {
    clearInterval(gameTimerInterval);
    finalMessage.innerText = msg;
    finalScore.innerText = `Skor Akhir: ${score}`;
    scorePopup.style.display = 'flex';
}

window.addEventListener('load', initGame);

// Fullscreen
document.getElementById('btn-fullscreen').addEventListener('click', () => {
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
