#!/usr/bin/env python3
"""Many images through Meshy image-to-3D at once (static, no rig), a few at a time.

    python3 defender/tools/meshy_batch.py concepts/creep_*.png concepts/boss_*.png
    ... --parallel 4 --poly 8000

Each image <dir>/<name>.png becomes meshy_out/<name>/model.glb (+ thumbnail.png, model_task.json). Images that already
have a model.glb are skipped. Key: MESHY_API_KEY, or a proxy that adds it. About 20-25 credits per model.
"""
import base64, json, os, sys, time, urllib.request
from meshy_test import call, fetch, OUT

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opt = lambda k, d: sys.argv[sys.argv.index('--' + k) + 1] if '--' + k in sys.argv else d
PAR, POLY = int(opt('parallel', 4)), int(opt('poly', 8000))
todo = [p for p in args if not os.path.exists(os.path.join(OUT, os.path.splitext(os.path.basename(p))[0], 'model.glb'))]
print(len(todo), 'to do,', len(args) - len(todo), 'done already', flush=True)
running = {}  # task id -> (name, out dir)
def submit(path):
    name = os.path.splitext(os.path.basename(path))[0]; out = os.path.join(OUT, name); os.makedirs(out, exist_ok=True)
    idf = os.path.join(out, 'task.id')  # a task submitted earlier by hand: adopt it instead of paying again
    if os.path.exists(idf): tid = open(idf).read().strip(); running[tid] = (name, out); print('adopted', name, tid, flush=True); return
    with open(path, 'rb') as f: uri = 'data:image/png;base64,' + base64.b64encode(f.read()).decode()
    body = {'image_url': uri, 'ai_model': 'latest', 'should_texture': True, 'enable_pbr': False, 'pose_mode': 'a-pose', 'topology': 'triangle', 'should_remesh': True, 'target_polycount': POLY, 'texture_resolution': '2k'}
    tid = call('POST', '/openapi/v1/image-to-3d', body)['result']; running[tid] = (name, out); print('submitted', name, tid, flush=True)
fails = []
while todo or running:
    while todo and len(running) < PAR:
        try: submit(todo.pop(0))
        except Exception as e: print('submit failed:', e, getattr(e, 'read', lambda: b'')()[:200], flush=True); time.sleep(20)
    time.sleep(12)
    for tid in list(running):
        name, out = running[tid]
        try: t = call('GET', f'/openapi/v1/image-to-3d/{tid}')
        except Exception as e: print('  poll error', name, e, flush=True); continue
        st = t.get('status')
        if st == 'SUCCEEDED':
            json.dump(t, open(os.path.join(out, 'model_task.json'), 'w'), indent=1)
            if t.get('thumbnail_url'): fetch(t['thumbnail_url'], os.path.join(out, 'thumbnail.png'))
            fetch(t['model_urls']['glb'], os.path.join(out, 'model.glb')); print('done', name, flush=True); del running[tid]
        elif st in ('FAILED', 'CANCELED', 'EXPIRED'): print('FAILED', name, t.get('task_error'), flush=True); fails.append(name); del running[tid]
print('all done; failed:', fails, flush=True)
try: print('balance', call('GET', '/openapi/v1/balance'))
except Exception: pass
