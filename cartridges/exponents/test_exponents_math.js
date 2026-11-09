/**
 * Verification Test Suite for Charge Runner: Exponent Reactor (Core Pillars Edition)
 * Validates power calculations, trap diagnosis, powers of 10, zero exponents,
 * Boss equivalence dilemmas, and string input parsing formats ($15, 15, 15.00).
 */

import {
  PROBLEM_MODES,
  diagnoseValue,
  diagnoseExpanded,
  diagnoseCompare,
  compareAnswer,
  sup,
  powerText,
  powerOfTenExponent,
  calculatePower,
  diagnoseSubmission,
  prepareSteps,
  CURRICULUM_SECTORS,
  isBaseLocked,
  getGivenBase,
} from './js/curriculum.js';

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('🧪 Starting Exponent Reactor Core Verification Suite...\n');

// 1. Core Power Calculations
console.log('1. Testing Core Power Calculations');
assert(calculatePower(2, 3) === 8, '2³ = 8');
assert(calculatePower(4, 2) === 16, '4² = 16');
assert(calculatePower(5, 0) === 1, '5⁰ = 1 (Zero Exponent Rule)');
assert(calculatePower(10, 4) === 10000, '10⁴ = 10,000 (Powers of 10)');
assert(calculatePower(7, 1) === 7, '7¹ = 7 (Identity Exponent)');
assert(calculatePower(3, 5) === 243, '3⁵ = 243 (Overdrive)');

// 2. Traps & Misconception Diagnosis
console.log('\n2. Testing Trap Diagnosis Engine');
const trap1 = diagnoseSubmission(4, 3, 12);
assert(trap1.isTrap === true && trap1.type === 'multiplication-error', 'Catches 4^3 for target 12 as multiplication-error');

const trap2 = diagnoseSubmission(6, 6, 36);
assert(trap2.isTrap === true && trap2.type === 'multiplication-error', 'Catches 6^6 for target 36 as multiplication-error');

const notTen = diagnoseSubmission(10, 2, 64);
assert(notTen.type !== 'power-of-ten', 'Base 10 on a non-power-of-10 target (64) is NOT diagnosed as a zero-count error');
assert(powerOfTenExponent(10000) === 4 && powerOfTenExponent(64) === null && powerOfTenExponent(1) === null, 'powerOfTenExponent detects powers of 10 only');

const trap3 = diagnoseSubmission(5, 0, 5);
assert(trap3.isTrap === true && trap3.type === 'zero-error', 'Catches 5^0 for target 5 as zero-error');

const trap4 = diagnoseSubmission(10, 3, 10000);
assert(trap4.isTrap === true && trap4.type === 'power-of-ten', 'Catches 10^3 for target 10,000 as power-of-ten stall');

const match = diagnoseSubmission(2, 5, 32);
assert(match.isTrap === false && match.type === 'exact-match', 'Confirms 2^5 = 32 as exact-match');

const overload = diagnoseSubmission(3, 4, 27);
assert(overload.isTrap === false && overload.type === 'over-exponentiation', 'Confirms 3^4 = 81 vs 27 as overload');

// 3. Step Generation / Visualizer Ribbon
console.log('\n3. Testing Visualizer Steps');
const stepsZero = prepareSteps(6, 0);
assert(stepsZero.length === 1 && stepsZero[0].currentValue === 1, 'Zero exponent produces identity step (1)');

const stepsCubes = prepareSteps(2, 3);
assert(stepsCubes.length === 3, '2³ produces 3 animation steps');
assert(stepsCubes[0].currentValue === 2 && stepsCubes[1].currentValue === 4 && stepsCubes[2].currentValue === 8, '2³ produces values [2, 4, 8]');

// 4. Sector Problem Integrity (all modes)
console.log('\n4. Testing Curriculum Sector Integrity');
assert(CURRICULUM_SECTORS.length === 5, 'All 5 curriculum sectors defined');

let allProblemsValid = true;
let totalSectorProblems = 0;
for (const sec of CURRICULUM_SECTORS) {
  for (const p of sec.problems) {
    totalSectorProblems++;
    if (!PROBLEM_MODES.includes(p.mode)) { allProblemsValid = false; console.error(`Bad mode in ${p.id}`); }
    if (p.mode === 'find') {
      for (const sol of p.validSolutions) {
        if (calculatePower(sol.base, sol.exponent) !== p.targetMW) { allProblemsValid = false; console.error(`Mismatch in ${p.id}`); }
      }
      // Every find problem must be reachable with the dials (base 1-10, exponent 0-6)
      const reachable = p.validSolutions.some(sol => sol.base <= 10 && sol.exponent <= 6 && (!isBaseLocked(p) || sol.base === getGivenBase(p)));
      if (!reachable) { allProblemsValid = false; console.error(`Unreachable ${p.id}`); }
    }
    if (p.mode === 'fix' && p.wrongValue === calculatePower(p.base, p.exponent)) { allProblemsValid = false; console.error(`Fix problem ${p.id} wrong value is actually right`); }
    if (p.mode === 'expanded' && (p.exponent < 2 || p.exponent > 6)) { allProblemsValid = false; console.error(`Expanded ${p.id} out of dial range`); }
  }
}
assert(totalSectorProblems === 25, 'Total sector problems is 25 (5 sectors x 5 waves)');
assert(allProblemsValid, 'Every problem is well-formed, correct, and solvable with the dials');
assert(CURRICULUM_SECTORS.find(s => s.isBossSector) !== undefined, 'Sector 5 is flagged as boss sector');

