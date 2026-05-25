const express = require("express");
const { protect } = require("../middleware/auth");
const Trade = require("../models/Trade");
const Holding = require("../models/Holding");
const User = require("../models/User");
const { getStockPrice, getCryptoPrice } = require("../services/priceSimulator");
const router = express.Router();

// POST /api/trades/buy
router.post("/buy", protect, async (req, res) => {
  try {
    const {
      symbol,
      quantity,
      assetType = "stock",
      stopLoss,
      targetPrice,
    } = req.body;
    if (!symbol || !quantity || quantity <= 0)
      return res
        .status(400)
        .json({ error: "Symbol and valid quantity required." });

    const sym = symbol.toUpperCase();
    const priceData =
      assetType === "crypto" ? getCryptoPrice(sym) : getStockPrice(sym);
    if (!priceData) return res.status(404).json({ error: `${sym} not found.` });

    const price = priceData.price;
    const total = parseFloat((price * quantity).toFixed(2));
    const charges = parseFloat(
      (total * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
    );
    const totalWithCharges = total + charges;

    // Check balance
    const user = await User.findById(req.user._id);
    if (user.balance < totalWithCharges)
      return res.status(400).json({ error: "Insufficient balance." });

    // Deduct balance
    user.balance = parseFloat((user.balance - totalWithCharges).toFixed(2));
    await user.save();

    // Update or create holding
    let holding = await Holding.findOne({ user: req.user._id, symbol: sym });
    if (holding) {
      const newTotal = holding.avgPrice * holding.quantity + price * quantity;
      holding.quantity = parseFloat(
        (holding.quantity + parseFloat(quantity)).toFixed(6),
      );
      holding.avgPrice = parseFloat((newTotal / holding.quantity).toFixed(2));
      holding.totalInvested = parseFloat(
        (holding.totalInvested + total).toFixed(2),
      );
      // ✅ NEW
      if (stopLoss) holding.stopLoss = parseFloat(stopLoss);
      if (targetPrice) holding.targetPrice = parseFloat(targetPrice);
    } else {
      holding = new Holding({
        user: req.user._id,
        symbol: sym,
        assetType,
        quantity: parseFloat(quantity),
        avgPrice: price,
        totalInvested: total,
        // ✅ NEW
        stopLoss: stopLoss ? parseFloat(stopLoss) : null,
        targetPrice: targetPrice ? parseFloat(targetPrice) : null,
      });
    }
    await holding.save();

    // Record trade
    const trade = await Trade.create({
      user: req.user._id,
      symbol: sym,
      type: "buy",
      assetType,
      quantity: parseFloat(quantity),
      price,
      total,
      charges,
      status: "executed",
      // ✅ NEW
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
    });

    res.json({
      success: true,
      message: `Bought ${quantity} ${sym} @ ₹${price}`,
      trade,
      newBalance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Trade execution failed." });
  }
});

///////////////////// New Code hai sell Routes //////////////////////////

// POST /api/trades/sell - SHORT SELL (position open karo)
router.post("/sell", protect, async (req, res) => {
  try {
    const { symbol, assetType = "stock", stopLoss, targetPrice } = req.body;
    const quantity = parseFloat(req.body.quantity);

    if (!symbol || !quantity || quantity <= 0)
      return res
        .status(400)
        .json({ error: "Symbol and valid quantity required." });

    const sym = symbol.toUpperCase();
    const priceData =
      assetType === "crypto" ? getCryptoPrice(sym) : getStockPrice(sym);
    if (!priceData) return res.status(404).json({ error: `${sym} not found.` });

    const sellPrice = priceData.price;
    const total = parseFloat((sellPrice * quantity).toFixed(2));
    const charges = parseFloat(
      (total * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
    );
    const received = total - charges;

    // Short position open karo
    const ShortPosition = require("../models/ShortPosition");
    ////////////// Balance check karo
    const user = await User.findById(req.user._id);
    if (user.balance < total)
      return res.status(400).json({ error: "Insufficient balance." });

    /////////////////// Balance deduct karo
    user.balance = parseFloat((user.balance - total).toFixed(2));
    await user.save(); /////////////////////////////////
    const shortPos = await ShortPosition.create({
      user: req.user._id,
      symbol: sym,
      type: "Short", ///////////////////////////////
      assetType,
      quantity,
      sellPrice,
      totalReceived: received,
      status: "open",
      // ✅ NEW
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
    });

    // Trade record karo
    const trade = await Trade.create({
      user: req.user._id,
      symbol: sym,
      type: "sell",
      assetType,
      quantity,
      price: sellPrice,
      total,
      charges,
      status: "executed",
      // ✅ NEW
      stopLoss: stopLoss ? parseFloat(stopLoss) : null,
      targetPrice: targetPrice ? parseFloat(targetPrice) : null,
    });

    res.json({
      success: true,
      message: `Short opened: Sold ${quantity} ${sym} @ ₹${sellPrice}`,
      shortPosition: shortPos,
      trade,
      newBalance: user.balance, // sell me balance Deduct hoga - exit par aayega
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Trade execution failed." });
  }
});

//////////////////////New Code /////////////////////////////

// GET /api/trades - order history
router.get("/", protect, async (req, res) => {
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
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trades." });
  }
});

//////////////////////////////// New Code //////////////////////////////////////////////

// POST /api/trades/exit/:holdingId
router.post("/exit/:holdingId", protect, async (req, res) => {
  try {
    const holding = await Holding.findOne({
      _id: req.params.holdingId,
      user: req.user._id,
    });

    if (!holding) {
      return res.status(404).json({ error: "Holding not found." });
    }

    const sym = holding.symbol;
    const assetType = holding.assetType;
    const quantity = holding.quantity;

    // Current price lo
    const priceData =
      assetType === "crypto" ? getCryptoPrice(sym) : getStockPrice(sym);
    if (!priceData)
      return res.status(404).json({ error: `${sym} price not found.` });

    const exitPrice = priceData.price;
    const total = parseFloat((exitPrice * quantity).toFixed(2));
    const charges = parseFloat(
      (total * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
    );
    const received = total - charges;

    // P&L calculate karo
    const invested = holding.totalInvested;
    const profitLoss = parseFloat((received - invested).toFixed(2));

    // Holding delete karo
    await Holding.deleteOne({ _id: holding._id });

    // Balance wapas karo
    const user = await User.findById(req.user._id);
    user.balance = parseFloat((user.balance + received).toFixed(2));
    await user.save();

    // Exit trade record karo
    const trade = await Trade.create({
      user: req.user._id,
      symbol: sym,
      type: "sell",
      assetType,
      quantity,
      price: exitPrice,
      total,
      charges,
      status: "executed",
    });

    res.json({
      success: true,
      message: `Exited ${sym} @ ₹${exitPrice}`,
      profitLoss,
      received,
      newBalance: user.balance,
      trade,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Exit failed." });
  }
});

//////////////////////////////// New Code //////////////////////////////////////////////

// POST /api/trades/exit-short/:shortId
const ShortPosition = require("../models/ShortPosition");

router.post("/exit-short/:shortId", protect, async (req, res) => {
  try {
    const shortPos = await ShortPosition.findOne({
      /////// Ye Bhi pura naya route wala code h
      _id: req.params.shortId,
      user: req.user._id,
      status: "open",
    });

    if (!shortPos)
      return res.status(404).json({ error: "Short position not found." });

    const priceData =
      shortPos.assetType === "crypto"
        ? getCryptoPrice(shortPos.symbol)
        : getStockPrice(shortPos.symbol);

    const exitPrice = priceData.price;
    const exitTotal = parseFloat((exitPrice * shortPos.quantity).toFixed(2));
    const charges = parseFloat(
      (exitTotal * (shortPos.assetType === "crypto" ? 0.002 : 0.001)).toFixed(
        2,
      ),
    );
    const exitCost = exitTotal + charges;

    // P&L = sell me mila - exit me laga
    const profitLoss = parseFloat(
      (shortPos.totalReceived - exitCost).toFixed(2),
    );

    // Balance update karo
    const user = await User.findById(req.user._id);
    user.balance = parseFloat(
      (user.balance + shortPos.totalReceived + profitLoss).toFixed(2),
    );
    await user.save();

    // Short position close karo
    shortPos.status = "closed";
    await shortPos.save();

    res.json({
      success: true,
      message: `Short closed: ${shortPos.symbol} @ ₹${exitPrice} | P&L: ${profitLoss >= 0 ? "+" : ""}₹${profitLoss}`,
      profitLoss,
      newBalance: user.balance,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Exit short failed." });
  }
});

////////////////////////////// short ka naya code /////

// GET /api/trades/shorts
router.get("/shorts", protect, async (req, res) => {
  try {
    const shorts = await ShortPosition.find({
      user: req.user._id,
      status: "open",
    });

    // ✅ Live price aur P&L add karo
    const enriched = shorts.map((s) => {
      const priceData =
        s.assetType === "crypto"
          ? getCryptoPrice(s.symbol)
          : getStockPrice(s.symbol);

      const currentPrice = priceData?.price || s.sellPrice;
      const exitCost = currentPrice * s.quantity;
      const charges = parseFloat(
        (exitCost * (s.assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
      );
      const profitLoss = parseFloat(
        (s.totalReceived - exitCost - charges).toFixed(2),
      );

      return {
        ...s.toObject(),
        currentPrice,
        profitLoss,
      };
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch shorts." });
  }
});

// ✅ NEW ROUTE — Stop Loss / Target update karne ke liye
router.put("/update-levels/:holdingId", protect, async (req, res) => {
  try {
    const { stopLoss, targetPrice } = req.body;

    const holding = await Holding.findOne({
      _id: req.params.holdingId,
      user: req.user._id,
    });

    if (!holding) {
      return res.status(404).json({ error: "Holding not found." });
    }

    if (stopLoss !== undefined)
      holding.stopLoss = stopLoss ? parseFloat(stopLoss) : null;
    if (targetPrice !== undefined)
      holding.targetPrice = targetPrice ? parseFloat(targetPrice) : null;
    if (!stopLoss) holding.stopLossTriggered = false;
    if (!targetPrice) holding.targetTriggered = false;

    await holding.save();

    res.json({
      success: true,
      message: "Levels updated successfully.",
      holding,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update levels." });
  }
});

module.exports = router;
