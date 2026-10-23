// node defender/tools/sim_campaign.mjs [stages] [spend=1] [tune json] (serve the repo on :8765 first; snapshots go to $OUT or .)
// a fresh save plays the story in order with the game's own code, fast-forwarded,
// spending like a sensible kid between stages, three stages a "day" with patrol, wheel and daily gift.
import { chromium } from '../tests/node_modules/playwright/index.mjs';
const N = +(process.argv[2] || 40), SPEND = process.argv[3] !== '0', TUNE = JSON.parse(process.argv[4] || '{}');
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' })).newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message));
await p.goto('http://localhost:8765/defender/?debug'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
const rows = await p.evaluate(async ([N, SPEND, TUNE]) => {
  const D = dbg; Object.assign(D.TUNE, TUNE); const S = () => D.save, out = []; S().opt.calm = true; S().opt.voice = false; S().opt.labels = false; S().opt.sfx = false; S().opt.music = false;
  const close = () => { for (const id of ['#comicm', '#notem', '#dailym', '#levelup', '#quizm', '#drawm', '#roomm', '#cloudm']) { const m = document.querySelector(id); if (m && !m.hidden) {
    if (id === '#levelup') { const c = m.querySelector('#cards button'); if (c) { c.click(); continue; } }
    if (id === '#quizm') { const q = D.G && D.G.quiz; const right = q ? (Math.random() < .75 ? q.isFact : !q.isFact) : true; document.querySelector(right ? '#ansFact' : '#ansMyth').click(); continue; }
    const btn = m.querySelector('#comicSkip, #noteGo, #dailyClaim, #cloudKeep') ; if (btn) btn.click(); else m.hidden = true; } } };
  const play = async (st) => { D.startGame(st); await new Promise(r => setTimeout(r, 30)); let t = 0;
    while (t < 60 * 30 * 8) { close(); const G = D.G; if (!G) break; if (G.over || G.cleared) break; if (G.paused) { close(); if (G.paused) { G.paused = false; } }
      t += D.step(300); await new Promise(r => setTimeout(r, 0)); }
    const G = D.G; return { win: !!G.cleared, hp: Math.round(G.hp / G.maxhp * 100), secs: Math.round(G.t), wave: G.wave + 1 }; };
  const spend = () => { const s = S();
    // stars for anyone with the pages
    for (const id of Object.keys(D.CHARS)) { while (D.chr(id).own && D.starUp(id)) {} }
    // chests
    for (let w = 0; w < 8; w++) for (const C of D.CHESTS) if (C.ok(w) && !D.chestGot(w, C.k)) D.claimChest(w, C.k);
    document.querySelector('#chestm').hidden = true;
    // party: the three strongest friends
    const owned = Object.keys(D.CHARS).filter(id => id !== 'dad' && D.chr(id).own).sort((a, c) => D.powerOf(c) - D.powerOf(a)); s.party = owned.slice(0, 3);
    // Skill Books go to the party; then the cheapest open node, picks and finishers while points and coins last
    for (const id of s.party) while ((s.books || 0) > 0) { s.books--; D.chr(id).books = (D.chr(id).books || 0) + 1; }
    for (const id of ['dad', ...s.party]) { const c = D.chr(id); let guard = 60;
      while (D.tLeft(id) > 0 && guard--) { let best = null;
        for (const a of D.CHARS[id].abil) { if (D.clv(id) < D.UNLOCK_AT[D.CHARS[id].abil.indexOf(a)]) continue;
          for (const k of D.tNodes(a)) { const r = D.tRank(id, a, k); if (r < D.TREE_MAX) { const cost = D.skCost(r); if (!best || cost < best.cost) best = { a, k, cost, r }; } }
          if (!D.tPicked(id, a) && D.tNodes(a).reduce((n, k) => n + D.tRank(id, a, k), 0) >= D.tPickAt(a) && (!best || D.T_PICK_COST < best.cost * 2)) best = { a, pick: 1, cost: D.T_PICK_COST };
          if (D.tPicked(id, a) && D.tFull(id, a) && !D.tHasFin(id, a)) best = { a, fin: 1, cost: D.T_FIN_COST }; }
        if (!best || s.coins < best.cost) break; s.coins -= best.cost; const B = D.tBr(id, best.a);
        if (best.pick) B.pick = 1; else if (best.fin) B.fin = 1; else if (best.k === 'sig') c.sk[best.a] = best.r + 1; else B[best.k] = best.r + 1; } }
    // coin ranks with what's left, keeping a little
    for (const id of ['dad', ...s.party]) { const R = id === 'dad' ? D.DADRANKS : D.WRANKS, c = D.chr(id); for (const r in R) { const cost = R[r].base + (c[r] || 0) * R[r].step; if ((c[r] || 0) < 5 && s.coins - cost > 150) { s.coins -= cost; c[r] = (c[r] || 0) + 1; } } }
    // wear the best items
    for (const id of ['dad', ...s.party]) for (const t of ['armor', 'book', 'weapon']) { const list = s.items.filter(i => i.type === t && (t !== 'weapon' || i.owner === id) && !Object.values(s.equip).some(e => Object.values(e).includes(i.uid))).sort((x, y) => y.rar - x.rar || (y.val || 0) - (x.val || 0)); const cur = D.equipOf(id)[t]; if (list[0] && !cur) D.equipOf(id)[t] = list[0].uid; }
    D.persist(); };
  const day = () => { const s = S(); for (const h of [6, 6, 2, 2]) { const g = D.patrolPay(h); s.coins += g.coins; s.gems += g.gems; s.blank = (s.blank || 0) + g.blank; for (const id of ['dad', ...s.party]) D.chr(id).xp += g.xp; }
    s.coins += 190; s.gems += 8; /* wheel and daily gift, on average */ };
  let earned = 0;
  for (let st = 0; st < N; st++) {
    if (st % 3 === 0) day();
    const c0 = S().coins; let r, tries = 0; do { r = await play(st); tries++; close(); } while (!r.win && tries < 3);
    document.querySelectorAll('.modal').forEach(m => m.hidden = true);
    const gain = S().coins - c0; earned += gain; if (SPEND) spend();
    if ([4, 9, 14, 19, 24, 29, 34, 38].includes(st)) out.push({ snap: st + 1, save: JSON.stringify(S()) });
    out.push({ st: st + 1, tries, win: r.win, hp: r.hp, secs: r.secs, pow: D.teamPower(), rec: D.recPower(st), coins: S().coins, gain, lvl: D.clv(S().party[0] || 'dad'), dadStar: D.fstars('dad'), party: S().party.join('+'), pts: ['dad', ...S().party].map(id => D.tLeft(id)).join('/'), books: S().books || 0 });
  }
  return out; }, [N, SPEND, TUNE]);
import { writeFileSync } from 'node:fs';
for (const r of rows) { if (r.snap) writeFileSync(`${process.env.OUT || '.'}/snap_${r.snap}.json`, r.save); else console.log(JSON.stringify(r)); }
console.log(errs.slice(0, 3)); await b.close();
