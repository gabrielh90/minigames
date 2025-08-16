// ===== Config =====
const START_URL = (document.body && document.body.dataset && document.body.dataset.startUrl) || '/';

// Stare locală (în iframe)
const App = {
  points: 0,
  candies: 0,
  addPoints(n = 1) { this.points += n; UI.updateHeader(); syncToParent('addPoints', n); },
  addCandies(n = 1) { this.candies += n; UI.updateHeader(); syncToParent('addCandies', n); }
};

function syncToParent(type, value) {
  if (window.parent && window.parent !== window) {
    try { window.parent.postMessage({ type, value }, '*'); } catch {}
  }
}

const UI = {
  screen: document.getElementById('screen'),
  updateHeader() {
    document.getElementById('totalPoints').textContent = `⭐ Puncte: ${App.points}`;
    document.getElementById('totalCandies').textContent = `🍬 Bomboane: ${App.candies}`;
  },
  clear() { this.screen.innerHTML = ''; }
};

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function Timer(seconds, onTick, onEnd) {
  let remain = seconds;
  const id = setInterval(() => {
    remain--; onTick?.(remain);
    if (remain <= 0) { clearInterval(id); onEnd?.(); }
  }, 1000);
  onTick?.(remain);
  return { stop() { clearInterval(id); } };
}

