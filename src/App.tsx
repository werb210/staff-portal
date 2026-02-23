import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate
} from "react-router-dom";
import { useEffect, useState } from "react";

const BI_API = "https://api.boreal.financial/bi";
const SLF_API = "https://api.boreal.financial/slf";

/* ================= AUTH ================= */

const getToken = () => localStorage.getItem("portal_token");
const getRole = () => localStorage.getItem("portal_role");

function Protected({ children }: any) {
  if (!getToken()) return <Navigate to="/login" />;
  return children;
}

/* ================= NAV ================= */

function Nav() {
  const role = getRole();

  return (
    <div className="nav">
      <h2>Boreal Portal</h2>
      <div>
        <Link to="/">Dashboard</Link>

        {(role === "admin" || role === "staff") && (
          <Link to="/bi">BI Silo</Link>
        )}

        {role === "admin" && (
          <Link to="/slf">SLF Silo</Link>
        )}
      </div>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login() {
  const [role, setRole] = useState("staff");

  const login = () => {
    localStorage.setItem("portal_token", "demo");
    localStorage.setItem("portal_role", role);
    window.location.href = "/";
  };

  return (
    <div className="container">
      <h1>Portal Login</h1>

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      <button onClick={login}>Login</button>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard() {
  return (
    <div className="container">
      <h1>Portal Dashboard</h1>
      <p>Select a silo.</p>
    </div>
  );
}

/* ================= BI SILO ================= */

function BISilo() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [totals, setTotals] = useState({
    premium: 0,
    commission: 0
  });

  useEffect(() => {
    fetch(`${BI_API}/policies`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then((r) => r.json())
      .then((data) => {
        setPolicies(data);

        const totalPremium = data.reduce(
          (sum: number, p: any) =>
            sum + parseFloat(p.annual_premium || 0),
          0
        );

        const totalCommission = data.reduce(
          (sum: number, p: any) =>
            sum + parseFloat(p.commission || 0),
          0
        );

        setTotals({
          premium: totalPremium,
          commission: totalCommission
        });
      });
  }, []);

  return (
    <div className="container">
      <h1>BI Silo</h1>

      <div className="stats">
        <div>
          <strong>Total Written Premium</strong>
          <p>${totals.premium.toLocaleString()}</p>
        </div>

        <div>
          <strong>Total Commission (10%)</strong>
          <p>${totals.commission.toLocaleString()}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Policy</th>
            <th>Premium</th>
            <th>Commission</th>
            <th>Start</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((p) => (
            <tr key={p.id}>
              <td>{p.policy_number}</td>
              <td>${p.annual_premium}</td>
              <td>${p.commission}</td>
              <td>{p.start_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= SLF SILO ================= */

function SLFSilo() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${SLF_API}/deals`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then((r) => r.json())
      .then(setDeals);
  }, []);

  return (
    <div className="container">
      <h1>SLF Silo</h1>

      <table>
        <thead>
          <tr>
            <th>Deal ID</th>
            <th>Company</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((d) => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>{d.company_name}</td>
              <td>{d.status}</td>
              <td>${d.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= APP ================= */

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/bi"
          element={
            <Protected>
              <BISilo />
            </Protected>
          }
        />
        <Route
          path="/slf"
          element={
            <Protected>
              <SLFSilo />
            </Protected>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
