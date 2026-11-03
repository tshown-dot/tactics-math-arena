/**
 * Term Popper - Game Engine
 * 2D Bubble Shooter for Combining Like Terms (Lesson 3-7 / 6.EE.A.3)
 * High-Stakes Edition: 4-Match Bursts, Ceiling Row Drops, Danger Line Fail State
 */

import {
  WAVES,
  doTermsMatch,
  getRandomTermForWave,
  getTermSignature
} from './problems.js';

import {
  BOSS_CHALLENGES,
  validateBossAnswer
} from './boss.js';

// Configuration & Physics Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const BUBBLE_RADIUS = 25;
const BUBBLE_DIAMETER = BUBBLE_RADIUS * 2;
const ROW_HEIGHT = BUBBLE_RADIUS * Math.sqrt(3); // ~43.30px hex row spacing
const COLS_EVEN = 16;
const COLS_ODD = 15;
const MAX_ROWS = 12;
const INITIAL_ROWS = 4;
const BULLET_SPEED = 14;

// High-Stakes Gameplay Rules
const MIN_CLUSTER_SIZE = 4;        // Must connect >= 4 matching like terms to pop
const ROW_DROP_SECONDS = 25;       // Time in seconds until ceiling shifts down
const DANGER_LINE_Y = 480;         // 80px above turret at y = 560

// Aim Angle Clamps: Strictly between 15° and 165°
const MIN_AIM_ANGLE = (15 * Math.PI) / 180;  // ~0.2618 rad
const MAX_AIM_ANGLE = (165 * Math.PI) / 180; // ~2.8798 rad

// Neutral Bubble Styling Palette (Zero Color-Coding)
const BUBBLE_STYLE = {
  gradStart: '#475569', // slate-600
  gradMid: '#1e293b',   // slate-800
  gradEnd: '#0f172a',   // slate-900
  border: '#64748b',    // slate-500
  glow: 'rgba(148, 163, 184, 0.25)',
  text: '#ffffff',
  highlight: 'rgba(255, 255, 255, 0.55)'
};

// Web Audio API Sound Synthesizer (Enhanced Arcade Audio)
class SoundFX {
  constructor() {
    this.ctx = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playLaser() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.14);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  playPop(clusterSize = 4) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;

    // Sub-bass thump
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, t);
    subOsc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
    subGain.gain.setValueAtTime(0.3, t);
    subGain.gain.linearRampToValueAtTime(0.01, t + 0.18);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(t);
    subOsc.stop(t + 0.18);

    // Harmonized burst chord arpeggio scaling with cluster size
    const chord = clusterSize >= 6 ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99];
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.035;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);
      gain.gain.setValueAtTime(0.22, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteTime);
      osc.stop(noteTime + 0.18);
    });
  }

  playBounce() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(560, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.06);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  playMismatch() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(170, t);
    osc.frequency.linearRampToValueAtTime(95, t + 0.22);
    gain.gain.setValueAtTime(0.22, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  playDropWarning() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    // Heavy mechanical clank
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.38);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.38);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  playWaveClear() {
    if (!this.ctx) return;
    const notes = [440, 554.37, 659.25, 880, 1108.7];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.09;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  playDefeat() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, this.ctx.currentTime + 0.7);
    gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.7);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.7);
  }

  playVictory() {
    if (!this.ctx) return;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = this.ctx.currentTime + idx * 0.12;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.26, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.32);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    });
  }
}

