/**
 * Realm of Numeria - State Management
 * 
 * Manages player progression, unlocked nodes, gold treasury, and leveling.
 */

import { fetchStudentProfile, saveStudentProfile, logCartridgeSession } from './db.js';
import { REALM_NODES, getEffectivePrerequisite } from './nodes.js?v=w3map3';

/** Old stage IDs found in saves, mapped to the stage they belong to now. */
export const LEGACY_NODE_IDS = { node_3_4: 'node_3_2_lcm' };

export class PlayerState {
  constructor() {
    this.pin = '1042';
    this.passcode = 'star6';
    this.characterClass = 'Arcane Paladin';
    this.level = 1;
    this.xp = 0;
    this.coins = 50;
    this.unlockedNodes = ['node_3_1'];
    this.nodeRecords = {}; // { [nodeId]: { stars: 3, bestScore: 10, total: 10, cleared: true } }
    this.isTeacherOverride = false;
    this.isFullAccess = false;
  }

  getXpForNextLevel() {
    return this.level * 100;
  }

  async loadPlayer(pin, passcode = '') {
    this.pin = pin.trim();
    const cleanPass = String(passcode || '').trim().toLowerCase();

    if (!cleanPass) {
      return { success: false, error: 'Please enter your secret passcode.' };
    }

    if (this.pin === '7777') {
      if (cleanPass !== 'test' && cleanPass !== 'math6' && cleanPass !== 'math7') {
        return { success: false, error: 'Incorrect Teacher Passcode. Use Test.' };
      }
      this.isTeacherOverride = true;
      this.passcode = cleanPass;
    } else {
      this.isTeacherOverride = false;
    }

    const saved = await fetchStudentProfile(this.pin);
    if (saved) {
      const savedPass = String(saved.password || saved.passcode || '').trim().toLowerCase();
      // Allow star6 or star7 for seed PIN 1042, and test or math6 for teacher PIN 7777
      const isSeed1042 = this.pin === '1042' && (cleanPass === 'star6' || cleanPass === 'star7');
      const isTeacher7777 = this.pin === '7777' && (cleanPass === 'test' || cleanPass === 'math6' || cleanPass === 'math7');

      if (savedPass && !isSeed1042 && !isTeacher7777 && cleanPass !== savedPass) {
        return {
          success: false,
          error: `Incorrect secret passcode for PIN #${this.pin}. Check your math folder or ask teacher.`
        };
      }

      this.passcode = cleanPass;
      this.level = saved.level || 1;
      this.xp = saved.xp || 0;
      this.coins = saved.coins !== undefined ? saved.coins : 50;
      this.unlockedNodes = Array.isArray(saved.unlocked_lessons) && saved.unlocked_lessons.length > 0
        ? saved.unlocked_lessons
        : ['node_3_1'];
      this.nodeRecords = saved.nodeRecords || {};

      // Check Full Access flag (from Google Sheets Roster, Supabase, or localStorage)
      const rawFullAccess = saved.full_access 
        ?? saved.fullAccess 
        ?? saved['Full Access'] 
        ?? saved['full access']
        ?? saved.is_full_access;

      const isFull = rawFullAccess === true 
        || String(rawFullAccess || '').trim().toLowerCase() === 'yes'
        || String(rawFullAccess || '').trim().toLowerCase() === 'true'
        || String(rawFullAccess || '').trim().toLowerCase() === 'y'
        || String(rawFullAccess || '').trim().toLowerCase() === '1';

      if (isFull) {
        this.isFullAccess = true;
        this.unlockedNodes = REALM_NODES.map(n => n.id);
      } else {
        this.isFullAccess = false;
      }
    } else {
      // New adventurer profile registered with entered passcode
      this.passcode = cleanPass;
      this.isFullAccess = false;
      this.level = 1;
      this.xp = 0;
      this.coins = 50;
      this.unlockedNodes = ['node_3_1'];
      this.nodeRecords = {};
      await this.save();
    }

    this.migrateLegacyNodeIds();
    this.backfillUnlocks();
    return { success: true };
  }

  /**
   * Renames stage IDs from older saves. The LCM game used to be Stage 3-4 ('node_3_4').
   * It is now the second half of Lesson 3-2 ('node_3_2_lcm'), and Lesson 3-4 is the
   * Signal Observatory ('node_3_4_expr'). Any 'node_3_4' in a save is the LCM stage.
   */
  migrateLegacyNodeIds() {
    let changed = false;
    Object.entries(LEGACY_NODE_IDS).forEach(([oldId, newId]) => {
      if (this.unlockedNodes.includes(oldId)) {
        this.unlockedNodes = this.unlockedNodes.filter((id) => id !== oldId);
        if (!this.unlockedNodes.includes(newId)) this.unlockedNodes.push(newId);
        changed = true;
      }
      if (this.nodeRecords[oldId]) {
        if (!this.nodeRecords[newId]) this.nodeRecords[newId] = this.nodeRecords[oldId];
        delete this.nodeRecords[oldId];
        changed = true;
      }
    });
    return changed;
  }

