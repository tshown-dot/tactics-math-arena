/**
 * Charge Runner: Exponent Reactor - Curriculum & Diagnostics Engine
 * Core Game Design Aligned: Combos, Failure States, Misconception Diagnostics & Boss Phase
 */

/*
 * Problem modes (all live inside the reactor loop, no pop-up quizzes):
 *   find     – target MW given; student sets base/exponent dials to match.
 *   evaluate – surge arrives as a power (b^e); student types its value in MW.
 *   fix      – a trainee logged a wrong value for b^e; student types the correct value.
 *   expanded – surge arrives as repeated multiplication (5 × 5 × 5); student sets dials.
 *   compare  – two power lines; student routes power to the stronger one (or "equal").
 */
export const PROBLEM_MODES = ['find', 'evaluate', 'fix', 'expanded', 'compare'];

export const CURRICULUM_SECTORS = [
  {
    id: 'sector-1',
    name: 'Sector 1: The Basics',
    tagline: 'Squares & Cubes',
    badge: 'CORE-I',
    description: 'Master powers of small numbers. 2³ means 2 × 2 × 2 (8), not 2 × 3.',
    waveTimeLimit: 30,
    problems: [
      { id: 's1-1', mode: 'find', targetMW: 8, validSolutions: [{ base: 2, exponent: 3 }], hint: '2 used as a factor 3 times: 2 × 2 × 2.' },
      { id: 's1-2', mode: 'evaluate', base: 3, exponent: 2, hint: '3² means 3 × 3.' },
      { id: 's1-3', mode: 'expanded', base: 4, exponent: 2, hint: 'What number repeats? How many times?' },
      { id: 's1-4', mode: 'find', targetMW: 27, validSolutions: [{ base: 3, exponent: 3 }], hint: '3 × 3 × 3 = 27.' },
      { id: 's1-5', mode: 'evaluate', base: 2, exponent: 4, hint: '2 × 2 = 4, × 2 = 8, × 2 = 16.' },
    ],
  },
  {
    id: 'sector-2',
    name: 'Sector 2: Multiplication Trap',
    tagline: 'Trap Evasion Protocol',
    badge: 'CORE-II',
    description: 'Never multiply base × exponent! 4³ is 4 × 4 × 4 = 64, not 4 × 3 = 12.',
    waveTimeLimit: 30,
    problems: [
      { id: 's2-1', mode: 'evaluate', base: 4, exponent: 3, hint: '4 × 4 = 16, then 16 × 4.' },
      { id: 's2-2', mode: 'compare', left: { base: 2, exponent: 5 }, right: { base: 5, exponent: 2 }, hint: 'Work out each one: 2 × 2 × 2 × 2 × 2 and 5 × 5.' },
      { id: 's2-3', mode: 'fix', base: 6, exponent: 2, wrongValue: 12, hint: 'The trainee did 6 × 2. What is 6 × 6?' },
      { id: 's2-4', mode: 'find', targetMW: 81, validSolutions: [{ base: 3, exponent: 4 }, { base: 9, exponent: 2 }], hint: '9 × 9 = 81, so base 9 with exponent 2.' },
      { id: 's2-5', mode: 'evaluate', base: 5, exponent: 3, hint: '5 × 5 = 25, then 25 × 5.' },
    ],
  },
  {
    id: 'sector-3',
    name: 'Sector 3: Powers of 10 Flux',
    tagline: 'Zero Trajectory',
    badge: 'CORE-III',
    description: '10ⁿ is a 1 followed by n zeros.',
    waveTimeLimit: 30,
    problems: [
      { id: 's3-1', mode: 'find', targetMW: 1000, validSolutions: [{ base: 10, exponent: 3 }], hint: 'Count the zeros in 1,000.' },
      { id: 's3-2', mode: 'evaluate', base: 10, exponent: 4, hint: 'A 1 followed by 4 zeros.' },
      { id: 's3-3', mode: 'expanded', base: 10, exponent: 5, hint: 'Count how many 10s are multiplied.' },
      { id: 's3-4', mode: 'fix', base: 10, exponent: 3, wrongValue: 30, hint: 'The trainee did 10 × 3. 10³ is 10 × 10 × 10.' },
      { id: 's3-5', mode: 'find', targetMW: 100000, validSolutions: [{ base: 10, exponent: 5 }], hint: 'Count the zeros in 100,000.' },
    ],
  },
  {
    id: 'sector-4',
    name: 'Sector 4: Zero & One Anomalies',
    tagline: 'Quantum Identity',
    badge: 'CORE-IV',
    description: 'b⁰ = 1 for any non-zero base, b¹ = b, and 1 to any power is 1.',
    waveTimeLimit: 30,
    problems: [
      { id: 's4-1', mode: 'evaluate', base: 7, exponent: 0, hint: 'Any non-zero base to the power 0 is 1.' },
      { id: 's4-2', mode: 'fix', base: 9, exponent: 0, wrongValue: 0, hint: 'b⁰ is not 0. It is 1.' },
      { id: 's4-3', mode: 'evaluate', base: 1, exponent: 5, hint: '1 × 1 × 1 × 1 × 1.' },
      { id: 's4-4', mode: 'compare', left: { base: 6, exponent: 1 }, right: { base: 1, exponent: 6 }, hint: '6¹ is one 6. 1⁶ is 1 × 1 × 1 × 1 × 1 × 1.' },
      { id: 's4-5', mode: 'find', targetMW: 1, validSolutions: [{ base: 5, exponent: 0 }], hint: 'Use the zero exponent rule, or 1 to any power.' },
    ],
  },
  {
    id: 'sector-5',
    name: 'Sector 5: Singularity Overcharge (BOSS)',
    tagline: 'Higher-Order Equivalence',
    badge: 'BOSS-CORE',
    description: 'BOSS PHASE: mixed challenges and equivalent powers!',
    waveTimeLimit: 30,
    isBossSector: true,
    problems: [
      { id: 'boss-1', mode: 'find', targetMW: 64, validSolutions: [{ base: 4, exponent: 3 }, { base: 8, exponent: 2 }, { base: 2, exponent: 6 }], hint: '2⁶, 4³ and 8² all equal 64.' },
      { id: 'boss-2', mode: 'compare', left: { base: 2, exponent: 6 }, right: { base: 4, exponent: 3 }, hint: 'Work out both. Different powers can be equal!' },
      { id: 'boss-3', mode: 'find', targetMW: 243, givenBase: 3, validSolutions: [{ base: 3, exponent: 5 }], hint: '3⁴ is 81. Multiply by 3 one more time.' },
      { id: 'boss-4', mode: 'fix', base: 3, exponent: 4, wrongValue: 12, hint: '3 × 3 × 3 × 3.' },
      { id: 'boss-5', mode: 'find', targetMW: 512, givenBase: 8, validSolutions: [{ base: 8, exponent: 3 }, { base: 2, exponent: 9 }], hint: '8² is 64. 64 × 8 = ?' },
    ],
  },
];

