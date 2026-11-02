# Recorded voices for every fixed line in the game: python3 defender/tools/gen_voice.py [--only d,k,v,n] [--limit N]
# Needs the game served on :8765 (it asks the page for its lines, both books: dbg.voiceLines with ?book2) and the Gemini API (the proxy adds the key).
# Writes defender/assets/voice/<key>.mp3 (mono, 40 kbps) and voice/index.json, skipping clips that already exist,
# so it can be stopped and run again. Delete a clip to re-record it. Tier 1 allows 100 clips a day per model; it stops cleanly at that.
# Recasting a voice: --stage DIR --only d records every line for those voices into DIR (the game keeps the old clips),
# a run with --swap DIR then moves them all into assets/voice at once and rewrites the index.
import json, os, sys, base64, subprocess, time, urllib.request
from concurrent.futures import ThreadPoolExecutor
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, '..', 'assets', 'voice'); os.makedirs(OUT, exist_ok=True)
MODEL = os.environ.get('TTS_MODEL', 'gemini-2.5-flash-preview-tts')
PRO = 'gemini-2.5-pro-preview-tts'
MODEL_OF = {'d': PRO}  # Dad is Iapetus on the pro model (picked from auditions, Nov 2026); the rest use MODEL
# who: (Gemini voice, how to say it)
CAST = {
  'd': ('Iapetus', 'Read this aloud like a warm, cheerful dad with a relaxed, deep baritone voice, telling his seven-year-old something amazing, clear and unhurried'),
  'k': ('Leda', 'Say this like an excited, curious seven-year-old kid, bright and quick'),
  'v': ('Sadaltager', 'Say this like a pompous, theatrical know-it-all villain from a children\'s cartoon with a posh accent, funny and never scary'),
  'n': ('Sulafat', 'Read this like a warm storybook narrator at bedtime'),
  'h': ('Laomedeia', 'Say this like a breathless, gossipy chatterbox lady from a children\'s cartoon who loves repeating whatever she heard, bubbly and silly, never mean'),  # Lady Hearsay (Book 2)
}
def lines():
    js = "import { chromium } from '%s/../tests/node_modules/playwright/index.mjs'; const b = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium' }); const p = await b.newPage(); await p.goto('http://localhost:8765/defender/?debug&book2'); await p.waitForTimeout(800); console.log(JSON.stringify(await p.evaluate(() => dbg.voiceLines()))); await b.close();" % HERE
    return json.loads(subprocess.run(['node', '--input-type=module', '-e', js], capture_output=True, text=True, check=True).stdout)
DAILY_OUT = set()  # models whose daily quota is used up
def tts(text, who, out):
    model = MODEL_OF.get(who, MODEL)
    if model in DAILY_OUT: return False
    voice, style = CAST[who]
    body = json.dumps({'contents': [{'parts': [{'text': f'{style}: {text}'}]}], 'generationConfig': {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': voice}}}}}).encode()
    err = None
    for a in range(4):
        try:
            d = json.load(urllib.request.urlopen(urllib.request.Request(f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent', data=body, headers={'Content-Type': 'application/json'}), timeout=120))
            part = d['candidates'][0]['content']['parts'][0]['inlineData']; raw = base64.b64decode(part['data'])
            rate = int(part['mimeType'].split('rate=')[1].split(';')[0]) if 'rate=' in part['mimeType'] else 24000
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 's16le', '-ar', str(rate), '-ac', '1', '-i', 'pipe:0', '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,loudnorm=I=-16:TP=-1.5', '-ac', '1', '-c:a', 'libmp3lame', '-b:a', '40k', out], input=raw, check=True)
            return True
        except urllib.error.HTTPError as e:
            reply = e.read().decode('utf-8', 'replace'); err = f'HTTP {e.code}: {reply[:160]}'
            if e.code in (401, 402, 403): break  # out of credit or no key: stop trying
            if e.code == 429 and ('per_day' in reply.lower() or 'perday' in reply.lower()): DAILY_OUT.add(model); break  # the day's quota (100 clips on Tier 1): try again tomorrow (the hint is past the first 160 characters)
        except Exception as e: err = repr(e)
        time.sleep(3 + a * 5)
    print('  failed', who, text[:50], err, flush=True); return False
if __name__ == '__main__':
    a = sys.argv[1:]; only = set(a[a.index('--only') + 1].split(',')) if '--only' in a else set(CAST); limit = int(a[a.index('--limit') + 1]) if '--limit' in a else 10**9
    stage = a[a.index('--stage') + 1] if '--stage' in a else None
    def index():
        have = sorted(f[:-4] for f in os.listdir(OUT) if f.endswith('.mp3')); json.dump(have, open(os.path.join(OUT, 'index.json'), 'w')); return have
    if '--swap' in a:  # the recast is complete: move the staged clips in, all at once
        src = a[a.index('--swap') + 1]; n = 0
        for f in os.listdir(src):
            if f.endswith('.mp3'): os.replace(os.path.join(src, f), os.path.join(OUT, f)); n += 1
        print(f'swapped in {n} clips; index: {len(index())} clips'); sys.exit()
    L = [x for x in lines() if x['who'] in only]
    if stage: os.makedirs(stage, exist_ok=True)
    dest = lambda x: os.path.join(stage if stage else OUT, x['key'] + '.mp3')
    todo = sorted([x for x in L if not os.path.exists(dest(x))], key=lambda x: x['who'] == 'd')[:limit]  # the story's other voices first, then Dad's facts
    print(f'{len(L)} lines, {len(todo)} to record' + (f' into {stage}' if stage else ''), flush=True)
    with ThreadPoolExecutor(4) as ex: list(ex.map(lambda x: tts(x['text'], x['who'], dest(x)), todo))
    left = len([x for x in L if not os.path.exists(dest(x))])
    if stage: print(f'staged {len(L) - left} of {len(L)}; {left} left' + (' (daily quota used up: run again tomorrow)' if DAILY_OUT else '; complete: run with --swap ' + stage), flush=True)
    else: print(f'index: {len(index())} clips' + (f' ({left} left: daily quota used up on {", ".join(sorted(DAILY_OUT))}; run again tomorrow)' if DAILY_OUT else ''), flush=True)
