import { Routes, Route } from "react-router-dom";
import Dashboard from "./routes/Dashboard";
import Login from "./routes/Login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
