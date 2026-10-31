#!/usr/bin/env python3
"""Turnaround drawings -> textured 3D model through Meshy's multi-image-to-3D, then the free auto-rig for people.

    python3 defender/tools/meshy_multi.py dad kid pet_webster pet_sparky pet_hopper
    ... --no-rig          # skip rigging even for Dad and the Kid
    ... --poly 12000      # target triangles (default 12000 for people, 8000 for friends)

Reads assets/models/turnarounds/<name>_{front,side,back}.png (made by gen_turnaround.py) and writes
meshy_out/<name>/model.glb, thumbnail.png and model_task.json; for Dad and the Kid also rigged.glb and the basic
walk/run clips (rig_task.json, so meshy_animate.py can add more). All names run at once. Names that already have a
model.glb are skipped. Credits (Meshy, Oct 2026): about 30 a textured model, rigging free. Key: MESHY_API_KEY, or the proxy adds it.
"""
import base64, json, os, sys, threading
from meshy_test import call, wait, fetch, OUT, HERE

TURN = os.path.join(HERE, '..', 'assets', 'models', 'turnarounds')
PEOPLE = {'dad': 1.8, 'kid': 1.2}
opt = lambda k, d: sys.argv[sys.argv.index('--' + k) + 1] if '--' + k in sys.argv else d

def uri(p): return 'data:image/png;base64,' + base64.b64encode(open(p, 'rb').read()).decode()

def one(name):
    out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    if os.path.exists(os.path.join(out, 'model.glb')): return print(name, 'already has a model', flush=True)
    imgs = [os.path.join(TURN, f'{name}_{v}.png') for v in ('front', 'side', 'back')]
    if not all(map(os.path.exists, imgs)): return print(name, 'is missing a turnaround view', flush=True)
    person = name in PEOPLE
    body = {'image_urls': [uri(p) for p in imgs], 'ai_model': 'latest', 'should_texture': True, 'enable_pbr': False, 'should_remesh': True,
            'topology': 'triangle', 'target_polycount': int(opt('poly', 12000 if person else 8000)), 'texture_resolution': '2k',
            'pose_mode': 'a-pose' if person else '', 'symmetry_mode': 'auto'}
    if not body['pose_mode']: del body['pose_mode']
    tid = call('POST', '/openapi/v1/multi-image-to-3d', body)['result']; print(name, 'task', tid, flush=True)
    t = wait(f'/openapi/v1/multi-image-to-3d/{tid}', name)
    json.dump(t, open(os.path.join(out, 'model_task.json'), 'w'), indent=1)
    if t.get('thumbnail_url'): fetch(t['thumbnail_url'], os.path.join(out, 'thumbnail.png'))
    fetch(t['model_urls']['glb'], os.path.join(out, 'model.glb'))
    if not person or '--no-rig' in sys.argv: return print(name, 'done', flush=True)
    rid = call('POST', '/openapi/v1/rigging', {'input_task_id': tid, 'height_meters': PEOPLE[name]})['result']; print(name, 'rig task', rid, flush=True)
    r = wait(f'/openapi/v1/rigging/{rid}', name + ' rig')
    json.dump(r, open(os.path.join(out, 'rig_task.json'), 'w'), indent=1)
    res = r.get('result') or {}
    if res.get('rigged_character_glb_url'): fetch(res['rigged_character_glb_url'], os.path.join(out, 'rigged.glb'))
    for v in res.values():
        if isinstance(v, dict):
            for k, u in v.items():
                if isinstance(u, str) and u.startswith('http') and k.endswith('glb_url'): fetch(u, os.path.join(out, k.replace('_glb_url', '') + '.glb'))
    print(name, 'done (rigged)', flush=True)

if __name__ == '__main__':
    names = [a for a in sys.argv[1:] if not a.startswith('--') and not a.isdigit()]
    def safe(n):
        try: one(n)
        except BaseException as e: print(n, 'FAILED', e, flush=True)
    ts = [threading.Thread(target=safe, args=(n,)) for n in names]
    [t.start() for t in ts]; [t.join() for t in ts]
