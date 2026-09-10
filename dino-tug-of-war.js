// SOAL-SOAL DINO TUG OF WAR
// Anda dapat mengubah, menambah, atau menghapus soal di bawah ini
const questions = [
    {
      question: "Melihat sampah di halaman sekolah. Sikapmu…",
      options: [
        "Lewat saja",
        "Ambil & buang ke tempat sampah",
        "Suruh teman lain ambil",
        "Biarkan petugas kebersihan"
      ],
      answer: "Ambil & buang ke tempat sampah"
    },
    {
      question: "Menemukan dompet di jalan, tidak ada yang melihat. Tindakanmu…",
      options: [
        "Ambil sendiri",
        "Serahkan ke pengurus / cari pemiliknya",
        "Tunggu sebentar lalu bawa pulang",
        "Ambil uangnya saja"
      ],
      answer: "Serahkan ke pengurus / cari pemiliknya"
    },
    {
      question: "Teman berbuat salah kepadamu dan meminta maaf. Sikapmu…",
      options: [
        "Marah dan tidak mau bicara",
        "Memaafkan dengan tulus",
        "Membalas kesalahannya",
        "Ceritakan ke semua teman"
      ],
      answer: "Memaafkan dengan tulus"
    },
    {
      question: "Saat wudhu keran masih mengalir deras. Tindakanmu…",
      options: [
        "Biarkan saja",
        "Tutup keran setelah digunakan",
        "Pakai air sepuasnya",
        "Biarkan sampai selesai wudhu"
      ],
      answer: "Tutup keran setelah digunakan"
    },
    {
      question: "Sudah berjanji menolong teman, tiba-tiba diajak bermain. Keputusanmu…",
      options: [
        "Langsung pergi bermain",
        "Ingkari janji",
        "Tetap menepati janji menolong teman",
        "Bilang nanti saja"
      ],
      answer: "Tetap menepati janji menolong teman"
    }
  ];

  // GAME LOGIC
  let scoreA = 50;
  let scoreB = 50;
  let qIndexA = 0;
  let qIndexB = 0;
  let winner = null;

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

  const questionAEl = document.getElementById('question-a');
  const questionBEl = document.getElementById('question-b');
  const answersAEl = document.getElementById('answers-a');
  const answersBEl = document.getElementById('answers-b');
  const scoreText = document.getElementById('score-text');
  const ropeCenter = document.getElementById('rope-center');
  const dinoA = document.getElementById('dino-a');
  const dinoB = document.getElementById('dino-b');
  const winnerOverlay = document.getElementById('winner-overlay');
  const winnerText = document.getElementById('winner-text');

  function initGame() {
      scoreA = 50;
      scoreB = 50;
      qIndexA = 0;
      qIndexB = 0;
      winner = null;
      winnerOverlay.style.display = 'none';
      updateUI();
  }

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

  function updateUI() {
      // Update score text and positions
      scoreText.innerText = `| ${scoreA}% - ${scoreB}% |`;
      ropeCenter.style.left = `${scoreA}%`;
      dinoA.style.left = `calc(${scoreA}% - 25%)`;
      dinoB.style.left = `calc(${scoreA}% + 25%)`;

      // Update Question A
      const currentQA = questions[qIndexA % questions.length];
      questionAEl.innerText = currentQA.question;
      answersAEl.innerHTML = '';
      currentQA.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'answer-btn';
          btn.innerText = opt;
          btn.onclick = () => handleAnswerA(opt, currentQA.answer);
          answersAEl.appendChild(btn);
      });

      // Update Question B
      const currentQB = questions[qIndexB % questions.length];
      questionBEl.innerText = currentQB.question;
      answersBEl.innerHTML = '';
      currentQB.options.forEach(opt => {
          const btn = document.createElement('button');
          btn.className = 'answer-btn';
          btn.innerText = opt;
          btn.onclick = () => handleAnswerB(opt, currentQB.answer);
          answersBEl.appendChild(btn);
      });
  }

  function checkWinner() {
      if (scoreA >= 85) {
          winner = 'TIM A';
      } else if (scoreA <= 15) {
          winner = 'TIM B';
      }

      if (winner) {
          winnerText.innerHTML = `🎉 <span class="${winner === 'TIM A' ? 'team-a-wins' : 'team-b-wins'}">${winner}</span> MENANG! 🎉`;
          winnerOverlay.style.display = 'flex';
      }
  }

  function handleAnswerA(selected, correct) {
      checkBGM();
      if (selected === correct) {
          correctSound.currentTime = 0;
          correctSound.play().catch(e => console.log(e));
          scoreA = Math.min(100, scoreA + 5);
          scoreB = Math.max(0, scoreB - 5);
      } else {
          wrongSound.currentTime = 0;
          wrongSound.play().catch(e => console.log(e));
      }
      qIndexA++;
      checkWinner();
      if (!winner) updateUI();
  }

  function handleAnswerB(selected, correct) {
      checkBGM();
      if (selected === correct) {
          correctSound.currentTime = 0;
          correctSound.play().catch(e => console.log(e));
          scoreB = Math.min(100, scoreB + 5);
          scoreA = Math.max(0, scoreA - 5);
      } else {
          wrongSound.currentTime = 0;
          wrongSound.play().catch(e => console.log(e));
      }
      qIndexB++;
      checkWinner();
      if (!winner) updateUI();
  }

  function resetGame() {
      initGame();
  }

  // Start the game
  window.addEventListener('load', initGame);
