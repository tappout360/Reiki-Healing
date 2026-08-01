import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Quote, Star, Sparkles, Mic, Square, Trash2, Play, Pause } from 'lucide-react';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

const MyStoriesPortal = ({ onClose }) => {
  const { t } = useLanguage();
  const [stories, setStories] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceBase64, setVoiceBase64] = useState('');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playingStoryId, setPlayingStoryId] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const previewAudioRef = useRef(null);
  const feedAudioRef = useRef(null);

  // Start Audio Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setVoiceBase64(reader.result);
        };

        // Close stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error("Failed to access microphone:", err);
      import('react-hot-toast').then(({ toast }) => {
        toast.error("Microphone access denied or unsupported.");
      });
    }
  };

  // Stop Audio Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecording(false);
  };

  // Preview Audio
  const togglePreviewAudio = () => {
    if (isPlayingPreview) {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
      setIsPlayingPreview(false);
    } else {
      if (voiceBase64) {
        const audio = new Audio(voiceBase64);
        audio.onended = () => setIsPlayingPreview(false);
        previewAudioRef.current = audio;
        audio.play().catch(e => console.error("Audio playback error:", e));
        setIsPlayingPreview(true);
      }
    }
  };

  // Discard Recording
  const discardRecording = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setVoiceBase64('');
    setIsPlayingPreview(false);
    setRecordingDuration(0);
  };

  // Play Story Voice Reflection in Feed
  const toggleFeedAudio = (storyId, voiceData) => {
    if (playingStoryId === storyId) {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
      }
      setPlayingStoryId(null);
    } else {
      if (feedAudioRef.current) {
        feedAudioRef.current.pause();
      }
      const audio = new Audio(voiceData);
      audio.onended = () => setPlayingStoryId(null);
      feedAudioRef.current = audio;
      audio.play().catch(e => console.error("Feed audio playback error:", e));
      setPlayingStoryId(storyId);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (previewAudioRef.current) previewAudioRef.current.pause();
      if (feedAudioRef.current) feedAudioRef.current.pause();
    };
  }, []);

  useEffect(() => {
    const loadStories = async () => {
      if (isFirebaseConfigured()) {
        try {
          const data = await db.getApprovedStories();
          setStories(data);
        } catch (err) {
          console.error('Error loading stories:', err);
        }
      } else {
        const allStories = JSON.parse(localStorage.getItem('aura_stories') || '[]');
        setStories(allStories.filter(s => s.status === 'approved'));
      }
    };
    loadStories();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        top: 0, left: 0, width: '100%', height: '100%',
        background: 'rgba(5, 5, 10, 0.95)',
        backdropFilter: 'blur(15px)',
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '4rem 2rem',
        overflowY: 'auto'
      }}
    >
      <button 
        onClick={onClose}
        style={{
          position: 'fixed', top: '2rem', right: '2rem',
          background: 'rgba(255,255,255,0.1)', border: 'none',
          color: 'white', padding: '10px', borderRadius: '50%',
          cursor: 'pointer', zIndex: 10001
        }}
      >
        <X size={24} />
      </button>

      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           style={{ marginBottom: '1.5rem', display: 'inline-block' }}
        >
            <Sparkles size={48} color="var(--accent-gold)" />
        </motion.div>
        <h2 style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>{t('reflectionsTitle')}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontStyle: 'italic' }}>
          {t('reflectionsSub')}
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
        gap: '2.5rem', 
        width: '100%', 
        maxWidth: '1200px' 
      }}>
        {stories.map((story, i) => (
          <motion.div
            key={story.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass"
            style={{
              padding: '2.5rem',
              borderRadius: '24px',
              border: '1px solid rgba(212, 175, 55, 0.2)',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(212, 175, 55, 0.03) 100%)',
              position: 'relative'
            }}
          >
            <Quote size={32} style={{ color: 'var(--accent-gold)', opacity: 0.2, marginBottom: '1.5rem' }} />
            <p style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-main)', marginBottom: '2rem', fontStyle: 'italic' }}>
              "{story.story}"
            </p>
            {story.voiceData && (
              <div style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(212, 175, 55, 0.15)',
                borderRadius: '12px',
                padding: '0.8rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '1.5rem'
              }}>
                <button
                  onClick={() => toggleFeedAudio(story.id, story.voiceData)}
                  style={{
                    background: 'var(--accent-gold)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'black'
                  }}
                >
                  {playingStoryId === story.id ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '2px' }} />}
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>Voice Reflection</div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden', position: 'relative' }}>
                    <motion.div
                      animate={{ width: playingStoryId === story.id ? '100%' : '0%' }}
                      transition={{ duration: playingStoryId === story.id ? 60 : 0, ease: 'linear' }}
                      style={{
                        background: 'var(--accent-gold)',
                        height: '100%',
                        width: '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '600', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                {story.userName}
              </span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(story.rating)].map((_, i) => (
                  <Star key={i} size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {stories.length === 0 && (
        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>
          <p>{t('reflectionsEmpty')}</p>
        </div>
      )}

      {/* Share Your Story Section */}
      <div style={{ 
        width: '100%', 
        maxWidth: '800px', 
        marginTop: '6rem', 
        padding: '3rem', 
        borderRadius: '32px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>{t('reflectionsShareTitle')}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
          {t('reflectionsShareDesc')}<br />
          <span style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--accent-gold)' }}>
            {t('reflectionsReviewNotice')}
          </span>
        </p>

        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const content = e.target.story.value;
            const rating = parseInt(e.target.rating.value);
            const sharePublicly = e.target.sharePublicly?.checked ?? true;

            if (!name || !content) return;

            // Content Moderation check (keep out discrimination & sexual content)
            try {
              const { moderateContent } = await import('../utils/moderation');
              const moderationResult = moderateContent(content);
              if (!moderationResult.isSafe) {
                import('react-hot-toast').then(({ toast }) => {
                  toast.error("Submission flagged: Please ensure your reflection aligns with our sanctuary's guidelines (no discriminatory, abusive, or sexually explicit content).");
                });
                return;
              }
            } catch (modErr) {
              console.error("Moderation import error:", modErr);
            }

            const currentUser = isFirebaseConfigured() ? auth.getUser() : null;
            if (!sharePublicly && !currentUser && isFirebaseConfigured()) {
              import('react-hot-toast').then(({ toast }) => {
                toast.error("Please log in to save private reflections to your personal profile.");
              });
              return;
            }

            const newStory = {
              userName: name,
              userEmail: currentUser?.email || null,
              story: content,
              rating,
              voiceData: voiceBase64 || null,
              status: sharePublicly ? 'pending' : 'private',
              userId: currentUser?.uid || null,
              timestamp: new Date().toISOString()
            };

            try {
              if (isFirebaseConfigured()) {
                await db.submitStory(newStory);
              } else {
                const existing = JSON.parse(localStorage.getItem('aura_stories') || '[]');
                localStorage.setItem('aura_stories', JSON.stringify([...existing, { ...newStory, id: Date.now().toString(), timestamp: new Date().toISOString() }]));
              }
              
              import('react-hot-toast').then(({ toast }) => {
                toast.success(sharePublicly ? t('reflectionsSuccessToast') : "Reflection saved privately to your profile.");
              });
              discardRecording();
            } catch (err) {
              console.error('Error submitting story:', err);
              import('react-hot-toast').then(({ toast }) => {
                toast.error(t('reflectionsErrorToast'));
              });
            }

            e.target.reset();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>{t('reflectionsLabelName')}</label>
              <input name="name" type="text" placeholder={t('reflectionsPlaceholderName')} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>{t('reflectionsLabelScale')}</label>
              <select name="rating" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="5" style={{ background: '#0a0a14', color: 'white' }}>{t('reflectionsScale5')}</option>
                <option value="4" style={{ background: '#0a0a14', color: 'white' }}>{t('reflectionsScale4')}</option>
                <option value="3" style={{ background: '#0a0a14', color: 'white' }}>{t('reflectionsScale3')}</option>
                <option value="2" style={{ background: '#0a0a14', color: 'white' }}>{t('reflectionsScale2')}</option>
                <option value="1" style={{ background: '#0a0a14', color: 'white' }}>{t('reflectionsScale1')}</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>{t('reflectionsLabelJourney')}</label>
            <textarea name="story" rows="4" placeholder={t('reflectionsPlaceholderJourney')} required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }} />
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.5rem' }}>
            <input 
              type="checkbox" 
              name="sharePublicly" 
              id="sharePublicly" 
              defaultChecked={true}
              style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--accent-gold)' }}
            />
            <label htmlFor="sharePublicly" style={{ fontSize: '0.9rem', color: 'white', cursor: 'pointer' }}>
              Share publicly on homepage (Requires Carissa's approval)
            </label>
          </div>
          
          <style>{`
            @keyframes recordPulse {
              0% { opacity: 0.4; }
              50% { opacity: 1; }
              100% { opacity: 0.4; }
            }
          `}</style>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>Voice Reflection (Optional)</span>
              {isRecording && (
                <span style={{ fontSize: '0.8rem', color: '#ff7675', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff7675', display: 'inline-block', animation: 'recordPulse 1.5s infinite' }} />
                  Recording... {Math.floor(recordingDuration / 60)}:{(recordingDuration % 60).toString().padStart(2, '0')} / 1:00
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {!voiceBase64 ? (
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  style={{
                    background: isRecording ? '#ff7675' : 'rgba(255,255,255,0.05)',
                    border: '1px solid ' + (isRecording ? '#ff7675' : 'rgba(255,255,255,0.1)'),
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: isRecording ? 'black' : 'white',
                    transition: 'all 0.3s'
                  }}
                >
                  {isRecording ? <Square size={18} fill="black" /> : <Mic size={18} />}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                  <button
                    type="button"
                    onClick={togglePreviewAudio}
                    style={{
                      background: 'var(--accent-gold)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'black'
                    }}
                  >
                    {isPlayingPreview ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1 }}>Recorded Reflection ready</span>
                  <button
                    type="button"
                    onClick={discardRecording}
                    style={{
                      background: 'rgba(255,118,117,0.1)',
                      border: '1px solid #ff7675',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#ff7675'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
              {!voiceBase64 && (
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {isRecording ? "Click square to stop and save" : "Click mic to record up to 60 seconds of your voice."}
                </span>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            style={{ 
              marginTop: '1rem', 
              padding: '1.2rem', 
              borderRadius: '12px', 
              background: 'var(--accent-gold)', 
              color: 'black', 
              fontWeight: 'bold', 
              border: 'none', 
              cursor: 'pointer' 
            }}
          >
            {t('reflectionsSubmitBtn')}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default MyStoriesPortal;
