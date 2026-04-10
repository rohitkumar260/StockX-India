const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: true
  },
  assetType: {
    type: String,
    enum: ['stock', 'crypto'],
    default: 'stock'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.001
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true
  },
  charges: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['executed', 'failed', 'pending'],
    default: 'executed'
  }
}, { timestamps: true });

tradeSchema.index({ user: 1, createdAt: -1 });
tradeSchema.index({ symbol: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
