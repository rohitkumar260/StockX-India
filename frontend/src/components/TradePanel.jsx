import { useState, useEffect } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const s = {
  card: {
    background: "#111811",
    border: "1px solid #1e2e1e",
    borderRadius: "12px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#0a0f0a",
    border: "1px solid #1e2e1e",
    borderRadius: "8px",
    overflow: "hidden",
  },
  tab: (active, type) => ({
    padding: "10px",
    textAlign: "center",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "Rajdhani,sans-serif",
    border: "none",
    background: active
      ? type === "buy"
        ? "#00e676"
        : "#ff4444"
      : "transparent",
    color: active ? (type === "buy" ? "#000" : "#fff") : "#4a6a4a",
  }),
  label: {
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#7a9a7a",
    textTransform: "uppercase",
    marginBottom: "6px",
    display: "block",
  },
  select: {
    width: "100%",
    background: "#0a0f0a",
    border: "1px solid #1e2e1e",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#e8f5e8",
    outline: "none",
    fontFamily: "JetBrains Mono,monospace",
    appearance: "none",
    cursor: "pointer",
  },
  input: {
    width: "100%",
    background: "#0a0f0a",
    border: "1px solid #1e2e1e",
    borderRadius: "6px",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#e8f5e8",
    outline: "none",
    fontFamily: "JetBrains Mono,monospace",
  },
  row: { display: "flex", justifyContent: "space-between", fontSize: "13px" },
  btn: (type) => ({
    width: "100%",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    fontFamily: "Rajdhani,sans-serif",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "1px",
    cursor: "pointer",
    background: type === "buy" ? "#00e676" : "#ff4444",
    color: type === "buy" ? "#000" : "#fff",
    transition: "all 0.2s",
  }),
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 500,
    backdropFilter: "blur(4px)",
  },
  modalBox: {
    background: "#111811",
    border: "1px solid #1e2e1e",
    borderRadius: "14px",
    padding: "28px",
    width: "380px",
    maxWidth: "95vw",
    boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
  },
};

