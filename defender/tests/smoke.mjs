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
  // the save goes in before the game's own code runs, so a first empty load can't save over it
  await ctx.addInitScript(s => { if (!sessionStorage.getItem('fx')) { sessionStorage.setItem('fx', '1'); localStorage.clear(); if (s) localStorage.setItem('whydad.defender.v3', JSON.stringify(s)); } }, save);
  await p.goto(URL); await p.waitForTimeout(700);
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
  for (let i = 0; i < 16 && await p.isVisible('#comicTap'); i++) /* a tap finishes a typing line, the next turns it */ { await p.mouse.click(200, 300); await p.waitForTimeout(250); }
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
  const st = await p.evaluate(() => dbg.stings()); expect(st.length === 8, `the eight stingers load: win, lose, boss, level, and the orchestral book, forge, shine, move (${st})`);
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
  expect(await p.evaluate(() => dbg.save.coins === 4000 && dbg.save.look.sweater === 'sky' && dbg.save.wardrobe.includes('sweater:sky')), 'buying a sweater spends coins and puts it on');
  await p.click('[data-w="yard:sunflower"]'); await p.click('[data-w="yard:sunflower"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.look.yard.includes('sunflower')), 'a bought decoration goes straight out');
  await p.click('[data-w="yard:sunflower"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => !dbg.save.look.yard.includes('sunflower') && dbg.save.coins === 3000), 'tapping it again puts it away, for free');
  expect(await p.evaluate(() => document.querySelector('[data-w="hat:crown"]').disabled), 'a star look you have not earned is greyed out');
  expect(await p.evaluate(() => dbg.save.wardrobe.includes('sweater:starry') === dbg.starTotal() >= 15), 'Star Stripes arrive at 15 stars');
  await p.evaluate(() => { for (let i = 0; i < 40; i++) dbg.save.stars[i + ':hard'] = 3; dbg.starGifts(); });
  expect(await p.evaluate(() => ['sweater:starry', 'yard:rainbow', 'team:crown', 'sweater:rainbow', 'hat:crown'].every(k => dbg.save.wardrobe.includes(k))), 'enough stars hand over every star look up to 100');
  await close(); return errs;
});

