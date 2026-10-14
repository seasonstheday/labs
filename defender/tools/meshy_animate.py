#!/usr/bin/env python3
"""Add preset animations to a character already rigged by meshy_test.py (3 credits per action).

    python3 defender/tools/meshy_animate.py mascot_wave 0:idle 421:throw

Reads meshy_out/<name>/rig_task.json for the rigging task id, posts one animation task per action
(POST /openapi/v1/animations with rig_task_id + action_id), waits, and saves meshy_out/<name>/<label>.glb.
Preset ids: GET /openapi/v1/animations/library?search=idle (free). Auth: MESHY_API_KEY, or the proxy injects it.
"""
import json, os, sys, time, urllib.request

KEY = os.environ.get('MESHY_API_KEY'); API = 'https://api.meshy.ai'
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(HERE, 'meshy_out')

def call(method, path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None, method=method,
                                 headers={**({'Authorization': f'Bearer {KEY}'} if KEY else {}), 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, timeout=120) as r: return json.load(r)

def wait(path, label):
    last = -1
    while True:
        t = call('GET', path); st, pr = t.get('status'), t.get('progress', 0)
        if pr != last: print(f'  {label}: {st} {pr}%', flush=True); last = pr
        if st == 'SUCCEEDED': return t
        if st in ('FAILED', 'CANCELED', 'EXPIRED'): raise SystemExit(f'{label} {st}: {t.get("task_error") or t}')
        time.sleep(8)

def main():
    name, specs = sys.argv[1], sys.argv[2:]
    out = os.path.join(OUT, name); rig = json.load(open(os.path.join(out, 'rig_task.json')))['id']
    tasks = []
    for s in specs:
        aid, label = s.split(':'); tid = call('POST', '/openapi/v1/animations', {'rig_task_id': rig, 'action_id': int(aid)})['result']
        print('animation', label, 'action', aid, 'task', tid, flush=True); tasks.append((tid, label))
    for tid, label in tasks:
        t = wait(f'/openapi/v1/animations/{tid}', label); json.dump(t, open(os.path.join(out, f'anim_{label}.json'), 'w'), indent=1)
        url = (t.get('result') or {}).get('animation_glb_url')
        if not url: raise SystemExit(f'{label}: no animation_glb_url in {t}')
        with urllib.request.urlopen(url, timeout=300) as r, open(os.path.join(out, f'{label}.glb'), 'wb') as f: f.write(r.read())
        print('  ->', os.path.relpath(os.path.join(out, f'{label}.glb')))

if __name__ == '__main__': main()
