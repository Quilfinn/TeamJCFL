import os
import chromadb

CHROMA_PATH = os.getenv('CHROMA_PATH', './chroma')

FALLBACK_CASES = [
    'Client shared ESG content. RM offered sustainable mandate. Client allocated CHF 400k to green bonds.',
    'Client shared S&P 500 video. RM scheduled quarterly review. Client increased equity by CHF 200k.',
    'Client shared crypto content. RM explained risk profile match. Client capped digital at 3 percent.'
]

def query_playbook(topic: str, sector: str) -> list:
    try:
        client = chromadb.PersistentClient(path=CHROMA_PATH)
        collection = client.get_or_create_collection('jb_playbook')
        if collection.count() == 0:
            return FALLBACK_CASES[:2]
        results = collection.query(
            query_texts=[f'{topic} {sector}'],
            n_results=2
        )
        return results['documents'][0]
    except Exception:
        return FALLBACK_CASES[:2]
