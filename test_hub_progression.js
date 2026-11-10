/**
 * Unit Test Suite: Hub Progression, Math Input Parsing & State Rules
 * 
 * Verifies:
 * 1. Math input parsing formats ($15, 15, 15.00, %, decimals)
 * 2. Stage order: 3-1 -> 3-2 GCF -> 3-2 LCM -> 3-3 -> 3-4 (Signal Observatory) -> 3-5 -> 3-6 -> 3-7 -> Boss
 * 3. The under-construction bypass still works for future stages
 * 3b. Saves from before 3-6 went live get 3-6 unlocked on login
 * 3c. Saves from when LCM was Stage 3-4 ('node_3_4') carry over to the 3-2 LCM stage
 * 4. Teacher bypass mode (PIN: 7777)
 */

import { REALM_NODES, getEffectivePrerequisite, isNodeUnlocked } from './js/nodes.js';
import { PlayerState } from './js/state.js';
import { readFileSync } from 'fs';

// state.js imports nodes.js with a cache-busting ?v= tag, which makes it a separate module
// instance. Load that exact instance so tests that toggle a node affect PlayerState too.
const stateNodesSpec = readFileSync(new URL('./js/state.js', import.meta.url), 'utf8')
  .match(/from '\.\/(nodes\.js[^']*)'/)[1];
const { REALM_NODES: STATE_NODES } = await import(`./js/${stateNodesSpec}`);
const setWip = (idx, value) => { REALM_NODES[idx].isWip = value; STATE_NODES[idx].isWip = value; };

function parseMathInput(input) {
  if (typeof input !== 'string') input = String(input);
  // Strip dollar signs, percent signs, commas, extra whitespace
  const sanitized = input.replace(/[\$,%\s]/g, '');
  const num = parseFloat(sanitized);
  return isNaN(num) ? null : num;
}

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('--- TEST 1: Math Input Parsing Verification ($15, 15, 15.00, etc.) ---');
assert(parseMathInput('$15') === 15, 'Parses "$15" to 15');
assert(parseMathInput('15') === 15, 'Parses "15" to 15');
assert(parseMathInput('15.00') === 15.00, 'Parses "15.00" to 15');
assert(parseMathInput('  $ 15.50 ') === 15.5, 'Parses spaced "  $ 15.50 " to 15.5');
assert(parseMathInput('25%') === 25, 'Parses "25%" to 25');
assert(parseMathInput('invalid') === null, 'Rejects invalid string');

console.log('\n--- TEST 2: Realm Node Registry & Lesson Alignment ---');
const order = REALM_NODES.map((n) => n.id);
assert(REALM_NODES.length === 9, 'Has exactly 9 realm nodes configured');
assert(JSON.stringify(order) === JSON.stringify([
  'node_3_1', 'node_3_2', 'node_3_2_lcm', 'node_3_3', 'node_3_4_expr',
  'node_3_5', 'node_3_6', 'node_3_7', 'node_apex',
]), 'Stages run 3-1, 3-2 GCF, 3-2 LCM, 3-3, 3-4, 3-5, 3-6, 3-7, Boss');
const byId = Object.fromEntries(REALM_NODES.map((n) => [n.id, n]));
assert(byId.node_3_2.lessonCode === '3-2' && byId.node_3_2_lcm.lessonCode === '3-2', 'GCF and LCM are both Lesson 3-2');
assert(byId.node_3_2_lcm.cartridgeUrl === './cartridges/lcm/index.html', 'The 3-2 LCM stage runs the Grid Sync cartridge');
assert(byId.node_3_2_lcm.lessonId === 'G06_U03_L02_LCM', 'LCM logs under its own Lesson 3-2 ID');
assert(byId.node_3_4_expr.lessonCode === '3-4' && byId.node_3_4_expr.lessonId === 'G06_U03_L04', 'Signal Observatory is Lesson 3-4');
assert(byId.node_3_4_expr.cartridgeUrl === './cartridges/algebraic/index.html', 'Lesson 3-4 points at the Galactic Translator cartridge');
assert(!('node_3_4' in byId), 'The old node_3_4 ID is no longer a stage');
assert(byId.node_3_6.isWip === false, 'Lesson 3-6 is live (isWip: false)');
assert(byId.node_3_6.cartridgeUrl === './cartridges/distributive/index.html', 'Lesson 3-6 points at the Drone Drop cartridge');
assert(REALM_NODES[REALM_NODES.length - 1].id === 'node_apex', 'Final node is Apex Boss');
assert(byId.node_apex.cartridgeUrl === './cartridges/boss/index.html', 'The Boss Castle runs the Topic 3 capstone, not a lesson game');
REALM_NODES.forEach((n) => {
  if (n.id !== 'node_apex') assert(Boolean(n.lessonCode && n.mapCoords && n.buildingType), `${n.id} has a code, map spot, and building`);
});

