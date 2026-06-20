import os, json

def call_llm(system: str, user: str) -> str:
    """Call the configured LLM, falling back to a local Ollama model if the
    primary provider is unavailable (e.g. Groq daily token limit). Keeps the
    live demo working even when the cloud quota is exhausted."""
    provider = os.getenv('LLM_PROVIDER', 'groq')
    # 'none' → skip all network and use the deterministic templated fallback in
    # the pipeline. Instant + reliable for live demos when no LLM is available.
    if provider == 'none':
        raise RuntimeError('LLM disabled (LLM_PROVIDER=none) — templated fallback')
    try:
        return _call(provider, system, user)
    except Exception:
        if provider != 'ollama':
            return _call('ollama', system, user)  # local backup — no quota
        raise


def _call(provider: str, system: str, user: str) -> str:
    if provider == 'groq':
        from groq import Groq
        # max_retries=0 so a rate-limit (429) fails fast instead of honouring
        # the multi-minute retry-after header — keeps the demo responsive.
        client = Groq(api_key=os.getenv('GROQ_API_KEY'), max_retries=0)
        response = client.chat.completions.create(
            model='llama-3.3-70b-versatile',
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user',   'content': user}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        return response.choices[0].message.content

    if provider == 'ollama':
        import requests as req
        base  = os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        model = os.getenv('OLLAMA_MODEL', 'llama3.3')
        r = req.post(f'{base}/api/chat', json={
            'model': model,
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user',   'content': user}
            ],
            'stream': False
        }, timeout=4)
        return r.json()['message']['content']

    if provider == 'openai':
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        response = client.chat.completions.create(
            model='gpt-4o',
            messages=[
                {'role': 'system', 'content': system},
                {'role': 'user',   'content': user}
            ],
            temperature=0.3
        )
        return response.choices[0].message.content

    raise ValueError(f'Unknown LLM_PROVIDER: {provider}')


def parse_json_response(text: str) -> dict:
    text = text.strip()
    if text.startswith('```'):
        lines = text.split('\n')
        text = '\n'.join(lines[1:-1])
    return json.loads(text)
