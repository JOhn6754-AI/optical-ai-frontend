const COLORS = { GREEN: "#22c55e", YELLOW: "#f59e0b", RED: "#ef4444" };
const LABELS = { GREEN: "Profitable", YELLOW: "Marginal", RED: "Losing Money" };

function StatCard({ label, value, sub, highlight }) {
  return (
    <div className={`stat-card ${highlight ? "highlight" : ""}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function JobRow({ job }) {
  const color = COLORS[job.classification];
  return (
    <div className="job-row" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="job-row-main">
        <div>
          <span className="job-name">{job.client_name}</span>
          <span className="job-type">{job.service_type}</span>
        </div>
        <div className="job-stats">
          <span className="job-revenue">${job.revenue}</span>
          <span className="job-rate" style={{ color }}>
            ${job.gross_per_hour}/hr
          </span>
          <span className="job-badge" style={{ background: color + "22", color }}>
            {LABELS[job.classification]}
          </span>
        </div>
      </div>
      <div className="job-row-detail">
        {job.duration_hours}hr work · {job.drive_time}hr drive · ${job.labor_cost} labor cost · ${job.profit > 0 ? "+" : ""}{job.profit} profit
      </div>
    </div>
  );
}

export default function Dashboard({ data, onReset }) {
  const { summary, days, red_jobs } = data;

  const fmt = (n) => n?.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmtHr = (n) => n?.toFixed(1);

  return (
    <div className="dashboard">
      {/* Summary Cards */}
      <section className="summary-section">
        <h2 className="section-title">Weekly Summary</h2>
        <div className="stats-grid">
          <StatCard label="Total Revenue" value={`$${fmt(summary.total_revenue)}`} />
          <StatCard label="Billable Work" value={`${fmtHr(summary.total_work_hours)}hr`} />
          <StatCard
            label="Unbillable Drive"
            value={`${fmtHr(summary.total_drive_hours)}hr`}
            sub={`$${fmt(summary.drive_cost)} cost`}
            highlight
          />
          <StatCard
            label="Your Actual $/hr"
            value={`$${fmt(summary.actual_hourly)}`}
            sub={`Could be $${fmt(summary.potential_hourly)}/hr`}
          />
          <StatCard
            label="Left on Table"
            value={`$${fmt(summary.money_left_on_table)}`}
            sub="this week"
            highlight
          />
          <StatCard
            label="Annual Drive Waste"
            value={`$${fmt(summary.annual_drive_waste)}`}
            sub={`$${fmt(summary.annual_recoverable)} recoverable`}
            highlight
          />
        </div>
      </section>

      {/* Red Flags */}
      {red_jobs.length > 0 && (
        <section className="red-section">
          <h2 className="section-title">🚨 Money-Losing Jobs ({red_jobs.length})</h2>
          <div className="red-jobs">
            {red_jobs.map((job, i) => (
              <div key={i} className="red-job-card">
                <div className="red-job-header">
                  <strong>{job.client_name}</strong>
                  <span>{job.service_type}</span>
                </div>
                <div className="red-job-stats">
                  <span>Quoted: ${job.revenue}</span>
                  <span className="red-rate">${job.gross_per_hour}/hr effective rate</span>
                </div>
                <div className="red-job-action">
                  Decline <strong>OR</strong> quote ${job.suggested_price} (+${job.surcharge_needed} travel fee)
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Day-by-Day */}
      <section className="days-section">
        <h2 className="section-title">Day-by-Day Breakdown</h2>
        {days.map((day) => (
          <div key={day.date} className="day-block">
            <div className="day-header">
              <span className="day-name">{day.day_name}</span>
              <div className="day-meta">
                <span>{day.jobs.length} jobs</span>
                <span>${fmt(day.day_revenue)}</span>
                <span>{fmtHr(day.day_work_hours)}hr work</span>
                <span className="day-drive">{fmtHr(day.day_drive_hours)}hr driving</span>
              </div>
            </div>
            <div className="jobs-list">
              {day.jobs.map((job, i) => (
                <JobRow key={i} job={job} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <button className="reset-btn" onClick={onReset}>↑ Upload New Data</button>
    </div>
  );
}