/** Superscript digits for plain-text formulas (e.g. 2⁵). */
const SUPERSCRIPTS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
export function sup(n) {
  return String(n).split('').map(d => SUPERSCRIPTS[d] || d).join('');
}
export function powerText(base, exponent) {
  return `${base}${sup(exponent)}`;
}
export function expandedText(base, exponent) {
  if (exponent === 0) return `${base}⁰`;
  return Array(exponent).fill(base).join(' × ');
}

/** The value a problem is checked against (for value-based and dial-based modes). */
export function problemTargetValue(problem) {
  if (problem.mode === 'find') return problem.targetMW;
  if (problem.mode === 'compare') return null;
  return calculatePower(problem.base, problem.exponent);
}

/** Correct answer for a compare problem: 'left' | 'right' | 'equal'. */
export function compareAnswer(problem) {
  const a = calculatePower(problem.left.base, problem.left.exponent);
  const b = calculatePower(problem.right.base, problem.right.exponent);
  if (a === b) return 'equal';
  return a > b ? 'left' : 'right';
}

/**
 * Mathematical evaluation helper for non-negative integers
 */
export function calculatePower(base, exponent) {
  if (exponent === 0) return 1;
  return Math.pow(base, exponent);
}

/**
 * Builds step-by-step animation factor models for the Visualizer Ribbon
 */
export function prepareSteps(b, exp) {
  if (exp === 0) {
    return [
      {
        stepIndex: 0,
        currentValue: 1,
        factor: 0,
        formula: `${b}⁰ = 1`,
        label: 'Zero Factor State (Identity = 1 MW)',
      },
    ];
  }

  const result = [];
  let acc = 1;
  for (let i = 0; i < exp; i++) {
    acc *= b;
    result.push({
      stepIndex: i,
      currentValue: acc,
      factor: b,
      formula: `${b}^${i + 1} = ${acc}`,
      label: i === 0 ? `Base Factor (${b})` : `Multiply by ${b} ➔ ${acc.toLocaleString()}`,
    });
  }
  return result;
}

/**
 * Rapid Diagnostic Analyzer:
 * Provides diagnostic feedback for instantaneous (<1.5s) HUD alerts without blocking popups.
 */
