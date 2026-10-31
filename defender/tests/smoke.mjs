// Smoke tests for Why, Dad? Defender: boots the game in headless Chromium and walks through every screen, a real match,
// every attack, the story, the modes and the grown-ups' page, failing on any page error. Serves the files itself.
//
//   cd defender/tests && npm ci && npx playwright install chromium && node smoke.mjs
//   (or point CHROME_PATH at an installed Chromium and skip the install)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = createServer((q, r) => {
  let p = join(ROOT, decodeURIComponent(q.url.split('?')[0])); if (existsSync(p) && statSync(p).isDirectory()) p = join(p, 'index.html');
  if (!existsSync(p)) { r.statusCode = 404; return r.end(); }
  r.setHeader('Content-Type', MIME[extname(p)] || 'application/octet-stream'); r.end(readFileSync(p));
}).listen(0);
const URL = `http://localhost:${srv.address().port}/defender/?debug`;
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });

const day = new Date().toISOString().slice(0, 10);
// a save part-way through the game: three friends, a few items, chapter 1 done
const PROGRESSED = () => ({ unlocked: 12, cleared: [...Array(12).keys()], stars: {}, diff: 'normal', facts: ['moon', 'fish', 'duck', 'tongue', 'sugar', 'bull'], factDate: { moon: '2026-01-01', fish: '2026-01-01', duck: '2026-01-01', tongue: day, sugar: day, bull: day },
  coins: 2000, gems: 200, tix: 2, weapon: 'glass', chars: { dad: { own: true, xp: 900 }, webster: { own: true, xp: 900, star: 2 }, hopper: { own: true, xp: 900, star: 1 }, sparky: { own: true, xp: 900, star: 1 }, bumble: { own: true, xp: 300, star: 1 } },
  party: ['webster', 'hopper', 'sparky'], items: [], equip: {}, daily: { last: day, streak: 3 }, comics: ['0:in', '0:out', '1:in', '1:out', '2:in'] });

async function open(save) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/404|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await p.goto(URL); await p.evaluate(s => { localStorage.clear(); if (s) localStorage.setItem('whydad.defender.v3', JSON.stringify(s)); }, save); await p.reload(); await p.waitForTimeout(700);
  return { p, errs, close: () => ctx.close() };
}
// let a match run, answering whatever the game asks
async function play(p, ms) {
  for (let t = 0; t < ms; t += 250) { await p.waitForTimeout(250);
    if (await p.isVisible('#clearm') || await p.isVisible('#overm')) return;
    await p.evaluate(() => { for (const id of ['#levelup', '#notem', '#comicm']) { const l = document.querySelector(id); if (l && !l.hidden) (l.querySelector('#cards button') || l.querySelector('#noteGo') || l.querySelector('#comicSkip') || l.querySelector('#nope')).click(); } });
    if (await p.isVisible('#quizm')) await p.click('#ansMyth', { timeout: 300 }).catch(() => {}); }
}

// end a match on purpose: close whatever card is up (a Myth Check can be open on a slow machine), run out of Patience,
// and wait for the game-over screen
async function endMatch(p, wave) {
  await p.evaluate(w => { const G = dbg.G; for (const id of ['#quizm', '#levelup', '#notem', '#comicm']) document.querySelector(id).hidden = true;
    G.check = null; G.pendingCheck = null; G.freePicks = 0; G.paused = false; if (w != null) G.wave = w; G.hp = 0; }, wave);
  await p.waitForSelector('#overm', { state: 'visible', timeout: 8000 });
}
const results = [];
async function test(name, fn) {
  if (process.env.ONLY && !name.includes(process.env.ONLY)) return; // ONLY=Clubhouse node smoke.mjs runs just the matching tests
  const t0 = Date.now(); let ok = true, msg = '';
  try { const errs = await fn(); if (errs && errs.length) { ok = false; msg = 'page errors: ' + [...new Set(errs)].slice(0, 3).join(' | '); } }
  catch (e) { ok = false; msg = process.env.ONLY ? e.message.slice(0, 900) : e.message.split('\n')[0]; }
  results.push({ name, ok, msg }); console.log(`${ok ? '✔' : '✘'} ${name} (${((Date.now() - t0) / 1000).toFixed(1)}s)${msg ? ' — ' + msg : ''}`);
}
const expect = (c, what) => { if (!c) throw new Error('expected ' + what); };

