import React, { useState } from "react";
import { createEntry } from "../api/client.js";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function EntryForm({ regions, vessels, onCreated }) {
  const [form, setForm] = useState({
    date: todayISO(),
    region: "",
    vessel: "",
    hs_code: "",
    market_rate: "",
    hire_rate: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const vesselsInRegion = form.region
    ? vessels.filter((v) => String(v.region) === String(form.region))
    : vessels;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.region || !form.vessel || !form.market_rate || !form.hire_rate) {
      setError("Please fill in region, vessel, market rate and hire rate.");
      return;
    }
    setSaving(true);
    try {
      await createEntry({
        ...form,
        market_rate: parseFloat(form.market_rate),
        hire_rate: parseFloat(form.hire_rate),
      });
      setForm((f) => ({ ...f, vessel: "", hs_code: "", market_rate: "", hire_rate: "" }));
      onCreated();
    } catch (err) {
      const detail = err?.response?.data;
      setError(
        detail && typeof detail === "object"
          ? Object.values(detail).flat().join(" ")
          : "Could not save entry. Please check the values and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-grid">
        <div className="field">
          <label>Date</label>
          <input type="date" value={form.date} onChange={update("date")} required />
        </div>
        <div className="field">
          <label>Region</label>
          <select value={form.region} onChange={update("region")} required>
            <option value="">Select region…</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Vessel</label>
          <select value={form.vessel} onChange={update("vessel")} required>
            <option value="">Select vessel…</option>
            {vesselsInRegion.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>HS code</label>
          <input value={form.hs_code} onChange={update("hs_code")} placeholder="e.g. 2711.11" />
        </div>
        <div className="field">
          <label>Market rate ($/day)</label>
          <input type="number" step="0.01" value={form.market_rate} onChange={update("market_rate")} required />
        </div>
        <div className="field">
          <label>Hire rate ($/day)</label>
          <input type="number" step="0.01" value={form.hire_rate} onChange={update("hire_rate")} required />
        </div>
      </div>
      <button className="btn btn-accent" type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save daily entry"}
      </button>
    </form>
  );
}
