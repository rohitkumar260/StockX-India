const mongoose = require("mongoose");

const shortPositionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
    },
    assetType: {
      type: String,
      enum: ["stock", "crypto"],
      default: "stock",
    },
    quantity: {
      type: Number,
      required: true,
    },
    sellPrice: {
      // jis price pe sell kiya
      type: Number,
      required: true,
    },
    totalReceived: {
      // kitna paisa mila sell karke
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
    // ✅ NEW
    stopLoss: {
      type: Number,
      default: null,
      min: 0,
    },
    targetPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    stopLossTriggered: {
      type: Boolean,
      default: false,
    },
    targetTriggered: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ShortPosition", shortPositionSchema);
