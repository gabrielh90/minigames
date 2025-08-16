// Recompensa zilnică — simplu: o dată pe zi
(function(){
  function todayISO(){
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function isAvailable(lastISO){
    return lastISO !== todayISO();
  }

  function claim(){
    const reward = (window.CONFIG?.DAILY_REWARD?.candies ?? 3);
    const st = window.State.get();
    if(!isAvailable(st.lastDailyReward)){
      return { ok:false, error: 'Ai luat deja recompensa azi.' };
    }
    window.State.addCandies(reward);
    window.State.setLastDailyReward(todayISO());
    return { ok:true, candies: reward, state: window.State.get() };
  }

  window.Daily = { isAvailable, claim };
})();