export function diagnoseSubmission(base, exponent, targetMW) {
  const studentResult = calculatePower(base, exponent);
  const multipliedResult = base * exponent;

  // Case 1: Exact match!
  if (studentResult === targetMW) {
    return {
      isTrap: false,
      type: 'exact-match',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: 'REACTOR BALANCED! Output matches target surge frequency exactly.',
      correctFormula: `${powerText(base, exponent)} = ${targetMW.toLocaleString()} MW`,
    };
  }

  // Case 2: The classic Multiplication Trap!
  if (multipliedResult === targetMW) {
    return {
      isTrap: true,
      type: 'multiplication-error',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: `Exponent trap! ${powerText(base, exponent)} means ${base} used as a factor ${exponent} times (${studentResult.toLocaleString()} MW), not ${base} × ${exponent} (${multipliedResult} MW).`,
      correctFormula: `${powerText(base, exponent)} = ${expandedText(base, exponent)} = ${studentResult.toLocaleString()}`,
    };
  }

  // Case 3: Student entered b^0 expecting 0 or wrong value
  if (exponent === 0 && targetMW !== 1) {
    return {
      isTrap: true,
      type: 'zero-error',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: `Zero exponent rule: any non-zero base to the power 0 equals 1, so ${base}⁰ = 1 MW.`,
      correctFormula: `${base}⁰ = 1`,
    };
  }

  // Case 4: Power of 10 error (only meaningful when the target itself is a power of 10)
  const targetZeros = powerOfTenExponent(targetMW);
  if (base === 10 && targetZeros !== null) {
    return {
      isTrap: true,
      type: 'power-of-ten',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: `Count the zeros! ${powerText(10, exponent)} has ${exponent} zero${exponent === 1 ? '' : 's'} (${studentResult.toLocaleString()}). ${targetMW.toLocaleString()} has ${targetZeros} zero${targetZeros === 1 ? '' : 's'}.`,
      correctFormula: `${powerText(10, targetZeros)} = ${targetMW.toLocaleString()}`,
    };
  }

  // Case 5: General off-target
  const comparison = studentResult > targetMW ? 'Too much power' : 'Not enough power';
  return {
    isTrap: false,
    type: studentResult > targetMW ? 'over-exponentiation' : 'under-exponentiation',
    studentBase: base,
    studentExponent: exponent,
    studentResult,
    multipliedResult,
    targetMW,
    explanation: `${comparison}: ${powerText(base, exponent)} = ${studentResult.toLocaleString()} MW, but the surge is ${targetMW.toLocaleString()} MW. ${studentResult > targetMW ? 'Try a smaller base or exponent.' : 'Try a bigger base or exponent.'}`,
    correctFormula: `${studentResult.toLocaleString()} ≠ ${targetMW.toLocaleString()}`,
  };
}

/**
 * Returns n if value === 10^n (n >= 1), otherwise null.
 */
export function powerOfTenExponent(value) {
  if (!Number.isInteger(value) || value < 10) return null;
  const str = String(value);
  return /^10+$/.test(str) ? str.length - 1 : null;
}

/**
 * Determines whether a problem has a locked base.
 * Criteria: Explicit problem.givenBase OR targetMW > 200 and not a multiple of 10.
 * Reduces excessive student cognitive load for non-tens large surges.
 */
export function isBaseLocked(problem) {
  if (!problem) return false;
  if (problem.givenBase !== undefined) return true;
  return problem.targetMW > 200 && (problem.targetMW % 10 !== 0);
}

/**
 * Returns the locked base for a problem if applicable.
 */
export function getGivenBase(problem) {
  if (!problem) return null;
  if (problem.givenBase !== undefined) return problem.givenBase;
  if (problem.targetMW > 200 && (problem.targetMW % 10 !== 0)) {
    return problem.validSolutions && problem.validSolutions[0] ? problem.validSolutions[0].base : null;
  }
  return null;
}


/**
 * Diagnoses a typed value for an evaluate / fix problem (student computes b^e).
 * Returns { correct, isTrap, type, explanation, correctFormula }.
 */