console.log('\n--- TEST 3: Effective Prerequisite with WIP Bypass ---');
assert(getEffectivePrerequisite('node_3_1') === null, 'Node 3-1 has no prerequisite');
assert(getEffectivePrerequisite('node_3_2') === 'node_3_1', 'GCF requires 3-1');
assert(getEffectivePrerequisite('node_3_2_lcm') === 'node_3_2', 'LCM requires GCF');
assert(getEffectivePrerequisite('node_3_3') === 'node_3_2_lcm', 'Node 3-3 requires LCM');
assert(getEffectivePrerequisite('node_3_4_expr') === 'node_3_3', 'Node 3-4 requires 3-3');
assert(getEffectivePrerequisite('node_3_5') === 'node_3_4_expr', 'Node 3-5 requires 3-4');
assert(getEffectivePrerequisite('node_3_6') === 'node_3_5', 'Node 3-6 requires 3-5');
assert(getEffectivePrerequisite('node_3_7') === 'node_3_6', 'Node 3-7 requires 3-6');

// The under-construction bypass must still work for future stages
const idx36 = REALM_NODES.findIndex((n) => n.id === 'node_3_6');
setWip(idx36, true);
assert(getEffectivePrerequisite('node_3_7') === 'node_3_5', 'While a stage is WIP, the next stage bridges past it');
const wipPlayer = new PlayerState();
wipPlayer.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_2_lcm', 'node_3_3', 'node_3_4_expr', 'node_3_5'];
const wipResult = await wipPlayer.processCartridgeCompletion('node_3_5', { score: 10, total: 10 });
assert(wipResult.nextUnlockedNode?.id === 'node_3_7', 'Clearing 3-5 skips a WIP 3-6 and unlocks 3-7');
setWip(idx36, false);

console.log('\n--- TEST 4: Progression Locking & Unlock Sequence ---');
// Fresh adventurer with only 3-1
let unlocked = ['node_3_1'];
assert(isNodeUnlocked('node_3_1', unlocked) === true, 'Node 3-1 is unlocked by default');
assert(isNodeUnlocked('node_3_2', unlocked) === false, 'Node 3-2 is locked');
assert(isNodeUnlocked('node_3_3', unlocked) === false, 'Node 3-3 is locked');

// After clearing 3-1
unlocked.push('node_3_2');
assert(isNodeUnlocked('node_3_2', unlocked) === true, 'Node 3-2 unlocks after 3-1');
assert(isNodeUnlocked('node_3_3', unlocked) === false, 'Node 3-3 remains locked');

