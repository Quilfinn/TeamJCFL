from flask import Blueprint, jsonify
from auth import login_required
from db import create_connection, close_connection

clients_bp = Blueprint('clients', __name__, url_prefix='/api/v1/clients')

@clients_bp.route('/<client_uuid>', methods=['GET'])
@login_required
def get_client_route(client_uuid):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM Clients WHERE UUID = %s', (client_uuid,))
    client = cursor.fetchone()
    cursor.execute(
        'SELECT * FROM Portfolios WHERE CLIENT_UUID = %s', (client_uuid,)
    )
    portfolio = cursor.fetchall()
    close_connection(connection)
    if not client:
        return jsonify({'error': 'Client not found'}), 404
    return jsonify({'client': client, 'portfolio': portfolio}), 200

@clients_bp.route('/<client_uuid>/opportunities', methods=['GET'])
@login_required
def get_client_opportunities(client_uuid):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        """SELECT * FROM Opportunities
           WHERE CLIENT_UUID = %s
           ORDER BY CREATED_AT DESC""",
        (client_uuid,)
    )
    opps = cursor.fetchall()
    close_connection(connection)
    return jsonify({'opportunities': opps}), 200

@clients_bp.route('/list', methods=['GET'])
@login_required
def list_clients():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM Clients ORDER BY CREATED_AT DESC')
    clients = cursor.fetchall()
    close_connection(connection)
    return jsonify({'clients': clients}), 200
