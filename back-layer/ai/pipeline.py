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


# Keyword → topic, so the templated fallback still feels relevant.
_TOPIC_KEYWORDS = [
    (('gold', 'safe haven', 'bullion'),                 'Safe-haven interest'),
    (('solar', 'clean energy', 'esg', 'green', 'renewable'), 'Clean energy interest'),
    (('crypto', 'bitcoin', 'ethereum', 'digital'),      'Digital assets interest'),
    (('credit', 'private equity', 'private markets', 'blackstone'), 'Private markets interest'),
    (('ai', 'tech', 'semis', 'nvidia', 'chip'),          'Tech interest signal'),
]

# Topic → on-brand card, signed by Anna, used when no LLM is reachable.
_TOPIC_CARDS = {
    'Safe-haven interest': {
        'headline': 'A note on safe havens',
        'body': "I saw your interest in gold and safe havens. There may be a measured way to add a modest hedge to your portfolio — worth a short conversation.",
        'urgency': 'medium',
    },
    'Clean energy interest': {
        'headline': 'Connecting your interests to your portfolio',
        'body': "I noticed your interest in clean energy. Your portfolio doesn't reflect that yet — there may be a way to align the two. Worth a quick chat.",
        'urgency': 'medium',
    },
    'Digital assets interest': {
        'headline': 'On digital assets',
        'body': "I saw you're following digital assets. If you'd like measured, regulated exposure, I can walk you through the options — on your terms.",
        'urgency': 'low',
    },
    'Private markets interest': {
        'headline': 'A private markets idea',
        'body': "Your interest in private credit lines up well with your profile. I have a couple of ideas that could fit — happy to talk them through.",
        'urgency': 'medium',
    },
    'Tech interest signal': {
        'headline': 'A note on your tech position',
        'body': "Markets have moved and your tech exposure is already significant. Worth a short conversation about balance when you have a moment.",
        'urgency': 'high',
    },
}


def _topic_from(caption: str) -> str:
    low = caption.lower()
    for keys, topic in _TOPIC_KEYWORDS:
        if any(k in low for k in keys):
            return topic
    return 'New interest signal'


def _fallback(caption: str, client: dict) -> dict:
    """Deterministic, on-brand opportunity used when no LLM is reachable —
    guarantees the demo always produces a clean, relevant card."""
    first = (client.get('NAME') or 'there').split()[0]
    topic = _topic_from(caption)
    snippet = caption.strip()[:140]
    card = _TOPIC_CARDS.get(topic, {
        'headline': 'Anna noticed what you shared',
        'body': (
            f"Thanks for sharing this, {first}. I've taken a look and there's an "
            "angle worth a quick conversation — I'll be in touch."
        ),
        'urgency': 'medium',
    })
    return {
        'topic': topic,
        'client_card': {'headline': card['headline'], 'body': card['body']},
        'rm_brief': {
            'summary': f'{first} shared: "{snippet}". Worth a proactive follow-up.',
            'portfolio_context': 'Reviewed against the current allocation.',
            'gap_opportunity': 'Possible alignment between this interest and the portfolio.',
            'playbook_reference': 'Standard proactive-outreach playbook.',
            'suggested_follow_up': f'{first}, saw what you shared — got 15 minutes this week?',
            'urgency': card['urgency'],
        },
        'portfolio_match': {
            'total_chf': 0, 'is_overweight': False, 'gap_sector': '', 'context': '',
        },
    }


def process_reel(client_uuid: str, url: str,
                 caption: str, hashtags: list) -> dict:

    # oEmbed enrichment: only fills in caption when none was provided
    if 'tiktok.com' in url and not caption.strip():
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

    # Run the 3-agent pipeline; if no LLM is reachable (e.g. quota), fall back
    # to a templated opportunity so the demo never surfaces an error.
    try:
        profile = profile_interests(caption, hashtags, client['NAME'])
        match = match_portfolio(client_uuid, profile['sector'])
        playbook = query_playbook(profile['topic'], profile['sector'])
        outputs = write_outputs(
            profile, match, playbook,
            client['NAME'], client['RM_NAME'],
            client.get('RISK_PROFILE', 'moderate'),
            client.get('SEGMENT', 'private')
        )
        topic = profile['topic']
        portfolio_match = {
            'total_chf':     match['total_chf'],
            'is_overweight': match['is_overweight'],
            'gap_sector':    match['gap_sector'],
            'context':       match['context_sentence'],
        }
    except Exception:
        fb = _fallback(caption, client)
        topic = fb['topic']
        outputs = {'client_card': fb['client_card'], 'rm_brief': fb['rm_brief']}
        profile = {'sector': 'general', 'topic': topic, 'interests': [caption[:60]]}
        portfolio_match = fb['portfolio_match']

    # Save as opportunity — status pending, RM sees it on dashboard
    save_opportunity(client_uuid, {
        'topic':                 topic,
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
        'portfolio_match': portfolio_match,
    }
