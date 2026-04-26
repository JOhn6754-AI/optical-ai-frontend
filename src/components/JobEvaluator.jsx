import { useState } from "react";
import { API_URL } from "../App";

const COLORS = { GREEN: "#22c55e", YELLOW: "#f59e0b", RED: "#ef4444" };
const ICONS = { ACCEPT: "✓", COUNTER: "↔", DECLINE: "✕" };

export default function JobEvaluator({ config }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    client_name: "",
    address: "",
    service_type: "",
    revenue: "",
    duration_hours: "",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/evaluate-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          revenue: parseFloat(form.revenue),
          duration_hours: parseFloat(form.duration_hours),
          home_address: config.home_address,
          hourly_labor_cost: config.hourly_labor_cost,
          profitable_threshold: config.profitable_threshold,
          marginal_threshold: config.marginal_threshold,
        }),
      });
      if (!res.ok) throw new Error("Evaluation failed");
      setResult(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = form.client_name && form.address && form.revenue && form.duration_hours;
  const color = result ? COLORS[result.classification] : null;

  return (
    <div className="evaluator">
      <h2 className="section-title">Should I Take This Job?</h2>
      <p className="evaluator-sub">Enter a new job request for an instant accept / counter / decline recommendation.</p>

      <div className="eval-form">
        <div className="form-row">
          <label>Client Name
            <input name="client_name" value={form.client_name} onChange={handleChange} placeholder="Smith Residence" />
          </label>
          <label>Service Type
            <input name="service_type" value={form.service_type} onChange={handleChange} placeholder="AC Repair" />
          </label>
        </div>
        <div className="form-row">
          <label>Job Address (full address)
            <input name="address" value={form.address} onChange={handleChange} placeholder="789 Whitefish Stage Rd Kalispell MT 59901" />
          </label>
        </div>
        <div className="form-row">
          <label>Date
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </label>
          <label>Quoted Price ($)
            <input type="number" name="revenue" value={form.revenue} onChange={handleChange} placeholder="450" />
          </label>
          <label>Duration (hours)
            <input type="number" name="duration_hours" value={form.duration_hours} onChange={handleChange} placeholder="2.5" step="0.5" />
          </label>
        </div>
        <div className="home-base-info">
          📍 Home base: <strong>{config.home_address}</strong>
          <span className="home-base-note"> — change in Business Settings on Upload page</span>
        </div>
        <button className="eval-btn" onClick={handleSubmit} disabled={loading || !isValid}>
          {loading ? "Calculating real drive time..." : "Evaluate This Job →"}
        </button>
      </div>

      {error && <div className="error-banner">⚠ {error}</div>}

      {result && (
        <div className="eval-result" style={{ borderColor: color }}>
          <div className="eval-verdict" style={{ color }}>
            <span className="eval-icon">{ICONS[result.recommendation]}</span>
            <span className="eval-rec">{result.recommendation}</span>
          </div>
          <p className="eval-reason">{result.reason}</p>
          <div className="eval-stats">
            <div><span>Effective Rate</span><strong style={{ color }}>${result.gross_per_hour}/hr</strong></div>
            <div><span>Drive Time</span><strong>{result.drive_time_hours}hr</strong></div>
            <div><span>Total Time</span><strong>{result.total_time_hours}hr</strong></div>
            <div><span>Est. Profit</span><strong style={{ color }}>${result.estimated_profit}</strong></div>
          </div>
          {result.geocoding === "real" && (
            <div className="geocoding-badge">✓ Real drive time via OpenStreetMap</div>
          )}
        </div>
      )}
    </div>
  );
}
