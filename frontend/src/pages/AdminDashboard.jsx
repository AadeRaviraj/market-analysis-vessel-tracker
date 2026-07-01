import React, { useState, useEffect, useCallback } from "react";
import TopBar from "../components/TopBar.jsx";
import EntryForm from "../components/EntryForm.jsx";
import RegionWiseTable from "../components/RegionWiseTable.jsx";
import AggregatedTable from "../components/AggregatedTable.jsx";
import VesselPerformanceChart from "../components/VesselPerformanceChart.jsx";
import AggregatedPerformanceChart from "../components/AggregatedPerformanceChart.jsx";
import { getRegions, getVessels, getEntries, getAggregated } from "../api/client.js";

const TABS = [
  { key: "entry", label: "Daily data entry" },
  { key: "region", label: "Region-wise performance" },
  { key: "aggregated", label: "Aggregated performance" },
];

export default function AdminDashboard({ user, onLogout }) {
  const [tab, setTab] = useState("entry");
  const [regions, setRegions] = useState([]);
  const [vessels, setVessels] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedVessel, setSelectedVessel] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [entries, setEntries] = useState([]);
  const [aggregated, setAggregated] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getRegions().then(setRegions);
    getVessels().then(setVessels);
  }, []);

  const vesselsInRegion = selectedRegion
    ? vessels.filter((v) => String(v.region) === String(selectedRegion))
    : vessels;

  const refreshRegionView = useCallback(() => {
    const params = {};
    if (selectedRegion) params.region = selectedRegion;
    if (selectedVessel) params.vessel = selectedVessel;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    getEntries(params).then(setEntries);
  }, [selectedRegion, selectedVessel, dateFrom, dateTo]);

  const refreshAggregated = useCallback(() => {
    const params = {};
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    getAggregated(params).then(setAggregated);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    if (tab === "region") refreshRegionView();
    if (tab === "aggregated") refreshAggregated();
  }, [tab, refreshRegionView, refreshAggregated]);

  const handleCreated = () => {
    setToast("Daily entry saved.");
    setTimeout(() => setToast(""), 2500);
    refreshRegionView();
    refreshAggregated();
  };

  return (
    <div className="app-shell">
      <TopBar user={user} onLogout={onLogout} />
      <div className="page">
        <div className="page-header">
          <div>
            <h1>Vessel Performance — Market Analysis</h1>
            <p>Enter daily rates and review performance by region or in aggregate.</p>
          </div>
        </div>

        <div className="tabs">
          {TABS.map((t) => (
            <div
              key={t.key}
              className={`tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </div>
          ))}
        </div>

        {tab === "entry" && (
          <div className="card">
            <h3>Add daily market &amp; hire rate</h3>
            <p className="card-sub">
              Categorised by region. Only Office Admins can submit data.
            </p>
            <EntryForm regions={regions} vessels={vessels} onCreated={handleCreated} />
          </div>
        )}

        {tab === "region" && (
          <div className="card">
            <h3>Region-wise vessel performance</h3>
            <p className="card-sub">
              Daily comparison of market rate vs. hire rate, per region/vessel. HS code shown (hover the chart).
            </p>
            <div className="filter-row">
              <div className="field">
                <label>Region</label>
                <select value={selectedRegion} onChange={(e) => { setSelectedRegion(e.target.value); setSelectedVessel(""); }}>
                  <option value="">All regions</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>Vessel</label>
                <select value={selectedVessel} onChange={(e) => setSelectedVessel(e.target.value)}>
                  <option value="">All vessels</option>
                  {vesselsInRegion.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>From date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="field">
                <label>To date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <button className="btn btn-ghost" onClick={refreshRegionView}>Apply</button>
            </div>

            <VesselPerformanceChart entries={entries} />
            <div style={{ marginTop: 20 }}>
              <RegionWiseTable entries={entries} />
            </div>
          </div>
        )}

        {tab === "aggregated" && (
          <div className="card">
            <h3>Aggregated vessel performance (all regions)</h3>
            <p className="card-sub">
              Daily average market rate vs. hire rate across all regions. HS codes are not
              displayed in this view, by design.
            </p>
            <div className="filter-row">
              <div className="field">
                <label>From date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="field">
                <label>To date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
              <button className="btn btn-ghost" onClick={refreshAggregated}>Apply</button>
            </div>
            <AggregatedPerformanceChart rows={aggregated} />
            <div style={{ marginTop: 20 }}>
              <AggregatedTable rows={aggregated} />
            </div>
          </div>
        )}
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

