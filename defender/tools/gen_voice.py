# Recorded voices for every fixed line in the game: python3 defender/tools/gen_voice.py [--only d,k,v,n] [--limit N]
# Needs the game served on :8765 (it asks the page for its lines: dbg.voiceLines) and the Gemini API (the proxy adds the key).
# Writes defender/assets/voice/<key>.mp3 (mono, 40 kbps) and voice/index.json, skipping clips that already exist,
# so it can be stopped and run again. Delete a clip to re-record it.
import json, os, sys, base64, subprocess, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'voice'); os.makedirs(OUT, exist_ok=True)
MODEL = os.environ.get('TTS_MODEL', 'gemini-2.5-flash-preview-tts')
# who: (Gemini voice, how to say it)
CAST = {
  'd': ('Achird', 'Read this aloud like a warm, cheerful dad telling his seven-year-old something amazing, clear and unhurried'),
  'k': ('Leda', 'Say this like an excited, curious seven-year-old kid, bright and quick'),
  'v': ('Sadaltager', 'Say this like a pompous, theatrical know-it-all villain from a children\'s cartoon with a posh accent, funny and never scary'),
  'n': ('Sulafat', 'Read this like a warm storybook narrator at bedtime'),
}
def lines():
    js = "import { chromium } from '%s/../tests/node_modules/playwright/index.mjs'; const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium' }); const p = await b.newPage(); await p.goto('http://localhost:8765/defender/?debug'); await p.waitForTimeout(800); console.log(JSON.stringify(await p.evaluate(() => dbg.voiceLines()))); await b.close();" % HERE
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
def tts(text, who, out):
    voice, style = CAST[who]
    body = json.dumps({'contents': [{'parts': [{'text': f'{style}: {text}'}]}], 'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}).encode()
    err = None
    for a in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent', data=body, headers={'Content-Type': 'application/json'}), timeout=120))
            part = d['candidates'][0]['content']['parts'][0]['inlineData']; raw = base64.b64decode(part['data'])
            rate = int(part['mimeType'].split('rate=')[1].split(';')[0]) if 'rate=' in part['mimeType'] else 24000
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', 'pipe:0', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '40k', out], input=raw, check=True)
            return True
        except urllib.error.HTTPError as e:
            err = f'HTTP {e.code}: {e.read()[:160]}'
            if e.code in (401, 402, 403): break  # out of credit or no key: stop trying
        except Exception as e: err = repr(e)
        time.sleep(3 + a * 5)
    print('  failed', who, text[:50], err, flush=True); return False
if __name__ == '__main__':
    a = sys.argv[1:]; only = set(a[a.index('--only') + 1].split(',')) if '--only' in a else set(CAST); limit = int(a[a.index('--limit') + 1]) if '--limit' in a else 10**9
    L = [x for x in lines() if x['who'] in only]; todo = [x for x in L if not os.path.exists(os.path.join(OUT, x['key'] + '.mp3'))][:limit]
    print(f'{len(L)} lines, {len(todo)} to record', flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(lambda x: tts(x['text'], x['who'], os.path.join(OUT, x['key'] + '.mp3')), todo))
    have = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.mp3')); json.dump(have, open(os.path.join(OUT, 'index.json'), 'w'))
    print(f'index: {len(have)} clips', flush=True)
