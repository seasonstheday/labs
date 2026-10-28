// Sprite sheets for the game from a Meshy (or any) GLB: toon shading, a dark outline, N directions × M frames per
// animation, transparent background, plus a JSON with the screen position of named bones on every frame so the game
// can pin hats, glasses and weapons to the body (the 3D version of WEAR / WEAR_PET).
//
//   cd defender/tools && npm install
//   node render_sheet.mjs meshy_out/mascot_wave --name dad --out ../assets/3d \
//        --anims "walking.glb:walk,running.glb:run,throw.glb:throw:16" --dirs 8 --frames 8 --size 192 --outline 0.012 --elev 25
//
// Writes <out>/<name>_<anim>.png (rows = directions, columns = frames) and <out>/<name>.json:
//   { size, dirs, anims: { walk: { frames, dur } }, anchors: { walk: [dir][frame]{ boneName: [x, y, z] } }, bones: [...] }
// x,y are pixels inside the frame cell; z is depth toward the camera (bigger = nearer), so the game can draw a prop
// behind the body when the hand swings back. If the GLB has no animation (a static friend), one 'idle' frame per
// direction is rendered and the code's hop/bob/squash animates it.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, extname, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2), dir = resolve(args.find(a => !a.startsWith('--')) || '.');
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const NAME = opt('name', basename(dir)), OUT = resolve(opt('out', join(dir, 'sheets'))), DIRS = +opt('dirs', 8), FRAMES = +opt('frames', 8), SIZE = +opt('size', 192);
const OUTLINE = +opt('outline', .012), ELEV = +opt('elev', 25) * Math.PI / 180, FACE = +opt('face', 0); // face: extra yaw so direction 0 is the model's front
const animArg = opt('anims', '');
// --paint <dir>: colour an untextured model by projecting <dir>/front.png (seen from the front) and <dir>/side.png (seen from its
// right, facing right) onto it. --proc "hop:0.6,attack:0.5": whole-body animations for a model with no rig (squash, jump, lunge, tongue).
const PAINT = opt('paint', ''), PROC = opt('proc', '') ? opt('proc').split(',').map(s => { const [n, d, fr] = s.split(':'); return { name: n, dur: +(d || .6), frames: fr ? +fr : 0 }; }) : []; // "file.glb:name,..." ; empty = clips inside the main model, or a static idle
const MODEL = existsSync(join(dir, 'rigged.glb')) && animArg ? 'rigged.glb' : 'model.glb';
if (!existsSync(join(dir, MODEL))) { console.error('no', MODEL, 'in', dir); process.exit(1); }
const ANIMS = animArg ? animArg.split(',').map(s => { const [f, n, fr] = s.split(':'); return { file: f, name: n || f.replace(/\.glb$/, ''), frames: fr ? +fr : 0 }; }) : []; // "file:name:frames" overrides --frames for one clip
mkdirSync(OUT, { recursive: true });
const three = dirname(dirname(fileURLToPath(import.meta.resolve('three'))));
const MIME = { '.js': 'text/javascript', '.glb': 'model/gltf-binary', '.html': 'text/html', '.png': 'image/png' };
const srv = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(PAGE); }
  const p = u.startsWith('/three/') ? join(three, u.slice(7)) : u.startsWith('/paint/') ? join(resolve(PAINT), u.slice(7)) : join(dir, u);
  if (!existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
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
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xfff4e0, 0x7a9a6a, 1.2)); const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 4, 3); scene.add(key);
const rim = new THREE.DirectionalLight(0xbfe0ff, .5); rim.position.set(-3, 2, -2); scene.add(rim);
// a three-step toon ramp so shading reads as flat bands like the drawings
const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
let root, mixer, clips = [], bones = [], cam, R = 1, groundY = 0, PAINTS = null, base = null, proc = null, tongue = null;
// the two drawings as textures, with the box their opaque pixels fill (0..1, y down) so the model's box maps onto it
async function paintTex(url) { const im = new Image(); im.src = url; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0; for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 40) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const tex = new THREE.CanvasTexture(c); tex.flipY = false; return { tex, rect: new THREE.Vector4(x0 / c.width, y0 / c.height, x1 / c.width, y1 / c.height) }; }
const PROCS = ${JSON.stringify(PROC)};
// whole-body motion for a model without a rig, t in seconds; the tongue is a pink capsule that flicks out of the mouth
function poseAt(name, t) { const P = PROCS.find(q => q.name === name); root.position.copy(base); root.scale.set(1, 1, 1); root.rotation.set(0, 0, 0); if (tongue) tongue.visible = false; if (!P) return;
  const u = (t % P.dur) / P.dur, e = x => x * x * (3 - 2 * x);
  if (name === 'hop') { const crouch = u < .2 ? e(u / .2) : u > .8 ? e(1 - (u - .8) / .2) * .7 : 0, air = u > .2 && u < .8 ? Math.sin((u - .2) / .6 * Math.PI) : 0;
    root.scale.set(1 + crouch * .12 - air * .05, 1 - crouch * .18 + air * .14, 1 + crouch * .12 - air * .05); root.position.y = base.y + air * R * .35; root.rotation.x = -air * .15 + crouch * .05; }
  if (name === 'attack') { const lean = u < .25 ? e(u / .25) : u < .7 ? 1 : e(1 - (u - .7) / .3); root.rotation.x = lean * .22; root.scale.set(1, 1 - lean * .06, 1 + lean * .08);
    const out = u > .25 && u < .7 ? Math.sin((u - .25) / .45 * Math.PI) : 0; if (tongue && out > 0) { tongue.visible = true; tongue.scale.set(1, 1, .05 + out); } } }
