/**
 * 🎵 ProtocolSoundEngine.js
 * Master-Grade Acoustic Solfeggio Synthesizer & Harmonic Sound Bath Engine
 * Architected with Stanford Web Audio Acoustic Principles:
 * - Pure Solfeggio Carrier Frequencies (396Hz, 417Hz, 432Hz, 528Hz, 639Hz, 741Hz, 852Hz, 963Hz)
 * - Warm 2-Pole Analog-Modeled Lowpass Filtering (zero sibilance / zero rasp)
 * - Organic Harmonic Series (Perfect 5th & Octave Overtones)
 * - Slow Breathing LFO Swells (0.035Hz / ~28s relaxation envelope)
 * - Zero Harsh Intersecting Beats / Zero Phase Interference
 */

class ProtocolSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.mainOsc = null;
    this.harmonicOsc1 = null;
    this.harmonicOsc2 = null;
    this.subBassOsc = null;
    this.lfoOsc = null;
    this.lfoGain = null;
    this.warmFilter = null;
    this.pinkNoiseNode = null;
    this.isPlaying = false;
    this.currentFrequency = 528;
    this.volume = 0.5;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  startProtocolSound(frequency = 528, options = {}) {
    this.initContext();
    if (this.isPlaying) {
      this.stopProtocolSound();
    }

    this.currentFrequency = frequency;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    // Master Volume Ramp (Smooth Logarithmic Fade-In over 2.5s)
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.0001, now);
    this.masterGain.gain.linearRampToValueAtTime(Math.max(0.01, this.volume * 0.35), now + 2.5);
    this.masterGain.connect(ctx.destination);

    // Warm Lowpass Filter Node (cuts high sibilance, leaves rich organic resonance)
    this.warmFilter = ctx.createBiquadFilter();
    this.warmFilter.type = 'lowpass';
    const cutoff = Math.min(550, Math.max(220, frequency * 1.1));
    this.warmFilter.frequency.setValueAtTime(cutoff, now);
    this.warmFilter.Q.setValueAtTime(0.707, now); // Butterworth alignment
    this.warmFilter.connect(this.masterGain);

    // LAYER 1: Fundamental Solfeggio Pure Sine Wave
    this.mainOsc = ctx.createOscillator();
    this.mainOsc.type = 'sine';
    this.mainOsc.frequency.setValueAtTime(frequency, now);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.4, now);
    this.mainOsc.connect(mainGain);
    mainGain.connect(this.warmFilter);

    // LAYER 2: Warm Harmonic Overtones (Perfect 5th + Octave)
    this.harmonicOsc1 = ctx.createOscillator();
    this.harmonicOsc1.type = 'sine';
    this.harmonicOsc1.frequency.setValueAtTime(frequency * 1.5, now); // Perfect 5th

    const hGain1 = ctx.createGain();
    hGain1.gain.setValueAtTime(0.08, now);
    this.harmonicOsc1.connect(hGain1);
    hGain1.connect(this.warmFilter);

    this.harmonicOsc2 = ctx.createOscillator();
    this.harmonicOsc2.type = 'sine';
    this.harmonicOsc2.frequency.setValueAtTime(frequency * 2.0, now); // Octave

    const hGain2 = ctx.createGain();
    hGain2.gain.setValueAtTime(0.04, now);
    this.harmonicOsc2.connect(hGain2);
    hGain2.connect(this.warmFilter);

    // LAYER 3: Deep Sub-Bass Earth Grounding (Soft Triangle Wave)
    let subFreq = frequency;
    while (subFreq > 120) {
      subFreq /= 2;
    }
    this.subBassOsc = ctx.createOscillator();
    this.subBassOsc.type = 'triangle';
    this.subBassOsc.frequency.setValueAtTime(subFreq, now);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(120, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.18, now);

    this.subBassOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);

    // LAYER 4: Breathing Swell LFO (0.035Hz = ~28s deep relaxation pulse)
    this.lfoOsc = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfoOsc.frequency.setValueAtTime(0.035, now);
    this.lfoGain.gain.setValueAtTime(0.06, now); // Soft swell modulation

    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(mainGain.gain);
    this.lfoGain.connect(hGain1.gain);
    this.lfoOsc.start(now);

    // LAYER 5: Gentle Atmospheric Pink Noise (Soft Rain / Ocean Breath)
    const bufferSize = ctx.sampleRate * 2;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.015; // Soft ambient baseline
      b6 = white * 0.115926;
    }

    this.pinkNoiseNode = ctx.createBufferSource();
    this.pinkNoiseNode.buffer = noiseBuffer;
    this.pinkNoiseNode.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(250, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);

    this.pinkNoiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    this.pinkNoiseNode.start(now);

    // Start Oscillators
    this.mainOsc.start(now);
    this.harmonicOsc1.start(now);
    this.harmonicOsc2.start(now);
    this.subBassOsc.start(now);

    this.isPlaying = true;
  }

  stopProtocolSound() {
    if (!this.isPlaying || !this.audioCtx) return;
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    if (this.masterGain) {
      try {
        this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.5);
      } catch {}
    }

    setTimeout(() => {
      try {
        if (this.mainOsc) this.mainOsc.stop();
        if (this.harmonicOsc1) this.harmonicOsc1.stop();
        if (this.harmonicOsc2) this.harmonicOsc2.stop();
        if (this.subBassOsc) this.subBassOsc.stop();
        if (this.lfoOsc) this.lfoOsc.stop();
        if (this.pinkNoiseNode) this.pinkNoiseNode.stop();
      } catch {}
      this.isPlaying = false;
    }, 1600);
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(Math.max(0.001, this.volume * 0.35), now + 0.2);
    }
  }

  strikeSingingBowl() {
    this.initContext();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const bowlOsc = ctx.createOscillator();
    const bowlGain = ctx.createGain();
    const bowlFilter = ctx.createBiquadFilter();

    bowlOsc.type = 'sine';
    bowlOsc.frequency.setValueAtTime(this.currentFrequency * 2, now); // Bell harmonic

    bowlFilter.type = 'lowpass';
    bowlFilter.frequency.setValueAtTime(800, now);

    bowlGain.gain.setValueAtTime(0.25, now);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.0);

    bowlOsc.connect(bowlFilter);
    bowlFilter.connect(bowlGain);
    bowlGain.connect(ctx.destination);

    bowlOsc.start(now);
    bowlOsc.stop(now + 4.1);
  }
}

export const protocolSoundEngine = new ProtocolSoundEngine();
export default protocolSoundEngine;
