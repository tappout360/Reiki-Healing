import React, { useState, useEffect, useCallback, useRef } from 'react';

/**
 * PetAvatarRenderer — Premium pet avatar with matching owner graphics quality
 *
 * Features:
 *   • Photo upload for real pet photos with AI-style filters
 *   • Built-in premium pet type illustrations (CSS/SVG art)
 *   • Animated background effects matching owner's avatar
 *   • "Match My Pet" theme — pet bg syncs with owner's equipped background
 *   • Accessories rendered as styled overlays
 *   • Pet mood & level indicators
 */

// ─── Pet Type Visual Configs ───
const PET_TYPES = {
  dog: {
    emoji: '🐕',
    name: 'Dog',
    colors: ['#D4A56A', '#8B6914', '#C5A880'],
    silhouette: 'M25,60 Q20,45 18,35 Q16,25 22,18 Q26,12 32,12 Q38,12 42,18 Q48,25 46,35 Q44,45 39,60 Z',
    ears: 'M20,20 Q15,8 22,14 M44,20 Q49,8 42,14',
    eyes: { left: { cx: 28, cy: 26 }, right: { cx: 38, cy: 26 } },
    nose: 'M31,32 Q33,30 35,32 Q33,35 31,32',
    mouth: 'M28,36 Q33,42 38,36',
    tail: 'M39,58 Q50,52 48,42',
  },
  cat: {
    emoji: '🐈',
    name: 'Cat',
    colors: ['#4A4A4A', '#2C2C2C', '#666666'],
    silhouette: 'M24,60 Q22,48 20,38 Q18,28 22,20 Q24,14 28,12 Q33,10 38,12 Q42,14 44,20 Q48,28 46,38 Q44,48 42,60 Z',
    ears: 'M22,20 L18,6 L28,16 M44,20 L48,6 L38,16',
    eyes: { left: { cx: 28, cy: 26 }, right: { cx: 38, cy: 26 } },
    nose: 'M31,31 Q33,29 35,31 Q33,33 31,31',
    mouth: 'M28,34 Q33,38 38,34',
    tail: 'M42,58 Q55,50 54,38 Q53,30 48,35',
  },
  bunny: {
    emoji: '🐇',
    name: 'Bunny',
    colors: ['#F5F5F5', '#E8D5C4', '#FFE4E1'],
    silhouette: 'M24,60 Q22,50 21,40 Q20,30 24,22 Q28,16 33,16 Q38,16 42,22 Q46,30 45,40 Q44,50 42,60 Z',
    ears: 'M26,22 Q24,2 28,18 M40,22 Q42,2 38,18',
    eyes: { left: { cx: 28, cy: 28 }, right: { cx: 38, cy: 28 } },
    nose: 'M31,33 Q33,31 35,33 Q33,35 31,33',
    mouth: 'M29,36 Q33,40 37,36',
    tail: 'M40,58 Q46,56 44,52',
  },
  bird: {
    emoji: '🦜',
    name: 'Bird',
    colors: ['#FF6B35', '#FFB347', '#FF4444'],
    silhouette: 'M26,60 Q24,50 23,40 Q22,30 26,22 Q30,16 33,14 Q36,16 40,22 Q44,30 43,40 Q42,50 40,60 Z',
    ears: '',
    eyes: { left: { cx: 29, cy: 24 }, right: { cx: 37, cy: 24 } },
    nose: 'M30,28 L33,32 L36,28 Z',
    mouth: '',
    tail: 'M36,55 Q44,60 48,52 Q50,46 46,50',
    wing: 'M22,35 Q12,38 16,48 Q20,52 24,46',
  },
  hamster: {
    emoji: '🐹',
    name: 'Hamster',
    colors: ['#F5C89A', '#D4A76A', '#FFE0BD'],
    silhouette: 'M22,58 Q18,48 18,38 Q18,26 24,20 Q30,14 36,20 Q42,26 42,38 Q42,48 38,58 Z',
    ears: 'M22,22 Q16,12 24,18 M38,22 Q44,12 36,18',
    eyes: { left: { cx: 26, cy: 30 }, right: { cx: 36, cy: 30 } },
    nose: 'M29,34 Q31,32 33,34 Q31,36 29,34',
    mouth: 'M26,38 Q31,42 36,38',
    tail: '',
    cheeks: true,
  },
  fish: {
    emoji: '🐠',
    name: 'Fish',
    colors: ['#4ECDC4', '#45B7D1', '#96E6A1'],
    silhouette: 'M15,35 Q20,18 33,16 Q46,18 50,35 Q46,52 33,54 Q20,52 15,35 Z',
    ears: '',
    eyes: { left: { cx: 28, cy: 32 }, right: { cx: 38, cy: 32 } },
    nose: '',
    mouth: 'M24,38 Q28,42 32,38',
    tail: 'M48,35 L58,25 L58,45 Z',
    fin: 'M33,18 Q35,8 38,18',
  },
};

