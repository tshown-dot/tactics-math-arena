/**
 * Unit Test Suite: Boss Castle · Siege of the Expression Colossus (Topic 3 capstone)
 *
 * Runs the game's own math code, pulled straight out of index.html, so the tests check
 * exactly what students play. The browser-only part of the script is skipped because
 * `window` is undefined here.
 *
 * Verifies:
 * 1. Number input parsing ($15, 15, 15.00, spaces, bad input)
 * 2. Every lesson plate (3-1 to 3-7, GCF and LCM) generates valid questions, 2,000 each:
 *    numeric answers are whole, non-negative, and re-checked independently;
 *    choice questions have exactly one right answer, and no distractor means the same thing
 * 3. Mistake diagnosis gives the targeted hint for common errors
 * 4. Phase 2 combos: two steps, step 2 builds on step 1, GCF-or-LCM is always included
 * 5. Every lesson in Topic 3 has a plate, and hub hooks are present
 */

import { readFileSync } from 'fs';
import vm from 'vm';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const api = vm.runInNewContext(`${script}
;({ parseNum, equivFn, gcd, lcm, LESSONS, makeQ, CHAINS, makeChain, pickChains, MISTAKES, PLATES:typeof PLATES==='undefined'?null:PLATES,
    gGcf, gLcm, gPemdas, gEval, gExpEval, CORE_HITS })`, { console });
const { parseNum, equivFn, gcd, lcm, LESSONS, makeQ, CHAINS, makeChain, pickChains, MISTAKES, CORE_HITS } = api;

let passed = 0;
let failed = 0;
function assert(condition, name) {
  if (condition) { console.log(`  ✓ ${name}`); passed++; }
  else { console.error(`  ✗ FAIL: ${name}`); failed++; }
}
const strip = (h) => String(h).replace(/<[^>]+>/g, '');

console.log('\n--- TEST 1: Number Input Parsing ---');
assert(parseNum('15') === 15, '"15" → 15');
assert(parseNum('15.00') === 15, '"15.00" → 15');
assert(parseNum('$15') === 15, '"$15" → 15');
assert(parseNum(' 15 ') === 15, '" 15 " → 15');
assert(parseNum('1,000') === 1000, '"1,000" → 1000');
assert(parseNum('7.5') === 7.5, '"7.5" → 7.5');
assert(parseNum('') === null && parseNum('.') === null && parseNum('1.2.3') === null && parseNum('x') === null, 'Rejects empty and malformed input');

/** Checks one question; returns a list of problems (empty if fine). */
function checkQ(q) {
  const errs = [];
  if (!LESSONS.some((l) => l.id === q.lesson)) errs.push(`unknown lesson ${q.lesson}`);
  if (!q.prompt || !strip(q.prompt).trim()) errs.push('empty prompt');
  if (!q.explain) errs.push('no explanation');
  if (q.kind === 'num') {
    if (!Number.isInteger(q.answer) || q.answer < 0) errs.push(`answer ${q.answer} is not a whole number ≥ 0`);
    if (q.js) { const v = Function(`return (${q.js})`)(); if (Math.abs(v - q.answer) > 1e-9) errs.push(`answer ${q.answer} ≠ ${q.js} = ${v}`); }
    if (q.fn === 'gcf' && q.answer !== gcd(...q.pair)) errs.push('GCF wrong');
    if (q.fn === 'lcm' && q.answer !== lcm(...q.pair)) errs.push('LCM wrong');
    if (!strip(q.explain).includes(String(q.answer))) errs.push('explanation does not show the answer');
    const [key, msg] = q.diag(q.answer + 1);
    if (!MISTAKES[key] || !msg) errs.push(`diag gave unknown key ${key}`);
  } else if (q.kind === 'choice') {
    const right = q.options.filter((o) => o.correct);
    if (right.length !== 1) errs.push(`${right.length} correct options`);
    const htmls = q.options.map((o) => o.html);
    if (new Set(htmls).size !== htmls.length) errs.push('duplicate options');
    if (q.options.length < 2 || q.options.length > 4) errs.push(`${q.options.length} options`);
    q.options.filter((o) => !o.correct).forEach((o) => {
      if (!o.why) errs.push(`distractor ${strip(o.html)} has no explanation`);
      if (!MISTAKES[o.key]) errs.push(`distractor ${strip(o.html)} has unknown key ${o.key}`);
      if (q.target && o.f && !o.equivalent && equivFn(q.target, o.f)) errs.push(`distractor ${strip(o.html)} means the same as the answer`);
    });
    if (q.target && right[0] && right[0].f && !equivFn(q.target, right[0].f)) errs.push('correct option does not match target');
  } else errs.push(`unknown kind ${q.kind}`);
  return errs;
}

console.log('\n--- TEST 2: Armor Plates (2,000 questions each) ---');
for (const l of LESSONS) {
  const errs = new Set();
  for (let i = 0; i < 2000; i++) checkQ(makeQ(l.id)).forEach((e) => errs.add(e));
  assert(errs.size === 0, `${l.code} ${l.tag}: every question is valid${errs.size ? ' → ' + [...errs].slice(0, 3).join('; ') : ''}`);
}

