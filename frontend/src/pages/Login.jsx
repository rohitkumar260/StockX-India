import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const styles = {
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
      "radial-gradient(ellipse 60% 60% at 10% 50%,rgba(0,230,118,0.06) 0%,transparent 70%)",
    pointerEvents: "none",
  },
  container: {
    display: "flex",
    width: "860px",
    maxWidth: "95vw",
    minHeight: "540px",
    border: "1px solid #1e2e1e",
    borderRadius: "16px",
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 0 80px rgba(0,230,118,0.07)",
  },
  left: {
    flex: 1,
    background: "linear-gradient(135deg,#0a160a 0%,#0f1f0f 100%)",
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
  brandName: {
    fontFamily: "Space Mono,monospace",
    fontWeight: 700,
    fontSize: "26px",
    color: "#e8f5e8",
    lineHeight: 1,
  },
  brandGreen: { color: "#00e676", display: "block" },
  tagline: {
    fontSize: "11px",
    color: "#4a6a4a",
    marginTop: "6px",
    letterSpacing: "1px",
  },
  illustration: { marginTop: "40px" },
  h2: { fontSize: "26px", fontWeight: 700, color: "#e8f5e8", lineHeight: 1.3 },
  h2green: { color: "#00e676" },
  p: { marginTop: "16px", fontSize: "14px", color: "#7a9a7a", lineHeight: 1.7 },
  features: {
    marginTop: "28px",
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
  title: { fontSize: "26px", fontWeight: 700, marginBottom: "6px" },
  subtitle: { fontSize: "14px", color: "#4a6a4a", marginBottom: "28px" },
  formGroup: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "1px",
    color: "#7a9a7a",
    marginBottom: "7px",
    textTransform: "uppercase",
  },
  input: {
    width: "100%",
    background: "#111811",
    border: "1px solid #1e2e1e",
    borderRadius: "8px",
    padding: "11px 14px",
    fontSize: "15px",
    color: "#e8f5e8",
    outline: "none",
    transition: "border-color 0.2s",
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
    transition: "all 0.2s",
  },
  switchText: {
    textAlign: "center",
    marginTop: "18px",
    fontSize: "14px",
    color: "#4a6a4a",
  },
  switchLink: { color: "#00e676", fontWeight: 600 },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Fill all fields");
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.grid} />
      <div style={styles.glow} />
      <div style={styles.container}>
        <div style={styles.left}>
          <div style={styles.brandName}>
            StockX<span style={styles.brandGreen}>India</span>
          </div>
          <div style={styles.tagline}>STOCKS & CRYPTO TRADING PLATFORM</div>
          <div style={styles.illustration}>
            <h2 style={styles.h2}>
              Welcome back to your{" "}
              <span style={styles.h2green}>Trading Desk</span>
            </h2>
            <p style={styles.p}>
              Your virtual portfolio awaits. Check your positions, place new
              orders, and track your performance in real-time.
            </p>
            <div style={styles.features}>
              {[
                "Live NSE/BSE market simulation",
                "Real-time portfolio tracking",
                "Crypto trading included",
                "Full order history",
              ].map((f) => (
                <div key={f} style={styles.feat}>
                  <div style={styles.dot} />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={styles.right}>
          <div style={styles.title}>Login</div>
          <div style={styles.subtitle}>Access your trading account</div>
          <form onSubmit={handleSubmit}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#00e676")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = "#00e676")}
                onBlur={(e) => (e.target.style.borderColor = "#1e2e1e")}
              />
            </div>
            <button
              style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
              type="submit"
              disabled={loading}
            >
              {loading ? "LOGGING IN..." : "LOGIN →"}
            </button>
          </form>
          <div style={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/signup" style={styles.switchLink}>
              Sign up free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
