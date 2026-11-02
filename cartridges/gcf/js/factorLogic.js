/**
 * Vault Breaker: GCF Tumbler - Mathematical Logic & Diagnostics Engine
 * Implements Factor Pairs / Rainbow method, Common Factors, GCF calculation,
 * input format normalization ($15, 15, 15.00), and misconception diagnostics.
 */

/**
 * Normalizes user math input from varied formats (Rule 3: $15, 15, 15.00).
 * @param {string|number} input
 * @returns {number} parsed integer, or NaN if invalid
 */
export function parseMathInput(input) {
  if (typeof input === 'number') {
    return Number.isFinite(input) ? Math.floor(input) : NaN;
  }
  if (!input || typeof input !== 'string') {
    return NaN;
  }
  // Strip currency symbols ($), commas, and surrounding whitespace
  const sanitized = input.replace(/[$,\s]/g, '');
  if (!sanitized) return NaN;

  const num = Number(sanitized);
  if (!Number.isFinite(num)) return NaN;

  // If student entered 15.00, it safely resolves to 15
  return Math.floor(num);
}

/**
 * Parses a pair expression string like "3 x 8", "3*8", "3, 8", or "$3.00 x $8.00"
 * @param {string} inputStr
 * @returns {{a: number, b: number}|null}
 */
export function parseFactorPairString(inputStr) {
  if (!inputStr || typeof inputStr !== 'string') return null;
  const parts = inputStr.split(/[*x×,\s]+/i).filter(Boolean);
  if (parts.length !== 2) return null;
  const a = parseMathInput(parts[0]);
  const b = parseMathInput(parts[1]);
  if (isNaN(a) || isNaN(b) || a <= 0 || b <= 0) return null;
  return { a, b };
}

/**
 * Returns all factor pairs for positive integer n in canonical order (a <= b).
 * E.g., 24 -> [{a: 1, b: 24}, {a: 2, b: 12}, {a: 3, b: 8}, {a: 4, b: 6}]
 * @param {number} n
 * @returns {Array<{a: number, b: number, isSquare: boolean}>}
 */
export function getFactorPairs(n) {
  const target = parseMathInput(n);
  if (isNaN(target) || target <= 0) return [];

  const pairs = [];
  const limit = Math.floor(Math.sqrt(target));

  for (let i = 1; i <= limit; i++) {
    if (target % i === 0) {
      const partner = Math.floor(target / i);
      pairs.push({
        a: i,
        b: partner,
        isSquare: i === partner,
      });
    }
  }

  return pairs;
}

/**
 * Returns all distinct factors of n in ascending order.
 * E.g., 24 -> [1, 2, 3, 4, 6, 8, 12, 24]
 * @param {number} n
 * @returns {number[]}
 */
export function getAllFactorsSorted(n) {
  const target = parseMathInput(n);
  if (isNaN(target) || target <= 0) return [];

  const pairs = getFactorPairs(target);
  const factorSet = new Set();
  for (const p of pairs) {
    factorSet.add(p.a);
    factorSet.add(p.b);
  }
  return Array.from(factorSet).sort((a, b) => a - b);
}

/**
 * Returns all common factors shared by a and b in ascending order.
 * @param {number} a
 * @param {number} b
 * @returns {number[]}
 */
export function getCommonFactors(a, b) {
  const factorsA = new Set(getAllFactorsSorted(a));
  const factorsB = getAllFactorsSorted(b);
  return factorsB.filter((f) => factorsA.has(f));
}

/**
 * Calculates Greatest Common Factor using Euclidean algorithm.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function getGCF(a, b) {
  let x = Math.abs(parseMathInput(a));
  let y = Math.abs(parseMathInput(b));
  if (isNaN(x) || isNaN(y) || x === 0 || y === 0) return 1;

  while (y !== 0) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

/**
 * Calculates Greatest Common Factor for 3 numbers (Boss Stage dilemma).
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
export function get3WayGCF(a, b, c) {
  return getGCF(getGCF(a, b), c);
}

/**
 * Validates a student factor pair submission (a × b) against target dial number.
 * Both numbers must multiply to the target number.
 * Provides deep diagnostic feedback on product mismatch, partial factors, duplicates, and squares.
 * @param {number} target
 * @param {string|number} rawA
 * @param {string|number} rawB
 * @param {Array<{a: number, b: number}>} alreadyFoundPairs
 * @returns {{
 *   isValid: boolean,
 *   pair?: {a: number, b: number, isSquare: boolean},
 *   product?: number,
 *   isAlreadyFound?: boolean,
 *   message: string,
 *   diagnosticCode: string
 * }}
 */
