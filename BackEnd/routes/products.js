// ===== START: PRODUCT ROUTES (LIST / SEARCH / FILTER / DETAIL) =====
const express = require('express');
const { readDB } = require('../utils/db');

const router = express.Router();

// ----- GET /api/products -----
// Supports: ?q=search text, ?category=men|women|kids|accessories,
// ?minPrice=, ?maxPrice=, ?size=, ?brand=, ?sort=price_asc|price_desc|rating|newest
router.get('/', (req, res) => {
  const db = readDB();
  let items = [...db.products];

  const { q, category, minPrice, maxPrice, size, brand, sort } = req.query;

  if (q) {
    const term = q.toLowerCase();
    items = items.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.description.toLowerCase().includes(term)
    );
  }
  if (category) {
    items = items.filter(p => p.category === category);
  }
  if (brand) {
    items = items.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  }
  if (size) {
    items = items.filter(p => p.sizes.map(String).includes(String(size)));
  }
  if (minPrice) {
    items = items.filter(p => (p.salePrice ?? p.price) >= Number(minPrice));
  }
  if (maxPrice) {
    items = items.filter(p => (p.salePrice ?? p.price) <= Number(maxPrice));
  }

  if (sort === 'price_asc') items.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
  else if (sort === 'price_desc') items.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
  else if (sort === 'rating') items.sort((a, b) => b.rating - a.rating);

  // available filter facets for the UI to render checkboxes/sliders
  const brands = [...new Set(db.products.map(p => p.brand))];
  const allSizes = [...new Set(db.products.flatMap(p => p.sizes.map(String)))].sort((a, b) => (isNaN(a) || isNaN(b)) ? a.localeCompare(b) : a - b);

  res.json({ items, total: items.length, facets: { brands, sizes: allSizes } });
});

// ----- GET /api/products/:id -----
router.get('/:id', (req, res) => {
  const db = readDB();
  const product = db.products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found.' });
  res.json(product);
});

module.exports = router;
// ===== END: PRODUCT ROUTES (LIST / SEARCH / FILTER / DETAIL) =====
