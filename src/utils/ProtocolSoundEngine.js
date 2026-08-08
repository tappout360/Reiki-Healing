/**
 * 🎵 ProtocolSoundEngine.js
 * Multi-Layered Real-Time Web Audio Solfeggio Synthesizer & Sound Bath Engine
 * Provides rich, professional-grade meditation music matching exact protocol frequencies.
 */

class ProtocolSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.masterGain = null;
    this.mainOsc = null;
    this.harmonicOsc1 = null;
    this.harmonicOsc2 = null;
    this.subBassOsc = null;
    this.binauralLeft = null;
    this.binauralRight = null;
    this.lfoOsc = null;
    this.lfoGain = null;
    this.noiseNode = null;
    this.isPlaying = false;
    this.currentFrequency = 528;
    this.volume = 0.7;
    this.binauralEnabled = true;
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

    // Master Volume Control
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, this.volume * 0.4), now + 1.5);
    this.masterGain.connect(ctx.destination);

    // LAYER 1: Fundamental Solfeggio Frequency
    this.mainOsc = ctx.createOscillator();
    this.mainOsc.type = 'sine';
    this.mainOsc.frequency.setValueAtTime(frequency, now);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.35, now);
    this.mainOsc.connect(mainGain);
    mainGain.connect(this.masterGain);

    // LAYER 2: Crystal Singing Bowl Harmonics (1.5x and 2.0x Frequency)
    this.harmonicOsc1 = ctx.createOscillator();
    this.harmonicOsc1.type = 'sine';
    this.harmonicOsc1.frequency.setValueAtTime(frequency * 1.5, now); // Perfect 5th harmonic

    const hGain1 = ctx.createGain();
    hGain1.gain.setValueAtTime(0.12, now);
    this.harmonicOsc1.connect(hGain1);
    hGain1.connect(this.masterGain);

    this.harmonicOsc2 = ctx.createOscillator();
    this.harmonicOsc2.type = 'sine';
    this.harmonicOsc2.frequency.setValueAtTime(frequency * 2.0, now); // Octave harmonic

    const hGain2 = ctx.createGain();
    hGain2.gain.setValueAtTime(0.08, now);
    this.harmonicOsc2.connect(hGain2);
    hGain2.connect(this.masterGain);

    // LFO Vibrato for Crystal Bowl Chime Warmth (0.2Hz organic pulse)
    this.lfoOsc = ctx.createOscillator();
    this.lfoGain = ctx.createGain();
    this.lfoOsc.frequency.setValueAtTime(0.2, now);
    this.lfoGain.gain.setValueAtTime(1.5, now);
    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.mainOsc.frequency);
    this.lfoOsc.start(now);

    // LAYER 3: Sub-Bass Earth Grounding Drone (72Hz - 108Hz warm base)
    const subBassFreq = Math.min(108, Math.max(54, frequency / 6));
    this.subBassOsc = ctx.createOscillator();
    this.subBassOsc.type = 'triangle';
    this.subBassOsc.frequency.setValueAtTime(subBassFreq, now);

    const subFilter = ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(150, now);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.2, now);

    this.subBassOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.masterGain);

    // LAYER 4: 6Hz Theta Wave Binaural Beats (Spatial Stereo Entrainment)
    if (this.binauralEnabled && ctx.createMerger) {
      const merger = ctx.createChannelMerger(2);

      this.binauralLeft = ctx.createOscillator();
      this.binauralLeft.type = 'sine';
      this.binauralLeft.frequency.setValueAtTime(frequency, now);

      this.binauralRight = ctx.createOscillator();
      this.binauralRight.type = 'sine';
      this.binauralRight.frequency.setValueAtTime(frequency + 6.0, now); // 6Hz Theta Offset

      const bGainLeft = ctx.createGain();
      const bGainRight = ctx.createGain();
      bGainLeft.gain.setValueAtTime(0.15, now);
      bGainRight.gain.setValueAtTime(0.15, now);

      this.binauralLeft.connect(bGainLeft);
      this.binauralRight.connect(bGainRight);

      bGainLeft.connect(merger, 0, 0); // Left channel
      bGainRight.connect(merger, 0, 1); // Right channel

      merger.connect(this.masterGain);

      this.binauralLeft.start(now);
      this.binauralRight.start(now);
    }

    // LAYER 5: Soft Atmospheric Pink Noise (Filtered Ocean Ambience)
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
      output[i] *= 0.03; // Soft volume baseline
      b6 = white * 0.115926;
    }

    this.noiseNode = ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(400, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.08, now);

    this.noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    this.noiseNode.start(now);

    // Start Main Generators
    this.mainOsc.start(now);
    this.harmonicOsc1.start(now);
    this.harmonicOsc2.start(now);
    this.subBassOsc.start(now);

    this.isPlaying = true;
  }

  stopProtocolSound() {
    if (!this.isPlaying || !this.audioCtx) return;
    const now = this.audioCtx.currentTime;

    if (this.masterGain) {
      this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    }

    setTimeout(() => {
      try {
        if (this.mainOsc) this.mainOsc.stop();
        if (this.harmonicOsc1) this.harmonicOsc1.stop();
        if (this.harmonicOsc2) this.harmonicOsc2.stop();
        if (this.subBassOsc) this.subBassOsc.stop();
        if (this.binauralLeft) this.binauralLeft.stop();
        if (this.binauralRight) this.binauralRight.stop();
        if (this.lfoOsc) this.lfoOsc.stop();
        if (this.noiseNode) this.noiseNode.stop();
      } catch {}
      this.isPlaying = false;
    }, 550);
  }

  setVolume(newVol) {
    this.volume = Math.max(0, Math.min(1, newVol));
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.setValueAtTime(Math.max(0.001, this.volume * 0.4), this.audioCtx.currentTime);
    }
  }

  toggleBinauralTheta(enabled) {
    this.binauralEnabled = enabled;
    if (this.isPlaying) {
      this.startProtocolSound(this.currentFrequency);
    }
  }

  strikeSingingBowl() {
    this.initContext();
    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    const bowlOsc = ctx.createOscillator();
    const bowlGain = ctx.createGain();

    bowlOsc.type = 'sine';
    bowlOsc.frequency.setValueAtTime(this.currentFrequency * 2, now); // Bell harmonic

    bowlGain.gain.setValueAtTime(0.4, now);
    bowlGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    bowlOsc.connect(bowlGain);
    bowlGain.connect(ctx.destination);

    bowlOsc.start(now);
    bowlOsc.stop(now + 3.6);
  }
}

export const protocolSoundEngine = new ProtocolSoundEngine();
export default protocolSoundEngine;
