// The live 3D layer (prototype, ?r3d). The game's rules and its 2D drawing code stay as they are: wherever the 2D code
// would draw a 3D-sheet myth or friend, it calls R3D.put() instead with the same numbers (where its feet are, which way
// it faces, its height, tint, squash, lean, flash), and this draws the real model there on a WebGL canvas under the 2D
// one. Labels, projectiles, rings and effects keep drawing on top in 2D.
//
// The camera is orthographic and tilted, lined up so a point on the ground lands on exactly the screen pixel the 2D game
// uses for it: screen (x, y) is world (x - CX, 0, (y - CY) / sin(tilt)). Heights are foreshortened by cos(tilt).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

const W = 440, H = 760, CX = 220, CY = 420, TILT = 32 * Math.PI / 180, SIN = Math.sin(TILT), COS = Math.cos(TILT);
let renderer, scene, cam, ground, groundSrc = null, canvas;
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const ramp = new THREE.DataTexture(new Uint8Array([150, 150, 150, 255, 210, 210, 210, 255, 255, 255, 255, 255]), 3, 1);
ramp.minFilter = ramp.magFilter = THREE.NearestFilter; ramp.needsUpdate = true;
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x3a2c20, side: THREE.BackSide });
const MODELS = {}; // key -> { tpl, h, ok } once loaded; false if it failed
const POOL = {};   // key -> [instances]
let frameList = [];
const stats = { calls: 0, tris: 0, shown: 0 };

// a paint shader for models that came without a texture: the drawings of the character from the front, side and back
// are projected onto it (see tools/render_sheet.mjs --paint)
const PAINT = {}; // e.g. { pet_x: 'assets/models/pet_x_paint/' } for a model that has no texture of its own
async function paintTex(url) { const im = new Image(); im.src = url; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data; let x0 = c.width, x1 = 0, y0 = c.height, y1 = 0;
  for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 40) { x0 = Math.min(x0, xx); x1 = Math.max(x1, xx); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const tex = new THREE.CanvasTexture(c); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; return { tex, rect: new THREE.Vector4(x0 / c.width, y0 / c.height, x1 / c.width, y1 / c.height) }; }
function paintMaterial(base, bb, P) {
  const m = base.clone(); m.color.set(0xffffff);
  m.onBeforeCompile = s => { Object.assign(s.uniforms, { tF: { value: P.front.tex }, tS: { value: P.side.tex }, tB: { value: P.back.tex }, rF: { value: P.front.rect }, rS: { value: P.side.rect }, rB: { value: P.back.rect }, bMin: { value: bb.min }, bMax: { value: bb.max } });
    s.vertexShader = 'varying vec3 vOP; varying vec3 vON;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vOP = position; vON = normal;');
    s.fragmentShader = 'uniform sampler2D tF, tS, tB; uniform vec4 rF, rS, rB; uniform vec3 bMin, bMax; varying vec3 vOP; varying vec3 vON;\n' + s.fragmentShader.replace('#include <map_fragment>', `
      vec3 pn = (vOP - bMin) / (bMax - bMin), nn = normalize(vON);
      vec4 cf = texture2D(tF, vec2(mix(rF.x, rF.z, pn.x), mix(rF.w, rF.y, pn.y)));
      vec4 cb = texture2D(tB, vec2(mix(rB.z, rB.x, pn.x), mix(rB.w, rB.y, pn.y)));
      vec4 cs = texture2D(tS, vec2(mix(rS.x, rS.z, pn.z), mix(rS.w, rS.y, pn.y)));
      float head = smoothstep(.55, .8, pn.y);
      float wf = (pow(max(nn.z, 0.), 2.) + head * max(nn.z, 0.) * .6) * cf.a, wb = (pow(max(-nn.z, 0.), 2.) + max(nn.y, 0.) * .9) * cb.a, ws = nn.x * nn.x * (1. - head * .85) * cs.a + .001;
      diffuseColor.rgb *= (cf.rgb * wf + cb.rgb * wb + cs.rgb * ws) / (wf + wb + ws);`); };
  m.customProgramCacheKey = () => 'paint'; return m;
}

