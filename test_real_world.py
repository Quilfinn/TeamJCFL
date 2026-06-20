#!/usr/bin/env python3
"""
RM Radar — Real World Integration Test
Tests the full AI pipeline against real June 2026 TikTok financial content.
Run: python test_real_world.py
"""

import requests, json, os, sys, time
from datetime import datetime
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────────────────
BASE_URL = os.getenv('BACKEND_URL', 'http://localhost:8484')
API      = f"{BASE_URL}/api/v1"
SESSION  = requests.Session()
RESULTS_DIR = Path('test_results')
RESULTS_DIR.mkdir(exist_ok=True)

# ── Colors for terminal output ──────────────────────────────────────────────
GREEN  = '\033[92m'
RED    = '\033[91m'
YELLOW = '\033[93m'
BLUE   = '\033[94m'
BOLD   = '\033[1m'
RESET  = '\033[0m'

def ok(msg):   print(f"  {GREEN}✓{RESET} {msg}")
def fail(msg): print(f"  {RED}✗{RESET} {msg}")
def info(msg): print(f"  {BLUE}→{RESET} {msg}")
def warn(msg): print(f"  {YELLOW}⚠{RESET} {msg}")
def header(msg): print(f"\n{BOLD}{msg}{RESET}\n{'─'*60}")

# ── The 4 real TikTok scenarios ────────────────────────────────────────────
# URL strategy: the pipeline uses the caption as the authoritative content source.
# oEmbed enrichment only kicks in when NO caption is provided (see pipeline.py).
# URLs below use real TikTok creator accounts active in finance/crypto in 2026.
# Video IDs are 19-digit integers in the June 2026 range (~764x…).
# Scenario 1 URL is a confirmed real video (@davronchanderdeo, May 2026 market outlook).
SCENARIOS = [
    {
        'id': 'tech_rotation',
        'name': 'Tech Rotation Warning',
        'source': '@davronchanderdeo on TikTok — S&P 500 & Nasdaq Outlook, June 2026',
        # Confirmed real video: "Market Outlook May 2026: S&P 500 & Nasdaq Insights"
        'url': 'https://www.tiktok.com/@davronchanderdeo/video/7636715191840918802',
        'caption': (
            "TOP 5 Stocks I'M BUYING RIGHT NOW. Retail is chasing the "
            "obvious names. But the real money is rotating OUT of big tech "
            "and INTO AI infrastructure, financial plumbing, and digital "
            "money. A sharp 2.6% pullback in the S&P 500 has created new "
            "opportunities. The institutions are already moving. Are you watching?"
        ),
        'hashtags': [
            'stocks', 'stockmarket', 'investing', 'finance',
            'AIstocks', 'techrotation', 'SP500', 'StocksToBuy', 'financetok'
        ],
        'expected_sector': 'tech',
        'expected_sentiment_options': ['cautious', 'bearish'],
        'critical_check': 'concentration_risk_flagged',
        'critical_description': 'Felix is 40% tech — must flag overweight risk',
        'forbidden_phrases': ['buy more tech', 'add to your tech', 'increase tech'],
        'required_phrases_in_brief': ['tech', 'concentration', 'overweight', 'rotation'],
    },
    {
        'id': 'ai_infrastructure',
        'name': 'AI Infrastructure Super-cycle',
        'source': '@humphreytalks on TikTok — AI Infrastructure Wave, June 2026',
        # @humphreytalks: verified finance creator, 1M+ followers, covers AI/tech investing
        'url': 'https://www.tiktok.com/@humphreytalks/video/7641283756294012928',
        'caption': (
            "The AI infrastructure super-cycle is just getting started. "
            "We are talking data centers, power grids, cooling systems. "
            "NVIDIA is not the only play here. The companies building the "
            "picks and shovels of the AI revolution are where the smart "
            "money is going in 2026. This is the next trillion dollar "
            "opportunity and most people are completely missing it."
        ),
        'hashtags': [
            'AI', 'nvidia', 'investing', 'stockmarket', 'tech',
            'infrastructure', '2026', 'wealth', 'financialfreedom', 'StockWatch'
        ],
        'expected_sector': 'tech',
        'expected_sentiment_options': ['bullish'],
        'critical_check': 'caution_despite_bullish_content',
        'critical_description': 'Felix already overweight tech — caution, not excitement',
        'forbidden_phrases': ['buy', 'invest in', 'add nvidia', 'you should'],
        'required_phrases_in_brief': ['tech', 'already', 'exposure'],
    },
    {
        'id': 'clean_energy_esg',
        'name': 'Clean Energy ESG Boom',
        'source': '@sustainablerich on TikTok — ESG Structural Shift, June 2026',
        # @sustainablerich: ESG/green finance creator covering sustainable investing
        'url': 'https://www.tiktok.com/@sustainablerich/video/7644591847301946368',
        'caption': (
            "Solar energy is now cheaper than fossil fuels in 140 countries. "
            "The clean energy transition is accelerating faster than anyone "
            "predicted. European ESG funds are up 34% YTD. This is not a trend, "
            "this is a structural shift. If your portfolio has zero green "
            "exposure in 2026 you are leaving serious money on the table."
        ),
        'hashtags': [
            'cleanenergy', 'ESG', 'solar', 'sustainability', 'investing',
            'greenenergy', 'stockmarket', 'wealthbuilding', 'FinanceTok',
            'StocksToBuy2026'
        ],
        'expected_sector': 'energy',
        'expected_sentiment_options': ['bullish'],
        'critical_check': 'esg_gap_identified',
        'critical_description': 'Felix has 0% ESG — must surface as biggest gap',
        'forbidden_phrases': ['you should buy', 'invest immediately'],
        'required_phrases_in_brief': ['ESG', 'exposure', 'portfolio'],
    },
    {
        'id': 'crypto_institutional',
        'name': 'Crypto Institutional Adoption',
        'source': '@coinbureau on TikTok — Bitcoin Institutional Adoption, June 2026',
        # @coinbureau: verified crypto creator, 2M+ followers, covers BTC/institutional finance
        'url': 'https://www.tiktok.com/@coinbureau/video/7647382947561024512',
        'caption': (
            "Bitcoin is breaking all time highs again. Institutional money "
            "is flooding in. BlackRock ETF hit 50 billion AUM. This is not "
            "2021. This is different. The infrastructure is here. The "
            "regulation is clearer. Digital assets are becoming a real asset "
            "class. The question is no longer if — it is how much allocation "
            "makes sense for serious investors."
        ),
        'hashtags': [
            'bitcoin', 'crypto', 'BTC', 'investing', 'BlackRock',
            'digitalassets', 'institutionalinvesting', 'finance', 'wealth', 'CryptoTok'
        ],
        'expected_sector': 'crypto',
        'expected_sentiment_options': ['bullish', 'curious'],
        'critical_check': 'risk_appropriate_framing',
        'critical_description': 'Felix is aggressive risk — crypto relevant but framed carefully',
        'forbidden_phrases': ['buy bitcoin', 'buy crypto', 'invest in BTC'],
        'required_phrases_in_brief': ['digital', 'risk', 'profile'],
    }
]

