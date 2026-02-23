import React, { useEffect, useMemo, useState } from "react";

type Role = "admin" | "staff";
type Silo = "BF" | "BI" | "SLF";

type User = {
  role: Role;
  token: string;
};

type BISummary = {
  total_premium?: number;
  total_commission?: number;
};

type SLFDeal = {
  id: string | number;
  company_name: string;
  amount: number;
  status: string;
};

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [silo, setSilo] = useState<Silo>("BF");
  const [data, setData] = useState<BISummary | SLFDeal[] | null>(null);

  /* ================= LOGIN ================= */

  async function login(email: string, password: string) {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const json = await res.json();
    const nextUser: User = { role: json.role, token: json.token };
    localStorage.setItem("portal_jwt", nextUser.token);
    localStorage.setItem("portal_role", nextUser.role);
    setUser(nextUser);
  }

  function logout() {
    localStorage.removeItem("portal_jwt");
    localStorage.removeItem("portal_role");
    setData(null);
    setSilo("BF");
    setUser(null);
  }

  useEffect(() => {
    const token = localStorage.getItem("portal_jwt");
    const role = localStorage.getItem("portal_role") as Role | null;

    if (token && (role === "admin" || role === "staff")) {
      setUser({ role, token });
    }
  }, []);

  /* ================= SILO ACCESS ================= */

  const allowedSilos: Silo[] = useMemo(
    () => (user?.role === "admin" ? ["BF", "BI", "SLF"] : ["BF", "BI"]),
    [user?.role]
  );

  useEffect(() => {
    if (!user) return;

    if (!allowedSilos.includes(silo)) {
      setSilo("BF");
      return;
    }

    if (silo === "BF") {
      setData(null);
      return;
    }

    if (silo === "BI") {
      fetch("/api/bi/reports/summary", {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then((res) => res.json())
        .then((json) => setData(json));
    }

    if (silo === "SLF") {
      fetch("/api/slf/deals", {
        headers: { Authorization: `Bearer ${user.token}` }
      })
        .then((res) => res.json())
        .then((json) => setData(json));
    }
  }, [allowedSilos, silo, user]);

  /* ================= LOGIN SCREEN ================= */

  if (!user) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Portal Login</h2>
        <button onClick={() => login("admin@test.com", "password")}>Login (Demo)</button>
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div style={{ padding: 40 }}>
      <h1>Portal</h1>

      <div style={{ marginBottom: 20, display: "flex", alignItems: "center" }}>
        {allowedSilos.map((s) => (
          <button
            key={s}
            onClick={() => setSilo(s)}
            style={{
              marginRight: 10,
              background: silo === s ? "#000" : "#ccc",
              color: silo === s ? "#fff" : "#000"
            }}
          >
            {s}
          </button>
        ))}

        <button onClick={logout} style={{ marginLeft: 10 }}>
          Logout
        </button>
      </div>

      {silo === "BF" && (
        <div>
          <h2>Boreal Financial</h2>
          <p>Existing BF dashboard remains here.</p>
        </div>
      )}

      {silo === "BI" && data && !Array.isArray(data) && (
        <div>
          <h2>Boreal Insurance</h2>

          <div style={{ marginTop: 20 }}>
            <h3>Total Premium</h3>
            <p>${Number(data.total_premium || 0).toLocaleString()}</p>

            <h3>Total Commission (10%)</h3>
            <p>${Number(data.total_commission || 0).toLocaleString()}</p>
          </div>
        </div>
      )}

      {silo === "SLF" && data && Array.isArray(data) && (
        <div>
          <h2>SLF Pipeline</h2>

          <table border={1} cellPadding={10}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Company</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((deal) => (
                <tr key={deal.id}>
                  <td>{deal.id}</td>
                  <td>{deal.company_name}</td>
                  <td>${Number(deal.amount).toLocaleString()}</td>
                  <td>{deal.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
