import React, { useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

const DuckingAudioPlayer = ({ 
  musicSrc, 
  ambientSrc,
  voiceSrc, 
  isPlaying, 
  volume = 50,
  duckingAmount = 0.3,
  binauralEnabled = false,
  binauralCarrier = 432,
  binauralBeat = 6,
  binauralVolume = 30,
  onEnded 
}) => {
  const audioContextRef = useRef(null);
  const musicNodeRef = useRef(null);
  const ambientNodeRef = useRef(null);
  const voiceNodeRef = useRef(null);
  const musicGainRef = useRef(null);
  const ambientGainRef = useRef(null);
  const voiceGainRef = useRef(null);
  
  const binauralGainRef = useRef(null);
  const leftOscRef = useRef(null);
  const rightOscRef = useRef(null);

  // Synthesized meditation drone refs
  const synthGainRef = useRef(null);
  const droneOsc1Ref = useRef(null);
  const droneOsc2Ref = useRef(null);
  const droneOsc3Ref = useRef(null);
  const droneFilterRef = useRef(null);
  const lfoRef = useRef(null);

  const musicElementRef = useRef(new Audio());
  const ambientElementRef = useRef(new Audio());
  const voiceElementRef = useRef(new Audio());

  useEffect(() => {
    const isYouTube = musicSrc && (musicSrc.includes('youtube.com') || musicSrc.includes('youtu.be'));
    
    // Initialize Web Audio API only if it doesn't exist
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }

    // Connect voice node only once
    if (!voiceNodeRef.current) {
      voiceNodeRef.current = audioContextRef.current.createMediaElementSource(voiceElementRef.current);
      voiceGainRef.current = audioContextRef.current.createGain();
      voiceNodeRef.current.connect(voiceGainRef.current);
      voiceGainRef.current.connect(audioContextRef.current.destination);
    }

    // Connect music node only once and ONLY if NOT YouTube
    if (!isYouTube && !musicNodeRef.current) {
      musicNodeRef.current = audioContextRef.current.createMediaElementSource(musicElementRef.current);
      musicGainRef.current = audioContextRef.current.createGain();
      musicNodeRef.current.connect(musicGainRef.current);
      musicGainRef.current.connect(audioContextRef.current.destination);
    }

    // Connect ambient node only once
    if (!ambientNodeRef.current && ambientSrc) {
      ambientNodeRef.current = audioContextRef.current.createMediaElementSource(ambientElementRef.current);
      ambientGainRef.current = audioContextRef.current.createGain();
      ambientNodeRef.current.connect(ambientGainRef.current);
      ambientGainRef.current.connect(audioContextRef.current.destination);
    }

    // Config audio elements
    voiceElementRef.current.crossOrigin = "anonymous";
    voiceElementRef.current.src = voiceSrc;

    if (ambientSrc) {
      ambientElementRef.current.loop = true;
      ambientElementRef.current.crossOrigin = "anonymous";
      ambientElementRef.current.src = ambientSrc;
    } else {
      ambientElementRef.current.pause();
      ambientElementRef.current.src = "";
    }

    if (!isYouTube && musicSrc) {
      musicElementRef.current.loop = true;
      musicElementRef.current.crossOrigin = "anonymous";
      musicElementRef.current.src = musicSrc;
    } else {
      // Clear music element if switching to YouTube or if empty to avoid background play
      musicElementRef.current.pause();
      musicElementRef.current.src = "";
    }

    return () => {
      // Cleanup happens on component unmount
    };
  }, [musicSrc, ambientSrc, voiceSrc]);

  useEffect(() => {
    const isYouTube = musicSrc && (musicSrc.includes('youtube.com') || musicSrc.includes('youtu.be'));
    
    if (isPlaying) {
      const startPlayback = async () => {
        try {
          if (audioContextRef.current?.state === 'suspended') {
            await audioContextRef.current.resume();
          }
          
          if (!isYouTube && musicSrc && musicElementRef.current.src) {
            await musicElementRef.current.play();
          }

          if (ambientElementRef.current.src && !ambientElementRef.current.src.endsWith('undefined')) {
            await ambientElementRef.current.play();
          }
          
          if (voiceElementRef.current.src && !voiceElementRef.current.src.endsWith('undefined')) {
            await voiceElementRef.current.play();
          }
        } catch (err) {
          if (err.name === 'NotSupportedError') {
            console.warn("Audio asset not found or not supported. Continuing in silent resonance.", voiceSrc);
          } else if (err.name === 'AbortError') {
            // Silence AbortError - it's expected during rapid navigation/source changes
          } else {
            console.error("Playback failed:", err);
          }
        }
      };
      startPlayback();
    } else {
      musicElementRef.current.pause();
      ambientElementRef.current.pause();
      voiceElementRef.current.pause();
    }
  }, [isPlaying, musicSrc, ambientSrc, voiceSrc]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
      }
    };
  }, []);

  useEffect(() => {
    const masterVolume = volume / 100;
    const isYouTube = musicSrc && (musicSrc.includes('youtube.com') || musicSrc.includes('youtu.be'));
    
    // Set volumes with smooth transitions
    const now = audioContextRef.current?.currentTime || 0;
    
    const setYouTubeVolume = (vol) => {
      const iframe = document.getElementById('healing-audio-iframe');
      if (iframe && iframe.contentWindow) {
        // Unmute first to be sure
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'unMute'
        }), '*');
        
        iframe.contentWindow.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [vol]
        }), '*');
      }
    };

    // Voiceover logic: check if voice is playing to apply ducking
    const handleVolumeShift = () => {
      const isVoicePlaying = !voiceElementRef.current.paused && 
                             voiceElementRef.current.currentTime > 0 && 
                             !voiceElementRef.current.ended;
      
      const targetMusicVol = isVoicePlaying ? masterVolume * duckingAmount : masterVolume;
      const targetAmbientVol = targetMusicVol; // Both layers duck at the same rate
      
      if (isYouTube) {
        setYouTubeVolume(targetMusicVol * 100);
      } else {
        musicGainRef.current?.gain.linearRampToValueAtTime(targetMusicVol, now + 0.5);
      }

      if (synthGainRef.current) {
        synthGainRef.current.gain.linearRampToValueAtTime(targetMusicVol * 0.45, now + 0.5);
      }

      ambientGainRef.current?.gain.linearRampToValueAtTime(targetAmbientVol, now + 0.5);
      
      voiceGainRef.current?.gain.setValueAtTime(masterVolume, now);
    };

    const voiceEl = voiceElementRef.current;
    voiceEl.addEventListener('play', handleVolumeShift);
    voiceEl.addEventListener('pause', handleVolumeShift);
    voiceEl.addEventListener('timeupdate', handleVolumeShift);

    // Set initial volume
    handleVolumeShift();

    return () => {
      voiceEl.removeEventListener('play', handleVolumeShift);
      voiceEl.removeEventListener('pause', handleVolumeShift);
      voiceEl.removeEventListener('timeupdate', handleVolumeShift);
    };
  }, [volume, duckingAmount, musicSrc]);

  // Ambient Synth Drone Management
  useEffect(() => {
    const cleanupSynth = () => {
      if (droneOsc1Ref.current) {
        try { droneOsc1Ref.current.stop(); } catch (e) { /* already stopped */ }
        droneOsc1Ref.current = null;
      }
      if (droneOsc2Ref.current) {
        try { droneOsc2Ref.current.stop(); } catch (e) { /* already stopped */ }
        droneOsc2Ref.current = null;
      }
      if (droneOsc3Ref.current) {
        try { droneOsc3Ref.current.stop(); } catch (e) { /* already stopped */ }
        droneOsc3Ref.current = null;
      }
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch (e) { /* already stopped */ }
        lfoRef.current = null;
      }
      if (synthGainRef.current) {
        synthGainRef.current = null;
      }
      if (droneFilterRef.current) {
        droneFilterRef.current = null;
      }
    };

    const isYouTube = musicSrc && (musicSrc.includes('youtube.com') || musicSrc.includes('youtu.be'));
    // Only play synthesized drone if:
    // 1. We are playing
    // 2. There is no custom music file (musicSrc is empty/falsy)
    const shouldPlaySynth = isPlaying && (!musicSrc || musicSrc === "");

    if (!shouldPlaySynth) {
      cleanupSynth();
      return;
    }

    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }

    cleanupSynth();

    // Create synth gain
    synthGainRef.current = ctx.createGain();
    const masterVolume = volume / 100;
    // Set initial volume soft (e.g. 45% of master volume)
    synthGainRef.current.gain.setValueAtTime(masterVolume * 0.45, ctx.currentTime);
    synthGainRef.current.connect(ctx.destination);

    // Create Biquad Filter to keep the drone soft and pillowy
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, ctx.currentTime); // lowpass filter cutoff
    filter.Q.setValueAtTime(1.5, ctx.currentTime);
    filter.connect(synthGainRef.current);
    droneFilterRef.current = filter;

    // Determine fundamental frequency (shift down to C2-C3 register)
    let baseFreq = parseFloat(binauralCarrier) || 432;
    while (baseFreq > 220) {
      baseFreq /= 2;
    }

    // Oscillator 1: Fundamental (Sine)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);

    // Oscillator 2: Sub-octave (Triangle)
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 0.5, ctx.currentTime);

    // Oscillator 3: Perfect Fifth (Sine)
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

    // Individual gains
    const gain1 = ctx.createGain();
    const gain2 = ctx.createGain();
    const gain3 = ctx.createGain();

    gain1.gain.setValueAtTime(0.3, ctx.currentTime);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    gain3.gain.setValueAtTime(0.2, ctx.currentTime);

    osc1.connect(gain1);
    osc2.connect(gain2);
    osc3.connect(gain3);

    gain1.connect(filter);
    gain2.connect(filter);
    gain3.connect(filter);

    // LFO for breathing swells
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.06, ctx.currentTime); // 0.06 Hz = ~16s swell cycles

    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(0.05, ctx.currentTime); // subtle swell depth

    lfo.connect(lfoGain);
    lfoGain.connect(gain1.gain); // modulate fundamental swell
    lfoGain.connect(gain3.gain); // modulate fifth swell

    // Start oscillators
    const now = ctx.currentTime;
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    lfo.start(now);

    droneOsc1Ref.current = osc1;
    droneOsc2Ref.current = osc2;
    droneOsc3Ref.current = osc3;
    lfoRef.current = lfo;

    return () => {
      cleanupSynth();
    };
  }, [isPlaying, binauralCarrier, musicSrc]);

  // Binaural Beat Oscillator Management
  useEffect(() => {
    const cleanupOscillators = () => {
      if (leftOscRef.current) {
        try {
          leftOscRef.current.stop();
        } catch (e) {
          /* ignore error if oscillator is not started */
        }
        leftOscRef.current = null;
      }
      if (rightOscRef.current) {
        try {
          rightOscRef.current.stop();
        } catch (e) {
          /* ignore error if oscillator is not started */
        }
        rightOscRef.current = null;
      }
    };

    if (!isPlaying || !binauralEnabled) {
      cleanupOscillators();
      return;
    }

    // Initialize Web Audio API only if it doesn't exist
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();
    }

    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(console.error);
    }

    // Initialize binaural gain node if not already
    if (!binauralGainRef.current) {
      binauralGainRef.current = ctx.createGain();
      binauralGainRef.current.connect(ctx.destination);
    }

    // Stop any existing oscillators before creating new ones
    cleanupOscillators();

    const leftFreq = parseFloat(binauralCarrier);
    const rightFreq = leftFreq + parseFloat(binauralBeat);

    // Create Left and Right Oscillators
    const leftOsc = ctx.createOscillator();
    const rightOsc = ctx.createOscillator();
    leftOsc.type = 'sine';
    rightOsc.type = 'sine';
    leftOsc.frequency.setValueAtTime(leftFreq, ctx.currentTime);
    rightOsc.frequency.setValueAtTime(rightFreq, ctx.currentTime);

    // Create Gain Nodes to pipe them
    const leftGain = ctx.createGain();
    const rightGain = ctx.createGain();
    
    // Merger Node
    const merger = ctx.createChannelMerger(2);

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(merger, 0, 0); // Connect left gain to merger input 0 (Left channel)
    rightGain.connect(merger, 0, 1); // Connect right gain to merger input 1 (Right channel)

    merger.connect(binauralGainRef.current);

    // Start oscillators
    leftOsc.start(0);
    rightOsc.start(0);

    leftOscRef.current = leftOsc;
    rightOscRef.current = rightOsc;

    return () => {
      cleanupOscillators();
    };
  }, [isPlaying, binauralEnabled, binauralCarrier, binauralBeat]);

  // Binaural Beat Volume Control
  useEffect(() => {
    if (binauralGainRef.current && audioContextRef.current) {
      const masterVolume = volume / 100;
      const targetBinVol = (binauralVolume / 100) * masterVolume;
      const now = audioContextRef.current.currentTime;
      binauralGainRef.current.gain.linearRampToValueAtTime(targetBinVol, now + 0.1);
    }
  }, [volume, binauralVolume, isPlaying, binauralEnabled]);

  useEffect(() => {
    const handleEnded = () => {
      if (onEnded) onEnded();
    };
    const voiceEl = voiceElementRef.current;
    voiceEl.addEventListener('ended', handleEnded);
    return () => voiceEl.removeEventListener('ended', handleEnded);
  }, [onEnded]);

  return null; // This is a logic-only controller for now
};

export default DuckingAudioPlayer;