function startGame() {
  UI.clear();

  const container = document.createElement('div');
  const initialTarget = rand(1, 10);
  container.innerHTML = `
    <div class="toolbar centered">
      <div class="target">Țintă: <strong id="duckTarget">${initialTarget}</strong></div>
      <div class="pill-row">
        <div class="pill" id="duckScore">✅ Corecte: 0 • 🍬 0</div>
        <div class="pill" id="duckTime">⏳ 45</div>
      </div>
    </div>
    <div class="game-area" id="pond"></div>
  `;
  UI.screen.appendChild(container);

  const pond = document.getElementById('pond');

  // Rățușca
  const duck = document.createElement('div');
  duck.className = 'duck';
  duck.textContent = '🦆';
  pond.appendChild(duck);

  let correct = 0, candiesEarned = 0, currentTarget = initialTarget;
  let positions = [];
  const pads = [];
  const padSize = 110;
  let busy = false, ended = false;
  let currentDuckPad = null; // numărul nufărului pe care se află rața (sau null=centru)

  function pondRect() {
    return { w: pond.clientWidth, h: pond.clientHeight };
  }
  function center() {
    const { w, h } = pondRect();
    return { x: Math.round(w / 2), y: Math.round(h / 2) };
  }
  function computeCirclePositions(count = 10) {
    const { w, h } = pondRect();
    const c = center();
    const margin = 24;
    const radius = Math.max(120, Math.min(w, h) / 2 - padSize / 2 - margin);
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // începe sus
      list.push({
        x: Math.round(c.x + radius * Math.cos(angle)),
        y: Math.round(c.y + radius * Math.sin(angle))
      });
    }
    return list;
  }
  function moveDuckTo(x, y, bounce = true) {
    duck.style.left = `${x}px`;
    duck.style.top = `${y}px`;
    if (bounce) {
      duck.classList.remove('jump');
      duck.offsetHeight; // reflow pentru a re-triggera animația
      duck.classList.add('jump');
    }
    const splash = document.createElement('div');
    splash.className = 'splash';
    splash.style.left = `${x - 6}px`;
    splash.style.top = `${y - 6}px`;
    pond.appendChild(splash);
    setTimeout(() => splash.remove(), 600);
  }
  function padCenter(pad) {
    return {
      x: parseInt(pad.style.left, 10) + padSize / 2,
      y: parseInt(pad.style.top, 10) + padSize / 2
    };
  }
  function setTarget(t) {
    currentTarget = t;
    document.getElementById('duckTarget').textContent = t;
  }
  function newTarget() {
    let t;
    do { t = rand(1, 10); } while (t === currentTarget);
    setTarget(t);
  }
  function updateScore() {
    document.getElementById('duckScore').textContent = `✅ Corecte: ${correct} • 🍬 ${candiesEarned}`;
  }

  function onPadClick(pad) {
    if (busy || ended) return;
    busy = true;

    const chosen = Number(pad.dataset.number);
    const { x, y } = padCenter(pad);

    if (chosen === currentTarget) {
      // corect: sare pe nufăr + adună la totalul din header
      App.addPoints(1);
      App.addCandies(1);
      correct++; candiesEarned++;
      currentDuckPad = chosen;
      moveDuckTo(x, y, true);
      updateScore();
      newTarget();
      busy = false;
    } else {
      // greșit: rață + nufăr cad în gol
      endWithFall(pad);
    }
  }

  // === Plasează nuferii în cerc, DAR cu numere random ===
  function placePads() {
    positions = computeCirclePositions(10);
    const numbers = shuffle(Array.from({ length: 10 }, (_, i) => i + 1)); // <-- random!
    numbers.forEach((n, i) => {
      const pos = positions[i];
      const pad = document.createElement('div');
      pad.className = 'lily-pad';
      pad.textContent = n;
      pad.dataset.number = n;
      pad.style.left = (pos.x - padSize / 2) + 'px';
      pad.style.top = (pos.y - padSize / 2) + 'px';
      pad.addEventListener('click', () => onPadClick(pad));
      pond.appendChild(pad);
      pads.push(pad);
    });
  }

  function endWithFall(pad) {
    ended = true;
    tmr.stop();

    const { x, y } = padCenter(pad);
    // adu rața pe nufărul greșit, apoi dă drumul în jos
    moveDuckTo(x, y, false);
    setTimeout(() => {
      pad.classList.add('fall');
      duck.classList.add('fall');
      setTimeout(() => showEndScreen('fail'), 900);
    }, 150);
  }

  function showEndScreen(mode /* 'fail' | 'time' */) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';

    const isTime = mode === 'time';
    const title = isTime ? 'Felicitări!' : 'Ai pierdut';
    const actions = isTime
      ? `<button class="btn ghost" id="btnMenu">Meniu</button>`
      : `<button class="btn ghost" id="btnMenu">Meniu</button>
         <button class="btn primary" id="btnRetry">Reîncearcă</button>`;

    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title ${isTime ? 'success' : ''}">${title}</div>
        <div class="modal-body">
          <div>⭐ Puncte câștigate: <strong>${correct}</strong></div>
          <div>🍬 Bomboane câștigate: <strong>${candiesEarned}</strong></div>
        </div>
        <div class="modal-actions">
          ${actions}
        </div>
      </div>
    `;
    UI.screen.appendChild(overlay);

    document.getElementById('btnMenu').addEventListener('click', goToMenu);
    const retry = document.getElementById('btnRetry');
    if (retry) retry.addEventListener('click', () => startGame());
  }

  function goToMenu() {
    // 1) anunță parent (dacă e într-un iframe)
    if (window.parent && window.parent !== window) {
      try { window.parent.postMessage({ type: 'menu', href: START_URL }, '*'); } catch {}
    }
    // 2) încearcă să navighezi top-level
    try { window.top.location.href = START_URL; return; } catch {}
    // 3) fallback: navighează în aceeași fereastră
    try { window.location.href = START_URL; } catch {}
  }

  // Layout inițial
  placePads();

  // pune rața în centru la start
  const c = center();
  moveDuckTo(c.x, c.y, false);

  // timer
  const tmr = Timer(45, (r) => {
    const el = document.getElementById('duckTime');
    if (el) el.textContent = `⏳ ${r}`;
  }, () => {
    if (!ended) {
      ended = true;
      showEndScreen('time'); // <-- Felicitări + fără „Reîncearcă”
    }
  });

  // re-layout pe resize
  let resizeId = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeId);
    resizeId = setTimeout(() => {
      const newPositions = computeCirclePositions(10);
      positions = newPositions;
      pads.forEach((pad, i) => {
        const pos = positions[i];
        pad.style.left = (pos.x - padSize / 2) + 'px';
        pad.style.top = (pos.y - padSize / 2) + 'px';
      });
      // repoziționează rața
      if (currentDuckPad) {
        const pad = pads.find(p => Number(p.dataset.number) === currentDuckPad);
        if (pad) {
          const { x, y } = padCenter(pad);
          moveDuckTo(x, y, false);
        }
      } else {
        const c = center();
        moveDuckTo(c.x, c.y, false);
      }
    }, 100);
  });

  // curățare la ieșire din pagină
  window.addEventListener('beforeunload', () => tmr.stop());
}

document.addEventListener('DOMContentLoaded', startGame);
