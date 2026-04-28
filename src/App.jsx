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

const DEMO_DATA = {
  geocoding: "real",
  config: { hourly_labor_cost: 85, profitable_threshold: 120, marginal_threshold: 75 },
  summary: {
    total_revenue: 8340, total_work_hours: 38.5, total_drive_hours: 14.2,
    drive_cost: 1207, actual_hourly: 158.3, potential_hourly: 216.6,
    money_left_on_table: 2241, annual_drive_waste: 60350, annual_recoverable: 24140,
    red_job_count: 3, total_jobs: 16,
  },
  red_jobs: [
    { client_name: "Pine View Cabins", service_type: "Drain Cleaning", revenue: 95, gross_per_hour: 38, suggested_price: 228, surcharge_needed: 133 },
    { client_name: "Olson Residence",  service_type: "Faucet Replace",  revenue: 110, gross_per_hour: 52, suggested_price: 204, surcharge_needed: 94 },
    { client_name: "Lakeshore Inn",    service_type: "AC Tune-Up",      revenue: 130, gross_per_hour: 61, suggested_price: 255, surcharge_needed: 125 },
  ],
  insights: [
    { type: "warning", icon: "📅", title: "Fridays run 34% below your best margin day", detail: "Mondays average $198/hr vs Fridays at $131/hr. Consider lighter Friday scheduling or higher rates for end-of-week bookings." },
    { type: "warning", icon: "🚗", title: "37% of your time is unpaid driving", detail: "Industry benchmark is under 20%. You're spending $1,207 on drive time this period. Route optimization could recover an estimated 30-50% of that." },
    { type: "good",    icon: "⭐", title: "HVAC installs are your most profitable service", detail: "Averaging $189/hr — well above your $120/hr target. Prioritize booking more HVAC install jobs." },
    { type: "warning", icon: "📍", title: "Zip code 59860 is dragging your margins", detail: "4 jobs in 59860 (Polson area) average $64/hr vs your $158/hr overall. Consider a travel surcharge for calls south of Flathead Lake." },
    { type: "info",    icon: "🔍", title: "3 jobs with unusually long drive times", detail: "These jobs have 2x+ average drive time, costing an extra $340 in unbillable hours. Bundle with nearby work or add a travel fee." },
  ],
  optimization: {
    total_original_drive_hours: 14.2, total_optimized_drive_hours: 7.8,
    total_hours_saved: 6.4, total_dollars_saved: 544, pct_improvement: 45,
    days: [
      { date: "2026-04-21", original_drive_hours: 3.8, optimized_drive_hours: 2.1, hours_saved: 1.7, dollars_saved: 144 },
      { date: "2026-04-22", original_drive_hours: 4.1, optimized_drive_hours: 1.9, hours_saved: 2.2, dollars_saved: 187 },
      { date: "2026-04-23", original_drive_hours: 3.2, optimized_drive_hours: 2.2, hours_saved: 1.0, dollars_saved: 85  },
      { date: "2026-04-24", original_drive_hours: 3.1, optimized_drive_hours: 1.6, hours_saved: 1.5, dollars_saved: 127 },
    ],
  },
  days: [
    {
      date: "2026-04-21", day_name: "Monday, April 21",
      day_revenue: 2480, day_work_hours: 10.5, day_drive_hours: 3.8,
      jobs: [
        { client_name: "Mountain View HVAC",  service_type: "HVAC Install",    revenue: 1200, duration_hours: 5,   drive_time: 0.55, labor_cost: 472, profit: 728,  gross_per_hour: 215.2, total_time: 5.55, classification: "GREEN",  lat: 48.4119, lng: -114.3547 },
        { client_name: "Glacier Park Hotel",  service_type: "Boiler Service",  revenue: 850,  duration_hours: 3,   drive_time: 0.55, labor_cost: 302, profit: 548,  gross_per_hour: 239.4, total_time: 3.55, classification: "GREEN",  lat: 48.3730, lng: -114.1838 },
        { client_name: "Pine View Cabins",    service_type: "Drain Cleaning",  revenue: 95,   duration_hours: 1,   drive_time: 1.45, labor_cost: 208, profit: -113, gross_per_hour: 38.0,  total_time: 2.50, classification: "RED",    lat: 47.6935, lng: -114.1621 },
        { client_name: "Flathead Storage",    service_type: "Heat Pump Check", revenue: 335,  duration_hours: 1.5, drive_time: 0.55, labor_cost: 174, profit: 161,  gross_per_hour: 163.4, total_time: 2.05, classification: "GREEN",  lat: 48.1958, lng: -114.3128 },
      ],
    },
    {
      date: "2026-04-22", day_name: "Tuesday, April 22",
      day_revenue: 2190, day_work_hours: 9.5, day_drive_hours: 4.1,
      jobs: [
        { client_name: "Whitefish Mountain Resort", service_type: "Commercial HVAC", revenue: 1400, duration_hours: 6,   drive_time: 0.72, labor_cost: 569, profit: 831, gross_per_hour: 208.3, total_time: 6.72, classification: "GREEN",  lat: 48.4896, lng: -114.3521 },
        { client_name: "Olson Residence",           service_type: "Faucet Replace",  revenue: 110,  duration_hours: 1,   drive_time: 1.28, labor_cost: 194, profit: -84, gross_per_hour: 47.8,  total_time: 2.30, classification: "RED",    lat: 47.5891, lng: -114.0934 },
        { client_name: "Columbia Falls Auto",       service_type: "Shop Heating",    revenue: 440,  duration_hours: 2,   drive_time: 0.72, labor_cost: 230, profit: 210, gross_per_hour: 160.0, total_time: 2.75, classification: "GREEN",  lat: 48.3730, lng: -114.1838 },
        { client_name: "Bigfork Marina",            service_type: "Plumbing Repair", revenue: 240,  duration_hours: 1,   drive_time: 1.08, labor_cost: 176, profit: 64,  gross_per_hour: 113.2, total_time: 2.12, classification: "YELLOW", lat: 48.0633, lng: -114.0539 },
      ],
    },
    {
      date: "2026-04-23", day_name: "Wednesday, April 23",
      day_revenue: 2110, day_work_hours: 9.5, day_drive_hours: 3.2,
      jobs: [
        { client_name: "Kalispell Medical Ctr",  service_type: "HVAC Maintenance", revenue: 680,  duration_hours: 3,   drive_time: 0.42, labor_cost: 291, profit: 389, gross_per_hour: 201.8, total_time: 3.37, classification: "GREEN",  lat: 48.1958, lng: -114.3128 },
        { client_name: "Glacier Gateway Inn",    service_type: "Plumbing Inspect",  revenue: 380,  duration_hours: 2,   drive_time: 0.85, labor_cost: 242, profit: 138, gross_per_hour: 133.3, total_time: 2.85, classification: "GREEN",  lat: 48.5021, lng: -114.0123 },
        { client_name: "Lakeshore Inn",          service_type: "AC Tune-Up",        revenue: 130,  duration_hours: 1,   drive_time: 1.15, labor_cost: 182, profit: -52, gross_per_hour: 60.5,  total_time: 2.15, classification: "RED",    lat: 47.8910, lng: -114.1892 },
        { client_name: "Downtown Barbershop",    service_type: "Heating Repair",    revenue: 295,  duration_hours: 2,   drive_time: 0.42, labor_cost: 205, profit: 90,  gross_per_hour: 119.8, total_time: 2.46, classification: "YELLOW", lat: 48.1992, lng: -114.3201 },
        { client_name: "Evergreen Apartments",   service_type: "Water Heater",      revenue: 625,  duration_hours: 2.5, drive_time: 0.42, labor_cost: 249, profit: 376, gross_per_hour: 213.8, total_time: 2.92, classification: "GREEN",  lat: 48.2103, lng: -114.3050 },
      ],
    },
    {
      date: "2026-04-24", day_name: "Thursday, April 24",
      day_revenue: 1560, day_work_hours: 9.0, day_drive_hours: 3.1,
      jobs: [
        { client_name: "Woodland School",      service_type: "Furnace Service",   revenue: 520, duration_hours: 2.5, drive_time: 0.52, labor_cost: 257, profit: 263, gross_per_hour: 171.0, total_time: 3.02, classification: "GREEN",  lat: 48.1745, lng: -114.2960 },
        { client_name: "Swan River Brewery",   service_type: "Commercial Boiler", revenue: 760, duration_hours: 4,   drive_time: 0.95, labor_cost: 420, profit: 340, gross_per_hour: 153.6, total_time: 4.95, classification: "GREEN",  lat: 48.1521, lng: -113.9843 },
        { client_name: "Meadow Lake Resort",   service_type: "Heat Pump Install", revenue: 140, duration_hours: 1,   drive_time: 0.90, labor_cost: 161, profit: -21, gross_per_hour: 73.7,  total_time: 1.90, classification: "YELLOW", lat: 48.3012, lng: -114.4231 },
        { client_name: "Trailhead Outfitters", service_type: "AC Service",        revenue: 140, duration_hours: 1,   drive_time: 0.52, labor_cost: 129, profit: 11,  gross_per_hour: 91.6,  total_time: 1.53, classification: "YELLOW", lat: 48.2210, lng: -114.3341 },
      ],
    },
  ],
};

