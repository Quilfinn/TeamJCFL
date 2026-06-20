# RM Radar — Backend Playbook
# Zero to tested in one document

---

## What this is

RM Radar is a Flask + MySQL + ChromaDB backend that turns social media signals
from private banking clients into structured opportunities for Relationship
Managers. An RM sees a card; the client sees a warm, non-salesy nudge.

**Stack:**
- Flask (Python 3.11), port 8484
- MySQL 5.7, port 3306
- ChromaDB (persistent volume, sentence embeddings)
- LLM: Groq (llama-3.3-70b-versatile) with Ollama/OpenAI fallback
- Auth: JWT in httpOnly cookie

---

## Prerequisites

| Tool | Minimum |
|------|---------|
| Docker + Docker Compose v2 | any recent version |
| Python 3.10+ (host, for running seed outside container) | optional |
| curl | for testing |
| A Groq API key | free at console.groq.com |

---

## STEP 0 — Environment

```bash
cd back-layer

# Copy and fill in your key
cp .env.example .env
```

Edit `.env`:

```
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_your_key_here

# Offline fallback (set LLM_PROVIDER=ollama if wifi dies on stage)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.3

CHROMA_PATH=./chroma
FRONTEND_URL=http://localhost:3000
```

`GROQ_API_KEY` is the only required fill-in. Everything else has working defaults.

---

## STEP 1 — Start the stack

```bash
docker-compose up --build -d
```

Expected — two containers:

```
back-layer-db-1       mysql:5.7    Up (healthy)   0.0.0.0:3306->3306/tcp
back-layer-backend-1  team-jcfl    Up             0.0.0.0:8484->8484/tcp
```

Check with:

```bash
docker ps
```

If backend keeps restarting:

```bash
docker-compose logs backend --tail=30
```

Nuclear restart:

```bash
docker-compose down && docker-compose up --build -d
```

---

## STEP 2 — Seed the default data (Leo Ackermann)

Run once after first `docker-compose up`:

```bash
docker exec $(docker ps -qf "name=back-layer-backend") python seed.py
```

Expected output:

```
Users, clients, portfolio, opportunities seeded.
ChromaDB playbook seeded.
Seed complete.

Demo credentials:
  RM login     — username: anna.keller  password: demo1234
  Client login — username: leo.ackermann  password: demo1234
```

If you see `Already seeded. Skipping.` — data exists, proceed.

To wipe and reseed from scratch:

```bash
docker exec $(docker ps -qf "name=back-layer-backend") python3 -c "
from app import create_connection, close_connection
c = create_connection()
cur = c.cursor()
cur.execute('DELETE FROM RM_Actions')
cur.execute('DELETE FROM Opportunities')
cur.execute('DELETE FROM Signals')
cur.execute('DELETE FROM Portfolios')
cur.execute('DELETE FROM Clients')
cur.execute(\"DELETE FROM Users WHERE USERNAME IN ('anna.keller','leo.ackermann','lucas.bauer')\")
c.commit()
close_connection(c)
print('Wiped.')
"
docker exec $(docker ps -qf "name=back-layer-backend") python seed.py
```

---

## STEP 3 — Seed Lucas Bauer (new money persona)

Lucas is not in `seed.py` — run this once after Leo is seeded:

```bash
docker exec $(docker ps -qf "name=back-layer-backend") python3 -c "
import sys; sys.path.insert(0, '.')
from app import generate_uuid, generate_sha256
from db import create_connection, close_connection

conn = create_connection()
cur = conn.cursor(dictionary=True)

cur.execute(\"SELECT COUNT(*) as c FROM Users WHERE USERNAME = 'lucas.bauer'\")
if cur.fetchone()['c'] > 0:
    print('Lucas already exists')
    cur.execute(\"SELECT UUID FROM Clients WHERE NAME = 'Lucas Bauer'\")
    print('Lucas UUID:', cur.fetchone()['UUID'])
    close_connection(conn)
    exit()

cur.execute(\"SELECT UUID FROM Users WHERE USERNAME = 'anna.keller'\")
rm_uuid = cur.fetchone()['UUID']

lucas_user_uuid = generate_uuid()
cur.execute('INSERT INTO Users (UUID,USERNAME,FIRSTNAME,LASTNAME,EMAIL,PASSWORD,ACCOUNT_TYPE) VALUES (%s,%s,%s,%s,%s,%s,%s)',
    (lucas_user_uuid, 'lucas.bauer', 'Lucas', 'Bauer', 'lucas@newmoney.demo', generate_sha256('demo1234'), 'CLIENT'))

lucas_uuid = generate_uuid()
cur.execute('INSERT INTO Clients (UUID,USER_UUID,NAME,AGE,SEGMENT,RISK_PROFILE,RM_UUID,RM_NAME,AVATAR_INITIAL) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)',
    (lucas_uuid, lucas_user_uuid, 'Lucas Bauer', 29, 'new_money', 'aggressive', rm_uuid, 'Anna Keller', 'L'))

portfolio = [
    ('Cash and Equivalents', 3200000.00, 64.00),
    ('US Tech Equities',      640000.00, 12.80),
    ('Crypto BTC ETH',        480000.00,  9.60),
    ('Real Estate ETFs',      400000.00,  8.00),
    ('Gold',                  280000.00,  5.60),
]
for a, v, w in portfolio:
    cur.execute('INSERT INTO Portfolios (CLIENT_UUID,ASSET_CLASS,VALUE_CHF,WEIGHT_PCT) VALUES (%s,%s,%s,%s)',
        (lucas_uuid, a, v, w))

conn.commit()
close_connection(conn)
print('Lucas Bauer seeded.')
print('Lucas UUID:', lucas_uuid)
"
```

