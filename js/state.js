/**
 * Realm of Numeria - State Management
 * 
 * Manages player progression, unlocked nodes, gold treasury, and leveling.
 */

import { fetchStudentProfile, saveStudentProfile, logCartridgeSession } from './db.js';
import { REALM_NODES, getEffectivePrerequisite } from './nodes.js';

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
      if (cleanPass !== 'math6' && cleanPass !== 'math7') {
        return { success: false, error: 'Incorrect Teacher Passcode. Use math6.' };
      }
      this.isTeacherOverride = true;
      this.passcode = cleanPass;
    } else {
      this.isTeacherOverride = false;
    }

    const saved = await fetchStudentProfile(this.pin);
    if (saved) {
      const savedPass = String(saved.password || saved.passcode || '').trim().toLowerCase();
      // Allow star6 or star7 for seed PIN 1042
      const isSeed1042 = this.pin === '1042' && (cleanPass === 'star6' || cleanPass === 'star7');

      if (savedPass && !isSeed1042 && cleanPass !== savedPass) {
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
    } else {
      // New adventurer profile registered with entered passcode
      this.passcode = cleanPass;
      this.level = 1;
      this.xp = 0;
      this.coins = 50;
      this.unlockedNodes = ['node_3_1'];
      this.nodeRecords = {};
      await this.save();
    }

    return { success: true };
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
    });
  }

  isNodeUnlocked(nodeId) {
    if (this.isTeacherOverride) return true;
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

    // Curriculum Bridge: Clearing 3-2 (GCF) also unlocks 3-4 (LCM Substation Grid)
    // so students can proceed along either the PEMDAS or Factors/Multiples pathway!
    if (nodeId === 'node_3_2') {
      this.unlockNode('node_3_4');
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
