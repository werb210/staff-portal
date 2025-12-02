import type React from "react";
import { NavLink } from "react-router-dom";

const linkStyle: React.CSSProperties = {
  padding: "12px 16px",
  display: "block",
  textDecoration: "none",
  color: "white",
  fontSize: 14,
};

const activeStyle: React.CSSProperties = {
  ...linkStyle,
  background: "rgba(255,255,255,0.15)",
  fontWeight: "bold",
};

export default function Sidebar() {
  return (
    <div
      style={{
        width: 240,
        background: "#0f1823",
        color: "white",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: 20, fontWeight: "bold", fontSize: 18 }}>
        Navigation
      </div>

      <NavLink to="/" end style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Dashboard
      </NavLink>

      <NavLink to="/contacts" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Contacts
      </NavLink>

      <NavLink to="/companies" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Companies
      </NavLink>

      <NavLink to="/deals" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Deals
      </NavLink>

      <NavLink to="/pipeline" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Pipeline
      </NavLink>

      <NavLink to="/documents" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Documents
      </NavLink>

      <NavLink to="/lenders" style={({ isActive }) => (isActive ? activeStyle : linkStyle)}>
        Lenders
      </NavLink>
    </div>
  );
}
