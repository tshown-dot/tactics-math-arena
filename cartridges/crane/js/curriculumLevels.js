/**
 * Demolition Crane - 5 Progressive Zones (Grade 6 enVisionmath 2.0 Topic 3-3)
 * Aligned with standards for the Order of Operations (PEMDAS / GEMS).
 * Each level includes rich parallel variants for the Anti-Spam Remediation Queue.
 */

export const CURRICULUM_ZONES = [
  {
    id: 1,
    title: 'Zone 1: The Foundations',
    subtitle: 'Standard Hierarchy & Left-to-Right Ties',
    badge: 'Foundations',
    description:
      'Master the basic hierarchy between multiplication/division and addition/subtraction. Enforce the strict left-to-right rule when operations share equal rank!',
    levels: [
      {
        id: 'z1_l1',
        zoneId: 1,
        levelNumber: 1,
        rawExpression: '15 + 4 × 3',
        pedagogicalFocus: 'Multiplication ranks higher than Addition',
        hint: 'Multiply 4 × 3 before adding 15!',
        variants: [
          '20 + 3 × 5',
          '12 + 6 × 2',
          '8 + 7 × 4',
          '16 + 5 × 3'
        ]
      },
      {
        id: 'z1_l2',
        zoneId: 1,
        levelNumber: 2,
        rawExpression: '28 - 12 ÷ 4 + 6',
        pedagogicalFocus: 'Division ranks higher than Subtraction and Addition',
        hint: 'Perform 12 ÷ 4 first, then work left-to-right with subtraction and addition!',
        variants: [
          '30 - 15 ÷ 3 + 4',
          '25 - 18 ÷ 6 + 7',
          '40 - 24 ÷ 4 + 5',
          '35 - 20 ÷ 5 + 8'
        ]
      },
      {
        id: 'z1_l3',
        zoneId: 1,
        levelNumber: 3,
        rawExpression: '40 ÷ 5 × 2',
        pedagogicalFocus: 'Equal Rank: Multiplication & Division solve Left-to-Right',
        hint: 'Both ÷ and × have equal priority! You must solve 40 ÷ 5 first from the left.',
        variants: [
          '36 ÷ 6 × 3',
          '48 ÷ 8 × 2',
          '50 ÷ 5 × 4',
          '32 ÷ 4 × 3'
        ]
      },
      {
        id: 'z1_l4',
        zoneId: 1,
        levelNumber: 4,
        rawExpression: '50 - 20 - 10 + 5',
        pedagogicalFocus: 'Equal Rank: Addition & Subtraction solve Left-to-Right',
        hint: 'Subtract 50 - 20 first, then subtract 10, then add 5 strictly from left to right.',
        variants: [
          '60 - 30 - 15 + 8',
          '45 - 15 - 10 + 6',
          '70 - 25 - 20 + 10',
          '55 - 20 - 15 + 4'
        ]
      },
    ],
  },
  {
    id: 2,
    title: 'Zone 2: High Voltage',
    subtitle: 'Exponents & Powers',
    badge: 'Powers',
    description:
      'Exponents (powers) introduce maximum operational voltage. Calculate powers before any products, quotients, sums, or differences!',
    levels: [
      {
        id: 'z2_l1',
        zoneId: 2,
        levelNumber: 1,
        rawExpression: '3^2 + 4 × 5',
        pedagogicalFocus: 'Exponents rank above Multiplication and Addition',
        hint: 'Target the power 3^2 first, then calculate 4 × 5, then add!',
        variants: [
          '2^3 + 5 × 2',
          '4^2 + 3 × 4',
          '5^2 + 2 × 6',
          '3^3 + 6 × 2'
        ]
      },
      {
        id: 'z2_l2',
        zoneId: 2,
        levelNumber: 2,
        rawExpression: '60 - 2^3 × 5',
        pedagogicalFocus: 'Powers before Products, Products before Differences',
        hint: 'Calculate 2^3 = 8 first, then multiply by 5, then subtract from 60.',
        variants: [
          '50 - 3^2 × 4',
          '70 - 2^4 × 3',
          '80 - 4^2 × 3',
          '90 - 5^2 × 2'
        ]
      },
      {
        id: 'z2_l3',
        zoneId: 2,
        levelNumber: 3,
        rawExpression: '2^4 ÷ 4 + 3^2',
        pedagogicalFocus: 'Multiple Exponents solved Left-to-Right before Division',
        hint: 'Calculate 2^4 on the left first, then 3^2, then divide and add.',
        variants: [
          '3^3 ÷ 9 + 2^3',
          '2^5 ÷ 8 + 4^2',
          '4^2 ÷ 2 + 5^2',
          '6^2 ÷ 4 + 2^4'
        ]
      },
      {
        id: 'z2_l4',
        zoneId: 2,
        levelNumber: 4,
        rawExpression: '5^2 - 4^2 + 2',
        pedagogicalFocus: 'Exponents priority then Subtraction/Addition Left-to-Right',
        hint: 'Target the powers 5^2 and 4^2 first before solving left-to-right.',
        variants: [
          '6^2 - 5^2 + 4',
          '4^2 - 3^2 + 5',
          '7^2 - 6^2 + 3',
          '8^2 - 7^2 + 6'
        ]
      },
    ],
  },
  {
    id: 3,
    title: 'Zone 3: Scaffolding',
    subtitle: 'Parentheses Containment Cages',
    badge: 'Parentheses',
    description:
      'Parentheses act as physical safety cages. Operations enclosed inside parentheses must be demolished and cleared before outer beams can be touched!',
    levels: [
      {
        id: 'z3_l1',
        zoneId: 3,
        levelNumber: 1,
        rawExpression: '4 × (12 - 5) + 6',
        pedagogicalFocus: 'Parentheses override outer Multiplication',
        hint: 'The subtraction (12 - 5) is locked inside a cage! Smash it first.',
        variants: [
          '3 × (15 - 8) + 9',
          '5 × (14 - 6) + 4',
          '2 × (18 - 9) + 7',
          '6 × (11 - 7) + 5'
        ]
      },
      {
        id: 'z3_l2',
        zoneId: 3,
        levelNumber: 2,
        rawExpression: '(8 + 4) ÷ 3 × 5',
        pedagogicalFocus: 'Clear Grouping cage before Left-to-Right ÷ and ×',
        hint: 'Clear (8 + 4) first, then work left-to-right with ÷ 3 and × 5.',
        variants: [
          '(15 + 5) ÷ 4 × 3',
          '(12 + 6) ÷ 2 × 4',
          '(18 + 6) ÷ 6 × 5',
          '(20 + 8) ÷ 4 × 2'
        ]
      },
      {
        id: 'z3_l3',
        zoneId: 3,
        levelNumber: 3,
        rawExpression: '3 × (2^3 + 4)',
        pedagogicalFocus: 'Exponents inside Parentheses before outer terms',
        hint: 'Look inside the cage: evaluate 2^3 first, add 4 to break the cage, then multiply by 3.',
        variants: [
          '4 × (3^2 - 2)',
          '2 × (4^2 + 5)',
          '5 × (2^4 - 6)',
          '3 × (3^3 - 15)'
        ]
      },
      {
        id: 'z3_l4',
        zoneId: 3,
        levelNumber: 4,
        rawExpression: '(15 - 9)^2 ÷ 4',
        pedagogicalFocus: 'Parentheses value evaluated before applying Exponent',
        hint: 'Evaluate 15 - 9 inside the cage first to get 6, then square it (6^2)!',
        variants: [
          '(20 - 12)^2 ÷ 8',
          '(14 - 8)^2 ÷ 6',
          '(13 - 9)^2 ÷ 2',
          '(16 - 10)^2 ÷ 9'
        ]
      },
    ],
  },
  {
    id: 4,
    title: 'Zone 4: Deep Chambers',
    subtitle: 'Nested Brackets & Security Enclosures',
    badge: 'Nested [ ]',
    description:
      'Heavy outer steel brackets [ ] enclose inner parentheses ( ). Demolish from the deepest innermost chamber outward!',
    levels: [
      {
        id: 'z4_l1',
        zoneId: 4,
        levelNumber: 1,
        rawExpression: '2 × [18 - (4 + 2)^2 ÷ 6]',
        pedagogicalFocus: 'Innermost ( ) before outer [ ] bracket operations',
        hint: 'Smash the innermost core (4 + 2) first, then square it, divide by 6, subtract from 18, and finally multiply by 2.',
        variants: [
          '3 × [20 - (5 + 1)^2 ÷ 4]',
          '2 × [25 - (3 + 3)^2 ÷ 6]',
          '4 × [16 - (2 + 2)^2 ÷ 2]'
        ]
      },
      {
        id: 'z4_l2',
        zoneId: 4,
        levelNumber: 2,
        rawExpression: '50 - [3 × (2 + 4) + 8]',
        pedagogicalFocus: 'Innermost addition clears cage before bracket multiplication',
        hint: 'Add (2 + 4) inside first, then multiply by 3, add 8, and subtract from 50.',
        variants: [
          '60 - [4 × (3 + 2) + 12]',
          '45 - [2 × (5 + 3) + 9]',
          '70 - [5 × (1 + 3) + 15]'
        ]
      },
      {
        id: 'z4_l3',
        zoneId: 4,
        levelNumber: 3,
        rawExpression: '4 × [25 - (3^2 + 1)]',
        pedagogicalFocus: 'Power inside inner parentheses before outer bracket',
        hint: 'Calculate 3^2 inside the inner cage first, add 1, then subtract from 25.',
        variants: [
          '5 × [30 - (4^2 + 4)]',
          '3 × [40 - (5^2 + 5)]',
          '2 × [50 - (6^2 + 4)]'
        ]
      },
      {
        id: 'z4_l4',
        zoneId: 4,
        levelNumber: 4,
        rawExpression: '[10 + (6 - 2)^2] ÷ 2',
        pedagogicalFocus: 'Innermost subtraction, then power, then bracket addition',
        hint: 'Solve (6 - 2) first, then square the result, add to 10, then divide by 2.',
        variants: [
          '[15 + (8 - 3)^2] ÷ 5',
          '[20 + (7 - 3)^2] ÷ 4',
          '[30 + (9 - 5)^2] ÷ 2'
        ]
      },
    ],
  },
  {
    id: 5,
    title: 'Zone 5: The High Rise',
    subtitle: 'Fraction Girders & Dividing Pistons',
    badge: 'Fractions',
    description:
      'Fraction bars act as a dividing piston separating the upper girder (numerator) from the lower girder (denominator). Demolish both tiers completely before striking the central division piston!',
    levels: [
      {
        id: 'z5_l1',
        zoneId: 5,
        levelNumber: 1,
        rawExpression: '(3^2 + 7) / (5 - 1)',
        pedagogicalFocus: 'Numerator & Denominator fully solved before central division',
        hint: 'Evaluate 3^2 + 7 = 16 on top, and 5 - 1 = 4 on the bottom, then smash the dividing piston 16 ÷ 4.',
        variants: [
          '(4^2 + 8) / (7 - 1)',
          '(2^3 + 12) / (6 - 2)',
          '(5^2 + 5) / (8 - 2)'
        ]
      },
      {
        id: 'z5_l2',
        zoneId: 5,
        levelNumber: 2,
        rawExpression: '(4 × 6 - 8) / (2^2)',
        pedagogicalFocus: 'Multi-operation numerator before dividing by power denominator',
        hint: 'Evaluate 4 × 6 = 24, then 24 - 8 = 16. On the bottom, 2^2 = 4. Finally 16 ÷ 4 = 4.',
        variants: [
          '(5 × 4 - 2) / (3^2)',
          '(6 × 3 + 6) / (2^3)',
          '(7 × 4 - 8) / (5 - 1)'
        ]
      },
      {
        id: 'z5_l3',
        zoneId: 5,
        levelNumber: 3,
        rawExpression: '[2 × (10 - 2)] / (3^2 - 5)',
        pedagogicalFocus: 'Nested operations on both sides of the dividing piston',
        hint: 'Clear the innermost (10 - 2) on the top girder and the power 3^2 on the bottom girder first.',
        variants: [
          '[3 × (12 - 4)] / (4^2 - 10)',
          '[4 × (8 - 3)] / (2^3 - 3)',
          '[2 × (14 - 5)] / (3^2 - 3)'
        ]
      },
      {
        id: 'z5_l4',
        zoneId: 5,
        levelNumber: 4,
        rawExpression: '(5^2 - 5) / (2 × 5)',
        pedagogicalFocus: 'Exponents on top and product on bottom before final fraction division',
        hint: 'Top: 25 - 5 = 20. Bottom: 2 × 5 = 10. Central piston: 20 ÷ 10 = 2.',
        variants: [
          '(6^2 - 6) / (3 × 5)',
          '(4^2 - 6) / (2 × 5)',
          '(3^3 - 3) / (4 × 2)'
        ]
      },
    ],
  },
];
