// Magazin + Dulap + navigația lor
(function(){
  const shop = document.getElementById('shop');
  const shopGrid = document.getElementById('shopGrid');
  const closet = document.getElementById('closet');
  const closetGrid = document.getElementById('closetGrid');
  const frame = document.getElementById('gameFrame');
  const menu = document.getElementById('menu');

  function hideAll(){ if(frame){ frame.style.display = 'none'; frame.src=''; } if(menu) menu.style.display = 'none'; if(shop) shop.style.display = 'none'; if(closet) closet.style.display = 'none'; }

  function renderShop(){
    if(!shopGrid) return; shopGrid.innerHTML = '';
    const st = window.State.get();
    (window.AVATAR.ITEMS || []).forEach(item => {
      const owned = st.inventory?.includes(item.id);
      const card = document.createElement('div'); card.className = 'item-card';
      card.innerHTML = `
        <div class="row">
          <div class="icon">${item.icon}</div>
          <div>
            <div><strong>${item.name}</strong></div>
            <div class="meta">Slot: ${item.slot} • Cost: ${item.price}🍬</div>
          </div>
        </div>
        <button class="btn ${owned ? 'secondary' : ''}" ${owned ? 'disabled' : ''}>
          ${owned ? 'Deja cumpărat' : `Cumpără (${item.price}🍬)`}
        </button>
      `;
      card.querySelector('button').addEventListener('click', ()=>{
        const res = window.AvatarStore.purchaseItem(item.id);
        if(res.ok){ window.UI.showToast(`✅ Ai cumpărat ${item.name} (-${item.price}🍬)`); window.UI.updateHeader(res.state); renderShop(); }
        else { window.UI.showToast(res.error || 'Eroare la cumpărare.'); }
      });
      shopGrid.appendChild(card);
    });
  }

  function renderCloset(){
    if(!closetGrid) return; closetGrid.innerHTML = '';
    const st = window.State.get();
    const items = (window.AVATAR.ITEMS || []).filter(i => st.inventory?.includes(i.id));
    if(items.length === 0){ const empty = document.createElement('div'); empty.className='muted'; empty.textContent='Încă nu ai item-uri. Încearcă magazinul!'; closetGrid.appendChild(empty); return; }
    items.forEach(item => {
      const equipped = st.equipped && st.equipped[item.slot] === item.id;
      const card = document.createElement('div'); card.className='item-card';
      card.innerHTML = `
        <div class="row">
          <div class="icon">${item.icon}</div>
          <div>
            <div><strong>${item.name}</strong></div>
            <div class="meta">Slot: ${item.slot}</div>
          </div>
        </div>
        <button class="btn ${equipped ? 'secondary' : ''}">${equipped ? 'Echipat' : 'Echipează'}</button>
      `;
      card.querySelector('button').addEventListener('click', ()=>{
        if(equipped) return; const res = window.AvatarStore.equipItem(item.id);
        if(res.ok){ window.UI.showToast(`🧥 Echipat: ${item.name}`); const avatar = window.State.get().avatar; window.Bus?.sendToGame?.('avatarChanged', { avatar, equipped: res.equipped }); renderCloset(); }
        else { window.UI.showToast(res.error || 'Eroare la echipare.'); }
      });
      closetGrid.appendChild(card);
    });
  }

  function showShop(){ hideAll(); if(shop) shop.style.display='block'; window.UI.showBreadcrumb('Magazin'); renderShop(); }
  function showCloset(){ hideAll(); if(closet) closet.style.display='block'; window.UI.showBreadcrumb('Dulap'); renderCloset(); }

  window.AvatarUI = { showShop, showCloset, renderShop, renderCloset };
})();