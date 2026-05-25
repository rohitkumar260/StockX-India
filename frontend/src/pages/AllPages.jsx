// Markets.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const fmt = (n) => {
  n = parseFloat(n) || 0;
  if (n >= 100000) return (n / 100000).toFixed(2) + "L";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export function Markets() {
  const [stocks, setStocks] = useState([]);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    try {
      const r = await api.get("/stocks");
      setStocks(r.data.data || []);
    } catch {}
  }

  let display = [...stocks];
  if (filter === "gainers")
    display = display
      .filter((s) => s.changePct >= 0)
      .sort((a, b) => b.changePct - a.changePct);
  if (filter === "losers")
    display = display
      .filter((s) => s.changePct < 0)
      .sort((a, b) => a.changePct - b.changePct);

  const tabStyle = (active) => ({
    padding: "8px 20px",
    border: `1px solid ${active ? "#00e676" : "#1e2e1e"}`,
    borderRadius: "6px",
    background: active ? "#00e676" : "transparent",
    color: active ? "#000" : "#4a6a4a",
    fontFamily: "Rajdhani,sans-serif",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  });

  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        NSE/BSE Markets
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "20px" }}>
        Live simulated Indian stock market data
      </p>
      <div style={{ display: "flex", gap: "8px", marginBottom: "18px" }}>
        {[
          ["all", "All Stocks"],
          ["gainers", "Top Gainers"],
          ["losers", "Top Losers"],
        ].map(([k, l]) => (
          <button
            key={k}
            style={tabStyle(filter === k)}
            onClick={() => setFilter(k)}
          >
            {l}
          </button>
        ))}
      </div>
      <div
        style={{
          background: "#111811",
          border: "1px solid #1e2e1e",
          borderRadius: "12px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1fr 1fr 100px",
            padding: "12px 20px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "1.5px",
            color: "#4a6a4a",
            textTransform: "uppercase",
            borderBottom: "1px solid #1e2e1e",
          }}
        >
          <div>Symbol</div>
          <div>Price</div>
          <div>Change</div>
          <div>Volume</div>
          <div>Action</div>
        </div>
        {display.map((s) => (
          <div
            key={s.symbol}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1fr 1fr 100px",
              padding: "13px 20px",
              alignItems: "center",
              borderBottom: "1px solid #1e2e1e",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(0,230,118,0.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <div>
              <div style={{ fontWeight: 700 }}>{s.symbol}</div>
              <div style={{ fontSize: "12px", color: "#4a6a4a" }}>{s.name}</div>
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              ₹{fmt(s.price)}
            </div>
            <span
              style={{
                display: "inline-block",
                padding: "3px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "JetBrains Mono,monospace",
                background:
                  s.changePct >= 0
                    ? "rgba(0,230,118,0.15)"
                    : "rgba(255,68,68,0.15)",
                color: s.changePct >= 0 ? "#00e676" : "#ff4444",
                width: "fit-content",
              }}
            >
              {s.changePct >= 0 ? "+" : ""}
              {s.changePct}%
            </span>
            <div
              style={{
                fontSize: "12px",
                color: "#4a6a4a",
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              {(s.volume || 0).toLocaleString("en-IN")}
            </div>
            <button
              onClick={() =>
                navigate("/trade-stocks", { state: { symbol: s.symbol } })
              }
              style={{
                padding: "6px 16px",
                border: "1px solid #00e676",
                borderRadius: "6px",
                background: "transparent",
                color: "#00e676",
                fontFamily: "Rajdhani,sans-serif",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#00e676";
                e.target.style.color = "#000";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#00e676";
              }}
            >
              BUY
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// TradeStocks.jsx
import StockChart from "../components/StockChart";
import TradePanel from "../components/TradePanel";
const STOCK_SYMBOLS = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFC",
  "ICICI",
  "WIPRO",
  "SBIN",
  "BAJFINANCE",
  "HCLTECH",
  "LT",
  "MARUTI",
  "TITAN",
  "ADANIPORTS",
  "SUNPHARMA",
  "ULTRACEMCO",
  "KOTAKBANK",
  "AXISBANK",
  "ASIANPAINT",
  "TATAMOTORS",
  "TATASTEEL",
  "BHARTIARTL",
  "ONGC",
  "NTPC",
  "POWERGRID",
  "NESTLEIND",
  "HINDALCO",
  "JSWSTEEL",
  "TECHM",
  "DRREDDY",
  "DIVISLAB",
];

export function TradeStocks() {
  const location = useLocation();
  const [sym, setSym] = useState(location.state?.symbol || "RELIANCE");
  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Trade Stocks
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Buy or sell NSE/BSE listed stocks
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 290px",
          gap: "14px",
        }}
      >
        <StockChart symbol={sym} assetType="stock" height={220} />
        <TradePanel
          symbols={STOCK_SYMBOLS}
          assetType="stock"
          defaultSymbol={sym}
          onSymbolChange={setSym}
        />
      </div>
    </div>
  );
}

// CryptoMarkets.jsx
const CRYPTO_META = {
  BTC: "Bitcoin",
  ETH: "Ethereum",
  BNB: "Binance Coin",
  SOL: "Solana",
  XRP: "Ripple",
  ADA: "Cardano",
  DOGE: "Dogecoin",
  MATIC: "Polygon",
};

export function CryptoMarkets() {
  const [coins, setCoins] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    load();
    const id = setInterval(load, 4000);
    return () => clearInterval(id);
  }, []);

  async function load() {
    try {
      const r = await api.get("/crypto");
      setCoins(r.data.data || []);
    } catch {}
  }

  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Crypto Markets
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Top cryptocurrencies — simulated prices in INR
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "14px",
        }}
      >
        {coins.map((c) => (
          <div
            key={c.symbol}
            onClick={() =>
              navigate("/trade-crypto", { state: { symbol: c.symbol } })
            }
            style={{
              background: "#111811",
              border: "1px solid #1e2e1e",
              borderRadius: "12px",
              padding: "20px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#00e676";
              e.currentTarget.style.background = "rgba(0,230,118,0.05)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#1e2e1e";
              e.currentTarget.style.background = "#111811";
            }}
          >
            <div
              style={{ fontSize: "20px", fontWeight: 700, marginBottom: "2px" }}
            >
              {c.symbol}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#4a6a4a",
                marginBottom: "12px",
              }}
            >
              {c.name}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              ₹{fmt(c.price)}
            </div>
            <span
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "3px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: 700,
                fontFamily: "JetBrains Mono,monospace",
                background:
                  c.changePct >= 0
                    ? "rgba(0,230,118,0.15)"
                    : "rgba(255,68,68,0.15)",
                color: c.changePct >= 0 ? "#00e676" : "#ff4444",
              }}
            >
              {c.changePct >= 0 ? "+" : ""}
              {c.changePct}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// TradeCrypto.jsx
