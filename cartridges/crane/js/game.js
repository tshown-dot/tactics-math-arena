/**
 * Demolition Crane - Main Game Controller
 * Pure Vanilla ES Module (Zero React / Zero Bundlers)
 * Aligned with Core Game Design Pillars (GEMINI.md):
 *   1. Authentic Video Game DNA & Tactile Industrial Juice
 *   2. Real Stakes & Failure States (Full Collapse, Review Queue, Safety Lockout)
 *   3. Reinforce & Extend (Overcharged Reactor Capstone Boss Phase)
 *   4. Chromebook-Native Station Flow (3-Min Shift Timer, 1366x768 Viewport Lock)
 *   5. Holographic CAD PEMDAS Pizza Funnel Blueprint
 */

import { CURRICULUM_ZONES } from './curriculumLevels.js';
import {
  parseExpressionToTokens,
  validateMove,
  executeDemolitionStep,
  getLegalNextMove,
  tokensToText,
  findOperandsForOperator,
} from './expressionParser.js';
import { soundEngine } from './audio.js';
import { getBossChallengeForZone } from './boss.js';

class DemolitionCraneGame {
  constructor() {
    // Curriculum State
    this.currentZoneId = 1;
    this.currentLevelIndex = 0;
    this.currentVariantIndex = 0;
    this.isCustomMode = false;
    this.customExpression = '';

    // Remediation Queue (Consequence System)
    this.remediationQueue = [];
    this.MAX_QUEUE_CAP = 3;
    this.isWorkingOnDefect = false;
    this.currentDefectItem = null;
    this.totalCollapsesInSession = 0;
    this.totalAttemptsInSession = 0;

    // Station Shift Clock (3-Minute Classroom Station Rotation)
    this.stationTimerSeconds = 180;
    this.stationStartTime = Date.now();
    this.isStationTimerRunning = true;

    // Expression & Tokens
    this.tokens = [];
    this.initialExpression = '';
    this.activeOperatorId = null;
    this.stepsHistory = [];

    // PEMDAS Pizza History
    this.pizzaSteps = [];
    this.isPizzaVisible = true;

    // Crane & Animation State
    this.craneX = 400;
    this.craneTargetX = 400;
    this.isDropping = false;
    this.dropProgress = 0;
    this.dropTargetY = 0;
    this.radarActive = false;
    this.isCollapseBannerOpen = false;
    this.pendingValidation = null;

    // Game Metrics & Scoring
    this.structuralIntegrity = 100;
    this.score = 0;
    this.streak = 1;
    this.highestStreak = 1;
    this.isMuted = soundEngine.getMuted();

    // DOM Elements Cache
    this.initDOMElements();

    // Sparks Canvas
    this.particles = [];
    this.initCanvas();

    // Bind event handlers
    this.bindEvents();

    // Start Station Shift Timer
    this.startStationTimer();

    // Animation Loop
    this.lastTime = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);

