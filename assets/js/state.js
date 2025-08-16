// Persistență și operații pe scor + inventar/echipare
(function(){
  const KEY = 'mje_state_v1';

  function clampInt(x){ x = Number.isFinite(x) ? Math.floor(x) : 0; return x < 0 ? 0 : x; }

  function sanitize(raw){
    const s = raw && typeof raw === 'object' ? raw : {};
    return {
      points: clampInt(s.points),
      candies: clampInt(s.candies),
      avatar: (s.avatar === 'girl' ? 'girl' : 'boy'),
      badges: Array.isArray(s.badges) ? s.badges.slice(0, 100) : [],
      equipped: s.equipped && typeof s.equipped === 'object' ? s.equipped : {},
      inventory: Array.isArray(s.inventory) ? s.inventory.slice(0, 200) : [],
      lastDailyReward: typeof s.lastDailyReward === 'string' ? s.lastDailyReward : null
    };
  }

  function load(){ try { const raw = JSON.parse(localStorage.getItem(KEY)); return sanitize(raw); } catch { return sanitize(null); } }
  function save(state){ localStorage.setItem(KEY, JSON.stringify(state)); }

  const state = load();

  const api = {
    get(){ return { ...state }; },
    getPublic(){ return { points: state.points, candies: state.candies, avatar: state.avatar, equipped: state.equipped, badges: state.badges }; },
    setAvatar(a){ state.avatar = (a === 'girl' ? 'girl' : 'boy'); save(state); return api.get(); },

    addPoints(n){ n = clampInt(n); if(!n) return api.get(); state.points = clampInt(state.points + n); save(state); return api.get(); },
    addCandies(n){ n = clampInt(n); if(!n) return api.get(); state.candies = clampInt(state.candies + n); save(state); return api.get(); },

    convertPointsToCandies(requestedCandies){
      requestedCandies = clampInt(requestedCandies);
      if(!requestedCandies) return { ok:false, error:'Cantitate invalidă.' };
      const need = requestedCandies * (window.CONFIG?.CONVERSION?.POINTS_PER_CANDY || 100);
      if(state.points < need) return { ok:false, error:'Puncte insuficiente.' };
      state.points -= need; state.candies += requestedCandies; save(state);
      return { ok:true, state: api.get(), converted: requestedCandies, spent: need };
    },
    convertAllPossible(){
      const rate = (window.CONFIG?.CONVERSION?.POINTS_PER_CANDY || 100);
      const can = Math.floor(state.points / rate);
      if(can <= 0) return { ok:false, error:'Nu ai destule puncte.' };
      state.points -= can * rate; state.candies += can; save(state);
      return { ok:true, state: api.get(), converted: can, spent: can*rate };
    },

    setLastDailyReward(iso){ state.lastDailyReward = iso; save(state); return api.get(); },
    unlockBadge(id){ if(!state.badges.includes(id)) { state.badges.push(id); save(state); } return api.get(); },

    // Inventar & echipare
    getInventory(){ return state.inventory.slice(); },
    getEquipped(){ return { ...state.equipped }; },
    purchaseItem(itemId){
      const items = window.CONFIG?.SHOP_ITEMS || window.AVATAR?.ITEMS || [];
      const item = items.find(i => i.id === itemId);
      if(!item) return { ok:false, error:'Item necunoscut.' };
      if(state.inventory.includes(itemId)) return { ok:false, error:'Deja deținut.' };
      const cost = Math.max(0, item.price|0);
      if(state.candies < cost) return { ok:false, error:'Bomboane insuficiente.' };
      state.candies -= cost; state.inventory.push(itemId); save(state);
      return { ok:true, state: api.get(), bought: itemId, cost };
    },
    equipItem(itemId){
      const items = window.CONFIG?.SHOP_ITEMS || window.AVATAR?.ITEMS || [];
      const item = items.find(i => i.id === itemId);
      if(!item) return { ok:false, error:'Item necunoscut.' };
      if(!state.inventory.includes(itemId)) return { ok:false, error:'Nu deții acest item.' };
      state.equipped = state.equipped && typeof state.equipped === 'object' ? state.equipped : {};
      state.equipped[item.slot] = itemId; save(state);
      return { ok:true, state: api.get(), equipped: { ...state.equipped } };
    }
  };

  window.State = api;
})();