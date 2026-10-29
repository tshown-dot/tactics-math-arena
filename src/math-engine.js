/**
 * enVision 2.0 Math Companion (Grade 7 Topic 3)
 * Lesson 3-1: Analyze Percents of Numbers
 * 
 * Math Engine & Scaffolding
 * Dependencies: Zero (Pure Vanilla JavaScript / Node.js compatible)
 */

/**
 * Parses user input or expected answer into structured math representations.
 * Handles string cleanup, whitespace, currency signs ($), percent signs (%),
 * and fractions (e.g., 1/4, 7/100).
 *
 * @param {string|number} input
 * @returns {{ raw: number, mathValue: number, hasPercent: boolean, hasCurrency: boolean, isFraction: boolean } | null}
 */
function parseMathInput(input) {
  if (input === null || input === undefined) return null;
  let s = String(input).trim();
  if (s === '') return null;

  // Remove commas for numbers like 1,000
  s = s.replace(/,/g, '');

  // Detect and strip currency signs ($)
  let hasCurrency = false;
  if (s.startsWith('$')) {
    hasCurrency = true;
    s = s.slice(1).trim();
  } else if (s.endsWith('$')) {
    hasCurrency = true;
    s = s.slice(0, -1).trim();
  }

  // Detect and strip percent signs (%)
  let hasPercent = false;
  if (s.endsWith('%')) {
    hasPercent = true;
    s = s.slice(0, -1).trim();
  }

  // Parse fractions (e.g., "1/4", "7/100", "-3/5")
  const fractionMatch = s.match(/^([+-]?\d+(?:\.\d+)?)\s*\/\s*([+-]?\d+(?:\.\d+)?)$/);
  if (fractionMatch) {
    const num = parseFloat(fractionMatch[1]);
    const den = parseFloat(fractionMatch[2]);
    if (den === 0 || isNaN(num) || isNaN(den)) return null;
    const quotient = num / den;
    return {
      raw: quotient,
      mathValue: hasPercent ? quotient / 100 : quotient,
      hasPercent,
      hasCurrency,
      isFraction: true
    };
  }

  const num = Number(s);
  if (isNaN(num)) return null;

  return {
    raw: num,
    mathValue: hasPercent ? num / 100 : num,
    hasPercent,
    hasCurrency,
    isFraction: false
  };
}

/**
 * Pure evaluation function that parses and compares inputs accurately:
 * - Handles string cleanup (spaces, commas)
 * - Leading/trailing currency signs ($)
 * - Trailing percent signs (%)
 * - Decimal/fraction equivalents (e.g., accepting 0.25, 25%, and 1/4 when applicable)
 * - Tolerance comparison for floating-point values
 *
 * @param {string|number} userInput - The answer submitted by the student
 * @param {string|number|Array|Object} expectedAnswer - The expected solution or problem definition
 * @returns {boolean} True if the answer is equivalent; false otherwise
 */
function evaluateAnswer(userInput, expectedAnswer) {
  // Support array of acceptable answers
  if (Array.isArray(expectedAnswer)) {
    return expectedAnswer.some(exp => evaluateAnswer(userInput, exp));
  }

  // Support problem object containing expectedAnswer or answer field
  if (expectedAnswer && typeof expectedAnswer === 'object') {
    if ('expectedAnswer' in expectedAnswer) {
      return evaluateAnswer(userInput, expectedAnswer.expectedAnswer);
    }
    if ('answer' in expectedAnswer) {
      return evaluateAnswer(userInput, expectedAnswer.answer);
    }
  }

  const u = parseMathInput(userInput);
  const e = parseMathInput(expectedAnswer);

  if (!u || !e) return false;

  const EPSILON = 1e-6;
  const isClose = (a, b) => Math.abs(a - b) < EPSILON;

  // 1. Match by true mathematical value (e.g., 0.25 == 25% == 1/4; 0.07 == 7% == 7/100; $15 == 15)
  if (isClose(u.mathValue, e.mathValue)) {
    return true;
  }

  // 2. Percent input flexibility: if expected is a percent (e.g., "25%"), student typing "25" without "%" is accepted
  if (e.hasPercent && isClose(u.raw, e.raw)) {
    return true;
  }

  // 3. Trailing percent cleanup: student typing "25%" when expected is 25 or vice versa
  if (u.hasPercent && !e.hasPercent && isClose(u.raw, e.raw)) {
    return true;
  }

  // 4. Currency and raw numerical equality (e.g., "$15" vs "15", "$4.80" vs "4.8")
  if (isClose(u.raw, e.raw) && u.hasPercent === e.hasPercent) {
    return true;
  }

  return false;
}

