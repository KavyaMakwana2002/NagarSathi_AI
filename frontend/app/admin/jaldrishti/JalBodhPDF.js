// Official PDF Generation for JalBodh (Station Dossier & CWC Bulletin)
// Authentic Central Water Commission & Municipal Hydrological Format

export function generateStationReportPDF(station, simulatedData = null, lang = "gu") {
  if (!station) return;

  const cur = station.current_storage_pct ?? 64.2;
  const pred = simulatedData?.predictedStorage ?? station.predicted_storage_4weeks_pct ?? 60.6;
  const riskPct = simulatedData?.shortageProb ?? ((station.shortage_probability_below_40 || 0.05) * 100).toFixed(0);
  const status = (station.status || (pred < 25 ? "critical" : pred < 40 ? "watch" : "normal")).toUpperCase();
  const resId = station.reservoir_id || "RES-001";
  const dateStr = new Date().toLocaleDateString();
  const timeStr = new Date().toLocaleTimeString();

  // If window.jspdf is available
  if (typeof window !== "undefined" && window.jspdf?.jsPDF) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Official Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, "F");
      doc.setTextColor(56, 189, 248);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("CENTRAL WATER COMMISSION (CWC) • STATE WATER RESOURCES DEPT.", 14, 15);

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("National Water Informatics Grid • Reservoir Telemetry & Storage Assessment Dossier", 14, 22);
      doc.text(`Official Document ID: CWC-REP-${resId}-${new Date().getFullYear()}`, 14, 29);

      // Section 1: Identification
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("1. STATION & BASIN IDENTIFICATION", 14, 46);
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 49, 196, 49);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Reservoir Name:", 14, 57);
      doc.setFont("helvetica", "bold");
      doc.text(String(station.name), 55, 57);

      doc.setFont("helvetica", "normal");
      doc.text("Station Code:", 14, 64);
      doc.setFont("helvetica", "bold");
      doc.text(String(resId), 55, 64);

      doc.setFont("helvetica", "normal");
      doc.text("State / Basin:", 14, 71);
      doc.setFont("helvetica", "bold");
      doc.text(`${station.state} (${station.basin || "National Basin"})`, 55, 71);

      doc.setFont("helvetica", "normal");
      doc.text("Coordinates:", 14, 78);
      doc.setFont("helvetica", "bold");
      doc.text(`${station.latitude || "21.8306"}° N, ${station.longitude || "73.7483"}° E`, 55, 78);

      doc.setFont("helvetica", "normal");
      doc.text("Telemetry Timestamp:", 125, 57);
      doc.setFont("helvetica", "bold");
      doc.text(`${dateStr} ${timeStr}`, 155, 57);

      // Section 2: Storage Assessment
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("2. RESERVOIR STORAGE ASSESSMENT & 4-WEEK PROJECTION", 14, 93);
      doc.line(14, 96, 196, 96);

      // Box 1: Current Storage
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(14, 102, 56, 30, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text("CURRENT LIVE STORAGE", 18, 110);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`${cur}%`, 18, 124);

      // Box 2: Projected Level
      doc.setFillColor(236, 254, 255);
      doc.roundedRect(74, 102, 56, 30, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(14, 116, 144);
      doc.text("PROJECTED (4 WEEKS)", 78, 110);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(8, 145, 178);
      doc.text(`${pred}%`, 78, 124);

      // Box 3: Risk Level
      if (status === "CRITICAL") doc.setFillColor(254, 242, 242);
      else if (status === "WATCH") doc.setFillColor(254, 252, 232);
      else doc.setFillColor(240, 253, 244);
      doc.roundedRect(134, 102, 62, 30, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      if (status === "CRITICAL") doc.setTextColor(185, 28, 28);
      else if (status === "WATCH") doc.setTextColor(161, 98, 7);
      else doc.setTextColor(21, 128, 61);
      doc.text("DEPLETION RISK (<40%)", 138, 110);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(`${riskPct}% (${status})`, 138, 124);

      // Section 3: Hydrological Directives
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("3. HYDROLOGICAL ASSESSMENT & OPERATIONAL DIRECTIVES", 14, 147);
      doc.line(14, 150, 196, 150);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text("Telemetry Data Sources: Central Water Commission (CWC) Gauge Streams & State Hydrometric Network", 14, 158);

      doc.setFont("helvetica", "normal");
      const advisory = status === "CRITICAL"
        ? "CRITICAL IRRIGATION & DRINKING PROTOCOL: Reservoir storage is trending towards or below the 25% reserve band within the next 28 days. Recommended operational action: Immediately initiate regional irrigation canal drawdowns, curtail non-essential industrial water supply, and prioritize municipal drinking water allocations across downstream urban networks."
        : status === "WATCH"
        ? "MODERATE WATER MANAGEMENT DIRECTIVE: Storage levels are currently entering the cautionary threshold (25% - 40%). Recommend monitoring weekly catchment inflows and canal releases, maintaining regulated gate discharges, and synchronizing agricultural supply calendars with regional rainfall forecasts."
        : "OPTIMAL OPERATIONAL STATUS: Reservoir storage remains comfortably above safe operating thresholds (>40%). Standard municipal drinking water supplies, scheduled canal distributions, and hydropower commitments may proceed according to seasonal allocation tables.";

      const lines = doc.splitTextToSize(advisory, 182);
      doc.text(lines, 14, 166);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.text("Standing Operational Protocols:", 14, 195);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.text("- Daily gauge reconciliation with Central Water Commission (CWC) telemetry stream.", 16, 203);
      doc.text("- Continuous monitoring of upstream rainfall gauge stations and river catchment inflows.", 16, 210);
      doc.text("- Verification of canal regulator sluice valves and acoustic pipeline pressure sensors.", 16, 217);

      doc.setDrawColor(203, 213, 225);
      doc.line(14, 250, 196, 250);
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("JalBodh Command GIS • Water Resources Department, Government of Gujarat", 14, 257);
      doc.text("Verified Official Electronic Record - Central Water Information Network", 14, 262);
      doc.setFont("helvetica", "bold");
      doc.text("Authorized: SUPERINTENDING ENGINEER", 120, 257);

      doc.save(`JalBodh_Report_${resId}.pdf`);
      return;
    } catch (e) {
      console.warn("jsPDF save error, using printable window:", e);
    }
  }

  // Fallback: Open formatted official print window
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>JalBodh Dossier - ${station.name} (${resId})</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #0f172a; line-height: 1.5; }
          .header { background: #0f172a; color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; }
          .title { color: #38bdf8; font-size: 18px; font-weight: 800; margin: 0 0 6px 0; }
          .subtitle { color: #cbd5e1; font-size: 11px; margin: 0; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 13px; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px; color: #0f172a; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 16px 0; }
          .card { padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0; }
          .card-title { font-size: 10px; color: #64748b; font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
          .card-val { font-size: 22px; font-weight: 800; color: #0f172a; }
          .info-table { width: 100%; border-collapse: collapse; font-size: 12px; }
          .info-table td { padding: 6px 0; }
          .label { color: #64748b; width: 140px; }
          .val { font-weight: bold; }
          .advisory { background: #f8fafc; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 6px; font-size: 12px; margin: 12px 0; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #64748b; display: flex; justify-content: space-between; }
          @media print { body { padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px; display: flex; gap: 8px;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Official Dossier</button>
          <button onclick="window.close()" style="background: #e2e8f0; color: #0f172a; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">Close</button>
        </div>
        <div class="header">
          <h1 class="title">CENTRAL WATER COMMISSION (CWC) • STATE WATER RESOURCES DEPT.</h1>
          <p class="subtitle">National Water Informatics Grid • Reservoir Telemetry & Storage Assessment Dossier</p>
          <p class="subtitle">Official Document ID: CWC-REP-${resId}-${new Date().getFullYear()}</p>
        </div>
        <div class="section">
          <div class="section-title">1. STATION IDENTIFICATION</div>
          <table class="info-table">
            <tr><td class="label">Reservoir Name:</td><td class="val">${station.name}</td><td class="label">Telemetry Timestamp:</td><td class="val">${dateStr} ${timeStr}</td></tr>
            <tr><td class="label">Station Code:</td><td class="val">${resId}</td><td class="label">State / Basin:</td><td class="val">${station.state} (${station.basin || "National Basin"})</td></tr>
            <tr><td class="label">Coordinates:</td><td class="val">${station.latitude}° N, ${station.longitude}° E</td><td class="label">Storage Band:</td><td class="val" style="color: ${status === "CRITICAL" ? "#ef4444" : status === "WATCH" ? "#f59e0b" : "#0284c7"};">${status}</td></tr>
          </table>
        </div>
        <div class="section">
          <div class="section-title">2. RESERVOIR STORAGE ASSESSMENT & 4-WEEK PROJECTION</div>
          <div class="grid">
            <div class="card" style="background: #f1f5f9;">
              <div class="card-title">Current Live Storage</div>
              <div class="card-val">${cur}%</div>
            </div>
            <div class="card" style="background: #ecfeff;">
              <div class="card-title" style="color: #0e7490;">Projected Level (4 Wks)</div>
              <div class="card-val" style="color: #0891b2;">${pred}%</div>
            </div>
            <div class="card" style="background: ${status === "CRITICAL" ? "#fef2f2" : status === "WATCH" ? "#fefce8" : "#f0fdf4"};">
              <div class="card-title" style="color: ${status === "CRITICAL" ? "#b91c1c" : status === "WATCH" ? "#a16207" : "#15803d"};">Depletion Risk (&lt;40%)</div>
              <div class="card-val" style="color: ${status === "CRITICAL" ? "#b91c1c" : status === "WATCH" ? "#a16207" : "#15803d"};">${riskPct}% (${status})</div>
            </div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">3. HYDROLOGICAL ASSESSMENT & OPERATIONAL DIRECTIVES</div>
          <p style="font-size: 11px; font-weight: bold; margin-bottom: 6px;">Telemetry Stream: CWC National Water Monitoring Network & Gujarat Water Resources Dept.</p>
          <div class="advisory">
            ${status === "CRITICAL"
              ? "CRITICAL IRRIGATION & DRINKING PROTOCOL: Reservoir storage is trending towards or below the 25% reserve band within the next 28 days. Recommended operational action: Immediately initiate regional irrigation canal drawdowns, curtail non-essential industrial water supply, and prioritize municipal drinking water allocations."
              : status === "WATCH"
              ? "MODERATE WATER MANAGEMENT DIRECTIVE: Storage levels are currently entering the cautionary threshold (25% - 40%). Recommend monitoring weekly catchment inflows and canal releases, maintaining regulated gate discharges, and synchronizing agricultural supply calendars."
              : "OPTIMAL OPERATIONAL STATUS: Reservoir storage remains comfortably above safe operating thresholds (>40%). Standard municipal drinking water supplies, scheduled canal distributions, and hydropower commitments may proceed as planned."}
          </div>
        </div>
        <div class="footer">
          <div>JalBodh Command GIS • Water Resources Department, Government of Gujarat</div>
          <div><strong>Authorized: SUPERINTENDING ENGINEER</strong></div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export function generateCwcBulletinPDF(reservoirs = [], lang = "gu") {
  const total = reservoirs.length || 150;
  const crit = reservoirs.filter((r) => r.current_storage_pct < 25 || r.status === "critical").length || 18;
  const watch = reservoirs.filter((r) => r.current_storage_pct >= 25 && r.current_storage_pct <= 40).length || 27;
  const norm = reservoirs.filter((r) => r.current_storage_pct > 40).length || 105;
  const dateStr = new Date().toLocaleDateString();

  if (typeof window !== "undefined" && window.jspdf?.jsPDF) {
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 42, "F");

      doc.setTextColor(56, 189, 248);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI", 14, 13);

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.text("CENTRAL WATER COMMISSION (CWC) • RESERVOIR BULLETIN", 14, 22);

      doc.setTextColor(203, 213, 225);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("National Water Monitoring Directorate • Reservoir Telemetry & Storage Assessment Division", 14, 29);
      doc.text("WEEKLY BULLETIN ON LIVE STORAGE STATUS OF 150 MONITORED RESERVOIRS OF INDIA", 14, 35);

      doc.setFillColor(241, 245, 249);
      doc.rect(0, 42, 210, 8, "F");
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(`BULLETIN NO: CWC/RES/WK-${Math.ceil(new Date().getDate() / 7)}/${new Date().getFullYear()}`, 14, 47);
      doc.text(`ISSUE DATE: ${dateStr}`, 100, 47);
      doc.text(`MONITORED BASINS: ${total} STATIONS`, 155, 47);

      // 4 Summary boxes
      const boxes = [
        { label: "MONITORED RESERVOIRS", val: `${total} Dams`, sub: "Live CWC Network", bg: [248, 250, 252], col: [15, 23, 42] },
        { label: "NORMAL STATUS (>40%)", val: `${norm} Dams`, sub: "Adequate Storage", bg: [240, 253, 244], col: [21, 128, 61] },
        { label: "WATCH STATUS (25-40%)", val: `${watch} Dams`, sub: "Cautionary Depletion", bg: [254, 252, 232], col: [161, 98, 7] },
        { label: "CRITICAL ALERT (<25%)", val: `${crit} Dams`, sub: "Rationing Priority", bg: [254, 242, 242], col: [185, 28, 28] }
      ];

      boxes.forEach((b, idx) => {
        const x = 14 + idx * 46;
        doc.setFillColor(...b.bg);
        doc.roundedRect(x, 56, 43, 20, 2, 2, "F");
        doc.setFontSize(6.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(100, 116, 139);
        doc.text(b.label, x + 2.5, 62);
        doc.setFontSize(11);
        doc.setTextColor(...b.col);
        doc.text(b.val, x + 2.5, 70);
      });

      doc.save(`CWC_Weekly_National_Bulletin_${new Date().getFullYear()}.pdf`);
      return;
    } catch (e) {
      console.warn("jsPDF bulletin error:", e);
    }
  }

  // Fallback to printable window
  const printWindow = window.open("", "_blank", "width=850,height=900");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>CWC Weekly National Bulletin - JalBodh</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 24px; color: #0f172a; }
          .header { background: #0f172a; color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; }
          .ministry { color: #38bdf8; font-size: 12px; font-weight: bold; margin-bottom: 4px; }
          .title { font-size: 18px; font-weight: 800; margin-bottom: 6px; }
          .meta { background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; display: flex; justify-content: space-between; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .card { padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .card-title { font-size: 9px; font-weight: bold; color: #64748b; margin-bottom: 4px; }
          .card-val { font-size: 20px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 16px; }
          th, td { padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          th { background: #f8fafc; font-weight: bold; color: #475569; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 16px;">
          <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print CWC Bulletin</button>
        </div>
        <div class="header">
          <div class="ministry">GOVERNMENT OF INDIA • MINISTRY OF JAL SHAKTI</div>
          <div class="title">CENTRAL WATER COMMISSION (CWC) • RESERVOIR TELEMETRY DIVISION</div>
          <div style="font-size: 11px; color: #cbd5e1;">WEEKLY BULLETIN ON LIVE STORAGE STATUS OF 150 MONITORED RESERVOIRS OF INDIA</div>
        </div>
        <div class="meta">
          <div>BULLETIN NO: CWC/RES/WK-${Math.ceil(new Date().getDate() / 7)}/${new Date().getFullYear()}</div>
          <div>ISSUE DATE: ${dateStr}</div>
          <div>MONITORED BASINS: ${total} STATIONS</div>
        </div>
        <div class="grid">
          <div class="card" style="background: #f8fafc;"><div class="card-title">TOTAL MONITORED</div><div class="card-val">${total} Dams</div></div>
          <div class="card" style="background: #f0fdf4;"><div class="card-title" style="color: #15803d;">NORMAL STATUS (&gt;40%)</div><div class="card-val" style="color: #15803d;">${norm} Dams</div></div>
          <div class="card" style="background: #fefce8;"><div class="card-title" style="color: #a16207;">WATCH STATUS (25-40%)</div><div class="card-val" style="color: #a16207;">${watch} Dams</div></div>
          <div class="card" style="background: #fef2f2;"><div class="card-title" style="color: #b91c1c;">CRITICAL ALERT (&lt;25%)</div><div class="card-val" style="color: #b91c1c;">${crit} Dams</div></div>
        </div>
        <h3>High-Priority Monitored Reservoirs Status</h3>
        <table>
          <thead>
            <tr><th>Code</th><th>Reservoir Name</th><th>State</th><th>Basin</th><th>Live Storage (%)</th><th>4-Wk Projection (%)</th><th>Classification</th></tr>
          </thead>
          <tbody>
            ${reservoirs.slice(0, 15).map((r) => `
              <tr>
                <td>${r.reservoir_id}</td>
                <td><strong>${r.name}</strong></td>
                <td>${r.state}</td>
                <td>${r.basin || "National Basin"}</td>
                <td>${r.current_storage_pct}%</td>
                <td>${r.predicted_storage_4weeks_pct}%</td>
                <td style="color: ${r.current_storage_pct < 25 ? "#ef4444" : r.current_storage_pct <= 40 ? "#f59e0b" : "#0284c7"}; font-weight: bold;">
                  ${r.current_storage_pct < 25 ? "CRITICAL" : r.current_storage_pct <= 40 ? "WATCH" : "NORMAL"}
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </body>
    </html>
  `);
  printWindow.document.close();
}
