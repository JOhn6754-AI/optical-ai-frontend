import { useState, useEffect } from "react";
import { API_URL } from "../App";

export default function BusinessManager({ onSelect }) {
  const [businesses, setBusinesses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    home_address: "",
    hourly_labor_cost: 85,
    profitable_threshold: 120,
    marginal_threshold: 75,
  });

  const load = async () => {
    try {
      const res = await fetch(`${API_URL}/businesses`);
      setBusinesses(await res.json());
    } catch (e) {
      console.error("Could not load businesses", e);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.name || !form.home_address) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/businesses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({ name: "", home_address: "", hourly_labor_cost: 85, profitable_threshold: 120, marginal_threshold: 75 });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this business?")) return;
    await fetch(`${API_URL}/businesses/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="biz-manager">
      <div className="biz-header">
        <div>
          <h2 className="section-title">Saved Businesses</h2>
          <p className="biz-sub">Save a business once — load their settings instantly for every future analysis.</p>
        </div>
        <button className="add-biz-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Cancel" : "+ Add Business"}
        </button>
      </div>

      {showForm && (
        <div className="biz-form">
          <h3 className="form-section-title">New Business</h3>
          <div className="form-row">
            <label>Business Name
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Flathead HVAC Services" />
            </label>
            <label>Home Base Address
              <input value={form.home_address} onChange={e => setForm({ ...form, home_address: e.target.value })} placeholder="506 Main St Kalispell MT 59901" />
            </label>
          </div>
          <div className="form-row">
            <label>Hourly Labor Cost ($)
              <input type="number" value={form.hourly_labor_cost} onChange={e => setForm({ ...form, hourly_labor_cost: parseFloat(e.target.value) })} />
            </label>
            <label>Profitable Threshold ($/hr)
              <input type="number" value={form.profitable_threshold} onChange={e => setForm({ ...form, profitable_threshold: parseFloat(e.target.value) })} />
            </label>
            <label>Marginal Threshold ($/hr)
              <input type="number" value={form.marginal_threshold} onChange={e => setForm({ ...form, marginal_threshold: parseFloat(e.target.value) })} />
            </label>
          </div>
          <button className="eval-btn" onClick={handleSave} disabled={saving || !form.name || !form.home_address}>
            {saving ? "Saving..." : "Save Business →"}
          </button>
        </div>
      )}

      {businesses.length === 0 && !showForm && (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <p>No businesses saved yet.</p>
          <p className="empty-sub">Add your first business to save their settings.</p>
        </div>
      )}

      <div className="biz-list">
        {businesses.map(biz => (
          <div key={biz.id} className="biz-card">
            <div className="biz-card-main">
              <div>
                <div className="biz-name">{biz.name}</div>
                <div className="biz-address">{biz.home_address}</div>
              </div>
              <div className="biz-config-badges">
                <span className="badge">${biz.hourly_labor_cost}/hr labor</span>
                <span className="badge green-badge">${biz.profitable_threshold}/hr target</span>
              </div>
            </div>
            <div className="biz-card-actions">
              <button className="select-btn" onClick={() => onSelect(biz)}>Load for Analysis →</button>
              <button className="delete-btn" onClick={() => handleDelete(biz.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
