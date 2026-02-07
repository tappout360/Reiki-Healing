import React, { useState } from 'react';
import { Lock } from 'lucide-react';

const BillingForm = ({ onSubmit, buttonText = "Securely Align", initialData = {} }) => {
    const [cardData, setCardData] = useState({
        number: initialData.number || '',
        expiry: initialData.expiry || '',
        cvc: initialData.cvc || ''
    });

    const [saveCard, setSaveCard] = useState(true);

    const handleSubmit = () => {
        // Simple validation simulation
        if (cardData.number && cardData.expiry && cardData.cvc) {
            onSubmit({...cardData, saveCard});
        }
    };

    return (
        <div className="billing-form">
            <h3 style={{textAlign: 'center', color: 'var(--accent-gold)', marginBottom: '0.5rem', fontFamily: 'Playfair Display', letterSpacing: '1px'}}>Sacred Energy Exchange</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '1.5rem', opacity: 0.8 }}>
                <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>FDA APPROVED FREQUENCIES</div>
                <div style={{ fontSize: '0.65rem', border: '1px solid rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent-ethereal)' }}>HIPAA COMPLIANT ARCHIVE</div>
            </div>
            <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem', fontStyle: 'italic'}}>
                Your contribution sustains the global resonance field. Processed via high-fidelity secure encryption.
            </p>
            
            <div className="glass" style={{padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(212, 175, 55, 0.2)'}}>
                 <div style={{marginBottom: '2rem', textAlign: 'center'}}>
                    <p style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Express Transition</p>
                    <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                        <button style={{background: '#008CFF', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '0.85rem'}}>Venmo</button>
                        <button style={{background: 'black', border: '1px solid rgba(255,255,255,0.3)', padding: '0.6rem 1.2rem', borderRadius: '12px', color: 'white', fontWeight: 'bold', cursor: 'pointer', flex: 1, fontSize: '0.85rem'}}>Plaid</button>
                    </div>
                    <div style={{margin: '1.5rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.75rem'}}>
                        <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1}}></div> OR <div style={{height: '1px', background: 'rgba(255,255,255,0.1)', flex: 1}}></div>
                    </div>
                </div>

                <div className="form-group">
                    <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>Card Number</label>
                    <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        className="booking-input"
                        value={cardData.number}
                        onChange={(e) => setCardData({...cardData, number: e.target.value})}
                        style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', width: '100%'}}
                    />
                </div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem'}}>
                    <div className="form-group">
                        <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>Expiry</label>
                        <input 
                            type="text" 
                            placeholder="MM / YY" 
                            className="booking-input"
                            value={cardData.expiry}
                            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
                            style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', width: '100%'}}
                        />
                    </div>
                    <div className="form-group">
                        <label style={{display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem'}}>CVC</label>
                        <input 
                            type="text" 
                            placeholder="123" 
                            className="booking-input"
                            value={cardData.cvc}
                            onChange={(e) => setCardData({...cardData, cvc: e.target.value})}
                            style={{background: 'rgba(0,0,0,0.2)', padding: '1rem', width: '100%'}}
                        />
                    </div>
                </div>
                
                 <div style={{marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input 
                        type="checkbox" 
                        id="saveCard" 
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        style={{width: '18px', height: '18px', accentColor: 'var(--accent-gold)'}} 
                    />
                    <label htmlFor="saveCard" style={{color: 'var(--text-main)', fontSize: '0.9rem'}}>Save card for future healing</label>
                </div>
            </div>
            
            <p style={{textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem'}}>
                <span style={{color: 'var(--accent-gold)'}}>★</span> Monthly Recurring Subscription. Cancel anytime in Dashboard.
            </p>

            <button 
                className="btn btn-primary" 
                style={{width: '100%', marginTop: '2rem', padding: '1rem'}}
                onClick={handleSubmit}
                disabled={!cardData.number || !cardData.expiry || !cardData.cvc}
            >
                <Lock size={16} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} /> {buttonText}
            </button>
        </div>
    );
};

export const maskCardData = (number) => {
    if (!number || number.length < 4) return '****';
    return `**** **** **** ${number.slice(-4)}`;
};

export default BillingForm;