---

## Current Personas

### Anna Keller — Relationship Manager

| Field | Value |
|-------|-------|
| Username | `anna.keller` |
| Password | `demo1234` |
| Role | RM — sees all client opportunities on dashboard |

---

### Leo Ackermann — Founder (existing wealth)

| Field | Value |
|-------|-------|
| Username | `leo.ackermann` |
| Password | `demo1234` |
| Age | 34 |
| Segment | `founder` |
| Risk profile | `aggressive` |
| Total AUM | CHF 6,400,000 |

**Portfolio:**

| Asset class | CHF | Weight |
|-------------|-----|--------|
| US Tech Equities | 2,560,000 | 40% |
| Cash | 1,600,000 | 25% |
| Private Equity | 1,280,000 | 20% |
| Bonds | 640,000 | 10% |
| Commodities | 320,000 | 5% |

Pre-seeded opportunities (3):
- Tech concentration risk — `high` urgency
- Idle cash opportunity — `high` urgency
- Clean energy interest signal — `medium` urgency

---

### Lucas Bauer — New Money (recent exit)

| Field | Value |
|-------|-------|
| Username | `lucas.bauer` |
| Password | `demo1234` |
| Age | 29 |
| Segment | `new_money` |
| Risk profile | `aggressive` |
| Total AUM | CHF 5,000,000 |

**Portfolio:**

| Asset class | CHF | Weight |
|-------------|-----|--------|
| Cash and Equivalents | 3,200,000 | 64% |
| US Tech Equities | 640,000 | 12.8% |
| Crypto BTC/ETH | 480,000 | 9.6% |
| Real Estate ETFs | 400,000 | 8% |
| Gold | 280,000 | 5.6% |

No pre-seeded opportunities — generated live via the reel pipeline.

---

## STEP 4 — Health check

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8484/api/v1/health
```

Expected: `200`

---

## STEP 5 — Login as Anna (RM)

```bash
curl -s -c cookies.txt -X POST http://localhost:8484/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"anna.keller","password":"demo1234"}' | python3 -m json.tool
```

Expected:
```json
{ "status": "success" }
```

Verify cookie was saved:
```bash
grep auth_token cookies.txt
```

All subsequent requests use `-b cookies.txt`.

---

## STEP 6 — List clients

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/clients/list \
  | python3 -m json.tool
```

Expected: array with Leo Ackermann and Lucas Bauer.

Save their UUIDs:

```bash
export FELIX_UUID=$(curl -s -b cookies.txt http://localhost:8484/api/v1/clients/list \
  | python3 -c "import sys,json; clients=json.load(sys.stdin)['clients']; [print(c['UUID']) for c in clients if c['NAME']=='Leo Ackermann']")

export LUCAS_UUID=$(curl -s -b cookies.txt http://localhost:8484/api/v1/clients/list \
  | python3 -c "import sys,json; clients=json.load(sys.stdin)['clients']; [print(c['UUID']) for c in clients if c['NAME']=='Lucas Bauer']")

echo "Leo: $FELIX_UUID"
echo "Lucas: $LUCAS_UUID"
```

---

## STEP 7 — Get a client's portfolio

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/clients/$FELIX_UUID \
  | python3 -m json.tool
```

Expected: `client` object + `portfolio` array with 5 rows.

---

## STEP 8 — RM opportunity dashboard

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/opportunities/pending \
  | python3 -m json.tool
```

