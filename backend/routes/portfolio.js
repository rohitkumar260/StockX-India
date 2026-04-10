const express = require('express');
const { protect } = require('../middleware/auth');
const Holding = require('../models/Holding');
const { getStockPrice, getCryptoPrice } = require('../services/priceSimulator');
const router = express.Router();

// GET /api/portfolio - user's holdings with current P&L
router.get('/', protect, async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user._id });

    let totalInvested = 0, totalCurrentValue = 0;

    const enriched = holdings.map(h => {
      const priceData = h.assetType === 'crypto'
        ? getCryptoPrice(h.symbol)
        : getStockPrice(h.symbol);

      const currentPrice = priceData?.price || h.avgPrice;
      const currentValue = parseFloat((currentPrice * h.quantity).toFixed(2));
      const pnl = parseFloat((currentValue - h.totalInvested).toFixed(2));
      const pnlPct = parseFloat(((pnl / h.totalInvested) * 100).toFixed(2));

      totalInvested += h.totalInvested;
      totalCurrentValue += currentValue;

      return {
        _id: h._id,
        symbol: h.symbol,
        assetType: h.assetType,
        quantity: h.quantity,
        avgPrice: h.avgPrice,
        currentPrice,
        totalInvested: h.totalInvested,
        currentValue,
        pnl,
        pnlPct,
        updatedAt: h.updatedAt
      };
    });

    const totalPnl = parseFloat((totalCurrentValue - totalInvested).toFixed(2));
    const totalPnlPct = totalInvested > 0
      ? parseFloat(((totalPnl / totalInvested) * 100).toFixed(2))
      : 0;

    res.json({
      success: true,
      data: enriched,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalPnl,
        totalPnlPct
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch portfolio.' });
  }
});

module.exports = router;
