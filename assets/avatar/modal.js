// Modal Avatar: open/close + schimbare gen + navigație Magazin/Dulap
(function(){
  const modal = document.getElementById('avatarModal');
  const preview = document.getElementById('avatarPreview');
  const btnOpen = document.getElementById('btnAvatar');
  const btnClose = document.getElementById('btnCloseAvatar');
  const btnShop = document.getElementById('btnOpenShop');
  const btnCloset = document.getElementById('btnOpenCloset');
  const genderToggle = document.getElementById('genderToggle');

  function emoji(a){ return a === 'girl' ? '👧' : '👦'; }

  // Actualizează textul butonului din header (👦/👧 Avatar)
  function updateAvatarButton(){
    const btn = document.getElementById('btnAvatar');
    if (!btn) return;
    const a = window.State.get().avatar;
    btn.textContent = `${a === 'girl' ? '👧' : '👦'} Avatar`;
  }

  function setGenderUI(current){
    if(!genderToggle) return;
    [...genderToggle.querySelectorAll('button[data-avatar]')].forEach(b=>{
      const isActive = b.dataset.avatar === current;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-selected', String(isActive));
    });
  }

  function open(){
    if(!modal) return;
    const a = window.State.get().avatar;
    setGenderUI(a);
    if(preview) preview.textContent = emoji(a);
    updateAvatarButton();
    modal.hidden = false;
  }
  function close(){ if(modal) modal.hidden = true; }

  genderToggle?.addEventListener('click', (e)=>{
    const btn = e.target.closest('button[data-avatar]'); if(!btn) return;
    const a = btn.dataset.avatar === 'girl' ? 'girl' : 'boy';
    window.State.setAvatar(a);
    setGenderUI(a);
    if(preview) preview.textContent = emoji(a);
    updateAvatarButton();
    const eq = window.State.get().equipped || {};
    window.Bus?.sendToGame?.('avatarChanged', { avatar:a, equipped:eq });
    window.UI?.showToast?.(`Avatar setat: ${a === 'girl' ? 'fată' : 'băiat'}`);
  });

  btnOpen?.addEventListener('click', open);
  btnClose?.addEventListener('click', close);
  btnShop?.addEventListener('click', ()=>{ close(); window.AvatarUI.showShop(); });
  btnCloset?.addEventListener('click', ()=>{ close(); window.AvatarUI.showCloset(); });

  // expunere publică (opțional)
  window.AvatarModal = { open, close };

  // Setează emoji-ul corect pe buton și la prima încărcare
  try { updateAvatarButton(); } catch {}
})();