/**
 * 5 Curated Problems for enVision 2.0 (Grade 7 Topic 3, Lesson 3-1: Analyze Percents of Numbers)
 * - 2 Rapid-fire preskill conversions
 * - 2 Core application questions (direct percent calculations)
 * - 1 Multi-step extension problem
 */
const LESSON_3_1_PROBLEMS = [
  {
    id: "3-1-preskill-01",
    category: "preskill",
    type: "rapid_fire",
    title: "Preskill 1: Decimal Conversion",
    prompt: "Write 7% as a decimal.",
    expectedAnswer: 0.07,
    acceptableInputs: ["0.07", ".07", "7/100", "7%"],
    hint: "Percent means per hundred. Divide 7 by 100: 7 ÷ 100 = 0.07.",
    misconceptionNote: "Common misconception: 7% is 0.07, not 0.7 (which equals 70%)."
  },
  {
    id: "3-1-preskill-02",
    category: "preskill",
    type: "rapid_fire",
    title: "Preskill 2: Benchmark Percent Conversion",
    prompt: "Write 1/4 as a percentage.",
    expectedAnswer: "25%",
    acceptableInputs: ["25%", "25", "0.25", "1/4"],
    hint: "Convert 1/4 to an equivalent fraction out of 100: 1/4 = 25/100 = 25%.",
    misconceptionNote: "Benchmark fractions like 1/4 (25%), 1/2 (50%), and 3/4 (75%) represent key percent benchmarks."
  },
  {
    id: "3-1-core-01",
    category: "core",
    type: "direct_calculation",
    title: "Core 1: Direct Percent Calculation",
    prompt: "Find 35% of 80.",
    expectedAnswer: 28,
    acceptableInputs: ["28", "28.0", "28.00"],
    hint: "Convert 35% to a decimal (0.35) and multiply: 0.35 × 80 = 28.",
    misconceptionNote: "Part = Percent × Whole: Part = 0.35 × 80 = 28."
  },
  {
    id: "3-1-core-02",
    category: "core",
    type: "direct_calculation",
    title: "Core 2: Sales Tax Calculation",
    prompt: "A jacket costs $60. The sales tax rate is 8%. How much is the sales tax?",
    expectedAnswer: "$4.80",
    acceptableInputs: ["$4.80", "4.80", "4.8", "$4.8", "$ 4.80"],
    hint: "Convert 8% to 0.08, then multiply by the cost: 0.08 × $60 = $4.80.",
    misconceptionNote: "Remember 8% = 0.08, so tax = 0.08 × $60 = $4.80."
  },
  {
    id: "3-1-ext-01",
    category: "extension",
    type: "multi_step",
    title: "Extension: Multi-Step Library Books",
    prompt: "A school library has 400 books. 45% are fiction and 30% are non-fiction. The rest are graphic novels. How many graphic novels does the library have?",
    expectedAnswer: 100,
    acceptableInputs: ["100", "100.0"],
    hint: "Fiction + Non-fiction = 45% + 30% = 75%. The rest is 100% - 75% = 25%. Then 25% of 400 is 0.25 × 400 = 100 graphic novels.",
    misconceptionNote: "Calculate either remaining percent first (100% - 75% = 25% of 400 = 100) or total known books (180 fiction + 120 non-fiction = 300, and 400 - 300 = 100)."
  }
];

