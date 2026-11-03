/**
 * Verification Test Suite for Vault Breaker: GCF Tumbler (Tightened Core Pillars Edition)
 * Validates factor pairs, live common factor bridge, smart pin tile generation,
 * GCF distributive factoring breakdown, co-prime traps, boss dilemmas,
 * and multi-format input parsing ($15, 15, 15.00).
 */

import {
  parseMathInput,
  parseFactorPairString,
  getFactorPairs,
  getAllFactorsSorted,
  getCommonFactors,
  getDiscoveredFactors,
  getDiscoveredCommonFactors,
  generateCandidateTiles,
  getGCF,
  get3WayGCF,
  validateFactor,
  validateFactorPair,
  evaluateMasterKeySelection,
} from './js/factorLogic.js';

import { CURRICULUM_SECTORS } from './js/curriculum.js';

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

console.log('🧪 Starting Vault Breaker: GCF Tumbler Verification Suite...\n');

// 1. Multi-format math input parsing (Rule 3)
console.log('1. Testing Multi-Format Math Input Parsing ($15, 15, 15.00)');
assert(parseMathInput(15) === 15, 'Parses numeric 15');
assert(parseMathInput('15') === 15, 'Parses string "15"');
assert(parseMathInput('$15') === 15, 'Parses currency "$15"');
assert(parseMathInput('15.00') === 15, 'Parses decimal "15.00"');
assert(parseMathInput(' $15.00 ') === 15, 'Parses padded " $15.00 "');
assert(parseMathInput('$1,000') === 1000, 'Parses comma-separated "$1,000"');
assert(isNaN(parseMathInput('abc')), 'Rejects non-numeric string "abc"');
assert(isNaN(parseMathInput('')), 'Rejects empty string');

// Pair string parser
const pairParsed1 = parseFactorPairString('3 x 8');
assert(pairParsed1 && pairParsed1.a === 3 && pairParsed1.b === 8, 'Parses "3 x 8"');

const pairParsed2 = parseFactorPairString('$3.00 * $8.00');
assert(pairParsed2 && pairParsed2.a === 3 && pairParsed2.b === 8, 'Parses "$3.00 * $8.00"');

const pairParsed3 = parseFactorPairString('4, 4');
assert(pairParsed3 && pairParsed3.a === 4 && pairParsed3.b === 4, 'Parses comma-separated "4, 4"');

// 2. Factor Pairs and Rainbow Logic
console.log('\n2. Testing Factor Pair Generation & Rainbow Pairs');
const pairs4 = getFactorPairs(4);
assert(pairs4.length === 2, '4 has 2 factor pairs');
assert(pairs4[0].a === 1 && pairs4[0].b === 4, '4 pair 1: 1 × 4');
assert(pairs4[1].a === 2 && pairs4[1].b === 2 && pairs4[1].isSquare === true, '4 pair 2: 2 × 2 is a square factor');

const pairs16 = getFactorPairs(16);
assert(pairs16.length === 3, '16 has 3 factor pairs');
assert(pairs16.some(p => p.isSquare && p.a === 4 && p.b === 4), '16 identifies 4 × 4 as square factor');

const pairs24 = getFactorPairs(24);
assert(pairs24.length === 4, '24 has 4 factor pairs: 1x24, 2x12, 3x8, 4x6');

const pairs48 = getFactorPairs(48);
assert(pairs48.length === 5, '48 has 5 factor pairs: 1x48, 2x24, 3x16, 4x12, 6x8');

const pairs72 = getFactorPairs(72);
assert(pairs72.length === 6, '72 has 6 factor pairs: 1x72, 2x36, 3x24, 4x18, 6x12, 8x9');

// 3. Live Common Factor Bridge & Smart Pin Tile Matrix
console.log('\n3. Testing Live Common Factor Bridge & Smart Pin Tile Matrix');
const unlockedA = [{ a: 1, b: 12 }, { a: 3, b: 4 }];
const unlockedB = [{ a: 1, b: 16 }, { a: 4, b: 4 }];
const liveShared = getDiscoveredCommonFactors(unlockedA, unlockedB);
assert(
  JSON.stringify(liveShared) === JSON.stringify([1, 4]),
  'Live Common Factor Bridge detects [1, 4] when (1,12),(3,4) and (1,16),(4,4) are unlocked'
);

for (const sector of CURRICULUM_SECTORS) {
  for (const vault of sector.vaults) {
    const tiles = generateCandidateTiles(vault.numA, vault.numB);
    const allA = getAllFactorsSorted(vault.numA);
    const allB = getAllFactorsSorted(vault.numB);
    const includesAllA = allA.every(f => tiles.includes(f));
    const includesAllB = allB.every(f => tiles.includes(f));
    assert(
      includesAllA && includesAllB && (tiles.length === 12 || tiles.length === 16),
      `Pin Tile Matrix for (${vault.numA}, ${vault.numB}) contains 100% of true factors plus distractors (${tiles.length} tiles)`
    );
  }
}

