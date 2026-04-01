// ══════════════════════════════════════════
//  home.js — Home screen logic only
//  logic.js (sendMessage) is NOT touched
// ══════════════════════════════════════════

// ── Date display ──
(function setDate() {
  const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const now    = new Date();
  const el     = document.getElementById('dateDisplay');
  if (el) el.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
})();

// ── Screen switching ──
function showChat() {
  document.getElementById('homeScreen').style.display = 'none';
  const chat = document.getElementById('chatScreen');
  chat.style.display = 'block';
  chat.classList.add('active');
  document.getElementById('input').focus();
}

function showHome() {
  document.getElementById('chatScreen').style.display = 'none';
  document.getElementById('chatScreen').classList.remove('active');
  document.getElementById('homeScreen').style.display = 'flex';
}

// Back button
document.getElementById('backBtn').addEventListener('click', showHome);

// ── Home send button → go to chat then send ──
document.getElementById('homeSendBtn').addEventListener('click', function () {
  var val = document.getElementById('homeInput').value.trim();
  if (!val) return;
  showChat();
  // copy text into the real chat input and fire sendMessage
  document.getElementById('input').value = val;
  document.getElementById('homeInput').value = '';
  sendMessage();  // calls the original function in logic.js
});

document.getElementById('homeInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') document.getElementById('homeSendBtn').click();
});

// ── Pill toggles ──
document.querySelectorAll('[data-pill]').forEach(function(pill) {
  pill.addEventListener('click', function () {
    this.classList.toggle('active');
  });
});

// ── Prompt cards → fill home input ──
document.querySelectorAll('.prompt-card').forEach(function(card) {
  card.addEventListener('click', function () {
    var prompt = this.dataset.prompt;
    document.getElementById('homeInput').value = prompt;
    document.getElementById('homeInput').focus();
  });
});

// ── Recent / Pinned data ──
var recentData = [
  { icon: '🐍', title: 'Python input() not working in VS Code terminal', time: '2h ago' },
  { icon: '☕', title: 'Java digit manipulation and arithmetic operators',  time: 'Yesterday' },
  { icon: '📈', title: 'Pine Script v5 Triple Confirmation Trading System', time: '3d ago' },
  { icon: '🤖', title: 'ChatGPT vs Indus AI — privacy controls comparison', time: '1w ago' },
];

var pinnedData = [
  { icon: '⭐', title: 'Python + Java dual-language learning plan', time: 'Pinned' },
  { icon: '⭐', title: 'DNF5 package management on Linux',          time: 'Pinned' },
];

function renderList(data) {
  var list = document.getElementById('recentList');
  if (!list) return;
  list.innerHTML = data.map(function(item) {
    return '<div class="recent-item">' +
      '<div class="recent-icon">' + item.icon + '</div>' +
      '<div class="recent-body"><div class="recent-title">' + item.title + '</div></div>' +
      '<div class="recent-time">' + item.time + '</div>' +
    '</div>';
  }).join('');

  // clicking a recent item loads it into chat
  list.querySelectorAll('.recent-item').forEach(function(el, i) {
    el.addEventListener('click', function() {
      var title = data[i].title;
      showChat();
      document.getElementById('input').value = title;
      sendMessage();
    });
  });
}

renderList(recentData);

// ── Tab switching ──
document.querySelectorAll('.section-tab').forEach(function(tab) {
  tab.addEventListener('click', function () {
    document.querySelectorAll('.section-tab').forEach(function(t) { t.classList.remove('active'); });
    this.classList.add('active');
    renderList(this.dataset.tab === 'pinned' ? pinnedData : recentData);
  });
});
