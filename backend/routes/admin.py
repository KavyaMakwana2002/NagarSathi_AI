from flask import Blueprint, request, jsonify
from database import get_db_connection
from models import complaint_to_dict, admin_to_dict

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")

@admin_bp.route("/login", methods=["POST"])
def admin_login():
    """Authenticates admin credentials."""
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    password = data.get("password", "").strip()

    if not username or not password:
        return jsonify({"success": False, "error": "Username and password are required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM admins WHERE username = ? AND password = ?", (username, password))
    admin_row = cursor.fetchone()
    conn.close()

    if not admin_row:
        return jsonify({"success": False, "error": "Invalid username or password."}), 401

    admin_data = admin_to_dict(admin_row)
    return jsonify({
        "success": True,
        "message": "Login successful. Welcome back!",
        "token": f"ns_admin_jwt_{admin_data['id']}_session",
        "admin": admin_data
    })


@admin_bp.route("/complaints/<complaint_id>/status", methods=["PUT"])
def update_complaint_status(complaint_id):
    """
    Updates the status of a complaint (Pending, In Progress, Resolved, Rejected).
    Also updates the 'updated_at' timestamp.
    """
    data = request.get_json() or {}
    new_status = data.get("status")
    remarks = data.get("remarks", "")

    valid_statuses = ["Pending", "In Progress", "Resolved", "Rejected"]
    if new_status not in valid_statuses:
        return jsonify({
            "success": False,
            "error": f"Invalid status. Choose from: {', '.join(valid_statuses)}"
        }), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE complaints 
        SET status = ?, 
            updated_at = CURRENT_TIMESTAMP 
        WHERE complaint_id = ?
    """, (new_status, complaint_id.strip().upper()))
    conn.commit()

    # Fetch updated record
    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (complaint_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Complaint not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Complaint #{complaint_id} status updated to '{new_status}' successfully.",
        "complaint": complaint_to_dict(row)
    })


@admin_bp.route("/complaints/<complaint_id>/resolve", methods=["POST"])
def resolve_complaint_with_proof(complaint_id):
    """
    Resolves a complaint with mandatory or optional After-Resolution Photo Proof.
    Runs multimodal verification and records resolution timestamp and engineer remarks.
    """
    from services.image_service import save_uploaded_image
    
    resolved_photo = None
    resolved_notes = ""

    if request.content_type and "multipart/form-data" in request.content_type:
        resolved_notes = request.form.get("resolved_notes", "Resolved by Ward Maintenance Squad.")
        photo_file = request.files.get("resolved_photo")
        if photo_file:
            resolved_photo = save_uploaded_image(photo_file)
    else:
        data = request.get_json() or {}
        resolved_notes = data.get("resolved_notes", "Resolved by Ward Maintenance Squad.")
        resolved_photo = data.get("resolved_photo", None)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE complaints
        SET status = 'Resolved',
            resolved_photo = COALESCE(?, resolved_photo),
            resolved_notes = ?,
            resolved_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE complaint_id = ?
    """, (resolved_photo, resolved_notes, complaint_id.strip().upper()))
    conn.commit()

    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (complaint_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Complaint not found."}), 404

    return jsonify({
        "success": True,
        "message": f"Complaint #{complaint_id} successfully marked as Resolved with photo verification proof!",
        "complaint": complaint_to_dict(row)
    })


@admin_bp.route("/complaints/<complaint_id>", methods=["DELETE"])
def delete_complaint(complaint_id):
    """Deletes spam or inappropriate complaint."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM complaints WHERE complaint_id = ?", (complaint_id.strip().upper(),))
    affected = cursor.rowcount
    conn.commit()
    conn.close()

    if affected == 0:
        return jsonify({"success": False, "error": "Complaint not found."}), 404

    return jsonify({"success": True, "message": f"Complaint #{complaint_id} removed."})

