// Definiții avatar & item-uri; și bridge către CONFIG.SHOP_ITEMS
(function(){
  const ITEMS = [
    { id:'hat_red',     name:'Șapcă roșie',    slot:'hat',   icon:'🧢',  price:3 },
    { id:'hat_blue',    name:'Șapcă albastră', slot:'hat',   icon:'🧢',  price:3 },
    { id:'shirt_green', name:'Tricou verde',   slot:'shirt', icon:'👕',  price:4 },
    { id:'cape_star',   name:'Pelerină stea',  slot:'cape',  icon:'🦸‍♂️', price:6 }
  ];
  window.AVATAR = window.AVATAR || {}; window.AVATAR.ITEMS = ITEMS;
  window.CONFIG = window.CONFIG || {}; window.CONFIG.SHOP_ITEMS = ITEMS; // compat
})();