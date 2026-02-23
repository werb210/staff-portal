import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate
} from "react-router-dom";
import { useEffect, useState } from "react";

const BI_API = "https://api.boreal.financial/bi";
const SLF_API = "https://api.boreal.financial/slf";

const getToken = () => localStorage.getItem("portal_token");
const getRole = () => localStorage.getItem("portal_role");

function Protected({ children }: any) {
  if (!getToken()) return <Navigate to="/login" />;
  return children;
}

/* ================= NAV ================= */

function Nav() {
  const role = getRole();
  const navigate = useNavigate();

  return (
    <div className="nav">
      <h2>Boreal Portal</h2>
      <div>
        <Link to="/">Dashboard</Link>

        {(role === "admin" || role === "staff") && (
          <Link to="/bi">BI</Link>
        )}

        {role === "admin" && (
          <Link to="/slf">SLF</Link>
        )}

        <button
          onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* ================= LOGIN ================= */

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("staff");

  const login = async () => {
    // This should call your real auth server
    const token = "portal-demo-token";

    localStorage.setItem("portal_token", token);
    localStorage.setItem("portal_role", role);

    navigate("/");
  };

  return (
    <div className="container">
      <h1>Portal Login</h1>

      <select onChange={(e) => setRole(e.target.value)}>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </select>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <button onClick={login}>Login</button>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard() {
  const role = getRole();

  return (
    <div className="container">
      <h1>Portal Dashboard</h1>
      <p>Logged in as: {role}</p>
    </div>
  );
}

/* ================= BI SILO ================= */

function BISilo() {
  const [summary, setSummary] = useState<any>({});
  const [referrers, setReferrers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BI_API}/reports/summary`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then((r) => r.json())
      .then(setSummary);

    fetch(`${BI_API}/reports/referrers`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then((r) => r.json())
      .then(setReferrers);
  }, []);

  return (
    <div className="container">
      <h1>BI Silo</h1>

      <div className="stats">
        <div>
          <strong>Total Premium</strong>
          <p>
            ${parseFloat(summary.total_premium || 0).toLocaleString()}
          </p>
        </div>
        <div>
          <strong>Total Commission</strong>
          <p>
            ${parseFloat(summary.total_commission || 0).toLocaleString()}
          </p>
        </div>
      </div>

      <h3>Referrers</h3>

      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Total</th>
            <th>Unpaid</th>
          </tr>
        </thead>
        <tbody>
          {referrers.map((r) => (
            <tr key={r.referrer_email}>
              <td>{r.referrer_email}</td>
              <td>${r.total_commission}</td>
              <td>${r.unpaid}</td>
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
      <h1>SLF Pipeline</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
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
            getRole() === "admin" ? (
              <Protected>
                <SLFSilo />
              </Protected>
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
