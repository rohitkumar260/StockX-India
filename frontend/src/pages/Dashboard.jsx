import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
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

const fmt = (n) => {
  n = parseFloat(n) || 0;
  if (n >= 10000000) return (n / 10000000).toFixed(2) + "Cr";
  if (n >= 100000) return (n / 100000).toFixed(2) + "L";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState({
    summary: { totalCurrentValue: 0, totalPnl: 0 },
  });
  const [orders, setOrders] = useState({ pagination: { total: 0 } });
  const [selectedSym, setSelectedSym] = useState("RELIANCE");
  const [cryptoVal, setCryptoVal] = useState(0);

  useEffect(() => {
    loadAll();
    const id = setInterval(loadStocks, 4000);
    return () => clearInterval(id);
  }, []);

  async function loadAll() {
    await Promise.all([loadStocks(), loadPortfolio(), loadOrders()]);
  }

  async function loadStocks() {
    try {
      const r = await api.get("/stocks");
      setStocks(r.data.data || []);
    } catch {}
  }
  async function loadPortfolio() {
    try {
      const r = await api.get("/portfolio");
      setPortfolio(r.data);
      const crypto =
        r.data.data
          ?.filter((h) => h.assetType === "crypto")
          .reduce((a, h) => a + h.currentValue, 0) || 0;
      setCryptoVal(crypto);
    } catch {}
  }
  async function loadOrders() {
    try {
      const r = await api.get("/trades");
      setOrders(r.data);
    } catch {}
  }

  const statCards = [
    {
      label: "Available Balance",
      value: "₹" + fmt(user?.balance),
      sub: "of ₹50,000 limit",
    },
    {
      label: "Stock Portfolio",
      value: "₹" + fmt((portfolio.summary?.totalCurrentValue || 0) - cryptoVal),
      sub: (
        <span style={{ color: "#00e676" }}>
          +₹{fmt(portfolio.summary?.totalPnl || 0)}
        </span>
      ),
    },
    {
      label: "Crypto Portfolio",
      value: "₹" + fmt(cryptoVal),
      sub: <span style={{ color: "#00e676" }}>+₹0</span>,
    },
    {
      label: "Total Orders",
      value: orders.pagination?.total || 0,
      sub: <span style={{ color: "#00e676" }}>Executed</span>,
    },
  ];

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
        Dashboard
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "22px" }}>
        Welcome back, {user?.name}! Markets are live.
      </p>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        {statCards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "#111811",
              border: "1px solid #1e2e1e",
              borderRadius: "12px",
              padding: "18px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "2px",
                background:
                  "linear-gradient(90deg,transparent,#00e676,transparent)",
                opacity: 0.4,
              }}
            />
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
              }}
            >
              {c.value}
            </div>
            <div
              style={{ fontSize: "12px", color: "#4a6a4a", marginTop: "4px" }}
            >
              {c.sub}
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Trade */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 290px",
          gap: "14px",
          marginBottom: "22px",
        }}
      >
        <StockChart symbol={selectedSym} assetType="stock" height={200} />
        <TradePanel
          symbols={STOCK_SYMBOLS}
          assetType="stock"
          defaultSymbol={selectedSym}
          onSymbolChange={setSelectedSym}
        />
      </div>

      {/* Top Stocks */}
      <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
        📊 Top Stocks
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
            gridTemplateColumns: "2fr 1.2fr 1fr 100px",
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
          <div>Action</div>
        </div>
        {stocks.slice(0, 8).map((s) => (
          <div
            key={s.symbol}
            onClick={() => setSelectedSym(s.symbol)}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1.2fr 1fr 100px",
              padding: "13px 20px",
              alignItems: "center",
              borderBottom: "1px solid #1e2e1e",
              cursor: "pointer",
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
              <div style={{ fontWeight: 700, fontSize: "15px" }}>
                {s.symbol}
              </div>
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
            <div>
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
            </div>
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedSym(s.symbol);
                }}
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
                  transition: "all 0.15s",
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
          </div>
        ))}
      </div>
    </div>
  );
}
