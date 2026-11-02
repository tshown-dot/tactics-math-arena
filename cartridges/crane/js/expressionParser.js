/**
 * Demolition Crane - Expression Parser & PEMDAS Engine
 * Parses raw arithmetic expressions into tokens, validates moves against
 * Order of Operations (PEMDAS / GEMS), and executes demolition reductions.
 */

let idCounter = 1;
export function generateTokenId() {
  return `tok_${idCounter++}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Normalizes math string input and sanitizes formatting like currency symbols ($) or commas.
 */
export function normalizeMathInput(raw) {
  if (typeof raw !== 'string') return String(raw);
  return raw
    .replace(/^\s*\$\s*/, '')
    .replace(/\s*\$\s*$/, '')
    .replace(/,/g, '')
    .trim();
}

/**
 * Parses raw input string into token array with depth, containers, and fraction tiers.
 */
export function parseExpressionToTokens(rawInput) {
  const input = (rawInput || '').trim();
  const tokens = [];
  let depth = 0;
  const containerStack = [];

  // Detect top-level fraction slash: (Num) / (Den) or [Num] / [Den]
  let topSlashIndex = -1;
  let parenLevel = 0;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '(' || ch === '[') parenLevel++;
    else if (ch === ')' || ch === ']') parenLevel--;
    else if (ch === '/' && parenLevel === 0) {
      topSlashIndex = i;
      break;
    }
  }

  const isTopLevelFraction = topSlashIndex !== -1;
  let i = 0;
  let currentFractionTier = isTopLevelFraction ? 'numerator' : 'root';

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (isTopLevelFraction && i === topSlashIndex) {
      tokens.push({
        id: generateTokenId(),
        type: 'fraction_bar',
        value: '÷',
        depth: 0,
        tier: 'root',
      });
      currentFractionTier = 'denominator';
      i++;
      continue;
    }

    if (ch === '(') {
      depth++;
      const cid = `c_${depth}_${Math.random().toString(36).substring(2, 6)}`;
      containerStack.push(cid);
      tokens.push({
        id: generateTokenId(),
        type: 'open_paren',
        value: '(',
        depth,
        containerId: cid,
        tier: currentFractionTier,
      });
      i++;
    } else if (ch === ')') {
      const cid = containerStack.pop() || '';
      tokens.push({
        id: generateTokenId(),
        type: 'close_paren',
        value: ')',
        depth,
        containerId: cid,
        tier: currentFractionTier,
      });
      depth = Math.max(0, depth - 1);
      i++;
    } else if (ch === '[') {
      depth++;
      const cid = `b_${depth}_${Math.random().toString(36).substring(2, 6)}`;
      containerStack.push(cid);
      tokens.push({
        id: generateTokenId(),
        type: 'open_bracket',
        value: '[',
        depth,
        containerId: cid,
        tier: currentFractionTier,
      });
      i++;
    } else if (ch === ']') {
      const cid = containerStack.pop() || '';
      tokens.push({
        id: generateTokenId(),
        type: 'close_bracket',
        value: ']',
        depth,
        containerId: cid,
        tier: currentFractionTier,
      });
      depth = Math.max(0, depth - 1);
      i++;
    } else if (ch === '+' || ch === '-' || ch === '*' || ch === '×' || ch === '/' || ch === '÷' || ch === '^') {
      let displaySymbol = ch;
      if (ch === '*') displaySymbol = '×';
      if (ch === '/') displaySymbol = '÷';

      tokens.push({
        id: generateTokenId(),
        type: 'operator',
        value: displaySymbol,
        depth,
        containerId: containerStack[containerStack.length - 1],
        tier: currentFractionTier,
      });
      i++;
    } else if (ch === '$' || /[0-9]/.test(ch)) {
      if (ch === '$') {
        i++;
        while (i < input.length && /\s/.test(input[i])) i++;
      }
      let numStr = '';
      while (i < input.length && /[0-9.]/.test(input[i])) {
        numStr += input[i];
        i++;
      }
      if (i < input.length && input[i] === '$') {
        i++;
      }
      const numVal = parseFloat(numStr);
      tokens.push({
        id: generateTokenId(),
        type: 'number',
        value: numStr,
        numericValue: numVal,
        depth,
        containerId: containerStack[containerStack.length - 1],
        tier: currentFractionTier,
      });
    } else {
      i++;
    }
  }

  return cleanRedundantTiers(tokens);
}

/**
 * Returns string representation of token array for history logs.
 */
export function tokensToText(tokens) {
  let out = '';
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'number' || t.type === 'operator' || t.type === 'fraction_bar') {
      out += (out.length > 0 && !out.endsWith('(') && !out.endsWith('[') ? ' ' : '') + t.value;
    } else {
      out += (t.type === 'close_paren' || t.type === 'close_bracket' ? '' : ' ') + t.value;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Get precedence level of an operator (higher number = higher precedence).
 */
export function getOperatorPrecedence(op) {
  if (op === '^') return 3; // Exponents
  if (op === '×' || op === '*' || op === '÷' || op === '/') return 2; // Mult / Div
  if (op === '+' || op === '-') return 1; // Add / Sub
  return 0;
}

/**
 * Finds the operand tokens adjacent to an operator.
 */
export function findOperandsForOperator(tokens, operatorIndex) {
  const op = tokens[operatorIndex];
  if (!op || (op.type !== 'operator' && op.type !== 'fraction_bar')) return null;

  let leftIndex = -1;
  let rightIndex = -1;

  // Search left for immediate number operand
  for (let i = operatorIndex - 1; i >= 0; i--) {
    const t = tokens[i];
    if (t.type === 'number') {
      leftIndex = i;
      break;
    }
    if (t.type === 'operator' || t.type === 'fraction_bar' || t.type === 'open_paren' || t.type === 'open_bracket') {
      break;
    }
  }

  // Search right for immediate number operand
  for (let i = operatorIndex + 1; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'number') {
      rightIndex = i;
      break;
    }
    if (t.type === 'operator' || t.type === 'fraction_bar' || t.type === 'close_paren' || t.type === 'close_bracket') {
      break;
    }
  }

  if (leftIndex === -1 || rightIndex === -1) {
    return null;
  }

  return { leftIndex, rightIndex };
}

/**
 * Determines the strictly legal next move according to order of operations rules.
 */
export function getLegalNextMove(tokens) {
  const opsWithIndices = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.type === 'operator' || t.type === 'fraction_bar') {
      opsWithIndices.push({ token: t, index: i });
    }
  }

  if (opsWithIndices.length === 0) return null;

  // Check if there is a fraction bar
  const fractionBar = opsWithIndices.find((o) => o.token.type === 'fraction_bar');
  if (fractionBar) {
    // Check if there are ANY remaining operators in numerator or denominator
    const nonFractionOps = opsWithIndices.filter((o) => o.token.type !== 'fraction_bar');
    if (nonFractionOps.length > 0) {
      // Must solve numerator / denominator first! Fraction bar cannot be legal yet.
      return findLegalMoveAmong(nonFractionOps, tokens);
    } else {
      // Central fraction bar is now legal!
      const operands = findOperandsForOperator(tokens, fractionBar.index);
      if (operands) {
        return {
          legalTokenId: fractionBar.token.id,
          legalIndex: fractionBar.index,
          leftIndex: operands.leftIndex,
          rightIndex: operands.rightIndex,
        };
      }
    }
  }

  return findLegalMoveAmong(opsWithIndices, tokens);
}

function findLegalMoveAmong(candidateOps, tokens) {
  // 1. Find max depth among candidates
  let maxDepth = -1;
  for (const op of candidateOps) {
    if (op.token.depth > maxDepth) {
      maxDepth = op.token.depth;
    }
  }

  // Filter candidates to those at maxDepth
  const atMaxDepth = candidateOps.filter((o) => o.token.depth === maxDepth);

  // 2. Find max precedence among candidates at maxDepth
  let maxPrecedence = -1;
  for (const op of atMaxDepth) {
    const prec = getOperatorPrecedence(op.token.value);
    if (prec > maxPrecedence) {
      maxPrecedence = prec;
    }
  }

  const atMaxPrecedence = atMaxDepth.filter(
    (o) => getOperatorPrecedence(o.token.value) === maxPrecedence
  );

  // 3. Left-to-right tie-breaker: the lowest index is the legal one!
  atMaxPrecedence.sort((a, b) => a.index - b.index);
  const legalOp = atMaxPrecedence[0];

  const operands = findOperandsForOperator(tokens, legalOp.index);
  if (!operands) return null;

  return {
    legalTokenId: legalOp.token.id,
    legalIndex: legalOp.index,
    leftIndex: operands.leftIndex,
    rightIndex: operands.rightIndex,
  };
}

/**
 * Validates whether the targeted operator is the legal next move.
 * If illegal, determines the exact pedagogical reason and helpful explanation.
 */
export function validateMove(tokens, targetedTokenId) {
  const legalMove = getLegalNextMove(tokens);
  if (!legalMove) {
    return {
      isLegal: false,
      targetOperatorId: targetedTokenId,
      message: 'Expression is already fully demolished!',
      ruleTitle: 'Complete',
    };
  }

  const targetIndex = tokens.findIndex((t) => t.id === targetedTokenId);
  if (targetIndex === -1) {
    return {
      isLegal: false,
      targetOperatorId: targetedTokenId,
      message: 'Operator not found.',
      ruleTitle: 'Error',
    };
  }

  const targetToken = tokens[targetIndex];
  const targetOperands = findOperandsForOperator(tokens, targetIndex);

  if (targetToken.id === legalMove.legalTokenId) {
    // Valid move!
    const leftToken = tokens[legalMove.leftIndex];
    const rightToken = tokens[legalMove.rightIndex];
    const evaluated = computeResult(leftToken.numericValue ?? 0, targetToken.value, rightToken.numericValue ?? 0);

    return {
      isLegal: true,
      targetOperatorId: targetedTokenId,
      leftTokenId: leftToken.id,
      rightTokenId: rightToken.id,
      evaluatedValue: evaluated,
      message: `Impact Confirmed! Evaluated ${leftToken.value} ${targetToken.value} ${rightToken.value} = ${evaluated}.`,
      ruleTitle: 'Structural Demolition',
    };
  }

  // Illegal move diagnostics
  const legalToken = tokens[legalMove.legalIndex];

  // Diagnostic 1: Central Fraction Bar premature click
  if (targetToken.type === 'fraction_bar') {
    return {
      isLegal: false,
      targetOperatorId: targetedTokenId,
      violationType: 'FRACTION_INCOMPLETE',
      ruleTitle: 'Fraction Girder Isolated',
      message:
        'Structural Fault: The central fraction bar acts as a grouping divider. You must completely evaluate both the top girder (numerator) and bottom girder (denominator) to single values before demolishing the central division bar!',
    };
  }

  // Diagnostic 2: Grouping Depth Violation (Parentheses/Brackets First)
  if (targetToken.depth < legalToken.depth) {
    return {
      isLegal: false,
      targetOperatorId: targetedTokenId,
      violationType: 'PARENTHESIS_FIRST',
      ruleTitle: 'Innermost Grouping Priority',
      message:
        'Structural Fault: Operations inside the innermost parentheses ( ) or brackets [ ] must be completely resolved before any outer operations can be demolished!',
    };
  }

  // Diagnostic 3: Precedence Violation (Exponents vs Mult/Div/Add/Sub)
  const targetPrec = getOperatorPrecedence(targetToken.value);
  const legalPrec = getOperatorPrecedence(legalToken.value);

  if (targetPrec < legalPrec) {
    if (legalPrec === 3) {
      return {
        isLegal: false,
        targetOperatorId: targetedTokenId,
        violationType: 'EXPONENT_PRIORITY',
        ruleTitle: 'Exponents Take Priority',
        message:
          'Structural Fault: Exponents (powers) rank higher than multiplication, division, addition, or subtraction! Clear the power (^) first.',
      };
    }
    if (legalPrec === 2 && targetPrec === 1) {
      return {
        isLegal: false,
        targetOperatorId: targetedTokenId,
        violationType: 'MULT_DIV_PRIORITY',
        ruleTitle: 'Multiplication & Division Priority',
        message:
          'Structural Fault: Multiplication (×) and Division (÷) rank higher than Addition (+) and Subtraction (−)! Clear products and quotients first.',
      };
    }
  }

  // Diagnostic 4: Left-to-Right Tie Breaker
  if (targetPrec === legalPrec && targetToken.depth === legalToken.depth) {
    if (targetIndex > legalMove.legalIndex) {
      return {
        isLegal: false,
        targetOperatorId: targetedTokenId,
        violationType: 'LEFT_TO_RIGHT',
        ruleTitle: 'Left-to-Right Tie Breaker',
        message:
          `Structural Fault: "${targetToken.value}" and "${legalToken.value}" share equal priority! According to the PEMDAS demolition code, you must always execute equal-rank operations strictly from Left to Right.`,
      };
    }
  }

  return {
    isLegal: false,
    targetOperatorId: targetedTokenId,
    leftTokenId: targetOperands?.leftIndex ? tokens[targetOperands.leftIndex]?.id : undefined,
    rightTokenId: targetOperands?.rightIndex ? tokens[targetOperands.rightIndex]?.id : undefined,
    violationType: 'PARENTHESIS_FIRST',
    ruleTitle: 'Order of Operations Rule',
    message: 'Structural Fault: This operation cannot be demolished yet according to PEMDAS rules.',
  };
}

/**
 * Performs arithmetic for an operation.
 */
export function computeResult(a, op, b) {
  switch (op) {
    case '+':
      return Math.round((a + b) * 1000) / 1000;
    case '-':
      return Math.round((a - b) * 1000) / 1000;
    case '×':
    case '*':
      return Math.round((a * b) * 1000) / 1000;
    case '÷':
    case '/':
      return b !== 0 ? Math.round((a / b) * 1000) / 1000 : 0;
    case '^':
      return Math.round(Math.pow(a, b) * 1000) / 1000;
    default:
      return a;
  }
}

/**
 * Executes a verified legal demolition move, returning updated tokens and step log.
 */
export function executeDemolitionStep(tokens, legalOperatorId) {
  const opIndex = tokens.findIndex((t) => t.id === legalOperatorId);
  if (opIndex === -1) {
    throw new Error('Operator not found for demolition.');
  }

  const opToken = tokens[opIndex];
  const operands = findOperandsForOperator(tokens, opIndex);
  if (!operands) {
    throw new Error('Operands not found for operator.');
  }

  const leftToken = tokens[operands.leftIndex];
  const rightToken = tokens[operands.rightIndex];
  const result = computeResult(
    leftToken.numericValue ?? 0,
    opToken.value,
    rightToken.numericValue ?? 0
  );

  const expressionBefore = tokensToText(tokens);
  const subExpression = `${leftToken.value} ${opToken.value} ${rightToken.value}`;

  // Form the new single collapsed number crate
  const newToken = {
    id: generateTokenId(),
    type: 'number',
    value: String(result),
    numericValue: result,
    depth: opToken.depth,
    containerId: opToken.containerId,
    tier: opToken.tier,
  };

  // Replace from leftIndex to rightIndex with newToken
  const updatedTokens = [
    ...tokens.slice(0, operands.leftIndex),
    newToken,
    ...tokens.slice(operands.rightIndex + 1),
  ];

  // Check if this reduction freed a container (parentheses or brackets that now wrap only a single number)
  const { cleanedTokens, didDissolveCage } = dissolveRedundantCages(updatedTokens);

  let ruleExplanation = '';
  if (opToken.type === 'fraction_bar') {
    ruleExplanation = 'Fraction Girder Division: Completed final division between numerator and denominator.';
  } else if (opToken.value === '^') {
    ruleExplanation = 'Power Evaluated: Exponent calculated with top precedence.';
  } else if (opToken.value === '×' || opToken.value === '÷') {
    ruleExplanation = 'Multiplication/Division: High priority operation evaluated.';
  } else {
    ruleExplanation = 'Addition/Subtraction: Final rank operation evaluated.';
  }

  const step = {
    stepNumber: 0,
    expressionBefore,
    operatorSymbol: opToken.value,
    leftOperand: leftToken.numericValue ?? 0,
    rightOperand: rightToken.numericValue ?? 0,
    result,
    subExpression,
    ruleExplanation,
  };

  return {
    newTokens: cleanedTokens,
    step,
    didDissolveCage,
  };
}

/**
 * Checks for and dissolves any parentheses/brackets that wrap only a single number.
 */
function dissolveRedundantCages(tokens) {
  let changed = false;
  let didDissolve = false;
  let current = [...tokens];

  do {
    changed = false;
    for (let i = 0; i < current.length - 2; i++) {
      const open = current[i];
      const middle = current[i + 1];
      const close = current[i + 2];

      const isParenPair =
        open.type === 'open_paren' &&
        middle.type === 'number' &&
        close.type === 'close_paren';

      const isBracketPair =
        open.type === 'open_bracket' &&
        middle.type === 'number' &&
        close.type === 'close_bracket';

      if (isParenPair || isBracketPair) {
        // Enclosed number drops one level of depth
        const updatedMiddle = {
          ...middle,
          depth: Math.max(0, open.depth - 1),
          containerId: undefined,
        };

        current.splice(i, 3, updatedMiddle);
        changed = true;
        didDissolve = true;
        break; // re-loop to check for outer enclosures
      }
    }
  } while (changed);

  return {
    cleanedTokens: current,
    didDissolveCage: didDissolve,
  };
}

function cleanRedundantTiers(tokens) {
  return tokens;
}
