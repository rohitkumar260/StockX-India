const axios = require('axios');

// NSE Stocks with realistic base prices (INR)
const STOCKS = {
  RELIANCE:   { name: 'Reliance Industries', base: 2808, sector: 'Energy' },
  TCS:        { name: 'Tata Consultancy Services', base: 3820, sector: 'IT' },
  INFY:       { name: 'Infosys Ltd', base: 1642, sector: 'IT' },
  HDFC:       { name: 'HDFC Bank', base: 1724, sector: 'Banking' },
  ICICI:      { name: 'ICICI Bank', base: 1186, sector: 'Banking' },
  WIPRO:      { name: 'Wipro Ltd', base: 542, sector: 'IT' },
  SBIN:       { name: 'State Bank of India', base: 836, sector: 'Banking' },
  BAJFINANCE: { name: 'Bajaj Finance', base: 7252, sector: 'Finance' },
  HCLTECH:    { name: 'HCL Technologies', base: 1890, sector: 'IT' },
  LT:         { name: 'Larsen & Toubro', base: 3540, sector: 'Infrastructure' },
  MARUTI:     { name: 'Maruti Suzuki', base: 12400, sector: 'Auto' },
  TITAN:      { name: 'Titan Company', base: 3280, sector: 'Consumer' },
  ADANIPORTS: { name: 'Adani Ports', base: 1280, sector: 'Logistics' },
  SUNPHARMA:  { name: 'Sun Pharmaceutical', base: 1640, sector: 'Pharma' },
  ULTRACEMCO: { name: 'UltraTech Cement', base: 10800, sector: 'Cement' },
};

const CRYPTO = {
  BTC:  { name: 'Bitcoin', base: 6850000 },
  ETH:  { name: 'Ethereum', base: 280000 },
  BNB:  { name: 'Binance Coin', base: 52000 },
  SOL:  { name: 'Solana', base: 14200 },
  XRP:  { name: 'Ripple', base: 520 },
  ADA:  { name: 'Cardano', base: 43 },
  DOGE: { name: 'Dogecoin', base: 18 },
  MATIC:{ name: 'Polygon', base: 95 },
};

// In-memory live prices
let livePrices = {};
let liveCryptoPrices = {};
let priceHistory = {}; // last 50 prices per symbol

function initPrices() {
  Object.keys(STOCKS).forEach(sym => {
    const base = STOCKS[sym].base;
    livePrices[sym] = {
      symbol: sym,
      name: STOCKS[sym].name,
      sector: STOCKS[sym].sector,
      price: parseFloat((base * (1 + (Math.random() - 0.5) * 0.04)).toFixed(2)),
      open: base,
      high: base,
      low: base,
      change: 0,
      changePct: 0,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      updatedAt: new Date()
    };
    priceHistory[sym] = [];
  });

  Object.keys(CRYPTO).forEach(sym => {
    const base = CRYPTO[sym].base;
    liveCryptoPrices[sym] = {
      symbol: sym,
      name: CRYPTO[sym].name,
      price: Math.round(base * (1 + (Math.random() - 0.5) * 0.06)),
      open: base,
      high: base,
      low: base,
      change: 0,
      changePct: 0,
      updatedAt: new Date()
    };
    priceHistory['CRYPTO_' + sym] = [];
  });
}

function fluctuate() {
  const now = new Date();

  Object.keys(livePrices).forEach(sym => {
    const s = livePrices[sym];
    const change = (Math.random() - 0.48) * 0.004;
    s.price = parseFloat((s.price * (1 + change)).toFixed(2));
    s.high = Math.max(s.high, s.price);
    s.low = Math.min(s.low, s.price);
    s.change = parseFloat((s.price - s.open).toFixed(2));
    s.changePct = parseFloat(((s.change / s.open) * 100).toFixed(2));
    s.volume += Math.floor(Math.random() * 5000);
    s.updatedAt = now;

    // store history (max 100 points)
    priceHistory[sym].push({ price: s.price, time: now });
    if (priceHistory[sym].length > 100) priceHistory[sym].shift();
  });

  Object.keys(liveCryptoPrices).forEach(sym => {
    const c = liveCryptoPrices[sym];
    const change = (Math.random() - 0.48) * 0.006;
    c.price = Math.round(c.price * (1 + change));
    c.high = Math.max(c.high, c.price);
    c.low = Math.min(c.low, c.price);
    c.change = c.price - c.open;
    c.changePct = parseFloat(((c.change / c.open) * 100).toFixed(2));
    c.updatedAt = now;

    priceHistory['CRYPTO_' + sym].push({ price: c.price, time: now });
    if (priceHistory['CRYPTO_' + sym].length > 100) priceHistory['CRYPTO_' + sym].shift();
  });
}

function startPriceSimulator() {
  console.log('📈 Price simulator started');
  initPrices();
  setInterval(fluctuate, 3000); // update every 3 seconds
}

// Try to fetch real NSE data from Yahoo Finance (free, no API key needed)
async function fetchRealNSEPrice(symbol) {
  try {
    const yahooSym = symbol + '.NS'; // NSE symbol format
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=1d`;
    const res = await axios.get(url, { timeout: 5000, headers: { 'User-Agent': 'Mozilla/5.0' } });
    const quote = res.data?.chart?.result?.[0]?.meta;
    if (quote?.regularMarketPrice) {
      return quote.regularMarketPrice;
    }
  } catch (e) {
    // Fallback to simulated price
  }
  return null;
}

async function syncRealPrices() {
  const symbols = Object.keys(STOCKS).slice(0, 5); // sync top 5 only (rate limit)
  for (const sym of symbols) {
    const realPrice = await fetchRealNSEPrice(sym);
    if (realPrice && livePrices[sym]) {
      livePrices[sym].price = realPrice;
      livePrices[sym].change = parseFloat((realPrice - livePrices[sym].open).toFixed(2));
      livePrices[sym].changePct = parseFloat(((livePrices[sym].change / livePrices[sym].open) * 100).toFixed(2));
    }
    await new Promise(r => setTimeout(r, 500)); // small delay between requests
  }
}

// Getters for routes
function getStockPrice(symbol) {
  return livePrices[symbol.toUpperCase()] || null;
}

function getAllStocks() {
  return Object.values(livePrices);
}

function getCryptoPrice(symbol) {
  return liveCryptoPrices[symbol.toUpperCase()] || null;
}

function getAllCrypto() {
  return Object.values(liveCryptoPrices);
}

function getPriceHistory(symbol, assetType = 'stock') {
  const key = assetType === 'crypto' ? 'CRYPTO_' + symbol : symbol;
  return priceHistory[key] || [];
}

function getStockMeta() { return STOCKS; }
function getCryptoMeta() { return CRYPTO; }

module.exports = {
  startPriceSimulator,
  syncRealPrices,
  getStockPrice,
  getAllStocks,
  getCryptoPrice,
  getAllCrypto,
  getPriceHistory,
  getStockMeta,
  getCryptoMeta,
};
