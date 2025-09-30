
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

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false, // fill parent div
  plugins: {
    legend: {
      position: "bottom",
      labels: { font: { size: 12 } },
    },
    tooltip: { enabled: true },
  },
};

// Pie chart
export function PieChart({ data, options = {} }) {
  return (
    <div className="relative w-full h-64 sm:h-72">
      <Pie data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

// Line chart
export function LineChart({ data, options = {} }) {
  return (
    <div className="relative w-full h-72 sm:h-80">
      <Line data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}

// Bar chart
export function BarChart({ data, options = {} }) {
  return (
    <div className="relative w-full h-72 sm:h-80">
      <Bar data={data} options={{ ...defaultOptions, ...options }} />
    </div>
  );
}
