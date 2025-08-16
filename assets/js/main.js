// Inițializare aplicație, legături UI, navigație
(function(){
  const frame = document.getElementById('gameFrame');
  const menu = document.getElementById('menu');
  const btnMenu = document.getElementById('btnMenu');
  const btnDaily = document.getElementById('btnDaily');
  const btnConvert = document.getElementById('btnConvert');
  const avatarToggle = document.getElementById('avatarToggle');
  const gameButtons = document.querySelectorAll('[data-game]');

  let currentGame = null;

  function updateUIFromState(){
    const st = window.State.get();
    // avatar buttons
    [...avatarToggle.querySelectorAll('button')].forEach(b => {
      const isActive = b.dataset.avatar === st.avatar;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });
    // daily
    btnDaily.disabled = !window.Daily.isAvailable(st.lastDailyReward);
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
    frame.src = '';
    window.UI.toggleViews('menu');
    window.UI.showBreadcrumb(null);
  }

  // Evenimente UI
  gameButtons.forEach(btn => btn.addEventListener('click', () => loadGame(btn.dataset.game)));
  btnMenu.addEventListener('click', showMenu);

  avatarToggle.addEventListener('click', (e)=>{
    const btn = e.target.closest('button');
    if(!btn) return;
    const avatar = btn.dataset.avatar === 'girl' ? 'girl' : 'boy';
    window.State.setAvatar(avatar);
    updateUIFromState();
    // Anunțăm jocul curent (dacă e deschis)
    if(frame.contentWindow){ window.Bus.sendToGame('avatarChanged', { avatar, equipped: {} }); }
  });

  btnDaily.addEventListener('click', ()=>{
    const res = window.Daily.claim();
    if(res.ok){
      window.UI.showToast(`🎁 +${res.candies} bomboană(e) — recompensa zilnică`);
      updateUIFromState();
    } else {
      window.UI.showToast(res.error || 'Nu disponibil.');
    }
  });

  btnConvert.addEventListener('click', ()=>{
    const rate = window.CONFIG.CONVERSION.POINTS_PER_CANDY;
    const st = window.State.get();
    const max = Math.floor(st.points / rate);
    if(max <= 0){ window.UI.showToast('Nu ai suficiente puncte pentru conversie.'); return; }
    const want = prompt(`Ai ${st.points} puncte. Rată: ${rate}p = 1 bomboană.\nCâte bomboane vrei să convertești? (max ${max})`);
    const n = Math.floor(Number(want));
    if(!Number.isFinite(n) || n <= 0) return;
    const res = window.State.convertPointsToCandies(n);
    if(res.ok){
      window.UI.showToast(`↔️ Conversie reușită: -${res.spent}p → +${res.converted}🍬`);
      updateUIFromState();
    } else {
      window.UI.showToast(res.error || 'Conversie eșuată.');
    }
  });

  // Init
  updateUIFromState();
  window.UI.toggleViews('menu');
  window.UI.showBreadcrumb(null);
})();