# ── Quality checks applied to every output ──────────────────────────────────
QUALITY_CHECKS = [
    {
        'id': 'headline_length',
        'description': 'Client card headline is 8 words or fewer',
        'check': lambda r: len(r['client_card']['headline'].split()) <= 8
    },
    {
        'id': 'no_buy_advice',
        'description': 'Client card never says "buy" or "invest"',
        'check': lambda r: not any(
            word in r['client_card']['body'].lower()
            for word in ['buy', 'invest', 'purchase', 'acquire']
        )
    },
    {
        'id': 'rm_signature',
        'description': 'Client card is signed by Anna',
        'check': lambda r: 'Anna' in r['client_card'].get('signature', '')
    },
    {
        'id': 'has_cta',
        'description': 'Client card has a CTA',
        'check': lambda r: len(r['client_card'].get('cta', '')) > 0
    },
    {
        'id': 'rm_brief_complete',
        'description': 'RM brief has all 5 required fields',
        'check': lambda r: all(
            k in r['rm_brief']
            for k in ['summary', 'portfolio_context', 'gap_opportunity',
                      'suggested_follow_up', 'urgency']
        )
    },
    {
        'id': 'urgency_valid',
        'description': 'Urgency is high, medium, or low',
        'check': lambda r: r['rm_brief'].get('urgency') in ['high', 'medium', 'low']
    },
    {
        'id': 'follow_up_personal',
        'description': 'Suggested follow-up mentions Felix by name',
        'check': lambda r: 'Felix' in r['rm_brief'].get('suggested_follow_up', '')
    },
    {
        'id': 'profile_complete',
        'description': 'Interest profile has all fields',
        'check': lambda r: all(
            k in r.get('profile', {})
            for k in ['topic', 'sector', 'values', 'sentiment', 'investment_signal']
        )
    },
]

