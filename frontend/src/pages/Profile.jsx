import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const fmt = (n) => {
  n = parseFloat(n) || 0;
  if (n >= 100000) return (n / 100000).toFixed(2) + "L";
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [resetInfo, setResetInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [wasReset, setWasReset] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalInvested: 0,
    totalPnl: 0,
  });

  useEffect(() => {
    fetchBalance();
    fetchStats();
    const id = setInterval(fetchBalance, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!resetInfo?.isBalanceDepleted || !resetInfo?.secondsLeft) return;
    let secs = resetInfo.secondsLeft;
    setTimeLeft(formatTime(secs));
    const id = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        clearInterval(id);
        fetchBalance();
      } else setTimeLeft(formatTime(secs));
    }, 1000);
    return () => clearInterval(id);
  }, [resetInfo?.secondsLeft]);

  async function fetchBalance() {
    try {
      const r = await api.get("/user/balance");
      setResetInfo(r.data.resetInfo);
      if (r.data.wasReset) setWasReset(true);
    } catch {}
  }

  async function fetchStats() {
    try {
      const [tradesRes, portfolioRes] = await Promise.all([
        api.get("/trades"),
        api.get("/portfolio"),
      ]);
      setStats({
        totalOrders: tradesRes.data.pagination?.total || 0,
        totalInvested: portfolioRes.data.summary?.totalInvested || 0,
        totalPnl: portfolioRes.data.summary?.totalPnl || 0,
      });
    } catch {}
  }

  function formatTime(totalSeconds) {
    return {
      d: Math.floor(totalSeconds / 86400),
      h: Math.floor((totalSeconds % 86400) / 3600),
      m: Math.floor((totalSeconds % 3600) / 60),
      s: totalSeconds % 60,
    };
  }

  const card = {
    background: "#111811",
    border: "1px solid #1e2e1e",
    borderRadius: "12px",
    padding: "20px",
  };
  const label = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "1.5px",
    color: "#4a6a4a",
    textTransform: "uppercase",
    marginBottom: "8px",
  };
  const val = {
    fontFamily: "JetBrains Mono,monospace",
    fontSize: "20px",
    fontWeight: 700,
  };

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
        Profile
      </h1>
      <p style={{ color: "#4a6a4a", fontSize: "14px", marginBottom: "24px" }}>
        Your account details And balance info
      </p>

      {/* ── User Info Card ── */}
      <div
        style={{
          ...card,
          display: "flex",
          alignItems: "center",
          gap: "20px",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            background: "#00e676",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            fontWeight: 700,
            color: "#000",
            flexShrink: 0,
          }}
        >
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{ fontSize: "22px", fontWeight: 700, marginBottom: "4px" }}
          >
            {user?.name}
          </div>
          <div style={{ fontSize: "14px", color: "#4a6a4a" }}>
            {user?.email}
          </div>
          <div style={{ fontSize: "12px", color: "#3a5a3a", marginTop: "4px" }}>
            Member since{" "}
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(
              "en-IN",
              { day: "numeric", month: "long", year: "numeric" },
            )}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "10px",
              color: "#4a6a4a",
              textTransform: "uppercase",
              letterSpacing: "1px",
              marginBottom: "4px",
            }}
          >
            Available Balance
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: "26px",
              fontWeight: 700,
              color: "#00e676",
            }}
          >
            ₹{fmt(user?.balance)}
          </div>
          <div style={{ fontSize: "11px", color: "#3a5a3a", marginTop: "2px" }}>
            of ₹50,000 limit
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <div style={card}>
          <div style={label}>Total Orders</div>
          <div style={val}>{stats.totalOrders}</div>
          <div style={{ fontSize: "12px", color: "#00e676", marginTop: "4px" }}>
            Executed
          </div>
        </div>
        <div style={card}>
          <div style={label}>Total Invested</div>
          <div style={val}>₹{fmt(stats.totalInvested)}</div>
          <div style={{ fontSize: "12px", color: "#4a6a4a", marginTop: "4px" }}>
            Current holdings
          </div>
        </div>
        <div style={card}>
          <div style={label}>Total P&L</div>
          <div
            style={{
              ...val,
              color: stats.totalPnl >= 0 ? "#00e676" : "#ff4444",
            }}
          >
            {stats.totalPnl >= 0 ? "+" : "−"}₹{fmt(Math.abs(stats.totalPnl))}
          </div>
          <div style={{ fontSize: "12px", color: "#4a6a4a", marginTop: "4px" }}>
            Profit / Loss
          </div>
        </div>
      </div>

      {/* ── Balance Reset Section ── */}
      <div style={{ ...card, marginBottom: "16px" }}>
        <div
          style={{
            fontSize: "16px",
            fontWeight: 700,
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          💰 Balance Reset Info
        </div>

        {/* Reset Ho Gaya */}
        {wasReset && (
          <div
            style={{
              background: "rgba(0,230,118,0.1)",
              border: "1px solid #00e676",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span style={{ fontSize: "28px" }}>🎉</span>
            <div>
              <div
                style={{ fontWeight: 700, color: "#00e676", fontSize: "15px" }}
              >
                Balance Reset Ho Gaya!
              </div>
              <div
                style={{ fontSize: "13px", color: "#7a9a7a", marginTop: "2px" }}
              >
                ₹50,000 wapas mil gaye — fresh start karo!
              </div>
            </div>
          </div>
        )}

        {/* Depleted — Countdown */}
        {resetInfo?.isBalanceDepleted && timeLeft ? (
          <div>
            <div
              style={{
                background: "rgba(255,68,68,0.08)",
                border: "1px solid rgba(255,68,68,0.3)",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#ff6b6b",
                  marginBottom: "4px",
                }}
              >
                ⚠️ Insufficient Balance!
              </div>
              <div style={{ fontSize: "13px", color: "#4a6a4a" }}>
                You will automatically receive ₹50,000 after 30 days
              </div>
            </div>

            {/* Countdown */}
            <div style={{ marginBottom: "14px" }}>
              <div
                style={{
                  fontSize: "12px",
                  color: "#4a6a4a",
                  marginBottom: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Time left to reset Amount:
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                {[
                  { val: timeLeft.d, label: "Days" },
                  { val: timeLeft.h, label: "Hours" },
                  { val: timeLeft.m, label: "Min" },
                  { val: timeLeft.s, label: "Sec" },
                ].map(({ val, label }) => (
                  <div
                    key={label}
                    style={{
                      background: "#0a0f0a",
                      border: "1px solid rgba(255,68,68,0.2)",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      textAlign: "center",
                      minWidth: "68px",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "JetBrains Mono,monospace",
                        fontSize: "26px",
                        fontWeight: 700,
                        color: "#ff6b6b",
                        lineHeight: 1,
                      }}
                    >
                      {String(val).padStart(2, "0")}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "#4a6a4a",
                        marginTop: "5px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "#4a6a4a" }}>
              🗓️ Reset hoga:{" "}
              <strong style={{ color: "#7a9a7a" }}>
                {new Date(resetInfo.balanceResetDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </strong>
            </div>
          </div>
        ) : (
          /* Normal — Balance Theek Hai */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
            }}
          >
            <div
              style={{
                background: "#0a0f0a",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#4a6a4a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Current Balance
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#00e676",
                }}
              >
                ₹{fmt(user?.balance)}
              </div>
            </div>
            <div
              style={{
                background: "#0a0f0a",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#4a6a4a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Reset Threshold
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#7a9a7a",
                }}
              >
                ₹100
              </div>
              <div
                style={{ fontSize: "11px", color: "#3a5a3a", marginTop: "2px" }}
              >
                Is se kam hone par timer start
              </div>
            </div>
            <div
              style={{
                background: "#0a0f0a",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#4a6a4a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Reset Amount
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#00e676",
                }}
              >
                ₹50,000
              </div>
            </div>
            <div
              style={{
                background: "#0a0f0a",
                borderRadius: "8px",
                padding: "14px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#4a6a4a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Reset Period
              </div>
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#7a9a7a",
                }}
              >
                30 Days
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Watchlist ── */}
      <div style={card}>
        <div
          style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}
        >
          ⭐ Watchlist ({user?.watchlist?.length || 0} stocks)
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {user?.watchlist?.map((sym) => (
            <span
              key={sym}
              style={{
                background: "rgba(0,230,118,0.1)",
                border: "1px solid rgba(0,230,118,0.2)",
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "13px",
                fontWeight: 600,
                color: "#00e676",
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              {sym}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
