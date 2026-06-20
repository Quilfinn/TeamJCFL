import mysql.connector
import logging

logger = logging.getLogger("backend-app-logger")

def create_connection():
    try:
        connection = mysql.connector.connect(
            host='back-layer-db-1', database='data',
            user='root', password='qVNDLwAUbpJS7DP9N8RSfhdnCM2DBpW5'
        )
        if connection.is_connected():
            return connection
    except Exception as e:
        logger.critical(f"Error creating MySQL connection: {e}")
        return None

def close_connection(connection):
    if connection and connection.is_connected():
        connection.close()

def init_ai_tables():
    connection = create_connection()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Clients (
            UUID VARCHAR(255) PRIMARY KEY,
            USER_UUID VARCHAR(255),
            NAME VARCHAR(255),
            AGE INT,
            SEGMENT VARCHAR(50),
            RISK_PROFILE VARCHAR(50),
            RM_UUID VARCHAR(255),
            RM_NAME VARCHAR(255),
            AVATAR_INITIAL CHAR(1),
            CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Portfolios (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            CLIENT_UUID VARCHAR(255),
            ASSET_CLASS VARCHAR(255),
            VALUE_CHF DECIMAL(15,2),
            WEIGHT_PCT DECIMAL(5,2)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Signals (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            CLIENT_UUID VARCHAR(255),
            TYPE VARCHAR(50),
            PAYLOAD JSON,
            FIRED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Opportunities (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            CLIENT_UUID VARCHAR(255),
            SIGNAL_ID INT,
            TOPIC VARCHAR(255),
            CLIENT_CARD_HEADLINE VARCHAR(255),
            CLIENT_CARD_BODY TEXT,
            RM_BRIEF TEXT,
            RM_FOLLOW_UP TEXT,
            URGENCY VARCHAR(20) DEFAULT 'medium',
            STATUS VARCHAR(20) DEFAULT 'pending',
            CREATED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS RM_Actions (
            ID INT AUTO_INCREMENT PRIMARY KEY,
            OPPORTUNITY_ID INT,
            RM_UUID VARCHAR(255),
            ACTION VARCHAR(20),
            ACTED_AT DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    connection.commit()
    close_connection(connection)
