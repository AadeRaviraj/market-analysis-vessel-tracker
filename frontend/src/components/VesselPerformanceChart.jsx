import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div style={{
      background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 8,
      padding: "10px 14px", fontSize: 12.5, fontFamily: "Inter, sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#0b2545" }}>{label}</div>
      <div style={{ color: "#2ec4b6" }}>Hire rate: <b>{point.hire_rate}</b></div>
      <div style={{ color: "#0b2545" }}>Market rate: <b>{point.market_rate}</b></div>
      {point.hs_code && <div style={{ color: "#5b6b8c", marginTop: 4 }}>HS Code: {point.hs_code}</div>}
    </div>
  );
}

export default function VesselPerformanceChart({ entries }) {
  const data = useMemo(
    () =>
      [...entries]
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .map((e) => ({
          date: e.date,
          hire_rate: Number(e.hire_rate),
          market_rate: Number(e.market_rate),
          hs_code: e.hs_code,
        })),
    [entries]
  );

  if (!data.length) {
    return <div className="empty-state">No data to chart yet — pick a vessel/region or adjust the date range.</div>;
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#5b6b8c" }} />
          <YAxis tick={{ fontSize: 11, fill: "#5b6b8c" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12.5 }} />
          <Line type="monotone" dataKey="hire_rate" name="Hire Rate" stroke="#ffb627" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="market_rate" name="Market Rate" stroke="#0b2545" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
