// ===== START: AUTH ROUTES (REGISTER / LOGIN) =====
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const { readDB, writeDB } = require('../utils/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ----- Register a new customer -----
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are all required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const hashed = bcrypt.hashSync(password, 10);
  const user = {
    id: uuid(),
    name,
    email: email.toLowerCase(),
    password: hashed,
    addresses: [],
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  writeDB(db);

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ----- Log in an existing customer -----
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// ----- Get current logged-in user's profile -----
router.get('/me', requireAuth, (req, res) => {
  const db = readDB();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ id: user.id, name: user.name, email: user.email, addresses: user.addresses || [] });
});

module.exports = router;
// ===== END: AUTH ROUTES (REGISTER / LOGIN) =====
