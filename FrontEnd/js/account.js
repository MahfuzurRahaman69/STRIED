// ===== START: ACCOUNT GUARD =====
document.addEventListener('DOMContentLoaded', async () => {
  if (!isLoggedIn()) {
    document.getElementById('account-guard').innerHTML =
      `<div class="error-msg">Please <a href="login.html" style="text-decoration:underline;">log in</a> to view your orders.</div>`;
    return;
  }
  await loadOrders();
});

document.getElementById('logout-btn').addEventListener('click', logout);
// ===== END: ACCOUNT GUARD =====

// ===== START: RENDER ORDER TRACKER =====
function renderTracker(order) {
  return `
    <div class="tracker">
      ${order.stages.map((label, i) => `
        <div class="tracker-step ${i <= order.trackingStage ? 'done' : ''}">
          <div class="bar"></div>
          <div class="dot"></div>
          <span>${label}</span>
        </div>
      `).join('')}
    </div>
  `;
}
// ===== END: RENDER ORDER TRACKER =====

// ===== START: LOAD & RENDER ORDERS =====
async function loadOrders() {
  const orders = await api.get('/orders');
  const list = document.getElementById('orders-list');
  const highlightId = new URLSearchParams(window.location.search).get('order');

  if (orders.length === 0) {
    list.innerHTML = `<div class="empty-state">No orders yet. <a href="products.html" style="text-decoration:underline;">Start shopping →</a></div>`;
    return;
  }

  list.innerHTML = orders.map(order => `
    <div class="order-card" id="order-${order.id}" style="${order.id === highlightId ? 'border-color:var(--accent);' : ''}">
      <div class="flex-between">
        <div>
          <strong>${order.id}</strong>
          <div style="font-size:.8rem; color:var(--ink-soft);">Placed ${new Date(order.placedAt).toLocaleString()}</div>
        </div>
        <span class="badge-status">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}</span>
      </div>

      ${renderTracker(order)}

      <div class="mt-16">
        ${order.items.map(i => `
          <div class="flex-between" style="font-size:.88rem; margin-bottom:4px;">
            <span>${i.name} × ${i.qty} (size ${i.size})</span>
            <span>${formatBDT(i.price * i.qty)}</span>
          </div>`).join('')}
      </div>

      <div class="flex-between mt-16">
        <strong>Total: ${formatBDT(order.total)}</strong>
        ${renderReturnControl(order)}
      </div>

      <div class="return-panel" id="return-panel-${order.id}" style="display:none; margin-top:14px;"></div>
    </div>
  `).join('');

  wireReturnButtons(orders);

  if (highlightId) {
    document.getElementById(`order-${highlightId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function renderReturnControl(order) {
  if (order.returnRequest) {
    return `<span class="badge-status" style="background:#eaf5ee; color:var(--sale);">Return: ${order.returnRequest.status}</span>`;
  }
  if (order.trackingStage < 4) {
    return `<span style="font-size:.78rem; color:var(--ink-soft);">Returns available after delivery</span>`;
  }
  return `<button class="btn btn-sm request-return-btn" data-order="${order.id}">Request Return</button>`;
}
// ===== END: LOAD & RENDER ORDERS =====

// ===== START: RETURN REQUEST FLOW =====
function wireReturnButtons(orders) {
  document.querySelectorAll('.request-return-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.dataset.order;
      const panel = document.getElementById(`return-panel-${orderId}`);
      panel.style.display = 'block';
      panel.innerHTML = `
        <div class="field">
          <label for="reason-${orderId}">Reason for return</label>
          <select id="reason-${orderId}">
            <option>Wrong size</option>
            <option>Doesn't fit as expected</option>
            <option>Item arrived damaged</option>
            <option>Changed my mind</option>
            <option>Other</option>
          </select>
        </div>
        <button class="btn btn-dark btn-sm" id="submit-return-${orderId}">Submit Return Request</button>
      `;
      document.getElementById(`submit-return-${orderId}`).addEventListener('click', async () => {
        try {
          await api.post(`/orders/${orderId}/return`, { reason: document.getElementById(`reason-${orderId}`).value });
          await loadOrders();
        } catch (err) {
          panel.innerHTML = `<div class="error-msg">${err.message}</div>`;
        }
      });
    });
  });
}
// ===== END: RETURN REQUEST FLOW =====
