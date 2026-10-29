// node defender/tools/balance_sim.mjs [--stages=40] [--n=3] [--profiles=typical,weak,strong] [--out=dir] [--tune='{"hp":1.8}']
// (serve the repo on :8765 first). Difficulty curve, stage by stage, for players of different habits.
//
// Each profile is a "career": a fresh save plays the story in order with the game's own code, fast-forwarded through
// dbg.step(), and between stages spends like a sensible kid (the same spend() as sim_campaign.mjs: stars when the pages
// are there, chests, the three strongest friends, Skill Books, the cheapest skill node, coin ranks, best gear). So the save
// that ARRIVES at stage i is built only from the game's own reward rates (XP, coins, pages, stars, drops) up to stage i.
// At every stage that arrival save is snapshotted and the stage is played N times from the same snapshot (first tries,
// no retry snack), recording win, Patience left, lowest Patience, time, wave reached, boss health left, team power vs
// recPower(). The career then carries on from the first winning trial. If all N lose (a wall), the career grinds: a
// "day" of income plus a replay of the previous stage, then N more tries, up to 4 rounds; the rounds are logged as `grind`.
//
// Profiles (the knobs are in PROFILES below):
//   typical  one "day" (4 patrols = 16 h, wheel + daily gift) every 3 stages, 75% of quizzes right. Besides ranks and
//            Skill Trees it uses the Bag and the Store: forges three of a kind, polishes what the team wears, spends
//            Library Cards on Blank pages, gems on Backpacks, and coins above a 2000 reserve on Library Cards (600 each).
//   weak     one day every 4 stages, 60% quizzes, never opens the Bag or the Store (coins, gems and cards pile up):
//            lands roughly 20% under typical team power
//   strong   one day every stage, 90% quizzes, store spending down to a 1000 reserve: the patient kid, a stage a day
// The level-up AI takes the card the game's own "Pick tricks for me" would (evolves > reactions > new > higher rank).
// The sim never taps to focus a myth, so it is a slightly lazy player.
//
// Try a tuning: --tune='{"hp":1.6}' overrides TUNE; --patch=edits.json swaps exact strings in index.html as it is served.
// --snaps also writes each arrival save to <out>/snap_<profile>_<stage>.json.
// Output: <out>/balance_<profile>.csv (one row per trial) and <out>/balance_summary.json (one row per stage x profile).
import { chromium } from '../tests/node_modules/playwright/index.mjs';
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
const A = Object.fromEntries(process.argv.slice(2).map(s => { const m = s.match(/^--([^=]+)=?(.*)$/); return m ? [m[1], m[2]] : [s, '']; }));
const NST = +(A.stages || 40), N = +(A.n || 3), OUT = A.out || '.', TUNE = JSON.parse(A.tune || '{}');
// --patch=edits.json: [[old, new], ...] exact replacements applied to index.html as it is served (try a tuning without editing the file)
const PATCH = A.patch ? JSON.parse(readFileSync(A.patch, 'utf8')) : [];
// the Bag and Store helpers dbg doesn't export; exposing them changes nothing in play
PATCH.unshift(["if (location.search.includes('debug')) window.dbg = {", "if (location.search.includes('debug')) window.__x = { mergeInto, twinsOf, polishItem, POLISH, POLISH_MAX, itemOf, syncWeapons }; if (location.search.includes('debug')) window.dbg = {"]);
const PROFILES = {
  typical: { dayEvery: 3, quizP: .75, store: true, reserve: 2000 },
  weak:    { dayEvery: 4, quizP: .60, store: false },
  strong:  { dayEvery: 1, quizP: .90, store: true, reserve: 1000 },
  // sim_campaign.mjs's player, for comparison: no Bag or Store, and gear swaps never call syncWeapons() (see the report)
  legacy:  { dayEvery: 3, quizP: .75, store: false, noSync: true },
  legacySync: { dayEvery: 3, quizP: .75, store: false },
  // the same players, but Dad keeps a given lens type all game (the weapon type is a drop lottery and powerOf() can't see it)
  typicalGlass: { dayEvery: 3, quizP: .75, store: true, reserve: 2000, dadWeapon: 'glass' },
  typicalBubble: { dayEvery: 3, quizP: .75, store: true, reserve: 2000, dadWeapon: 'bubble' },
  weakGlass: { dayEvery: 4, quizP: .60, store: false, dadWeapon: 'glass' },
  strongGlass: { dayEvery: 1, quizP: .90, store: true, reserve: 1000, dadWeapon: 'glass' },
};
const want = (A.profiles || 'typical,weak,strong').split(',');
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });

