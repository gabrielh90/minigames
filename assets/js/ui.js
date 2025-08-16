// UI helperi simpli: scoreboard, breadcrumb, toasts
(function(){
  const elPoints = document.getElementById('totalPoints');
  const elCandies = document.getElementById('totalCandies');
  const elToasts = document.getElementById('toasts');
  const elBreadcrumb = document.getElementById('breadcrumb');
  const elMenu = document.getElementById('menu');
  const elFrame = document.getElementById('gameFrame');

  function bump(el){
    if(!el) return;
    el.classList.remove('bump');
    // for reflow
    void el.offsetWidth;
    el.classList.add('bump');
  }

  function updateHeader(state){
    if(!state) return;
    elPoints.textContent = `⭐ Puncte: ${state.points}`;
    elCandies.textContent = `🍬 Bomboane: ${state.candies}`;
    bump(elPoints); bump(elCandies);
  }

  function showToast(text){
    if(!text) return;
    const div = document.createElement('div');
    div.className = 'toast';
    div.textContent = text;
    elToasts.appendChild(div);
    setTimeout(()=>{ div.remove(); }, 3000);
  }

  function showBreadcrumb(gameName){
    if(!gameName){
      elBreadcrumb.innerHTML = `<span>Meniu</span>`;
      return;
    }
    const safe = String(gameName).replace(/</g,'&lt;');
    elBreadcrumb.innerHTML = `<span>\n      <span> Meniu </span> <span class="sep">/</span>\n      <span class="current">${safe}</span>\n    </span>`;
  }

  function toggleViews(view){
    if(view === 'game'){
      elMenu.style.display = 'none';
      elFrame.style.display = 'block';
    } else {
      elFrame.style.display = 'none';
      elMenu.style.display = 'block';
    }
  }

  window.UI = { updateHeader, showToast, showBreadcrumb, toggleViews };
})();