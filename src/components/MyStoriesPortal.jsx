import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Quote, Star, Sparkles, Heart, Lock } from 'lucide-react';

const MyStoriesPortal = ({ onClose }) => {
  const [stories, setStories] = React.useState([]);
  const [storyLikes, setStoryLikes] = React.useState(() => JSON.parse(localStorage.getItem('aura_story_likes') || '{}'));
  const user = React.useMemo(() => JSON.parse(localStorage.getItem('user_profile') || '{}'), []);
  const canSubmit = user.role === 'healer' || user.role === 'admin' || user.role === 'owner';

  const [myLikes, setMyLikes] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(`aura_my_likes_${user.email}`) || '[]'); } catch { return []; }
  });

  const handleLike = (storyId) => {
    if (myLikes.includes(storyId)) return;
    const updated = { ...storyLikes, [storyId]: (storyLikes[storyId] || 0) + 1 };
    const updatedMyLikes = [...myLikes, storyId];
    setStoryLikes(updated);
    setMyLikes(updatedMyLikes);
    localStorage.setItem('aura_story_likes', JSON.stringify(updated));
    try { const u = JSON.parse(localStorage.getItem('user_profile') || '{}'); if (u.email) localStorage.setItem(`aura_my_likes_${u.email}`, JSON.stringify(updatedMyLikes)); } catch {}
  };

  React.useEffect(() => {
    const allStories = JSON.parse(localStorage.getItem('aura_stories') || '[]');
    setStories(allStories.filter(s => s.status === 'approved'));
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
        <h2 style={{ fontSize: '3.5rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Collective Reverie</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', fontStyle: 'italic' }}>
          "In the tapestry of time, we are the threads of light, weaving a story of healing for all."
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
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontWeight: '600', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }}>
                  {story.userName}
                </span>
                <button
                  onClick={() => handleLike(story.id)}
                  style={{
                    background: myLikes.includes(story.id) ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${myLikes.includes(story.id) ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '20px', padding: '5px 14px', cursor: myLikes.includes(story.id) ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: myLikes.includes(story.id) ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)',
                    fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s'
                  }}
                >
                  <Heart size={13} fill={myLikes.includes(story.id) ? 'var(--accent-gold)' : 'none'} />
                  {storyLikes[story.id] || 0}
                </button>
              </div>
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
          <p>The collective field is quiet... for now.</p>
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
        textAlign: 'center',
        position: 'relative'
      }}>
        {!canSubmit && (
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(5,5,10,0.7)', backdropFilter: 'blur(4px)',
            borderRadius: '32px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', zIndex: 5, padding: '2rem'
          }}>
            <Lock size={48} color="var(--accent-gold)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Healer Resonance Required</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px' }}>
              Submission of sacred reveries is reserved for those who have attained the rank of Healer. 
              Continue your journey to unlock this capability.
            </p>
          </div>
        )}
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Share Your Resonance</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Have you experienced a moment of profound alignment in the Sanctuary? Share your journey to inspire others.
        </p>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            const name = e.target.name.value;
            const content = e.target.story.value;
            const rating = parseInt(e.target.rating.value);

            if (!name || !content) return;

            const newStory = {
              id: Date.now().toString(),
              userName: name,
              userEmail: 'anonymous@seeker.test', // Placeholder or fetch if available
              story: content,
              rating,
              status: 'pending',
              timestamp: new Date().toISOString()
            };

            const existing = JSON.parse(localStorage.getItem('aura_stories') || '[]');
            localStorage.setItem('aura_stories', JSON.stringify([...existing, newStory]));
            
            import('react-hot-toast').then(({ toast }) => {
              toast.success('Your story has been sent into the collective mist for review.');
            });

            e.target.reset();
          }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>Vibrational Identity (Name)</label>
              <input name="name" type="text" placeholder="Your Name" required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>Alignment Scale (1-5)</label>
              <select name="rating" style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                <option value="5" style={{ background: '#0a0a14', color: 'white' }}>5 - Deep Transformation</option>
                <option value="4" style={{ background: '#0a0a14', color: 'white' }}>4 - Strong Resonance</option>
                <option value="3" style={{ background: '#0a0a14', color: 'white' }}>3 - Peaceful Connection</option>
                <option value="2" style={{ background: '#0a0a14', color: 'white' }}>2 - Subtle Shift</option>
                <option value="1" style={{ background: '#0a0a14', color: 'white' }}>1 - Beginning Journey</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '0.5rem', display: 'block' }}>The Journey (Your Story)</label>
            <textarea name="story" rows="4" placeholder="Describe your experience..." required style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', resize: 'vertical' }} />
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
            Release into the Sanctuary
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default MyStoriesPortal;
