// js_statements.js DOC.html [markers...]: list the top-level statements of each inline script (inside an IIFE if the script is one),
// with their offsets in the document and which markers each contains.
// node js_statements.js DOC.html list m1 m2 ...      -> table
// node js_statements.js DOC.html cut OUT.html 'scriptIdx:stmtIdx,...'   -> removes those statements
const fs = require('fs');
const parser = require('C:/dev/Wellness-Lamp/app/WellnessLamp/node_modules/@babel/parser');
let [,, file, mode, ...rest] = process.argv;
if (rest[0] && rest[0].startsWith('@')) rest = fs.readFileSync(rest[0].slice(1), 'utf8').split(/\r?\n/).filter(Boolean);
const doc = fs.readFileSync(file, 'utf8');
const scripts = []; const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/g; let m;
while ((m = re.exec(doc))) { const attrs = m[1] || ''; if (/\ssrc=/.test(attrs)) continue; scripts.push({ start: m.index + m[0].indexOf('>') + 1, code: m[2] }); }
function stmts(sc) {
  let ast; try { ast = parser.parse(sc.code, { sourceType: 'script', errorRecovery: false, allowReturnOutsideFunction: true }); } catch (e) { return { err: e.message, list: [] }; }
  let body = ast.program.body, base = 0;
  if (body.length === 1 && body[0].type === 'ExpressionStatement') {
    const e = body[0].expression, c = e.type === 'CallExpression' ? e.callee : (e.type === 'UnaryExpression' && e.argument.type === 'CallExpression' ? e.argument.callee : null);
    if (c && (c.type === 'FunctionExpression' || c.type === 'ArrowFunctionExpression') && c.body.type === 'BlockStatement') body = c.body.body;
  }
  return { list: body.map(s => ({ s: s.start, e: s.end, type: s.type })) };
}
if (mode === 'list') {
  scripts.forEach((sc, i) => {
    const r = stmts(sc); console.log(`== script ${i} @${sc.start} len ${sc.code.length}${r.err ? ' PARSE ERROR ' + r.err : ''} stmts ${r.list.length}`);
    r.list.forEach((st, j) => {
      const src = sc.code.slice(st.s, st.e); const hits = rest.filter(k => src.includes(k));
      if (rest.length && !hits.length) return;
      console.log(`  ${i}:${j} @${sc.start + st.s}-${sc.start + st.e} ${st.type} len ${st.e - st.s} [${hits.join('|')}] ${src.slice(0, 110).replace(/\s+/g, ' ')}`);
    });
  });
} else if (mode === 'cutp') {
  // cut every top-level statement starting with one of the prefixes (a JSON array in the file); each prefix must match exactly once
  const [out, pfile] = rest; const prefixes = JSON.parse(fs.readFileSync(pfile, 'utf8')); const cuts = [];
  const all = scripts.flatMap(sc => stmts(sc).list.map(st => ({ s: sc.start + st.s, e: sc.start + st.e })));
  for (const p of prefixes) {
    const ws = t => t.replace(/\s+/g, ' '), np = ws(p);
    const hit = all.filter(x => ws(doc.slice(x.s, Math.min(x.e, x.s + np.length * 2 + 40))).startsWith(np));
    if (hit.length !== 1) { console.error('prefix matched ' + hit.length + 'x: ' + p); process.exit(1); }
    cuts.push([hit[0].s, hit[0].e]);
  }
  cuts.sort((a, b) => b[0] - a[0]); let d = doc; for (const [s, e] of cuts) d = d.slice(0, s) + d.slice(e);
  fs.writeFileSync(out, d); console.log('cut', cuts.length, 'statements;', doc.length, '->', d.length);
} else if (mode === 'cut') {
  const [out, spec] = rest; const cuts = [];
  spec.split(',').filter(Boolean).forEach(p => { const [i, j] = p.split(':').map(Number); const st = stmts(scripts[i]).list[j]; if (!st) throw new Error('no ' + p); cuts.push([scripts[i].start + st.s, scripts[i].start + st.e]); });
  cuts.sort((a, b) => b[0] - a[0]); let d = doc; for (const [s, e] of cuts) d = d.slice(0, s) + d.slice(e);
  fs.writeFileSync(out, d); console.log('cut', cuts.length, 'statements;', doc.length, '->', d.length);
}
