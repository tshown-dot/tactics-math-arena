/**
 * Realm of Numeria - Web Audio Synthesizer
 * 
 * Lightweight, zero-asset Web Audio synthesizer for retro fantasy SFX.
 * Persists mute preference in localStorage.
 */

class HubAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.hasUnlockedAudio = false;

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('numeria_hub_muted');
      this.isMuted = saved === 'true';
    }
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('[AudioEngine] Web Audio not supported', e);
    }
  }

  unlockAudio() {
    if (this.hasUnlockedAudio) return;
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.hasUnlockedAudio = true;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('numeria_hub_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15, decay = 0.05) {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gainVal, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration + decay);
    } catch (e) {
      // Audio safety
    }
  }

  playSelect() {
    this.playTone(440, 'triangle', 0.08, 0.12);
  }

  playNodeHover() {
    this.playTone(523.25, 'sine', 0.06, 0.08); // C5
  }

  playQuestOpen() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    // Arpeggiated parchment flourish: C4 -> E4 -> G4 -> C5
    const notes = [261.63, 329.63, 392.00, 523.25];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.18, 0.1);
      }, idx * 60);
    });
  }

  playCartridgeLaunch() {
    if (this.isMuted) return;
    this.unlockAudio();
    if (!this.ctx) return;

    // Heroic brass charge: D4 -> F#4 -> A4 -> D5
    const chord = [293.66, 369.99, 440.00, 587.33];
    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.3, 0.14);
      }, idx * 75);
    });
  }

  playCoinClink() {
    if (this.isMuted) return;
    this.unlockAudio();
    // High double chime
    this.playTone(987.77, 'sine', 0.08, 0.15); // B5
    setTimeout(() => {
      this.playTone(1318.51, 'sine', 0.15, 0.18); // E6
    }, 70);
  }

  playLevelUp() {
    if (this.isMuted) return;
    this.unlockAudio();
    // Regal fanfare
    const notes = [
      { f: 392.0, d: 0.15 }, // G4
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.4 },  // G5
    ];
    let time = 0;
    notes.forEach((note) => {
      setTimeout(() => {
        this.playTone(note.f, 'triangle', note.d, 0.2);
      }, time);
      time += note.d * 800;
    });
  }

  playLockRattle() {
    if (this.isMuted) return;
    this.unlockAudio();
    // Low metallic thud
    this.playTone(120, 'sawtooth', 0.12, 0.18);
    setTimeout(() => {
      this.playTone(90, 'sawtooth', 0.15, 0.2);
    }, 90);
  }
}

export const hubAudio = new HubAudioEngine();
