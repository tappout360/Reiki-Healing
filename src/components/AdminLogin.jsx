import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const AdminLogin = ({ onLogin, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const allowedEmails = ['jasonmounts77@yahoo.com', 'carissabright@gmail.com'];
      const isWhitelisted = allowedEmails.includes(normalizedEmail);

      if (isFirebaseConfigured()) {
        let user;

        try {
          // Try signing in first
          user = await auth.signIn(email.trim(), password);
        } catch (signInErr) {
          // If account doesn't exist and email is whitelisted, auto-create it
          if (isWhitelisted && (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential')) {
            try {
              const ownerName = normalizedEmail === 'carissabright@gmail.com' ? 'Carissa Bright' : 'Jason Mounts';
              user = await auth.signUp(email.trim(), password, {
                name: ownerName,
                username: ownerName.toLowerCase().replace(/\s/g, ''),
                role: 'owner',
                subscription: 'healing'
              });
            } catch (signUpErr) {
              // If creation also fails, re-throw the original sign-in error
              throw signInErr;
            }
          } else {
            throw signInErr;
          }
        }

        const profile = await db.getProfile(user.uid);

        if (!profile) {
          setError('Profile not found. Please contact an administrator.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        if (!isWhitelisted) {
          setError('Access Denied: Your account does not have Healer privileges.');
          await auth.signOut();
          setLoading(false);
          return;
        }

        // Auto-promote whitelisted email profiles to 'owner' role if they aren't already
        let updatedProfile = { ...profile };
        if (profile.role !== 'owner') {
          updatedProfile = await db.updateProfile(user.uid, { role: 'owner' });
        }

        // Success — store profile for App.jsx and trigger dashboard
        localStorage.setItem('user_profile', JSON.stringify(updatedProfile));
        setLoading(false);
        onLogin();
      } else {
        // Fallback: local development check with the whitelisted emails & password
        if (isWhitelisted && password === '2014$Rogue10/31') {
          setTimeout(() => {
            setLoading(false);
            const adminUser = {
              name: normalizedEmail === 'carissabright@gmail.com' ? 'Carissa Bright' : 'Jason Mounts',
              email: normalizedEmail,
              role: 'owner',
              subscription: 'healing',
              status: 'Active'
            };
            localStorage.setItem('user_profile', JSON.stringify(adminUser));
            onLogin();
          }, 1000);
          return;
        } else {
          setLoading(false);
          setError('Access Denied: Invalid credentials or unauthorized account.');
          return;
        }
      }
    } catch (err) {
      setLoading(false);
      const msg = err.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please wait and try again.'
        : 'Login failed. Please try again.';
      setError(msg);
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
              type="email"
              placeholder="Email Address"
              value={email} onChange={e => setEmail(e.target.value)}
              className="booking-input"
              style={{ background: '#ffffff', color: '#000000', borderColor: 'var(--glass-border)', borderRadius: '12px' }}
              autoFocus
            />
          </div>
          <div className="form-group" style={{position: 'relative'}}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password} onChange={e => setPassword(e.target.value)}
              className="booking-input"
              style={{ background: '#ffffff', color: '#000000', borderColor: 'var(--glass-border)', borderRadius: '12px', paddingRight: '3rem' }}
            />
            <span
              onMouseEnter={() => setShowPassword(true)}
              onMouseLeave={() => setShowPassword(false)}
              style={{
                position: 'absolute', right: '15px', top: '50%',
                transform: 'translateY(-50%)', cursor: 'pointer', opacity: 0.4, fontSize: '1.2rem'
              }}
            >👁️</span>
          </div>

          {error && (
            <motion.p
              initial={{opacity: 0}} animate={{opacity: 1}}
              style={{color: '#ff7675', fontSize: '0.85rem', margin: '0.5rem 0'}}
            >{error}</motion.p>
          )}

          <button
            type="submit" className="btn-primary"
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
