// Config global — fără module, expus pe window
(function(){
  const CONFIG = {
    CONVERSION: { POINTS_PER_CANDY: 100 },
    DAILY_REWARD: { candies: 3 },
    LIMITS: { POINTS_PER_MESSAGE: 100, CANDIES_PER_MESSAGE: 3, MESSAGES_PER_5S: 10 },
    GAMES: {
      ducks: 'Rățuște pe nuferi',
      math: 'Adunări & Scăderi',
      balloons: 'Balonul potrivit',
      treasure: 'Vânătoarea de comori'
    }
  };
  window.CONFIG = CONFIG;
})();