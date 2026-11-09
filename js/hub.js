/**
 * Super Mario World Style Overworld Controller - "Expression Town" (Topic 3)
 * 
 * Features:
 * - Walkable player sprite that moves along town cobblestone paths between buildings
 * - Keyboard (Arrows / WASD / Enter / Space), Click-to-Walk, and On-Screen D-Pad controls
 * - Building doors that are Open (3-1), Padlocked (until unlocked), or Under Construction (3-6)
 * - Multi-chapter / multi-town world switcher ready for future topics
 */

import { REALM_NODES, WORLD_CHAPTERS, getEffectivePrerequisite } from './nodes.js';
import { playerState } from './state.js';
import { hubAudio } from './audio.js';
import { CartridgeHarness } from './cartridgeHarness.js';

class NumeriaHub {
  constructor() {
    this.selectedNode = null;
    this.harness = null;
    this.playerNodeIndex = 0; // Index in REALM_NODES where player sprite is standing
    this.isWalking = false;
    this.facingLeft = false;
    this.toastTimeout = null;

    this.dom = {
      // Screens
      loginScreen: document.getElementById('loginScreen'),
      worldScreen: document.getElementById('worldScreen'),

      // Login elements
      loginForm: document.getElementById('loginForm'),
      pinInput: document.getElementById('pinInput'),
      passcodeInput: document.getElementById('passcodeInput'),
      loginBtn: document.getElementById('loginBtn'),
      quickPin1042: document.getElementById('quickPin1042'),
      quickPin7777: document.getElementById('quickPin7777'),
      loginError: document.getElementById('loginError'),

      // Top SMB3 HUD
      hudPlayerPin: document.getElementById('hudPlayerPin'),
      hudPlayerLevel: document.getElementById('hudPlayerLevel'),
      hudXpCurrent: document.getElementById('hudXpCurrent'),
      hudXpNext: document.getElementById('hudXpNext'),
      hudXpBar: document.getElementById('hudXpBar'),
      hudCoins: document.getElementById('hudCoins'),
      soundToggleBtn: document.getElementById('soundToggleBtn'),
      soundIcon: document.getElementById('soundIcon'),
      fullscreenBtn: document.getElementById('fullscreenBtn'),
      switchUserBtn: document.getElementById('switchUserBtn'),
      teacherBanner: document.getElementById('teacherBanner'),
      worldSelectBtn: document.getElementById('worldSelectBtn'),
      worldChaptersModal: document.getElementById('worldChaptersModal'),
      worldChaptersList: document.getElementById('worldChaptersList'),
      closeChaptersBtn: document.getElementById('closeChaptersBtn'),

      // Town Map Layers
      mapSvgContainer: document.getElementById('mapSvgContainer'),
      mapNodesContainer: document.getElementById('mapNodesContainer'),
      playerSprite: document.getElementById('playerSprite'),
      playerSpriteBody: document.getElementById('playerSpriteBody'),
      townToast: document.getElementById('townToast'),
      townToastText: document.getElementById('townToastText'),

      // Bottom SMB3 Status & Controls Bar
      currentBuildingBadge: document.getElementById('currentBuildingBadge'),
      currentBuildingTitle: document.getElementById('currentBuildingTitle'),
      currentBuildingStatus: document.getElementById('currentBuildingStatus'),
      dpadPrevBtn: document.getElementById('dpadPrevBtn'),
      dpadNextBtn: document.getElementById('dpadNextBtn'),
      enterDoorBtn: document.getElementById('enterDoorBtn'),

      // Quest / Stage Briefing Modal
      questModal: document.getElementById('questModal'),
      questRegion: document.getElementById('questRegion'),
      questTitle: document.getElementById('questTitle'),
      questSubtitle: document.getElementById('questSubtitle'),
      questStandard: document.getElementById('questStandard'),
      questDescription: document.getElementById('questDescription'),
      questBoss: document.getElementById('questBoss'),
      questXpReward: document.getElementById('questXpReward'),
      questCoinsReward: document.getElementById('questCoinsReward'),
      questStarsContainer: document.getElementById('questStarsContainer'),
      embarkQuestBtn: document.getElementById('embarkQuestBtn'),
      closeQuestBtn: document.getElementById('closeQuestBtn'),

      // Victory Scroll Modal
      victoryModal: document.getElementById('victoryModal'),
      victoryTitle: document.getElementById('victoryTitle'),
      victoryStarsContainer: document.getElementById('victoryStarsContainer'),
      victoryScoreText: document.getElementById('victoryScoreText'),
      victoryXpText: document.getElementById('victoryXpText'),
      victoryCoinsText: document.getElementById('victoryCoinsText'),
      victoryLevelUpNotice: document.getElementById('victoryLevelUpNotice'),
      victoryNextUnlockNotice: document.getElementById('victoryNextUnlockNotice'),
      victoryNextUnlockName: document.getElementById('victoryNextUnlockName'),
      returnToMapBtn: document.getElementById('returnToMapBtn'),
    };
  }

