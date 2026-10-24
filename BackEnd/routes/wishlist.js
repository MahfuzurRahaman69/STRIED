// ===== START: WISHLIST ROUTES =====
const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function ownerKey(req) {
  return req.user ? `u_${req.user.id}` : `g_${req.headers['x-guest-id'] || 'anon'}`;
}

// ----- GET wishlist -----
router.get('/', optionalAuth, (req, res) => {
  const db = readDB();
  const ids = db.wishlists[ownerKey(req)] || [];
  const items = db.products.filter(p => ids.includes(p.id));
  res.json(items);
});

// ----- POST add product to wishlist -----
router.post('/add', optionalAuth, (req, res) => {
  const { productId } = req.body;
  const db = readDB();
  const key = ownerKey(req);
  if (!db.wishlists[key]) db.wishlists[key] = [];
  if (!db.wishlists[key].includes(productId)) db.wishlists[key].push(productId);
  writeDB(db);
  res.json(db.products.filter(p => db.wishlists[key].includes(p.id)));
});

// ----- DELETE remove product from wishlist -----
router.delete('/remove', optionalAuth, (req, res) => {
  const { productId } = req.body;
  const db = readDB();
  const key = ownerKey(req);
  db.wishlists[key] = (db.wishlists[key] || []).filter(id => id !== productId);
  writeDB(db);
  res.json(db.products.filter(p => db.wishlists[key].includes(p.id)));
});

module.exports = router;
// ===== END: WISHLIST ROUTES =====
