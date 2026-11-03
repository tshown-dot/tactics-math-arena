/**
 * Power Grid: Pulse Interceptor - Main Game Engine
 * Strictly visual, minimal text, instant intuitive gameplay.
 * The player places a breaker to catch the FIRST joint collision of alternating pulses!
 */

import {
  parseMathInput,
  evaluatePlacement,
  getMultiples,
  lcmMultiple,
  EVALUATION_RESULTS,
} from './lcmLogic.js';

import {
  CURRICULUM_SECTORS,
  generateScenarioForSector,
} from './curriculum.js';

import { soundEngine } from './audio.js';

class PulseInterceptorGame {
  constructor() {
    this.sectorIndex = 0; // 0 to 4
    this.roundInSector = 1; // 1 to 3
    this.targetWinsPerSector = 3;

    // Active generator frequencies
    this.generators = [4, 6];

    // Score & Streak
    this.score = 0;
    this.streak = 0;
    this.comboMultiplier = 1;

    // Timer
    this.timeRemaining = 50;
    this.timerInterval = null;

    // Flags
    this.isFiring = false;
    this.isModalOpen = true;
    this.isBriefingOpen = true;

    // DOM references
    this.dom = {};
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.buildGrid();
    this.loadRound(0, 1);
  }

  cacheDom() {
    this.dom.gameRoot = document.getElementById('game-root');
    this.dom.gridBoard = document.getElementById('grid-100');
    this.dom.sectorBadge = document.getElementById('sector-badge');
    this.dom.roundBadge = document.getElementById('round-badge');
    this.dom.scoreDisplay = document.getElementById('score-display');
    this.dom.streakBadge = document.getElementById('streak-badge');
    this.dom.timerDisplay = document.getElementById('timer-display');
    this.dom.helpBtn = document.getElementById('help-btn');
    this.dom.muteBtn = document.getElementById('mute-btn');

    // Generator Displays & Buttons
    this.dom.btnWaveA = document.getElementById('btn-wave-a');
    this.dom.genAValue = document.getElementById('gen-a-value');
    this.dom.genASeq = document.getElementById('gen-a-seq');

    this.dom.btnWaveB = document.getElementById('btn-wave-b');
    this.dom.genBValue = document.getElementById('gen-b-value');
    this.dom.genBSeq = document.getElementById('gen-b-seq');

    this.dom.btnWaveC = document.getElementById('gen-c-card');
    this.dom.genCValue = document.getElementById('gen-c-value');
    this.dom.genCSeq = document.getElementById('gen-c-seq');

    this.dom.targetTilePill = document.getElementById('target-tile-pill');

    // Action Bar & Input
    this.dom.actionIcon = document.getElementById('action-icon');
    this.dom.actionMsg = document.getElementById('action-msg');
    this.dom.tileInput = document.getElementById('tile-input');
    this.dom.quickFireBtn = document.getElementById('quick-fire-btn');

    // Modals
    this.dom.briefingModal = document.getElementById('briefing-modal');
    this.dom.briefingStartBtn = document.getElementById('briefing-start-btn');

    this.dom.failModal = document.getElementById('fail-modal');
    this.dom.failTitle = document.getElementById('fail-title');
    this.dom.failMsg = document.getElementById('fail-msg');
    this.dom.failRetryBtn = document.getElementById('fail-retry-btn');

    this.dom.successModal = document.getElementById('success-modal');
    this.dom.successMsg = document.getElementById('success-msg');
    this.dom.successNextBtn = document.getElementById('success-next-btn');
    this.dom.successSaveBtn = document.getElementById('success-save-btn');
  }

