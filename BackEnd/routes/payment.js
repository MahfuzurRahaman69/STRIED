// Online payments are deliberately disabled until a real payment provider is integrated.
const express = require('express');
const router = express.Router();
router.post('/charge', (req, res) => {
  res.status(503).json({ success: false, error: 'Online card payments are not enabled. Please use Cash on Delivery.' });
});
module.exports = router;
