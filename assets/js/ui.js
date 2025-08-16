// UI helperi: scoreboard, breadcrumb, toasts (defensiv dacă lipsesc elementele)
(function(){
  const elPoints = document.getElementById('totalPoints') || null;
  const elCandies = document.getElementById('totalCandies') || null;
  const elToasts = document.getElementById('toasts') || null;
  const elBreadcrumb = document.getElementById('breadcrumb') || null;
  const elMenu = document.getElementById('menu') || null;
  const elFrame = document.getElementById('gameFrame') || null;

  function bump(el){ if(!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  function updateHeader(state){
    if(!state) return;
    if (elPoints) elPoints.textContent = `⭐ Puncte: ${state.points}`;
    if (elCandies) elCandies.textContent = `🍬 Bomboane: ${state.candies}`;
    bump(elPoints); bump(elCandies);
  }

  function showToast(text){
    if(!text || !elToasts) return;
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = text;
    elToasts.appendChild(div);
    setTimeout(()=>{ div.remove(); }, 3000);
  }

  function showBreadcrumb(gameName){
    if(!elBreadcrumb) return;
    if(!gameName){ elBreadcrumb.innerHTML = `<span>Meniu</span>`; return; }
    const safe = String(gameName).replace(/</g,'&lt;');
    elBreadcrumb.innerHTML = `<span>
      <span>Meniu</span> <span class="sep">/</span>
      <span class="current">${safe}</span>
    </span>`;
  }

  function toggleViews(view){
    if(!elMenu || !elFrame) return;
    if(view === 'game'){ elMenu.style.display = 'none'; elFrame.style.display = 'block'; }
    else { elFrame.style.display = 'none'; elMenu.style.display = 'block'; }
  }

  window.UI = { updateHeader, showToast, showBreadcrumb, toggleViews };
})();