// Walk the whole chain: each clear opens exactly the next stage
const testPlayer = new PlayerState();
testPlayer.unlockedNodes = ['node_3_1'];
const chain = REALM_NODES.map((n) => n.id);
for (let i = 0; i < chain.length - 1; i++) {
  const next = chain[i + 1];
  assert(testPlayer.isNodeUnlocked(next) === false, `${next} is locked before ${chain[i]} is cleared`);
  const res = await testPlayer.processCartridgeCompletion(chain[i], { score: 10, total: 10 });
  assert(res.nextUnlockedNode?.id === next, `Clearing ${chain[i]} unlocks ${next}`);
  if (i + 2 < chain.length) assert(testPlayer.isNodeUnlocked(chain[i + 2]) === false, `${chain[i + 2]} stays locked`);
}

console.log('\n--- TEST 4b: Saves From Before 3-6 Went Live ---');
// A student who cleared 3-5 while 3-6 was skipped: 3-7 unlocked, 3-6 never added
const oldSave = new PlayerState();
oldSave.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_2_lcm', 'node_3_3', 'node_3_4_expr', 'node_3_5', 'node_3_7'];
oldSave.nodeRecords = { node_3_5: { cleared: true, stars: 3 } };
assert(oldSave.isNodeUnlocked('node_3_6') === false, 'Old save starts with 3-6 locked');
assert(oldSave.backfillUnlocks() === 1, 'Backfill opens exactly one missing stage');
assert(oldSave.isNodeUnlocked('node_3_6') === true, 'Old save gets 3-6 unlocked');
assert(oldSave.isNodeUnlocked('node_3_7') === true, 'Old save keeps 3-7 unlocked');
assert(oldSave.isNodeUnlocked('node_apex') === false, 'Backfill does not open stages whose prerequisite is not cleared');
const freshSave = new PlayerState();
freshSave.unlockedNodes = ['node_3_1'];
freshSave.nodeRecords = {};
assert(freshSave.backfillUnlocks() === 0, 'Backfill changes nothing for a fresh player');

console.log('\n--- TEST 4c: Saves From When LCM Was Stage 3-4 ---');
// Cleared GCF only: old bridge opened 3-3 and the LCM stage (then 'node_3_4')
const gcfOnly = new PlayerState();
gcfOnly.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3', 'node_3_4'];
gcfOnly.nodeRecords = { node_3_2: { cleared: true, stars: 3 } };
assert(gcfOnly.migrateLegacyNodeIds() === true, 'Old node_3_4 is migrated');
gcfOnly.backfillUnlocks();
assert(!gcfOnly.unlockedNodes.includes('node_3_4'), 'node_3_4 is gone from the unlock list');
assert(gcfOnly.isNodeUnlocked('node_3_2_lcm') === true, 'The LCM unlock carries over to the 3-2 LCM stage');
assert(gcfOnly.isNodeUnlocked('node_3_3') === true, 'Keeps 3-3 open');
assert(gcfOnly.isNodeUnlocked('node_3_4_expr') === false, 'Does NOT get the new 3-4 for free');

// Cleared LCM (old 3-4): stars and clear move to the LCM stage, 3-5 was open
const lcmDone = new PlayerState();
lcmDone.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3', 'node_3_4', 'node_3_5'];
lcmDone.nodeRecords = { node_3_4: { cleared: true, stars: 2, bestScore: 8, total: 10 } };
lcmDone.migrateLegacyNodeIds();
lcmDone.backfillUnlocks();
assert(lcmDone.nodeRecords.node_3_2_lcm?.stars === 2, 'LCM stars move to the 3-2 LCM stage');
assert(!('node_3_4' in lcmDone.nodeRecords), 'Old record key is removed');
assert(lcmDone.isNodeUnlocked('node_3_4_expr') === true, 'A student already past 3-4 gets the new 3-4 opened');
assert(lcmDone.isNodeUnlocked('node_3_5') === true, 'Keeps 3-5 open');
assert(lcmDone.isNodeUnlocked('node_3_6') === false, 'Does not open stages ahead of the student');

