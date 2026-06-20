from flask import Flask, jsonify, Response, request, send_from_directory, redirect, g
from flask_cors import CORS, cross_origin
import mysql.connector, logging, random, string, os, sys, json, hashlib
from mysql.connector import errors
import jwt
import datetime
from werkzeug.security import check_password_hash
from functools import wraps

logger = logging.getLogger("backend-app-logger")
frontend_url = os.getenv("FRONTEND_URL")

app = Flask(__name__)
CORS(app, support_credentials=True, resources={r"/*": {"origins": [frontend_url]}})

base_path = "/api/v1/"

JWT_SECRET = "l8jpXfHRZt1GaknUMG5KbWVrw162D5kbZxQphrwrURoRkHsHJ54AB1QT1hS7cLaNckVQFvNiU6K3qZhxVFZSuAlNCbFJf4ZTFXpbzbzoxnlMt1JIv50jwtyXcgOr5iHuew2q0RaoAydnFCmDFjwv5t8W6ck6GgCErdckbCtKVZ49totXoGUju9KBFLm2388up8pQjY1KWGJvrthylfyCBeHMbtWFpLEGHYdzzX44CsVBeWDrRLYXtUAAxeMzeqpH7DNXNVAQ9P24txdKDRO5lvFuUj9BCMAN4zg9lIR6SxhM8S3fWPAAeZMLBU4ykgcsIwOYWpSllxs3ZwPNk1KAcmS6PtdlO6qmZI2DPe2t2RlLJWgu3l205PAgZYVycbVn4JLJW4xHwhPhwRzByMwLiH9zuVKgD09Du9SMvCQiTrG9zHQzixGam3GhJN8xVwYFG5go8Pi2oMVmEXhGhp4EbBnRH1CZq5B1S3xs1PJ5G2mOps5kMPQMnUOz94tTNOvE"

def generate_sha256(password):
    hashed_password = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return hashed_password

def generate_uuid():
    segments = [8, 8, 8, 8]

    return ''.join(''.join(random.choices(string.ascii_lowercase + string.digits, k=length)) for length in segments)

def create_connection():
    try:
        connection = mysql.connector.connect(host='back-layer-db-1', database='data', user='root', password='qVNDLwAUbpJS7DP9N8RSfhdnCM2DBpW5')

        if connection.is_connected():
            logger.debug("Connected to MySQL")
            return connection
    except errors as e:
        logger.critical(f"Error creating MySQL connection: {e}")
        return None

def close_connection(connection):
    if connection.is_connected():
        connection.close()
        logger.debug("Connection to MySQL closed")

def create_tables():
    connection = create_connection()
    cursor = connection.cursor()
    query_table_users = "CREATE TABLE IF NOT EXISTS Users (UUID VARCHAR(255) NOT NULL, USERNAME VARCHAR(255) UNIQUE NOT NULL, FIRSTNAME VARCHAR(255) NOT NULL, LASTNAME VARCHAR(255) NOT NULL, EMAIL VARCHAR(255) UNIQUE NOT NULL, PASSWORD VARCHAR(4000) NOT NULL, CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP, EMAIL_CODE VARCHAR(255))"
    cursor.execute(query_table_users)
    connection.commit()
    close_connection(connection)

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.cookies.get("auth_token")

        if not token:
            return jsonify({
                "status": "error",
                "message": "Authentication required"
            }), 401

        try:
            payload = jwt.decode(
                token,
                JWT_SECRET,
                algorithms=["HS256"]
            )

            g.user = payload

        except jwt.ExpiredSignatureError:
            return jsonify({
                "status": "error",
                "message": "Token expired"
            }), 401

        except jwt.InvalidTokenError:
            return jsonify({
                "status": "error",
                "message": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated

@app.route("/", methods=["GET", "POST"])
def main_path():
    return Response(status=200)

@app.route(base_path, methods=["GET", "POST"])
def base_path_route():
    return Response(status=200)

@app.route(base_path + "health")
def health_route():
    try:
        connection = create_connection()
        cursor = connection.cursor()
        return Response(status=200)
        close_connection(connection)
    except errors:
        return Response(status=500)

@app.route(base_path + "/users/create", methods=["POST"])
def users_create_route():
    data = request.json

    connection = create_connection()
    cursor = connection.cursor()

    username = data["username"]
    firstname = data["firstname"]
    lastname = data["lastname"]
    email = data["email"]
    password = generate_sha256(data["password"])
        
    line = (generate_uuid(), username, firstname, lastname, email, password)

    query = "INSERT INTO Users (UUID, USERNAME, FIRSTNAME, LASTNAME, EMAIL, PASSWORD) VALUES (%s, %s, %s, %s, %s, %s)"

    try:
        cursor.execute(query, line)
        connection.commit()
        close_connection(connection)
        return jsonify({"status": "user_created_successfully"}), 201
    except errors.IntegrityError as e:
        if e.errno == 1062:
            return jsonify({"status_message": "The username or email already exists. Please choose a different."}), 400
        else:
            return jsonify({"status_message": "There was an error in the data processing."}), 500

    return jsonify({"status": "An unexpectend error happend!"}), 500

@app.route(base_path + "/users/login", methods=["POST"])
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
            SELECT UUID, USERNAME, PASSWORD
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


@app.route(base_path + "/auth/check", methods=["GET"])
@login_required
def auth_check():
    return jsonify({
        "authenticated": True,
        "user": g.user["username"]
    })

if __name__ == '__main__':
    create_tables()
    app.run(host="0.0.0.0", port=8484, threaded=True)