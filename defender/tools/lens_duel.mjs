// node defender/tools/lens_duel.mjs --snaps=dir [--tune='{"hp":3}'] [--profiles=typical,strong] [--stages=35,55,75] [--n=4] [--patch=edits.json] [--out=duel.json] [--lenses=glass,yoyo,...]
// Lens duel: the same arrival save, replayed with each of Dad's seven lenses. (serve the repo on :8765 first)
//
// Takes the arrival saves balance_sim.mjs writes with --snaps (snap_<profile>_<stage>.json, stage counted from 1) and,
// for every save, plays that stage N times (first tries, no retry snack) with each lens. Only save.weapon changes:
// dadTheme is cleared (a themed lens would carry its own pow/rate), and the equipped weapon item, ranks, stars, gear,
// party and Skill Trees all stay as they were, so every lens gets the same rank, gear and team. The level-up AI is
// balance_sim's ("Pick tricks for me"). One browser context per lens, in parallel. Always loads ?debug&book2.
// Output: per (profile, stage, lens): winRate, hpLeft (mean Patience % left over wins), hpAll (over all tries, losses 0),
// minHp, secs, and dadShare (share of all damage dealt to myths that came from Dad's lens shots).
import { chromium } from '../tests/node_modules/playwright/index.mjs';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const A = Object.fromEntries(process.argv.slice(2).map(s => { const m = s.match(/^--([^=]+)=?(.*)$/); return m ? [m[1], m[2]] : [s, '']; }));
const N = +(A.n || 4), SN = A.snaps, OUT = A.out || 'duel.json';
const LENSES = (A.lenses || 'glass,yoyo,bat,plane,frisbee,bubble,balloon').split(',');
const PROFS = (A.profiles || 'typical').split(','), STAGES = (A.stages || '35,55,75').split(',').map(Number);
const TUNE = JSON.parse(A.tune || '{}');
const PATCH = A.patch ? JSON.parse(readFileSync(A.patch, 'utf8')) : [];
const jobs = PROFS.flatMap(p => STAGES.map(st => ({ p, st, f: `${SN}/snap_${p}_${st}.json` }))).filter(j => existsSync(j.f) || (console.log('missing', j.f), false));
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

