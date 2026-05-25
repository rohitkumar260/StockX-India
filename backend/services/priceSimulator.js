const axios = require("axios");
const mongoose = require("mongoose");
// ✅ NEW
const Holding = require("../models/Holding");
const Trade = require("../models/Trade");
const User = require("../models/User");

// NSE Stocks with realistic base prices (INR)
const STOCKS = {
  RELIANCE: { name: "Reliance Industries", base: 2808, sector: "Energy" },
  TCS: { name: "Tata Consultancy Services", base: 3820, sector: "IT" },
  INFY: { name: "Infosys Ltd", base: 1642, sector: "IT" },
  HDFC: { name: "HDFC Bank", base: 1724, sector: "Banking" },
  ICICI: { name: "ICICI Bank", base: 1186, sector: "Banking" },
  WIPRO: { name: "Wipro Ltd", base: 542, sector: "IT" },
  SBIN: { name: "State Bank of India", base: 836, sector: "Banking" },
  BAJFINANCE: { name: "Bajaj Finance", base: 7252, sector: "Finance" },
  HCLTECH: { name: "HCL Technologies", base: 1890, sector: "IT" },
  LT: { name: "Larsen & Toubro", base: 3540, sector: "Infrastructure" },
  MARUTI: { name: "Maruti Suzuki", base: 12400, sector: "Auto" },
  TITAN: { name: "Titan Company", base: 3280, sector: "Consumer" },
  ADANIPORTS: { name: "Adani Ports", base: 1280, sector: "Logistics" },
  SUNPHARMA: { name: "Sun Pharmaceutical", base: 1640, sector: "Pharma" },
  ULTRACEMCO: { name: "UltraTech Cement", base: 10800, sector: "Cement" },
  KOTAKBANK: { name: "Kotak Mahindra Bank", base: 1800, sector: "Banking" },
  AXISBANK: { name: "Axis Bank", base: 1150, sector: "Banking" },
  ASIANPAINT: { name: "Asian Paints", base: 2850, sector: "Consumer" },
  TATAMOTORS: { name: "Tata Motors", base: 950, sector: "Auto" },
  TATASTEEL: { name: "Tata Steel", base: 165, sector: "Metals" },
  BHARTIARTL: { name: "Bharti Airtel", base: 1650, sector: "Telecom" },
  ONGC: { name: "Oil & Natural Gas Corp", base: 285, sector: "Energy" },
  NTPC: { name: "NTPC Ltd", base: 375, sector: "Energy" },
  POWERGRID: { name: "Power Grid Corp", base: 320, sector: "Energy" },
  NESTLEIND: { name: "Nestle India", base: 24500, sector: "FMCG" },
  HINDALCO: { name: "Hindalco Industries", base: 680, sector: "Metals" },
  JSWSTEEL: { name: "JSW Steel", base: 950, sector: "Metals" },
  TECHM: { name: "Tech Mahindra", base: 1650, sector: "IT" },
  DRREDDY: { name: "Dr Reddy's Labs", base: 6800, sector: "Pharma" },
  DIVISLAB: { name: "Divi's Laboratories", base: 5800, sector: "Pharma" },
};

const CRYPTO = {
  BTC: { name: "Bitcoin", base: 6850000 },
  ETH: { name: "Ethereum", base: 280000 },
  BNB: { name: "Binance Coin", base: 52000 },
  SOL: { name: "Solana", base: 14200 },
  XRP: { name: "Ripple", base: 520 },
  ADA: { name: "Cardano", base: 43 },
  DOGE: { name: "Dogecoin", base: 18 },
  MATIC: { name: "Polygon", base: 95 },
  AVAX: { name: "Avalanche", base: 3200 },
  DOT: { name: "Polkadot", base: 820 },
  LINK: { name: "Chainlink", base: 1450 },
  LTC: { name: "Litecoin", base: 8500 },
  ATOM: { name: "Cosmos", base: 950 },
  UNI: { name: "Uniswap", base: 1200 },
  SHIB: { name: "Shiba Inu", base: 0.2 },
  TRX: { name: "Tron", base: 22 },
  NEAR: { name: "Near Protocol", base: 550 },
  FTM: { name: "Fantom", base: 85 },
  SAND: { name: "The Sandbox", base: 42 },
  MANA: { name: "Decentraland", base: 38 },
  ALGO: { name: "Algorand", base: 18 },
  VET: { name: "VeChain", base: 4 },
  HBAR: { name: "Hedera", base: 12 },
  APT: { name: "Aptos", base: 850 },
  ARB: { name: "Arbitrum", base: 120 },
  OP: { name: "Optimism", base: 220 },
  INJ: { name: "Injective", base: 2800 },
  SUI: { name: "Sui", base: 180 },
  TON: { name: "Toncoin", base: 520 },
  FIL: { name: "Filecoin", base: 580 },
};

