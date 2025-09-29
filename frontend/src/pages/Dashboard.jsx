import React, { useContext, useMemo } from "react";
import useSWR from "swr";
import client from "../api/axios";
import { PieChart, LineChart, BarChart } from "../components/ChartPanel";
import { AuthContext } from "../contexts/AuthContext";

const fetcher = url => client.get(url).then(r => r.data);

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const { data, error } = useSWR(
    user ? `/analytics/${user.id}` : null,
    fetcher,
    { dedupingInterval: 15 * 60 * 1000 }
  );

  // Safe defaults
  const categoryDistribution = data?.categoryDistribution || [];
  const monthlyTrends = data?.monthlyTrends || [];
  const incomeVsExpenses = data?.incomeVsExpenses || [];

  // --- Pie Chart
  const pieData = useMemo(() => ({
    labels: categoryDistribution.map((_, idx) => `Category ${idx + 1}`),
    datasets: [
      {
        data: categoryDistribution.map(d => d.total),
        backgroundColor: [
          "rgba(75,192,192,0.6)",
          "rgba(255,99,132,0.6)",
          "rgba(54,162,235,0.6)",
          "rgba(255,206,86,0.6)"
        ]
      }
    ]
  }), [categoryDistribution]);

  // --- Line Chart
  const lineData = useMemo(() => ({
    labels: monthlyTrends.map(m => m.month),
    datasets: [
      {
        label: "Total",
        data: monthlyTrends.map(m => m.total),
        borderColor: "rgba(75,192,192,1)",
        fill: false
      }
    ]
  }), [monthlyTrends]);

  // --- Bar Chart
  const barData = useMemo(() => ({
    labels: incomeVsExpenses.map(d => d.type),
    datasets: [
      {
        label: "Amount",
        data: incomeVsExpenses.map(d => d.total),
        backgroundColor: incomeVsExpenses.map(d =>
          d.type === "income" ? "rgba(75,192,192,0.6)" : "rgba(255,99,132,0.6)"
        )
      }
    ]
  }), [incomeVsExpenses]);

  // --- UI handling AFTER hooks
  if (!data && !error) return <div className="p-6">Loading analytics...</div>;
  if (error) return <div className="p-6">Error loading analytics</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ccol-span-1 bg-white p-4 rounded shadow w-48 h-48">
          <h2 className="font-medium mb-2">Category Distribution</h2>
          <PieChart  data={pieData} />
        </div>
        <div className="col-span-2 bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2">Monthly Trends</h2>
          <LineChart data={lineData} />
        </div>
        <div className="col-span-3 bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2">Income vs Expenses</h2>
          <BarChart data={barData} />
        </div>
      </div>
    </div>
  );
}

// export default function Dashboard() {
//   const { user } = useContext(AuthContext);

//   const { data, error } = useSWR(user ? `/analytics/${user.id}` : null, fetcher, {
//     dedupingInterval: 15 * 60 * 1000 // matches backend cache window
//   });

//   if (!data && !error) return <div className="p-6">Loading analytics...</div>;
//   if (error) return <div className="p-6">Error loading analytics</div>;

//   // Defensive: if backend shape differs, fallback to empty arrays
//   const categoryDistribution = data.categoryDistribution || [];
//   const months = data.months || [];
//   const incomeByMonth = data.incomeByMonth || [];
//   const expenseByMonth = data.expenseByMonth || [];

//   const pieData = useMemo(() => ({
//     labels: categoryDistribution.map(d => d.category),
//     datasets: [{ data: categoryDistribution.map(d => d.total), label: "Categories" }]
//   }), [categoryDistribution]);

//   const lineData = useMemo(() => ({
//     labels: months,
//     datasets: [
//       { label: "Income", data: incomeByMonth, fill: false },
//       { label: "Expenses", data: expenseByMonth, fill: false }
//     ]
//   }), [months, incomeByMonth, expenseByMonth]);

//   const barData = useMemo(() => ({
//     labels: months,
//     datasets: [
//       { label: "Income", data: incomeByMonth },
//       { label: "Expenses", data: expenseByMonth }
//     ]
//   }), [months, incomeByMonth, expenseByMonth]);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <div className="col-span-1 bg-white p-4 rounded shadow">
//           <h2 className="font-medium mb-2">Category breakdown</h2>
//           <PieChart data={pieData} />
//         </div>
//         <div className="col-span-2 bg-white p-4 rounded shadow">
//           <h2 className="font-medium mb-2">Income vs Expense (Monthly)</h2>
//           <LineChart data={lineData} />
//         </div>
//         <div className="col-span-3 bg-white p-4 rounded shadow">
//           <h2 className="font-medium mb-2">Income vs Expense (Bar)</h2>
//           <BarChart data={barData} />
//         </div>
//       </div>
//     </div>
//   );
// }
