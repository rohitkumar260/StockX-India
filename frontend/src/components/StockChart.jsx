import { useEffect, useRef, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from "chart.js";
import api from "../api/axios";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

function genSimulatedHistory(basePrice, points = 50, range = "1D") {
  const labels = [],
    data = [];
  let price = basePrice * 0.97;
  for (let i = 0; i < points; i++) {
    price *= 1 + (Math.random() - 0.45) * 0.008;
    data.push(parseFloat(price.toFixed(2)));
    if (range === "1D")
      labels.push(
        `${9 + Math.floor((i * 11) / points)}:${String((((i * 660) / points) % 60) | 0).padStart(2, "0")}`,
      );
    else if (range === "1W")
      labels.push(`Day ${Math.floor((i * 7) / points) + 1}`);
    else labels.push(`Mar ${i + 1}`);
  }
  return { labels, data };
}

export default function StockChart({
  symbol,
  assetType = "stock",
  height = 220,
}) {
  const [range, setRange] = useState("1D");
  const [chartData, setChartData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [changePct, setChangePct] = useState(0);

  useEffect(() => {
    loadChart();
    const id = setInterval(updateLastPoint, 3500);
    return () => clearInterval(id);
  }, [symbol, range]);

  async function loadChart() {
    try {
      const endpoint =
        assetType === "crypto" ? `/crypto/${symbol}` : `/stocks/${symbol}`;
      const res = await api.get(endpoint);
      const d = res.data.data;
      setCurrentPrice(d.price);
      setChangePct(d.changePct);

      // Use real history if available, else simulate
      let labels, data;
      if (d.history && d.history.length > 5) {
        labels = d.history.map((h) =>
          new Date(h.time).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        );
        data = d.history.map((h) => h.price);
      } else {
        const sim = genSimulatedHistory(d.price, 50, range);
        labels = sim.labels;
        data = sim.data;
      }
      buildChart(labels, data);
    } catch {
      const sim = genSimulatedHistory(currentPrice || 1000, 50, range);
      buildChart(sim.labels, sim.data);
    }
  }

  function updateLastPoint() {
    setChartData((prev) => {
      if (!prev) return prev;
      const newData = [...prev.datasets[0].data];
      const last = newData[newData.length - 1];
      newData[newData.length - 1] = parseFloat(
        (last * (1 + (Math.random() - 0.48) * 0.004)).toFixed(2),
      );
      return { ...prev, datasets: [{ ...prev.datasets[0], data: newData }] };
    });
  }

  function buildChart(labels, data) {
    setChartData({
      labels,
      datasets: [
        {
          data,
          borderColor: "#00e676",
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          fill: true,
          backgroundColor: (ctx) => {
            if (!ctx.chart.ctx) return "transparent";
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, height);
            g.addColorStop(0, "rgba(0,230,118,0.18)");
            g.addColorStop(1, "rgba(0,230,118,0)");
            return g;
          },
        },
      ],
    });
  }

  const options = {
    responsive: true,
    animation: { duration: 200 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#111811",
        borderColor: "#1e2e1e",
        borderWidth: 1,
        titleColor: "#7a9a7a",
        bodyColor: "#00e676",
        bodyFont: { family: "JetBrains Mono", size: 13 },
        callbacks: {
          label: (c) =>
            `₹${c.raw?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#4a6a4a", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.03)" },
      },
      y: {
        ticks: {
          color: "#4a6a4a",
          font: { size: 10 },
          callback: (v) => "₹" + v.toLocaleString("en-IN"),
        },
        grid: { color: "rgba(255,255,255,0.03)" },
      },
    },
  };

  const fmt = (n) =>
    (parseFloat(n) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div
      style={{
        background: "#111811",
        border: "1px solid #1e2e1e",
        borderRadius: "12px",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "16px",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "Space Mono,monospace",
              fontSize: "20px",
              fontWeight: 700,
            }}
          >
            {symbol}
          </div>
          <div
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              marginTop: "4px",
            }}
          >
            <span
              style={{
                fontFamily: "JetBrains Mono,monospace",
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              ₹{fmt(currentPrice)}
            </span>
            <span
              style={{
                fontSize: "13px",
                color: changePct >= 0 ? "#00e676" : "#ff4444",
                fontFamily: "JetBrains Mono,monospace",
              }}
            >
              {changePct >= 0 ? "+" : ""}
              {changePct}%
            </span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          {["1D", "1W", "1M"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                fontWeight: 600,
                border: `1px solid ${range === r ? "#00e676" : "#1e2e1e"}`,
                borderRadius: "6px",
                background: range === r ? "#00e676" : "transparent",
                color: range === r ? "#000" : "#4a6a4a",
                cursor: "pointer",
                fontFamily: "Rajdhani,sans-serif",
                transition: "all 0.15s",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      {chartData ? (
        <Line data={chartData} options={options} height={height} />
      ) : (
        <div
          style={{
            height: `${height}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#4a6a4a",
            fontSize: "13px",
          }}
        >
          Loading chart...
        </div>
      )}
    </div>
  );
}
