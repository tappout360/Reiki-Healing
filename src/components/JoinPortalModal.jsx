import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, ArrowRight, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

const JoinPortalModal = ({ onClose, onJoin }) => {
    const [code, setCode] = useState('');
    const [verifying, setVerifying] = useState(false);

    const handleVerify = () => {
        setVerifying(true);
        
        // Simulate verification delay
        setTimeout(() => {
            const bookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
            const sessions = JSON.parse(localStorage.getItem('aura_sessions') || '[]'); // Healer active sessions
            
            // Check if code exists in any booking or active session
            const match = bookings.find(b => b.sessionCode === code.toUpperCase()) || 
                          sessions.find(s => s.sessionCode === code.toUpperCase());
            
            if (match) {
                toast.success("Portal resonance matched. Entering Sanctuary...");
                onJoin(match);
                onClose();
            } else {
                toast.error("Invalid session code or portal is currently closed.");
                setVerifying(false);
            }
        }, 1500);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(20px)',
            zIndex: 10005, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass"
                style={{
                    width: '90%', maxWidth: '450px', padding: '3rem', borderRadius: '30px',
                    textAlign: 'center', border: '1px solid var(--accent-gold)'
                }}
            >
                <button 
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '1.5rem', right: '1.5rem',
                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>

                <div style={{
                    width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem'
                }}>
                    <Key size={32} color="var(--accent-gold)" />
                </div>

                <h2 style={{color: 'var(--accent-gold)', fontSize: '1.8rem', marginBottom: '1rem'}}>Portal Entrance</h2>
                <p style={{color: 'var(--text-muted)', marginBottom: '2.5rem'}}>Enter the 6-digit resonance code provided with your booking.</p>

                <div style={{position: 'relative', marginBottom: '2.5rem'}}>
                    <input 
                        type="text"
                        placeholder="______"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        maxLength={6}
                        style={{
                            width: '100%', padding: '1.2rem', background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)', borderRadius: '15px', color: 'var(--accent-gold)',
                            fontSize: '2rem', textAlign: 'center', letterSpacing: '10px', textTransform: 'uppercase',
                            outline: 'none'
                        }}
                    />
                    {verifying && (
                        <div style={{marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'}}>
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                style={{ width: '15px', height: '15px', border: '2px solid var(--accent-gold)', borderTopColor: 'transparent', borderRadius: '50%' }}
                            />
                            <span style={{fontSize: '0.8rem', color: 'var(--accent-gold)'}}>Calibrating Resonance...</span>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleVerify}
                    disabled={code.length < 6 || verifying}
                    className="btn-primary"
                    style={{
                        width: '100%', justifyContent: 'center', height: '60px', borderRadius: '15px',
                        fontSize: '1.1rem', opacity: (code.length < 6 || verifying) ? 0.5 : 1
                    }}
                >
                    {verifying ? 'Accessing Sanctuary...' : (
                        <>
                            Enter Sanctuary <ArrowRight size={20} style={{marginLeft: '10px'}} />
                        </>
                    )}
                </button>

                <div style={{marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0.6}}>
                    <ShieldCheck size={16} />
                    <span style={{fontSize: '0.75rem'}}>Secure Encrypted Session</span>
                </div>
            </motion.div>
        </div>
    );
};

export default JoinPortalModal;