export function validateFactorPair(target, rawA, rawB, alreadyFoundPairs = []) {
  const parsedTarget = parseMathInput(target);
  const a = parseMathInput(rawA);
  const b = parseMathInput(rawB);

  if (isNaN(a) || a <= 0 || isNaN(b) || b <= 0) {
    return {
      isValid: false,
      message: 'Both factors must be entered as positive whole numbers.',
      diagnosticCode: 'INVALID_INPUT',
    };
  }

  const product = a * b;
  const smaller = Math.min(a, b);
  const larger = Math.max(a, b);
  const isSquare = smaller === larger;

  // Check if already found
  const isAlreadyFound = alreadyFoundPairs.some(
    (p) => Math.min(p.a, p.b) === smaller && Math.max(p.a, p.b) === larger
  );

  if (isAlreadyFound) {
    return {
      isValid: true,
      pair: { a: smaller, b: larger, isSquare },
      product,
      isAlreadyFound: true,
      message: `Tumbler already engaged: ${smaller} × ${larger} = ${parsedTarget} is already locked in!`,
      diagnosticCode: 'ALREADY_LOCKED',
    };
  }

  // Exact product match
  if (product === parsedTarget) {
    return {
      isValid: true,
      pair: { a: smaller, b: larger, isSquare },
      product,
      isAlreadyFound: false,
      message: isSquare
        ? `⭐ PERFECT SQUARE ENGAGED! ${smaller} × ${larger} = ${parsedTarget}`
        : `⚡ PAIR LOCKED! ${smaller} × ${larger} = ${parsedTarget}`,
      diagnosticCode: 'PAIR_LOCKED',
    };
  }

  // Diagnosis of incorrect product
  const aIsFactor = parsedTarget % a === 0;
  const bIsFactor = parsedTarget % b === 0;

  if (aIsFactor && !bIsFactor) {
    const correctPartner = parsedTarget / a;
    return {
      isValid: false,
      product,
      message: `Partial Jam: ${a} is a factor, but ${parsedTarget} ÷ ${a} = ${correctPartner} (not ${b}). ${a} × ${b} = ${product} ≠ ${parsedTarget}.`,
      diagnosticCode: 'PARTIAL_FACTOR_A',
    };
  }

  if (!aIsFactor && bIsFactor) {
    const correctPartner = parsedTarget / b;
    return {
      isValid: false,
      product,
      message: `Partial Jam: ${b} is a factor, but ${parsedTarget} ÷ ${b} = ${correctPartner} (not ${a}). ${a} × ${b} = ${product} ≠ ${parsedTarget}.`,
      diagnosticCode: 'PARTIAL_FACTOR_B',
    };
  }

  if (aIsFactor && bIsFactor) {
    return {
      isValid: false,
      product,
      message: `Mismatched Factors: Both ${a} and ${b} are factors of ${parsedTarget}, but their product is ${product} (not ${parsedTarget})!`,
      diagnosticCode: 'MISMATCHED_FACTORS',
    };
  }

  return {
    isValid: false,
    product,
    message: `Mechanical Jam: ${a} × ${b} = ${product} ≠ ${parsedTarget}! Neither number is paired correctly.`,
    diagnosticCode: 'PRODUCT_MISMATCH',
  };
}

/**
 * Validates a single student factor submission against target dial number (legacy helper).
 */
