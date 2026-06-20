from db import create_connection, close_connection

SECTOR_MAP = {
    'tech':        ['tech', 'technology', 'equity', 'us tech'],
    'energy':      ['energy', 'commodities', 'oil', 'solar', 'clean'],
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
            existing = row
            if weight > 35:
                is_overweight = True

    matched_weight = float(existing['WEIGHT_PCT']) if existing else 0
    gap_sector = sector if matched_weight < 5 else 'diversification'

    if existing:
        context = (f"Your portfolio holds {existing['WEIGHT_PCT']}% "
                   f"in {existing['ASSET_CLASS']} "
                   f"(CHF {float(existing['VALUE_CHF']):,.0f}).")
    else:
        context = (f"Your portfolio currently has minimal exposure "
                   f"to {sector}.")

    return {
        'existing_position': existing,
        'is_overweight': is_overweight,
        'gap_sector': gap_sector,
        'total_chf': total,
        'context_sentence': context
    }