await test('a brand-new player: home, then the prologue', async () => {
  const { p, errs, close } = await open(null);
  const tabs = await p.evaluate(() => [...document.querySelectorAll('#tabbar [data-tab]')].filter(b => !b.hidden && !b.classList.contains('locked')).map(b => b.dataset.tab).join(','));
  expect(tabs === 'play,diary', `only Play and Diary open at first, got ${tabs}`);
  expect(await p.evaluate(() => document.querySelectorAll('#tabbar [data-tab]:not([hidden])').length === 5), 'all five tabs in place, locked ones with a padlock');
  await p.click('#quickPlay'); await p.waitForTimeout(800);
  expect(await p.isVisible('#comicm'), 'the prologue to open');
  expect(await p.evaluate(() => document.querySelector('#storyImg').src.includes('story_p1')), 'the first storyboard frame');
  for (let i = 0; i < 8 && await p.isVisible('#comicTap'); i++) { await p.mouse.click(200, 300); await p.waitForTimeout(250); }
  expect(await p.isVisible('#comicGo'), "the prologue to end on Let's go");
  await close(); return errs;
});

await test('every menu screen opens', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  for (const t of ['shop', 'friends', 'bag', 'diary', 'play']) { await p.click(`#tabbar [data-tab="${t}"]`); await p.waitForTimeout(350); }
  await p.click('#tabbar [data-tab="friends"]'); await p.waitForTimeout(300); await p.click('[data-pick="webster"]'); await p.waitForTimeout(300);
  await p.click('[data-ftab="gear"]'); expect(await p.isVisible('.otiles'), "a friend's outfit row"); await p.click('[data-album="webster"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => document.querySelectorAll('.vt').length) >= 30, 'the weapon album');
  await p.click('#tabbar [data-tab="play"]'); await p.waitForTimeout(200); await p.click('#play'); await p.waitForTimeout(600);
  expect(await p.isVisible('#map'), 'the World Map');
  await close(); return errs;
});

await test('items: drop, wear, polish and forge', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  const r = await p.evaluate(() => { const S = dbg.save; for (let i = 0; i < 3; i++) S.items.push(dbg.makeItem('armor', 0)); dbg.persist();
    const before = dbg.teamPower(); S.equip.webster = { armor: S.items[0].uid }; dbg.persist(); return { before, after: dbg.teamPower(), n: S.items.length }; });
  expect(r.after > r.before, 'wearing armor to raise Team Power');
  await p.click('#tabbar [data-tab="bag"]'); await p.waitForTimeout(300); await p.click('.itile'); await p.waitForTimeout(300);
  expect(await p.isVisible('#pickm'), 'the item card'); await close(); return errs;
});

await test('a real match: myths walk in and get popped', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => dbg.startGame(6)); await p.waitForTimeout(400); await p.click('#speed', { force: true });
  await play(p, 20000); const busted = await p.evaluate(() => dbg.G.busted);
  expect(busted > 5, `myths popped (got ${busted})`); await close(); return errs;
});