const CRYPTO_SYMBOLS = [
  "BTC",
  "ETH",
  "BNB",
  "SOL",
  "XRP",
  "ADA",
  "DOGE",
  "MATIC",
  "AVAX",
  "DOT",
  "LINK",
  "LTC",
  "ATOM",
  "UNI",
  "SHIB",
  "TRX",
  "NEAR",
  "FTM",
  "SAND",
  "MANA",
  "ALGO",
  "VET",
  "HBAR",
  "APT",
  "ARB",
  "OP",
  "INJ",
  "SUI",
  "TON",
  "FIL",
];

export function TradeCrypto() {
  const location = useLocation();
  const [sym, setSym] = useState(location.state?.symbol || "BTC");
  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Trade Crypto
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Buy or sell cryptocurrencies with virtual money
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 290px",
          gap: "14px",
        }}
      >
        <StockChart symbol={sym} assetType="crypto" height={220} />
        <TradePanel
          symbols={CRYPTO_SYMBOLS}
          assetType="crypto"
          defaultSymbol={sym}
          onSymbolChange={setSym}
        />
      </div>
    </div>
  );
}

// Portfolio.jsx
export function Portfolio() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({});
  const [shorts, setShorts] = useState([]);
  const [msg, setMsg] = useState(null);
  const [loadingExit, setLoadingExit] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const [portRes, shortRes] = await Promise.all([
        api.get("/portfolio"),
        api.get("/trades/shorts"),
      ]);
      setData(portRes.data.data || []);
      const shortsData = shortRes.data || [];
      setShorts(shortsData);

      // ✅ Short P&L bhi summary me add karo
      const summary = portRes.data.summary || {};
      const totalShortPnl = shortsData.reduce(
        (acc, s) => acc + (s.profitLoss || 0),
        0,
      );
      setSummary({
        ...summary,
        totalPnl: (summary.totalPnl || 0) + totalShortPnl,
      });
    } catch {}
  }

  async function handleExit(holding) {
    setLoadingExit(holding._id);
    setMsg(null);
    try {
      const res = await api.post(`/trades/exit/${holding._id}`);
      const { profitLoss, newBalance } = res.data;
      const sign = profitLoss >= 0 ? "+" : "";
      setMsg({
        type: profitLoss >= 0 ? "profit" : "loss",
        text: `✅ Exited! P&L: ${sign}₹${fmt(profitLoss)} | Balance: ₹${fmt(newBalance)}`,
      });
      load();
    } catch (err) {
      setMsg({
        type: "loss",
        text: "❌ " + (err.response?.data?.error || err.message),
      });
    }
    setLoadingExit(null);
  }

  async function handleExitShort(short) {
    setLoadingExit(short._id);
    setMsg(null);
    try {
      const res = await api.post(`/trades/exit-short/${short._id}`);
      const { profitLoss, newBalance } = res.data;
      const sign = profitLoss >= 0 ? "+" : "";
      setMsg({
        type: profitLoss >= 0 ? "profit" : "loss",
        text: `✅ Short Closed! P&L: ${sign}₹${fmt(profitLoss)} | Balance: ₹${fmt(newBalance)}`,
      });
      load();
    } catch (err) {
      setMsg({
        type: "loss",
        text: "❌ " + (err.response?.data?.error || err.message),
      });
    }
    setLoadingExit(null);
  }

  return (
    <div>
      <div>
        {/* Message Banner */}
        {msg && (
          <div
            style={{
              background: msg.type === "profit" ? "#0a2a0a" : "#2a0a0a",
              border: `1px solid ${msg.type === "profit" ? "#00e676" : "#ff4444"}`,
              color: msg.type === "profit" ? "#00e676" : "#ff4444",
              padding: "12px 20px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "14px",
            }}
          >
            {msg.text}
          </div>
        )}
      </div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Portfolio
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Your current holdings
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        {[
          {
            label: "Total Invested",
            val: "₹" + fmt(summary.totalInvested || 0),
          },
          {
            label: "Current Value",
            val: "₹" + fmt(summary.totalCurrentValue || 0),
          },
          {
            label: "Total P&L",
            val:
              (summary.totalPnl >= 0 ? "+" : "−") +
              "₹" +
              fmt(Math.abs(summary.totalPnl || 0)),
            color: summary.totalPnl >= 0 ? "#00e676" : "#ff4444",
          },
        ].map((c) => (
          <div
            key={c.label}
            style={{
              background: "#111811",
              border: "1px solid #1e2e1e",
              borderRadius: "12px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "#4a6a4a",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              {c.label}
            </div>
            <div
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "20px",
                fontWeight: 700,
                color: c.color || "#e8f5e8",
              }}
            >
              {c.val}
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
        📦 Long Positions
      </div>
      {data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#4a6a4a" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
          <p>No holdings yet. Start trading!</p>
        </div>
      ) : (
        <div
          style={{
            background: "#111811",
            border: "1px solid #1e2e1e",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
              padding: "12px 20px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#4a6a4a",
              textTransform: "uppercase",
              borderBottom: "1px solid #1e2e1e",
            }}
          >
            <div>Symbol</div>
            <div>Qty</div>
            <div>Avg Price</div>
            <div>Current</div>
            <div>Stop Loss</div>
            <div>Target</div>
            <div>P&L</div>
            <div>Action</div>
          </div>
          {data.map((h) => (
            <div
              key={h._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                padding: "13px 20px",
                alignItems: "center",
                borderBottom: "1px solid #1e2e1e",
                fontSize: "14px",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{h.symbol}</div>
                <div style={{ fontSize: "12px", color: "#4a6a4a" }}>
                  {h.assetType}
                </div>
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                {h.quantity}
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                ₹{fmt(h.avgPrice)}
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                ₹{fmt(h.currentPrice)}
              </div>

              {/* ✅ Stop Loss */}
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                {h.stopLoss ? (
                  <span style={{ color: "#ff4444" }}>₹{fmt(h.stopLoss)}</span>
                ) : (
                  <span style={{ color: "#3a5a3a" }}>--</span>
                )}
              </div>

              {/* ✅ Target */}
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                {h.targetPrice ? (
                  <span style={{ color: "#00e676" }}>
                    ₹{fmt(h.targetPrice)}
                  </span>
                ) : (
                  <span style={{ color: "#3a5a3a" }}>--</span>
                )}
              </div>

              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  color: h.pnl >= 0 ? "#00e676" : "#ff4444",
                }}
              >
                {h.pnl >= 0 ? "+" : "−"}₹{fmt(Math.abs(h.pnl))}
              </div>

              <div>
                <button
                  onClick={() => handleExit(h)}
                  disabled={loadingExit === h._id}
                  style={{
                    background: loadingExit === h._id ? "#333" : "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 14px",
                    fontSize: "12px",
                    fontWeight: 700,
                    cursor: loadingExit === h._id ? "not-allowed" : "pointer",
                  }}
                >
                  {loadingExit === h._id ? "Exiting..." : "Exit"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Short Positions */}
      {shorts.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div
            style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}
          >
            📉 Short Positions
          </div>
          <div
            style={{
              background: "#111811",
              border: "1px solid #2e1e1e",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
                padding: "12px 20px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1.5px",
                color: "#6a4a4a",
                textTransform: "uppercase",
                borderBottom: "1px solid #2e1e1e",
              }}
            >
              <div>Symbol</div>
              <div>Qty</div>
              <div>Sell Price</div>
              <div>Stop Loss</div>
              <div>Target</div>
              <div>P&L</div>
              <div>Action</div>
            </div>
            {shorts.map((s) => (
              <div
                key={s._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  padding: "13px 20px",
                  alignItems: "center",
                  borderBottom: "1px solid #2e1e1e",
                  fontSize: "14px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 700 }}>{s.symbol}</div>
                  <div style={{ fontSize: "12px", color: "#6a4a4a" }}>
                    {s.assetType}
                  </div>
                </div>
                <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                  {s.quantity}
                </div>
                <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                  ₹{fmt(s.sellPrice)}
                </div>

                {/* ✅ Stop Loss */}
                <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                  {s.stopLoss ? (
                    <span style={{ color: "#ff4444" }}>₹{fmt(s.stopLoss)}</span>
                  ) : (
                    <span style={{ color: "#6a4a4a" }}>--</span>
                  )}
                </div>

                {/* ✅ Target */}
                <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                  {s.targetPrice ? (
                    <span style={{ color: "#00e676" }}>
                      ₹{fmt(s.targetPrice)}
                    </span>
                  ) : (
                    <span style={{ color: "#6a4a4a" }}>--</span>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: "JetBrains Mono,monospace",
                    color: (s.profitLoss || 0) >= 0 ? "#00e676" : "#ff4444",
                  }}
                >
                  {(s.profitLoss || 0) >= 0 ? "+" : "−"}₹
                  {fmt(Math.abs(s.profitLoss || 0))}
                </div>

                <div>
                  <button
                    onClick={() => handleExitShort(s)}
                    disabled={loadingExit === s._id}
                    style={{
                      background: loadingExit === s._id ? "#333" : "#ff4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      padding: "5px 14px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: loadingExit === s._id ? "not-allowed" : "pointer",
                    }}
                  >
                    {loadingExit === s._id ? "Closing..." : "Close Short"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Orders.jsx
export function Orders() {
  const [trades, setTrades] = useState([]);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const tradesRes = await api.get("/trades");
      setTrades(tradesRes.data.data || []);
    } catch {}
  }


  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Orders
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        History of all executed trades
      </p>

      {/* Message Banner */}
      {msg && (
        <div
          style={{
            background: msg.type === "profit" ? "#0a2a0a" : "#2a0a0a",
            border: `1px solid ${msg.type === "profit" ? "#00e676" : "#ff4444"}`,
            color: msg.type === "profit" ? "#00e676" : "#ff4444",
            padding: "12px 20px",
            borderRadius: "8px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {msg.text}
        </div>
      )}


      {/* Trade History */}
      {trades.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#4a6a4a" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>📋</div>
          <p>No orders placed yet.</p>
        </div>
      ) : (
        <div
          style={{
            background: "#111811",
            border: "1px solid #1e2e1e",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
              padding: "12px 20px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "1.5px",
              color: "#4a6a4a",
              textTransform: "uppercase",
              borderBottom: "1px solid #1e2e1e",
            }}
          >
            <div>Time</div>
            <div>Symbol</div>
            <div>Type</div>
            <div>Qty</div>
            <div>Price</div>
            <div>Total</div>
            <div>Trigger</div>
          </div>
          {trades.map((t) => (
            <div
              key={t._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr 1fr",
                padding: "13px 20px",
                alignItems: "center",
                borderBottom: "1px solid #1e2e1e",
                fontSize: "14px",
              }}
            >
              <div style={{ color: "#4a6a4a", fontSize: "12px" }}>
                {new Date(t.createdAt).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div style={{ fontWeight: 700 }}>{t.symbol}</div>
              <div
                style={{
                  color: t.type === "buy" ? "#00e676" : "#ff4444",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {t.type}
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                {t.quantity}
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                ₹{fmt(t.price)}
              </div>
              <div style={{ fontFamily: "JetBrains Mono,monospace" }}>
                ₹{fmt(t.total)}
              </div>

              {t.triggerReason === "stopLoss" ? (
                <span
                  style={{
                    background: "#2a0a0a",
                    color: "#ff4444",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  🔴 SL
                </span>
              ) : t.triggerReason === "target" ? (
                <span
                  style={{
                    background: "#0a2a0a",
                    color: "#00e676",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  🟢 TARGET
                </span>
              ) : (
                <span style={{ color: "#3a5a3a", fontSize: "11px" }}>
                  Manual
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

////////////////////////////////////// New Code /////////////////////

// Watchlist.jsx
export function Watchlist() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    load();
    const close = () => setShowDropdown(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  async function load() {
    try {
      const [stocksRes, cryptoRes, userRes] = await Promise.all([
        api.get("/stocks"),
        api.get("/crypto"),
        api.get("/user/profile"),
      ]);
      const allData = [
        ...(stocksRes.data.data || []).map((s) => ({
          ...s,
          assetType: "stock",
        })),
        ...(cryptoRes.data.data || []).map((s) => ({
          ...s,
          assetType: "crypto",
        })),
      ];
      setAllStocks(allData);
      const watchlist = userRes.data?.user?.watchlist || [];
      setStocks(
        watchlist.length === 0
          ? []
          : allData.filter((s) => watchlist.includes(s.symbol)),
      );
    } catch {
      setStocks([]);
    }
  }

  async function addToWatchlist(sym) {
    try {
      await api.patch("/user/watchlist/add", { symbol: sym });
      const found = allStocks.find((s) => s.symbol === sym);
      if (found) setStocks((prev) => [...prev, found]);
      setSearch("");
      setShowDropdown(false);
    } catch {}
  }

  async function removeFromWatchlist(sym) {
    try {
      await api.patch("/user/watchlist/remove", { symbol: sym });
      setStocks((prev) => prev.filter((s) => s.symbol !== sym));
    } catch {}
  }

  const stockList = stocks.filter((s) => s.assetType === "stock");
  const cryptoList = stocks.filter((s) => s.assetType === "crypto");

  const Card = ({ s }) => (
    <div
      key={s.symbol}
      style={{
        background: "#111811",
        border: "1px solid #1e2e1e",
        borderRadius: "10px",
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: "16px" }}>{s.symbol}</div>
        <div
          style={{ fontSize: "12px", color: "#4a6a4a", marginBottom: "8px" }}
        >
          {s.name}
        </div>
        <div
          style={{
            fontFamily: "JetBrains Mono,monospace",
            fontSize: "16px",
            fontWeight: 700,
          }}
        >
          ₹{fmt(s.price)}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "8px",
        }}
      >
        <span
          style={{
            padding: "3px 10px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: 700,
            fontFamily: "JetBrains Mono,monospace",
            background:
              s.changePct >= 0
                ? "rgba(0,230,118,0.15)"
                : "rgba(255,68,68,0.15)",
            color: s.changePct >= 0 ? "#00e676" : "#ff4444",
          }}
        >
          {s.changePct >= 0 ? "+" : ""}
          {s.changePct}%
        </span>
        <button
          onClick={() => removeFromWatchlist(s.symbol)}
          style={{
            background: "transparent",
            border: "1px solid #1e2e1e",
            borderRadius: "4px",
            padding: "3px 8px",
            fontSize: "11px",
            color: "#4a6a4a",
            cursor: "pointer",
            fontFamily: "Rajdhani,sans-serif",
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = "#ff4444";
            e.target.style.color = "#ff4444";
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = "#1e2e1e";
            e.target.style.color = "#4a6a4a";
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1
        style={{
          fontFamily: "Space Mono,monospace",
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "4px",
        }}
      >
        Watchlist
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Stocks you're tracking
      </p>

      {/* Search Box */}
      <div
        style={{
          position: "relative",
          marginBottom: "32px",
          maxWidth: "400px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          placeholder="🔍 Search stock or crypto to add..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          style={{
            width: "100%",
            background: "#111811",
            border: "1px solid #1e2e1e",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px",
            color: "#e8f5e8",
            outline: "none",
            fontFamily: "JetBrains Mono,monospace",
            boxSizing: "border-box",
          }}
        />
        {showDropdown && search && (
          <div
            style={{
              position: "absolute",
              top: "110%",
              left: 0,
              right: 0,
              background: "#111811",
              border: "1px solid #1e2e1e",
              borderRadius: "8px",
              zIndex: 100,
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {allStocks
              .filter(
                (s) =>
                  s.symbol.includes(search.toUpperCase()) &&
                  !stocks.find((w) => w.symbol === s.symbol),
              )
              .map((s) => (
                <div
                  key={s.symbol}
                  onClick={() => addToWatchlist(s.symbol)}
                  style={{
                    padding: "10px 14px",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #1e2e1e",
                    fontSize: "14px",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1a2a1a")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ fontWeight: 700 }}>
                    {s.symbol}
                    <span
                      style={{
                        fontSize: "10px",
                        color: s.assetType === "crypto" ? "#ff9800" : "#00e676",
                        marginLeft: "6px",
                      }}
                    >
                      {s.assetType === "crypto" ? "CRYPTO" : "STOCK"}
                    </span>
                  </span>
                  <span style={{ color: "#4a6a4a" }}>₹{fmt(s.price)}</span>
                </div>
              ))}
            {allStocks.filter(
              (s) =>
                s.symbol.includes(search.toUpperCase()) &&
                !stocks.find((w) => w.symbol === s.symbol),
            ).length === 0 && (
              <div
                style={{
                  padding: "10px 14px",
                  color: "#4a6a4a",
                  fontSize: "13px",
                }}
              >
                No results found
              </div>
            )}
          </div>
        )}
      </div>

      {stocks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#4a6a4a" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
          <p>Your watchlist is empty. Search above to add!</p>
        </div>
      ) : (
        <div>
          {/* Stocks Section */}
          {stockList.length > 0 && (
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "14px",
                  color: "#00e676",
                }}
              >
                📈 Stocks
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "12px",
                }}
              >
                {stockList.map((s) => (
                  <Card key={s.symbol} s={s} />
                ))}
              </div>
            </div>
          )}

          {/* Crypto Section */}
          {cryptoList.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  marginBottom: "14px",
                  color: "#ff9800",
                }}
              >
                ₿ Crypto
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: "12px",
                }}
              >
                {cryptoList.map((s) => (
                  <Card key={s.symbol} s={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
