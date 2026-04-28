import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Uploader from "./components/Uploader";
import JobEvaluator from "./components/JobEvaluator";
import BusinessManager from "./components/BusinessManager";
import ColumnMapper from "./components/ColumnMapper";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const DEFAULT_CONFIG = {
  hourly_labor_cost: 85,
  profitable_threshold: 120,
  marginal_threshold: 75,
  home_address: "506 Main St Kalispell MT 59901",
};

export default function App() {
  const [screen, setScreen] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [mappingData, setMappingData] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSelectBusiness = (biz) => {
    setActiveBusiness(biz);
    setConfig({ hourly_labor_cost: biz.hourly_labor_cost, profitable_threshold: biz.profitable_threshold, marginal_threshold: biz.marginal_threshold, home_address: biz.home_address });
  };

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`${API_URL}/map-columns`, { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Upload failed"); }
      const data = await res.json();
      setMappingData(data); setScreen("mapping");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [config, activeBusiness]);

  const handleMappingConfirm = async (confirmedMapping) => {
    setLoading(true); setError(null);
    const params = new URLSearchParams({ hourly_labor_cost: config.hourly_labor_cost, profitable_threshold: config.profitable_threshold, marginal_threshold: config.marginal_threshold, home_address: config.home_address, ...(activeBusiness ? { business_id: activeBusiness.id } : {}) });
    try {
      const res = await fetch(`${API_URL}/analyze-mapped?${params}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(confirmedMapping) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Analysis failed"); }
      const data = await res.json();
      setAnalysisData(data); setScreen("dashboard");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo"><span className="logo-icon">◈</span><span className="logo-text">OptiCal <span className="logo-ai">AI</span></span></div>
          {activeBusiness && <div className="active-biz"><span className="active-biz-dot" />{activeBusiness.name}</div>}
          <nav className="nav">
            <button className={`nav-btn ${screen === "upload" ? "active" : ""}`} onClick={() => setScreen("upload")}>Upload</button>
            {analysisData && <button className={`nav-btn ${screen === "dashboard" ? "active" : ""}`} onClick={() => setScreen("dashboard")}>Dashboard</button>}
            <button className={`nav-btn ${screen === "evaluate" ? "active" : ""}`} onClick={() => setScreen("evaluate")}>Evaluate Job</button>
            <button className={`nav-btn ${screen === "businesses" ? "active" : ""}`} onClick={() => setScreen("businesses")}>Businesses</button>
          </nav>
        </div>
      </header>
      <main className="main">
        {screen === "upload" && (
          <div className="upload-screen">
            <div className="upload-hero">
              <h1>Stop losing money<br /><span className="accent">on the road.</span></h1>
              <p className="hero-sub">Upload a job history CSV and find out exactly which jobs cost you time and margin — with real drive times from actual addresses.</p>
              {activeBusiness && <div className="active-biz-banner">Analyzing for: <strong>{activeBusiness.name}</strong><button className="clear-biz" onClick={() => { setActiveBusiness(null); setConfig(DEFAULT_CONFIG); }}>✕ Clear</button></div>}
            </div>
            <div className="config-panel">
              <h3 className="config-title">Business Settings</h3>
              <div className="config-row"><label>Home Base Address<input value={config.home_address} onChange={e => setConfig({ ...config, home_address: e.target.value })} placeholder="123 Main St Kalispell MT 59901" className="config-address" /></label></div>
              <div className="config-row">
                <label>Hourly Labor Cost ($)<input type="number" value={config.hourly_labor_cost} onChange={e => setConfig({ ...config, hourly_labor_cost: parseFloat(e.target.value) })} /></label>
                <label>Profitable Threshold ($/hr)<input type="number" value={config.profitable_threshold} onChange={e => setConfig({ ...config, profitable_threshold: parseFloat(e.target.value) })} /></label>
                <label>Marginal Threshold ($/hr)<input type="number" value={config.marginal_threshold} onChange={e => setConfig({ ...config, marginal_threshold: parseFloat(e.target.value) })} /></label>
              </div>
            </div>
            <Uploader onUpload={handleFileUpload} loading={loading} error={error} />
            <div className="csv-hint"><strong>Any CSV works</strong> — we match your columns automatically.<br /><span className="csv-note">⚡ Real drive times via OpenStreetMap. Analysis takes ~15–20 seconds.</span></div>
          </div>
        )}
        {screen === "mapping" && mappingData && <ColumnMapper mappingData={mappingData} onConfirm={handleMappingConfirm} onBack={() => setScreen("upload")} />}
        {screen === "dashboard" && analysisData && <Dashboard data={analysisData} businessName={activeBusiness?.name} onReset={() => { setScreen("upload"); setAnalysisData(null); }} />}
        {screen === "evaluate" && <JobEvaluator config={config} />}
        {screen === "businesses" && <BusinessManager onSelect={(biz) => { handleSelectBusiness(biz); setScreen("upload"); }} />}
      </main>
    </div>
  );
}
