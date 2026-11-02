/**
 * Unit Test: Remediation Queue Consequence & Anti-Spam Logic
 */

import { CURRICULUM_ZONES } from './js/curriculumLevels.js';
import { validateMove, parseExpressionToTokens } from './js/expressionParser.js';

let passed = 0;
let total = 0;

function assert(cond, msg) {
  total++;
  if (cond) {
    passed++;
    console.log(`  [PASS] ${msg}`);
  } else {
    console.error(`  [FAIL] ${msg}`);
  }
}

console.log('--- Testing Anti-Spam Queue Logic ---');

// 1. Check that illegal move is detected and gives valid violation
const tokens = parseExpressionToTokens('15 + 4 × 3');
const plusToken = tokens.find(t => t.value === '+');
const validation = validateMove(tokens, plusToken.id);
assert(!validation.isLegal, 'Targeting + in "15 + 4 × 3" is illegal');
assert(validation.violationType === 'MULT_DIV_PRIORITY', 'Flags MULT_DIV_PRIORITY violation');

// 2. Remediation Queue Simulation
const remediationQueue = [];
const MAX_CAP = 3;

function handleMistake(expr) {
  if (!remediationQueue.some(q => q.expression === expr)) {
    remediationQueue.push({ expression: expr });
  }
  return remediationQueue.length >= MAX_CAP;
}

// First mistake
let lockout = handleMistake('15 + 4 × 3');
assert(remediationQueue.length === 1 && !lockout, '1st mistake: queued (1/3), no lockout');

// Second mistake
lockout = handleMistake('28 - 12 ÷ 4 + 6');
assert(remediationQueue.length === 2 && !lockout, '2nd mistake: queued (2/3), no lockout');

// Duplicate mistake on same problem shouldn't double count
lockout = handleMistake('28 - 12 ÷ 4 + 6');
assert(remediationQueue.length === 2, 'Duplicate mistake on same expression does not duplicate queue');

// Third mistake
lockout = handleMistake('40 ÷ 5 × 2');
assert(remediationQueue.length === 3 && lockout, '3rd mistake: queued (3/3), triggers SAFETY LOCKOUT!');

console.log(`\nQueue Logic Test: ${passed}/${total} assertions passed.`);
if (passed === total) process.exit(0);
else process.exit(1);
