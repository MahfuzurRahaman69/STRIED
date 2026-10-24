// ===== START: CART RENDER =====
async function loadCart() {
  const cart = await api.get('/cart');
  const linesEl = document.getElementById('cart-lines');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (cart.length === 0) {
    linesEl.innerHTML = `<div class="empty-state">Your cart is empty. <a href="products.html" style="text-decoration:underline;">Start shopping →</a></div>`;
    checkoutBtn.classList.add('btn:disabled');
    checkoutBtn.style.pointerEvents = 'none';
    checkoutBtn.style.opacity = '.5';
  } else {
    linesEl.innerHTML = cart.map(line => `
      <div class="cart-line" data-id="${line.productId}" data-size="${line.size}">
        <img src="${line.product.image}" alt="${line.product.name}" width="80" height="80" style="object-fit:cover;" />
        <div>
          <strong>${line.product.name}</strong>
          <div style="color:var(--ink-soft); font-size:.85rem;">Size: ${line.size}</div>
          <div style="margin-top:6px;">
            <button type="button" class="btn btn-sm qty-dec">−</button>
            <span style="margin:0 8px;">${line.qty}</span>
            <button type="button" class="btn btn-sm qty-inc">+</button>
          </div>
        </div>
        <div class="price">${formatBDT(line.product.price * line.qty)}</div>
        <button type="button" class="btn btn-sm remove-line">Remove</button>
      </div>
    `).join('');
    checkoutBtn.style.pointerEvents = 'auto';
    checkoutBtn.style.opacity = '1';
  }

  const subtotal = cart.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const shipping = subtotal >= 3000 || subtotal === 0 ? 0 : 80;
  const tax = 0; // Set tax only after confirming applicable local requirements.
  document.getElementById('sum-subtotal').textContent = formatBDT(subtotal);
  document.getElementById('sum-shipping').textContent = shipping === 0 ? 'FREE' : formatBDT(shipping);
  document.getElementById('sum-tax').textContent = formatBDT(tax);
  document.getElementById('sum-total').textContent = formatBDT(subtotal + shipping + tax);

  wireLineButtons();
  refreshNavBadges();
}

function wireLineButtons() {
  document.querySelectorAll('.cart-line').forEach(line => {
    const productId = line.dataset.id, size = line.dataset.size;
    line.querySelector('.qty-inc').addEventListener('click', async () => {
      const qtySpan = line.querySelector('span');
      await api.put('/cart/update', { productId, size, qty: Number(qtySpan.textContent) + 1 });
      loadCart();
    });
    line.querySelector('.qty-dec').addEventListener('click', async () => {
      const qtySpan = line.querySelector('span');
      const newQty = Math.max(1, Number(qtySpan.textContent) - 1);
      await api.put('/cart/update', { productId, size, qty: newQty });
      loadCart();
    });
    line.querySelector('.remove-line').addEventListener('click', async () => {
      await api.del('/cart/remove', { productId, size });
      loadCart();
    });
  });
}

document.addEventListener('DOMContentLoaded', loadCart);
// ===== END: CART RENDER =====
