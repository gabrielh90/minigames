// Stare locală (în iframe)
const App = {
  points: 0,
  candies: 0,
  addPoints(n=1){ this.points += n; UI.updateHeader(); syncToParent('addPoints', n); },
  addCandies(n=1){ this.candies += n; UI.updateHeader(); syncToParent('addCandies', n); }
};

function syncToParent(type, value){
  // trimite scorul către pagina părinte (index.html cu iframe)
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({ type, value }, '*');
  }
}

const UI = {
  screen: document.getElementById('screen'),
  updateHeader(){
    document.getElementById('totalPoints').textContent = `⭐ Puncte: ${App.points}`;
    document.getElementById('totalCandies').textContent = `🍬 Bomboane: ${App.candies}`;
  },
  clear(){ this.screen.innerHTML = ''; }
};

function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr){ return arr.sort(()=> Math.random()-0.5); }

function Timer(seconds, onTick, onEnd){
  let remain = seconds;
  const id = setInterval(()=> {
    remain--; onTick?.(remain);
    if (remain <= 0){ clearInterval(id); onEnd?.(); }
  }, 1000);
  onTick?.(remain);
  return { stop(){ clearInterval(id); } };
}

function startGame(){
  UI.clear();
  const container = document.createElement('div');
  const initialTarget = rand(1,10);
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

  let correct = 0, candiesEarned = 0, currentTarget = initialTarget;
  const pads = [];
  let positions = [];
  const cols = 5, rows = 2, padW = 110, padH = 110;

  function computePositions(){
    const rect = pond.getBoundingClientRect();
    const gapX = (rect.width  - cols*padW) / (cols+1);
    const gapY = (rect.height - rows*padH) / (rows+1);
    const list = [];
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        const x = Math.round(gapX + c*(padW+gapX) + padW/2);
        const y = Math.round(gapY + r*(padH+gapY) + padH/2);
        list.push({x, y});
      }
    }
    return list;
  }

  function placePads(){
    positions = computePositions();
    const numbers = Array.from({length:10}, (_,i)=> i+1);
    numbers.forEach((n, i)=>{
      const pos = positions[i];
      const pad = document.createElement('div');
      pad.className = 'lily-pad';
      pad.textContent = n;
      pad.dataset.number = n;
      pad.style.left = (pos.x - padW/2) + 'px';
      pad.style.top  = (pos.y - padH/2) + 'px';
      pad.addEventListener('click', ()=>{
        const chosen = Number(pad.dataset.number);
        if(chosen === currentTarget){
          correct++; candiesEarned++;
          App.addPoints(1); App.addCandies(1);
          newTarget();
        } else {
          alert("Ai pierdut!");
        }
        update();
      });
      pond.appendChild(pad);
      pads.push(pad);
    });
  }

  function newTarget(){
    let t;
    do { t = rand(1,10); } while(t===currentTarget);
    currentTarget = t;
    document.getElementById('duckTarget').textContent = t;
  }

  function update(){
    document.getElementById('duckScore').textContent = `✅ Corecte: ${correct} • 🍬 ${candiesEarned}`;
  }

  placePads();

  const tmr = Timer(45, (r)=> {
    const el = document.getElementById('duckTime');
    if (el) el.textContent = `⏳ ${r}`;
  }, ()=> alert("Timpul a expirat!"));

  // curățare la ieșire din pagină (de ex. schimbare joc)
  window.addEventListener('beforeunload', ()=> tmr.stop());
}

document.addEventListener('DOMContentLoaded', startGame);
  