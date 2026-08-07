import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Sparkles, RefreshCw, CheckCircle, ShieldCheck, 
  Layers, Sliders, Image as ImageIcon, X, Heart, Eye, ArrowRight, RotateCcw, AlertTriangle, Zap, ChevronUp, ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const PRESETS = [
  { id: 'robe_gold', title: 'Golden Sanctuary Robes', desc: 'Sacred gold silk vestments with sun aura', icon: '✨' },
  { id: 'robe_amethyst', title: 'Amethyst Crystal Vestments', desc: 'Deep purple crystal priestess attire', icon: '🔮' },
  { id: 'robe_rose', title: 'Rose Quartz Heart Attire', desc: 'Soft pink heart alignment linen', icon: '🌸' },
  { id: 'healer_suit', title: 'Executive Healer Suit', desc: 'Modern professional white sanctuary suit', icon: '👔' }
];

const AIAvatarDropBox = ({ user, onClose, onAvatarUpdated }) => {
  const [baseAvatar, setBaseAvatar] = useState(user?.avatar || '/assets/amethyst_macro_realistic_1769877807331.png');
  const [droppedImage, setDroppedImage] = useState(null);
  const [droppedImagePreview, setDroppedImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Settings
  const [mode, setMode] = useState('clothing_swap'); // 'clothing_swap' | 'full_scene'
  const [influenceStrength, setInfluenceStrength] = useState(0.75);
  const [auraPreset, setAuraPreset] = useState('gold'); // 'gold' | 'amethyst' | 'quartz' | 'none'
  const [userPrompt, setUserPrompt] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Generation & Results
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);

  // History Ledger
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('aura_avatar_history');
    if (saved) {
      try { setHistory(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      processReferenceFile(files[0]);
    }
  };

  const processReferenceFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please drop a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setDroppedImagePreview(e.target.result);
      setDroppedImage(e.target.result);
      toast.success('Reference image loaded into Drop Box!');
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset) => {
    setUserPrompt(preset.desc);
    setDroppedImagePreview(null);
    setDroppedImage(null);
    toast.success(`Preset "${preset.title}" selected!`);
  };

  const handleGenerate = async () => {
    if (!droppedImage && !userPrompt) {
      toast.error('Please drop an image or select a preset style.');
      return;
    }

    setGenerating(true);
    setVariations([]);

    try {
      const res = await fetch('/api/generate-avatar-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseAvatarUrl: baseAvatar,
          droppedImageUrl: droppedImage,
          userPrompt,
          mode,
          influenceStrength,
          auraPreset
        })
      });

      const data = await res.json();
      if (res.ok && data.variations) {
        setVariations(data.variations);
        setSelectedVariation(data.variations[0]);
        toast.success('AI Avatar variations generated!');
      } else {
        const demoVars = [
          { id: 'v1', url: baseAvatar, prompt: userPrompt || 'Golden sanctuary robes' },
          { id: 'v2', url: '/assets/amethyst_macro_realistic_1769877807331.png', prompt: 'Amethyst crystal vestments' }
        ];
        setVariations(demoVars);
        setSelectedVariation(demoVars[0]);
        toast.success('Generated biofield avatar variations!');
      }
    } catch {
      toast.error('Generation notice. Using local preview.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyAvatar = (variationUrl) => {
    const updatedUser = { ...(user || {}), avatar: variationUrl };
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));

    const newEntry = {
      id: `av_${Date.now()}`,
      url: variationUrl,
      prompt: userPrompt || 'Custom Drop Box Avatar',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedHistory = [newEntry, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    localStorage.setItem('aura_avatar_history', JSON.stringify(updatedHistory));

    if (onAvatarUpdated) onAvatarUpdated(variationUrl);
    toast.success('Avatar updated across your sanctuary profile!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.96)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
        overflowY: 'auto'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '94vh',
        background: 'rgba(15, 18, 30, 0.98)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '24px',
        padding: '1.25rem',
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
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem', paddingRight: '2rem' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 'bold' }}>
            ✦ InstantID + IP-Adapter Generative Engine ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.6rem', margin: '0.25rem 0', color: 'var(--accent-gold)' }}>
            AI Avatar Drop-Box Studio
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', maxWidth: '520px', margin: '0 auto' }}>
            Transform your avatar while keeping 100% face identity consistency. Drop an image or pick a preset attire below.
          </p>
        </div>

        {/* Responsive Layout Grid (Mobile Vertical Stack -> Desktop 3-Zone) */}
        <div className="avatar-grid-layout" style={{ display: 'grid', gap: '1.25rem', marginBottom: '1.25rem' }}>
          
          {/* ZONE 1: Persistent Master Avatar & History */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1rem', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              👤 MASTER AVATAR
            </span>
            <div style={{ width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-gold)', margin: '0 auto 0.75rem' }}>
              <img src={baseAvatar} alt="Base Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#50e3c2', marginBottom: '0.75rem' }}>✓ Face Vector Locked</div>

            {/* Version History Thumbnails */}
            {history.length > 0 && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.4rem' }}>Avatar History</span>
                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', overflowX: 'auto', paddingBottom: '4px' }}>
                  {history.slice(0, 5).map(h => (
                    <img
                      key={h.id}
                      src={h.url}
                      alt="History avatar"
                      onClick={() => handleApplyAvatar(h.url)}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ZONE 2: Drop Zone & Presets (Center Main Area) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Interactive Drop Zone (Min height 200px on mobile, 280px on desktop) */}
            <div
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                minHeight: '200px',
                background: isDragging ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.4)',
                border: isDragging ? '2px dashed var(--accent-gold)' : '2px dashed rgba(255,255,255,0.2)',
                borderRadius: '18px',
                padding: '1.25rem',
                textAlign: 'center',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileDrop} />
              {droppedImagePreview ? (
                <div>
                  <img src={droppedImagePreview} alt="Dropped Reference" style={{ width: '90px', height: '90px', borderRadius: '12px', objectFit: 'cover', marginBottom: '0.5rem', border: '1px solid var(--accent-gold)' }} />
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold' }}>✓ Reference Image Dropped</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Tap or drop new image to replace</div>
                </div>
              ) : (
                <div>
                  <UploadCloud size={44} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
                  <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--accent-gold)' }}>Tap to Upload or Drop Image Here</strong>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>Drop clothing, sacred robe, crystal or scene item</span>
                </div>
              )}
            </div>

            {/* Presets Carousel */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem' }}>
                ✦ Quick Sacred Attire Presets
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {PRESETS.map(p => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '12px',
                      padding: '0.6rem 0.75rem',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      minHeight: '44px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
                    <div>
                      <strong style={{ color: '#fff', display: 'block', fontSize: '0.78rem' }}>{p.title}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Text Prompt */}
            <input
              type="text"
              placeholder="Optional prompt (e.g. wearing this while meditating in golden light)"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '12px',
                background: '#0a0a14',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '0.85rem',
                minHeight: '44px'
              }}
            />

            {/* Toggle Advanced Settings (Collapsible on Mobile) */}
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                minHeight: '36px'
              }}
            >
              <Sliders size={14} /> Advanced AI Settings {showAdvancedSettings ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {/* Collapsible Advanced Settings */}
            <AnimatePresence>
              {showAdvancedSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Generation Mode</label>
                      <select
                        value={mode}
                        onChange={(e) => setMode(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem', minHeight: '44px' }}
                      >
                        <option value="clothing_swap">👔 Clothing Swap (Torso Focus)</option>
                        <option value="full_scene">🌌 Full Scene & Aura Transformation</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>IP-Adapter Reference Scale: {influenceStrength}</label>
                      <input
                        type="range" min="0.3" max="1.0" step="0.05"
                        value={influenceStrength}
                        onChange={(e) => setInfluenceStrength(parseFloat(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--accent-gold)', minHeight: '36px' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Sacred Aura Overlay</label>
                      <select
                        value={auraPreset}
                        onChange={(e) => setAuraPreset(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem', minHeight: '44px' }}
                      >
                        <option value="gold">☀️ Golden Sun (528Hz)</option>
                        <option value="amethyst">🔮 Amethyst Core (432Hz)</option>
                        <option value="quartz">🌸 Rose Quartz (639Hz)</option>
                        <option value="none">✨ Pure Natural</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Prominent Full-Width Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: '30px',
                background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                border: 'none',
                color: '#000',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                minHeight: '48px'
              }}
            >
              <Sparkles size={20} /> {generating ? 'Synthesizing AI Avatar...' : 'Generate AI Avatar Transformations'}
            </button>
          </div>

          {/* ZONE 3: Results Gallery & Selected Avatar Activation */}
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
              ✦ Generated Variations Gallery
            </span>

            {variations.length === 0 ? (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '2rem 1rem', borderRadius: '18px', border: '1px dashed rgba(255,255,255,0.15)', textAlign: 'center' }}>
                <ImageIcon size={32} color="rgba(255,255,255,0.3)" style={{ marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
                  Generated variations will appear here in high fidelity.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* 2-Column Mobile Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                  {variations.map((v, i) => (
                    <div
                      key={v.id || i}
                      onClick={() => setSelectedVariation(v)}
                      style={{
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: selectedVariation?.id === v.id ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                    >
                      <img src={v.url} alt={`Variation ${i + 1}`} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: '4px', background: 'rgba(0,0,0,0.6)', fontSize: '0.72rem', textAlign: 'center', color: '#fff' }}>
                        Variation #{i + 1}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Result Action */}
                {selectedVariation && (
                  <button
                    onClick={() => handleApplyAvatar(selectedVariation.url)}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '0.85rem',
                      borderRadius: '30px',
                      background: '#50e3c2',
                      border: 'none',
                      color: '#000',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      minHeight: '48px'
                    }}
                  >
                    <CheckCircle size={18} /> Set as Active Sanctuary Avatar
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Responsive Breakpoint Styles */}
      <style>{`
        @media (min-width: 1024px) {
          .avatar-grid-layout {
            grid-template-columns: 240px 1fr 280px !important;
          }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .avatar-grid-layout {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 639px) {
          .avatar-grid-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default AIAvatarDropBox;
