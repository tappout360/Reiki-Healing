import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Check, X, Sparkles, Crown, Heart, ArrowRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import BillingForm from './BillingForm';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const SignupFlow = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: '', // 'seeker' or 'healer'
    subscription: 'seeker', // 'seeker' or 'healing'
    duration: '1_month',
    billing: null,
    goals: '',
    experience: '',
    birthDate: ''
  });

  const [validation, setValidation] = useState({
    name: false,
    username: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  useEffect(() => {
    // Validate fields
    setValidation({
      name: formData.name.length >= 2,
      username: formData.username.length >= 3,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
      password: formData.password.length >= 6,
      confirmPassword: formData.password === formData.confirmPassword && formData.confirmPassword.length > 0
    });
  }, [formData]);

  const steps = [
    { id: 0, icon: '👋', title: 'Welcome', color: '#d4af37' },
    { id: 1, icon: '📝', title: 'Personal Info', color: '#d4af37' },
    { id: 2, icon: '🔐', title: 'Security', color: '#a0d2eb' },
    { id: 3, icon: '⚡', title: 'Account Type', color: '#9b59b6' },
    { id: 4, icon: '👑', title: 'Subscription', color: '#e74c3c' },
    { id: 5, icon: '💳', title: 'Payment', color: '#1abc9c' },
    { id: 6, icon: '💫', title: 'Personalize', color: '#2ecc71' },
    { id: 7, icon: '✅', title: 'Complete', color: '#d4af37' }
  ];

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (pw.length === 0) return { strength: 0, label: '', color: '#666' };
    if (pw.length < 6) return { strength: 20, label: 'Too Short', color: '#e74c3c' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { strength: 33, label: 'Weak', color: '#e74c3c' };
    if (score <= 3) return { strength: 66, label: 'Good', color: '#f39c12' };
    return { strength: 100, label: 'Strong', color: '#2ecc71' };
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    // Validate required fields
    if (!validation.name || !validation.username || !validation.email || !validation.password || !validation.confirmPassword) {
      toast.error('Please complete all required fields');
      return;
    }

    if (!formData.accountType) {
      toast.error('Please select an account type');
      return;
    }

    setSubmitting(true);

    try {
      if (isFirebaseConfigured()) {
        // Check username uniqueness via Firestore
        const taken = await db.isUsernameTaken(formData.username);
        if (taken) {
          toast.error('This username is already taken. Please choose another.');
          setSubmitting(false);
          return;
        }

        // Create Firebase Auth account + Firestore profile
        await auth.signUp(formData.email, formData.password, {
          name: formData.name,
          username: formData.username.toLowerCase(),
          role: formData.accountType === 'healer' ? 'healer' : 'seeker',
          subscription: formData.subscription,
          goals: formData.goals,
          experience: formData.experience,
          birthDate: formData.birthDate
        });

        const profile = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          role: formData.accountType === 'healer' ? 'healer' : 'seeker',
          subscription: formData.subscription,
          status: 'Active'
        };

        toast.success(`Welcome to the Sanctuary, ${profile.name}!`);
        onComplete(profile);
      } else {
        // Fallback: localStorage for local dev without Firebase
        const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
        const duplicateUsername = clients.find(c => c.username?.toLowerCase() === formData.username.toLowerCase());
        if (duplicateUsername) {
          toast.error('This username is already taken. Please choose another.');
          setSubmitting(false);
          return;
        }
        const duplicateEmail = clients.find(c => c.email?.toLowerCase() === formData.email.toLowerCase());
        if (duplicateEmail) {
          toast.error('An account with this email already exists.');
          setSubmitting(false);
          return;
        }

        const profile = {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          role: formData.accountType === 'healer' ? 'healer' : 'seeker',
          subscription: formData.subscription,
          goals: formData.goals,
          experience: formData.experience,
          birthDate: formData.birthDate,
          status: 'Active',
          joined: new Date().toISOString()
        };

        localStorage.setItem('user_profile', JSON.stringify(profile));
        clients.push(profile);
        localStorage.setItem('aura_clients', JSON.stringify(clients));

        toast.success(`Welcome to the Sanctuary, ${profile.name}!`);
        onComplete(profile);
      }
    } catch (error) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : error.code === 'auth/weak-password'
        ? 'Password is too weak. Please use at least 6 characters.'
        : error.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.section
      id="signup-flow-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        minHeight: '100vh',
        padding: '4rem 2rem',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(20,20,30,0.98) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Background Particles */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.1, pointerEvents: 'none' }}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.6, 0.2]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
            style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: '3px',
              height: '3px',
              borderRadius: '50%',
              background: '#d4af37'
            }}
          />
        ))}
      </div>

      <div className="container" style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Progress Sidebar */}
        <div style={{
          position: 'fixed',
          left: '2rem',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          zIndex: 100
        }}>
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              whileHover={{ scale: 1.1 }}
              style={{
                cursor: 'pointer',
                opacity: idx <= currentStep ? 1 : 0.3,
                transition: 'opacity 0.3s'
              }}
              onClick={() => setCurrentStep(idx)}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                background: idx === currentStep ? step.color : 'rgba(255,255,255,0.1)',
                border: `2px solid ${idx <= currentStep ? step.color : 'rgba(255,255,255,0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                position: 'relative'
              }}>
                {step.icon}
                {idx < currentStep && (
                  <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    right: '-5px',
                    background: '#2ecc71',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={12} color="white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            style={{
              padding: '3rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              minHeight: '500px'
            }}
          >
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ fontSize: '5rem', marginBottom: '2rem' }}
                >
                  ✨
                </motion.div>
                <h1 style={{ fontSize: '3rem', color: 'var(--accent-gold)', fontFamily: 'Playfair Display', marginBottom: '1rem' }}>
                  Start Your Journey
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Join our sanctuary and begin your path to healing and enlightenment
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(1)}
                  style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
                >
                  Begin <ArrowRight size={20} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div>
                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <User size={32} /> Personal Information
                </h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        paddingRight: '3rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${validation.name ? '#2ecc71' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                      }}
                    />
                    {validation.name && (
                      <Check size={20} color="#2ecc71" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Username *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                      placeholder="Choose a username"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        paddingRight: '3rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${validation.username ? '#2ecc71' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                      }}
                    />
                    {validation.username && (
                      <Check size={20} color="#2ecc71" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        paddingRight: '3rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${validation.email ? '#2ecc71' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                      }}
                    />
                    {validation.email && (
                      <Check size={20} color="#2ecc71" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                  disabled={!validation.name || !validation.username || !validation.email}
                  style={{ width: '100%' }}
                >
                  Continue <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 2: Security */}
            {currentStep === 2 && (
              <div>
                <h2 style={{ color: 'var(--accent-ethereal)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Lock size={32} /> Secure Your Account
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Password (min 6 characters) *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Create a strong password"
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '1rem'
                    }}
                  />
                  {formData.password && (
                    <div style={{ marginTop: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Password Strength:</span>
                        <span style={{ fontSize: '0.9rem', color: getPasswordStrength().color }}>{getPasswordStrength().label}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${getPasswordStrength().strength}%` }}
                          style={{
                            height: '100%',
                            background: getPasswordStrength().color,
                            borderRadius: '10px'
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Confirm Password *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Re-enter your password"
                      style={{
                        width: '100%',
                        padding: '1rem',
                        paddingRight: '3rem',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${validation.confirmPassword ? '#2ecc71' : formData.confirmPassword ? '#e74c3c' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        fontSize: '1rem'
                      }}
                    />
                    {validation.confirmPassword && (
                      <Check size={20} color="#2ecc71" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                    {formData.confirmPassword && !validation.confirmPassword && (
                      <X size={20} color="#e74c3c" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                    )}
                  </div>
                  {formData.confirmPassword && !validation.confirmPassword && (
                    <p style={{ color: '#e74c3c', fontSize: '0.85rem', marginTop: '0.5rem' }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(3)}
                  disabled={!validation.password || !validation.confirmPassword}
                  style={{ width: '100%' }}
                >
                  Continue <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 3: Account Type */}
            {currentStep === 3 && (
              <div>
                <h2 style={{ color: '#9b59b6', marginBottom: '2rem', textAlign: 'center' }}>
                  ⚡ Choose Your Path
                </h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '3rem' }}>
                  Select the type of account that best fits your journey
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setFormData({ ...formData, accountType: 'seeker', subscription: 'seeker' })}
                    style={{
                      padding: '2rem',
                      background: formData.accountType === 'seeker' ? 'linear-gradient(135deg, rgba(160, 210, 235, 0.2), rgba(212, 175, 55, 0.2))' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${formData.accountType === 'seeker' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '15px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌙</div>
                    <h3 style={{ color: 'var(--accent-ethereal)', marginBottom: '0.5rem' }}>Seeker</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Begin your healing journey and explore our sanctuary
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05, y: -5 }}
                    onClick={() => setFormData({ ...formData, accountType: 'healer', subscription: 'healing' })}
                    style={{
                      padding: '2rem',
                      background: formData.accountType === 'healer' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(160, 210, 235, 0.2))' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${formData.accountType === 'healer' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '15px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
                    <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Healer</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      Guide others and access full healing capabilities
                    </p>
                  </motion.div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(4)}
                  disabled={!formData.accountType}
                  style={{ width: '100%' }}
                >
                  Continue <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 4: Subscription */}
            {currentStep === 4 && (
              <div>
                <h2 style={{ color: '#e74c3c', marginBottom: '2rem', textAlign: 'center' }}>
                  👑 Choose Your Tier
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFormData({ ...formData, subscription: 'seeker' })}
                    style={{
                      padding: '2rem',
                      background: formData.subscription === 'seeker' ? 'rgba(160, 210, 235, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${formData.subscription === 'seeker' ? 'var(--accent-ethereal)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🌱</div>
                      <h3 style={{ color: 'var(--accent-ethereal)' }}>Free Seeker</h3>
                      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-main)', margin: '0.5rem 0' }}>$0</p>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>✓ Basic protocols</li>
                      <li style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>✓ Community access</li>
                      <li style={{ padding: '0.5rem 0', color: 'var(--text-muted)' }}>✓ Energy tracking</li>
                    </ul>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    onClick={() => setFormData({ ...formData, subscription: 'healing' })}
                    style={{
                      padding: '2rem',
                      background: formData.subscription === 'healing' ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(160, 210, 235, 0.1))' : 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${formData.subscription === 'healing' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)'}`,
                      borderRadius: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👑</div>
                      <h3 style={{ color: 'var(--accent-gold)' }}>Healing Tier</h3>
                    </div>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <select 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        style={{
                          width: '100%',
                          padding: '0.8rem',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--accent-gold)',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: 'pointer'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="1_month">1 Month - $22</option>
                        <option value="3_month">3 Months - $55</option>
                        <option value="6_month">6 Months - $99</option>
                        <option value="1_year">1 Year - $188</option>
                      </select>
                    </div>

                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      <li style={{ padding: '0.4rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>✓ All basic features</li>
                      <li style={{ padding: '0.4rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>✓ Advanced protocols</li>
                      <li style={{ padding: '0.4rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>✓ AI Aura consultation</li>
                    </ul>
                  </motion.div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (formData.subscription === 'healing') {
                      setCurrentStep(5);
                    } else {
                      setCurrentStep(6);
                    }
                  }}
                  style={{ width: '100%' }}
                >
                  Continue <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 5: Payment */}
            {currentStep === 5 && (
              <div>
                <h2 style={{ color: '#1abc9c', marginBottom: '2rem', textAlign: 'center' }}>
                  💳 Sacred Energy Exchange
                </h2>
                <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                  <BillingForm 
                    buttonText={`Subscribe for $${
                      formData.duration === '1_month' ? '22' : 
                      formData.duration === '3_month' ? '55' : 
                      formData.duration === '6_month' ? '99' : '188'
                    }`}
                    onSubmit={(card) => {
                      setFormData({...formData, billing: card});
                      toast.success('Frequency matched. Payment accepted.');
                      setCurrentStep(6);
                    }}
                  />
                  <button 
                    onClick={() => setCurrentStep(4)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', display: 'block', margin: '1rem auto', cursor: 'pointer' }}
                  >
                    Back to Subscriptions
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Questionnaire */}
            {currentStep === 6 && (
              <div>
                <h2 style={{ color: '#2ecc71', marginBottom: '2rem', textAlign: 'center' }}>
                  💫 Personalize Your Experience
                </h2>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    What brings you to our sanctuary? (Optional)
                  </label>
                  <textarea
                    value={formData.goals}
                    onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                    placeholder="Share your intentions and goals..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Birth Date (For personalized Resonance)
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                    Previous healing experience? (Optional)
                  </label>
                  <textarea
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Tell us about your journey so far..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(7)}
                  style={{ width: '100%' }}
                >
                  Review & Complete <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                </button>
              </div>
            )}

            {/* Step 7: Review & Submit */}
            {currentStep === 7 && (
              <div>
                <h2 style={{ color: 'var(--accent-gold)', marginBottom: '2rem', textAlign: 'center' }}>
                  ✅ Review Your Information
                </h2>

                <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '1.5rem', borderRadius: '10px', marginBottom: '2rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Name:</strong> <span style={{ color: 'var(--text-main)' }}>{formData.name}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Username:</strong> <span style={{ color: 'var(--text-main)' }}>{formData.username}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Email:</strong> <span style={{ color: 'var(--text-main)' }}>{formData.email}</span>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <strong style={{ color: 'var(--accent-gold)' }}>Account Type:</strong> <span style={{ color: 'var(--text-main)' }}>
                      {formData.accountType === 'healer' ? '🌟 Healer' : '🌙 Seeker'}
                    </span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--accent-gold)' }}>Subscription:</strong> <span style={{ color: 'var(--text-main)' }}>
                      {formData.subscription === 'healing' ? `👑 Healing Tier - ${formData.duration.replace('_', ' ')}` : '🌱 Free Seeker'}
                    </span>
                  </div>
                  {formData.birthDate && (
                    <div style={{ marginBottom: '1rem' }}>
                      <strong style={{ color: 'var(--accent-gold)' }}>Birth Date:</strong> <span style={{ color: 'var(--text-main)' }}>{formData.birthDate}</span>
                    </div>
                  )}
                  {formData.billing && (
                     <div style={{ marginTop: '1rem' }}>
                        <strong style={{ color: 'var(--accent-gold)' }}>Payment:</strong> <span style={{ color: 'var(--text-main)' }}>✓ Card ends in {formData.billing.number.slice(-4)}</span>
                     </div>
                  )}
                </div>

                <p style={{ 
                  fontSize: '0.78rem', 
                  color: 'rgba(255, 255, 255, 0.4)', 
                  textAlign: 'center', 
                  marginBottom: '1.5rem',
                  lineHeight: 1.6 
                }}>
                  By completing registration, you agree to our{' '}
                  <a href="https://reikiandsage.com" onClick={(e) => { e.preventDefault(); window.open('https://reikiandsage.com', '_blank'); }} 
                    style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Terms of Service
                  </a>,{' '}
                  <a href="https://reikiandsage.com" onClick={(e) => { e.preventDefault(); window.open('https://reikiandsage.com', '_blank'); }} 
                    style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Privacy Policy
                  </a>, and{' '}
                  <a href="https://reikiandsage.com" onClick={(e) => { e.preventDefault(); window.open('https://reikiandsage.com', '_blank'); }} 
                    style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Healing Disclaimer
                  </a>.
                </p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    className="btn"
                    onClick={onCancel}
                    style={{ flex: 1, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', opacity: submitting ? 0.7 : 1 }}
                  >
                    <Sparkles size={20} /> {submitting ? 'Calibrating Profile...' : 'Complete Registration'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  );
};

export default SignupFlow;