await test('ranged myths: a Pelter and a Spellbook stop, wind up, and hit Dad or a friend', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  const r = await p.evaluate(async () => {
    dbg.startGame(8); const G = dbg.G; document.querySelectorAll('.modal').forEach(el => el.hidden = true); G.paused = false; G.freePicks = 0; G.toSpawn = []; G.enemies = []; G.breakT = 9999;
    for (const m of G.party) for (const k in m.cds) m.cds[k] = 999; // the team stands still so the myths live long enough to throw
    const es = [dbg.spawn('dimlight', { x: 360, y: 390 }), dbg.spawn('leftbrain', { x: 70, y: 480 })]; for (const e of es) e.hp = e.maxhp = 1e6;
    const hp0 = G.hp; let seen = 0; for (let i = 0; i < 40; i++) { dbg.step(15, 1 / 60); seen = Math.max(seen, G.eshots.length); }
    return { kinds: es.map(e => e.kind), held: es.every(e => e.hold), seen, hurt: hp0 - G.hp + G.party.filter(m => m.daze > 0).length };
  });
  expect(r.kinds.join() === 'pelter,caster', `kinds ${r.kinds}`); expect(r.held, 'both stopped at range'); expect(r.seen > 0, 'they threw something'); expect(r.hurt > 0, 'a throw landed');
  await close(); return errs;
});

await test('every attack, all 28 friends and all 7 of Dad\'s lenses', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  const n = await p.evaluate(async () => {
    const ids = Object.keys(dbg.CHARS).filter(id => id !== 'dad'), WEAP = ['glass', 'yoyo', 'bat', 'plane', 'frisbee', 'bubble', 'balloon']; let fired = 0;
    for (let g = 0; g < ids.length; g += 3) {
      dbg.save.party = ids.slice(g, g + 3); for (const id of dbg.save.party) dbg.save.chars[id] = { own: true, xp: 3000, star: 1 };
      dbg.startGame(3); const G = dbg.G; G.freePicks = 0; document.querySelector('#levelup').hidden = true; document.querySelector('#comicm').hidden = true; G.paused = false; G.breakT = 9999; G.toSpawn = [];
      for (const m of G.party) for (const a in m.ranks) m.ranks[a] = 5;
      for (const m of G.party) for (const a of (m.id === 'dad' ? (g ? [] : WEAP) : dbg.CHARS[m.id].abil)) {
        if (dbg.ABIL[a] && dbg.ABIL[a].passive) continue;
        G.enemies = []; for (const [x, y] of [[120, 300], [160, 260], [300, 520]]) { const e = dbg.spawn('moon', { x, y }); e.spd = 0; e.hp = e.maxhp = 1e5; }
        if (m.id === 'dad') dbg.save.weapon = a; m.anim = null; dbg.useAbility(m, m.id === 'dad' ? 'weapon' : a); fired++;
        await new Promise(r => setTimeout(r, 120)); }
    } return fired; });
  expect(n >= 60, `every active move and lens to fire (got ${n})`); await close(); return errs;
});

await test('Skill Trees: spend a point, then every full tree fires in a match', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { dbg.save.chars.webster.xp = 3000; dbg.persist(); }); await p.click('#tabbar [data-tab="friends"]'); await p.waitForTimeout(300); await p.click('[data-pick="webster"]'); await p.waitForTimeout(300);
  await p.click('[data-tree="webster"]'); await p.waitForTimeout(300); expect(await p.isVisible('#treem'), 'the Skill Tree');
  const before = await p.evaluate(() => ({ left: dbg.tLeft('webster'), coins: dbg.save.coins }));
  await p.click('[data-tn]:not([disabled])'); await p.waitForTimeout(200);
  const after = await p.evaluate(() => ({ left: dbg.tLeft('webster'), coins: dbg.save.coins }));
  expect(after.left === before.left - 1 && after.coins < before.coins, `a point and some coins spent (${JSON.stringify(before)} → ${JSON.stringify(after)})`);
  await p.click('#tClose');
  const hits = await p.evaluate(async () => {
    const ids = Object.keys(dbg.CHARS).filter(id => id !== 'dad'); let hits = 0;
    for (let g = 0; g < ids.length; g += 3) {
      dbg.save.party = ids.slice(g, g + 3);
      for (const id of ['dad', ...dbg.save.party]) { const tree = {}, sk = {}; for (const a of dbg.CHARS[id].abil) { tree[a] = { pow: 3, cd: 3, sharp: 3, boost: 3, pick: 1 + (g / 3) % 2, fin: 1 }; sk[a] = 3; } dbg.save.chars[id] = { own: true, xp: 30000, star: 1, tree, sk, books: 10, skFree: 0 }; }
      dbg.startGame(3); const G = dbg.G; G.freePicks = 0; for (const id of ['#levelup', '#comicm', '#quizm', '#notem']) document.querySelector(id).hidden = true; G.paused = false; G.breakT = 9999; G.toSpawn = []; G.pendingCheck = null;
      for (const m of G.party) for (const a in m.ranks) { m.ranks[a] = 5; m.cds[a] = 0; }
      G.enemies = []; for (let i = 0; i < 8; i++) { const e = dbg.spawn('moon', { x: 90 + i * 35, y: 250 + (i % 3) * 120 }); e.spd = 0; e.hp = e.maxhp = 3000; }
      await new Promise(r => setTimeout(r, 2500)); hits += G.treeHits || 0; G.paused = true; }
    return hits; });
  expect(hits > 100, `branch effects firing (got ${hits})`); await close(); return errs;
});