/**
 * Self-test routine verifying:
 * 1. All 5 curated problems pass with their primary expectedAnswer.
 * 2. All acceptable input formats pass (decimals, percents, fractions, currency formats).
 * 3. GEMINI.md Rule 3: Multiple format test ($15, 15, 15.00).
 * 4. Negative tests correctly reject common misconceptions (e.g. 0.7 for 7%).
 */
function runSelfTest() {
  console.log("==================================================");
  console.log("⚡ enVision 2.0 Math Companion: Math Engine Self-Test");
  console.log("==================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testDescription) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testDescription}`);
    } else {
      console.error(`  [FAIL] ${testDescription}`);
    }
  }

  // Section 1: Verify all 5 Lesson 3-1 Curated Problems
  console.log("--- 1. Testing Curated Lesson 3-1 Problems ---");
  LESSON_3_1_PROBLEMS.forEach((prob, index) => {
    // Primary answer verification
    const primaryPass = evaluateAnswer(prob.expectedAnswer, prob.expectedAnswer);
    assert(primaryPass, `Problem ${index + 1} (${prob.id}): Primary expected answer evaluates to true`);

    // Acceptable input variants verification
    prob.acceptableInputs.forEach(variant => {
      const variantPass = evaluateAnswer(variant, prob.expectedAnswer);
      assert(variantPass, `Problem ${index + 1} (${prob.id}): Input variant "${variant}" accepted`);
    });
  });

  // Section 2: GEMINI.md Rule 3 Currency / Formats Verification ($15, 15, 15.00)
  console.log("\n--- 2. GEMINI.md Verification Gate ($15, 15, 15.00) ---");
  const currencyTests = ["$15", "15", "15.00", "$15.00", "  $ 15  ", "15$"];
  currencyTests.forEach(input => {
    assert(evaluateAnswer(input, 15), `Currency format "${input}" matches expected number 15`);
    assert(evaluateAnswer(input, "$15"), `Currency format "${input}" matches expected "$15"`);
  });

  // Section 3: Decimal, Percent, and Fraction Equivalents
  console.log("\n--- 3. Decimal, Percent, and Fraction Equivalents ---");
  assert(evaluateAnswer("0.25", "25%"), 'Decimal "0.25" matches "25%"');
  assert(evaluateAnswer("25%", 0.25), 'Percent "25%" matches decimal 0.25');
  assert(evaluateAnswer("1/4", "25%"), 'Fraction "1/4" matches percent "25%"');
  assert(evaluateAnswer("1/4", 0.25), 'Fraction "1/4" matches decimal 0.25');
  assert(evaluateAnswer("7/100", 0.07), 'Fraction "7/100" matches decimal 0.07');
  assert(evaluateAnswer("7%", 0.07), 'Percent "7%" matches decimal 0.07');

  // Section 4: Misconception Rejection (Negative Tests)
  console.log("\n--- 4. Misconception Rejection (Negative Tests) ---");
  assert(!evaluateAnswer("0.7", 0.07), 'Rejects misconception: 0.7 is not 0.07 (7% != 70%)');
  assert(!evaluateAnswer("7", 0.07), 'Rejects misconception: plain 7 is not 0.07');
  assert(!evaluateAnswer("50%", "25%"), 'Rejects incorrect percent: 50% is not 25%');
  assert(!evaluateAnswer("29", 28), 'Rejects incorrect calculation: 29 is not 28');
  assert(!evaluateAnswer("$5.00", "$4.80"), 'Rejects incorrect tax: $5.00 is not $4.80');
  assert(!evaluateAnswer("", 28), 'Rejects empty input');
  assert(!evaluateAnswer("abc", 28), 'Rejects non-numeric text input');

  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log("==================================================");

  return passedTests === totalTests;
}

// Module export for Node.js / bundling
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LESSON_3_1_PROBLEMS,
    parseMathInput,
    evaluateAnswer,
    runSelfTest
  };
}

// Direct execution in Node.js
if (typeof require !== 'undefined' && require.main === module) {
  const success = runSelfTest();
  process.exit(success ? 0 : 1);
}