// Independent checks of the comparison question (3-1) and the parts question (3-4)
let cmpOk = true; let partsOk = true;
for (let i = 0; i < 2000; i++) {
  const q = makeQ('3-1');
  if (q.meta && q.meta.x) {
    const { x, y } = q.meta; const X = x ** y; const Y = y ** x;
    const want = X > Y ? 0 : Y > X ? 1 : 2;
    if (!q.options[want].correct) cmpOk = false;
  }
  const p = makeQ('3-4');
  if (p.meta && p.meta.answer && !p.options.find((o) => o.correct && o.html === p.meta.answer)) partsOk = false;
}
assert(cmpOk, '3-1 "Which is greater?" marks the truly greater power (or "equal")');
assert(partsOk, '3-4 parts questions mark the right coefficient/constant');

console.log('\n--- TEST 3: Mistake Diagnosis ---');
let found = { expMul: false, gcfLcm: false, gcfNotGreatest: false, lcmProduct: false, pemdasLtr: false, evalConcat: false };
for (let i = 0; i < 3000; i++) {
  const e = api.gExpEval(); const m = e.js.match(/(\d+)\*\*(\d+)/); const b = +m[1], x = +m[2];
  if (b * x !== e.answer && e.diag(b * x)[0] === 'expMul') found.expMul = true;
  const g = api.gGcf(); const [a, c] = g.pair;
  if (g.diag(lcm(a, c))[0] === 'gcfLcm') found.gcfLcm = true;
  if (g.answer % 2 === 0 && g.diag(g.answer / 2)[0] === 'gcfNotGreatest') found.gcfNotGreatest = true;
  const L = api.gLcm(); const [p, r] = L.pair;
  if (p * r !== L.answer && L.diag(p * r)[0] === 'lcmProduct') found.lcmProduct = true;
  const pe = api.gPemdas(); const mm = pe.js.match(/^(\d+)\+(\d+)\*(\d+)$/);
  if (mm && pe.diag((+mm[1] + +mm[2]) * +mm[3])[0] === 'pemdasLtr') found.pemdasLtr = true;
  const ev = api.gEval(); const em = ev.js.match(/^(\d+)\*(\d+)\+(\d+)$/);
  if (em && ev.diag(Number(em[1] + em[2]) + +em[3])[0] === 'evalConcat') found.evalConcat = true;
}
Object.entries(found).forEach(([k, v]) => assert(v, `Diagnoses "${k}": ${MISTAKES[k]}`));

console.log('\n--- TEST 4: Phase 2 Combos (500 each) ---');
for (const c of CHAINS) {
  const errs = new Set();
  for (let i = 0; i < 500; i++) {
    const steps = makeChain(c.id);
    if (steps.length !== 2) errs.add('not two steps');
    steps.forEach((q) => checkQ(q).forEach((e) => errs.add(e)));
    if (steps[1].kind !== 'num') errs.add('step 2 is not a numeric strike');
    // Step 2 evaluates the step-1 answer: plug its value into the right option's expression
    const right = steps[0].options.find((o) => o.correct);
    if (right.f && steps[1].js) {
      const k = Number((strip(steps[1].prompt).match(/= (\d+)\s*\.?$/) || [])[1]);
      if (Number.isFinite(k) && Math.abs(right.f(k, 0) - steps[1].answer) > 1e-9) errs.add('step 2 does not match step 1');
    }
    if (c.id === 'tool') {
      const isLcm = steps[1].fn === 'lcm';
      if (!steps[0].options.find((o) => o.correct).html.includes(isLcm ? 'LCM' : 'GCF')) errs.add('tool choice does not match story');
    }
  }
  assert(errs.size === 0, `${c.icon} ${c.name}: every combo is valid${errs.size ? ' → ' + [...errs].slice(0, 3).join('; ') : ''}`);
}
let toolAlways = true; let threeDistinct = true;
for (let i = 0; i < 500; i++) { const p = pickChains(); if (p[0] !== 'tool') toolAlways = false; if (new Set(p).size !== 3) threeDistinct = false; }
assert(toolAlways && threeDistinct, 'Every siege has 3 different combos, always including GCF or LCM?');
assert(CORE_HITS === 6, 'The Core takes 6 hits (3 combos × 2 steps)');

console.log('\n--- TEST 5: Coverage & Hub Hooks ---');
const codes = LESSONS.map((l) => `${l.code} ${l.tag}`);
assert(JSON.stringify(LESSONS.map((l) => l.id)) === JSON.stringify(['3-1', '3-2G', '3-2L', '3-3', '3-4', '3-5', '3-6', '3-7']), `One plate per stage: ${codes.join(', ')}`);
assert(html.includes("toTown({type:'CARTRIDGE_READY'})"), 'Announces CARTRIDGE_READY to the hub');
assert(html.includes("d.type!=='HUB_INIT'") && html.includes('p.isMuted'), 'Follows the hub mute setting');
assert(html.includes("toTown({type:'CARTRIDGE_EXIT_REQUEST'})"), 'Has Return to Town');
assert(html.includes("type:'CARTRIDGE_COMPLETE'") && html.includes("lessonId:'G06_U03_BOSS'"), 'Save & Return reports the boss lesson ID');
assert(/if\(IN_TOWN\)btns\.push\(\{label:'SAVE &amp; RETURN TO TOWN/.test(html) || html.includes("if(IN_TOWN)btns.push({label:'SAVE & RETURN TO TOWN"), 'Save & Return only shows inside Expression Town, after victory');

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`================================`);
if (failed > 0) process.exit(1);