Expected: 3 opportunities for Leo (high urgency first), 0 for Lucas until reels are fired.

Get a single opportunity with full RM brief:

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/opportunities/1 \
  | python3 -m json.tool
```

---

## STEP 9 — Send and dismiss opportunities

Send (RM approves, pushes to client):

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/opportunities/1/send \
  | python3 -m json.tool
# Expected: { "status": "sent", "opportunity_id": 1 }
```

Dismiss (RM skips):

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/opportunities/2/dismiss \
  | python3 -m json.tool
# Expected: { "status": "dismissed", "opportunity_id": 2 }
```

Verify pending count dropped:

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/opportunities/pending \
  | python3 -c "import sys,json; print('Pending:', len(json.load(sys.stdin)['opportunities']))"
```

---

## STEP 10 — AI reel pipeline

### How it works

```
POST /api/v1/signals/reel  { client_uuid, url, caption, hashtags }
        │
        ▼
get_client()          ← fetch client name for profiler context
        │
        ▼
[Profiler Agent]      ← LLM: extract topic, sector, values, sentiment,
        │               investment_signal, follow_up_hook (uses client name)
        ▼
[Matcher Agent]       ← DB: find matching portfolio rows by sector keyword,
        │               flag is_overweight (>35%), compute gap_sector
        ▼
[RAG — ChromaDB]      ← find 2 similar past cases from JB playbook
        │
        ▼
[Writer Agent]        ← LLM: write client_card + rm_brief using all above
        │
        ▼
save_opportunity()    ← persist to DB as pending, RM sees on dashboard
        │
        ▼
return full JSON      ← client_card + rm_brief + profile + portfolio_match
```

---

### Leo Ackermann — Reel tests (founder, overweighted in tech)

**Reel A — Clean energy interest:**

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/signals/reel \
  -H "Content-Type: application/json" \
  -d "{
    \"client_uuid\": \"$FELIX_UUID\",
    \"url\": \"\",
    \"caption\": \"The solar energy revolution is accelerating faster than anyone predicted. Clean energy is now cheaper than fossil fuels in most markets.\",
    \"hashtags\": [\"cleanenergy\", \"investing\", \"solar\", \"ESG\", \"sustainability\"]
  }" | python3 -m json.tool
```

What the pipeline does:
- Profiler → sector: `energy`, values: `[sustainability, innovation]`, sentiment: `bullish`
- Matcher → Leo has 5% in Commodities, no clean energy — gap_sector: `energy`
- Writer → client_card connects ESG interest to the portfolio gap, invites conversation

**Reel B — Crypto / Bitcoin hype:**

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/signals/reel \
  -H "Content-Type: application/json" \
  -d "{
    \"client_uuid\": \"$FELIX_UUID\",
    \"url\": \"\",
    \"caption\": \"Bitcoin just broke 100k again and institutions are all in. This is the real adoption cycle.\",
    \"hashtags\": [\"bitcoin\", \"BTC\", \"crypto\", \"100k\", \"investing\"]
  }" | python3 -m json.tool
```

What the pipeline does:
- Profiler → sector: `crypto`, values: `[innovation, speed, status]`, sentiment: `bullish`
- Matcher → Leo has no crypto — gap_sector: `crypto`
- Playbook recalls: "Client agreed to cap digital assets at 3% after risk conversation"
- Writer → frames as a risk/profile conversation, not a buy signal

---

### Lucas Bauer — Reel tests (new money, 64% idle cash)

**Reel A — Bitcoin hype (new money instinct):**

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/signals/reel \
  -H "Content-Type: application/json" \
  -d "{
    \"client_uuid\": \"$LUCAS_UUID\",
    \"url\": \"\",
    \"caption\": \"Bitcoin just broke 100k again and the institutions are all in. BlackRock, Fidelity, everyone is buying. If you are not in crypto right now you are going to regret it.\",
    \"hashtags\": [\"bitcoin\", \"BTC\", \"crypto\", \"100k\", \"blockchain\", \"investing\", \"wealth\"]
  }" | python3 -m json.tool
```

What the pipeline does:
- Profiler → sector: `crypto`, values: `[innovation, speed, status]`, sentiment: `bullish`
- Matcher → Lucas already holds 9.6% in Crypto BTC/ETH — not overweight, but already significant
- Writer → acknowledges existing position, steers toward portfolio balance conversation

**Reel B — Luxury Zurich real estate:**

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/signals/reel \
  -H "Content-Type: application/json" \
  -d "{
    \"client_uuid\": \"$LUCAS_UUID\",
    \"url\": \"\",
    \"caption\": \"I just bought a penthouse in Zurich for 4 million and it was the best financial decision I ever made. Real estate is the only asset that never goes to zero. Your cash is losing value every single day.\",
    \"hashtags\": [\"realestate\", \"property\", \"zurich\", \"penthouse\", \"wealth\", \"investing\"]
  }" | python3 -m json.tool
```

