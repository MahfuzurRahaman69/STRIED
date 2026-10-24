// ===== START: CART ROUTES =====
const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Works for both logged-in users (by user id) and guests (by x-guest-id header),
// so shoppers can build a cart before creating an account.
function ownerKey(req) {
  return req.user ? `u_${req.user.id}` : `g_${req.headers['x-guest-id'] || 'anon'}`;
}

// ----- GET current cart -----
router.get('/', optionalAuth, (req, res) => {
  const db = readDB();
  const cart = db.carts[ownerKey(req)] || [];
  res.json(hydrate(db, cart));
});

// ----- POST add item to cart -----
router.post('/add', optionalAuth, (req, res) => {
  const { productId, size, qty } = req.body;
  if (!productId || !size) return res.status(400).json({ error: 'Product and size are required.' });

  const db = readDB();
  const key = ownerKey(req);
  if (!db.carts[key]) db.carts[key] = [];

  const existing = db.carts[key].find(i => i.productId === productId && String(i.size) === String(size));
  if (existing) {
    existing.qty += qty || 1;
  } else {
    db.carts[key].push({ productId, size, qty: qty || 1 });
  }
  writeDB(db);
  res.json(hydrate(db, db.carts[key]));
});

// ----- PUT update item quantity -----
router.put('/update', optionalAuth, (req, res) => {
  const { productId, size, qty } = req.body;
  const db = readDB();
  const key = ownerKey(req);
  const cart = db.carts[key] || [];
  const item = cart.find(i => i.productId === productId && String(i.size) === String(size));
  if (!item) return res.status(404).json({ error: 'Item not in cart.' });
  item.qty = Math.max(1, qty);
  writeDB(db);
  res.json(hydrate(db, cart));
});

// ----- DELETE remove item from cart -----
router.delete('/remove', optionalAuth, (req, res) => {
  const { productId, size } = req.body;
  const db = readDB();
  const key = ownerKey(req);
  db.carts[key] = (db.carts[key] || []).filter(i => !(i.productId === productId && String(i.size) === String(size)));
  writeDB(db);
  res.json(hydrate(db, db.carts[key]));
});

// ----- DELETE clear entire cart (used after checkout) -----
router.delete('/clear', optionalAuth, (req, res) => {
  const db = readDB();
  db.carts[ownerKey(req)] = [];
  writeDB(db);
  res.json([]);
});

// Combine stored {productId, size, qty} lines with live product data (price, name, image)
function hydrate(db, cart) {
  return cart.map(line => {
    const product = db.products.find(p => p.id === line.productId);
    return {
      ...line,
      product: product ? {
        id: product.id, name: product.name, image: product.image,
        price: product.salePrice ?? product.price, stock: product.stock
      } : null
    };
  }).filter(l => l.product);
}

module.exports = router;
// ===== END: CART ROUTES =====