await test("Dad's Picks: a free present, a look on sale and a named item, the same all day", async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), coins: 5000 });
  await p.click('[data-tab="shop"]'); await p.waitForTimeout(400);
  expect(await p.evaluate(() => document.querySelectorAll('#picksBox .offer').length === 3), 'three picks on the shelf');
  const before = await p.evaluate(() => JSON.stringify(dbg.picks()));
  await p.click('[data-tab="play"]'); await p.click('[data-tab="shop"]'); await p.waitForTimeout(300);
  expect(await p.evaluate(b => JSON.stringify(dbg.picks()) === b, before), 'reopening the Shop keeps the same picks');
  await p.click('[data-pk="0"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.picks().got[0] === 1 && document.querySelector('[data-pk="0"]') === null), 'the present is taken once');
  const c = await p.evaluate(() => { const P = dbg.picks(), [cat, id] = P.ward.split(':'); return Math.round(dbg.WARD[cat].items.find(i => i.id === id).c * .7 / 10) * 10; });
  const coins = await p.evaluate(() => dbg.save.coins);
  await p.click('[data-pk="1"]'); await p.click('[data-pk="1"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(([c, coins]) => dbg.save.coins === coins - c && dbg.save.wardrobe.includes(dbg.picks().ward), [c, coins]), 'the look costs 30% less and goes in the Wardrobe');
  await close(); return errs;
});
await test('the Store: pick 1 of 3, pets and pop styles, sets and a saved-for look', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), coins: 3000 });
  await p.click('[data-tab="shop"]'); await p.waitForTimeout(400);
  await p.evaluate(() => { const b = [...document.querySelectorAll('[data-offer]')].find(x => x.closest('.offer').textContent.includes('Lunchbox')); b.click(); b.click(); }); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelectorAll('#pick3Box [data-p3]').length === 3 && dbg.save.coins === 2700), 'a Lunchbox shows three face-up items');
  await p.click('[data-tab="play"]'); await p.click('[data-tab="shop"]'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelectorAll('#pick3Box [data-p3]').length === 3), 'leaving the Shop keeps the three');
  const n = await p.evaluate(() => dbg.save.items.length); await p.click('[data-p3="2"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(n => dbg.save.items.length === n + 1 && !dbg.save.pick3, n), 'keeping one puts it in the Bag');
  await p.click('#wardGo'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelectorAll('#pickList .setc').length === 5), 'the five sets are counted');
  await p.click('[data-w="pet:butterfly"]'); await p.click('[data-w="pet:butterfly"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.look.pet === 'butterfly'), 'a pet can be bought and worn');
  await p.click('[data-w="hat:top"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.goal === 'hat:top' && !dbg.save.wardrobe.includes('hat:top')), 'a look too dear is pinned, not bought');
  await p.click('#pickClose'); await p.click('[data-tab="play"]'); await p.waitForTimeout(400);
  expect(await p.evaluate(() => !document.querySelector('#goalBtn').hidden && document.querySelector('#goalBtn').textContent.includes('Top Hat')), 'the Play screen shows the saved-for look');
  await p.evaluate(() => dbg.startGame(1)); await p.waitForTimeout(800);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.G.paused = false; dbg.step(120); });
  expect(await p.evaluate(() => !!dbg.G.pet), 'the pet follows Dad into the arena');
  await close(); return errs;
});
await test('old saves: Club badges and Cup points become one pile of Medals', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), badges: 70, cupp: 45 });
  expect(await p.evaluate(() => dbg.save.medals === 115 && dbg.save.badges === undefined && dbg.save.cupp === undefined), 'badges and Cup points are added together, once');
  await close(); return errs;
});
await test('the victory dance plays on the stage-clear screen', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), wardrobe: ['dance:hop'], look: { sweater: 'classic', hat: 'none', team: 'none', yard: [], dance: 'hop' } });
  await p.evaluate(() => dbg.startGame(2)); await p.waitForTimeout(800);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.G.busted = 30; dbg.stageClear(); });
  await p.waitForSelector('#clearm', { state: 'visible', timeout: 5000 }); await p.waitForTimeout(400);
  const a = await p.evaluate(() => document.querySelector('#clearDad').toDataURL()); await p.waitForTimeout(150);
  const b = await p.evaluate(() => document.querySelector('#clearDad').toDataURL());
  expect(a.length > 3000 && a !== b, 'Dad is drawn and moving');
  await close(); return errs;
});
await test('every world uses its tilted arena with moving details, and ?flat goes back', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => dbg.startGame(11)); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.G.paused = false; dbg.step(30); }); await p.waitForTimeout(600);
  expect(await p.evaluate(() => dbg.G.bg && dbg.G.bg.persp === true), 'the Library draws the tilted picture');
  await p.evaluate(() => dbg.startGame(1)); await p.waitForTimeout(900);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.G.paused = false; dbg.step(30); }); await p.waitForTimeout(400);
  expect(await p.evaluate(() => dbg.G.bg && dbg.G.bg.persp === true), 'the Backyard draws its tilted picture too');
  expect(await p.evaluate(async () => (await Promise.all(Array.from({ length: 16 }, (_, i) => fetch(`assets/arena_${i + 1}p.webp`).then(r => r.ok)))).every(Boolean)), 'all 16 tilted pictures are there');
  await p.goto(URL + '&flat'); await p.waitForTimeout(700);
  await p.evaluate(() => dbg.startGame(11)); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.G.paused = false; dbg.step(30); }); await p.waitForTimeout(600);
  expect(await p.evaluate(() => dbg.G.bg && !dbg.G.bg.persp), '?flat shows the old Library');
  await close(); return errs;
});
await test('on a tilted arena no myth walks in over the far scenery; some step out of the landmark', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  const run = w => p.evaluate(async w => { dbg.startGame(w * 5 + 1); await new Promise(r => setTimeout(r, 1200)); document.querySelectorAll('.modal').forEach(m => m.hidden = true);
    const G = dbg.G; G.paused = false; dbg.step(20); G.toSpawn = []; G.breakT = 9999; G.paused = true;
    const id = Object.keys(dbg.MYTHS).find(m => dbg.MYTHS[m].kind === 'normal' && !dbg.EVENT_IDS.has(m)), D = dbg.ENTRY[w]; let top = 0, door = 0;
    for (let i = 0; i < 200; i++) { const e = dbg.spawn(id); if (D && Math.abs(e.x - D[0]) < 14 && Math.abs(e.y - D[1]) < 12) door++; else if (e.y < 250) top++; }
    return { top, door, persp: !!(G.bg && G.bg.persp) }; }, w);
  const lib = await run(2); expect(lib.persp && lib.top === 0 && lib.door === 0, `the Library: all from the sides and below (${JSON.stringify(lib)})`);
  const farm = await run(9); expect(farm.top === 0 && farm.door > 10, `the Farm: none over the barn, some out of its doors (${JSON.stringify(farm)})`);
  await close(); return errs;
});
await test('Myth Spotter: a card on first sight, a gallery on the home screen, gems for a new card', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), gems: 10, seenKinds: ['normal'], foeGot: [] });
  expect(await p.isVisible('#homeFoes') && await p.evaluate(() => !document.querySelector('#foeDot').hidden), 'the Spotter button shows a dot for a new card');
  await p.click('#homeFoes'); await p.waitForTimeout(300);
  expect(await p.evaluate(() => document.querySelectorAll('#pickList .foec').length === Object.keys(dbg.FOES).length && document.querySelectorAll('#pickList [data-foe]').length === 1), 'every kind has a tile; only met ones open');
  await p.click('[data-foe="normal"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.gems === 15 && dbg.save.foeGot.includes('normal') && !!document.querySelector('#foeDetail .foecard')), 'opening a new card pays 5 gems and shows it');
  await p.click('[data-foe="normal"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.gems === 15), 'opening it again pays nothing');
  await p.click('#pickClose');
  await p.evaluate(() => dbg.startGame(11)); await p.waitForTimeout(1000);
  const r = await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); const G = dbg.G; G.paused = false; dbg.step(30); G.toSpawn = []; G.breakT = 9999;
    const id = Object.keys(dbg.MYTHS).find(m => dbg.MYTHS[m].kind === 'hardcover' && !dbg.EVENT_IDS.has(m)), e = dbg.spawn(id); e.x = 300; e.y = 400; dbg.step(3);
    return { shown: !document.querySelector('#foe').hidden, name: document.querySelector('#foe').textContent.includes('Hardcover'), vs: !!document.querySelector('#foe .vs'), seen: dbg.save.seenKinds.includes('hardcover') }; });
  expect(r.shown && r.name && r.vs && r.seen, `a new kind in the ring shows its card with match-ups (${JSON.stringify(r)})`);
  await close(); return errs;
});
await test('the Clubhouse and the Myth Cup', async () => {
  const { p, errs, close } = await open({ ...PROGRESSED(), cupt: 0 }); // the day's free ticket makes it 1
  await p.click('#hubClub'); await p.waitForTimeout(300); await p.click('[data-cn="The Why Team"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.club.name === 'The Why Team' && dbg.clubState().jobs.length === 3 && dbg.clubMates().length === 8), 'joined a club with jobs and clubmates');
  await p.evaluate(() => { const C = dbg.clubState(); C.jobs[0].have = C.jobs[0].n; }); await p.click('[data-st="clubshop"]'); await p.click('[data-st="club"]'); await p.waitForTimeout(200);
  await p.click('[data-job="0"]'); await p.waitForTimeout(200);
  expect(await p.evaluate(() => dbg.save.medals === 10 && dbg.save.club.xp === 10), 'a club job pays medals and club xp');
  await p.click('#socClose'); await p.click('#hubCup'); await p.waitForTimeout(300); await p.click('#cupGo'); await p.waitForTimeout(800);
  expect(await p.evaluate(() => !!dbg.G.cup && dbg.save.cupt === 0 && !document.querySelector('#cupHud').hidden), 'a Cup match costs a ticket and shows the scores');
  await p.evaluate(() => { dbg.G.busted = 99; dbg.G.cup.n = 40; dbg.stageClear(); }); await p.waitForTimeout(300);
  expect(await p.evaluate(() => dbg.cupState().round === 1 && dbg.save.medals === 20 && !document.querySelector('#socm').hidden), 'winning a round moves you on and pays medals into the same wallet');
  await p.click('#socClose'); await p.waitForTimeout(300); expect(await p.isVisible('#title'), 'back home');
  await close(); return errs;
});

await test('the 3D battle prototype (?r3d) runs a match without errors', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.goto(URL + '&r3d'); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true));
  await p.evaluate(() => dbg.startGame(5)); await p.waitForTimeout(2500); await play(p, 4000);
  expect(await p.evaluate(() => !!dbg.G), 'a match is running'); await close(); return errs.filter(e => !/WebGL|404/.test(e));
});

