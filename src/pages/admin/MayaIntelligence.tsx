import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar
} from "recharts";

interface OverviewData {
  autonomy: any;
  recentActions: any[];
  clusterDistribution: any[];
  confidenceTrend?: any[];
  lenderAccuracy?: any[];
  fundingHeatmap?: any[];
  staffPerformance?: any[];
  modelVersions?: any[];
}

const COLORS = ["#4f46e5", "#16a34a", "#dc2626", "#f59e0b"];

export default function MayaIntelligence() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [roiInput, setRoiInput] = useState(10000);
  const [roiProjection, setRoiProjection] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/maya/overview")
      .then(res => res.json())
      .then(setData);
  }, []);

  async function simulateROI() {
    const res = await fetch("/api/maya/roi-simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ budget: roiInput })
    });
    const json = await res.json();
    setRoiProjection(json.projectedRevenue);
  }

  async function rollbackModel(version: string) {
    await fetch("/api/maya/model-rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ version })
    });
    alert("Model rolled back.");
  }

  if (!data) return <div>Loading Maya Intelligence...</div>;

  return (
    <div className="p-6 space-y-14">
      <h1 className="text-2xl font-bold">Maya Executive Intelligence</h1>

      {/* Funding Heatmap */}
      {data.fundingHeatmap && (
        <div>
          <h2 className="font-semibold mb-2">Funding Probability Heatmap</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.fundingHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="riskBand" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="probability" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ROI Simulator */}
      <div>
        <h2 className="font-semibold mb-2">ROI Forecast Simulator</h2>
        <input
          type="number"
          value={roiInput}
          onChange={(e) => setRoiInput(Number(e.target.value))}
          className="border p-2"
        />
        <button
          className="ml-3 bg-blue-600 text-white px-4 py-2 rounded"
          onClick={simulateROI}
        >
          Simulate
        </button>
        {roiProjection && (
          <p className="mt-2">
            Projected Revenue: ${roiProjection.toLocaleString()}
          </p>
        )}
      </div>

      {/* Staff Performance Correlation */}
      {data.staffPerformance && (
        <div>
          <h2 className="font-semibold mb-2">Staff Performance Correlation</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.staffPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="staff" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="closeRate" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ML Model Version Tracking */}
      {data.modelVersions && (
        <div>
          <h2 className="font-semibold mb-2">ML Model Versions</h2>
          <table className="w-full border">
            <thead>
              <tr>
                <th>Version</th>
                <th>Accuracy</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.modelVersions.map((v, i) => (
                <tr key={i}>
                  <td>{v.version}</td>
                  <td>{v.accuracy}%</td>
                  <td>{new Date(v.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded"
                      onClick={() => rollbackModel(v.version)}
                    >
                      Rollback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
