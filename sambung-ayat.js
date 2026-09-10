// SOAL-SOAL SAMBUNG KATA (HADITS / AYAT)
const questions = [
    { 
        title: "🧹 Kebersihan (Kebersihan sebagian dari iman)", 
        words: ["النَّظَافَةُ", "مِنَ", "الْإِيمَانِ"] 
    },
    { 
        title: "🤝 Amanah (Sampaikanlah amanah kepada yang mempercayaimu)", 
        words: ["أَدِّ", "الْأَمَانَةَ", "إِلَى", "مَنْ", "ائْتَمَنَكَ"] 
    },
    { 
        title: "🕊️ Sabar (Sesungguhnya bersama kesulitan ada kemudahan)", 
        words: ["إِنَّ", "مَعَ", "الْعُسْرِ", "يُسْرًا"] 
    },
    { 
        title: "💛 Ikhlas (Sesungguhnya amal tergantung niatnya)", 
        words: ["إِنَّمَا", "الْأَعْمَالُ", "بِالنِّيَّاتِ"] 
    },
    { 
        title: "🙏 Rendah Hati (Siapa merendahkan diri karena Allah, Allah meninggikannya)", 
        words: ["مَنْ", "تَوَاضَعَ", "لِلَّهِ", "رَفَعَهُ"] 
    }
];

let matchedBoxes = {}; // format: "qIndex-wordIndex": "word"
let draggedOption = null;

