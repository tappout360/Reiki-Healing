import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, X, Eye, EyeOff, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth, isFirebaseConfigured } from '../lib/firebase';

const Login = ({ onClose, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isFirebaseConfigured()) {
        // Firebase Auth
        const user = await auth.signIn(credentials.email.trim(), credentials.password);
        toast.success(`Welcome back, ${user.displayName || user.email}!`);
        // Auth state change in App.jsx will handle the rest
        onLoginSuccess(null); // Signal success; App.jsx picks up the session
      } else {
        // Fallback: localStorage check (for local dev without Firebase)
        const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
        const matchedClient = clients.find(c =>
          c.email?.toLowerCase() === credentials.email.toLowerCase().trim()
        );

        if (matchedClient) {
          const profile = {
            name: matchedClient.name,
            username: matchedClient.username,
            email: matchedClient.email,
            role: matchedClient.role || 'seeker',
            subscription: matchedClient.subscription || 'seeker',
            status: matchedClient.status || 'Active'
          };
          localStorage.setItem('user_profile', JSON.stringify(profile));
          toast.success(`Welcome back, ${profile.name}!`);
          onLoginSuccess(profile);
        } else {
          toast.error('Invalid credentials. Please try again.');
        }
      }
    } catch (error) {
      const msg = error.code === 'auth/invalid-credential'
        ? 'Invalid email or password.'
        : error.code === 'auth/too-many-requests'
        ? 'Too many attempts. Please try again later.'
        : error.code === 'auth/user-not-found'
        ? 'No account found with this email.'
        : error.message || 'Login failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error('Please enter your email address.');
      return;
    }
    try {
      await auth.resetPassword(resetEmail.trim());
      toast.success('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch (error) {
      console.error("Password reset failed:", error);
      toast.error('Could not send reset email. Please check the address.');
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0, 0, 0, 0.95)', backdropFilter: 'blur(20px)',
      zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass"
        style={{ width: '100%', maxWidth: '450px', padding: '3rem', borderRadius: '20px', position: 'relative' }}
      >
        <button onClick={onClose} style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem',
          background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
        }}>
          <X size={24} />
        </button>

        <h2 style={{
          fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--accent-gold)',
          fontFamily: 'Playfair Display'
        }}>
          {showReset ? 'Reset Password' : 'Log In'}
        </h2>
        <p style={{ marginBottom: '2rem', opacity: 0.7, color: 'var(--text-muted)' }}>
          {showReset ? 'Enter your email to receive a reset link' : 'Enter your credentials to access your account'}
        </p>

        {showReset ? (
          <form onSubmit={handlePasswordReset}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Email Address"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                style={{
                  width: '100%', padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)', borderRadius: '8px',
                  color: 'var(--text-main)', fontSize: '1rem'
                }}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Mail size={18} /> Send Reset Link
            </button>
            <button type="button" onClick={() => setShowReset(false)}
              style={{ display: 'block', margin: '1rem auto 0', background: 'none', border: 'none', color: 'var(--accent-ethereal)', cursor: 'pointer', fontSize: '0.9rem' }}>
              Back to Login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <input
                type="email"
                placeholder="Email Address"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                style={{
                  width: '100%', padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)', borderRadius: '8px',
                  color: 'var(--text-main)', fontSize: '1rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                style={{
                  width: '100%', padding: '1rem', paddingRight: '3rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)', borderRadius: '8px',
                  color: 'var(--text-main)', fontSize: '1rem'
                }}
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: 0.6
                }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isFirebaseConfigured() && (
              <button type="button" onClick={() => setShowReset(true)}
                style={{
                  display: 'block', marginBottom: '1.5rem',
                  background: 'none', border: 'none', color: 'var(--accent-ethereal)',
                  cursor: 'pointer', fontSize: '0.85rem', opacity: 0.8
                }}>
                Forgot password?
              </button>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{
                width: '100%', padding: '1rem', opacity: loading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
              }}>
              <LogIn size={18} />
              {loading ? 'Aligning Frequencies...' : 'Log In'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default Login;