function load(key) {
  if (MODELS[key] !== undefined) return MODELS[key];
  MODELS[key] = null;
  (async () => {
    const g = await loader.loadAsync(`assets/models/${key}.glb`), root = g.scene;
    const P = PAINT[key] ? { front: await paintTex(PAINT[key] + 'front.png'), side: await paintTex(PAINT[key] + 'side.png'), back: await paintTex(PAINT[key] + 'back.png') } : null;
    // stand it on the floor, centred, one unit tall; its front faces +z
    const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
    const tpl = new THREE.Group(), inner = new THREE.Group(); inner.add(root); tpl.add(inner);
    root.scale.setScalar(1 / size.y); root.position.set(-c.x / size.y, -box.min.y / size.y, -c.z / size.y); // the inner group's scale is set every frame
    const meshes = []; root.traverse(o => { if (o.isMesh) meshes.push(o); }); // collected first: the outlines added below are meshes too
    for (const o of meshes) { const m = o.material;
      if (m.map) m.map.colorSpace = THREE.SRGBColorSpace;
      o.geometry.computeBoundingBox();
      o.material = P ? paintMaterial(new THREE.MeshToonMaterial({ gradientMap: ramp }), o.geometry.boundingBox, P) : new THREE.MeshToonMaterial({ map: m.map || null, color: 0xffffff, gradientMap: ramp });
      o.userData.toon = true;
      // inverted hull outline, pushed out along the normals in the shader so it stays the same width at any size
      const hull = new THREE.Mesh(o.geometry, outlineMat); hull.userData.hull = true; hull.renderOrder = -1; o.add(hull); }
    // a soft round shadow on the ground
    const sh = new THREE.Mesh(new THREE.CircleGeometry(.42, 20), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: .2, depthWrite: false }));
    const dx = size.x / size.y, dz = size.z / size.y; sh.scale.setScalar(Math.max(.8, (dx + dz) / 2) * 1.1);
    sh.rotation.x = -Math.PI / 2; sh.position.y = .002; sh.userData.shadow = true; tpl.add(sh);
    // how tall one unit of model looks on screen: its height foreshortened plus its depth seen from above, so a squat toad
    // and a thin page both come out as tall on screen as the 2D game asks for
    MODELS[key] = { tpl, ok: true, k: 1 / (COS + (dx + dz) / 2 * SIN * .5) };
  })().catch(e => { console.warn('r3d: no model', key, e && e.message); MODELS[key] = false; });
  return null;
}
outlineMat.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n transformed += normalize(objectNormal) * .018;'); };

function instance(key, i) {
  const list = POOL[key] || (POOL[key] = []);
  if (!list[i]) { const M = MODELS[key], o = M.tpl.clone(true);
    o.traverse(n => { if (!n.isMesh) return;
      if (n.userData.toon || n.userData.shadow) { const old = n.material, mt = old.clone(); mt.onBeforeCompile = old.onBeforeCompile; if (old.customProgramCacheKey) mt.customProgramCacheKey = old.customProgramCacheKey; n.material = mt; } }); // its own tint and fade
    scene.add(o); list[i] = o; }
  return list[i];
}

