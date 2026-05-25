const express = require("express");
const { protect } = require("../middleware/auth");
const User = require("../models/User");
const Holding = require("../models/Holding");
const router = express.Router();

const RESET_DAYS = 30;
const RESET_BALANCE = 50000;
const DEPLETED_THRESHOLD = 100;

async function checkAndResetBalance(user) {
  const now = new Date();
  if (user.balance < DEPLETED_THRESHOLD && !user.isBalanceDepleted) {
    user.isBalanceDepleted = true;
    user.balanceResetDate = new Date(
      now.getTime() + RESET_DAYS * 24 * 60 * 60 * 1000,
    );
    await user.save();
  }
  if (
    user.isBalanceDepleted &&
    user.balanceResetDate &&
    now >= user.balanceResetDate
  ) {
    user.balance = RESET_BALANCE;
    user.isBalanceDepleted = false;
    user.lastResetAt = now;
    user.balanceResetDate = null;
    await Holding.deleteMany({ user: user._id });
    await user.save();
    return { wasReset: true };
  }
  return { wasReset: false };
}

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    await checkAndResetBalance(user);
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

router.get("/balance", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { wasReset } = await checkAndResetBalance(user);
    const now = new Date();
    let daysLeft = null,
      hoursLeft = null,
      secondsLeft = null;
    if (user.isBalanceDepleted && user.balanceResetDate) {
      const diff = user.balanceResetDate - now;
      daysLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
      hoursLeft = Math.max(
        0,
        Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      );
      secondsLeft = Math.max(0, Math.floor(diff / 1000));
    }
    res.json({
      success: true,
      balance: user.balance,
      wasReset,
      resetInfo: {
        isBalanceDepleted: user.isBalanceDepleted,
        balanceResetDate: user.balanceResetDate,
        daysLeft,
        hoursLeft,
        secondsLeft,
        resetAmount: RESET_BALANCE,
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balance." });
  }
});

router.patch("/watchlist/add", protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol required." });
    const user = await User.findById(req.user._id);
    if (!user.watchlist.includes(symbol.toUpperCase())) {
      user.watchlist.push(symbol.toUpperCase());
      await user.save();
    }
    res.json({ success: true, watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: "Failed to update watchlist." });
  }
});

router.patch("/watchlist/remove", protect, async (req, res) => {
  try {
    const { symbol } = req.body;
    const user = await User.findById(req.user._id);
    user.watchlist = user.watchlist.filter((s) => s !== symbol.toUpperCase());
    await user.save();
    res.json({ success: true, watchlist: user.watchlist });
  } catch (err) {
    res.status(500).json({ error: "Failed to update watchlist." });
  }
});

module.exports = router;
