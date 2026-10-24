// ===== START: PRODUCT CARD RENDERER =====
function starString(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function renderProductCard(p) {
  const price = p.salePrice ?? p.price;
  return `
    <div class="product-card" data-id="${p.id}">
      <div class="thumb">
        ${p.salePrice ? `<span class="sale-tag">SALE</span>` : ''}
        <button class="wishlist-toggle" data-id="${p.id}" aria-label="Toggle wishlist">♡</button>
        <a href="product.html?id=${p.id}"><img src="${p.image}" alt="${p.name}" /></a>
      </div>
      <div class="body">
        <div class="brand">${p.brand}</div>
        <a href="product.html?id=${p.id}"><h3>${p.name}</h3></a>
        <div class="stars">${starString(p.rating)} <span style="color:var(--ink-soft)">(${p.reviewCount})</span></div>
        <div class="price">
          ${p.salePrice ? `<span class="price strike">${formatBDT(p.price)}</span>` : ''}
          ${formatBDT(price)}
        </div>
        <div class="actions">
          <a href="product.html?id=${p.id}" class="btn btn-dark btn-sm btn-block">View Product</a>
        </div>
      </div>
    </div>
  `;
}

async function renderProductGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (products.length === 0) {
    el.innerHTML = `<div class="empty-state">No products matched. Try adjusting your search or filters.</div>`;
    return;
  }
  el.innerHTML = products.map(renderProductCard).join('');
  await markWishlisted(el);
  wireWishlistButtons(el);
}

async function markWishlisted(scopeEl) {
  try {
    const wishlist = await api.get('/wishlist');
    const ids = new Set(wishlist.map(p => p.id));
    scopeEl.querySelectorAll('.wishlist-toggle').forEach(btn => {
      if (ids.has(btn.dataset.id)) { btn.classList.add('active'); btn.textContent = '♥'; }
    });
  } catch (e) { /* silent */ }
}

function wireWishlistButtons(scopeEl) {
  scopeEl.querySelectorAll('.wishlist-toggle').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const id = btn.dataset.id;
      try {
        if (btn.classList.contains('active')) {
          await api.del('/wishlist/remove', { productId: id });
          btn.classList.remove('active'); btn.textContent = '♡';
        } else {
          await api.post('/wishlist/add', { productId: id });
          btn.classList.add('active'); btn.textContent = '♥';
        }
        refreshNavBadges();
      } catch (err) { alert(err.message); }
    });
  });
}
// ===== END: PRODUCT CARD RENDERER =====
