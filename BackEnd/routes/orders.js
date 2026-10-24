// ===== START: ORDER ROUTES (CHECKOUT / HISTORY / TRACKING / RETURNS) =====
const express = require('express');
const { v4: uuid } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const TRACKING_STAGES = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

// Demo-only: derive a tracking stage from elapsed time since the order was
// placed, so the tracking page visibly progresses without needing a real
// warehouse/carrier integration. Replace with real carrier webhook data later.
function computeStage(placedAt) {
  const minutes = (Date.now() - new Date(placedAt).getTime()) / 60000;
  if (minutes < 1) return 0;
  if (minutes < 3) return 1;
  if (minutes < 6) return 2;
  if (minutes < 10) return 3;
  return 4;
}

// ----- POST /api/orders — place a new order (checkout) -----
router.post('/', requireAuth, (req, res) => {
  const { items, shippingAddress, paymentMethod, transactionId } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty.' });
  if (!shippingAddress || !shippingAddress.line1 || !shippingAddress.city) {
    return res.status(400).json({ error: 'A complete shipping address is required.' });
  }
  if (paymentMethod !== 'cod') {
    return res.status(400).json({ error: 'Only Cash on Delivery is enabled until a real payment gateway is configured.' });
  }

  const db = readDB();

  // Snapshot product details + validate stock at time of purchase
  const lineItems = [];
  for (const line of items) {
    const product = db.products.find(p => p.id === line.productId);
    if (!product) return res.status(404).json({ error: `Product ${line.productId} not found.` });
    if (product.stock < line.qty) return res.status(409).json({ error: `${product.name} is out of stock.` });
    lineItems.push({
      productId: product.id, name: product.name, image: product.image,
      size: line.size, qty: line.qty, price: product.salePrice ?? product.price
    });
    product.stock -= line.qty; // reduce inventory
  }

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shippingFee = subtotal >= 3000 ? 0 : 80; // Demo Bangladesh shipping settings; confirm with your courier.
  const tax = 0; // Confirm applicable tax requirements before launch.
  const total = Number((subtotal + shippingFee + tax).toFixed(2));

  const order = {
    id: 'ORD-' + uuid().slice(0, 8).toUpperCase(),
    userId: req.user.id,
    items: lineItems,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'pending (due on delivery)',
    transactionId: transactionId || null,
    subtotal, shippingFee, tax, total,
    placedAt: new Date().toISOString(),
    returnRequest: null
  };

  db.orders.push(order);
  db.carts[`u_${req.user.id}`] = []; // empty the cart after purchase
  writeDB(db);

  res.status(201).json({ ...order, trackingStage: 0, trackingLabel: TRACKING_STAGES[0], stages: TRACKING_STAGES });
});

// ----- GET /api/orders — order history for the logged-in user -----
router.get('/', requireAuth, (req, res) => {
  const db = readDB();
  const orders = db.orders
    .filter(o => o.userId === req.user.id)
    .sort((a, b) => new Date(b.placedAt) - new Date(a.placedAt))
    .map(o => {
      const stage = computeStage(o.placedAt);
      return { ...o, trackingStage: stage, trackingLabel: TRACKING_STAGES[stage], stages: TRACKING_STAGES };
    });
  res.json(orders);
});

// ----- GET /api/orders/:id — single order + live tracking -----
router.get('/:id', requireAuth, (req, res) => {
  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });
  const stage = computeStage(order.placedAt);
  res.json({ ...order, trackingStage: stage, trackingLabel: TRACKING_STAGES[stage], stages: TRACKING_STAGES });
});

// ----- POST /api/orders/:id/return — submit a return request -----
router.post('/:id/return', requireAuth, (req, res) => {
  const { reason, items } = req.body;
  if (!reason) return res.status(400).json({ error: 'Please describe the reason for the return.' });

  const db = readDB();
  const order = db.orders.find(o => o.id === req.params.id && o.userId === req.user.id);
  if (!order) return res.status(404).json({ error: 'Order not found.' });

  const stage = computeStage(order.placedAt);
  if (stage < 4) {
    return res.status(400).json({ error: 'Returns can only be requested after an order has been delivered.' });
  }
  if (order.returnRequest) {
    return res.status(409).json({ error: 'A return has already been requested for this order.' });
  }

  const returnRequest = {
    id: 'RET-' + uuid().slice(0, 8).toUpperCase(),
    orderId: order.id,
    userId: req.user.id,
    reason,
    items: items || order.items,
    status: 'Requested',
    requestedAt: new Date().toISOString()
  };
  order.returnRequest = returnRequest;
  db.returns.push(returnRequest);
  writeDB(db);

  res.status(201).json(returnRequest);
});

module.exports = router;
// ===== END: ORDER ROUTES (CHECKOUT / HISTORY / TRACKING / RETURNS) =====
