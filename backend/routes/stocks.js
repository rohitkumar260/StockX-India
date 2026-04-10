const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getAllStocks, getStockPrice, getPriceHistory, getStockMeta, syncRealPrices
} = require('../services/priceSimulator');
const router = express.Router();

// GET /api/stocks - all stocks
router.get('/', protect, (req, res) => {
  const stocks = getAllStocks();
  res.json({ success: true, data: stocks, count: stocks.length });
});

// GET /api/stocks/sync - trigger real NSE price sync
router.get('/sync', protect, async (req, res) => {
  await syncRealPrices();
  res.json({ success: true, message: 'Prices synced from NSE' });
});

// GET /api/stocks/meta - stock metadata
router.get('/meta', protect, (req, res) => {
  res.json({ success: true, data: getStockMeta() });
});

// GET /api/stocks/:symbol - single stock
router.get('/:symbol', protect, (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = getStockPrice(symbol);
  if (!stock) return res.status(404).json({ error: `Stock ${symbol} not found` });

  const history = getPriceHistory(symbol, 'stock');
  res.json({ success: true, data: { ...stock, history } });
});

module.exports = router;
