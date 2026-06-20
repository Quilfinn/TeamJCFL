from flask import Blueprint, jsonify, g
from auth import login_required
from db import create_connection, close_connection

opportunities_bp = Blueprint('opportunities', __name__,
                              url_prefix='/api/v1/opportunities')

@opportunities_bp.route('/pending', methods=['GET'])
@login_required
def get_pending():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        """SELECT o.*, c.NAME as CLIENT_NAME, c.AVATAR_INITIAL
           FROM Opportunities o
           JOIN Clients c ON o.CLIENT_UUID = c.UUID
           WHERE o.STATUS = 'pending'
           ORDER BY
             CASE o.URGENCY
               WHEN 'high'   THEN 1
               WHEN 'medium' THEN 2
               ELSE 3
             END,
             o.CREATED_AT DESC"""
    )
    opps = cursor.fetchall()
    close_connection(connection)
    return jsonify({'opportunities': opps}), 200

@opportunities_bp.route('/all', methods=['GET'])
@login_required
def get_all():
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        """SELECT o.*, c.NAME as CLIENT_NAME, c.AVATAR_INITIAL
           FROM Opportunities o
           JOIN Clients c ON o.CLIENT_UUID = c.UUID
           ORDER BY o.CREATED_AT DESC"""
    )
    opps = cursor.fetchall()
    close_connection(connection)
    return jsonify({'opportunities': opps}), 200

@opportunities_bp.route('/<int:opp_id>/send', methods=['POST'])
@login_required
def send_opportunity(opp_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Opportunities SET STATUS='sent' WHERE ID=%s", (opp_id,)
    )
    cursor.execute(
        """INSERT INTO RM_Actions (OPPORTUNITY_ID, RM_UUID, ACTION)
           VALUES (%s, %s, 'send')""",
        (opp_id, g.user['uuid'])
    )
    connection.commit()
    close_connection(connection)
    return jsonify({'status': 'sent', 'opportunity_id': opp_id}), 200

@opportunities_bp.route('/<int:opp_id>/dismiss', methods=['POST'])
@login_required
def dismiss_opportunity(opp_id):
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute(
        "UPDATE Opportunities SET STATUS='dismissed' WHERE ID=%s", (opp_id,)
    )
    cursor.execute(
        """INSERT INTO RM_Actions (OPPORTUNITY_ID, RM_UUID, ACTION)
           VALUES (%s, %s, 'dismiss')""",
        (opp_id, g.user['uuid'])
    )
    connection.commit()
    close_connection(connection)
    return jsonify({'status': 'dismissed', 'opportunity_id': opp_id}), 200

@opportunities_bp.route('/<int:opp_id>', methods=['GET'])
@login_required
def get_opportunity(opp_id):
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        """SELECT o.*, c.NAME as CLIENT_NAME, c.AVATAR_INITIAL,
                  c.RISK_PROFILE, c.SEGMENT
           FROM Opportunities o
           JOIN Clients c ON o.CLIENT_UUID = c.UUID
           WHERE o.ID = %s""",
        (opp_id,)
    )
    opp = cursor.fetchone()
    close_connection(connection)
    if not opp:
        return jsonify({'error': 'Opportunity not found'}), 404
    return jsonify({'opportunity': opp}), 200
