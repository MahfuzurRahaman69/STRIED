// ===== START: HEADER BADGES =====
async function refreshNavBadges() {
  try {
    const cart = await api.get('/cart');
    const cartCount = cart.reduce((sum, l) => sum + l.qty, 0);
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) cartBadge.textContent = cartCount;
  } catch (e) { /* silent */ }

  try {
    const wishlist = await api.get('/wishlist');
    const wishBadge = document.getElementById('wishlist-badge');
    if (wishBadge) wishBadge.textContent = wishlist.length;
  } catch (e) { /* silent */ }

  const accountLink = document.getElementById('account-link');
  if (accountLink) {
    accountLink.textContent = isLoggedIn() ? `👤 ${currentUserName().split(' ')[0]}` : '👤 Login';
    accountLink.href = isLoggedIn() ? 'account.html' : 'login.html';
  }
}

function wireSearchBox() {
  const form = document.getElementById('nav-search-form');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = document.getElementById('nav-search-input').value.trim();
    window.location.href = 'products.html' + (q ? `?q=${encodeURIComponent(q)}` : '');
  });
}
// ===== END: HEADER BADGES =====

// ===== START: CHAT WIDGET =====
async function loadChatHistory() {
  const box = document.getElementById('chat-messages');
  if (!box) return;
  try {
    const history = await api.get('/chat');
    box.innerHTML = '';
    if (history.length === 0) {
      appendChatMsg('bot', "Hi! I'm the Stride support assistant. Ask me about sizing, orders, returns, or shipping.");
    } else {
      history.forEach(m => appendChatMsg(m.from, m.text));
    }
  } catch (e) { /* silent */ }
}

function appendChatMsg(from, text) {
  const box = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-msg ${from}`;
  div.textContent = text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function wireChatWidget() {
  const toggle = document.getElementById('chat-toggle');
  const win = document.getElementById('chat-window');
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  if (!toggle) return;

  toggle.addEventListener('click', () => {
    win.classList.toggle('open');
    if (win.classList.contains('open')) loadChatHistory();
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    appendChatMsg('user', text);
    input.value = '';
    try {
      const [, botMsg] = await api.post('/chat', { message: text });
      appendChatMsg('bot', botMsg.text);
    } catch (err) {
      appendChatMsg('bot', "Sorry, I couldn't send that — please try again.");
    }
  });
}
// ===== END: CHAT WIDGET =====

// ===== START: INIT ON EVERY PAGE =====
document.addEventListener('DOMContentLoaded', () => {
  refreshNavBadges();
  wireSearchBox();
  wireChatWidget();
});
// ===== END: INIT ON EVERY PAGE =====