await test('saves: a spare copy, a save code, and a newer iCloud copy', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  // the spare copy is written a few seconds after a change; a broken main save falls back to it
  await p.evaluate(() => { dbg.save.coins = 4321; dbg.persist(); }); await p.waitForTimeout(4600);
  await p.evaluate(() => localStorage.setItem('whydad.defender.v3', '{broken')); await p.reload(); await p.waitForTimeout(1500);
  expect(await p.evaluate(() => dbg.save.coins === 4321 && dbg.save.cleared.length === 12), 'the spare copy restored');
  // a save code round trip
  const code = await p.evaluate(() => dbg.saveCode()); expect(/^WD[ZJ]1/.test(code), 'a save code');
  const back = await p.evaluate(c => dbg.readCode(c).then(s => s.coins), code); expect(back === 4321, 'the code reads back');
  await close();
  // inside the app: iCloud has more progress than this phone's brand-new game, so it loads without asking
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), q = await ctx.newPage(); q.on('pageerror', e => errs.push(e.message));
  const cloud = JSON.stringify({ ...PROGRESSED(), coins: 777 });
  await q.addInitScript(c => { window.native = { platform: 'ios', haptic: async () => {}, saves: { local: () => {}, loadLocal: async () => null, cloud: async () => true, loadCloud: async () => c } }; }, cloud);
  await q.goto(URL); await q.evaluate(() => localStorage.clear()); await q.reload(); await q.waitForTimeout(1800);
  expect(await q.evaluate(() => dbg.save.coins === 777 && dbg.save.cleared.length === 12), 'the iCloud game loaded on a new phone');
  await ctx.close(); return errs;
});

await test('home hub: patrol, quick patrol, prize wheel, chapter rewards; Dad pages from facts', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { dbg.save.patrol = { t: Date.now() - 5 * 3.6e6, qd: '', qn: 0 }; dbg.persist(); });
  const c0 = await p.evaluate(() => dbg.save.coins); await p.click('#hubPatrol'); await p.waitForTimeout(200); await p.click('#patrolGo'); await p.waitForTimeout(200);
  const c1 = await p.evaluate(() => dbg.save.coins); expect(c1 > c0, `patrol coins (${c0} → ${c1})`);
  await p.click('#patrolQuick'); await p.click('#patrolQuick'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.coins) > c1 && await p.isDisabled('#patrolQuick'), 'two quick patrols, then none');
  await p.click('#patrolClose'); await p.click('#hubWheel'); await p.waitForTimeout(200); await p.click('#wheelGo'); await p.waitForTimeout(3700);
  expect(/You won/.test(await p.textContent('#wheelWon')) && await p.isDisabled('#wheelGo'), 'a spin, once a day');
  await p.click('#wheelClose'); await p.click('#hubChests'); await p.waitForTimeout(200); expect(await p.isVisible('#chestm'), 'Chapter Rewards from home'); await p.click('#chClose');
  const dp = await p.evaluate(() => { const before = (dbg.save.pages || {}).dad || 0; dbg.startGame(2); const e = dbg.spawn('worm', { x: 220, y: 300 }); e.hp = 1; return before; });
  await p.evaluate(() => { const G = dbg.G; for (const id of ['#levelup', '#comicm', '#quizm', '#notem']) document.querySelector(id).hidden = true; G.paused = false; G.freePicks = 0; }); await p.waitForTimeout(1500);
  expect(await p.evaluate(b => dbg.save.facts.includes('worm') ? dbg.save.pages.dad === b + 1 : true, dp), 'a page in Dad\'s notebook for a new fact');
  await close(); return errs;
});

