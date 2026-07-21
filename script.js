/* =========================================================
   UTIL
   ========================================================= */
function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* =========================================================
   CONFETTI (lightweight, no external library)
   ========================================================= */
const confettiCanvas = document.getElementById('confetti-canvas');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function resizeCanvas(){
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const CONFETTI_COLORS = ['#c9a227', '#f3d97f', '#d1465f', '#f5efe0', '#1c7a55'];

function burstConfetti(count = 90){
  for(let i = 0; i < count; i++){
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * 200,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 6,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rot: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.2,
      life: 0
    });
  }
  if(!confettiRunning) runConfetti();
}

let confettiRunning = false;
function runConfetti(){
  confettiRunning = true;
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    p.x += p.speedX;
    p.y += p.speedY;
    p.rot += p.rotSpeed;
    p.life++;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  });
  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 40 && p.life < 500);
  if(confettiPieces.length > 0){
    requestAnimationFrame(runConfetti);
  } else {
    confettiRunning = false;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  }
}

// welcome burst
window.addEventListener('load', () => setTimeout(() => burstConfetti(70), 500));

/* =========================================================
   AMBIENT FALLING SUITS (continuous background life)
   ========================================================= */
(function ambientSuits(){
  const layer = document.createElement('div');
  layer.className = 'ambient-suits';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const SUITS = ['♠', '♥', '♦', '♣'];
  const MAX_ON_SCREEN = 10;

  function spawn(){
    if(layer.children.length >= MAX_ON_SCREEN) return;
    const el = document.createElement('span');
    el.className = 'ambient-suit';
    el.textContent = SUITS[Math.floor(Math.random() * SUITS.length)];
    const left = Math.random() * 100;
    const duration = 9 + Math.random() * 9;
    const size = 14 + Math.random() * 20;
    el.style.left = left + 'vw';
    el.style.fontSize = size + 'px';
    el.style.animationDuration = duration + 's';
    layer.appendChild(el);
    setTimeout(() => el.remove(), duration * 1000 + 200);
  }

  setInterval(spawn, 1400);
  spawn();
})();

/* =========================================================
   SPARKLE CURSOR TRAIL (desktop only, throttled)
   ========================================================= */
(function sparkleTrail(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  let last = 0;
  window.addEventListener('mousemove', e => {
    const now = Date.now();
    if(now - last < 55) return;
    last = now;
    const dot = document.createElement('div');
    dot.className = 'sparkle-dot';
    dot.style.left = (e.clientX - 3) + 'px';
    dot.style.top = (e.clientY - 3) + 'px';
    document.body.appendChild(dot);
    setTimeout(() => dot.remove(), 720);
  });
})();

/* =========================================================
   SCROLL REVEAL
   ========================================================= */
