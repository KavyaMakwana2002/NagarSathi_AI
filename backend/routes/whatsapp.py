from flask import Blueprint, request, jsonify
import uuid
import re
from datetime import datetime
from database import get_db_connection
from models import complaint_to_dict
from services.ai_service import analyze_complaint_with_gemini, verify_civic_image_with_vision
from services.duplicate_service import find_duplicate_complaint
from services.image_service import save_uploaded_image
from routes.complaints import resolve_coordinates

whatsapp_bp = Blueprint("whatsapp", __name__, url_prefix="/api/whatsapp")

# Predefined quick conversational keywords
GREETINGS_GU = ["નમસ્તે", "હેલો", "હાય", "કેમ છો", "પ્રણામ", "સુપ્રભાત", "hello", "hi", "hey", "namaste", "help", "મદદ"]

@whatsapp_bp.route("/message", methods=["POST"])
def handle_whatsapp_message():
    """
    Simulates WhatsApp conversational bot / handles incoming Webhook.
    Analyzes message in Gujarati or English and registers civic complaints automatically.
    """
    try:
        data = request.get_json() or {}
        sender = data.get("sender", "9876543210").strip()
        sender_name = data.get("sender_name", "Citizen").strip()
        text = data.get("text", "").strip()
        area = data.get("area", "Navrangpura (Ward 7)").strip()
        photo_name = data.get("photo", None)
        msg_type = data.get("type", "text")  # 'text', 'image', 'location', 'voice'

        if not text and not photo_name:
            return jsonify({
                "success": False,
                "bot_reply": "કૃપા કરીને સમસ્યાનું વર્ણન અથવા ફોટો મોકલો. (Please send issue description or photo.)"
            }), 400

        text_lower = text.lower()

        # Check for simple greeting
        if any(g == text_lower or text_lower.startswith(g + " ") for g in GREETINGS_GU):
            return jsonify({
                "success": True,
                "action": "GREETING",
                "bot_reply": (
                    "🙏 *નમસ્તે! હું NagarSathi AI Civic Bot છું.*\n\n"
                    "હું તમારા વિસ્તારની નાગરિક સમસ્યાઓ મ્યુનિસિપલ કોર્પોરેશન સુધી પહોંચાડવામાં મદદ કરું છું.\n\n"
                    "તમે નીચેની કોઈપણ સમસ્યા લખી શકો છો અથવા ફોટો મોકલી શકો છો:\n"
                    "🛣️ રસ્તાના ખાડા (Road & Potholes)\n"
                    "🗑️ કચરો અને ગંદકી (Garbage & Sanitation)\n"
                    "🚰 પીવાનું પાણી અને લીકેજ (Water Supply)\n"
                    "💡 બંધ સ્ટ્રીટ લાઈટ (Street Lights)\n"
                    "🕳️ ખુલ્લી ગટર કે મેનહોલ (Drainage & Sewage)\n\n"
                    "👉 *તમારી સમસ્યા વિસ્તારના નામ સાથે લખો (દા.ત. 'નવરંગપુરા મેઈન રોડ પર મોટો ખાડો છે')*"
                )
            })

        # Process Civic Complaint via Gemini AI
        ai_res = analyze_complaint_with_gemini(text)
        category = ai_res.get("category", "Other Civic Issue")
        priority = ai_res.get("priority", "Medium")
        original_lang = ai_res.get("original_language", "gu")
        translated_text = ai_res.get("translated_text", text)
        confidence = ai_res.get("confidence", 0.92)
        reasoning = ai_res.get("reasoning", "Analyzed via WhatsApp Civic AI.")

        # Vision check if photo was sent
        vision_tags = "WhatsApp Civic Submission"
        vision_verified = 1
        if photo_name:
            v_res = verify_civic_image_with_vision(photo_name, category)
            vision_verified = 1 if v_res.get("vision_verified", True) else 0
            vision_tags = v_res.get("tags", vision_tags)

        # Extract Ward if mentioned in text, else fallback
        for ward in ["Navrangpura", "Satellite", "Vastrapur", "Maninagar", "Paldi", "Bopal", "Sabarmati", "Prahlad Nagar", "Naroda"]:
            if ward.lower() in text_lower:
                area = f"{ward} (Ward Area)"
                break

        lat, lng = resolve_coordinates(area)
        is_dup, parent_id, _ = find_duplicate_complaint(area, category, text)

        ticket_id = "NS-WA" + uuid.uuid4().hex[:4].upper()
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
            ticket_id, sender_name, sender, area, category, text,
            original_lang, translated_text, photo_name, priority,
            confidence, reasoning, "Pending", 1 if is_dup else 0,
            parent_id, 1, lat, lng,
            "WhatsApp", vision_verified, vision_tags, now_str, now_str
        ))
        conn.commit()
        conn.close()

        # Priority emoji
        pri_badge = "🔴 તાત્કાલિક (High)" if priority == "High" else "🟡 સામાન્ય (Medium)" if priority == "Medium" else "🟢 સામાન્ય (Low)"

        dup_notice = f"\n\nℹ️ *નોંધ:* તમારા વિસ્તારમાં આ સમસ્યા પહેલાથી નોંધાયેલી છે (#{parent_id}). અમે તમારી ફરિયાદ જોડીને તેનું વજન વધાર્યું છે!" if is_dup else ""

        bot_reply = (
            f"✅ *તમારી ફરિયાદ સફળતાપૂર્વક નોંધાઈ ગઈ છે!*\n\n"
            f"📋 *ફરિયાદ ID:* `{ticket_id}`\n"
            f"📍 *વિસ્તાર:* {area}\n"
            f"📂 *વિભાગ:* {category}\n"
            f"⚡ *પ્રાયોરિટી:* {pri_badge}\n"
            f"🤖 *AI એનાલિસિસ:* {reasoning}\n"
            f"{dup_notice}\n\n"
            f"🔍 *લાઈવ સ્ટેટસ ટ્રેક કરો:* /track/{ticket_id}\n\n"
            f"NagarSathi AI ટીમ તમારા વિસ્તારમાં ઝડપથી નિરાકરણ લાવવા પ્રયત્નશીલ છે. આભાર! 🇮🇳"
        )

        return jsonify({
            "success": True,
            "action": "TICKET_CREATED",
            "bot_reply": bot_reply,
            "complaint_id": ticket_id,
            "category": category,
            "priority": priority,
            "area": area
        })

    except Exception as e:
        print("[WhatsApp Route Error]:", e)
        return jsonify({"success": False, "error": str(e)}), 500
