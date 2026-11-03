// The Meshy laurel stands upright like a picture frame with a stray halo above it: drop the halo (every triangle entirely
// above the biggest height gap in the top third) and lay the wreath flat (a quarter turn about X), then write model_fixed.glb.
//   node fix_laurel.mjs && npx @gltf-transform/cli optimize meshy_out/hat_laurel/model_fixed.glb ../assets/models/hat_laurel.glb --compress meshopt --texture-compress webp --texture-size 1024 --simplify false
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS), src = 'meshy_out/hat_laurel/model.glb', doc = await io.read(src);
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const pos = prim.getAttribute('POSITION'), nor = prim.getAttribute('NORMAL'), idx = prim.getIndices(), n = pos.getCount(), v = [0, 0, 0];
  const ys = []; for (let i = 0; i < n; i++) ys.push(pos.getElement(i, v)[1]); const sorted = [...ys].sort((a, b) => a - b), lo = sorted[0], hi = sorted[n - 1];
  let gap = 0, cut = Infinity; for (let i = Math.floor(n * .67); i < n - 1; i++) { const g = sorted[i + 1] - sorted[i]; if (g > gap) { gap = g; cut = (sorted[i] + sorted[i + 1]) / 2; } }
  const keep = [], tri = idx.getCount() / 3; let dropped = 0;
  for (let t = 0; t < tri; t++) { const a = idx.getScalar(t * 3), b = idx.getScalar(t * 3 + 1), c = idx.getScalar(t * 3 + 2); if (ys[a] > cut && ys[b] > cut && ys[c] > cut) { dropped++; continue; } keep.push(a, b, c); }
  idx.setArray(new Uint32Array(keep));
  const rot = ([x, y, z]) => [x, -z, y]; // +90° about X: the ring in the XY plane ends up in XZ, lying flat
  for (let i = 0; i < n; i++) { pos.setElement(i, rot(pos.getElement(i, v))); if (nor) nor.setElement(i, rot(nor.getElement(i, v))); }
  console.log(`height ${lo.toFixed(3)}..${hi.toFixed(3)}, halo cut above ${cut.toFixed(3)} (gap ${gap.toFixed(3)}): dropped ${dropped} of ${tri} triangles`);
}
await doc.transform(prune()); await io.write('meshy_out/hat_laurel/model_fixed.glb', doc); console.log('wrote meshy_out/hat_laurel/model_fixed.glb');
