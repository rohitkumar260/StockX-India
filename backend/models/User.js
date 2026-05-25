const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  balance: {
    type: Number,
    default: 50000
  },

  // ✅ Yeh 3 lines add karo yahan
balanceResetDate: {     /////////
  type: Date,            //////////
  default: null          ///////////
},
lastResetAt: {            ////////////
  type: Date,                 ////////////
  default: null           ////////
},
isBalanceDepleted: {       ///////////////
  type: Boolean,           ///////////////
  default: false                /////////////////
},                           /////////////////////

  watchlist: {
    type: [String],
    default: ['RELIANCE', 'TCS', 'INFY', 'HDFC', 'ICICI']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
