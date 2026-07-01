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
      <div style={{ color: "#2ec4b6" }}>Avg hire rate: <b>{point.avg_hire_rate}</b></div>
      <div style={{ color: "#0b2545" }}>Avg market rate: <b>{point.avg_market_rate}</b></div>
      <div style={{ color: "#5b6b8c", marginTop: 4 }}>{point.entry_count} entries that day</div>
    </div>
  );
}

export default function AggregatedPerformanceChart({ rows }) {
  const data = useMemo(
    () =>
      [...rows]
        .sort((a, b) => (a.date > b.date ? 1 : -1))
        .map((r) => ({
          date: r.date,
          avg_hire_rate: Number(r.avg_hire_rate),
          avg_market_rate: Number(r.avg_market_rate),
          entry_count: r.entry_count,
        })),
    [rows]
  );

  if (!data.length) {
    return <div className="empty-state">No aggregated data to chart yet.</div>;
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
          <Line type="monotone" dataKey="avg_hire_rate" name="Avg Hire Rate" stroke="#ffb627" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="avg_market_rate" name="Avg Market Rate" stroke="#0b2545" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
