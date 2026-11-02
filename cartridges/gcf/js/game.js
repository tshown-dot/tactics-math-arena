/**
 * Vault Breaker: GCF Tumbler - Main Cartridge Game Engine
 * Strictly aligns with Core Game Design Pillars:
 * 1. Natural Safe-Cracking Tumbler mechanics:
 *    Students must explicitly deduce and enter BOTH numbers in each factor pair (a × b = Target).
 * 2. Real Stakes: Countdown timer, alarm threshold, screen shake, <2s instant retry loop.
 * 3. Reinforce & Extend: Progressive sectors, co-prime traps, and Sector 5 Boss Dilemmas.
 * 4. Tactile Juice: Web Audio API synthesis, combo scaling (x1, x2, x4, x8), neon glows.
 * 5. Chromebook-Native: 1366x768 single-screen, zero scrolling, offline localStorage.
 */

import {
  parseMathInput,
  getFactorPairs,
  getAllFactorsSorted,
  getCommonFactors,
  getGCF,
  get3WayGCF,
  validateFactor,
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
    // 1: Cracking Lock A & B factor pairs (explicit pair input)
    // 2: Laser Alignment sweep (shared factors)
    // 3: Master Key Torque Strike (GCF)
    // 4: Boss Dilemma / Vault Loot Victory
    this.phase = 1;

    // Active lock selection: 'A' or 'B'
    this.activeLock = 'A';

    // Unlocked pairs per lock: [{a, b, isSquare}]
    this.unlockedPairsA = [];
    this.unlockedPairsB = [];

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

    // Juice & Progression
    this.score = 0;
    this.combo = 1;

    // Cache DOM references
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.loadSectorAndVault(0, 0);
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
    this.dom.audioToggleBtn = document.getElementById('audio-toggle-btn');
    this.dom.audioIcon = document.getElementById('audio-icon');
    this.dom.fieldGuideBtn = document.getElementById('field-guide-btn');
    this.dom.fieldGuideModal = document.getElementById('field-guide-modal');
    this.dom.closeGuideBtn = document.getElementById('close-guide-btn');

    // Phase Containers
    this.dom.phase1Container = document.getElementById('phase-1-container');
    this.dom.phase2Container = document.getElementById('phase-2-container');
    this.dom.phase3Container = document.getElementById('phase-3-container');
    this.dom.phase4Container = document.getElementById('phase-4-container');
    this.dom.lockdownModal = document.getElementById('lockdown-modal');

    // Phase 1 Lock A
    this.dom.lockACard = document.getElementById('lock-a-card');
    this.dom.lockANumber = document.getElementById('lock-a-number');
    this.dom.lockAPairsContainer = document.getElementById('lock-a-pairs');
    this.dom.lockAProgress = document.getElementById('lock-a-progress');
    this.dom.lockAWheel = document.getElementById('lock-a-wheel');
    this.dom.lockADialStatus = document.getElementById('lock-a-dial-status');
    this.dom.lockARainbowSvg = document.getElementById('lock-a-rainbow-svg');
    this.dom.lockARainbowTarget = document.getElementById('lock-a-rainbow-target');

    // Phase 1 Lock B
    this.dom.lockBCard = document.getElementById('lock-b-card');
    this.dom.lockBNumber = document.getElementById('lock-b-number');
    this.dom.lockBPairsContainer = document.getElementById('lock-b-pairs');
    this.dom.lockBProgress = document.getElementById('lock-b-progress');
    this.dom.lockBWheel = document.getElementById('lock-b-wheel');
    this.dom.lockBDialStatus = document.getElementById('lock-b-dial-status');
    this.dom.lockBRainbowSvg = document.getElementById('lock-b-rainbow-svg');
    this.dom.lockBRainbowTarget = document.getElementById('lock-b-rainbow-target');

    // Target Selection Tabs
    this.dom.tabLockA = document.getElementById('tab-lock-a');
    this.dom.tabLockB = document.getElementById('tab-lock-b');

    // Dual-Slot Factor Pair Inputs
    this.dom.slot1Btn = document.getElementById('slot-1-btn');
    this.dom.slot1Display = document.getElementById('slot-1-display');
    this.dom.slot2Btn = document.getElementById('slot-2-btn');
    this.dom.slot2Display = document.getElementById('slot-2-display');
    this.dom.nextSlotBtn = document.getElementById('keypad-next-slot-btn');

    // Keypad & Feedback
    this.dom.feedbackBanner = document.getElementById('feedback-banner');
    this.dom.feedbackIcon = document.getElementById('feedback-icon');
    this.dom.feedbackText = document.getElementById('feedback-text');

    // Phase 2 Elements
    this.dom.laserScanBeam = document.getElementById('laser-scan-beam');
    this.dom.p2FactorsA = document.getElementById('p2-factors-a');
    this.dom.p2FactorsB = document.getElementById('p2-factors-b');
    this.dom.p2SharedKeys = document.getElementById('p2-shared-keys');
    this.dom.p2ProceedBtn = document.getElementById('p2-proceed-btn');

    // Phase 3 Elements
    this.dom.p3TargetA = document.getElementById('p3-target-a');
    this.dom.p3TargetB = document.getElementById('p3-target-b');
    this.dom.p3KeysContainer = document.getElementById('p3-keys-container');
    this.dom.p3StrikeBtn = document.getElementById('p3-strike-btn');
    this.dom.p3TorqueGauge = document.getElementById('p3-torque-gauge');
    this.dom.p3TorqueText = document.getElementById('p3-torque-text');

    // Phase 4 Elements
    this.dom.p4Title = document.getElementById('p4-title');
    this.dom.p4Summary = document.getElementById('p4-summary');
    this.dom.p4DilemmaContainer = document.getElementById('p4-dilemma-container');
    this.dom.p4NextBtn = document.getElementById('p4-next-btn');

    // Lockdown retry
    this.dom.retryBtn = document.getElementById('lockdown-retry-btn');
    this.dom.lockdownDiagText = document.getElementById('lockdown-diag-text');
  }

  bindEvents() {
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

    // Keypad digits & buttons
    document.querySelectorAll('.keypad-digit-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.dataset.val;
        soundEngine.playTumblerClick();
        this.appendKeypadInput(val);
      });
    });

    const clearBtn = document.getElementById('keypad-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.clearInput();
      });
    }

    const backspaceBtn = document.getElementById('keypad-backspace-btn');
    if (backspaceBtn) {
      backspaceBtn.addEventListener('click', () => {
        soundEngine.playClick();
        this.backspaceInput();
      });
    }

    const testBtn = document.getElementById('keypad-test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.submitFactorPairInput();
      });
    }

    // Quick Factor Preset Pills (1, 2, 3, 4, 5, 6)
    document.querySelectorAll('.factor-quick-pill').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = e.currentTarget.dataset.val;
        soundEngine.playTumblerClick();
        this.handleQuickPill(val);
      });
    });

    // Phase 2 Proceed to Strike
    this.dom.p2ProceedBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.enterPhase3();
    });

    // Phase 3 Strike Button
    this.dom.p3StrikeBtn.addEventListener('click', () => {
      this.executeMasterKeyStrike();
    });

    // Phase 4 Next Vault / Replay Button
    this.dom.p4NextBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.advanceToNextVault();
    });

    // Instant Retry on Lockdown
    this.dom.retryBtn.addEventListener('click', () => {
      soundEngine.playClick();
      this.instantRetry();
    });

    // Physical Keyboard Listener
    window.addEventListener('keydown', (e) => {
      if (this.isLockdown) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.instantRetry();
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

    // Setup Phase 1 UI
    this.dom.lockANumber.textContent = vault.numA;
    this.dom.lockBNumber.textContent = vault.numB;
    this.dom.tabLockA.querySelector('.tab-label').textContent = `Lock A (${vault.numA})`;
    this.dom.tabLockB.querySelector('.tab-label').textContent = `Lock B (${vault.numB})`;

    this.renderLockPairs('A');
    this.renderLockPairs('B');
    this.setActiveLock('A');
    this.setActiveSlot(1);
    this.updateSlotDisplays();

    this.showFeedback(
      `Crack Lock A (${vault.numA}) and Lock B (${vault.numB})! Enter factor pairs (Factor 1 × Factor 2).`,
      'info'
    );

    // Switch view containers
    this.showPhaseContainer(1);
    this.dom.lockdownModal.classList.add('hidden');

    // Start timer
    this.startTimer();
  }

  showPhaseContainer(phaseNumber) {
    this.phase = phaseNumber;
    this.dom.phase1Container.classList.toggle('hidden', phaseNumber !== 1);
    this.dom.phase2Container.classList.toggle('hidden', phaseNumber !== 2);
    this.dom.phase3Container.classList.toggle('hidden', phaseNumber !== 3);
    this.dom.phase4Container.classList.toggle('hidden', phaseNumber !== 4);
  }

  startTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.isLockdown) return;

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
    this.activeLock = lock;
    soundEngine.playClick();

    if (lock === 'A') {
      this.dom.tabLockA.className = 'flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase bg-cyan-500 text-slate-950 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all cursor-pointer';
      this.dom.tabLockB.className = 'flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer';
      this.dom.lockACard.classList.add('border-cyan-400', 'glow-cyan');
      this.dom.lockBCard.classList.remove('border-amber-400', 'glow-amber');
    } else {
      this.dom.tabLockB.className = 'flex-1 py-1.5 px-3 rounded-xl font-black text-xs uppercase bg-amber-400 text-slate-950 border-2 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all cursor-pointer';
      this.dom.tabLockA.className = 'flex-1 py-1.5 px-3 rounded-xl font-bold text-xs uppercase bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer';
      this.dom.lockBCard.classList.add('border-amber-400', 'glow-amber');
      this.dom.lockACard.classList.remove('border-cyan-400', 'glow-cyan');
    }
  }

  setActiveSlot(slotNum) {
    this.activeSlot = slotNum;
    soundEngine.playClick();

    if (slotNum === 1) {
      this.dom.slot1Btn.className = 'flex-1 py-1 px-2.5 rounded-lg border-2 border-amber-400 bg-amber-950/40 text-amber-300 font-mono-math font-black text-xl flex items-center justify-between glow-amber transition-all cursor-pointer';
      this.dom.slot2Btn.className = 'flex-1 py-1 px-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 font-mono-math font-black text-xl flex items-center justify-between transition-all cursor-pointer';
    } else {
      this.dom.slot2Btn.className = 'flex-1 py-1 px-2.5 rounded-lg border-2 border-amber-400 bg-amber-950/40 text-amber-300 font-mono-math font-black text-xl flex items-center justify-between glow-amber transition-all cursor-pointer';
      this.dom.slot1Btn.className = 'flex-1 py-1 px-2.5 rounded-lg border border-slate-700 bg-slate-950 text-slate-400 font-mono-math font-black text-xl flex items-center justify-between transition-all cursor-pointer';
    }
  }

  switchSlot() {
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
    if (this.activeSlot === 2 && this.slot2) {
      this.slot2 = '';
    } else {
      this.slot1 = '';
      this.slot2 = '';
      this.activeSlot = 1;
      this.setActiveSlot(1);
    }
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

  handleQuickPill(val) {
    if (this.activeSlot === 1) {
      this.slot1 = val;
      this.updateSlotDisplays();
      this.setActiveSlot(2);
    } else {
      this.slot2 = val;
      this.updateSlotDisplays();
      this.submitFactorPairInput();
    }
  }

  updateSlotDisplays() {
    this.dom.slot1Display.textContent = this.slot1 || '_';
    this.dom.slot2Display.textContent = this.slot2 || '_';
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

    const isComplete = unlocked.length >= allPairs.length;
    progressEl.textContent = `${unlocked.length} / ${allPairs.length} Pairs`;
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
        gate.innerHTML = `
          <div class="flex items-center space-x-1.5">
            <div class="w-6 h-6 rounded-lg ${lock === 'A' ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200' : 'bg-amber-900/80 border-amber-400 text-amber-200'} border flex items-center justify-center font-black text-xs shadow-sm">
              ${pair.a}
            </div>
            <div class="w-2.5 h-0.5 ${lock === 'A' ? 'bg-cyan-400' : 'bg-amber-400'}"></div>
            <span class="text-xs font-black ${lock === 'A' ? 'text-cyan-400' : 'text-amber-400'}">×</span>
            <div class="w-2.5 h-0.5 ${lock === 'A' ? 'bg-cyan-400' : 'bg-amber-400'}"></div>
            <div class="w-6 h-6 rounded-lg ${lock === 'A' ? 'bg-cyan-900/80 border-cyan-400 text-cyan-200' : 'bg-amber-900/80 border-amber-400 text-amber-200'} border flex items-center justify-center font-black text-xs shadow-sm">
              ${pair.b}
            </div>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-slate-400 text-xs">= ${target}</span>
            <span class="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300">
              ${pair.isSquare ? 'SQUARE' : 'ENGAGED'}
            </span>
          </div>
        `;
      } else {
        gate.innerHTML = `
          <div class="flex items-center space-x-1.5 opacity-50">
            <div class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">?</div>
            <div class="w-2.5 h-0.5 bg-slate-800"></div>
            <span class="text-xs font-bold text-slate-700">×</span>
            <div class="w-2.5 h-0.5 bg-slate-800"></div>
            <div class="w-6 h-6 rounded-lg bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center font-bold text-xs">?</div>
          </div>
          <div class="flex items-center space-x-1.5">
            <span class="font-bold text-slate-700 text-xs">= ${target}</span>
            <span class="text-[8px] uppercase text-slate-600 font-bold">GATE ${idx + 1}</span>
          </div>
        `;
      }

      container.appendChild(gate);
    });

    // Render Factor Rainbow Arches SVG
    this.renderRainbowArches(lock, target, allPairs, unlocked);
  }

  renderRainbowArches(lock, target, allPairs, unlocked) {
    const svgEl = lock === 'A' ? this.dom.lockARainbowSvg : this.dom.lockBRainbowSvg;
    if (!svgEl) return;

    const allFactors = getAllFactorsSorted(target);
    if (allFactors.length === 0) return;

    const targetLabel = lock === 'A' ? this.dom.lockARainbowTarget : this.dom.lockBRainbowTarget;
    if (targetLabel) targetLabel.textContent = target;

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
        // Vertical radiant beacon for square factor
        svgContent += `
          <line x1="${x1}" y1="${baselineY}" x2="${x1}" y2="${baselineY - 26}" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
          <circle cx="${x1}" cy="${baselineY - 26}" r="3.5" fill="${strokeColor}" stroke="#030712" stroke-width="1.5" />
        `;
      } else {
        const archHeight = Math.max(10, (distance / availableWidth) * 32);
        const apexY = baselineY - archHeight;

        svgContent += `
          <!-- Glow -->
          <path d="M ${x1} ${baselineY} Q ${midX} ${apexY} ${x2} ${baselineY}" fill="none" stroke="${strokeColor}" stroke-width="4" stroke-opacity="0.3" stroke-linecap="round" />
          <!-- Crisp arch line -->
          <path d="M ${x1} ${baselineY} Q ${midX} ${apexY} ${x2} ${baselineY}" fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" />
          <!-- Center product node -->
          <circle cx="${midX}" cy="${apexY}" r="2.5" fill="${strokeColor}" stroke="#030712" stroke-width="1" />
        `;
      }
    });

    // Render baseline ticks & numbers
    allFactors.forEach((factor) => {
      const x = factorPositions.get(factor) ?? paddingX;
      const isDiscovered = unlocked.some((p) => p.a === factor || p.b === factor);

      svgContent += `
        <circle cx="${x}" cy="${baselineY}" r="2.5" fill="${isDiscovered ? (lock === 'A' ? '#06b6d4' : '#f59e0b') : '#334155'}" stroke="#0f172a" stroke-width="1" />
        <text x="${x}" y="${baselineY + 13}" text-anchor="middle" font-size="9" font-weight="${isDiscovered ? '800' : '500'}" font-family="'JetBrains Mono', monospace" fill="${isDiscovered ? '#f8fafc' : '#64748b'}">
          ${isDiscovered ? factor : '?'}
        </text>
      `;
    });

    svgEl.innerHTML = svgContent;
  }

  submitFactorPairInput() {
    if (!this.slot1) {
      this.setActiveSlot(1);
      this.showFeedback('Enter Factor 1 first.', 'warning');
      return;
    }

    if (!this.slot2) {
      this.setActiveSlot(2);
      this.showFeedback(`Factor 1 (${this.slot1}) ready. Enter Factor 2 to complete the pair!`, 'info');
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
        this.renderLockPairs('A');
      } else {
        this.unlockedPairsB.push(result.pair);
        this.renderLockPairs('B');
      }

      // Reset inputs for next pair
      this.slot1 = '';
      this.slot2 = '';
      this.setActiveSlot(1);
      this.updateSlotDisplays();

      // Score & Combo scaling
      const points = 75 * this.combo;
      this.score += points;
      this.combo = Math.min(16, this.combo === 1 ? 2 : this.combo * 2);
      this.dom.scoreDisplay.textContent = this.score;
      this.dom.comboDisplay.textContent = `x${this.combo}`;

      this.showFeedback(result.message, 'success');

      // Check if current lock is complete
      const allPairsA = getFactorPairs(vault.numA);
      const allPairsB = getFactorPairs(vault.numB);

      const isCompletedA = this.unlockedPairsA.length >= allPairsA.length;
      const isCompletedB = this.unlockedPairsB.length >= allPairsB.length;

      if (isCompletedA && isCompletedB) {
        // Both locks cracked! Advance to Phase 2
        clearInterval(this.timerInterval);
        soundEngine.playVictoryFanfare();
        this.showFeedback('🎉 BOTH LOCKS CRACKED! Initializing Laser Alignment...', 'success');
        setTimeout(() => this.enterPhase2(), 1200);
      } else if (this.activeLock === 'A' && isCompletedA) {
        setTimeout(() => {
          this.setActiveLock('B');
          this.showFeedback(`Lock A fully cleared! Now crack Lock B (${vault.numB})!`, 'info');
        }, 400);
      } else if (this.activeLock === 'B' && isCompletedB) {
        setTimeout(() => {
          this.setActiveLock('A');
          this.showFeedback(`Lock B fully cleared! Now crack Lock A (${vault.numA})!`, 'info');
        }, 400);
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

      // Clear slot 2 so student can easily re-enter the correct partner
      this.slot2 = '';
      this.setActiveSlot(2);
      this.updateSlotDisplays();

      if (this.alarmLevel >= 100) {
        this.triggerLockdown('ALARM_THRESHOLD');
      }
    }
  }

  showFeedback(text, type = 'info') {
    this.dom.feedbackText.textContent = text;
    this.dom.feedbackBanner.className = 'p-2 rounded-xl border flex items-center space-x-2 text-xs font-bold transition-all duration-300 shrink-0 mb-2';

    if (type === 'success') {
      this.dom.feedbackBanner.classList.add('bg-emerald-950/80', 'border-emerald-500/70', 'text-emerald-200');
      this.dom.feedbackIcon.textContent = '✅';
    } else if (type === 'error') {
      this.dom.feedbackBanner.classList.add('bg-rose-950/80', 'border-rose-500/70', 'text-rose-200');
      this.dom.feedbackIcon.textContent = '⛔';
    } else if (type === 'warning') {
      this.dom.feedbackBanner.classList.add('bg-amber-950/80', 'border-amber-500/70', 'text-amber-200');
      this.dom.feedbackIcon.textContent = '⚠️';
    } else {
      this.dom.feedbackBanner.classList.add('bg-slate-900/80', 'border-cyan-500/50', 'text-cyan-200');
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

    let reasonText = '';
    if (reason === 'TIME_EXPIRED') {
      reasonText = `Lockdown triggered: Mission timer expired before tumblers were aligned!`;
    } else {
      reasonText = `Lockdown triggered: Security alarm exceeded 100% due to repeated mechanical jams!`;
    }

    this.dom.lockdownDiagText.innerHTML = `
      <p class="font-bold text-rose-300 mb-2">${reasonText}</p>
      <div class="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
        <p><strong>Target Dials:</strong> Lock A (${vault.numA}) and Lock B (${vault.numB})</p>
        <p><strong>Key Concept:</strong> ${vault.conceptHint}</p>
        <p><strong>Shared Keys:</strong> [${common.join(', ')}] | <strong>GCF:</strong> ${gcf}</p>
      </div>
    `;

    this.dom.lockdownModal.classList.remove('hidden');
  }

  instantRetry() {
    this.dom.lockdownModal.classList.add('hidden');
    this.isLockdown = false;
    this.loadSectorAndVault(this.sectorIndex, this.vaultIndex);
  }

  enterPhase2() {
    this.showPhaseContainer(2);
    soundEngine.playLaserScan();

    const vault = this.getActiveVault();
    const factorsA = getAllFactorsSorted(vault.numA);
    const factorsB = getAllFactorsSorted(vault.numB);
    const common = getCommonFactors(vault.numA, vault.numB);

    this.dom.p2SharedKeys.textContent = common.length;

    // Render Factors A
    this.dom.p2FactorsA.innerHTML = '';
    factorsA.forEach((f) => {
      const isShared = common.includes(f);
      const pill = document.createElement('div');
      pill.className = `p-2 rounded-xl text-center font-mono-math font-black text-sm border-2 transition-all duration-700 ${
        isShared
          ? 'bg-cyan-500 text-slate-950 border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] scale-105'
          : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 scale-95'
      }`;
      pill.textContent = f;
      this.dom.p2FactorsA.appendChild(pill);
    });

    // Render Factors B
    this.dom.p2FactorsB.innerHTML = '';
    factorsB.forEach((f) => {
      const isShared = common.includes(f);
      const pill = document.createElement('div');
      pill.className = `p-2 rounded-xl text-center font-mono-math font-black text-sm border-2 transition-all duration-700 ${
        isShared
          ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] scale-105'
          : 'bg-slate-900/60 border-slate-800 text-slate-600 opacity-40 scale-95'
      }`;
      pill.textContent = f;
      this.dom.p2FactorsB.appendChild(pill);
    });
  }

  enterPhase3() {
    this.showPhaseContainer(3);

    const vault = this.getActiveVault();
    const common = getCommonFactors(vault.numA, vault.numB);

    this.dom.p3TargetA.textContent = vault.numA;
    this.dom.p3TargetB.textContent = vault.numB;
    this.selectedKey = null;

    this.dom.p3TorqueGauge.style.width = '0%';
    this.dom.p3TorqueText.textContent = '0%';
    this.dom.p3StrikeBtn.disabled = true;

    this.dom.p3KeysContainer.innerHTML = '';
    common.forEach((key) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'key-pedestal-btn p-3.5 px-5 rounded-2xl border-2 border-amber-500/50 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono-math font-black text-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95';
      btn.innerHTML = `
        <span class="text-xs mb-1 opacity-70">🔑</span>
        <span>${key}</span>
        <span class="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-1">Torque Key</span>
      `;

      btn.addEventListener('click', () => {
        soundEngine.playTumblerClick();
        document.querySelectorAll('.key-pedestal-btn').forEach((b) => {
          b.className = 'key-pedestal-btn p-3.5 px-5 rounded-2xl border-2 border-amber-500/50 bg-slate-900 hover:bg-slate-800 text-amber-300 font-mono-math font-black text-2xl flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95';
        });

        btn.className = 'key-pedestal-btn p-3.5 px-5 rounded-2xl border-2 border-white bg-gradient-to-b from-yellow-300 to-amber-500 text-slate-950 font-mono-math font-black text-2xl flex flex-col items-center justify-center transition-all duration-200 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-110';
        this.selectedKey = key;
        this.dom.p3StrikeBtn.disabled = false;
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
    this.dom.p3TorqueText.textContent = `${torquePct}%`;

    const statusBanner = document.getElementById('p3-status-banner');

    if (evaluation.isGCF) {
      soundEngine.playTorqueStrikeSuccess();
      this.triggerScreenShake();
      this.score += 200 * this.combo;
      this.dom.scoreDisplay.textContent = this.score;

      statusBanner.className = 'p-3 rounded-xl border border-emerald-500/80 bg-emerald-950/80 text-emerald-200 font-bold text-xs';
      statusBanner.textContent = evaluation.feedback;

      setTimeout(() => {
        this.enterPhase4();
      }, 1200);
    } else {
      soundEngine.playTorqueInsufficient();
      this.triggerScreenShake();
      this.combo = 1;
      this.dom.comboDisplay.textContent = 'x1';

      statusBanner.className = 'p-3 rounded-xl border border-amber-500/80 bg-amber-950/80 text-amber-200 font-bold text-xs';
      statusBanner.textContent = evaluation.feedback;
    }
  }

  enterPhase4() {
    this.showPhaseContainer(4);
    soundEngine.playVictoryFanfare();

    const sector = this.getActiveSector();
    const vault = this.getActiveVault();
    const gcf = getGCF(vault.numA, vault.numB);
    const common = getCommonFactors(vault.numA, vault.numB);

    if (sector.isBossSector && vault.bossDilemmas) {
      // Boss Dilemma Phase
      this.dom.p4Title.textContent = 'MASTER OVERRIDE CONFIRMED: BOSS DILEMMA!';
      this.dom.p4Summary.textContent = `Blast doors breached at GCF ${gcf}. Solve the secondary authorization relay:`;
      this.renderBossDilemma(vault.bossDilemmas[0]);
    } else {
      // Standard Victory
      this.dom.p4Title.textContent = 'VAULT BREACHED: SECURITY ASSETS SECURED!';
      this.dom.p4Summary.textContent = `Greatest Common Factor ${gcf} successfully turned the blast locks of ${vault.numA} and ${vault.numB}.`;
      this.dom.p4DilemmaContainer.innerHTML = `
        <div class="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center space-y-2 max-w-md mx-auto">
          <div class="text-3xl">🏆</div>
          <div class="text-sm font-bold text-slate-300">Shared Factors: [${common.join(', ')}]</div>
          <div class="text-xl font-mono-math font-black text-amber-300">Supreme Key: ${gcf}</div>
        </div>
      `;
      this.dom.p4NextBtn.textContent = 'NEXT VAULT SECTOR →';
    }
  }

  renderBossDilemma(dilemma) {
    this.dom.p4DilemmaContainer.innerHTML = `
      <div class="bg-slate-950/90 p-4 rounded-2xl border-2 border-indigo-500/50 max-w-xl mx-auto space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <span class="text-xs font-black uppercase text-indigo-400">${dilemma.title}</span>
          <span class="text-[10px] font-mono-math text-slate-500 font-bold">Higher-Order Protocol</span>
        </div>
        <p class="text-xs text-slate-200 font-medium">${dilemma.prompt}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1" id="boss-options-grid">
          ${dilemma.options
            .map(
              (opt) => `
            <button class="boss-opt-btn p-3 rounded-xl border border-indigo-700/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-white font-mono-math font-black text-lg transition-all" data-val="${opt}">
              ${opt}
            </button>
          `
            )
            .join('')}
        </div>
        <div id="boss-feedback" class="hidden p-2 rounded-xl text-xs font-bold"></div>
      </div>
    `;

    this.dom.p4NextBtn.textContent = 'COMPLETE MISSION CLEAR';
    this.dom.p4NextBtn.disabled = true;

    document.querySelectorAll('.boss-opt-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const val = parseInt(e.currentTarget.dataset.val, 10);
        const feedbackEl = document.getElementById('boss-feedback');
        feedbackEl.classList.remove('hidden');

        if (val === dilemma.correctAnswer) {
          soundEngine.playVictoryFanfare();
          feedbackEl.className = 'p-2.5 rounded-xl border border-emerald-500/70 bg-emerald-950/80 text-emerald-300 text-xs font-bold';
          feedbackEl.textContent = `⭐ CONFIRMED: ${dilemma.diagnosticExplanation}`;
          this.score += 500;
          this.dom.scoreDisplay.textContent = this.score;
          this.dom.p4NextBtn.disabled = false;
        } else {
          soundEngine.playJamBuzz();
          this.triggerScreenShake();
          feedbackEl.className = 'p-2.5 rounded-xl border border-rose-500/70 bg-rose-950/80 text-rose-300 text-xs font-bold';
          feedbackEl.textContent = `⛔ REJECTED: Not the greatest common clearance. Re-check factors!`;
        }
      });
    });
  }

  advanceToNextVault() {
    const sector = this.getActiveSector();
    if (this.vaultIndex < sector.vaults.length - 1) {
      this.loadSectorAndVault(this.sectorIndex, this.vaultIndex + 1);
    } else if (this.sectorIndex < CURRICULUM_SECTORS.length - 1) {
      this.loadSectorAndVault(this.sectorIndex + 1, 0);
    } else {
      // Loop back or complete game
      try {
        window.parent.postMessage({
          type: 'CARTRIDGE_COMPLETE',
          payload: {
            lessonId: 'G07_U03_L02',
            score: Math.max(10, Math.round(this.score / 100)),
            total: 10,
            bossDefeated: true
          }
        }, '*');
      } catch (e) {}
      this.loadSectorAndVault(0, 0);
    }
  }
}

// Instantiate and start once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const game = new VaultBreakerGame();
  game.init();
});
