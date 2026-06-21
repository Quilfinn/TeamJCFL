from flask import Blueprint, request, jsonify
from auth import login_required
from ai.pipeline import process_reel
from ai.llm import ask_llm

signals_bp = Blueprint('signals', __name__, url_prefix='/api/v1/signals')


@signals_bp.route('/ask', methods=['POST'])
@login_required
def ask_route():
    data = request.json or {}
    question = (data.get('question') or '').strip()
    context  = (data.get('context') or '').strip()
    if not question:
        return jsonify({'error': 'question is required'}), 400

    system = (
        "You are Signal AI, a calm, precise assistant inside a Julius Baer "
        "private-banking app. Answer the client's question in 2-3 short "
        "sentences, plain language, no hype. If it touches investments, keep it "
        "balanced and suggest discussing with their relationship manager."
    )
    user = f"What the client is looking at: {context}\n\nClient's question: {question}"
    try:
        answer = ask_llm(system, user).strip()
    except Exception:
        answer = "I couldn't reach the assistant just now — your RM will follow up on this."
    return jsonify({'answer': answer}), 200

@signals_bp.route('/reel', methods=['POST'])
@login_required
def reel_route():
    data = request.json
    client_uuid = data.get('client_uuid')
    url         = data.get('url', '')
    caption     = data.get('caption', '')
    hashtags    = data.get('hashtags', [])

    if not client_uuid:
        return jsonify({'error': 'client_uuid is required'}), 400
    if not url and not caption:
        return jsonify({'error': 'url or caption is required'}), 400

    try:
        result = process_reel(client_uuid, url, caption, hashtags)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