export function diagnoseValue(base, exponent, answer) {
  const correctValue = calculatePower(base, exponent);
  const p = powerText(base, exponent);
  // On a miss, show the expansion but NOT the value, so the retry still requires computing it.
  const shown = exponent === 0 ? `${p}: zero factors of ${base}` : `${p} = ${expandedText(base, exponent)}`;
  const result = (isTrap, type, explanation) => ({
    correct: false, isTrap, type, explanation, correctFormula: shown, correctValue,
  });

  if (!Number.isFinite(answer)) {
    return result(false, 'no-answer', 'Type a value on the keypad first.');
  }
  if (answer === correctValue) {
    return { correct: true, isTrap: false, type: 'exact-match', explanation: 'Correct!', correctFormula: shown, correctValue };
  }
  if (exponent === 0) {
    if (answer === 0) return result(true, 'zero-error', `Zero exponent rule: ${p} is 1, not 0. Any non-zero base to the power 0 equals 1.`);
    if (answer === base) return result(true, 'zero-error', `Zero exponent rule: ${p} is 1, not ${base}. Any non-zero base to the power 0 equals 1.`);
  }
  if (base === 1 && answer === exponent) {
    return result(true, 'one-base-error', `1 times itself is always 1, so ${p} = 1, not ${exponent}.`);
  }
  if (answer === base * exponent && base * exponent !== correctValue) {
    return result(true, 'multiplication-error', `Exponent trap! ${base} × ${exponent} = ${answer}, but ${p} means ${base} used as a factor ${exponent} time${exponent === 1 ? '' : 's'}.`);
  }
  if (answer === base + exponent && base + exponent !== correctValue) {
    return result(true, 'addition-error', `${p} is not ${base} + ${exponent}. It means ${base} used as a factor ${exponent} times.`);
  }
  if (exponent > 0 && answer === calculatePower(exponent, base) && exponent !== base) {
    return result(true, 'swap-error', `You found ${powerText(exponent, base)}. The big number is the base: ${p} means ${base} is the factor, ${exponent} times.`);
  }
  if (base === 10 && powerOfTenExponent(answer) !== null) {
    const z = powerOfTenExponent(answer);
    return result(true, 'power-of-ten', `Count the zeros! ${p} has ${exponent} zero${exponent === 1 ? '' : 's'}; you typed ${z}.`);
  }
  if (exponent >= 2 && (answer === calculatePower(base, exponent - 1) || answer === calculatePower(base, exponent + 1))) {
    const fewer = answer === calculatePower(base, exponent - 1);
    return result(false, 'factor-count', `Close! You multiplied one ${fewer ? 'too few' : 'too many'} times. ${p} has exactly ${exponent} factors of ${base}.`);
  }
  return result(false, 'off-target', `${p} is not ${answer.toLocaleString()}. Multiply it out one factor at a time.`);
}

/**
 * Diagnoses dial settings for an expanded-form problem (e.g. 5 × 5 × 5 → 5³).
 */
export function diagnoseExpanded(problem, base, exponent) {
  const target = powerText(problem.base, problem.exponent);
  const shown = `${expandedText(problem.base, problem.exponent)} = ${target}`;
  if (base === problem.base && exponent === problem.exponent) {
    return { correct: true, isTrap: false, type: 'exact-match', explanation: 'Correct!', correctFormula: shown };
  }
  if (base === problem.exponent && exponent === problem.base) {
    return { correct: false, isTrap: true, type: 'swap-error', explanation: `Base and exponent are swapped. The repeated factor (${problem.base}) is the base; how many times it appears (${problem.exponent}) is the exponent.`, correctFormula: shown };
  }
  if (calculatePower(base, exponent) === calculatePower(problem.base, problem.exponent)) {
    return { correct: false, isTrap: false, type: 'equivalent-form', explanation: `${powerText(base, exponent)} has the same value, but this signature repeats ${problem.base}. Use ${problem.base} as the base.`, correctFormula: shown };
  }
  if (base !== problem.base) {
    return { correct: false, isTrap: false, type: 'wrong-base', explanation: `The base is the number being repeated: ${problem.base}.`, correctFormula: shown };
  }
  return { correct: false, isTrap: false, type: 'factor-count', explanation: `Count the factors: ${problem.base} appears ${problem.exponent} time${problem.exponent === 1 ? '' : 's'}, so the exponent is ${problem.exponent}.`, correctFormula: shown };
}

/**
 * Diagnoses a compare choice ('left' | 'right' | 'equal').
 */
export function diagnoseCompare(problem, choice) {
  const { left, right } = problem;
  const a = calculatePower(left.base, left.exponent);
  const b = calculatePower(right.base, right.exponent);
  const answer = compareAnswer(problem);
  const sym = a === b ? '=' : a > b ? '>' : '<';
  const shown = `${powerText(left.base, left.exponent)} = ${a.toLocaleString()}  ${sym}  ${powerText(right.base, right.exponent)} = ${b.toLocaleString()}`;
  if (choice === answer) {
    return { correct: true, isTrap: false, type: 'exact-match', explanation: 'Correct!', correctFormula: shown };
  }
  const swapped = left.base === right.exponent && left.exponent === right.base;
  const sameProduct = left.base * left.exponent === right.base * right.exponent;
  if (choice === 'equal' && (swapped || sameProduct)) {
    return { correct: false, isTrap: true, type: 'multiplication-error', explanation: `Not equal! Base × exponent gives ${left.base * left.exponent} for both, but that's the trap. Exponents mean repeated multiplication.`, correctFormula: shown };
  }
  if (swapped) {
    return { correct: false, isTrap: true, type: 'swap-error', explanation: 'Swapping the base and exponent changes the value. Work out each power.', correctFormula: shown };
  }
  return { correct: false, isTrap: false, type: 'compare-error', explanation: 'Work out both powers before you route power.', correctFormula: shown };
}
