/**
 * Realm of Numeria - Realm Nodes Registry
 * 
 * Maps 7th Grade Topic 3 lessons to fantasy world regions.
 * Features linear progression gating with Lesson 3-6 reserved for Distributive Property.
 */

export const REALM_NODES = [
  {
    id: 'node_3_1',
    lessonId: 'G07_U03_L01',
    lessonCode: '3-1',
    title: 'Spire of Powers',
    regionName: 'The Celestial Peaks',
    subtitle: 'Exponents & Repeated Multiplication',
    description: 'Scale the high-voltage arcane spire. Channel surging lightning conduits by calculating exponential powers and avoiding circuit meltdowns.',
    standard: 'enVision 2.0 Lesson 3-1: Understand and Apply Exponents',
    cartridgeUrl: './cartridges/exponents/index.html',
    icon: '⚡',
    badgeName: 'Spire Spark',
    mapCoords: { x: 120, y: 520 }, // Position on 1366x768 tactical map
    requiredNodeId: null, // Always unlocked for new adventurers
    xpReward: 150,
    coinsReward: 50,
    isWip: false,
    bossName: 'Singularity Core',
  },
  {
    id: 'node_3_2',
    lessonId: 'G07_U03_L02',
    lessonCode: '3-2',
    title: 'Vault of Divisors',
    regionName: 'The Under-Keep',
    subtitle: 'Greatest Common Factor (GCF)',
    description: 'Infiltrate the dwarven bank vault. Turn the heavy tumblers and align factor pairs to breach ancient locking mechanisms before the alarm trips.',
    standard: 'enVision 2.0 Lesson 3-2: Find the Greatest Common Factor',
    cartridgeUrl: './cartridges/gcf/index.html',
    icon: '🗝️',
    badgeName: 'Master Locksmith',
    mapCoords: { x: 330, y: 320 },
    requiredNodeId: 'node_3_1',
    xpReward: 200,
    coinsReward: 60,
    isWip: false,
    bossName: 'The Vault Golem',
  },
  {
    id: 'node_3_3',
    lessonId: 'G07_U03_L03',
    lessonCode: '3-3',
    title: 'The Siege Works',
    regionName: 'Ironhold Bastion',
    subtitle: 'Order of Operations & Expressions',
    description: 'Man the titan demolition crane. Calculate priority operations (Parentheses, Exponents, Multiplication/Division, Addition/Subtraction) to swing the wrecking ball and crack fortresses.',
    standard: 'enVision 2.0 Lesson 3-3: Write and Evaluate Numerical Expressions',
    cartridgeUrl: './cartridges/crane/index.html',
    icon: '🏗️',
    badgeName: 'Siege Engineer',
    mapCoords: { x: 570, y: 490 },
    requiredNodeId: 'node_3_2',
    xpReward: 250,
    coinsReward: 75,
    isWip: false,
    bossName: 'Titan Demolisher',
  },
  {
    id: 'node_3_4',
    lessonId: 'G07_U03_L04',
    lessonCode: '3-4',
    title: 'Resonance Bastion',
    regionName: 'The Arcane Dynamo',
    subtitle: 'Least Common Multiple (LCM)',
    description: 'Restore harmonic equilibrium to the kingdom power grid. Synchronize overlapping power frequencies using least common multiples to prevent massive brownouts.',
    standard: 'enVision 2.0 Lesson 3-4: Find the Least Common Multiple',
    cartridgeUrl: './cartridges/lcm/index.html',
    icon: '🔮',
    badgeName: 'Grid Harmonizer',
    mapCoords: { x: 780, y: 280 },
    requiredNodeId: 'node_3_3',
    xpReward: 250,
    coinsReward: 75,
    isWip: false,
    bossName: 'Dynamo Overlord',
  },
  {
    id: 'node_3_6',
    lessonId: 'G07_U03_L06',
    lessonCode: '3-6',
    title: "The Alchemist's Forge",
    regionName: 'The Grand Foundry',
    subtitle: 'The Distributive Property',
    description: 'The Royal Alchemists are forging a new modular cartridge. Soon you will distribute terms across parenthesis barriers to brew ultimate tactical elixirs.',
    standard: 'enVision 2.0 Lesson 3-6: Generate Equivalent Expressions with the Distributive Property',
    cartridgeUrl: './cartridges/distributive/index.html',
    icon: '⚒️',
    badgeName: 'Alchemical Forgemaster',
    mapCoords: { x: 970, y: 460 },
    requiredNodeId: 'node_3_4',
    xpReward: 300,
    coinsReward: 85,
    isWip: true, // Under construction! Will bridge 3-4 to 3-7 automatically
    bossName: 'Chimera of Distribution',
  },
  {
    id: 'node_3_7',
    lessonId: 'G07_U03_L07',
    lessonCode: '3-7',
    title: 'Plains of Convergence',
    regionName: 'The Shifting Dunes',
    subtitle: 'Combining Like Terms',
    description: 'Unleash tactical ballistics against rogue mathematical swarms. Target and combine like algebraic terms under pressure to clear the battlefield.',
    standard: 'enVision 2.0 Lesson 3-7: Simplify Algebraic Expressions by Combining Like Terms',
    cartridgeUrl: './cartridges/shooter/index.html',
    icon: '🎯',
    badgeName: 'Marksman of Algebra',
    mapCoords: { x: 1140, y: 310 },
    // If 3-6 is WIP, requirement gracefully relaxes to 3-4 so game is unblocked!
    requiredNodeId: 'node_3_6',
    xpReward: 300,
    coinsReward: 90,
    isWip: false,
    bossName: 'Term Colossus',
  },
  {
    id: 'node_apex',
    lessonId: 'G07_U03_BOSS',
    lessonCode: 'Apex Climax',
    title: 'The Citadel of Percents',
    regionName: 'The Shadow Throne',
    subtitle: 'The Percentage Phantom Grand Climax',
    description: 'The ultimate confrontation! Confront the legendary Percentage Phantom across a 2-phase tactical battle combining all unit principles: discounts, markups, taxes, and multi-step reasoning.',
    standard: 'enVision 2.0 Topic 3 Climax: Multi-Tier Mastery',
    cartridgeUrl: './cartridges/crane/index.html', // Can point to apex cartridge or boss arena
    icon: '👑',
    badgeName: 'Hero of Numeria',
    mapCoords: { x: 1250, y: 530 },
    requiredNodeId: 'node_3_7',
    xpReward: 600,
    coinsReward: 250,
    isWip: false,
    bossName: 'Percentage Phantom Prime',
  }
];

/**
 * Returns effective prerequisite ID for a node, accounting for WIP nodes.
 */
export function getEffectivePrerequisite(nodeId) {
  const node = REALM_NODES.find(n => n.id === nodeId);
  if (!node || !node.requiredNodeId) return null;

  const prereq = REALM_NODES.find(n => n.id === node.requiredNodeId);
  if (prereq && prereq.isWip) {
    // Skip the WIP node and check the WIP node's prerequisite
    return prereq.requiredNodeId;
  }
  return node.requiredNodeId;
}

/**
 * Checks if a node is unlocked based on unlocked node set or master override.
 */
export function isNodeUnlocked(nodeId, unlockedNodeIds = [], isTeacherOverride = false) {
  if (isTeacherOverride) return true;
  const node = REALM_NODES.find(n => n.id === nodeId);
  if (!node) return false;
  if (!node.requiredNodeId) return true; // Node 1 is always unlocked

  return unlockedNodeIds.includes(nodeId);
}
