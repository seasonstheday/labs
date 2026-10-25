import { chromium } from '../../defender/tests/node_modules/playwright/index.mjs';
const O = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await (await b.newContext({ viewport: { width: 440, height: 956 }, deviceScaleFactor: 3, serviceWorkers: 'block' })).newPage();
p.on('pageerror', e => console.log('ERR', e.message));
const save = (u, extra = {}) => p.evaluate(([u, extra]) => { const ids = ['webster', 'hopper', 'sparky', 'puddles', 'pip', 'nilla', 'luna', 'goldie', 'echo', 'prickles']; const chars = { dad: { own: true, xp: 6000 } }; for (const id of ids) chars[id] = { own: true, xp: 6000, star: 2 };
  localStorage.setItem('whydad.defender.v3', JSON.stringify(Object.assign({ unlocked: u, cleared: [...Array(u).keys()], chars, party: ['hopper', 'sparky', 'puddles'], comics: ['0:in','0:out','1:in','1:out','2:in','2:out','3:in','3:out','4:in','4:out','5:in','5:out','6:in','6:out','7:in'], facts: Object.keys(dbg.MYTHS).slice(0, 70), daily: { last: new Date().toISOString().slice(0, 10), streak: 1 }, coins: 2400, gems: 180, seenUnlocks: ['friends','shop','patrol','chests','bag','missions','wheel','power','polish','daily','month','families','tree','forge','endless'] }, extra))); }, [u, extra]);
await p.goto('http://localhost:8765/defender/?debug'); await p.waitForTimeout(600);
const clean = () => p.evaluate(() => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); if (!document.querySelector('#nofps')) { const st = document.createElement('style'); st.id = 'nofps'; st.textContent = '#fps,.build{display:none!important}'; document.head.appendChild(st); } });
// 1 and 2: battles caught at a busy moment (lots of myths, something flying)
for (const [st, name, want] of [[13, '1_battle', 8], [21, '2_fact', 10]]) {
  await save(st + 1); await p.reload(); await p.waitForTimeout(1200); await clean();
  await p.evaluate(st => { dbg.startGame(st); const G = dbg.G; document.querySelectorAll('.modal').forEach(m => m.hidden = true); G.paused = false; G.freePicks = 0; G.next = 1e9; for (const m of G.party) for (const a in m.ranks) m.ranks[a] = Math.max(m.ranks[a], 3); }, st);
  for (let i = 0; i < 120; i++) { await p.waitForTimeout(250); const ok = await p.evaluate(([want, toast]) => { const G = dbg.G; document.querySelectorAll('.modal').forEach(m => { if (!m.hidden) { m.hidden = true; G.paused = false; } }); return G.enemies.length >= want && G.fx.some(f => f.k === 'beam' || f.k === 'bolt' || f.k === 'tongue') && (!toast || !document.querySelector('#toast').hidden); }, [want, name === '1_battle']); if (ok) break; }
  await p.evaluate(() => { dbg.G.paused = true; }); await clean(); await p.screenshot({ path: O + "/" + name + ".png" });
}
// 3 the villain showdown story
await save(39, { comics: ['0:in', '7:in'] }); await p.reload(); await p.waitForTimeout(1200); await clean(); await p.evaluate(() => { dbg.startGame(39); }); await p.waitForTimeout(500); await p.evaluate(() => { for (let i = 0; i < 3; i++) document.querySelector('#comicm').click(); }); await p.waitForTimeout(600); await p.screenshot({ path: `${O}/3_story.png` });
// 4 friends
await save(20); await p.reload(); await p.waitForTimeout(1200); await clean(); await p.evaluate(() => [...document.querySelectorAll('#tabbar button')].find(x => /Friends/.test(x.textContent)).click()); await p.waitForTimeout(700); await p.screenshot({ path: `${O}/4_friends.png` });
// 5 diary
await p.evaluate(() => [...document.querySelectorAll('#tabbar button')].find(x => /Diary/.test(x.textContent)).click()); await p.waitForTimeout(700); await p.screenshot({ path: `${O}/5_diary.png` });
// 6 home
await save(22); await p.reload(); await p.waitForTimeout(1500); await clean(); await p.waitForTimeout(400); await p.screenshot({ path: `${O}/6_home.png` });
// 7 world map
await p.evaluate(() => [...document.querySelectorAll('button')].find(x => /World Map/.test(x.textContent)).click()); await p.waitForTimeout(800); await p.screenshot({ path: `${O}/7_map.png` });
await b.close();
