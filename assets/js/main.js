let points = 0;
let candies = 0;
let avatar = 'boy';

const totalPointsEl = document.getElementById('totalPoints');
const totalCandiesEl = document.getElementById('totalCandies');
const frame = document.getElementById('gameFrame');
const menu = document.getElementById('menu');

function updateHeader() {
  totalPointsEl.textContent = `⭐ Puncte: ${points}`;
  totalCandiesEl.textContent = `🍬 Bomboane: ${candies}`;
}

function loadGame(name) {
  menu.style.display = 'none';
  frame.style.display = 'block';
  frame.src = `./games/${name}/index.html?avatar=${avatar}`;
}

function showMenu() {
  frame.style.display = 'none';
  menu.style.display = 'block';
  frame.src = '';
}

document.getElementById('avatarToggle').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  avatar = btn.dataset.avatar;
  document.querySelectorAll('#avatarToggle button').forEach(b => b.classList.toggle('active', b === btn));
});

// ascultă mesaje din iframe pentru scor
window.addEventListener('message', (e) => {
  if (e.data?.type === 'addPoints') { points += e.data.value; updateHeader(); }
  if (e.data?.type === 'addCandies') { candies += e.data.value; updateHeader(); }
});

updateHeader();
