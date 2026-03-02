import React, { useState, useEffect, useCallback, useRef } from 'react';
import { compositeAvatar, renderLivePreview, LAYERS } from '../utils/AvatarCompositingEngine';

/**
 * AvatarRenderer — Premium avatar system with:
 *   • Full Body upload + AI-style filter presets
 *   • Ready Player Me Professional 3D integration
 *   • 8 built-in high-quality skins
 *   • Item Synchronization: Equips items (chests, legs, etc.) before AI generation
 *   • Animated background effects (particles, glow, shimmer)
 *   • Tabbed builder panel: Full Body | Skin | 3D Pro | Face | Body
 */

// ─── Built-In Skins ───
const SKINS = [
  { id: 'male',   name: 'Male Classic',    src: '/assets/avatars/skin_male.png',         gender: 'male' },
  { id: 'medium', name: 'Male Athletic',   src: '/assets/avatars/skin_medium.png',       gender: 'male' },
  { id: 'dark',   name: 'Male Sleek',      src: '/assets/avatars/skin_dark.png',         gender: 'male' },
  { id: 'mystic', name: 'Mystic Aura',     src: '/assets/avatars/skin_mystic.png',       gender: 'male' },
  { id: 'light',  name: 'Classic',         src: '/assets/avatars/skin_light.png',        gender: 'female' },
  { id: 'female', name: 'Athletic',        src: '/assets/avatars/skin_female.png',       gender: 'female' },
  { id: 'female_dark',  name: 'Dark Hair',     src: '/assets/avatars/skin_female_dark.png',  gender: 'female' },
  { id: 'female_curly', name: 'Natural Curly', src: '/assets/avatars/skin_female_curly.png', gender: 'female' },
];

// ─── AI Style Filter Presets (applied to uploaded photos) ───
const AI_STYLES = [
  { id: 'ethereal',  name: 'Ethereal',   filter: 'contrast(1.15) saturate(0.85) brightness(1.1) hue-rotate(-5deg)', overlay: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, rgba(100,60,180,0.08) 50%, transparent 80%)' },
  { id: 'cyberpunk', name: 'Cyberpunk',  filter: 'contrast(1.3) saturate(1.4) brightness(0.95) hue-rotate(10deg)',  overlay: 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(255,0,128,0.08) 100%)' },
  { id: 'oil',       name: 'Oil Paint',  filter: 'contrast(1.2) saturate(1.1) brightness(1.05) blur(0.3px)',        overlay: 'radial-gradient(circle, rgba(180,130,60,0.1) 0%, transparent 70%)' },
];

// ─── Face Feature Options ───
const EYE_SHAPES  = [
  { id: 'round',   label: 'Round',   d: 'M4,8 Q8,2 12,8 Q8,6 4,8Z' },
  { id: 'almond',  label: 'Almond',  d: 'M2,8 Q8,2 14,8 Q8,5 2,8Z' },
  { id: 'narrow',  label: 'Narrow',  d: 'M2,7 Q8,4 14,7 Q8,6 2,7Z' },
];
const EYE_COLORS  = [
  { id: 'brown',  label: 'Brown',  color: '#6B3A2A' },
  { id: 'blue',   label: 'Blue',   color: '#3B7DD8' },
  { id: 'green',  label: 'Green',  color: '#2D8F4E' },
  { id: 'hazel',  label: 'Hazel',  color: '#8B7240' },
  { id: 'violet', label: 'Violet', color: '#7B3FA0' },
];
const MOUTH_SHAPES = [
  { id: 'smile',   label: '😊', d: 'M3,4 Q8,10 13,4' },
  { id: 'neutral', label: '😐', d: 'M3,6 L13,6' },
  { id: 'slight',  label: '🙂', d: 'M3,5 Q8,8 13,5' },
];
const BROW_STYLES = [
  { id: 'natural', label: 'Natural', d: 'M2,6 Q8,2 14,5' },
  { id: 'arched',  label: 'Arched',  d: 'M2,7 Q6,1 14,5' },
  { id: 'thick',   label: 'Thick',   d: 'M2,6 Q8,1 14,5', strokeWidth: 2.5 },
];

