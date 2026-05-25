import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import { Markets } from "./pages/Markets";
import TradeStocks from "./pages/TradeStocks";
import CryptoMarkets from "./pages/CryptoMarkets";
import TradeCrypto from "./pages/TradeCrypto";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";
import Watchlist from "./pages/Watchlist";
import Profile from "./pages/Profile";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#0a0f0a",
        }}
      >
        <div
          style={{
            color: "#00e676",
            fontFamily: "JetBrains Mono",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      </div>
    );
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111811",
              color: "#e8f5e8",
              border: "1px solid #1e2e1e",
              fontFamily: "Rajdhani, sans-serif",
              fontSize: "15px",
            },
            success: { iconTheme: { primary: "#00e676", secondary: "#000" } },
            error: { iconTheme: { primary: "#ff4444", secondary: "#fff" } },
          }}
        />
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="markets" element={<Markets />} />
            <Route path="trade-stocks" element={<TradeStocks />} />
            <Route path="crypto" element={<CryptoMarkets />} />
            <Route path="trade-crypto" element={<TradeCrypto />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} /> /////
            <Route path="watchlist" element={<Watchlist />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
