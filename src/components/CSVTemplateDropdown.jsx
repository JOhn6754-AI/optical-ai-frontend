import { useState, useRef, useEffect } from "react";

const TEMPLATES = {
  jobber: {
    label: "Jobber",
    filename: "OptiCal_Template_Jobber.csv",
    description: "Jobber job export format",
    color: "#0ea5e9",
    rows: [
      ["job_number", "client_name", "job_type", "job_date", "total_revenue", "total_cost", "tech_name", "city", "state", "zip", "duration_minutes", "status"],
      ["JOB-001", "Smith HVAC Service", "AC Tune-Up", "2024-07-15", "285.00", "95.00", "Mike Johnson", "Kalispell", "MT", "59901", "90", "invoiced"],
      ["JOB-002", "Jones Plumbing Fix", "Water Heater Replace", "2024-07-16", "1200.00", "420.00", "Sarah Lee", "Whitefish", "MT", "59937", "180", "invoiced"],
      ["JOB-003", "Williams AC Repair", "Refrigerant Recharge", "2024-07-17", "350.00", "110.00", "Mike Johnson", "Columbia Falls", "MT", "59912", "60", "invoiced"],
    ],
  },
  servicetitan: {
    label: "ServiceTitan",
    filename: "OptiCal_Template_ServiceTitan.csv",
    description: "ServiceTitan export format",
    color: "#f97316",
    rows: [
      ["Job ID", "Customer Name", "Business Unit", "Job Type", "Scheduled Date", "Invoice Total", "Job Cost", "Technician", "Location City", "Location State", "Location Zip", "Job Duration (min)", "Job Status"],
      ["ST-10001", "Anderson Family", "HVAC", "Heating Tune-Up", "2024-11-10", "320.00", "105.00", "Dave Torres", "Kalispell", "MT", "59901", "75", "Completed"],
      ["ST-10002", "Baker Commercial", "Plumbing", "Drain Cleaning", "2024-11-11", "275.00", "80.00", "Amy Chen", "Bigfork", "MT", "59911", "60", "Completed"],
      ["ST-10003", "Clark Residence", "HVAC", "Furnace Repair", "2024-11-12", "895.00", "310.00", "Dave Torres", "Lakeside", "MT", "59922", "150", "Completed"],
    ],
  },
  quickbooks: {
    label: "QuickBooks",
    filename: "OptiCal_Template_QuickBooks.csv",
    description: "QuickBooks job/invoice export format",
    color: "#22c55e",
    rows: [
      ["Invoice No", "Customer", "Invoice Date", "Due Date", "Item", "Qty", "Rate", "Amount", "Class", "Memo", "City", "State", "Zip"],
      ["INV-2001", "Thompson HVAC", "2024-09-05", "2024-09-19", "AC Tune-Up Service", "1", "295.00", "295.00", "HVAC", "Annual tune-up", "Kalispell", "MT", "59901"],
      ["INV-2002", "Martinez Plumbing", "2024-09-06", "2024-09-20", "Water Heater Install", "1", "1450.00", "1450.00", "Plumbing", "50 gal gas unit", "Whitefish", "MT", "59937"],
      ["INV-2003", "Nelson Electric", "2024-09-07", "2024-09-21", "Panel Upgrade", "1", "2200.00", "2200.00", "Electrical", "200A service upgrade", "Columbia Falls", "MT", "59912"],
    ],
  },
};

function rowsToCSV(rows) {
  return rows
    .map((row) =>
      row.map((cell) => (String(cell).includes(",") ? `"${cell}"` : cell)).join(",")
    )
    .join("\n");
}

function downloadCSV(filename, rows) {
  const csv = rowsToCSV(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * CSVTemplateDropdown
 * No props required. Drop it anywhere near <Uploader />.
 * Shows a dropdown with one-click CSV template downloads for
 * Jobber, ServiceTitan, and QuickBooks.
 */
export default function CSVTemplateDropdown() {
  const [open, setOpen] = useState(false);
  const [downloaded, setDownloaded] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleDownload(key) {
    const t = TEMPLATES[key];
    downloadCSV(t.filename, t.rows);
    setDownloaded(key);
    setTimeout(() => setDownloaded(null), 2000);
    setOpen(false);
  }

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "7px 13px",
          background: "#1e293b",
          color: "#94a3b8",
          border: "1px solid #334155",
          borderRadius: "6px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
          transition: "border-color 0.15s, color 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#64748b"; e.currentTarget.style.color = "#e2e8f0"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.color = "#94a3b8"; }}
      >
        📋 Download CSV Template {open ? "▲" : "▼"}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "8px",
            padding: "6px",
            zIndex: 9999,
            minWidth: "220px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          }}
        >
          <div style={{ padding: "4px 8px 6px", fontSize: "10px", color: "#64748b", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Pick your software format
          </div>
          {Object.entries(TEMPLATES).map(([key, t]) => (
            <button
              key={key}
              onClick={() => handleDownload(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                width: "100%",
                padding: "9px 10px",
                background: downloaded === key ? "#0f172a" : "transparent",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#0f172a"; }}
              onMouseLeave={(e) => { if (downloaded !== key) e.currentTarget.style.background = "transparent"; }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: t.color,
                  flexShrink: 0,
                }}
              />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#e2e8f0" }}>
                  {downloaded === key ? "✓ Downloaded!" : t.label}
                </div>
                <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>
                  {t.description}
                </div>
              </div>
            </button>
          ))}
          <div style={{ padding: "6px 10px 2px", fontSize: "9px", color: "#475569", borderTop: "1px solid #334155", marginTop: "4px" }}>
            Edit sample rows — keep the header row exactly as-is
          </div>
        </div>
      )}
    </div>
  );
}
