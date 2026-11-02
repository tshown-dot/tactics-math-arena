/**
 * Term Popper - Boss Challenge: Core Stabilization Terminal
 * Lesson 3-7 Capstone Phase (Combining Like Terms)
 */

export const BOSS_CHALLENGES = [
  {
    id: 1,
    title: "Challenge 1: Single Variable Chain",
    instruction: "Combine all like terms with variable x.",
    chainNodes: [
      { term: "4x", op: null },
      { term: "7x", op: "+" },
      { term: "3x", op: "-" }
    ],
    targetExpression: "8x",
    explanation: "4x + 7x - 3x = (4 + 7 - 3)x = 8x",
    breakdowns: {
      "x^1": { terms: "4x + 7x - 3x", result: "8x" }
    }
  },
  {
    id: 2,
    title: "Challenge 2: Two Variables + Constants",
    instruction: "Combine x-terms together, y-terms together, and constants together.",
    chainNodes: [
      { term: "5x", op: null },
      { term: "3y", op: "+" },
      { term: "2x", op: "+" },
      { term: "y", op: "-" },
      { term: "4", op: "+" }
    ],
    targetExpression: "7x + 2y + 4",
    explanation: "(5x + 2x) + (3y - y) + 4 = 7x + 2y + 4",
    breakdowns: {
      "x^1": { terms: "5x + 2x", result: "7x" },
      "y^1": { terms: "3y - y", result: "2y" },
      "": { terms: "4", result: "4" }
    }
  },
  {
    id: 3,
    title: "Challenge 3: Exponents + Like Terms",
    instruction: "Remember: x² and x CANNOT combine! Powers must match exactly.",
    chainNodes: [
      { term: "3x²", op: null },
      { term: "4x", op: "+" },
      { term: "2x²", op: "+" },
      { term: "x", op: "-" },
      { term: "5", op: "+" }
    ],
    targetExpression: "5x² + 3x + 5",
    explanation: "(3x² + 2x²) + (4x - x) + 5 = 5x² + 3x + 5",
    breakdowns: {
      "x^2": { terms: "3x² + 2x²", result: "5x²" },
      "x^1": { terms: "4x - x", result: "3x" },
      "": { terms: "5", result: "5" }
    }
  }
];

/**
 * Parses a single monomial term string into signed coefficient and variable signature.
 * E.g., "7x" -> { coeff: 7, signature: "x^1" }
 *       "-3x^2" -> { coeff: -3, signature: "x^2" }
 *       "-x" -> { coeff: -1, signature: "x^1" }
 *       "4" -> { coeff: 4, signature: "" }
 */
export function parseSingleTerm(termStr) {
  if (!termStr) return null;
  const clean = termStr.trim().replace(/[$€£]/g, "");
  if (clean === "") return null;

  // Regex: optional sign, optional coefficient, optional variable with optional exponent
  const match = clean.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+)?)([a-zA-Z]+(?:\^\d+)?)?$/);
  if (!match) return null;

  const coeffPart = match[1];
  const varPart = match[2] || "";

  let coeff;
  if (coeffPart === "" || coeffPart === "+") {
    coeff = varPart ? 1 : null;
  } else if (coeffPart === "-") {
    coeff = varPart ? -1 : null;
  } else {
    coeff = parseFloat(coeffPart);
  }

  if (coeff === null || isNaN(coeff)) return null;

  let signature = "";
  if (varPart) {
    const vMatch = varPart.match(/^([a-zA-Z]+)(?:\^(\d+))?$/);
    if (!vMatch) return null;
    const base = vMatch[1].toLowerCase();
    const exp = vMatch[2] || "1";
    signature = `${base}^${exp}`;
  }

  return { coeff, signature };
}

/**
 * Normalizes an algebraic expression and parses it into a canonical map of { signature: coefficient }.
 * Also detects if the user has duplicate uncombined terms of the same signature.
 */
