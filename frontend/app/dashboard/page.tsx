"use client";

import { useState, useEffect } from "react";
import { getStoredUser } from "@/lib/auth";
import api from "@/lib/api";
import TopNavbar from "@/components/TopNavbar";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Transaction {
  id: number;
  from_user?: { email: string };
  to_user?: { email: string };
  tool?: { name: string };
  tool_name?: string;  // ← Add this line
  amount_mnee: string;
  tx_hash: string;
  status: string;
  created_at: string;
}
export default function DashboardPage() {
  const [balance, setBalance] = useState("0.00");
  const [totalEarned, setTotalEarned] = useState("0.00");
  const [totalSpent, setTotalSpent] = useState("0.00");
  const [earnings, setEarnings] = useState<Transaction[]>([]);
  const [spending, setSpending] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [balanceRes, earningsRes, spendingRes] = await Promise.all([
          api.get("/api/payments/balance"),
          api.get("/api/payments/earnings"),
          api.get("/api/payments/spending"),
        ]);

        setBalance(balanceRes.data.balance_mnee || "0.00");
        setEarnings(earningsRes.data.transactions || []);
        setSpending(spendingRes.data.transactions || []);
        setTotalEarned(earningsRes.data.total_earned || "0.00");
        setTotalSpent(spendingRes.data.total_spent || "0.00");
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const netActivity = (parseFloat(totalEarned) - parseFloat(totalSpent)).toFixed(2);

  // Chart data
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Earnings",
        data: [12, 19, 15, 25, 22, 30],
        fill: true,
        backgroundColor: "rgba(102, 126, 234, 0.1)",
        borderColor: "rgba(102, 126, 234, 1)",
        tension: 0.4,
      },
      {
        label: "Spending",
        data: [8, 12, 10, 15, 13, 18],
        fill: true,
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderColor: "rgba(239, 68, 68, 1)",
        tension: 0.4,
      },
    ],
  };

  const barChartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Transactions",
        data: [5, 8, 6, 12, 9, 7, 10],
        backgroundColor: "rgba(118, 75, 162, 0.8)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div>
      <TopNavbar title="Dashboard" subtitle="Welcome back, track your earnings and spending" />

      <div className="p-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-indigo-100 text-sm font-medium mb-2">Current Balance</p>
                <h3 className="text-3xl font-bold">{balance} MNEE</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              <span>Your wallet balance</span>
            </div>
          </div>

          {/* Total Earned */}
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-2">Total Earned</p>
                <h3 className="text-3xl font-bold">{totalEarned} MNEE</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="font-semibold">+{earnings.length}</span>
              <span>transactions</span>
            </div>
          </div>

          {/* Total Spent */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium mb-2">Total Spent</p>
                <h3 className="text-3xl font-bold">{totalSpent} MNEE</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="font-semibold">{spending.length}</span>
              <span>transactions</span>
            </div>
          </div>

          {/* Net Activity */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-xl border border-white/10">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-2">Net Activity</p>
                <h3 className="text-3xl font-bold">{netActivity} MNEE</h3>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {parseFloat(netActivity) >= 0 ? (
                <>
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Positive flow</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Negative flow</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Earnings vs Spending</h3>
            <div className="h-64">
              <Line data={lineChartData} options={chartOptions} />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">Weekly Transactions</h3>
            <div className="h-64">
              <Bar data={barChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Transactions Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Earnings */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              Recent Earnings
            </h3>
            <div className="space-y-3">
              {earnings.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No earnings yet</p>
              ) : (
                earnings.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{tx.tool?.name || "Unknown Tool"}</span>
                      <span className="text-green-400 font-bold">+{tx.amount_mnee} MNEE</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Spending */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-400" />
              Recent Spending
            </h3>
            <div className="space-y-3">
              {spending.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No spending yet</p>
              ) : (
                spending.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{tx.tool_name || tx.tool?.name || "Unknown Tool"}</span>
                      <span className="text-red-400 font-bold">-{tx.amount_mnee} MNEE</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(tx.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
