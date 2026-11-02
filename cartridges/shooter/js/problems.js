/**
 * Term Popper - Problem Datasets & Progressive 3-Stage Curriculum
 * Lesson 3-7 / 6.EE.A.3: Combining Like Terms
 */

// Stage 1: Two 1st-Power Variables + Constants
export const STAGE_1_TERMS = [
  "3x",
  "-5x",
  "x",
  "2y",
  "-4y",
  "y",
  "7",
  "-3",
  "4"
];

// Stage 2: Three 1st-Power Variables + Squares + Constants
export const STAGE_2_TERMS = [
  "2x",
  "-4x",
  "3y",
  "-y",
  "5z",
  "-2z",
  "3x²",
  "-x²",
  "2y²",
  "6",
  "-5"
];

// Stage 3: Powers of x (x, x², x³) + Linear y, z + Constants
export const STAGE_3_TERMS = [
  "4x",
  "-2x",
  "x²",
  "-3x²",
  "2x³",
  "-x³",
  "3y",
  "-y",
  "5z",
  "-2z",
  "8",
  "-4"
];

// Wave configurations
export const WAVES = [
  {
    waveNumber: 1,
    title: "Stage 1: Linear Terms & Constants",
    description: "Combine x with x, y with y, and constants with constants.",
    terms: STAGE_1_TERMS,
    targetClusters: 10
  },
  {
    waveNumber: 2,
    title: "Stage 2: Variables (x, y, z), Squares (x², y²), & Constants",
    description: "Combine like terms and powers; constants combine with constants.",
    terms: STAGE_2_TERMS,
    targetClusters: 10
  },
  {
    waveNumber: 3,
    title: "Stage 3: Powers of x (x, x², x³) + y, z, & Constants",
    description: "Combine only when BOTH the variable base and exponent are identical.",
    terms: STAGE_3_TERMS,
    targetClusters: 10
  }
];

// Backwards-compatibility default terms export (Stage 1)
export const TERMS = STAGE_1_TERMS;

/**
 * Extracts a normalized mathematical signature for a term.
 * - Constants (and currency or numbers like "$15", "15", "15.00") return an empty string "".
 * - Variable terms return "[base]^[exponent]" (e.g. "3x" -> "x^1", "3x²" -> "x^2", "-x³" -> "x^3").
 *
 * @param {string|number} term
 * @returns {string|null}
 */
export function getTermSignature(term) {
  if (term === null || term === undefined) return null;
  const str = String(term).trim();
  if (str === "") return null;

  // Clean currency symbols or spaces
  const cleaned = str.replace(/[$€£]/g, "").trim();

  // Match variable letter(s) and any superscript/caret exponent
  const match = cleaned.match(/([a-zA-Z]+)(?:\^(\d+)|([²³\u00B2\u00B3]))?/);
  if (!match) {
    // If no alphabetic variable letters exist, check if numeric constant
    const numericPart = cleaned.replace(/,/g, "");
    if (!isNaN(Number(numericPart))) {
      return ""; // Constant signature
    }
    return null;
  }

  const base = match[1].toLowerCase();
  let exponent = "1";
  if (match[2]) {
    exponent = match[2];
  } else if (match[3]) {
    if (match[3] === "²" || match[3] === "\u00B2") exponent = "2";
    else if (match[3] === "³" || match[3] === "\u00B3") exponent = "3";
  }

  return `${base}^${exponent}`;
}

/**
 * Checks if two mathematical terms are like terms that can combine.
 * Terms combine IF AND ONLY IF both the variable base AND the exponent are identical.
 * (e.g., "3x" matches "x", "3x²" matches "-x²", "x²" and "x" do NOT match, constants match constants).
 *
 * @param {string|number} termA
 * @param {string|number} termB
 * @returns {boolean}
 */
export function doTermsMatch(termA, termB) {
  const sigA = getTermSignature(termA);
  const sigB = getTermSignature(termB);

  if (sigA === null || sigB === null) return false;
  return sigA === sigB;
}

/**
 * Returns a random term from a specified wave pool.
 * @param {number} waveNumber (1, 2, or 3)
 * @returns {string}
 */
export function getRandomTermForWave(waveNumber = 1) {
  const wave = WAVES.find(w => w.waveNumber === waveNumber) || WAVES[0];
  const index = Math.floor(Math.random() * wave.terms.length);
  return wave.terms[index];
}

/**
 * Legacy helper for backwards compatibility.
 */
export function getRandomTerm() {
  return getRandomTermForWave(1);
}