    // Initial Level Load
    this.loadLevel(1, 0);
  }

  initDOMElements() {
    this.dom = {
      viewport: document.getElementById('gameViewport'),
      stage: document.getElementById('stageContainer'),
      gantry: document.getElementById('gantryTrack'),
      trolley: document.getElementById('craneTrolley'),
      cable: document.getElementById('craneCable'),
      ball: document.getElementById('wreckingBall'),
      beamContainer: document.getElementById('expressionBeam'),
      sparksCanvas: document.getElementById('sparksCanvas'),

      // Top HUD
      badgeZone: document.getElementById('hudZoneBadge'),
      hudLevelText: document.getElementById('hudLevelText'),
      hudScore: document.getElementById('hudScore'),
      hudStreak: document.getElementById('hudStreak'),
      integrityBar: document.getElementById('integrityBar'),
      integrityText: document.getElementById('integrityText'),
      queueBadge: document.getElementById('hudQueueBadge'),
      queueText: document.getElementById('hudQueueText'),
      hudTimer: document.getElementById('hudTimer'),

      // Buttons
      btnMute: document.getElementById('btnMute'),
      btnReset: document.getElementById('btnReset'),
      btnSkip: document.getElementById('btnSkip'),
      btnRadar: document.getElementById('btnRadar'),
      btnRules: document.getElementById('btnRules'),
      btnSandbox: document.getElementById('btnSandbox'),
      btnZoneSelect: document.getElementById('btnZoneSelect'),
      btnPizzaToggle: document.getElementById('btnPizzaToggle'),
      btnBossDilemma: document.getElementById('btnBossDilemma'),

      // PEMDAS Pizza Blueprint Window
      pizzaWindow: document.getElementById('pemdasPizzaWindow'),
      pizzaContainer: document.getElementById('pizzaSliceContainer'),

      // Collapse Overlay
      collapseBanner: document.getElementById('collapseBanner'),
      collapseCard: document.getElementById('collapseCard'),
      collapseReasonText: document.getElementById('collapseReasonText'),
      dismissCollapseBtn: document.getElementById('dismissCollapseBtn'),

      // Teleprompter HUD
      teleprompter: document.getElementById('teleprompterBar'),
      teleIcon: document.getElementById('teleIcon'),
      teleTitle: document.getElementById('teleTitle'),
      teleMessage: document.getElementById('teleMessage'),

      // Boss Modal
      bossModal: document.getElementById('bossModal'),
      bossTitle: document.getElementById('bossTitle'),
      bossPrompt: document.getElementById('bossPrompt'),
      bossTargetVal: document.getElementById('bossTargetVal'),
      bossOptionsList: document.getElementById('bossOptionsList'),
      closeBossModalBtn: document.getElementById('closeBossModalBtn'),

      // Modals
      lockoutModal: document.getElementById('lockoutModal'),
      lockoutRuleTitle: document.getElementById('lockoutRuleTitle'),
      lockoutRuleExplanation: document.getElementById('lockoutRuleExplanation'),
      acknowledgeLockoutBtn: document.getElementById('acknowledgeLockoutBtn'),

      rulesModal: document.getElementById('rulesModal'),
      closeRulesBtn: document.getElementById('closeRulesBtn'),
      sandboxModal: document.getElementById('sandboxModal'),
      closeSandboxBtn: document.getElementById('closeSandboxBtn'),
      sandboxForm: document.getElementById('sandboxForm'),
      sandboxInput: document.getElementById('sandboxInput'),
      zoneModal: document.getElementById('zoneModal'),
      closeZoneBtn: document.getElementById('closeZoneBtn'),
      zoneList: document.getElementById('zoneList'),

      // Victory & Debrief Modal
      victoryModal: document.getElementById('victoryModal'),
      stationRankBadge: document.getElementById('stationRankBadge'),
      victoryResult: document.getElementById('victoryResult'),
      victoryPrecision: document.getElementById('victoryPrecision'),
      victoryTime: document.getElementById('victoryTime'),
      victoryStreak: document.getElementById('victoryStreak'),
      victoryLog: document.getElementById('victoryLog'),
      victoryNextBtn: document.getElementById('victoryNextBtn'),
      victoryReplayBtn: document.getElementById('victoryReplayBtn'),
    };
  }

  initCanvas() {
    this.canvas = this.dom.sparksCanvas;
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
  }

  startStationTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.timerInterval = setInterval(() => {
      if (!this.isStationTimerRunning) return;
      if (this.stationTimerSeconds > 0) {
        this.stationTimerSeconds--;
        const mins = Math.floor(this.stationTimerSeconds / 60);
        const secs = this.stationTimerSeconds % 60;
        const timeStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (this.dom.hudTimer) {
          this.dom.hudTimer.textContent = timeStr;
          if (this.stationTimerSeconds <= 10) {
            this.dom.hudTimer.className = 'text-xs font-mono font-black text-rose-500 animate-pulse';
            soundEngine.playTimerTick();
          } else if (this.stationTimerSeconds <= 60) {
            this.dom.hudTimer.className = 'text-xs font-mono font-black text-amber-400';
          } else {
            this.dom.hudTimer.className = 'text-xs font-mono font-black text-sky-400';
          }
        }
      } else {
        // Station Time Expired - Station Rotation Chime
        this.dom.hudTimer.textContent = '00:00';
        this.dom.hudTimer.className = 'text-xs font-mono font-black text-rose-500';
      }
    }, 1000);
  }

  triggerSparks(x, y, type = 'demolition') {
    const colors =
      type === 'demolition'
        ? ['#f59e0b', '#fbbf24', '#f97316', '#ef4444', '#cbd5e1']
        : type === 'clank'
        ? ['#ef4444', '#dc2626', '#f87171', '#94a3b8']
        : ['#10b981', '#34d399', '#f59e0b', '#38bdf8', '#a855f7'];

    const count = type === 'victory' ? 90 : type === 'demolition' ? 45 : 25;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * (type === 'victory' ? 11 : 8) + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'victory' ? 5 : 2),
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        decay: Math.random() * 0.025 + 0.02,
        gravity: 0.28,
      });
    }
  }

  updateParticles() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  loadLevel(zoneId, levelIdx, customRaw = null, isDefect = false) {
    let raw = '';
    this.isWorkingOnDefect = isDefect;

    if (customRaw) {
      raw = customRaw;
      this.isCustomMode = true;
      this.customExpression = customRaw;
    } else {
      this.currentZoneId = zoneId;
      this.currentLevelIndex = levelIdx;
      this.isCustomMode = false;
      const zone = CURRICULUM_ZONES.find((z) => z.id === zoneId) || CURRICULUM_ZONES[0];
      const level = zone.levels[levelIdx] || zone.levels[0];

      if (isDefect && this.currentDefectItem) {
        raw = this.currentDefectItem.expression;
      } else {
        raw = level.rawExpression;
      }
    }

    this.tokens = parseExpressionToTokens(raw);
    this.initialExpression = raw;
    this.structuralIntegrity = 100;
    this.stepsHistory = [];
    this.radarActive = false;
    this.isDropping = false;
    this.dropProgress = 0;

    // Initialize PEMDAS Pizza with the crust
    this.pizzaSteps = [raw];
    this.renderPizza();

    // Reset ball position
    if (this.dom.cable && this.dom.ball) {
      this.dom.cable.style.height = '60px';
      this.dom.ball.style.transform = 'translateY(0px)';
    }

    // Default to the first operator
    const firstOp = this.tokens.find((t) => t.type === 'operator' || t.type === 'fraction_bar');
    this.activeOperatorId = firstOp ? firstOp.id : null;

    this.updateHUD();
    this.renderBeam();

    if (isDefect) {
      this.setTeleprompter(
        'idle',
        'DEFECT REPAIR MISSION',
        `Re-attempting failed expression: ${raw}. Apply strict PEMDAS order to repair this defect!`
      );
    } else {
      this.setTeleprompter(
        'idle',
        'SITE TELEPROMPTER',
        'Crane online. Target an operator with mouse or Arrow Keys, then click or press Space to drop.'
      );
    }

    setTimeout(() => this.updateCranePosition(), 50);
  }

  loadFreshPracticeVariant() {
    const level = this.getCurrentLevel();
    const variants = level.variants || [];

    let chosen = '';
    if (variants.length > 0) {
      chosen = variants[this.currentVariantIndex % variants.length];
      this.currentVariantIndex++;
    } else {
      chosen = level.rawExpression;
    }

    this.loadLevel(this.currentZoneId, this.currentLevelIndex, chosen, false);
  }

  getCurrentZone() {
    return CURRICULUM_ZONES.find((z) => z.id === this.currentZoneId) || CURRICULUM_ZONES[0];
  }

  getCurrentLevel() {
    const zone = this.getCurrentZone();
    return zone.levels[this.currentLevelIndex] || zone.levels[0];
  }

  updateHUD() {
    const zone = this.getCurrentZone();
    const totalLevels = zone.levels.length;

    if (this.isCustomMode) {
      this.dom.badgeZone.textContent = 'Custom Sandbox';
      this.dom.hudLevelText.textContent = 'Custom Demolition';
    } else if (this.isWorkingOnDefect) {
      this.dom.badgeZone.textContent = '⚠️ DEFECT REPAIR';
      this.dom.hudLevelText.textContent = `Repairing Queued Defect (${this.remediationQueue.length + 1} remaining)`;
    } else {
      this.dom.badgeZone.textContent = zone.badge;
      this.dom.hudLevelText.textContent = `${zone.title} · Level ${this.currentLevelIndex + 1}/${totalLevels}`;
    }

    this.dom.hudScore.textContent = this.score;
    this.dom.hudStreak.textContent = `${this.streak}x`;

    this.updateQueueBadge();

    // Integrity Bar
    this.dom.integrityBar.style.width = `${this.structuralIntegrity}%`;
    this.dom.integrityText.textContent = `${this.structuralIntegrity}%`;

    if (this.structuralIntegrity > 60) {
      this.dom.integrityBar.className = 'h-full bg-emerald-500 shadow-[0_0_12px_#10b981] transition-all duration-300';
    } else if (this.structuralIntegrity > 20) {
      this.dom.integrityBar.className = 'h-full bg-amber-500 shadow-[0_0_12px_#f59e0b] transition-all duration-300';
    } else {
      this.dom.integrityBar.className = 'h-full bg-red-500 shadow-[0_0_16px_#ef4444] animate-pulse transition-all duration-300';
    }

    // Radar Button State
    if (this.radarActive) {
      this.dom.btnRadar.classList.add('bg-emerald-600', 'text-white', 'ring-2', 'ring-emerald-400');
    } else {
      this.dom.btnRadar.classList.remove('bg-emerald-600', 'text-white', 'ring-2', 'ring-emerald-400');
    }
  }

  updateQueueBadge() {
    const qLen = this.remediationQueue.length;
    this.dom.queueText.textContent = `Queue: ${qLen}/${this.MAX_QUEUE_CAP}`;

    if (qLen === 0) {
      this.dom.queueBadge.className = 'text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 transition-all';
    } else if (qLen === 1) {
      this.dom.queueBadge.className = 'text-xs font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1 transition-all shadow-[0_0_8px_rgba(245,158,11,0.3)]';
    } else if (qLen === 2) {
      this.dom.queueBadge.className = 'text-xs font-mono font-bold text-orange-300 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-800 flex items-center gap-1 transition-all shadow-[0_0_10px_rgba(249,115,22,0.4)]';
    } else {
      this.dom.queueBadge.className = 'text-xs font-mono font-bold text-rose-300 bg-rose-950/90 px-2 py-0.5 rounded border border-rose-700 flex items-center gap-1 transition-all shadow-[0_0_14px_rgba(244,63,94,0.6)] animate-pulse';
    }
  }

  renderPizza() {
    const container = this.dom.pizzaContainer;
    if (!container) return;
    container.innerHTML = '';

    const totalSteps = this.pizzaSteps.length;

    this.pizzaSteps.forEach((expr, idx) => {
      const isCrust = idx === 0;
      const isTip = idx === totalSteps - 1 && this.tokens.length === 1 && this.tokens[0].type === 'number';

      const widthPercent = Math.max(50, 100 - idx * 11);

      const stepCard = document.createElement('div');
      stepCard.className = 'pizza-step flex flex-col items-center justify-center transition-all duration-300';
      stepCard.style.width = `${widthPercent}%`;

      let innerContent = '';

      if (isCrust) {
        innerContent = `
          <div class="w-full bg-gradient-to-r from-sky-950 via-slate-900 to-sky-950 border border-sky-600/50 rounded-lg p-2 text-center shadow-md">
            <div class="flex items-center justify-center gap-1 text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest mb-0.5">
              <span>📐 Crust (Initial Model)</span>
            </div>
            <div class="font-mono-math font-bold text-xs md:text-sm text-sky-100 break-all select-all">
              ${expr}
            </div>
          </div>
        `;
      } else if (isTip) {
        const btnLabel = this.remediationQueue.length > 0 ? '👷 Defect Repaired ➔ Next' : '🏆 Complete Level ➔ Report';
        innerContent = `
          <div class="w-full bg-gradient-to-b from-emerald-950 to-slate-900 border-2 border-emerald-400 rounded-xl p-2 text-center shadow-[0_0_16px_rgba(16,185,129,0.5)]">
            <div class="flex items-center justify-center gap-1 text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-0.5">
              <span>⚡ Core Solution Tip</span>
            </div>
            <div class="font-mono-math font-black text-xl md:text-2xl text-emerald-300">
              ${expr}
            </div>
          </div>
          <button
            id="pizzaSuccessBtn"
            type="button"
            class="mt-2.5 w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse">
            <span>${btnLabel}</span>
          </button>
        `;
      } else {
        innerContent = `
          <div class="w-full bg-slate-950/80 border border-sky-900/60 rounded-lg p-1.5 text-center shadow-inner">
            <div class="text-[9px] font-mono text-sky-400/80 mb-0.5">
              Step ${idx}
            </div>
            <div class="font-mono-math font-semibold text-xs text-sky-200 break-all">
              ${expr}
            </div>
          </div>
        `;
      }

      stepCard.innerHTML = innerContent;
      container.appendChild(stepCard);
    });

    const successBtn = container.querySelector('#pizzaSuccessBtn');
    if (successBtn) {
      successBtn.addEventListener('click', () => {
        const finalVal =
          this.tokens.length === 1 && this.tokens[0].type === 'number'
            ? this.tokens[0].numericValue
            : parseFloat(this.pizzaSteps[this.pizzaSteps.length - 1]);
        this.handleLevelSuccess(finalVal);
      });
    }

    container.scrollTop = container.scrollHeight;
  }

  setTeleprompter(type, title, message) {
    this.dom.teleTitle.textContent = title;
    this.dom.teleMessage.textContent = message;

    this.dom.teleprompter.className = 'w-full max-w-7xl mx-auto bg-slate-900 border-t-2 border-slate-800 rounded-xl overflow-hidden shadow-2xl relative z-20 shrink-0';
    const topAccent = document.getElementById('teleAccentLine');

    if (type === 'fault') {
      topAccent.className = 'h-1.5 bg-red-500 shadow-[0_0_10px_#ef4444]';
      this.dom.teleIcon.textContent = '⚠️';
      this.dom.teleTitle.className = 'text-[11px] font-mono font-bold uppercase tracking-wider text-red-400';
    } else if (type === 'success') {
      topAccent.className = 'h-1.5 bg-emerald-500 shadow-[0_0_10px_#10b981]';
      this.dom.teleIcon.textContent = '✅';
      this.dom.teleTitle.className = 'text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400';
    } else if (type === 'collapse') {
      topAccent.className = 'h-1.5 hazard-stripes-danger';
      this.dom.teleIcon.textContent = '🚨';
      this.dom.teleTitle.className = 'text-[11px] font-mono font-bold uppercase tracking-wider text-rose-500';
    } else {
      topAccent.className = 'h-1.5 hazard-stripes-subtle';
      this.dom.teleIcon.textContent = '📟';
      this.dom.teleTitle.className = 'text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400';
    }
  }

  renderBeam() {
    const container = this.dom.beamContainer;
    container.innerHTML = '';

    const legalMove = getLegalNextMove(this.tokens);
    const fractionBarToken = this.tokens.find((t) => t.type === 'fraction_bar');

    if (fractionBarToken) {
      const numeratorTokens = this.tokens.filter((t) => t.tier === 'numerator');
      const denominatorTokens = this.tokens.filter((t) => t.tier === 'denominator');

      const wrap = document.createElement('div');
      wrap.className = 'relative w-full max-w-4xl mx-auto flex flex-col items-center gap-3 py-2 px-4';

      // Upper Girder
      const upperGirder = document.createElement('div');
      upperGirder.className = 'relative w-full flex flex-col items-center';
      upperGirder.innerHTML = `
        <div class="text-[10px] font-mono tracking-widest text-slate-400 mb-0.5 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>UPPER GIRDER · NUMERATOR</span>
        </div>
      `;
      const numContainer = this.createGirderBox();
      const numFlex = document.createElement('div');
      numFlex.className = 'flex flex-wrap items-center justify-center gap-2 p-2.5';
      numeratorTokens.forEach((t) => numFlex.appendChild(this.createTokenElement(t, legalMove)));
      numContainer.appendChild(numFlex);
      upperGirder.appendChild(numContainer);
      wrap.appendChild(upperGirder);

      // Central Dividing Piston
      const pistonBar = document.createElement('div');
      pistonBar.className = 'relative w-full max-w-xl flex items-center justify-center my-0.5';
      pistonBar.innerHTML = `
        <div class="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm"></div>
        <div class="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-4 bg-slate-700 border border-slate-500 rounded-sm"></div>
        <div class="w-full h-3 bg-gradient-to-r from-slate-700 via-amber-500 to-slate-700 rounded-full shadow-lg border border-slate-600 flex items-center justify-center relative"></div>
      `;
      const pistonBeam = pistonBar.querySelector('.bg-gradient-to-r');
      const pistonTokWrap = document.createElement('div');
      pistonTokWrap.className = 'absolute -top-6';
      pistonTokWrap.appendChild(this.createTokenElement(fractionBarToken, legalMove));
      pistonBeam.appendChild(pistonTokWrap);
      wrap.appendChild(pistonBar);

      // Lower Girder
      const lowerGirder = document.createElement('div');
      lowerGirder.className = 'relative w-full flex flex-col items-center';
      lowerGirder.innerHTML = `
        <div class="text-[10px] font-mono tracking-widest text-slate-400 mb-0.5 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>LOWER GIRDER · DENOMINATOR</span>
        </div>
      `;
      const denContainer = this.createGirderBox();
      const denFlex = document.createElement('div');
      denFlex.className = 'flex flex-wrap items-center justify-center gap-2 p-2.5';
      denominatorTokens.forEach((t) => denFlex.appendChild(this.createTokenElement(t, legalMove)));
      denContainer.appendChild(denFlex);
      lowerGirder.appendChild(denContainer);
      wrap.appendChild(lowerGirder);

      container.appendChild(wrap);
    } else {
      const wrap = document.createElement('div');
      wrap.className = 'relative w-full max-w-4xl mx-auto flex flex-col items-center py-4 px-4';
      const girderBox = this.createGirderBox();
      const tokenFlex = document.createElement('div');
      tokenFlex.className = 'flex flex-wrap items-center justify-center gap-2 p-3 md:p-4';

      this.tokens.forEach((t) => {
        tokenFlex.appendChild(this.createTokenElement(t, legalMove));
      });

      girderBox.appendChild(tokenFlex);
      wrap.appendChild(girderBox);
      container.appendChild(wrap);
    }
  }

  createGirderBox() {
    const box = document.createElement('div');
    box.className = 'relative w-full bg-slate-900/90 border-2 border-slate-700 rounded-2xl shadow-2xl overflow-hidden';
    box.innerHTML = `
      <div class="h-2 w-full hazard-stripes"></div>
      <div class="absolute top-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div class="absolute top-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div class="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
      <div class="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-slate-600 border border-slate-400"></div>
    `;
    return box;
  }

  createTokenElement(token, legalMove) {
    const el = document.createElement('div');
    el.id = `token-${token.id}`;
    el.dataset.tokenId = token.id;

    const isActive = token.id === this.activeOperatorId;
    const isLegal = legalMove && token.id === legalMove.legalTokenId;
    const isRadarActive = this.radarActive;

    if (token.type === 'number') {
      el.className = 'token-number px-3.5 md:px-5 py-2 md:py-2.5 bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-slate-600 rounded-xl metal-crate font-mono-math font-extrabold text-base md:text-xl text-slate-100 flex items-center justify-center shadow-md select-none transition-transform';
      el.textContent = token.value;
    } else if (token.type === 'operator' || token.type === 'fraction_bar') {
      const isPower = token.value === '^';
      const isMultDiv = token.value === '×' || token.value === '÷';

      let bgStyle = isPower
        ? 'from-purple-900 via-purple-950 to-slate-950 border-purple-500 text-purple-200'
        : isMultDiv
        ? 'from-sky-900 via-sky-950 to-slate-950 border-sky-500 text-sky-200'
        : 'from-amber-900 via-amber-950 to-slate-950 border-amber-500 text-amber-200';

      let activeClass = isActive
        ? 'ring-4 ring-amber-400 scale-105 shadow-[0_0_20px_rgba(245,158,11,0.6)]'
        : 'hover:scale-105';

      let radarClass = isRadarActive && isLegal
        ? 'ring-4 ring-emerald-400 animate-pulse shadow-[0_0_24px_rgba(16,185,129,0.9)]'
        : '';

      el.className = `token-operator cursor-pointer px-3 md:px-4 py-2 bg-gradient-to-b ${bgStyle} border-2 rounded-xl font-mono-math font-black text-lg md:text-xl flex items-center justify-center shadow-lg transition-all duration-200 ${activeClass} ${radarClass}`;
      el.textContent = token.value;

      el.addEventListener('mouseenter', () => {
        this.activeOperatorId = token.id;
        this.updateCranePosition();
        this.renderBeam();
      });

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeOperatorId = token.id;
        this.updateCranePosition();
        this.dropCrane();
      });
    } else if (token.type === 'open_paren' || token.type === 'close_paren') {
      el.className = 'px-1 py-1 text-cyan-400 font-mono-math font-extrabold text-xl md:text-2xl opacity-80 select-none';
      el.textContent = token.value;
    } else if (token.type === 'open_bracket' || token.type === 'close_bracket') {
      el.className = 'px-1 py-1 text-amber-400 font-mono-math font-extrabold text-xl md:text-2xl opacity-80 select-none';
      el.textContent = token.value;
    }

    return el;
  }

  updateCranePosition() {
    if (!this.activeOperatorId) return;
    const tokenEl = document.getElementById(`token-${this.activeOperatorId}`);
    if (!tokenEl || !this.dom.stage) return;

    const tokenRect = tokenEl.getBoundingClientRect();
    const stageRect = this.dom.stage.getBoundingClientRect();

    const targetX = tokenRect.left + tokenRect.width / 2 - stageRect.left;
    const targetY = tokenRect.top - stageRect.top;

    this.craneTargetX = targetX;
    this.dropTargetY = targetY;

    const legalMove = getLegalNextMove(this.tokens);
    const isLegal = legalMove && this.activeOperatorId === legalMove.legalTokenId;

    const lightEl = document.getElementById('trolleyLight');
    if (lightEl) {
      if (isLegal) {
        lightEl.className = 'w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] transition-all';
      } else {
        lightEl.className = 'w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] transition-all';
      }
    }
  }

  dropCrane() {
    if (this.isDropping || !this.activeOperatorId) return;

    this.isDropping = true;
    this.totalAttemptsInSession++;
    soundEngine.playHydraulicDrop();

    const operatorId = this.activeOperatorId;
    const validation = validateMove(this.tokens, operatorId);
    const tokenEl = document.getElementById(`token-${operatorId}`);
    const tokenRect = tokenEl ? tokenEl.getBoundingClientRect() : null;

    const cable = this.dom.cable;
    const ball = this.dom.ball;
    const dropDistance = Math.max(105, this.dropTargetY - 45);

    cable.style.transition = 'height 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
    ball.style.transition = 'transform 0.22s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
    cable.style.height = `${dropDistance}px`;
    ball.style.transform = `translateY(${dropDistance - 60}px)`;

    setTimeout(() => {
      const impactX = tokenRect ? tokenRect.left + tokenRect.width / 2 : window.innerWidth / 2;
      const impactY = tokenRect ? tokenRect.top + tokenRect.height / 2 : window.innerHeight / 2;

      // Add hydraulic recoil bounce animation
      ball.classList.add('animate-hydraulic-recoil');
      setTimeout(() => ball.classList.remove('animate-hydraulic-recoil'), 360);

      if (validation.isLegal) {
        soundEngine.playDropCrunch();
        this.triggerSparks(impactX, impactY, 'demolition');

        const { newTokens, step, didDissolveCage } = executeDemolitionStep(this.tokens, operatorId);
        step.stepNumber = this.stepsHistory.length + 1;
        this.stepsHistory.push(step);
        this.tokens = newTokens;

        const simplifiedText = tokensToText(newTokens);
        this.pizzaSteps.push(simplifiedText);
        this.renderPizza();

        this.score += 100 * this.streak;
        this.streak += 1;
        if (this.streak > this.highestStreak) this.highestStreak = this.streak;
        this.structuralIntegrity = Math.min(100, this.structuralIntegrity + 10);

        this.setTeleprompter(
          'success',
          'DEMOLITION CONFIRMED',
          `${step.subExpression} = ${step.result}. ${step.ruleExplanation}${didDissolveCage ? ' Grouping containment cage shattered!' : ''}`
        );

        if (this.tokens.length === 1 && this.tokens[0].type === 'number') {
          soundEngine.playVictory();
          this.triggerSparks(impactX, impactY, 'victory');

          this.dom.pizzaWindow.classList.remove('hidden');
          this.dom.btnPizzaToggle.classList.add('bg-amber-600', 'text-slate-950');
          this.dom.btnPizzaToggle.classList.remove('bg-slate-800', 'text-slate-300');

          this.setTeleprompter(
            'success',
            'PEMDAS PIZZA COMPLETE!',
            `Final answer reached: ${this.tokens[0].value}. Review your reduction steps in the Pizza Blueprint, then click the button below to continue!`
          );
        } else {
          const nextOp = this.tokens.find((t) => t.type === 'operator' || t.type === 'fraction_bar');
          this.activeOperatorId = nextOp ? nextOp.id : null;
        }

        this.updateHUD();
        this.renderBeam();
        this.retractCrane();

      } else {
        this.totalCollapsesInSession++;
        soundEngine.playFaultClank();
        soundEngine.playCollapseAlarm();
        this.triggerSparks(impactX, impactY, 'clank');

        this.dom.viewport.classList.add('animate-screen-shake');
        setTimeout(() => this.dom.viewport.classList.remove('animate-screen-shake'), 450);

        this.streak = 1;
        this.structuralIntegrity = 0;

        const alreadyQueued = this.remediationQueue.some((q) => q.expression === this.initialExpression);
        if (!alreadyQueued && !this.isCustomMode) {
          this.remediationQueue.push({
            zoneId: this.currentZoneId,
            levelIndex: this.currentLevelIndex,
            expression: this.initialExpression,
            ruleTitle: validation.ruleTitle,
            message: validation.message,
          });
        }

        this.updateQueueBadge();
        this.retractCrane();

        this.pendingValidation = validation;
        this.isCollapseBannerOpen = true;
        this.dom.collapseReasonText.textContent = `${validation.ruleTitle}: ${validation.message}`;
        this.dom.collapseBanner.classList.remove('opacity-0', 'pointer-events-none');
        this.dom.collapseBanner.classList.add('opacity-100');

        this.setTeleprompter(
          'collapse',
          'STRUCTURAL COLLAPSE - SITE EVACUATION',
          `Fault on "${this.initialExpression}". Queued for review. Press Space or click button to continue.`
        );
      }
    }, 230);
  }

  retractCrane() {
    const cable = this.dom.cable;
    const ball = this.dom.ball;

    setTimeout(() => {
      cable.style.transition = 'height 0.35s cubic-bezier(0.215, 0.61, 0.355, 1)';
      ball.style.transition = 'transform 0.35s cubic-bezier(0.215, 0.61, 0.355, 1)';
      cable.style.height = '60px';
      ball.style.transform = 'translateY(0px)';

      setTimeout(() => {
        this.isDropping = false;
        this.updateCranePosition();
      }, 360);
    }, 150);
  }

  dismissCollapse() {
    if (!this.isCollapseBannerOpen) return;
    this.isCollapseBannerOpen = false;

    this.dom.collapseBanner.classList.remove('opacity-100');
    this.dom.collapseBanner.classList.add('opacity-0', 'pointer-events-none');

    if (this.remediationQueue.length >= this.MAX_QUEUE_CAP) {
      this.showLockoutModal(this.pendingValidation);
    } else {
      this.loadFreshPracticeVariant();
    }
  }

  showLockoutModal(validation) {
    this.dom.lockoutRuleTitle.textContent = validation?.ruleTitle || 'Order of Operations Code';
    this.dom.lockoutRuleExplanation.textContent =
      validation?.message ||
      'Remember: Innermost parentheses ( ) first, then exponents (^), then multiplication/division (left-to-right), and finally addition/subtraction (left-to-right).';
    this.dom.lockoutModal.classList.remove('hidden');
  }

  openBossDilemma() {
    const challenge = getBossChallengeForZone(this.currentZoneId);
    if (!challenge) return;

    soundEngine.playReactorWarning();

    this.dom.bossTitle.textContent = challenge.title;
    this.dom.bossPrompt.textContent = challenge.prompt;
    this.dom.bossTargetVal.textContent = challenge.targetValue;

    this.dom.bossOptionsList.innerHTML = '';
    challenge.options.forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className =
        'w-full p-3 bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-amber-400 rounded-xl text-left transition-all flex items-center justify-between group active:scale-98';
      btn.innerHTML = `
        <div>
          <div class="font-mono-math font-bold text-sm text-slate-100 group-hover:text-amber-300">
            ${opt.expression}
          </div>
          <div class="text-[10px] text-slate-400 font-sans mt-0.5">
            Output: <strong class="text-sky-300 font-mono">${opt.value}</strong>
          </div>
        </div>
        <span class="text-xs font-mono font-bold text-slate-500 group-hover:text-amber-400">➔ Lock</span>
      `;

      btn.addEventListener('click', () => {
        if (opt.isCorrect) {
          soundEngine.playVictory();
          this.triggerSparks(window.innerWidth / 2, window.innerHeight / 2, 'victory');
          this.score += 500;
          this.dom.bossModal.classList.add('hidden');
          this.setTeleprompter(
            'success',
            'REACTOR CORE STABILIZED!',
            `Outstanding! ${opt.feedback}`
          );
          setTimeout(() => this.triggerVictory(challenge.targetValue), 1000);
        } else {
          soundEngine.playFaultClank();
          this.dom.viewport.classList.add('animate-screen-shake');
          setTimeout(() => this.dom.viewport.classList.remove('animate-screen-shake'), 450);
          this.setTeleprompter(
            'fault',
            'REACTOR BREACH IMMINENT',
            opt.feedback
          );
        }
      });

      this.dom.bossOptionsList.appendChild(btn);
    });

    this.dom.bossModal.classList.remove('hidden');
  }

  handleLevelSuccess(finalValue) {
    if (this.remediationQueue.length > 0) {
      soundEngine.playVictory();
      this.triggerSparks(window.innerWidth / 2, window.innerHeight / 2, 'victory');

      const defect = this.remediationQueue.shift();
      this.currentDefectItem = defect;
      this.updateQueueBadge();

      this.setTeleprompter(
        'success',
        'PRACTICE STABILIZED - RETURNING TO DEFECT',
        `Practice beam cleared! Returning to solve queued defect: ${defect.expression}`
      );

      setTimeout(() => {
        this.loadLevel(defect.zoneId, defect.levelIndex, defect.expression, true);
      }, 1400);

    } else {
      this.triggerVictory(finalValue);
    }
  }

  triggerVictory(finalValue) {
    soundEngine.playVictory();
    this.triggerSparks(window.innerWidth / 2, window.innerHeight / 2, 'victory');

    const currentZone = this.getCurrentZone();
    const totalLevels = currentZone.levels.length;

    // Compute Arcade Station Debrief Rating
    const precisionRate =
      this.totalAttemptsInSession > 0
        ? Math.round(
            ((this.totalAttemptsInSession - this.totalCollapsesInSession) /
              this.totalAttemptsInSession) *
              100
          )
        : 100;

    let rank = 'S';
    let rankColor = 'from-amber-400 to-amber-600 border-amber-300 text-slate-950';

    if (this.totalCollapsesInSession === 0) {
      rank = 'S';
      rankColor = 'from-amber-400 to-amber-600 border-amber-300 text-slate-950 shadow-[0_0_24px_rgba(245,158,11,0.6)]';
    } else if (this.totalCollapsesInSession === 1) {
      rank = 'A';
      rankColor = 'from-sky-400 to-sky-600 border-sky-300 text-slate-950 shadow-[0_0_20px_rgba(56,189,248,0.5)]';
    } else if (this.totalCollapsesInSession === 2) {
      rank = 'B';
      rankColor = 'from-amber-600 to-amber-800 border-amber-500 text-slate-100 shadow-[0_0_16px_rgba(245,158,11,0.4)]';
    } else {
      rank = 'C';
      rankColor = 'from-slate-600 to-slate-800 border-slate-500 text-slate-200';
    }

    if (this.dom.stationRankBadge) {
      this.dom.stationRankBadge.textContent = rank;
      this.dom.stationRankBadge.className = `w-16 h-16 rounded-2xl bg-gradient-to-br ${rankColor} font-black text-3xl flex items-center justify-center mb-3 border-2`;
    }

    // Elapsed Station Shift Time
    const elapsedSecs = Math.max(1, Math.round((Date.now() - this.stationStartTime) / 1000));
    const elapsedMins = Math.floor(elapsedSecs / 60);
    const elapsedSecsRem = elapsedSecs % 60;
    const elapsedStr = `${elapsedMins}:${elapsedSecsRem.toString().padStart(2, '0')}`;

    if (this.dom.victoryPrecision) this.dom.victoryPrecision.textContent = `${precisionRate}%`;
    if (this.dom.victoryTime) this.dom.victoryTime.textContent = elapsedStr;
    if (this.dom.victoryStreak) this.dom.victoryStreak.textContent = `${this.highestStreak}x`;

    try {
      window.parent.postMessage(
        {
          type: 'CARTRIDGE_COMPLETE',
          payload: {
            lessonId: 'G06_U03_L03',
            zoneId: this.currentZoneId,
            levelIndex: this.currentLevelIndex,
            score: this.score,
            total: totalLevels,
            finalValue: finalValue,
            rank: rank,
            precision: precisionRate,
          },
        },
        '*'
      );
    } catch {
      // ignore
    }

    this.dom.victoryResult.textContent = finalValue;
    this.dom.victoryLog.innerHTML = `
      <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
        Demolition Log (${this.initialExpression}):
      </div>
      <div class="space-y-1.5">
        ${this.stepsHistory
          .map(
            (s) => `
          <div class="flex items-start gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-mono">
            <span class="w-4 h-4 rounded bg-emerald-950 text-emerald-400 font-bold flex items-center justify-center shrink-0 border border-emerald-800 text-[10px]">
              ${s.stepNumber}
            </span>
            <div class="flex-1">
              <div class="flex items-center justify-between text-slate-200">
                <span class="text-amber-400 font-bold">${s.subExpression}</span>
                <span>➔</span>
                <span class="text-emerald-400 font-bold text-xs">${s.result}</span>
              </div>
              <p class="text-[9px] text-slate-400 font-sans mt-0.5">${s.ruleExplanation}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    this.dom.victoryModal.classList.remove('hidden');
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      // If collapse banner is open, hitting Space or Enter dismisses it
      if (this.isCollapseBannerOpen && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        this.dismissCollapse();
        return;
      }

      if (this.isDropping) return;

      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const ops = this.tokens.filter((t) => t.type === 'operator' || t.type === 'fraction_bar');
        if (ops.length === 0) return;

        const currentIdx = ops.findIndex((o) => o.id === this.activeOperatorId);
        let nextIdx = currentIdx;

        if (e.key === 'ArrowLeft') {
          nextIdx = currentIdx > 0 ? currentIdx - 1 : ops.length - 1;
        } else if (e.key === 'ArrowRight') {
          nextIdx = currentIdx < ops.length - 1 ? currentIdx + 1 : 0;
        }

        this.activeOperatorId = ops[nextIdx].id;
        this.updateCranePosition();
        this.renderBeam();
      } else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.dropCrane();
      }
    });

    if (this.dom.dismissCollapseBtn) {
      this.dom.dismissCollapseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dismissCollapse();
      });
    }

    if (this.dom.collapseBanner) {
      this.dom.collapseBanner.addEventListener('click', (e) => {
        if (e.target === this.dom.collapseBanner) {
          this.dismissCollapse();
        }
      });
    }

    if (this.dom.btnBossDilemma) {
      this.dom.btnBossDilemma.addEventListener('click', () => {
        this.openBossDilemma();
      });
    }

    if (this.dom.closeBossModalBtn) {
      this.dom.closeBossModalBtn.addEventListener('click', () => {
        this.dom.bossModal.classList.add('hidden');
      });
    }

    this.dom.btnPizzaToggle.addEventListener('click', () => {
      this.isPizzaVisible = !this.isPizzaVisible;
      if (this.isPizzaVisible) {
        this.dom.pizzaWindow.classList.remove('hidden');
        this.dom.btnPizzaToggle.classList.add('bg-amber-600', 'text-slate-950');
        this.dom.btnPizzaToggle.classList.remove('bg-slate-800', 'text-slate-300');
      } else {
        this.dom.pizzaWindow.classList.add('hidden');
        this.dom.btnPizzaToggle.classList.remove('bg-amber-600', 'text-slate-950');
        this.dom.btnPizzaToggle.classList.add('bg-slate-800', 'text-slate-300');
      }
    });

    if (this.dom.acknowledgeLockoutBtn) {
      this.dom.acknowledgeLockoutBtn.addEventListener('click', () => {
        this.dom.lockoutModal.classList.add('hidden');
        this.remediationQueue = [];
        this.updateQueueBadge();
        this.loadLevel(this.currentZoneId, this.currentLevelIndex);
      });
    }

    if (this.dom.btnMute) {
      this.dom.btnMute.addEventListener('click', () => {
        const current = soundEngine.getMuted();
        soundEngine.setMuted(!current);
        this.isMuted = !current;
        this.dom.btnMute.textContent = this.isMuted ? '🔇 Muted' : '🔊 Sound';
      });
    }

    if (this.dom.btnReset) {
      this.dom.btnReset.addEventListener('click', () => {
        this.loadLevel(
          this.currentZoneId,
          this.currentLevelIndex,
          this.isCustomMode ? this.customExpression : null
        );
      });
    }

    if (this.dom.btnSkip) {
      this.dom.btnSkip.addEventListener('click', () => {
        const zone = this.getCurrentZone();
        const nextIdx = (this.currentLevelIndex + 1) % zone.levels.length;
        this.loadLevel(this.currentZoneId, nextIdx);
      });
    }

    if (this.dom.btnRadar) {
      this.dom.btnRadar.addEventListener('click', () => {
        this.radarActive = !this.radarActive;
        soundEngine.playRadarPulse();
        this.updateHUD();
        this.renderBeam();
      });
    }

    if (this.dom.btnRules) {
      this.dom.btnRules.addEventListener('click', () => {
        this.dom.rulesModal.classList.remove('hidden');
      });
    }
    if (this.dom.closeRulesBtn) {
      this.dom.closeRulesBtn.addEventListener('click', () => {
        this.dom.rulesModal.classList.add('hidden');
      });
    }

    if (this.dom.btnZoneSelect) {
      this.dom.btnZoneSelect.addEventListener('click', () => {
        this.renderZoneList();
        this.dom.zoneModal.classList.remove('hidden');
      });
    }
    if (this.dom.closeZoneBtn) {
      this.dom.closeZoneBtn.addEventListener('click', () => {
        this.dom.zoneModal.classList.add('hidden');
      });
    }

    if (this.dom.btnSandbox) {
      this.dom.btnSandbox.addEventListener('click', () => {
        this.dom.sandboxModal.classList.remove('hidden');
        this.dom.sandboxInput.focus();
      });
    }
    if (this.dom.closeSandboxBtn) {
      this.dom.closeSandboxBtn.addEventListener('click', () => {
        this.dom.sandboxModal.classList.add('hidden');
      });
    }

    document.querySelectorAll('.sandbox-key').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.insert;
        if (this.dom.sandboxInput) {
          this.dom.sandboxInput.value += val;
          this.dom.sandboxInput.focus();
        }
      });
    });

    if (this.dom.sandboxForm) {
      this.dom.sandboxForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.dom.sandboxInput ? this.dom.sandboxInput.value.trim() : '';
        if (!input) return;
        this.dom.sandboxModal.classList.add('hidden');
        this.loadLevel(1, 0, input);
      });
    }

    if (this.dom.victoryNextBtn) {
      this.dom.victoryNextBtn.addEventListener('click', () => {
        this.dom.victoryModal.classList.add('hidden');
        const zone = this.getCurrentZone();
        if (this.currentLevelIndex < zone.levels.length - 1) {
          this.loadLevel(this.currentZoneId, this.currentLevelIndex + 1);
        } else {
          const nextZoneId = (this.currentZoneId % CURRICULUM_ZONES.length) + 1;
          this.loadLevel(nextZoneId, 0);
        }
      });
    }

    if (this.dom.victoryReplayBtn) {
      this.dom.victoryReplayBtn.addEventListener('click', () => {
        this.dom.victoryModal.classList.add('hidden');
        this.loadLevel(this.currentZoneId, this.currentLevelIndex);
      });
    }

    window.addEventListener('resize', () => {
      this.updateCranePosition();
    });
  }

  renderZoneList() {
    this.dom.zoneList.innerHTML = '';
    CURRICULUM_ZONES.forEach((zone) => {
      const zoneCard = document.createElement('div');
      zoneCard.className = 'p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3';
      zoneCard.innerHTML = `
        <div class="flex items-center justify-between">
          <div>
            <h4 class="font-extrabold text-sm text-slate-100">${zone.title}</h4>
            <p class="text-xs text-slate-400">${zone.subtitle}</p>
          </div>
          <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
            ${zone.badge}
          </span>
        </div>
        <div class="grid grid-cols-4 gap-2">
          ${zone.levels
            .map(
              (lvl, idx) => `
            <button
              class="zone-level-btn py-2 px-2.5 rounded-lg border text-xs font-mono font-bold transition-all ${
                this.currentZoneId === zone.id && this.currentLevelIndex === idx && !this.isCustomMode
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-black'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
              }"
              data-zone="${zone.id}"
              data-level="${idx}"
            >
              L${idx + 1}
            </button>
          `
            )
            .join('')}
        </div>
      `;

      zoneCard.querySelectorAll('.zone-level-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const zId = parseInt(btn.dataset.zone, 10);
          const lIdx = parseInt(btn.dataset.level, 10);
          this.dom.zoneModal.classList.add('hidden');
          this.loadLevel(zId, lIdx);
        });
      });

      this.dom.zoneList.appendChild(zoneCard);
    });
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    const dx = this.craneTargetX - this.craneX;
    this.craneX += dx * Math.min(1, dt * 14);

    if (this.dom.trolley) {
      this.dom.trolley.style.transform = `translateX(${this.craneX}px)`;
    }

    this.updateParticles();
    requestAnimationFrame(this.loop);
  }
}

function bootCraneGame() {
  if (!window.craneGameInstance) {
    window.craneGameInstance = new DemolitionCraneGame();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootCraneGame);
} else {
  bootCraneGame();
}
