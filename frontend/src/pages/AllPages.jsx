// Markets.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

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
              onClick={() => navigate("/trade-stocks")}
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
];

export function TradeStocks() {
  const [sym, setSym] = useState("RELIANCE");
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
            onClick={() => navigate("/trade-crypto")}
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
];

export function TradeCrypto() {
  const [sym, setSym] = useState("BTC");
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

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const r = await api.get("/portfolio");
      setData(r.data.data || []);
      setSummary(r.data.summary || {});
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
        📦 Holdings
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
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
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
            <div>P&L</div>
          </div>
          {data.map((h) => (
            <div
              key={h._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr",
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
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  color: h.pnl >= 0 ? "#00e676" : "#ff4444",
                }}
              >
                {h.pnl >= 0 ? "+" : "−"}₹{fmt(Math.abs(h.pnl))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Orders.jsx
export function Orders() {
  const [trades, setTrades] = useState([]);
  useEffect(() => {
    load();
  }, []);
  async function load() {
    try {
      const r = await api.get("/trades");
      setTrades(r.data.data || []);
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
              gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
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
          </div>
          {trades.map((t) => (
            <div
              key={t._id}
              style={{
                display: "grid",
                gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr 1fr",
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Watchlist.jsx
export function Watchlist() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);

  useEffect(() => {
    load();
  }, [user?.watchlist]);

  async function load() {
    try {
      const r = await api.get("/stocks");
      setAllStocks(r.data.data || []);
      setStocks(
        r.data.data?.filter((s) => user?.watchlist?.includes(s.symbol)) || [],
      );
    } catch {}
  }

  async function removeFromWatchlist(sym) {
    try {
      await api.patch("/user/watchlist/remove", { symbol: sym });
      setStocks((prev) => prev.filter((s) => s.symbol !== sym));
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
        Watchlist
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Stocks you're tracking
      </p>
      {stocks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px", color: "#4a6a4a" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>⭐</div>
          <p>Your watchlist is empty.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "12px",
          }}
        >
          {stocks.map((s) => (
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
                <div style={{ fontWeight: 700, fontSize: "16px" }}>
                  {s.symbol}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#4a6a4a",
                    marginBottom: "8px",
                  }}
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
          ))}
        </div>
      )}
    </div>
  );
}
