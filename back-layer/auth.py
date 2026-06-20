import os, jwt
from flask import request, jsonify, g
from functools import wraps

JWT_SECRET = "l8jpXfHRZt1GaknUMG5KbWVrw162D5kbZxQphrwrURoRkHsHJ54AB1QT1hS7cLaNckVQFvNiU6K3qZhxVFZSuAlNCbFJf4ZTFXpbzbzoxnlMt1JIv50jwtyXcgOr5iHuew2q0RaoAydnFCmDFjwv5t8W6ck6GgCErdckbCtKVZ49totXoGUju9KBFLm2388up8pQjY1KWGJvrthylfyCBeHMbtWFpLEGHYdzzX44CsVBeWDrRLYXtUAAxeMzeqpH7DNXNVAQ9P24txdKDRO5lvFuUj9BCMAN4zg9lIR6SxhM8S3fWPAAeZMLBU4ykgcsIwOYWpSllxs3ZwPNk1KAcmS6PtdlO6qmZI2DPe2t2RlLJWgu3l205PAgZYVycbVn4JLJW4xHwhPhwRzByMwLiH9zuVKgD09Du9SMvCQiTrG9zHQzixGam3GhJN8xVwYFG5go8Pi2oMVmEXhGhp4EbBnRH1CZq5B1S3xs1PJ5G2mOps5kMPQMnUOz94tTNOvE"

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("auth_token")
        if not token:
            return jsonify({"status": "error", "message": "Authentication required"}), 401
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            g.user = payload
        except jwt.ExpiredSignatureError:
            return jsonify({"status": "error", "message": "Token expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"status": "error", "message": "Invalid token"}), 401
        return f(*args, **kwargs)
    return decorated
