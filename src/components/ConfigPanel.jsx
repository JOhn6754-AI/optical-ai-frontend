export default function ConfigPanel({ config, onChange }) {
  const update = (key, val) => onChange({ ...config, [key]: parseFloat(val) || val });

  return (
    <div className="config-panel">
      <h3 className="config-title">Business Settings</h3>
      <div className="config-row">
        <label>
          Hourly Labor Cost ($)
          <input
            type="number"
            value={config.hourly_labor_cost}
            onChange={e => update("hourly_labor_cost", e.target.value)}
          />
        </label>
        <label>
          Profitable Threshold ($/hr)
          <input
            type="number"
            value={config.profitable_threshold}
            onChange={e => update("profitable_threshold", e.target.value)}
          />
        </label>
        <label>
          Marginal Threshold ($/hr)
          <input
            type="number"
            value={config.marginal_threshold}
            onChange={e => update("marginal_threshold", e.target.value)}
          />
        </label>
      </div>
    </div>
  );
}
