from ai.llm import call_llm, parse_json_response
from ai.prompts import WRITER_SYSTEM, WRITER_USER

def write_outputs(profile: dict, match: dict,
                  playbook: list, client_name: str,
                  rm_name: str, risk_profile: str = 'moderate',
                  segment: str = 'private') -> dict:
    playbook_str = ' | '.join(playbook) if playbook else 'No similar cases on record'
    overweight_alert = (
        f"⚠ OVERWEIGHT ALERT: Client already holds {profile['sector']} at overweight levels. "
        f"The RM brief MUST flag overweight concentration risk and rotation opportunity. "
        f"Do NOT encourage adding more {profile['sector']} exposure."
    ) if match['is_overweight'] else f'No overweight concern. Client risk profile: {risk_profile} ({segment} segment).'
    user_prompt = WRITER_USER.format(
        client_name=client_name,
        rm_name=rm_name,
        topic=profile['topic'],
        sector=profile['sector'],
        values=', '.join(profile['values']),
        portfolio_context=match['context_sentence'],
        gap_sector=match['gap_sector'],
        overweight_alert=overweight_alert,
        risk_profile=risk_profile,
        segment=segment,
        playbook_reference=playbook_str,
        follow_up_hook=profile['follow_up_hook']
    )
    raw = call_llm(WRITER_SYSTEM, user_prompt)
    result = parse_json_response(raw)
    if 'client_card' not in result or 'rm_brief' not in result:
        raise ValueError('Writer response missing client_card or rm_brief')
    return result
