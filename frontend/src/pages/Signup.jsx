import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#172217",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "absolute",
    inset: 0,
    backgroundImage:
      "linear-gradient(rgba(0,230,118,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,230,118,0.03) 1px,transparent 1px)",
    backgroundSize: "40px 40px",
    pointerEvents: "none",
  },
  glow: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse 60% 60% at 90% 30%,rgba(0,230,118,0.05) 0%,transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    width: "860px",
    maxWidth: "95vw",
    border: "1px solid #1e2e1e",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 0 80px rgba(0,230,118,0.07)",
  },
  left: {
    flex: 1,
    background: "linear-gradient(135deg,#0a160a,#0f1f0f)",
    padding: "50px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    borderRight: "1px solid #1e2e1e",
  },
  right: {
    flex: 1,
    background: "#0f160f",
    padding: "50px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brand: {
    fontFamily: "Space Mono,monospace",
    fontWeight: 700,
    fontSize: "26px",
    color: "#e8f5e8",
  },
  green: { color: "#00e676", display: "block" },
  tag: {
    fontSize: "11px",
    color: "#4a6a4a",
    marginTop: "6px",
    letterSpacing: "1px",
  },
  h2: {
    fontSize: "26px",
    fontWeight: 700,
    color: "#e8f5e8",
    lineHeight: 1.3,
    marginTop: "36px",
  },
  p: { fontSize: "14px", color: "#7a9a7a", lineHeight: 1.7, marginTop: "14px" },
  feats: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  feat: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    color: "#7a9a7a",
  },
  dot: {
    width: "6px",
    height: "6px",
    background: "#00e676",
    borderRadius: "50%",
    flexShrink: 0,
  },
  title: { fontSize: "26px", fontWeight: 700, marginBottom: "4px" },
  sub: { fontSize: "14px", color: "#4a6a4a", marginBottom: "24px" },
  group: { marginBottom: "14px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#7a9a7a",
    marginBottom: "6px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    background: "#111811",
    border: "1px solid #1e2e1e",
    borderRadius: "8px",
    padding: "10px 14px",
    fontSize: "15px",
    color: "#e8f5e8",
    outline: "none",
  },
  btn: {
    width: "100%",
    background: "#00e676",
    color: "#000",
    border: "none",
    borderRadius: "8px",
    padding: "13px",
    fontSize: "16px",
    fontWeight: 700,
    letterSpacing: "1px",
    cursor: "pointer",
    marginTop: "6px",
  },
  sw: {
    textAlign: "center",
    marginTop: "16px",
    fontSize: "14px",
    color: "#4a6a4a",
  },
  link: { color: "#00e676", fontWeight: 600 },
};

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const focus = (e) => {
    e.target.style.borderColor = "#00e676";
  };
  const blur = (e) => {
    e.target.style.borderColor = "#1e2e1e";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, confirm } = form;
    if (!name || !email || !password || !confirm)
      return toast.error("Fill all fields");
    if (password.length < 6)
      return toast.error("Password must be 6+ characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await signup(name, email, password);
      toast.success("Account created! Welcome to StockX India 🚀");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.grid} />
      <div style={s.glow} />
      <div style={s.container}>
        <div style={s.left}>
          <div style={s.brand}>
            StockX<span style={s.green}>India</span>
          </div>
          <div style={s.tag}>STOCKS & CRYPTO TRADING PLATFORM</div>
          <h2 style={s.h2}>
            Start your <span style={{ color: "#00e676" }}>Paper Trading</span>{" "}
            journey today
          </h2>
          <p style={s.p}>
            Practice trading with ₹50,000 virtual money. No real money at risk.
            Learn to trade Indian markets like a pro.
          </p>
          <div style={s.feats}>
            {[
              "₹50,000 virtual starting balance",
              "NSE/BSE real-time stock data",
              "Crypto trading BTC, ETH & more",
              "Portfolio & order tracking",
              "Zero risk – 100% learning",
            ].map((f) => (
              <div key={f} style={s.feat}>
                <div style={s.dot} />
                {f}
              </div>
            ))}
          </div>
        </div>
        <div style={s.right}>
          <div style={s.title}>Create Account</div>
          <div style={s.sub}>Start trading with ₹50,000 virtual money</div>
          <form onSubmit={handleSubmit}>
            {[
              {
                key: "name",
                label: "Full Name",
                type: "text",
                ph: "Aman Kumar",
              },
              {
                key: "email",
                label: "Email Address",
                type: "email",
                ph: "aman@example.com",
              },
              {
                key: "password",
                label: "Password",
                type: "password",
                ph: "Min. 6 characters",
              },
              {
                key: "confirm",
                label: "Confirm Password",
                type: "password",
                ph: "Repeat password",
              },
            ].map(({ key, label, type, ph }) => (
              <div key={key} style={s.group}>
                <label style={s.label}>{label}</label>
                <input
                  style={s.input}
                  type={type}
                  placeholder={ph}
                  value={form[key]}
                  onChange={set(key)}
                  onFocus={focus}
                  onBlur={blur}
                />
              </div>
            ))}
            <button
              style={{ ...s.btn, opacity: loading ? 0.7 : 1 }}
              disabled={loading}
            >
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </button>
          </form>
          <div style={s.sw}>
            Already have an account?{" "}
            <Link to="/login" style={s.link}>
              Login here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
