// Keep only the animation from a Meshy animation GLB: Meshy sends every clip as the whole rigged character again (about
// 3 MB each), but the game needs the character once (assets/models/<name>.glb) and then just the bone tracks per clip.
//   node clip_only.mjs meshy_out/dad/idle.glb ../assets/models/dad_idle.glb
//   node clip_only.mjs meshy_out/dad      # every clip in the folder -> ../assets/models/dad_<clip>.glb
// Drops meshes, skins, materials and textures, keeps the node tree (bone names) and the animation, renames the clip to
// its file name, and quantizes nothing (bone tracks are small already).
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune, dedup, resample } from '@gltf-transform/functions';
import { readdirSync, statSync } from 'node:fs';
import { basename, join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const SKIP = new Set(['model', 'rigged', 'walking_armature', 'running_armature']);

async function one(src, dst, clip) {
  const doc = await io.read(src), root = doc.getRoot();
  for (const n of root.listNodes()) { n.setMesh(null); n.setSkin(null); }
  for (const x of [...root.listMeshes(), ...root.listSkins(), ...root.listMaterials(), ...root.listTextures()]) x.dispose();
  const anims = root.listAnimations(); anims.forEach((a, i) => a.setName(i ? `${clip}_${i}` : clip));
  await doc.transform(resample(), dedup(), prune({ keepLeaves: true }));
  await io.write(dst, doc); console.log(basename(dst), (statSync(dst).size / 1024).toFixed(0) + ' KB', anims.length + ' clip(s)');
}

const [a, b] = process.argv.slice(2);
if (statSync(a).isDirectory()) {
  const name = basename(resolve(a));
  for (const f of readdirSync(a).filter(f => f.endsWith('.glb'))) { const clip = f.slice(0, -4); if (SKIP.has(clip)) continue;
    await one(join(a, f), join(here, '..', 'assets', 'models', `${name}_${clip}.glb`), clip); }
} else await one(a, b, basename(b, '.glb').split('_').pop());
