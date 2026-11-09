/**
 * Charge Runner: Exponent Reactor - Game Engine
 * Core Game Design Aligned:
 *   1. Combo & Scaling Progression (x1 -> x2 -> x4 -> x8 -> x16 combo chains)
 *   2. Real Stakes & Failure States (Active surge timer, Core health, Meltdown)
 *   3. Rapid Inline Misconception Feedback (<1.5s auto-retry, ZERO BLOCKING MODALS)
 *   4. Boss Climax Phase (Sector 5: Singularity Overcharge with Equivalence Dilemmas)
 *   5. Tactile Chromebook 1366x768 Station Flow (Canvas particle beam, screen shake, audio)
 */

import {
  CURRICULUM_SECTORS,
  calculatePower,
  diagnoseSubmission,
  prepareSteps,
  isBaseLocked,
  getGivenBase,
} from './curriculum.js';

import { soundManager } from './audio.js';

class ExponentReactorGame {
  constructor() {
    // Sector & Wave State
    this.sectorIndex = 0; // 0..4 (Sector 1..5)
    this.waveIndex = 0;   // 0..4 (5 waves per sector)

    // Modulator State
    this.base = 2;
    this.exponent = 3;
    this.isDischarging = false;
    this.isBaseLocked = false;

    // High Stakes & Health Metrics
    this.coreHealth = 100; // 0..100%
    this.maxLives = 3;     // 3 Emergency Backup Cores (Sector Retries)
    this.lives = 3;
    this.score = 0;
    this.totalWattsMitigated = 0;
    this.combo = 1;        // Scaling combo: 1, 2, 4, 8, 16
    this.maxCombo = 1;
    this.totalAttempts = 0;
    this.trapHits = 0;
    this.firstTryCorrect = 0;   // waves solved with no misses on that wave
    this.wavesCleared = 0;
    this.waveMisses = 0;        // misses on the current wave
    this.hintsUsed = 0;
    this.hintUsedThisWave = false;

    // Run / Station Timer
    this.shiftStartTime = Date.now();
    this.waveTimeRemaining = 30;
    this.waveTimerInterval = null;
    this.isPaused = false;
    this.isGameOver = false;

    // Diagnostic HUD Timer
    this.hudClearTimeout = null;

    // Briefing & Start State
    this.hasStarted = false;

    // Canvas & Particle Engine
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.coreRotation = 0;
    this.beamFiringProgress = 0;

    this.initDOM();
    this.initCanvas();
    this.bindEvents();
    this.setupInitialDisplay();
    this.animateCanvas();
  }

  initDOM() {
    // Header
    this.sectorBadge = document.getElementById('sector-badge');
    this.sectorTitle = document.getElementById('sector-title');
    this.waveCounter = document.getElementById('wave-counter');
    this.timerDisplay = document.getElementById('timer-display');
    this.timerBar = document.getElementById('timer-bar');
    this.healthBar = document.getElementById('health-bar');
    this.healthText = document.getElementById('health-text');
    this.livesContainer = document.getElementById('lives-container');
    this.comboMultiplierDisplay = document.getElementById('combo-multiplier-display');
    this.scoreDisplay = document.getElementById('score-display');
    this.audioToggleBtn = document.getElementById('audio-toggle-btn');
    this.audioIcon = document.getElementById('audio-icon');
    this.fieldGuideBtn = document.getElementById('field-guide-btn');

    // Central Chamber
    this.targetMWDisplay = document.getElementById('target-mw-display');
    this.threatBadge = document.getElementById('threat-badge');
    this.hintToggleBtn = document.getElementById('hint-toggle-btn');
    this.hintStrip = document.getElementById('hint-strip');
    this.hintText = document.getElementById('hint-text');
    this.coreStatusText = document.getElementById('core-status-text');
    this.corePowerCurveText = document.getElementById('core-power-curve-text');

    // Equation Card Elements (Target Demand = a^b)
    this.equationDisplayCard = document.getElementById('equation-display-card');
    this.equationOperator = document.getElementById('equation-operator');
    this.deployedBase = document.getElementById('deployed-base');
    this.deployedExp = document.getElementById('deployed-exp');
    this.dischargeResultContainer = document.getElementById('discharge-result-container');
    this.dischargeEvaluatedMW = document.getElementById('discharge-evaluated-mw');
    this.dischargeVerdictBadge = document.getElementById('discharge-verdict-badge');

    // Ribbon
    this.ribbonSummary = document.getElementById('ribbon-summary');
    this.ribbonNodesContainer = document.getElementById('ribbon-nodes-container');

    // Console Controls
    this.baseNumberDisplay = document.getElementById('base-number-display');
    this.baseDecBtn = document.getElementById('base-dec-btn');
    this.baseIncBtn = document.getElementById('base-inc-btn');
    this.basePresetBtns = document.querySelectorAll('.base-preset-btn');
    this.baseLockedBadge = document.getElementById('base-locked-badge');
    this.baseSubtext = document.getElementById('base-subtext');

    this.expNumberDisplay = document.getElementById('exp-number-display');
    this.expDecBtn = document.getElementById('exp-dec-btn');
    this.expIncBtn = document.getElementById('exp-inc-btn');
    this.expPresetBtns = document.querySelectorAll('.exp-preset-btn');

    this.formulaBase = document.getElementById('formula-base');
    this.formulaExp = document.getElementById('formula-exp');

    // Rapid Diagnostic HUD & Discharge Button
    this.inlineDiagnosticHud = document.getElementById('inline-diagnostic-hud');
    this.diagnosticIcon = document.getElementById('diagnostic-icon');
    this.diagnosticTitle = document.getElementById('diagnostic-title');
    this.diagnosticMessage = document.getElementById('diagnostic-message');
    this.diagnosticFormula = document.getElementById('diagnostic-formula');
    this.dischargeBtn = document.getElementById('discharge-btn');

    // Modals
    this.modalDebrief = document.getElementById('modal-debrief');
    this.debriefIcon = document.getElementById('debrief-icon');
    this.debriefTitle = document.getElementById('debrief-title');
    this.debriefSubtitle = document.getElementById('debrief-subtitle');
    this.debriefTime = document.getElementById('debrief-time');
    this.debriefWatts = document.getElementById('debrief-watts');
    this.debriefCombo = document.getElementById('debrief-combo');
    this.debriefEvasion = document.getElementById('debrief-evasion');
    this.debriefCores = document.getElementById('debrief-cores');
    this.debriefHints = document.getElementById('debrief-hints');
    this.debriefRestartBtn = document.getElementById('debrief-restart-btn');

    this.modalFieldGuide = document.getElementById('modal-field-guide');
    this.closeFieldGuideBtn = document.getElementById('close-field-guide-btn');

    this.modalBriefing = document.getElementById('modal-briefing');
    this.briefingStartBtn = document.getElementById('briefing-start-btn');
    this.briefingBtn = document.getElementById('briefing-btn');
    this.isBriefingOpen = true;

    this.updateAudioIcon();
    this.updateLivesDisplay();
  }

