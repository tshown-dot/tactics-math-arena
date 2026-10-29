/**
 * enVision 2.0 Math Companion (Grade 7 Topic 3)
 * Lesson 3-1: Analyze Percents of Numbers
 * 
 * 3-Tier Cognitive Ladder Engine:
 * - Tier 1 (Preskill Ramp / DOK 1): Rapid-fire decimal shifts & benchmark mental math.
 * - Tier 2 (Base Skills / DOK 2): enVision 3-1 direct percent calculations (standard, >100%, <1%).
 * - Tier 3 (Deep DOK / DOK 3): Multi-step extension problems (commissions, pool capacity shifts).
 * 
 * Dependencies: Zero (Vanilla JS / ES Modules / Node CLI compatible)
 */

/**
 * Parses user input or expected answer into structured math representations.
 * Handles string cleanup, whitespace, commas, currency signs ($), percent signs (%),
 * fractions (e.g., 1/4, 7/100), and optional measurement units.
 *
 * @param {string|number} input
 * @returns {{ raw: number, mathValue: number, hasPercent: boolean, hasCurrency: boolean, isFraction: boolean } | null}
 */
export function parseMathInput(input) {
  if (input === null || input === undefined) return null;
  let s = String(input).trim();
  if (s === '') return null;

  // Remove commas for numbers like 1,000 or 12,000
  s = s.replace(/,/g, '');

  // Strip optional trailing unit words (e.g. "gallons", "books", "dollars")
  s = s.replace(/\s*(gallons?|books?|dollars?|units?)\b/gi, '').trim();

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
export function evaluateAnswer(userInput, expectedAnswer) {
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
 * 3-Tier Cognitive Ladder for enVision 2.0 (Grade 7 Topic 3, Lesson 3-1: Analyze Percents of Numbers)
 * - Tier 1 (Preskill Ramp / DOK 1): Rapid-fire decimal shifts & benchmark mental math.
 * - Tier 2 (Base Skills / DOK 2): enVision 3-1 core percent calculations (standard, >100%, <1%).
 * - Tier 3 (Deep DOK / DOK 3): Multi-step extension problems (commissions, capacity shifts).
 */
export const LESSON_3_1_PROBLEMS = [
  // --------------------------------------------------------------------------
  // TIER 1: Preskill Ramp (DOK 1 - Rapid-fire Fluency & Decimal Shifts)
  // --------------------------------------------------------------------------
  {
    id: "3-1-t1-01",
    tier: 1,
    dok: 1,
    category: "preskill",
    type: "rapid_fire",
    title: "Tier 1: Decimal Shift",
    prompt: "Write 7% as a decimal.",
    expectedAnswer: 0.07,
    options: ["0.07", "0.7", "7.0", "0.007"],
    acceptableInputs: ["0.07", ".07", "7/100", "7%"],
    hint: "Percent means 'per hundred'. Divide 7 by 100 or shift the decimal point two places left: 7% = 0.07.",
    misconception: "Common misconception: 7% is 0.07, not 0.7 (which equals 70%). Move the decimal two places to the left.",
    misconceptionNote: "Common misconception: 7% is 0.07, not 0.7 (which equals 70%). Move the decimal two places to the left."
  },
  {
    id: "3-1-t1-02",
    tier: 1,
    dok: 1,
    category: "preskill",
    type: "rapid_fire",
    title: "Tier 1: Mental Math 10% Benchmark",
    prompt: "Find 10% of 60.",
    expectedAnswer: 6,
    options: ["6", "0.6", "60", "16"],
    acceptableInputs: ["6", "6.0", "6.00"],
    hint: "To find 10% of any number, divide it by 10 or shift the decimal one place left: 60 ÷ 10 = 6.",
    misconception: "To find 10% of a number, divide by 10: 60 ÷ 10 = 6 (not 0.6 or 60).",
    misconceptionNote: "To find 10% of a number, divide by 10: 60 ÷ 10 = 6 (not 0.6 or 60)."
  },
  {
    id: "3-1-t1-03",
    tier: 1,
    dok: 1,
    category: "preskill",
    type: "rapid_fire",
    title: "Tier 1: Benchmark Fraction Conversion",
    prompt: "Write 1/4 as a percentage.",
    expectedAnswer: "25%",
    options: ["25%", "2.5%", "40%", "14%"],
    acceptableInputs: ["25%", "25", "0.25", "1/4"],
    hint: "Convert 1/4 to an equivalent fraction over 100: 1/4 = 25/100 = 25%.",
    misconception: "Benchmark fractions: 1/4 is one quarter of 100%, which equals 25% (not 2.5% or 40%).",
    misconceptionNote: "Benchmark fractions: 1/4 is one quarter of 100%, which equals 25% (not 2.5% or 40%)."
  },

  // --------------------------------------------------------------------------
  // TIER 2: Base Skills (DOK 2 - enVision 3-1 Direct Percent Calculations)
  // --------------------------------------------------------------------------
  {
    id: "3-1-t2-01",
    tier: 2,
    dok: 2,
    category: "core",
    type: "direct_calculation",
    title: "Tier 2: Direct Percent of a Number",
    prompt: "Find 35% of 80.",
    expectedAnswer: 28,
    options: null,
    acceptableInputs: ["28", "28.0", "28.00"],
    hint: "Convert 35% to a decimal (0.35) and multiply: Part = 0.35 × 80 = 28.",
    misconception: "Part = Percent × Whole. First convert 35% to 0.35, then compute 0.35 × 80 = 28.",
    misconceptionNote: "Part = Percent × Whole. First convert 35% to 0.35, then compute 0.35 × 80 = 28."
  },
  {
    id: "3-1-t2-02",
    tier: 2,
    dok: 2,
    category: "core",
    type: "direct_calculation",
    title: "Tier 2: Percent Greater than 100%",
    prompt: "Find 125% of 64.",
    expectedAnswer: 80,
    options: null,
    acceptableInputs: ["80", "80.0", "80.00"],
    hint: "Percents greater than 100% result in a value greater than the original number: 125% = 1.25. Compute 1.25 × 64 = 80.",
    misconception: "When a percent is greater than 100%, the answer is greater than the base. 125% = 1.25, so 1.25 × 64 = 80.",
    misconceptionNote: "When a percent is greater than 100%, the answer is greater than the base. 125% = 1.25, so 1.25 × 64 = 80."
  },
  {
    id: "3-1-t2-03",
    tier: 2,
    dok: 2,
    category: "core",
    type: "direct_calculation",
    title: "Tier 2: Percent Less than 1%",
    prompt: "Find 0.5% of 200.",
    expectedAnswer: 1,
    options: null,
    acceptableInputs: ["1", "1.0", "1.00"],
    hint: "Be careful with decimals: 0.5% means 0.5 ÷ 100 = 0.005. Then 0.005 × 200 = 1.",
    misconception: "Common misconception: 0.5% is NOT 0.5. 0.5% = 0.005. Multiply 0.005 × 200 = 1 (not 100).",
    misconceptionNote: "Common misconception: 0.5% is NOT 0.5. 0.5% = 0.005. Multiply 0.005 × 200 = 1 (not 100)."
  },

  // --------------------------------------------------------------------------
  // TIER 3: Deep DOK (DOK 3 - Multi-step Extension & Strategic Reasoning)
  // --------------------------------------------------------------------------
  {
    id: "3-1-t3-01",
    tier: 3,
    dok: 3,
    category: "extension",
    type: "multi_step",
    title: "Tier 3: Salary Plus Commission",
    prompt: "Maya earns a weekly base salary of $400 plus a 5% commission on all sales. If her sales this week are $3,000, what are her total weekly earnings?",
    expectedAnswer: "$550",
    options: null,
    acceptableInputs: ["$550", "550", "$550.00", "550.00", "$ 550"],
    hint: "Calculate commission first: 5% of $3,000 is 0.05 × 3,000 = $150. Then add her base salary: $400 + $150 = $550.",
    misconception: "Calculate the 5% commission first (0.05 × $3,000 = $150), and then add it to her $400 base salary: $400 + $150 = $550.",
    misconceptionNote: "Calculate the 5% commission first (0.05 × $3,000 = $150), and then add it to her $400 base salary: $400 + $150 = $550."
  },
  {
    id: "3-1-t3-02",
    tier: 3,
    dok: 3,
    category: "extension",
    type: "multi_step",
    title: "Tier 3: Pool Capacity Shifts",
    prompt: "A swimming pool holds 12,000 gallons of water. It is currently filled to 85% capacity. How many more gallons of water are needed to fill the pool to 100% capacity?",
    expectedAnswer: 1800,
    options: null,
    acceptableInputs: ["1800", "1,800", "1800.0", "1800 gallons", "1,800 gallons"],
    hint: "Find the remaining percentage needed: 100% - 85% = 15%. Then calculate 15% of 12,000 gallons: 0.15 × 12,000 = 1,800 gallons.",
    misconception: "Find the remaining unfilled percentage first (100% - 85% = 15%), then find 15% of 12,000: 0.15 × 12,000 = 1,800 gallons (or 12,000 - 10,200 = 1,800).",
    misconceptionNote: "Find the remaining unfilled percentage first (100% - 85% = 15%), then find 15% of 12,000: 0.15 × 12,000 = 1,800 gallons (or 12,000 - 10,200 = 1,800)."
  }
];

/**
 * Self-test routine verifying:
 * 1. Cognitive Ladder Schema: Every problem has tier (1-3), dok (1-3), prompt, expectedAnswer, misconception.
 * 2. All 8 curated problems pass with their primary expectedAnswer and variants.
 * 3. GEMINI.md Rule 3: Multiple format test ($15, 15, 15.00).
 * 4. Negative tests correctly reject common misconceptions across all 3 tiers.
 */
export function runSelfTest() {
  console.log("==================================================");
  console.log("⚡ enVision 2.0 Math Companion: 3-Tier Cognitive Ladder");
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

  // Section 1: Schema Verification for all 3 Tiers
  console.log("--- 1. Schema & Field Verification (Tiers, DOK, Misconceptions) ---");
  LESSON_3_1_PROBLEMS.forEach((prob, index) => {
    assert(
      [1, 2, 3].includes(prob.tier),
      `Problem ${index + 1} (${prob.id}): Valid tier (${prob.tier})`
    );
    assert(
      [1, 2, 3].includes(prob.dok),
      `Problem ${index + 1} (${prob.id}): Valid DOK (${prob.dok})`
    );
    assert(
      typeof prob.prompt === 'string' && prob.prompt.length > 5,
      `Problem ${index + 1} (${prob.id}): Has valid prompt text`
    );
    assert(
      prob.expectedAnswer !== undefined && prob.expectedAnswer !== null,
      `Problem ${index + 1} (${prob.id}): Has expectedAnswer (${prob.expectedAnswer})`
    );
    assert(
      typeof prob.misconception === 'string' && prob.misconception.length > 10,
      `Problem ${index + 1} (${prob.id}): Has targeted misconception feedback`
    );
  });

  // Section 2: Mathematical Accuracy & Variant Tests
  console.log("\n--- 2. Mathematical Accuracy & Input Variants ---");
  LESSON_3_1_PROBLEMS.forEach((prob, index) => {
    const primaryPass = evaluateAnswer(prob.expectedAnswer, prob.expectedAnswer);
    assert(primaryPass, `Problem ${index + 1} (${prob.id}): Primary answer evaluates to true`);

    prob.acceptableInputs.forEach(variant => {
      const variantPass = evaluateAnswer(variant, prob.expectedAnswer);
      assert(variantPass, `Problem ${index + 1} (${prob.id}): Input variant "${variant}" accepted`);
    });

    if (prob.options) {
      const correctOptionExists = prob.options.some(opt => evaluateAnswer(opt, prob.expectedAnswer));
      assert(correctOptionExists, `Problem ${index + 1} (${prob.id}): Correct answer is present in options`);
    }
  });

  // Section 3: GEMINI.md Rule 3 Verification Gate ($15, 15, 15.00)
  console.log("\n--- 3. GEMINI.md Verification Gate ($15, 15, 15.00) ---");
  const currencyTests = ["$15", "15", "15.00", "$15.00", "  $ 15  ", "15$"];
  currencyTests.forEach(input => {
    assert(evaluateAnswer(input, 15), `Currency format "${input}" matches expected number 15`);
    assert(evaluateAnswer(input, "$15"), `Currency format "${input}" matches expected "$15"`);
  });

  // Section 4: Misconception Rejection (Tier-Specific Negative Tests)
  console.log("\n--- 4. Misconception Rejection (Negative Tests) ---");
  // Tier 1 Negative Tests
  assert(!evaluateAnswer("0.7", 0.07), 'Tier 1 Rejects: 0.7 for 7% (7% != 70%)');
  assert(!evaluateAnswer("0.6", 6), 'Tier 1 Rejects: 0.6 for 10% of 60');
  assert(!evaluateAnswer("50%", "25%"), 'Tier 1 Rejects: 50% for 1/4');
  
  // Tier 2 Negative Tests
  assert(!evaluateAnswer("29", 28), 'Tier 2 Rejects: 29 for 35% of 80');
  assert(!evaluateAnswer("8", 80), 'Tier 2 Rejects: 8 for 125% of 64 (must be > 64)');
  assert(!evaluateAnswer("100", 1), 'Tier 2 Rejects: 100 for 0.5% of 200 (misconception of 0.5)');

  // Tier 3 Negative Tests
  assert(!evaluateAnswer("$150", "$550"), 'Tier 3 Rejects: $150 (forgot base salary)');
  assert(!evaluateAnswer("10200", 1800), 'Tier 3 Rejects: 10,200 (calculated current water instead of needed)');

  console.log("\n==================================================");
  console.log(`Results: ${passedTests}/${totalTests} tests passed.`);
  console.log("==================================================");

  return passedTests === totalTests;
}

// Auto-run when executed directly via Node.js
if (typeof process !== 'undefined' && process.argv && process.argv[1]) {
  const isDirectRun = process.argv[1].endsWith('math-engine.js');
  if (isDirectRun) {
    const success = runSelfTest();
    process.exit(success ? 0 : 1);
  }
}
