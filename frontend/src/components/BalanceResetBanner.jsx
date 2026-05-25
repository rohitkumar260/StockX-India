import { useState, useEffect } from "react";
import api from "../api/axios";

export default function BalanceResetBanner() {
  const [resetInfo, setResetInfo] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [wasReset, setWasReset] = useState(false);

  useEffect(() => {
    fetchResetInfo();
    const id = setInterval(fetchResetInfo, 60000);
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
        fetchResetInfo();
      } else setTimeLeft(formatTime(secs));
    }, 1000);
    return () => clearInterval(id);
  }, [resetInfo?.secondsLeft]);

  async function fetchResetInfo() {
    try {
      const r = await api.get("/user/balance");
      setResetInfo(r.data.resetInfo);
      if (r.data.wasReset) setWasReset(true);
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

  if (wasReset) {
    return (
      <div
        style={{
          background: "rgba(0,230,118,0.1)",
          border: "1px solid #00e676",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <div style={{ fontSize: "32px" }}>🎉</div>
        <div>
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#00e676",
              marginBottom: "2px",
            }}
          >
            Balance Reset Ho Gaya!
          </div>
          <div style={{ fontSize: "13px", color: "#7a9a7a" }}>
            Aapko ₹50,000 wapas mil gaye hain. Fresh start karo!
          </div>
        </div>
        <button
          onClick={() => setWasReset(false)}
          style={{
            marginLeft: "auto",
            background: "transparent",
            border: "none",
            color: "#4a6a4a",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  if (resetInfo?.isBalanceDepleted && timeLeft) {
    return (
      <div
        style={{
          background: "rgba(255,68,68,0.07)",
          border: "1px solid rgba(255,68,68,0.3)",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div>
            <div
              style={{ fontSize: "15px", fontWeight: 700, color: "#ff6b6b" }}
            >
              Insufficient Balance!
            </div>
            <div style={{ fontSize: "12px", color: "#4a6a4a" }}>
              You will automatically receive ₹50,000 after 30 days.
            </div>
          </div>
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
                background: "rgba(0,0,0,0.3)",
                border: "1px solid rgba(255,68,68,0.25)",
                borderRadius: "8px",
                padding: "10px 16px",
                textAlign: "center",
                minWidth: "64px",
              }}
            >
              <div
                style={{
                  fontFamily: "JetBrains Mono,monospace",
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#ff6b6b",
                }}
              >
                {String(val).padStart(2, "0")}
              </div>
              <div
                style={{
                  fontSize: "10px",
                  color: "#4a6a4a",
                  marginTop: "4px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "12px", fontSize: "12px", color: "#4a6a4a" }}>
          🗓️ Reset date:{" "}
          <strong style={{ color: "#7a9a7a" }}>
            {new Date(resetInfo.balanceResetDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </strong>
        </div>
      </div>
    );
  }

  return null;
}
