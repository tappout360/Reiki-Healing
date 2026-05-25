import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Send, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { auth, db, isFirebaseConfigured } from '../lib/firebase';

const HealerApplicationModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    birthDate: user?.birthDate || '',
    password: '',
    confirmPassword: '',
    motivation: '',
    experience: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    return (
      formData.name.length >= 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      formData.motivation.length > 10 &&
      formData.experience.length > 10
    );
  };

  const getPasswordStrength = () => {
    const pw = formData.password;
    if (pw.length === 0) return { strength: 0, label: '', color: '#666' };
    if (pw.length < 6) return { strength: 33, label: 'Weak', color: '#e74c3c' };
    if (pw.length < 10) return { strength: 66, label: 'Good', color: '#f39c12' };
    return { strength: 100, label: 'Strong', color: '#2ecc71' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
    }

    setSubmitting(true);

    try {
      const newApplication = {
        name: formData.name,
        email: formData.email,
        birthDate: formData.birthDate,
        motivation: formData.motivation,
        experience: formData.experience,
        userId: isFirebaseConfigured() ? auth.getUser()?.uid || null : null,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      };

      if (isFirebaseConfigured()) {
        // Save to Firestore
        await db.submitApplication(newApplication);
      } else {
        // Fallback: localStorage
        const applications = JSON.parse(localStorage.getItem('aura_applications') || '[]');
        if (applications.find(a => a.email === formData.email && a.status === 'Pending')) {
          toast.error("An application with this email is already pending.");
          setSubmitting(false);
          return;
        }
        localStorage.setItem('aura_applications', JSON.stringify([...applications, { ...newApplication, id: Date.now() }]));
      }

      setSubmitted(true);
      toast.success("Application transmitted to the Sanctuary Council.");
    } catch (error) {
      toast.error("Failed to submit application. Please try again.");
      console.error('Application error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
        <div className="booking-overlay" style={{backdropFilter: 'blur(10px)', zIndex: 10005}}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="booking-modal glass"
                style={{textAlign: 'center', padding: '4rem 2rem'}}
            >
                <CheckCircle size={64} color="var(--earth-green)" style={{margin: '0 auto 1.5rem'}} />
                <h2 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Application Received</h2>
                <p style={{marginBottom: '2rem', color: 'var(--text-muted)'}}>
                    The council will review your energy signature. You will be notified via the energies upon acceptance and account activation.
                </p>
                <button className="btn-primary" onClick={onClose}>Return to Sanctuary</button>
            </motion.div>
        </div>
    );
  }

  return (
    <div className="booking-overlay" style={{backdropFilter: 'blur(10px)', zIndex: 10005}}>
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="booking-modal glass"
        style={{maxWidth: '700px', width: '95%', maxHeight: '90vh', overflowY: 'auto'}}
      >
        <button onClick={onClose} className="booking-close">×</button>
        
        <div style={{textAlign: 'center', marginBottom: '2rem'}}>
            <Sparkles size={32} color="var(--accent-gold)" style={{margin: '0 auto 1rem'}} />
            <h2 style={{fontSize: '1.8rem', color: 'var(--accent-gold)'}}>Join the Healer Collective</h2>
            <p style={{color: 'var(--text-muted)'}}>Provide your celestial details to initiate the application.</p>
        </div>

        <form onSubmit={handleSubmit}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem'}}>Full Name</label>
                    <input 
                        required
                        type="text"
                        style={{width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem'}}>Email Address</label>
                    <input 
                        required
                        type="email"
                        style={{width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem'}}>Birth Date</label>
                    <input 
                        required
                        type="date"
                        style={{width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
                        value={formData.birthDate}
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                    />
                </div>
                <div style={{display: 'flex', alignItems: 'flex-end'}}>
                     <p style={{fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, paddingBottom: '0.5rem'}}>Celestial data used for resonance calibration.</p>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem'}}>
                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem'}}>Create Password</label>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type={showPassword ? "text" : "password"}
                            style={{width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
                            value={formData.password}
                            onChange={e => setFormData({...formData, password: e.target.value})}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer'}}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    {formData.password && (
                        <div style={{marginTop: '0.5rem'}}>
                            <div style={{width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden'}}>
                                <motion.div animate={{width: `${getPasswordStrength().strength}%`}} style={{height: '100%', background: getPasswordStrength().color}} />
                            </div>
                            <span style={{fontSize: '0.7rem', color: getPasswordStrength().color}}>{getPasswordStrength().label}</span>
                        </div>
                    )}
                </div>
                <div>
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.9rem'}}>Confirm Password</label>
                    <div style={{position: 'relative'}}>
                        <input 
                            required
                            type={showPassword ? "text" : "password"}
                            style={{width: '100%', padding: '0.8rem', paddingRight: '2.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white'}}
                            value={formData.confirmPassword}
                            onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer'}}
                        >
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{marginBottom: '1.5rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)'}}>
                    <FileText size={16} style={{display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom'}} />
                    Motivation: Why do you feel called to heal?
                </label>
                <textarea 
                    required
                    style={{width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px'}}
                    placeholder="Describe your spiritual mission..."
                    value={formData.motivation}
                    onChange={e => setFormData({...formData, motivation: e.target.value})}
                />
            </div>

            <div style={{marginBottom: '2rem'}}>
                <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-main)'}}>
                    <Sparkles size={16} style={{display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom'}} />
                    Experience & Certifications
                </label>
                 <textarea 
                    required
                    style={{width: '100%', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'white', minHeight: '80px'}}
                    placeholder="Years of practice, modalities, lineages..."
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                />
            </div>

            <button 
                type="submit" 
                className="btn-primary" 
                disabled={!validate() || submitting}
                style={{width: '100%', justifyContent: 'center', opacity: (validate() && !submitting) ? 1 : 0.5}}
            >
                <Send size={18} /> {submitting ? 'Transmitting...' : 'Submit Application'}
            </button>
        </form>

      </motion.div>
    </div>
  );
};

export default HealerApplicationModal;
