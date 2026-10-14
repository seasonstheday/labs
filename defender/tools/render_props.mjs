// Hand-held props for the game, modelled from primitives in three.js and rendered with the same toon shading, outline,
// camera elevation and 8 directions as the character sheets, so a bat or a lantern on a 3D body looks like part of it.
//
//   cd defender/tools && node render_props.mjs --out ../assets/3d --size 96
//
// Writes <out>/props.png (one column per prop, 8 rows = directions, row 0 = facing the viewer, clockwise) and
// <out>/props.json: { size, dirs, props: { key: { col, u, grip: [dir][x, y] } } } where u is pixels per body unit
// (a body is 1 unit tall) and grip is where the hand holds the prop in each cell. Each prop is built with its grip
// at the origin, its length along +Y and the body's forward along +Z.
import { createServer } from 'node:http';
import { readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const OUT = resolve(opt('out', '../assets/3d')), SIZE = +opt('size', 96), DIRS = 8, OUTLINE = +opt('outline', .006), ELEV = +opt('elev', 25) * Math.PI / 180;
mkdirSync(OUT, { recursive: true });
const three = dirname(dirname(fileURLToPath(import.meta.resolve('three'))));
const srv = createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/') { res.setHeader('Content-Type', 'text/html'); return res.end(PAGE); }
  const p = join(three, u.replace(/^\/three\//, ''));
  if (!u.startsWith('/three/') || !existsSync(p) || statSync(p).isDirectory()) { res.statusCode = 404; return res.end(); }
  res.setHeader('Content-Type', 'text/javascript'); res.end(readFileSync(p));
});
const PAGE = `<!doctype html><meta charset=utf-8><style>body{margin:0;background:transparent}</style>
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<canvas id=c width=${SIZE} height=${SIZE}></canvas>
<script type="module">
import * as THREE from 'three';
const canvas = document.getElementById('c'), renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
renderer.setClearColor(0x000000, 0); renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.add(new THREE.HemisphereLight(0xfff4e0, 0x7a9a6a, 1.2)); const key = new THREE.DirectionalLight(0xffffff, 1.5); key.position.set(2, 4, 3); scene.add(key);
const rim = new THREE.DirectionalLight(0xbfe0ff, .5); rim.position.set(-3, 2, -2); scene.add(rim);
const ramp = new THREE.DataTexture(new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), 3, 1); ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const OL = ${OUTLINE};
// materials: flat toon colour; glass is see-through and gets no outline hull
const mat = (color, o = {}) => new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...o });
const glass = (color = 0xbfe6f5, opacity = .45) => Object.assign(mat(color, { transparent: true, opacity }), { userData: { noHull: true } });
function toonify(obj) {
  const meshes = []; obj.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) { if (o.material.userData && o.material.userData.noHull) continue;
    const ol = new THREE.MeshBasicMaterial({ color: 0x3a2c20, side: THREE.BackSide });
    ol.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <skinning_vertex>', '#include <skinning_vertex>\\n transformed += normalize(objectNormal) * ' + OL.toFixed(4) + ';'); };
    const hull = new THREE.Mesh(o.geometry, ol); hull.renderOrder = -1; o.add(hull);
  }
}
const M = (geo, m, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => { const o = new THREE.Mesh(geo, m); o.position.set(...pos); o.rotation.set(...rot); o.scale.set(...scl); return o; };
const G = (...kids) => { const g = new THREE.Group(); for (const k of kids) g.add(k); return g; };
const cyl = (r1, r2, h, n = 24) => new THREE.CylinderGeometry(r1, r2, h, n), sph = r => new THREE.SphereGeometry(r, 24, 16), tor = (r, t) => new THREE.TorusGeometry(r, t, 12, 32), cone = (r, h) => new THREE.ConeGeometry(r, h, 20);
const lathe = (pts, n = 32) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), n);
const WOOD = 0x8b5a2b, DARK = 0x3a2c20, RED = 0xcb382e, BLUE = 0x5c8cbe, PURPLE = 0x6b3f7a, GOLD = 0xecb23c, WHITE = 0xfaf6ee, GREEN = 0x5a9a50, PINK = 0xe99bb0, CREAM = 0xf3e3b8, GREY = 0x8a8a94;
// a simple feather: a flattened leaf along +Y with a quill
const feather = (col = WHITE, len = .16) => G(M(sph(1), mat(col), [0, len * .55, 0], [0, 0, 0], [len * .22, len * .5, len * .12]), M(cyl(.004, .006, len * 1.1), mat(DARK), [0, len * .5, 0]));
// the props: grip at the origin, up along +Y, forward along +Z
const PROPS = {
  // Dad's seven weapons (body units: Dad is 1 tall)
  glass:   () => G(M(cyl(.013, .016, .15), mat(WOOD)), M(tor(.07, .012), mat(DARK), [0, .145, 0]), M(new THREE.CircleGeometry(.062, 32), glass(), [0, .145, 0]), M(new THREE.CircleGeometry(.062, 32), glass(), [0, .145, 0], [Math.PI, 0, 0])),
  yoyo:    () => G(M(cyl(.045, .045, .02), mat(RED), [0, 0, .013], [Math.PI / 2, 0, 0]), M(cyl(.045, .045, .02), mat(RED), [0, 0, -.013], [Math.PI / 2, 0, 0]), M(cyl(.012, .012, .03), mat(WHITE), [0, 0, 0], [Math.PI / 2, 0, 0]), M(cyl(.018, .018, .002), mat(WHITE), [0, 0, .024], [Math.PI / 2, 0, 0]), M(cyl(.018, .018, .002), mat(WHITE), [0, 0, -.024], [Math.PI / 2, 0, 0])),
  bat:     () => G(M(lathe([[0, -.03], [.024, -.03], [.024, -.02], [.017, -.01], [.017, .12], [.03, .26], [.036, .36], [.036, .4], [.028, .42], [0, .425]]), mat(0xc69660)), M(cyl(.019, .019, .1), mat(DARK), [0, .05, 0])),
  plane:   () => { const g = new THREE.BufferGeometry(), N = [0, 0, .13], T = [0, .015, -.09], L = [-.085, .055, -.1], Rr = [.085, .055, -.1], K = [0, -.045, -.085];
    g.setAttribute('position', new THREE.Float32BufferAttribute([...N, ...T, ...L, ...N, ...Rr, ...T, ...N, ...K, ...T], 3)); g.computeVertexNormals();
    return G(M(g, Object.assign(mat(WHITE), { side: THREE.DoubleSide }), [0, .03, 0], [-.3, 0, 0])); },
  frisbee: () => G(M(lathe([[0, .012], [.07, .012], [.1, .004], [.1, -.012], [.088, -.012], [.088, -.002], [.06, .002], [0, .002]]), mat(GOLD), [0, .03, 0])),
  bubble:  () => G(M(cyl(.009, .011, .2), mat(PURPLE), [0, .06, 0]), M(tor(.045, .009), mat(PINK), [0, .2, 0]), M(new THREE.CircleGeometry(.038, 32), glass(0xcfeeff, .35), [0, .2, 0]), M(new THREE.CircleGeometry(.038, 32), glass(0xcfeeff, .35), [0, .2, 0], [Math.PI, 0, 0])),
  balloon: () => G(M(sph(1), mat(BLUE), [0, .06, 0], [0, 0, 0], [.058, .072, .058]), M(sph(.014), mat(BLUE), [0, -.014, 0]), M(sph(.016), glass(0xffffff, .5), [-.02, .09, .035])),
  joke:    () => G(M(cyl(.05, .05, .07), mat(RED), [0, .04, 0]), M(cyl(.052, .052, .006), mat(CREAM), [0, .077, 0]), M(cyl(.052, .052, .006), mat(CREAM), [0, .003, 0]), M(cyl(.004, .004, .14), mat(WOOD), [.03, .1, .02], [0, 0, -.7]), M(sph(.012), mat(CREAM), [.085, .145, .02])),
  // the friends' lines: one prop each, tinted in the game per variant
  webster: () => G(M(cone(.022, .07), mat(WHITE), [-.025, -.02, 0], [Math.PI, 0, 0]), M(cone(.022, .07), mat(WHITE), [.025, -.02, 0], [Math.PI, 0, 0]), M(cyl(.032, .028, .02), mat(0x5a4838), [0, .02, 0])),
  sparky:  () => G(M(cyl(.045, .04, .11), glass(0xdcf3ff, .4), [0, .02, 0]), M(cyl(.047, .047, .018), mat(GREY), [0, .085, 0]), M(cyl(.008, .008, .05), mat(GREY), [0, .11, 0]), M(sph(.028), mat(0xfff0a0, { emissive: 0xffd040, emissiveIntensity: .9 }), [0, .01, 0])),
  hopper:  () => G(M(new THREE.CylinderGeometry(.085, .085, .012, 32, 1, false, .4, 5.5), mat(GREEN), [0, 0, 0], [0, 0, 0]), M(sph(.02), mat(PINK), [.03, .018, .03]), M(sph(.012), mat(GOLD), [.03, .03, .03])),
  puddles: () => feather(WHITE, .17),
  dusty:   () => G(M(tor(.036, .006), mat(DARK), [-.04, 0, 0]), M(tor(.036, .006), mat(DARK), [.04, 0, 0]), M(new THREE.CircleGeometry(.032, 32), glass(), [-.04, 0, 0]), M(new THREE.CircleGeometry(.032, 32), glass(), [.04, 0, 0]), M(cyl(.005, .005, .012), mat(DARK), [0, .01, 0], [0, 0, Math.PI / 2]), M(cyl(.004, .004, .07), mat(DARK), [-.076, .005, -.035], [Math.PI / 2, 0, 0]), M(cyl(.004, .004, .07), mat(DARK), [.076, .005, -.035], [Math.PI / 2, 0, 0])),
  pip:     () => G(M(lathe([[0, 0], [.03, .01], [.05, .03], [.055, .06], [.045, .09], [.025, .11], [0, .12]]), mat(PINK), [0, -.02, 0], [0, 0, .5]), M(sph(.022), mat(CREAM), [-.01, .08, 0])),
  scuttle: () => G(M(cone(.03, .12), mat(0x555560), [0, .04, 0], [0, 0, -.35]), M(sph(.012), mat(0x9a9aa6), [.047, .1, 0])),
  nilla:   () => G(...[-1, 0, 1].map(i => M(cone(.014, .07), mat(DARK), [i * .028, -.015, 0], [Math.PI + .25 * i, 0, i * .35])), M(sph(.028), mat(0xa87a5a), [0, .02, 0])),
  luna:    () => G(M(cyl(.04, .045, .012), mat(GOLD), [0, -.006, 0]), M(cyl(.022, .024, .09), mat(CREAM), [0, .045, 0]), M(cone(.012, .035), mat(0xffb020, { emissive: 0xff8000, emissiveIntensity: .7 }), [0, .11, 0]), M(sph(.007), mat(0xfff0a0, { emissive: 0xffe060 }), [0, .1, 0])),
};
let cam, root = null; const gl = renderer.getContext();
window.keys = () => Object.keys(PROPS);
window.build = key => { if (root) scene.remove(root); root = PROPS[key](); toonify(root); scene.add(root); cam = new THREE.OrthographicCamera(-.5, .5, .5, -.5, .01, 20); return true; };
const place = angle => { const d = 4; cam.position.set(Math.sin(angle) * Math.cos(${ELEV}) * d, Math.sin(${ELEV}) * d, Math.cos(angle) * Math.cos(${ELEV}) * d); cam.lookAt(0, 0, 0); cam.updateMatrixWorld(); cam.updateProjectionMatrix(); };
// measure the drawn pixels over all directions and tighten the frustum (square, centred on the drawn box) with a margin
window.fit = angles => {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity; const px = new Uint8Array(${SIZE} * ${SIZE} * 4);
  for (const a of angles) { place(a); renderer.render(scene, cam); gl.readPixels(0, 0, ${SIZE}, ${SIZE}, gl.RGBA, gl.UNSIGNED_BYTE, px);
    for (let y = 0; y < ${SIZE}; y++) for (let x = 0; x < ${SIZE}; x++) if (px[(y * ${SIZE} + x) * 4 + 3] > 8) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
  const w = cam.right - cam.left, u = w / ${SIZE};
  const wx0 = cam.left + x0 * u, wx1 = cam.left + (x1 + 1) * u, wy0 = cam.bottom + y0 * u, wy1 = cam.bottom + (y1 + 1) * u;
  const span = Math.max(wx1 - wx0, wy1 - wy0) * 1.12, mx = (wx0 + wx1) / 2, my = (wy0 + wy1) / 2;
  cam.left = mx - span / 2; cam.right = mx + span / 2; cam.top = my + span / 2; cam.bottom = my - span / 2; cam.updateProjectionMatrix();
  return { u: ${SIZE} / span };
};
window.shot = angle => { place(angle); renderer.render(scene, cam);
  const g = new THREE.Vector3(0, 0, 0).project(cam); return { png: canvas.toDataURL('image/png'), grip: [+((g.x + 1) / 2 * ${SIZE}).toFixed(1), +((1 - g.y) / 2 * ${SIZE}).toFixed(1)] }; };
window.ready = true;
</script>`;
await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: SIZE, height: SIZE } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto(`http://127.0.0.1:${port}/`); await p.waitForFunction(() => window.ready);
const keys = await p.evaluate(() => window.keys()), angs = Array.from({ length: DIRS }, (_, i) => i / DIRS * Math.PI * 2);
const meta = { size: SIZE, dirs: DIRS, props: {} };
await p.evaluate(([w, h]) => { window.sheet = document.createElement('canvas'); window.sheet.width = w; window.sheet.height = h; }, [SIZE * keys.length, SIZE * DIRS]);
for (const [col, key] of keys.entries()) {
  await p.evaluate(k => window.build(k), key); const fit = await p.evaluate(a => window.fit(a), angs); const grip = [];
  for (let d = 0; d < DIRS; d++) { const r = await p.evaluate(a => window.shot(a), angs[d]); grip.push(r.grip);
    await p.evaluate(([src, x, y]) => new Promise(res => { const im = new Image(); im.onload = () => { window.sheet.getContext('2d').drawImage(im, x, y); res(); }; im.src = src; }), [r.png, col * SIZE, d * SIZE]); }
  meta.props[key] = { col, u: +fit.u.toFixed(1), grip }; console.log(key.padEnd(8), 'u', fit.u.toFixed(0), 'px/unit  grip', grip[0].join(','));
}
const png = await p.evaluate(() => window.sheet.toDataURL('image/png'));
writeFileSync(join(OUT, 'props.png'), Buffer.from(png.split(',')[1], 'base64')); writeFileSync(join(OUT, 'props.json'), JSON.stringify(meta));
console.log('wrote', join(OUT, 'props.png'), `${keys.length}x${DIRS} cells of ${SIZE}`);
await b.close(); srv.close(); if (errs.length) console.log('page errors:', errs);
