const express = require('express');
const { protect } = require('../middleware/auth');
const { getAllCrypto, getCryptoPrice, getPriceHistory } = require('../services/priceSimulator');
const router = express.Router();

// GET /api/crypto - all crypto
router.get('/', (req, res) => {
  const coins = getAllCrypto();
  res.json({ success: true, data: coins, count: coins.length });
});

// GET /api/crypto/:symbol
router.get('/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const coin = getCryptoPrice(symbol);
  if (!coin) return res.status(404).json({ error: `Crypto ${symbol} not found` });

  const history = getPriceHistory(symbol, 'crypto');
  res.json({ success: true, data: { ...coin, history } });
});

module.exports = router;
