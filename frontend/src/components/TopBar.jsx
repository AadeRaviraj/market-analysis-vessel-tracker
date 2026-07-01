import React from "react";

export default function TopBar({ user, onLogout }) {
  return (
    <div className="topbar">
      <div className="brand">
        <span className="dot" />
        Market Analysis
        <span className="role-pill">{user.is_admin ? "Office Admin" : "Office User"}</span>
      </div>
      <div className="topbar-right">
        <span className="username">{user.username}</span>
        <button className="btn btn-ghost" onClick={onLogout} style={{ color: "white", borderColor: "rgba(255,255,255,0.3)" }}>
          Log out
        </button>
      </div>
    </div>
  );
}
