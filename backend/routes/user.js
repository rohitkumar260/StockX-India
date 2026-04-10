const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// GET /api/user/profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, user });
});

// PATCH /api/user/watchlist/add
router.patch('/watchlist/add', protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol required.' });
    const user = await User.findById(req.user._id);
    if (!user.watchlist.includes(symbol.toUpperCase())) {
      user.watchlist.push(symbol.toUpperCase());
      await user.save();
    }
    res.json({ success: true, watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update watchlist.' });
  }
});

// PATCH /api/user/watchlist/remove
router.patch('/watchlist/remove', protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter(s => s !== symbol.toUpperCase());
    await user.save();
    res.json({ success: true, watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update watchlist.' });
  }
});

// GET /api/user/balance
router.get('/balance', protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  res.json({ success: true, balance: user.balance });
});

module.exports = router;
