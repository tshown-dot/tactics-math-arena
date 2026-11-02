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

  async loadPlayer(pin, password = '') {
    this.pin = pin.trim();
    if (this.pin === '7777') {
      this.isTeacherOverride = true;
    } else {
      this.isTeacherOverride = false;
    }

    const saved = await fetchStudentProfile(this.pin);
    if (saved) {
      this.level = saved.level || 1;
      this.xp = saved.xp || 0;
      this.coins = saved.coins !== undefined ? saved.coins : 50;
      this.unlockedNodes = Array.isArray(saved.unlocked_lessons) && saved.unlocked_lessons.length > 0
        ? saved.unlocked_lessons
        : ['node_3_1'];
      this.nodeRecords = saved.nodeRecords || {};
    } else {
      // New adventurer profile
      this.level = 1;
      this.xp = 0;
      this.coins = 50;
      this.unlockedNodes = ['node_3_1'];
      this.nodeRecords = {};
      await this.save();
    }
  }

  async save() {
    await saveStudentProfile({
      pin: this.pin,
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
