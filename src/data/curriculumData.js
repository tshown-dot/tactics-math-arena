// ==============================================================================
// 7TH GRADE TOPIC 3: ANALYZE AND SOLVE PERCENT PROBLEMS (enVision 2.0)
// ==============================================================================
// Modular curriculum pack for Tactics Math Arena
// Scalable to all topics and grades
// ==============================================================================

export const TOPIC_3_DATA = {
  topicId: 'G07_U03',
  topicTitle: 'Analyze and Solve Percent Problems',
  gradeLevel: 7,
  unitNumber: 3,
  description: 'Master the percent proportion, percent equation, markups, markdowns, percent change, and simple interest.',
  lessons: [
    {
      id: 'G07_U03_L01',
      number: 1,
      title: 'Analyze Percents of Numbers',
      essentialQuestion: 'How do percents show the relationship between quantities?',
      iCan: 'I can find the percent of a number and relate percents greater than 100% or less than 1%.',
      keyConceptSummary: 'A percent represents a ratio per 100. To find a percent of a number, convert the percent to a decimal (or fraction) and multiply by the whole amount.',
      vocabWords: [
        { term: 'Percent', definition: 'A ratio that compares a number to 100 (per hundred).' },
        { term: 'Benchmark Percent', definition: 'Common percents like 10%, 25%, 50% used for quick mental calculations.' }
      ],
      grindQueue: [
        {
          id: 'L01_Q1',
          type: 'minion',
          mobName: 'Spark Slime',
          mobHp: 1,
          prompt: 'Convert 45% into a decimal.',
          options: ['0.45', '4.5', '0.045', '45.0'],
          correctAnswer: '0.45',
          hint: 'Move the decimal point two places to the left.',
          misconceptionTrap: 'Do not just remove the percent sign without shifting the decimal.',
          explanation: '45% = 45/100 = 0.45'
        },
        {
          id: 'L01_Q2',
          type: 'minion',
          mobName: 'Forest Pixie',
          mobHp: 1,
          prompt: 'What is 10% of 90?',
          options: ['9', '0.9', '90', '19'],
          correctAnswer: '9',
          hint: 'Finding 10% means dividing by 10 or multiplying by 0.10.',
          misconceptionTrap: '10% of 90 is 9, not 0.9.',
          explanation: '0.10 × 90 = 9'
        },
        {
          id: 'L01_Q3',
          type: 'minion',
          mobName: 'Shadow Wisp',
          mobHp: 1,
          prompt: 'Convert 7% into a decimal.',
          options: ['0.07', '0.7', '7.0', '0.007'],
          correctAnswer: '0.07',
          hint: '7 has only one digit, so place a zero after the decimal point: 0.07.',
          misconceptionTrap: '0.7 is 70%, not 7%!',
          explanation: '7% = 7/100 = 0.07'
        },
        {
          id: 'L01_Q4',
          type: 'elite',
          mobName: 'Obsidian Golem',
          mobHp: 2,
          prompt: 'Calculate 25% of 64.',
          inputType: 'number',
          correctAnswer: '16',
          hint: '25% is the same as one fourth (1/4). Divide 64 by 4, or calculate 0.25 × 64.',
          misconceptionTrap: 'Make sure to divide by 4, not multiply by 25 directly.',
          explanation: '0.25 × 64 = 16 (or 64 ÷ 4 = 16)'
        },
        {
          id: 'L01_Q5',
          type: 'minion',
          mobName: 'Cave Bat',
          mobHp: 1,
          prompt: 'Convert 150% into a decimal.',
          options: ['1.5', '0.15', '15.0', '0.015'],
          correctAnswer: '1.5',
          hint: 'Since 150% is greater than 100%, the decimal will be greater than 1.',
          misconceptionTrap: 'Percents over 100% become decimals greater than 1.0.',
          explanation: '150% = 150/100 = 1.5'
        },
        {
          id: 'L01_Q6',
          type: 'elite',
          mobName: 'Iron Wyvern',
          mobHp: 2,
          prompt: 'What is 120% of 50?',
          inputType: 'number',
          correctAnswer: '60',
          hint: '100% of 50 is 50. 20% of 50 is 10. Add them together: 50 + 10.',
          misconceptionTrap: 'Since the percent is over 100%, your answer must be greater than 50.',
          explanation: '1.20 × 50 = 60'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Keeper of the Decimal Rift',
        phase1: {
          title: 'Phase 1: Spectral Barrier',
          scenario: 'A music studio is selling VIP concert passes. A pass originally costs $180. During a flash weekend event, the passes are sold at 125% of their original price due to high demand.',
          partA: {
            question: 'Part A: What is 125% written as a decimal?',
            inputType: 'number',
            correctAnswer: '1.25',
            hint: 'Divide 125 by 100.',
            damage: 25
          },
          partB: {
            question: 'Part B: What is the new selling price of the VIP pass?',
            inputType: 'number',
            correctAnswer: '225',
            hint: 'Multiply 1.25 × $180.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: Enraged Core',
          scenario: 'The Phantom unleashes a reality warp comparing two concert merchandise packages! Package A costs $60 with a 35% processing fee. Package B costs $75 with a 10% processing fee.',
          partA: {
            question: 'Part A: What is the total cost of Package A (cost + fee)?',
            inputType: 'number',
            correctAnswer: '81',
            hint: 'Fee = 0.35 × 60 = 21. Total = 60 + 21 = $81.',
            damage: 20
          },
          partB: {
            question: 'Part B: What is the total cost of Package B (cost + fee)?',
            inputType: 'number',
            correctAnswer: '82.50',
            acceptableAnswers: ['82.5', '82.50'],
            hint: 'Fee = 0.10 × 75 = 7.50. Total = 75 + 7.50 = $82.50.',
            damage: 20
          },
          partC: {
            question: 'Part C: Which package is cheaper, and by how many dollars? Enter the difference in dollars (e.g. 1.50).',
            inputType: 'number',
            correctAnswer: '1.50',
            acceptableAnswers: ['1.5', '1.50'],
            hint: 'Subtract: $82.50 - $81.00.',
            damage: 10
          }
        }
      }
    },
    {
      id: 'G07_U03_L02',
      number: 2,
      title: 'Connect Percent and Proportion',
      essentialQuestion: 'How can you use proportions to solve percent problems?',
      iCan: 'I can write and solve percent problems using proportions in the form: part/whole = percent/100.',
      keyConceptSummary: 'In any percent relationship: (part / whole) = (percent / 100). If you know any two values, cross-multiply and divide to find the unknown.',
      vocabWords: [
        { term: 'Proportion', definition: 'An equation stating that two ratios are equal.' },
        { term: 'Cross-Multiplication', definition: 'Multiplying diagonally across an equals sign: if a/b = c/d, then a · d = b · c.' }
      ],
      grindQueue: [
        {
          id: 'L02_Q1',
          type: 'minion',
          mobName: 'Mud Imp',
          mobHp: 1,
          prompt: 'In the proportion: Part/Whole = %/100, which value is ALWAYS in the bottom right denominator?',
          options: ['100', 'Part', 'Whole', 'Variable x'],
          correctAnswer: '100',
          hint: 'Percents are always defined out of 100.',
          misconceptionTrap: '100 is always the base denominator for percent.',
          explanation: 'By definition, percent means per hundred, so 100 is always the denominator.'
        },
        {
          id: 'L02_Q2',
          type: 'minion',
          mobName: 'Frost Wisp',
          mobHp: 1,
          prompt: 'In the problem "What percent of 40 is 10?", which number is the WHOLE?',
          options: ['40', '10', '100', 'Not given'],
          correctAnswer: '40',
          hint: 'The word "of" is usually followed by the whole.',
          misconceptionTrap: '10 is the part; the number following "of" is 40 (the whole).',
          explanation: '10 is the part ("is 10"), and 40 is the whole ("of 40").'
        },
        {
          id: 'L02_Q3',
          type: 'elite',
          mobName: 'Stone Golem',
          mobHp: 2,
          prompt: 'Solve the proportion: x / 50 = 30 / 100. What is x?',
          inputType: 'number',
          correctAnswer: '15',
          hint: 'Notice that 50 is half of 100. So x must be half of 30!',
          misconceptionTrap: '100 ÷ 2 = 50, so 30 ÷ 2 = 15.',
          explanation: 'x = (50 × 30) / 100 = 1500 / 100 = 15'
        },
        {
          id: 'L02_Q4',
          type: 'minion',
          mobName: 'Rumble Beetle',
          mobHp: 1,
          prompt: '12 out of 60 students ride the bus. What percent is that?',
          options: ['20%', '12%', '5%', '50%'],
          correctAnswer: '20%',
          hint: 'Simplify 12/60 = 1/5. What is 1/5 as a percent?',
          misconceptionTrap: '12/60 reduces to 1/5, which is 20%, not 5%.',
          explanation: '12 / 60 = 0.20 = 20%'
        },
        {
          id: 'L02_Q5',
          type: 'elite',
          mobName: 'Armored Minotaur',
          mobHp: 2,
          prompt: 'If 40% of a number is 28, what is the WHOLE number?',
          inputType: 'number',
          correctAnswer: '70',
          hint: 'Set up: 28 / Whole = 40 / 100. Cross-multiply: 28 × 100 = 2800, then divide by 40.',
          misconceptionTrap: 'Do not multiply 28 by 0.40! 28 is the PART, not the whole.',
          explanation: 'Whole = 2800 / 40 = 70'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Master of Proportions',
        phase1: {
          title: 'Phase 1: The Balanced Scales',
          scenario: 'At the Academy of Mages, 72 apprentices passed the Trial of Elements. This represents 60% of all apprentices who entered the trial.',
          partA: {
            question: 'Part A: Set up the proportion 72/W = 60/100. What is 72 × 100?',
            inputType: 'number',
            correctAnswer: '7200',
            hint: 'Multiply 72 by 100.',
            damage: 25
          },
          partB: {
            question: 'Part B: How many total apprentices entered the trial (what is W)?',
            inputType: 'number',
            correctAnswer: '120',
            hint: 'Divide 7,200 by 60.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: The Double Crucible',
          scenario: 'The Phantom challenges two guilds. In Guild Sun, 45 out of 75 warriors have magical armor. In Guild Moon, 56 out of 80 warriors have magical armor.',
          partA: {
            question: 'Part A: What percent of Guild Sun warriors have magical armor?',
            inputType: 'number',
            correctAnswer: '60',
            hint: '45 ÷ 75 = 0.60 = 60%.',
            damage: 20
          },
          partB: {
            question: 'Part B: What percent of Guild Moon warriors have magical armor?',
            inputType: 'number',
            correctAnswer: '70',
            hint: '56 ÷ 80 = 0.70 = 70%.',
            damage: 20
          },
          partC: {
            question: 'Part C: What is the difference between their percentages (in percentage points)?',
            inputType: 'number',
            correctAnswer: '10',
            hint: '70% - 60% = 10%.',
            damage: 10
          }
        }
      }
    },
    {
      id: 'G07_U03_L03',
      number: 3,
      title: 'Represent and Use the Percent Equation',
      essentialQuestion: 'How can you represent and solve percent problems using an equation?',
      iCan: 'I can use the percent equation (part = percent · whole) to solve real-world problems.',
      keyConceptSummary: 'The percent equation is: part = percent · whole, where the percent is written as a decimal. When finding the whole or percent, divide both sides by the known factor.',
      vocabWords: [
        { term: 'Percent Equation', definition: 'An equation in the form part = percent × whole.' },
        { term: 'Coefficient', definition: 'The numerical factor (the decimal percent) multiplying the variable.' }
      ],
      grindQueue: [
        {
          id: 'L03_Q1',
          type: 'minion',
          mobName: 'Ember Imp',
          mobHp: 1,
          prompt: 'Translate "is" into a mathematical symbol.',
          options: ['=', '×', '÷', '+'],
          correctAnswer: '=',
          hint: 'In word problems, "is" represents equality.',
          misconceptionTrap: '"is" means equals (=), while "of" means multiply (×).',
          explanation: '"is" means equals (=).'
        },
        {
          id: 'L03_Q2',
          type: 'minion',
          mobName: 'Spark Sprite',
          mobHp: 1,
          prompt: 'Translate into an equation: "What number is 30% of 80?"',
          options: ['x = 0.30 × 80', 'x = 30 × 80', '80 = 0.30 × x', 'x = 80 ÷ 0.30'],
          correctAnswer: 'x = 0.30 × 80',
          hint: 'Convert 30% to 0.30, "is" to =, "of" to ×.',
          misconceptionTrap: 'Remember to convert 30% to 0.30 before multiplying.',
          explanation: 'part = percent × whole -> x = 0.30 × 80'
        },
        {
          id: 'L03_Q3',
          type: 'elite',
          mobName: 'Crystal Golem',
          mobHp: 2,
          prompt: 'Solve using the percent equation: 18 = 0.20 × w. What is the value of w?',
          inputType: 'number',
          correctAnswer: '90',
          hint: 'Divide both sides by 0.20: 18 ÷ 0.20.',
          misconceptionTrap: '18 ÷ 0.20 is 90, not 3.6!',
          explanation: 'w = 18 / 0.20 = 90'
        },
        {
          id: 'L03_Q4',
          type: 'minion',
          mobName: 'Gargoyle',
          mobHp: 1,
          prompt: 'Solve: part = 0.15 × 60. What is the part?',
          options: ['9', '0.9', '90', '4'],
          correctAnswer: '9',
          hint: '10% of 60 is 6. 5% of 60 is 3. 6 + 3 = 9.',
          misconceptionTrap: '0.15 × 60 = 9.',
          explanation: '0.15 × 60 = 9'
        },
        {
          id: 'L03_Q5',
          type: 'elite',
          mobName: 'Rune Sentinel',
          mobHp: 2,
          prompt: 'A test has 50 questions. Maya scored 86%. How many questions did she answer correctly?',
          inputType: 'number',
          correctAnswer: '43',
          hint: 'part = 0.86 × 50.',
          misconceptionTrap: 'Multiply 0.86 × 50 = 43 questions.',
          explanation: 'part = 0.86 × 50 = 43'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Architect of Equations',
        phase1: {
          title: 'Phase 1: The Variable Lock',
          scenario: 'An enchanted vault opens only when the balance equation is satisfied. The runes say: "The magic charge of 63 gems represents exactly 45% of the vault\'s total storage capacity."',
          partA: {
            question: 'Part A: In the equation 63 = 0.45 × C, what operation will isolate C?',
            options: ['Divide 63 by 0.45', 'Multiply 63 by 0.45', 'Subtract 0.45 from 63', 'Add 63 and 0.45'],
            correctAnswer: 'Divide 63 by 0.45',
            hint: 'Inverse of multiplication is division.',
            damage: 25
          },
          partB: {
            question: 'Part B: Calculate the total gem capacity C.',
            inputType: 'number',
            correctAnswer: '140',
            hint: '63 ÷ 0.45 = 140.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: The Dual Reaction',
          scenario: 'The Phantom casts an alchemical surge. Catalyst Alpha contains 120 mL of liquid, which is 15% active reagent. Catalyst Beta contains 160 mL of liquid, which is 25% active reagent.',
          partA: {
            question: 'Part A: How many mL of active reagent are in Catalyst Alpha?',
            inputType: 'number',
            correctAnswer: '18',
            hint: '0.15 × 120 = 18 mL.',
            damage: 20
          },
          partB: {
            question: 'Part B: How many mL of active reagent are in Catalyst Beta?',
            inputType: 'number',
            correctAnswer: '40',
            hint: '0.25 × 160 = 40 mL.',
            damage: 20
          },
          partC: {
            question: 'Part C: When mixed together, how many TOTAL mL of active reagent are in the combined flask?',
            inputType: 'number',
            correctAnswer: '58',
            hint: 'Add: 18 + 40 = 58 mL.',
            damage: 10
          }
        }
      }
    },
    {
      id: 'G07_U03_L04',
      number: 4,
      title: 'Solve Percent Change and Percent Error Problems',
      essentialQuestion: 'How can you find a percent change or a percent error?',
      iCan: 'I can find the percent increase, percent decrease, and percent error using the change formula.',
      keyConceptSummary: 'Percent Change = (|Change| / Original Amount) × 100%. Percent Error = (|Estimated - Actual| / Actual) × 100%. ALWAYS divide by the original or actual starting value!',
      vocabWords: [
        { term: 'Percent Change', definition: 'The ratio of the amount of increase or decrease to the original amount.' },
        { term: 'Percent Error', definition: 'The accuracy of an estimate compared to the true actual measurement.' }
      ],
      grindQueue: [
        {
          id: 'L04_Q1',
          type: 'minion',
          mobName: 'Tide Slime',
          mobHp: 1,
          prompt: 'What number MUST go in the denominator for percent change?',
          options: ['Original Amount', 'New Amount', 'Change Amount', '100'],
          correctAnswer: 'Original Amount',
          hint: 'Always compare the change back to where you started!',
          misconceptionTrap: 'Never divide by the new amount—always divide by the ORIGINAL.',
          explanation: 'Percent Change = (Amount of Change / Original Amount) × 100%'
        },
        {
          id: 'L04_Q2',
          type: 'minion',
          mobName: 'Breeze Sprite',
          mobHp: 1,
          prompt: 'A price changes from $50 to $65. What is the AMOUNT of change?',
          options: ['$15', '$65', '$50', '$115'],
          correctAnswer: '$15',
          hint: 'Subtract: 65 - 50.',
          misconceptionTrap: 'The change is the difference: $65 - $50 = $15.',
          explanation: 'Amount of change = 65 - 50 = $15'
        },
        {
          id: 'L04_Q3',
          type: 'elite',
          mobName: 'Granite Golem',
          mobHp: 2,
          prompt: 'The temperature rose from 40° to 50°. What is the percent increase? (Enter a number without %)',
          inputType: 'number',
          correctAnswer: '25',
          hint: 'Change is 10. Original is 40. 10 / 40 = 1/4 = 25%.',
          misconceptionTrap: 'Divide by 40 (original), not 50 (new)! 10/40 = 25%.',
          explanation: 'Change = 10. (10 / 40) × 100% = 25%'
        },
        {
          id: 'L04_Q4',
          type: 'minion',
          mobName: 'Night Stalker',
          mobHp: 1,
          prompt: 'A shoe size was estimated at 10 inches, but actual measurement was 8 inches. What is the error amount?',
          options: ['2 inches', '18 inches', '10 inches', '8 inches'],
          correctAnswer: '2 inches',
          hint: '|10 - 8| = 2 inches.',
          misconceptionTrap: 'Error is the difference: 10 - 8 = 2.',
          explanation: 'Absolute error = |10 - 8| = 2 inches'
        },
        {
          id: 'L04_Q5',
          type: 'elite',
          mobName: 'Magma Hound',
          mobHp: 2,
          prompt: 'Gas went from $4.00 to $3.00 per gallon. What is the percent decrease? (Enter a number without %)',
          inputType: 'number',
          correctAnswer: '25',
          hint: 'Change = $1.00. Original = $4.00. 1.00 / 4.00 = 0.25 = 25%.',
          misconceptionTrap: 'Divide by $4.00 (original), not $3.00! 1/4 = 25%.',
          explanation: 'Change = 1.00. (1.00 / 4.00) × 100% = 25%'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Shifter of Values',
        phase1: {
          title: 'Phase 1: The Shifting Dimension',
          scenario: 'The Phantom alters the energy readings of the crystal tower. Last week the crystal generated 250 Megawatts. This week, after a storm surge, it generated 310 Megawatts.',
          partA: {
            question: 'Part A: What is the amount of increase in Megawatts?',
            inputType: 'number',
            correctAnswer: '60',
            hint: '310 - 250 = 60.',
            damage: 25
          },
          partB: {
            question: 'Part B: What was the percent increase in power generation? (Enter number without %)',
            inputType: 'number',
            correctAnswer: '24',
            hint: '(60 / 250) × 100% = 0.24 × 100 = 24%.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: The Grand Estimation Rift',
          scenario: 'The Royal Cartographer estimated the dragon canyon to be 80 meters deep. When surveyed precisely by drone, the canyon was actually 100 meters deep.',
          partA: {
            question: 'Part A: What is the absolute error in meters?',
            inputType: 'number',
            correctAnswer: '20',
            hint: '|80 - 100| = 20 meters.',
            damage: 20
          },
          partB: {
            question: 'Part B: In the percent error formula, which value goes in the denominator: 80 (estimated) or 100 (actual)?',
            options: ['100 (Actual)', '80 (Estimated)', '20 (Error)', '180 (Sum)'],
            correctAnswer: '100 (Actual)',
            hint: 'Percent Error = (|Estimated - Actual| / Actual) × 100%.',
            damage: 20
          },
          partC: {
            question: 'Part C: Calculate the percent error of the cartographer\'s estimate. (Enter number without %)',
            inputType: 'number',
            correctAnswer: '20',
            hint: '(20 / 100) × 100% = 20%.',
            damage: 10
          }
        }
      }
    },
    {
      id: 'G07_U03_L05',
      number: 5,
      title: 'Solve Markup and Markdown Problems',
      essentialQuestion: 'How are percent markup and percent markdown related to the percent equation?',
      iCan: 'I can calculate the retail price after markup, sales price after discount, and total with tax and tip.',
      keyConceptSummary: 'Markup: Wholesale Cost + (Markup % · Cost) = Selling Price. Markdown: Original Price - (Discount % · Price) = Sale Price. Tax & Tip are added to the cost.',
      vocabWords: [
        { term: 'Markup', definition: 'The amount added to the wholesale cost to determine retail selling price.' },
        { term: 'Markdown (Discount)', definition: 'The amount deducted from the regular price during a sale.' },
        { term: 'Wholesale Cost', definition: 'The price a store pays to buy goods from the manufacturer before selling.' }
      ],
      grindQueue: [
        {
          id: 'L05_Q1',
          type: 'minion',
          mobName: 'Gold Bug',
          mobHp: 1,
          prompt: 'When an item has a "markdown" or "discount", do you ADD or SUBTRACT that amount?',
          options: ['Subtract (-)', 'Add (+)', 'Multiply (×)', 'Divide (÷)'],
          correctAnswer: 'Subtract (-)',
          hint: 'Discounts make the price lower!',
          misconceptionTrap: 'Markdowns lower the price, so you subtract.',
          explanation: 'Markdown/Discount is subtracted from the original price.'
        },
        {
          id: 'L05_Q2',
          type: 'minion',
          mobName: 'Coin Drake',
          mobHp: 1,
          prompt: 'A jacket costs $60. It is on sale for 20% off. What is the DISCOUNT AMOUNT?',
          options: ['$12', '$48', '$20', '$8'],
          correctAnswer: '$12',
          hint: '0.20 × $60 = $12.',
          misconceptionTrap: '$12 is the discount amount; $48 is the final sale price.',
          explanation: 'Discount amount = 0.20 × 60 = $12'
        },
        {
          id: 'L05_Q3',
          type: 'elite',
          mobName: 'Treasure Golem',
          mobHp: 2,
          prompt: 'A video game costs $50. There is a 6% sales tax. What is the FINAL price including tax? (e.g. 53.00)',
          inputType: 'number',
          correctAnswer: '53.00',
          acceptableAnswers: ['53', '53.00'],
          hint: 'Tax = 0.06 × 50 = $3.00. Final = 50 + 3 = $53.00.',
          misconceptionTrap: 'Do not forget to add the $3 tax back to the $50 purchase price!',
          explanation: 'Tax = 0.06 × 50 = $3. Total = $50 + $3 = $53.00'
        },
        {
          id: 'L05_Q4',
          type: 'minion',
          mobName: 'Market Mimic',
          mobHp: 1,
          prompt: 'A store buys a hoodie wholesale for $30 and marks it up by 50%. What is the retail selling price?',
          options: ['$45', '$15', '$60', '$35'],
          correctAnswer: '$45',
          hint: 'Markup = 50% of $30 = $15. Selling price = 30 + 15 = $45.',
          misconceptionTrap: 'Add the $15 markup to the $30 wholesale cost.',
          explanation: 'Selling price = $30 + (0.50 × 30) = $45'
        },
        {
          id: 'L05_Q5',
          type: 'elite',
          mobName: 'Vault Sentinel',
          mobHp: 2,
          prompt: 'A $40 backpack is marked down 25%. What is the sale price?',
          inputType: 'number',
          correctAnswer: '30',
          acceptableAnswers: ['30', '30.00'],
          hint: '25% of 40 is 10. Subtract: 40 - 10 = $30. Or multiply 40 × 0.75.',
          misconceptionTrap: '$10 is the discount amount. The sale price is 40 - 10 = $30.',
          explanation: 'Sale price = $40 - (0.25 × 40) = $40 - $10 = $30'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Overlord of the Grand Bazaar',
        phase1: {
          title: 'Phase 1: The Multi-Step Coupon Curse',
          scenario: 'A high-end enchanted skateboard regularly costs $200. The skate shop offers a 30% markdown for the weekend. At the register, an 8% sales tax is added to the discounted price.',
          partA: {
            question: 'Part A: What is the sale price of the skateboard after the 30% markdown?',
            inputType: 'number',
            correctAnswer: '140',
            acceptableAnswers: ['140', '140.00'],
            hint: 'Discount = 0.30 × 200 = 60. Sale price = 200 - 60 = $140.',
            damage: 25
          },
          partB: {
            question: 'Part B: What is the final total at checkout after the 8% sales tax is added?',
            inputType: 'number',
            correctAnswer: '151.20',
            acceptableAnswers: ['151.2', '151.20'],
            hint: 'Tax = 0.08 × 140 = $11.20. Total = 140 + 11.20 = $151.20.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: The Rival Merchant Dilemma (Higher-Order Thinking)',
          scenario: 'Eliza must decide which gaming console bundle to buy. Store A: $300 bundle with a 25% discount. Store B: $280 bundle with a 20% discount.',
          partA: {
            question: 'Part A: What is the final price at Store A (25% off $300)?',
            inputType: 'number',
            correctAnswer: '225',
            acceptableAnswers: ['225', '225.00'],
            hint: '300 × 0.75 = $225.',
            damage: 20
          },
          partB: {
            question: 'Part B: What is the final price at Store B (20% off $280)?',
            inputType: 'number',
            correctAnswer: '224',
            acceptableAnswers: ['224', '224.00'],
            hint: '280 × 0.80 = $224.',
            damage: 20
          },
          partC: {
            question: 'Part C: Which store is cheaper, and by exactly how many dollars? (Enter the dollar savings, e.g. 1.00)',
            inputType: 'number',
            correctAnswer: '1.00',
            acceptableAnswers: ['1', '1.00'],
            hint: 'Store B ($224) is cheaper than Store A ($225) by $1.00.',
            damage: 10
          }
        }
      }
    },
    {
      id: 'G07_U03_L06',
      number: 6,
      title: 'Solve Simple Interest Problems',
      essentialQuestion: 'How does simple interest connect to the percent equation?',
      iCan: 'I can use the formula I = Prt to find simple interest, principal, rate, time, and total account balance.',
      keyConceptSummary: 'Simple Interest Formula: I = P · r · t, where I = interest earned or owed, P = principal (starting amount), r = annual interest rate (as a decimal), and t = time in YEARS.',
      vocabWords: [
        { term: 'Principal (P)', definition: 'The initial amount of money deposited, invested, or borrowed.' },
        { term: 'Interest Rate (r)', definition: 'The percentage charged or earned per year, written as a decimal.' },
        { term: 'Time (t)', definition: 'The duration of the investment or loan measured in YEARS.' }
      ],
      grindQueue: [
        {
          id: 'L06_Q1',
          type: 'minion',
          mobName: 'Vault Imp',
          mobHp: 1,
          prompt: 'In the formula I = P · r · t, what must the unit of time (t) ALWAYS be?',
          options: ['Years', 'Months', 'Days', 'Weeks'],
          correctAnswer: 'Years',
          hint: 'The annual interest rate is per year, so time must be in years.',
          misconceptionTrap: '6 months is 0.5 years, not t = 6!',
          explanation: 'Time t must always be expressed in years.'
        },
        {
          id: 'L06_Q2',
          type: 'minion',
          mobName: 'Chrono Sprite',
          mobHp: 1,
          prompt: 'How do you write 6 months as time (t) in years?',
          options: ['0.5 years', '6 years', '0.06 years', '1.5 years'],
          correctAnswer: '0.5 years',
          hint: '6 months out of 12 months in a year: 6/12 = 1/2 = 0.5.',
          misconceptionTrap: '6/12 = 0.5 years.',
          explanation: '6 months = 6/12 = 0.5 years'
        },
        {
          id: 'L06_Q3',
          type: 'elite',
          mobName: 'Vault Sentinel',
          mobHp: 2,
          prompt: 'You deposit $500 at 4% simple interest for 2 years. How much INTEREST do you earn? (I = Prt)',
          inputType: 'number',
          correctAnswer: '40',
          acceptableAnswers: ['40', '40.00'],
          hint: 'I = 500 × 0.04 × 2.',
          misconceptionTrap: '500 × 0.04 = 20. Then 20 × 2 = $40.',
          explanation: 'I = 500 × 0.04 × 2 = $40'
        },
        {
          id: 'L06_Q4',
          type: 'minion',
          mobName: 'Bank Spectre',
          mobHp: 1,
          prompt: 'If you invest $200 and earn $30 in interest, what is your TOTAL account balance?',
          options: ['$230', '$170', '$30', '$600'],
          correctAnswer: '$230',
          hint: 'Total Balance = Principal + Interest ($200 + $30).',
          misconceptionTrap: 'Add your starting deposit to the earned interest: 200 + 30 = $230.',
          explanation: 'Total = P + I = 200 + 30 = $230'
        },
        {
          id: 'L06_Q5',
          type: 'elite',
          mobName: 'Gilded Titan',
          mobHp: 2,
          prompt: 'Marcus borrowed $1,000 at a 5% interest rate for 3 years. What is the TOTAL amount he must repay (Principal + Interest)?',
          inputType: 'number',
          correctAnswer: '1150',
          acceptableAnswers: ['1150', '1150.00'],
          hint: 'I = 1000 × 0.05 × 3 = $150. Total = 1000 + 150 = $1,150.',
          misconceptionTrap: '$150 is just the interest! He must repay the $1,000 principal too.',
          explanation: 'Interest = $150. Total repayment = $1,000 + $150 = $1,150'
        }
      ],
      bossFight: {
        bossName: 'The Percentage Phantom',
        subtitle: 'Lord of the Eternal Vault',
        phase1: {
          title: 'Phase 1: The Chrono Investment Surge',
          scenario: 'The Royal Treasury deposits $2,000 in an arcane bank account earning 6% annual simple interest for 4 years.',
          partA: {
            question: 'Part A: How much simple interest is earned over the 4 years?',
            inputType: 'number',
            correctAnswer: '480',
            acceptableAnswers: ['480', '480.00'],
            hint: 'I = 2000 × 0.06 × 4 = $480.',
            damage: 25
          },
          partB: {
            question: 'Part B: What is the total account balance at the end of 4 years?',
            inputType: 'number',
            correctAnswer: '2480',
            acceptableAnswers: ['2480', '2480.00'],
            hint: 'Balance = Principal + Interest = 2000 + 480 = $2,480.',
            damage: 25
          }
        },
        phase2: {
          title: 'Phase 2: The Loan Mastery Trial (Higher-Order Thinking)',
          scenario: 'A wizard needs a $4,000 loan for a spellcraft laboratory. Bank of Sun offers 5% simple interest for 3 years. Bank of Moon offers 4% simple interest for 4 years.',
          partA: {
            question: 'Part A: What is the total interest owed at Bank of Sun (5% for 3 yrs on $4,000)?',
            inputType: 'number',
            correctAnswer: '600',
            acceptableAnswers: ['600', '600.00'],
            hint: '4000 × 0.05 × 3 = $600.',
            damage: 20
          },
          partB: {
            question: 'Part B: What is the total interest owed at Bank of Moon (4% for 4 yrs on $4,000)?',
            inputType: 'number',
            correctAnswer: '640',
            acceptableAnswers: ['640', '640.00'],
            hint: '4000 × 0.04 × 4 = $640.',
            damage: 20
          },
          partC: {
            question: 'Part C: Which bank charges LESS total interest, and by how many dollars? (Enter the dollar difference)',
            inputType: 'number',
            correctAnswer: '40',
            acceptableAnswers: ['40', '40.00'],
            hint: '$640 - $600 = $40. Bank of Sun saves $40.',
            damage: 10
          }
        }
      }
    }
  ]
};
