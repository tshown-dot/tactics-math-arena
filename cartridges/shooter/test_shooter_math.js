import { doTermsMatch, getTermSignature, WAVES } from './js/problems.js';
import assert from 'assert';

console.log('====================================================');
console.log('🎯 Term Popper (Like Terms) Math Verification');
console.log('====================================================\n');

// 1. Verification Gate: Constants & Currency ($15, 15, 15.00)
console.log('--- 1. Verification Gate: Multiple Input Formats ($15, 15, 15.00) ---');
assert.strictEqual(getTermSignature('15'), '', '15 should have constant signature');
assert.strictEqual(getTermSignature('$15'), '', '$15 should have constant signature');
assert.strictEqual(getTermSignature('15.00'), '', '15.00 should have constant signature');
assert.strictEqual(getTermSignature('$15.00'), '', '$15.00 should have constant signature');
assert.strictEqual(doTermsMatch('$15', '15.00'), true, '$15 and 15.00 are like terms (constants)');
assert.strictEqual(doTermsMatch('7', '-3'), true, '7 and -3 are like terms (constants)');
console.log('  ✅ PASS: Constants and currency formats normalize and combine correctly\n');

// 2. Linear Terms Combining
console.log('--- 2. Linear Terms Combining ---');
assert.strictEqual(doTermsMatch('3x', '-5x'), true, '3x and -5x match');
assert.strictEqual(doTermsMatch('3x', 'x'), true, '3x and x match');
assert.strictEqual(doTermsMatch('2y', '-4y'), true, '2y and -4y match');
assert.strictEqual(doTermsMatch('3x', '2y'), false, '3x and 2y do NOT match');
assert.strictEqual(doTermsMatch('3x', '7'), false, '3x and constant 7 do NOT match');
console.log('  ✅ PASS: Linear variable terms match correctly\n');

// 3. Exponent Terms (Powers of x)
console.log('--- 3. Exponent Terms (Powers of x, y) ---');
assert.strictEqual(doTermsMatch('3x²', '-x²'), true, '3x² and -x² match');
assert.strictEqual(doTermsMatch('2x³', '-x³'), true, '2x³ and -x³ match');
assert.strictEqual(doTermsMatch('x²', 'x'), false, 'x² and x do NOT match');
assert.strictEqual(doTermsMatch('2x³', '3x²'), false, 'x³ and x² do NOT match');
assert.strictEqual(doTermsMatch('2y²', '3x²'), false, 'y² and x² do NOT match');
console.log('  ✅ PASS: Variable powers require matching base and exponent\n');

// 4. Wave Curriculum Structure
console.log('--- 4. Wave Curriculum Validation ---');
assert.strictEqual(WAVES.length, 3, 'Should have 3 stages/waves');
WAVES.forEach(wave => {
  assert(wave.terms.length >= 8, `Wave ${wave.waveNumber} should have at least 8 terms`);
  assert(wave.targetClusters > 0, `Wave ${wave.waveNumber} target clusters should be > 0`);
});
console.log('  ✅ PASS: All 3 curriculum stages configured properly\n');

console.log('========================================');
console.log('All Term Popper Math Tests Passed! 🎯');
console.log('========================================');
