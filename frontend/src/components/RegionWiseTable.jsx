import React from "react";

function formatMoney(v) {
  return Number(v).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function RegionWiseTable({ entries }) {
  if (!entries || entries.length === 0) {
    return <div className="empty-state">No entries for this region / date range yet.</div>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Vessel</th>
            <th>HS Code</th>
            <th>Market rate</th>
            <th>Hire rate</th>
            <th>Variance</th>
            <th>Entered by</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id}>
              <td>{e.date}</td>
              <td className="text-cell">{e.vessel_name}</td>
              <td>
                <span className="badge-hs">{e.hs_code || "—"}</span>
              </td>
              <td>{formatMoney(e.market_rate)}</td>
              <td>{formatMoney(e.hire_rate)}</td>
              <td className={Number(e.variance) >= 0 ? "variance-pos" : "variance-neg"}>
                {Number(e.variance) >= 0 ? "+" : ""}
                {formatMoney(e.variance)}
              </td>
              <td className="text-cell">{e.created_by_username || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
