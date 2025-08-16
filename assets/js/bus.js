// Bus de mesaje între pagină și joc (iframe)
(function(){
  const originAllowed = window.location.origin;
  const RATE_WINDOW_MS = 5000;
  const rate = new Map(); // key: sourceGame, value: {start, count}
  const frame = document.getElementById('gameFrame');

  function withinRate(source){
    const lim = window.CONFIG?.LIMITS?.MESSAGES_PER_5S ?? 10;
    const now = Date.now();
    const r = rate.get(source) || { start: now, count: 0 };
    if(now - r.start > RATE_WINDOW_MS){ r.start = now; r.count = 0; }
    if(r.count >= lim){ rate.set(source, r); return false; }
    r.count++; rate.set(source, r); return true;
  }

  function clampPosInt(n){ n = Math.floor(Number(n)); return Number.isFinite(n) && n > 0 ? n : 0; }

  function handleMessage(e){
    if(e.source !== frame.contentWindow) return;
    if(e.origin !== originAllowed) return;

    const msg = e.data || {};
    const type = msg.type;
    const payload = msg.payload || {};
    const sourceGame = String(msg.sourceGame || '').slice(0,32);

    if(!withinRate(sourceGame)) return; // anti-spam simplu

    switch(type){
      case 'addPoints': {
        const cap = window.CONFIG?.LIMITS?.POINTS_PER_MESSAGE ?? 100;
        const v = Math.min(clampPosInt(payload.value), cap);
        if(v){ const st = window.State.addPoints(v); window.UI.updateHeader(st); window.UI.showToast(`+${v} puncte din „${window.CONFIG.GAMES[sourceGame]||sourceGame}”`); }
        break;
      }
      case 'addCandies': {
        const cap = window.CONFIG?.LIMITS?.CANDIES_PER_MESSAGE ?? 3;
        const v = Math.min(clampPosInt(payload.value), cap);
        if(v){ const st = window.State.addCandies(v); window.UI.updateHeader(st); window.UI.showToast(`+${v} bomboană(e) din „${window.CONFIG.GAMES[sourceGame]||sourceGame}”`); }
        break;
      }
      case 'requestPlayerState': { sendToGame('playerState', window.State.getPublic()); break; }
      case 'gameOver': { const score = clampPosInt(payload.score); if(score){ window.UI.showToast(`Scorul tău: ${score}`); } break; }
      case 'achievementUnlocked': { const id = String(payload.id||''); if(id){ window.State.unlockBadge(id); window.UI.showToast(`🏅 Realizare: ${id}`); } break; }
      case 'exitToMenu': { if(window.UI){ UI.toggleViews('menu'); UI.showBreadcrumb(null); } if(frame) frame.src = ''; break; }
      default: { /* ignoră necunoscute */ }
    }
  }

  function sendToGame(type, payload){ if(!frame.contentWindow) return; frame.contentWindow.postMessage({ type, payload }, originAllowed); }

  window.addEventListener('message', handleMessage);
  window.Bus = { sendToGame };
})();