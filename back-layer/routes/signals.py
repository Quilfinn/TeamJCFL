from flask import Blueprint, request, jsonify
from auth import login_required
from ai.pipeline import process_reel

signals_bp = Blueprint('signals', __name__, url_prefix='/api/v1/signals')

@signals_bp.route('/reel', methods=['POST'])
@login_required
def reel_route():
    data = request.json
    client_uuid = data.get('client_uuid')
    url         = data.get('url', '')
    caption     = data.get('caption', '')
    hashtags    = data.get('hashtags', [])

    if not client_uuid or not caption:
        return jsonify({'error': 'client_uuid and caption are required'}), 400

    try:
        result = process_reel(client_uuid, url, caption, hashtags)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
