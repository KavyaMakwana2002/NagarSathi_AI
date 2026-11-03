from flask import Blueprint, request, jsonify, send_from_directory
import uuid
import os
import random
from datetime import datetime
from config import Config
from database import get_db_connection
from models import complaint_to_dict
from services.ai_service import analyze_complaint_with_gemini, verify_civic_image_with_vision
from services.duplicate_service import find_duplicate_complaint
from services.image_service import save_uploaded_image

complaints_bp = Blueprint("complaints", __name__, url_prefix="/api")

WARD_COORDINATES = {
    "Navrangpura": (23.0365, 72.5611),
    "Satellite": (23.0322, 72.5186),
    "Vastrapur": (23.0350, 72.5293),
    "Maninagar": (22.9978, 72.6033),
    "Paldi": (23.0130, 72.5625),
    "Bopal": (23.0354, 72.4646),
    "Sabarmati": (23.0782, 72.5850),
    "Prahlad Nagar": (23.0125, 72.5080),
    "Naroda": (23.0689, 72.6582),
    "Chandkheda": (23.1118, 72.5936)
}

def resolve_coordinates(area_name, user_lat=None, user_lng=None):
    """Resolves latitude and longitude from area name with slight geographic jitter."""
    if user_lat and user_lng:
        try:
            return float(user_lat), float(user_lng)
        except (ValueError, TypeError):
            pass

    for ward, (base_lat, base_lng) in WARD_COORDINATES.items():
        if ward.lower() in (area_name or "").lower():
            # Small realistic jitter +- 0.003 (~300m)
            jitter_lat = base_lat + random.uniform(-0.003, 0.003)
            jitter_lng = base_lng + random.uniform(-0.003, 0.003)
            return round(jitter_lat, 5), round(jitter_lng, 5)

    # Default fallback: Central Ahmedabad (Ellis Bridge / Ashram Road)
    return round(23.0225 + random.uniform(-0.004, 0.004), 5), round(72.5714 + random.uniform(-0.004, 0.004), 5)

@complaints_bp.route("/complaints", methods=["POST"])
def submit_complaint():
    """
    Submits a new civic complaint.
    Supports JSON or multipart/form-data (for photo upload).
    Triggers Gemini AI Analysis, Gemini Vision verification & Duplicate Detection automatically.
    """
    try:
        # Check if form data or JSON
        source = "Web"
        req_lat = None
        req_lng = None

        if request.content_type and "multipart/form-data" in request.content_type:
            name = request.form.get("name", "Anonymous Citizen")
            mobile = request.form.get("mobile", "")
            area = request.form.get("area", "Navrangpura (Ward 7)")
            user_category = request.form.get("category", "").strip()
            description = request.form.get("description", "").strip()
            source = request.form.get("source", "Web")
            req_lat = request.form.get("latitude")
            req_lng = request.form.get("longitude")
            photo_file = request.files.get("photo")
            photo_name = save_uploaded_image(photo_file) if photo_file else None
        else:
            data = request.get_json() or {}
            name = data.get("name", "Anonymous Citizen")
            mobile = data.get("mobile", "")
            area = data.get("area", "Navrangpura (Ward 7)")
            user_category = data.get("category", "").strip()
            description = data.get("description", "").strip()
            source = data.get("source", "Web")
            req_lat = data.get("latitude")
            req_lng = data.get("longitude")
            photo_name = data.get("photo", None)

        if not description:
            return jsonify({"success": False, "error": "Description is required."}), 400

        # Step 1: Run Gemini AI Analysis
        ai_res = analyze_complaint_with_gemini(description)
        
        # Use AI classified category if user didn't choose one or chose 'General'
        final_category = user_category if user_category and user_category != "General" else ai_res["category"]
        priority = ai_res.get("priority", "Medium")
        original_lang = ai_res.get("original_language", "gu")
        translated_text = ai_res.get("translated_text", description)
        ai_confidence = ai_res.get("confidence", 0.88)
        ai_reasoning = ai_res.get("reasoning", "")

        # Step 2: Gemini Vision AI Verification if photo attached
        vision_verified = 1
        vision_tags = "Civic Report"
        vision_details = None
        if photo_name:
            vision_res = verify_civic_image_with_vision(photo_name, final_category)
            vision_verified = 1 if vision_res.get("vision_verified", True) else 0
            vision_tags = vision_res.get("tags", "Civic Report")
            vision_details = vision_res

        # Step 3: Resolve Geo-Coordinates
        lat, lng = resolve_coordinates(area, req_lat, req_lng)

        # Step 4: Check for Duplicate Complaints in same Area
        is_dup, parent_id, parent_desc = find_duplicate_complaint(area, final_category, description)

        # Generate unique Complaint Ticket ID
        prefix = "NS-WA" if source == "WhatsApp" else "NS-"
        complaint_id = prefix + uuid.uuid4().hex[:5].upper()

        # Step 5: Insert into SQLite Database with exact current local timestamp
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO complaints (
                complaint_id, name, mobile, area, category, description,
                original_language, translated_text, photo, priority,
                ai_confidence, ai_reasoning, status, is_duplicate,
                duplicate_parent_id, upvotes_count, latitude, longitude,
                source, vision_verified, vision_tags, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            complaint_id, name, mobile, area, final_category, description,
            original_lang, translated_text, photo_name, priority,
            ai_confidence, ai_reasoning, "Pending", 1 if is_dup else 0,
            parent_id, 1, lat, lng,
            source, vision_verified, vision_tags, now_str, now_str
        ))
        conn.commit()
        conn.close()

        return jsonify({
            "success": True,
            "message": "Complaint submitted and analyzed successfully by NagarSathi AI!",
            "complaint_id": complaint_id,
            "ai_analysis": {
                "category": final_category,
                "priority": priority,
                "language": original_lang,
                "translated_text": translated_text,
                "confidence": ai_confidence,
                "reasoning": ai_reasoning
            },
            "vision_verification": vision_details,
            "geo_coordinates": {
                "latitude": lat,
                "longitude": lng
            },
            "duplicate_info": {
                "is_duplicate": is_dup,
                "parent_id": parent_id,
                "note": f"Similar existing issue found: #{parent_id}. We grouped your report and increased its priority!" if is_dup else None
            }
        }), 201

    except Exception as e:
        print("[Complaints Route Error]:", e)
        return jsonify({"success": False, "error": str(e)}), 500


