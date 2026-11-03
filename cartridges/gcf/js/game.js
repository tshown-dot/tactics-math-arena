/**
 * Vault Breaker: GCF Tumbler - Unified Single-Screen Heist Engine
 * Core Game Design Pillars Aligned:
 * 1. Unified Heist Arena: Dial A (Left), Live GCF Bridge & Pin Deck (Center), Dial B (Right).
 *    Zero disconnected screen wipes! Shared factors link via laser beams in real time.
 * 2. 2-Click Smart Pin Tiles + Keyboard Input: Rapid, tactile factor pair building.
 * 3. Deep GCF Connection: Shows live Common Factors, Torque %, and Distributive Factoring
 *    (a + b = GCF(m + n)) plus remaining-factor diagnostics when a smaller common factor is picked.
 * 4. Real Stakes: Countdown timer, alarm threshold, screen shake, <2s instant retry loop.
 * 5. Pre-Flight Mission Briefing (Pillar 6) & 60fps Canvas Sparks/Laser FX.
 */

import {
  parseMathInput,
  getFactorPairs,
  getAllFactorsSorted,
  getCommonFactors,
  getDiscoveredFactors,
  getDiscoveredCommonFactors,
  generateCandidateTiles,
  getGCF,
  validateFactorPair,
  evaluateMasterKeySelection,
} from './factorLogic.js';

import { CURRICULUM_SECTORS } from './curriculum.js';
import { soundEngine } from './audio.js';

class VaultBreakerGame {
  constructor() {
    this.sectorIndex = 0;
    this.vaultIndex = 0;

    // Game Phase:
    // 1: Cracking Lock A & B factor pairs (with live Common Factor Bridge)
    // 3: Master Key GCF Torque Strike (in-place inside Center Vault Core)
    // 4: Vault Breached Victory / Boss Dilemma Overlay
    this.phase = 1;

    // Active lock selection: 'A' or 'B'
    this.activeLock = 'A';

    // Unlocked pairs per lock: [{a, b, isSquare}]
    this.unlockedPairsA = [];
    this.unlockedPairsB = [];
    this.knownSharedFactors = new Set();
    this.candidateTiles = [];

    // Dual-slot input state (Factor 1 × Factor 2)
    this.slot1 = '';
    this.slot2 = '';
    this.activeSlot = 1; // 1 or 2

    // Master Key selection in Phase 3
    this.selectedKey = null;

    // Boss Dilemma state (Sector 5)
    this.currentBossDilemmaIndex = 0;

    // Real Stakes
    this.timeRemaining = 55;
    this.timerInterval = null;
    this.alarmLevel = 0; // 0 to 100%
    this.isLockdown = false;
    this.isBriefingOpen = true; // Pre-Flight Mission Briefing open on load (Pillar 6)

    // Juice & Progression
    this.score = 0;
    this.combo = 1;

    // Canvas FX (Particles & Laser Bridges)
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.lasers = [];

    // Cache DOM references
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.initCanvas();
    this.bindEvents();
    this.loadSectorAndVault(0, 0);
    this.animateCanvas();
  }

  cacheDom() {
    this.dom.root = document.getElementById('game-root');
    this.dom.sectorBadge = document.getElementById('sector-badge');
    this.dom.sectorTitle = document.getElementById('sector-title');
    this.dom.vaultProgress = document.getElementById('vault-progress');
    this.dom.timerDisplay = document.getElementById('timer-display');
    this.dom.timerBar = document.getElementById('timer-bar');
    this.dom.alarmDisplay = document.getElementById('alarm-display');
    this.dom.alarmBar = document.getElementById('alarm-bar');
    this.dom.scoreDisplay = document.getElementById('score-display');
    this.dom.comboDisplay = document.getElementById('combo-display');
    this.dom.comboBadgeBox = document.getElementById('combo-badge-box');
    this.dom.audioToggleBtn = document.getElementById('audio-toggle-btn');
    this.dom.audioIcon = document.getElementById('audio-icon');
    this.dom.fieldGuideBtn = document.getElementById('field-guide-btn');
    this.dom.fieldGuideModal = document.getElementById('field-guide-modal');
    this.dom.closeGuideBtn = document.getElementById('close-guide-btn');

    // Modals & Decks
    this.dom.pairCrackingDeck = document.getElementById('pair-cracking-deck');
    this.dom.gcfStrikeDeck = document.getElementById('gcf-strike-deck');
    this.dom.phase4Container = document.getElementById('phase-4-container');
    this.dom.lockdownModal = document.getElementById('lockdown-modal');
    this.dom.missionBriefingModal = document.getElementById('mission-briefing-modal');
    this.dom.startMissionBtn = document.getElementById('start-mission-btn');
    this.dom.closeBriefingXBtn = document.getElementById('close-briefing-x-btn');
    this.dom.briefingBtn = document.getElementById('briefing-btn');

    // Live Shared Common Factor Bridge
    this.dom.sharedBridgePanel = document.getElementById('shared-bridge-panel');
    this.dom.sharedCountBadge = document.getElementById('shared-count-badge');
    this.dom.liveSharedKeys = document.getElementById('live-shared-keys');
    this.dom.torqueStatusLabel = document.getElementById('torque-status-label');
    this.dom.gcfFactoringReadout = document.getElementById('gcf-factoring-readout');

    // Lock A
    this.dom.lockACard = document.getElementById('lock-a-card');
    this.dom.lockANumber = document.getElementById('lock-a-number');
    this.dom.lockAActiveTag = document.getElementById('lock-a-active-tag');
    this.dom.lockAPairsContainer = document.getElementById('lock-a-pairs');
    this.dom.lockAProgress = document.getElementById('lock-a-progress');
    this.dom.lockAWheel = document.getElementById('lock-a-wheel');
    this.dom.lockADialStatus = document.getElementById('lock-a-dial-status');
    this.dom.lockARainbowSvg = document.getElementById('lock-a-rainbow-svg');

    // Lock B
    this.dom.lockBCard = document.getElementById('lock-b-card');
    this.dom.lockBNumber = document.getElementById('lock-b-number');
    this.dom.lockBActiveTag = document.getElementById('lock-b-active-tag');
    this.dom.lockBPairsContainer = document.getElementById('lock-b-pairs');
    this.dom.lockBProgress = document.getElementById('lock-b-progress');
    this.dom.lockBWheel = document.getElementById('lock-b-wheel');
    this.dom.lockBDialStatus = document.getElementById('lock-b-dial-status');
    this.dom.lockBRainbowSvg = document.getElementById('lock-b-rainbow-svg');

    // Target Selection Tabs
    this.dom.tabLockA = document.getElementById('tab-lock-a');
    this.dom.tabLockB = document.getElementById('tab-lock-b');

    // Dual-Slot Factor Pair Inputs & Pin Tiles
    this.dom.slot1Btn = document.getElementById('slot-1-btn');
    this.dom.slot1Display = document.getElementById('slot-1-display');
    this.dom.slot2Btn = document.getElementById('slot-2-btn');
    this.dom.slot2Display = document.getElementById('slot-2-display');
    this.dom.equationTargetBadge = document.getElementById('equation-target-badge');
    this.dom.liveProductPreview = document.getElementById('live-product-preview');
    this.dom.pinTilesGrid = document.getElementById('pin-tiles-grid');
    this.dom.nextSlotBtn = document.getElementById('keypad-next-slot-btn');

    // Feedback Banner
    this.dom.feedbackBanner = document.getElementById('feedback-banner');
    this.dom.feedbackIcon = document.getElementById('feedback-icon');
    this.dom.feedbackText = document.getElementById('feedback-text');

    // Phase 3 In-Place Strike Elements
    this.dom.p3TargetA = document.getElementById('p3-target-a');
    this.dom.p3TargetB = document.getElementById('p3-target-b');
    this.dom.p3KeysContainer = document.getElementById('p3-keys-container');
    this.dom.p3StrikeBtn = document.getElementById('p3-strike-btn');
    this.dom.p3TorqueGauge = document.getElementById('p3-torque-gauge');
    this.dom.p3TorqueText = document.getElementById('p3-torque-text');
    this.dom.p3StatusBanner = document.getElementById('p3-status-banner');

    // Phase 4 Victory / Boss Elements
    this.dom.p4Title = document.getElementById('p4-title');
    this.dom.p4Summary = document.getElementById('p4-summary');
    this.dom.p4DilemmaContainer = document.getElementById('p4-dilemma-container');
    this.dom.p4NextBtn = document.getElementById('p4-next-btn');
    this.dom.p4CompleteSaveBtn = document.getElementById('p4-complete-save-btn');

    // Lockdown retry
    this.dom.retryBtn = document.getElementById('lockdown-retry-btn');
    this.dom.lockdownDiagText = document.getElementById('lockdown-diag-text');
  }

