from flask import Blueprint, request, jsonify
from database import get_db_connection
from models import complaint_to_dict

citizen_bp = Blueprint("citizen", __name__, url_prefix="/api/citizen")

@citizen_bp.route("/register", methods=["POST"])
def citizen_register():
    data = request.get_json() or {}
    name = data.get("name", "").strip()
    mobile = data.get("mobile", "").strip()
    area = data.get("area", "Navrangpura (Ward 7)").strip()
    password = data.get("password", "123456").strip()

    if not name or not mobile:
        return jsonify({"success": False, "error": "Name and Mobile number are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if mobile exists
    cursor.execute("SELECT * FROM citizens WHERE mobile = ?", (mobile,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"success": False, "error": "This mobile number is already registered. Please login."}), 400

    cursor.execute("""
        INSERT INTO citizens (name, mobile, area, password)
        VALUES (?, ?, ?, ?)
    """, (name, mobile, area, password))
    conn.commit()

    cursor.execute("SELECT id, name, mobile, area, created_at FROM citizens WHERE mobile = ?", (mobile,))
    user = dict(cursor.fetchone())
    conn.close()

    return jsonify({
        "success": True,
        "message": "Account created successfully! Welcome to NagarSathi AI.",
        "token": f"ns_citizen_token_{user['id']}",
        "citizen": user
    }), 201


@citizen_bp.route("/login", methods=["POST"])
def citizen_login():
    data = request.get_json() or {}
    mobile = data.get("mobile", "").strip()
    password = data.get("password", "").strip()

    if not mobile:
        return jsonify({"success": False, "error": "Mobile number is required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM citizens WHERE mobile = ?", (mobile,))
    row = cursor.fetchone()

    # If demo or quick access with password match or default
    if not row:
        # Auto-register if quick access demo or return not found
        cursor.execute("""
            INSERT INTO citizens (name, mobile, area, password)
            VALUES (?, ?, ?, ?)
        """, ("Citizen User", mobile, "Navrangpura (Ward 7)", password or "123456"))
        conn.commit()
        cursor.execute("SELECT id, name, mobile, area, created_at FROM citizens WHERE mobile = ?", (mobile,))
        row = cursor.fetchone()

    user = {
        "id": row["id"],
        "name": row["name"],
        "mobile": row["mobile"],
        "area": row["area"],
        "created_at": row["created_at"]
    }
    conn.close()

    return jsonify({
        "success": True,
        "message": "Citizen login successful!",
        "token": f"ns_citizen_token_{user['id']}",
        "citizen": user
    })


@citizen_bp.route("/complaints/<mobile>", methods=["GET"])
def get_citizen_complaints(mobile):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM complaints 
        WHERE mobile = ? 
        ORDER BY created_at DESC
    """, (mobile.strip(),))
    rows = cursor.fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "count": len(rows),
        "complaints": [complaint_to_dict(r) for r in rows]
    })
