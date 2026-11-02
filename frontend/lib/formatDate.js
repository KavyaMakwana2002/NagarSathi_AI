/**
 * Formats ISO or SQLite datetime strings to real-time display
 * e.g. "2026-11-02 12:33:44" -> "02 Nov 2026, 12:33 PM"
 */
export function formatRealDateTime(dateStr) {
  if (!dateStr) {
    const now = new Date();
    return now.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  try {
    // Handle "YYYY-MM-DD HH:MM:SS" SQLite format
    const cleanStr = dateStr.replace(" ", "T");
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) {
      return dateStr;
    }
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatRealDateOnly(dateStr) {
  if (!dateStr) {
    return new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  try {
    const cleanStr = dateStr.replace(" ", "T");
    const d = new Date(cleanStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 10);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  } catch (e) {
    return dateStr.slice(0, 10);
  }
}
