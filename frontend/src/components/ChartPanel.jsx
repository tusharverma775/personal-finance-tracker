import React from "react";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

// Default options for smaller charts
const defaultOptions = {
  responsive: true, // disable auto-resize
  maintainAspectRatio: true, // respect container size
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        font: {
          size: 12, // smaller labels
        },
      },
    },
    tooltip: {
      enabled: true,
    },
  },
};

export function PieChart({ data, options = {} }) {
  return (
    <div className="w-48 h-48">
      <Pie data={data} options={{ ...defaultOptions, ...options }} width={192} height={192} />
    </div>
  );
}

export function LineChart({ data, options = {} }) {
  return (
    <div className="w-full h-60 md:h-64">
      <Line data={data} options={{ ...defaultOptions, ...options }} width={400} height={200} />
    </div>
  );
}

export function BarChart({ data, options = {} }) {
  return (
    <div className="w-full h-60 md:h-64">
      <Bar data={data} options={{ ...defaultOptions, ...options }} width={400} height={200} />
    </div>
  );
}