await test('Myth Master opens after Hard, stage by stage, and pays a crown', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), stars: { '0:normal': 3, '0:hard': 2, '1:normal': 3 } });
  await p.click('#play'); await p.waitForTimeout(400);
  await p.evaluate(() => { document.querySelectorAll('#pins .pin')[0].click(); }); await p.waitForTimeout(200);
  expect(!(await p.isDisabled('#diffs [data-d="master"]')), 'Myth Master open on stage 1 after Hard');
  await p.evaluate(() => { document.querySelectorAll('#pins .pin')[1].click(); }); await p.waitForTimeout(200);
  expect(await p.isDisabled('#diffs [data-d="master"]'), 'still locked on stage 2');
  const g0 = await p.evaluate(() => { dbg.save.diff = 'master'; dbg.startGame(0); for (const id of ['#comicm', '#levelup']) document.querySelector(id).hidden = true; dbg.G.freePicks = 0; return { d: dbg.G.D.name, gems: dbg.save.gems, books: dbg.save.books || 0 }; });
  expect(g0.d === 'Myth Master', 'playing on Myth Master');
  await p.evaluate(() => dbg.stageClear()); await p.waitForTimeout(400);
  const g1 = await p.evaluate(() => ({ gems: dbg.save.gems, books: dbg.save.books || 0, st: dbg.save.stars['0:master'] }));
  expect(g1.st > 0 && g1.gems >= g0.gems + 40 && g1.books === g0.books + 1, `crown prizes (${JSON.stringify(g0)} → ${JSON.stringify(g1)})`);
  await close(); return errs;
});

await test('the home screen shows the furthest world reached', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), unlocked: 22, cleared: [...Array(22).keys()] });
  const bg2 = await p.evaluate(() => [document.querySelector('#title').style.backgroundImage, dbg.STAGES[22].w]);
  expect(/home_bg_5\.(png|webp)/.test(bg2[0]), `desert backdrop on stage 23 (got ${bg2[0]}, world ${bg2[1]})`); await close(); return errs;
});

await test('the finale: the Flat Earth shield, then Sir Ever-So-Sure, the ending and the credits', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), unlocked: 39, cleared: [...Array(39).keys()], comics: ['0:in', '7:in'] });
  await p.evaluate(() => dbg.startGame(39)); await p.waitForTimeout(400);
  expect(await p.evaluate(() => !document.querySelector('#comicm').hidden && document.querySelector('#comicTitle').textContent.includes('last page')), 'the showdown plays first');
  await p.click('#comicSkip');
  const r = await p.evaluate(async () => { const G = dbg.G; document.querySelectorAll('.modal').forEach(el => el.hidden = true); G.paused = false; G.toSpawn = []; G.enemies = []; G.wave = G.S.waves - 1; G.breakT = 0; G.next = 1e9; G.freePicks = 0; // no level-up cards in the way
    const f = dbg.spawn('flat'); f.hp = 0; dbg.kill(f);
    for (let i = 0; i < 200 && !(G.sses && G.sses.id); i++) dbg.step(1, 1 / 30);
    const b = G.sses; const out = { came: !!(b && b.id === 'sses'), name: document.querySelector('#bossName').textContent };
    if (b && b.id) { b.hp = b.maxhp * .25; dbg.step(3, 1 / 30); out.rage = !!b.rage; b.hp = 0; dbg.kill(b); G.enemies = []; G.toSpawn = []; }
    for (let i = 0; i < 400 && !G.cleared; i++) dbg.step(1, 1 / 30); out.cleared = !!G.cleared; return out; });
  expect(r.came, 'he comes in when the shield pops'); expect(r.name === 'Sir Ever-So-Sure', `boss bar names him (got ${r.name})`); expect(r.rage, 'his rage phase'); expect(r.cleared, 'the stage clears');
  await p.waitForTimeout(500);
  expect(await p.evaluate(() => document.querySelector('#comicTitle').textContent.includes('Big Book of Why')), 'the ending plays');
  await p.click('#comicSkip'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => !document.querySelector('#creditsm').hidden), 'the credits roll'); await p.click('#creditsGo');
  expect(await p.evaluate(() => !document.querySelector('#clearm').hidden && dbg.save.facts.includes('sses')), 'then the stage-clear card, and his page in the Diary');
  await close(); return errs;
});

