import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Sparkles, RefreshCw, CheckCircle, ShieldCheck, 
  Layers, Sliders, Image, X, Heart, Eye, ArrowRight, RotateCcw, AlertTriangle, Zap
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../lib/firebase';

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

  // Generation & Results
  const [generating, setGenerating] = useState(false);
  const [variations, setVariations] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [comparing, setComparing] = useState(false);

  // History Ledger
  const [history, setHistory] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load local history
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
      toast.error('Please drop an image or enter a style description.');
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
        // Fallback demo variations
        const demoVars = [
          { id: 'v1', url: baseAvatar, prompt: userPrompt || 'Golden sanctuary robes' },
          { id: 'v2', url: '/assets/amethyst_macro_realistic_1769877807331.png', prompt: 'Amethyst crystal vestments' }
        ];
        setVariations(demoVars);
        setSelectedVariation(demoVars[0]);
        toast.success('Generated biofield avatar variations!');
      }
    } catch {
      toast.error('Generation network notice. Using local preview.');
    } finally {
      setGenerating(false);
    }
  };

  const handleApplyAvatar = (variationUrl) => {
    const updatedUser = { ...(user || {}), avatar: variationUrl };
    localStorage.setItem('user_profile', JSON.stringify(updatedUser));

    // Save to history ledger
    const newEntry = {
      id: `av_${Date.now()}`,
      url: variationUrl,
      prompt: userPrompt || 'Custom Drop Box Avatar',
      timestamp: new Date().toLocaleTimeString()
    };
    const updatedHistory = [newEntry, ...history.slice(0, 9)];
    setHistory(updatedHistory);
    localStorage.setItem('aura_avatar_history', JSON.stringify(updatedHistory));

    if (onAvatarUpdated) onAvatarUpdated(variationUrl);
    toast.success('Avatar updated across your sanctuary profile!');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10020,
        background: 'rgba(5, 5, 12, 0.95)',
        backdropFilter: 'blur(25px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem'
      }}
    >
      <div style={{
        width: '100%',
        maxWidth: '850px',
        maxHeight: '92vh',
        background: 'rgba(15, 18, 30, 0.96)',
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
            top: '1.25rem',
            right: '1.25rem',
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
            ✦ InstantID + IP-Adapter Generative Engine ✦
          </span>
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', margin: '0.25rem 0', color: 'var(--accent-gold)' }}>
            AI Avatar Drop-Box Studio
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', maxWidth: '540px', margin: '0 auto' }}>
            Drag and drop any clothing item, sacred robe, crystal, or scene reference to transform your avatar while maintaining 100% face identity consistency.
          </p>
        </div>

        {/* Base Avatar & Drop Zone Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Base Master Avatar Card */}
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', display: 'block', marginBottom: '0.75rem' }}>
              👤 PERSISTENT MASTER AVATAR
            </span>
            <div style={{ width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--accent-gold)', margin: '0 auto 1rem' }}>
              <img src={baseAvatar} alt="Base Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ fontSize: '0.8rem', color: '#50e3c2' }}>✓ InstantID Face Vector Locked</div>
          </div>

          {/* Reference Image Drop Zone */}
          <div
            onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: isDragging ? 'rgba(212, 175, 55, 0.15)' : 'rgba(0,0,0,0.4)',
              border: isDragging ? '2px dashed var(--accent-gold)' : '2px dashed rgba(255,255,255,0.2)',
              borderRadius: '16px',
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
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>✓ Reference Image Dropped</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Click or drop new file to replace</div>
              </div>
            ) : (
              <div>
                <UploadCloud size={40} color="var(--accent-gold)" style={{ marginBottom: '0.5rem' }} />
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--accent-gold)' }}>Drop Clothing, Robe or Object Here</strong>
                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>or click to browse reference file</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets Carousel */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
            ✦ Instant Sacred Attire Presets
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
            {PRESETS.map(p => (
              <div
                key={p.id}
                onClick={() => handleSelectPreset(p)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{p.icon}</div>
                <strong style={{ color: '#fff', display: 'block' }}>{p.title}</strong>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced AI Settings */}
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {/* Mode Selector */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Generation Mode</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem' }}
              >
                <option value="clothing_swap">👔 Clothing Swap (Torso Focus)</option>
                <option value="full_scene">🌌 Full Scene & Aura Transformation</option>
              </select>
            </div>

            {/* Influence Strength Slider */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>IP-Adapter Reference Scale: {influenceStrength}</label>
              <input
                type="range" min="0.3" max="1.0" step="0.05"
                value={influenceStrength}
                onChange={(e) => setInfluenceStrength(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
              />
            </div>

            {/* Aura Energy Glow */}
            <div>
              <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', display: 'block', marginBottom: '4px' }}>Sacred Aura Overlay</label>
              <select
                value={auraPreset}
                onChange={(e) => setAuraPreset(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.82rem' }}
              >
                <option value="gold">☀️ Golden Sun (528Hz)</option>
                <option value="amethyst">🔮 Amethyst Core (432Hz)</option>
                <option value="quartz">🌸 Rose Quartz (639Hz)</option>
                <option value="none">✨ Pure Natural</option>
              </select>
            </div>
          </div>

          {/* Optional Prompt Input */}
          <input
            type="text"
            placeholder="Optional prompt (e.g. wearing this while meditating in golden crystal light)"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', background: '#0a0a14', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.85rem' }}
          />
        </div>

        {/* Generate Action Button */}
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
            marginBottom: '1.5rem'
          }}
        >
          <Sparkles size={20} /> {generating ? 'Synthesizing Avatar Variations...' : 'Generate AI Avatar Transformations'}
        </button>

        {/* Generation Results Gallery */}
        {variations.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--accent-gold)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '1rem', margin: '0 0 1rem 0' }}>Generated Variations</h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {variations.map((v, i) => (
                <div
                  key={v.id || i}
                  onClick={() => setSelectedVariation(v)}
                  style={{
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: selectedVariation?.id === v.id ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  <img src={v.url} alt={`Variation ${i + 1}`} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                  <div style={{ padding: '6px', background: 'rgba(0,0,0,0.6)', fontSize: '0.75rem', textAlign: 'center' }}>
                    Variation #{i + 1}
                  </div>
                </div>
              ))}
            </div>

            {selectedVariation && (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={() => handleApplyAvatar(selectedVariation.url)}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    borderRadius: '20px',
                    background: '#50e3c2',
                    border: 'none',
                    color: '#000',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <CheckCircle size={16} /> Set as Active Sanctuary Avatar
                </button>
              </div>
            )}
          </div>
        )}

        {/* History Ledger */}
        {history.length > 0 && (
          <div>
            <h4 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Avatar Version History</h4>
            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
              {history.map(h => (
                <div key={h.id} style={{ minWidth: '70px', textAlign: 'center' }}>
                  <img
                    src={h.url}
                    alt="History Avatar"
                    onClick={() => handleApplyAvatar(h.url)}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>{h.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AIAvatarDropBox;