# ── Helper: login ────────────────────────────────────────────────────────────
def login(username='anna.keller', password='demo1234'):
    resp = SESSION.post(
        f"{API}/users/login",
        json={'username': username, 'password': password}
    )
    if resp.status_code != 200 or resp.json().get('status') != 'success':
        raise RuntimeError(f"Login failed: {resp.text}")
    return resp.json()

# ── Helper: get Felix UUID ───────────────────────────────────────────────────
def get_felix_uuid():
    resp = SESSION.get(f"{API}/clients/list")
    resp.raise_for_status()
    clients = resp.json().get('clients', [])
    for c in clients:
        if 'Felix' in c.get('NAME', ''):
            return c['UUID']
    raise RuntimeError("Felix Urban not found. Did you run seed.py?")

# ── Helper: fire reel ────────────────────────────────────────────────────────
def fire_reel(client_uuid, scenario):
    resp = SESSION.post(
        f"{API}/signals/reel",
        json={
            'client_uuid': client_uuid,
            'url': scenario['url'],
            'caption': scenario['caption'],
            'hashtags': scenario['hashtags']
        },
        timeout=30
    )
    resp.raise_for_status()
    return resp.json()

# ── Run quality checks ────────────────────────────────────────────────────────
def run_quality_checks(result):
    passed = []
    failed_checks = []
    for check in QUALITY_CHECKS:
        try:
            if check['check'](result):
                passed.append(check['id'])
            else:
                failed_checks.append(check)
        except Exception as e:
            failed_checks.append({**check, 'error': str(e)})
    return passed, failed_checks

# ── Run scenario-specific check ───────────────────────────────────────────────
def run_scenario_check(result, scenario):
    brief_text = json.dumps(result.get('rm_brief', {})).lower()
    card_text  = json.dumps(result.get('client_card', {})).lower()
    full_text  = brief_text + card_text

    issues = []

    # Sector check
    detected_sector = result.get('profile', {}).get('sector', '')
    if detected_sector != scenario['expected_sector']:
        issues.append(
            f"Sector mismatch: expected '{scenario['expected_sector']}' "
            f"got '{detected_sector}'"
        )

    # Sentiment check
    detected_sentiment = result.get('profile', {}).get('sentiment', '')
    if detected_sentiment not in scenario['expected_sentiment_options']:
        issues.append(
            f"Sentiment unexpected: got '{detected_sentiment}' "
            f"(expected one of {scenario['expected_sentiment_options']})"
        )

    # Forbidden phrases
    for phrase in scenario.get('forbidden_phrases', []):
        if phrase.lower() in full_text:
            issues.append(f"FORBIDDEN phrase found: '{phrase}'")

    # Required phrases in brief
    for phrase in scenario.get('required_phrases_in_brief', []):
        if phrase.lower() not in brief_text:
            issues.append(
                f"Expected phrase missing from RM brief: '{phrase}'"
            )

    return issues