// Particle System for popping effects & sparks
class Particle {
  constructor(x, y, color = null, speedMult = 1, isSpark = false) {
    this.x = x;
    this.y = y;
    const angle = Math.random() * Math.PI * 2;
    const speed = (1.5 + Math.random() * 5) * speedMult;
    this.vx = Math.cos(angle) * speed;
    this.vy = Math.sin(angle) * speed;
    this.radius = isSpark ? (1.5 + Math.random() * 2) : (2 + Math.random() * 4);
    this.alpha = 1;
    this.decay = isSpark ? (0.04 + Math.random() * 0.04) : (0.02 + Math.random() * 0.025);
    this.color = color || (Math.random() > 0.4 ? '#38bdf8' : '#e2e8f0');
    this.isSpark = isSpark;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.isSpark ? 0.04 : 0.09;
    this.vx *= 0.98;
    this.alpha -= this.decay;
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = this.isSpark ? 6 : 3;
    ctx.beginPath();
    ctx.arc(this.x, this.y, Math.max(0.5, this.radius), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// Expanding Shockwave Ring on explosive bursts
class Shockwave {
  constructor(x, y, maxRadius = 75, color = 'rgba(56, 189, 248, 0.8)') {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.maxRadius = maxRadius;
    this.color = color;
    this.alpha = 1;
    this.growth = 4.5;
  }

  update() {
    this.radius += this.growth;
    this.alpha = Math.max(0, 1 - (this.radius / this.maxRadius));
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = Math.max(1, 4 * this.alpha);
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// Floating HUD / score notification with bounce animation
class ScorePopup {
  constructor(x, y, text, color = '#f8fafc', isBanner = false) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.alpha = 1;
    this.vy = -1.4;
    this.scale = 0.6;
    this.targetScale = isBanner ? 1.25 : 1.0;
    this.isBanner = isBanner;
  }

  update() {
    this.y += this.vy;
    this.alpha -= 0.015;
    if (this.scale < this.targetScale) {
      this.scale += (this.targetScale - this.scale) * 0.25;
    }
  }

  draw(ctx) {
    if (this.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.translate(this.x, this.y);
    ctx.scale(this.scale, this.scale);
    ctx.font = this.isBanner ? '900 20px "Inter", system-ui, sans-serif' : 'bold 16px "Inter", system-ui, sans-serif';
    ctx.fillStyle = this.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 8;
    ctx.fillText(this.text, 0, 0);
    ctx.restore();
  }
}

// Main Game Controller
export class TermPopperGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // HUD Elements
    this.hudWarning = document.getElementById('hudWarning');
    this.hudScore = document.getElementById('hudScore');
    this.hudWave = document.getElementById('hudWave');
    this.hudTarget = document.getElementById('hudTarget');
    this.hudDropCounter = document.getElementById('hudDropCounter');

    // Modals & Overlays
    this.completionOverlay = document.getElementById('completionOverlay');
    this.defeatOverlay = document.getElementById('defeatOverlay');
    this.waveBanner = document.getElementById('waveBanner');
    this.waveBannerTitle = document.getElementById('waveBannerTitle');
    this.waveBannerDesc = document.getElementById('waveBannerDesc');

    this.restartBtn = document.getElementById('restartBtn');
    this.retryWaveBtn = document.getElementById('retryWaveBtn');

    // Mission Briefing / Start Overlay
    this.startOverlay = document.getElementById('startOverlay');
    this.startBtn = document.getElementById('startBtn');
    this.btnBriefing = document.getElementById('btnBriefing');
    this.hasStarted = false;
    this.isBriefingOpen = false;

    // Boss Terminal Elements
    this.bossTerminalOverlay = document.getElementById('bossTerminalOverlay');
    this.bossTerminalCard = document.getElementById('bossTerminalCard');
    this.bossProblemCount = document.getElementById('bossProblemCount');
    this.bossInstruction = document.getElementById('bossInstruction');
    this.bossChainContainer = document.getElementById('bossChainContainer');
    this.bossFeedback = document.getElementById('bossFeedback');
    this.bossInput = document.getElementById('bossInput');
    this.bossSubmitBtn = document.getElementById('bossSubmitBtn');

    this.sfx = new SoundFX();

    // Turret Coordinates
    this.turretX = CANVAS_WIDTH / 2;
    this.turretY = 560;
    this.turretAngle = Math.PI / 2; // Straight up

    // Bullets & Queue
    this.activeBullet = null;
    this.currentTerm = null;
    this.nextTerm = null;

    // Grid & FX
    this.grid = [];
    this.particles = [];
    this.shockwaves = [];
    this.popups = [];
    this.trauma = 0;
    this.recoil = 0;
    this.laserDashOffset = 0;
    this.hudTimerBar = document.getElementById('hudTimerBar');
    this.hudPips = document.getElementById('hudPips');

    // Progressive Leveling & High-Stakes State
    this.currentWaveIndex = 0;       // 0: Wave 1, 1: Wave 2, 2: Wave 3
    this.waveMatches = 0;            // Number of 4+ clusters burst this wave
    this.totalScore = 0;
    this.rowDropTimer = ROW_DROP_SECONDS;
    this.lastTime = performance.now();
    this.totalDroppedRows = 0;       // Used to maintain hex parity on row drops
    this.isTransitioning = false;
    this.isDefeated = false;
    this.isCompleted = false;
    this.isBossPhase = false;
    this.currentBossIndex = 0;

    // Mouse Tracking
    this.mouseX = this.turretX;
    this.mouseY = 0;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startWave(0);
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  setupEventListeners() {
    const updateAim = (clientX, clientY) => {
      if (this.isDefeated || this.isCompleted) return;

      const rect = this.canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const scaleY = CANVAS_HEIGHT / rect.height;
      this.mouseX = (clientX - rect.left) * scaleX;
      this.mouseY = (clientY - rect.top) * scaleY;

      const dx = this.mouseX - this.turretX;
      const dy = this.turretY - this.mouseY;
      let angle = Math.atan2(dy, dx);

      // Clamp angle strictly between 15° and 165°
      if (angle < MIN_AIM_ANGLE) angle = MIN_AIM_ANGLE;
      if (angle > MAX_AIM_ANGLE) angle = MAX_AIM_ANGLE;

      this.turretAngle = angle;
    };

    this.canvas.addEventListener('mousemove', (e) => {
      updateAim(e.clientX, e.clientY);
    });

    this.canvas.addEventListener('click', () => {
      if (!this.hasStarted) return;
      this.sfx.init();
      this.fireBullet();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!e.touches.length) return;
      updateAim(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });

    this.canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      if (!this.hasStarted) return;
      this.sfx.init();
      this.fireBullet();
    });

    // Spacebar to fire (Chromebook trackpad accessibility)
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !this.isDefeated && !this.isCompleted && !this.isBossPhase && !this.isTransitioning && this.hasStarted) {
        // Only if target is not an input
        if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
        e.preventDefault();
        this.sfx.init();
        this.fireBullet();
      }
    });