// In-memory live prices
let livePrices = {};
let liveCryptoPrices = {};
let priceHistory = {}; // last 50 prices per symbol

function initPrices() {
  Object.keys(STOCKS).forEach((sym) => {
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
      updatedAt: new Date(),
    };
    priceHistory[sym] = [];
  });

  Object.keys(CRYPTO).forEach((sym) => {
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
      updatedAt: new Date(),
    };
    priceHistory["CRYPTO_" + sym] = [];
  });
}

function fluctuate() {
  const now = new Date();

  Object.keys(livePrices).forEach((sym) => {
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

  Object.keys(liveCryptoPrices).forEach((sym) => {
    const c = liveCryptoPrices[sym];
    const change = (Math.random() - 0.48) * 0.006;
    c.price = Math.round(c.price * (1 + change));
    c.high = Math.max(c.high, c.price);
    c.low = Math.min(c.low, c.price);
    c.change = c.price - c.open;
    c.changePct = parseFloat(((c.change / c.open) * 100).toFixed(2));
    c.updatedAt = now;

    priceHistory["CRYPTO_" + sym].push({ price: c.price, time: now });
    if (priceHistory["CRYPTO_" + sym].length > 100)
      priceHistory["CRYPTO_" + sym].shift();
  });
}

// ✅ NEW — Stop Loss / Target Price checker
async function checkStopLossAndTarget() {
  try {
    // Sirf wo holdings lo jisme stopLoss ya targetPrice set hai
    const holdings = await Holding.find({
      $or: [
        { stopLoss: { $ne: null }, stopLossTriggered: false },
        { targetPrice: { $ne: null }, targetTriggered: false },
      ],
    }).populate("user");

    for (const holding of holdings) {
      const sym = holding.symbol;
      const assetType = holding.assetType;

      // Current price lo
      const priceData =
        assetType === "crypto" ? liveCryptoPrices[sym] : livePrices[sym];

      if (!priceData) continue;

      const currentPrice = priceData.price;
      let triggered = false;
      let reason = "";

      // ✅ PEHLE Target check karo
      if (
        holding.targetPrice &&
        !holding.targetTriggered &&
        currentPrice >= holding.targetPrice
      ) {
        triggered = true;
        reason = "target";
        holding.targetTriggered = true;
      }
      // ✅ SIRF TAB SL check karo jab TP trigger NA hua ho
      else if (
        holding.stopLoss &&
        !holding.stopLossTriggered &&
        currentPrice <= holding.stopLoss
      ) {
        triggered = true;
        reason = "stopLoss";
        holding.stopLossTriggered = true;
      }

      // ✅ Agar dono ek saath trigger ho jayein toh target ko priority do
      if (holding.stopLossTriggered && holding.targetTriggered) {
        holding.stopLossTriggered = false; // SL reset karo
        reason = "target"; // Target ko priority
      }

      if (!triggered) continue;

      // ✅ Auto sell karo
      const quantity = holding.quantity;
      const total = parseFloat((currentPrice * quantity).toFixed(2));
      const charges = parseFloat(
        (total * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
      );
      const received = total - charges;
      const profitLoss = parseFloat(
        (received - holding.totalInvested).toFixed(2),
      );

      // Balance wapas karo user ko
      const user = await User.findById(holding.user._id);
      user.balance = parseFloat((user.balance + received).toFixed(2));
      await user.save();

      // Trade record banao
      await Trade.create({
        user: holding.user._id,
        symbol: sym,
        type: "sell",
        assetType,
        quantity,
        price: currentPrice,
        total,
        charges,
        status: "executed",
        stopLoss: holding.stopLoss,
        targetPrice: holding.targetPrice,
        // ✅ NEW — actual reason save karo
        triggerReason: reason, // "stopLoss" ya "target"
      });

      // Holding delete karo
      await Holding.deleteOne({ _id: holding._id });

      console.log(
        `🤖 Auto-Exit [${reason.toUpperCase()}] | ${sym} | Price: ₹${currentPrice} | P&L: ₹${profitLoss} | User: ${user.email}`,
      );
    }

    // ── SHORT positions ──────────────────────────
    const ShortPosition = require("../models/ShortPosition");

    const shorts = await ShortPosition.find({
      status: "open",
      $or: [
        { stopLoss: { $ne: null }, stopLossTriggered: false },
        { targetPrice: { $ne: null }, targetTriggered: false },
      ],
    }).populate("user");

    for (const short of shorts) {
      const sym = short.symbol;
      const assetType = short.assetType;
      const priceData =
        assetType === "crypto" ? liveCryptoPrices[sym] : livePrices[sym];

      if (!priceData) continue;
      const currentPrice = priceData.price;
      let triggered = false;
      let reason = "";

      // ✅ SHORT — Pehle TP check karo (price niche gayi)
      if (
        short.targetPrice &&
        !short.targetTriggered &&
        currentPrice <= short.targetPrice
      ) {
        triggered = true;
        reason = "target";
        short.targetTriggered = true;
      }
      // ✅ SHORT — Phir SL check karo (price upar gayi)
      else if (
        short.stopLoss &&
        !short.stopLossTriggered &&
        currentPrice >= short.stopLoss
      ) {
        triggered = true;
        reason = "stopLoss";
        short.stopLossTriggered = true;
      }

      if (!triggered) continue;

      // Auto exit short
      const quantity = short.quantity;
      const exitTotal = parseFloat((currentPrice * quantity).toFixed(2));
      const charges = parseFloat(
        (exitTotal * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
      );
      const exitCost = exitTotal + charges;
      const profitLoss = parseFloat(
        (short.totalReceived - exitCost).toFixed(2),
      );

      // Balance update
      const user = await User.findById(short.user._id);
      user.balance = parseFloat(
        (user.balance + short.totalReceived + profitLoss).toFixed(2),
      );
      await user.save();

      // Trade record
      await Trade.create({
        user: short.user._id,
        symbol: sym,
        type: "sell",
        assetType,
        quantity,
        price: currentPrice,
        total: exitTotal,
        charges,
        status: "executed",
        stopLoss: short.stopLoss,
        targetPrice: short.targetPrice,
        triggerReason: reason,
      });

      // Short close karo
      short.status = "closed";
      await short.save();

      console.log(
        `🤖 SHORT [${reason.toUpperCase()}] | ${sym} | ₹${currentPrice} | P&L: ₹${profitLoss}`,
      );
    }
  } catch (err) {
    console.error("Stop loss checker error:", err.message);
  }
}

function startPriceSimulator() {
  console.log("📈 Price simulator started");
  initPrices();
  setInterval(fluctuate, 3000); // update every 3 seconds
  // ✅ NEW — har 5 second me check karo
  setInterval(checkStopLossAndTarget, 5000);
}

// Try to fetch real NSE data from Yahoo Finance (free, no API key needed)
async function fetchRealNSEPrice(symbol) {
  try {
    const yahooSym = symbol + ".NS"; // NSE symbol format
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSym}?interval=1d&range=1d`;
    const res = await axios.get(url, {
      timeout: 5000,
      headers: { "User-Agent": "Mozilla/5.0" },
    });
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
      livePrices[sym].change = parseFloat(
        (realPrice - livePrices[sym].open).toFixed(2),
      );
      livePrices[sym].changePct = parseFloat(
        ((livePrices[sym].change / livePrices[sym].open) * 100).toFixed(2),
      );
    }
    await new Promise((r) => setTimeout(r, 500)); // small delay between requests
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

function getPriceHistory(symbol, assetType = "stock") {
  const key = assetType === "crypto" ? "CRYPTO_" + symbol : symbol;
  return priceHistory[key] || [];
}

function getStockMeta() {
  return STOCKS;
}
function getCryptoMeta() {
  return CRYPTO;
}

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
  // ✅ NEW
  checkStopLossAndTarget,
};
