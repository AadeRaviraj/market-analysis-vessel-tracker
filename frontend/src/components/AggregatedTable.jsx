import React from "react";

function formatMoney(v) {
  return Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AggregatedTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <div className="empty-state">No aggregated data available yet.</div>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Avg. market rate</th>
            <th>Avg. hire rate</th>
            <th>Avg. variance</th>
            <th># Entries</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date}>
              <td>{r.date}</td>
              <td>{formatMoney(r.avg_market_rate)}</td>
              <td>{formatMoney(r.avg_hire_rate)}</td>
              <td className={Number(r.avg_variance) >= 0 ? "variance-pos" : "variance-neg"}>
                {Number(r.avg_variance) >= 0 ? "+" : ""}
                {formatMoney(r.avg_variance)}
              </td>
              <td className="text-cell">{r.entry_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