function toonify(obj) {
  const meshes = []; obj.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) { const m = o.material;
    if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
    o.material = new THREE.MeshToonMaterial({ map: m.map || null, color: m.color || 0xffffff, gradientMap: ramp });
    if (PAINTS) { const mat = o.material; mat.color.set(0xffffff); o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox;
      mat.onBeforeCompile = s => { Object.assign(s.uniforms, { tF: { value: PAINTS.front.tex }, tS: { value: PAINTS.side.tex }, tB: { value: PAINTS.back.tex }, rB: { value: PAINTS.back.rect }, rF: { value: PAINTS.front.rect }, rS: { value: PAINTS.side.rect }, bMin: { value: bb.min }, bMax: { value: bb.max } });
        s.vertexShader = 'varying vec3 vOP; varying vec3 vON;\\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\\n vOP = position; vON = normal;');
        s.fragmentShader = 'uniform sampler2D tF, tS, tB; uniform vec4 rF, rS, rB; uniform vec3 bMin, bMax; varying vec3 vOP; varying vec3 vON;\\n' + s.fragmentShader.replace('#include <map_fragment>', 'vec3 pn = (vOP - bMin) / (bMax - bMin), nn = normalize(vON); vec4 cf = texture2D(tF, vec2(mix(rF.x, rF.z, pn.x), mix(rF.w, rF.y, pn.y))); vec4 cb = texture2D(tB, vec2(mix(rB.z, rB.x, pn.x), mix(rB.w, rB.y, pn.y))); vec4 cs = texture2D(tS, vec2(mix(rS.x, rS.z, pn.z), mix(rS.w, rS.y, pn.y))); float head = smoothstep(.55, .8, pn.y); float wf = (pow(max(nn.z, 0.), 2.) + head * max(nn.z, 0.) * .6) * cf.a; float wb = (pow(max(-nn.z, 0.), 2.) + max(nn.y, 0.) * .9) * cb.a; float ws = nn.x * nn.x * (1. - head * .85) * cs.a + .001; vec3 pc = (cf.rgb * wf + cb.rgb * wb + cs.rgb * ws) / (wf + wb + ws); diffuseColor.rgb *= pow(pc, vec3(2.2));'); }; }
    // inverted hull outline: a back-faced black copy pushed out along the normals, skinned like the body
    const ol = new THREE.MeshBasicMaterial({ color: 0x3a2c20, side: THREE.BackSide });
    ol.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\\n transformed += normalize(objectNormal) * ${OUTLINE} * ' + R.toFixed(4) + ';'); };
    const hull = o.isSkinnedMesh ? new THREE.SkinnedMesh(o.geometry, ol) : new THREE.Mesh(o.geometry, ol);
    if (o.isSkinnedMesh) { hull.bind(o.skeleton, o.bindMatrix); hull.bindMode = o.bindMode; }
    hull.renderOrder = -1; o.add(hull);
  }
}
window.load = async (url, animUrls, paint) => {
  if (paint) PAINTS = { front: await paintTex('/paint/front.png'), side: await paintTex('/paint/side.png'), back: await paintTex('/paint/back.png') };
  const g = await new GLTFLoader().loadAsync(url); root = g.scene; clips = animUrls.length ? [] : (g.animations || []).map(c => ({ name: c.name || 'clip', clip: c })); // a rigged GLB carries a tiny bind-pose clip; ignore it when real clips are given
  for (const [name, u] of animUrls) { const a = await new GLTFLoader().loadAsync(u); if (a.animations && a.animations.length) { if (!clips.length && !animUrls.length) root = a.scene; clips.push({ name, clip: a.animations[0] }); } }
  // size from the bind pose, before any animation moves it
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  R = Math.max(size.x, size.y, size.z); root.position.x -= c.x; root.position.z -= c.z; root.position.y -= box.min.y; groundY = 0;
  toonify(root); scene.add(root); base = root.position.clone();
  if (PROCS.some(q => q.name === 'attack')) { // a tongue from the front of the mouth (the model faces +z), drawn in toon pink with its own outline
    const g = new THREE.CapsuleGeometry(R * .05, R * .4, 4, 8); g.rotateX(Math.PI / 2); g.translate(0, 0, R * .24);
    tongue = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: 0xe86a7a, gradientMap: ramp })); tongue.position.set(0, size.y * .5, size.z * .42); tongue.visible = false; root.add(tongue); }
  root.traverse(o => { if (o.isBone) bones.push(o); });
  // a generous frustum first; window.fit() below measures the drawn pixels from every direction and tightens it
  cam = new THREE.OrthographicCamera(-R * 1.6, R * 1.6, R * 2.1, -R * 1.1, .01, R * 20); window.fitBox = { span: R * 3.2, mid: R * .5 };
  if (clips.length) mixer = new THREE.AnimationMixer(root);
  return { R, size: [size.x, size.y, size.z], clips: [...clips.map(k => ({ name: k.name, dur: k.clip.duration })), ...PROCS.map(q => ({ name: q.name, dur: q.dur }))], bones: bones.map(b => b.name) };
};
let active = null;
const gl = renderer.getContext();
// measure the opaque pixels over a set of (angle, time) views and shrink the frustum to fit them with a margin
window.fit = (angles, times) => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; const px = new Uint8Array(${SIZE} * ${SIZE} * 4);
  for (const a of angles) for (const t of times) { window.shot(a, t); gl.readPixels(0, 0, ${SIZE}, ${SIZE}, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let y = 0; y < ${SIZE}; y++) for (let x = 0; x < ${SIZE}; x++) if (px[(y * ${SIZE} + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  if (x0 === Infinity) return null;
  const w = cam.right - cam.left, h = cam.top - cam.bottom, u = w / ${SIZE}; // world units per pixel (readPixels is bottom-up)
  const wx0 = cam.left + x0 * u, wx1 = cam.left + (x1 + 1) * u, wy0 = cam.bottom + y0 * (h / ${SIZE}), wy1 = cam.bottom + (y1 + 1) * (h / ${SIZE});
  const span = Math.max(wx1 - wx0, wy1 - wy0) * 1.08, mid = (wy0 + wy1) / 2;
  cam.left = -span / 2; cam.right = span / 2; cam.top = mid + span / 2; cam.bottom = mid - span / 2; cam.updateProjectionMatrix();
  return { span, mid, px: [x0, x1, y0, y1] };
};
// like fit(), but only measures (from the generous frustum) so several clips can be compared before choosing
window.fit2 = (angles, times) => { const keep = [cam.left, cam.right, cam.top, cam.bottom]; const r = window.fit(angles, times); [cam.left, cam.right, cam.top, cam.bottom] = keep; cam.updateProjectionMatrix(); return r; };
window.applyFit = r => { if (!r) return; cam.left = -r.span / 2; cam.right = r.span / 2; cam.top = r.mid + r.span / 2; cam.bottom = r.mid - r.span / 2; cam.updateProjectionMatrix(); };
window.play = name => { const P = PROCS.find(q => q.name === name); if (P) { proc = name; return P.dur; } proc = null; if (!mixer) return false; const k = clips.find(x => x.name === name) || clips[0]; if (active) active.stop(); active = mixer.clipAction(k.clip); active.play(); mixer.setTime(0); return k.clip.duration; };
const v = new THREE.Vector3();
window.shot = (angle, t) => {
  const d = R * 6; cam.position.set(Math.sin(angle) * Math.cos(${ELEV}) * d, Math.sin(${ELEV}) * d + R * .5, Math.cos(angle) * Math.cos(${ELEV}) * d); cam.lookAt(0, R * .5, 0); cam.updateMatrixWorld();
  if (proc) poseAt(proc, t || 0); else if (base) poseAt(null, 0); if (mixer && t != null && !proc) mixer.setTime(t); root.updateMatrixWorld(true);
  renderer.render(scene, cam);
  const anchors = {}; for (const b of bones) { if (!/head|neck|hand|wrist|arm|spine|chest|torso|foot|toe|hip|pelvis|root/i.test(b.name)) continue; b.getWorldPosition(v); const depth = v.clone().sub(cam.position).dot(cam.getWorldDirection(new THREE.Vector3())); v.project(cam); anchors[b.name] = [Math.round((v.x + 1) / 2 * ${SIZE}), Math.round((1 - v.y) / 2 * ${SIZE}), +(-depth / R).toFixed(3)]; }
  // for static models with no bones: where the drawn pixels are, so the game can still pin a hat on top and a prop at the front
  { const px = new Uint8Array(${SIZE} * ${SIZE} * 4); gl.readPixels(0, 0, ${SIZE}, ${SIZE}, gl.RGBA, gl.UNSIGNED_BYTE, px); let x0 = ${SIZE}, x1 = -1, y0 = ${SIZE}, y1 = -1, topx = 0, topn = 0;
    for (let y = 0; y < ${SIZE}; y++) for (let x = 0; x < ${SIZE}; x++) if (px[(y * ${SIZE} + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (x1 >= 0) { const ty = y1; for (let x = x0; x <= x1; x++) for (let y = ty; y >= ty - 3; y--) if (px[(y * ${SIZE} + x) * 4 + 3] > 8) { topx += x; topn++; } // readPixels rows are bottom-up: y1 is the top of the figure
      const T = ${SIZE} - 1; anchors.__top = [Math.round(topn ? topx / topn : (x0 + x1) / 2), T - y1, 0]; anchors.__mid = [Math.round((x0 + x1) / 2), Math.round(T - (y0 + y1) / 2), 0];
      const facingRight = Math.sin(angle) < 0; anchors.__front = [facingRight ? x1 : x0, Math.round(T - (y0 + y1) / 2), .5]; } }
  const g0 = new THREE.Vector3(0, 0, 0).project(cam); anchors.__ground = [Math.round((g0.x + 1) / 2 * ${SIZE}), Math.round((1 - g0.y) / 2 * ${SIZE}), 0];
  return { png: canvas.toDataURL('image/png'), anchors };
};
window.ready = true;
</script>`;
if (process.env.DUMP_PAGE) writeFileSync(process.env.DUMP_PAGE, PAGE);
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: SIZE, height: SIZE } }); const errs = []; p.on('pageerror', e => { errs.push(e.message); console.error('page error:', e.message); });
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForFunction(() => window.ready);
const info = await p.evaluate(([m, a, pt]) => window.load(m, a, pt), ['/' + MODEL, ANIMS.map(a => [a.name, '/' + a.file]), !!PAINT]);
console.log('loaded', MODEL, 'R', info.R.toFixed(3), 'clips', info.clips.map(c => `${c.name} ${c.dur.toFixed(2)}s`).join(', ') || 'none', '| bones', info.bones.length);
const plan = info.clips.length ? (PROC.length && !ANIMS.length ? [{ name: 'idle', dur: 0 }, ...info.clips] : info.clips) : [{ name: 'idle', dur: 0 }];
{ const d0 = plan[0].dur ? await p.evaluate(n => window.play(n), plan[0].name) : (await p.evaluate(() => window.play('idle')), 0); const angs = Array.from({ length: DIRS }, (_, i) => FACE + i / DIRS * Math.PI * 2), ts = d0 ? [0, d0 * .25, d0 * .5, d0 * .75] : [null];
  if (PROC.length) await p.evaluate(() => window.fitAll = true);
  const fit = await p.evaluate(([a, t, procs]) => { if (!procs.length) return window.fit(a, t); let best = null; for (const q of [{ name: 'idle', dur: 0 }, ...procs.filter(q => q.name !== 'attack')]) { window.play(q.name); const r = window.fit2(a, q.dur ? [0, q.dur * .25, q.dur * .5, q.dur * .75] : [null]); if (r && (!best || r.span > best.span)) best = r; } window.applyFit(best); return best; }, [angs, ts, PROC]); console.log('fit', fit && fit.span.toFixed(3), fit && fit.px.join(',')); }
const meta = { name: NAME, size: SIZE, dirs: DIRS, anims: {}, anchors: {}, bones: info.bones };
// compose sheets in the page itself (an offscreen canvas) so no image library is needed here
await p.evaluate(() => { window.sheet = document.createElement('canvas'); });
for (const k of plan) {
  const frames = k.dur ? ((ANIMS.find(a => a.name === k.name) || PROC.find(a => a.name === k.name) || {}).frames || FRAMES) : 1, dur = k.dur ? await p.evaluate(n => window.play(n), k.name) : (await p.evaluate(() => window.play('idle')), 0);
  await p.evaluate(([w, h]) => { window.sheet.width = w; window.sheet.height = h; window.sheet.getContext('2d').clearRect(0, 0, w, h); }, [SIZE * frames, SIZE * DIRS]);
  meta.anims[k.name] = { frames, dur }; meta.anchors[k.name] = [];
  for (let d = 0; d < DIRS; d++) {
    const row = [];
    for (let f = 0; f < frames; f++) {
      const r = await p.evaluate(([a, t]) => window.shot(a, t), [FACE + d / DIRS * Math.PI * 2, k.dur ? dur * f / frames : null]);
      await p.evaluate(([src, x, y]) => new Promise(res => { const im = new Image(); im.onload = () => { window.sheet.getContext('2d').drawImage(im, x, y); res(); }; im.src = src; }), [r.png, f * SIZE, d * SIZE]);
      row.push(r.anchors);
    }
    meta.anchors[k.name].push(row);
  }
  const png = await p.evaluate(() => window.sheet.toDataURL('image/png'));
  const f = join(OUT, `${NAME}_${k.name}.png`); writeFileSync(f, Buffer.from(png.split(',')[1], 'base64')); console.log('sheet', f, `${frames}x${DIRS}`);
}
// how tall the figure stands in its cell, from the idle frames: the game scales by this, so leaving headroom for a hop doesn't shrink it
{ const A = meta.anchors.idle || Object.values(meta.anchors)[0]; const hs = A.map(r => r[0]).filter(q => q.__top && q.__ground).map(q => q.__ground[1] - q.__top[1]); if (hs.length) meta.fill = +(hs.reduce((x, y) => x + y, 0) / hs.length / SIZE).toFixed(3); }
writeFileSync(join(OUT, `${NAME}.json`), JSON.stringify(meta)); console.log('meta', join(OUT, `${NAME}.json`));
await b.close(); srv.close();
if (errs.length) console.log('page errors:', errs);
