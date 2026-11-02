/**
 * Demolition Crane - Zone Capstone Boss Engine: "The Overcharged Reactor"
 * Higher-Order Thinking & Dilemma Scaffolding (enVision 2.0 Topic 3-3 Extension)
 * Challenges students with reverse-operations, bracket placement dilemmas,
 * and multi-stage reactor core stabilization under station pressure.
 */

export const BOSS_REACTOR_CHALLENGES = [
  {
    zoneId: 1,
    title: 'Reactor 1: Pressure Imbalance (Zone 1 Capstone)',
    subtitle: 'Placement Dilemma: Target Output 32',
    rawExpression: '4 × 6 + 2',
    targetValue: 32,
    prompt: 'The cooling reactor is overheating! Place safety grouping cages ( ) so the expression evaluates to exactly 32 instead of 26.',
    options: [
      { id: 'opt_a', expression: '(4 × 6) + 2', value: 26, isCorrect: false, feedback: 'Fault! (4 × 6) + 2 = 24 + 2 = 26. Reactor pressure too low!' },
      { id: 'opt_b', expression: '4 × (6 + 2)', value: 32, isCorrect: true, feedback: 'Target Hit! 4 × (6 + 2) = 4 × 8 = 32. Core stabilized!' },
      { id: 'opt_c', expression: '(4) × 6 + 2', value: 26, isCorrect: false, feedback: 'Fault! Redundant parenthesis. Value remains 26.' }
    ],
    misconception: 'Multiplication naturally comes before addition. To make addition happen first, it must be caged in parentheses!'
  },
  {
    zoneId: 2,
    title: 'Reactor 2: High-Voltage Surge (Zone 2 Capstone)',
    subtitle: 'Power Dilemma: Target Output 100',
    rawExpression: '2 × 5^2',
    targetValue: 100,
    prompt: 'A power surge requires output of 100 megawatts! Where must grouping cages be dropped so the result equals 100 instead of 50?',
    options: [
      { id: 'opt_a', expression: '2 × (5^2)', value: 50, isCorrect: false, feedback: 'Fault! 2 × 25 = 50. The exponent already applied to 5.' },
      { id: 'opt_b', expression: '(2 × 5)^2', value: 100, isCorrect: true, feedback: 'Target Hit! (2 × 5)^2 = 10^2 = 100. Power stabilized!' },
      { id: 'opt_c', expression: '2 × 5^(2)', value: 50, isCorrect: false, feedback: 'Fault! Does not change the order of operations. 2 × 25 = 50.' }
    ],
    misconception: 'Without parentheses, exponents apply ONLY to their immediate base (5^2 = 25). To square the product, group (2 × 5) first!'
  },
  {
    zoneId: 3,
    title: 'Reactor 3: Containment Breach (Zone 3 Capstone)',
    subtitle: 'Double Dilemma: Target Output 60',
    rawExpression: '15 - 5 × 4 + 2',
    targetValue: 60,
    prompt: 'Reactor valves are misaligned. Lock the valves with parentheses to produce an output of 60!',
    options: [
      { id: 'opt_a', expression: '(15 - 5) × (4 + 2)', value: 60, isCorrect: true, feedback: 'Target Hit! 10 × 6 = 60. Coolant valves locked!' },
      { id: 'opt_b', expression: '15 - (5 × 4) + 2', value: -3, isCorrect: false, feedback: 'Fault! 15 - 20 + 2 = -3. Dangerous negative pressure!' },
      { id: 'opt_c', expression: '(15 - 5 × 4) + 2', value: -3, isCorrect: false, feedback: 'Fault! Inside cage: 15 - 20 = -5, + 2 = -3.' }
    ],
    misconception: 'Both differences and sums can be elevated above multiplication if both are grouped inside separate cages!'
  },
  {
    zoneId: 4,
    title: 'Reactor 4: Nested Core Meltdown (Zone 4 Capstone)',
    subtitle: 'Deep Chamber Dilemma: Target Output 48',
    rawExpression: '2 × [30 - 3 × 2^2]',
    targetValue: 36,
    prompt: 'Evaluate the deep nested core sequence to stabilize the core chamber!',
    options: [
      { id: 'opt_a', expression: '2 × [30 - 3 × 4] = 2 × 18 = 36', value: 36, isCorrect: true, feedback: 'Core Locked! Power 2^2 = 4, product 3 × 4 = 12, difference 30 - 12 = 18, and 2 × 18 = 36!' },
      { id: 'opt_b', expression: '2 × [27 × 4] = 216', value: 216, isCorrect: false, feedback: 'Fault! Subtracted 30 - 3 before multiplying by 4. Multiplication takes precedence!' },
      { id: 'opt_c', expression: '2 × [30 - 6^2] = 2 × -6 = -12', value: -12, isCorrect: false, feedback: 'Fault! Multiplied 3 × 2 before applying exponent. Powers rank above products!' }
    ],
    misconception: 'Within outer brackets [ ], standard PEMDAS applies: solve powers first, products second, differences last.'
  },
  {
    zoneId: 5,
    title: 'Reactor 5: The Orbital Megastructure (Final Capstone)',
    subtitle: 'Fraction Dividing Piston Core: Target Output 5',
    rawExpression: '(4^2 + 3 × 8) / (2^3)',
    targetValue: 5,
    prompt: 'Balance the upper girder and lower girder against the dividing piston to lock the final core!',
    options: [
      { id: 'opt_a', expression: '(16 + 24) / 8 = 40 / 8 = 5', value: 5, isCorrect: true, feedback: 'Orbital Core Mastered! 16 + 24 = 40 on top, 8 on bottom. Final piston 40 ÷ 8 = 5!' },
      { id: 'opt_b', expression: '(16 + 24) / 6 = 40 / 6 = 6.67', value: 6.67, isCorrect: false, feedback: 'Fault! 2^3 is 8, not 6 (2 × 2 × 2 = 8, not 2 × 3)!' },
      { id: 'opt_c', expression: '(19 × 8) / 8 = 19', value: 19, isCorrect: false, feedback: 'Fault! Added 16 + 3 before multiplying by 8!' }
    ],
    misconception: 'Evaluate powers first (4^2 = 16, 2^3 = 8), then product (3 × 8 = 24), then sum (16 + 24 = 40), then final division (40 ÷ 8 = 5).'
  }
];

export function getBossChallengeForZone(zoneId) {
  return BOSS_REACTOR_CHALLENGES.find((b) => b.zoneId === zoneId) || BOSS_REACTOR_CHALLENGES[0];
}
