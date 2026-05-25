const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
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
  assetType: {
    type: String,
    enum: ['stock', 'crypto'],
    default: 'stock'
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  avgPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalInvested: {
    type: Number,
    required: true
  },
  
  // ✅ NEW FIELDS
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
  
}, { timestamps: true });

holdingSchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Holding', holdingSchema);
