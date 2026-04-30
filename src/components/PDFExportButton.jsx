import { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"

/**
 * PDFExportButton
 * Props:
 *   jobs         — array of job objects from /analyze-mapped response
 *   insights     — array of insight strings/objects from response
 *   optimization — optimization block from response
 *   businessName — string, shown in report header
 */
export default function PDFExportButton({ jobs = [], insights = [], optimization = {}, businessName = "Your Business" }) {
  const [loading, setLoading] = useState(null); // "weekly" | "monthly" | null

  function filterByDays(days) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return jobs.filter((j) => {
      if (!j.date) return true; // include undated jobs
      return new Date(j.date) >= cutoff;
    });
  }

  function buildPDF(period) {
    const days = period === "weekly" ? 7 : 30;
    const label = period === "weekly" ? "Weekly" : "Monthly";
    const filtered = filterByDays(days);

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
    const pageW = doc.internal.pageSize.getWidth();

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageW, 28, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("OptiCal AI", 14, 12);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${label} ROI Report — ${businessName}`, 14, 20);

    const now = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    doc.text(`Generated: ${now}`, pageW - 14, 20, { align: "right" });

    // ── Stat cards ───────────────────────────────────────────────────────────
    const totalJobs = filtered.length;
    const redJobs = filtered.filter((j) => (j.score || j.profitability_score || "").toUpperCase() === "RED").length;
    const greenJobs = filtered.filter((j) => (j.score || j.profitability_score || "").toUpperCase() === "GREEN").length;

    const totalRevenue = filtered.reduce((s, j) => s + (parseFloat(j.revenue || j.job_revenue || 0)), 0);
    const totalDriveHours = filtered.reduce((s, j) => s + (parseFloat(j.drive_minutes || 0) / 60), 0);

    const beforeHours = parseFloat(optimization?.before_drive_hours || 0);
    const afterHours = parseFloat(optimization?.after_drive_hours || 0);
    const driveSaved = beforeHours - afterHours;

    const cardY = 34;
    const cardH = 22;
    const cardW = (pageW - 28 - 9) / 4; // 4 cards with gaps
    const cards = [
      { label: "Total Jobs", value: totalJobs, color: [30, 64, 175] },           // blue
      { label: "Profitable (GREEN)", value: greenJobs, color: [21, 128, 61] },    // green
      { label: "Needs Review (RED)", value: redJobs, color: [185, 28, 28] },      // red
      { label: "Drive Hours Saved", value: driveSaved > 0 ? driveSaved.toFixed(1) + "h" : "N/A", color: [109, 40, 217] }, // purple
    ];

    cards.forEach((card, i) => {
      const x = 14 + i * (cardW + 3);
      doc.setFillColor(...card.color);
      doc.roundedRect(x, cardY, cardW, cardH, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(String(card.value), x + cardW / 2, cardY + 9, { align: "center" });
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.text(card.label, x + cardW / 2, cardY + 16, { align: "center" });
    });

    // ── Revenue summary ──────────────────────────────────────────────────────
    let curY = cardY + cardH + 8;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Revenue Summary", 14, curY);
    curY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, curY, pageW - 14, curY);
    curY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Revenue (${label}):`, 14, curY);
    doc.setFont("helvetica", "bold");
    doc.text("$" + totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), 90, curY);
    curY += 5;

    doc.setFont("helvetica", "normal");
    doc.text(`Total Drive Time:`, 14, curY);
    doc.setFont("helvetica", "bold");
    doc.text(totalDriveHours.toFixed(1) + " hours", 90, curY);
    curY += 5;

    if (beforeHours > 0) {
      doc.setFont("helvetica", "normal");
      doc.text("Route Optimized Drive Time:", 14, curY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(21, 128, 61);
      doc.text(`${afterHours.toFixed(1)}h (saved ${driveSaved.toFixed(1)}h vs unoptimized)`, 90, curY);
      doc.setTextColor(60, 60, 60);
      curY += 5;
    }

    // ── AI Insights ──────────────────────────────────────────────────────────
    curY += 4;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("AI Insights", 14, curY);
    curY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(14, curY, pageW - 14, curY);
    curY += 5;

    if (insights.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text("No insights available for this period.", 14, curY);
      curY += 6;
    } else {
      insights.slice(0, 6).forEach((ins) => {
        const text = typeof ins === "string" ? ins : (ins.message || ins.text || JSON.stringify(ins));
        const type = typeof ins === "object" ? (ins.type || "info") : "info";
        const iconColor = type === "warning" ? [185, 28, 28] : type === "good" ? [21, 128, 61] : [30, 64, 175];
        doc.setFillColor(...iconColor);
        doc.circle(16, curY - 1.5, 1.5, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(60, 60, 60);
        const lines = doc.splitTextToSize(text, pageW - 34);
        doc.text(lines, 20, curY);
        curY += lines.length * 4.5 + 2;
      });
    }

    // ── Job table ────────────────────────────────────────────────────────────
    curY += 4;
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`Job Breakdown (${totalJobs} jobs)`, 14, curY);
    curY += 3;

    const tableRows = filtered.map((j) => {
      const score = (j.score || j.profitability_score || "—").toUpperCase();
      const scoreColor = score === "GREEN" ? [21, 128, 61] : score === "RED" ? [185, 28, 28] : [180, 130, 0];
      return {
        row: [
          j.job_id || j.id || "—",
          j.customer || j.client || "—",
          j.job_type || j.type || "—",
          j.date || "—",
          "$" + parseFloat(j.revenue || j.job_revenue || 0).toFixed(0),
          score,
        ],
        scoreColor,
      };
    });

    autoTable(doc, {
      startY: curY,
      head: [["Job ID", "Customer", "Type", "Date", "Revenue", "Score"]],
      body: tableRows.map((r) => r.row),
      theme: "grid",
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      didDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 5) {
          const rowData = tableRows[data.row.index];
          if (rowData) {
            doc.setTextColor(...rowData.scoreColor);
            doc.setFont("helvetica", "bold");
            const txt = String(tableRows[data.row.index].row[5]);
            doc.text(txt, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: "center" });
            doc.setTextColor(0, 0, 0);
          }
        }
      },
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 42 },
        2: { cellWidth: 32 },
        3: { cellWidth: 24 },
        4: { cellWidth: 22 },
        5: { cellWidth: 20 },
      },
    });

    // ── Footer ───────────────────────────────────────────────────────────────
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.text(`OptiCal AI — ${label} Report — ${businessName} — Page ${i} of ${pageCount}`, pageW / 2, 277, { align: "center" });
    }

    return doc;
  }

  async function handleExport(period) {
    setLoading(period);
    try {
      const doc = buildPDF(period);
      const label = period === "weekly" ? "Weekly" : "Monthly";
      const dateStr = new Date().toISOString().slice(0, 10);
      doc.save(`OptiCal_${label}_Report_${dateStr}.pdf`);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <button
        onClick={() => handleExport("weekly")}
        disabled={loading !== null}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: loading === "weekly" ? "#4b5563" : "#1e40af",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: loading !== null ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {loading === "weekly" ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Building…
          </>
        ) : (
          <>📄 Weekly Report</>
        )}
      </button>

      <button
        onClick={() => handleExport("monthly")}
        disabled={loading !== null}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          padding: "8px 14px",
          background: loading === "monthly" ? "#4b5563" : "#6d28d9",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "13px",
          fontWeight: 600,
          cursor: loading !== null ? "not-allowed" : "pointer",
          transition: "background 0.15s",
        }}
      >
        {loading === "monthly" ? (
          <>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Building…
          </>
        ) : (
          <>📊 Monthly Report</>
        )}
      </button>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