async function career(name) {
  const P = PROFILES[name], ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await ctx.route(/\/defender\/(index\.html)?\?debug$/, async route => { const r = await route.fetch(); let html = await r.text();
    for (const [a, b] of PATCH) { if (!html.includes(a)) throw new Error('patch not found: ' + a.slice(0, 80)); html = html.replace(a, b); } await route.fulfill({ response: r, body: html }); });
  await p.goto('http://localhost:8765/defender/?debug'); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(800);
  // set up the in-page helpers once
  await p.evaluate(([P, TUNE]) => {
    const D = dbg, { mergeInto, twinsOf, polishItem, POLISH, POLISH_MAX, itemOf, syncWeapons } = window.__x; Object.assign(D.TUNE, TUNE); const S = () => D.save; Object.assign(S().opt, { calm: true, voice: false, labels: false, sfx: false, music: false });
    const H = window.__bal = {};
    // the card "Pick tricks for me" would take: evolve 4, reaction 3, new 1, +0.2 a rank
    const score = b => (b.querySelector('.tag.evo') ? 4 : b.querySelector('.tag') ? 3 : 0) + (b.querySelector('.who.new') ? 1 : 0) + +((((b.querySelector('.who') || {}).textContent || '').match(/Rank (\d)/) || [0, 1])[1]) * .2;
    H.close = () => { for (const id of ['#comicm', '#notem', '#dailym', '#levelup', '#quizm', '#drawm', '#roomm', '#cloudm']) { const m = document.querySelector(id); if (!m || m.hidden) continue;
      if (id === '#levelup') { const cs = [...m.querySelectorAll('#cards button')]; if (cs.length) { cs.sort((a, b) => score(b) - score(a))[0].click(); continue; } const go = document.querySelector('#nope'); if (go && !go.disabled) { go.click(); continue; } }
      if (id === '#quizm') { const q = D.G && D.G.quiz; const right = q ? (Math.random() < P.quizP ? q.isFact : !q.isFact) : true; document.querySelector(right ? '#ansFact' : '#ansMyth').click(); continue; }
      const btn = m.querySelector('#comicSkip, #noteGo, #dailyClaim, #cloudKeep'); if (btn) btn.click(); else m.hidden = true; } };
    H.play = async st => { D.startGame(st); await new Promise(r => setTimeout(r, 20)); let t = 0;
      let lo = Infinity; const pow = D.teamPower(), rec = D.recPower(st);
      while (t < 30 * 60 * 10) { H.close(); const G = D.G; if (!G || G.over || G.cleared) break; if (G.paused) { H.close(); if (G.paused && !G.over && !G.cleared) G.paused = false; }
        for (let j = 0; j < 10; j++) { const n = D.step(30); t += n; lo = Math.min(lo, D.G.hp); if (n < 30) break; } await new Promise(r => setTimeout(r, 0)); }
      const G = D.G; const r = { win: !!G.cleared, hp: Math.round(Math.max(0, G.hp) / G.maxhp * 100), minHp: Math.round(Math.max(0, Math.min(lo, G.hp)) / G.maxhp * 100), maxhp: G.maxhp, secs: Math.round(G.t), wave: G.wave + 1, waves: G.S.waves,
        boss: G.boss ? Math.round(Math.max(0, G.boss.hp) / G.boss.maxhp * 100) : null, busted: G.busted, lvl: G.lvl, pow, rec, timeout: !G.cleared && !G.over };
      document.querySelectorAll('.modal').forEach(m => m.hidden = true); return r; };
    H.snap = () => JSON.stringify(S());
    H.restore = js => { const s = S(); for (const k of Object.keys(s)) delete s[k]; Object.assign(s, JSON.parse(js)); D.persist(); };
    H.spend = () => { const s = S(); const D2 = D;
      // stars: the party first (Blank pages too), then anyone whose own pages are enough
      if (P.store) { while ((s.tix || 0) > 0) { s.tix--; s.blank = (s.blank || 0) + 3; }
        while (s.gems >= 60) { s.gems -= 60; s.items.push(itemOf(2), itemOf(1), itemOf(1)); } }
      for (const id of s.party) while (D.chr(id).own && D.starUp(id)) {}
      { const bl = s.blank; s.blank = 0; for (const id of Object.keys(D.CHARS)) { while (D.chr(id).own && D.starUp(id)) {} } s.blank += bl; }
      for (let w = 0; w < 8; w++) for (const C of D.CHESTS) if (C.ok(w) && !D.chestGot(w, C.k)) D.claimChest(w, C.k);
      const cm = document.querySelector('#chestm'); if (cm) cm.hidden = true;
      const owned = Object.keys(D.CHARS).filter(id => id !== 'dad' && D.chr(id).own).sort((a, c) => D.powerOf(c) - D.powerOf(a)); s.party = owned.slice(0, 3);
      for (const id of s.party) while ((s.books || 0) > 0) { s.books--; D.chr(id).books = (D.chr(id).books || 0) + 1; }
      for (const id of ['dad', ...s.party]) { const c = D.chr(id); let guard = 60;
        while (D.tLeft(id) > 0 && guard--) { let best = null;
          for (const a of D.CHARS[id].abil) { if (D.clv(id) < D.UNLOCK_AT[D.CHARS[id].abil.indexOf(a)]) continue;
            for (const k of D.tNodes(a)) { const r = D.tRank(id, a, k); if (r < D.TREE_MAX) { const cost = D.skCost(r); if (!best || cost < best.cost) best = { a, k, cost, r }; } }
            if (!D.tPicked(id, a) && D.tNodes(a).reduce((n, k) => n + D.tRank(id, a, k), 0) >= D.tPickAt(a) && (!best || D.T_PICK_COST < best.cost * 2)) best = { a, pick: 1, cost: D.T_PICK_COST };
            if (D.tPicked(id, a) && D.tFull(id, a) && !D.tHasFin(id, a)) best = { a, fin: 1, cost: D.T_FIN_COST }; }
          if (!best || s.coins < best.cost) break; s.coins -= best.cost; const B = D.tBr(id, best.a);
          if (best.pick) B.pick = 1; else if (best.fin) B.fin = 1; else if (best.k === 'sig') c.sk[best.a] = best.r + 1; else B[best.k] = best.r + 1; } }
      for (const id of ['dad', ...s.party]) { const R = id === 'dad' ? D.DADRANKS : D.WRANKS, c = D.chr(id); for (const r in R) { const cost = R[r].base + (c[r] || 0) * R[r].step; if ((c[r] || 0) < 5 && s.coins - cost > 150) { s.coins -= cost; c[r] = (c[r] || 0) + 1; } } }
      const wear = () => { for (const id of ['dad', ...s.party]) for (const t of ['armor', 'book', 'weapon']) { const used = new Set(Object.values(s.equip).flatMap(e => Object.values(e))); const list = s.items.filter(i => i.type === t && (t !== 'weapon' || i.owner === id) && !used.has(i.uid)).sort((x, y) => y.rar - x.rar || (y.val || 0) - (x.val || 0)); const cur = D.equipOf(id)[t]; const curIt = cur && s.items.find(i => i.uid === cur); if (list[0] && (!curIt || list[0].rar > curIt.rar || (list[0].rar === curIt.rar && (list[0].val || 0) > (curIt.val || 0) && !curIt.lv))) D.equipOf(id)[t] = list[0].uid; } }; wear();
      if (P.store) { // the Bag: forge three of a kind (the worn one keeps its look), re-wear the best, polish what's worn, then Library Cards
        const worn = () => new Set(Object.values(s.equip).flatMap(e => Object.values(e)));
        for (let guard = 0; guard < 200; guard++) { const W = worn(); const it = [...s.items].filter(i => i.type !== 'mark' && i.rar < 3).sort((a, b) => (W.has(b.uid) ? 1 : 0) - (W.has(a.uid) ? 1 : 0) || a.rar - b.rar).find(i => twinsOf(i).length >= 2);
          if (!it) break; const use = twinsOf(it).sort((x, y) => (x.lv || 0) - (y.lv || 0) || x.val - y.val).slice(0, 2); let refund = 0; for (const o of use) refund += o.spent || 0; s.items = s.items.filter(o => !use.includes(o)); mergeInto(it); s.coins += refund; }
        wear();
        for (let guard = 0; guard < 200; guard++) { const W = worn(); const list = s.items.filter(i => W.has(i.uid) && (i.lv || 0) < POLISH_MAX).sort((a, b) => POLISH[a.rar][a.lv || 0] - POLISH[b.rar][b.lv || 0]); if (!list[0] || s.coins - POLISH[list[0].rar][list[0].lv || 0] < P.reserve) break; polishItem(list[0]); }
        while (s.coins - 600 >= P.reserve) { s.coins -= 600; s.blank = (s.blank || 0) + 3; }
        for (const id of s.party) while (D.chr(id).own && D.starUp(id)) {} }
      if (!P.noSync) syncWeapons(); if (P.dadWeapon) { s.weapon = P.dadWeapon; s.dadTheme = null; } D.persist(); };
    H.day = () => { const s = S(); for (const h of [6, 6, 2, 2]) { const g = D.patrolPay(h); s.coins += g.coins; s.gems += g.gems; s.blank = (s.blank || 0) + g.blank; for (const id of ['dad', ...s.party]) D.chr(id).xp += g.xp; } s.coins += 190; s.gems += 8; };
    H.info = st => { const s = S(), rar = ['dad', ...s.party].flatMap(id => Object.values(D.equipOf(id)).map(u => (s.items.find(i => i.uid === u) || {}).rar)).filter(x => x != null);
      return { party: s.party.join('+'), lvl: ['dad', ...s.party].map(id => D.clv(id)).join('/'), stars: ['dad', ...s.party].map(id => D.fstars(id)).join('/'), gearRar: rar.length ? +(rar.reduce((a, b) => a + b, 0) / rar.length).toFixed(2) : 0, gearN: rar.length, weapon: s.weapon + (s.dadTheme ? '-' + s.dadTheme : ''), cweap: s.party.map(id => s.cweap[id] || '').join('+'), coins: s.coins, gems: s.gems, blank: s.blank || 0, owned: Object.keys(D.CHARS).filter(id => id !== 'dad' && D.chr(id).own).length, boss: D.STAGES[st].boss || '', idx: D.STAGES[st].idx }; };
  }, [P, TUNE]);
  const rows = [], summary = [], t0 = Date.now();
  for (let st = 0; st < NST; st++) {
    if (st % P.dayEvery === 0) await p.evaluate(() => __bal.day());
    await p.evaluate(() => __bal.spend());
    let grind = 0, won = null, trials = [];
    while (true) {
      const snap = await p.evaluate(() => __bal.snap()), info = await p.evaluate(st => __bal.info(st), st);
      if ('snaps' in A && !grind) writeFileSync(`${OUT}/snap_${name}_${st + 1}.json`, snap); // the arrival save, for poking at by hand
      const batch = [];
      for (let k = 0; k < N; k++) {
        if (k) await p.evaluate(js => __bal.restore(js), snap);
        const r = await p.evaluate(st => __bal.play(st), st); r.trial = k + 1; r.grind = grind; Object.assign(r, info); batch.push(r);
        if (r.win && won == null) won = await p.evaluate(() => __bal.snap());
      }
      trials.push(...batch); if (won || grind >= 4) break;
      // a wall: a day of income, replay the stage before, spend, try again
      await p.evaluate(js => __bal.restore(js), snap); grind++;
      await p.evaluate(async st => { __bal.day(); if (st > 0) await __bal.play(st - 1); __bal.spend(); }, st);
    }
    if (won) await p.evaluate(js => __bal.restore(js), won); else { // never won: carry on anyway, as if cleared, so later stages still get measured
      await p.evaluate(st => { const s = dbg.save; if (!s.cleared.includes(st)) s.cleared.push(st); s.unlocked = Math.max(s.unlocked, st + 1); dbg.persist(); }, st); }
    for (const r of trials) rows.push({ profile: name, stage: st + 1, ...r });
    const first = trials.filter(r => r.grind === 0), wins = first.filter(r => r.win), avg = (a, f) => a.length ? Math.round(a.reduce((s, r) => s + f(r), 0) / a.length) : null;
    const S0 = first[0];
    summary.push({ profile: name, stage: st + 1, idx: S0.idx + 1, boss: S0.boss, winRate: +(wins.length / first.length).toFixed(2), hpLeft: avg(wins, r => r.hp), minHp: avg(first, r => r.minHp), secs: avg(first, r => r.secs), lostAtWave: avg(first.filter(r => !r.win), r => r.wave), bossLeft: avg(first.filter(r => !r.win && r.boss != null), r => r.boss), pow: S0.pow, rec: S0.rec, ratio: +(S0.pow / S0.rec).toFixed(2), grind, party: S0.party, weapon: S0.weapon, cweap: S0.cweap, lvl: S0.lvl, stars: S0.stars, gearRar: S0.gearRar, owned: S0.owned });
    const L = summary.at(-1); console.log(`${name.padEnd(7)} st${String(st + 1).padStart(2)} win ${L.winRate} hp ${L.hpLeft ?? '-'} min ${L.minHp} ${L.secs}s pow ${L.pow}/${L.rec} (${L.ratio}) grind ${grind} ${L.party} lv ${L.lvl} [${Math.round((Date.now() - t0) / 1000)}s]`);
  }
  const cols = Object.keys(rows[0]); writeFileSync(`${OUT}/balance_${name}.csv`, [cols.join(','), ...rows.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n'));
  if (errs.length) console.log(name, 'page errors:', [...new Set(errs)].slice(0, 5));
  await ctx.close(); return summary;
}
const all = (await Promise.all(want.map(career))).flat();
writeFileSync(`${OUT}/balance_summary.json`, JSON.stringify(all, null, 1));
await browser.close();