What the pipeline does:
- Profiler → sector: `realestate`, values: `[status, security, legacy]`, sentiment: `bullish`
- Matcher → Lucas has 8% in Real Estate ETFs (passive), no direct property
- Writer → connects the status/legacy values to a direct property conversation

**Reel C — Wealth anxiety / "I almost lost it all" (the pivot signal):**

```bash
curl -s -b cookies.txt -X POST http://localhost:8484/api/v1/signals/reel \
  -H "Content-Type: application/json" \
  -d "{
    \"client_uuid\": \"$LUCAS_UUID\",
    \"url\": \"\",
    \"caption\": \"I made 5 million in my 20s and almost lost it all because I did not know how to protect it. Nobody tells you that the hard part is not making the money. The hard part is keeping it. Taxes inflation bad decisions they will eat your wealth if you have no plan.\",
    \"hashtags\": [\"wealthprotection\", \"newmoney\", \"familyoffice\", \"wealthmanagement\", \"legacy\"]
  }" | python3 -m json.tool
```

What the pipeline does:
- Profiler → sector: `macro`, values: `[security, legacy, family]`, sentiment: `cautious`
- Matcher → Lucas has 64% in cash → `is_overweight: true` (threshold is 35%) — the structural problem surfaces
- Writer → uses the anxiety signal as the opening to address the real problem: CHF 3.2M idle

This is the highest-value signal type: new money expressing preservation anxiety is the moment they are most open to structured advice.

---

## STEP 11 — View all opportunities created

All opportunities across all clients:

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/opportunities/all \
  | python3 -c "
