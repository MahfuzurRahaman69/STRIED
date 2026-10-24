// Checkout is intentionally COD-only until a real, approved payment gateway is integrated.
let checkoutCart = [];
const SHIPPING_FEE_BDT = 80;
const FREE_SHIPPING_THRESHOLD_BDT = 3000;

function calculateShipping(subtotal) {
  return subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_BDT ? 0 : SHIPPING_FEE_BDT;
}

function showCheckoutError(message) {
  const msg = document.getElementById('checkout-msg');
  // Avoid inserting untrusted server messages as HTML.
  msg.textContent = message;
  msg.className = 'error-msg';
}

document.addEventListener('DOMContentLoaded', async () => {
  const placeBtn = document.getElementById('place-order');
  if (!isLoggedIn()) {
    showCheckoutError('Please log in to check out.');
    placeBtn.disabled = true;
    return;
  }

  try {
    checkoutCart = await api.get('/cart');
    if (!checkoutCart.length) {
      document.getElementById('checkout-lines').textContent = 'Your cart is empty.';
      placeBtn.disabled = true;
      return;
    }
    document.getElementById('checkout-lines').innerHTML = checkoutCart.map(l =>
      `<div class="flex-between" style="font-size:.85rem; margin-bottom:6px;">
         <span>${l.product.name} × ${l.qty} (size ${l.size})</span>
         <span>${formatBDT(l.product.price * l.qty)}</span>
       </div>`).join('');
    const subtotal = checkoutCart.reduce((s, l) => s + l.product.price * l.qty, 0);
    const shipping = calculateShipping(subtotal);
    const tax = 0;
    document.getElementById('co-subtotal').textContent = formatBDT(subtotal);
    document.getElementById('co-shipping').textContent = shipping === 0 ? 'FREE' : formatBDT(shipping);
    document.getElementById('co-tax').textContent = formatBDT(tax);
    document.getElementById('co-total').textContent = formatBDT(subtotal + shipping + tax);
  } catch (err) {
    showCheckoutError(err.message || 'Could not load your cart. Please try again.');
    placeBtn.disabled = true;
  }
});

document.getElementById('place-order').addEventListener('click', async () => {
  const msg = document.getElementById('checkout-msg');
  msg.textContent = '';
  const address = {
    name: document.getElementById('addr-name').value.trim(),
    line1: document.getElementById('addr-line1').value.trim(),
    city: document.getElementById('addr-city').value.trim(),
    zip: document.getElementById('addr-zip').value.trim(),
    phone: document.getElementById('addr-phone').value.trim()
  };
  if (!address.name || !address.line1 || !address.city || !address.zip || !address.phone) {
    showCheckoutError('Please fill in your complete shipping address.');
    return;
  }

  const placeBtn = document.getElementById('place-order');
  placeBtn.disabled = true;
  placeBtn.textContent = 'Placing order…';
  try {
    const order = await api.post('/orders', {
      items: checkoutCart.map(l => ({ productId: l.productId, size: l.size, qty: l.qty })),
      shippingAddress: address,
      paymentMethod: 'cod',
      transactionId: null
    });
    window.location.href = `account.html?order=${encodeURIComponent(order.id)}`;
  } catch (err) {
    showCheckoutError(err.message || 'Could not place your order. Please try again.');
    placeBtn.disabled = false;
    placeBtn.textContent = 'Place Order';
  }
});
