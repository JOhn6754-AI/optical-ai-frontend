import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Uploader from "./components/Uploader";
import JobEvaluator from "./components/JobEvaluator";
import BusinessManager from "./components/BusinessManager";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const APP_PASSWORD = "flathead2026";

const DEFAULT_CONFIG = {
  hourly_labor_cost: 85,
  profitable_threshold: 120,
  marginal_threshold: 75,
  home_address: "506 Main St Kalispell MT 59901",
};

function PasswordGate({ onUnlock }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const handleSubmit = () => {
    if (input === APP_PASSWORD) { onUnlock(); }
    else { setError(true); setInput(""); }
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a0a" }}>
      <div style={{ background:"#141414", border:"1px solid #2a2a2a", borderRadius:"12px", padding:"48px", width:"100%", maxWidth:"380px", textAlign:"center" }}>
        <div style={{ fontSize:"32px", marginBottom:"8px" }}>◈</div>
        <h2 style={{ color:"#fff", margin:"0 0 6px", fontSize:"22px" }}>OptiCal <span style={{ color:"#6366f1" }}>AI</span></h2>
        <p style={{ color:"#888", fontSize:"14px", margin:"0 0 32px" }}>Enter your access code to continue</p>
        <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false); }} onKeyDown={e => e.key === "Enter" && handleSubmit()} placeholder="Access code" style={{ width:"100%", padding:"12px 16px", background:"#1e1e1e", border:`1px solid ${error ? "#ef4444" : "#2a2a2a"}`, borderRadius:"8px", color:"#fff", fontSize:"16px", marginBottom:"12px", boxSizing:"border-box", outline:"none" }} />
        {error && <p style={{ color:"#ef4444", fontSize:"13px", margin:"0 0 12px" }}>Incorrect access code. Try again.</p>}
        <button onClick={handleSubmit} style={{ width:"100%", padding:"12px", background:"#6366f1", border:"none", borderRadius:"8px", color:"#fff", fontSize:"16px", fontWeight:"600", cursor:"pointer" }}>Enter</button>
      </div>
    </div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [screen, setScreen] = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />;

  const handleSelectBusiness = (biz) => {
    setActiveBusiness(biz);
    setConfig({ hourly_labor_cost: biz.hourly_labor_cost, profitable_threshold: biz.profitable_threshold, marginal_threshold: biz.marginal_threshold, home_address: biz.home_address });
  };

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true); setError(null);
    const formData = new FormData();
    formData.append("file", file);
    const params = new URLSearchParams({ hourly_labor_cost: config.hourly_labor_cost, profitable_threshold: config.profitable_threshold, marginal_threshold: config.marginal_threshold, home_address: config.home_address, ...(activeBusiness ? { business_id: activeBusiness.id } : {}) });
    try {
      const res = await fetch(`${API_URL}/analyze?${params}`, { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Analysis failed"); }
      const data = await res.json();
      setAnalysisData(data); setScreen("dashboard");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [config, activeBusiness]);

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
            <div className="csv-hint"><strong>CSV columns needed:</strong> date, client_name, address, service_type, revenue, duration_hours, employee<br /><span className="csv-note">⚡ Real drive times via OpenStreetMap. Analysis takes ~15–20 seconds.</span></div>
          </div>
        )}
        {screen === "dashboard" && analysisData && <Dashboard data={analysisData} businessName={activeBusiness?.name} onReset={() => { setScreen("upload"); setAnalysisData(null); }} />}
        {screen === "evaluate" && <JobEvaluator config={config} />}
        {screen === "businesses" && <BusinessManager onSelect={(biz) => { handleSelectBusiness(biz); setScreen("upload"); }} />}
      </main>
    </div>
  );
}
