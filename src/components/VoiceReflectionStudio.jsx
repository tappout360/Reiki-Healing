import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Send, X, RefreshCw, Volume2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';

const VoiceReflectionStudio = ({ onClose, onSubmitted }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [seconds, setSeconds] = useState(0);
  const [authorName, setAuthorName] = useState('');
  const [storyText, setStoryText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElementRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        // Stop audio tracks
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handlePlayPreview = () => {
    if (!audioElementRef.current && audioUrl) {
      audioElementRef.current = new Audio(audioUrl);
      audioElementRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = async () => {
    if (!storyText.trim() && !audioBlob) {
      toast.error('Please record audio or write your reflection.');
      return;
    }

    setUploading(true);
    try {
      // Create Base64 data URL for voice reflection audio
      let base64Audio = null;
      if (audioBlob) {
        const reader = new FileReader();
        base64Audio = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(audioBlob);
        });
      }

      const reflectionData = {
        name: authorName.trim() || 'Anonymous Seeker',
        content: storyText || 'Spiritual Voice Reflection Session',
        audioData: base64Audio,
        durationSeconds: seconds,
        type: 'voice_reflection',
        status: 'approved', // Auto-approve voice reflections
        createdAt: new Date().toISOString()
      };

      await db.submitStory(reflectionData);
      toast.success('Voice reflection published to Sanctuary Community!');
      if (onSubmitted) onSubmitted();
      onClose();
    } catch (err) {
      console.error('Failed to submit voice reflection:', err);
      toast.error('Failed to publish. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.92)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        background: 'rgba(15, 18, 30, 0.95)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '24px',
        padding: '2rem',
        overflowY: 'auto',
        color: '#fff',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            ✦ Sanctuary Audio Studio ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.5rem 0', color: 'var(--accent-gold)' }}>
            Voice Reflections
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto' }}>
            Record up to a 60-second spiritual audio journal reflection to share your journey with seekers worldwide.
          </p>
        </div>

        {/* Recording Visualizer */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <motion.button
            animate={recording ? { scale: [1, 1.1, 1], boxShadow: ['0 0 20px #e74c3c', '0 0 50px #e74c3c', '0 0 20px #e74c3c'] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
            onClick={recording ? stopRecording : startRecording}
            disabled={uploading}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: recording ? '#e74c3c' : 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem'
            }}
          >
            {recording ? <Square size={36} fill="#fff" /> : <Mic size={40} />}
          </motion.button>

          <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 'bold', color: recording ? '#e74c3c' : 'var(--accent-gold)' }}>
            00:{seconds < 10 ? `0${seconds}` : seconds} / 01:00
          </div>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
            {recording ? '🎙️ Recording... Tap to stop' : audioBlob ? '✓ Audio Recorded' : 'Tap mic to start recording'}
          </div>
        </div>

        {/* Playback Preview */}
        {audioUrl && !recording && (
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={handlePlayPreview}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--accent-gold)',
                border: 'none',
                color: '#000',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Audio Preview ({seconds}s)</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Ready to publish to Sanctuary</div>
            </div>
            <button
              onClick={() => { setAudioBlob(null); setAudioUrl(null); setSeconds(0); }}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
            >
              <RefreshCw size={16} />
            </button>
          </div>
        )}

        {/* Form Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <input
            type="text"
            placeholder="Your Name / Spiritual Handle (Optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          />
          <textarea
            rows="3"
            placeholder="Write a brief reflection title or summary note..."
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.4)',
              color: '#fff',
              fontSize: '0.85rem',
              resize: 'vertical'
            }}
          />
        </div>

        {/* Submit Action */}
        <button
          onClick={handleSubmit}
          disabled={uploading || (!audioBlob && !storyText.trim())}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '0.85rem',
            borderRadius: '30px',
            background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Send size={18} /> {uploading ? 'Publishing...' : 'Share Voice Reflection'}
        </button>
      </div>
    </motion.div>
  );
};

export default VoiceReflectionStudio;