export const R3D = {
  stats,
  init(frame, under) {
    canvas = document.createElement('canvas'); canvas.id = 'c3'; canvas.style.cssText = 'position:absolute; inset:0; width:440px; height:760px; display:block; pointer-events:none;';
    under.parentNode.insertBefore(canvas, under);
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor(0x6f9a58);
    scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff6e6, 0xb8c8a8, 1.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.4); key.position.set(-.3, 1, .9); scene.add(key);
    // the camera: ground pixels line up with the 2D game's pixels (see the note at the top)
    cam = new THREE.OrthographicCamera(-CX, W - CX, CY, CY - H, -2000, 2000);
    cam.position.set(0, SIN * 1000, COS * 1000);
    // the camera's own "up" on screen must be the world's -z tilted: build its frame by hand so screen y = world z * sin
    cam.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, COS, -SIN), new THREE.Vector3(0, SIN, COS)));
    ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 40, (H + 40) / SIN), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0, ((H + 40) / 2 - 20 - CY) / SIN); scene.add(ground);
    this.resize(); return this;
  },
  resize() { if (!renderer) return; const s = parseFloat(getComputedStyle(canvas.parentNode).getPropertyValue('--s')) || 1; renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2) * Math.min(s, 1.5)); renderer.setSize(W, H, false); },
  show(on) { if (canvas) canvas.style.display = on ? 'block' : 'none'; },
  // the painted arena (the 2D game's background canvas) becomes the ground texture
  setGround(src) { if (src === groundSrc) return; groundSrc = src; const t = new THREE.CanvasTexture(src); t.colorSpace = THREE.SRGBColorSpace; ground.material.map = t; ground.material.needsUpdate = true; },
  has(key) { const M = load(key); return !!(M && M.ok); },
  begin() { frameList = []; },
  // x, y: where the feet go in game pixels (after the 2D context's transform: shake, a pop's squash); h: height in pixels
  put(key, ctx, x, y, h, o = {}) {
    const m = ctx.getTransform(), k = ctx.canvas.width / W, sx = (m.a * x + m.c * y + m.e) / k, sy = (m.b * x + m.d * y + m.f) / k;
    frameList.push({ key, sx, sy, h: h * Math.hypot(m.c, m.d) / k, scx: Math.hypot(m.a, m.b) / Math.hypot(m.c, m.d), alpha: ctx.globalAlpha, ...o });
    return { at: n => n === 'chest' ? { x, y: y - h * .55 } : n === 'top' ? { x, y: y - h } : null };
  },
  render() {
    const used = {}; stats.shown = frameList.length;
    for (const f of frameList) {
      const i = used[f.key] = (used[f.key] || 0) + 1, o = instance(f.key, i - 1), inner = o.children[0];
      o.visible = true; o.position.set(f.sx - CX, (f.hover || 0) / COS, (f.sy - CY) / SIN);
      // facing: phi is a screen angle (0 = right, pi/2 = toward the viewer); turn it into a direction on the ground
      const phi = f.phi ?? Math.PI / 2, dx = Math.cos(phi), dz = Math.sin(phi) / SIN; o.rotation.set(0, Math.atan2(dx, dz), 0);
      const sq = f.squash || 0, hh = f.h * MODELS[f.key].k;
      inner.scale.set(hh * (1 + sq * .15) * (f.scx || 1), hh * (1 - sq * .25), hh * (1 + sq * .15));
      inner.rotation.set(f.pitch || 0, 0, -(f.lean || 0) * Math.cos(phi)); // lean toward the side it faces
      o.traverse(n => { if (!n.isMesh) return; if (n.userData.shadow) { n.material.opacity = .2 * f.alpha; return; }
        if (n.userData.hull) { n.visible = f.alpha > .5; return; }
        const mt = n.material; mt.transparent = f.alpha < .99; mt.opacity = f.alpha;
        if (f.tint) mt.color.set(f.flash ? '#ffffff' : f.tint); else mt.color.set(0xffffff);
        mt.emissive.set(f.flash ? 0xffffff : 0x000000); mt.emissiveIntensity = f.flash ? .6 : 0; });
    }
    for (const key in POOL) POOL[key].forEach((o, i) => { if (i >= (used[key] || 0)) o.visible = false; });
    renderer.render(scene, cam);
    stats.calls = renderer.info.render.calls; stats.tris = renderer.info.render.triangles;
  },
};