export default function App() {
  const [screen, setScreen]             = useState("upload");
  const [analysisData, setAnalysisData] = useState(null);
  const [mappingData, setMappingData]   = useState(null);
  const [config, setConfig]             = useState(DEFAULT_CONFIG);
  const [activeBusiness, setActiveBusiness] = useState(null);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);

  const handleSelectBusiness = (biz) => {
    setActiveBusiness(biz);
    setConfig({ hourly_labor_cost: biz.hourly_labor_cost, profitable_threshold: biz.profitable_threshold, marginal_threshold: biz.marginal_threshold, home_address: biz.home_address });
  };

  const handleLoadDemo = () => {
    setAnalysisData(DEMO_DATA);
    setScreen("dashboard");
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
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button onClick={handleLoadDemo} style={{ background: "none", border: "1px solid #374151", color: "#6b7280", padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: 13, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.color = "#a5b4fc"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#374151"; e.currentTarget.style.color = "#6b7280"; }}>
                ▶ Load Demo Data — see what the dashboard looks like
              </button>
            </div>
            <div className="csv-hint"><strong>Any CSV works</strong> — we match your columns automatically.<br /><span className="csv-note">⚡ Real drive times via OpenStreetMap. Analysis takes ~15–20 seconds.</span></div>
          </div>
        )}
        {screen === "mapping"    && mappingData  && <ColumnMapper mappingData={mappingData} onConfirm={handleMappingConfirm} onBack={() => setScreen("upload")} />}
        {screen === "dashboard"  && analysisData && <Dashboard data={analysisData} businessName={activeBusiness?.name} onReset={() => { setScreen("upload"); setAnalysisData(null); }} />}
        {screen === "evaluate"   && <JobEvaluator config={config} />}
        {screen === "businesses" && <BusinessManager onSelect={(biz) => { handleSelectBusiness(biz); setScreen("upload"); }} />}
      </main>
    </div>
  );
}
