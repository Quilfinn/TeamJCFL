from flask import Flask, jsonify, Response, request, g
from flask_cors import CORS
import logging, random, string, os, hashlib
import jwt
import datetime
from db import create_connection, close_connection
from auth import login_required, JWT_SECRET

logger = logging.getLogger("backend-app-logger")
frontend_url = os.getenv("FRONTEND_URL")

app = Flask(__name__)
CORS(app, support_credentials=True, resources={r"/*": {"origins": [frontend_url]}})

base_path = "/api/v1/"

def generate_sha256(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def generate_uuid():
    segments = [8, 8, 8, 8]
    return ''.join(''.join(random.choices(string.ascii_lowercase + string.digits, k=length)) for length in segments)

def create_tables():
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS Users ("
        "UUID VARCHAR(255) NOT NULL, USERNAME VARCHAR(255) UNIQUE NOT NULL, "
        "FIRSTNAME VARCHAR(255) NOT NULL, LASTNAME VARCHAR(255) NOT NULL, "
        "EMAIL VARCHAR(255) UNIQUE NOT NULL, PASSWORD VARCHAR(4000) NOT NULL, "
        "ACCOUNT_TYPE VARCHAR(255), CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP, "
        "EMAIL_CODE VARCHAR(255))"
    )
    connection.commit()
    close_connection(connection)

@app.route("/", methods=["GET", "POST"])
def main_path():
    return Response(status=200)

@app.route(base_path, methods=["GET", "POST"])
def base_path_route():
    return Response(status=200)

@app.route(base_path + "health")
def health_route():
    connection = None
    try:
        connection = create_connection()
        if not connection:
            return Response(status=500)
        connection.cursor()
        return Response(status=200)
    except Exception:
        return Response(status=500)
    finally:
        if connection:
            close_connection(connection)

@app.route(base_path + "users/create", methods=["POST"])
def users_create_route():
    data = request.json

    connection = create_connection()
    cursor = connection.cursor()

    username = data.get("username")
    firstname = data.get("firstname")
    lastname = data.get("lastname")
    email = data.get("email")
    password = generate_sha256(data.get("password"))
    account_type = "CLIENT"
        
    line = (generate_uuid(), username, firstname, lastname, email, password)

    query = "INSERT INTO Users (UUID, USERNAME, FIRSTNAME, LASTNAME, EMAIL, PASSWORD) VALUES (%s, %s, %s, %s, %s, %s)"

    try:
        cursor.execute(query, line)
        connection.commit()
        close_connection(connection)
        return jsonify({"status": "user_created_successfully"}), 201
    except Exception as e:
        errno = getattr(e, 'errno', None)
        if errno == 1062:
            return jsonify({"status_message": "The username or email already exists. Please choose a different."}), 400
        return jsonify({"status_message": "There was an error in the data processing."}), 500

@app.route(base_path + "users/login", methods=["POST"])
def users_login_route():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({
            "status": "error",
            "message": "Username and password are required"
        }), 400

    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        query = """
            SELECT UUID, USERNAME, PASSWORD, ACCOUNT_TYPE, EMAIL
            FROM Users
            WHERE USERNAME = %s
        """

        cursor.execute(query, (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({
                "status": "error",
                "message": "Invalid credentials"
            }), 401

        hashed_input = generate_sha256(password)

        if hashed_input != user["PASSWORD"]:
            return jsonify({
                "status": "error",
                "message": "Invalid credentials"
            }), 401

        token = jwt.encode(
            {
                "uuid": user["UUID"],
                "username": user["USERNAME"],
                "account_type": user["ACCOUNT_TYPE"],
                "email": user["EMAIL"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
            },
            JWT_SECRET,
            algorithm="HS256"
        )

        response = jsonify({
            "status": "success"
        })

        response.set_cookie(
            "auth_token",
            token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=60 * 60 * 24 * 7
        )

        return response

    except Exception as e:
        logger.error(f"Login error: {e}")
        return jsonify({
            "status": "error",
            "message": "Internal server error"
        }), 500

    finally:
        close_connection(connection)

@app.route(base_path + "users/logout", methods=["POST"])
@login_required
def users_logout_route():
    response = jsonify({
        "status": "success"
    })

    response.delete_cookie("auth_token")

    return response, 200

# @app.route(base_path + "/auth/check", methods=["GET"])
# @login_required
# def auth_check():
#     return jsonify({
#         "authenticated": True,
#         "user": g.user["username"]
#     })

# ── RM Radar AI layer ──────────────────────────────
from db import init_ai_tables
from routes.signals import signals_bp
from routes.clients import clients_bp
from routes.opportunities import opportunities_bp

app.register_blueprint(signals_bp)
app.register_blueprint(clients_bp)
app.register_blueprint(opportunities_bp)
# ───────────────────────────────────────────────────

if __name__ == '__main__':
    create_tables()
    init_ai_tables()
    app.run(host="0.0.0.0", port=8484, threaded=True)