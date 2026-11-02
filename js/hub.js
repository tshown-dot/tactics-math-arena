/**
 * Realm of Numeria - Master Overworld Controller
 * 
 * Drives the interactive fantasy tactical world map, student HUD,
 * quest briefing scrolls, and victory celebrations.
 */

import { REALM_NODES, getEffectivePrerequisite } from './nodes.js';
import { playerState } from './state.js';
import { hubAudio } from './audio.js';
import { CartridgeHarness } from './cartridgeHarness.js';

class NumeriaHub {
  constructor() {
    this.selectedNode = null;
    this.harness = null;

    this.dom = {
      // Screens
      loginScreen: document.getElementById('loginScreen'),
      worldScreen: document.getElementById('worldScreen'),
      
      // Login elements
      loginForm: document.getElementById('loginForm'),
      pinInput: document.getElementById('pinInput'),
      loginBtn: document.getElementById('loginBtn'),
      quickPin1042: document.getElementById('quickPin1042'),
      quickPin7777: document.getElementById('quickPin7777'),
      loginError: document.getElementById('loginError'),

      // Top HUD
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

      // Map container & SVG
      mapSvgContainer: document.getElementById('mapSvgContainer'),
      mapNodesContainer: document.getElementById('mapNodesContainer'),

      // Quest Scroll Modal
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

    // Check if player was previously logged in
    const lastPin = localStorage.getItem('numeria_active_pin');
    if (lastPin && /^[0-9]{4}$/.test(lastPin)) {
      this.loginWithPin(lastPin);
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
    // Audio unlock on first user interaction
    const unlockListener = () => {
      hubAudio.unlockAudio();
      window.removeEventListener('pointerdown', unlockListener);
      window.removeEventListener('keydown', unlockListener);
    };
    window.addEventListener('pointerdown', unlockListener);
    window.addEventListener('keydown', unlockListener);

    // Audio toggle
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

    // Switch user / Logout
    if (this.dom.switchUserBtn) {
      this.dom.switchUserBtn.addEventListener('click', () => {
        hubAudio.playSelect();
        localStorage.removeItem('numeria_active_pin');
        this.dom.worldScreen.classList.add('hidden');
        this.dom.loginScreen.classList.remove('hidden');
        if (this.dom.pinInput) {
          this.dom.pinInput.value = '';
          this.dom.pinInput.focus();
        }
      });
    }

    // PIN Login Form
    if (this.dom.loginForm) {
      this.dom.loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pin = this.dom.pinInput.value.trim();
        if (/^[0-9]{4}$/.test(pin)) {
          this.loginWithPin(pin);
        } else {
          this.showLoginError('Please enter a valid 4-digit PIN (e.g. 1042)');
        }
      });
    }

    // Quick Login Demo Buttons
    if (this.dom.quickPin1042) {
      this.dom.quickPin1042.addEventListener('click', () => {
        this.loginWithPin('1042');
      });
    }
    if (this.dom.quickPin7777) {
      this.dom.quickPin7777.addEventListener('click', () => {
        this.loginWithPin('7777');
      });
    }

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

  async loginWithPin(pin) {
    hubAudio.playSelect();
    await playerState.loadPlayer(pin);
    localStorage.setItem('numeria_active_pin', pin);

    // Switch screen
    this.dom.loginScreen.classList.add('hidden');
    this.dom.worldScreen.classList.remove('hidden');

    this.updateHUD();
    this.renderMap();
  }

  updateHUD() {
    if (this.dom.hudPlayerPin) {
      this.dom.hudPlayerPin.textContent = `#${playerState.pin}`;
    }
    if (this.dom.hudPlayerLevel) {
      this.dom.hudPlayerLevel.textContent = `Lv.${playerState.level}`;
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
  }

  renderMap() {
    this.renderSvgRoads();
    this.renderNodeElements();
  }

  /**
   * Renders the glowing tactical marching dashed lines connecting each realm node.
   */
  renderSvgRoads() {
    if (!this.dom.mapSvgContainer) return;

    let svgHtml = `
      <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1366 768" preserveAspectRatio="none">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
    `;

    for (let i = 0; i < REALM_NODES.length - 1; i++) {
      const curr = REALM_NODES[i];
      let next = REALM_NODES[i + 1];

      // If next is WIP, we still draw a dashed road to it or bridge to next active
      const isCurrUnlocked = playerState.isNodeUnlocked(curr.id);
      const isNextUnlocked = playerState.isNodeUnlocked(next.id);

      const x1 = curr.mapCoords.x + 36;
      const y1 = curr.mapCoords.y + 36;
      const x2 = next.mapCoords.x + 36;
      const y2 = next.mapCoords.y + 36;

      // Calculate smooth curved path (bezier)
      const cx1 = x1 + (x2 - x1) * 0.5;
      const cy1 = y1;
      const cx2 = x1 + (x2 - x1) * 0.5;
      const cy2 = y2;
      const pathData = `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;

      const roadColor = (isCurrUnlocked && isNextUnlocked) ? '#f59e0b' : '#334155';
      const strokeWidth = (isCurrUnlocked && isNextUnlocked) ? '4' : '2.5';
      const dashArray = (isCurrUnlocked && isNextUnlocked) ? '8 6' : '4 6';

      svgHtml += `
        <path d="${pathData}" 
              stroke="${roadColor}" 
              stroke-width="${strokeWidth}" 
              stroke-dasharray="${dashArray}" 
              fill="none" 
              opacity="0.8"
              class="${(isCurrUnlocked && isNextUnlocked) ? 'animate-pulse' : ''}" />
      `;
    }

    svgHtml += `</svg>`;
    this.dom.mapSvgContainer.innerHTML = svgHtml;
  }

  /**
   * Renders interactive node buttons on the tactical map.
   */
  renderNodeElements() {
    if (!this.dom.mapNodesContainer) return;
    this.dom.mapNodesContainer.innerHTML = '';

    REALM_NODES.forEach((node) => {
      const isUnlocked = playerState.isNodeUnlocked(node.id);
      const record = playerState.nodeRecords[node.id];
      const isCleared = record && record.cleared;
      const isWip = Boolean(node.isWip);

      const nodeWrapper = document.createElement('div');
      nodeWrapper.className = 'absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer select-none transition-transform duration-200 hover:scale-105 group';
      nodeWrapper.style.left = `${(node.mapCoords.x / 1366) * 100}%`;
      nodeWrapper.style.top = `${(node.mapCoords.y / 768) * 100}%`;

      // Star display
      let starsHtml = '';
      if (isCleared) {
        const starCount = record.stars || 1;
        starsHtml = `
          <div class="flex items-center space-x-0.5 mb-1 px-1.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/60 shadow">
            ${'<span class="text-xs text-amber-400">★</span>'.repeat(starCount)}
            ${'<span class="text-xs text-zinc-600">★</span>'.repeat(3 - starCount)}
          </div>
        `;
      }

      // Visual Node Orb
      let orbClass = '';
      let badgeContent = '';

      if (isWip) {
        orbClass = 'bg-stone-900 border-2 border-dashed border-amber-600 text-amber-500 shadow-md opacity-85';
        badgeContent = '⚒️';
      } else if (!isUnlocked) {
        orbClass = 'bg-slate-900 border-2 border-slate-700 text-slate-500 shadow-inner opacity-75';
        badgeContent = '🔒';
      } else if (isCleared) {
        orbClass = 'bg-gradient-to-br from-amber-600 to-amber-900 border-2 border-amber-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.5)]';
        badgeContent = node.icon;
      } else {
        // Active / Next quest
        orbClass = 'bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-cyan-400 text-white shadow-[0_0_22px_rgba(6,182,212,0.7)] animate-bounce';
        badgeContent = node.icon;
      }

      nodeWrapper.innerHTML = `
        ${starsHtml}
        <div class="relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${orbClass} transition-all">
          <span>${badgeContent}</span>
          ${isUnlocked && !isCleared && !isWip ? '<span class="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping"></span>' : ''}
        </div>

        <div class="mt-2 text-center pointer-events-none">
          <div class="px-2.5 py-0.5 rounded-md bg-slate-900/90 border border-slate-700 text-[10px] font-mono font-bold tracking-wider uppercase text-amber-400 shadow">
            ${node.lessonCode}
          </div>
          <div class="text-xs font-black text-slate-200 mt-0.5 drop-shadow-md whitespace-nowrap">
            ${node.title}
          </div>
          ${isWip ? '<div class="text-[9px] text-amber-400/90 font-semibold uppercase tracking-tight">Under Construction</div>' : ''}
        </div>
      `;

      nodeWrapper.addEventListener('click', () => {
        this.handleNodeClick(node);
      });

      this.dom.mapNodesContainer.appendChild(nodeWrapper);
    });
  }

  handleNodeClick(node) {
    if (node.isWip) {
      hubAudio.playSelect();
      alert(`⚒️ ${node.title} (${node.subtitle}) is currently being crafted by the Grand Artificers for Lesson 3-6! You can proceed to Lesson 3-7.`);
      return;
    }

    const isUnlocked = playerState.isNodeUnlocked(node.id);
    if (!isUnlocked) {
      hubAudio.playLockRattle();
      const effectivePrereq = getEffectivePrerequisite(node.id);
      const prereqNode = REALM_NODES.find(n => n.id === effectivePrereq);
      const reqName = prereqNode ? `${prereqNode.title} (${prereqNode.lessonCode})` : 'the previous realm';
      alert(`🔒 Realm Locked! You must conquer ${reqName} to unseal this path.`);
      return;
    }

    hubAudio.playQuestOpen();
    this.openQuestModal(node);
  }

  openQuestModal(node) {
    this.selectedNode = node;
    const record = playerState.nodeRecords[node.id];

    if (this.dom.questRegion) this.dom.questRegion.textContent = node.regionName;
    if (this.dom.questTitle) this.dom.questTitle.textContent = `${node.title}`;
    if (this.dom.questSubtitle) this.dom.questSubtitle.textContent = `Lesson ${node.lessonCode}: ${node.subtitle}`;
    if (this.dom.questStandard) this.dom.questStandard.textContent = node.standard;
    if (this.dom.questDescription) this.dom.questDescription.textContent = node.description;
    if (this.dom.questBoss) this.dom.questBoss.textContent = node.bossName;
    if (this.dom.questXpReward) this.dom.questXpReward.textContent = `+${node.xpReward} XP`;
    if (this.dom.questCoinsReward) this.dom.questCoinsReward.textContent = `+${node.coinsReward} Gold`;

    // Render personal best stars
    if (this.dom.questStarsContainer) {
      const starCount = record ? (record.stars || 0) : 0;
      this.dom.questStarsContainer.innerHTML = `
        <span class="text-sm font-bold text-slate-400 mr-1">Mastery:</span>
        ${[1, 2, 3].map(i => `<span class="text-base ${i <= starCount ? 'text-amber-400' : 'text-slate-600'}">★</span>`).join('')}
      `;
    }

    this.dom.questModal.classList.remove('hidden');
  }

  async handleCartridgeCompletion(node, payload) {
    this.harness.close();
    hubAudio.playLevelUp();

    const result = await playerState.processCartridgeCompletion(node.id, payload);

    // Populate Victory Modal
    if (this.dom.victoryTitle) {
      this.dom.victoryTitle.textContent = `${node.title} Conquered!`;
    }
    if (this.dom.victoryScoreText) {
      this.dom.victoryScoreText.textContent = `${payload.score || 10} / ${payload.total || 10} Correct`;
    }
    if (this.dom.victoryXpText) {
      this.dom.victoryXpText.textContent = `+${result.xpGained} XP`;
    }
    if (this.dom.victoryCoinsText) {
      this.dom.victoryCoinsText.textContent = `+${result.coinsGained} Gold`;
    }

    // Stars visual
    if (this.dom.victoryStarsContainer) {
      this.dom.victoryStarsContainer.innerHTML = [1, 2, 3]
        .map(i => `<span class="text-3xl ${i <= result.stars ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'text-slate-700'}">★</span>`)
        .join(' ');
    }

    // Level-up banner
    if (this.dom.victoryLevelUpNotice) {
      if (result.leveledUp) {
        this.dom.victoryLevelUpNotice.classList.remove('hidden');
      } else {
        this.dom.victoryLevelUpNotice.classList.add('hidden');
      }
    }

    // Next unlock notice
    if (this.dom.victoryNextUnlockNotice && this.dom.victoryNextUnlockName) {
      if (result.nextUnlockedNode) {
        this.dom.victoryNextUnlockName.textContent = `${result.nextUnlockedNode.title} (${result.nextUnlockedNode.lessonCode})`;
        this.dom.victoryNextUnlockNotice.classList.remove('hidden');
      } else {
        this.dom.victoryNextUnlockNotice.classList.add('hidden');
      }
    }

    this.dom.victoryModal.classList.remove('hidden');
    this.updateHUD();
    this.renderMap();
  }
}

// Instantiate and start hub
document.addEventListener('DOMContentLoaded', () => {
  const hub = new NumeriaHub();
  hub.init();
});
