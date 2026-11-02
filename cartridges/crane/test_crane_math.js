/**
 * Demolition Crane - Math Engine & Verification Gate Test Suite
 * Tests PEMDAS order of operations, multi-format currency/numerical input parsing,
 * level solving simulation, pedagogical misconception diagnostics, and Boss Phase validation.
 */

import {
  parseExpressionToTokens,
  getLegalNextMove,
  validateMove,
  executeDemolitionStep,
  normalizeMathInput,
  computeResult
} from './js/expressionParser.js';

import { CURRICULUM_ZONES } from './js/curriculumLevels.js';
import { BOSS_REACTOR_CHALLENGES } from './js/boss.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  [PASS] ${message}`);
  } else {
    console.error(`  [FAIL] ${message}`);
  }
}

console.log('====================================================');
console.log('🏗️ Demolition Crane: Order of Operations Math Verification');
console.log('====================================================\n');

// 1. Multiple Format Gate ($15, 15, 15.00, etc.)
console.log('--- 1. Verification Gate: Multiple Input Formats ($15, 15, 15.00) ---');
const formatVariants = ['$15', '15', '15.00', '$15.00', '  $ 15  ', '15$'];
formatVariants.forEach(variant => {
  const norm = normalizeMathInput(variant);
  const num = parseFloat(norm);
  assert(num === 15, `Input variant "${variant}" normalizes to exact value 15 (got ${num})`);

  const tokens = parseExpressionToTokens(variant);
  const hasValidNumber = tokens.length === 1 && tokens[0].type === 'number' && tokens[0].numericValue === 15;
  assert(hasValidNumber, `Token stream for "${variant}" parses as single numeric token of value 15`);
});

const exprWithFormattedNumber = parseExpressionToTokens('$15 + 4.00 * 3');
assert(exprWithFormattedNumber.length === 5, 'Expression "$15 + 4.00 * 3" parses correctly into 5 tokens');
assert(exprWithFormattedNumber[0].numericValue === 15, 'First token has numericValue 15');
assert(exprWithFormattedNumber[2].numericValue === 4, 'Second numeric token has numericValue 4');

// 2. PEMDAS Hierarchy & Tie-breaking Tests
console.log('\n--- 2. PEMDAS Hierarchy & Tie-Breaking ---');

const t1 = parseExpressionToTokens('15 + 4 × 3');
const legal1 = getLegalNextMove(t1);
assert(legal1 !== null && t1[legal1.legalIndex].value === '×', 'In "15 + 4 × 3", multiplication is legal first move');

const t2 = parseExpressionToTokens('28 - 12 ÷ 4 + 6');
const legal2 = getLegalNextMove(t2);
assert(legal2 !== null && t2[legal2.legalIndex].value === '÷', 'In "28 - 12 ÷ 4 + 6", division is legal first move');

const t3 = parseExpressionToTokens('40 ÷ 5 × 2');
const legal3 = getLegalNextMove(t3);
assert(legal3 !== null && t3[legal3.legalIndex].value === '÷', 'In "40 ÷ 5 × 2", left-to-right requires ÷ first');
const wrongMultMove = validateMove(t3, t3.find(tok => tok.value === '×').id);
assert(!wrongMultMove.isLegal && wrongMultMove.violationType === 'LEFT_TO_RIGHT', 'Targeting × in "40 ÷ 5 × 2" flags LEFT_TO_RIGHT violation');

const t4 = parseExpressionToTokens('50 - 20 - 10 + 5');
const legal4 = getLegalNextMove(t4);
assert(legal4 !== null && legal4.legalIndex === 1, 'In "50 - 20 - 10 + 5", first subtraction is legal move');

const t5 = parseExpressionToTokens('3^2 + 4 × 5');
const legal5 = getLegalNextMove(t5);
assert(legal5 !== null && t5[legal5.legalIndex].value === '^', 'In "3^2 + 4 × 5", exponent is legal first move');

const t6 = parseExpressionToTokens('4 × (12 - 5) + 6');
const legal6 = getLegalNextMove(t6);
assert(legal6 !== null && t6[legal6.legalIndex].value === '-', 'In "4 × (12 - 5) + 6", subtraction inside ( ) is legal move');
const prematureMult = validateMove(t6, t6.find(tok => tok.value === '×').id);
assert(!prematureMult.isLegal && prematureMult.violationType === 'PARENTHESIS_FIRST', 'Outer × flags PARENTHESIS_FIRST violation');

const t7 = parseExpressionToTokens('2 × [18 - (4 + 2)^2 ÷ 6]');
const legal7 = getLegalNextMove(t7);
assert(legal7 !== null && t7[legal7.legalIndex].value === '+', 'In nested expression, innermost (4 + 2) addition is legal move');

const t8 = parseExpressionToTokens('(3^2 + 7) / (5 - 1)');
const fractionBar = t8.find(tok => tok.type === 'fraction_bar');
assert(fractionBar !== undefined, 'Top-level fraction contains fraction_bar token');
const prematureFractionClick = validateMove(t8, fractionBar.id);
assert(!prematureFractionClick.isLegal && prematureFractionClick.violationType === 'FRACTION_INCOMPLETE', 'Clicking fraction bar before evaluating tiers flags FRACTION_INCOMPLETE');

// 3. Boss Dilemma Validation
console.log('\n--- 3. Zone Capstone Boss Reactor Verification ---');
BOSS_REACTOR_CHALLENGES.forEach(boss => {
  const correctOpt = boss.options.find(o => o.isCorrect);
  assert(correctOpt !== undefined, `Boss ${boss.title}: Correct option exists`);
  assert(correctOpt.value === boss.targetValue, `Boss ${boss.title}: Correct option value (${correctOpt.value}) matches target (${boss.targetValue})`);
});

// 4. Complete Demolition Simulation Across All 5 Zones
console.log('\n--- 4. Full Demolition Simulation for All Curriculum Levels ---');
CURRICULUM_ZONES.forEach(zone => {
  zone.levels.forEach(level => {
    let tokens = parseExpressionToTokens(level.rawExpression);
    let stepCount = 0;
    const maxSteps = 20;

    while (tokens.length > 1 && stepCount < maxSteps) {
      const nextMove = getLegalNextMove(tokens);
      if (!nextMove) break;
      const { newTokens, step } = executeDemolitionStep(tokens, nextMove.legalTokenId);
      tokens = newTokens;
      stepCount++;
    }

    const isComplete = tokens.length === 1 && tokens[0].type === 'number';
    assert(
      isComplete,
      `Level ${level.id} (${level.rawExpression}) demolished in ${stepCount} steps to result: ${isComplete ? tokens[0].numericValue : 'INCOMPLETE'}`
    );
  });
});

console.log('\n====================================================');
console.log(`Test Results: ${passed}/${total} assertions passed.`);
console.log('====================================================');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
