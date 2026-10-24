// ===== START: SIZE CHART DATA =====
const SIZE_CHARTS = {
  mens: { headers: ['US', 'UK', 'EU', 'Foot Length (cm)'], rows: [
    [7, 6, 40, 25.0], [8, 7, 41, 26.0], [9, 8, 42, 27.0], [10, 9, 43, 28.0], [11, 10, 44, 29.0], [12, 11, 45, 30.0], [13, 12, 46, 31.0]
  ]},
  womens: { headers: ['US', 'UK', 'EU', 'Foot Length (cm)'], rows: [
    [5, 3, 35, 22.0], [6, 4, 36, 22.8], [7, 5, 37, 23.5], [8, 6, 38, 24.3], [9, 7, 39, 25.0], [10, 8, 40, 25.8]
  ]},
  kids: { headers: ['US', 'UK', 'EU', 'Foot Length (cm)'], rows: [
    [1, 13, 32, 19.7], [2, 1, 33, 20.3], [3, 2, 34, 21.0], [4, 3, 35, 21.6], [5, 4, 36, 22.2], [6, 5, 37, 22.9]
  ]},
  accessory: null
};

function renderSizeChart(type) {
  const holder = document.getElementById('size-chart-holder');
  const chart = SIZE_CHARTS[type];
  if (!chart) {
    holder.innerHTML = `<p>This item is one-size / not shoe-sized. Check the product description for fit details.</p>`;
    return;
  }
  holder.innerHTML = `
    <table class="size-chart-table">
      <thead><tr>${chart.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${chart.rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
}
// ===== END: SIZE CHART DATA =====

// ===== START: STATE =====
let currentProduct = null;
let selectedSize = null;
let qty = 1;
// ===== END: STATE =====

// ===== START: LOAD PRODUCT =====
async function loadProduct() {
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { document.getElementById('pd-root').innerHTML = '<div class="empty-state">No product specified.</div>'; return; }

  try {
    currentProduct = await api.get('/products/' + id);
  } catch (e) {
    document.getElementById('pd-root').innerHTML = `<div class="empty-state">${e.message}</div>`;
    return;
  }
  const p = currentProduct;
  document.getElementById('page-title-tag').textContent = `${p.name} — Stride`;
  document.getElementById('pd-image').src = p.image;
  document.getElementById('pd-image').alt = p.name;
  document.getElementById('pd-brand').textContent = p.brand;
  document.getElementById('pd-name').textContent = p.name;
  document.getElementById('pd-rating').innerHTML = `${starString(p.rating)} <span style="color:var(--ink-soft)">(${p.reviewCount} reviews)</span>`;
  document.getElementById('pd-price').innerHTML = p.salePrice
    ? `<span class="price strike">${formatBDT(p.price)}</span> ${formatBDT(p.salePrice)}`
    : formatBDT(p.price);
  document.getElementById('pd-desc').textContent = p.description;
  document.getElementById('tab-desc-text').textContent = `${p.description} Available in: ${p.colors.join(', ')}.`;

  document.getElementById('pd-sizes').innerHTML = p.sizes.map(s => `<button type="button" class="size-chip" data-size="${s}">${s}</button>`).join('');
  document.querySelectorAll('#pd-sizes .size-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#pd-sizes .size-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
      selectedSize = chip.dataset.size;
    });
  });

  renderSizeChart(p.sizeChartType);
  await loadReviews(p.id);
  await markProductWishlisted(p.id);
}
// ===== END: LOAD PRODUCT =====

// ===== START: QUANTITY CONTROLS =====
document.getElementById('qty-minus').addEventListener('click', () => { qty = Math.max(1, qty - 1); document.getElementById('qty-value').textContent = qty; });
document.getElementById('qty-plus').addEventListener('click', () => { qty += 1; document.getElementById('qty-value').textContent = qty; });
// ===== END: QUANTITY CONTROLS =====

// ===== START: ADD TO CART =====
document.getElementById('add-to-cart').addEventListener('click', async () => {
  const msg = document.getElementById('pd-msg');
  msg.innerHTML = '';
  if (!selectedSize) {
    msg.innerHTML = `<div class="error-msg">Please select a size first.</div>`;
    return;
  }
  try {
    await api.post('/cart/add', { productId: currentProduct.id, size: selectedSize, qty });
    msg.innerHTML = `<div class="success-msg">Added to cart! <a href="cart.html" style="text-decoration:underline;">View cart</a></div>`;
    refreshNavBadges();
  } catch (e) {
    msg.innerHTML = `<div class="error-msg">${e.message}</div>`;
  }
});
// ===== END: ADD TO CART =====

// ===== START: WISHLIST TOGGLE ON DETAIL PAGE =====
async function markProductWishlisted(id) {
  try {
    const wishlist = await api.get('/wishlist');
    const btn = document.getElementById('pd-wishlist');
    if (wishlist.some(p => p.id === id)) { btn.classList.add('active'); btn.textContent = '♥'; }
  } catch (e) { /* silent */ }
}
document.getElementById('pd-wishlist').addEventListener('click', async () => {
  const btn = document.getElementById('pd-wishlist');
  try {
    if (btn.classList.contains('active')) {
      await api.del('/wishlist/remove', { productId: currentProduct.id });
      btn.classList.remove('active'); btn.textContent = '♡';
    } else {
      await api.post('/wishlist/add', { productId: currentProduct.id });
      btn.classList.add('active'); btn.textContent = '♥';
    }
    refreshNavBadges();
  } catch (e) { alert(e.message); }
});
// ===== END: WISHLIST TOGGLE ON DETAIL PAGE =====

// ===== START: TABS =====
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});
// ===== END: TABS =====

// ===== START: REVIEWS =====
async function loadReviews(productId) {
  const reviews = await api.get('/reviews/' + productId);
  document.getElementById('review-count-tab').textContent = reviews.length;
  document.getElementById('review-total-text').textContent = `${reviews.length} review${reviews.length === 1 ? '' : 's'}`;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  document.getElementById('review-avg').textContent = avg.toFixed(1);
  document.getElementById('review-avg-stars').textContent = starString(avg);

  const list = document.getElementById('review-list');
  list.innerHTML = reviews.length
    ? reviews.map(r => `
      <div class="review-item">
        <div class="stars">${starString(r.rating)}</div>
        <div class="meta">${r.userName} · ${new Date(r.date).toLocaleDateString()}</div>
        ${r.title ? `<strong>${r.title}</strong>` : ''}
        <p>${r.comment}</p>
      </div>`).join('')
    : `<p style="color:var(--ink-soft)">No reviews yet — be the first to write one.</p>`;
}

document.getElementById('review-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('review-msg');
  msg.innerHTML = '';
  if (!isLoggedIn()) {
    msg.innerHTML = `<div class="error-msg">Please <a href="login.html" style="text-decoration:underline;">log in</a> to write a review.</div>`;
    return;
  }
  try {
    await api.post('/reviews/' + currentProduct.id, {
      rating: Number(document.getElementById('review-rating').value),
      title: document.getElementById('review-title').value,
      comment: document.getElementById('review-comment').value
    });
    document.getElementById('review-form').reset();
    msg.innerHTML = `<div class="success-msg">Thanks — your review was posted.</div>`;
    await loadReviews(currentProduct.id);
  } catch (err) {
    msg.innerHTML = `<div class="error-msg">${err.message}</div>`;
  }
});
// ===== END: REVIEWS =====

document.addEventListener('DOMContentLoaded', loadProduct);
