#!/usr/bin/env python3
"""Try one character through Meshy: image -> textured 3D model -> auto-rig (free walk + run) -> downloads.

    MESHY_API_KEY=... python3 defender/tools/meshy_test.py                 # Dad (assets/mascot_wave.png)
    MESHY_API_KEY=... python3 defender/tools/meshy_test.py pet_hopper      # any PNG in assets/, by name
    ... --no-rig                                                           # skip rigging (saves 5 credits)

Output goes to defender/tools/meshy_out/<name>/: model.glb, thumbnail.png, and when rigged
rigged.glb plus walking.glb / running.glb. Credits (Meshy docs, Oct 2026): image-to-3D about
20-25, rigging 5 including walk and run, extra animations 3 each. Needs only python3.
Nothing but the image and the key leaves this machine.
"""
import base64, json, os, sys, time, urllib.request

KEY = os.environ.get('MESHY_API_KEY') or 'proxy-injected'  # cloud sessions inject the real key at the egress proxy
API = 'https://api.meshy.ai'
HERE = os.path.dirname(os.path.abspath(__file__)); ASSETS = os.path.join(HERE, '..', 'assets'); OUT = os.path.join(HERE, 'meshy_out')

def call(method, path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, method=method,
                                 headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)

def wait(path, label):
    last = -1
    while True:
        t = call('GET', path); st, pr = t.get('status'), t.get('progress', 0)
        if pr != last: print(f'  {label}: {st} {pr}%', flush=True); last = pr
        if st == 'SUCCEEDED': return t
        if st in ('FAILED', 'CANCELED', 'EXPIRED'): raise SystemExit(f'{label} {st}: {t.get("task_error") or t}')
        time.sleep(8)

def fetch(url, dest):
    with urllib.request.urlopen(url, timeout=300) as r, open(dest, 'wb') as f: f.write(r.read())
    print('  ->', os.path.relpath(dest))

def main():
    if KEY == 'proxy-injected': print('MESHY_API_KEY not set; relying on the proxy to inject it', flush=True)
    args = [a for a in sys.argv[1:] if not a.startswith('--')]; name = args[0] if args else 'mascot_wave'; rig = '--no-rig' not in sys.argv
    src = os.path.join(ASSETS, name + '.png'); out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    if not os.path.exists(src): sys.exit(f'no such image: {src}')
    with open(src, 'rb') as f: data_uri = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    print('image-to-3d', name, '...')
    body = {'image_url': data_uri, 'ai_model': 'latest', 'should_texture': True, 'enable_pbr': False, 'pose_mode': 't-pose' if rig else 'a-pose',
            'topology': 'quad', 'should_remesh': True, 'target_polycount': 12000, 'texture_resolution': '2k'}
    tid = call('POST', '/openapi/v1/image-to-3d', body)['result']; print('  task', tid)
    t = wait(f'/openapi/v1/image-to-3d/{tid}', 'model')
    json.dump(t, open(os.path.join(out, 'model_task.json'), 'w'), indent=1)
    if t.get('thumbnail_url'): fetch(t['thumbnail_url'], os.path.join(out, 'thumbnail.png'))
    fetch(t['model_urls']['glb'], os.path.join(out, 'model.glb'))
    if not rig: return print('done (no rig).')
    print('rigging ...')
    rid = call('POST', '/openapi/v1/rigging', {'input_task_id': tid, 'height_meters': 1.8 if name.startswith('mascot') else 0.4})['result']; print('  task', rid)
    r = wait(f'/openapi/v1/rigging/{rid}', 'rig')
    json.dump(r, open(os.path.join(out, 'rig_task.json'), 'w'), indent=1)
    res = r.get('result') or {}
    if res.get('rigged_character_glb_url'): fetch(res['rigged_character_glb_url'], os.path.join(out, 'rigged.glb'))
    for k, v in res.items():  # basic animations come back as separate files, named like basic_animations.walking_glb_url
        if isinstance(v, dict):
            for kk, vv in v.items():
                if isinstance(vv, str) and vv.startswith('http') and kk.endswith('glb_url'): fetch(vv, os.path.join(out, kk.replace('_glb_url', '') + '.glb'))
        elif isinstance(v, str) and v.startswith('http') and k.endswith('glb_url') and k != 'rigged_character_glb_url': fetch(v, os.path.join(out, k.replace('_glb_url', '') + '.glb'))
    print('done. Render turntables with: node defender/tools/render_glb.mjs', os.path.relpath(out))

if __name__ == '__main__': main()
