import os
import uuid
from werkzeug.utils import secure_filename
from config import Config

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp", "gif"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_image(file_storage):
    """
    Saves an uploaded image with a unique filename in Config.UPLOAD_FOLDER.
    Returns:
        str: relative filename or None
    """
    if not file_storage or file_storage.filename == "":
        return None

    if not allowed_file(file_storage.filename):
        return None

    ext = file_storage.filename.rsplit(".", 1)[1].lower()
    unique_name = f"issue_{uuid.uuid4().hex[:10]}.{ext}"
    os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
    file_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
    file_storage.save(file_path)
    
    return unique_name
