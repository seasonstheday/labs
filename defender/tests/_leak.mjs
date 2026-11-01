import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--no-sandbox'] }), p = await b.newPage();
await p.goto('http://localhost:8765/defender/?debug&book2'); await p.waitForTimeout(1500);
for (const st of [58, 61, 70]) {
  const r = await p.evaluate(st => { document.querySelectorAll('.modal').forEach(m => m.hidden = true); dbg.startGame(st); const G = dbg.G; const seen = {}; let t = 0, hpMin = 999;
    for (let i = 0; i < 30 * 90; i++) { if (!dbg.G || G.over || G.cleared) break; document.querySelectorAll('.modal').forEach(m => m.hidden = true); G.paused = false; dbg.step(1); t += 1/30;
      if (G.boss) seen['boss:' + G.boss.id] = 1; if (G.heat) seen.heat = 1; if (G.fog > 0) seen.fog = 1; for (const e of G.enemies) { if (e.kind === 'boss') seen['bosskind:' + e.id] = 1; } hpMin = Math.min(hpMin, G.hp); }
    return { st: G.S.name, t: Math.round(t), over: G.over, hpMin: Math.round(hpMin), seen: Object.keys(seen) }; }, st - 1);
  console.log(JSON.stringify(r));
}
await b.close();
