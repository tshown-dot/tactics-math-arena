/**
 * Verification Test Suite for Power Grid: LCM Circuit Breaker
 * Aligns with Core Game Design Pillars & Rule 3 verification gate.
 * Validates:
 * 1. Multi-format math input parsing ($15, 15, 15.00, etc.)
 * 2. Euclidean GCD and LCM calculations for 2 and 3+ numbers
 * 3. Grid multiple sequences and common multiple sets up to 100
 * 4. Misconception evaluation outcomes (PERFECT_LCM, HIGHER_COMMON_MULTIPLE, SINGLE_MULTIPLE, NON_MULTIPLE)
 * 5. Curriculum sector configurations & Sector 5 Boss dilemmas
 */

import {
  parseMathInput,
  gcd,
  lcm,
  lcmMultiple,
  getMultiples,
  getCommonMultiples,
  evaluatePlacement,
  inspectTile,
  EVALUATION_RESULTS,
} from './js/lcmLogic.js';

import {
  CURRICULUM_SECTORS,
  getSectorById,
  generateScenarioForSector,
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

console.log('🧪 Starting Power Grid: LCM Circuit Breaker Verification Suite...\n');

// 1. Multi-Format Input Parsing (Rule 3)
console.log('1. Testing Multi-Format Math Input Parsing ($15, 15, 15.00)');
assert(parseMathInput(15) === 15, 'Parses numeric 15');
assert(parseMathInput('15') === 15, 'Parses string "15"');
assert(parseMathInput('$15') === 15, 'Parses currency "$15"');
assert(parseMathInput('15.00') === 15, 'Parses decimal "15.00"');
assert(parseMathInput(' $15.00 ') === 15, 'Parses padded " $15.00 "');
assert(parseMathInput('$1,000') === 1000, 'Parses comma-separated "$1,000"');
assert(parseMathInput('72%') === 72, 'Parses percent notation "72%"');
assert(isNaN(parseMathInput('abc')), 'Rejects non-numeric string "abc"');
assert(isNaN(parseMathInput('')), 'Rejects empty string');
assert(isNaN(parseMathInput(null)), 'Rejects null');

// 2. GCD & LCM Mathematical Rigor
console.log('\n2. Testing GCD & LCM Mathematical Functions');
assert(gcd(12, 18) === 6, 'gcd(12, 18) = 6');
assert(gcd(15, 20) === 5, 'gcd(15, 20) = 5');
assert(gcd(7, 8) === 1, 'gcd(7, 8) = 1 (Co-Prime consecutive numbers)');

// LCM 2 numbers
assert(lcm(3, 6) === 6, 'lcm(3, 6) = 6 (Direct Multiple)');
assert(lcm(4, 12) === 12, 'lcm(4, 12) = 12 (Direct Multiple)');
assert(lcm(4, 6) === 12, 'lcm(4, 6) = 12 (Shared composite)');
assert(lcm(6, 8) === 24, 'lcm(6, 8) = 24 (Shared composite)');
assert(lcm(6, 9) === 18, 'lcm(6, 9) = 18 (Shared composite)');
assert(lcm(3, 5) === 15, 'lcm(3, 5) = 15 (Co-prime product)');
assert(lcm(6, 7) === 42, 'lcm(6, 7) = 42 (Co-prime consecutive product)');

// LCM 3 numbers
assert(lcmMultiple([2, 3, 4]) === 12, 'lcm([2, 3, 4]) = 12 (Tri-Phase)');
assert(lcmMultiple([2, 3, 5]) === 30, 'lcm([2, 3, 5]) = 30 (Tri-Phase)');
assert(lcmMultiple([3, 4, 6]) === 12, 'lcm([3, 4, 6]) = 12 (Tri-Phase)');
assert(lcmMultiple([4, 6, 8]) === 24, 'lcm([4, 6, 8]) = 24 (Tri-Phase)');
assert(lcmMultiple([12, 18, 24]) === 72, 'lcm([12, 18, 24]) = 72 (Boss Alarm Dilemma)');

// 3. Multiples Generation & Overlap
console.log('\n3. Testing Multiple Generation & Overlap Extraction');
const mult4 = getMultiples(4, 20);
assert(JSON.stringify(mult4) === JSON.stringify([4, 8, 12, 16, 20]), 'getMultiples(4, 20) returns [4, 8, 12, 16, 20]');

const common4_6 = getCommonMultiples([4, 6], 50);
assert(JSON.stringify(common4_6) === JSON.stringify([12, 24, 36, 48]), 'Common multiples of [4, 6] up to 50: [12, 24, 36, 48]');

// 4. Misconception Evaluation Outcomes
console.log('\n4. Testing Misconception Classification & Diagnostics');

// Inspect Tile Telemetry
const inspLcm = inspectTile(12, [4, 6]);
assert(inspLcm.isLcm === true && inspLcm.type === 'perfect', 'inspectTile identifies 12 as perfect LCM for [4, 6]');

const inspHigher = inspectTile(24, [4, 6]);
assert(inspHigher.isLcm === false && inspHigher.type === 'higher-multiple', 'inspectTile identifies 24 as higher multiple');

const inspPartial = inspectTile(16, [4, 6]);
assert(inspPartial.type === 'partial', 'inspectTile identifies 16 as partial multiple for 4');

const inspDead = inspectTile(17, [4, 6]);
assert(inspDead.type === 'dead', 'inspectTile identifies 17 as dead tile');

// Case A: PERFECT_LCM
const evalPerfect = evaluatePlacement(12, [4, 6], 2);
assert(evalPerfect.result === EVALUATION_RESULTS.PERFECT_LCM, '12 is PERFECT_LCM for [4, 6]');
assert(evalPerfect.isSuccess === true, 'PERFECT_LCM marked as success');
assert(evalPerfect.stabilityDamage === 0, 'No stability damage on perfect LCM');
assert(evalPerfect.scoreDelta === 200, 'Calculates score + streak bonus (100 + 2*50 = 200)');

// Multi-format input in evaluation
const evalPerfectFormatted = evaluatePlacement('$12.00', [4, 6]);
assert(evalPerfectFormatted.result === EVALUATION_RESULTS.PERFECT_LCM, 'Evaluates "$12.00" as PERFECT_LCM');

// Case B: HIGHER_COMMON_MULTIPLE (Crucial Misconception)
const evalHigher = evaluatePlacement(24, [4, 6]);
assert(evalHigher.result === EVALUATION_RESULTS.HIGHER_COMMON_MULTIPLE, '24 is HIGHER_COMMON_MULTIPLE for [4, 6]');
assert(evalHigher.isSuccess === false, 'HIGHER_COMMON_MULTIPLE is not success');
assert(evalHigher.diagnosticMisconception === 'CONFUSED_COMMON_WITH_LEAST', 'Diagnoses CONFUSED_COMMON_WITH_LEAST');
assert(evalHigher.targetLcm === 12, 'Identifies target LCM as 12');

// Case C: SINGLE_MULTIPLE (Partial Frequency)
const evalSingle = evaluatePlacement(16, [4, 6]);
assert(evalSingle.result === EVALUATION_RESULTS.SINGLE_MULTIPLE, '16 is SINGLE_MULTIPLE for [4, 6] (only multiple of 4)');
assert(evalSingle.diagnosticMisconception === 'PARTIAL_MULTIPLE_ONLY', 'Diagnoses PARTIAL_MULTIPLE_ONLY');

// Case D: NON_MULTIPLE (Dead Circuit)
const evalDead = evaluatePlacement(17, [4, 6]);
assert(evalDead.result === EVALUATION_RESULTS.NON_MULTIPLE, '17 is NON_MULTIPLE for [4, 6]');
assert(evalDead.diagnosticMisconception === 'NON_MULTIPLE', 'Diagnoses NON_MULTIPLE');

// Tri-phase evaluation
const evalTriPerfect = evaluatePlacement(30, [2, 3, 5]);
assert(evalTriPerfect.result === EVALUATION_RESULTS.PERFECT_LCM, '30 is PERFECT_LCM for tri-phase [2, 3, 5]');

const evalTriPartial = evaluatePlacement(10, [2, 3, 5]); // Multiple of 2 and 5, but not 3
assert(evalTriPartial.result === EVALUATION_RESULTS.SINGLE_MULTIPLE, '10 is partial multiple for [2, 3, 5]');

// 5. Curriculum Sectors & Boss Battles
console.log('\n5. Testing Curriculum Sectors & Boss Dilemmas');
assert(CURRICULUM_SECTORS.length === 5, '5 Sectors configured');

for (const sector of CURRICULUM_SECTORS) {
  assert(sector.timeLimit >= 45, `Sector ${sector.codename} has real-stakes time limit (${sector.timeLimit}s)`);
  assert(sector.stabilityDamagePerError >= 25, `Sector ${sector.codename} has stability stakes (${sector.stabilityDamagePerError}%)`);
  assert(sector.samplePairs.length >= 3, `Sector ${sector.codename} has ample generator pools`);

  // Verify all sample pairs have valid LCM <= 100 (fits in grid!)
  for (const pair of sector.samplePairs) {
    const valLcm = lcmMultiple(pair);
    assert(valLcm <= 100, `Pair [${pair.join(', ')}] LCM = ${valLcm} fits within 100-tile grid`);
  }
}

// Boss Sector 5 Dilemmas
const bossSector = CURRICULUM_SECTORS.find((s) => s.isBossSector);
assert(bossSector !== undefined, 'Sector 5 is flagged as isBossSector');
assert(bossSector.bossDilemmas.length === 2, 'Boss Sector contains 2 higher-order dilemmas');

const dilemmaAlarm = bossSector.bossDilemmas.find((d) => d.id === 'boss-dilemma-1');
assert(dilemmaAlarm && dilemmaAlarm.correctAnswer === 72, 'Boss Dilemma 1 alarm synchronization targets 72s');

const dilemmaGears = bossSector.bossDilemmas.find((d) => d.id === 'boss-dilemma-2');
assert(dilemmaGears && dilemmaGears.correctAnswer === 60, 'Boss Dilemma 2 gear teeth alignment targets 60');

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
