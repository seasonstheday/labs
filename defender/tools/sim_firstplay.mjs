// node defender/tools/sim_firstplay.mjs <outdir> [stages]  (serve the repo on :8765 first): a brand-new player who taps Next stage and the first card every time; logs every popup, hint and toast with its word count to <outdir>/live.tsv
// a brand-new player's first stages: every popup, card, hint and toast, with its words, in order
import { chromium } from '../tests/node_modules/playwright/index.mjs';
const O = process.argv[2], STAGES = +(process.argv[3] || 6);
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, serviceWorkers: 'block' })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/defender/?debug'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1200);
import { appendFileSync } from 'fs';
const log = []; log.push = function (x) { appendFileSync(O + '/live.tsv', [x.stage, x.t ?? '', x.kind, x.words ?? '', (x.title || '').trim().slice(0, 30), (x.text || '').slice(0, 100)].join('\t') + '\n'); return Array.prototype.push.call(this, x); }; let shot = 0, lastHint = '', lastToast = '';
const words = t => (t || '').trim().split(/\s+/).filter(Boolean).length;
const now = () => p.evaluate(() => dbg.G ? +dbg.G.t.toFixed(1) : 0);
async function note(kind, title, text, stage) { log.push({ stage, t: await now(), kind, title, words: words(text), text: text.replace(/\s+/g, ' ').slice(0, 160) }); if (shot < 60) await p.screenshot({ path: `${O}/${String(shot++).padStart(2, '0')}_${kind}.png` }); }
// one visible modal: note it, then press what a child would press
async function handleModal(stage) {
  const m = await p.evaluate(() => { const v = [...document.querySelectorAll('.modal')].filter(x => !x.hidden && x.offsetParent); if (!v.length) return null; const el = v[v.length - 1]; return { id: el.id, title: (el.querySelector('h2,h3') || {}).textContent || '', text: el.innerText }; });
  if (!m) return false;
  if (m.id === 'comicm') { let lines = 0; for (let i = 0; i < 40; i++) { const done = await p.evaluate(() => !document.querySelector('#comicGo').hidden); if (done) break; await p.evaluate(() => document.querySelector('#comicm').click()); lines++; }
    const txt = await p.evaluate(() => document.querySelector('#comicm').innerText); await note('story', m.title || (await p.evaluate(() => document.querySelector('#comicTitle').textContent)), txt, stage); await p.evaluate(() => document.querySelector('#comicGo').click()); return true; }
  await note(m.id, m.title, m.text, stage);
  const clicked = await p.evaluate(id => { const el = document.getElementById(id);
    const pick = ['#cards button', '#nextStage', '#newsOk', '#noteGo', '#ansMyth', '#dailyGo', '#claimDaily', '#creditsGo', '.row.exit .btn:not(.ghost)', '.btn:not(.ghost):not([disabled])', '.btn:not([disabled])'];
    for (const s of pick) { const x = el.querySelector(s); if (x && x.offsetParent) { x.click(); return s; } } el.hidden = true; return 'hidden'; }, m.id);
  await p.waitForTimeout(150); return true;
}
// the home screen: anything shown before the first match
for (let i = 0; i < 6; i++) if (!(await handleModal(0))) break;
await p.screenshot({ path: `${O}/home_start.png` });
for (let st = 0; st < STAGES; st++) {
  if (st === 0) { await p.evaluate(() => [...document.querySelectorAll('button')].find(x => /^▶?\s*Play/.test(x.textContent.trim()) && x.offsetParent).click()); }
  await p.waitForTimeout(400);
  for (let tick = 0; tick < 4000; tick++) {
    if (await handleModal(st + 1)) continue;
    const st2 = await p.evaluate(() => ({ g: !!dbg.G, cleared: dbg.G && dbg.G.cleared, over: dbg.G && dbg.G.over, hint: !document.querySelector('#hint').hidden ? document.querySelector('#hint').textContent : '', toast: !document.querySelector('#toast').hidden ? document.querySelector('#toast').innerText : '' }));
    if (st2.hint && st2.hint !== lastHint) { lastHint = st2.hint; await note('hint', '', st2.hint, st + 1); }
    if (st2.toast && st2.toast !== lastToast) { lastToast = st2.toast; log.push({ stage: st + 1, t: await now(), kind: 'toast', title: '', words: words(st2.toast), text: st2.toast.replace(/\s+/g, ' ').slice(0, 120) }); }
    if (!st2.g || st2.cleared || st2.over) break;
    await p.evaluate(() => dbg.step(15, 1 / 30));
  }
  // after the match: the clear card and anything after it, until the next match starts
  for (let i = 0; i < 12; i++) { if (!(await handleModal(st + 1))) break; }
  const where = await p.evaluate(() => ({ g: !!dbg.G && !dbg.G.cleared, stage: dbg.G && dbg.G.stage, over: dbg.G && dbg.G.over }));
  if (where.over) { log.push({ stage: st + 1, kind: 'LOST' }); break; }
  if (!where.g) { // back home: anything waiting there, then play on
    for (let i = 0; i < 6; i++) if (!(await handleModal(st + 1))) break;
    await p.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /^▶?\s*Play/.test(x.textContent.trim()) && x.offsetParent); b && b.click(); }); }
}
const fs = await import('fs'); fs.writeFileSync(`${O}/log.json`, JSON.stringify({ log, errs }, null, 1));
console.log(log.map(x => `${x.stage}\t${x.t ?? ''}\t${x.kind}\t${x.words ?? ''}\t${(x.title || '').trim().slice(0, 30)}\t${(x.text || '').slice(0, 90)}`).join('\n')); console.log('errors', errs);
await b.close();