(function scrollReveal(){
  const targets = document.querySelectorAll('.reveal, .reveal-stagger');
  if(!('IntersectionObserver' in window) || !targets.length){
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  targets.forEach(t => io.observe(t));
})();

/* =========================================================
   3D TILT ON HERO CARD + WISH CARDS
   ========================================================= */
(function tilt(){
  const els = document.querySelectorAll('.hero-card, .wish-card');
  els.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty('--tiltX', (py * -8).toFixed(2) + 'deg');
      el.style.setProperty('--tiltY', (px * 8).toFixed(2) + 'deg');
      el.style.transform = `rotate(${el === document.querySelector('.hero-card') ? '-4deg' : '0deg'}) rotateX(var(--tiltX)) rotateY(var(--tiltY))`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
})();

/* =========================================================
   WISH CARDS — tap to open on touch devices
   ========================================================= */
document.querySelectorAll('.wish-card').forEach(card => {
  card.addEventListener('click', () => {
    if(window.matchMedia('(pointer: coarse)').matches){
      card.classList.toggle('is-open');
    }
  });
});

/* =========================================================
   GAME NAVIGATION (tiles -> panels)
   ========================================================= */
const tiles = document.querySelectorAll('.game-tile');
const panels = document.querySelectorAll('.game-panel');

tiles.forEach(tile => {
  tile.addEventListener('click', () => {
    const targetId = tile.dataset.target;
    const alreadyOpen = document.getElementById(targetId).classList.contains('open');

    panels.forEach(p => p.classList.remove('open'));
    tiles.forEach(t => t.classList.remove('active'));

    if(!alreadyOpen){
      document.getElementById(targetId).classList.add('open');
      tile.classList.add('active');
      document.getElementById(targetId).scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});

/* =========================================================
   DECK HELPERS (shared by blackjack + poker)
   ========================================================= */
const SUIT_DEFS = [
  { s: '♠', c: 'black' },
  { s: '♥', c: 'red' },
  { s: '♦', c: 'red' },
  { s: '♣', c: 'black' }
];
const RANKS = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

function freshDeck(){
  const deck = [];
  SUIT_DEFS.forEach(su => {
    RANKS.forEach(r => deck.push({ rank: r, suit: su.s, color: su.c }));
  });
  return shuffle(deck);
}

function renderCard(card, extraClass = ''){
  return `<div class="playing-card ${card.color} ${extraClass}">
    <span>${card.rank}</span>
    <span class="pc-suit-big">${card.suit}</span>
    <span style="align-self:flex-end;">${card.rank}</span>
  </div>`;
}

function renderBack(extraClass = ''){
  return `<div class="playing-card back ${extraClass}"></div>`;
}

/* =========================================================
   GAME 1 — BLACKJACK "ОЧКО 52"
   ========================================================= */
(function blackjackGame(){
  const dealBtn = document.getElementById('bj-deal');
  const hitBtn = document.getElementById('bj-hit');
  const standBtn = document.getElementById('bj-stand');
  const statusEl = document.getElementById('bj-status');
  const winsEl = document.getElementById('bj-wins');
  const dealerHandEl = document.getElementById('bj-dealer-hand');
  const playerHandEl = document.getElementById('bj-player-hand');
  const dealerScoreEl = document.getElementById('bj-dealer-score');
  const playerScoreEl = document.getElementById('bj-player-score');
  const resultEl = document.getElementById('bj-result');

  if(!dealBtn) return;

  let deck = [];
  let dealerHand = [];
  let playerHand = [];
  let wins = 0;
  let over = true;
  let hideDealerHole = true;

  function bjValue(hand){
    let total = 0, aces = 0;
    hand.forEach(c => {
      if(c.rank === 'A'){ total += 11; aces++; }
      else if(['J','Q','K'].includes(c.rank)) total += 10;
      else total += Number(c.rank);
    });
    while(total > 21 && aces > 0){ total -= 10; aces--; }
    return total;
  }

  function draw(){
    if(deck.length === 0) deck = freshDeck();
    return deck.pop();
  }

  function render(){
    dealerHandEl.innerHTML = dealerHand.map((c, i) =>
      (i === 1 && hideDealerHole) ? renderBack() : renderCard(c)
    ).join('');
    playerHandEl.innerHTML = playerHand.map(c => renderCard(c)).join('');
    playerScoreEl.textContent = `(${bjValue(playerHand)})`;
    dealerScoreEl.textContent = hideDealerHole ? '' : `(${bjValue(dealerHand)})`;
  }

  function deal(){
    deck = freshDeck();
    dealerHand = [draw(), draw()];
    playerHand = [draw(), draw()];
    hideDealerHole = true;
    over = false;
    resultEl.hidden = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    statusEl.textContent = 'Твой ход — бери карту или остановись';
    render();

    if(bjValue(playerHand) === 21){
      finish('player-blackjack');
    }
  }

  function hit(){
    if(over) return;
    playerHand.push(draw());
    render();
    const val = bjValue(playerHand);
    if(val > 21) finish('dealer');
    else if(val === 21) finish('player-blackjack');
  }

  function dealerPlay(){
    hideDealerHole = false;
    while(bjValue(dealerHand) < 17){
      dealerHand.push(draw());
    }
    render();
    const playerVal = bjValue(playerHand);
    const dealerVal = bjValue(dealerHand);
    if(dealerVal > 21 || playerVal > dealerVal) finish('player');
    else if(dealerVal > playerVal) finish('dealer');
    else finish('push');
  }

  function stand(){
    if(over) return;
    statusEl.textContent = 'Стол открывает карты…';
    hitBtn.disabled = true;
    standBtn.disabled = true;
    setTimeout(dealerPlay, 500);
  }

  function finish(result){
    over = true;
    hideDealerHole = result === 'push' || result === 'player' || result === 'dealer' ? false : hideDealerHole;
    if(result === 'player-blackjack'){
      hideDealerHole = false;
      dealerPlay_final: {
        // reveal dealer without extra draws if player already has natural 21 with 2 cards
      }
    }
    hitBtn.disabled = true;
    standBtn.disabled = true;
    render();
    resultEl.hidden = false;

    if(result === 'player-blackjack'){
      wins++;
      winsEl.textContent = wins;
      resultEl.textContent = '🎉 Очко! Ровно 21 — идеальная раздача в честь 52-летия!';
      statusEl.textContent = 'Ты выиграл раздачу';
      burstConfetti(110);
    } else if(result === 'player'){
      wins++;
      winsEl.textContent = wins;
      resultEl.textContent = `🎉 Победа! У тебя ${bjValue(playerHand)}, у стола ${bjValue(dealerHand)}.`;
      statusEl.textContent = 'Ты выиграл раздачу';
      burstConfetti(90);
    } else if(result === 'dealer'){
      const bust = bjValue(playerHand) > 21;
      resultEl.textContent = bust
        ? `Перебор — у тебя ${bjValue(playerHand)}. Стол берёт эту раздачу.`
        : `Стол выиграл: ${bjValue(dealerHand)} против твоих ${bjValue(playerHand)}.`;
      statusEl.textContent = 'Стол выиграл. Реванш?';
    } else {
      resultEl.textContent = `Ничья! У обоих по ${bjValue(playerHand)}.`;
      statusEl.textContent = 'Ничья';
    }
  }

  dealBtn.addEventListener('click', deal);
  hitBtn.addEventListener('click', hit);
  standBtn.addEventListener('click', stand);

  deal();
})();

/* =========================================================
   GAME 2 — QUIZ
   ========================================================= */
(function quizGame(){
  const box = document.getElementById('quiz-box');
  if(!box) return;

  // EDIT ME: personalise these questions about your dad
  const QUESTIONS = [
    {
      q: 'Сколько лет папе исполняется в этот день рождения?',
      options: ['50', '51', '52', '55'],
      correct: 2
    },
    {
      q: 'Что из этого папа любит больше всего в свободное время?',
      options: ['Рыбалка', 'Сериалы', 'Прогулки', 'Гараж и инструменты'],
      correct: 0
    },
    {
      q: 'Какая масть карт больше похожа на характер папы — сильная и уверенная?',
      options: ['Черви', 'Пики', 'Бубны', 'Трефы'],
      correct: 1
    },
    {
      q: 'Что семья желает папе в первую очередь в этом году?',
      options: ['Здоровья', 'Много подарков', 'Тишины', 'Нового авто'],
      correct: 0
    },
    {
      q: 'Сколько карт в стандартной колоде — как возраст папы?',
      options: ['48', '52', '54', '36'],
      correct: 1
    }
  ];

  let current = 0;
  let score = 0;

  function render(){
    if(current >= QUESTIONS.length){
      box.innerHTML = `
        <p class="quiz-result">Результат: ${score} из ${QUESTIONS.length} 🎉</p>
        <button class="btn-outline" id="quiz-again">Пройти ещё раз</button>`;
      document.getElementById('quiz-again').addEventListener('click', () => {
        current = 0; score = 0; render();
      });
      if(score === QUESTIONS.length) burstConfetti(100);
      return;
    }

    const item = QUESTIONS[current];
    box.innerHTML = `
      <p class="quiz-progress">Вопрос ${current + 1} из ${QUESTIONS.length}</p>
      <p class="quiz-question">${item.q}</p>
      <div class="quiz-options">
        ${item.options.map((opt, i) => `<button class="quiz-option" data-i="${i}">${opt}</button>`).join('')}
      </div>`;

    box.querySelectorAll('.quiz-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        const buttons = box.querySelectorAll('.quiz-option');
        buttons.forEach(b => b.disabled = true);
        if(i === item.correct){
          btn.classList.add('correct');
          score++;
        } else {
          btn.classList.add('wrong');
          buttons[item.correct].classList.add('correct');
        }
        setTimeout(() => { current++; render(); }, 900);
      });
    });
  }

  render();
})();

/* =========================================================
   GAME 3 — POKER HAND (собери лучшую комбинацию)
   ========================================================= */
(function pokerGame(){
  const handEl = document.getElementById('poker-hand');
  const statusEl = document.getElementById('poker-status');
  const dealBtn = document.getElementById('poker-deal');
  const swapBtn = document.getElementById('poker-swap');
  const resultEl = document.getElementById('poker-result');
  if(!handEl) return;

  const RANK_ORDER = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

  let deck = [];
  let hand = [];
  let held = new Set();
  let swapped = false;

  function draw(){
    if(deck.length === 0) deck = freshDeck();
    return deck.pop();
  }

  function evaluate(cards){
    const counts = {};
    cards.forEach(c => counts[c.rank] = (counts[c.rank] || 0) + 1);
    const countValues = Object.values(counts).sort((a, b) => b - a);
    const isFlush = cards.every(c => c.suit === cards[0].suit);

    let idxs = cards.map(c => RANK_ORDER.indexOf(c.rank)).sort((a, b) => a - b);
    let isStraight = idxs.every((v, i) => i === 0 || v === idxs[i - 1] + 1);
    if(!isStraight){
      const lowAce = cards.map(c => c.rank === 'A' ? -1 : RANK_ORDER.indexOf(c.rank)).sort((a, b) => a - b);
      isStraight = lowAce.every((v, i) => i === 0 || v === lowAce[i - 1] + 1);
    }

    if(isStraight && isFlush){
      const hasA = cards.some(c => c.rank === 'A');
      const hasK = cards.some(c => c.rank === 'K');
      if(hasA && hasK) return { name: 'Роял-флеш', rank: 9, msg: '👑 Роял-флеш! Такая раздача бывает раз в жизни — как этот юбилей!' };
      return { name: 'Стрит-флеш', rank: 8, msg: '🔥 Стрит-флеш! Невероятная удача сегодня на твоей стороне.' };
    }
    if(countValues[0] === 4) return { name: 'Каре', rank: 7, msg: '💎 Каре! Четыре одинаковые — сильнейшая рука за столом.' };
    if(countValues[0] === 3 && countValues[1] === 2) return { name: 'Фулл-хаус', rank: 6, msg: '🏆 Фулл-хаус! Полный дом удачи и везения.' };
    if(isFlush) return { name: 'Флеш', rank: 5, msg: '✨ Флеш! Все карты одной масти — стильно, как юбиляр.' };
    if(isStraight) return { name: 'Стрит', rank: 4, msg: '➡️ Стрит! Всё выстроилось по порядку, прямо как этот праздник.' };
    if(countValues[0] === 3) return { name: 'Тройка', rank: 3, msg: '🎯 Тройка! Крепкая рука.' };
    if(countValues[0] === 2 && countValues[1] === 2) return { name: 'Две пары', rank: 2, msg: '👍 Две пары — совсем неплохо!' };
    if(countValues[0] === 2) return { name: 'Пара', rank: 1, msg: 'Пара — уже кое-что для начала раздачи.' };
    return { name: 'Старшая карта', rank: 0, msg: 'Старшая карта — но с днём рождения везёт по-любому! 🥂' };
  }

  function render(){
    handEl.innerHTML = hand.map((c, i) => {
      const isHeld = held.has(i);
      const cls = (isHeld ? 'held ' : '') + (swapped ? '' : 'selectable');
      return renderCard(c, cls).replace('<div class="playing-card', `<div data-i="${i}" class="playing-card`);
    }).join('');

    if(!swapped){
      handEl.querySelectorAll('.playing-card').forEach(el => {
        el.addEventListener('click', () => {
          const i = Number(el.dataset.i);
          if(held.has(i)) held.delete(i); else held.add(i);
          render();
        });
      });
    }
  }

  function deal(){
    deck = freshDeck();
    hand = [draw(), draw(), draw(), draw(), draw()];
    held = new Set();
    swapped = false;
    resultEl.hidden = true;
    swapBtn.disabled = false;
    statusEl.textContent = 'Выбери карты, которые хочешь оставить, затем нажми «Обменять»';
    render();
  }

  function swap(){
    if(swapped) return;
    hand = hand.map((c, i) => held.has(i) ? c : draw());
    swapped = true;
    swapBtn.disabled = true;
    render();

    const result = evaluate(hand);
    statusEl.textContent = `Итоговая комбинация: ${result.name}`;
    resultEl.hidden = false;
    resultEl.textContent = result.msg;
    if(result.rank >= 5) burstConfetti(110);
    else if(result.rank >= 2) burstConfetti(60);
  }

  dealBtn.addEventListener('click', deal);
  swapBtn.addEventListener('click', swap);

  deal();
})();

/* =========================================================
   GAME 4 — TIC-TAC-TOE (player = O gold, table = X red)
   ========================================================= */
(function tictactoe(){
  const boardEl = document.getElementById('ttt-board');
  const statusEl = document.getElementById('ttt-status');
  const restartBtn = document.getElementById('ttt-restart');
  if(!boardEl) return;

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let board = Array(9).fill(null);
  let gameOver = false;
  const PLAYER = 'O'; // heart — the person playing
  const TABLE = 'X';  // the house

  function render(){
    boardEl.innerHTML = '';
    board.forEach((val, i) => {
      const cell = document.createElement('div');
      cell.className = 'ttt-cell' + (val === 'X' ? ' x' : val === 'O' ? ' o' : '');
      cell.textContent = val ? (val === 'X' ? '♠' : '♥') : '';
      cell.addEventListener('click', () => playerMove(i));
      boardEl.appendChild(cell);
    });
  }

  function checkWinner(b){
    for(const line of WIN_LINES){
      const [a,b1,c] = line;
      if(b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if(b.every(v => v)) return 'draw';
    return null;
  }

  function playerMove(i){
    if(gameOver || board[i]) return;
    board[i] = PLAYER;
    render();
    const result = checkWinner(board);
    if(result){ return finish(result); }
    statusEl.textContent = 'Ход стола…';
    setTimeout(tableMove, 450);
  }

  // simple AI: win if possible, block if needed, else strategic spot
  function tableMove(){
    if(gameOver) return;
    let move = findBestMove(TABLE) ?? findBestMove(PLAYER) ?? pickStrategic();
    board[move] = TABLE;
    render();
    const result = checkWinner(board);
    if(result){ return finish(result); }
    statusEl.textContent = 'Твой ход';
  }

  function findBestMove(who){
    for(const line of WIN_LINES){
      const vals = line.map(i => board[i]);
      if(vals.filter(v => v === who).length === 2 && vals.includes(null)){
        return line[vals.indexOf(null)];
      }
    }
    return null;
  }

  function pickStrategic(){
    if(!board[4]) return 4;
    const corners = [0,2,6,8].filter(i => !board[i]);
    if(corners.length) return corners[Math.floor(Math.random() * corners.length)];
    const empties = board.map((v,i) => v ? null : i).filter(v => v !== null);
    return empties[Math.floor(Math.random() * empties.length)];
  }

  function finish(result){
    gameOver = true;
    if(result === 'draw'){
      statusEl.textContent = 'Ничья! Стол и ты сыграли вничью.';
    } else if(result === PLAYER){
      statusEl.textContent = '🎉 Ты обыграл стол!';
      burstConfetti(90);
    } else {
      statusEl.textContent = 'Стол выиграл в этот раз. Реванш?';
    }
  }

  function reset(){
    board = Array(9).fill(null);
    gameOver = false;
    statusEl.textContent = 'Твой ход';
    render();
  }

  restartBtn.addEventListener('click', reset);
  reset();
})();

/* =========================================================
   GAME 5 — GUESS THE LUCKY NUMBER (1–52)
   ========================================================= */
(function guessGame(){
  const input = document.getElementById('guess-input');
  const submitBtn = document.getElementById('guess-submit');
  const restartBtn = document.getElementById('guess-restart');
  const attemptsEl = document.getElementById('guess-attempts');
  const historyEl = document.getElementById('guess-history');
  const hintEl = document.getElementById('guess-hint');
  if(!input) return;

  const MAX_ATTEMPTS = 7;
  let target = 0;
  let attempts = MAX_ATTEMPTS;
  let over = false;

  function start(){
    target = 1 + Math.floor(Math.random() * 52);
    attempts = MAX_ATTEMPTS;
    over = false;
    attemptsEl.textContent = attempts;
    historyEl.innerHTML = '';
    input.value = '';
    input.disabled = false;
    submitBtn.disabled = false;
    hintEl.innerHTML = `Осталось попыток: <b id="guess-attempts">${attempts}</b>`;
  }

  function guess(){
    if(over) return;
    const val = Number(input.value);
    if(!val || val < 1 || val > 52) return;

    attempts--;
    const chip = document.createElement('span');

    if(val === target){
      chip.className = 'guess-chip win';
      chip.textContent = `${val} — угадал! 🎉`;
      historyEl.appendChild(chip);
      hintEl.textContent = `Точно! Счастливое число — ${target}.`;
      over = true;
      input.disabled = true;
      submitBtn.disabled = true;
      burstConfetti(100);
      return;
    }

    chip.className = 'guess-chip ' + (val < target ? 'up' : 'down');
    chip.textContent = `${val} ${val < target ? '↑ больше' : '↓ меньше'}`;
    historyEl.appendChild(chip);

    if(attempts <= 0){
      over = true;
      input.disabled = true;
      submitBtn.disabled = true;
      hintEl.textContent = `Увы, попытки закончились. Число было ${target}.`;
      return;
    }
    document.getElementById('guess-attempts').textContent = attempts;
    input.value = '';
    input.focus();
  }

  submitBtn.addEventListener('click', guess);
  input.addEventListener('keydown', e => { if(e.key === 'Enter') guess(); });
  restartBtn.addEventListener('click', start);

  start();
})();