// 4. Common Factors and GCF Calculations
console.log('\n4. Testing Common Factors and GCF Calculations');
assert(getGCF(4, 12) === 4, 'GCF(4, 12) = 4 (Direct Multiple)');
assert(getGCF(6, 18) === 6, 'GCF(6, 18) = 6 (Direct Multiple)');
assert(getGCF(12, 16) === 4, 'GCF(12, 16) = 4');
assert(getGCF(18, 24) === 6, 'GCF(18, 24) = 6');
assert(getGCF(24, 36) === 12, 'GCF(24, 36) = 12');
assert(getGCF(30, 45) === 15, 'GCF(30, 45) = 15');
assert(getGCF(15, 16) === 1, 'GCF(15, 16) = 1 (Co-Prime consecutive numbers)');
assert(getGCF(20, 21) === 1, 'GCF(20, 21) = 1 (Co-Prime consecutive numbers)');
const common15_16 = getCommonFactors(15, 16);
assert(
  common15_16.length === 1 && common15_16[0] === 1,
  'Common factors of 15 & 16 is strictly [1]'
);
assert(getGCF(48, 72) === 24, 'GCF(48, 72) = 24 (Boss Dreadnought)');
assert(get3WayGCF(24, 36, 60) === 12, '3-Way GCF(24, 36, 60) = 12 (Boss 3-way dilemma)');

// 5. Explicit Factor Pair Input Validation (Both Numbers Entered)
console.log('\n5. Testing Explicit Factor Pair Input Validation (a × b = target)');
const validPair1 = validateFactorPair(24, 3, 8);
assert(validPair1.isValid && validPair1.pair.a === 3 && validPair1.pair.b === 8, '3 × 8 for 24 is valid');

const validPairInverted = validateFactorPair(24, 8, 3);
assert(validPairInverted.isValid && validPairInverted.pair.a === 3 && validPairInverted.pair.b === 8, '8 × 3 for 24 canonically aligns to 3 × 8');

const validSquare = validateFactorPair(16, '$4.00', '4');
assert(validSquare.isValid && validSquare.pair.isSquare === true, '"$4.00" × "4" for 16 is valid square pair');

const alreadyFoundPairs = [{ a: 3, b: 8 }];
const duplicatePair = validateFactorPair(24, 8, 3, alreadyFoundPairs);
assert(duplicatePair.isValid && duplicatePair.isAlreadyFound === true, 'Detects duplicate factor pair');

const mismatchPair = validateFactorPair(24, 3, 7);
assert(!mismatchPair.isValid && mismatchPair.diagnosticCode === 'PARTIAL_FACTOR_A', '3 × 7 for 24 diagnoses partial factor (3 is factor, but 24/3 = 8)');

const bothWrongPair = validateFactorPair(24, 5, 5);
assert(!bothWrongPair.isValid && bothWrongPair.product !== 24, '5 × 5 for 24 diagnoses product mismatch');

const valRemainder = validateFactor(24, 5);
assert(!valRemainder.isValid && valRemainder.remainder === 4, 'Legacy helper: non-factor 5 for 24 yields remainder 4');

// 6. Master Key Strike Torque & Distributive Property Breakdown
console.log('\n6. Testing Master Key Torque & GCF Distributive Breakdown');
// Target: 24 and 36, GCF = 12. Common factors: 1, 2, 3, 4, 6, 12
const strikeGCF = evaluateMasterKeySelection(12, 24, 36);
assert(strikeGCF.isGCF === true && strikeGCF.torqueRatio === 1.0, 'Selecting exact GCF (12) provides maximum torque');
assert(
  strikeGCF.distributiveBreakdown === '24 + 36 = 12(2 + 3)',
  'Returns Distributive Property factoring breakdown: "24 + 36 = 12(2 + 3)"'
);

const strikeCommonInsufficient = evaluateMasterKeySelection(6, 24, 36);
assert(
  strikeCommonInsufficient.isGCF === false &&
  strikeCommonInsufficient.isCommonFactor === true &&
  strikeCommonInsufficient.remainingGCF === 2,
  'Selecting 6 for (24, 36) diagnoses that remaining quotients (4 and 6) still share factor 2'
);

const strikeInvalid = evaluateMasterKeySelection(8, 24, 36);
assert(
  strikeInvalid.isGCF === false &&
  strikeInvalid.isCommonFactor === false,
  'Selecting non-common factor 8 diagnoses access denied'
);

// 7. Curriculum Sector Verification
console.log('\n7. Testing Curriculum Sector Configuration');
assert(CURRICULUM_SECTORS.length === 5, 'All 5 curriculum sectors defined');

let totalVaults = 0;
for (const sector of CURRICULUM_SECTORS) {
  assert(sector.timeLimit >= 40, `Sector ${sector.id} has real-stakes time limit (${sector.timeLimit}s)`);
  assert(sector.alarmPerError >= 20, `Sector ${sector.id} has alarm stakes (${sector.alarmPerError}%)`);
  for (const vault of sector.vaults) {
    totalVaults++;
    const gcf = getGCF(vault.numA, vault.numB);
    assert(gcf >= 1, `Vault ${vault.vaultName} has valid GCF (${gcf})`);
  }
}
assert(totalVaults === 9, 'Total of 9 structured vaults across 5 sectors');

const bossSector = CURRICULUM_SECTORS.find(s => s.isBossSector);
assert(bossSector !== undefined, 'Sector 5 is flagged as isBossSector');
const bossVault = bossSector.vaults[0];
assert(bossVault.bossDilemmas.length === 2, 'Boss vault contains 2 higher-order dilemmas');

console.log(`\n========================================`);
console.log(`Results: ${passedTests}/${totalTests} tests passed`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