export function parseExpressionToMap(exprStr) {
  if (typeof exprStr !== "string") return null;

  // Normalize: remove currency signs, spaces, and convert superscripts to ^exp
  let normalized = exprStr
    .trim()
    .replace(/[$€£]/g, "")
    .replace(/\s+/g, "")
    .replace(/[²\u00B2]/g, "^2")
    .replace(/[³\u00B3]/g, "^3");

  if (normalized === "") return null;

  // Convert subtraction to signed additive terms: a - b -> a + -b
  // Handles "-3x - 4" -> "-3x + -4"
  normalized = normalized.replace(/([^\+\-\^])\-/g, "$1+-");
  normalized = normalized.replace(/\+\+/g, "+");

  const rawTokens = normalized.split("+").filter(t => t.length > 0);
  if (rawTokens.length === 0) return null;

  const map = new Map();
  const signatureCounts = new Map();

  for (const token of rawTokens) {
    const parsed = parseSingleTerm(token);
    if (!parsed) return null; // Invalid syntax

    signatureCounts.set(parsed.signature, (signatureCounts.get(parsed.signature) || 0) + 1);
    const existing = map.get(parsed.signature) || 0;
    map.set(parsed.signature, existing + parsed.coeff);
  }

  // Remove zero-coefficient terms (e.g. 0x -> 0)
  for (const [sig, coeff] of map.entries()) {
    if (Math.abs(coeff) < 0.0001) {
      map.delete(sig);
    }
  }

  return {
    map,
    signatureCounts,
    rawTokens
  };
}

/**
 * Formats a signature like "x^2" or "x^1" or "" for student-facing feedback.
 */
function formatSig(sig) {
  if (sig === "") return "constants";
  if (sig === "x^1") return "x";
  if (sig === "y^1") return "y";
  if (sig === "z^1") return "z";
  if (sig === "x^2") return "x²";
  if (sig === "y^2") return "y²";
  if (sig === "z^2") return "z²";
  if (sig === "x^3") return "x³";
  return sig;
}

/**
 * Validates a student's expression against the target challenge.
 * - Supports any commutative order (e.g. "4 + 7x + 2y" equals "7x + 2y + 4").
 * - Supports both x² and x^2.
 * - Detects unsimplified duplicate terms.
 * - Pinpoints misconceptions with targeted guidance.
 * 
 * @param {string} studentInput
 * @param {Object} challenge
 * @returns {{ correct: boolean, feedback: string }}
 */
export function validateBossAnswer(studentInput, challenge) {
  if (!studentInput || studentInput.trim() === "") {
    return {
      correct: false,
      feedback: "Terminal input is empty. Enter the simplified expression."
    };
  }

  const studentParsed = parseExpressionToMap(studentInput);
  if (!studentParsed) {
    return {
      correct: false,
      feedback: "Syntax error: Check your signs (+/-) and terms. (Example: 7x + 2y + 4)"
    };
  }

  // Check if student left uncombined like terms
  for (const [sig, count] of studentParsed.signatureCounts.entries()) {
    if (count > 1) {
      return {
        correct: false,
        feedback: `You still have like terms to combine! Combine all ${formatSig(sig)} terms completely.`
      };
    }
  }

  const targetParsed = parseExpressionToMap(challenge.targetExpression);
  if (!targetParsed) {
    return { correct: false, feedback: "Internal challenge error." };
  }

  const studentMap = studentParsed.map;
  const targetMap = targetParsed.map;

  // Compare maps
  let isMatch = true;

  // Check for mismatched coefficients or missing terms
  for (const [sig, targetCoeff] of targetMap.entries()) {
    const studentCoeff = studentMap.get(sig);
    if (studentCoeff === undefined) {
      isMatch = false;
      const breakdown = challenge.breakdowns && challenge.breakdowns[sig];
      if (breakdown) {
        return {
          correct: false,
          feedback: `Missing ${formatSig(sig)} terms! Notice: ${breakdown.terms} = ${breakdown.result}.`
        };
      }
      return {
        correct: false,
        feedback: `Missing ${formatSig(sig)} term in your simplified answer.`
      };
    }

    if (Math.abs(studentCoeff - targetCoeff) > 0.0001) {
      isMatch = false;
      const breakdown = challenge.breakdowns && challenge.breakdowns[sig];
      const friendlySig = formatSig(sig);
      if (breakdown) {
        return {
          correct: false,
          feedback: `Check your ${friendlySig} terms: ${breakdown.terms} = ${breakdown.result}, not ${studentCoeff}${friendlySig === "constants" ? "" : friendlySig}.`
        };
      }
      return {
        correct: false,
        feedback: `Check coefficient for ${friendlySig}: expected ${targetCoeff}, got ${studentCoeff}.`
      };
    }
  }

  // Check if student added extra invalid terms
  for (const [sig] of studentMap.entries()) {
    if (!targetMap.has(sig)) {
      return {
        correct: false,
        feedback: `Unexpected term '${formatSig(sig)}'. Unlike terms cannot be created!`
      };
    }
  }

  return {
    correct: true,
    feedback: "Core resonance stabilized! Expression simplified perfectly."
  };
}
