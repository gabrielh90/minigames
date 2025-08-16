// Persistență și operații pe scor
(function(){
  const KEY = 'mje_state_v1';

  function clampInt(x){
    x = Number.isFinite(x) ? Math.floor(x) : 0;
    return x < 0 ? 0 : x;
  }

  function sanitize(raw){
    const s = raw && typeof raw === 'object' ? raw : {};
    return {
      points: clampInt(s.points),
      candies: clampInt(s.candies),
      avatar: (s.avatar === 'girl' ? 'girl' : 'boy'),
      badges: Array.isArray(s.badges) ? s.badges.slice(0, 100) : [],
      equipped: s.equipped && typeof s.equipped === 'object' ? s.equipped : {},
      lastDailyReward: typeof s.lastDailyReward === 'string' ? s.lastDailyReward : null
    };
  }

  function load(){
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return sanitize(raw);
    } catch { return sanitize(null); }
  }

  function save(state){
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  const state = load();

  const api = {
    get(){ return { ...state }; },
    getPublic(){
      // In jocuri nu trimitem tot; dar pentru simplitate MVP e ok
      return {
        points: state.points,
        candies: state.candies,
        avatar: state.avatar,
        equipped: state.equipped,
        badges: state.badges
      };
    },
    setAvatar(a){ state.avatar = (a === 'girl' ? 'girl' : 'boy'); save(state); return api.get(); },
    addPoints(n){
      n = clampInt(n);
      if(!n) return api.get();
      state.points = clampInt(state.points + n);
      save(state);
      return api.get();
    },
    addCandies(n){
      n = clampInt(n);
      if(!n) return api.get();
      state.candies = clampInt(state.candies + n);
      save(state);
      return api.get();
    },
    convertPointsToCandies(requestedCandies){
      requestedCandies = clampInt(requestedCandies);
      if(!requestedCandies) return { ok:false, error:'Cantitate invalidă.' };
      const need = requestedCandies * (window.CONFIG?.CONVERSION?.POINTS_PER_CANDY || 100);
      if(state.points < need) return { ok:false, error:'Puncte insuficiente.' };
      state.points -= need;
      state.candies += requestedCandies;
      save(state);
      return { ok:true, state: api.get(), converted: requestedCandies, spent: need };
    },
    convertAllPossible(){
      const rate = (window.CONFIG?.CONVERSION?.POINTS_PER_CANDY || 100);
      const can = Math.floor(state.points / rate);
      if(can <= 0) return { ok:false, error:'Nu ai destule puncte.' };
      state.points -= can * rate;
      state.candies += can;
      save(state);
      return { ok:true, state: api.get(), converted: can, spent: can*rate };
    },
    setLastDailyReward(iso){ state.lastDailyReward = iso; save(state); return api.get(); },
    unlockBadge(id){ if(!state.badges.includes(id)) { state.badges.push(id); save(state); } return api.get(); }
  };

  window.State = api;
})();