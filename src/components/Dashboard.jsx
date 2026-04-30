import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import PDFExportButton from "./PDFExportButton";

const COLORS = { GREEN: "#22c55e", YELLOW: "#f59e0b", RED: "#ef4444" };
const BG     = { GREEN: "#22c55e18", YELLOW: "#f59e0b18", RED: "#ef444418" };
const LABELS = { GREEN: "Profitable", YELLOW: "Marginal", RED: "Losing Money" };

function StatCard({ label, value, sub, highlight }) {
  return (
    <div style={{ background: highlight ? "#1a1f2e" : "#141414", border: `1px solid ${highlight ? "#6366f133" : "#2a2a2a"}`, borderRadius: 12, padding: "20px 24px", flex: 1, minWidth: 140 }}>
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
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 24 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "#141414", border: "1px solid #2a2a2a", borderRadius: 16, padding: 32, width: "100%", maxWidth: 480, position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#6b7280", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>&#x2715;</button>
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span style={{ background: BG[job.classification], color, border: `1px solid ${color}44`, padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>{LABELS[job.classification]}</span>
          </div>
          <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 700, color: "#f9fafb" }}>{job.client_name}</h2>
          <p style={{ margin: 0, color: "#9ca3af", fontSize: 14 }}>{job.service_type}</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Revenue",        value: `$${job.revenue}` },
            { label: "Effective rate", value: `$${job.gross_per_hour}/hr`, color },
            { label: "Work time",      value: `${job.duration_hours}hr` },
            { label: "Drive time",     value: `${job.drive_time}hr` },
            { label: "Labor cost",     value: `$${job.labor_cost}` },
            { label: "Profit",         value: `${profit >= 0 ? "+" : ""}$${profit}`, color: profit >= 0 ? "#22c55e" : "#ef4444" },
          ].map(({ label, value, color: c }) => (
            <div key={label} style={{ background: "#1f2937", borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: c || "#f9fafb" }}>{value}</div>
            </div>
          ))}
        </div>
        {job.classification === "RED" && (
          <div style={{ background: "#ef444412", border: "1px solid #ef444433", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#ef4444", marginBottom: 6, textTransform: "uppercase" }}>Action needed</div>
            <div style={{ fontSize: 14, color: "#fca5a5" }}>
              {(() => {
                const totalTime = parseFloat(job.duration_hours) + parseFloat(job.drive_time);
                const suggested = (120 * totalTime).toFixed(2);
                const surcharge = (suggested - job.revenue).toFixed(2);
                return <span>Decline <strong>or</strong> requote at <strong style={{ color: "#f9fafb" }}>${suggested}</strong><span style={{ color: "#9ca3af" }}> (+${surcharge} to cover drive cost)</span></span>;
              })()}
            </div>
          </div>
        )}
        {job.classification === "YELLOW" && (
          <div style={{ background: "#f59e0b12", border: "1px solid #f59e0b33", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#f59e0b", marginBottom: 6, textTransform: "uppercase" }}>Marginal job</div>
            <div style={{ fontSize: 14, color: "#fcd34d" }}>Below your profitable threshold. Add a travel fee or bundle with nearby jobs.</div>
          </div>
        )}
        {job.classification === "GREEN" && (
          <div style={{ background: "#22c55e12", border: "1px solid #22c55e33", borderRadius: 10, padding: "14px 16px" }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#22c55e", marginBottom: 6, textTransform: "uppercase" }}>Good job</div>
            <div style={{ fontSize: 14, color: "#86efac" }}>Meets your profitability target. Look for more like it in this area.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ job, onClick }) {
  const color = COLORS[job.classification];
  return (
    <div
      onClick={() => onClick(job)}
      style={{ borderLeft: `3px solid ${color}`, background: "#0f0f0f", borderRadius: "0 8px 8px 0", padding: "14px 16px", marginBottom: 6, cursor: "pointer", transition: "background 0.15s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "#0f0f0f"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: "#f3f4f6" }}>{job.client_name}</span>
          <span style={{ fontSize: 12, color: "#6b7280", background: "#1f2937", padding: "2px 8px", borderRadius: 4 }}>{job.service_type}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#f9fafb" }}>${job.revenue}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color }}>${job.gross_per_hour}/hr</span>
          <span style={{ fontSize: 11, fontWeight: 600, background: BG[job.classification], color, border: `1px solid ${color}33`, padding: "3px 8px", borderRadius: 5 }}>{LABELS[job.classification]}</span>
          <span style={{ fontSize: 12, color: "#4b5563" }}>&#8594;</span>
        </div>
      </div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>
        {job.duration_hours}hr work &middot; {job.drive_time}hr drive &middot; ${job.labor_cost} labor &middot; <span style={{ color: job.profit >= 0 ? "#22c55e" : "#ef4444" }}>{job.profit >= 0 ? "+" : ""}${job.profit} profit</span>
      </div>
    </div>
  );
}

function InsightsPanel({ insights }) {
  if (!insights || insights.length === 0) return null;
  const typeStyle = {
    warning: { border: "#f59e0b44", bg: "#f59e0b0d", titleColor: "#fcd34d" },
    good:    { border: "#22c55e44", bg: "#22c55e0d", titleColor: "#86efac" },
    info:    { border: "#6366f144", bg: "#6366f10d", titleColor: "#a5b4fc" },
  };
  return (
    <section style={{ marginBottom: 32 }}>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.06em" }}>AI Insights</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
        {insights.map((ins, i) => {
          const s = typeStyle[ins.type] || typeStyle.info;
          return (
            <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 18, lineHeight: 1.4 }}>{ins.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 13, color: s.titleColor, lineHeight: 1.4 }}>{ins.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#9ca3af", lineHeight: 1.55 }}>{ins.detail}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function OptimizationPanel({ optimization }) {
  const [expanded, setExpanded] = useState(false);
  if (!optimization || optimization.total_hours_saved < 0.05) return null;
  const fmt = n => n && n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return (
    <section style={{ marginBottom: 32 }}>
      <div style={{ background: "#1a1f2e", border: "1px solid #6366f133", borderRadius: 12, padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#a5b4fc" }}>Route Optimization</h3>
            <p style={{ margin: 0, fontSize: 13, color: "#6b7280" }}>If your routes ran in optimal order this week</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#22c55e" }}>${fmt(optimization.total_dollars_saved)}</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>{optimization.total_hours_saved}hr saved &middot; {optimization.pct_improvement}% improvement</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #ef444422", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Current drive hours</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#ef4444" }}>{optimization.total_original_drive_hours}hr</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", color: "#4b5563", fontSize: 20 }}>&#8594;</div>
          <div style={{ flex: 1, background: "#0f0f0f", border: "1px solid #22c55e22", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Optimized drive hours</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#22c55e" }}>{optimization.total_optimized_drive_hours}hr</div>
          </div>
        </div>
        <button onClick={() => setExpanded(!expanded)} style={{ background: "none", border: "none", color: "#6366f1", fontSize: 13, cursor: "pointer", padding: 0 }}>
          {expanded ? "▲ Hide" : "▼ Show"} day-by-day breakdown
        </button>
        {expanded && (
          <div style={{ marginTop: 12, borderTop: "1px solid #1f2937", paddingTop: 12 }}>
            {optimization.days.map((d, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, padding: "8px 0", borderBottom: i < optimization.days.length - 1 ? "1px solid #1f2937" : "none", fontSize: 13 }}>
                <span style={{ color: "#9ca3af" }}>{d.date}</span>
                <span style={{ color: "#ef4444" }}>{d.original_drive_hours}hr as-is</span>
                <span style={{ color: "#22c55e" }}>{d.optimized_drive_hours}hr optimal</span>
                <span style={{ color: "#f9fafb", fontWeight: 600, textAlign: "right" }}>save ${fmt(d.dollars_saved)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const LEAFLET_DARK_CSS = `
  .leaflet-control-zoom a {
    background: #1f2937 !important;
    color: #f9fafb !important;
    border-color: #374151 !important;
  }
  .leaflet-control-zoom a:hover {
    background: #374151 !important;
    color: #fff !important;
  }
  .leaflet-control-attribution {
    background: rgba(15,15,15,0.75) !important;
    color: #4b5563 !important;
    font-size: 9px !important;
  }
  .leaflet-control-attribution a {
    color: #6b7280 !important;
  }
  .leaflet-bar {
    border: 1px solid #374151 !important;
    box-shadow: none !important;
  }
  .leaflet-top,
  .leaflet-bottom,
  .leaflet-control {
    z-index: 400 !important;
  }
`;

function RouteMap({ days }) {
  const allJobs = days.flatMap(d => d.jobs).filter(j => j.lat && j.lng);
  if (allJobs.length === 0) return null;
  const avgLat = allJobs.reduce((s, j) => s + j.lat, 0) / allJobs.length;
  const avgLng = allJobs.reduce((s, j) => s + j.lng, 0) / allJobs.length;
  return (
    <section style={{ marginBottom: 32 }}>
      <style>{LEAFLET_DARK_CSS}</style>
      <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#f9fafb", textTransform: "uppercase", letterSpacing: "0.06em" }}>Job Map</h3>
      <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #1f2937", height: 360 }}>
        <MapContainer center={[avgLat, avgLng]} zoom={10} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CARTO"
          />
          {allJobs.map((job, i) => (
            <CircleMarker key={i} center={[job.lat, job.lng]} radius={9} pathOptions={{ fillColor: COLORS[job.classification], color: "#000", fillOpacity: 0.85, weight: 1.5 }}>
              <Popup>
                <div style={{ minWidth: 160 }}>
                  <strong style={{ fontSize: 14 }}>{job.client_name}</strong><br />
                  <span style={{ color: "#666", fontSize: 12 }}>{job.service_type}</span><br />
                  <span style={{ fontSize: 13 }}>${job.revenue} &middot; </span>
                  <span style={{ color: COLORS[job.classification], fontWeight: 600, fontSize: 13 }}>${job.gross_per_hour}/hr</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div style={{ display: "flex", gap: 18, marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        {Object.entries(LABELS).map(([cls, label]) => (
          <span key={cls} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[cls], display: "inline-block" }} />
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function Dashboard({ data, businessName, onReset }) {
  const { summary, days, red_jobs, insights, optimization } = data;
  const [selectedJob, setSelectedJob] = useState(null);
  const fmt   = n => n && n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  const fmtHr = n => n && n.toFixed(1);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui, sans-serif" }}>
      {selectedJob && <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          {businessName && <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 4 }}>{businessName}</div>}
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: "#f9fafb" }}>Job Analysis</h2>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data.geocoding === "real" && (
            <span style={{ fontSize: 12, color: "#22c55e", background: "#22c55e12", border: "1px solid #22c55e33", padding: "4px 10px", borderRadius: 6 }}>&#10003; Real drive times</span>
          )}
          <PDFExportButton
            jobs={days.flatMap(d => d.jobs)}
            insights={insights}
            optimization={optimization}
            businessName={businessName}
          />
          <button onClick={onReset} style={{ background: "#1f2937", border: "1px solid #374151", color: "#9ca3af", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>&#8593; New Upload</button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
        <StatCard label="Total Revenue"      value={`$${fmt(summary.total_revenue)}`} />
        <StatCard label="Billable Work"      value={`${fmtHr(summary.total_work_hours)}hr`} />
        <StatCard label="Unbillable Drive"   value={`${fmtHr(summary.total_drive_hours)}hr`} sub={`$${fmt(summary.drive_cost)} cost`} highlight />
        <StatCard label="Actual $/hr"        value={`$${fmt(summary.actual_hourly)}`} sub={`Could be $${fmt(summary.potential_hourly)}/hr`} />
        <StatCard label="Left on Table"      value={`$${fmt(summary.money_left_on_table)}`} sub="this week" highlight />
        <StatCard label="Annual Drive Waste" value={`$${fmt(summary.annual_drive_waste)}`} sub={`$${fmt(summary.annual_recoverable)} recoverable`} highlight />
      </div>
      <InsightsPanel insights={insights} />
      <OptimizationPanel optimization={optimization} />
      <RouteMap days={days} />
      {red_jobs && red_jobs.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600, color: "#ef4444" }}>Money-Losing Jobs ({red_jobs.length})</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
            {red_jobs.map((job, i) => (
              <div key={i} style={{ background: "#ef444410", border: "1px solid #ef444430", borderRadius: 10, padding: "14px 16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong style={{ color: "#f9fafb", fontSize: 14 }}>{job.client_name}</strong>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>{job.service_type}</span>
                </div>
                <div style={{ fontSize: 13, color: "#fca5a5", marginBottom: 8 }}>${job.revenue} quoted &middot; <span style={{ color: "#ef4444" }}>${job.gross_per_hour}/hr effective</span></div>
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
              {day.jobs.map((job, i) => (
                <JobRow key={i} job={job} onClick={setSelectedJob} />
              ))}
            </div>
          </div>
        ))}
      </section>
      <p style={{ textAlign: "center", fontSize: 12, color: "#374151", marginTop: 32 }}>Click any job to see full details</p>
    </div>
  );
}