await test('Book 2: 80 stages, its prologue, a match, and the level cap of 40 after Book 1', async () => {
  const sv = PROGRESSED(); Object.assign(sv, { unlocked: 40, cleared: [...Array(40).keys()], comics: [...Array(8).keys()].flatMap(i => [i + ':in', i + ':out', i + ':showdown']) });
  sv.chars.webster.xp = 30000; sv.comics.push('15:in', '15:showdown');
  const { p, errs, close } = await open(sv);
  await p.reload(); await p.waitForTimeout(1200);
  const info = await p.evaluate(() => ({ n: dbg.STAGES.length, first: dbg.STAGES[40].name, book: dbg.STAGES[40].book, last: dbg.STAGES[79].last, b1last: dbg.STAGES[39].last }));
  expect(info.n === 80 && info.first === 'The Kitchen 1' && info.book === 2 && info.last && info.b1last, 'two books of 40 stages, each with its last stage: ' + JSON.stringify(info));
  await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true)); await p.evaluate(() => dbg.startGame(40)); await p.waitForTimeout(800);
  expect(await p.isVisible('#comicm') && /Little Book/.test(await p.textContent('#comicTitle')), 'the Book 2 prologue');
  await play(p, 5000); expect(await p.evaluate(() => !!dbg.G || !document.querySelector('#clearm').hidden || !document.querySelector('#overm').hidden), 'a Book 2 match runs');
  for (const st of [42, 44]) { await p.evaluate(st => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.startGame(st); }, st); await play(p, 4000); } // its rough-draft and chapter-boss stages
  expect(await p.evaluate(() => dbg.charLevel(dbg.save.chars.webster.xp).L) > 30, 'friends grow past level 30 once Book 1 is done');
  const ex = await p.evaluate(() => { const S = dbg.save, w = S.chars.webster; w.star = 5; S.pages = S.pages || {}; S.pages.webster = 40; const up = dbg.starUp('webster');
    S.chars.coco = { own: true, xp: 30000, star: 1 }; S.chars.hopper.xp = 30000; S.party = ['coco', 'hopper', 'sparky'];
    return { star: w.star, up, starMax: dbg.starMax('webster'), tMax: dbg.tMax('webster'), pair: dbg.synOn(dbg.SYNERGY.find(sy => sy.name === 'Farm Breakfast')) }; });
  expect(ex.up && ex.star === 6 && ex.tMax === 4 && ex.pair, 'Book 2 extras at level 34-38: Gold Star, a fourth skill rank and a second pair-up: ' + JSON.stringify(ex));
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.startGame(79); }); await p.waitForTimeout(600); // Lady Hearsay, the finale
  await p.evaluate(() => document.querySelectorAll('.modal').forEach(m => m.hidden = true));
  const hs = await p.evaluate(() => { const G = dbg.G; if (!G) return 'no match'; G.paused = false; const b = dbg.spawn('hearsay', { x: 640, y: 200 }); G.paused = false; dbg.step(30); b.hp = b.maxhp * .2; dbg.step(60); const rage = !!b.rage; b.hp = 0; dbg.kill(b); dbg.step(30); return { finale: G.S.finale, rage, sses: G.sses}; });
  expect(hs.finale === 'hearsay' && hs.rage && hs.sses === 'done', 'Lady Hearsay is the last page, gets angry and is beaten: ' + JSON.stringify(hs));
  await close(); return errs;
});
await test('Book 2 stays closed until Book 1 is finished', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  expect(await p.evaluate(() => dbg.STAGES.length === 80 && dbg.charLevel(1e9).L === 30), '80 stages, but a level cap of 30 until Book 1 is done');
  expect(await p.evaluate(() => { const b2 = Object.keys(dbg.MYTHS).filter(id => dbg.MYTHS[id].book === 2); return b2.length >= 40 && dbg.baseMyths().every(id => !b2.includes(id)); }), 'Book 2 myths stay out of the Diary count until it opens');
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); document.querySelector('#play').click(); }); await p.waitForTimeout(600);
  expect(await p.evaluate(() => document.querySelector('#bookTabs').hidden), 'no book tabs on the map yet');
  expect(await p.evaluate(() => { dbg.save.chars.webster.xp = 1e9; dbg.save.chars.webster.star = 5; return dbg.starMax('webster') === 5 && dbg.tMax('webster') === 3 && !dbg.SYNERGY.filter(sy => sy.at).some(dbg.synOn); }), 'no Book 2 extras in Book 1');
  await p.goto(URL + '&nobook2'); await p.waitForTimeout(800);
  expect(await p.evaluate(() => dbg.STAGES.length === 40), '?nobook2 leaves Book 2 out'); await close(); return errs;
});
await test('attacks: a tank winds up before its shove lands, and a stun stops it', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.startGame(1); }); await p.waitForTimeout(1200);
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); const G = dbg.G; G.paused = false; dbg.step(40); G.toSpawn = []; G.breakT = 9999; for (const m of G.party) { m.muted = 99; for (const k in m.cds) m.cds[k] = 99; }
    const id = Object.keys(dbg.MYTHS).find(m => dbg.MYTHS[m].kind === 'tank' && !dbg.EVENT_IDS.has(m)), e = dbg.spawn(id); e.x = G.dad.x + 60; e.y = G.dad.y; e.hp = e.maxhp = 1e6; e.spd = 0; e.bonk = 99; window.__e = e; dbg.hasBump(e); G.paused = true; }); await p.waitForTimeout(900); /* its sheet loads */
  const r = await p.evaluate(() => { const G = dbg.G, e = window.__e; G.paused = false; e.bonk = 0; e.x = G.dad.x + 60; e.y = G.dad.y;
    const hp0 = G.hp; let wind = false, n = 0; while (!(e.atkA > 0) && n++ < 60) dbg.step(1); wind = e.atkA > 0 && G.hp === hp0 && dbg.hasBump(e); dbg.step(12); const hit = G.hp < hp0;
    const hp1 = G.hp; e.bonk = 0; e.atkA = 0; e.x = G.dad.x + 60; e.y = G.dad.y; e.kx = e.ky = 0; n = 0; while (!(e.atkA > 0) && n++ < 60) dbg.step(1); const again = e.atkA > 0 && G.hp === hp1; e.stun = 1; dbg.step(15);
    const b = dbg.atkBeat; e.stun = 0; dbg.hurt(e, 5, 0, G.party[0]);
    return { wind, hit, again, stunned: G.hp === hp1, rec: !!G.dad.rec, flinch: e.fl > 0, mark: G.fx.some(f => f.k === 'atkfx'), styles: Object.keys(dbg.CHARS).every(id => dbg.ATK_STYLE[id]) && b(.4, 20, 'hop').up > 5 && b(.5, 20, 'spin').rot > 3 && b(.45, 20, 'zig').side !== 0, beat: b(.15, 20).d < 0 && b(.42, 20).d > 19 && Math.abs(b(1, 20).d) < .01 }; });
  expect(r.wind && r.hit, 'the shove plays first and the hit lands on the lunge: ' + JSON.stringify(r));
  expect(r.again && r.stunned, 'a stun during the wind-up stops the hit: ' + JSON.stringify(r));
  expect(r.beat, 'an attack pulls back, strikes past its reach and returns');
  expect(r.styles, 'every friend has a signature attack, and the styles move differently');
  expect(r.rec && r.flinch && r.mark, 'Dad rocks back from a shove; a struck myth flinches and shows the hit mark: ' + JSON.stringify(r)); await close(); return errs;
});
await test('boss moves are staged: a tell that can be stunned, the move, then a tired moment', async () => {
  const { p, errs, close } = await open(PROGRESSED());
  await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.startGame(4); }); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); const G = dbg.G; G.paused = false; G.toSpawn = []; G.breakT = 9999; for (const m of G.party) { m.muted = 999; for (const k in m.cds) m.cds[k] = 999; }
    const b = G.boss || dbg.spawn('wall', { x: 220, y: 150 }); b.hp = b.maxhp = 1e7; b.x = 220; b.y = 150; b.spd = 0; b.chargeT = 99; b.moveT = .05; let n = 0;
    while (!(b.tellT > 0) && n++ < 90) dbg.step(1); const tell = b.tellT > 0; dbg.step(15); const pose = dbg.bossPose(b).sq > 0; b.stun = .5; dbg.step(3); const nope = b.tellT == null && !(b.tired > 0); b.stun = 0;
    b.moveT = .05; b.chargeT = 99; n = 0; while (!(b.tellT > 0) && n++ < 90) dbg.step(1); n = 0; while (b.tellT > 0 && n++ < 90) dbg.step(1); const tired = b.tired > 0, x0 = b.x, y0 = b.y, hp0 = b.hp;
    dbg.hurt(b, 100, 0, G.dad); const d1 = hp0 - b.hp; dbg.step(10); const still = b.x === x0 && b.y === y0; b.tired = 0; const hp1 = b.hp; dbg.hurt(b, 100, 0, G.dad); const d2 = hp1 - b.hp;
    return { tell, pose, nope, tired, still, d1, d2 }; });
  expect(r.tell && r.pose && r.nope, 'the boss hunkers down through its tell, and a stun cancels the move: ' + JSON.stringify(r));
  expect(r.tired && r.still, 'after its move the boss is out of breath and stands still: ' + JSON.stringify(r));
  expect(r.d1 > r.d2 * 0.9 && r.d1 > 100, 'a tired boss takes more: ' + JSON.stringify(r)); await close(); return errs;
});
await browser.close(); srv.close();
const bad = results.filter(r => !r.ok);
console.log(`\n${results.length - bad.length} of ${results.length} passed`);
process.exit(bad.length ? 1 : 0);