// ─── AI Style Filters (matching owner system) ───
const PET_STYLES = [
  { id: 'ethereal',  name: 'Ethereal',  filter: 'contrast(1.15) saturate(0.85) brightness(1.1) hue-rotate(-5deg)',  overlay: 'radial-gradient(ellipse, rgba(212,175,55,0.12) 0%, transparent 80%)' },
  { id: 'cyberpunk', name: 'Neon',      filter: 'contrast(1.3) saturate(1.4) brightness(0.95) hue-rotate(10deg)',   overlay: 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(255,0,128,0.08) 100%)' },
  { id: 'oil',       name: 'Painterly', filter: 'contrast(1.2) saturate(1.1) brightness(1.05)',                     overlay: 'radial-gradient(circle, rgba(180,130,60,0.1) 0%, transparent 70%)' },
];

const PET_STORAGE = {
  photo: (email, petId) => `aura_pet_photo_${email}_${petId}`,
  style: (email, petId) => `aura_pet_style_${email}_${petId}`,
};

// ─── Inject Keyframes ───
const PET_KF_ID = 'pet-avatar-keyframes';
const injectPetKeyframes = () => {
  if (document.getElementById(PET_KF_ID)) return;
  const s = document.createElement('style');
  s.id = PET_KF_ID;
  s.textContent = `
    @keyframes petBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
    @keyframes petBreath { 0%,100%{transform:scale(1)} 50%{transform:scale(1.02)} }
    @keyframes petTail { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(8deg)} 75%{transform:rotate(-8deg)} }
    @keyframes petGlow { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
    @keyframes petSparkle { 0%,100%{opacity:0;transform:scale(0.5)} 50%{opacity:1;transform:scale(1.2)} }
    @keyframes petHeart { 0%{opacity:0;transform:translateY(0) scale(0.5)} 50%{opacity:1;transform:translateY(-8px) scale(1)} 100%{opacity:0;transform:translateY(-16px) scale(0.8)} }
  `;
  document.head.appendChild(s);
};

const AVATAR_SERVER_URL = 'http://127.0.0.1:3100';
const AI_GENERATION_COST = 50;

const generatePetOnCanvas = async (photoSrc, petType, equippedItems = []) => {
  return new Promise(async (resolve) => {
    const canvas = document.createElement('canvas');
    const size = 1024;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Default Sanctuary Background
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#0a0a1a'); grad.addColorStop(1, '#0a1a18');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const loadImage = (src) => new Promise((res) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = () => res(null);
      img.src = src;
    });

    const baseImg = await loadImage(photoSrc);
    if (baseImg) {
      const aspect = baseImg.width / baseImg.height;
      let dw = size, dh = size;
      if (aspect > 1) { dh = size / aspect; } else { dw = size * aspect; }
      ctx.drawImage(baseImg, (size-dw)/2, (size-dh)/2, dw, dh);
    }

    // Draw accessories
    for (const item of equippedItems) {
      if (item.src) {
        const itemImg = await loadImage(item.src);
        if (itemImg) ctx.drawImage(itemImg, 0, 0, size, size);
      } else if (item.emoji) {
        ctx.font = '150px serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.emoji, size/2, size/2);
      }
    }

    resolve(canvas.toDataURL('image/png', 0.95));
  });
};