// ─── Storage Keys ───
const KEYS = {
  skin:  'aura_avatar_skin',
  photo: 'aura_avatar_photo',
  style: 'aura_avatar_style',
  face:  'aura_avatar_face',
  body:  'aura_avatar_body',
};

const load = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const save = (key, val) => { try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch {} };

const getDefaultSkin = (identity) => {
  const id = (identity || '').toLowerCase().trim();
  if (id.includes('male') && !id.includes('female')) return 'male';
  if (id.includes('female') || id.includes('woman') || id.includes('girl')) return 'light';
  return 'male';
};

// ─── Animated Background Keyframes ───
const KEYFRAMES_ID = 'avatar-bg-keyframes';
const injectKeyframes = () => {
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement('style');
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes avatarTwinkle { 0%,100%{opacity:0.2;transform:scale(0.8)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes avatarNebula { 0%{transform:rotate(0deg) scale(1)} 100%{transform:rotate(360deg) scale(1.05)} }
    @keyframes avatarPulse { 0%,100%{opacity:0.3} 50%{opacity:0.7} }
    @keyframes avatarShimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  `;
  document.head.appendChild(style);
};

const GENERATED_AVATAR_KEY = 'aura_ai_avatar_generated';

const generateAvatarOnCanvas = async (photoSrc, style, equippedItems = {}) => {
  // Delegate to the compositing engine for proper z-index layering & anchor points
  return compositeAvatar({
    baseSrc: photoSrc,
    styleFilter: style ? (AI_STYLES.find(s => s.id === style)?.filter || '') : '',
    equippedItems,
  });
};

const generateParticles = (count = 12) => {
  const p = [];
  for (let i = 0; i < count; i++) {
    p.push({ left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, size: 1.5 + Math.random()*2.5, delay: Math.random()*4, duration: 2+Math.random()*3 });
  }
  return p;
};

const AI_GENERATION_COST = 50;
const AVATAR_SERVER_URL = 'http://127.0.0.1:3100'; // Changed to 127.0.0.1 for cross-platform stability

const AvatarRenderer = ({ 
  equippedAvatar = {}, 
  showBuilder, 
  onBuilderClose, 
  compact, 
  userIdentity, 
  goldBalance = 0, 
  spendGold,
  droppedItems = [],
  setDroppedItems,
  saveToArchive,
  isSafeMode = false,
  purchasedItems = []
}) => {
  const [skinId, setSkinId] = useState(() => {
    const saved = localStorage.getItem(KEYS.skin);
    return (saved && SKINS.find(s => s.id === saved)) ? saved : getDefaultSkin(userIdentity);
  });
  const [photoData, setPhotoData] = useState(() => localStorage.getItem(KEYS.photo) || '');
  const [aiStyle, setAiStyle] = useState(() => localStorage.getItem(KEYS.style) || 'ethereal');
  const [face, setFace] = useState(() => load(KEYS.face, { eyeShape: 'almond', eyeColor: 'brown', mouth: 'slight', brow: 'natural' }));
  const [body, setBody] = useState(() => load(KEYS.body, { height: 50, build: 50 }));
  const [builderTab, setBuilderTab] = useState('photo');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [generatedAvatar, setGeneratedAvatar] = useState(() => localStorage.getItem(GENERATED_AVATAR_KEY) || '');
  const [rpmAvatarUrl, setRpmAvatarUrl] = useState(() => localStorage.getItem('aura_rpm_avatar') || '');
  const [showRPM, setShowRPM] = useState(false);
  
  // -- New AI Enhancements --
  const [aiExpression, setAiExpression] = useState('peaceful');
  const [aiAction, setAiAction] = useState('standing confidently');
  const [aiBackground, setAiBackground] = useState('');
  const [isDraggingItem, setIsDraggingItem] = useState(false);
  
  const fileRef = useRef(null);
  const [particles] = useState(() => generateParticles());

  const RPM_SUBDOMAIN = 'aura-ai';

  useEffect(() => { injectKeyframes(); }, []);

  useEffect(() => {
    const handleRPMEvents = (event) => {
      try {
        const json = JSON.parse(event.data);
        if (json?.source !== 'readyplayerme') return;
        if (json.eventName === 'v1.avatar.exported') {
          const url = json.data.url;
          setRpmAvatarUrl(url);
          localStorage.setItem('aura_rpm_avatar', url);
          setShowRPM(false);
          if (onBuilderClose) onBuilderClose();
        }
      } catch {}
    };
    window.addEventListener('message', handleRPMEvents);
    return () => window.removeEventListener('message', handleRPMEvents);
  }, [onBuilderClose]);

  const handleSkinChange = (id) => { setSkinId(id); save(KEYS.skin, id); };
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhotoData(reader.result); localStorage.setItem(KEYS.photo, reader.result); };
    reader.readAsDataURL(file);
  };
  const handleRemovePhoto = () => { setPhotoData(''); localStorage.removeItem(KEYS.photo); };
  const updateFace = (key, val) => { setFace(prev => { const n = { ...prev, [key]: val }; save(KEYS.face, n); return n; }); };
  const updateBody = (key, val) => { setBody(prev => { const n = { ...prev, [key]: Number(val) }; save(KEYS.body, n); return n; }); };

  const heightScale = 0.85 + (body.height / 100) * 0.3;
  const buildScale  = 0.88 + (body.build / 100) * 0.24;

  const handleAIGenerate = async () => {
    if (!photoData || aiGenerating) return;
    if (spendGold && goldBalance < AI_GENERATION_COST) {
      alert(`Need ${AI_GENERATION_COST} gold. You have ${goldBalance}.`);
      return;
    }

    // Collect all equipped item data
    const equippedItems = Object.entries(equippedAvatar).filter(([_, item]) => Boolean(item)).map(([slot, item]) => ({
      name: item.name,
      slot: item.avatarSlot || slot,
      color: item.avatarStyle?.fill || '',
      icon: item.icon,
      emoji: item.avatarEmoji
    }));

    // Combine with dropped items
    const trayItems = droppedItems.map(item => ({
      name: item.name,
      slot: item.slot,
      color: item.color,
      icon: item.icon,
      emoji: item.avatarEmoji
    }));

    let itemsToRender = [...equippedItems, ...trayItems];

    // Fallback if empty
    if (itemsToRender.length === 0) {
      itemsToRender = [
        { name: 'healer robe', slot: 'chest', color: '#9b59b6', emoji: '🥋' },
        { name: 'crystal pendant', slot: 'necklace', color: '#fff', emoji: '💎' }
      ];
    }

    setAiGenerating(true);
    try {
      // 1. Generate the Reference Composite locally first
      const referenceComposite = await generateAvatarOnCanvas(photoData, aiStyle, equippedAvatar);
      
      const response = await fetch(`${AVATAR_SERVER_URL}/api/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          photo: referenceComposite || photoData,
          style: aiStyle,
          items: itemsToRender,
          background: aiBackground || equippedAvatar.background?.name || '',
          expression: aiExpression,
          action: aiAction
        }),
      });
      const data = await response.json();
        if (data.success && data.image) {
          setGeneratedAvatar(data.image);
          localStorage.setItem(GENERATED_AVATAR_KEY, data.image);
          if (spendGold) spendGold(AI_GENERATION_COST, true); // true = divert to healer bank
          setAiGenerated(true);
        setTimeout(() => { if (onBuilderClose) onBuilderClose(); }, 1000);
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      console.warn('AI failed, using fallback', err);
      const res = await generateAvatarOnCanvas(photoData, aiStyle, equippedAvatar);
      if (res) { setGeneratedAvatar(res); localStorage.setItem(GENERATED_AVATAR_KEY, res); }
    } finally {
      setAiGenerating(false);
    }
  };

  const currentSkin = SKINS.find(s => s.id === skinId) || SKINS[0];
  const currentStyle = AI_STYLES.find(s => s.id === aiStyle) || AI_STYLES[0];

  const tabBtn = (id, icon, label) => (
    <button
      key={id} onClick={() => setBuilderTab(id)}
      style={{
        flex: 1, border: 'none', background: builderTab === id ? 'rgba(212,175,55,0.1)' : 'transparent',
        borderBottom: builderTab === id ? '2px solid #d4af37' : '2px solid transparent',
        color: builderTab === id ? '#d4af37' : 'rgba(255,255,255,0.4)', padding: '10px 4px', cursor: 'pointer', fontSize: '0.65rem', fontWeight: 'bold'
      }}
    >{icon} {label}</button>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#080812', borderRadius: '16px', overflow: 'hidden' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        
        {/* Background Effects */}
        {!compact && particles.map((p, i) => (
           <div key={i} style={{ position: 'absolute', left: p.left, top: p.top, width: p.size, height: p.size, borderRadius: '50%', background: '#fff', opacity: 0.3, animation: `avatarTwinkle ${p.duration}s infinite ${p.delay}s` }} />
        ))}

        {/* Avatar Render */}
        <div style={{ 
          position: 'relative', zIndex: 2, width: '85%', height: '85%',
          transform: `scaleX(${buildScale}) scaleY(${heightScale})`, 
          transformOrigin: 'center bottom', transition: 'all 0.3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {rpmAvatarUrl ? (
            <img src={`${rpmAvatarUrl.replace('.glb', '.png')}?size=512&camera=fullbody`} style={{ maxHeight: '100%', maxWidth: '100%', display: 'block' }} alt="RPM" />
          ) : (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {/* Base Layer (Skin or Photo) */}
               {generatedAvatar ? (
                 <img src={generatedAvatar} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt="AI" />
               ) : photoData ? (
                 <img src={photoData} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', filter: currentStyle.filter }} alt="Photo" />
               ) : (
                 <img src={currentSkin.src} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt="Skin" />
               )}

               {/* Item Overlays (Only if not using AI generated result which already has them baked in) */}
               {!generatedAvatar && Object.values(equippedAvatar).map(item => {
                 if (item.avatarSlot === 'background' || item.avatarSlot === 'aura') return null;
                 return (
                   <div 
                     key={item.id} 
                     style={{ 
                       position: 'absolute', inset: 0, pointerEvents: 'none',
                       display: 'flex', alignItems: 'center', justifyContent: 'center'
                     }}
                   >
                     {/* If we have a PNG asset, render it. Otherwise, use a placeholder effect if possible */}
                     {item.src ? (
                       <img src={item.src} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} alt={item.name} />
                     ) : item.avatarEmoji ? (
                       <span style={{ fontSize: '2rem' }}>{item.avatarEmoji}</span>
                     ) : null}
                   </div>
                 );
               })}
            </div>
          )}
        </div>

        {/* Builder Overlay */}
        {showBuilder && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,25,0.95)', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#d4af37', fontWeight: 'bold', fontSize: '0.8rem' }}>AVATAR BUILDER</span>
              <button onClick={onBuilderClose} style={{ background: '#333', border: 'none', color: '#fff', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '1rem' }}>
              <div style={{ display: 'flex' }}>
                {tabBtn('photo', '📷', 'Full Body')}
                {tabBtn('skin', '🎨', 'Skin')}
                {tabBtn('rpm', '🕶️', 'Pro')}
                {tabBtn('face', '👤', 'Face')}
                {tabBtn('body', '📐', 'Body')}
              </div>
              {isSafeMode && (
                <div style={{ 
                  fontSize: '0.6rem', color: '#2ecc71', background: 'rgba(46,204,113,0.1)', 
                  padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(46,204,113,0.3)',
                  display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', letterSpacing: '0.5px'
                }}>
                  🛡️ SAFE MODE ACTIVE
                </div>
              )}
            </div>

            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
              {builderTab === 'photo' && (
                <div style={{ textAlign: 'center' }}>
                  {!photoData ? (
                    <button onClick={() => fileRef.current.click()} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: '#d4af37', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>📷 Upload Full Body Photo</button>
                  ) : (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        {AI_STYLES.map(s => (
                          <button key={s.id} onClick={() => setAiStyle(s.id)} style={{ padding: '8px', borderRadius: '6px', background: aiStyle === s.id ? '#d4af37' : '#222', border: 'none', color: aiStyle === s.id ? '#000' : '#fff', fontSize: '0.6rem' }}>{s.name}</button>
                        ))}
                      </div>
                      <button onClick={handleAIGenerate} disabled={aiGenerating} style={{ width: '100%', padding: '14px', borderRadius: '8px', background: 'linear-gradient(90deg, #d4af37, #9b59b6)', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
                        {aiGenerating ? 'Processing...' : `Generate AI Avatar (🪙${AI_GENERATION_COST})`}
                      </button>
                      <button onClick={handleRemovePhoto} style={{ marginTop: '12px', color: '#e74c3c', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.6rem' }}>Remove Photo</button>
                    </div>
                  )}
                  <input type="file" ref={fileRef} onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  
                  {/* Subject Enhancements */}
                  <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)' }}>
                    <h4 style={{ color: '#d4af37', fontSize: '0.75rem', marginBottom: '12px', textAlign: 'left' }}>AI SUBJECT ENHANCEMENT</h4>
                    
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ color: '#aaa', fontSize: '0.6rem', display: 'block', marginBottom: '4px', textAlign: 'left' }}>EXPRESSION</label>
                      <select 
                        value={aiExpression} 
                        onChange={(e) => setAiExpression(e.target.value)}
                        style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', fontSize: '0.65rem' }}
                      >
                        <option value="peaceful">Peaceful & Serene</option>
                        <option value="joyful">Extremely Happy / Joyful</option>
                        <option value="focused">Deeply Focused / Meditative</option>
                        <option value="compassionate">Compassionate & Loving</option>
                        <option value="empowered">Empowered & Strong</option>
                        <option value="mystical">Mystical & Wise</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ color: '#aaa', fontSize: '0.6rem', display: 'block', marginBottom: '4px', textAlign: 'left' }}>ACTION / POSE</label>
                      <select 
                        value={aiAction} 
                        onChange={(e) => setAiAction(e.target.value)}
                        style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', fontSize: '0.65rem' }}
                      >
                        <option value="standing confidently">Standing Confidently</option>
                        <option value="giving healing hands">Giving Healing Hands</option>
                        <option value="praying">Praying Peacefully</option>
                        <option value="meditating in lotus pose">Meditating in Lotus Pose</option>
                        <option value="channeling energy">Channeling Energy from Palms</option>
                        <option value="floating in mid-air">Floating Ethereally</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ color: '#aaa', fontSize: '0.6rem', display: 'block', marginBottom: '4px', textAlign: 'left' }}>SPECIAL BACKGROUND</label>
                      <select 
                        value={aiBackground} 
                        onChange={(e) => setAiBackground(e.target.value)}
                        style={{ width: '100%', background: '#111', color: '#fff', border: '1px solid #333', padding: '6px', borderRadius: '4px', fontSize: '0.65rem' }}
                      >
                        <option value="">(Use Equipped Background)</option>
                        <option value="a glowing crystal cavern with waterfalls">Crystal Cavern</option>
                        <option value="a serene mountaintop at sunrise">Mountaintop Sunrise</option>
                        <option value="deep space with nebulas and stars">Deep Space Nebula</option>
                        <option value="an ancient stone circle at night">Ancient Stone Circle</option>
                        <option value="a lush zen garden with cherry blossoms">Zen Garden</option>
                        <option value="inside a golden pyramid sanctuary">Golden Pyramid</option>
                      </select>
                    </div>

                    {/* Drag and Drop Information Area */}

                    {/* Aura AI — Reiki & Sage Item Recommendation */}
                    <div style={{
                      marginTop: '12px', padding: '10px 12px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(178,79,255,0.08), rgba(0,229,255,0.06))',
                      border: '1px solid rgba(178,79,255,0.15)',
                      display: 'flex', alignItems: 'flex-start', gap: '8px'
                    }}>
                      <span style={{ fontSize: '1rem', animation: 'avatarPulse 3s ease-in-out infinite' }}>🤖</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.6rem', color: '#b24fff', fontWeight: 700, marginBottom: '3px', letterSpacing: '0.5px' }}>AURA AI RECOMMENDS</div>
                        <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                          {Object.keys(equippedAvatar).some(k => equippedAvatar[k]?.collection === 'reiki_sage')
                            ? "I sense powerful Reiki & Sage energy in your loadout! Try combining the 🌿 Sage Amulet with the 💎 Crystal Cave background for maximum resonance."
                            : "Enhance your avatar with the exclusive 🔮 Reiki & Sage Collection! Visit the Gold Store to unlock items from T1 Good to T6 Outstanding."
                          }
                        </div>
                      </div>
                    </div>

                     <div 
                       onDragOver={(e) => { e.preventDefault(); setIsDraggingItem(true); }}
                       onDragLeave={() => setIsDraggingItem(false)}
                       onDrop={(e) => {
                         e.preventDefault();
                         setIsDraggingItem(false);
                         
                         if (isSafeMode) {
                           const files = e.dataTransfer.files;
                           if (files && files.length > 0) {
                             toast.error('Safe Mode: Drop items from your inventory to upgrade!');
                             return;
                           }
                         } else {
                           // Check for file drop if not in safe mode (or as a fallback)
                           const files = e.dataTransfer.files;
                           if (files && files.length > 0) {
                             const file = files[0];
                             if (file.type.startsWith('image/')) {
                               const reader = new FileReader();
                               reader.onload = () => { 
                                 setPhotoData(reader.result); 
                                 localStorage.setItem(KEYS.photo, reader.result); 
                                 toast.success('Source photo set via AI tray drop!');
                               };
                               reader.readAsDataURL(file);
                               return;
                             }
                           }
                         }

                         const itemData = e.dataTransfer.getData('aura_item');
                         if (itemData) {
                           try {
                             const item = JSON.parse(itemData);
                             
                             // Ownership check in Safe Mode
                             if (isSafeMode && !purchasedItems.includes(item.id)) {
                               toast.error('Safe Mode: You must purchase this item first!');
                               return;
                             }

                             if (droppedItems.some(i => i.id === item.id)) {
                               toast('Item already added to AI tray!');
                               return;
                             }
                             const newItem = {
                               id: item.id,
                               name: item.name,
                               slot: item.avatarSlot,
                               color: item.avatarStyle?.fill || ''
                             };
                             setDroppedItems(prev => [...prev, newItem]);
                             toast.success(`Added ${item.name} to AI generation tray!`);
                           } catch {}
                         }
                       }}
                       style={{ 
                         marginTop: '15px', padding: '15px', borderRadius: '8px', 
                         border: isDraggingItem ? '2px dashed #d4af37' : '1px dashed #444', 
                         background: isDraggingItem ? 'rgba(212,175,55,0.1)' : 'rgba(0,0,0,0.3)',
                         transition: 'all 0.2s', textAlign: 'center'
                       }}
                     >
                      <p style={{ color: isDraggingItem ? '#d4af37' : '#666', fontSize: '0.6rem', margin: 0 }}>
                        {isDraggingItem ? 'DROP ITEM HERE TO SYNC' : 'GRAB ITEM & DROP HERE TO UPGRADE'}
                      </p>
                    </div>

                    {/* Show list of dropped items if any */}
                    {droppedItems.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {droppedItems.map(item => (
                          <div key={item.id} style={{ background: 'rgba(212,175,55,0.2)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.6rem', color: '#fff', border: '1px solid #d4af37', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span>{item.name}</span>
                            <button 
                              onClick={() => setDroppedItems(prev => prev.filter(i => i.id !== item.id))}
                              style={{ background: 'none', border: 'none', color: '#d4af37', cursor: 'pointer', fontSize: '0.7rem', padding: 0 }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <button 
                          onClick={() => setDroppedItems([])}
                          style={{ fontSize: '0.55rem', color: '#aaa', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Clear All
                        </button>
                      </div>
                    )}
                  </div>
                  {generatedAvatar && (
                    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <img src={generatedAvatar} alt="Generated Avatar" style={{ width: '100%', borderRadius: '12px', border: '1px solid #d4af37' }} />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => saveToArchive({ type: 'image', url: generatedAvatar, name: `AI Avatar ${new Date().toLocaleDateString()}` })}
                          style={{ flex: 1, padding: '10px', background: 'rgba(212,175,55,0.2)', border: '1px solid #d4af37', color: '#d4af37', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          📜 Save to Sacred Archive
                        </button>
                        <button 
                          onClick={() => setGeneratedAvatar(null)} // Assuming setGeneratedAvatar(null) is equivalent to "Re-Generate" by clearing the current one
                          style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid #444', color: '#aaa', borderRadius: '8px', cursor: 'pointer' }}
                        >
                          Re-Generate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {builderTab === 'rpm' && (
                <div style={{ height: '300px' }}>
                  {!showRPM ? (
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: '#ccc', fontSize: '0.65rem', marginBottom: '12px' }}>Create a professional 3D personal avatar.</p>
                      <button onClick={() => setShowRPM(true)} style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#6366f1', border: 'none', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>🕶️ Launch Creator</button>
                      {rpmAvatarUrl && <button onClick={() => setRpmAvatarUrl('')} style={{ marginTop: '10px', color: '#e74c3c', background: 'none', border: 'none', fontSize: '0.6rem' }}>Disconnect Pro Avatar</button>}
                    </div>
                  ) : (
                    <iframe src={`https://${RPM_SUBDOMAIN}.readyplayer.me/avatar?frameApi`} style={{ width: '100%', height: '100%', border: 'none', borderRadius: '8px' }} />
                  )}
                </div>
              )}

              {builderTab === 'skin' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  {SKINS.map(s => (
                    <button key={s.id} onClick={() => handleSkinChange(s.id)} style={{ padding: '4px', background: skinId === s.id ? '#d4af37' : '#222', border: 'none', borderRadius: '8px' }}>
                      <img src={s.src} style={{ width: '100%', borderRadius: '4px' }} alt={s.name} />
                    </button>
                  ))}
                </div>
              )}

              {builderTab === 'face' && (
                <div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', marginBottom: '10px' }}>Customize facial features (Built-in skins only)</p>
                  <label style={{ color: '#fff', fontSize: '0.6rem' }}>EYE COLOR</label>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {EYE_COLORS.map(c => <button key={c.id} onClick={() => updateFace('eyeColor', c.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', background: c.color, border: face.eyeColor === c.id ? '2px solid #fff' : 'none' }} />)}
                  </div>
                </div>
              )}

              {builderTab === 'body' && (
                <div>
                  <label style={{ color: '#fff', fontSize: '0.6rem' }}>HEIGHT</label>
                  <input type="range" min="0" max="100" value={body.height} onChange={(e) => updateBody('height', e.target.value)} style={{ width: '100%', accentColor: '#d4af37' }} />
                  <label style={{ color: '#fff', fontSize: '0.6rem', marginTop: '12px', display: 'block' }}>BUILD</label>
                  <input type="range" min="0" max="100" value={body.build} onChange={(e) => updateBody('build', e.target.value)} style={{ width: '100%', accentColor: '#d4af37' }} />
                </div>
              )}
            </div>
            
            <div style={{ padding: '8px', textAlign: 'center', borderTop: '1px solid #333' }}>
              <span style={{ fontSize: '0.5rem', color: '#666' }}>✓ Settings are auto-saved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvatarRenderer;
