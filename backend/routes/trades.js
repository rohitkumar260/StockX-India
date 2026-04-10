const express = require('express');
const { protect } = require('../middleware/auth');
const Trade = require('../models/Trade');
const Holding = require('../models/Holding');
const User = require('../models/User');
const { getStockPrice, getCryptoPrice } = require('../services/priceSimulator');
const router = express.Router();

// POST /api/trades/buy
router.post('/buy', protect, async (req, res) => {
  try {
    const { symbol, quantity, assetType = 'stock' } = req.body;
    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({ error: 'Symbol and valid quantity required.' });

    const sym = symbol.toUpperCase();
    const priceData = assetType === 'crypto' ? getCryptoPrice(sym) : getStockPrice(sym);
    if (!priceData) return res.status(404).json({ error: `${sym} not found.` });

    const price = priceData.price;
    const total = parseFloat((price * quantity).toFixed(2));
    const charges = parseFloat((total * (assetType === 'crypto' ? 0.002 : 0.001)).toFixed(2));
    const totalWithCharges = total + charges;

    // Check balance
    const user = await User.findById(req.user._id);
    if (user.balance < totalWithCharges)
      return res.status(400).json({ error: 'Insufficient balance.' });

    // Deduct balance
    user.balance = parseFloat((user.balance - totalWithCharges).toFixed(2));
    await user.save();

    // Update or create holding
    let holding = await Holding.findOne({ user: req.user._id, symbol: sym });
    if (holding) {
      const newTotal = holding.avgPrice * holding.quantity + price * quantity;
      holding.quantity = parseFloat((holding.quantity + parseFloat(quantity)).toFixed(6));
      holding.avgPrice = parseFloat((newTotal / holding.quantity).toFixed(2));
      holding.totalInvested = parseFloat((holding.totalInvested + total).toFixed(2));
    } else {
      holding = new Holding({
        user: req.user._id,
        symbol: sym,
        assetType,
        quantity: parseFloat(quantity),
        avgPrice: price,
        totalInvested: total
      });
    }
    await holding.save();

    // Record trade
    const trade = await Trade.create({
      user: req.user._id,
      symbol: sym,
      type: 'buy',
      assetType,
      quantity: parseFloat(quantity),
      price,
      total,
      charges,
      status: 'executed'
    });

    res.json({
      success: true,
      message: `Bought ${quantity} ${sym} @ ₹${price}`,
      trade,
      newBalance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Trade execution failed.' });
  }
});

// POST /api/trades/sell
router.post('/sell', protect, async (req, res) => {
  try {
    const { symbol, quantity, assetType = 'stock' } = req.body;
    if (!symbol || !quantity || quantity <= 0)
      return res.status(400).json({ error: 'Symbol and valid quantity required.' });

    const sym = symbol.toUpperCase();
    const priceData = assetType === 'crypto' ? getCryptoPrice(sym) : getStockPrice(sym);
    if (!priceData) return res.status(404).json({ error: `${sym} not found.` });

    const price = priceData.price;

    // Check holding
    const holding = await Holding.findOne({ user: req.user._id, symbol: sym });
    if (!holding || holding.quantity < quantity)
      return res.status(400).json({ error: 'Insufficient holdings.' });

    const total = parseFloat((price * quantity).toFixed(2));
    const charges = parseFloat((total * (assetType === 'crypto' ? 0.002 : 0.001)).toFixed(2));
    const received = total - charges;

    // Update holding
    holding.quantity = parseFloat((holding.quantity - parseFloat(quantity)).toFixed(6));
    if (holding.quantity <= 0.000001) {
      await Holding.deleteOne({ _id: holding._id });
    } else {
      holding.totalInvested = parseFloat((holding.avgPrice * holding.quantity).toFixed(2));
      await holding.save();
    }

    // Add to balance
    const user = await User.findById(req.user._id);
    user.balance = parseFloat((user.balance + received).toFixed(2));
    await user.save();

    // Record trade
    const trade = await Trade.create({
      user: req.user._id,
      symbol: sym,
      type: 'sell',
      assetType,
      quantity: parseFloat(quantity),
      price,
      total,
      charges,
      status: 'executed'
    });

    res.json({
      success: true,
      message: `Sold ${quantity} ${sym} @ ₹${price}`,
      trade,
      newBalance: user.balance
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Trade execution failed.' });
  }
});

// GET /api/trades - order history
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const trades = await Trade.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Trade.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: trades,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trades.' });
  }
});

module.exports = router;