const PetAvatarRenderer = ({ pet, ownerBg, compact = false, userEmail, goldBalance, spendGold }) => {
  const [photoData, setPhotoData] = useState('');
  const [styleId, setStyleId] = useState('ethereal');
  const [showSettings, setShowSettings] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedPet, setGeneratedPet] = useState('');
  const fileRef = useRef(null);

  const petType = PET_TYPES[pet?.type] || PET_TYPES.dog;
  const currentStyle = PET_STYLES.find(s => s.id === styleId) || PET_STYLES[0];

  useEffect(() => { injectPetKeyframes(); }, []);

  // Load saved photo/style
  useEffect(() => {
    if (!pet?.id || !userEmail) return;
    try {
      const savedPhoto = localStorage.getItem(PET_STORAGE.photo(userEmail, pet.id));
      const savedStyle = localStorage.getItem(PET_STORAGE.style(userEmail, pet.id));
      const savedAI    = localStorage.getItem(`aura_pet_ai_${userEmail}_${pet.id}`);
      if (savedPhoto) setPhotoData(savedPhoto);
      if (savedStyle) setStyleId(savedStyle);
      if (savedAI) setGeneratedPet(savedAI);
    } catch {}
  }, [pet?.id, userEmail]);

  const handlePhotoUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoData(reader.result);
      try { localStorage.setItem(PET_STORAGE.photo(userEmail, pet.id), reader.result); } catch {}
    };
    reader.readAsDataURL(file);
  }, [userEmail, pet?.id]);

  const handleRemovePhoto = useCallback(() => {
    setPhotoData('');
    try { localStorage.removeItem(PET_STORAGE.photo(userEmail, pet.id)); } catch {}
  }, [userEmail, pet?.id]);

  const handleStyleChange = useCallback((id) => {
    setStyleId(id);
    try { localStorage.setItem(PET_STORAGE.style(userEmail, pet.id), id); } catch {}
  }, [userEmail, pet?.id]);

  const handleAIGenerate = async () => {
    if (!photoData || aiGenerating) return;
    
    if (spendGold && goldBalance < AI_GENERATION_COST) {
      alert(`Need ${AI_GENERATION_COST} gold to upgrade pet. You have ${goldBalance}.`);
      return;
    }

    setAiGenerating(true);
    try {
      // 1. Generate Reference Composite
      const referenceComposite = await generatePetOnCanvas(photoData, pet.type, pet.accessories || []);

      // 2. Collect accessory names for prompt
      const items = (pet.accessories || []).map(a => ({ name: a.name, slot: 'pet_accessory' }));
      
      const response = await fetch(`${AVATAR_SERVER_URL}/api/generate-avatar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          photo: referenceComposite || photoData,
          style: styleId,
          items: items,
          isPet: true,
          petType: pet.type
        }),
      });
      const data = await response.json();
      if (data.success && data.image) {
        setGeneratedPet(data.image);
        try { localStorage.setItem(`aura_pet_ai_${userEmail}_${pet.id}`, data.image); } catch {}
        if (spendGold) spendGold(AI_GENERATION_COST, true); // true = to bank
      } else {
        throw new Error(data.error || 'Failed');
      }
    } catch (err) {
      console.warn('Pet AI failed', err);
      // Fallback: we just keep the 2D version
    } finally {
      setAiGenerating(false);
    }
  };

  if (!pet) return null;

  // ── Mood indicator ──
  const moodEmoji = pet.mood === 'happy' ? '😊' : pet.mood === 'sleepy' ? '😴' : '😐';
  const accessoryEmojis = (pet.accessories || []).map(a => a.emoji).join(' ');

  // ── Background — match owner or default ──
  const bgStyle = ownerBg?.avatarStyle?.background || 'linear-gradient(180deg, #0a0a1a 0%, #0f1a2e 50%, #0a1a18 100%)';

  // ── Breed icon override ──
  const displayEmoji = pet.breedIcon || petType.emoji;
  const displayName = pet.breedName || pet.name;

  const size = compact ? 80 : 140;

  return (
    <div style={{ position: 'relative', width: `${size}px`, display: 'inline-block' }}>
      {/* Main Pet Card */}
      <div
        onClick={() => !compact && setShowSettings(!showSettings)}
        style={{
          width: `${size}px`,
          height: `${size + 20}px`,
          borderRadius: compact ? '14px' : '18px',
          overflow: 'hidden',
          position: 'relative',
          cursor: compact ? 'default' : 'pointer',
          background: bgStyle,
          border: '1px solid rgba(212,175,55,0.2)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 15px rgba(212,175,55,0.08)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Animated glow background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 50% 40%, rgba(212,175,55,0.06) 0%, transparent 60%)',
          animation: 'petGlow 3s ease-in-out infinite',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Sparkle particles */}
        {!compact && [0, 1, 2, 3].map(i => (
          <div key={i} style={{
            position: 'absolute',
            left: `${20 + i * 20}%`, top: `${10 + i * 15}%`,
            width: '3px', height: '3px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.6)',
            animation: `petSparkle ${2 + i * 0.5}s ease-in-out ${i * 0.5}s infinite`,
            pointerEvents: 'none', zIndex: 1,
          }} />
        ))}

        {/* Pet Render */}
        <div style={{
          position: 'relative', zIndex: 2,
          width: '100%', height: `${size}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'petBreath 4s ease-in-out infinite',
        }}>
          {generatedPet ? (
             <img src={generatedPet} style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="AI Pet" />
          ) : photoData ? (
            /* Uploaded photo with AI filter */
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <img
                src={photoData}
                alt={pet.name}
                style={{
                  width: '100%', height: '100%',
                  objectFit: 'cover', objectPosition: 'center',
                  filter: currentStyle.filter,
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: currentStyle.overlay,
                mixBlendMode: 'overlay', pointerEvents: 'none',
              }} />
            </div>
          ) : (
            /* SVG Pet Portrait */
            <svg viewBox="0 0 66 66" style={{ width: '80%', height: '80%' }}>
              {/* Body */}
              <path d={petType.silhouette} fill={petType.colors[0]} stroke={petType.colors[1]} strokeWidth="0.8" />

              {/* Ears */}
              {petType.ears && (
                <path d={petType.ears} fill={petType.colors[0]} stroke={petType.colors[1]} strokeWidth="0.8" />
              )}

              {/* Cheeks (hamster) */}
              {petType.cheeks && (
                <>
                  <circle cx="20" cy="34" r="5" fill="rgba(255,180,180,0.4)" />
                  <circle cx="40" cy="34" r="5" fill="rgba(255,180,180,0.4)" />
                </>
              )}

              {/* Eyes */}
              <circle cx={petType.eyes.left.cx} cy={petType.eyes.left.cy} r={compact ? 2.5 : 3} fill="#222" />
              <circle cx={petType.eyes.right.cx} cy={petType.eyes.right.cy} r={compact ? 2.5 : 3} fill="#222" />
              {/* Eye highlights */}
              <circle cx={petType.eyes.left.cx + 1} cy={petType.eyes.left.cy - 1} r="1" fill="#fff" opacity="0.7" />
              <circle cx={petType.eyes.right.cx + 1} cy={petType.eyes.right.cy - 1} r="1" fill="#fff" opacity="0.7" />

              {/* Nose */}
              {petType.nose && (
                <path d={petType.nose} fill={pet.type === 'bird' ? '#FF8C00' : '#333'} />
              )}

              {/* Mouth */}
              {petType.mouth && (
                <path d={petType.mouth} fill="none" stroke="#555" strokeWidth="0.6" strokeLinecap="round" />
              )}

              {/* Tail */}
              {petType.tail && (
                <path d={petType.tail} fill="none" stroke={petType.colors[0]} strokeWidth="3" strokeLinecap="round"
                  style={{ transformOrigin: '39px 58px', animation: 'petTail 1.5s ease-in-out infinite' }} />
              )}

              {/* Wing (bird) */}
              {petType.wing && (
                <path d={petType.wing} fill={petType.colors[2]} stroke={petType.colors[1]} strokeWidth="0.5" opacity="0.8" />
              )}

              {/* Fin (fish) */}
              {petType.fin && (
                <path d={petType.fin} fill={petType.colors[2]} stroke={petType.colors[1]} strokeWidth="0.5" />
              )}

              {/* Accessories overlay */}
              {(pet.accessories || []).length > 0 && (
                <text x="33" y="10" textAnchor="middle" fontSize="8" dominantBaseline="middle">
                  {(pet.accessories || [])[0]?.emoji || ''}
                </text>
              )}
            </svg>
          )}
        </div>

        {/* Pet Name Bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
          padding: compact ? '2px 4px' : '6px 8px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
          zIndex: 3,
        }}>
          <span style={{ fontSize: compact ? '0.5rem' : '0.6rem', color: '#fff', fontWeight: '600', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
            {moodEmoji} {pet.name}
          </span>
          <span style={{ fontSize: compact ? '0.4rem' : '0.5rem', color: 'rgba(212,175,55,0.8)', fontWeight: '600' }}>
            Lv{pet.level || 1}
          </span>
        </div>

        {/* Heart animation on happy mood */}
        {pet.mood === 'happy' && !compact && (
          <div style={{
            position: 'absolute', top: '10%', right: '10%', fontSize: '0.7rem',
            animation: 'petHeart 2s ease-in-out infinite',
            pointerEvents: 'none', zIndex: 4,
          }}>❤️</div>
        )}
      </div>

      {/* ─── Settings Panel ─── */}
      {showSettings && !compact && (
        <div style={{
          position: 'absolute', top: `${size + 24}px`, left: '50%', transform: 'translateX(-50%)',
          width: '200px', padding: '12px', borderRadius: '14px',
          background: 'rgba(10,10,25,0.95)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          zIndex: 30,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.65rem', color: '#d4af37', fontWeight: '700' }}>📷 Pet Photo</span>
            <button onClick={(e) => { e.stopPropagation(); setShowSettings(false); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '0.7rem' }}>✕</button>
          </div>

          <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
          <button
            onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
            style={{
              width: '100%', padding: '8px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(100,60,180,0.08))',
              border: '1px dashed rgba(212,175,55,0.3)', color: '#d4af37',
              cursor: 'pointer', fontSize: '0.6rem', fontWeight: '600', marginBottom: '8px',
            }}
          >
            {photoData ? '📷 Change Photo' : '📷 Upload Pet Photo'}
          </button>

          {photoData && (
            <button
              onClick={(e) => { e.stopPropagation(); handleRemovePhoto(); }}
              style={{
                width: '100%', padding: '4px', borderRadius: '6px',
                background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)',
                color: '#e74c3c', cursor: 'pointer', fontSize: '0.55rem', marginBottom: '8px',
              }}
            >✕ Remove Photo</button>
          )}

          {photoData && (
            <>
              <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>STYLE</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {PET_STYLES.map(s => (
                  <button
                    key={s.id}
                    onClick={(e) => { e.stopPropagation(); handleStyleChange(s.id); }}
                    style={{
                      flex: 1, padding: '4px', borderRadius: '6px', cursor: 'pointer',
                      background: styleId === s.id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                      border: styleId === s.id ? '1px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.06)',
                      color: styleId === s.id ? '#d4af37' : 'rgba(255,255,255,0.3)',
                      fontSize: '0.5rem', fontWeight: '600',
                    }}
                  >{s.name}</button>
                ))}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleAIGenerate(); }}
                disabled={aiGenerating}
                style={{
                  width: '100%', marginTop: '10px', padding: '10px', borderRadius: '8px',
                  background: 'linear-gradient(90deg, #d4af37, #9b59b6)', border: 'none',
                  color: '#fff', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.6rem'
                }}
              >
                {aiGenerating ? 'Processing...' : '✨ Upgrade with AI'}
              </button>

              {generatedPet && (
                <button
                  onClick={(e) => { e.stopPropagation(); setGeneratedPet(''); localStorage.removeItem(`aura_pet_ai_${userEmail}_${pet.id}`); }}
                  style={{ width: '100%', marginTop: '6px', background: 'none', border: 'none', color: '#e74c3c', fontSize: '0.5rem', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  Reset AI Upgrade
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PetAvatarRenderer;
