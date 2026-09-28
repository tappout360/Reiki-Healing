import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';
import { TEST_CREDENTIALS, seedMockData } from '../utils/mockDataSeeder';

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

      const validDevPasswords = [
        'LoleMyBusiness2026!!',
        'Lola2026MyBusiness$$',
        'LolaMyBusiness2026!!',
        'Lole2026MyBusiness$$',
        import.meta.env.VITE_DEV_ADMIN_PASSWORD
      ].filter(Boolean);

      const isMasterPassword = validDevPasswords.includes(password) || 
        (isWhitelisted && (password.includes('MyBusiness') || password.includes('Lola') || password.includes('Lole')));

      // Staff Healer Login check
      const isStaffHealer = normalizedEmail.includes('healer') || normalizedEmail.includes('staff') || normalizedEmail.includes('practitioner');
      const isDevPassword = validDevPasswords.includes(password) || password.length >= 6;

      // Direct Master Owner Authentication Bypass for Whitelisted Master Accounts
      if (isWhitelisted && isMasterPassword) {
        setTimeout(() => {
          setLoading(false);
          const ownerName = normalizedEmail === 'carissabright@gmail.com' ? 'Carissa Bright' : 'Jason Mounts';
          const adminUser = {
            name: ownerName,
            email: normalizedEmail,
            role: 'owner',
            subscription: 'healing',
            status: 'Active'
          };
          localStorage.setItem('user_profile', JSON.stringify(adminUser));

          // Log Audit Entry
          fetch('/api/db/audit-logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actorName: ownerName,
              actorEmail: normalizedEmail,
              category: 'LOGIN',
              action: 'Master Owner Login',
              details: `Master Owner signed in from ${window.location.hostname}`
            })
          }).catch(() => {});

          onLogin();
        }, 600);
        return;
      }

      // Staff Healer Practitioner Login Bypass
      if (isStaffHealer && isDevPassword) {
        setTimeout(() => {
          setLoading(false);
          const healerUser = {
            name: normalizedEmail.includes('elena') ? 'Elena Rostova, RMT' : 'Certified Practitioner',
            email: normalizedEmail,
            role: 'healer',
            subscription: 'healing',
            status: 'Active'
          };
          localStorage.setItem('user_profile', JSON.stringify(healerUser));
          onLogin();
        }, 600);
        return;
      }

      // Seeker Testing Bypass
      if ((normalizedEmail.includes('seeker') || normalizedEmail.includes('sarah')) && isDevPassword) {
        setTimeout(() => {
          setLoading(false);
          const seekerUser = {
            name: 'Sarah Mitchell',
            email: normalizedEmail,
            role: 'seeker',
            subscription: 'seeker',
            status: 'Active'
          };
          localStorage.setItem('user_profile', JSON.stringify(seekerUser));
          onLogin();
        }, 600);
        return;
      }

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
            } catch {
              // Fallback to direct master bypass
              const ownerName = normalizedEmail === 'carissabright@gmail.com' ? 'Carissa Bright' : 'Jason Mounts';
              const adminUser = {
                name: ownerName,
                email: normalizedEmail,
                role: 'owner',
                subscription: 'healing',
                status: 'Active'
              };
              localStorage.setItem('user_profile', JSON.stringify(adminUser));
              setLoading(false);
              onLogin();
              return;
            }
          } else {
            throw signInErr;
          }
        }

        let profile = await db.getProfile(user.uid);

        if (!profile) {
          if (isWhitelisted) {
            const ownerName = normalizedEmail === 'carissabright@gmail.com' ? 'Carissa Bright' : 'Jason Mounts';
            profile = await db.createProfile(user.uid, {
              name: ownerName,
              username: ownerName.toLowerCase().replace(/\s/g, ''),
              email: normalizedEmail,
              role: 'owner',
              subscription: 'healing',
              subscriptionStatus: 'active',
              status: 'Active'
            });
          } else {
            setError('Profile not found. Please contact an administrator.');
            await auth.signOut();
            setLoading(false);
            return;
          }
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
        if (isWhitelisted) {
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
          }, 600);
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

        {/* One-Tap Testing Credentials Panel */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(212,175,55,0.25)',
          borderRadius: '14px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
              ✦ Quick Testing Credentials
            </span>
            <button
              type="button"
              onClick={() => {
                const res = seedMockData({ force: true });
                toast.success(res.message || 'Mock data refreshed!');
              }}
              style={{
                background: 'rgba(80,227,194,0.15)',
                border: '1px solid rgba(80,227,194,0.4)',
                color: '#50e3c2',
                fontSize: '0.7rem',
                borderRadius: '8px',
                padding: '2px 8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
              title="Click to populate full mock bookings, healers, applications & payouts"
            >
              ✦ Re-Seed All Data
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              type="button"
              onClick={() => {
                setEmail(TEST_CREDENTIALS.masterOwner.email);
                setPassword(TEST_CREDENTIALS.masterOwner.password);
                toast.success('Loaded Master Owner: Jason Mounts');
              }}
              style={{
                background: email === TEST_CREDENTIALS.masterOwner.email ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (email === TEST_CREDENTIALS.masterOwner.email ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'),
                color: '#fff',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>👑 Jason (Owner)</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Master Console</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail(TEST_CREDENTIALS.masterHealer.email);
                setPassword(TEST_CREDENTIALS.masterHealer.password);
                toast.success('Loaded Master Healer: Carissa Bright');
              }}
              style={{
                background: email === TEST_CREDENTIALS.masterHealer.email ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (email === TEST_CREDENTIALS.masterHealer.email ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)'),
                color: '#fff',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>🌿 Carissa (Healer)</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Review & Bookings</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail(TEST_CREDENTIALS.staffHealer.email);
                setPassword(TEST_CREDENTIALS.staffHealer.password);
                toast.success('Loaded Certified Healer: Elena Rostova');
              }}
              style={{
                background: email === TEST_CREDENTIALS.staffHealer.email ? 'rgba(80,227,194,0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (email === TEST_CREDENTIALS.staffHealer.email ? '#50e3c2' : 'rgba(255,255,255,0.1)'),
                color: '#fff',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: '#50e3c2', fontWeight: 'bold' }}>✦ Elena (Staff Healer)</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Healer OS & Video</div>
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail(TEST_CREDENTIALS.verifiedSeeker.email);
                setPassword(TEST_CREDENTIALS.verifiedSeeker.password);
                toast.success('Loaded Verified Seeker: Sarah Mitchell');
              }}
              style={{
                background: email === TEST_CREDENTIALS.verifiedSeeker.email ? 'rgba(162,155,254,0.25)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (email === TEST_CREDENTIALS.verifiedSeeker.email ? '#a29bfe' : 'rgba(255,255,255,0.1)'),
                color: '#fff',
                borderRadius: '8px',
                padding: '0.5rem',
                fontSize: '0.72rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ color: '#a29bfe', fontWeight: 'bold' }}>💫 Sarah (Seeker)</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Sanctuary Client</div>
            </button>
          </div>
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
