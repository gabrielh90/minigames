// Stat local (independent) pentru puncte/bomboane
const App = {
  points: 0,
  candies: 0,
  addPoints(n=1){ this.points += n; UI.updateHeader(); },
  addCandies(n=1){ this.candies += n; UI.updateHeader(); },
  reset(){ this.points = 0; this.candies = 0; UI.updateHeader(); }
};

const UI = {
  screen: document.getElementById('screen'),
  updateHeader(){
    document.getElementById('totalPoints').textContent = `⭐ Puncte: ${App.points}`;
    document.getElementById('totalCandies').textContent = `🍬 Bomboane: ${App.candies}`;
  },
  clear(){ this.screen.innerHTML = ''; }
};

const rand = (min, max)=> Math.floor(Math.random()*(max-min+1))+min;
const shuffle = arr => arr.sort(()=> Math.random()-0.5);

function startGame(){
  UI.clear();

  const wrap = document.createElement('div');
  const initialTarget = rand(0,20);
  wrap.innerHTML = `
    <div class="toolbar centered">
      <div class="target">Găsește numărul: <strong id="trg">${initialTarget}</strong></div>
      <div class="pill-row">
        <div class="pill" id="tsScore">Scor: 0</div>
        <div class="pill" id="tsRound">Runda: 1/10</div>
      </div>
    </div>
    <div class="grid" id="grid"></div>
  `;
  UI.screen.appendChild(wrap);

  const grid = document.getElementById('grid');
  let currentTarget = initialTarget;
  let score = 0, round = 1;
  let locked = false; // blochează dubla interacțiune pe rundă după alegerea corectă

  function updateBars(){
    wrap.querySelector('#tsScore').textContent = `Scor: ${score}`;
    wrap.querySelector('#tsRound').textContent = `Runda: ${round}/10`;
    wrap.querySelector('#trg').textContent = currentTarget;
  }

  function makeRound(){
    locked = false;
    grid.innerHTML = '';

    // set cu ținta + numere aleatoare până la 12 celule
    const pool = new Set([currentTarget]);
    while(pool.size < 12){ pool.add(rand(0,20)); }
    const cells = shuffle([...pool]);

    cells.forEach(v=>{
      const box = document.createElement('div');
      box.className = 'box';
      box.textContent = v;
      box.dataset.value = String(v);
      box.addEventListener('click', ()=>{
        if(locked) return;
        if(box.dataset.clicked === '1') return;
        box.dataset.clicked = '1';

        const value = Number(box.dataset.value);
        if(value === currentTarget){
          box.textContent = '💎';
          box.classList.add('correct');
          score++;
          App.addPoints(1);
          App.addCandies(1);
          locked = true;
          setTimeout(nextRound, 350);
        } else {
          box.classList.add('wrong');
          box.textContent = '❌';
        }
        updateBars();
      });
      grid.appendChild(box);
    });

    updateBars();
  }

  function nextRound(){
    if(round >= 10){
      alert(`Super! Ai găsit ${score} comori din 10 runde.`);
      return;
    }
    round++;
    // alege o nouă țintă diferită
    let t;
    do { t = rand(0,20); } while(t === currentTarget);
    currentTarget = t;
    makeRound();
  }

  UI.updateHeader();
  makeRound();
}

startGame();
