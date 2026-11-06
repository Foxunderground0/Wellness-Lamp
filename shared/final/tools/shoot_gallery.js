// shoot_gallery.js: photograph every card of the gallery and rebuild handoff/design-system/component-gallery.html from the pictures.
// 1. build_gallery.py --live writes a page of live phones to a temp folder
// 2. headless Edge opens it with ?check&shoot; after each batch of cards has settled, every card is captured at 2x into design-system/gallery/
// 3. build_gallery.py (no --live) writes the page of pictures
// usage: node tools/shoot_gallery.js [path/to/FINAL_screens.html]
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const TOOLS = __dirname, FINAL_SHOTS = path.resolve(TOOLS, '..', 'handoff', 'design-system', 'gallery');
const PY = process.platform === 'win32' ? 'python' : 'python3', SRC = process.argv.slice(2).filter(a => !a.startsWith('--only='));
const ONLY = (process.argv.find(a => a.startsWith('--only=')) || '').slice(7);   // --only=c-me-button,c-playing-bars: a trial run into tools/_trial
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'galshoot-')), LIVE = path.join(tmp, 'live.html'), PORT = 9333;
const SHOTS = ONLY ? path.join(TOOLS, '_trial') : FINAL_SHOTS;
execFileSync(PY, [path.join(TOOLS, 'build_gallery.py'), ...SRC, '--live', '--out', LIVE], { stdio: 'inherit' });
fs.rmSync(SHOTS, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });

const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + path.join(tmp, 'profile'),
  '--hide-scrollbars', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let tabs; for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json(); } catch (e) { await sleep(500); } }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); let id = 0; const wait = {};
  ws.onmessage = m => { const d = JSON.parse(m.data); if (d.id && wait[d.id]) { wait[d.id](d.result || d); delete wait[d.id]; } };
  await new Promise(r => ws.onopen = r);
  const send = (method, params) => new Promise(r => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async e => ((await send('Runtime.evaluate', { expression: e, returnByValue: true })).result || {}).value;
  await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: 'file:///' + LIVE.replace(/\\/g, '/') + '?check&shoot&batch=4' + (ONLY ? '&only=' + ONLY : '') });
  let shot = 0;
  for (const t0 = Date.now(); ; ) {
    await sleep(400);
    const ready = await ev('window.__READY ? JSON.stringify(window.__READY) : null');
    if (ready) {
      // the phones are same-origin iframes: their own scrollIntoView / focus calls scroll this page too, so hold the page still while shooting
      for (const k of JSON.parse(ready)) {
        const where = `(function(){ const v = document.querySelector('.st[data-k="${k}"] .vp'); const b = v.getBoundingClientRect();
          return JSON.stringify({x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, sy: scrollY, inView: b.top >= 0 && b.bottom <= innerHeight}); })()`;
        let png = null;
        for (let tries = 0; tries < 6 && !png; tries++) {
          await ev(`(function(){ const v = document.querySelector('.st[data-k="${k}"] .vp'); v.scrollIntoView({block: 'center'}); window.__LOCK = scrollY;
            if (!window.__locker) { window.__locker = true; addEventListener('scroll', function(){ if (window.__LOCK != null && scrollY !== window.__LOCK) scrollTo(0, window.__LOCK); }); } })()`);
          await sleep(200);
          const r = JSON.parse(await ev(where));
          const shotNow = await send('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
          const after = JSON.parse(await ev(where));
          if (r.inView && after.sy === r.sy) png = shotNow;
        }
        if (!png) { console.log('\ncould not hold', k, 'in view'); continue; }
        fs.writeFileSync(path.join(SHOTS, k.replace(':', '-') + '.png'), Buffer.from(png.data, 'base64')); shot++;
      }
      await ev('window.__LOCK = null; window.__READY = null; window.__GO = true');
    }
    const s = JSON.parse(await ev('window.__CHECK ? JSON.stringify({done: __CHECK.done, n: __CHECK.n, got: __CHECK.res.length}) : "null"') || 'null');
    if (s) process.stdout.write('\r' + s.got + '/' + s.n + ' cards, ' + shot + ' pictures   ');
    if (s && s.done) break;
    if (Date.now() - t0 > 40 * 60 * 1000) { console.log('\ntimed out'); break; }
  }
  const res = JSON.parse(await ev('JSON.stringify(window.__CHECK.res)'));
  const bad = res.filter(r => !r.ok);
  console.log('\n' + res.length + ' cards, ' + (res.length - bad.length) + ' cropped as specified');
  bad.forEach(r => console.log('  not found:', r.k, r.id, '|', r.err, r.kept ? '(picture keeps an earlier crop)' : '', r.run ? 'run error: ' + r.run : '', '| sel:', r.sel));
  ws.close(); edge.kill(); await sleep(1500);
  try { fs.rmSync(tmp, { recursive: true, force: true }); } catch (e) {}
  if (ONLY) { console.log('trial pictures in', SHOTS); process.exit(0); }
  execFileSync(PY, [path.join(TOOLS, 'build_gallery.py'), ...SRC], { stdio: 'inherit' });
  process.exit(0);
})().catch(e => { console.error(e); edge.kill(); process.exit(1); });