import sys, json
opps = json.load(sys.stdin)['opportunities']
for o in opps:
    print(f\"[{o['URGENCY'].upper()}] #{o['ID']} {o['CLIENT_NAME']} — {o['TOPIC']} ({o['STATUS']})\")
print('Total:', len(opps))
"
```

Per-client view:

```bash
curl -s -b cookies.txt http://localhost:8484/api/v1/clients/$LUCAS_UUID/opportunities \
  | python3 -m json.tool
```

---

## STEP 12 — Client login (Leo or Lucas view)

```bash
curl -s -c felix_cookies.txt -X POST http://localhost:8484/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"leo.ackermann","password":"demo1234"}' | python3 -m json.tool

curl -s -c lucas_cookies.txt -X POST http://localhost:8484/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"lucas.bauer","password":"demo1234"}' | python3 -m json.tool
```

Clients use the same API endpoints as the RM. The frontend differentiates by `ACCOUNT_TYPE` in the JWT payload (`RM` vs `CLIENT`).

---

## STEP 13 — Auth protection

No cookie:

```bash
curl -s http://localhost:8484/api/v1/opportunities/pending | python3 -m json.tool
# Expected: { "status": "error", "message": "Authentication required" }
```

Wrong password:

```bash
curl -s -X POST http://localhost:8484/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"anna.keller","password":"wrong"}' | python3 -m json.tool
# Expected: { "status": "error", "message": "Invalid credentials" }
```

---

## STEP 14 — Offline LLM fallback (stage safety)

If Groq is unreachable, switch to local Ollama without touching the backend:

```bash
# 1. Install: https://ollama.com
# 2. Pull the model:
ollama pull llama3.3
# 3. Start:
ollama serve
```

Then in `.env` change `LLM_PROVIDER=ollama`, rebuild:

```bash
docker-compose up --build -d
```

Test that Ollama responds:

```bash
LLM_PROVIDER=ollama python3 -c "
from ai.llm import call_llm
print(call_llm('You are a test.', 'Say hello in 5 words.'))
"
```

To switch back to Groq: set `LLM_PROVIDER=groq` and rebuild.

---

## API contract summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/health` | No | DB health check |
| POST | `/api/v1/users/login` | No | Login, sets `auth_token` cookie |
| POST | `/api/v1/users/logout` | Yes | Clears cookie |
| GET | `/api/v1/clients/list` | Yes | All clients visible to RM |
| GET | `/api/v1/clients/:uuid` | Yes | Client profile + portfolio |
| GET | `/api/v1/clients/:uuid/opportunities` | Yes | All opps for one client |
| GET | `/api/v1/opportunities/pending` | Yes | Pending opps, high urgency first |
| GET | `/api/v1/opportunities/all` | Yes | All opps, all statuses |
| GET | `/api/v1/opportunities/:id` | Yes | Single opportunity detail |
| POST | `/api/v1/opportunities/:id/send` | Yes | RM approves, status → sent |
| POST | `/api/v1/opportunities/:id/dismiss` | Yes | RM skips, status → dismissed |
| POST | `/api/v1/signals/reel` | Yes | Fire AI pipeline, returns + saves |

Base URL: `http://localhost:8484`

Auth: JWT in `auth_token` httpOnly cookie (7-day expiry).

---

## Reel request shape

```json
{
  "client_uuid": "<uuid from /clients/list>",
  "url": "https://www.tiktok.com/@user/video/123 or empty string",
  "caption": "the text content of the reel",
  "hashtags": ["tag1", "tag2"]
}
```

## Reel response shape

```json
{
  "client_card": {
    "headline": "6-word warm headline",
    "body": "2 sentences connecting interest to wealth situation",
    "signature": "Anna Keller noticed this for you",
    "cta": "Talk to Anna Keller"
  },
  "rm_brief": {
    "summary": "1 sentence what client shared and what it signals",
    "portfolio_context": "relevant current portfolio position",
    "gap_opportunity": "1 sentence on the gap found",
    "playbook_reference": "what similar clients did in the past",
    "suggested_follow_up": "exact opening line for the RM to use",
    "urgency": "high | medium | low"
  },
  "profile": {
    "topic": "6 words max",
    "sector": "tech | energy | realestate | healthcare | crypto | consumer | macro | other",
    "values": ["2–4 from the values taxonomy"],
    "sentiment": "bullish | bearish | curious | cautious",
    "investment_signal": "1 sentence wealth implication",
    "follow_up_hook": "warm question using client's first name"
  },
  "portfolio_match": {
    "total_chf": 5000000.0,
    "is_overweight": false,
    "gap_sector": "energy | diversification | ...",
    "context": "Your portfolio holds X% in Y (CHF Z)."
  }
}
```

---

## Sector → portfolio keyword mapping

The matcher maps the profiler's `sector` output to portfolio asset class names using substring matching:

| Sector | Matches in asset class name |
|--------|----------------------------|
| `tech` | tech, technology, equity, us tech |
| `energy` | energy, commodities, oil, solar, clean |
| `realestate` | real estate, property, reit |
| `healthcare` | healthcare, pharma, biotech |
| `crypto` | crypto, digital, bitcoin, blockchain |
| `consumer` | consumer, retail, fmcg |
| `macro` | bonds, cash, rates, fixed income |
| `other` | (no match — treated as gap) |

`is_overweight` fires when a matched position exceeds 35% weight.
`gap_sector` is set to the sector name when matched weight < 5% (or no match).

---

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection refused` on 8484 | Backend not running | `docker-compose up --build -d` |
| Backend keeps restarting | Check logs | `docker-compose logs backend --tail=30` |
| `401 Invalid credentials` | Seed not run | Run seed.py |
| `500 on /signals/reel` | GROQ_API_KEY missing or wrong | Check `.env`, restart stack |
| `Empty opportunities array` | Seed not run or wiped | Run seed.py |
| `JSONDecodeError in pipeline` | LLM returned malformed JSON | Retry — or switch to `LLM_PROVIDER=openai` |
| ChromaDB error in seed | Path permissions | Set `CHROMA_PATH=/tmp/chroma` in `.env` |
| `Lucas Bauer not in /clients/list` | Step 3 not run | Run the Lucas seed command from Step 3 |

---

## Ready for frontend checklist

- [ ] Health returns 200
- [ ] `anna.keller` login returns success and sets cookie
- [ ] `/clients/list` returns both Leo Ackermann and Lucas Bauer
- [ ] `/opportunities/pending` returns 3 items for Leo, high urgency first
- [ ] `/signals/reel` for Leo returns `client_card` with non-empty headline
- [ ] `/signals/reel` for Lucas returns `is_overweight: true` on the wealth anxiety reel
- [ ] `/opportunities/:id/send` changes status to `sent`
- [ ] Unauthenticated request returns 401

Hand the frontend team:
- Base URL: `http://localhost:8484`
- RM credentials: `anna.keller` / `demo1234`
- Client credentials: `leo.ackermann` / `demo1234`, `lucas.bauer` / `demo1234`
- UUIDs: get live from `GET /api/v1/clients/list` — do not hardcode
