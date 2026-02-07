import React, { useState } from 'react';
import { motion } from 'framer-motion';

const AdminLogin = ({ onLogin, onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedUser = username.trim().toLowerCase();
    const normalizedPass = password.trim(); 
    
    setError('');
    setLoading(true);

    // 1. Admin/Owner Credentials Check
    let matchedAdmin = null;
    
    // Check normalized inputs (case insensitive username)
    if (normalizedUser === 'healer' && password === 'cosmos') {
        matchedAdmin = { name: 'Healer (Staff)', email: 'staff@reiki.com' };
    } else if (normalizedUser === 'admin' && password === 'ReikiMaster2026!') {
        matchedAdmin = { name: 'Chrissa (Owner)', email: 'admin@reiki.com' };
    } else if ((normalizedUser === 'tapout' || normalizedUser === 'jasonmounts77@yahoo.com') && password === 'jakylie5526') {
        matchedAdmin = { name: 'Jason Mounts', email: 'JasonMounts77@yahoo.com', role: 'admin' };
    } else if (normalizedUser === 'bright' && password === 'pink-silver') {
        matchedAdmin = { name: 'Healer Bright', email: 'bright@reiki.com', role: 'owner' };
    }

    if (matchedAdmin) {
      setTimeout(() => {
        setLoading(false);
        const adminUser = {
            name: matchedAdmin.name,
            email: matchedAdmin.email,
            role: matchedAdmin.role,
            subscription: 'healing', // Full Access
            status: 'Active'
        };
        localStorage.setItem('user_profile', JSON.stringify(adminUser));
        onLogin();
      }, 1500);
      return;
    }

    // 2. Dynamic Team Check (Legacy)
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const team = JSON.parse(localStorage.getItem('aura_team') || '[]');

    const userMatch = clients.find(c => 
      (c.email.toLowerCase() === normalizedUser || c.username.toLowerCase() === normalizedUser) && 
      c.password === normalizedPass
    );

    if (userMatch) {
      const isHealer = team.find(t => t.email.toLowerCase() === userMatch.email.toLowerCase() && t.status === 'Active');
      
      if (isHealer) {
        setLoading(false);
        onLogin();
      } else {
        setLoading(false);
        setError('Access Denied: You constitute a valid soul, but lack Healer privileges.');
      }
    } else {
      setLoading(false);
      setError('Invalid vibrational signature.');
    }
  };

  return (
    <div className="booking-overlay" style={{backdropFilter: 'blur(15px)', zIndex: 10001}}>
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
              style={{
                background: '#ffffff', 
                color: '#000000', 
                borderColor: 'var(--glass-border)',
                borderRadius: '12px'
              }}
              autoFocus
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Vibrational Key" 
              value={password} onChange={e => setPassword(e.target.value)}
              className="booking-input"
              style={{
                background: '#ffffff', 
                color: '#000000', 
                borderColor: 'var(--glass-border)',
                borderRadius: '12px', 
                paddingRight: '3rem'
              }}
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
          
          <button 
            type="submit" 
            className="btn-primary" 
            style={{marginTop: '1rem', width: '100%', padding: '1.1rem', opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? 'Aligning Frequencies...' : 'Calibrate & Enter'}
          </button>
        </form>
        <p style={{marginTop: '2rem', fontSize: '0.75rem', opacity: 0.4, letterSpacing: '1px'}}>AUTHORIZED HEALERS ONLY</p>
      </div>
    </div>
  );
};

export default AdminLogin;
