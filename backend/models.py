from database import get_db_connection

def complaint_to_dict(row):
    """Converts a sqlite3.Row object of a complaint to a serializable dictionary."""
    if not row:
        return None
    return {
        "id": row["id"],
        "complaint_id": row["complaint_id"],
        "name": row["name"],
        "mobile": row["mobile"],
        "area": row["area"],
        "category": row["category"],
        "description": row["description"],
        "original_language": row["original_language"],
        "translated_text": row["translated_text"],
        "photo": row["photo"],
        "priority": row["priority"],
        "ai_confidence": row["ai_confidence"],
        "ai_reasoning": row["ai_reasoning"],
        "status": row["status"],
        "is_duplicate": bool(row["is_duplicate"]),
        "duplicate_parent_id": row["duplicate_parent_id"],
        "upvotes_count": row["upvotes_count"],
        "latitude": row["latitude"] if "latitude" in row.keys() else None,
        "longitude": row["longitude"] if "longitude" in row.keys() else None,
        "resolved_photo": row["resolved_photo"] if "resolved_photo" in row.keys() else None,
        "resolved_notes": row["resolved_notes"] if "resolved_notes" in row.keys() else None,
        "resolved_at": row["resolved_at"] if "resolved_at" in row.keys() else None,
        "source": row["source"] if "source" in row.keys() else "Web",
        "vision_verified": bool(row["vision_verified"]) if "vision_verified" in row.keys() and row["vision_verified"] is not None else True,
        "vision_tags": row["vision_tags"] if "vision_tags" in row.keys() else None,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

def admin_to_dict(row):
    """Converts a sqlite3.Row object of an admin to a safe dictionary without password."""
    if not row:
        return None
    return {
        "id": row["id"],
        "username": row["username"],
        "name": row["name"],
        "role": row["role"],
        "department": row["department"],
        "created_at": row["created_at"]
    }
