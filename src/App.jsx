import { useState, useCallback } from "react";
import Dashboard from "./components/Dashboard";
import Uploader from "./components/Uploader";
import JobEvaluator from "./components/JobEvaluator";
import ConfigPanel from "./components/ConfigPanel";

const DEFAULT_CONFIG = {
  hourly_labor_cost: 85,
  profitable_threshold: 120,
  marginal_threshold: 75,
  home_city: "Kalispell MT 59901",
};

export default function App() {
  const [screen, setScreen] = useState("upload"); // upload | dashboard | evaluate
  const [analysisData, setAnalysisData] = useState(null);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = useCallback(async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const params = new URLSearchParams({
      hourly_labor_cost: config.hourly_labor_cost,
      profitable_threshold: config.profitable_threshold,
      marginal_threshold: config.marginal_threshold,
      home_city: config.home_city,
    });

    try {
      const res = await fetch(`http://localhost:8000/analyze?${params}`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Analysis failed");
      }
      const data = await res.json();
      setAnalysisData(data);
      setScreen("dashboard");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [config]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">OptiCal <span className="logo-ai">AI</span></span>
          </div>
          <nav className="nav">
            <button
              className={`nav-btn ${screen === "upload" ? "active" : ""}`}
              onClick={() => setScreen("upload")}
            >Upload Jobs</button>
            {analysisData && (
              <button
                className={`nav-btn ${screen === "dashboard" ? "active" : ""}`}
                onClick={() => setScreen("dashboard")}
              >Dashboard</button>
            )}
            <button
              className={`nav-btn ${screen === "evaluate" ? "active" : ""}`}
              onClick={() => setScreen("evaluate")}
            >Evaluate Job</button>
          </nav>
        </div>
      </header>

      <main className="main">
        {screen === "upload" && (
          <div className="upload-screen">
            <div className="upload-hero">
              <h1>Stop losing money<br /><span className="accent">on the road.</span></h1>
              <p className="hero-sub">Upload your job history. Find out exactly which jobs are costing you time, money, and margin — in under 30 seconds.</p>
            </div>
            <ConfigPanel config={config} onChange={setConfig} />
            <Uploader onUpload={handleFileUpload} loading={loading} error={error} />
          </div>
        )}

        {screen === "dashboard" && analysisData && (
          <Dashboard data={analysisData} onReset={() => { setScreen("upload"); setAnalysisData(null); }} />
        )}

        {screen === "evaluate" && (
          <JobEvaluator config={config} />
        )}
      </main>
    </div>
  );
}
