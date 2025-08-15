// Mic „state” local pentru puncte/bomboane în această pagină
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

function rand(min, max){ return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr){ return arr.sort(()=> Math.random()-0.5); }

function Timer(seconds, onTick, onEnd){
  let remain = seconds;
  let id = null;
  const tick = () => {
    remain--;
    onTick?.(remain);
    if(remain <= 0){
      clearInterval(id);
      onEnd?.();
    }
  };
  onTick?.(remain);
  id = setInterval(tick, 1000);
  return { stop(){ clearInterval(id); } };
}

function startGame(){
  UI.clear();

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div class="toolbar">
      <div class="pill" id="mathProgress">Întrebări: 0/10</div>
      <div class="pill" id="mathTime">⏳ 60</div>
      <div class="pill" id="mathStreak">⚡ Streak: 0</div>
      <div class="actions">
        <button class="btn secondary" id="btnReset">Reset scor</button>
      </div>
    </div>
    <div class="math-wrap">
      <div>
        <div class="equation" id="equation">1 + 1 = ?</div>
        <div class="answers" id="answers"></div>
      </div>
    </div>
  `;
  UI.screen.appendChild(wrap);

  let total = 0, correct = 0, streak = 0;
  let currentAns = null;
  let finished = false;

  function newQuestion(){
    if(finished) return;
    total++; 
    if(total > 10){ end(); return; }

    const op = Math.random() < .5 ? '+' : '-';
    let a = rand(1,10), b = rand(1,10);

    // Pentru scădere evităm rezultate negative
    if(op === '-' && a < b) [a,b] = [b,a];

    let result = op === '+' ? a + b : a - b;

    // Păstrăm rezultatele între 0..10; dacă nu, refacem întrebarea
    if(result < 0 || result > 10){
      total--; // anulăm incrementul și refacem
      return newQuestion();
    }

    document.getElementById('equation').textContent = `${a} ${op} ${b} = ?`;
    currentAns = result;

    const answers = document.getElementById('answers');
    answers.innerHTML = '';
    const options = new Set([result]);
    while(options.size < 6){ options.add(rand(0,10)); }

    shuffle([...options]).forEach(v=>{
      const btn = document.createElement('button');
      btn.textContent = v;
      btn.addEventListener('click', ()=> pick(v));
      answers.appendChild(btn);
    });

    updateBars();
  }

  function pick(v){
    if(finished) return;
    if(v === currentAns){
      correct++;
      streak++;
      App.addCandies(1);    // 1 bomboană / răspuns corect
      App.addPoints(1);     // 1 punct / răspuns corect
    } else {
      streak = 0;
    }
    newQuestion();
  }

  function updateBars(){
    document.getElementById('mathProgress').textContent = `Întrebări: ${Math.min(total,10)}/10`;
    document.getElementById('mathStreak').textContent   = `⚡ Streak: ${streak}`;
  }

  function end(){
    if(finished) return;
    finished = true;
    alert(`Bravo! Ai răspuns corect la ${correct} din 10. Ai primit ${correct} bomboane.`);
  }

  const tmr = Timer(
    60,
    (r)=> document.getElementById('mathTime').textContent = `⏳ ${r}`,
    ()=> end()
  );

  document.getElementById('btnReset').addEventListener('click', ()=>{
    App.reset();
  });

  UI.updateHeader();
  newQuestion();
}

startGame();
