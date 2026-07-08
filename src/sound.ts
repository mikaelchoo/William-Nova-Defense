/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor() {
    // Lazy-initialized on first user interaction to comply with browser autoplay policies
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Sound of an interceptor missile launching: ascending frequency sweep
   */
  public playShoot() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  /**
   * Sound of a missile detonating: deep low-pass white noise explosion
   */
  public playExplosion() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const duration = 0.5;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Generate white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Bandpass filter to make it sound muffled and punchy
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      // Bass boost frequency to add sub punch
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(120, this.ctx.currentTime);
      subOsc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.3);

      subGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      subGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

      // Connect nodes
      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      noiseNode.start();
      subOsc.start();
      noiseNode.stop(this.ctx.currentTime + duration);
      subOsc.stop(this.ctx.currentTime + 0.3);
    } catch (e) {
      // Fallback in case of buffer errors
      this.playFallbackBeep(100, 0.3, 'sawtooth');
    }
  }

  /**
   * Sound when a city or tower is hit: crunchy dramatic crash
   */
  public playImpact() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    try {
      const duration = 0.7;
      const bufferSize = this.ctx.sampleRate * duration;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + duration);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start();
      noiseNode.stop(this.ctx.currentTime + duration);
    } catch (e) {
      this.playFallbackBeep(70, 0.4, 'triangle');
    }
  }

  /**
   * Sound when completing a wave successfully: an upbeat major arpeggio
   */
  public playWaveCleared() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major scale arpeggio
    const noteDuration = 0.08;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * noteDuration);

      gain.gain.setValueAtTime(0.1, t + idx * noteDuration);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * noteDuration + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + idx * noteDuration);
      osc.stop(t + idx * noteDuration + 0.2);
    });
  }

  /**
   * Victory sound: 8-bit retro fanfare
   */
  public playVictory() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Triumphant melody with tempos
    const notes = [
      { freq: 523.25, dur: 0.15, delay: 0 },     // C5
      { freq: 523.25, dur: 0.15, delay: 0.15 },  // C5
      { freq: 523.25, dur: 0.15, delay: 0.3 },   // C5
      { freq: 523.25, dur: 0.4, delay: 0.45 },   // C5 (long)
      { freq: 415.30, dur: 0.4, delay: 0.85 },   // G#4
      { freq: 466.16, dur: 0.4, delay: 1.25 },   // A#4
      { freq: 523.25, dur: 0.15, delay: 1.65 },  // C5
      { freq: 466.16, dur: 0.15, delay: 1.8 },   // A#4
      { freq: 523.25, dur: 0.8, delay: 1.95 },   // C5 (held)
    ];

    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square'; // Classic retro chiptune sound
      osc.frequency.setValueAtTime(n.freq, t + n.delay);

      gain.gain.setValueAtTime(0.08, t + n.delay);
      gain.gain.setValueAtTime(0.08, t + n.delay + n.dur - 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + n.delay);
      osc.stop(t + n.delay + n.dur);
    });
  }

  /**
   * Defeat sound: descending mournful minor chords and noise drop
   */
  public playDefeat() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [
      { freq: 392.00, dur: 0.3, delay: 0 },    // G4
      { freq: 369.99, dur: 0.3, delay: 0.3 },  // F#4
      { freq: 349.23, dur: 0.3, delay: 0.6 },  // F4
      { freq: 311.13, dur: 0.8, delay: 0.9 },  // Eb4
    ];

    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.freq, t + n.delay);

      gain.gain.setValueAtTime(0.1, t + n.delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.delay + n.dur);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t + n.delay);
      osc.stop(t + n.delay + n.dur);
    });
  }

  /**
   * Simple short user interface tick / menu click
   */
  public playTick() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.02);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  private playFallbackBeep(frequency: number, duration: number, type: OscillatorType) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }
}

export const sound = new SoundManager();
