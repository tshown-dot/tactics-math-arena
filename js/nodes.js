/**
 * Super Mario World Style Overworld - Town & Building Registry
 * 
 * Maps 6th Grade Topic 3 lessons (Numeric and Algebraic Expressions) to buildings in "Expression Town".
 * Designed with multi-town/chapter extensibility for future topics.
 */

export const WORLD_CHAPTERS = [
  {
    id: 'topic_1',
    worldLabel: 'WORLD 1',
    title: 'Decimal Docks',
    subtitle: 'Use Positive Rational Numbers',
    isLockedChapter: true,
  },
  {
    id: 'topic_2',
    worldLabel: 'WORLD 2',
    title: 'Integer Highlands',
    subtitle: 'Integers and Rational Numbers',
    isLockedChapter: true,
  },
  {
    id: 'topic_3',
    worldLabel: 'WORLD 3',
    title: 'Expression Town',
    subtitle: 'Numeric & Algebraic Expressions',
    isLockedChapter: false,
    isActive: true,
  },
  {
    id: 'topic_4',
    worldLabel: 'WORLD 4',
    title: 'Equation Valley',
    subtitle: 'Represent and Solve Equations & Inequalities',
    isLockedChapter: true,
  },
];

export const REALM_NODES = [
  {
    id: 'node_3_1',
    lessonId: 'G06_U03_L01',
    lessonCode: '3-1',
    title: 'Power Plant',
    buildingType: 'power_plant',
    regionName: 'West Town Plaza',
    subtitle: 'Exponents & Repeated Multiplication',
    description: 'Step inside the Town Power Plant! Balance high-voltage surge waves by dialing bases and exponents before the generator overloads.',
    standard: 'enVision 2.0 Lesson 3-1: Understand and Apply Exponents',
    cartridgeUrl: './cartridges/exponents/index.html',
    icon: '⚡',
    roofColor: 'from-cyan-500 to-blue-700',
    wallColor: 'bg-slate-800 border-cyan-400',
    badgeName: 'Spark Badge',
    mapCoords: { x: 140, y: 450 },
    requiredNodeId: null, // Starting building - door is unlocked!
    xpReward: 150,
    coinsReward: 50,
    isWip: false,
    bossName: 'Singularity Core',
  },
  {
    id: 'node_3_2',
    lessonId: 'G06_U03_L02',
    lessonCode: '3-2',
    title: 'Town Bank Vault',
    buildingType: 'bank_vault',
    regionName: 'Gold Street',
    subtitle: 'Greatest Common Factor (GCF)',
    description: 'Rob the Town Bank! Crack dials, split the loot, tile the vault floor, and smash the Vault Golem, all with the Greatest Common Factor, before the heat catches up with you.',
    standard: 'enVision 2.0 Lesson 3-2: Find the Greatest Common Factor',
    cartridgeUrl: './cartridges/gcf/index.html',
    icon: '🏦',
    roofColor: 'from-amber-400 to-yellow-600',
    wallColor: 'bg-stone-800 border-amber-400',
    badgeName: 'Vault Key',
    mapCoords: { x: 300, y: 270 },
    requiredNodeId: 'node_3_1',
    xpReward: 200,
    coinsReward: 60,
    isWip: false,
    bossName: 'The Vault Golem',
  },
  {
    id: 'node_3_3',
    lessonId: 'G06_U03_L03',
    lessonCode: '3-3',
    title: 'Demolition Yard',
    buildingType: 'crane_yard',
    regionName: 'Ironworks Corner',
    subtitle: 'Order of Operations (PEMDAS)',
    description: 'Climb into the Demolition Crane cab! Swing the wrecking ball at mathematical operators in strict PEMDAS order to demolish girders.',
    standard: 'enVision 2.0 Lesson 3-3: Write and Evaluate Numerical Expressions',
    cartridgeUrl: './cartridges/crane/index.html',
    icon: '🏗️',
    roofColor: 'from-orange-500 to-amber-600',
    wallColor: 'bg-zinc-800 border-orange-400',
    badgeName: 'Hardhat Badge',
    mapCoords: { x: 465, y: 460 },
    requiredNodeId: 'node_3_2',
    xpReward: 250,
    coinsReward: 75,
    isWip: false,
    bossName: 'Titan Demolisher',
  },
  {
    id: 'node_3_4',
    lessonId: 'G06_U03_L04',
    lessonCode: '3-4',
    title: 'Substation Grid',
    buildingType: 'substation',
    regionName: 'River Crossing',
    subtitle: 'Least Common Multiple (LCM)',
    description: 'Head into the Electric Substation! Align overlapping frequency cycles using Least Common Multiples to stop town blackouts.',
    standard: 'enVision 2.0 Lesson 3-4: Find the Least Common Multiple',
    cartridgeUrl: './cartridges/lcm/index.html',
    icon: '🔋',
    roofColor: 'from-emerald-500 to-teal-700',
    wallColor: 'bg-slate-800 border-emerald-400',
    badgeName: 'Grid Star',
    mapCoords: { x: 675, y: 265 },
    requiredNodeId: 'node_3_3',
    xpReward: 250,
    coinsReward: 75,
    isWip: false,
    bossName: 'Dynamo Overlord',
  },
  {
    id: 'node_3_5',
    lessonId: 'G06_U03_L05',
    lessonCode: '3-5',
    title: 'Variable Vault',
    buildingType: 'security_vault',
    regionName: 'Archives Row',
    subtitle: 'Evaluate Algebraic Expressions',
    description: 'Infiltrate the high-security Variable Vault! Drag values to substitute for variables, apply order of operations, and crack security codes across 5 vaults.',
    standard: 'enVision 2.0 Lesson 3-5: Evaluate Algebraic Expressions',
    cartridgeUrl: './cartridges/evaluating/index.html',
    icon: '🔐',
    roofColor: 'from-cyan-600 to-indigo-800',
    wallColor: 'bg-slate-900 border-cyan-400',
    badgeName: 'Cipher Key',
    mapCoords: { x: 825, y: 460 },
    requiredNodeId: 'node_3_4',
    xpReward: 300,
    coinsReward: 85,
    isWip: false,
    bossName: 'Grand Master Vault',
  },
  {
    id: 'node_3_6',
    lessonId: 'G06_U03_L06',
    lessonCode: '3-6',
    title: 'The Town Forge',
    buildingType: 'forge_wip',
    regionName: 'Artisan Row',
    subtitle: 'The Distributive Property',
    description: 'UNDER CONSTRUCTION! The Town Carpenters are hammering together the Distributive Property workshop. You may walk right past to Building 3-7!',
    standard: 'enVision 2.0 Lesson 3-6: Generate Equivalent Expressions with the Distributive Property',
    cartridgeUrl: './cartridges/distributive/index.html',
    icon: '🚧',
    roofColor: 'from-yellow-500 to-amber-700',
    wallColor: 'bg-stone-800 border-yellow-500',
    badgeName: 'Forge Hammer',
    mapCoords: { x: 970, y: 265 },
    requiredNodeId: 'node_3_5',
    xpReward: 300,
    coinsReward: 85,
    isWip: true, // Under construction! Bridges 3-5 -> 3-7
    bossName: 'Chimera of Distribution',
  },
  {
    id: 'node_3_7',
    lessonId: 'G06_U03_L07',
    lessonCode: '3-7',
    title: 'Target Arcade',
    buildingType: 'arcade',
    regionName: 'East Boardwalk',
    subtitle: 'Combining Like Terms',
    description: 'Enter the Town Target Arcade! Aim your turret and pop matching algebraic terms to simplify expressions before the swarm reaches the door.',
    standard: 'enVision 2.0 Lesson 3-7: Simplify Algebraic Expressions by Combining Like Terms',
    cartridgeUrl: './cartridges/shooter/index.html',
    icon: '🎯',
    roofColor: 'from-fuchsia-500 to-purple-700',
    wallColor: 'bg-indigo-950 border-fuchsia-400',
    badgeName: 'Sharpshooter Star',
    mapCoords: { x: 1115, y: 460 },
    requiredNodeId: 'node_3_6',
    xpReward: 300,
    coinsReward: 90,
    isWip: false,
    bossName: 'Term Colossus',
  },
  {
    id: 'node_apex',
    lessonId: 'G06_U03_BOSS',
    lessonCode: 'Bowser Keep',
    title: 'Boss Castle',
    buildingType: 'castle',
    regionName: 'Citadel Peak',
    subtitle: 'Topic 3 Grand Master Climax',
    description: 'The final fortress of Expression Town! Enter the Boss Castle and prove your mastery over exponents, factors, PEMDAS, and algebraic terms!',
    standard: 'enVision 2.0 Topic 3 Climax: Numeric and Algebraic Expressions Mastery',
    cartridgeUrl: './cartridges/crane/index.html',
    icon: '🏰',
    roofColor: 'from-rose-600 to-red-900',
    wallColor: 'bg-stone-900 border-rose-500',
    badgeName: 'Town Champion Crown',
    mapCoords: { x: 1255, y: 280 },
    requiredNodeId: 'node_3_7',
    xpReward: 600,
    coinsReward: 250,
    isWip: false,
    bossName: 'Expression Colossus Prime',
  }
];

/**
 * Returns effective prerequisite ID for a node, accounting for WIP buildings.
 */
export function getEffectivePrerequisite(nodeId) {
  const node = REALM_NODES.find(n => n.id === nodeId);
  if (!node || !node.requiredNodeId) return null;

  const prereq = REALM_NODES.find(n => n.id === node.requiredNodeId);
  if (prereq && prereq.isWip) {
    return prereq.requiredNodeId;
  }
  return node.requiredNodeId;
}

/**
 * Checks if a building door is unlocked based on unlocked node set or teacher override.
 */
export function isNodeUnlocked(nodeId, unlockedNodeIds = [], isTeacherOverride = false) {
  if (isTeacherOverride) return true;
  const node = REALM_NODES.find(n => n.id === nodeId);
  if (!node) return false;
  if (!node.requiredNodeId) return true; // Building 3-1 is always open

  return unlockedNodeIds.includes(nodeId);
}
