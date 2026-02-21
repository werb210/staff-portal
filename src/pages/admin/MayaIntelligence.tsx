import { useEffect, useState } from "react";

type MayaAutonomy = {
  autonomy_level: number;
};

type MayaRecentAction = {
  source: string;
  previous_budget: number;
  new_budget: number;
  created_at: string;
};

type MayaClusterDistribution = {
  cluster: string;
  count: number;
};

type MayaOverviewData = {
  autonomy: MayaAutonomy;
  recentActions: MayaRecentAction[];
  clusterDistribution: MayaClusterDistribution[];
};

const MayaIntelligence = () => {
  const [data, setData] = useState<MayaOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/maya/overview");
      if (!response.ok) {
        throw new Error(`Failed to fetch Maya overview: ${response.status}`);
      }

      const payload = (await response.json()) as MayaOverviewData;
      setData(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch Maya overview");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOverview();
  }, []);

  const updateAutonomy = async (level: number) => {
    await fetch("/maya/set-autonomy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level })
    });

    await fetchOverview();
  };

  const emergencyShutdown = async () => {
    await fetch("/maya/shutdown", { method: "POST" });
    await fetchOverview();
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Maya Intelligence</h1>

      <div
        className="mb-6"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 360,
          height: "100vh",
          background: "#0f172a",
          color: "#f8fafc",
          padding: "1rem",
          boxShadow: "2px 0 10px rgba(0,0,0,0.35)",
          overflowY: "auto"
        }}
      >
        <h2 className="mb-2 text-lg font-semibold">Maya Control Panel</h2>
        {isLoading ? <p>Loading Maya Intelligence...</p> : null}
        {error ? <p className="text-red-300">{error}</p> : null}

        {data && !isLoading ? (
          <>
            <h3 className="mt-4 font-semibold">Autonomy Level</h3>
            <input
              type="range"
              min="0"
              max="5"
              value={data.autonomy.autonomy_level}
              onChange={(event) => {
                void updateAutonomy(Number(event.target.value));
              }}
            />
            <p className="mt-2">Current Level: {data.autonomy.autonomy_level}</p>
            <button
              type="button"
              className="mt-3 rounded bg-red-600 px-4 py-2 text-white"
              onClick={() => {
                void emergencyShutdown();
              }}
            >
              Emergency Shutdown
            </button>
          </>
        ) : null}
      </div>

      <div style={{ marginLeft: 390 }}>
        <div className="mb-6">
          <h2 className="font-semibold">Cluster Distribution</h2>
          {data ? (
            <ul>
              {data.clusterDistribution.map((cluster, index) => (
                <li key={`${cluster.cluster}-${index}`}>
                  {cluster.cluster}: {cluster.count}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h2 className="font-semibold">Recent Marketing Actions</h2>
          {data ? (
            <table className="mt-2 w-full border">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Old Budget</th>
                  <th>New Budget</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentActions.map((action, index) => (
                  <tr key={`${action.source}-${index}`}>
                    <td>{action.source}</td>
                    <td>{action.previous_budget}</td>
                    <td>{action.new_budget}</td>
                    <td>{new Date(action.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MayaIntelligence;