@complaints_bp.route("/complaints/verify-photo", methods=["POST"])
def verify_photo():
    """Real-time photo verification endpoint before submission."""
    try:
        photo_file = request.files.get("photo")
        category = request.form.get("category", "")
        if not photo_file:
            return jsonify({"success": False, "error": "No image file provided."}), 400

        photo_name = save_uploaded_image(photo_file)
        result = verify_civic_image_with_vision(photo_name, category)
        return jsonify({
            "success": True,
            "photo_name": photo_name,
            "verification": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@complaints_bp.route("/complaints/heatmap", methods=["GET"])
def get_heatmap_data():
    """
    Returns geo-located civic complaints with heat weights, category filters, and ward summaries.
    """
    category = request.args.get("category")
    status = request.args.get("status")
    
    query = "SELECT * FROM complaints WHERE latitude IS NOT NULL AND longitude IS NOT NULL"
    params = []
    
    if category and category != "All":
        query += " AND category = ?"
        params.append(category)
    if status and status != "All":
        query += " AND status = ?"
        params.append(status)

    query += " ORDER BY created_at DESC"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    
    # Calculate Ward-wise severity
    ward_counts = {}
    high_priority_count = 0
    resolved_count = 0
    
    points = []
    for r in rows:
        c_dict = complaint_to_dict(r)
        area = c_dict["area"]
        ward_counts[area] = ward_counts.get(area, 0) + 1
        
        # Heat intensity calculation
        intensity = 0.5
        if c_dict["priority"] == "High":
            intensity = 1.0
            high_priority_count += 1
        elif c_dict["priority"] == "Medium":
            intensity = 0.7
        
        if c_dict["status"] == "Resolved":
            intensity = 0.3
            resolved_count += 1

        points.append({
            **c_dict,
            "intensity": intensity
        })

    conn.close()

    return jsonify({
        "success": True,
        "total_spots": len(points),
        "high_priority_spots": high_priority_count,
        "resolved_spots": resolved_count,
        "ward_summary": ward_counts,
        "points": points
    })



@complaints_bp.route("/complaints", methods=["GET"])
def get_complaints():
    """Lists complaints with optional filtering by status, category, area, priority."""
    status = request.args.get("status")
    category = request.args.get("category")
    area = request.args.get("area")
    priority = request.args.get("priority")
    limit = int(request.args.get("limit", 50))

    query = "SELECT * FROM complaints WHERE 1=1"
    params = []

    if status:
        query += " AND status = ?"
        params.append(status)
    if category:
        query += " AND category = ?"
        params.append(category)
    if area:
        query += " AND area = ?"
        params.append(area)
    if priority:
        query += " AND priority = ?"
        params.append(priority)

    query += " ORDER BY CASE priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 ELSE 3 END, created_at DESC LIMIT ?"
    params.append(limit)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()

    return jsonify({
        "success": True,
        "count": len(rows),
        "complaints": [complaint_to_dict(r) for r in rows]
    })


@complaints_bp.route("/complaints/<complaint_id>", methods=["GET"])
def get_complaint_by_id(complaint_id):
    """Fetches details for a single complaint."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (complaint_id.strip().upper(),))
    row = cursor.fetchone()
    conn.close()

    if not row:
        return jsonify({"success": False, "error": "Complaint not found"}), 404

    return jsonify({"success": True, "complaint": complaint_to_dict(row)})


@complaints_bp.route("/track/<query>", methods=["GET"])
def track_complaint(query):
    """Tracks complaints by either Complaint ID (e.g. NS-123456) or 10-digit mobile number."""
    query_clean = query.strip()
    conn = get_db_connection()
    cursor = conn.cursor()

    if query_clean.upper().startswith("NS-"):
        cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (query_clean.upper(),))
    else:
        cursor.execute("SELECT * FROM complaints WHERE mobile = ? ORDER BY created_at DESC", (query_clean,))

    rows = cursor.fetchall()
    conn.close()

    if not rows:
        return jsonify({"success": False, "error": "No records found matching your query."}), 404

    return jsonify({
        "success": True,
        "count": len(rows),
        "complaints": [complaint_to_dict(r) for r in rows]
    })


@complaints_bp.route("/complaints/<complaint_id>", methods=["DELETE"])
def delete_complaint(complaint_id):
    """Deletes a civic complaint ticket."""
    clean_id = complaint_id.strip().upper()
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM complaints WHERE complaint_id = ?", (clean_id,))
    row = cursor.fetchone()
    if not row:
        conn.close()
        return jsonify({"success": False, "error": "Complaint not found."}), 404

    cursor.execute("DELETE FROM complaints WHERE complaint_id = ?", (clean_id,))
    conn.commit()
    conn.close()

    return jsonify({
        "success": True,
        "message": f"Complaint #{clean_id} deleted successfully."
    })


@complaints_bp.route("/uploads/<filename>", methods=["GET"])
def get_uploaded_file(filename):
    """Serves uploaded issue photos."""
    return send_from_directory(Config.UPLOAD_FOLDER, filename)
