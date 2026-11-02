/**
 * Power Grid: LCM Circuit Breaker - Curriculum & Sector Configuration
 * Aligned with enVisionmath 2.0 Topic 3 (Least Common Multiple)
 * Zero frameworks, vanilla ES Module
 */

export const CURRICULUM_SECTORS = [
  {
    id: 1,
    codename: 'SECTOR-01',
    name: 'Direct Multiples Relay',
    subtitle: 'One frequency divides evenly into the other',
    ruleHint: 'Key Concept: When number A divides into number B, the larger number IS the Least Common Multiple!',
    generatorsCount: 2,
    targetWins: 3,
    timeLimit: 55, // seconds countdown
    stabilityDamagePerError: 25,
    samplePairs: [
      [3, 6],
      [4, 8],
      [3, 9],
      [2, 6],
      [4, 12],
      [5, 10],
      [2, 8],
      [6, 12],
    ],
  },
  {
    id: 2,
    codename: 'SECTOR-02',
    name: 'Composite Resonance Junction',
    subtitle: 'Frequencies share common factors',
    ruleHint: 'Key Concept: LCM is LESS than their product! Find the first overlapping frequency in both pulse tracks.',
    generatorsCount: 2,
    targetWins: 3,
    timeLimit: 50,
    stabilityDamagePerError: 30,
    samplePairs: [
      [4, 6],
      [6, 8],
      [6, 9],
      [8, 10],
      [8, 12],
      [9, 12],
      [10, 15],
      [6, 10],
    ],
  },
  {
    id: 3,
    codename: 'SECTOR-03',
    name: 'Co-Prime Surge Chamber',
    subtitle: 'Numbers share no common factor other than 1',
    ruleHint: 'Key Concept: When numbers are co-prime (consecutive numbers or prime pairs), multiply them directly (A × B) to get the LCM!',
    generatorsCount: 2,
    targetWins: 3,
    timeLimit: 45,
    stabilityDamagePerError: 35,
    samplePairs: [
      [3, 5],
      [4, 5],
      [5, 7],
      [6, 7],
      [7, 8],
      [3, 8],
      [4, 7],
      [5, 9],
    ],
  },
  {
    id: 4,
    codename: 'SECTOR-04',
    name: 'Tri-Phase Overload Matrix',
    subtitle: '3 simultaneous pulse generators in collision course',
    ruleHint: 'Key Concept: Triple overlap! The breaker must stop the pulse at the very first number shared by ALL THREE waves.',
    generatorsCount: 3,
    targetWins: 3,
    timeLimit: 45,
    stabilityDamagePerError: 40,
    samplePairs: [
      [2, 3, 4],
      [2, 3, 5],
      [3, 4, 6],
      [2, 4, 5],
      [2, 4, 6],
      [3, 5, 6],
      [2, 5, 10],
      [4, 6, 8],
    ],
  },
  {
    id: 5,
    codename: 'SECTOR-05',
    name: 'Megawatt Megacore [BOSS BATTLE]',
    subtitle: 'Higher-Order Periodic Synchronization Dilemmas',
    ruleHint: 'Boss Protocol: Solve real-world synchronization dilemmas and contain the unstable 4-generator reactor surge!',
    generatorsCount: 3,
    targetWins: 3,
    timeLimit: 60,
    stabilityDamagePerError: 50,
    isBossSector: true,
    samplePairs: [
      [4, 6, 9],
      [3, 6, 8],
      [4, 8, 12],
    ],
    bossDilemmas: [
      {
        id: 'boss-dilemma-1',
        title: 'Emergency Alarm Synchronization',
        scenario: 'Warning Siren Alpha blasts every 12 seconds. Flash Beacon Beta pulses every 18 seconds. Coolant Vent Gamma cycles every 24 seconds. At what exact second will all three activate at the exact same moment?',
        numbers: [12, 18, 24],
        correctAnswer: 72,
        options: [36, 48, 72, 144],
        explanation: 'Multiples of 24: 24, 48, 72... Multiples of 18: 18, 36, 54, 72... Multiples of 12: 12, 24, 36, 48, 60, 72. LCM(12, 18, 24) = 72 seconds!'
      },
      {
        id: 'boss-dilemma-2',
        title: 'Interlocking Turbine Alignment',
        scenario: 'Turbine Rotor A has 15 teeth per revolution, while Generator Gear B has 20 teeth per revolution. How many teeth must rotate through the sensor gate before both gears simultaneously complete whole cycles and align?',
        numbers: [15, 20],
        correctAnswer: 60,
        options: [30, 45, 60, 300],
        explanation: 'Count by 20: 20, 40, 60. Count by 15: 15, 30, 45, 60. Both gears synchronize at 60 teeth (Gear A completes 4 cycles, Gear B completes 3 cycles)!'
      }
    ]
  }
];

export function getSectorById(id) {
  return CURRICULUM_SECTORS.find((s) => s.id === id) || CURRICULUM_SECTORS[0];
}

/**
 * Returns a generator pair/trio from the sector pool
 */
export function generateScenarioForSector(sectorId, lastUsed = null) {
  const sector = getSectorById(sectorId);
  const candidates = sector.samplePairs.filter((pair) => {
    if (!lastUsed) return true;
    return JSON.stringify(pair) !== JSON.stringify(lastUsed);
  });
  const pool = candidates.length > 0 ? candidates : sector.samplePairs;
  const picked = pool[Math.floor(Math.random() * pool.length)];
  return [...picked];
}