export function validateFactor(target, rawInput, alreadyFoundFactors = new Set()) {
  const parsedTarget = parseMathInput(target);
  const input = parseMathInput(rawInput);

  if (isNaN(input) || input <= 0) {
    return {
      isValid: false,
      remainder: 0,
      message: 'Invalid tumbler input. Enter a positive whole number.',
      diagnosticCode: 'INVALID_INPUT',
    };
  }

  if (input > parsedTarget) {
    return {
      isValid: false,
      remainder: input % parsedTarget,
      isOverTarget: true,
      message: `Tumbler Jam: ${input} exceeds vault value ${parsedTarget}. A factor cannot be larger than the target.`,
      diagnosticCode: 'EXCEEDS_TARGET',
    };
  }

  const remainder = parsedTarget % input;
  if (remainder !== 0) {
    return {
      isValid: false,
      remainder,
      message: `Mechanical Jam: ${parsedTarget} ÷ ${input} = ${Math.floor(parsedTarget / input)} R ${remainder}. Not a clean factor!`,
      diagnosticCode: 'NOT_A_FACTOR',
    };
  }

  const partner = Math.floor(parsedTarget / input);
  const isAlreadyFound =
    alreadyFoundFactors.has(input) && alreadyFoundFactors.has(partner);

  if (isAlreadyFound) {
    return {
      isValid: true,
      factor: input,
      partner,
      remainder: 0,
      isAlreadyFound: true,
      message: `Tumbler already engaged: ${Math.min(input, partner)} and ${Math.max(input, partner)} are already locked in!`,
      diagnosticCode: 'ALREADY_LOCKED',
    };
  }

  const smaller = Math.min(input, partner);
  const larger = Math.max(input, partner);

  return {
    isValid: true,
    factor: input,
    partner,
    remainder: 0,
    isAlreadyFound: false,
    message:
      smaller === larger
        ? `⭐ SQUARE FACTOR ENGAGED! ${smaller} × ${larger} = ${parsedTarget}`
        : `⚡ PAIR LOCKED! ${smaller} × ${larger} = ${parsedTarget}`,
    diagnosticCode: 'FACTOR_LOCKED',
  };
}

/**
 * Evaluates student Master Key strike in Phase 3.
 * Diagnoses whether chosen key is GCF, just a common factor, or invalid.
 * @param {string|number} rawKey
 * @param {number} targetA
 * @param {number} targetB
 * @returns {{
 *   isGCF: boolean,
 *   isCommonFactor: boolean,
 *   selectedKey: number,
 *   gcf: number,
 *   feedback: string,
 *   torqueRatio: number
 * }}
 */
export function evaluateMasterKeySelection(rawKey, targetA, targetB) {
  const key = parseMathInput(rawKey);
  const gcf = getGCF(targetA, targetB);
  const commonFactors = getCommonFactors(targetA, targetB);

  if (isNaN(key) || key <= 0) {
    return {
      isGCF: false,
      isCommonFactor: false,
      selectedKey: 0,
      gcf,
      feedback: 'Select a valid key to strike the hydraulic lock.',
      torqueRatio: 0,
    };
  }

  const isCommon = commonFactors.includes(key);
  const isGCF = key === gcf;

  if (isGCF) {
    return {
      isGCF: true,
      isCommonFactor: true,
      selectedKey: key,
      gcf,
      feedback: `💥 MAXIMUM HYDRAULIC TORQUE CONFIRMED! ${gcf} is the Greatest Common Factor of ${targetA} and ${targetB}! Blast doors opening!`,
      torqueRatio: 1.0,
    };
  }

  if (isCommon) {
    const torqueRatio = Math.round((key / gcf) * 100);
    return {
      isGCF: false,
      isCommonFactor: true,
      selectedKey: key,
      gcf,
      feedback: `⚠️ INSUFFICIENT TORQUE (${torqueRatio}%): ${key} is a shared factor, but you need the GREATEST common factor (${gcf}) to overcome the blast lock!`,
      torqueRatio: key / gcf,
    };
  }

  return {
    isGCF: false,
    isCommonFactor: false,
    selectedKey: key,
    gcf,
    feedback: `⛔ ACCESS DENIED: Key ${key} does not divide both ${targetA} and ${targetB} evenly!`,
    torqueRatio: 0,
  };
}