await test('the soundtrack: a piece per place, and the boss theme for a boss', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.mouse.click(20, 400); await p.waitForTimeout(1500);
  const home = await p.evaluate(() => dbg.musNow());
  await p.evaluate(() => dbg.startGame(6)); await p.waitForTimeout(1500);
  const pond = await p.evaluate(() => dbg.musNow());
  await p.evaluate(() => { const G = dbg.G; document.querySelectorAll('.modal').forEach(el => el.hidden = true); dbg.spawn(G.S.W.boss); }); await p.waitForTimeout(1500);
  const boss = await p.evaluate(() => dbg.musNow());
  const st = await p.evaluate(() => dbg.stings()); expect(st.length === 4, `the four stingers load (${st})`);
  const vp = await p.evaluate(() => { const f = dbg.MYTHS.fish.fact; dbg.voSet([dbg.vkey('Busted!', 'd'), dbg.vkey(f, 'd')]); const r = dbg.voParts('Busted! ' + f, 'd'); dbg.voSet([]); return r && r.length; }); expect(vp === 2, 'a spoken line splits into its recorded clips');
  expect(home && home.name === 'home' && home.t > 0, `home theme playing (${JSON.stringify(home)})`); expect(pond && pond.name === 'w1' && pond.t > 0, `pond theme (${JSON.stringify(pond)})`); expect(boss && boss.name === 'boss', `boss theme (${JSON.stringify(boss)})`);
  await close(); return errs;
});

await test('Auto-forge: forges every three of a kind, chaining up, and shows what it made', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), unlocked: 12, cleared: [...Array(12).keys()], seenUnlocks: ['forge'] });
  const r = await p.evaluate(() => { const S = dbg.save; S.items = []; for (let i = 0; i < 9; i++) S.items.push(dbg.makeItem('armor', 0)); S.items.push(dbg.makeMark(1, 'red')); dbg.persist();
    const n0 = S.items.length; document.querySelectorAll('.modal').forEach(m => m.hidden = true); [...document.querySelectorAll('button')].find(x => /^.*Bag$/.test(x.textContent.trim())).click();
    const b = document.querySelector('#autoForge'); const label = b && b.textContent; b.click(); b.click();
    return { label, n0, n1: S.items.length, rars: S.items.filter(i => i.type === 'armor').map(i => i.rar).sort().join(), shown: !document.querySelector('#pickm').hidden && document.querySelector('#pickTitle').textContent }; });
  expect(/3 ready/.test(r.label || ''), `button counts the forges (${r.label})`); expect(r.rars === '2', `nine Commons became one Epic (${r.rars})`); expect(r.n1 === 2, `the bookmark stays (${r.n1})`); expect(/Forged/.test(r.shown || ''), 'a summary of what it made');
  await close(); return errs;
});