let bgmStarted = false;
const bgMusic = new Audio('bgm.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.2;

const correctSound = new Audio('correct.mp3');
const wrongSound = new Audio('wrong.mp3');

function checkBGM() {
    if (!bgmStarted) {
        bgMusic.play().catch(e => console.log(e));
        bgmStarted = true;
    }
}
document.addEventListener('click', checkBGM);

const colors = ['bg-red', 'bg-orange', 'bg-green', 'bg-pink', 'bg-blue', 'bg-teal', 'bg-purple', 'bg-yellow'];

function initGame() {
    matchedBoxes = {};
    document.getElementById('score-popup').style.display = 'none';
    document.getElementById('submit-btn').style.display = 'inline-block';
    
    // Render Pool
    const pool = document.getElementById('options-pool');
    pool.innerHTML = '';
    
    // Extract all words for the pool
    let optionsPool = [];
    questions.forEach(q => {
        optionsPool = optionsPool.concat(q.words);
    });
    
    // Shuffle options
    let shuffledOptions = [...optionsPool].sort(() => Math.random() - 0.5);
    
    shuffledOptions.forEach((opt, idx) => {
        let el = document.createElement('div');
        el.className = `matchup-draggable ${colors[idx % colors.length]}`;
        el.innerText = opt;
        el.draggable = true;
        el.id = `opt-${idx}`;
        el.ondragstart = (e) => handleDragStart(e, opt);
        pool.appendChild(el);
    });

    // Render Targets
    const targets = document.getElementById('targets-container');
    targets.innerHTML = '';
    
    questions.forEach((q, qIdx) => {
        let row = document.createElement('div');
        row.className = 'matchup-row-multi';
        
        let qText = document.createElement('div');
        qText.className = 'matchup-question-text';
        qText.innerText = q.title;
        row.appendChild(qText);
        
        let boxesContainer = document.createElement('div');
        boxesContainer.className = 'matchup-boxes-container';
        
        q.words.forEach((w, wIdx) => {
            let box = document.createElement('div');
            box.className = 'matchup-box';
            box.id = `box-${qIdx}-${wIdx}`;
            box.ondragover = (e) => handleDragOver(e);
            box.ondrop = (e) => handleDropOnBox(e, qIdx, wIdx);
            
            let placeholder = document.createElement('span');
            placeholder.className = 'box-placeholder';
            placeholder.innerText = '...';
            box.appendChild(placeholder);
            
            boxesContainer.appendChild(box);
        });
        
        let icon = document.createElement('div');
        icon.id = `icon-${qIdx}`;
        icon.className = 'row-icon';
        boxesContainer.appendChild(icon);
        
        row.appendChild(boxesContainer);
        targets.appendChild(row);
    });

    updateSubmitBtn();
}

function handleDragStart(e, value) {
    checkBGM();
    draggedOption = value;
    e.dataTransfer.setData('text/plain', value);
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDropOnBox(e, qIdx, wIdx) {
    e.preventDefault();
    if (draggedOption) {
        matchedBoxes[`${qIdx}-${wIdx}`] = draggedOption;
        renderTargets();
        updateSubmitBtn();
    }
}

function handleDropOnPool(e) {
    e.preventDefault();
    // Cari index mana yang dicabut
    for(let k in matchedBoxes) {
        if(matchedBoxes[k] === draggedOption) {
            delete matchedBoxes[k];
            break;
        }
    }
    renderTargets();
    updateSubmitBtn();
}

function renderTargets() {
    const pool = document.getElementById('options-pool');
    const allDraggables = pool.querySelectorAll('.matchup-draggable');
    
    // Hitung kemunculan kata di matchedBoxes
    let usedCounts = {};
    for(let k in matchedBoxes) {
        let word = matchedBoxes[k];
        usedCounts[word] = (usedCounts[word] || 0) + 1;
    }
    
    // Sembunyikan item di pool sesuai jumlah yang sudah ditarik
    allDraggables.forEach(el => {
        let word = el.innerText;
        if (usedCounts[word] > 0) {
            el.style.display = 'none';
            usedCounts[word]--;
        } else {
            el.style.display = 'block';
        }
    });

    // Check if pool is empty
    let visibleItems = Array.from(allDraggables).filter(el => el.style.display !== 'none');
    if(visibleItems.length === 0) {
        let emptyMsg = pool.querySelector('.pool-empty');
        if(!emptyMsg) {
            let msg = document.createElement('div');
            msg.className = 'pool-empty';
            msg.innerText = 'Semua pilihan telah ditarik';
            pool.appendChild(msg);
        }
    } else {
        let emptyMsg = pool.querySelector('.pool-empty');
        if(emptyMsg) emptyMsg.remove();
    }

    // Render Targets
    questions.forEach((q, qIdx) => {
        q.words.forEach((w, wIdx) => {
            let box = document.getElementById(`box-${qIdx}-${wIdx}`);
            let answer = matchedBoxes[`${qIdx}-${wIdx}`];
            
            box.innerHTML = '';
            if (answer) {
                // Temukan warna asli dari pool (cari elemen pertama yang text-nya sama)
                let originalEl = Array.from(allDraggables).find(el => el.innerText === answer);
                let colorClass = originalEl ? originalEl.className.split(' ').find(c => c.startsWith('bg-')) : 'bg-gray';
                
                let el = document.createElement('div');
                el.className = `matchup-draggable inside-box ${colorClass}`;
                el.innerText = answer;
                el.draggable = true;
                el.ondragstart = (e) => handleDragStart(e, answer);
                
                box.appendChild(el);
                box.style.borderStyle = 'solid';
            } else {
                let placeholder = document.createElement('span');
                placeholder.className = 'box-placeholder';
                placeholder.innerText = '...';
                box.appendChild(placeholder);
                box.style.borderStyle = 'dashed';
                box.className = 'matchup-box';
            }
        });
        
        let icon = document.getElementById(`icon-${qIdx}`);
        icon.className = 'row-icon';
        icon.innerText = '';
    });
}

function updateSubmitBtn() {
    const btn = document.getElementById('submit-btn');
    let totalWords = questions.reduce((sum, q) => sum + q.words.length, 0);
    btn.disabled = Object.keys(matchedBoxes).length < totalWords;
}

function handleSubmit() {
    checkBGM();
    let score = 0;
    
    questions.forEach((q, qIdx) => {
        let allCorrect = true;
        q.words.forEach((w, wIdx) => {
            let box = document.getElementById(`box-${qIdx}-${wIdx}`);
            let userAnswer = matchedBoxes[`${qIdx}-${wIdx}`];
            
            if (userAnswer === w) {
                box.classList.add('correct-box');
            } else {
                box.classList.add('wrong-box');
                allCorrect = false;
            }
        });
        
        let icon = document.getElementById(`icon-${qIdx}`);
        if (allCorrect) {
            score++;
            icon.className = 'row-icon icon-correct';
            icon.innerText = '✓';
        } else {
            icon.className = 'row-icon icon-wrong';
            icon.innerText = '✗';
        }
    });

    if (score === questions.length) {
        correctSound.currentTime = 0;
        correctSound.play().catch(e => console.log(e));
    } else {
        wrongSound.currentTime = 0;
        wrongSound.play().catch(e => console.log(e));
    }

    document.getElementById('final-score').innerText = `Skor: ${score} / ${questions.length}`;
    document.getElementById('score-popup').style.display = 'flex';
    document.getElementById('submit-btn').style.display = 'none';
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
