// ===== START: AUTH MIDDLEWARE =====
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'local-development-only-change-before-deploy';

// Blocks the request unless a valid JWT is supplied
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Login required.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired, please log in again.' });
  }
}

// Attaches req.user if a token is present, but doesn't block guests
// (used for cart/wishlist so guests can still shop with a session id)
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      req.user = null;
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
// ===== END: AUTH MIDDLEWARE =====
