import React, { useState } from "react";
import { login } from "../api/client.js";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(username, password);
      localStorage.setItem("ma_token", data.token);
      onLogin({ username: data.username, is_admin: data.is_admin });
    } catch (err) {
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div>
          <div className="hero-eyebrow">Market Analysis Module</div>
          <div className="hero-title">Vessel performance, tracked region by region.</div>
          <p className="hero-sub">
            Compare daily market rates against actual hire rates, across every
            region your office covers — with a dedicated aggregated view for
            leadership.
          </p>
        </div>
        <div className="hero-stat-row">
          <div className="hero-stat">
            <b>4</b>
            <span>Regions tracked</span>
          </div>
          <div className="hero-stat">
            <b>Daily</b>
            <span>Rate comparisons</span>
          </div>
          <div className="hero-stat">
            <b>2</b>
            <span>Access tiers</span>
          </div>
        </div>
      </div>

      <div className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p className="sub">Enter your office credentials to continue.</p>

          {error && <div className="error-banner">{error}</div>}

          <div className="field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              autoComplete="username"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <div className="demo-hint">
            Demo — Admin: admin / admin123 &nbsp;|&nbsp; User: officeuser / user123
          </div>
        </form>
      </div>
    </div>
  );
}
