// Turntable renders of a Meshy result (or any GLB) with a toon look, so we can judge it before touching the game.
//   cd defender/tools && npm install        (once: three + playwright)
//   node render_glb.mjs meshy_out/mascot_wave [--frames 8] [--size 512] [--anim walking.glb]
// Writes <dir>/render/angle_0..7.png (transparent) and <dir>/render/sheet.png, and if an animation GLB is
// given, <dir>/render/anim_00..11.png for one loop. Headless Chromium via Playwright.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2), dir = resolve(args.find(a => !a.startsWith('--')) || 'meshy_out/mascot_wave');
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const FRAMES = +opt('frames', 8), SIZE = +opt('size', 512), ANIM = opt('anim', null);
const model = existsSync(join(dir, 'rigged.glb')) && !ANIM ? 'rigged.glb' : 'model.glb';
if (!existsSync(join(dir, model))) { console.error('no model.glb in', dir); process.exit(1); }
const three = dirname(dirname(fileURLToPath(import.meta.resolve('three'))));
const out = join(dir, 'render'); mkdirSync(out, { recursive: true });

const MIME = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html', '.png': 'image/png' };
const srv = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  let p = u.startsWith('/three/') ? join(three, u.slice(7)) : u === '/' ? null : join(dir, u);
  if (u === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(PAGE); }
  if (!p || !existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', MIME[extname(p)] || 'application/octet-stream'); res.end(readFileSync(p));
});
const PAGE = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<canvas id=c width=${SIZE} height=${SIZE}></canvas>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
const canvas = document.getElementById('c'), renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(), cam = new THREE.PerspectiveCamera(30, 1, .01, 100);
scene.add(new THREE.HemisphereLight(0xfff4e0, 0x6b8a5a, 1.1)); const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(2, 4, 3); scene.add(key);
const rim = new THREE.DirectionalLight(0xbfe0ff, .6); rim.position.set(-3, 2, -2); scene.add(rim);
let root, mixer, clips = [];
window.load = async (url, animUrl) => {
  const g = await new GLTFLoader().loadAsync(url); root = g.scene; clips = g.animations || [];
  if (animUrl) { const a = await new GLTFLoader().loadAsync(animUrl); if (a.animations && a.animations.length) { root = a.scene; clips = a.animations; } }
  // flat-ish toon look: keep textures, drop PBR shine, add a gradient toon material
  root.traverse(o => { if (o.isMesh && o.material) { const m = o.material; const t = new THREE.MeshToonMaterial({ map: m.map || null, color: m.color || 0xffffff, skinning: !!o.isSkinnedMesh }); if (m.map) m.map.colorSpace = THREE.SRGBColorSpace; o.material = t; } });
  scene.add(root);
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  root.position.sub(c); root.position.y += 0; window.R = Math.max(size.x, size.y, size.z);
  if (clips.length) { mixer = new THREE.AnimationMixer(root); mixer.clipAction(clips[0]).play(); }
  return { size: [size.x, size.y, size.z], clips: clips.map(k => k.name + ' ' + k.duration.toFixed(2) + 's') };
};
window.shot = (angle, t) => { const R = window.R * 1.9; cam.position.set(Math.sin(angle) * R, R * .45, Math.cos(angle) * R); cam.lookAt(0, 0, 0); if (mixer && t != null) mixer.setTime(t); renderer.render(scene, cam); return canvas.toDataURL('image/png'); };
window.ready = true;
</script>`;
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: SIZE, height: SIZE } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForFunction(() => window.ready);
const info = await p.evaluate(([m, a]) => window.load(m, a), ['/' + model, ANIM ? '/' + ANIM : null]); console.log('loaded', model, JSON.stringify(info));
const files = [];
for (let i = 0; i < FRAMES; i++) { const d = await p.evaluate(a => window.shot(a, 0), i / FRAMES * Math.PI * 2); const f = join(out, `angle_${i}.png`); writeFileSync(f, Buffer.from(d.split(',')[1], 'base64')); files.push(f); }
if (ANIM && info.clips.length) { const dur = parseFloat(info.clips[0].split(' ').pop()); for (let i = 0; i < 12; i++) { const d = await p.evaluate(([a, t]) => window.shot(a, t), [Math.PI / 4, dur * i / 12]); writeFileSync(join(out, `anim_${String(i).padStart(2, '0')}.png`), Buffer.from(d.split(',')[1], 'base64')); } }
await b.close(); srv.close();
try { execSync(`montage -background '#8cc26e' -geometry ${Math.min(SIZE, 256)}x${Math.min(SIZE, 256)}+4+4 -tile ${FRAMES}x ${files.join(' ')} ${join(out, 'sheet.png')}`); console.log('sheet', join(out, 'sheet.png')); } catch (e) { console.log('no montage (ImageMagick); angle PNGs are in', out); }
if (errs.length) console.log('page errors:', errs);
