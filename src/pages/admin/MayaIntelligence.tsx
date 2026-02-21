import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";
import { io } from "socket.io-client";

interface OverviewData {
  autonomy: any;
  recentActions: any[];
  clusterDistribution: any[];
  lenderAccuracy?: any[];
  confidenceTrend?: any[];
}

const COLORS = ["#4f46e5", "#16a34a", "#dc2626"];

export default function MayaIntelligence() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [liveEvents, setLiveEvents] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/maya/overview")
      .then(res => res.json())
      .then(setData);

    const socket = io();
    socket.on("maya_event", (event) => {
      setLiveEvents(prev => [event, ...prev.slice(0, 9)]);
    });

    return () => { socket.disconnect(); };
  }, []);

  async function updateAutonomy(level: number) {
    await fetch("/api/maya/set-autonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level })
    });
    window.location.reload();
  }

  async function emergencyShutdown() {
    await fetch("/api/maya/shutdown", { method: "POST" });
    window.location.reload();
  }

  if (!data) return <div>Loading Maya Intelligence...</div>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Maya Intelligence Dashboard</h1>

      {/* Autonomy Controls */}
      <div>
        <h2 className="font-semibold">Autonomy Level</h2>
        <input
          type="range"
          min="0"
          max="5"
          value={data.autonomy.autonomy_level}
          onChange={(e) => updateAutonomy(Number(e.target.value))}
        />
        <p>Current Level: {data.autonomy.autonomy_level}</p>
        <button
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded"
          onClick={emergencyShutdown}
        >
          Disable Maya Autonomy
        </button>
      </div>

      {/* Cluster Pie Chart */}
      <div>
        <h2 className="font-semibold mb-2">Deal Cluster Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.clusterDistribution}
              dataKey="count"
              nameKey="cluster"
              outerRadius={100}
            >
              {data.clusterDistribution.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Trend */}
      {data.confidenceTrend && (
        <div>
          <h2 className="font-semibold mb-2">Confidence Score Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.confidenceTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="confidence" stroke="#4f46e5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Lender Accuracy */}
      {data.lenderAccuracy && (
        <div>
          <h2 className="font-semibold mb-2">Lender Match Accuracy</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.lenderAccuracy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="lender" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="accuracy" stroke="#16a34a" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Marketing Log */}
      <div>
        <h2 className="font-semibold mb-2">Recent Marketing Adjustments</h2>
        <table className="w-full border">
          <thead>
            <tr>
              <th>Source</th>
              <th>Old Budget</th>
              <th>New Budget</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentActions.map((a, i) => (
              <tr key={i}>
                <td>{a.source}</td>
                <td>{a.previous_budget}</td>
                <td>{a.new_budget}</td>
                <td>{new Date(a.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Live Event Feed */}
      <div>
        <h2 className="font-semibold mb-2">Live Maya Activity</h2>
        <ul className="space-y-1">
          {liveEvents.map((e, i) => (
            <li key={i} className="bg-gray-100 p-2 rounded">
              {e.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
