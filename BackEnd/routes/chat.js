// ===== START: LIVE CHAT ROUTES (DEMO BOT) =====
// This simulates a live-chat widget with instant canned replies so the UI is
// fully functional. To connect a real agent, swap this for a websocket
// (e.g. Socket.IO) or a live-chat provider (Intercom, Zendesk, Tidio, etc).
const express = require('express');
const { readDB, writeDB } = require('../utils/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

function ownerKey(req) {
  return req.user ? `u_${req.user.id}` : `g_${req.headers['x-guest-id'] || 'anon'}`;
}

const CANNED_REPLIES = [
  { match: /order|track|shipping|deliver/i, reply: "You can track any order's live status from the 'My Orders' page in your account. Want me to pull up your latest order?" },
  { match: /return|refund/i, reply: 'Returns are free within 30 days of delivery. Once an order is marked "Delivered", a "Request Return" button appears on that order.' },
  { match: /size|fit/i, reply: 'Each product page has a "Size Chart" tab with measurements in US, EU and UK sizing. Between sizes? We usually recommend sizing up for wide feet.' },
  { match: /payment|pay|card|cod|cash/i, reply: 'We accept major cards online, plus Cash on Delivery for eligible addresses — just pick "Cash on Delivery" at checkout.' },
  { match: /hi|hello|hey/i, reply: "Hi there! I'm the Stride support assistant. Ask me about sizing, orders, returns, or shipping." }
];
const DEFAULT_REPLY = "Thanks for the message! A human agent isn't needed for most questions — try asking about sizing, orders, returns, or payments, or email support@stride-demo.com.";

// ----- GET chat history -----
router.get('/', optionalAuth, (req, res) => {
  const db = readDB();
  res.json(db.chats[ownerKey(req)] || []);
});

// ----- POST send a chat message, get an instant bot reply -----
router.post('/', optionalAuth, (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  const db = readDB();
  const key = ownerKey(req);
  if (!db.chats[key]) db.chats[key] = [];

  const userMsg = { from: 'user', text: message.trim(), at: new Date().toISOString() };
  const found = CANNED_REPLIES.find(c => c.match.test(message));
  const botMsg = { from: 'bot', text: found ? found.reply : DEFAULT_REPLY, at: new Date().toISOString() };

  db.chats[key].push(userMsg, botMsg);
  writeDB(db);
  res.json([userMsg, botMsg]);
});

module.exports = router;
// ===== END: LIVE CHAT ROUTES (DEMO BOT) =====
