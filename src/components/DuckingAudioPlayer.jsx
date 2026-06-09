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