  init() {
    this.initAudioState();
    this.initHarness();
    this.bindEvents();

    // Auto-login if session saved
    const lastPin = localStorage.getItem('numeria_active_pin');
    const lastPasscode = localStorage.getItem('numeria_active_passcode');
    if (lastPin && /^[0-9]{4}$/.test(lastPin) && lastPasscode) {
      this.loginWithCredentials(lastPin, lastPasscode);
    }
  }

  initAudioState() {
    this.updateSoundButtonVisuals();
  }

  updateSoundButtonVisuals() {
    if (this.dom.soundIcon) {
      this.dom.soundIcon.textContent = hubAudio.isMuted ? '🔇' : '🔊';
    }
  }

  initHarness() {
    this.harness = new CartridgeHarness({
      onComplete: (node, payload) => this.handleCartridgeCompletion(node, payload),
      onExit: () => {
        this.renderMap();
        this.updateHUD();
      }
    });
  }

  bindEvents() {
    const unlockListener = () => {
      hubAudio.unlockAudio();
      window.removeEventListener('pointerdown', unlockListener);
      window.removeEventListener('keydown', unlockListener);
    };
    window.addEventListener('pointerdown', unlockListener);
    window.addEventListener('keydown', unlockListener);

    // Sound toggle
    if (this.dom.soundToggleBtn) {
      this.dom.soundToggleBtn.addEventListener('click', () => {
        hubAudio.toggleMute();
        this.updateSoundButtonVisuals();
        if (!hubAudio.isMuted) hubAudio.playSelect();
      });
    }

    // Fullscreen toggle
    if (this.dom.fullscreenBtn) {
      this.dom.fullscreenBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }

    // World / Chapter Selector Modal
    if (this.dom.worldSelectBtn) {
      this.dom.worldSelectBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        this.openChaptersModal();
      });
    }
    if (this.dom.closeChaptersBtn) {
      this.dom.closeChaptersBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        this.dom.worldChaptersModal.classList.add('hidden');
      });
    }

    // Switch user / Logout
    if (this.dom.switchUserBtn) {
      this.dom.switchUserBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        localStorage.removeItem('numeria_active_pin');
        localStorage.removeItem('numeria_active_passcode');
        this.dom.worldScreen.classList.add('hidden');
        this.dom.loginScreen.classList.remove('hidden');
        if (this.dom.pinInput) {
          this.dom.pinInput.value = '';
          this.dom.pinInput.focus();
        }
        if (this.dom.passcodeInput) {
          this.dom.passcodeInput.value = '';
        }
      });
    }

    // PIN & Passcode Login Form
    if (this.dom.loginForm) {
      this.dom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = this.dom.pinInput ? this.dom.pinInput.value.trim() : '';
        const passcode = this.dom.passcodeInput ? this.dom.passcodeInput.value.trim() : '';

        if (!/^[0-9]{4}$/.test(pin)) {
          this.showLoginError('Please enter a valid 4-digit PIN (e.g. 1042)');
          return;
        }
        if (!passcode) {
          this.showLoginError('Please enter your secret passcode.');
          return;
        }
        this.loginWithCredentials(pin, passcode);
      });
    }

    // Quick Demo Buttons
    if (this.dom.quickPin1042) {
      this.dom.quickPin1042.addEventListener('click', () => {
        if (this.dom.pinInput) this.dom.pinInput.value = '1042';
        if (this.dom.passcodeInput) this.dom.passcodeInput.value = 'star6';
        this.loginWithCredentials('1042', 'star6');
      });
    }
    if (this.dom.quickPin7777) {
      this.dom.quickPin7777.addEventListener('click', () => {
        if (this.dom.pinInput) this.dom.pinInput.value = '7777';
        if (this.dom.passcodeInput) this.dom.passcodeInput.value = 'math6';
        this.loginWithCredentials('7777', 'math6');
      });
    }

    // On-screen D-Pad & Enter Door controls
    if (this.dom.dpadPrevBtn) {
      this.dom.dpadPrevBtn.addEventListener('click', () => this.stepPlayer(-1));
    }
    if (this.dom.dpadNextBtn) {
      this.dom.dpadNextBtn.addEventListener('click', () => this.stepPlayer(1));
    }
    if (this.dom.enterDoorBtn) {
      this.dom.enterDoorBtn.addEventListener('click', () => {
        const node = REALM_NODES[this.playerNodeIndex];
        if (node) this.tryEnterBuilding(node);
      });
    }

    // Keyboard navigation on the Town Overworld
    window.addEventListener('keydown', (e) => {
      // Ignore if login screen, cartridge harness, or victory modal is active
      if (!this.dom.loginScreen.classList.contains('hidden')) return;
      if (this.harness && this.harness.currentNode) return;
      if (!this.dom.victoryModal.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.dom.returnToMapBtn.click();
        }
        return;
      }

      // If Stage Briefing Modal is open, Enter/Space launches the cartridge, Escape closes
      if (!this.dom.questModal.classList.contains('hidden')) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.dom.embarkQuestBtn.click();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.dom.closeQuestBtn.click();
        }
        return;
      }

      // Town movement keys
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        this.stepPlayer(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        this.stepPlayer(-1);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const node = REALM_NODES[this.playerNodeIndex];
        if (node) this.tryEnterBuilding(node);
      }
    });

    // Quest Modal actions
    if (this.dom.closeQuestBtn) {
      this.dom.closeQuestBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        this.dom.questModal.classList.add('hidden');
      });
    }

    if (this.dom.embarkQuestBtn) {
      this.dom.embarkQuestBtn.addEventListener('click', () => {
        if (!this.selectedNode) return;
        this.dom.questModal.classList.add('hidden');
        this.harness.launch(this.selectedNode);
      });
    }

    // Victory Modal actions
    if (this.dom.returnToMapBtn) {
      this.dom.returnToMapBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        this.dom.victoryModal.classList.add('hidden');
        this.renderMap();
        this.updateHUD();
      });
    }
  }

  showLoginError(msg) {
    if (this.dom.loginError) {
      this.dom.loginError.textContent = msg;
      this.dom.loginError.classList.remove('hidden');
      setTimeout(() => {
        this.dom.loginError.classList.add('hidden');
      }, 4000);
    }
  }

  showTownToast(msg) {
    if (!this.dom.townToast || !this.dom.townToastText) return;
    clearTimeout(this.toastTimeout);
    this.dom.townToastText.textContent = msg;
    this.dom.townToast.classList.remove('hidden');
    this.toastTimeout = setTimeout(() => {
      this.dom.townToast.classList.add('hidden');
    }, 3200);
  }

  async loginWithCredentials(pin, passcode) {
    const result = await playerState.loadPlayer(pin, passcode);
    if (!result || !result.success) {
      hubAudio.playLockRattle();
      this.showLoginError(result?.error || 'Invalid PIN or passcode.');
      return;
    }

    hubAudio.playSelect();
    localStorage.setItem('numeria_active_pin', pin);
    localStorage.setItem('numeria_active_passcode', passcode);

    this.dom.loginScreen.classList.add('hidden');
    this.dom.worldScreen.classList.remove('hidden');

    // Position player at highest unlocked non-WIP node
    this.setInitialPlayerPosition();
    this.updateHUD();
    this.renderMap();
  }

  setInitialPlayerPosition() {
    let bestIdx = 0;
    REALM_NODES.forEach((n, idx) => {
      if (!n.isWip && playerState.isNodeUnlocked(n.id)) {
        bestIdx = idx;
      }
    });
    this.playerNodeIndex = bestIdx;
  }

  updateHUD() {
    if (this.dom.hudPlayerPin) {
      this.dom.hudPlayerPin.textContent = `PLAYER #${playerState.pin}`;
    }
    if (this.dom.hudPlayerLevel) {
      this.dom.hudPlayerLevel.textContent = `LV.${playerState.level}`;
    }
    const xpNext = playerState.getXpForNextLevel();
    if (this.dom.hudXpCurrent) this.dom.hudXpCurrent.textContent = playerState.xp;
    if (this.dom.hudXpNext) this.dom.hudXpNext.textContent = xpNext;
    if (this.dom.hudXpBar) {
      const pct = Math.min(100, Math.max(0, (playerState.xp / Math.max(1, xpNext)) * 100));
      this.dom.hudXpBar.style.width = `${pct}%`;
    }
    if (this.dom.hudCoins) {
      this.dom.hudCoins.textContent = playerState.coins.toLocaleString();
    }

    if (this.dom.teacherBanner) {
      if (playerState.isTeacherOverride) {
        this.dom.teacherBanner.classList.remove('hidden');
      } else {
        this.dom.teacherBanner.classList.add('hidden');
      }
    }

    this.updateBottomLocationBar();
  }

  updateBottomLocationBar() {
    const node = REALM_NODES[this.playerNodeIndex];
    if (!node) return;

    const isUnlocked = playerState.isNodeUnlocked(node.id);
    const isWip = Boolean(node.isWip);

    if (this.dom.currentBuildingBadge) {
      this.dom.currentBuildingBadge.textContent = `STAGE ${node.lessonCode}`;
    }
    if (this.dom.currentBuildingTitle) {
      this.dom.currentBuildingTitle.textContent = `${node.title} (${node.subtitle})`;
    }

    if (this.dom.currentBuildingStatus && this.dom.enterDoorBtn) {
      if (isWip) {
        this.dom.currentBuildingStatus.innerHTML = `<span class="text-amber-300">🚧 Under Construction — Walk past to Stage 3-7!</span>`;
        this.dom.enterDoorBtn.className = 'px-5 py-2 rounded-xl bg-stone-700 text-stone-300 font-black text-xs uppercase tracking-wider border-2 border-stone-500 cursor-not-allowed';
        this.dom.enterDoorBtn.innerHTML = `<span>🚧 Under Construction</span>`;
      } else if (!isUnlocked) {
        this.dom.currentBuildingStatus.innerHTML = `<span class="text-rose-300">🔒 Door Locked — Clear previous building first!</span>`;
        this.dom.enterDoorBtn.className = 'px-5 py-2 rounded-xl bg-rose-900/80 text-rose-200 font-black text-xs uppercase tracking-wider border-2 border-rose-500';
        this.dom.enterDoorBtn.innerHTML = `<span>🔒 Door Locked</span>`;
      } else {
        this.dom.currentBuildingStatus.innerHTML = `<span class="text-emerald-300">🟢 Door Unlocked! Press SPACE / ENTER to go inside!</span>`;
        this.dom.enterDoorBtn.className = 'px-5 py-2 rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider border-2 border-white shadow-lg cursor-pointer animate-pulse';
        this.dom.enterDoorBtn.innerHTML = `<span>🚪 ENTER BUILDING [SPACE]</span>`;
      }
    }
  }

  /**
   * Moves the player sprite 1 step forward or backward along the town road.
   */
  stepPlayer(delta) {
    const targetIdx = Math.max(0, Math.min(REALM_NODES.length - 1, this.playerNodeIndex + delta));
    if (targetIdx === this.playerNodeIndex) return;
    this.walkPlayerToIndex(targetIdx);
  }

  /**
   * Walks the player sprite along the cobblestone road to the target building index.
   */
  walkPlayerToIndex(targetIdx, openOnArrival = false) {
    if (targetIdx < 0 || targetIdx >= REALM_NODES.length) return;

    if (targetIdx === this.playerNodeIndex) {
      if (openOnArrival) {
        this.tryEnterBuilding(REALM_NODES[targetIdx]);
      }
      return;
    }

    this.facingLeft = targetIdx < this.playerNodeIndex;
    this.playerNodeIndex = targetIdx;
    hubAudio.playStep();

    this.updatePlayerSpritePosition(true);
    this.updateBottomLocationBar();
    this.highlightActiveBuilding();

    if (openOnArrival) {
      setTimeout(() => {
        this.tryEnterBuilding(REALM_NODES[targetIdx]);
      }, 360);
    }
  }

  updatePlayerSpritePosition(animateHop = false) {
    if (!this.dom.playerSprite) return;
    const node = REALM_NODES[this.playerNodeIndex];
    if (!node) return;

    // Position the player sprite on the cobblestone road circle right in front of the building door
    const roadX = node.mapCoords.x;
    const roadY = node.mapCoords.y + 68;

    this.dom.playerSprite.style.left = `${(roadX / 1366) * 100}%`;
    this.dom.playerSprite.style.top = `${(roadY / 768) * 100}%`;

    if (this.dom.playerSpriteBody) {
      this.dom.playerSpriteBody.style.transform = this.facingLeft ? 'scaleX(-1)' : 'scaleX(1)';
      if (animateHop) {
        this.dom.playerSpriteBody.classList.remove('animate-mario-hop');
        void this.dom.playerSpriteBody.offsetWidth;
        this.dom.playerSpriteBody.classList.add('animate-mario-hop');
      }
    }
  }

  highlightActiveBuilding() {
    const cards = this.dom.mapNodesContainer?.querySelectorAll('.town-building-wrapper');
    if (!cards) return;
    cards.forEach((el, idx) => {
      if (idx === this.playerNodeIndex) {
        el.classList.add('scale-105', 'z-30');
      } else {
        el.classList.remove('scale-105', 'z-30');
      }
    });
  }

  renderMap() {
    this.renderTownRoadsAndScenery();
    this.renderTownBuildings();
    this.updatePlayerSpritePosition(false);
    this.updateBottomLocationBar();
  }

  /**
   * Renders the SMB3-style cobblestone town roads, river, bridge, and stop nodes.
   */
  renderTownRoadsAndScenery() {
    if (!this.dom.mapSvgContainer) return;

    let svgHtml = `
      <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1366 768" preserveAspectRatio="none">
        <defs>
          <linearGradient id="riverGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="50%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0369a1" />
          </linearGradient>
        </defs>

        <!-- Background SMB3 Rounded Hills -->
        <ellipse cx="220" cy="640" rx="220" ry="120" fill="#15803d" stroke="#052e16" stroke-width="4" opacity="0.65" />
        <ellipse cx="650" cy="660" rx="280" ry="140" fill="#166534" stroke="#052e16" stroke-width="4" opacity="0.55" />
        <ellipse cx="1130" cy="640" rx="250" ry="130" fill="#15803d" stroke="#052e16" stroke-width="4" opacity="0.65" />

        <!-- Sparkling Town River between 3-3 and 3-4 -->
        <path d="M 575 0 C 540 220, 610 450, 565 768" stroke="#fde047" stroke-width="64" fill="none" opacity="0.5" />
        <path d="M 575 0 C 540 220, 610 450, 565 768" stroke="url(#riverGrad)" stroke-width="52" fill="none" />
        <path d="M 575 0 C 540 220, 610 450, 565 768" stroke="#bae6fd" stroke-width="4" stroke-dasharray="14 18" fill="none" opacity="0.7" />
    `;

    // Draw Cobblestone Path connecting each building's front doorstep (mapCoords.y + 68)
    for (let i = 0; i < REALM_NODES.length - 1; i++) {
      const curr = REALM_NODES[i];
      const next = REALM_NODES[i + 1];

      const isNextUnlocked = playerState.isNodeUnlocked(next.id) || next.isWip;

      const x1 = curr.mapCoords.x;
      const y1 = curr.mapCoords.y + 68;
      const x2 = next.mapCoords.x;
      const y2 = next.mapCoords.y + 68;

      const pathData = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;

      // Outer dark road border
      svgHtml += `
        <path d="${pathData}" stroke="#78350f" stroke-width="26" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      `;
      // Inner sandy cobblestone road
      svgHtml += `
        <path d="${pathData}" stroke="${isNextUnlocked ? '#fde047' : '#d6d3d1'}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      `;
      // Dashed SMB3 tile markings
      svgHtml += `
        <path d="${pathData}" stroke="${isNextUnlocked ? '#ca8a04' : '#78716c'}" stroke-width="4" stroke-dasharray="10 10" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      `;
    }

    // Draw SMB3 Map Stop Circles at each doorstep
    REALM_NODES.forEach((node) => {
      const cx = node.mapCoords.x;
      const cy = node.mapCoords.y + 68;
      const isUnlocked = playerState.isNodeUnlocked(node.id);
      const isCleared = playerState.nodeRecords[node.id]?.cleared;

      const fillCol = node.isWip ? '#f59e0b' : isCleared ? '#22c55e' : isUnlocked ? '#fef08a' : '#94a3b8';

      svgHtml += `
        <circle cx="${cx}" cy="${cy}" r="14" fill="#451a03" />
        <circle cx="${cx}" cy="${cy}" r="10" fill="${fillCol}" stroke="#ffffff" stroke-width="2.5" />
      `;
    });

    svgHtml += `</svg>`;
    this.dom.mapSvgContainer.innerHTML = svgHtml;
  }

  /**
   * Renders the Town Buildings with roofs, windows, signs, and interactive doors.
   */
  renderTownBuildings() {
    if (!this.dom.mapNodesContainer) return;
    this.dom.mapNodesContainer.innerHTML = '';

    REALM_NODES.forEach((node, idx) => {
      const isUnlocked = playerState.isNodeUnlocked(node.id);
      const record = playerState.nodeRecords[node.id];
      const isCleared = Boolean(record && record.cleared);
      const isWip = Boolean(node.isWip);

      const buildingEl = document.createElement('div');
      buildingEl.className = `town-building-wrapper absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none transition-all duration-200 hover:scale-105 ${
        idx === this.playerNodeIndex ? 'scale-105 z-30' : 'z-20'
      }`;
      buildingEl.style.left = `${(node.mapCoords.x / 1366) * 100}%`;
      buildingEl.style.top = `${(node.mapCoords.y / 768) * 100}%`;

      // Roof Flag & Mastery Stars
      let roofTopHtml = '';
      if (isCleared) {
        const starCount = record.stars || 1;
        roofTopHtml = `
          <div class="flex items-center space-x-1 mb-1 px-2 py-0.5 rounded-full bg-slate-950/90 border-2 border-amber-400 shadow-md">
            <span class="text-xs">🚩</span>
            ${'<span class="text-xs text-amber-400">★</span>'.repeat(starCount)}
            ${'<span class="text-xs text-slate-600">★</span>'.repeat(3 - starCount)}
          </div>
        `;
      } else if (isUnlocked && !isWip) {
        roofTopHtml = `
          <div class="mb-1 px-2 py-0.5 rounded-full bg-emerald-500 border-2 border-white text-[10px] font-black text-slate-950 uppercase tracking-wider shadow animate-bounce">
            ▼ OPEN
          </div>
        `;
      } else if (isWip) {
        roofTopHtml = `
          <div class="mb-1 px-2 py-0.5 rounded-full bg-amber-400 border-2 border-slate-950 text-[9px] font-black text-slate-950 uppercase tracking-wider shadow">
            🚧 BUILDING...
          </div>
        `;
      }

      // Door Visual State
      let doorHtml = '';
      if (isWip) {
        // Under construction scaffolding & cones
        doorHtml = `
          <div class="w-11 h-12 rounded-t-lg bg-amber-950 border-2 border-amber-500 flex flex-col items-center justify-center relative overflow-hidden">
            <div class="w-full h-2.5 hazard-tape"></div>
            <span class="text-base my-0.5">🚧</span>
            <div class="w-full h-2 hazard-tape"></div>
          </div>
        `;
      } else if (!isUnlocked) {
        // Locked iron/wood door with padlock
        doorHtml = `
          <div id="door-${node.id}" class="w-11 h-12 rounded-t-lg bg-stone-900 border-2 border-stone-500 flex flex-col items-center justify-center relative shadow-inner">
            <div class="absolute inset-x-0 top-1/2 h-1 bg-stone-600"></div>
            <span class="relative z-10 text-lg drop-shadow">🔒</span>
          </div>
        `;
      } else {
        // Unlocked glowing doorway!
        doorHtml = `
          <div class="w-11 h-12 rounded-t-lg bg-gradient-to-b from-amber-200 via-amber-400 to-amber-500 border-2 border-white flex flex-col items-center justify-end pb-1 relative shadow-[0_0_15px_rgba(251,191,36,0.8)] group">
            <span class="text-[9px] font-black text-slate-950 uppercase tracking-tighter">ENTER</span>
            <span class="w-1.5 h-1.5 rounded-full bg-slate-900 absolute right-1.5 top-1/2"></span>
          </div>
        `;
      }

      buildingEl.innerHTML = `
        ${roofTopHtml}

        <!-- Pitched Mario-style Building Roof -->
        <div class="w-32 h-8 bg-gradient-to-b ${node.roofColor} border-2 border-slate-950 rounded-t-2xl shadow-md flex items-center justify-center relative">
          <span class="px-2 py-0.5 rounded bg-slate-950/90 text-amber-300 font-mono-math font-black text-[10px] border border-amber-400/50">
            ${node.lessonCode}
          </span>
        </div>

        <!-- Building Facade / Walls -->
        <div class="w-28 h-20 ${node.wallColor} border-x-4 border-b-4 border-slate-950 rounded-b-lg shadow-xl flex flex-col items-center justify-between pt-1.5 px-2 relative">
          <!-- Building Sign & Windows Row -->
          <div class="w-full flex items-center justify-between px-1">
            <div class="w-4 h-4 rounded-sm bg-sky-200/80 border border-slate-950"></div>
            <span class="text-lg leading-none">${node.icon}</span>
            <div class="w-4 h-4 rounded-sm bg-sky-200/80 border border-slate-950"></div>
          </div>

          <!-- The Front Door -->
          ${doorHtml}
        </div>

        <!-- Town Building Nameplate -->
        <div class="mt-1 px-2.5 py-0.5 rounded-lg bg-slate-950/90 border-2 border-white/80 shadow-md text-center">
          <div class="text-[11px] font-black text-white whitespace-nowrap leading-tight">
            ${node.title}
          </div>
        </div>
      `;

      buildingEl.addEventListener('click', () => {
        if (this.playerNodeIndex === idx) {
          this.tryEnterBuilding(node);
        } else {
          this.walkPlayerToIndex(idx, true);
        }
      });

      this.dom.mapNodesContainer.appendChild(buildingEl);
    });
  }

  /**
   * Attempts to open the building door where the player is standing.
   */
  tryEnterBuilding(node) {
    if (node.isWip) {
      hubAudio.playLockRattle();
      this.showTownToast(`🚧 ${node.title} (Lesson 3-6: Distributive Property) is under construction! Walk right past to 3-7!`);
      return;
    }

    const isUnlocked = playerState.isNodeUnlocked(node.id);
    if (!isUnlocked) {
      hubAudio.playLockRattle();
      const doorEl = document.getElementById(`door-${node.id}`);
      if (doorEl) {
        doorEl.classList.add('animate-bounce');
        setTimeout(() => doorEl.classList.remove('animate-bounce'), 600);
      }

      const effectivePrereq = getEffectivePrerequisite(node.id);
      const prereqNode = REALM_NODES.find(n => n.id === effectivePrereq);
      const reqName = prereqNode ? `${prereqNode.title} (${prereqNode.lessonCode})` : 'the previous building';
      this.showTownToast(`🔒 Door Locked! Clear ${reqName} first to unlock this building!`);
      return;
    }

    hubAudio.playQuestOpen();
    this.openQuestModal(node);
  }

  openChaptersModal() {
    if (!this.dom.worldChaptersModal || !this.dom.worldChaptersList) return;
    this.dom.worldChaptersList.innerHTML = '';

    WORLD_CHAPTERS.forEach((chap) => {
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-2xl border-2 flex items-center justify-between ${
        chap.isActive
          ? 'bg-amber-950/60 border-amber-400 text-white'
          : 'bg-slate-900/70 border-slate-700 text-slate-400 opacity-75'
      }`;

      card.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base ${
            chap.isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-500'
          }">
            ${chap.isActive ? '🏙️' : '🔒'}
          </div>
          <div>
            <div class="text-[10px] font-black uppercase tracking-widest ${chap.isActive ? 'text-amber-300' : 'text-slate-500'}">
              ${chap.worldLabel}
            </div>
            <div class="text-sm font-black">${chap.title}</div>
            <div class="text-xs text-slate-400">${chap.subtitle}</div>
          </div>
        </div>
        <div>
          ${
            chap.isActive
              ? '<span class="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs uppercase">Current Town</span>'
              : '<span class="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400 font-bold text-[10px] uppercase">Coming Soon</span>'
          }
        </div>
      `;
      this.dom.worldChaptersList.appendChild(card);
    });

    this.dom.worldChaptersModal.classList.remove('hidden');
  }

  openQuestModal(node) {
    this.selectedNode = node;
    const record = playerState.nodeRecords[node.id];

    if (this.dom.questRegion) this.dom.questRegion.textContent = `${node.regionName} • Stage ${node.lessonCode}`;
    if (this.dom.questTitle) this.dom.questTitle.textContent = `${node.icon} ${node.title}`;
    if (this.dom.questSubtitle) this.dom.questSubtitle.textContent = node.subtitle;
    if (this.dom.questStandard) this.dom.questStandard.textContent = node.standard;
    if (this.dom.questDescription) this.dom.questDescription.textContent = node.description;
    if (this.dom.questBoss) this.dom.questBoss.textContent = node.bossName;
    if (this.dom.questXpReward) this.dom.questXpReward.textContent = `+${node.xpReward} XP`;
    if (this.dom.questCoinsReward) this.dom.questCoinsReward.textContent = `+${node.coinsReward} Coins`;

    if (this.dom.questStarsContainer) {
      const starCount = record ? (record.stars || 0) : 0;
      this.dom.questStarsContainer.innerHTML = `
        <span class="text-xs font-black uppercase text-slate-400 mr-1.5">Stage Stars:</span>
        ${[1, 2, 3].map(i => `<span class="text-lg ${i <= starCount ? 'text-amber-400' : 'text-slate-600'}">★</span>`).join('')}
      `;
    }

    this.dom.questModal.classList.remove('hidden');
  }

  async handleCartridgeCompletion(node, payload) {
    this.harness.close();
    hubAudio.playLevelUp();

    const result = await playerState.processCartridgeCompletion(node.id, payload);

    if (this.dom.victoryTitle) {
      this.dom.victoryTitle.textContent = `${node.title} Cleared!`;
    }
    if (this.dom.victoryScoreText) {
      this.dom.victoryScoreText.textContent = `Score: ${payload.score || 10} / ${payload.total || 10}`;
    }
    if (this.dom.victoryXpText) {
      this.dom.victoryXpText.textContent = `+${result.xpGained} XP`;
    }
    if (this.dom.victoryCoinsText) {
      this.dom.victoryCoinsText.textContent = `+${result.coinsGained} Coins`;
    }

    if (this.dom.victoryStarsContainer) {
      this.dom.victoryStarsContainer.innerHTML = [1, 2, 3]
        .map(i => `<span class="text-4xl ${i <= result.stars ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-slate-700'}">★</span>`)
        .join(' ');
    }

    if (this.dom.victoryLevelUpNotice) {
      if (result.leveledUp) {
        this.dom.victoryLevelUpNotice.classList.remove('hidden');
      } else {
        this.dom.victoryLevelUpNotice.classList.add('hidden');
      }
    }

    if (this.dom.victoryNextUnlockNotice && this.dom.victoryNextUnlockName) {
      if (result.nextUnlockedNode) {
        this.dom.victoryNextUnlockName.textContent = `${result.nextUnlockedNode.title} (Stage ${result.nextUnlockedNode.lessonCode})`;
        this.dom.victoryNextUnlockNotice.classList.remove('hidden');

        // Auto-walk player to the newly unlocked building!
        const nextIdx = REALM_NODES.findIndex(n => n.id === result.nextUnlockedNode.id);
        if (nextIdx >= 0) {
          this.playerNodeIndex = nextIdx;
        }
      } else {
        this.dom.victoryNextUnlockNotice.classList.add('hidden');
      }
    }

    this.dom.victoryModal.classList.remove('hidden');
    this.updateHUD();
    this.renderMap();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const hub = new NumeriaHub();
  hub.init();
});
