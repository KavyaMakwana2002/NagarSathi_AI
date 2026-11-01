from flask import Blueprint, jsonify
from database import get_db_connection

analytics_bp = Blueprint("analytics", __name__, url_prefix="/api/admin")

@analytics_bp.route("/stats", methods=["GET"])
def get_admin_stats():
    """
    Returns high-level KPI metrics for the Municipal Admin Dashboard:
    - Total complaints count
    - Breakdown by status (Pending, In Progress, Resolved)
    - High priority count
    - Duplicate tickets prevented
    - Category-wise breakdown
    - Ward/Area-wise breakdown
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Total and status counts
    cursor.execute("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN priority = 'High' AND status != 'Resolved' THEN 1 ELSE 0 END) as urgent,
            SUM(CASE WHEN is_duplicate = 1 THEN 1 ELSE 0 END) as duplicates_prevented
        FROM complaints
    """)
    totals = dict(cursor.fetchone())

    # Category breakdown
    cursor.execute("""
        SELECT category, COUNT(*) as count 
        FROM complaints 
        GROUP BY category 
        ORDER BY count DESC
    """)
    categories = [dict(r) for r in cursor.fetchall()]

    # Ward / Area breakdown
    cursor.execute("""
        SELECT area, COUNT(*) as count,
               SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_count
        FROM complaints 
        GROUP BY area 
        ORDER BY count DESC 
        LIMIT 10
    """)
    areas = [dict(r) for r in cursor.fetchall()]

    # Recent activity
    cursor.execute("""
        SELECT complaint_id, name, area, category, priority, status, created_at
        FROM complaints
        ORDER BY created_at DESC
        LIMIT 6
    """)
    recent = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return jsonify({
        "success": True,
        "metrics": {
            "total": totals.get("total") or 0,
            "pending": totals.get("pending") or 0,
            "in_progress": totals.get("in_progress") or 0,
            "resolved": totals.get("resolved") or 0,
            "urgent": totals.get("urgent") or 0,
            "duplicates_prevented": totals.get("duplicates_prevented") or 0,
            "resolution_rate": round(((totals.get("resolved") or 0) / (totals.get("total") or 1)) * 100, 1)
        },
        "by_category": categories,
        "by_area": areas,
        "recent_complaints": recent
    })