async function lensRun(lens) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.route(/\/defender\/(index\.html)?\?debug(&book2)?$/, async route => { const r = await route.fetch(); let html = await r.text();
    for (const [a, b] of PATCH) { if (!html.includes(a)) throw new Error('patch not found: ' + a.slice(0, 80)); html = html.replace(a, b); }
    // count damage by source: wrap hurt() so lens shots (from Dad while his weapon is firing) can be told apart
    if (!html.includes('function hurt(e, d, knock = 0, from = G.dad) {\n  if (e.hp <= 0 || e.fade > 0) return;')) throw new Error('duel hook not found: hurt');
    html = html.replace('function hurt(e, d, knock = 0, from = G.dad) {\n  if (e.hp <= 0 || e.fade > 0) return;', 'function hurt(e, d, knock = 0, from = G.dad) {\n  if (e.hp <= 0 || e.fade > 0) return; const __hp0 = e.hp; try { return __hurt(e, d, knock, from); } finally { const dd = Math.max(0, __hp0 - Math.max(0, e.hp)); G.__dmg = G.__dmg || { all: 0, lens: 0 }; G.__dmg.all += dd; if (G.__lens) G.__dmg.lens += dd; } }\nfunction __hurt(e, d, knock = 0, from = G.dad) {\n  if (e.hp <= 0 || e.fade > 0) return;');
    const T = [['s.t = (s.t || 0) + dt; G.src = s.src || null;', 's.t = (s.t || 0) + dt; G.src = s.src || null; G.__lens = !!s.lens;'],
      ['  G.src = null; G.shots = G.shots.filter(s => !s.dead);', '  G.src = null; G.__lens = 0; G.shots = G.shots.filter(s => !s.dead);'],
      // Patience lost, by source: melee by myth kind, ranged shots, boss
      ['G.hp -= patHit(s.dmg); G.dropped = true; G.flash = .2;', 'G.__pk = "ranged"; G.hp -= patHit(s.dmg); G.dropped = true; G.flash = .2;'],
      ['G.hp -= patHit(b.dmg * (G.lv ? 1.2 : .8));', 'G.__pk = "boss"; G.hp -= patHit(b.dmg * (G.lv ? 1.2 : .8));'],
      ['G.hp -= patHit(b.dmg)', 'G.__pk = "boss"; G.hp -= patHit(b.dmg)'],
      ['G.hp -= patHit(2.2 * G.D.dmg * dt);', 'G.__pk = "boss"; G.hp -= patHit(2.2 * G.D.dmg * dt);'],
      ['G.hp -= patHit(ST.by.dmg', 'G.__pk = "boss"; G.hp -= patHit(ST.by.dmg'],
      ['G.hp -= patHit(e.dmg);', 'G.__pk = e.kind === "boss" ? "boss" : e.elite ? "elite" : "melee"; G.hp -= patHit(e.dmg);'],
      ['const patHit = d => d *', 'const patHit = d => __pl(d) *'],
      ['function moveEshots(dt) {', 'function __pl(d) { G.__pl = G.__pl || {}; const k = G.__pk || "other"; G.__pl[k] = Math.round((G.__pl[k] || 0) + d); G.__pk = null; return d; }\nfunction moveEshots(dt) {'],
      ["case 'joke': {\n      if (!tgt) return false;", "case 'joke': {\n      if (!tgt) return false; G.__jokes = (G.__jokes || 0) + 1;"],
      ['  G.pending.push({ at: G.t + .14, fn: release });', '  const __rel = release; if (m.id === "dad" && kind === save.weapon) release = () => { const n0 = G.shots.length; G.__lens = 1; try { __rel(); } finally { G.__lens = 0; for (let i = n0; i < G.shots.length; i++) G.shots[i].lens = 1; } };\n  G.pending.push({ at: G.t + .14, fn: release });']];
    for (const [a, b] of T) { if (!html.includes(a)) throw new Error('duel hook not found: ' + a); html = html.replace(a, b); }
    await route.fulfill({ response: r, body: html }); });
  await p.goto('http://localhost:8765/defender/?debug&book2'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  await p.evaluate(TUNE => {
    const D = dbg, S = () => D.save, H = window.__duel = {}; Object.assign(D.TUNE, TUNE);
    const score = b => (b.querySelector('.tag.evo') ? 4 : b.querySelector('.tag') ? 3 : 0) + (b.querySelector('.who.new') ? 1 : 0) + +((((b.querySelector('.who') || {}).textContent || '').match(/Rank (\d)/) || [0, 1])[1]) * .2;
    H.close = () => { for (const id of ['#comicm', '#notem', '#dailym', '#levelup', '#quizm', '#drawm', '#roomm', '#cloudm']) { const m = document.querySelector(id); if (!m || m.hidden) continue;
      if (id === '#levelup') { const cs = [...m.querySelectorAll('#cards button')]; if (cs.length) { cs.sort((a, b) => score(b) - score(a))[0].click(); continue; } const go = document.querySelector('#nope'); if (go && !go.disabled) { go.click(); continue; } }
      if (id === '#quizm') { const q = D.G && D.G.quiz; const right = q ? (Math.random() < .75 ? q.isFact : !q.isFact) : true; document.querySelector(right ? '#ansFact' : '#ansMyth').click(); continue; }
      const btn = m.querySelector('#comicSkip, #noteGo, #dailyClaim, #cloudKeep'); if (btn) btn.click(); else m.hidden = true; } };
    H.restore = (js, lens) => { const s = S(); for (const k of Object.keys(s)) delete s[k]; Object.assign(s, JSON.parse(js)); s.weapon = lens; s.dadTheme = null; Object.assign(s.opt, { calm: true, voice: false, labels: false, sfx: false, music: false }); D.persist(); };
    H.play = async st => { D.startGame(st); await new Promise(r => setTimeout(r, 20)); let t = 0, lo = Infinity;
      while (t < 30 * 60 * 10) { H.close(); const G = D.G; if (!G || G.over || G.cleared) break; if (G.paused) { H.close(); if (G.paused && !G.over && !G.cleared) G.paused = false; }
        for (let j = 0; j < 10; j++) { const n = D.step(30); t += n; lo = Math.min(lo, D.G.hp); if (n < 30) break; } await new Promise(r => setTimeout(r, 0)); }
      const G = D.G, dm = G.__dmg || { all: 1, lens: 0 };
      const r = { win: !!G.cleared, hp: Math.round(Math.max(0, G.hp) / G.maxhp * 100), minHp: Math.round(Math.max(0, Math.min(lo, G.hp)) / G.maxhp * 100), secs: Math.round(G.t), wave: G.wave + 1,
        boss: G.boss ? Math.round(Math.max(0, G.boss.hp) / G.boss.maxhp * 100) : null, share: +(dm.lens / Math.max(1, dm.all)).toFixed(3), pow: D.teamPower(), rec: D.recPower(st), weapon: D.save.weapon, wrank: (G.dad && G.dad.ranks.weapon) || 0, hits: G.__pl || {}, jokes: G.__jokes || 0 };
      document.querySelectorAll('.modal').forEach(m => m.hidden = true); return r; };
  }, TUNE);
  const rows = [];
  for (const j of jobs) { const snap = readFileSync(j.f, 'utf8');
    for (let k = 0; k < N; k++) { await p.evaluate(([js, l]) => __duel.restore(js, l), [snap, lens]); const r = await p.evaluate(st => __duel.play(st), j.st - 1); rows.push({ profile: j.p, stage: j.st, lens, trial: k + 1, ...r }); } }
  if (errs.length) console.log(lens, 'page errors:', [...new Set(errs)].slice(0, 5));
  await ctx.close(); return rows;
}
const t0 = Date.now();
const rows = (await Promise.all(LENSES.map(lensRun))).flat();
await browser.close();
const avg = (a, f) => a.length ? +(a.reduce((s, r) => s + f(r), 0) / a.length).toFixed(1) : null;
const sum = [];
for (const j of jobs) for (const l of LENSES) { const a = rows.filter(r => r.profile === j.p && r.stage === j.st && r.lens === l), w = a.filter(r => r.win);
  sum.push({ profile: j.p, stage: j.st, lens: l, winRate: +(w.length / a.length).toFixed(2), hpLeft: avg(w, r => r.hp), hpAll: avg(a, r => r.win ? r.hp : 0), minHp: avg(a, r => r.minHp), secs: avg(a, r => r.secs), bossLeft: avg(a.filter(r => !r.win && r.boss != null), r => r.boss), share: avg(a, r => r.share * 100), pow: a[0].pow, rec: a[0].rec }); }
writeFileSync(OUT, JSON.stringify({ rows, sum }, null, 1));
// table: one line per save, hpAll per lens (win rate in brackets)
console.log('profile stage  ' + LENSES.map(l => l.padStart(12)).join(''));
for (const j of jobs) console.log(`${j.p.padEnd(8)}${String(j.st).padStart(4)}  ` + LENSES.map(l => { const s = sum.find(x => x.profile === j.p && x.stage === j.st && x.lens === l); return `${s.hpAll}(${Math.round(s.winRate * 100)})`.padStart(12); }).join(''));
console.log('mean hpAll     ' + LENSES.map(l => String(avg(sum.filter(s => s.lens === l), s => s.hpAll)).padStart(12)).join(''));
console.log('mean win%      ' + LENSES.map(l => String(avg(sum.filter(s => s.lens === l), s => s.winRate * 100)).padStart(12)).join(''));
console.log('mean dad dmg%  ' + LENSES.map(l => String(avg(sum.filter(s => s.lens === l), s => s.share)).padStart(12)).join(''));
console.log(`[${Math.round((Date.now() - t0) / 1000)}s]`);
