/**
 * enVision 2.0 Math Companion - Curriculum Registry
 * 
 * Lesson-Agnostic Registry for Topic & Lesson content.
 * Follows the Universal 3-Tier Cognitive Ladder schema:
 * - Tier 1: Preskill Ramp (Fluency & Bedrock - DOK 1)
 * - Tier 2: Base Lesson Skills (Direct Application - DOK 1-2)
 * - Tier 3: Deep DOK Climax (Multi-Step & Non-Routine - DOK 3)
 */

export const CURRICULUM_REGISTRY = {
  "G07_U03_L01": {
    id: "G07_U03_L01",
    unit: "Unit 3",
    topic: "Topic 3",
    lesson: "3-1",
    title: "Grade 7: Analyze Percents of Numbers (3-1)",
    subtitle: "Topic 3: Analyze and Solve Percent Problems",
    problems: [
      // ----------------------------------------------------------------------
      // TIER 1: Preskill Ramp (Fluency & Bedrock - DOK 1)
      // ----------------------------------------------------------------------
      {
        id: "G07_U03_L01_T1_01",
        tier: 1,
        dok: 1,
        tierLabel: "Tier 1: Preskill",
        prompt: "Write 7% as a decimal.",
        imageUrl: null,
        options: ["0.07", "0.7", "7.0", "0.007"],
        expectedAnswer: 0.07,
        misconception: "Percent means per hundred. Shift the decimal two places left: 7% = 0.07, not 0.7 (which is 70%)."
      },
      {
        id: "G07_U03_L01_T1_02",
        tier: 1,
        dok: 1,
        tierLabel: "Tier 1: Preskill",
        prompt: "Find 10% of 60.",
        imageUrl: null,
        options: ["6", "0.6", "60", "16"],
        expectedAnswer: 6,
        misconception: "To find 10% of a number, divide it by 10 (or move the decimal 1 place left): 60 ÷ 10 = 6."
      },
      {
        id: "G07_U03_L01_T1_03",
        tier: 1,
        dok: 1,
        tierLabel: "Tier 1: Preskill",
        prompt: "Write 1/4 as a percentage.",
        imageUrl: null,
        options: ["25%", "2.5%", "40%", "14%"],
        expectedAnswer: "25%",
        misconception: "Benchmark fractions: 1/4 equals 25/100, which is 25% (one quarter of 100%)."
      },

      // ----------------------------------------------------------------------
      // TIER 2: Base Lesson Skills (Direct Application - DOK 1-2)
      // ----------------------------------------------------------------------
      {
        id: "G07_U03_L01_T2_01",
        tier: 2,
        dok: 2,
        tierLabel: "Tier 2: Base Skills",
        prompt: "Find 35% of 80.",
        imageUrl: null,
        options: null,
        expectedAnswer: 28,
        misconception: "Part = Percent × Whole. First convert 35% to 0.35, then compute 0.35 × 80 = 28."
      },
      {
        id: "G07_U03_L01_T2_02",
        tier: 2,
        dok: 2,
        tierLabel: "Tier 2: Base Skills",
        prompt: "Find 125% of 64.",
        imageUrl: null,
        options: null,
        expectedAnswer: 80,
        misconception: "Percents greater than 100% yield results greater than the base. 125% = 1.25, so 1.25 × 64 = 80."
      },
      {
        id: "G07_U03_L01_T2_03",
        tier: 2,
        dok: 2,
        tierLabel: "Tier 2: Base Skills",
        prompt: "Find 0.5% of 200.",
        imageUrl: null,
        options: null,
        expectedAnswer: 1,
        misconception: "Common misconception: 0.5% is NOT 0.5. 0.5% = 0.005. Multiply 0.005 × 200 = 1 (not 100)."
      },

      // ----------------------------------------------------------------------
      // TIER 3: Deep DOK Climax (Multi-Step & Non-Routine - DOK 3)
      // ----------------------------------------------------------------------
      {
        id: "G07_U03_L01_T3_01",
        tier: 3,
        dok: 3,
        tierLabel: "Tier 3: Deep DOK",
        prompt: "Maya earns a weekly base salary of $400 plus a 5% commission on all sales. If her sales this week are $3,000, what are her total weekly earnings?",
        imageUrl: null,
        options: null,
        expectedAnswer: "$550",
        misconception: "Calculate the 5% commission first (0.05 × $3,000 = $150), and then add it to her $400 base salary: $400 + $150 = $550."
      },
      {
        id: "G07_U03_L01_T3_02",
        tier: 3,
        dok: 3,
        tierLabel: "Tier 3: Deep DOK",
        prompt: "A swimming pool holds 12,000 gallons of water. It is currently filled to 85% capacity. How many more gallons of water are needed to fill the pool to 100% capacity?",
        imageUrl: null,
        options: null,
        expectedAnswer: 1800,
        misconception: "Find the remaining unfilled percentage first (100% - 85% = 15%), then find 15% of 12,000: 0.15 × 12,000 = 1,800 gallons (or 12,000 - 10,200 = 1,800)."
      }
    ]
  }
};

/**
 * Resolves a lesson from the registry, defaulting to G07_U03_L01 if not found.
 * @param {string} lessonId
 * @returns {Object} Lesson object
 */
export function getLesson(lessonId) {
  if (lessonId && CURRICULUM_REGISTRY[lessonId]) {
    return CURRICULUM_REGISTRY[lessonId];
  }
  return CURRICULUM_REGISTRY["G07_U03_L01"];
}

/**
 * Returns a list of all registered lessons for dropdown/navigation.
 */
export function getAvailableLessons() {
  return Object.values(CURRICULUM_REGISTRY).map(l => ({
    id: l.id,
    title: l.title
  }));
}