    if (this.startBtn) {
      this.startBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (!this.hasStarted) {
          this.startGame();
        } else {
          this.closeBriefing();
        }
      });
    }

    if (this.btnBriefing) {
      this.btnBriefing.addEventListener('click', () => {
        this.openBriefing();
      });
    }

    if (this.restartBtn) {
      this.restartBtn.addEventListener('click', () => {
        this.currentWaveIndex = 0;
        this.totalScore = 0;
        this.isCompleted = false;
        this.isDefeated = false;
        this.isBossPhase = false;
        if (this.completionOverlay) this.completionOverlay.classList.add('hidden');
        if (this.defeatOverlay) this.defeatOverlay.classList.add('hidden');
        if (this.bossTerminalOverlay) this.bossTerminalOverlay.classList.add('hidden');
        this.startWave(0);
      });
    }

    if (this.retryWaveBtn) {
      this.retryWaveBtn.addEventListener('click', () => {
        this.isDefeated = false;
        this.isBossPhase = false;
        if (this.defeatOverlay) this.defeatOverlay.classList.add('hidden');
        if (this.bossTerminalOverlay) this.bossTerminalOverlay.classList.add('hidden');
        this.startWave(this.currentWaveIndex);
      });
    }

    // Boss Terminal On-Screen Helper Buttons
    document.querySelectorAll('.boss-key').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const insert = btn.getAttribute('data-insert');
        if (insert && this.bossInput) {
          const start = this.bossInput.selectionStart || this.bossInput.value.length;
          const end = this.bossInput.selectionEnd || this.bossInput.value.length;
          const val = this.bossInput.value;
          this.bossInput.value = val.substring(0, start) + insert + val.substring(end);
          this.bossInput.focus();
          const newPos = start + insert.length;
          this.bossInput.setSelectionRange(newPos, newPos);
        }
      });
    });

    if (this.bossSubmitBtn) {
      this.bossSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.submitBossAnswer();
      });
    }

    if (this.bossInput) {
      this.bossInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.submitBossAnswer();
        }
      });
    }
  }

  openBriefing() {
    this.isBriefingOpen = true;
    if (this.startBtn) {
      this.startBtn.innerHTML = '<span>🚀</span><span>RESUME MISSION</span>';
    }
    if (this.startOverlay) {
      this.startOverlay.classList.remove('hidden');
      requestAnimationFrame(() => {
        if (this.startOverlay) {
          this.startOverlay.classList.remove('opacity-0', 'pointer-events-none');
        }
      });
    }
  }

  closeBriefing() {
    this.isBriefingOpen = false;
    if (this.startOverlay) {
      this.startOverlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        if (this.startOverlay && !this.isBriefingOpen) {
          this.startOverlay.classList.add('hidden');
        }
      }, 300);
    }
  }

  startGame() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.isBriefingOpen = false;
    this.sfx.init();

    if (this.startOverlay) {
      this.startOverlay.classList.add('opacity-0', 'pointer-events-none');
      setTimeout(() => {
        if (this.startOverlay && !this.isBriefingOpen) this.startOverlay.classList.add('hidden');
      }, 300);
    }

    this.rowDropTimer = ROW_DROP_SECONDS;
    this.lastTime = performance.now();
    const config = this.getCurrentWaveConfig();
    this.showWaveBanner(`Wave ${config.waveNumber}`, config.title);
    this.updateHUD();
  }

  getCurrentWaveConfig() {
    return WAVES[this.currentWaveIndex] || WAVES[0];
  }

  isOddRow(r) {
    return ((r + this.totalDroppedRows) % 2 !== 0);
  }

  getColsInRow(r) {
    return this.isOddRow(r) ? COLS_ODD : COLS_EVEN;
  }

  getCellCenter(r, c) {
    const isOdd = this.isOddRow(r);
    const x = isOdd
      ? (BUBBLE_RADIUS * 2 + c * BUBBLE_DIAMETER)
      : (BUBBLE_RADIUS + c * BUBBLE_DIAMETER);
    const y = BUBBLE_RADIUS + r * ROW_HEIGHT;
    return { x, y };
  }

  startWave(waveIndex) {
    this.currentWaveIndex = waveIndex;
    this.waveMatches = 0;
    this.rowDropTimer = ROW_DROP_SECONDS;
    this.lastTime = performance.now();
    this.totalDroppedRows = 0;
    this.activeBullet = null;
    this.isTransitioning = false;
    this.isDefeated = false;
    this.isBossPhase = false;

    if (this.defeatOverlay) this.defeatOverlay.classList.add('hidden');
    if (this.completionOverlay) this.completionOverlay.classList.add('hidden');
    if (this.bossTerminalOverlay) this.bossTerminalOverlay.classList.add('hidden');

    const config = this.getCurrentWaveConfig();

    // Initialize honeycomb grid structure
    this.grid = [];
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      this.grid[r] = new Array(cols).fill(null);
    }

    // Populate initial rows with current wave terms
    for (let r = 0; r < INITIAL_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const { x, y } = this.getCellCenter(r, c);
        const term = getRandomTermForWave(config.waveNumber);
        this.grid[r][c] = { term, x, y, r, c };
      }
    }

    // Queue bubbles
    this.currentTerm = this.pickViableTerm();
    this.nextTerm = this.pickViableTerm();

    // Update HUD & show wave banner
    this.setWarning(config.description, "neutral");
    this.updateHUD();
    if (this.hasStarted) {
      this.showWaveBanner(`Wave ${config.waveNumber}`, config.title);
    }
  }

  showWaveBanner(mainText, subText) {
    if (!this.waveBanner) return;

    if (this.waveBannerTitle) this.waveBannerTitle.textContent = mainText;
    if (this.waveBannerDesc) this.waveBannerDesc.textContent = subText;

    this.waveBanner.classList.remove('opacity-0', 'pointer-events-none');
    this.waveBanner.classList.add('opacity-100');

    setTimeout(() => {
      if (this.waveBanner) {
        this.waveBanner.classList.remove('opacity-100');
        this.waveBanner.classList.add('opacity-0', 'pointer-events-none');
      }
    }, 1800);
  }

  pickViableTerm() {
    const config = this.getCurrentWaveConfig();
    const presentTerms = [];
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (this.grid[r][c]) {
          presentTerms.push(this.grid[r][c].term);
        }
      }
    }

    if (presentTerms.length > 0 && Math.random() < 0.8) {
      return presentTerms[Math.floor(Math.random() * presentTerms.length)];
    }
    return getRandomTermForWave(config.waveNumber);
  }

  fireBullet() {
    if (this.activeBullet || this.isTransitioning || this.isDefeated || this.isCompleted || this.isBossPhase || !this.hasStarted) return;

    // Tactile Juice: Laser Sound + Turret Recoil + Muzzle Sparks
    this.sfx.playLaser();
    this.recoil = 12;

    const muzzleDist = 44;
    const muzzleX = this.turretX + Math.cos(this.turretAngle) * muzzleDist;
    const muzzleY = this.turretY - Math.sin(this.turretAngle) * muzzleDist;
    for (let i = 0; i < 7; i++) {
      this.particles.push(new Particle(muzzleX, muzzleY, '#38bdf8', 0.9, true));
    }

    const speed = BULLET_SPEED;
    this.activeBullet = {
      x: this.turretX,
      y: this.turretY,
      vx: Math.cos(this.turretAngle) * speed,
      vy: -Math.sin(this.turretAngle) * speed,
      radius: BUBBLE_RADIUS,
      term: this.currentTerm
    };

    // Cycle queue
    this.currentTerm = this.nextTerm;
    this.nextTerm = this.pickViableTerm();
  }

  setWarning(msg, type = "error") {
    if (!this.hudWarning) return;
    this.hudWarning.textContent = msg;

    if (type === "neutral") {
      this.hudWarning.className = "text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 transition-all text-center";
    } else if (type === "error") {
      this.hudWarning.className = "text-xs font-bold px-3 py-1 rounded-full bg-rose-950/90 text-rose-300 border border-rose-500 animate-pulse transition-all text-center";
    } else if (type === "warning") {
      this.hudWarning.className = "text-xs font-bold px-3 py-1 rounded-full bg-amber-950/90 text-amber-300 border border-amber-500 transition-all text-center";
    } else if (type === "success") {
      this.hudWarning.className = "text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500 transition-all text-center";
    }
  }

  updateHUD() {
    const config = this.getCurrentWaveConfig();
    if (this.hudScore) this.hudScore.textContent = this.totalScore;
    if (this.hudWave) this.hudWave.textContent = `Wave: [${config.waveNumber}/3]`;

    if (this.hudTarget) {
      this.hudTarget.textContent = `Clusters: ${this.waveMatches}/${config.targetClusters}`;
    }

    // Update 10-Pip Progress Meter
    if (this.hudPips) {
      this.hudPips.innerHTML = '';
      const total = config.targetClusters || 10;
      for (let i = 0; i < total; i++) {
        const pip = document.createElement('div');
        const isFilled = i < this.waveMatches;
        pip.className = isFilled
          ? 'h-2 w-2 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,0.85)] transition-all scale-110'
          : 'h-1.5 w-1.5 rounded-full bg-slate-700/80 transition-all';
        this.hudPips.appendChild(pip);
      }
    }

    this.updateHUDTimer();
  }

  updateHUDTimer() {
    if (!this.hudDropCounter) return;
    const secs = Math.max(0, Math.ceil(this.rowDropTimer));
    this.hudDropCounter.textContent = `Row drop in: ${secs}s`;

    if (secs <= 4) {
      this.hudDropCounter.className = "text-xs font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800 animate-pulse";
    } else if (secs <= 8) {
      this.hudDropCounter.className = "text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800";
    } else {
      this.hudDropCounter.className = "text-xs font-mono font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700";
    }

    // Smooth Threat Gauge Bar
    if (this.hudTimerBar) {
      const pct = Math.max(0, Math.min(100, (this.rowDropTimer / ROW_DROP_SECONDS) * 100));
      this.hudTimerBar.style.width = `${pct}%`;
      if (pct <= 24) {
        this.hudTimerBar.className = 'h-full bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e] animate-pulse';
      } else if (pct <= 48) {
        this.hudTimerBar.className = 'h-full bg-amber-400 rounded-full shadow-[0_0_6px_#fbbf24]';
      } else {
        this.hudTimerBar.className = 'h-full bg-emerald-400 rounded-full shadow-[0_0_6px_#34d399]';
      }
    }
  }

  findSnapCell(bulletX, bulletY) {
    let closestCell = null;
    let minDistance = Infinity;

    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (!this.grid[r][c]) {
          const { x, y } = this.getCellCenter(r, c);
          const dist = Math.hypot(bulletX - x, bulletY - y);

          // Must be row 0 OR have an adjacent filled neighbor
          if (r === 0 || this.hasFilledNeighbor(r, c)) {
            if (dist < minDistance) {
              minDistance = dist;
              closestCell = { r, c, x, y };
            }
          }
        }
      }
    }
    return closestCell;
  }

  getNeighbors(r, c) {
    const neighbors = [];
    const isOdd = this.isOddRow(r);

    const offsets = isOdd
      ? [
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
          { dr: -1, dc: 0 },
          { dr: -1, dc: 1 },
          { dr: 1, dc: 0 },
          { dr: 1, dc: 1 }
        ]
      : [
          { dr: 0, dc: -1 },
          { dr: 0, dc: 1 },
          { dr: -1, dc: -1 },
          { dr: -1, dc: 0 },
          { dr: 1, dc: -1 },
          { dr: 1, dc: 0 }
        ];

    for (const { dr, dc } of offsets) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < MAX_ROWS) {
        const maxC = this.getColsInRow(nr);
        if (nc >= 0 && nc < maxC) {
          neighbors.push({ r: nr, c: nc });
        }
      }
    }
    return neighbors;
  }

  hasFilledNeighbor(r, c) {
    const neighbors = this.getNeighbors(r, c);
    return neighbors.some(({ r: nr, c: nc }) => this.grid[nr][nc] !== null);
  }

  findMatchingCluster(startR, startC, targetTerm) {
    const visited = new Set();
    const cluster = [];
    const queue = [{ r: startR, c: startC }];
    visited.add(`${startR},${startC}`);

    while (queue.length > 0) {
      const current = queue.shift();
      cluster.push(current);

      const neighbors = this.getNeighbors(current.r, current.c);
      for (const { r: nr, c: nc } of neighbors) {
        const key = `${nr},${nc}`;
        if (!visited.has(key)) {
          const neighborBubble = this.grid[nr][nc];
          if (neighborBubble && doTermsMatch(targetTerm, neighborBubble.term)) {
            visited.add(key);
            queue.push({ r: nr, c: nc });
          }
        }
      }
    }
    return cluster;
  }

  dropFloatingBubbles() {
    const visited = new Set();
    const queue = [];

    // All bubbles in row 0 are anchored
    const topCols = this.getColsInRow(0);
    for (let c = 0; c < topCols; c++) {
      if (this.grid[0][c]) {
        queue.push({ r: 0, c });
        visited.add(`0,${c}`);
      }
    }

    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const neighbors = this.getNeighbors(r, c);
      for (const { r: nr, c: nc } of neighbors) {
        const key = `${nr},${nc}`;
        if (!visited.has(key) && this.grid[nr][nc]) {
          visited.add(key);
          queue.push({ r: nr, c: nc });
        }
      }
    }

    let droppedCount = 0;
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (this.grid[r][c] && !visited.has(`${r},${c}`)) {
          const bubble = this.grid[r][c];
          this.spawnPopParticles(bubble.x, bubble.y);
          this.grid[r][c] = null;
          droppedCount++;
        }
      }
    }

    if (droppedCount > 0) {
      this.totalScore += droppedCount * 50;
      this.popups.push(new ScorePopup(CANVAS_WIDTH / 2, 200, `+${droppedCount * 50} Unattached Terms Dropped!`, '#94a3b8'));
    }
  }

  countGridBubbles() {
    let count = 0;
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        if (this.grid[r][c]) count++;
      }
    }
    return count;
  }

  spawnPopParticles(x, y) {
    for (let i = 0; i < 14; i++) {
      this.particles.push(new Particle(x, y));
    }
  }

  /**
   * Drops the entire ceiling cluster downward by 1 row and inserts a new top row
   */
  dropCeilingRow() {
    this.totalDroppedRows++;
    this.sfx.playDropWarning();
    this.trauma = Math.min(this.trauma + 8, 20);
    this.popups.push(new ScorePopup(CANVAS_WIDTH / 2, 100, "⚠️ CEILING DROP!", "#f43f5e", true));

    const newGrid = [];
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      newGrid[r] = new Array(cols).fill(null);
    }

    // Insert new top row (row 0)
    const newTopCols = this.getColsInRow(0);
    const config = this.getCurrentWaveConfig();
    for (let c = 0; c < newTopCols; c++) {
      const { x, y } = this.getCellCenter(0, c);
      const term = getRandomTermForWave(config.waveNumber);
      newGrid[0][c] = { term, x, y, r: 0, c };
    }

    // Shift previous rows down by 1
    for (let r = 0; r < MAX_ROWS - 1; r++) {
      const prevCols = this.grid[r].length;
      for (let c = 0; c < prevCols; c++) {
        const bubble = this.grid[r][c];
        if (bubble) {
          const targetR = r + 1;
          const targetC = c;
          const { x, y } = this.getCellCenter(targetR, targetC);
          newGrid[targetR][targetC] = {
            term: bubble.term,
            x,
            y,
            r: targetR,
            c: targetC
          };
        }
      }
    }

    this.grid = newGrid;
    this.rowDropTimer = ROW_DROP_SECONDS;
    this.updateHUD();

    // Check danger line breach after drop
    this.checkDangerLineBreach();
  }

  /**
   * Checks if any bubble's bottom edge crosses below the danger line
   */
  checkDangerLineBreach() {
    if (this.isDefeated || this.isCompleted) return;

    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.grid[r][c];
        if (bubble) {
          if (bubble.y + BUBBLE_RADIUS >= DANGER_LINE_Y) {
            this.triggerDefeat();
            return;
          }
        }
      }
    }
  }

  /**
   * Helper to check if any bubble is dangerously close to the shield line
   */
  isBubbleNearDanger() {
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.grid[r][c];
        if (bubble && bubble.y + BUBBLE_RADIUS >= DANGER_LINE_Y - 48) {
          return true;
        }
      }
    }
    return false;
  }

  triggerDefeat() {
    if (this.isDefeated) return;
    this.isDefeated = true;
    this.sfx.playDefeat();
    this.trauma = 20;

    this.setWarning("⚠️ CORE OVERLOAD - Danger Line Breached!", "error");
    if (this.defeatOverlay) {
      this.defeatOverlay.classList.remove('hidden');
    }
  }

  onBubbleSnap(snapCell, hitBubble) {
    const { r, c, x, y } = snapCell;
    const bulletTerm = this.activeBullet.term;

    // Check if hit bubble matches
    let isMatch = false;
    if (hitBubble) {
      isMatch = doTermsMatch(bulletTerm, hitBubble.term);
    } else {
      // Ceiling hit: test adjacent neighbors
      const neighbors = this.getNeighbors(r, c);
      for (const n of neighbors) {
        const nb = this.grid[n.r][n.c];
        if (nb && doTermsMatch(bulletTerm, nb.term)) {
          isMatch = true;
          break;
        }
      }
    }

    // Place bubble temporarily in grid to compute cluster
    this.grid[r][c] = { term: bulletTerm, x, y, r, c };
    const cluster = this.findMatchingCluster(r, c, bulletTerm);

    if (isMatch && cluster.length >= MIN_CLUSTER_SIZE) {
      // 4+ MATCH BURST SUCCESSFUL!
      this.sfx.playPop(cluster.length);
      this.trauma = Math.min(this.trauma + (cluster.length >= 6 ? 14 : 9), 22);

      // Expanding Shockwaves
      this.shockwaves.push(new Shockwave(x, y, 70 + cluster.length * 8, 'rgba(56, 189, 248, 0.85)'));
      this.shockwaves.push(new Shockwave(x, y, 36, 'rgba(255, 255, 255, 0.95)'));

      for (const cell of cluster) {
        const b = this.grid[cell.r][cell.c];
        if (b) {
          this.spawnPopParticles(b.x, b.y, true);
          this.grid[cell.r][cell.c] = null;
        }
      }

      const points = cluster.length * 100;
      this.totalScore += points;
      this.waveMatches++;

      this.setWarning(`Burst ${cluster.length} Like Terms! +${points}`, "success");
      this.popups.push(new ScorePopup(x, y - 22, `${cluster.length}x LIKE TERMS BURST!`, '#38bdf8', true));
      this.popups.push(new ScorePopup(x, y + 6, `+${points}`, '#34d399'));

      this.dropFloatingBubbles();
      this.updateHUD();

      // Check Wave clear condition
      const config = this.getCurrentWaveConfig();
      const remainingBubbles = this.countGridBubbles();
      if (this.waveMatches >= config.targetClusters || remainingBubbles === 0) {
        this.handleWaveClear();
      } else {
        this.checkDangerLineBreach();
      }
    } else {
      // BURST FAILED (Either mismatch OR cluster size < 4)
      this.sfx.playMismatch();
      this.trauma = Math.min(this.trauma + 4, 10);
      this.shockwaves.push(new Shockwave(x, y, 32, 'rgba(244, 63, 94, 0.5)'));

      if (isMatch && cluster.length < MIN_CLUSTER_SIZE) {
        // Matched, but cluster is under 4 bubbles
        this.setWarning(`Cluster too small! Need 4+ to burst (Current: ${cluster.length}/4)`, "warning");
        this.popups.push(new ScorePopup(x, y, `Cluster: ${cluster.length}/4`, '#fbbf24'));
      } else {
        // Unlike terms
        this.setWarning("Unlike terms cannot combine!", "error");
        this.popups.push(new ScorePopup(x, y, "Unlike Terms!", "#f43f5e"));
      }

      this.checkDangerLineBreach();
    }

    this.activeBullet = null;
  }

  handleWaveClear() {
    this.isTransitioning = true;
    this.sfx.playWaveClear();

    // Clear board with particles
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const b = this.grid[r][c];
        if (b) {
          this.spawnPopParticles(b.x, b.y);
          this.grid[r][c] = null;
        }
      }
    }

    const currentWaveNum = this.currentWaveIndex + 1;

    if (currentWaveNum >= 3) {
      // Completed Wave 3 -> Transition to Core Stabilization Terminal!
      setTimeout(() => {
        this.startBossPhase();
      }, 900);
    } else {
      const nextWaveNum = currentWaveNum + 1;
      this.showWaveBanner(`Wave ${currentWaveNum} Cleared!`, `Advancing to Wave ${nextWaveNum}...`);
      setTimeout(() => {
        this.startWave(this.currentWaveIndex + 1);
      }, 1600);
    }
  }

  startBossPhase() {
    this.isBossPhase = true;
    this.currentBossIndex = 0;
    this.activeBullet = null;
    this.isTransitioning = false;
    this.sfx.playWaveClear();

    if (this.waveBanner) this.waveBanner.classList.add('opacity-0', 'pointer-events-none');
    if (this.defeatOverlay) this.defeatOverlay.classList.add('hidden');
    if (this.completionOverlay) this.completionOverlay.classList.add('hidden');

    if (this.bossTerminalOverlay) {
      this.bossTerminalOverlay.classList.remove('hidden');
    }

    if (this.hudDropCounter) {
      this.hudDropCounter.textContent = "TERMINAL LOCKED";
      this.hudDropCounter.className = "text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800 animate-pulse";
    }

    this.renderBossChallenge();
  }

  renderBossChallenge() {
    const challenge = BOSS_CHALLENGES[this.currentBossIndex];
    if (!challenge) return;

    this.activeHighlightedTerm = null;

    if (this.bossProblemCount) {
      this.bossProblemCount.textContent = `Problem ${this.currentBossIndex + 1}/${BOSS_CHALLENGES.length}`;
    }

    if (this.bossInstruction) {
      this.bossInstruction.textContent = challenge.instruction;
    }

    if (this.bossChainContainer) {
      this.bossChainContainer.innerHTML = '';
      challenge.chainNodes.forEach((node) => {
        if (node.op) {
          const opSpan = document.createElement('span');
          opSpan.className = 'text-amber-400 font-bold font-mono text-lg px-1 select-none';
          opSpan.textContent = node.op;
          this.bossChainContainer.appendChild(opSpan);
        }
        const bubbleBtn = document.createElement('button');
        bubbleBtn.type = 'button';
        bubbleBtn.className = 'boss-chain-node px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-750 border border-slate-600 text-slate-100 font-bold text-sm shadow-md font-mono tracking-wide cursor-pointer transition-all active:scale-95';
        bubbleBtn.textContent = node.term;
        bubbleBtn.dataset.term = node.term;
        bubbleBtn.title = `Click to isolate like terms matching '${node.term}'`;
        bubbleBtn.addEventListener('click', () => {
          this.highlightLikeChainTerms(node.term);
        });
        this.bossChainContainer.appendChild(bubbleBtn);
      });
    }

    if (this.bossFeedback) {
      this.bossFeedback.className = "text-xs font-semibold px-4 py-2 rounded-lg bg-slate-900 text-slate-400 border border-slate-700 transition-all min-h-[38px] flex items-center justify-center max-w-lg mx-auto w-full";
      this.bossFeedback.textContent = "Terminal online. Combine all like terms and enter simplified form.";
    }

    if (this.bossInput) {
      this.bossInput.value = '';
      this.bossInput.focus();
    }
  }

  highlightLikeChainTerms(targetTerm) {
    if (!this.bossChainContainer) return;
    const isAlreadyActive = this.activeHighlightedTerm === targetTerm;
    this.activeHighlightedTerm = isAlreadyActive ? null : targetTerm;

    const nodes = this.bossChainContainer.querySelectorAll('.boss-chain-node');
    nodes.forEach(node => {
      const term = node.dataset.term;
      if (!isAlreadyActive && doTermsMatch(targetTerm, term)) {
        node.className = 'boss-chain-node px-3 py-1.5 rounded-full bg-sky-950/90 text-sky-200 border-2 border-sky-400 font-bold text-sm shadow-[0_0_12px_rgba(56,189,248,0.6)] font-mono tracking-wide scale-105 transition-all';
      } else {
        node.className = 'boss-chain-node px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-100 font-bold text-sm shadow-md font-mono tracking-wide transition-all';
      }
    });

    if (!isAlreadyActive && this.bossFeedback) {
      this.bossFeedback.className = "text-xs font-semibold px-4 py-2 rounded-lg bg-sky-950/80 text-sky-300 border border-sky-600 transition-all min-h-[38px] flex items-center justify-center max-w-lg mx-auto w-full";
      this.bossFeedback.textContent = `Highlighted all like terms matching '${targetTerm}'`;
    }
  }

  submitBossAnswer() {
    const challenge = BOSS_CHALLENGES[this.currentBossIndex];
    if (!challenge || !this.bossInput) return;

    const studentInput = this.bossInput.value.trim();
    const result = validateBossAnswer(studentInput, challenge);

    if (result.correct) {
      this.sfx.playWaveClear();
      if (this.bossFeedback) {
        this.bossFeedback.className = "text-xs font-bold px-4 py-2 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-500 transition-all min-h-[38px] flex items-center justify-center max-w-lg mx-auto w-full";
        this.bossFeedback.textContent = `✓ ${result.feedback}`;
      }

      if (this.currentBossIndex + 1 < BOSS_CHALLENGES.length) {
        this.currentBossIndex++;
        setTimeout(() => {
          this.renderBossChallenge();
        }, 1300);
      } else {
        setTimeout(() => {
          this.triggerFinalVictory();
        }, 1200);
      }
    } else {
      this.sfx.playMismatch();
      this.trauma = Math.min(this.trauma + 8, 15);

      if (this.bossTerminalCard) {
        this.bossTerminalCard.classList.remove('animate-shake');
        void this.bossTerminalCard.offsetWidth; // Force reflow
        this.bossTerminalCard.classList.add('animate-shake');
        setTimeout(() => {
          if (this.bossTerminalCard) this.bossTerminalCard.classList.remove('animate-shake');
        }, 450);
      }

      if (this.bossFeedback) {
        this.bossFeedback.className = "text-xs font-bold px-4 py-2 rounded-lg bg-rose-950/90 text-rose-300 border border-rose-500 transition-all min-h-[38px] flex items-center justify-center max-w-lg mx-auto w-full";
        this.bossFeedback.textContent = `⚠️ ${result.feedback}`;
      }

      this.bossInput.focus();
    }
  }

  triggerFinalVictory() {
    if (this.bossTerminalOverlay) {
      this.bossTerminalOverlay.classList.add('hidden');
    }
    this.isBossPhase = false;
    this.isCompleted = true;
    this.sfx.playVictory();

    console.log("CARTRIDGE_COMPLETE: Lesson 3-7 Mastered! Score: 10/10");
    window.parent.postMessage({
      type: "CARTRIDGE_COMPLETE",
      payload: {
        lessonId: "G06_U03_L07",
        score: 10,
        total: 10
      }
    }, "*");

    if (this.completionOverlay) {
      this.completionOverlay.classList.remove('hidden');
    }
  }

  update(dt = 0.016) {
    if (this.isDefeated || this.isCompleted || this.isBossPhase || !this.hasStarted || this.isBriefingOpen) return;

    // Camera trauma decay
    if (this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 22);
    }
    // Turret recoil spring decay
    if (this.recoil > 0) {
      this.recoil = Math.max(0, this.recoil - dt * 45);
    }
    // Laser animated dash
    this.laserDashOffset = (this.laserDashOffset || 0) - dt * 38;

    // Continuous row drop countdown timer
    if (!this.isTransitioning) {
      this.rowDropTimer -= dt;
      if (this.rowDropTimer <= 0) {
        this.dropCeilingRow();
      }
      this.updateHUDTimer();
    }

    if (this.activeBullet) {
      const b = this.activeBullet;
      b.x += b.vx;
      b.y += b.vy;

      // Left wall bounce
      if (b.x - b.radius <= 0) {
        b.x = b.radius;
        b.vx = -b.vx;
        this.sfx.playBounce();
      }
      // Right wall bounce
      else if (b.x + b.radius >= CANVAS_WIDTH) {
        b.x = CANVAS_WIDTH - b.radius;
        b.vx = -b.vx;
        this.sfx.playBounce();
      }

      // Ceiling collision
      if (b.y - b.radius <= 0) {
        const snapCell = this.findSnapCell(b.x, b.y);
        if (snapCell) {
          this.onBubbleSnap(snapCell, null);
        } else {
          this.activeBullet = null;
        }
        return;
      }

      // Grid collision
      for (let r = 0; r < MAX_ROWS; r++) {
        const cols = this.getColsInRow(r);
        for (let c = 0; c < cols; c++) {
          const gridBubble = this.grid[r][c];
          if (gridBubble) {
            const dist = Math.hypot(b.x - gridBubble.x, b.y - gridBubble.y);
            if (dist <= BUBBLE_DIAMETER - 2) {
              const snapCell = this.findSnapCell(b.x, b.y);
              if (snapCell) {
                this.onBubbleSnap(snapCell, gridBubble);
              } else {
                this.activeBullet = null;
              }
              return;
            }
          }
        }
      }
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      this.shockwaves[i].update();
      if (this.shockwaves[i].alpha <= 0) {
        this.shockwaves.splice(i, 1);
      }
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      this.particles[i].update();
      if (this.particles[i].alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update popups
    for (let i = this.popups.length - 1; i >= 0; i--) {
      this.popups[i].update();
      if (this.popups[i].alpha <= 0) {
        this.popups.splice(i, 1);
      }
    }
  }

  drawBubble(x, y, radius, term) {
    const ctx = this.ctx;
    ctx.save();

    // Outer soft ambient glow
    ctx.shadowColor = 'rgba(56, 189, 248, 0.18)';
    ctx.shadowBlur = 8;

    // 3D metallic cyber sphere gradient (neutral palette preserved)
    const grad = ctx.createRadialGradient(
      x - radius * 0.35,
      y - radius * 0.4,
      radius * 0.08,
      x,
      y,
      radius
    );
    grad.addColorStop(0, '#94a3b8');
    grad.addColorStop(0.25, '#475569');
    grad.addColorStop(0.7, '#1e293b');
    grad.addColorStop(1, '#090d16');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner glowing core ring
    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.85, 0, Math.PI * 2);
    ctx.stroke();

    // Outer bevel rim
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Specular highlight arc along the top edge
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.78, -Math.PI * 0.75, -Math.PI * 0.25);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // High-contrast mathematical term typography
    ctx.font = '900 16px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.98)';
    ctx.shadowBlur = 6;
    ctx.fillText(term, x, y);

    ctx.restore();
  }

  drawTrajectory() {
    if (this.activeBullet || this.isTransitioning || this.isDefeated || this.isCompleted || this.isBossPhase || !this.hasStarted) return;

    const ctx = this.ctx;
    ctx.save();

    // Animated pulsating laser dash
    ctx.setLineDash([8, 8]);
    ctx.lineDashOffset = this.laserDashOffset || 0;
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
    ctx.shadowBlur = 6;

    const leftWall = BUBBLE_RADIUS;
    const rightWall = CANVAS_WIDTH - BUBBLE_RADIUS;
    const ceiling = BUBBLE_RADIUS;

    let currX = this.turretX;
    let currY = this.turretY;
    let angle = this.turretAngle;
    let finalHitX = currX;
    let finalHitY = currY;

    ctx.beginPath();
    ctx.moveTo(currX, currY);

    for (let bounce = 0; bounce < 2; bounce++) {
      let dx = Math.cos(angle);
      let dy = -Math.sin(angle);

      const tCeil = (ceiling - currY) / dy;
      let tWall = Infinity;
      let targetWallX = currX;

      if (dx > 0.0001) {
        tWall = (rightWall - currX) / dx;
        targetWallX = rightWall;
      } else if (dx < -0.0001) {
        tWall = (leftWall - currX) / dx;
        targetWallX = leftWall;
      }

      if (tCeil <= tWall) {
        const hitX = currX + tCeil * dx;
        ctx.lineTo(hitX, ceiling);
        finalHitX = hitX;
        finalHitY = ceiling;
        break;
      } else {
        const hitX = targetWallX;
        const hitY = currY + tWall * dy;
        ctx.lineTo(hitX, hitY);

        currX = hitX;
        currY = hitY;
        finalHitX = hitX;
        finalHitY = hitY;
        angle = Math.PI - angle;
      }
    }

    ctx.stroke();

    // Reticle at terminal target point
    const pulse = 1 + 0.15 * Math.sin(performance.now() * 0.008);
    ctx.setLineDash([]);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(finalHitX, finalHitY, 6 * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(finalHitX, finalHitY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawDangerLine() {
    const ctx = this.ctx;
    ctx.save();

    const isNearBreach = this.isBubbleNearDanger();
    const time = performance.now() * 0.006;
    const strobe = isNearBreach ? (0.6 + 0.4 * Math.sin(time * 2)) : 1;

    // Shaded warning zone below the danger line
    const redZone = ctx.createLinearGradient(0, DANGER_LINE_Y, 0, CANVAS_HEIGHT);
    const topAlpha = isNearBreach ? (0.22 * strobe) : 0.12;
    redZone.addColorStop(0, `rgba(239, 68, 68, ${topAlpha})`);
    redZone.addColorStop(1, 'rgba(239, 68, 68, 0.02)');
    ctx.fillStyle = redZone;
    ctx.fillRect(0, DANGER_LINE_Y, CANVAS_WIDTH, CANVAS_HEIGHT - DANGER_LINE_Y);

    // Dashed red line with glow
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = isNearBreach ? `rgba(244, 63, 94, ${strobe})` : '#ef4444';
    ctx.lineWidth = isNearBreach ? 2.8 : 2;
    if (isNearBreach) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12 * strobe;
    }
    ctx.beginPath();
    ctx.moveTo(0, DANGER_LINE_Y);
    ctx.lineTo(CANVAS_WIDTH, DANGER_LINE_Y);
    ctx.stroke();

    // Danger line label badge
    ctx.font = 'bold 11px "Inter", system-ui, sans-serif';
    ctx.fillStyle = isNearBreach ? `rgba(244, 63, 94, ${strobe})` : '#ef4444';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    const label = isNearBreach ? '🚨 CRITICAL: IMMINENT OVERLOAD' : '⚠️ SHIELD DANGER LINE';
    ctx.fillText(label, CANVAS_WIDTH - 16, DANGER_LINE_Y - 6);

    ctx.restore();
  }

  drawTurret() {
    const ctx = this.ctx;
    ctx.save();

    // Turret Base Platform
    const baseGrad = ctx.createLinearGradient(this.turretX - 42, 0, this.turretX + 42, 0);
    baseGrad.addColorStop(0, '#1e293b');
    baseGrad.addColorStop(0.5, '#334155');
    baseGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = baseGrad;
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(this.turretX, this.turretY, 42, Math.PI, 0);
    ctx.fill();
    ctx.stroke();

    // Inner energy ring on platform
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.turretX, this.turretY, 34, Math.PI, 0);
    ctx.stroke();

    // Turret Barrel with Recoil Kickback
    ctx.save();
    ctx.translate(this.turretX, this.turretY);
    ctx.rotate(Math.PI / 2 - this.turretAngle);

    const kick = this.recoil || 0;
    ctx.translate(0, kick);

    // Barrel housing
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.fillRect(-12, -22, 24, 22);
    ctx.strokeRect(-12, -22, 24, 22);

    // Main dual rail barrel
    const barrelGrad = ctx.createLinearGradient(-9, 0, 9, 0);
    barrelGrad.addColorStop(0, '#334155');
    barrelGrad.addColorStop(0.5, '#64748b');
    barrelGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = barrelGrad;
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.fillRect(-9, -54, 18, 36);
    ctx.strokeRect(-9, -54, 18, 36);

    // Glowing muzzle energy coil
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-10, -56, 20, 3);

    ctx.restore();

    // Loaded Bubble
    if (this.currentTerm && !this.activeBullet) {
      this.drawBubble(this.turretX, this.turretY, BUBBLE_RADIUS, this.currentTerm);
    }

    // Queue Preview Bubble
    const previewX = this.turretX - 95;
    const previewY = this.turretY + 5;
    ctx.font = 'bold 11px "Inter", system-ui, sans-serif';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.fillText("NEXT", previewX, previewY - 26);
    if (this.nextTerm) {
      this.drawBubble(previewX, previewY, BUBBLE_RADIUS * 0.75, this.nextTerm);
    }

    ctx.restore();
  }

  draw() {
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.ctx.save();

    // Camera Screen Shake
    if (this.trauma > 0) {
      const shakeAmt = this.trauma * (this.trauma / 18);
      const shakeX = (Math.random() * 2 - 1) * shakeAmt;
      const shakeY = (Math.random() * 2 - 1) * shakeAmt;
      this.ctx.translate(shakeX, shakeY);
    }

    // Playfield background: deep cosmic cyber-grid
    this.ctx.fillStyle = '#090d16';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Ambient micro-dots
    this.ctx.fillStyle = 'rgba(148, 163, 184, 0.05)';
    for (let x = 20; x < CANVAS_WIDTH; x += 40) {
      for (let y = 20; y < CANVAS_HEIGHT; y += 40) {
        this.ctx.fillRect(x, y, 2, 2);
      }
    }

    // Danger / Shield Line
    this.drawDangerLine();

    // Aiming trajectory & Reticle
    this.drawTrajectory();

    // Grid bubbles
    for (let r = 0; r < MAX_ROWS; r++) {
      const cols = this.getColsInRow(r);
      for (let c = 0; c < cols; c++) {
        const bubble = this.grid[r][c];
        if (bubble) {
          this.drawBubble(bubble.x, bubble.y, BUBBLE_RADIUS, bubble.term);
        }
      }
    }

    // Active bullet
    if (this.activeBullet) {
      this.drawBubble(
        this.activeBullet.x,
        this.activeBullet.y,
        this.activeBullet.radius,
        this.activeBullet.term
      );
    }

    // Turret
    this.drawTurret();

    // Shockwaves
    for (const sw of this.shockwaves) {
      sw.draw(this.ctx);
    }

    // Particles
    for (const p of this.particles) {
      p.draw(this.ctx);
    }

    // Popups
    for (const popup of this.popups) {
      popup.draw(this.ctx);
    }

    this.ctx.restore();
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp || performance.now();
    const now = timestamp || performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.update(dt);
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// Auto-instantiate when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.gameInstance = new TermPopperGame();
});
