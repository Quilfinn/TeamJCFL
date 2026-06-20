from db import create_connection, close_connection

SECTOR_MAP = {
    'tech':        ['us tech', 'tech', 'technology'],
    'energy':      ['energy', 'oil', 'solar', 'clean', 'esg', 'green'],
    'realestate':  ['real estate', 'property', 'reit'],
    'healthcare':  ['healthcare', 'pharma', 'biotech'],
    'crypto':      ['crypto', 'digital', 'bitcoin', 'blockchain'],
    'consumer':    ['consumer', 'retail', 'fmcg'],
    'macro':       ['bonds', 'cash', 'rates', 'fixed income'],
    'other':       []
}

def match_portfolio(client_uuid: str, sector: str) -> dict:
    connection = create_connection()
    cursor = connection.cursor(dictionary=True)
    cursor.execute(
        'SELECT ASSET_CLASS, VALUE_CHF, WEIGHT_PCT FROM Portfolios WHERE CLIENT_UUID = %s',
        (client_uuid,)
    )
    rows = cursor.fetchall()
    close_connection(connection)

    total = sum(float(r['VALUE_CHF']) for r in rows)
    keywords = SECTOR_MAP.get(sector, [])

    existing = None
    is_overweight = False

    for row in rows:
        ac = row['ASSET_CLASS'].lower()
        weight = float(row['WEIGHT_PCT'])
        if any(k in ac for k in keywords):
            if existing is None or weight > float(existing['WEIGHT_PCT']):
                existing = row
            if weight > 35:
                is_overweight = True

    matched_weight = float(existing['WEIGHT_PCT']) if existing else 0
    gap_sector = sector if matched_weight < 5 else 'diversification'

    if existing and is_overweight:
        context = (
            f"Your portfolio already holds {existing['WEIGHT_PCT']}% "
            f"in {existing['ASSET_CLASS']} "
            f"(CHF {float(existing['VALUE_CHF']):,.0f}) — "
            f"this is an overweight position with significant concentration risk. "
            f"Adding more exposure to this sector would increase risk further."
        )
    elif existing:
        context = (
            f"Your portfolio already holds {existing['WEIGHT_PCT']}% "
            f"in {existing['ASSET_CLASS']} "
            f"(CHF {float(existing['VALUE_CHF']):,.0f})."
        )
    else:
        sector_label = 'digital assets (crypto)' if sector == 'crypto' else sector
        context = (f"Your portfolio currently has no exposure "
                   f"to {sector_label}.")

    return {
        'existing_position': existing,
        'is_overweight': is_overweight,
        'gap_sector': gap_sector,
        'total_chf': total,
        'context_sentence': context
    }