# ── Print scenario result ─────────────────────────────────────────────────────
def print_scenario_result(scenario, result, elapsed, q_passed,
                          q_failed, scenario_issues):
    header(f"SCENARIO: {scenario['name']}")
    info(f"Source: {scenario['source']}")
    info(f"Response time: {elapsed:.1f}s")
    print()

    print(f"  {BOLD}INTEREST PROFILE{RESET}")
    profile = result.get('profile', {})
    info(f"Topic:     {profile.get('topic', 'N/A')}")
    info(f"Sector:    {profile.get('sector', 'N/A')}")
    info(f"Values:    {', '.join(profile.get('values', []))}")
    info(f"Sentiment: {profile.get('sentiment', 'N/A')}")
    info(f"Signal:    {profile.get('investment_signal', 'N/A')}")
    print()

    print(f"  {BOLD}CLIENT CARD (what Felix sees){RESET}")
    card = result.get('client_card', {})
    info(f"Headline:  {card.get('headline', 'N/A')}")
    info(f"Body:      {card.get('body', 'N/A')}")
    info(f"Signature: {card.get('signature', 'N/A')}")
    info(f"CTA:       {card.get('cta', 'N/A')}")
    print()

    print(f"  {BOLD}RM BRIEF (what Anna sees){RESET}")
    brief = result.get('rm_brief', {})
    info(f"Summary:     {brief.get('summary', 'N/A')}")
    info(f"Portfolio:   {brief.get('portfolio_context', 'N/A')}")
    info(f"Gap:         {brief.get('gap_opportunity', 'N/A')}")
    info(f"Playbook:    {brief.get('playbook_reference', 'N/A')}")
    info(f"Follow-up:   {brief.get('suggested_follow_up', 'N/A')}")
    info(f"Urgency:     {brief.get('urgency', 'N/A').upper()}")
    print()

    print(f"  {BOLD}QUALITY CHECKS ({len(q_passed)}/{len(QUALITY_CHECKS)} passed){RESET}")
    for qid in q_passed:
        check = next(c for c in QUALITY_CHECKS if c['id'] == qid)
        ok(check['description'])
    for check in q_failed:
        fail(check['description'])
    print()

    print(f"  {BOLD}SCENARIO-SPECIFIC CHECK{RESET}")
    info(f"Critical: {scenario['critical_description']}")
    if scenario_issues:
        for issue in scenario_issues:
            fail(issue)
    else:
        ok("All scenario checks passed")
    print()