export default function TradePanel({
  symbols,
  assetType = "stock",
  onSymbolChange,
  defaultSymbol,
}) {
  const { updateBalance } = useAuth();
  const [mode, setMode] = useState("buy");
  const [symbol, setSymbol] = useState(defaultSymbol || symbols[0]);
  const [price, setPrice] = useState(0);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPrice(symbol);
    const id = setInterval(() => fetchPrice(symbol), 4000);
    return () => clearInterval(id);
  }, [symbol]);

  async function fetchPrice(sym) {
    try {
      const endpoint =
        assetType === "crypto" ? `/crypto/${sym}` : `/stocks/${sym}`;
      const res = await api.get(endpoint);
      setPrice(res.data.data.price);
    } catch {}
  }

  const fmt = (n) => {
    n = parseFloat(n) || 0;
    if (n >= 100000) return (n / 100000).toFixed(2) + "L";
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const total = parseFloat((price * qty).toFixed(2));
  const charges = parseFloat(
    (total * (assetType === "crypto" ? 0.002 : 0.001)).toFixed(2),
  );

  const handleSymbolChange = (e) => {
    setSymbol(e.target.value);
    if (onSymbolChange) onSymbolChange(e.target.value);
  };

  const placeTrade = async () => {
    setLoading(true);
    try {
      const endpoint = mode === "buy" ? "/trades/buy" : "/trades/sell";
      const res = await api.post(endpoint, {
        symbol,
        quantity: qty,
        assetType,
      });
      toast.success(res.data.message);
      updateBalance(res.data.newBalance);
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || "Trade failed");
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={s.card}>
        {/* Buy/Sell tabs */}
        <div style={s.tabs}>
          <button
            style={s.tab(mode === "buy", "buy")}
            onClick={() => setMode("buy")}
          >
            BUY
          </button>
          <button
            style={s.tab(mode === "sell", "sell")}
            onClick={() => setMode("sell")}
          >
            SELL
          </button>
        </div>

        {/* Symbol */}
        <div>
          <span style={s.label}>Symbol</span>
          <div style={{ position: "relative" }}>
            <select
              style={s.select}
              value={symbol}
              onChange={handleSymbolChange}
              onFocus={(e) => (e.target.style.borderColor = "#00e676")}
              onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
            >
              {symbols.map((sym) => (
                <option key={sym} value={sym}>
                  {sym}
                </option>
              ))}
            </select>
            <span
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#4a6a4a",
                fontSize: "10px",
                pointerEvents: "none",
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Price */}
        <div>
          <span style={s.label}>Price (₹)</span>
          <input
            style={s.input}
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
            step="0.01"
            onFocus={(e) => (e.target.style.borderColor = "#00e676")}
            onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
          />
        </div>

        {/* Qty */}
        <div>
          <span style={s.label}>QTY</span>
          <input
            style={s.input}
            type="number"
            value={qty}
            min={assetType === "crypto" ? 0.001 : 1}
            step={assetType === "crypto" ? 0.001 : 1}
            onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
            onFocus={(e) => (e.target.style.borderColor = "#00e676")}
            onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
          />
        </div>

        {/* Totals */}
        <div>
          <div style={s.row}>
            <span style={{ color: "#4a6a4a" }}>Total</span>
            <span style={{ fontFamily: "JetBrains Mono,monospace" }}>
              ₹{fmt(total)}
            </span>
          </div>
          <div style={{ ...s.row, marginTop: "4px" }}>
            <span style={{ color: "#4a6a4a" }}>Charges</span>
            <span style={{ fontFamily: "JetBrains Mono,monospace" }}>
              ₹{fmt(charges)}
            </span>
          </div>
        </div>

        <button
          style={s.btn(mode)}
          onClick={() => setShowModal(true)}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow =
              mode === "buy"
                ? "0 8px 24px rgba(0,230,118,0.25)"
                : "0 8px 24px rgba(255,68,68,0.25)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "";
            e.target.style.boxShadow = "";
          }}
        >
          Place {mode.toUpperCase()} Order
        </button>
      </div>

      {/* Confirm Modal */}
      {showModal && (
        <div style={s.modal} onClick={() => setShowModal(false)}>
          <div style={s.modalBox} onClick={(e) => e.stopPropagation()}>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 700,
                marginBottom: "18px",
              }}
            >
              Confirm {mode.toUpperCase()} Order
            </div>
            <div
              style={{ color: "#7a9a7a", fontSize: "15px", lineHeight: 1.8 }}
            >
              <div>
                Symbol: <strong style={{ color: "#e8f5e8" }}>{symbol}</strong>
              </div>
              <div>
                Type:{" "}
                <strong
                  style={{ color: mode === "buy" ? "#00e676" : "#ff4444" }}
                >
                  {mode.toUpperCase()}
                </strong>
              </div>
              <div>
                Price:{" "}
                <strong
                  style={{
                    color: "#e8f5e8",
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  ₹{fmt(price)}
                </strong>
              </div>
              <div>
                Quantity: <strong style={{ color: "#e8f5e8" }}>{qty}</strong>
              </div>
              <div>
                Total:{" "}
                <strong
                  style={{
                    color: "#e8f5e8",
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  ₹{fmt(total)}
                </strong>
              </div>
              <div>
                Charges:{" "}
                <strong
                  style={{
                    color: "#e8f5e8",
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  ₹{fmt(charges)}
                </strong>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "transparent",
                  border: "1px solid #1e2e1e",
                  borderRadius: "8px",
                  color: "#4a6a4a",
                  fontFamily: "Rajdhani,sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={placeTrade}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: mode === "buy" ? "#00e676" : "#ff4444",
                  border: "none",
                  borderRadius: "8px",
                  color: mode === "buy" ? "#000" : "#fff",
                  fontFamily: "Rajdhani,sans-serif",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