  updateLivesDisplay() {
    if (!this.livesContainer) return;
    this.livesContainer.innerHTML = '';
    for (let i = 0; i < this.maxLives; i++) {
      const span = document.createElement('span');
      span.className = 'core-life-icon transition-all duration-300';
      if (i < this.lives) {
        span.textContent = '🔋';
      } else {
        span.textContent = '🪫';
        span.classList.add('opacity-40');
      }
      this.livesContainer.appendChild(span);
    }
  }

  initCanvas() {
    this.canvas = document.getElementById('reactor-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    };
    window.addEventListener('resize', resize);
    resize();

    // Seed plasma particles
    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas.width || 600),
        y: Math.random() * (this.canvas.height || 260),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        radius: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }
  }

  bindEvents() {
    // Base Controls
    this.baseDecBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.setBase(Math.max(1, this.base - 1));
    });
    this.baseIncBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.setBase(Math.min(10, this.base + 1));
    });
    this.basePresetBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        soundManager.playClick();
        this.setBase(parseInt(e.currentTarget.dataset.val, 10));
      });
    });

    // Exponent Controls
    this.expDecBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.setExponent(Math.max(0, this.exponent - 1));
    });
    this.expIncBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.setExponent(Math.min(6, this.exponent + 1));
    });
    this.expPresetBtns.forEach(btn => {
      btn.addEventListener('click', e => {
        soundManager.playClick();
        this.setExponent(parseInt(e.currentTarget.dataset.val, 10));
      });
    });

    // Briefing Start Button
    if (this.briefingStartBtn) {
      this.briefingStartBtn.addEventListener('click', () => this.startGameFromBriefing());
    }

    if (this.briefingBtn) {
      this.briefingBtn.addEventListener('click', () => this.openBriefing());
    }

    // Fire / Discharge Button
    this.dischargeBtn.addEventListener('click', () => this.handleDischarge());

    // Keyboard Shortcuts: Space or Enter to start or discharge!
    window.addEventListener('keydown', e => {
      if (!this.hasStarted) {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          this.startGameFromBriefing();
        }
        return;
      }
      if (this.isPaused || this.isGameOver) return;
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        this.handleDischarge();
      }
    });

    // Hint Toggle
    this.hintToggleBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.hintStrip.classList.toggle('hidden');
      if (!this.hintStrip.classList.contains('hidden') && !this.hintUsedThisWave && this.hasStarted) {
        this.hintUsedThisWave = true;
        this.hintsUsed++;
      }
    });

    // Sound Toggle
    this.audioToggleBtn.addEventListener('click', () => {
      const muted = soundManager.toggleMuted();
      this.updateAudioIcon();
    });

    // Field Guide Modal
    this.fieldGuideBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.isPaused = true;
      this.modalFieldGuide.classList.remove('hidden');
    });
    this.closeFieldGuideBtn.addEventListener('click', () => {
      this.isPaused = false;
      this.modalFieldGuide.classList.add('hidden');
    });

    // Shift Restart
    this.debriefRestartBtn.addEventListener('click', () => {
      soundManager.playClick();
      this.modalDebrief.classList.add('hidden');
      this.resetFullStationShift();
    });
  }

  updateAudioIcon() {
    this.audioIcon.textContent = soundManager.getMuted() ? '🔇' : '🔊';
  }

  // ==========================================
  // BRIEFING & INITIAL SETUP
  // ==========================================
  startGameFromBriefing() {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.isBriefingOpen = false;
      soundManager.playClick();
      soundManager.playSuccessChord();
      if (this.modalBriefing) {
        this.modalBriefing.classList.add('hidden');
      }
      this.shiftStartTime = Date.now();
      this.startWave();
    } else {
      this.closeBriefing();
    }
  }

  openBriefing() {
    this.isBriefingOpen = true;
    soundManager.playClick();
    if (this.briefingStartBtn) {
      this.briefingStartBtn.textContent = 'RESUME MISSION ➔';
    }
    if (this.modalBriefing) {
      this.modalBriefing.classList.remove('hidden');
    }
  }

  closeBriefing() {
    this.isBriefingOpen = false;
    soundManager.playClick();
    if (this.modalBriefing) {
      this.modalBriefing.classList.add('hidden');
    }
  }

  setupInitialDisplay() {
    const sector = CURRICULUM_SECTORS[this.sectorIndex];
    const problem = sector.problems[this.waveIndex];

    this.sectorBadge.textContent = sector.badge;
    this.sectorTitle.textContent = `${sector.name} (${sector.tagline})`;
    this.waveCounter.textContent = `${this.waveIndex + 1} / ${sector.problems.length}`;

    this.targetMWDisplay.textContent = problem.targetMW.toLocaleString();
    this.hintText.textContent = problem.hint;
    this.hintStrip.classList.add('hidden');

    this.timerDisplay.textContent = `${sector.waveTimeLimit}s`;
    this.timerBar.style.width = '100%';

    this.updateRibbon();
    this.updateConsoleOutput();
  }

  // ==========================================
  // SECTOR & WAVE LIFECYCLE
  // ==========================================
  startWave() {
    const sector = CURRICULUM_SECTORS[this.sectorIndex];
    const problem = sector.problems[this.waveIndex];

    // Sector & Wave UI
    this.sectorBadge.textContent = sector.badge;
    this.sectorTitle.textContent = `${sector.name} (${sector.tagline})`;
    this.waveCounter.textContent = `${this.waveIndex + 1} / ${sector.problems.length}`;

    // Target Demand
    this.targetMWDisplay.textContent = problem.targetMW.toLocaleString();
    this.hintText.textContent = problem.hint;
    this.hintStrip.classList.add('hidden');
    this.hintUsedThisWave = false;
    this.waveMisses = 0;

    // Reset Equation Card Display
    if (this.dischargeResultContainer) {
      this.dischargeResultContainer.classList.add('hidden');
      this.dischargeResultContainer.classList.remove('flex');
    }
    if (this.equationOperator) {
      this.equationOperator.textContent = '=';
      this.equationOperator.className = 'text-3xl font-black text-gray-400';
    }
    if (this.equationDisplayCard) {
      this.equationDisplayCard.className = 'z-10 bg-gray-950/90 border-2 border-cyan-500/60 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur flex flex-col items-center justify-center transition-all duration-300 mb-1.5 glow-cyan';
    }

    // Base Locking for large non-ten surges (>200 MW) to eliminate cognitive strain
    const locked = isBaseLocked(problem);
    this.isBaseLocked = locked;
    if (locked) {
      const givenBase = getGivenBase(problem);
      this.setBase(givenBase, true);
      if (this.baseLockedBadge) this.baseLockedBadge.classList.remove('hidden');
      if (this.baseSubtext) {
        this.baseSubtext.textContent = 'GIVEN BASE';
        this.baseSubtext.className = 'text-[10px] text-cyan-400 font-black tracking-wider';
      }
      if (this.baseDecBtn) {
        this.baseDecBtn.disabled = true;
        this.baseDecBtn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      }
      if (this.baseIncBtn) {
        this.baseIncBtn.disabled = true;
        this.baseIncBtn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      }
      this.basePresetBtns.forEach(btn => {
        btn.disabled = true;
        btn.classList.add('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      });
    } else {
      if (this.baseLockedBadge) this.baseLockedBadge.classList.add('hidden');
      if (this.baseSubtext) {
        this.baseSubtext.textContent = 'Repeated Factor';
        this.baseSubtext.className = 'text-[10px] text-gray-400 font-medium';
      }
      if (this.baseDecBtn) {
        this.baseDecBtn.disabled = false;
        this.baseDecBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      }
      if (this.baseIncBtn) {
        this.baseIncBtn.disabled = false;
        this.baseIncBtn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      }
      this.basePresetBtns.forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('opacity-30', 'cursor-not-allowed', 'pointer-events-none');
      });
    }

    if (sector.isBossSector) {
      this.threatBadge.className = 'text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 border border-rose-600 text-rose-300 animate-pulse';
      this.threatBadge.textContent = 'SINGULARITY BOSS CORE';
      this.coreStatusText.textContent = 'WARNING: HIGH VOLTAGE SINGULARITY SURGE';
      this.coreStatusText.className = 'text-xs uppercase font-mono-math font-black tracking-widest text-rose-400';
    } else {
      this.threatBadge.className = 'text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300';
      this.threatBadge.textContent = 'ACTIVE SURGE';
      this.coreStatusText.textContent = 'REACTOR MODULATOR READY';
      this.coreStatusText.className = 'text-xs uppercase font-mono-math font-black tracking-widest text-cyan-400';
    }

    // Reset Wave Timer
    clearInterval(this.waveTimerInterval);
    this.waveTimeRemaining = sector.waveTimeLimit;
    this.updateTimerDisplay();

    this.waveTimerInterval = setInterval(() => {
      if (this.isPaused || this.isGameOver || this.isDischarging || this.isBriefingOpen) return;

      this.waveTimeRemaining--;
      this.updateTimerDisplay();

      if (this.waveTimeRemaining <= 5 && this.waveTimeRemaining > 0) {
        soundManager.playAlarmTick();
        this.timerDisplay.classList.add('animate-urgent', 'text-rose-400');
      }

      if (this.waveTimeRemaining <= 0) {
        clearInterval(this.waveTimerInterval);
        this.handleSurgeTimeout();
      }
    }, 1000);

    this.updateRibbon();
    this.updateConsoleOutput();
  }

  updateTimerDisplay() {
    const sector = CURRICULUM_SECTORS[this.sectorIndex];
    this.timerDisplay.textContent = `${this.waveTimeRemaining}s`;

    const pct = Math.max(0, (this.waveTimeRemaining / sector.waveTimeLimit) * 100);
    this.timerBar.style.width = `${pct}%`;

    if (this.waveTimeRemaining > 7) {
      this.timerBar.className = 'h-full bg-amber-400 rounded-full transition-all duration-300';
      this.timerDisplay.className = 'text-sm font-mono-math font-black text-amber-300';
    } else {
      this.timerBar.className = 'h-full bg-rose-500 rounded-full transition-all duration-300';
      this.timerDisplay.className = 'text-sm font-mono-math font-black text-rose-400 animate-urgent';
    }
  }

  handleSurgeTimeout() {
    clearInterval(this.waveTimerInterval);
    soundManager.playStallBuzzer(false);

    // Screen shake
    document.body.classList.add('shake-active');
    setTimeout(() => document.body.classList.remove('shake-active'), 450);

    // Reset combo to x1
    this.combo = 1;
    this.comboMultiplierDisplay.textContent = 'x1';
    this.comboMultiplierDisplay.parentElement.className = 'flex items-center space-x-1.5 bg-indigo-950/70 border border-indigo-700/60 px-2.5 py-1 rounded-xl';

    if (this.lives > 0) {
      // Consume 1 backup core / life on timer expiration!
      this.lives--;
      this.updateLivesDisplay();

      // Flash amber
      document.body.classList.add('glow-amber');
      setTimeout(() => document.body.classList.remove('glow-amber'), 600);

      const coresLeftStr = this.lives === 1 ? '1 backup core remaining' : `${this.lives} backup cores remaining`;
      this.showInlineDiagnostic(
        false,
        'SURGE BREACH! BACKUP CORE CONSUMED',
        `Timer expired! Emergency core engaged to restore power and reset the wave timer.`,
        `Timer Reset & Health 100% (${coresLeftStr})`
      );

      // Restore health to 100% and restart the wave with full timer
      setTimeout(() => {
        this.coreHealth = 100;
        this.updateHealthBar();
        this.isDischarging = false;
        this.dischargeBtn.disabled = false;
        this.dischargeBtn.classList.remove('opacity-50');
        this.startWave(); // restarts wave timer and keeps player on current wave/sector!
      }, 1500);
      return;
    }

    // OUT OF LIVES: Total meltdown
    this.coreHealth = 0;
    this.updateHealthBar();
    soundManager.playMeltdown();
    this.showInlineDiagnostic(
      false,
      'SURGE BREACH! ZERO BACKUP CORES',
      'The incoming energy surge breached core shielding and all backup cores are exhausted.',
      'Core Meltdown Initiated'
    );
    setTimeout(() => this.endGame(false), 900);
  }

  // ==========================================
  // DIAL CONTROLS & RIBBON
  // ==========================================
  setBase(val, force = false) {
    if (this.isBaseLocked && !force) return;
    if (!force) this.hideErrorDiagnostic();

    this.base = val;
    this.baseNumberDisplay.textContent = val;
    const depBase = this.deployedBase || document.getElementById('deployed-base');
    if (depBase) depBase.textContent = val;
    if (this.formulaBase) this.formulaBase.textContent = val;

    this.basePresetBtns.forEach(btn => {
      const bVal = parseInt(btn.dataset.val, 10);
      btn.className = bVal === val
        ? 'base-preset-btn py-1 bg-cyan-950 border border-cyan-500/50 rounded font-mono-math font-bold text-xs text-cyan-300 font-black'
        : 'base-preset-btn py-1 bg-gray-950 hover:bg-cyan-950 border border-gray-800 rounded font-mono-math font-bold text-xs text-gray-300';
    });
    this.updateRibbon();
    this.updateConsoleOutput();
  }

  setExponent(val) {
    this.hideErrorDiagnostic();
    this.exponent = val;
    this.expNumberDisplay.textContent = val;
    const depExp = this.deployedExp || document.getElementById('deployed-exp');
    if (depExp) depExp.textContent = val;
    if (this.formulaExp) this.formulaExp.textContent = val;

    this.expPresetBtns.forEach(btn => {
      const eVal = parseInt(btn.dataset.val, 10);
      btn.className = eVal === val
        ? 'exp-preset-btn py-1 bg-amber-950 border border-amber-500/50 rounded font-mono-math font-bold text-xs text-amber-300 font-black'
        : 'exp-preset-btn py-1 bg-gray-950 hover:bg-amber-950 border border-gray-800 rounded font-mono-math font-bold text-xs text-gray-300';
    });
    this.updateRibbon();
    this.updateConsoleOutput();
  }

  updateRibbon() {
    const steps = prepareSteps(this.base, this.exponent);
    this.ribbonNodesContainer.innerHTML = '';

    if (this.exponent === 0) {
      const pill = document.createElement('div');
      pill.className = 'px-3 py-1 bg-emerald-950/70 border border-emerald-500/60 rounded-xl text-emerald-300 font-mono-math text-xs font-bold flex items-center space-x-1.5';
      pill.innerHTML = `<span>⚡</span><span>Zero Factors: Base ${this.base} to power 0</span>`;
      this.ribbonNodesContainer.appendChild(pill);
      this.ribbonSummary.textContent = `${this.base}⁰`;
      this.corePowerCurveText.textContent = `Zero Exponent Rule: Any non-zero base raised to power 0.`;
      return;
    }

    let summaryText = `${this.base}^${this.exponent} = `;
    const factors = Array(this.exponent).fill(this.base);
    summaryText += factors.join(' × ');
    this.ribbonSummary.textContent = summaryText;

    this.corePowerCurveText.textContent = `Repeated Factors: ${this.base} used as a factor ${this.exponent} time${this.exponent === 1 ? '' : 's'}.`;

    steps.forEach((step, idx) => {
      const cell = document.createElement('div');
      cell.id = `ribbon-node-${idx}`;
      cell.className = 'flex items-center space-x-1.5 bg-gray-900 border border-cyan-900/60 px-3 py-1 rounded-xl font-mono-math text-xs';
      cell.innerHTML = `
        <span class="text-[9px] text-gray-500 font-bold">#${idx + 1}</span>
        <span class="font-black text-cyan-300 text-sm">${step.factor}</span>
      `;
      this.ribbonNodesContainer.appendChild(cell);

      if (idx < steps.length - 1) {
        const mul = document.createElement('span');
        mul.className = 'text-gray-600 font-black text-xs';
        mul.textContent = '×';
        this.ribbonNodesContainer.appendChild(mul);
      }
    });
  }

  updateConsoleOutput() {
    if (this.formulaBase) this.formulaBase.textContent = this.base;
    if (this.formulaExp) this.formulaExp.textContent = this.exponent;

    const depBase = this.deployedBase || document.getElementById('deployed-base');
    const depExp = this.deployedExp || document.getElementById('deployed-exp');
    if (depBase) depBase.textContent = this.base;
    if (depExp) depExp.textContent = this.exponent;

    // While student is adjusting dials before discharge, reset reveal & comparison
    if (!this.isDischarging) {
      if (this.dischargeResultContainer) {
        this.dischargeResultContainer.classList.add('hidden');
        this.dischargeResultContainer.classList.remove('flex');
      }
      if (this.equationOperator) {
        this.equationOperator.textContent = '=';
        this.equationOperator.className = 'text-3xl font-black text-gray-400';
      }
      if (this.equationDisplayCard) {
        this.equationDisplayCard.className = 'z-10 bg-gray-950/90 border-2 border-cyan-500/60 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur flex flex-col items-center justify-center transition-all duration-300 mb-1.5 glow-cyan';
      }
    }
  }

  // ==========================================
  // BEAM DISCHARGE & RAPID INLINE DIAGNOSTIC LOOP
  // ==========================================
  async handleDischarge() {
    if (this.isDischarging || this.isGameOver || this.isPaused) return;

    this.isDischarging = true;
    this.totalAttempts++;
    this.dischargeBtn.disabled = true;
    this.dischargeBtn.classList.add('opacity-50');

    const sector = CURRICULUM_SECTORS[this.sectorIndex];
    const problem = sector.problems[this.waveIndex];
    const steps = prepareSteps(this.base, this.exponent);

    // Audio step tones and canvas laser surge
    soundManager.playDischargeLaser();
    this.beamFiringProgress = 1.0;

    for (let i = 0; i < steps.length; i++) {
      soundManager.playStepTone(i, steps.length, this.base);
      const node = document.getElementById(`ribbon-node-${i}`);
      if (node) {
        node.classList.add('border-cyan-400', 'bg-cyan-950', 'scale-105');
      }
      await new Promise(r => setTimeout(r, 90));
      if (node) {
        node.classList.remove('scale-105');
      }
    }

    const evaluatedPower = calculatePower(this.base, this.exponent);

    // REVEAL DISCHARGED POWER VALUE & EQUALITY COMPARISON
    if (this.dischargeResultContainer && this.dischargeEvaluatedMW && this.equationOperator) {
      this.dischargeResultContainer.classList.remove('hidden');
      this.dischargeResultContainer.classList.add('flex');
      this.dischargeEvaluatedMW.textContent = evaluatedPower.toLocaleString();

      if (evaluatedPower === problem.targetMW) {
        // MATCH: Target = a^b = Evaluated MW
        this.equationOperator.textContent = '=';
        this.equationOperator.className = 'text-3xl font-black text-emerald-400';
        if (this.dischargeVerdictBadge) {
          this.dischargeVerdictBadge.textContent = 'MATCH';
          this.dischargeVerdictBadge.className = 'ml-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300';
        }
        if (this.equationDisplayCard) {
          this.equationDisplayCard.className = 'z-10 bg-gray-950/95 border-2 border-emerald-500 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur flex flex-col items-center justify-center transition-all duration-300 mb-1.5 glow-emerald';
        }
      } else {
        // MISMATCH: Target ≠ a^b = Evaluated MW
        this.equationOperator.textContent = '≠';
        this.equationOperator.className = 'text-3xl font-black text-rose-400';
        const isOverload = evaluatedPower > problem.targetMW;
        if (this.dischargeVerdictBadge) {
          this.dischargeVerdictBadge.textContent = isOverload ? 'OVERLOAD' : 'UNDERPOWER';
          this.dischargeVerdictBadge.className = 'ml-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-950 border border-rose-500 text-rose-300';
        }
        if (this.equationDisplayCard) {
          this.equationDisplayCard.className = 'z-10 bg-gray-950/95 border-2 border-rose-500 px-6 py-2.5 rounded-2xl shadow-2xl backdrop-blur flex flex-col items-center justify-center transition-all duration-300 mb-1.5 glow-rose';
        }
      }
    }

    const diagnosis = diagnoseSubmission(this.base, this.exponent, problem.targetMW);

    if (!diagnosis.isTrap && diagnosis.type === 'exact-match') {
      // SUCCESS: POWER MATCH!
      this.handleMatchSuccess(problem.targetMW);
    } else {
      // MISCONCEPTION / TRAP STALL
      if (diagnosis.isTrap) {
        this.trapHits++;
      }
      soundManager.playStallBuzzer(diagnosis.isTrap);
      this.triggerCircuitBreach(
        diagnosis.isTrap ? 'CIRCUIT STALL: EXPONENT TRAP DETECTED!' : 'CIRCUIT OVERLOAD: POWER MISMATCH',
        diagnosis.explanation,
        diagnosis.correctFormula
      );
    }
  }

  handleMatchSuccess(targetMW) {
    soundManager.playSuccessChord();

    this.wavesCleared++;
    if (this.waveMisses === 0) this.firstTryCorrect++;

    // Exponential scaling combo: x1 -> x2 -> x4 -> x8 -> x16 (a hint holds the combo where it is)
    if (!this.hintUsedThisWave) {
      this.combo = Math.min(16, this.combo === 1 ? 2 : this.combo * 2);
    }
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }

    const basePoints = this.hintUsedThisWave ? 50 : 100;
    const pointsEarned = basePoints * this.combo;
    this.score += pointsEarned;
    this.totalWattsMitigated += targetMW;

    // Regain +10% core integrity
    this.coreHealth = Math.min(100, this.coreHealth + 10);
    this.updateHealthBar();

    // Update displays
    this.scoreDisplay.textContent = this.score.toLocaleString();
    this.comboMultiplierDisplay.textContent = `x${this.combo}`;
    this.comboMultiplierDisplay.parentElement.className = 'flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-500/80 px-2.5 py-1 rounded-xl glow-emerald';

    // Show rapid inline success flash
    this.showInlineDiagnostic(
      true,
      'SURGE MITIGATED!',
      `Beam calibrated to ${targetMW.toLocaleString()} MW. Reactor grid locked!`,
      `+${pointsEarned} pts (Combo x${this.combo})${this.hintUsedThisWave ? ' · hint used' : ''}`
    );

    // Visual green flash
    document.body.classList.add('glow-emerald');
    setTimeout(() => document.body.classList.remove('glow-emerald'), 500);

    // Advance wave
    setTimeout(() => {
      this.waveIndex++;
      const sector = CURRICULUM_SECTORS[this.sectorIndex];

      if (this.waveIndex >= sector.problems.length) {
        // Sector Cleared!
        this.waveIndex = 0;
        this.sectorIndex++;

        if (this.sectorIndex >= CURRICULUM_SECTORS.length) {
          // Completed all 5 sectors (Victory!)
          this.endGame(true);
          return;
        }
      }

      this.isDischarging = false;
      this.dischargeBtn.disabled = false;
      this.dischargeBtn.classList.remove('opacity-50');
      this.startWave();
    }, 700);
  }

  triggerCircuitBreach(title, explanation, formula) {
    this.waveMisses++;

    // Reset combo to x1
    this.combo = 1;
    this.comboMultiplierDisplay.textContent = 'x1';
    this.comboMultiplierDisplay.parentElement.className = 'flex items-center space-x-1.5 bg-indigo-950/70 border border-indigo-700/60 px-2.5 py-1 rounded-xl';

    // Core takes damage
    this.coreHealth = Math.max(0, this.coreHealth - 20);
    this.updateHealthBar();

    // Screen shake
    document.body.classList.add('shake-active');
    setTimeout(() => document.body.classList.remove('shake-active'), 450);

    // Show Rapid Inline Diagnostic HUD (No modal click required!)
    this.showInlineDiagnostic(false, title, explanation, formula);

    // Check Core Depletion / Meltdown State
    if (this.coreHealth <= 0) {
      clearInterval(this.waveTimerInterval);

      if (this.lives > 0) {
        // CONSUME 1 BACKUP CORE & REBOOT SECTOR!
        this.lives--;
        this.updateLivesDisplay();
        soundManager.playStallBuzzer(true);

        // Flash screen amber
        document.body.classList.add('glow-amber');
        setTimeout(() => document.body.classList.remove('glow-amber'), 600);

        // Keep the math explanation visible: the student needs to see WHY this miss was wrong.
        const coresLeftStr = this.lives === 1 ? '1 backup core left' : `${this.lives} backup cores left`;
        this.showInlineDiagnostic(
          false,
          `${title} · BACKUP CORE USED`,
          explanation,
          `${formula}  |  🔋 Rebooting sector (${coresLeftStr})`
        );

        setTimeout(() => {
          this.coreHealth = 100;
          this.updateHealthBar();
          this.waveIndex = 0; // restarts at Wave 1 of CURRENT sector
          this.isDischarging = false;
          this.dischargeBtn.disabled = false;
          this.dischargeBtn.classList.remove('opacity-50');
          this.startWave();
        }, 3500);
        return;
      }

      // OUT OF BACKUP CORES: TOTAL GRID MELTDOWN
      soundManager.playMeltdown();
      setTimeout(() => this.endGame(false), 3000);
      return;
    }

    // Auto-reset input after < 1.4s for instant fast retry loop!
    setTimeout(() => {
      this.isDischarging = false;
      this.dischargeBtn.disabled = false;
      this.dischargeBtn.classList.remove('opacity-50');
    }, 1400);
  }

  showInlineDiagnostic(isSuccess, title, msg, formula) {
    clearTimeout(this.hudClearTimeout);

    this.inlineDiagnosticHud.classList.remove('hidden');

    if (isSuccess) {
      this.inlineDiagnosticHud.className = 'rounded-xl border border-emerald-500/60 bg-emerald-950/70 p-2.5 transition-all';
      this.diagnosticIcon.textContent = '✅';
      this.diagnosticTitle.textContent = title;
      this.diagnosticTitle.className = 'text-xs font-black uppercase tracking-wider text-emerald-300';
      this.diagnosticMessage.textContent = msg;
      this.diagnosticMessage.className = 'text-[11px] leading-tight font-medium mt-0.5 text-emerald-200';
      this.diagnosticFormula.textContent = formula;
      this.diagnosticFormula.className = 'font-mono-math font-extrabold text-[11px] mt-1 text-emerald-300';
    } else {
      this.inlineDiagnosticHud.className = 'rounded-xl border border-rose-500/70 bg-rose-950/80 p-2.5 transition-all glow-rose';
      this.diagnosticIcon.textContent = '⚠️';
      this.diagnosticTitle.textContent = title;
      this.diagnosticTitle.className = 'text-xs font-black uppercase tracking-wider text-rose-300';
      this.diagnosticMessage.textContent = msg;
      this.diagnosticMessage.className = 'text-[11px] leading-tight font-medium mt-0.5 text-rose-100';
      this.diagnosticFormula.textContent = formula;
      this.diagnosticFormula.className = 'font-mono-math font-extrabold text-[11px] mt-1 text-amber-300';
    }

    // Success messages clear themselves; error explanations stay until the student
    // changes a dial so there is time to read them.
    this.hudShowingError = !isSuccess;
    if (isSuccess) {
      this.hudClearTimeout = setTimeout(() => {
        this.inlineDiagnosticHud.classList.add('hidden');
      }, 1800);
    }
  }

  hideErrorDiagnostic() {
    if (this.hudShowingError && !this.isDischarging) {
      this.inlineDiagnosticHud.classList.add('hidden');
      this.hudShowingError = false;
    }
  }

  updateHealthBar() {
    this.healthBar.style.width = `${this.coreHealth}%`;
    this.healthText.textContent = `${this.coreHealth}%`;

    if (this.coreHealth <= 25) {
      this.healthBar.className = 'h-full bg-rose-600 rounded-full transition-all duration-300 animate-pulse';
      this.healthText.className = 'text-xs font-mono-math font-bold text-rose-400';
    } else if (this.coreHealth <= 50) {
      this.healthBar.className = 'h-full bg-amber-500 rounded-full transition-all duration-300';
      this.healthText.className = 'text-xs font-mono-math font-bold text-amber-400';
    } else {
      this.healthBar.className = 'h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-300';
      this.healthText.className = 'text-xs font-mono-math font-bold text-cyan-300';
    }
  }

  // ==========================================
  // STATION RUN COMPLETE / MELTDOWN DEBRIEF
  // ==========================================
  endGame(isVictory) {
    this.isGameOver = true;
    clearInterval(this.waveTimerInterval);

    const shiftSeconds = Math.round((Date.now() - this.shiftStartTime) / 1000);
    const mins = Math.floor(shiftSeconds / 60);
    const secs = shiftSeconds % 60;
    const timeStr = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;

    const evasionRate = this.totalAttempts > 0
      ? Math.round(((this.totalAttempts - this.trapHits) / this.totalAttempts) * 100)
      : 100;
    const totalWaves = CURRICULUM_SECTORS.reduce((n, sec) => n + sec.problems.length, 0);
    const firstTryPct = this.wavesCleared > 0
      ? Math.round((this.firstTryCorrect / this.wavesCleared) * 100)
      : 0;

    if (isVictory) {
      soundManager.playVictoryFanfare();
      this.debriefIcon.textContent = '🏆';
      this.debriefIcon.className = 'w-16 h-16 rounded-3xl bg-cyan-950 border-2 border-cyan-500/60 flex items-center justify-center text-3xl mb-3 glow-cyan';
      this.debriefTitle.textContent = 'SECTOR GRID STABILIZED!';
      this.debriefSubtitle.textContent = 'All 5 sectors cleared. Singularity Boss Core subdued and grid secured!';

      try {
        window.parent.postMessage({
          type: 'CARTRIDGE_COMPLETE',
          payload: {
            lessonId: 'G06_U03_L01',
            // score = waves solved on the first try; total = waves in the run
            score: this.firstTryCorrect,
            total: totalWaves,
            evasionRate: evasionRate,
            bossDefeated: true
          }
        }, '*');
      } catch (e) {}
    } else {
      this.debriefIcon.textContent = '⚠️';
      this.debriefIcon.className = 'w-16 h-16 rounded-3xl bg-rose-950 border-2 border-rose-500/60 flex items-center justify-center text-3xl mb-3 glow-rose';
      this.debriefTitle.textContent = 'REACTOR CORE MELTDOWN!';
      this.debriefSubtitle.textContent = 'Core structural integrity collapsed under circuit overcharge.';
    }

    this.debriefTime.textContent = timeStr;
    this.debriefWatts.textContent = `${this.totalWattsMitigated.toLocaleString()} MW`;
    this.debriefCombo.textContent = `x${this.maxCombo} Combo`;
    this.debriefEvasion.textContent = `${firstTryPct}%`;
    if (this.debriefHints) this.debriefHints.textContent = String(this.hintsUsed);
    if (this.debriefCores) {
      this.debriefCores.textContent = `${this.lives} / ${this.maxLives}`;
    }

    this.modalDebrief.classList.remove('hidden');
  }

  resetFullStationShift() {
    this.sectorIndex = 0;
    this.waveIndex = 0;
    this.coreHealth = 100;
    this.lives = this.maxLives;
    this.updateLivesDisplay();
    this.score = 0;
    this.totalWattsMitigated = 0;
    this.combo = 1;
    this.maxCombo = 1;
    this.totalAttempts = 0;
    this.trapHits = 0;
    this.firstTryCorrect = 0;
    this.wavesCleared = 0;
    this.hintsUsed = 0;
    this.isGameOver = false;
    this.isDischarging = false;
    this.isBaseLocked = false;
    this.shiftStartTime = Date.now();

    this.scoreDisplay.textContent = '0';
    this.comboMultiplierDisplay.textContent = 'x1';
    this.updateHealthBar();
    this.dischargeBtn.disabled = false;
    this.dischargeBtn.classList.remove('opacity-50');

    this.startWave();
  }

  // ==========================================
  // REAL-TIME CANVAS PARTICLE & BEAM RENDERER
  // ==========================================
  animateCanvas() {
    requestAnimationFrame(() => this.animateCanvas());
    if (!this.ctx || !this.canvas) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Background gradient glow (orb centered at 38% height above the equation card)
    const cx = w * 0.5;
    const cy = h * 0.38;
    const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, w * 0.5);
    grad.addColorStop(0, 'rgba(6, 182, 212, 0.12)');
    grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Update & draw particles
    ctx.fillStyle = 'rgba(6, 182, 212, 0.6)';
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Core Plasma Rings
    this.coreRotation += 0.015;
    const baseRadius = 45 + Math.min(this.exponent * 6, 40);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.coreRotation);

    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Arc nodes
    for (let i = 0; i < Math.max(3, this.base); i++) {
      const angle = (i * Math.PI * 2) / Math.max(3, this.base);
      const nx = Math.cos(angle) * baseRadius;
      const ny = Math.sin(angle) * baseRadius;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Inner Core Orb
    const orbGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 22);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.4, '#38bdf8');
    orbGrad.addColorStop(1, 'rgba(14, 165, 233, 0.1)');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();

    // Laser Beam Surge Animation (when discharging)
    if (this.beamFiringProgress > 0) {
      const beamAlpha = this.beamFiringProgress;
      const beamWidth = 6 + this.exponent * 4;

      ctx.save();
      ctx.strokeStyle = `rgba(56, 189, 248, ${beamAlpha})`;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 20;
      ctx.lineWidth = beamWidth;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(w - 20, cy);
      ctx.stroke();

      // Core bright center streak
      ctx.strokeStyle = `rgba(255, 255, 255, ${beamAlpha})`;
      ctx.lineWidth = Math.max(2, beamWidth * 0.35);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(w - 20, cy);
      ctx.stroke();
      ctx.restore();

      this.beamFiringProgress -= 0.05;
      if (this.beamFiringProgress < 0) this.beamFiringProgress = 0;
    }
  }
}

// Instantiate on DOM Ready
window.addEventListener('DOMContentLoaded', () => {
  new ExponentReactorGame();
});
