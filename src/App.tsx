import React, { useState, useEffect } from "react";

const API = "https://api.boreal.financial";

type User = {
  role: "admin" | "staff";
  token: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [silo, setSilo] = useState<"BF" | "BI" | "SLF">("BF");
  const [data, setData] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ================= LOGIN ================= */

  async function login() {
    const res = await fetch(`${API}/portal/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    if (json.token) {
      setUser({ role: json.role, token: json.token });
    } else {
      alert("Login failed");
    }
  }

  /* ================= LOAD SILO DATA ================= */

  useEffect(() => {
    if (!user) return;

    if (silo === "BI") {
      fetch(`${API}/bi/reports/summary`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(setData);
    }

    if (silo === "SLF") {
      fetch(`${API}/slf/pipeline`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then(res => res.json())
        .then(setData);
    }
  }, [silo, user]);

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Portal Login</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br /><br />

        <button onClick={login}>Login</button>
      </div>
    );
  }

  /* ================= SILO LOCK ================= */

  const allowedSilos =
    user.role === "admin"
      ? ["BF", "BI", "SLF"]
      : ["BF", "BI"];

  if (!allowedSilos.includes(silo)) {
    setSilo("BF");
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40 }}>
      <h1>Portal</h1>

      <div style={{ marginBottom: 20 }}>
        {allowedSilos.map(s => (
          <button
            key={s}
            onClick={() => setSilo(s as any)}
            style={{
              marginRight: 10,
              background: silo === s ? "#000" : "#ccc",
              color: silo === s ? "#fff" : "#000",
              padding: "10px 15px"
            }}
          >
            {s}
          </button>
        ))}
      </div>

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

          <div style={{ marginTop: 20 }}>
            <h3>Total Premium Written</h3>
            <p style={{ fontSize: 24 }}>
              ${Number(data.total_premium || 0).toLocaleString()}
            </p>

            <h3>Total Commission (10%)</h3>
            <p style={{ fontSize: 24 }}>
              ${Number(data.total_commission || 0).toLocaleString()}
            </p>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3>Commission Ratio</h3>
            <div
              style={{
                width: 300,
                height: 30,
                background: "#ddd",
                position: "relative"
              }}
            >
              <div
                style={{
                  width: "10%",
                  height: "100%",
                  background: "#4caf50"
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ================= SLF ================= */}

      {silo === "SLF" && data && (
        <div>
          <h2>SLF Pipeline</h2>

          {Object.keys(data).map(status => (
            <div key={status} style={{ marginBottom: 30 }}>
              <h3>{status.toUpperCase()}</h3>

              <div style={{ display: "flex", gap: 20 }}>
                {data[status].map((deal: any) => (
                  <div
                    key={deal.id}
                    style={{
                      border: "1px solid #ccc",
                      padding: 15,
                      width: 200
                    }}
                  >
                    <strong>{deal.company_name}</strong>
                    <p>${Number(deal.amount).toLocaleString()}</p>
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

export default App;
