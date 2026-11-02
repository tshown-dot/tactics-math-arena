/**
 * Power Grid: LCM Circuit Breaker - Mathematical Logic Engine
 * Aligned with enVisionmath 2.0 Topic 3 (Least Common Multiple)
 * Zero frameworks, pure vanilla ES Module
 */

/**
 * Parses user input supporting multiple numeric formats:
 * e.g., 15, "15", "$15", "15.00", " $15.00 ", "$1,000"
 * Returns NaN if input cannot be parsed as a positive finite number.
 */
export function parseMathInput(val) {
  if (val === null || val === undefined) return NaN;
  if (typeof val === 'number') {
    return isFinite(val) && !isNaN(val) ? val : NaN;
  }
  if (typeof val !== 'string') return NaN;

  // Trim whitespace, strip currency symbol ($), commas, percent signs
  const cleaned = val.trim().replace(/^\$/, '').replace(/,/g, '').replace(/%$/, '').trim();
  if (cleaned.length === 0) return NaN;

  const parsed = Number(cleaned);
  return isFinite(parsed) && !isNaN(parsed) ? parsed : NaN;
}

/**
 * Greatest Common Divisor (Euclidean algorithm)
 */
export function gcd(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}

/**
 * Least Common Multiple for two integers
 */
export function lcm(a, b) {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  if (a === 0 || b === 0) return 0;
  return (a * b) / gcd(a, b);
}

/**
 * Least Common Multiple for an array of numbers (2 or 3 numbers)
 */
export function lcmMultiple(nums) {
  if (!nums || nums.length === 0) return 0;
  return nums.reduce((acc, curr) => lcm(acc, curr));
}

/**
 * Returns all positive multiples of `n` up to `max` (default 100)
 */
export function getMultiples(n, max = 100) {
  if (n <= 0) return [];
  const multiples = [];
  for (let i = n; i <= max; i += n) {
    multiples.push(i);
  }
  return multiples;
}

/**
 * Returns all common multiples for a set of numbers up to `max` (default 100)
 */
export function getCommonMultiples(nums, max = 100) {
  if (!nums || nums.length === 0) return [];
  const baseLcm = lcmMultiple(nums);
  if (baseLcm === 0 || baseLcm > max) return [];
  return getMultiples(baseLcm, max);
}

/**
 * Result classification types for circuit breaker placement
 */
export const EVALUATION_RESULTS = {
  PERFECT_LCM: 'PERFECT_LCM',
  HIGHER_COMMON_MULTIPLE: 'HIGHER_COMMON_MULTIPLE',
  SINGLE_MULTIPLE: 'SINGLE_MULTIPLE',
  NON_MULTIPLE: 'NON_MULTIPLE',
};

/**
 * Inspects a tile during hover to provide instant pedagogical telemetry.
 * Gives students real-time intuitive guidance on divisibility and overlaps.
 */
export function inspectTile(tileNum, generatorValues) {
  const tile = Math.round(parseMathInput(tileNum));
  if (isNaN(tile) || tile < 1 || tile > 100) {
    return {
      isValid: false,
      text: 'Out of bounds (1–100 only)',
      type: 'invalid',
    };
  }

  const targetLcm = lcmMultiple(generatorValues);
  const isShared = generatorValues.every((v) => tile % v === 0);
  const matchingGens = generatorValues.filter((v) => tile % v === 0);

  if (tile === targetLcm) {
    return {
      isValid: true,
      tile,
      isLcm: true,
      type: 'perfect',
      badge: '🎯 TARGET LCM',
      text: `Tile ${tile} is the FIRST overlap! Both waves collide here first (${generatorValues.map((v) => `${v}×${tile / v}`).join(' and ')}). Click to place breaker!`,
    };
  }

  if (isShared) {
    return {
      isValid: true,
      tile,
      isLcm: false,
      type: 'higher-multiple',
      badge: '⚠ HIGHER MULTIPLE',
      text: `Tile ${tile} is a common multiple (${generatorValues.map((v) => `${v}×${tile / v}`).join(', ')}), but the surge will hit Tile ${targetLcm} FIRST!`,
    };
  }

  if (matchingGens.length > 0) {
    const missing = generatorValues.filter((v) => tile % v !== 0);
    return {
      isValid: true,
      tile,
      isLcm: false,
      type: 'partial',
      badge: '⚡ PARTIAL WAVE ONLY',
      text: `Tile ${tile} only matches [${matchingGens.join(', ')}]. It misses [${missing.join(', ')}]. The surge meets at ${targetLcm}!`,
    };
  }

  return {
    isValid: true,
    tile,
    isLcm: false,
    type: 'dead',
    badge: '○ DEAD TILE',
    text: `Tile ${tile} is not on any active generator frequency. Count by [${generatorValues.join(', ')}] to find the overlap!`,
  };
}

/**
 * Evaluates student's circuit breaker placement against generator frequencies.
 * @param {number|string} placedInput - The tile number chosen by student
 * @param {number[]} generatorValues - Active generator frequencies (e.g. [4, 6] or [2, 3, 5])
 * @param {number} currentStreak - Current successful streak count
 * @returns {object} EvaluationOutcome with detailed diagnostic feedback
 */
