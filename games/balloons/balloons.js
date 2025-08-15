const App = {
  points: 0,
  candies: 0,
  addPoints(n=1){ this.points += n; UI.updateHeader(); },
  addCandies(n=1){ this.candies += n; UI.updateHeader(); }
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
  const target = rand(0,9);
  wrap.innerHTML = `
    <div class="toolbar centered">
      <div class="target">Țintă: <strong id="balloonTarget">${target}</strong></div>
      <div class="pill-row">
        <div class="pill" id="balloonScore">🎯 Scor: 0</div>
        <div class="pill" id="balloonTime">⏳ 45</div>
      </div>
    </div>
    <div class="game-area" id="sky"></div>
  `;
  UI.screen.appendChild(wrap);

  const sky = document.getElementById('sky');
  let score = 0, currentTarget = target;

  function spawnBalloon(){
    const b = document.createElement('div');
    b.className = 'balloon';
    const val = rand(0,9);
    b.textContent = val;
    const x = rand(10, Math.max(10, sky.clientWidth - 98));
    b.style.left = x + 'px';
    b.style.bottom = '-80px';
    sky.appendChild(b);

    const speed = rand(80, 120); // pixels/sec
    let y = -80; let alive = true;

    function step(){
      y += speed/60;
      b.style.bottom = y + 'px';
      if(y > sky.clientHeight + 120){
        alive = false;
        b.remove();
        return;
      }
      if(alive) requestAnimationFrame(step);
    }

    b.addEventListener('click', ()=>{
      if(val === currentTarget){
        score++;
        App.addPoints(1);
        App.addCandies(1);
        wrap.querySelector('#balloonScore').textContent = `🎯 Scor: ${score}`;
      }
      b.classList.add('pop');
      setTimeout(()=> b.remove(), 180);
    });

    requestAnimationFrame(step);
  }

  function newTarget(){
    let t;
    do { t = rand(0,9); } while(t === currentTarget);
    currentTarget = t;
    wrap.querySelector('#balloonTarget').textContent = t;
  }

  const maker = setInterval(spawnBalloon, 700);
  const rot = setInterval(newTarget, 10000);

  const tmr = Timer(45, (r)=> wrap.querySelector('#balloonTime').textContent = `⏳ ${r}`, ()=>{
    clearInterval(maker);
    clearInterval(rot);
    alert(`Gata! Scor final: ${score}`);
  });
}

startGame();