  initCanvas() {
    this.canvas = document.getElementById('fx-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  spawnParticles(x, y, color = '#fbbf24', count = 22) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        radius: 2 + Math.random() * 3,
        color,
        alpha: 1,
        decay: 0.02 + Math.random() * 0.02,
      });
    }
  }

  spawnLaserBridge() {
    if (!this.canvas) return;
    const rectA = this.dom.lockAWheel?.getBoundingClientRect();
    const rectB = this.dom.lockBWheel?.getBoundingClientRect();
    const rectBridge = this.dom.sharedBridgePanel?.getBoundingClientRect();
    if (!rectA || !rectB || !rectBridge) return;

    const centerBridgeX = rectBridge.left + rectBridge.width / 2;
    const centerBridgeY = rectBridge.top + rectBridge.height / 2;

    this.lasers.push({
      x1: rectA.left + rectA.width / 2,
      y1: rectA.top + rectA.height / 2,
      x2: centerBridgeX,
      y2: centerBridgeY,
      color: '#22d3ee',
      alpha: 1.0,
    });
    this.lasers.push({
      x1: rectB.left + rectB.width / 2,
      y1: rectB.top + rectB.height / 2,
      x2: centerBridgeX,
      y2: centerBridgeY,
      color: '#fbbf24',
      alpha: 1.0,
    });

    this.spawnParticles(centerBridgeX, centerBridgeY, '#fbbf24', 28);
  }

  animateCanvas() {
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // Draw Laser Bridges
      for (let i = this.lasers.length - 1; i >= 0; i--) {
        const l = this.lasers[i];
        this.ctx.save();
        this.ctx.globalAlpha = l.alpha;
        this.ctx.strokeStyle = l.color;
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = l.color;
        this.ctx.shadowBlur = 16;
        this.ctx.beginPath();
        this.ctx.moveTo(l.x1, l.y1);
        this.ctx.lineTo(l.x2, l.y2);
        this.ctx.stroke();
        this.ctx.restore();

        l.alpha -= 0.035;
        if (l.alpha <= 0) this.lasers.splice(i, 1);
      }

      // Draw Sparks
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        this.ctx.save();
        this.ctx.globalAlpha = p.alpha;
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.14; // gravity
        p.alpha -= p.decay;
        if (p.alpha <= 0) this.particles.splice(i, 1);
      }
    }
    requestAnimationFrame(() => this.animateCanvas());
  }

  bindEvents() {
    // Mission Briefing
    if (this.dom.startMissionBtn) {
      this.dom.startMissionBtn.addEventListener('click', () => this.dismissBriefing());
    }
    if (this.dom.closeBriefingXBtn) {
      this.dom.closeBriefingXBtn.addEventListener('click', () => this.dismissBriefing());
    }
    if (this.dom.briefingBtn) {
      this.dom.briefingBtn.addEventListener('click', () => this.openBriefing());
    }

    // Audio Toggle
    this.dom.audioToggleBtn.addEventListener('click', () => {
      const muted = soundEngine.toggleMuted();
      this.dom.audioIcon.textContent = muted ? '🔇' : '🔊';
    });

    // Field Guide
    this.dom.fieldGuideBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.dom.fieldGuideModal.classList.remove('hidden');
    });
    this.dom.closeGuideBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.dom.fieldGuideModal.classList.add('hidden');
    });

    // Lock Selector Tabs
    this.dom.tabLockA.addEventListener('click', () => this.setActiveLock('A'));
    this.dom.tabLockB.addEventListener('click', () => this.setActiveLock('B'));
    this.dom.lockACard.addEventListener('click', () => this.setActiveLock('A'));
    this.dom.lockBCard.addEventListener('click', () => this.setActiveLock('B'));

    // Dual-slot buttons
    this.dom.slot1Btn.addEventListener('click', () => this.setActiveSlot(1));
    this.dom.slot2Btn.addEventListener('click', () => this.setActiveSlot(2));
    this.dom.nextSlotBtn.addEventListener('click', () => this.switchSlot());

    const clearBtn = document.getElementById('keypad-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.clearInput();
      });
    }

    const testBtn = document.getElementById('keypad-test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.submitFactorPairInput();
      });
    }

    // Phase 3 Strike Button
    this.dom.p3StrikeBtn.addEventListener('click', () => {
      this.executeMasterKeyStrike();
    });

    // Phase 4 Next Vault Button
    this.dom.p4NextBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.advanceToNextVault();
    });

    // Phase 4 Save & Complete Run to Overworld Town
    if (this.dom.p4CompleteSaveBtn) {
      this.dom.p4CompleteSaveBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.completeCartridgeRun();
      });
    }

    // Instant Retry on Lockdown
    this.dom.retryBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.instantRetry();
    });

    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (this.isBriefingOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
          e.preventDefault();
          this.dismissBriefing();
        }
        return;
      }

      if (this.isLockdown) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.instantRetry();
        }
        return;
      }

      if (this.phase === 4) {
        if (e.key === 'Enter' && !this.dom.p4NextBtn.disabled) {
          e.preventDefault();
          this.advanceToNextVault();
        }
        return;
      }

      if (this.phase === 1) {
        if (e.key >= '0' && e.key <= '9') {
          soundEngine.playTumblerClick();
          this.appendKeypadInput(e.key);
        } else if (e.key === '*' || e.key.toLowerCase() === 'x' || e.key === '×' || e.key === ',' || e.key === 'Tab') {
          e.preventDefault();
          this.switchSlot();
        } else if (e.key === 'Backspace') {
          soundEngine.playClick();
          this.backspaceInput();
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.submitFactorPairInput();
        } else if (e.key.toLowerCase() === 'a') {
          this.setActiveLock('A');
        } else if (e.key.toLowerCase() === 'b') {
          this.setActiveLock('B');
        }
      } else if (this.phase === 3) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.executeMasterKeyStrike();
        }
      }
    });
  }

  getActiveSector() {
    return CURRICULUM_SECTORS[this.sectorIndex];
  }

  getActiveVault() {
    const sector = this.getActiveSector();
    return sector.vaults[this.vaultIndex];
  }

  loadSectorAndVault(sectorIdx, vaultIdx) {
    this.sectorIndex = sectorIdx;
    this.vaultIndex = vaultIdx;

    const sector = this.getActiveSector();
    const vault = this.getActiveVault();

    // Reset state
    this.phase = 1;
    this.activeLock = 'A';
    this.unlockedPairsA = [];
    this.unlockedPairsB = [];
    this.knownSharedFactors = new Set();
    this.candidateTiles = generateCandidateTiles(vault.numA, vault.numB);
    this.selectedKey = null;
    this.slot1 = '';
    this.slot2 = '';
    this.activeSlot = 1;
    this.alarmLevel = 0;
    this.isLockdown = false;
    this.timeRemaining = sector.timeLimit || 50;

    // Update Header HUD
    this.dom.sectorBadge.textContent = sector.badge;
    this.dom.sectorTitle.textContent = `${sector.name} — ${vault.vaultName}`;
    this.dom.vaultProgress.textContent = `${this.vaultIndex + 1} / ${sector.vaults.length}`;
    this.dom.scoreDisplay.textContent = this.score;
    this.dom.comboDisplay.textContent = `x${this.combo}`;
    this.updateTimerDisplay();
    this.updateAlarmDisplay();

    // Setup Dials
    this.dom.lockANumber.textContent = vault.numA;
    this.dom.lockBNumber.textContent = vault.numB;
    this.dom.tabLockA.querySelector('.tab-label').textContent = `Dial A (${vault.numA})`;
    this.dom.tabLockB.querySelector('.tab-label').textContent = `Dial B (${vault.numB})`;

    // Reset Center Torque & Bridge
    this.dom.p3TorqueGauge.style.width = '0%';
    this.dom.p3TorqueText.textContent = '0%';
    this.dom.torqueStatusLabel.textContent = 'VAULT TORQUE SYNCHRONIZATION';
    this.dom.gcfFactoringReadout.classList.add('hidden');
    this.dom.sharedBridgePanel.className = 'bg-slate-900/95 border-2 border-amber-500/40 rounded-xl p-2.5 transition-all';

    // Show Pair Cracking Deck, hide Strike Deck & Phase 4
    this.dom.pairCrackingDeck.classList.remove('hidden');
    this.dom.gcfStrikeDeck.classList.add('hidden');
    this.dom.phase4Container.classList.add('hidden');
    this.dom.lockdownModal.classList.add('hidden');

    this.renderLockPairs('A');
    this.renderLockPairs('B');
    this.renderSharedBridge();
    this.setActiveLock('A');
    this.setActiveSlot(1);
    this.updateSlotDisplays();
    this.renderPinTiles();

    this.showFeedback(
      `Mission: Click 2 Pin Tiles that multiply to Dial A (${vault.numA}) or Dial B (${vault.numB})!`,
      'info'
    );

    // Start timer only if briefing modal is closed
    if (!this.isBriefingOpen) {
      this.startTimer();
    }
  }

  dismissBriefing() {
    this.isBriefingOpen = false;
    if (this.dom.missionBriefingModal) {
      this.dom.missionBriefingModal.classList.add('hidden');
    }
    soundEngine.playTumblerLock();
    this.startTimer();
  }

  openBriefing() {
    this.isBriefingOpen = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.dom.missionBriefingModal) {
      this.dom.missionBriefingModal.classList.remove('hidden');
    }
    soundEngine.playClick();
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isLockdown || this.isBriefingOpen) return;

      this.timeRemaining--;
      this.updateTimerDisplay();

      if (this.timeRemaining <= 10) {
        soundEngine.playClick();
        this.dom.timerDisplay.classList.add('animate-urgent', 'text-rose-400');
      } else {
        this.dom.timerDisplay.classList.remove('animate-urgent', 'text-rose-400');
      }

      if (this.timeRemaining <= 0) {
        this.triggerLockdown('TIME_EXPIRED');
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const sector = this.getActiveSector();
    const max = sector.timeLimit || 50;
    const pct = Math.max(0, Math.min(100, (this.timeRemaining / max) * 100));

    this.dom.timerDisplay.textContent = `${this.timeRemaining}s`;
    this.dom.timerBar.style.width = `${pct}%`;

    if (pct < 25) {
      this.dom.timerBar.className = 'h-full bg-rose-500 rounded-full transition-all duration-300';
    } else if (pct < 50) {
      this.dom.timerBar.className = 'h-full bg-amber-400 rounded-full transition-all duration-300';
    } else {
      this.dom.timerBar.className = 'h-full bg-cyan-400 rounded-full transition-all duration-300';
    }
  }

  updateAlarmDisplay() {
    this.dom.alarmDisplay.textContent = `${this.alarmLevel}%`;
    this.dom.alarmBar.style.width = `${this.alarmLevel}%`;

    if (this.alarmLevel >= 75) {
      this.dom.alarmBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300';
      this.dom.alarmDisplay.className = 'text-xs font-mono-math font-black text-rose-400 animate-urgent';
    } else if (this.alarmLevel >= 50) {
      this.dom.alarmBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      this.dom.alarmDisplay.className = 'text-xs font-mono-math font-bold text-amber-300';
    } else {
      this.dom.alarmBar.className = 'h-full bg-emerald-500 rounded-full transition-all duration-300';
      this.dom.alarmDisplay.className = 'text-xs font-mono-math font-bold text-emerald-400';
    }
  }

  setActiveLock(lock) {
    if (this.phase !== 1) return;
    this.activeLock = lock;
    soundEngine.playClick();

    const vault = this.getActiveVault();
    const target = lock === 'A' ? vault.numA : vault.numB;
    this.dom.equationTargetBadge.textContent = target;

    if (lock === 'A') {
      this.dom.tabLockA.className = 'flex-1 py-1.5 px-2 rounded-xl font-black text-xs uppercase bg-cyan-500 text-slate-950 border-2 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.5)] transition-all cursor-pointer';
      this.dom.tabLockB.className = 'flex-1 py-1.5 px-2 rounded-xl font-bold text-xs uppercase bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer';
      this.dom.lockACard.classList.add('border-cyan-400', 'glow-cyan');
      this.dom.lockBCard.classList.remove('border-amber-400', 'glow-amber');
      this.dom.lockAActiveTag.textContent = '● ACTIVE TARGET';
      this.dom.lockAActiveTag.className = 'text-[9px] font-mono-math font-bold text-emerald-400';
      this.dom.lockBActiveTag.textContent = 'CLICK TO TARGET';
      this.dom.lockBActiveTag.className = 'text-[9px] font-mono-math font-bold text-slate-500';
      this.dom.equationTargetBadge.className = 'px-2.5 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/60 font-mono-math font-black text-base text-cyan-300';
    } else {
      this.dom.tabLockB.className = 'flex-1 py-1.5 px-2 rounded-xl font-black text-xs uppercase bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all cursor-pointer';
      this.dom.tabLockA.className = 'flex-1 py-1.5 px-2 rounded-xl font-bold text-xs uppercase bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer';
      this.dom.lockBCard.classList.add('border-amber-400', 'glow-amber');
      this.dom.lockACard.classList.remove('border-cyan-400', 'glow-cyan');
      this.dom.lockBActiveTag.textContent = '● ACTIVE TARGET';
      this.dom.lockBActiveTag.className = 'text-[9px] font-mono-math font-bold text-amber-300';
      this.dom.lockAActiveTag.textContent = 'CLICK TO TARGET';
      this.dom.lockAActiveTag.className = 'text-[9px] font-mono-math font-bold text-slate-500';
      this.dom.equationTargetBadge.className = 'px-2.5 py-1.5 rounded-lg bg-amber-950/80 border border-amber-500/60 font-mono-math font-black text-base text-amber-300';
    }

    this.updateSlotDisplays();
    this.renderPinTiles();
  }

  setActiveSlot(slotNum) {
    this.activeSlot = slotNum;
    if (slotNum === 1) {
      this.dom.slot1Btn.className = 'flex-1 py-1.5 px-2 rounded-lg border-2 border-amber-400 bg-amber-950/40 text-amber-300 font-mono-math font-black text-lg flex items-center justify-between glow-amber transition-all cursor-pointer';
      this.dom.slot2Btn.className = 'flex-1 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 font-mono-math font-black text-lg flex items-center justify-between transition-all cursor-pointer';
    } else {
      this.dom.slot2Btn.className = 'flex-1 py-1.5 px-2 rounded-lg border-2 border-amber-400 bg-amber-950/40 text-amber-300 font-mono-math font-black text-lg flex items-center justify-between glow-amber transition-all cursor-pointer';
      this.dom.slot1Btn.className = 'flex-1 py-1.5 px-2 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 font-mono-math font-black text-lg flex items-center justify-between transition-all cursor-pointer';
    }
  }

  switchSlot() {
    soundEngine.playClick();
    this.setActiveSlot(this.activeSlot === 1 ? 2 : 1);
  }

  appendKeypadInput(char) {
    if (this.activeSlot === 1) {
      if (this.slot1.length >= 3) return;
      this.slot1 += char;
    } else {
      if (this.slot2.length >= 3) return;
      this.slot2 += char;
    }
    this.updateSlotDisplays();
  }

  clearInput() {
    this.slot1 = '';
    this.slot2 = '';
    this.setActiveSlot(1);
    this.updateSlotDisplays();
  }

  backspaceInput() {
    if (this.activeSlot === 1) {
      this.slot1 = this.slot1.slice(0, -1);
    } else {
      if (this.slot2.length > 0) {
        this.slot2 = this.slot2.slice(0, -1);
      } else {
        this.setActiveSlot(1);
      }
    }
    this.updateSlotDisplays();
  }

  /**
   * 2-Click Smart Pin Tile Handler:
   * Click 1 -> sets Factor 1 & moves to Slot 2.
   * Click 2 -> sets Factor 2 & immediately fires the pair test!
   */
  handlePinTileClick(valStr) {
    if (this.phase !== 1) return;
    soundEngine.playTumblerClick();

    if (this.activeSlot === 1) {
      this.slot1 = String(valStr);
      this.updateSlotDisplays();
      this.setActiveSlot(2);
    } else {
      this.slot2 = String(valStr);
      this.updateSlotDisplays();
      this.submitFactorPairInput();
    }
  }

  updateSlotDisplays() {
    this.dom.slot1Display.textContent = this.slot1 || '_';
    this.dom.slot2Display.textContent = this.slot2 || '_';

    const vault = this.getActiveVault();
    const target = this.activeLock === 'A' ? vault.numA : vault.numB;
    const a = parseMathInput(this.slot1);
    const b = parseMathInput(this.slot2);

    if (!isNaN(a) && !isNaN(b) && a > 0 && b > 0) {
      const prod = a * b;
      this.dom.liveProductPreview.textContent = `${a} × ${b} = ${prod}`;
      this.dom.liveProductPreview.className =
        prod === target
          ? 'font-mono-math font-black text-emerald-400'
          : 'font-mono-math font-black text-rose-400';
    } else if (!isNaN(a) && a > 0) {
      this.dom.liveProductPreview.textContent = `${a} × ? = ${target}`;
      this.dom.liveProductPreview.className = 'font-mono-math text-amber-300';
    } else {
      this.dom.liveProductPreview.textContent = `Target: ${target}`;
      this.dom.liveProductPreview.className = 'font-mono-math text-cyan-300';
    }
  }

  /**
   * Renders the Tactile Pin Tile Matrix (12 or 16 smart tiles)
   */
  renderPinTiles() {
    if (!this.dom.pinTilesGrid) return;
    const discoveredA = new Set(getDiscoveredFactors(this.unlockedPairsA));
    const discoveredB = new Set(getDiscoveredFactors(this.unlockedPairsB));
    const activeDiscovered = this.activeLock === 'A' ? discoveredA : discoveredB;

    this.dom.pinTilesGrid.innerHTML = '';

    this.candidateTiles.forEach((num) => {
      const isSharedNow = discoveredA.has(num) && discoveredB.has(num);
      const isPairedOnActive = activeDiscovered.has(num);

      const btn = document.createElement('button');
      btn.type = 'button';

      let styleClass =
        'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-white hover:border-cyan-400';
      let badgeHtml = '';

      if (isSharedNow) {
        styleClass =
          'bg-amber-950/50 hover:bg-amber-900/60 border-amber-400/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.25)]';
        badgeHtml = `<span class="text-[8px] font-black text-amber-400 leading-none">★ SHARED</span>`;
      } else if (isPairedOnActive) {
        styleClass =
          this.activeLock === 'A'
            ? 'bg-cyan-950/50 hover:bg-cyan-900/60 border-cyan-500/60 text-cyan-200'
            : 'bg-amber-950/40 hover:bg-amber-900/50 border-amber-500/60 text-amber-200';
        badgeHtml = `<span class="text-[8px] font-bold text-emerald-400 leading-none">✓ PAIRED</span>`;
      }

      btn.className = `pin-tile-btn rounded-xl border font-mono-math font-black text-base flex flex-col items-center justify-center py-1.5 transition-all active:scale-95 cursor-pointer select-none ${styleClass}`;
      btn.innerHTML = `
        <span>${num}</span>
        ${badgeHtml}
      `;

      btn.addEventListener('click', () => this.handlePinTileClick(num));
      this.dom.pinTilesGrid.appendChild(btn);
    });
  }

  /**
   * Renders the Live Shared Common Factors Bridge in the Center Vault Core!
   */
  renderSharedBridge(newlyDiscoveredShared = []) {
    const sharedNow = getDiscoveredCommonFactors(this.unlockedPairsA, this.unlockedPairsB);
    this.dom.sharedCountBadge.textContent = `${sharedNow.length} Shared`;

    // Update synchronization progress bar during Phase 1
    const vault = this.getActiveVault();
    const totalPairs = getFactorPairs(vault.numA).length + getFactorPairs(vault.numB).length;
    const unlockedTotal = this.unlockedPairsA.length + this.unlockedPairsB.length;
    if (this.phase === 1) {
      const syncPct = Math.round((unlockedTotal / Math.max(1, totalPairs)) * 100);
      this.dom.p3TorqueGauge.style.width = `${syncPct}%`;
      this.dom.p3TorqueText.textContent = `${syncPct}% Sync`;
    }

    if (sharedNow.length === 0) {
      this.dom.liveSharedKeys.innerHTML = `
        <span class="text-[10px] text-slate-500 font-medium italic">Unlock matching factors on Dial A &amp; B to link shared keys...</span>
      `;
      return;
    }

    this.dom.liveSharedKeys.innerHTML = '';
    const maxSharedSoFar = Math.max(...sharedNow);

    sharedNow.forEach((factor) => {
      const isNew = newlyDiscoveredShared.includes(factor);
      const isLargestSoFar = factor === maxSharedSoFar;

      const chip = document.createElement('div');
      chip.className = `px-2.5 py-1 rounded-lg font-mono-math font-black text-xs flex items-center space-x-1 border transition-all ${
        isNew ? 'animate-key-pop ' : ''
      }${
        isLargestSoFar
          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 border-white shadow-[0_0_12px_rgba(245,158,11,0.7)]'
          : 'bg-amber-950/80 text-amber-300 border-amber-500/60'
      }`;

      chip.innerHTML = `
        <span>🔑</span>
        <span>${factor}</span>
      `;
      this.dom.liveSharedKeys.appendChild(chip);
    });
  }

  renderLockPairs(lock) {
    const vault = this.getActiveVault();
    const target = lock === 'A' ? vault.numA : vault.numB;
    const allPairs = getFactorPairs(target);
    const unlocked = lock === 'A' ? this.unlockedPairsA : this.unlockedPairsB;
    const container = lock === 'A' ? this.dom.lockAPairsContainer : this.dom.lockBPairsContainer;
    const progressEl = lock === 'A' ? this.dom.lockAProgress : this.dom.lockBProgress;
    const dialStatus = lock === 'A' ? this.dom.lockADialStatus : this.dom.lockBDialStatus;
    const wheel = lock === 'A' ? this.dom.lockAWheel : this.dom.lockBWheel;

    const sharedSet = new Set(getDiscoveredCommonFactors(this.unlockedPairsA, this.unlockedPairsB));
    const isComplete = unlocked.length >= allPairs.length;

    progressEl.textContent = isComplete ? `✓ ALL ${allPairs.length} PAIRS` : `${unlocked.length} / ${allPairs.length} Pairs`;
    if (dialStatus) {
      dialStatus.textContent = isComplete ? 'LOCKED' : `${unlocked.length}/${allPairs.length}`;
    }

    // Rotate dial wheel smoothly based on unlocked count
    if (wheel) {
      const deg = unlocked.length * 60;
      wheel.style.transform = `rotate(${deg}deg)`;
      if (isComplete) {
        wheel.classList.add('border-emerald-500', 'shadow-[0_0_25px_rgba(16,185,129,0.5)]');
      } else {
        wheel.classList.remove('border-emerald-500', 'shadow-[0_0_25px_rgba(16,185,129,0.5)]');
      }
    }

    // Render Paired Interlock Gates
    container.innerHTML = '';
    allPairs.forEach((pair, idx) => {
      const isFound = unlocked.some((p) => p.a === pair.a && p.b === pair.b);
      const gate = document.createElement('div');
      gate.className = `p-1.5 rounded-xl border flex items-center justify-between text-xs font-mono-math transition-all duration-300 ${
        isFound
          ? lock === 'A'
            ? 'bg-cyan-950/70 border-cyan-500/70 text-cyan-200 shadow-md'
            : 'bg-amber-950/70 border-amber-500/70 text-amber-200 shadow-md'
          : 'bg-slate-900/60 border-slate-800/80 text-slate-600'
      }`;

      if (isFound) {
        const aShared = sharedSet.has(pair.a);
        const bShared = sharedSet.has(pair.b);

        gate.innerHTML = `
          <div class="flex items-center space-x-1.5">
            <div class="w-6 h-6 rounded-lg ${
              aShared
                ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_8px_#fbbf24]'
                : lock === 'A'
                ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
                : 'bg-amber-900/80 border-amber-400 text-amber-200'
            } border flex items-center justify-center font-black text-xs">
              ${pair.a}
            </div>
            <div class="w-2.5 h-0.5 ${lock === 'A' ? 'bg-cyan-400' : 'bg-amber-400'}"></div>
            <span class="text-xs font-black ${lock === 'A' ? 'text-cyan-400' : 'text-amber-400'}">×</span>
            <div class="w-2.5 h-0.5 ${lock === 'A' ? 'bg-cyan-400' : 'bg-amber-400'}"></div>
            <div class="w-6 h-6 rounded-lg ${
              bShared
                ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_8px_#fbbf24]'
                : lock === 'A'
                ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200'
                : 'bg-amber-900/80 border-amber-400 text-amber-200'
            } border flex items-center justify-center font-black text-xs">
              ${pair.b}
            </div>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-slate-400 text-xs">= ${target}</span>
            <span class="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300">
              ${pair.isSquare ? 'SQUARE' : 'LOCKED'}
            </span>
          </div>
        `;
      } else {
        const isFirstHint = idx === 0 && pair.a === 1;
        gate.innerHTML = `
          <div class="flex items-center space-x-1.5 opacity-60">
            <div class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center font-bold text-xs">${isFirstHint ? '1' : '?'}</div>
            <div class="w-2.5 h-0.5 bg-slate-800"></div>
            <span class="text-xs font-bold text-slate-700">×</span>
            <div class="w-2.5 h-0.5 bg-slate-800"></div>
            <div class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">?</div>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-slate-700 text-xs">= ${target}</span>
            <span class="text-[8px] uppercase text-slate-600 font-bold">PAIR ${idx + 1}</span>
          </div>
        `;
      }

      container.appendChild(gate);
    });

    // Render Factor Rainbow Arches SVG (highlighting shared factors in gold!)
    this.renderRainbowArches(lock, target, allPairs, unlocked, sharedSet);
  }

  renderRainbowArches(lock, target, allPairs, unlocked, sharedSet = new Set()) {
    const svgEl = lock === 'A' ? this.dom.lockARainbowSvg : this.dom.lockBRainbowSvg;
    if (!svgEl) return;

    const allFactors = getAllFactorsSorted(target);
    if (allFactors.length === 0) return;

    const svgWidth = 300;
    const paddingX = 22;
    const availableWidth = svgWidth - paddingX * 2;
    const total = allFactors.length;
    const step = total > 1 ? availableWidth / (total - 1) : availableWidth / 2;
    const baselineY = 46;

    const factorPositions = new Map();
    allFactors.forEach((f, idx) => {
      factorPositions.set(f, paddingX + idx * step);
    });

    const rainbowColors = [
      '#06b6d4', // cyan
      '#f59e0b', // amber
      '#10b981', // emerald
      '#ec4899', // pink
      '#8b5cf6', // purple
      '#3b82f6', // blue
    ];

    let svgContent = '';

    // Render Arches for unlocked pairs
    unlocked.forEach((pair, idx) => {
      const x1 = factorPositions.get(pair.a) ?? paddingX;
      const x2 = factorPositions.get(pair.b) ?? paddingX;
      const midX = (x1 + x2) / 2;
      const distance = Math.abs(x2 - x1);
      const strokeColor = rainbowColors[idx % rainbowColors.length];

      if (pair.isSquare || distance === 0) {
        svgContent += `
          <line x1="${x1}" y1="${baselineY}" x2="${x1}" y2="${baselineY - 26}" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="${x1}" cy="${baselineY - 26}" r="3.5" fill="${strokeColor}" stroke="#030712" stroke-width="1.5" />
        `;
      } else {
        const archHeight = Math.max(10, (distance / availableWidth) * 32);
        const apexY = baselineY - archHeight;

        svgContent += `
          <path d="M ${x1} ${baselineY} Q ${midX} ${apexY} ${x2} ${baselineY}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-opacity="0.3" stroke-linecap="round" />
          <path d="M ${x1} ${baselineY} Q ${midX} ${apexY} ${x2} ${baselineY}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
          <circle cx="${midX}" cy="${apexY}" r="2.5" fill="${strokeColor}" stroke="#030712" stroke-width="1" />
        `;
      }
    });

    // Render baseline ticks & numbers (Gold halo if shared between Dial A & Dial B!)
    allFactors.forEach((factor) => {
      const x = factorPositions.get(factor) ?? paddingX;
      const isDiscovered = unlocked.some((p) => p.a === factor || p.b === factor);
      const isShared = sharedSet.has(factor);

      const dotColor = isShared
        ? '#fbbf24'
        : isDiscovered
        ? lock === 'A'
          ? '#06b6d4'
          : '#f59e0b'
        : '#334155';

      svgContent += `
        ${isShared ? `<circle cx="${x}" cy="${baselineY}" r="6" fill="rgba(251, 191, 36, 0.28)" />` : ''}
        <circle cx="${x}" cy="${baselineY}" r="${isShared ? '3.5' : '2.5'}" fill="${dotColor}" stroke="#0f172a" stroke-width="1" />
        <text x="${x}" y="${baselineY + 13}" text-anchor="middle" font-size="${isShared ? '10' : '9'}" font-weight="${isDiscovered ? '800' : '500'}" font-family="'JetBrains Mono', monospace" fill="${isShared ? '#fde047' : isDiscovered ? '#f8fafc' : '#64748b'}">
          ${isDiscovered ? factor : '?'}
        </text>
      `;
    });

    svgEl.innerHTML = svgContent;
  }

  submitFactorPairInput() {
    if (!this.slot1) {
      this.setActiveSlot(1);
      this.showFeedback('Click a Pin Tile or type Factor 1 first.', 'warning');
      return;
    }

    if (!this.slot2) {
      this.setActiveSlot(2);
      this.showFeedback(`Factor 1 (${this.slot1}) ready. Click or type Factor 2!`, 'info');
      return;
    }

    const vault = this.getActiveVault();
    const target = this.activeLock === 'A' ? vault.numA : vault.numB;
    const currentUnlocked = this.activeLock === 'A' ? this.unlockedPairsA : this.unlockedPairsB;

    const result = validateFactorPair(target, this.slot1, this.slot2, currentUnlocked);

    if (result.isValid && result.pair) {
      if (result.isAlreadyFound) {
        soundEngine.playClick();
        this.showFeedback(result.message, 'warning');
        this.clearInput();
        return;
      }

      // Valid new pair!
      if (result.pair.isSquare) {
        soundEngine.playSquareLock();
      } else {
        soundEngine.playTumblerLock();
      }

      if (this.activeLock === 'A') {
        this.unlockedPairsA.push(result.pair);
      } else {
        this.unlockedPairsB.push(result.pair);
      }

      // Spark burst at active wheel
      const activeWheel = this.activeLock === 'A' ? this.dom.lockAWheel : this.dom.lockBWheel;
      if (activeWheel) {
        const rect = activeWheel.getBoundingClientRect();
        this.spawnParticles(
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
          this.activeLock === 'A' ? '#22d3ee' : '#fbbf24',
          18
        );
      }

      // Check if any NEW Shared Common Factors were just linked between Dial A and Dial B!
      const currentShared = getDiscoveredCommonFactors(this.unlockedPairsA, this.unlockedPairsB);
      const newlyShared = currentShared.filter((f) => !this.knownSharedFactors.has(f));
      newlyShared.forEach((f) => this.knownSharedFactors.add(f));

      // Re-render both locks (so shared gold highlights update on both!) + bridge + tiles
      this.renderLockPairs('A');
      this.renderLockPairs('B');
      this.renderSharedBridge(newlyShared);

      // Reset inputs for next pair
      this.slot1 = '';
      this.slot2 = '';
      this.setActiveSlot(1);
      this.updateSlotDisplays();
      this.renderPinTiles();

      // Score & Combo scaling
      let points = 75 * this.combo;
      if (newlyShared.length > 0) {
        points += 100 * newlyShared.length;
        this.spawnLaserBridge();
        soundEngine.playSquareLock();
      }
      this.score += points;
      this.combo = Math.min(16, this.combo === 1 ? 2 : this.combo * 2);
      this.dom.scoreDisplay.textContent = this.score;
      this.dom.comboDisplay.textContent = `x${this.combo}`;

      if (newlyShared.length > 0) {
        this.showFeedback(
          `${result.message} 🔗 SHARED FACTOR LINKED: [${newlyShared.join(', ')}] locked into GCF Bridge!`,
          'success'
        );
      } else {
        this.showFeedback(result.message, 'success');
      }

      // Check completion of locks
      const allPairsA = getFactorPairs(vault.numA);
      const allPairsB = getFactorPairs(vault.numB);

      const isCompletedA = this.unlockedPairsA.length >= allPairsA.length;
      const isCompletedB = this.unlockedPairsB.length >= allPairsB.length;

      if (isCompletedA && isCompletedB) {
        // Both dials synchronized! Activate Master GCF Strike right in the Center Vault Core!
        soundEngine.playVictoryFanfare();
        this.showFeedback(
          `⚡ BOTH DIALS CRACKED! Shared Common Factors: [${currentShared.join(', ')}]. Select the GREATEST Common Factor to breach!`,
          'success'
        );
        setTimeout(() => this.enterPhase3(), 550);
      } else if (this.activeLock === 'A' && isCompletedA) {
        setTimeout(() => {
          this.setActiveLock('B');
          this.showFeedback(
            `Dial A (${vault.numA}) complete! Now crack Dial B (${vault.numB}) to link shared factors!`,
            'info'
          );
        }, 300);
      } else if (this.activeLock === 'B' && isCompletedB) {
        setTimeout(() => {
          this.setActiveLock('A');
          this.showFeedback(
            `Dial B (${vault.numB}) complete! Now crack Dial A (${vault.numA}) to link shared factors!`,
            'info'
          );
        }, 300);
      }
    } else {
      // Mechanical Jam / Error
      soundEngine.playJamBuzz();
      this.triggerScreenShake();
      this.combo = 1;
      this.dom.comboDisplay.textContent = 'x1';

      const sector = this.getActiveSector();
      this.alarmLevel = Math.min(100, this.alarmLevel + (sector.alarmPerError || 25));
      this.updateAlarmDisplay();

      this.showFeedback(result.message, 'error');

      // Clear slot 2 so student can immediately click the right partner
      this.slot2 = '';
      this.setActiveSlot(2);
      this.updateSlotDisplays();

      if (this.alarmLevel >= 100) {
        this.triggerLockdown('ALARM_THRESHOLD');
      }
    }
  }

  /**
   * Activates Master GCF Torque Strike right inside the Center Column (No screen wipe!)
   */
  enterPhase3() {
    this.phase = 3;
    soundEngine.playLaserScan();
    this.spawnLaserBridge();

    const vault = this.getActiveVault();
    const common = getCommonFactors(vault.numA, vault.numB);

    // Swap center bottom deck to Master GCF Strike
    this.dom.pairCrackingDeck.classList.add('hidden');
    this.dom.gcfStrikeDeck.classList.remove('hidden');
    this.dom.sharedBridgePanel.className =
      'bg-slate-900/95 border-2 border-amber-400 rounded-xl p-2.5 glow-gold transition-all';

    this.dom.p3TargetA.textContent = vault.numA;
    this.dom.p3TargetB.textContent = vault.numB;
    this.selectedKey = null;

    this.dom.torqueStatusLabel.textContent = 'HYDRAULIC GCF TORQUE OUTPUT';
    this.dom.p3TorqueGauge.style.width = '0%';
    this.dom.p3TorqueText.textContent = '0% Torque';
    this.dom.p3StrikeBtn.disabled = true;
    this.dom.p3StatusBanner.className =
      'p-2 rounded-xl border border-slate-800 bg-slate-900/90 text-[11px] font-bold text-slate-300 min-h-[38px] flex items-center justify-center';
    this.dom.p3StatusBanner.textContent = `Shared Factors of ${vault.numA} & ${vault.numB}: [${common.join(', ')}]. Click the GREATEST one!`;

    this.dom.p3KeysContainer.innerHTML = '';
    common.forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'key-pedestal-btn px-4 py-2.5 rounded-xl border-2 border-amber-500/60 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono-math font-black text-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer shadow-lg active:scale-95';
      btn.innerHTML = `
        <span class="text-[10px] leading-none mb-0.5">🔑</span>
        <span>${key}</span>
      `;

      btn.addEventListener('click', () => {
        soundEngine.playTumblerClick();
        document.querySelectorAll('.key-pedestal-btn').forEach((b) => {
          b.className =
            'key-pedestal-btn px-4 py-2.5 rounded-xl border-2 border-amber-500/60 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono-math font-black text-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer shadow-lg active:scale-95';
        });

        btn.className =
          'key-pedestal-btn px-4 py-2.5 rounded-xl border-2 border-white bg-gradient-to-b from-yellow-300 to-amber-500 text-slate-950 font-mono-math font-black text-xl flex flex-col items-center justify-center transition-all duration-150 shadow-[0_0_20px_rgba(245,158,11,0.8)] scale-105';
        this.selectedKey = key;
        this.dom.p3StrikeBtn.disabled = false;

        // Live preview of factoring breakdown on key select
        const quotA = vault.numA / key;
        const quotB = vault.numB / key;
        this.dom.gcfFactoringReadout.classList.remove('hidden');
        this.dom.gcfFactoringReadout.textContent = `Key ${key}: ${vault.numA} = ${key} × ${quotA}  |  ${vault.numB} = ${key} × ${quotB}`;
      });

      this.dom.p3KeysContainer.appendChild(btn);
    });
  }

  executeMasterKeyStrike() {
    if (this.selectedKey === null) return;

    const vault = this.getActiveVault();
    const evaluation = evaluateMasterKeySelection(this.selectedKey, vault.numA, vault.numB);

    const torquePct = Math.round(evaluation.torqueRatio * 100);
    this.dom.p3TorqueGauge.style.width = `${torquePct}%`;
    this.dom.p3TorqueText.textContent = `${torquePct}% Torque`;

    if (evaluation.isGCF) {
      clearInterval(this.timerInterval);
      soundEngine.playTorqueStrikeSuccess();
      this.triggerScreenShake();
      this.spawnLaserBridge();

      const timeBonus = this.timeRemaining * 10;
      this.score += 200 * this.combo + timeBonus;
      this.dom.scoreDisplay.textContent = this.score;

      this.dom.gcfFactoringReadout.classList.remove('hidden');
      this.dom.gcfFactoringReadout.textContent = `✓ GCF EXTRACTED: ${evaluation.distributiveBreakdown}`;

      this.dom.p3StatusBanner.className =
        'p-2 rounded-xl border border-emerald-500/80 bg-emerald-950/90 text-emerald-200 font-bold text-[11px]';
      this.dom.p3StatusBanner.textContent = evaluation.feedback;
      this.showFeedback(evaluation.feedback, 'success');

      setTimeout(() => {
        this.enterPhase4(evaluation);
      }, 1100);
    } else {
      soundEngine.playTorqueInsufficient();
      this.triggerScreenShake();
      this.combo = 1;
      this.dom.comboDisplay.textContent = 'x1';

      this.dom.p3StatusBanner.className =
        'p-2 rounded-xl border border-rose-500/80 bg-rose-950/90 text-rose-200 font-bold text-[11px]';
      this.dom.p3StatusBanner.textContent = evaluation.feedback;
      this.showFeedback(evaluation.feedback, 'error');
    }
  }

  enterPhase4(evaluation) {
    this.phase = 4;
    this.dom.phase4Container.classList.remove('hidden');
    soundEngine.playVictoryFanfare();

    if (this.canvas) {
      this.spawnParticles(this.canvas.width / 2, this.canvas.height / 2, '#10b981', 45);
    }

    const sector = this.getActiveSector();
    const vault = this.getActiveVault();
    const gcf = getGCF(vault.numA, vault.numB);
    const common = getCommonFactors(vault.numA, vault.numB);
    const quotA = vault.numA / gcf;
    const quotB = vault.numB / gcf;

    if (sector.isBossSector && vault.bossDilemmas) {
      this.dom.p4Title.textContent = 'MASTER OVERRIDE CONFIRMED: BOSS DILEMMA!';
      this.dom.p4Summary.textContent = `Blast doors breached at GCF(${vault.numA}, ${vault.numB}) = ${gcf}. Complete the final security override:`;
      this.renderBossDilemma(vault.bossDilemmas[0]);
    } else {
      this.dom.p4Title.textContent = `VAULT BREACHED! GCF(${vault.numA}, ${vault.numB}) = ${gcf}`;
      this.dom.p4Summary.textContent = `${vault.vaultName} cracked with ${this.timeRemaining}s remaining!`;
      this.dom.p4DilemmaContainer.innerHTML = `
        <div class="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 text-left space-y-2 max-w-md mx-auto font-mono-math text-xs">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-slate-400">Common Factors:</span>
            <span class="font-bold text-amber-300">[${common.join(', ')}]</span>
          </div>
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-slate-400">Greatest Common Factor:</span>
            <span class="font-black text-emerald-400 text-base">GCF = ${gcf}</span>
          </div>
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-slate-400">Factored Dials:</span>
            <span class="text-cyan-300">${vault.numA} = <strong>${gcf}</strong>×${quotA} &nbsp;|&nbsp; ${vault.numB} = <strong>${gcf}</strong>×${quotB}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-slate-400">Distributive Form:</span>
            <span class="text-emerald-300 font-bold">${vault.numA} + ${vault.numB} = ${gcf}(${quotA} + ${quotB})</span>
          </div>
        </div>
      `;
      this.dom.p4NextBtn.disabled = false;
      this.dom.p4NextBtn.textContent = 'NEXT VAULT SECTOR (ENTER) →';
    }
  }

  renderBossDilemma(dilemma) {
    this.dom.p4DilemmaContainer.innerHTML = `
      <div class="bg-slate-900/95 p-4 rounded-2xl border-2 border-indigo-500/60 max-w-xl mx-auto space-y-3 text-left">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-black uppercase text-indigo-400">${dilemma.title}</span>
          <span class="text-[10px] font-mono-math text-slate-400 font-bold">Boss Protocol</span>
        </div>
        <p class="text-xs text-slate-200 font-medium">${dilemma.prompt}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1" id="boss-options-grid">
          ${dilemma.options
            .map(
              (opt) => `
            <button class="boss-opt-btn p-3 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-white font-mono-math font-black text-lg transition-all cursor-pointer" data-val="${opt}">
              ${opt}
            </button>
          `
            )
            .join('')}
        </div>
        <div id="boss-feedback" class="hidden p-2 rounded-xl text-xs font-bold"></div>
      </div>
    `;

    this.dom.p4NextBtn.textContent = '★ CLAIM VICTORY & RETURN TO TOWN';
    this.dom.p4NextBtn.disabled = true;

    document.querySelectorAll('.boss-opt-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.dataset.val, 10);
        const feedbackEl = document.getElementById('boss-feedback');
        feedbackEl.classList.remove('hidden');

        if (val === dilemma.correctAnswer) {
          soundEngine.playVictoryFanfare();
          feedbackEl.className =
            'p-2.5 rounded-xl border border-emerald-500/70 bg-emerald-950/80 text-emerald-300 text-xs font-bold';
          feedbackEl.textContent = `⭐ CONFIRMED: ${dilemma.diagnosticExplanation}`;
          this.score += 500;
          this.dom.scoreDisplay.textContent = this.score;
          this.dom.p4NextBtn.disabled = false;
        } else {
          soundEngine.playJamBuzz();
          this.triggerScreenShake();
          feedbackEl.className =
            'p-2.5 rounded-xl border border-rose-500/70 bg-rose-950/80 text-rose-300 text-xs font-bold';
          feedbackEl.textContent = `⛔ REJECTED: Not the greatest common clearance. Re-check factors!`;
        }
      });
    });
  }

  showFeedback(text, type = 'info') {
    this.dom.feedbackText.textContent = text;
    this.dom.feedbackBanner.className =
      'p-2 rounded-xl border flex items-center justify-between text-xs font-bold transition-all duration-300 shrink-0 mb-2';

    if (type === 'success') {
      this.dom.feedbackBanner.classList.add('bg-emerald-950/85', 'border-emerald-500/70', 'text-emerald-200');
      this.dom.feedbackIcon.textContent = '✅';
    } else if (type === 'error') {
      this.dom.feedbackBanner.classList.add('bg-rose-950/85', 'border-rose-500/70', 'text-rose-200');
      this.dom.feedbackIcon.textContent = '⛔';
    } else if (type === 'warning') {
      this.dom.feedbackBanner.classList.add('bg-amber-950/85', 'border-amber-500/70', 'text-amber-200');
      this.dom.feedbackIcon.textContent = '⚠️';
    } else {
      this.dom.feedbackBanner.classList.add('bg-slate-900/90', 'border-cyan-500/50', 'text-cyan-200');
      this.dom.feedbackIcon.textContent = 'ℹ️';
    }
  }

  triggerScreenShake() {
    this.dom.root.classList.add('shake-active');
    setTimeout(() => {
      this.dom.root.classList.remove('shake-active');
    }, 450);
  }

  triggerLockdown(reason) {
    this.isLockdown = true;
    clearInterval(this.timerInterval);
    soundEngine.playAlarmSiren();
    this.triggerScreenShake();

    const vault = this.getActiveVault();
    const common = getCommonFactors(vault.numA, vault.numB);
    const gcf = getGCF(vault.numA, vault.numB);

    const reasonText =
      reason === 'TIME_EXPIRED'
        ? `Lockdown triggered: Timer expired before the vault was breached!`
        : `Lockdown triggered: Security alarm hit 100% from non-factor jams!`;

    this.dom.lockdownDiagText.innerHTML = `
      <p class="font-bold text-rose-300 mb-2 text-xs">${reasonText}</p>
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <p><strong>Target Dials:</strong> Dial A (${vault.numA}) &amp; Dial B (${vault.numB})</p>
        <p><strong>Key Concept:</strong> ${vault.conceptHint}</p>
        <p><strong>Shared Keys:</strong> [${common.join(', ')}] &rarr; <strong>GCF = ${gcf}</strong></p>
      </div>
    `;

    this.dom.lockdownModal.classList.remove('hidden');
  }

  instantRetry() {
    this.dom.lockdownModal.classList.add('hidden');
    this.isLockdown = false;
    this.loadSectorAndVault(this.sectorIndex, this.vaultIndex);
  }

  advanceToNextVault() {
    const sector = this.getActiveSector();
    if (this.vaultIndex < sector.vaults.length - 1) {
      this.loadSectorAndVault(this.sectorIndex, this.vaultIndex + 1);
    } else if (this.sectorIndex < CURRICULUM_SECTORS.length - 1) {
      this.loadSectorAndVault(this.sectorIndex + 1, 0);
    } else {
      // Completed all 5 sectors and Dreadnought Boss! Save run to Town!
      this.completeCartridgeRun();
    }
  }

  completeCartridgeRun() {
    clearInterval(this.timerInterval);
    soundEngine.playVictoryFanfare();

    const isBossCleared = this.sectorIndex >= CURRICULUM_SECTORS.length - 1;
    const totalVaults = CURRICULUM_SECTORS.reduce((acc, s) => acc + s.vaults.length, 0);

    try {
      window.parent.postMessage(
        {
          type: 'CARTRIDGE_COMPLETE',
          payload: {
            lessonId: 'G06_U03_L02',
            score: Math.max(1, this.score),
            total: Math.max(10, totalVaults * 100),
            sectorIndex: this.sectorIndex,
            vaultIndex: this.vaultIndex,
            bossDefeated: isBossCleared,
          },
        },
        '*'
      );
    } catch (e) {
      console.warn('Could not post CARTRIDGE_COMPLETE to parent:', e);
    }
  }
}

// Instantiate and start once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new VaultBreakerGame();
  game.init();
});
