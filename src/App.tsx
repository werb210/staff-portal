import React, { useState, useEffect } from "react";

const API = "https://api.boreal.financial";

type User = {
  role: "admin" | "staff";
  token: string;
};

type Silo = "BF" | "BI" | "SLF";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [silo, setSilo] = useState<Silo>("BF");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================= TOKEN PERSIST ================= */

  useEffect(() => {
    const stored = localStorage.getItem("portal_token");
    const role = localStorage.getItem("portal_role") as
      | "admin"
      | "staff"
      | null;

    if (stored && role) {
      setUser({ token: stored, role });
    }
  }, []);

  function logout() {
    localStorage.removeItem("portal_token");
    localStorage.removeItem("portal_role");
    setUser(null);
  }

  /* ================= LOGIN ================= */

  async function login() {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/portal/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const json = await res.json();

      if (!json.token) throw new Error("Login failed");

      localStorage.setItem("portal_token", json.token);
      localStorage.setItem("portal_role", json.role);

      setUser({ token: json.token, role: json.role });
    } catch {
      setError("Invalid credentials");
    }

    setLoading(false);
  }

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    setError("");

    const headers = {
      Authorization: `Bearer ${user.token}`
    };

    const fetchData = async () => {
      try {
        if (silo === "BI") {
          const res = await fetch(`${API}/bi/reports/summary`, {
            headers
          });
          setData(await res.json());
        }

        if (silo === "SLF") {
          const res = await fetch(`${API}/slf/pipeline`, {
            headers
          });
          setData(await res.json());
        }

        if (silo === "BF") {
          setData(null);
        }
      } catch {
        setError("Data load failed");
      }

      setLoading(false);
    };

    fetchData();
  }, [silo, user]);

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div style={styles.center}>
        <h2>Portal Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <br /><br />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button disabled={loading} onClick={login}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    );
  }

  /* ================= SILO LOCK ================= */

  const allowedSilos: Silo[] =
    user.role === "admin"
      ? ["BF", "BI", "SLF"]
      : ["BF", "BI"];

  if (!allowedSilos.includes(silo)) {
    setSilo("BF");
  }

  /* ================= MAIN UI ================= */

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>Portal</h1>
        <div>
          <strong>{user.role.toUpperCase()}</strong>
          <button style={{ marginLeft: 20 }} onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <div style={styles.siloBar}>
        {allowedSilos.map((s) => (
          <button
            key={s}
            onClick={() => setSilo(s)}
            style={{
              ...styles.siloButton,
              background: silo === s ? "#000" : "#ddd",
              color: silo === s ? "#fff" : "#000"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ================= BF ================= */}

      {silo === "BF" && (
        <div>
          <h2>Boreal Financial</h2>
          <p>BF dashboard continues here.</p>
        </div>
      )}

      {/* ================= BI ================= */}

      {silo === "BI" && data && (
        <div>
          <h2>Boreal Insurance</h2>

          <div style={styles.card}>
            <h3>Total Premium Written</h3>
            <p style={styles.metric}>
              ${Number(data.total_premium || 0).toLocaleString()}
            </p>
          </div>

          <div style={styles.card}>
            <h3>Total Commission (10%)</h3>
            <p style={styles.metric}>
              ${Number(data.total_commission || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* ================= SLF ================= */}

      {silo === "SLF" && data && (
        <div>
          <h2>SLF Pipeline</h2>

          {Object.keys(data).map((status) => (
            <div key={status} style={{ marginBottom: 30 }}>
              <h3>{status.toUpperCase()}</h3>

              <div style={styles.pipelineRow}>
                {data[status].map((deal: any) => (
                  <div key={deal.id} style={styles.pipelineCard}>
                    <strong>{deal.company_name}</strong>
                    <p>${Number(deal.amount).toLocaleString()}</p>
                    <small>Status: {deal.status}</small>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ================= STYLES ================= */

const styles: any = {
  container: {
    padding: 40,
    fontFamily: "Arial",
    maxWidth: 1200,
    margin: "auto"
  },
  center: {
    textAlign: "center",
    marginTop: 100
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 30
  },
  siloBar: {
    display: "flex",
    gap: 15,
    marginBottom: 30
  },
  siloButton: {
    padding: "10px 15px",
    border: "none",
    cursor: "pointer"
  },
  card: {
    background: "#f5f5f5",
    padding: 20,
    marginBottom: 20
  },
  metric: {
    fontSize: 28,
    fontWeight: "bold"
  },
  pipelineRow: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap"
  },
  pipelineCard: {
    border: "1px solid #ccc",
    padding: 15,
    width: 220
  }
};

export default App;
