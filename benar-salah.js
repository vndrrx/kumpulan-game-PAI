const questions = [
    { 
        text: "Karena tidak ada manusia yang melihat, maka boleh tidak mengembalikan barang temuan.", 
        answer: false,
        explanation: "Allah selalu melihat. Mengembalikan barang temuan adalah menjaga amanah."
    },
    { 
        text: "Menunda salat karena sedang bermain itu diperbolehkan asalkan salatnya tidak terlewat.", 
        answer: false,
        explanation: "Salat harus dilaksanakan tepat waktu."
    },
    { 
        text: "Menepati janji kepada orang lain adalah akhlak yang terpuji.", 
        answer: true,
        explanation: "Menepati janji ciri orang beriman."
    },
    { 
        text: "Membicarakan keburukan teman di belakangnya diperbolehkan jika benar.", 
        answer: false,
        explanation: "Itu adalah ghibah, dilarang dalam Islam."
    },
    { 
        text: "Memaafkan kesalahan orang lain adalah sifat yang dicintai Allah SWT.", 
        answer: true,
        explanation: "Allah menyukai orang yang pemaaf."
    }
];

let currentQuestionIndex = 0;
let score = 0;
let timeRemaining = 60; // 1 minute
let questionActive = false;
let animationFrameId;
let gameTimerInterval;

let currentX = 0;
let speed = 0;
let lastTimestamp = 0;
let isFullscreen = false;

const questionEl = document.getElementById('question-text');
const scoreEl = document.getElementById('score-val');
const timerEl = document.getElementById('timer');
const notifEl = document.getElementById('notification');
const notifText = document.getElementById('notif-text');
const btnBenar = document.getElementById('btn-benar');
const btnSalah = document.getElementById('btn-salah');

function initGame() {
    currentQuestionIndex = 0;
    score = 0;
    timeRemaining = 60;
    updateScoreDisplay();
    updateTimerDisplay();
    
    // Start game timer
    clearInterval(gameTimerInterval);
    gameTimerInterval = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            updateTimerDisplay();
        } else {
            endGame("Waktu Habis!");
        }
    }, 1000);

    setTimeout(() => {
        startQuestion();
    }, 1000);
}

function updateTimerDisplay() {
    let m = Math.floor(timeRemaining / 60);
    let s = timeRemaining % 60;
    timerEl.innerText = `${m}:${s.toString().padStart(2, '0')}`;
}

function updateScoreDisplay() {
    scoreEl.innerText = score;
}

function startQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame("Permainan Selesai!");
        return;
    }
    
    const q = questions[currentQuestionIndex];
    questionEl.innerHTML = q.text;
    
    // Initial position: just outside the left edge
    // We use a small delay to get accurate offsetWidth
    requestAnimationFrame(() => {
        currentX = -questionEl.offsetWidth;
        questionEl.style.transform = `translateX(${currentX}px)`;
        questionActive = true;
        lastTimestamp = performance.now();
        
        animationFrameId = requestAnimationFrame(animateSlide);
    });
}

function animateSlide(timestamp) {
    if (!questionActive) return;
    
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;
    
    // Dynamic speed logic
    let screenCenter = window.innerWidth / 2;
    let elWidth = questionEl.offsetWidth;
    let textCenter = currentX + (elWidth / 2);
    let distanceToCenter = Math.abs(textCenter - screenCenter);
    
    // Kecepatan maksimum di luar layar, minimum di tengah
    let maxSpeed = window.innerWidth / 2;  // Sangat cepat di pinggir
    let minSpeed = window.innerWidth / 15; // Lambat di tengah agar mudah dibaca
    let slowingZone = window.innerWidth / 2; // Radius perlambatan (dari tengah ke pinggir)
    
    let activeSpeed = maxSpeed;
    if (distanceToCenter < slowingZone) {
        let ratio = distanceToCenter / slowingZone; 
        // Menggunakan pangkat 3 (cubic) agar kurva perlambatan lebih mulus
        activeSpeed = minSpeed + (maxSpeed - minSpeed) * (ratio * ratio * ratio);
    }
    
    currentX += activeSpeed * delta; // Move to the right
    questionEl.style.transform = `translateX(${currentX}px)`;
    
    // Check if fully off screen right
    if (currentX > window.innerWidth) {
        // Too late (telat)
        handleAnswer(null);
    } else {
        animationFrameId = requestAnimationFrame(animateSlide);
    }
}

function handleAnswer(userAnswer) {
    if (!questionActive) return;
    questionActive = false;
    cancelAnimationFrame(animationFrameId);
    
    const q = questions[currentQuestionIndex];
    let explanationHTML = `<div class="explanation">${q.explanation}</div>`;
    
    if (userAnswer === null) {
        // Missed (telat) -> "Salah" notification but game continues
        showNotification(`Telat!<br>Salah${explanationHTML}`, "notif-salah", 4000);
    } else if (userAnswer === q.answer) {
        // Correct
        score += 20;
        updateScoreDisplay();
        showNotification(`Benar!${explanationHTML}`, "notif-benar", 4000);
    } else {
        // Wrong
        showNotification(`Salah!${explanationHTML}`, "notif-salah", 4000);
    }
    
    currentQuestionIndex++;
    
    // Hide question off-screen
    questionEl.style.transform = `translateX(-200vw)`;
    
    setTimeout(() => {
        if(timeRemaining > 0) {
            startQuestion();
        }
    }, 4300);
}

function showNotification(text, className, duration = 1200) {
    notifText.innerHTML = text;
    notifEl.className = `notification show ${className}`;
    setTimeout(() => {
        notifEl.className = 'notification hidden';
    }, duration);
}

function endGame(msg) {
    questionActive = false;
    cancelAnimationFrame(animationFrameId);
    clearInterval(gameTimerInterval);
    
    questionEl.innerHTML = `${msg}<br>Skor Akhir: ${score}`;
    questionEl.style.transform = `translateX(50vw) translateX(-50%)`;
    
    btnBenar.style.display = 'none';
    btnSalah.style.display = 'none';
    
    // Restart button
    setTimeout(() => {
        const restartBtn = document.createElement('button');
        restartBtn.className = 'btn btn-benar';
        restartBtn.innerText = 'Main Lagi';
        restartBtn.onclick = () => location.reload();
        document.querySelector('.controls').appendChild(restartBtn);
    }, 2000);
}

// Event Listeners
btnBenar.addEventListener('click', () => handleAnswer(true));
btnSalah.addEventListener('click', () => handleAnswer(false));

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

// Start game on load
window.addEventListener('load', () => {
    initGame();
});
