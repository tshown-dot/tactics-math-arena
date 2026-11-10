/**
 * Unit Test Suite: Hub Progression, Math Input Parsing & State Rules
 * 
 * Verifies:
 * 1. Math input parsing formats ($15, 15, 15.00, %, decimals)
 * 2. Progression gating: Spire (3-1) -> Vault (3-2) -> Siege (3-3) -> Bastion (3-4) -> Plains (3-7)
 * 3. Lesson 3-6 (Drone Drop) is live, and the under-construction bypass still works for future stages
 * 3b. Saves from before 3-6 went live get 3-6 unlocked on login
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
assert(REALM_NODES.length === 8, 'Has exactly 8 realm nodes configured');
assert(REALM_NODES[0].id === 'node_3_1' && REALM_NODES[0].lessonCode === '3-1', 'First node is Lesson 3-1');
assert(REALM_NODES[1].id === 'node_3_2' && REALM_NODES[1].lessonCode === '3-2', 'Second node is Lesson 3-2');
assert(REALM_NODES[2].id === 'node_3_3' && REALM_NODES[2].lessonCode === '3-3', 'Third node is Lesson 3-3');
assert(REALM_NODES[3].id === 'node_3_4' && REALM_NODES[3].lessonCode === '3-4', 'Fourth node is Lesson 3-4');
assert(REALM_NODES[4].id === 'node_3_5' && REALM_NODES[4].lessonCode === '3-5', 'Fifth node is Lesson 3-5 (Variable Vault)');
assert(REALM_NODES[5].id === 'node_3_6' && REALM_NODES[5].lessonCode === '3-6', 'Sixth node is Lesson 3-6 (Drone Depot)');
assert(REALM_NODES[5].isWip === false, 'Lesson 3-6 is live (isWip: false)');
assert(REALM_NODES[5].cartridgeUrl === './cartridges/distributive/index.html', 'Lesson 3-6 points at the Drone Drop cartridge');
assert(REALM_NODES[6].id === 'node_3_7' && REALM_NODES[6].lessonCode === '3-7', 'Seventh node is Lesson 3-7');
assert(REALM_NODES[7].id === 'node_apex', 'Final node is Apex Boss');

console.log('\n--- TEST 3: Effective Prerequisite with Lesson 3-6 WIP Bypass ---');
assert(getEffectivePrerequisite('node_3_1') === null, 'Node 3-1 has no prerequisite');
assert(getEffectivePrerequisite('node_3_2') === 'node_3_1', 'Node 3-2 requires 3-1');
assert(getEffectivePrerequisite('node_3_3') === 'node_3_2', 'Node 3-3 requires 3-2');
assert(getEffectivePrerequisite('node_3_4') === 'node_3_3', 'Node 3-4 requires 3-3');
assert(getEffectivePrerequisite('node_3_5') === 'node_3_4', 'Node 3-5 requires 3-4');
assert(getEffectivePrerequisite('node_3_6') === 'node_3_5', 'Node 3-6 requires 3-5');
assert(getEffectivePrerequisite('node_3_7') === 'node_3_6', 'Node 3-7 requires 3-6 now that it is live');

// The under-construction bypass must still work for future stages
setWip(5, true);
assert(getEffectivePrerequisite('node_3_7') === 'node_3_5', 'While a stage is WIP, the next stage bridges past it');
const wipPlayer = new PlayerState();
wipPlayer.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3', 'node_3_4', 'node_3_5'];
const wipResult = await wipPlayer.processCartridgeCompletion('node_3_5', { score: 10, total: 10 });
assert(wipResult.nextUnlockedNode?.id === 'node_3_7', 'Clearing 3-5 skips a WIP 3-6 and unlocks 3-7');
setWip(5, false);

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

// Test PlayerState processCartridgeCompletion from 3-2 unlocking both 3-3 and 3-4 (LCM)
const gcfTestPlayer = new PlayerState();
gcfTestPlayer.unlockedNodes = ['node_3_1', 'node_3_2'];
await gcfTestPlayer.processCartridgeCompletion('node_3_2', { score: 10, total: 10 });
assert(gcfTestPlayer.isNodeUnlocked('node_3_3') === true, 'Node 3-3 (Crane) unlocks after 3-2');
assert(gcfTestPlayer.isNodeUnlocked('node_3_4') === true, 'Node 3-4 (LCM) unlocks after 3-2');

// Test PlayerState processCartridgeCompletion from 3-4 unlocking 3-5 (Variable Vault)
const testPlayer = new PlayerState();
testPlayer.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3', 'node_3_4'];
const completionResult34 = await testPlayer.processCartridgeCompletion('node_3_4', { score: 10, total: 10 });
assert(completionResult34.nextUnlockedNode !== null, 'Found next unlocked node after 3-4');
assert(completionResult34.nextUnlockedNode.id === 'node_3_5', 'Node 3-4 unlocks node_3_5');
assert(testPlayer.isNodeUnlocked('node_3_5') === true, 'Node 3-5 is now unlocked in player state');

// 3-5 now unlocks the live 3-6 Drone Depot, and 3-6 unlocks 3-7
const completionResult35 = await testPlayer.processCartridgeCompletion('node_3_5', { score: 10, total: 10 });
assert(completionResult35.nextUnlockedNode?.id === 'node_3_6', 'Node 3-5 unlocks node_3_6 (Drone Depot)');
assert(testPlayer.isNodeUnlocked('node_3_7') === false, 'Node 3-7 stays locked until 3-6 is cleared');
const completionResult36 = await testPlayer.processCartridgeCompletion('node_3_6', { score: 9, total: 10 });
assert(completionResult36.nextUnlockedNode?.id === 'node_3_7', 'Node 3-6 unlocks node_3_7');
assert(testPlayer.isNodeUnlocked('node_3_7') === true, 'Node 3-7 is now unlocked in player state');

console.log('\n--- TEST 4b: Saves From Before 3-6 Went Live ---');
// A student who cleared 3-5 while 3-6 was skipped: 3-7 unlocked, 3-6 never added
const oldSave = new PlayerState();
oldSave.unlockedNodes = ['node_3_1', 'node_3_2', 'node_3_3', 'node_3_4', 'node_3_5', 'node_3_7'];
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

// Teacher account PIN 7777 with math6
const goodTeacherRes = await authPlayer.loadPlayer('7777', 'math6');
assert(goodTeacherRes.success === true, 'Accepts valid teacher passcode math6');
assert(authPlayer.isTeacherOverride === true, 'Activates teacher override mode');

// Teacher account PIN 7777 case-insensitive
const caseTeacherRes = await authPlayer.loadPlayer('7777', 'MATH6');
assert(caseTeacherRes.success === true, 'Accepts case-insensitive MATH6');

// Student PIN 1042 accepts star6 or star7
const seedStudentRes = await authPlayer.loadPlayer('1042', 'star6');
assert(seedStudentRes.success === true, 'Accepts star6 for PIN 1042');

console.log('\n--- TEST 8: Full Access Column Verification ---');
const fullAccessPlayer = new PlayerState();
fullAccessPlayer.isFullAccess = true;
assert(fullAccessPlayer.isNodeUnlocked('node_3_1') === true, 'Node 3-1 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_2') === true, 'Node 3-2 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_3') === true, 'Node 3-3 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_4') === true, 'Node 3-4 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_5') === true, 'Node 3-5 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_3_7') === true, 'Node 3-7 unlocked with full access');
assert(fullAccessPlayer.isNodeUnlocked('node_apex') === true, 'Node Apex Boss unlocked with full access');

const normalPlayer = new PlayerState();
normalPlayer.isFullAccess = false;
normalPlayer.unlockedNodes = ['node_3_1'];
assert(normalPlayer.isNodeUnlocked('node_3_4') === false, 'Node 3-4 remains locked without full access');

console.log(`\n================================`);
console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log(`================================`);

if (failed > 0) {
  process.exit(1);
}
