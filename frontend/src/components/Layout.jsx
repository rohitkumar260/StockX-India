import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Layout() {
  const { user, logout, updateBalance } = useAuth();
  const navigate = useNavigate();
  const [ticker, setTicker] = useState([]);
  const [balance, setBalance] = useState(user?.balance || 50000);

  useEffect(() => {
    fetchTicker();
    const id = setInterval(fetchTicker, 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setBalance(user?.balance || 50000);
  }, [user?.balance]);

  async function fetchTicker() {
    try {
      const res = await api.get("/stocks");
      setTicker(res.data.data || []);
      const b = await api.get("/user/balance");
      setBalance(b.data.balance);
      updateBalance(b.data.balance);
    } catch {}
  }

  const fmt = (n) => {
    n = parseFloat(n) || 0;
    if (n >= 10000000) return (n / 10000000).toFixed(2) + "Cr";
    if (n >= 100000) return (n / 100000).toFixed(2) + "L";
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sections = [
    {
      label: "General",
      items: [{ to: "/", label: "Dashboard", icon: "📊", end: true }],
    },
    {
      label: "Indian Markets",
      items: [
        { to: "/markets", label: "NSE/BSE Markets", icon: "📈" },
        { to: "/trade-stocks", label: "Trade Stocks", icon: "⚡" },
      ],
    },
    {
      label: "Crypto",
      items: [
        { to: "/crypto", label: "Crypto Markets", icon: "₿" },
        { to: "/trade-crypto", label: "Trade Crypto", icon: "🔥" },
      ],
    },
    {
      label: "Account",
      items: [
        { to: "/portfolio", label: "Portfolio", icon: "💼" },
        { to: "/watchlist", label: "Watchlist", icon: "⭐" },
        { to: "/orders", label: "Orders", icon: "🕐" },
        { to: "/profile", label: "Profile", icon: "👤" },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Ticker */}
      <div
        style={{
          height: "36px",
          background: "#0f160f",
          borderBottom: "1px solid #1e2e1e",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "40px",
            animation: "ticker 40s linear infinite",
            whiteSpace: "nowrap",
            paddingLeft: "100%",
          }}
        >
          {[...ticker, ...ticker].map((s, i) => (
            <span
              key={i}
              style={{
                display: "inline-flex",
                gap: "8px",
                alignItems: "center",
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "11px",
              }}
            >
              <span style={{ fontWeight: 700, color: "#e8f5e8" }}>
                {s.symbol}
              </span>
              <span style={{ color: "#7a9a7a" }}>₹{fmt(s.price)}</span>
              <span style={{ color: s.changePct >= 0 ? "#00e676" : "#ff4444" }}>
                {s.changePct >= 0 ? "+" : ""}
                {s.changePct}%
              </span>
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }`}</style>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: "235px",
            background: "#0f160f",
            borderRight: "1px solid #1e2e1e",
            display: "flex",
            flexDirection: "column",
            flexShrink: 0,
            overflowY: "auto",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #1e2e1e",
            }}
          >
            <div
              style={{
                fontFamily: "Space Mono,monospace",
                fontWeight: 700,
                fontSize: "20px",
                color: "#e8f5e8",
                lineHeight: 1,
              }}
            >
              StockX
              <span style={{ color: "#00e676", display: "block" }}>India</span>
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#4a6a4a",
                marginTop: "4px",
                letterSpacing: "1px",
              }}
            >
              STOCKS & CRYPTO TRADING PLATFORM
            </div>
          </div>

          {/* Nav Links */}
          <nav style={{ flex: 1, padding: "12px 0" }}>
            {sections.map((sec) => (
              <div key={sec.label}>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    color: "#4a6a4a",
                    textTransform: "uppercase",
                    padding: "8px 18px 4px",
                  }}
                >
                  {sec.label}
                </div>
                {sec.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      padding: "9px 18px",
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#00e676" : "#7a9a7a",
                      background: isActive
                        ? "rgba(0,230,118,0.1)"
                        : "transparent",
                      borderLeft: isActive
                        ? "2px solid #00e676"
                        : "2px solid transparent",
                      transition: "all 0.15s",
                      textDecoration: "none",
                      cursor: "pointer",
                    })}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>

          {/* User Info */}
          <div style={{ borderTop: "1px solid #1e2e1e", padding: "14px 18px" }}>
            <div
              onClick={() => navigate("/profile")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "12px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  background: "#00e676",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#000",
                  flexShrink: 0,
                }}
              >
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#e8f5e8",
                  }}
                >
                  {user?.name}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "#00e676",
                    fontFamily: "JetBrains Mono,monospace",
                  }}
                >
                  ₹{fmt(balance)}
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid #1e2e1e",
                borderRadius: "6px",
                padding: "7px",
                fontSize: "13px",
                color: "#4a6a4a",
                cursor: "pointer",
                fontFamily: "Rajdhani,sans-serif",
                transition: "all 0.2s",
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
              ⏻ Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "26px 26px",
            background: "#0a0f0a",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}
