// ===== START: SERVER SETUP =====
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const reviewRoutes = require('./routes/reviews');
const cartRoutes = require('./routes/cart');
const wishlistRoutes = require('./routes/wishlist');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payment');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
  throw new Error('Set JWT_SECRET to a random secret of at least 32 characters in production.');
}

app.use(cors());
app.use(express.json());
// ===== END: SERVER SETUP =====

app.get('/health', (req, res) => res.json({ ok: true }));

// ===== START: API ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/chat', chatRoutes);
// ===== END: API ROUTES =====

// ===== START: STATIC FRONTEND =====
// Serves the plain HTML/CSS/JS frontend from ../frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));
// ===== END: STATIC FRONTEND =====

// ===== START: ERROR HANDLING =====
app.use((req, res) => res.status(404).json({ error: 'Not found.' }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});
// ===== END: ERROR HANDLING =====

// ===== START: START SERVER =====
app.listen(PORT, () => {
  console.log(`Stride shoe store API + frontend listening on port ${PORT}`);
});
// ===== END: START SERVER =====