export function evaluatePlacement(placedInput, generatorValues, currentStreak = 0) {
  const placedTile = Math.round(parseMathInput(placedInput));
  const targetLcm = lcmMultiple(generatorValues);
  const commonMultiples = getCommonMultiples(generatorValues, 100);

  if (isNaN(placedTile) || placedTile < 1 || placedTile > 100) {
    return {
      result: EVALUATION_RESULTS.NON_MULTIPLE,
      targetLcm,
      placedTile: isNaN(placedTile) ? 0 : placedTile,
      generatorValues,
      commonMultiplesInGrid: commonMultiples,
      stabilityDamage: 25,
      scoreDelta: 0,
      hudTitle: 'INVALID TILE COORDINATE',
      hudMessage: 'Placement coordinates must be a valid number between 1 and 100.',
      mathExplanation: `Please enter or click a grid cell from 1 to 100. Target LCM is ${targetLcm}.`,
      diagnosticMisconception: 'OUT_OF_BOUNDS',
      isSuccess: false,
    };
  }

  const isSharedMultiple = generatorValues.every((val) => placedTile % val === 0);
  const isMultipleOfAny = generatorValues.some((val) => placedTile % val === 0);
  const genStr = generatorValues.join(', ');

  // 1. PERFECT LCM
  if (placedTile === targetLcm) {
    const streakBonus = Math.min(currentStreak, 5) * 50;
    const score = 100 + streakBonus;

    return {
      result: EVALUATION_RESULTS.PERFECT_LCM,
      targetLcm,
      placedTile,
      generatorValues,
      commonMultiplesInGrid: commonMultiples,
      stabilityDamage: 0,
      scoreDelta: score,
      hudTitle: 'GRID STABILIZED: PERFECT LOCK!',
      hudMessage: `Tile ${targetLcm} is the LEAST Common Multiple for generators [${genStr}]! Frequency arc safely grounded!`,
      mathExplanation: `Multiples collide at ${commonMultiples.slice(0, 4).join(', ')}... and ${targetLcm} is the very first (LEAST) overlap!`,
      diagnosticMisconception: null,
      isSuccess: true,
    };
  }

  // 2. HIGHER COMMON MULTIPLE (Classic Trap: e.g. picking 24 instead of 12 for 4 and 6)
  if (isSharedMultiple) {
    return {
      result: EVALUATION_RESULTS.HIGHER_COMMON_MULTIPLE,
      targetLcm,
      placedTile,
      generatorValues,
      commonMultiplesInGrid: commonMultiples,
      stabilityDamage: 30,
      scoreDelta: 25,
      hudTitle: 'CIRCUIT BREACHED: HIGHER MULTIPLE DETECTED!',
      hudMessage: `Breaker placed at Tile ${placedTile}, but the transformer arc flash detonated at the FIRST collision: Tile ${targetLcm}!`,
      mathExplanation: `Tile ${placedTile} is indeed a common multiple, but LCM requires the LEAST (earliest) multiple! The pulses first met at ${targetLcm}.`,
      diagnosticMisconception: 'CONFUSED_COMMON_WITH_LEAST',
      isSuccess: false,
    };
  }

  // 3. SINGLE MULTIPLE (Only matches one generator frequency)
  if (isMultipleOfAny) {
    const matchingGens = generatorValues.filter((v) => placedTile % v === 0);
    const missingGens = generatorValues.filter((v) => placedTile % v !== 0);

    return {
      result: EVALUATION_RESULTS.SINGLE_MULTIPLE,
      targetLcm,
      placedTile,
      generatorValues,
      commonMultiplesInGrid: commonMultiples,
      stabilityDamage: 40,
      scoreDelta: 0,
      hudTitle: 'FREQUENCY MISMATCH: PARTIAL PULSE ONLY!',
      hudMessage: `Tile ${placedTile} only conducts Generator [${matchingGens.join(', ')}], missing Generator [${missingGens.join(', ')}]. Surges collided at Tile ${targetLcm}!`,
      mathExplanation: `A common multiple must be divisible by ALL active generators ([${genStr}]). Count by each to find their first intersection: ${targetLcm}.`,
      diagnosticMisconception: 'PARTIAL_MULTIPLE_ONLY',
      isSuccess: false,
    };
  }

  // 4. NON-MULTIPLE (Completely off frequency)
  return {
    result: EVALUATION_RESULTS.NON_MULTIPLE,
    targetLcm,
    placedTile,
    generatorValues,
    commonMultiplesInGrid: commonMultiples,
    stabilityDamage: 50,
    scoreDelta: 0,
    hudTitle: 'GRID SHORT-CIRCUIT: DEAD TILE!',
    hudMessage: `Tile ${placedTile} does not carry ANY active generator frequency. Uncontained surge collided at Tile ${targetLcm}!`,
    mathExplanation: `None of [${genStr}] divide evenly into ${placedTile}. Count multiples of the generators to find where they synchronize: ${targetLcm}.`,
    diagnosticMisconception: 'NON_MULTIPLE',
    isSuccess: false,
  };
}
