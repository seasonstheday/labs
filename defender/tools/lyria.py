import json, urllib.request, base64, sys, subprocess, time
# python3 lyria.py <model> <out.mp3> <prompt> [ref.mp3]
model, out, prompt = sys.argv[1], sys.argv[2], sys.argv[3]; ref = sys.argv[4] if len(sys.argv) > 4 else None
parts = ([{'inlineData': {'mimeType': 'audio/mpeg', 'data': base64.b64encode(open(ref, 'rb').read()).decode()}}] if ref else []) + [{'text': prompt}]
body = json.dumps({'contents': [{'parts': parts}]}).encode()
for a in range(3):
    try:
        d = json.load(urllib.request.urlopen(urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', data=body, headers={'Content-Type': 'application/json'}), timeout=600))
        for p in d['candidates'][0]['content']['parts']:
            if 'inlineData' in p: open(out, 'wb').write(base64.b64decode(p['inlineData']['data'])); break
        else: print('no audio', json.dumps(d)[:300]); continue
        print(out, subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out], capture_output=True, text=True).stdout.strip(), flush=True); break
    except urllib.error.HTTPError as e: print('HTTP', e.code, e.read()[:400].decode(errors='ignore')); time.sleep(5)
    except Exception as e: print('ERR', e); time.sleep(5)
