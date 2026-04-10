# 🇮🇳 StockX India — Full Stack Paper Trading Platform

React + Vite frontend | Node.js + Express backend | MongoDB database | NSE Stock Data

---

## 📁 Project Structure

```
stockx-india/
├── backend/                  # Node.js + Express API
│   ├── server.js             # Entry point
│   ├── .env                  # Environment variables
│   ├── models/
│   │   ├── User.js           # User schema (auth, balance, watchlist)
│   │   ├── Trade.js          # Trade/order schema
│   │   └── Holding.js        # Portfolio holdings schema
│   ├── routes/
│   │   ├── auth.js           # POST /signup, POST /login, GET /me
│   │   ├── stocks.js         # GET /stocks, GET /stocks/:symbol
│   │   ├── crypto.js         # GET /crypto, GET /crypto/:symbol
│   │   ├── trades.js         # POST /buy, POST /sell, GET /trades
│   │   ├── portfolio.js      # GET /portfolio (with live P&L)
│   │   └── user.js           # GET /profile, PATCH /watchlist
│   ├── middleware/
│   │   └── auth.js           # JWT protect middleware
│   └── services/
│       └── priceSimulator.js # Live price engine + NSE Yahoo Finance sync
│
└── frontend/                 # React + Vite app
    ├── src/
    │   ├── App.jsx           # Router setup
    │   ├── api/axios.js      # Axios instance with JWT interceptors
    │   ├── context/AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx    # Sidebar + Ticker bar
    │   │   ├── TradePanel.jsx # Buy/Sell panel with confirm modal
    │   │   └── StockChart.jsx # Live chart component (Chart.js)
    │   └── pages/
    │       ├── Login.jsx / Signup.jsx
    │       ├── Dashboard.jsx
    │       ├── Markets.jsx / CryptoMarkets.jsx
    │       ├── TradeStocks.jsx / TradeCrypto.jsx
    │       ├── Portfolio.jsx / Orders.jsx / Watchlist.jsx
    │       └── AllPages.jsx  # Shared page components
    └── vite.config.js        # Proxy /api → localhost:5000
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Clone & Install

```bash
# Backend
cd stockx-india/backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 2️⃣ Configure Backend

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stockx_india
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/stockx_india

JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
STARTING_BALANCE=50000
```

---

### 3️⃣ Start MongoDB

```bash
# Local MongoDB
mongod

# OR use MongoDB Atlas (cloud) — just paste connection string in .env
```

---

### 4️⃣ Run Backend

```bash
cd backend
npm run dev       # development (with nodemon)
# OR
npm start         # production
```

Backend runs at: `http://localhost:5000`

---

### 5️⃣ Run Frontend

```bash
cd frontend
npm run dev
```

Frontend runs at: `http://localhost:5173`
(Vite proxy forwards `/api` calls to backend automatically)

---

## 🔗 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/stocks` | All NSE stocks with live prices |
| GET | `/api/stocks/:symbol` | Single stock + history |
| GET | `/api/crypto` | All crypto prices |
| GET | `/api/crypto/:symbol` | Single crypto + history |
| POST | `/api/trades/buy` | Place buy order |
| POST | `/api/trades/sell` | Place sell order |
| GET | `/api/trades` | Order history |
| GET | `/api/portfolio` | Holdings with P&L |
| GET | `/api/user/balance` | Current balance |
| PATCH | `/api/user/watchlist/add` | Add to watchlist |
| PATCH | `/api/user/watchlist/remove` | Remove from watchlist |

---

## 📈 Stock Symbols Available

**NSE Stocks:**
RELIANCE, TCS, INFY, HDFC, ICICI, WIPRO, SBIN, BAJFINANCE, HCLTECH, LT, MARUTI, TITAN, ADANIPORTS, SUNPHARMA, ULTRACEMCO

**Crypto:**
BTC, ETH, BNB, SOL, XRP, ADA, DOGE, MATIC

---

## 🚀 Features

- ✅ JWT Authentication (Signup / Login)
- ✅ ₹50,000 virtual starting balance
- ✅ Live price simulation (updates every 3 seconds)
- ✅ NSE Yahoo Finance real price sync (top 5 stocks)
- ✅ Buy / Sell stocks and crypto
- ✅ Real-time portfolio with P&L
- ✅ Order history
- ✅ Watchlist management
- ✅ Interactive Chart.js price charts
- ✅ Live ticker bar
- ✅ Rate limiting & helmet security
- ✅ MongoDB with Mongoose

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6 |
| Charts | Chart.js, react-chartjs-2 |
| Notifications | react-hot-toast |
| HTTP | Axios |
| Backend | Node.js, Express 4 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Security | Helmet, express-rate-limit |
| Stock Data | Yahoo Finance (free, no key needed) |

---

## 🌐 Deploy to Production

### Backend (Railway / Render / VPS)
1. Push to GitHub
2. Connect to Railway or Render
3. Set environment variables
4. Deploy

### Frontend (Vercel / Netlify)
1. Update `vite.config.js` proxy OR set `VITE_API_URL=https://your-backend.com`
2. In `axios.js` change `baseURL` to `import.meta.env.VITE_API_URL + '/api'`
3. Deploy to Vercel

---

Made with ❤️ — StockX India Paper Trading Platform
