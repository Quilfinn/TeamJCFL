import os, json

def call_llm(system: str, user: str) -> str:
    provider = os.getenv('LLM_PROVIDER', 'groq')

    if provider == 'groq':
        from groq import Groq
        client = Groq(api_key=os.getenv('GROQ_API_KEY'))
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
        }, timeout=60)
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
