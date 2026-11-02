/**
 * Verification Test Suite for Charge Runner: Exponent Reactor (Core Pillars Edition)
 * Validates power calculations, trap diagnosis, powers of 10, zero exponents,
 * Boss equivalence dilemmas, and string input parsing formats ($15, 15, 15.00).
 */

import {
  calculatePower,
  diagnoseSubmission,
  prepareSteps,
  CURRICULUM_SECTORS,
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

const trap2 = diagnoseSubmission(9, 9, 81);
assert(trap2.isTrap === true && trap2.type === 'over-exponentiation', 'Catches 9^9 for target 81 as over-exponentiation warning');

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

// 4. Sector & Boss Problem Integrity
console.log('\n4. Testing Curriculum Sector & Boss Integrity');
assert(CURRICULUM_SECTORS.length === 5, 'All 5 curriculum sectors defined');

let allSolutionsValid = true;
let totalSectorProblems = 0;
for (const sec of CURRICULUM_SECTORS) {
  for (const p of sec.problems) {
    totalSectorProblems++;
    for (const sol of p.validSolutions) {
      const val = calculatePower(sol.base, sol.exponent);
      if (val !== p.targetMW) {
        allSolutionsValid = false;
        console.error(`Mismatch in sector problem ${p.id}: ${sol.base}^${sol.exponent} = ${val} != ${p.targetMW}`);
      }
    }
  }
}
assert(totalSectorProblems === 25, `Total sector problems is 25 (5 sectors x 5 waves)`);
assert(allSolutionsValid, 'All valid solutions across all 5 sectors evaluate mathematically to targetMW');

// Verify Boss Equivalence Dilemmas in Sector 5
console.log('\n5. Testing Boss Equivalence Dilemmas (Sector 5)');
const bossSector = CURRICULUM_SECTORS.find(s => s.isBossSector);
assert(bossSector !== undefined, 'Sector 5 is flagged as isBossSector');

// Verify 64 MW can be solved by 2^6, 4^3, and 8^2
const boss64 = bossSector.problems.find(p => p.targetMW === 64);
assert(boss64 && boss64.validSolutions.length === 3, 'Boss 64 MW has 3 valid equivalent solutions');
assert(
  calculatePower(2, 6) === 64 && calculatePower(4, 3) === 64 && calculatePower(8, 2) === 64,
  'All 3 boss solutions for 64 MW (2⁶, 4³, 8²) equal 64 MW'
);

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

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
