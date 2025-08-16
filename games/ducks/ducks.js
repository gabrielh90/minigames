// Ducks game - rulează în iframe și comunică doar cu părintele.
(function () {
  const params = new URLSearchParams(location.search);
  const sourceGame = params.get("game") || "ducks";
  const ORIGIN = location.origin;

  function send(type, payload) {
    try { parent.postMessage({ type, payload, sourceGame }, ORIGIN); } catch {}
  }
  function requestPlayerState() { send("requestPlayerState"); }

  window.addEventListener("message", (e) => {
    if (e.origin !== ORIGIN) return;
    const { type, payload } = e.data || {};
    if (type === "playerState") { /* avatar/equipment available in payload */ }
    if (type === "avatarChanged") { /* update visuals if needed */ }
  });

  const UI = { screen: document.getElementById("screen"), clear(){ this.screen.innerHTML = ""; } };
  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function Timer(s,onTick,onEnd){ let r=s; const id=setInterval(()=>{ r--; onTick?.(r); if(r<=0){ clearInterval(id); onEnd?.(); } },1000); onTick?.(r); return { stop(){ clearInterval(id); } }; }

  function startGame(){
    UI.clear();
    const container = document.createElement("div");
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

    const pond = document.getElementById("pond");
    const duck = document.createElement("div"); duck.className="duck"; duck.textContent="🦆"; pond.appendChild(duck);

    let correct=0, candiesEarned=0, currentTarget=initialTarget; let positions=[], pads=[]; const padSize=110; let busy=false, ended=false; let currentDuckPad=null;

    function pondRect(){ return { w: pond.clientWidth, h: pond.clientHeight }; }
    function center(){ const {w,h}=pondRect(); return { x:Math.round(w/2), y:Math.round(h/2) }; }
    function computeCirclePositions(count=10){ const {w,h}=pondRect(); const c=center(); const margin=24; const radius=Math.max(120, Math.min(w,h)/2 - padSize/2 - margin); const list=[]; for(let i=0;i<count;i++){ const angle=(i/count)*Math.PI*2 - Math.PI/2; list.push({ x:Math.round(c.x+radius*Math.cos(angle)), y:Math.round(c.y+radius*Math.sin(angle)) }); } return list; }
    function moveDuckTo(x,y,bounce=true){ duck.style.left=`${x}px`; duck.style.top=`${y}px`; if(bounce){ duck.classList.remove("jump"); void duck.offsetHeight; duck.classList.add("jump"); } const splash=document.createElement("div"); splash.className="splash"; splash.style.left=`${x-6}px`; splash.style.top=`${y-6}px`; pond.appendChild(splash); setTimeout(()=>splash.remove(),600); }
    function padCenter(p){ return { x: parseInt(p.style.left,10)+padSize/2, y: parseInt(p.style.top,10)+padSize/2 }; }
    function setTarget(t){ currentTarget=t; document.getElementById("duckTarget").textContent=t; }
    function newTarget(){ let t; do{ t=rand(1,10); }while(t===currentTarget); setTarget(t); }
    function updateScore(){ document.getElementById("duckScore").textContent = `✅ Corecte: ${correct} • 🍬 ${candiesEarned}`; }

    function onPadClick(pad){
      if(busy || ended) return; busy=true;
      const chosen=Number(pad.dataset.number); const {x,y}=padCenter(pad);
      if(chosen===currentTarget){
        send("addPoints",  { value:1, reason:"correct_pad" });
        send("addCandies", { value:1, reason:"correct_pad_bonus" });
        correct++; candiesEarned++; currentDuckPad=chosen; moveDuckTo(x,y,true); updateScore(); newTarget(); busy=false;
      } else { endWithFall(pad); }
    }

    function placePads(){ positions=computeCirclePositions(10); const numbers=shuffle(Array.from({length:10},(_,i)=>i+1)); numbers.forEach((n,i)=>{ const pos=positions[i]; const pad=document.createElement("div"); pad.className="lily-pad"; pad.textContent=n; pad.dataset.number=n; pad.style.left=(pos.x-padSize/2)+"px"; pad.style.top=(pos.y-padSize/2)+"px"; pad.addEventListener("click",()=>onPadClick(pad)); pond.appendChild(pad); pads.push(pad); }); }

    function endWithFall(pad){ ended=true; tmr.stop(); const {x,y}=padCenter(pad); moveDuckTo(x,y,false); setTimeout(()=>{ pad.classList.add("fall"); duck.classList.add("fall"); setTimeout(()=>showEndScreen("fail"),900); },150); }

    function showEndScreen(mode){
      send("gameOver", { score: correct, canSafelyExit: true });
      const overlay=document.createElement("div"); overlay.className="overlay";
      let title="Runda încheiată"; if(mode==='fail') title='Ai pierdut'; if(mode==='timeout') title='Timp expirat';
      const actions = `<button class="btn ghost" id="btnMenu">Meniu</button> <button class="btn primary" id="btnRetry">Reîncearcă</button>`;
      overlay.innerHTML = `
        <div class="modal">
          <div class="modal-title ${mode==='summary' ? 'success' : ''}">${title}</div>
          <div class="modal-body">
            <div>⭐ Puncte câștigate: <strong>${correct}</strong></div>
            <div>🍬 Bomboane câștigate: <strong>${candiesEarned}</strong></div>
          </div>
          <div class="modal-actions">${actions}</div>
        </div>`;
      UI.screen.appendChild(overlay);
      document.getElementById("btnMenu").addEventListener("click", ()=> send("exitToMenu"));
      document.getElementById("btnRetry").addEventListener("click", startGame);
    }

    placePads(); const c=center(); moveDuckTo(c.x,c.y,false);
    const tmr = Timer(45, (r)=>{ const el=document.getElementById("duckTime"); if(el) el.textContent=`⏳ ${r}`; }, ()=>{ if(ended) return; ended=true; showEndScreen(correct>0 ? 'summary' : 'timeout'); });

    let resizeId=null; window.addEventListener("resize",()=>{ clearTimeout(resizeId); resizeId=setTimeout(()=>{ const newPos=computeCirclePositions(10); positions=newPos; pads.forEach((pad,i)=>{ const pos=positions[i]; pad.style.left=(pos.x-padSize/2)+"px"; pad.style.top=(pos.y-padSize/2)+"px"; }); if(currentDuckPad){ const pad=pads.find(p=>Number(p.dataset.number)===currentDuckPad); if(pad){ const {x,y}=padCenter(pad); moveDuckTo(x,y,false); } } else { const c=center(); moveDuckTo(c.x,c.y,false); } },100); });

    window.addEventListener("beforeunload", ()=> tmr.stop());
  }

  document.addEventListener("DOMContentLoaded", ()=>{ requestPlayerState(); startGame(); });
})();