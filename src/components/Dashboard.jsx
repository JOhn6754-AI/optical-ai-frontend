import { useState } from "react";

const COLORS = { GREEN: "#22c55e", YELLOW: "#f59e0b", RED: "#ef4444" };
const BG = { GREEN: "#22c55e18", YELLOW: "#f59e0b18", RED: "#ef444418" };
const LABELS = { GREEN: "Profitable", YELLOW: "Marginal", RED: "Losing Money" };

function StatCard({ label, value, sub, highlight }) {
  return (
    <div style={{
      background: highlight ? "#1a1f2e" : "#141414",
      border: `1px solid ${highlight ? "#6366f133" : "#2a2a2a"}`,
      borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 26, fontWeight: 700, color: highlight ? "#6366f1" : "#f9fafb", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: sub ? 4 : 0 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: "#9ca3af" }}>{sub}</div>}
    </div>
  );
}

function JobModal({ job, onClose }) {
  if (!job) return null;
  const color = COLORS[job.classification];
  const profit = job.profit;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, padding: 24,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#141414", border: "1px solid #2a2a2a", borderRadius: 16,
        padding: 32, width: "100%", maxWidth: 480, position: "relative",
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 16, background: "none",
          border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", lineHeight: 1,
        }}>✕</button>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{
              background: BG[job.classification], color, border: `1px solid ${color}44`,
              padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
            }}>{LABELS[job.classification]}</span>
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>{job.client_name}</h2>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: 14 }}>{job.service_type}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Revenue", value: `$${job.revenue}` },
            { label: "Effective rate", value: `$${job.gross_per_hour}/hr`, color },
            { label: "Work time", value: `${job.duration_hours}hr` },
            { label: "Drive time", value: `${job.drive_time}hr` },
            { label: "Labor cost", value: `$${job.labor_cost}` },
            { label: "Profit", value: `${profit >= 0 ? "+" : ""}$${profit}`, color: profit >= 0 ? "#22c55e" : "#ef4444" },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ background: "#1f2937", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: c || "#f9fafb" }}>{value}</div>
            </div>
          ))}
        </div>

        {job.classification === "RED" && (
          <div style={{ background: "#ef444412", border: "1px solid #ef444433", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Action needed</div>
            <div style={{ fontSize: 14, color: "#fca5a5" }}>
            {(() => {
  const totalTime = (parseFloat(job.duration_hours) + parseFloat(job.drive_time));
  const suggested = (120 * totalTime).toFixed(2);
  const surcharge = (suggested - job.revenue).toFixed(2);
  return <>Decline <strong>or</strong> requote at <strong style={{color:"#f9fafb"}}>${suggested}</strong><span style={{color:"#9ca3af"}}> (+${surcharge} to cover drive cost)</span></>;
})()}
            </div>
          </div>
        )}

        {job.classification === "YELLOW" && (
          <div style={{ background: "#f59e0b12", border: "1px solid #f59e0b33", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Marginal job</div>
            <div style={{ fontSize: 14, color: "#fcd34d" }}>This job is below your profitable threshold. Consider adding a travel fee or bundling with nearby jobs.</div>
          </div>
        )}

        {job.classification === "GREEN" && (
          <div style={{ background: "#22c55e12", border: "1px solid #22c55e33", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Good job</div>
            <div style={{ fontSize: 14, color: "#86efac" }}>This job meets your profitability target. Look for more like it in this area.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ job, onClick }) {
  const color = COLORS[job.classification];
  return (
    <div onClick={() => onClick(job)} style={{
      borderLeft: `3px solid ${color}`, background: "#0f0f0f",
      borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: 6,
      cursor: "pointer", transition: "background 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "#1a1a1a"}
      onMouseLeave={e => e.currentTarget.style.background = "#0f0f0f"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#f3f4f6" }}>{job.client_name}</span>
          <span style={{ fontSize: 12, color: "#6b7280", background: "#1f2937", padding: "2px 8px", borderRadius: 4 }}>{job.service_type}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>${job.revenue}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color }}>${job.gross_per_hour}/hr</span>
          <span style={{ fontSize: 11, fontWeight: 600, background: BG[job.classification], color, border: `1px solid ${color}33`, padding: "3px 8px", borderRadius: 5 }}>
            {LABELS[job.classification]}
          </span>
          <span style={{ fontSize: 12, color: "#4b5563" }}>→</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {job.duration_hours}hr work · {job.drive_time}hr drive · ${job.labor_cost} labor cost · <span style={{ color: job.profit >= 0 ? "#22c55e" : "#ef4444" }}>{job.profit >= 0 ? "+" : ""}${job.profit} profit</span>
      </div>
    </div>
  );
}

export default function Dashboard({ data, businessName, onReset }) {
  const { summary, days, red_jobs } = data;
  const [selectedJob, setSelectedJob] = useState(null);
  const fmt = (n) => n?.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmtHr = (n) => n?.toFixed(1);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          {businessName && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{businessName}</div>}
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>Weekly Analysis</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data.geocoding === "real" && (
            <span style={{ fontSize: 12, color: "#22c55e", background: "#22c55e12", border: "1px solid #22c55e33", padding: "4px 10px", borderRadius: 6 }}>✓ Real drive times</span>
          )}
          <button onClick={onReset} style={{ background: "#1f2937", border: "1px solid #374151", color: "#9ca3af", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>↑ New Upload</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Total Revenue" value={`$${fmt(summary.total_revenue)}`} />
        <StatCard label="Billable Work" value={`${fmtHr(summary.total_work_hours)}hr`} />
        <StatCard label="Unbillable Drive" value={`${fmtHr(summary.total_drive_hours)}hr`} sub={`$${fmt(summary.drive_cost)} cost`} highlight />
        <StatCard label="Actual $/hr" value={`$${fmt(summary.actual_hourly)}`} sub={`Could be $${fmt(summary.potential_hourly)}/hr`} />
        <StatCard label="Left on Table" value={`$${fmt(summary.money_left_on_table)}`} sub="this week" highlight />
        <StatCard label="Annual Drive Waste" value={`$${fmt(summary.annual_drive_waste)}`} sub={`$${fmt(summary.annual_recoverable)} recoverable`} highlight />
      </div>

      {red_jobs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#ef4444" }}>🚨 Money-Losing Jobs ({red_jobs.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {red_jobs.map((job, i) => (
              <div key={i} style={{ background: "#ef444410", border: "1px solid #ef444430", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong style={{ color: "#f9fafb", fontSize: 14 }}>{job.client_name}</strong>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{job.service_type}</span>
                </div>
                <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 8 }}>
                  ${job.revenue} quoted · <span style={{ color: "#ef4444" }}>${job.gross_per_hour}/hr effective</span>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af", background: "#0f0f0f", borderRadius: 6, padding: "8px 10px" }}>
                  Requote at <strong style={{ color: "#f9fafb" }}>${job.suggested_price}</strong> (+${job.surcharge_needed} travel)
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600, color: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.06em" }}>Day-by-Day Breakdown</h3>
        {days.map((day) => (
          <div key={day.date} style={{ background: "#141414", border: "1px solid #1f2937", borderRadius: 12, marginBottom: 16, overflow: "hidden" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #1f2937" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#f9fafb" }}>{day.day_name}</span>
              <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>{day.jobs.length} jobs</span>
                <span style={{ color: "#f9fafb", fontWeight: 600 }}>${fmt(day.day_revenue)}</span>
                <span style={{ color: "#9ca3af" }}>{fmtHr(day.day_work_hours)}hr work</span>
                <span style={{ color: day.day_drive_hours > 1 ? "#f59e0b" : "#6b7280", fontWeight: day.day_drive_hours > 1 ? 600 : 400 }}>{fmtHr(day.day_drive_hours)}hr driving</span>
              </div>
            </div>
            <div style={{ padding: "12px 14px" }}>
              {day.jobs.map((job, i) => <JobRow key={i} job={job} onClick={setSelectedJob} />)}
            </div>
          </div>
        ))}
      </section>

      <p style={{ textAlign: "center", fontSize: 12, color: "#374151", marginTop: 32 }}>Click any job to see full details</p>
    </div>
  );
}
