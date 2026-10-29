// ==============================================================================
// STARTER MONSTERS & ENEMY BESTIARY
// ==============================================================================

export const STARTER_MONSTERS = {
  ignis: {
    id: 'ignis',
    name: 'Ignis',
    element: 'Fire',
    title: 'The Flame Wisp',
    color: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    accentBg: 'from-orange-600 to-red-700',
    description: 'A spirited fiery fox companion that channels mathematical focus into blazing heat.',
    baseHp: 100,
    baseAttack: 25,
    icon: '🔥',
    evolutions: [
      { level: 1, name: 'Ignis', title: 'Flame Wisp', emoji: '🦊🔥' },
      { level: 3, name: 'Pyrofell', title: 'Inferno Fox', emoji: '🐺✨' },
      { level: 5, name: 'Solarkin', title: 'Solar Behemoth', emoji: '🦁👑' }
    ],
    signatureMove: 'Pyro-Percent Blast'
  },
  hydra: {
    id: 'hydra',
    name: 'Hydra',
    element: 'Water',
    title: 'The Tide Serpent',
    color: '#06b6d4',
    glowColor: 'rgba(6, 182, 212, 0.5)',
    accentBg: 'from-cyan-600 to-blue-700',
    description: 'A serene aquatic dragon that turns rational calculations into crystalline frost.',
    baseHp: 110,
    baseAttack: 22,
    icon: '💧',
    evolutions: [
      { level: 1, name: 'Hydra', title: 'Tide Serpent', emoji: '🐉💧' },
      { level: 3, name: 'Tidewyrm', title: 'Frost Drake', emoji: '🐲❄️' },
      { level: 5, name: 'Leviathan', title: 'Ocean Sovereign', emoji: '👑🌊' }
    ],
    signatureMove: 'Crystalline Ratio Wave'
  },
  volt: {
    id: 'volt',
    name: 'Volt',
    element: 'Electric',
    title: 'The Spark Golem',
    color: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.5)',
    accentBg: 'from-yellow-500 to-amber-700',
    description: 'A high-energy lightning creature powered by rapid calculations and mental fluency.',
    baseHp: 95,
    baseAttack: 28,
    icon: '⚡',
    evolutions: [
      { level: 1, name: 'Volt', title: 'Spark Golem', emoji: '⚡🤖' },
      { level: 3, name: 'Voltaris', title: 'Thunder Titan', emoji: '🦾⚡' },
      { level: 5, name: 'Zeuskin', title: 'Lightning Sovereign', emoji: '🌩️👑' }
    ],
    signatureMove: 'Supercharged Equation Strike'
  }
};

export const BOSS_PROFILE = {
  id: 'percentage_phantom',
  name: 'Percentage Phantom',
  element: 'Spectral Void',
  title: 'Lord of the Decimal Rift',
  color: '#a855f7',
  glowColor: 'rgba(168, 85, 247, 0.7)',
  maxHp: 100,
  icon: '👻',
  phase1Sprite: '👻🔮',
  phase2Sprite: '👾⚡'
};

export const SHOP_ITEMS = [
  {
    id: 'armor_plate',
    name: 'Reinforced Rune Shield',
    category: 'battle',
    cost: 80,
    icon: '🛡️',
    description: 'Start every future battle with +1 extra permanent mistake shield.',
    upgradeKey: 'armor'
  },
  {
    id: 'coin_magnet',
    name: 'Alchemist Coin Magnet',
    category: 'booster',
    cost: 60,
    icon: '🧲',
    description: 'Earn +25% bonus Arena Coins for every problem solved correctly.',
    upgradeKey: 'magnet'
  },
  {
    id: 'formula_scroll',
    name: 'Archmage Formula Grimoire',
    category: 'lifeline',
    cost: 50,
    icon: '📜',
    description: 'Gives you 1 extra on-demand Key Concept formula lifeline during Boss fights.',
    upgradeKey: 'scrolls'
  }
];
