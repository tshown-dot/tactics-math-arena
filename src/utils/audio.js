// ==============================================================================
// RETRO 8-BIT / 16-BIT AUDIO SYNTHESIZER (Web Audio API)
// ==============================================================================
// 100% Client-side synthesized sounds. Zero external audio file downloads.
// Guaranteed to work on school Chromebooks with zero network latency.
// ==============================================================================

class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  playBeep(freq, type = 'sine', duration = 0.1, gain = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gainNode.gain.setValueAtTime(gain, this.ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Tactical click / move sound
  move() {
    this.playBeep(440, 'triangle', 0.08, 0.12);
  }

  // Correct answer strike!
  hit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } catch {}
  }

  // Boss critical strike
  criticalHit() {
    this.hit();
    setTimeout(() => this.playBeep(980, 'square', 0.2, 0.2), 60);
  }

  // Mistake / Shield break sound
  shieldBreak() {
    this.playBeep(180, 'sawtooth', 0.25, 0.25);
  }

  // Coin collect chime
  coin() {
    this.playBeep(987, 'sine', 0.08, 0.15);
    setTimeout(() => this.playBeep(1318, 'sine', 0.15, 0.18), 70);
  }

  // Victory fanfare
  victory() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playBeep(freq, 'triangle', 0.18, 0.2), idx * 120);
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

export const sound = new SoundFX();
