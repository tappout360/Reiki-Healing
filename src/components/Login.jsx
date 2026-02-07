import { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, X, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = ({ onClose, onLoginSuccess }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    
    const user = credentials.username.toLowerCase().trim();
    const pass = credentials.password;

    // console.log('LOGIN ATTEMPT:', user);

    // Admin Login (Jason - Standard)
    if ((user === 'tapout' || user === 'jasonmounts77@yahoo.com') && pass === 'jakylie5526') {
      const profile = {
        name: 'Jason Mounts',
        username: 'tapout',
        email: 'JasonMounts77@yahoo.com',
        role: 'admin',
        subscription: 'healing',
        status: 'Active'
      };
      
      localStorage.setItem('user_profile', JSON.stringify(profile));
      toast.success('Welcome back, Admin Jason!');
      onLoginSuccess(profile);
      return;
    }

    // Healer/Owner Login (Bright - App Owner)
    if (user === 'bright' && pass === 'pink-silver') {
      const profile = {
        name: 'Healer Bright',
        username: 'bright',
        email: 'bright@reiki.com',
        role: 'owner',
        subscription: 'healing',
        status: 'Active'
      };
      
      localStorage.setItem('user_profile', JSON.stringify(profile));
      toast.success('Welcome back, Owner Bright!');
      onLoginSuccess(profile);
      return;
    }

    toast.error('Invalid credentials. Please try again.');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.95)',
      backdropFilter: 'blur(20px)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass"
        style={{
          width: '100%',
          maxWidth: '450px',
          padding: '3rem',
          borderRadius: '20px',
          position: 'relative'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.5rem'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{
          fontSize: '2rem',
          marginBottom: '0.5rem',
          color: 'var(--accent-gold)',
          fontFamily: 'Playfair Display'
        }}>
          Log In
        </h2>
        <p style={{ marginBottom: '2rem', opacity: 0.7, color: 'var(--text-muted)' }}>
          Enter your credentials to access your account
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <input
              type="text"
              placeholder="Username or Email"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '1rem'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '2rem', position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                color: 'var(--text-main)',
                fontSize: '1rem',
                paddingRight: '3rem'
              }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                opacity: 0.6
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <LogIn size={18} />
            Log In
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
