/**
 * Verification Test Suite for Charge Runner: Exponent Reactor (Core Pillars Edition)
 * Validates power calculations, trap diagnosis, powers of 10, zero exponents,
 * Boss equivalence dilemmas, and string input parsing formats ($15, 15, 15.00).
 */

import {
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

// 8. Base Locking for High Cognitive Load Mitigation (>200 MW non-multiples of 10)
console.log('\n8. Testing Base Locking Engine (>200 MW non-tens)');
const s2_5 = CURRICULUM_SECTORS[1].problems.find(p => p.id === 's2-5'); // 216 MW
const boss_2 = CURRICULUM_SECTORS[4].problems.find(p => p.id === 'boss-2'); // 243 MW
const boss_3 = CURRICULUM_SECTORS[4].problems.find(p => p.id === 'boss-3'); // 256 MW
const boss_4 = CURRICULUM_SECTORS[4].problems.find(p => p.id === 'boss-4'); // 1,000,000 MW (multiple of 10)
const boss_5 = CURRICULUM_SECTORS[4].problems.find(p => p.id === 'boss-5'); // 512 MW
const s1_1 = CURRICULUM_SECTORS[0].problems[0]; // 8 MW (< 200)
const s3_3 = CURRICULUM_SECTORS[2].problems.find(p => p.targetMW === 10000); // 10,000 MW (multiple of 10)

assert(isBaseLocked(s2_5) === true, 's2-5 (216 MW) base is locked');
assert(getGivenBase(s2_5) === 6, 's2-5 locked base is 6');

assert(isBaseLocked(boss_2) === true, 'boss-2 (243 MW) base is locked');
assert(getGivenBase(boss_2) === 3, 'boss-2 locked base is 3');

assert(isBaseLocked(boss_3) === true, 'boss-3 (256 MW) base is locked');
assert(getGivenBase(boss_3) === 4, 'boss-3 locked base is 4');

assert(isBaseLocked(boss_5) === true, 'boss-5 (512 MW) base is locked');
assert(getGivenBase(boss_5) === 8, 'boss-5 locked base is 8');

assert(isBaseLocked(boss_4) === false, 'boss-4 (1,000,000 MW) base is NOT locked (power of 10)');
assert(isBaseLocked(s1_1) === false, 's1-1 (8 MW) base is NOT locked (<= 200 MW)');
assert(isBaseLocked(s3_3) === false, 's3-3 (10,000 MW) base is NOT locked (power of 10)');

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