await test('stage clear, the next one opens', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { dbg.startGame(12); document.querySelector('#comicm').hidden = true; document.querySelector('#levelup').hidden = true; dbg.G.freePicks = 0; dbg.stageClear(); }); await p.waitForTimeout(500);
  expect(await p.isVisible('#clearm'), 'the clear screen'); expect(await p.evaluate(() => dbg.save.cleared.includes(12)), 'stage 13 counted');
  await close(); return errs;
});

await test('every myth: a myth, a fact, a Diary topic, a source and a stage', async () => {
  const { p, errs, close } = await open(null);
  const r = await p.evaluate(() => { const ids = Object.keys(dbg.MYTHS), seen = new Set([...dbg.STAGES.flatMap(s => [...s.pool, s.boss, s.finale].filter(Boolean)), ...dbg.EVENT_IDS]); // event myths join every stage during their event
    return { n: ids.length, bad: ids.filter(id => { const M = dbg.MYTHS[id]; return !M.myth || !M.fact || !M.em || !M.name || !dbg.CATS[dbg.catOf(id)] || dbg.srcOf(id) === 'Dad' || !seen.has(id); }) }; });
  expect(r.n >= 140, `at least 140 myths, got ${r.n}`); expect(!r.bad.length, `complete myths, these are not: ${r.bad.join(', ')}`); await close(); return errs;
});
await test('Myth Check asks about a myth that is due', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => dbg.startGame(1)); await p.waitForTimeout(300); await p.click('#speed', { force: true });
  let asked = false; for (let t = 0; t < 40000 && !asked; t += 250) { await p.waitForTimeout(250); asked = await p.evaluate(() => !!(dbg.G && dbg.G.check));
    if (!asked) await p.evaluate(() => { for (const id of ['#levelup', '#notem', '#comicm']) { const l = document.querySelector(id); if (!l.hidden) (l.querySelector('#cards button') || l.querySelector('#noteGo') || l.querySelector('#comicSkip') || l.querySelector('#nope')).click(); } }); }
  expect(asked, 'a Myth Check card'); await p.click('#ansMyth'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => Object.keys(dbg.save.review || {}).length === 1), 'the answer to be scheduled'); await close(); return errs;
});

await test('Daily Myth and the Endless Stacks', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.click('#hubChall'); await p.waitForSelector('#dailyBtn', { state: 'visible', timeout: 5000 }).catch(() => {}); // wait for the card, not a fixed time
  expect(await p.isVisible('#dailyBtn') && await p.isVisible('#endlessBtn'), 'both modes in Challenges');
  await p.click('#dailyBtn'); await p.waitForTimeout(400); expect(await p.evaluate(() => !!dbg.G.twist), 'a twist'); await play(p, 3000);
  await endMatch(p); await p.click('#overHome'); await p.waitForTimeout(400);
  await p.click('#hubChall'); await p.waitForTimeout(200); await p.click('#endlessBtn'); await p.waitForTimeout(400); expect(await p.evaluate(() => dbg.G.endless), 'endless mode');
  await endMatch(p, 6);
  expect(await p.evaluate(() => dbg.save.endlessBest === 7), 'the best wave saved'); await close(); return errs;
});

await test('Chapter Chests: claim the chapter 1 chests', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.click('#play'); await p.waitForTimeout(500); await p.click('#mapChests'); await p.waitForTimeout(300);
  const coins = await p.evaluate(() => dbg.save.coins); await p.click('[data-claim="done"]'); await p.waitForTimeout(400);
  expect(await p.isVisible('#chReveal'), 'the reward reveal'); expect(await p.evaluate(c => dbg.save.coins > c && dbg.save.chests['0:done'], coins), 'the chest paid out once');
  await close(); return errs;
});

await test("the grown-ups' page, behind the gate", async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { document.querySelector('#settingsm').hidden = false; }); await p.click('#openParent'); await p.waitForTimeout(300);
  const [a, b] = (await p.textContent('#gateQ')).match(/\d+/g).map(Number); await p.fill('#gateIn', String(a * b)); await p.click('#gateOk'); await p.waitForTimeout(300);
  expect(await p.isVisible('#parentm'), "the grown-ups' page"); await close(); return errs;
});