  bindEvents() {
    // Wave Alpha & Beta interactive pulse buttons
    this.dom.btnWaveA?.addEventListener('click', () => {
      this.sendSingleWavePulse('A');
    });

    this.dom.btnWaveB?.addEventListener('click', () => {
      this.sendSingleWavePulse('B');
    });

    this.dom.btnWaveC?.addEventListener('click', () => {
      this.sendSingleWavePulse('C');
    });

    // Quick type & fire button
    this.dom.quickFireBtn?.addEventListener('click', () => {
      this.handleInputFire();
    });

    this.dom.tileInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.handleInputFire();
      }
    });

    // Modal & Briefing buttons
    this.dom.briefingStartBtn?.addEventListener('click', () => {
      this.closeBriefing();
    });

    this.dom.helpBtn?.addEventListener('click', () => {
      this.openBriefing();
    });

    this.dom.failRetryBtn?.addEventListener('click', () => {
      this.closeModals();
      this.loadRound(this.sectorIndex, this.roundInSector);
    });

    this.dom.successNextBtn?.addEventListener('click', () => {
      this.advanceWave();
    });

    this.dom.successSaveBtn?.addEventListener('click', () => {
      this.completeCartridgeRun();
    });

    // Mute toggle
    this.dom.muteBtn?.addEventListener('click', () => {
      const isMuted = soundEngine.toggleMute();
      this.updateMuteUI(isMuted);
    });
    this.updateMuteUI(soundEngine.getMuted());

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (this.isModalOpen) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          if (this.isBriefingOpen) {
            this.closeBriefing();
          } else if (!this.dom.successModal?.classList.contains('hidden')) {
            this.advanceWave();
          } else {
            this.closeModals();
            this.loadRound(this.sectorIndex, this.roundInSector);
          }
        }
      } else if (e.key === 'm' || e.key === 'M') {
        const isMuted = soundEngine.toggleMute();
        this.updateMuteUI(isMuted);
      } else if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        this.openBriefing();
      }
    });
  }

  updateMuteUI(isMuted) {
    if (this.dom.muteBtn) {
      this.dom.muteBtn.textContent = isMuted ? '🔇' : '🔊';
      this.dom.muteBtn.className = isMuted
        ? 'px-2 py-1 text-xs font-mono-math font-bold rounded-lg border border-slate-700 bg-slate-900 text-slate-500 cursor-pointer'
        : 'px-2 py-1 text-xs font-mono-math font-bold rounded-lg border border-cyan-500/40 bg-cyan-950/40 text-cyan-400 cursor-pointer';
    }
  }

  buildGrid() {
    if (!this.dom.gridBoard) return;
    this.dom.gridBoard.innerHTML = '';

    for (let tileNum = 1; tileNum <= 100; tileNum++) {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.id = `tile-${tileNum}`;
      tile.dataset.tile = String(tileNum);
      tile.className =
        'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm text-slate-300 border border-slate-800/80 bg-slate-950/80 hover:border-cyan-400 hover:bg-cyan-950/60 hover:text-cyan-200 transition-colors cursor-pointer shadow-sm overflow-hidden select-none';
      tile.textContent = tileNum;

      tile.addEventListener('click', () => {
        if (this.isFiring || this.isModalOpen) return;
        this.launchBreakerAtTile(tileNum);
      });

      this.dom.gridBoard.appendChild(tile);
    }
  }

  loadRound(secIdx, roundNum = 1) {
    this.sectorIndex = Math.max(0, Math.min(secIdx, CURRICULUM_SECTORS.length - 1));
    this.roundInSector = roundNum;
    const sector = CURRICULUM_SECTORS[this.sectorIndex];

    // Pick generators
    this.generators = generateScenarioForSector(sector.id, this.generators);
    const genA = this.generators[0];
    const genB = this.generators[1];

    // Update Header Badges
    if (this.dom.sectorBadge) this.dom.sectorBadge.textContent = sector.codename;
    if (this.dom.roundBadge) this.dom.roundBadge.textContent = `ROUND ${this.roundInSector}/${this.targetWinsPerSector}`;

    // Generator Displays
    if (this.dom.genAValue) this.dom.genAValue.textContent = genA;
    if (this.dom.genASeq) {
      const multA = getMultiples(genA, 30);
      this.dom.genASeq.textContent = `${multA.slice(0, 4).join(', ')}...`;
    }

    if (this.dom.genBValue) this.dom.genBValue.textContent = genB;
    if (this.dom.genBSeq) {
      const multB = getMultiples(genB, 30);
      this.dom.genBSeq.textContent = `${multB.slice(0, 4).join(', ')}...`;
    }

    if (this.dom.genCCard) {
      if (this.generators.length >= 3) {
        this.dom.genCCard.classList.remove('hidden');
        this.dom.genCCard.classList.add('flex');
        const genC = this.generators[2];
        if (this.dom.genCValue) this.dom.genCValue.textContent = genC;
        if (this.dom.genCSeq) {
          const multC = getMultiples(genC, 30);
          this.dom.genCSeq.textContent = `${multC.slice(0, 4).join(', ')}...`;
        }
      } else {
        this.dom.genCCard.classList.add('hidden');
        this.dom.genCCard.classList.remove('flex');
      }
    }

    if (this.dom.targetTilePill) {
      this.dom.targetTilePill.textContent = 'TARGET: ???';
      this.dom.targetTilePill.className =
        'text-xs font-mono-math font-black px-3 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-400';
    }

    if (this.dom.tileInput) this.dom.tileInput.value = '';

    // Action banner prompt
    this.updateActionBar(
      '🎯',
      `Where will Wave A (${genA}) and Wave B (${genB}) crash together FIRST? Click a tile!`,
      'text-cyan-300'
    );

    // Reset pulsed multiples
    // Reset clean grid styles
    this.resetGridTiles();

    // Start round timer if briefing is not blocking
    this.timeRemaining = sector.timeLimit;
    this.updateTimerUI(this.timeRemaining);
    if (!this.isBriefingOpen) {
      this.startTimer(sector.timeLimit);
    }
  }

  sendSingleWavePulse(waveType) {
    if (this.isFiring || this.isModalOpen) return;
    this.isFiring = true;

    const genVal =
      waveType === 'A'
        ? this.generators[0]
        : waveType === 'B'
        ? this.generators[1]
        : this.generators[2];

    const color = waveType === 'A' ? 'cyan' : waveType === 'B' ? 'amber' : 'emerald';
    const multiples = getMultiples(genVal, 100);

    soundEngine.playChargeUp();
    this.updateActionBar(
      '⚡',
      `Wave ${waveType} pulse racing every ${genVal} tiles...`,
      waveType === 'A' ? 'text-cyan-400 animate-pulse' : 'text-amber-400 animate-pulse'
    );

    const defaultTileClass =
      'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm text-slate-300 border border-slate-800/80 bg-slate-950/80 hover:border-cyan-400 hover:bg-cyan-950/60 hover:text-cyan-200 transition-colors cursor-pointer shadow-sm overflow-hidden select-none';

    // Leap animation across the multiples
    let step = 0;
    const intervalTime = Math.max(50, Math.floor(800 / multiples.length));

    const pulseInterval = setInterval(() => {
      if (step >= multiples.length) {
        clearInterval(pulseInterval);
        this.isFiring = false;

        this.updateActionBar(
          '🎯',
          `Wave ${waveType} (${genVal}) pulse finished! Where do the waves collide first?`,
          'text-cyan-300'
        );
        return;
      }

      const num = multiples[step];
      soundEngine.playPulseZap(color, 1.0 + (num / 100));

      const tileBtn = document.getElementById(`tile-${num}`);
      if (tileBtn) {
        const flashColor =
          waveType === 'A'
            ? 'bg-cyan-500 text-slate-950 border-2 border-cyan-300 glow-cyan shadow-lg'
            : waveType === 'B'
            ? 'bg-amber-500 text-slate-950 border-2 border-amber-300 glow-amber shadow-lg'
            : 'bg-emerald-500 text-slate-950 border-2 border-emerald-300 glow-emerald shadow-lg';

        tileBtn.className =
          `tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm ${flashColor} z-20`;

        // Revert back after pulse passes through so squares DO NOT stay highlighted!
        setTimeout(() => {
          tileBtn.className = defaultTileClass;
          tileBtn.textContent = num;
        }, 180);
      }

      step++;
    }, intervalTime);
  }

  resetGridTiles() {
    const tiles = this.dom.gridBoard?.querySelectorAll('.tile-btn');
    if (!tiles) return;

    tiles.forEach((t) => {
      const n = Number(t.dataset.tile);
      t.className =
        'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm text-slate-300 border border-slate-800/80 bg-slate-950/80 hover:border-cyan-400 hover:bg-cyan-950/60 hover:text-cyan-200 transition-colors cursor-pointer shadow-sm overflow-hidden select-none';
      t.textContent = n;
    });
  }

  handleInputFire() {
    if (this.isFiring || this.isModalOpen) return;
    const raw = this.dom.tileInput?.value;
    const parsed = parseMathInput(raw);

    if (isNaN(parsed) || parsed < 1 || parsed > 100) {
      soundEngine.playFaultBuzz();
      this.flashShake();
      alert('Please enter a valid tile number between 1 and 100.');
      return;
    }

    this.launchBreakerAtTile(Math.round(parsed));
  }

  launchBreakerAtTile(placedTile) {
    if (this.isFiring || this.isModalOpen) return;
    this.isFiring = true;
    clearInterval(this.timerInterval);

    // Lock visual breaker onto the chosen tile
    soundEngine.playBreakerLock();
    if (this.dom.targetTilePill) {
      this.dom.targetTilePill.textContent = `BREAKER: #${placedTile}`;
      this.dom.targetTilePill.className =
        'text-xs font-mono-math font-black px-3 py-1 rounded-lg bg-cyan-500 text-slate-950 shadow-md animate-pulse';
    }

    const breakerBtn = document.getElementById(`tile-${placedTile}`);
    if (breakerBtn) {
      breakerBtn.className =
        'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm bg-cyan-500 text-slate-950 border-2 border-cyan-200 glow-cyan shadow-lg z-20';
      breakerBtn.textContent = placedTile;
    }

    this.updateActionBar('⚡', `PULSES RACING! Intercepting at Tile #${placedTile}...`, 'text-amber-400 animate-pulse');

    // Build the sequential pulse animation steps
    const targetLcm = lcmMultiple(this.generators);
    const genA = this.generators[0];
    const genB = this.generators[1];

    // Determine the sequence of pulse landings up to the earliest explosion point
    const maxStop = Math.max(placedTile, targetLcm);
    const raceEvents = [];

    let currA = genA;
    let currB = genB;

    while (currA <= maxStop || currB <= maxStop) {
      if (currA < currB) {
        raceEvents.push({ num: currA, wave: 'A' });
        currA += genA;
      } else if (currB < currA) {
        raceEvents.push({ num: currB, wave: 'B' });
        currB += genB;
      } else {
        // Equal: Collision!
        raceEvents.push({ num: currA, wave: 'JOINT' });
        break; // Wave collision terminates pulse race
      }
    }

    // Play animation steps rhythmically
    let stepIdx = 0;
    const stepDuration = Math.max(160, Math.floor(1000 / raceEvents.length));

    const animTimer = setInterval(() => {
      if (stepIdx >= raceEvents.length) {
        clearInterval(animTimer);
        this.evaluateFinalPlacement(placedTile);
        return;
      }

      const evt = raceEvents[stepIdx];
      const targetTileBtn = document.getElementById(`tile-${evt.num}`);

      if (evt.wave === 'A') {
        soundEngine.playPulseZap('cyan', 1.0 + (evt.num / 50));
        if (targetTileBtn && evt.num !== placedTile) {
          targetTileBtn.className =
            'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm bg-cyan-950 border-2 border-cyan-400 text-cyan-300 glow-cyan zap-cyan';
          targetTileBtn.textContent = evt.num;
        }
      } else if (evt.wave === 'B') {
        soundEngine.playPulseZap('amber', 1.1 + (evt.num / 50));
        if (targetTileBtn && evt.num !== placedTile) {
          targetTileBtn.className =
            'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm bg-amber-950 border-2 border-amber-400 text-amber-300 glow-amber zap-amber';
          targetTileBtn.textContent = evt.num;
        }
      } else if (evt.wave === 'JOINT') {
        // Joint Collision!
        if (evt.num === placedTile) {
          // Breaker catches it!
          soundEngine.playOverloadZap();
          if (targetTileBtn) {
            targetTileBtn.className =
              'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm bg-emerald-500 text-slate-950 border-2 border-emerald-200 glow-emerald zap-joint z-20';
            targetTileBtn.textContent = evt.num;
          }
        } else {
          // Uncontained blow-out!
          soundEngine.playFaultBuzz();
          this.flashShake();
          if (targetTileBtn) {
            targetTileBtn.className =
              'tile-btn w-full h-full flex items-center justify-center rounded-lg font-mono-math font-black text-xs sm:text-sm bg-rose-600 text-white border-2 border-rose-300 glow-rose z-20 animate-pulse';
            targetTileBtn.textContent = evt.num;
          }
        }
      }

      stepIdx++;
    }, stepDuration);
  }

  evaluateFinalPlacement(placedTile) {
    const outcome = evaluatePlacement(placedTile, this.generators, this.streak);

    setTimeout(() => {
      if (outcome.isSuccess) {
        soundEngine.playSuccessHarmonic();
        this.streak++;
        this.comboMultiplier = Math.min(8, Math.pow(2, Math.floor(this.streak / 2)));
        this.score += outcome.scoreDelta * this.comboMultiplier;

        this.updateScoreUI();
        this.showSuccessModal(outcome);
      } else {
        soundEngine.playFaultBuzz();
        this.flashShake();
        this.streak = 0;
        this.comboMultiplier = 1;
        this.updateScoreUI();

        this.showFailModal(outcome);
      }

      this.isFiring = false;
    }, 400);
  }

  showSuccessModal(outcome) {
    this.isModalOpen = true;
    if (this.dom.successMsg) {
      this.dom.successMsg.innerHTML = `
        <span class="text-emerald-300 text-sm font-black">Tile ${outcome.targetLcm} intercepted!</span><br/>
        <span class="text-slate-300 text-xs mt-1 block">${outcome.mathExplanation}</span>
        <span class="text-amber-400 font-black text-xs mt-2 block">+${outcome.scoreDelta * this.comboMultiplier} PTS (Streak x${this.comboMultiplier})</span>
      `;
    }
    this.dom.successModal?.classList.remove('hidden');
  }

  showFailModal(outcome) {
    this.isModalOpen = true;
    if (this.dom.failTitle) {
      this.dom.failTitle.textContent =
        outcome.result === EVALUATION_RESULTS.HIGHER_COMMON_MULTIPLE
          ? 'BREACHED AT EARLIER COLLISION!'
          : outcome.result === EVALUATION_RESULTS.SINGLE_MULTIPLE
          ? 'MISSED: ONLY 1 WAVE HIT THIS TILE!'
          : 'DEAD TILE MISMATCH!';
    }
    if (this.dom.failMsg) {
      this.dom.failMsg.innerHTML = `
        <span class="text-rose-300 font-bold font-mono-math">Your Breaker: Tile ${outcome.placedTile}</span><br/>
        <span class="text-slate-200 mt-1 block">${outcome.hudMessage}</span>
        <span class="text-cyan-400 font-mono-math text-xs mt-2 block">First Joint Collision: Tile ${outcome.targetLcm}</span>
      `;
    }
    this.dom.failModal?.classList.remove('hidden');
  }

  openBriefing() {
    this.isBriefingOpen = true;
    this.isModalOpen = true;
    clearInterval(this.timerInterval);
    if (this.dom.briefingStartBtn) {
      this.dom.briefingStartBtn.textContent = 'RESUME MISSION ➔ [SPACE / ENTER]';
    }
    this.dom.briefingModal?.classList.remove('hidden');
  }

  closeBriefing() {
    this.isBriefingOpen = false;
    this.isModalOpen = false;
    this.dom.briefingModal?.classList.add('hidden');
    soundEngine.playSuccessHarmonic();

    // Start or resume timer
    if (this.timeRemaining > 0) {
      this.startTimer(this.timeRemaining);
    }
  }

  closeModals() {
    this.isModalOpen = false;
    this.isBriefingOpen = false;
    this.dom.briefingModal?.classList.add('hidden');
    this.dom.successModal?.classList.add('hidden');
    this.dom.failModal?.classList.add('hidden');
  }

  advanceWave() {
    this.closeModals();
    const sector = CURRICULUM_SECTORS[this.sectorIndex];
    if (this.roundInSector < this.targetWinsPerSector) {
      this.loadRound(this.sectorIndex, this.roundInSector + 1);
    } else if (this.sectorIndex < CURRICULUM_SECTORS.length - 1) {
      this.loadRound(this.sectorIndex + 1, 1);
    } else {
      // Completed all sectors! Post victory to town overworld
      this.completeCartridgeRun();
    }
  }

  completeCartridgeRun() {
    this.closeModals();
    clearInterval(this.timerInterval);
    soundManager.playSuccessChord();

    try {
      window.parent.postMessage(
        {
          type: 'CARTRIDGE_COMPLETE',
          payload: {
            lessonId: 'G06_U03_L04',
            score: Math.max(1, this.score),
            total: 10,
            sectorIndex: this.sectorIndex,
            bossDefeated: this.sectorIndex >= CURRICULUM_SECTORS.length - 1,
          },
        },
        '*'
      );
    } catch (e) {
      console.warn('Could not post CARTRIDGE_COMPLETE to parent:', e);
    }
  }

  startTimer(seconds) {
    clearInterval(this.timerInterval);
    this.timeRemaining = seconds;
    this.updateTimerUI(seconds);

    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      this.updateTimerUI(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.handleTimeExpired();
      }
    }, 1000);
  }

  updateTimerUI(curr) {
    if (this.dom.timerDisplay) {
      this.dom.timerDisplay.textContent = `${Math.max(0, curr)}s`;
      if (curr <= 10) {
        this.dom.timerDisplay.className = 'font-mono-math font-black text-xs text-rose-400 animate-pulse';
      } else {
        this.dom.timerDisplay.className = 'font-mono-math font-black text-xs text-amber-400';
      }
    }
  }

  handleTimeExpired() {
    if (this.isFiring || this.isModalOpen) return;
    const targetLcm = lcmMultiple(this.generators);
    soundEngine.playFaultBuzz();
    this.flashShake();

    this.showFailModal({
      result: EVALUATION_RESULTS.NON_MULTIPLE,
      placedTile: 0,
      targetLcm,
      hudMessage: `Time expired before breaker was placed! Surges detonated at Tile ${targetLcm}.`,
      mathExplanation: `First collision was at ${targetLcm}.`,
    });
  }

  updateScoreUI() {
    if (this.dom.scoreDisplay) {
      this.dom.scoreDisplay.textContent = this.score.toLocaleString();
    }
    if (this.dom.streakBadge) {
      this.dom.streakBadge.textContent = `STREAK: ${this.streak} (x${this.comboMultiplier})`;
      if (this.streak > 1) {
        this.dom.streakBadge.className =
          'px-2 py-0.5 text-[11px] font-mono-math font-black bg-gradient-to-r from-amber-400 to-rose-400 text-slate-950 rounded-lg shadow-md animate-pulse';
      } else {
        this.dom.streakBadge.className =
          'px-2 py-0.5 text-[11px] font-mono-math font-bold bg-slate-800 text-slate-400 rounded-lg';
      }
    }
  }

  updateActionBar(icon, msg, colorClass = 'text-cyan-300') {
    if (this.dom.actionIcon) this.dom.actionIcon.textContent = icon;
    if (this.dom.actionMsg) {
      this.dom.actionMsg.textContent = msg;
      this.dom.actionMsg.className = `text-xs sm:text-sm font-mono-math font-bold truncate ${colorClass}`;
    }
  }

  flashShake() {
    if (!this.dom.gameRoot) return;
    this.dom.gameRoot.classList.remove('shake-active');
    void this.dom.gameRoot.offsetWidth;
    this.dom.gameRoot.classList.add('shake-active');
  }
}

// Auto-boot on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const game = new PulseInterceptorGame();
  game.init();
});
