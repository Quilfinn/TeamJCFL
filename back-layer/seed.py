import sys, json
sys.path.insert(0, '.')
from app import generate_uuid, generate_sha256
from db import create_connection, close_connection, init_ai_tables
import chromadb

def seed():
    init_ai_tables()
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)

    # ── Check if already seeded ──────────────────────
    cursor.execute("SELECT COUNT(*) as count FROM Users WHERE USERNAME = 'anna.keller'")
    if cursor.fetchone()['count'] > 0:
        print("Already seeded. Skipping.")
        close_connection(connection)
        return

    # ── RM User ───────────────────────────────────────
    rm_uuid = generate_uuid()
    cursor.execute(
        "INSERT INTO Users (UUID,USERNAME,FIRSTNAME,LASTNAME,EMAIL,PASSWORD,ACCOUNT_TYPE) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (rm_uuid, 'anna.keller', 'Anna', 'Keller',
         'anna@juliusbaer.demo', generate_sha256('demo1234'), 'RM')
    )

    # ── Client User ───────────────────────────────────
    felix_user_uuid = generate_uuid()
    cursor.execute(
        "INSERT INTO Users (UUID,USERNAME,FIRSTNAME,LASTNAME,EMAIL,PASSWORD,ACCOUNT_TYPE) VALUES (%s,%s,%s,%s,%s,%s,%s)",
        (felix_user_uuid, 'leo.ackermann', 'Leo', 'Ackermann',
         'leo@demo.com', generate_sha256('demo1234'), 'CLIENT')
    )

    # ── Client Profile ────────────────────────────────
    felix_uuid = generate_uuid()
    cursor.execute(
        """INSERT INTO Clients
           (UUID,USER_UUID,NAME,AGE,SEGMENT,RISK_PROFILE,RM_UUID,RM_NAME,AVATAR_INITIAL)
           VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (felix_uuid, felix_user_uuid, 'Leo Ackermann', 34,
         'founder', 'aggressive', rm_uuid, 'Anna Keller', 'L')
    )

    # ── Portfolio ─────────────────────────────────────
    portfolio = [
        ('US Tech Equities',  2560000.00, 40.00),
        ('Private Equity',    1280000.00, 20.00),
        ('Cash',              1600000.00, 25.00),
        ('Bonds',              640000.00, 10.00),
        ('Commodities',        320000.00,  5.00),
    ]
    for asset_class, value, weight in portfolio:
        cursor.execute(
            "INSERT INTO Portfolios (CLIENT_UUID,ASSET_CLASS,VALUE_CHF,WEIGHT_PCT) VALUES (%s,%s,%s,%s)",
            (felix_uuid, asset_class, value, weight)
        )

    # ── Pre-seeded Opportunities ──────────────────────
    opportunities = [
        {
            'topic': 'Tech concentration risk',
            'headline': "Your tech position caught Anna's eye",
            'body': "Your portfolio is 40% US tech and markets have been volatile this week. Anna thinks this is a good moment for a conversation.",
            'rm_brief': "Leo holds 40% in US tech equities. Nasdaq dropped 8% this week. High concentration risk. Recommend diversification discussion — timing is good.",
            'follow_up': "Leo, I have been keeping an eye on your tech position given the recent volatility — got 15 minutes this week?",
            'urgency': 'high'
        },
        {
            'topic': 'Idle cash opportunity',
            'headline': "Anna noticed your cash has been sitting",
            'body': "You have CHF 1.6M in cash from your recent exit sitting idle. Anna has some thoughts on putting it to work — on your terms.",
            'rm_brief': "CHF 1.6M post-exit cash idle for 6 weeks. Leo is aggressive risk profile. Good moment to discuss structured products or private equity top-up.",
            'follow_up': "Leo, that cash from your exit is ready to work harder — want me to walk you through a couple of options?",
            'urgency': 'high'
        },
        {
            'topic': 'Clean energy interest signal',
            'headline': "Anna connected your interests to your wealth",
            'body': "Based on what you have been exploring lately Anna sees an interesting angle around sustainable investing that fits your portfolio.",
            'rm_brief': "Leo shared clean energy content. Zero ESG exposure in current portfolio despite clear interest signal. Recommend ESG mandate conversation.",
            'follow_up': "I saw you have been interested in clean energy — did you know your portfolio has no ESG exposure yet? Worth a chat.",
            'urgency': 'medium'
        },
    ]
    for opp in opportunities:
        cursor.execute(
            """INSERT INTO Opportunities
               (CLIENT_UUID,TOPIC,CLIENT_CARD_HEADLINE,CLIENT_CARD_BODY,
                RM_BRIEF,RM_FOLLOW_UP,URGENCY,STATUS)
               VALUES (%s,%s,%s,%s,%s,%s,%s,'pending')""",
            (felix_uuid, opp['topic'], opp['headline'], opp['body'],
             opp['rm_brief'], opp['follow_up'], opp['urgency'])
        )

    connection.commit()
    close_connection(connection)
    print("Users, clients, portfolio, opportunities seeded.")

    # ── ChromaDB Playbook ─────────────────────────────
    import os
    chroma_path = os.getenv('CHROMA_PATH', './chroma')
    client = chromadb.PersistentClient(path=chroma_path)
    collection = client.get_or_create_collection('jb_playbook')

    if collection.count() == 0:
        collection.add(
            ids=['case_1', 'case_2', 'case_3'],
            documents=[
                "Client shared ESG reel on solar energy. RM offered sustainable bond mandate. Client allocated CHF 400k to green bonds within two weeks.",
                "Client shared S&P 500 analysis video. RM scheduled quarterly portfolio review. Client increased equity allocation by CHF 200k.",
                "Client shared crypto content. RM explained volatility versus risk profile. Client agreed to maximum 3 percent digital asset allocation."
            ]
        )
        print("ChromaDB playbook seeded.")
    else:
        print("ChromaDB already has data. Skipping.")

if __name__ == '__main__':
    seed()
    print("Seed complete.")
    print("")
    print("Demo credentials:")
    print("  RM login    — username: anna.keller  password: demo1234")
    print("  Client login — username: leo.ackermann  password: demo1234")
