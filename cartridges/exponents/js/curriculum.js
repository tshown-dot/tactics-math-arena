/**
 * Charge Runner: Exponent Reactor - Curriculum & Diagnostics Engine
 * Core Game Design Aligned: Combos, Failure States, Misconception Diagnostics & Boss Phase
 */

export const CURRICULUM_SECTORS = [
  {
    id: 'sector-1',
    name: 'Sector 1: The Basics',
    tagline: 'Squares & Cubes',
    badge: 'CORE-I',
    description: 'Master powers of small integers. Learn that 2³ means 2 × 2 × 2 (8), not 2 × 3.',
    waveTimeLimit: 30,
    problems: [
      {
        id: 's1-1',
        targetMW: 8,
        validSolutions: [{ base: 2, exponent: 3 }],
        hint: '2 multiplied by itself 3 times (2 × 2 × 2).',
        conceptNote: '2³ = 2 × 2 × 2 = 8 MW',
      },
      {
        id: 's1-2',
        targetMW: 16,
        validSolutions: [
          { base: 4, exponent: 2 },
          { base: 2, exponent: 4 },
        ],
        hint: '4 squared (4 × 4) or 2 to the 4th power.',
        conceptNote: '4² = 16 MW and 2⁴ = 16 MW',
      },
      {
        id: 's1-3',
        targetMW: 25,
        validSolutions: [{ base: 5, exponent: 2 }],
        hint: 'What number squared gives 25?',
        conceptNote: '5² = 5 × 5 = 25 MW',
      },
      {
        id: 's1-4',
        targetMW: 27,
        validSolutions: [{ base: 3, exponent: 3 }],
        hint: '3 used as a factor 3 times: 3 × 3 × 3.',
        conceptNote: '3³ = 3 × 3 × 3 = 27 MW',
      },
      {
        id: 's1-5',
        targetMW: 36,
        validSolutions: [{ base: 6, exponent: 2 }],
        hint: '6 used as a factor 2 times.',
        conceptNote: '6² = 6 × 6 = 36 MW',
      },
    ],
  },
  {
    id: 'sector-2',
    name: 'Sector 2: Multiplication Trap',
    tagline: 'Trap Evasion Protocol',
    badge: 'CORE-II',
    description: 'Reject multiplying base by exponent! Overcome 4 × 3 = 12 and calibrate 4³ = 64.',
    waveTimeLimit: 30,
    problems: [
      {
        id: 's2-1',
        targetMW: 64,
        validSolutions: [
          { base: 4, exponent: 3 },
          { base: 8, exponent: 2 },
          { base: 2, exponent: 6 },
        ],
        hint: 'Watch out: 4 × 3 is 12, but 4³ is 4 × 4 × 4 = 64!',
        trapWarning: 'Common trap: 4 × 3 = 12. Exponents repeat multiplication!',
        conceptNote: '4³ = 64 MW or 8² = 64 MW',
      },
      {
        id: 's2-2',
        targetMW: 81,
        validSolutions: [
          { base: 3, exponent: 4 },
          { base: 9, exponent: 2 },
        ],
        hint: '9 × 9 = 81 means base 9 with exponent 2 (NOT exponent 9)!',
        trapWarning: 'Do NOT set 9⁹! 9⁹ is over 387 million. 9² = 9 × 9 = 81.',
        conceptNote: '3⁴ = 81 MW and 9² = 81 MW',
      },
      {
        id: 's2-3',
        targetMW: 32,
        validSolutions: [{ base: 2, exponent: 5 }],
        hint: '2 used as a factor 5 times. Notice 2 × 5 is only 10!',
        trapWarning: '2 × 5 = 10 is multiplication. 2⁵ = 32 is exponential.',
        conceptNote: '2⁵ = 2 × 2 × 2 × 2 × 2 = 32 MW',
      },
      {
        id: 's2-4',
        targetMW: 125,
        validSolutions: [{ base: 5, exponent: 3 }],
        hint: '5 used as a factor 3 times: 5 × 5 = 25, then 25 × 5 = 125.',
        trapWarning: '5 × 3 = 15 is linear. The power is 5³ = 125.',
        conceptNote: '5³ = 5 × 5 × 5 = 125 MW',
      },
      {
        id: 's2-5',
        targetMW: 216,
        validSolutions: [{ base: 6, exponent: 3 }],
        hint: '6 used as a factor 3 times: 36 × 6 = 216.',
        trapWarning: '6 × 3 = 18 is a trap! 6³ = 216.',
        conceptNote: '6³ = 6 × 6 × 6 = 216 MW',
      },
    ],
  },
  {
    id: 'sector-3',
    name: 'Sector 3: Powers of 10 Flux',
    tagline: 'Zero Trajectory',
    badge: 'CORE-III',
    description: '10ⁿ always has 1 followed by exactly n zeros. Match massive grid surges with precision.',
    waveTimeLimit: 30,
    problems: [
      {
        id: 's3-1',
        targetMW: 100,
        validSolutions: [{ base: 10, exponent: 2 }, { base: 100, exponent: 1 }],
        hint: '10 with 2 trailing zeros: 10² = 100.',
        conceptNote: '10² = 100 MW (2 zeros)',
      },
      {
        id: 's3-2',
        targetMW: 1000,
        validSolutions: [{ base: 10, exponent: 3 }],
        hint: '3 zeros means base 10 with exponent 3: 10³ = 1,000.',
        conceptNote: '10³ = 1,000 MW (3 zeros)',
      },
      {
        id: 's3-3',
        targetMW: 10000,
        validSolutions: [{ base: 10, exponent: 4 }],
        hint: '10,000 has 4 zeros: 10⁴.',
        conceptNote: '10⁴ = 10,000 MW (4 zeros)',
      },
      {
        id: 's3-4',
        targetMW: 100000,
        validSolutions: [{ base: 10, exponent: 5 }],
        hint: '100,000 has 5 zeros: 10⁵.',
        conceptNote: '10⁵ = 100,000 MW (5 zeros)',
      },
      {
        id: 's3-5',
        targetMW: 10,
        validSolutions: [{ base: 10, exponent: 1 }],
        hint: '10 with 1 zero: Base 10 used as a factor 1 time.',
        conceptNote: '10¹ = 10 MW (1 zero)',
      },
    ],
  },
  {
    id: 'sector-4',
    name: 'Sector 4: Zero & One Anomalies',
    tagline: 'Quantum Identity',
    badge: 'CORE-IV',
    description: 'b⁰ = 1 for any non-zero base! And b¹ = b. Handle quantum identity fluctuations.',
    waveTimeLimit: 30,
    problems: [
      {
        id: 's4-1',
        targetMW: 1,
        validSolutions: [
          { base: 2, exponent: 0 },
          { base: 3, exponent: 0 },
          { base: 4, exponent: 0 },
          { base: 5, exponent: 0 },
          { base: 6, exponent: 0 },
          { base: 7, exponent: 0 },
          { base: 8, exponent: 0 },
          { base: 9, exponent: 0 },
          { base: 10, exponent: 0 },
          { base: 1, exponent: 1 },
          { base: 1, exponent: 2 },
          { base: 1, exponent: 3 },
          { base: 1, exponent: 4 },
        ],
        hint: 'Any base to power 0 equals 1! (e.g. 5⁰ = 1).',
        trapWarning: 'b⁰ does NOT equal 0. Zero factors leave the multiplicative identity of 1.',
        conceptNote: 'Zero Exponent Rule: b⁰ = 1',
      },
      {
        id: 's4-2',
        targetMW: 7,
        validSolutions: [{ base: 7, exponent: 1 }],
        hint: '7 used as a factor 1 time: 7¹ = 7.',
        conceptNote: '7¹ = 7 MW. Power of 1 keeps the base.',
      },
      {
        id: 's4-3',
        targetMW: 9,
        validSolutions: [
          { base: 9, exponent: 1 },
          { base: 3, exponent: 2 },
        ],
        hint: 'Can be 3² (3 × 3) or 9¹.',
        conceptNote: '9¹ = 9 MW and 3² = 9 MW',
      },
      {
        id: 's4-4',
        targetMW: 4,
        validSolutions: [
          { base: 4, exponent: 1 },
          { base: 2, exponent: 2 },
        ],
        hint: 'Can be 2² or 4¹.',
        conceptNote: '4¹ = 4 MW and 2² = 4 MW',
      },
      {
        id: 's4-5',
        targetMW: 1,
        validSolutions: [
          { base: 8, exponent: 0 },
          { base: 6, exponent: 0 },
          { base: 1, exponent: 5 },
        ],
        hint: 'Use the zero power rule (b⁰ = 1) or 1 to any power.',
        conceptNote: '8⁰ = 1 MW',
      },
    ],
  },
  {
    id: 'sector-5',
    name: 'Sector 5: Singularity Overcharge (BOSS)',
    tagline: 'Higher-Order Equivalence',
    badge: 'BOSS-CORE',
    description: 'BOSS PHASE: High-voltage dilemmas with multiple equivalent exponential pathways!',
    waveTimeLimit: 30,
    isBossSector: true,
    problems: [
      {
        id: 'boss-1',
        targetMW: 64,
        validSolutions: [
          { base: 4, exponent: 3 },
          { base: 8, exponent: 2 },
          { base: 2, exponent: 6 },
        ],
        bossDilemma: 'Equivalent Powers: Find a valid base/exponent pair for 64 MW (can be 2⁶, 4³, or 8²)!',
        hint: 'Can be formed by 2⁶ (2 doubled 6 times), 4³ (4 cubed), or 8² (8 squared)!',
        conceptNote: 'Equivalence: 2⁶ = 4³ = 8² = 64 MW',
      },
      {
        id: 'boss-2',
        targetMW: 243,
        validSolutions: [{ base: 3, exponent: 5 }],
        bossDilemma: 'Hyper-scaling: 3 multiplied by itself 5 times!',
        hint: '3 to the 5th power: 3 × 3 × 3 × 3 × 3 = 243.',
        conceptNote: '3⁵ = 243 MW',
      },
      {
        id: 'boss-3',
        targetMW: 256,
        validSolutions: [
          { base: 4, exponent: 4 },
          { base: 2, exponent: 8 },
          { base: 16, exponent: 2 },
        ],
        bossDilemma: 'Multi-Core Resonance: 4⁴ = 256 or 2⁸ = 256 or 16² = 256.',
        hint: 'Try Base 4 to exponent 4 (4 × 4 × 4 × 4) or Base 2 to exponent 8.',
        conceptNote: 'Equivalence: 4⁴ = 2⁸ = 256 MW',
      },
      {
        id: 'boss-4',
        targetMW: 1000000,
        validSolutions: [
          { base: 10, exponent: 6 },
          { base: 100, exponent: 3 },
          { base: 1000, exponent: 2 },
        ],
        bossDilemma: 'Megagrid Surge: 1 Million MW! Count the 6 zeros.',
        hint: 'Base 10 with 6 zeros: 10⁶ = 1,000,000 MW.',
        conceptNote: '10⁶ = 1,000,000 MW',
      },
      {
        id: 'boss-5',
        targetMW: 512,
        validSolutions: [
          { base: 8, exponent: 3 },
          { base: 2, exponent: 9 },
        ],
        bossDilemma: 'Core Singularity Finale: Balance the catastrophic 512 MW surge!',
        hint: '8 cubed (8 × 8 × 8) or 2 to the 9th power.',
        conceptNote: '8³ = 2⁹ = 512 MW',
      },
    ],
  },
];

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
      correctFormula: `${base}^${exponent} = ${targetMW.toLocaleString()} MW`,
    };
  }

  // Case 2: The classic Multiplication Trap!
  if (multipliedResult === targetMW) {
    if (base === 9 && exponent === 9 && targetMW === 81) {
      return {
        isTrap: true,
        type: 'over-exponentiation',
        studentBase: base,
        studentExponent: exponent,
        studentResult,
        multipliedResult,
        targetMW,
        explanation: 'CIRCUIT STALL! 9⁹ is over 387 Million MW, not 81! 9 used as a factor 2 times is 9² = 81.',
        correctFormula: '9² = 9 × 9 = 81 MW (or 3⁴ = 81)',
      };
    }

    return {
      isTrap: true,
      type: 'multiplication-error',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: `CIRCUIT STALL! Exponent Trap! ${base}^${exponent} means ${Array(exponent).fill(base).join(' × ')} (${studentResult.toLocaleString()} MW), NOT ${base} × ${exponent} (${multipliedResult} MW).`,
      correctFormula: `Repeated factors: ${base}^${exponent} = ${studentResult.toLocaleString()} MW`,
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
      explanation: `CIRCUIT STALL! Zero Exponent Rule: Any non-zero base to power 0 equals 1 (${base}⁰ = 1 MW).`,
      correctFormula: `${base}⁰ = 1 MW`,
    };
  }

  // Case 4: Power of 10 error
  if (base === 10) {
    const trailingZeros = targetMW.toString().length - 1;
    return {
      isTrap: true,
      type: 'power-of-ten',
      studentBase: base,
      studentExponent: exponent,
      studentResult,
      multipliedResult,
      targetMW,
      explanation: `POWER OF 10 STALL! 10^${exponent} has ${exponent} zeros (${studentResult.toLocaleString()} MW). Target ${targetMW.toLocaleString()} requires ${trailingZeros} zeros (10^${trailingZeros}).`,
      correctFormula: `10^${trailingZeros} = ${targetMW.toLocaleString()} MW`,
    };
  }

  // Case 5: General off-target
  const comparison = studentResult > targetMW ? 'OVERLOAD' : 'UNDERPOWER';
  return {
    isTrap: false,
    type: studentResult > targetMW ? 'over-exponentiation' : 'under-exponentiation',
    studentBase: base,
    studentExponent: exponent,
    studentResult,
    multipliedResult,
    targetMW,
    explanation: `REACTOR ${comparison}! ${base}^${exponent} produces ${studentResult.toLocaleString()} MW, but target surge requires ${targetMW.toLocaleString()} MW.`,
    correctFormula: `Current: ${studentResult.toLocaleString()} MW ≠ Target: ${targetMW.toLocaleString()} MW`,
  };
}
