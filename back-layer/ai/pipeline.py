import json, os
import requests as req
from db import create_connection, close_connection
from ai.agents.profiler import profile_interests
from ai.agents.matcher import match_portfolio
from ai.agents.writer import write_outputs
from ai.rag.playbook import query_playbook


def get_client(client_uuid: str) -> dict:
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute('SELECT * FROM Clients WHERE UUID = %s', (client_uuid,))
    client = cursor.fetchone()
    close_connection(connection)
    return client


def save_opportunity(client_uuid: str, data: dict) -> int:
    connection = create_connection()
    cursor = connection.cursor()
    cursor.execute(
        """INSERT INTO Opportunities
           (CLIENT_UUID, TOPIC, CLIENT_CARD_HEADLINE, CLIENT_CARD_BODY,
            RM_BRIEF, RM_FOLLOW_UP, URGENCY, STATUS)
           VALUES (%s,%s,%s,%s,%s,%s,%s,'pending')""",
        (client_uuid,
         data['topic'],
         data['client_card_headline'],
         data['client_card_body'],
         data['rm_brief'],
         data['rm_follow_up'],
         data['urgency'])
    )
    connection.commit()
    opp_id = cursor.lastrowid
    close_connection(connection)
    return opp_id


def process_reel(client_uuid: str, url: str,
                 caption: str, hashtags: list) -> dict:

    # Try oEmbed enrichment for TikTok URLs
    if 'tiktok.com' in url:
        try:
            r = req.get(
                f'https://www.tiktok.com/oembed?url={url}',
                timeout=5
            )
            data = r.json()
            enriched = data.get('title', '')
            if enriched:
                caption = enriched
        except Exception:
            pass

    # Fetch client first so the profiler can use the real name
    client = get_client(client_uuid)

    # Agent 1 — extract interests and values
    profile = profile_interests(caption, hashtags, client['NAME'])

    # Agent 2 — match against client portfolio
    match = match_portfolio(client_uuid, profile['sector'])

    # Agent 3 — find similar playbook cases via RAG
    playbook = query_playbook(profile['topic'], profile['sector'])
    outputs = write_outputs(
        profile, match, playbook,
        client['NAME'], client['RM_NAME']
    )

    # Save as opportunity — status pending, RM sees it on dashboard
    save_opportunity(client_uuid, {
        'topic':                 profile['topic'],
        'client_card_headline':  outputs['client_card']['headline'],
        'client_card_body':      outputs['client_card']['body'],
        'rm_brief':              json.dumps(outputs['rm_brief']),
        'rm_follow_up':          outputs['rm_brief']['suggested_follow_up'],
        'urgency':               outputs['rm_brief']['urgency']
    })

    return {
        'client_card':    outputs['client_card'],
        'rm_brief':       outputs['rm_brief'],
        'profile':        profile,
        'portfolio_match': {
            'total_chf':     match['total_chf'],
            'is_overweight': match['is_overweight'],
            'gap_sector':    match['gap_sector'],
            'context':       match['context_sentence']
        }
    }
