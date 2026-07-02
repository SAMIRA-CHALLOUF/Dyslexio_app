import urllib.request
import os
import ssl

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'piper', 'models')
BASE_URL = 'https://huggingface.co/rhasspy/piper-voices/resolve/main/'

modelsToDownload = [
  # English
  {'name': 'en_US-ryan-medium.onnx', 'path': 'en/en_US/ryan/medium/en_US-ryan-medium.onnx'},
  {'name': 'en_US-ryan-medium.onnx.json', 'path': 'en/en_US/ryan/medium/en_US-ryan-medium.onnx.json'},
  # French
  {'name': 'fr_FR-tom-medium.onnx', 'path': 'fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx'},
  {'name': 'fr_FR-tom-medium.onnx.json', 'path': 'fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx.json'},
  # Italian
  {'name': 'it_IT-paola-medium.onnx', 'path': 'it/it_IT/paola/medium/it_IT-paola-medium.onnx'},
  {'name': 'it_IT-paola-medium.onnx.json', 'path': 'it/it_IT/paola/medium/it_IT-paola-medium.onnx.json'},
  # Spanish (Nouveaux modèles de haute qualité)
  {'name': 'es_ES-davefx-medium.onnx', 'path': 'es/es_ES/davefx/medium/es_ES-davefx-medium.onnx'},
  {'name': 'es_ES-davefx-medium.onnx.json', 'path': 'es/es_ES/davefx/medium/es_ES-davefx-medium.onnx.json'},
  {'name': 'es_AR-daniela-high.onnx', 'path': 'es/es_AR/daniela/high/es_AR-daniela-high.onnx'},
  {'name': 'es_AR-daniela-high.onnx.json', 'path': 'es/es_AR/daniela/high/es_AR-daniela-high.onnx.json'},
  # German
  {'name': 'de_DE-kerstin-low.onnx', 'path': 'de/de_DE/kerstin/low/de_DE-kerstin-low.onnx'},
  {'name': 'de_DE-kerstin-low.onnx.json', 'path': 'de/de_DE/kerstin/low/de_DE-kerstin-low.onnx.json'},
  {'name': 'de_DE-thorsten-high.onnx', 'path': 'de/de_DE/thorsten/high/de_DE-thorsten-high.onnx'},
  {'name': 'de_DE-thorsten-high.onnx.json', 'path': 'de/de_DE/thorsten/high/de_DE-thorsten-high.onnx.json'},
  # Arabic
  {'name': 'ar_JO-kareem-low.onnx', 'path': 'ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx'},
  {'name': 'ar_JO-kareem-low.onnx.json', 'path': 'ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx.json'},
  {'name': 'ar_JO-kareem-medium.onnx', 'path': 'ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx'},
  {'name': 'ar_JO-kareem-medium.onnx.json', 'path': 'ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx.json'},
]

os.makedirs(MODELS_DIR, exist_ok=True)
ssl._create_default_https_context = ssl._create_unverified_context

for m in modelsToDownload:
    dest = os.path.join(MODELS_DIR, m['name'])
    url = BASE_URL + m['path']
    
    if os.path.exists(dest) and os.path.getsize(dest) > 1000:
        print(f"Skipping {m['name']} (already fully downloaded)")
    else:
        print(f"Downloading {m['name']}...")
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(dest, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"Finished {m['name']}")

print("All downloads done!")