await test('Trophies and the Wardrobe', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), coins: 5000 });
  await p.evaluate(() => { dbg.persist(); }); // trophies are checked a moment after a save: wait for it rather than a fixed time
  await p.waitForFunction(() => (dbg.save.ach || []).includes('ch1'), null, { timeout: 5000 }).catch(() => {});
  expect(await p.evaluate(() => (dbg.save.ach || []).includes('ch1')), 'clearing chapter 1 earns its trophy');
  await p.evaluate(() => { document.querySelector('#challm').hidden = false; }); await p.click('#challTrophy'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelectorAll('#pickList .trophy').length > 15 && document.querySelectorAll('#pickList .trophy.got').length >= 1), 'the trophy list');
  await p.click('#pickClose'); await p.evaluate(() => { document.querySelector('#challm').hidden = true; });
  await p.click('[data-tab="shop"]'); await p.waitForTimeout(400); await p.click('#wardGo'); await p.waitForTimeout(300);
  await p.click('[data-w="sweater:sky"]'); await p.click('[data-w="sweater:sky"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.coins === 4400 && dbg.save.look.sweater === 'sky' && dbg.save.wardrobe.includes('sweater:sky')), 'buying a sweater spends coins and puts it on');
  await p.click('[data-w="yard:sunflower"]'); await p.click('[data-w="yard:sunflower"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.look.yard.includes('sunflower')), 'a bought decoration goes straight out');
  await p.click('[data-w="yard:sunflower"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => !dbg.save.look.yard.includes('sunflower') && dbg.save.coins === 3600), 'tapping it again puts it away, for free');
  expect(await p.evaluate(() => document.querySelector('[data-w="hat:crown"]').disabled), 'too dear is greyed out');
  await close(); return errs;
});

await test('the Clubhouse and the Myth Cup', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), cupt: 0 }); // the day's free ticket makes it 1
  await p.click('#hubClub'); await p.waitForTimeout(300); await p.click('[data-cn="The Why Team"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.club.name === 'The Why Team' && dbg.clubState().jobs.length === 3 && dbg.clubMates().length === 8), 'joined a club with jobs and clubmates');
  await p.evaluate(() => { const C = dbg.clubState(); C.jobs[0].have = C.jobs[0].n; }); await p.click('[data-st="clubshop"]'); await p.click('[data-st="club"]'); await p.waitForTimeout(200);
  await p.click('[data-job="0"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.badges === 10 && dbg.save.club.xp === 10), 'a club job pays badges and club xp');
  await p.click('#socClose'); await p.click('#hubCup'); await p.waitForTimeout(300); await p.click('#cupGo'); await p.waitForTimeout(800);
  expect(await p.evaluate(() => !!dbg.G.cup && dbg.save.cupt === 0 && !document.querySelector('#cupHud').hidden), 'a Cup match costs a ticket and shows the scores');
  await p.evaluate(() => { dbg.G.busted = 99; dbg.G.cup.n = 40; dbg.stageClear(); }); await p.waitForTimeout(300);
  expect(await p.evaluate(() => dbg.cupState().round === 1 && dbg.save.cupp === 10 && !document.querySelector('#socm').hidden), 'winning a round moves you on and pays Cup points');
  await p.click('#socClose'); await p.waitForTimeout(300); expect(await p.isVisible('#title'), 'back home');
  await close(); return errs;
});

await test('the 3D battle prototype (?r3d) runs a match without errors', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.goto(URL + '&r3d'); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true));
  await p.evaluate(() => dbg.startGame(5)); await p.waitForTimeout(2500); await play(p, 4000);
  expect(await p.evaluate(() => !!dbg.G), 'a match is running'); await close(); return errs.filter(e => !/WebGL|404/.test(e));
});

await browser.close(); srv.close();
const bad = results.filter(r => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} passed`);
process.exit(bad.length ? 1 : 0);
