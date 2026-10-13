// Copies the web game into www/ for Capacitor and adds the native bridge.
// The web build on GitHub Pages never gets this script, so ads and purchases never exist there.
import { cpSync, rmSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url)), src = join(here, '..', 'defender'), out = join(here, 'www');
if (!existsSync(join(src, 'index.html'))) throw new Error('defender/index.html not found next to app/');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
cpSync(src, out, { recursive: true, filter: p => !/\/(tools|__pycache__)(\/|$)/.test(p) && !p.endsWith('.md') });

let html = readFileSync(join(out, 'index.html'), 'utf8');
// the bridge loads before the game script so window.native, window.rewardedAd and window.iap exist from the first frame
html = html.replace('<script>', '<script src="native.js"></script>\n<script>');
// the native shell ships every file, so the web service worker is not needed inside it
html = html.replace(/if \('serviceWorker' in navigator[^\n]*\n/, '');
writeFileSync(join(out, 'index.html'), html);
cpSync(join(here, 'src', 'native.js'), join(out, 'native.js'));
console.log('www/ ready:', html.length, 'bytes of index.html');
