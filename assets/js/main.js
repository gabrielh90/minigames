// Inițializare aplicație, legături UI, navigație
(function(){
  const frame = document.getElementById('gameFrame');
  const menu = document.getElementById('menu');
  const btnMenu = document.getElementById('btnMenu');
  const btnDaily = document.getElementById('btnDaily');
  const btnConvert = document.getElementById('btnConvert');
  const btnAvatar = document.getElementById('btnAvatar');
  const gameButtons = document.querySelectorAll('[data-game]');

  const shop = document.getElementById('shop');
  const closet = document.getElementById('closet');

  let currentGame = null;

  function updateUIFromState(){
    const st = window.State.get();
    btnDaily && (btnDaily.disabled = !window.Daily.isAvailable(st.lastDailyReward));
    window.UI.updateHeader(st);
  }

  function loadGame(name){
    const title = window.CONFIG.GAMES[name] || name;
    currentGame = name;
    window.UI.showBreadcrumb(title);
    window.UI.toggleViews('game');
    const params = new URLSearchParams({ avatar: window.State.get().avatar, game: name });
    frame.src = `./games/${name}/index.html?${params.toString()}`;
  }

  function showMenu(){
    currentGame = null;
    if(frame){ frame.src = ''; frame.style.display = 'none'; }
    if(menu){ menu.style.display = 'block'; }
    if(shop) shop.style.display = 'none';
    if(closet) closet.style.display = 'none';
    window.UI.showBreadcrumb(null);
  }

  // expunem pentru handlerul din bus (exitToMenu)
  window.showMenu = showMenu;

  // Evenimente UI
  gameButtons.forEach(btn => btn.addEventListener('click', () => loadGame(btn.dataset.game)));
  btnMenu && btnMenu.addEventListener('click', showMenu);

  // Avatar modal
  btnAvatar && btnAvatar.addEventListener('click', ()=> window.AvatarModal?.open());

  btnDaily && btnDaily.addEventListener('click', ()=>{
    const res = window.Daily.claim();
    if(res.ok){ window.UI.showToast(`🎁 +${res.candies} bomboană(e) — recompensa zilnică`); updateUIFromState(); }
    else { window.UI.showToast(res.error || 'Nu disponibil.'); }
  });

  btnConvert && btnConvert.addEventListener('click', ()=>{
    const rate = window.CONFIG.CONVERSION.POINTS_PER_CANDY; const st = window.State.get();
    const max = Math.floor(st.points / rate); if(max <= 0){ window.UI.showToast('Nu ai suficiente puncte pentru conversie.'); return; }
    const want = prompt(`Ai ${st.points} puncte. Rată: ${rate}p = 1 bomboană.\nCâte bomboane vrei să convertești? (max ${max})`);
    const n = Math.floor(Number(want)); if(!Number.isFinite(n) || n <= 0) return;
    const res = window.State.convertPointsToCandies(n);
    if(res.ok){ window.UI.showToast(`↔️ Conversie reușită: -${res.spent}p → +${res.converted}🍬`); updateUIFromState(); }
    else { window.UI.showToast(res.error || 'Conversie eșuată.'); }
  });

  // Init
  updateUIFromState();
  window.UI.toggleViews('menu');
  window.UI.showBreadcrumb(null);
})();