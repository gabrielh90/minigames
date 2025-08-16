// Wrappere peste State pentru inventar/echipare
(function(){
  const api = {
    getInventory(){ return (window.State.get().inventory || []).slice(); },
    getEquipped(){ return { ...(window.State.get().equipped || {}) }; },
    purchaseItem(itemId){ return window.State.purchaseItem(itemId); },
    equipItem(itemId){ return window.State.equipItem(itemId); },
  };
  window.AvatarStore = api;
})();