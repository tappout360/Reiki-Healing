import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AdminLogin = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Bright' && password === 'Pink-Silver') {
      onLogin(); // Grant access
    } else {
      setError('Invalid vibrational signature.');
    }
  };

  return (
    <div className="booking-overlay" style={{backdropFilter: 'blur(15px)'}}>
      <div className="booking-modal glass" style={{maxWidth: '400px', textAlign: 'center', border: '1px solid rgba(142, 68, 173, 0.3)', padding: '3rem 2.5rem'}}>
        <button onClick={onClose} className="booking-close">×</button>
        
        <div style={{marginBottom: '2rem'}}>
          <h2 style={{color: 'var(--accent-ethereal)', fontFamily: 'Playfair Display', fontSize: '2rem', marginBottom: '0.5rem'}}>Sanctuary Access</h2>
          <div style={{width: '40px', height: '2px', background: 'var(--accent-gold)', margin: '0 auto'}}></div>
        </div>
        
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div className="form-group">
            <input 
              type="text" 
              placeholder="Identity Signature" 
              value={username} onChange={e => setUsername(e.target.value)}
              className="booking-input"
              style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}
              autoFocus
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Vibrational Key" 
              value={password} onChange={e => setPassword(e.target.value)}
              className="booking-input"
              style={{background: 'rgba(255,255,255,0.05)', borderRadius: '12px', paddingRight: '3rem'}}
            />
            <span 
              onMouseEnter={() => setShowPassword(true)}
              onMouseLeave={() => setShowPassword(false)}
              style={{
                position: 'absolute', right: '15px', top: '50%', 
                transform: 'translateY(-50%)', cursor: 'pointer',
                opacity: 0.4, fontSize: '1.2rem'
              }}
            >
              👁️
            </span>
          </div>
          
          {error && (
            <motion.p 
              initial={{opacity: 0}} animate={{opacity: 1}}
              style={{color: '#ff7675', fontSize: '0.85rem', margin: '0.5rem 0'}}
            >
              {error}
            </motion.p>
          )}
          
          <button type="submit" className="btn-primary" style={{marginTop: '1rem', width: '100%', padding: '1.1rem'}}>
            Calibrate & Enter
          </button>
        </form>
        <p style={{marginTop: '2rem', fontSize: '0.75rem', opacity: 0.4, letterSpacing: '1px'}}>AUTHORIZED HEALERS ONLY</p>
      </div>
    </div>
  );
};

export default AdminLogin;
