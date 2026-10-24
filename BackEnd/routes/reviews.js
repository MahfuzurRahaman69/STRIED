// ===== START: REVIEW ROUTES =====
const express = require('express');
const { v4: uuid } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ----- GET reviews for a product -----
router.get('/:productId', (req, res) => {
  const db = readDB();
  const reviews = db.reviews
    .filter(r => r.productId === req.params.productId)
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(reviews);
});

// ----- POST a new review (requires login) -----
router.post('/:productId', requireAuth, (req, res) => {
  const { rating, title, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  const db = readDB();
  const product = db.products.find(p => p.id === req.params.productId);
  if (!product) return res.status(404).json({ error: 'Product not found.' });

  const review = {
    id: uuid(),
    productId: req.params.productId,
    userId: req.user.id,
    userName: req.user.name,
    rating: Number(rating),
    title: title || '',
    comment: comment || '',
    date: new Date().toISOString()
  };
  db.reviews.push(review);

  // Recalculate the product's aggregate rating
  const productReviews = db.reviews.filter(r => r.productId === product.id);
  product.reviewCount = productReviews.length;
  product.rating = Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1));

  writeDB(db);
  res.status(201).json(review);
});

module.exports = router;
// ===== END: REVIEW ROUTES =====