// Old save that only reached 3-3 (via PEMDAS path), LCM never opened
const pemdasOnly = new PlayerState();
pemdasOnly.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3'];
pemdasOnly.nodeRecords = {};
pemdasOnly.migrateLegacyNodeIds();
pemdasOnly.backfillUnlocks();
assert(pemdasOnly.isNodeUnlocked('node_3_2_lcm') === true, 'A student with 3-3 open gets the LCM stage that now sits before it');
assert(new PlayerState().migrateLegacyNodeIds() === false, 'Migration is a no-op for new saves');

console.log('\n--- TEST 5: Teacher Override Mode (PIN: 7777) ---');
assert(isNodeUnlocked('node_apex', ['node_3_1'], true) === true, 'Teacher override unlocks Apex Boss immediately');
assert(isNodeUnlocked('node_3_7', ['node_3_1'], true) === true, 'Teacher override unlocks Node 3-7 immediately');

console.log('\n--- TEST 6: Player State XP & Level Calculation ---');
const player = new PlayerState();
player.level = 1;
player.xp = 0;
assert(player.getXpForNextLevel() === 100, 'Level 1 requires 100 XP');
assert(player.calculateStars(10, 10) === 3, '10/10 awards 3 stars');
assert(player.calculateStars(8, 10) === 2, '8/10 awards 2 stars');
assert(player.calculateStars(5, 10) === 1, '5/10 awards 1 star');

console.log('\n--- TEST 7: PIN + Passcode Two-Factor Authentication ---');
const authPlayer = new PlayerState();

// Empty passcode
const emptyRes = await authPlayer.loadPlayer('1042', '');
assert(emptyRes.success === false, 'Rejects empty passcode');

// Teacher account PIN 7777 with invalid passcode
const badTeacherRes = await authPlayer.loadPlayer('7777', 'wrongpass');
assert(badTeacherRes.success === false, 'Rejects incorrect teacher passcode');

// Teacher account PIN 7777 with Test
const goodTeacherRes = await authPlayer.loadPlayer('7777', 'Test');
assert(goodTeacherRes.success === true, 'Accepts valid teacher passcode Test');
assert(authPlayer.isTeacherOverride === true, 'Activates teacher override mode');

// Teacher account PIN 7777 case-insensitive (test & TEST)
const caseTeacherRes = await authPlayer.loadPlayer('7777', 'TEST');
assert(caseTeacherRes.success === true, 'Accepts case-insensitive TEST');

const lowerTeacherRes = await authPlayer.loadPlayer('7777', 'test');
assert(lowerTeacherRes.success === true, 'Accepts lowercase test');

// Backwards compatibility with math6
const fallbackTeacherRes = await authPlayer.loadPlayer('7777', 'math6');
assert(fallbackTeacherRes.success === true, 'Accepts fallback teacher passcode math6');

// Student PIN 1042 accepts star6 or star7
const seedStudentRes = await authPlayer.loadPlayer('1042', 'star6');
assert(seedStudentRes.success === true, 'Accepts star6 for PIN 1042');

console.log('\n--- TEST 8: Full Access Column Verification ---');
const fullAccessPlayer = new PlayerState();
fullAccessPlayer.isFullAccess = true;
assert(fullAccessPlayer.isNodeUnlocked('node_3_1') === true, 'Node 3-1 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_2') === true, 'Node 3-2 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_3') === true, 'Node 3-3 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_2_lcm') === true, 'Node 3-2 LCM unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_4_expr') === true, 'Node 3-4 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_5') === true, 'Node 3-5 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_7') === true, 'Node 3-7 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_apex') === true, 'Node Apex Boss unlocked with full access');

const normalPlayer = new PlayerState();
normalPlayer.isFullAccess = false;
normalPlayer.unlockedNodes = ['node_3_1'];
assert(normalPlayer.isNodeUnlocked('node_3_4_expr') === false, 'Node 3-4 remains locked without full access');
assert(normalPlayer.isNodeUnlocked('node_3_2_lcm') === false, 'Node 3-2 LCM remains locked without full access');

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
}
