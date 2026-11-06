// export_grain.js: render FINAL's paper grain (the .grain noise tile, 160 x 160) to handoff/design-system/grain.png at 2x, transparent.
// usage: node tools/export_grain.js
const { spawn } = require('child_process'); const fs = require('fs'), os = require('os'), path = require('path');
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', PORT = 9336;
const SRC = path.resolve(__dirname, '..', 'handoff', 'prototype', 'FINAL_prototype.html');
const OUT = path.resolve(__dirname, '..', 'handoff', 'design-system', 'grain.png');
const raw = fs.readFileSync(SRC, 'utf8').replace(/\\u003c/g, '<'), at = raw.indexOf("<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'>");
if (at < 0) { console.error('no grain tile in ' + SRC); process.exit(1); }
const tile = 'data:image/svg+xml;utf8,' + raw.slice(at, raw.indexOf('</svg>', at) + 6);
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'grain-'));
const edge = spawn(EDGE, ['--headless=new', '--remote-debugging-port=' + PORT, '--user-data-dir=' + prof, 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  let tabs; for (let i = 0; i < 40 && !tabs; i++) { try { tabs = await (await fetch('http://127.0.0.1:' + PORT + '/json')).json(); } catch (e) { await sleep(500); } }
  const ws = new WebSocket(tabs.find(t => t.type === 'page').webSocketDebuggerUrl); let id = 0; const wait = {};
  ws.onmessage = e => { const d = JSON.parse(e.data); if (d.id && wait[d.id]) { wait[d.id](d.result || d); delete wait[d.id]; } };
  await new Promise(r => ws.onopen = r);
  const send = (method, params) => new Promise(r => { const i = ++id; wait[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
  await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 400, deviceScaleFactor: 2, mobile: false });
  await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  const html = '<body style="margin:0;background:transparent"><div style="width:160px;height:160px;background-image:url(&quot;' + tile.replace(/"/g, '&quot;') + '&quot;)"></div></body>';
  await send('Page.navigate', { url: 'data:text/html;charset=utf-8,' + encodeURIComponent(html) }); await sleep(1500);
  const png = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 160, height: 160, scale: 1 } });
  fs.writeFileSync(OUT, Buffer.from(png.data, 'base64')); console.log('wrote ' + OUT);
  ws.close(); edge.kill(); await sleep(800); try { fs.rmSync(prof, { recursive: true, force: true }); } catch (e) {} process.exit(0);
})().catch(e => { console.error(e); edge.kill(); process.exit(1); });