  /**
   * Opens stages that older saves are missing because the map changed after students passed by.
   * 1. A stage whose required stage is already cleared opens (while Lesson 3-6 was under
   *    construction, clearing 3-5 unlocked 3-7 and skipped 3-6).
   * 2. A stage that comes before an open stage opens too (the LCM stage moved in front of
   *    3-3, so a student with 3-3 open has passed the spot where LCM now sits).
   * The fix is kept in memory and is written on the player's next save.
   */
  backfillUnlocks() {
    let added = 0;
    const open = (id) => {
      if (!this.unlockedNodes.includes(id)) {
        this.unlockedNodes.push(id);
        added++;
      }
    };
    REALM_NODES.forEach((node) => {
      if (node.isWip || !node.requiredNodeId) return;
      if (this.nodeRecords[node.requiredNodeId]?.cleared) open(node.id);
    });
    for (let i = REALM_NODES.length - 1; i >= 0; i--) {
      const node = REALM_NODES[i];
      if (!node.requiredNodeId || !this.unlockedNodes.includes(node.id)) continue;
      const prereq = REALM_NODES.find((n) => n.id === node.requiredNodeId);
      if (prereq && !prereq.isWip) open(prereq.id);
    }
    return added;
  }

  async save() {
    await saveStudentProfile({
      pin: this.pin,
      password: this.passcode || 'star6',
      level: this.level,
      xp: this.xp,
      coins: this.coins,
      unlockedNodes: this.unlockedNodes,
      nodeRecords: this.nodeRecords,
      full_access: this.isFullAccess ? 'yes' : 'no',
      isFullAccess: this.isFullAccess,
    });
  }

  isNodeUnlocked(nodeId) {
    if (this.isTeacherOverride || this.isFullAccess) return true;
    const node = REALM_NODES.find(n => n.id === nodeId);
    if (!node || !node.requiredNodeId) return true;

    return this.unlockedNodes.includes(nodeId);
  }

  unlockNode(nodeId) {
    if (!this.unlockedNodes.includes(nodeId)) {
      this.unlockedNodes.push(nodeId);
      this.save();
      return true;
    }
    return false;
  }

  /**
   * Calculates 1 to 3 stars based on percentage score.
   */
  calculateStars(score, total) {
    if (!total || total <= 0) return 3;
    const ratio = score / total;
    if (ratio >= 0.9) return 3;
    if (ratio >= 0.7) return 2;
    return 1;
  }

  /**
   * Applies victory rewards and unlocks following node in the progression chain.
   */
  async processCartridgeCompletion(nodeId, payload = {}) {
    const node = REALM_NODES.find(n => n.id === nodeId);
    if (!node) return { leveledUp: false, nextUnlockedNode: null };

    const score = payload.score || 0;
    const total = payload.total || 10;
    const stars = this.calculateStars(score, total);

    // Update node record
    const prevRecord = this.nodeRecords[nodeId] || { bestScore: 0, stars: 0 };
    this.nodeRecords[nodeId] = {
      cleared: true,
      stars: Math.max(prevRecord.stars || 0, stars),
      bestScore: Math.max(prevRecord.bestScore || 0, score),
      total: total,
      lastPlayed: new Date().toISOString(),
    };

    // Calculate XP and Coins gained
    const xpGained = node.xpReward || 150;
    const coinsGained = node.coinsReward || 50;

    this.coins += coinsGained;
    let leveledUp = false;
    this.xp += xpGained;

    while (this.xp >= this.getXpForNextLevel()) {
      this.xp -= this.getXpForNextLevel();
      this.level += 1;
      leveledUp = true;
    }

    // Determine next node to unlock
    let nextUnlockedNode = null;
    const nodeIndex = REALM_NODES.findIndex(n => n.id === nodeId);
    if (nodeIndex >= 0 && nodeIndex < REALM_NODES.length - 1) {
      let nextNode = REALM_NODES[nodeIndex + 1];

      // If next node is WIP (e.g. Lesson 3-6), skip to the one after it
      if (nextNode.isWip && nodeIndex + 2 < REALM_NODES.length) {
        nextNode = REALM_NODES[nodeIndex + 2];
      }

      if (this.unlockNode(nextNode.id)) {
        nextUnlockedNode = nextNode;
      }
    }

    // Save and log session
    await this.save();
    await logCartridgeSession({
      pin: this.pin,
      lessonId: node.lessonId,
      score: score,
      total: total,
      accuracy: Math.round((score / Math.max(1, total)) * 100),
      bossDefeated: Boolean(payload.bossDefeated || true),
      xpEarned: xpGained,
      coinsEarned: coinsGained,
    });

    return {
      leveledUp,
      newLevel: this.level,
      xpGained,
      coinsGained,
      stars,
      nextUnlockedNode,
    };
  }
}

export const playerState = new PlayerState();
