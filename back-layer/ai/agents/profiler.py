from ai.llm import call_llm, parse_json_response
from ai.prompts import PROFILER_SYSTEM, PROFILER_USER

def profile_interests(caption: str, hashtags: list, client_name: str = 'the client') -> dict:
    hashtag_str = ' '.join([f'#{h}' for h in hashtags])
    user_prompt = PROFILER_USER.format(
        caption=caption,
        hashtags=hashtag_str,
        client_name=client_name
    )
    raw = call_llm(PROFILER_SYSTEM, user_prompt)
    result = parse_json_response(raw)
    required = ['topic', 'sector', 'values', 'sentiment',
                'investment_signal', 'follow_up_hook']
    for key in required:
        if key not in result:
            raise ValueError(f'Missing key in profiler response: {key}')
    return result