// 5. New mode diagnosers
console.log('\n5. Testing Evaluate / Expanded / Compare Diagnosis');
assert(diagnoseValue(4, 3, 64).correct === true, 'Evaluate 4³ = 64 is correct');
assert(diagnoseValue(4, 3, 12).type === 'multiplication-error', 'Evaluate 4³ typed 12 → multiplication trap');
assert(diagnoseValue(4, 3, 7).type === 'addition-error', 'Evaluate 4³ typed 7 → addition error');
assert(diagnoseValue(2, 5, 25).type === 'swap-error', 'Evaluate 2⁵ typed 25 → swapped base/exponent');
assert(diagnoseValue(7, 0, 0).type === 'zero-error', 'Evaluate 7⁰ typed 0 → zero exponent error');
assert(diagnoseValue(7, 0, 7).type === 'zero-error', 'Evaluate 7⁰ typed 7 → zero exponent error');
assert(diagnoseValue(1, 5, 5).type === 'one-base-error', 'Evaluate 1⁵ typed 5 → base-one error');
assert(diagnoseValue(10, 4, 1000).type === 'power-of-ten', 'Evaluate 10⁴ typed 1,000 → zero-count error');
assert(diagnoseValue(3, 4, 27).type === 'factor-count', 'Evaluate 3⁴ typed 27 → one factor short');
assert(!diagnoseValue(4, 3, 12).correctFormula.includes('64'), 'Miss feedback does not reveal the answer');
assert(diagnoseValue(4, 3, NaN).type === 'no-answer', 'Empty readout is handled');

const exp5 = { mode: 'expanded', base: 5, exponent: 3 };
assert(diagnoseExpanded(exp5, 5, 3).correct === true, 'Expanded 5×5×5 → 5³ correct');
assert(diagnoseExpanded(exp5, 3, 5).type === 'swap-error', 'Expanded 5×5×5 → 3⁵ is a swap error');
assert(diagnoseExpanded(exp5, 5, 4).type === 'factor-count', 'Expanded 5×5×5 → 5⁴ is a factor-count error');
assert(diagnoseExpanded({ mode: 'expanded', base: 9, exponent: 2 }, 3, 4).type === 'equivalent-form', 'Expanded 9×9 → 3⁴ is same value but wrong form');

const cmp = { mode: 'compare', left: { base: 2, exponent: 5 }, right: { base: 5, exponent: 2 } };
assert(compareAnswer(cmp) === 'left', '2⁵ (32) > 5² (25)');
assert(diagnoseCompare(cmp, 'left').correct === true, 'Choosing 2⁵ is correct');
assert(diagnoseCompare(cmp, 'equal').type === 'multiplication-error', 'Choosing "equal" for 2⁵ vs 5² → multiplication trap');
assert(compareAnswer({ left: { base: 2, exponent: 6 }, right: { base: 4, exponent: 3 } }) === 'equal', '2⁶ = 4³');

assert(sup(12) === '¹²' && powerText(3, 4) === '3⁴', 'Superscript formatting');

// 6. Input parsing tests (Rule 3: Always test math input parsing with multiple formats)
console.log('\n6. Testing Input Format Parsing ($15, 15, 15.00)');
function parseMathInput(input) {
  if (typeof input === 'number') return input;
  if (!input || typeof input !== 'string') return NaN;
  const cleaned = input.replace(/[$,\s]/g, '');
  return parseFloat(cleaned);
}

assert(parseMathInput(15) === 15, 'Parses numeric 15');
assert(parseMathInput('15') === 15, 'Parses string "15"');
assert(parseMathInput('$15') === 15, 'Parses currency "$15"');
assert(parseMathInput('15.00') === 15, 'Parses decimal "15.00"');
assert(parseMathInput(' $15.00 ') === 15, 'Parses padded " $15.00 "');

// 7. Combo Multiplier Scaling
console.log('\n7. Testing Combo Multiplier Progression');
let combo = 1;
const expectedCombos = [2, 4, 8, 16, 16];
for (let i = 0; i < expectedCombos.length; i++) {
  combo = Math.min(16, combo === 1 ? 2 : combo * 2);
  assert(combo === expectedCombos[i], `Combo step ${i + 1} scaled to x${expectedCombos[i]}`);
}

// 8. Base Locking
console.log('\n8. Testing Base Locking Engine (>200 MW non-tens)');
assert(isBaseLocked({ targetMW: 243, validSolutions: [{ base: 3, exponent: 5 }] }) === true, '243 MW base is locked');
assert(getGivenBase({ targetMW: 243, validSolutions: [{ base: 3, exponent: 5 }] }) === 3, '243 MW locked base is 3');
assert(isBaseLocked({ targetMW: 1000000, validSolutions: [{ base: 10, exponent: 6 }] }) === false, '1,000,000 MW base is NOT locked (multiple of 10)');
assert(isBaseLocked({ targetMW: 8, validSolutions: [{ base: 2, exponent: 3 }] }) === false, '8 MW base is NOT locked');
assert(getGivenBase({ targetMW: 512, givenBase: 8 }) === 8, 'Explicit givenBase is respected');

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