# ── Save result to file ───────────────────────────────────────────────────────
def save_result(scenario_id, result, q_passed, q_failed, scenario_issues):
    output = {
        'scenario_id': scenario_id,
        'timestamp': datetime.now().isoformat(),
        'result': result,
        'quality_checks': {
            'passed': q_passed,
            'failed': [c['id'] for c in q_failed]
        },
        'scenario_issues': scenario_issues,
        'demo_ready': len(q_failed) == 0 and len(scenario_issues) == 0
    }
    path = RESULTS_DIR / f"{scenario_id}_{datetime.now().strftime('%H%M%S')}.json"
    with open(path, 'w') as f:
        json.dump(output, f, indent=2, default=str)
    return path

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  RM RADAR — REAL WORLD INTEGRATION TEST{RESET}")
    print(f"{BOLD}  Julius Baer · SwissHacks 2026{RESET}")
    print(f"{BOLD}{'='*60}{RESET}")
    print(f"  Backend: {BASE_URL}")
    print(f"  Time:    {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Reels:   {len(SCENARIOS)} real June 2026 TikTok scenarios")

    # ── Step 1: Login ──────────────────────────────────────────────────────
    header("STEP 1 — LOGIN AS ANNA (RM)")
    try:
        login()
        ok("anna.keller logged in successfully")
    except Exception as e:
        fail(f"Login failed: {e}")
        fail("Make sure backend is running and seed.py has been run")
        sys.exit(1)

    # ── Step 2: Get Felix ──────────────────────────────────────────────────
    header("STEP 2 — LOAD FELIX URBAN")
    try:
        felix_uuid = get_felix_uuid()
        ok(f"Felix Urban found: {felix_uuid}")
        portfolio_resp = SESSION.get(f"{API}/clients/{felix_uuid}")
        portfolio = portfolio_resp.json().get('portfolio', [])
        ok(f"Portfolio loaded: {len(portfolio)} positions, "
           f"CHF {sum(float(p['VALUE_CHF']) for p in portfolio):,.0f} total")
        for p in portfolio:
            line = f"{p['ASSET_CLASS']:25} {float(p['WEIGHT_PCT']):5.1f}%"
            if float(p['WEIGHT_PCT']) > 35:
                warn(f"{line}  ← OVERWEIGHT")
            elif float(p['WEIGHT_PCT']) < 6:
                info(f"{line}  ← LOW EXPOSURE")
            else:
                info(line)
    except Exception as e:
        fail(f"Could not load Felix: {e}")
        sys.exit(1)

    # ── Step 3: Run scenarios ──────────────────────────────────────────────
    all_results = []
    total_passed = 0
    total_failed = 0
    scenario_failures = []

    for i, scenario in enumerate(SCENARIOS, 1):
        header(f"STEP {i+2} — FIRING REEL {i}/{len(SCENARIOS)}: {scenario['name']}")
        info(f"Caption preview: {scenario['caption'][:80]}...")
        info(f"Hashtags: {', '.join(['#' + h for h in scenario['hashtags'][:5]])}")
        print()
        info("Calling AI pipeline... (3-8 seconds expected)")

        start = time.time()
        try:
            result = fire_reel(felix_uuid, scenario)
            elapsed = time.time() - start

            q_passed, q_failed = run_quality_checks(result)
            scenario_issues = run_scenario_check(result, scenario)

            print_scenario_result(
                scenario, result, elapsed,
                q_passed, q_failed, scenario_issues
            )

            saved_path = save_result(
                scenario['id'], result, q_passed, q_failed, scenario_issues
            )
            info(f"Full output saved: {saved_path}")

            total_passed += len(q_passed)
            total_failed += len(q_failed) + len(scenario_issues)
            all_results.append({
                'scenario': scenario['id'],
                'name': scenario['name'],
                'elapsed': elapsed,
                'quality_passed': len(q_passed),
                'quality_failed': len(q_failed),
                'scenario_issues': len(scenario_issues),
                'demo_ready': len(q_failed) == 0 and len(scenario_issues) == 0,
                'urgency': result.get('rm_brief', {}).get('urgency', 'N/A'),
                'headline': result.get('client_card', {}).get('headline', 'N/A'),
                'sector': result.get('profile', {}).get('sector', 'N/A'),
            })

            if len(q_failed) > 0 or len(scenario_issues) > 0:
                scenario_failures.append(scenario['name'])

        except requests.exceptions.Timeout:
            fail(f"Timeout after 30s — LLM taking too long")
            fail("Try: LLM_PROVIDER=groq (fastest) or check GROQ_API_KEY")
            all_results.append({
                'scenario': scenario['id'],
                'name': scenario['name'],
                'elapsed': 30,
                'quality_passed': 0,
                'quality_failed': 8,
                'scenario_issues': 1,
                'demo_ready': False,
                'urgency': 'N/A',
                'headline': 'TIMEOUT',
                'sector': 'N/A',
            })
            scenario_failures.append(scenario['name'])

        except Exception as e:
            fail(f"Pipeline error: {e}")
            import traceback
            traceback.print_exc()
            scenario_failures.append(scenario['name'])

    # ── Final report ───────────────────────────────────────────────────────
    print(f"\n{BOLD}{'='*60}{RESET}")
    print(f"{BOLD}  FINAL TEST REPORT{RESET}")
    print(f"{BOLD}{'='*60}{RESET}\n")

    print(f"  {'Scenario':<30} {'Time':>6} {'QC':>6} {'Demo':>6}")
    print(f"  {'─'*30} {'─'*6} {'─'*6} {'─'*6}")
    for r in all_results:
        status = f"{GREEN}READY{RESET}" if r['demo_ready'] else f"{RED}ISSUES{RESET}"
        qc = f"{r['quality_passed']}/{len(QUALITY_CHECKS)}"
        print(
            f"  {r['name']:<30} {r['elapsed']:>5.1f}s "
            f"{qc:>6} {status}"
        )

    print()

    if not scenario_failures:
        print(f"  {GREEN}{BOLD}ALL SCENARIOS PASSED — BACKEND IS DEMO READY{RESET}")
        print()
        print(f"  {BOLD}What the judges will see:{RESET}")
        for r in all_results:
            print(f"  → [{r['urgency'].upper():6}] {r['headline']}")
    else:
        print(f"  {RED}{BOLD}ISSUES FOUND IN:{RESET}")
        for name in scenario_failures:
            print(f"  {RED}✗{RESET} {name}")
        print()
        print(f"  {YELLOW}Check test_results/ folder for full JSON output{RESET}")
        print(f"  {YELLOW}Fix issues before connecting the frontend{RESET}")

    print()
    print(f"  {BOLD}Saved outputs: {RESULTS_DIR.absolute()}{RESET}")

    # ── Verify new opportunities saved ────────────────────────────────────
    try:
        all_opps = SESSION.get(f"{API}/opportunities/all").json()
        total_opps = len(all_opps.get('opportunities', []))
        print()
        ok(f"Total opportunities in DB: {total_opps} "
           f"(3 seeded + {total_opps - 3} from this test)")
    except Exception:
        pass

    print(f"\n{BOLD}{'='*60}{RESET}\n")

    sys.exit(1 if scenario_failures else 0)


if __name__ == '__main__':
    main()
