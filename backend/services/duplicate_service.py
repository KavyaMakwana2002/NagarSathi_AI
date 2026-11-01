from database import get_db_connection

def find_duplicate_complaint(area, category, description, threshold=0.35):
    """
    Checks if a complaint with the same category in the same area already exists.
    Returns:
        tuple (is_duplicate: bool, parent_complaint_id: str or None, parent_title: str or None)
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Look for active (non-resolved) complaints in the same area & category
    cursor.execute("""
        SELECT complaint_id, description, upvotes_count 
        FROM complaints 
        WHERE area = ? AND category = ? AND status != 'Resolved' AND is_duplicate = 0
        ORDER BY created_at DESC
        LIMIT 5
    """, (area, category))

    existing = cursor.fetchall()
    
    if not existing:
        conn.close()
        return False, None, None

    # Simple word overlap similarity
    new_words = set(description.lower().split())

    for row in existing:
        old_desc = row["description"]
        old_words = set(old_desc.lower().split())
        
        # Calculate Jaccard similarity or word intersection
        intersection = new_words.intersection(old_words)
        union = new_words.union(old_words)
        
        similarity = len(intersection) / len(union) if union else 0
        
        # If words overlap (3+ words in same ward & category) or similarity >= 35%
        if similarity >= threshold or len(intersection) >= 3:
            parent_id = row["complaint_id"]
            
            # Increment upvotes on parent complaint
            cursor.execute("""
                UPDATE complaints 
                SET upvotes_count = upvotes_count + 1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE complaint_id = ?
            """, (parent_id,))
            conn.commit()
            conn.close()
            
            return True, parent_id, old_desc

    conn.close()
    return False, None, None
