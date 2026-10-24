// ===== START: SHARED HEADER MARKUP =====
const HEADER_HTML = `
<header class="site-header">
  <div class="header-inner">
    <a href="index.html" class="logo">STRIDE<span>.</span></a>
    <nav class="main-nav">
      <a href="products.html?category=men">Men</a>
      <a href="products.html?category=women">Women</a>
      <a href="products.html?category=kids">Kids</a>
      <a href="products.html?category=accessories">Accessories</a>
    </nav>
    <form id="nav-search-form" class="search-box">
      <input id="nav-search-input" type="search" placeholder="Search shoes..." aria-label="Search products" />
      <button type="submit" aria-label="Search">🔍</button>
    </form>
    <div class="header-icons">
      <a href="wishlist.html" class="icon-btn">♡ <span id="wishlist-badge" class="badge">0</span></a>
      <a href="cart.html" class="icon-btn">🛒 <span id="cart-badge" class="badge">0</span></a>
      <a href="login.html" id="account-link" class="icon-btn">👤 Login</a>
    </div>
  </div>
</header>
<div class="tread-divider"></div>
`;
// ===== END: SHARED HEADER MARKUP =====

// ===== START: SHARED FOOTER MARKUP =====
const FOOTER_HTML = `
<div class="tread-divider"></div>
<footer class="site-footer">
  <div class="container">
    <div>
      <h4>Stride</h4>
      <a href="index.html">Home</a>
      <a href="products.html">Shop All</a>
    </div>
    <div>
      <h4>Help</h4>
      <a href="account.html">Track an Order</a>
      <a href="account.html">Returns</a>
      <a href="#" onclick="document.getElementById('chat-toggle').click(); return false;">Live Chat</a>
    </div>
    <div>
      <h4>Account</h4>
      <a href="login.html">Login</a>
      <a href="register.html">Create Account</a>
    </div>
    <div>
      <h4>Payments</h4>
      <a href="#">Cards · Online Payment</a>
      <a href="#">Cash on Delivery</a>
    </div>
  </div>
  <div class="container bottom">© 2026 Stride Shoe Co. Demo storefront — not a real store.</div>
</footer>
`;
// ===== END: SHARED FOOTER MARKUP =====

// ===== START: SHARED CHAT WIDGET MARKUP =====
const CHAT_HTML = `
<button id="chat-toggle" aria-label="Open live chat">💬</button>
<div id="chat-window">
  <div class="chat-head">Live Chat</div>
  <div id="chat-messages"></div>
  <form id="chat-form" class="chat-input-row">
    <input id="chat-input" type="text" placeholder="Type a message..." autocomplete="off" />
    <button type="submit">Send</button>
  </form>
</div>
`;
// ===== END: SHARED CHAT WIDGET MARKUP =====

// ===== START: INJECT INTO PAGE =====
document.getElementById('site-header').innerHTML = HEADER_HTML;
document.getElementById('site-footer').innerHTML = FOOTER_HTML;
document.getElementById('chat-widget').innerHTML = CHAT_HTML;
// ===== END: INJECT INTO PAGE =====
