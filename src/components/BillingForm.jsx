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
            <h3 style={{textAlign: 'center', color: 'var(--text-main)', marginBottom: '1rem'}}>Secure Transformation</h3>
            <p style={{textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem'}}>
                Your energy exchange is processed securely via high-frequency encryption.
            </p>
            
            <div className="glass" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.03)'}}>
                 <div style={{marginBottom: '1.5rem', textAlign: 'center'}}>
                    <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem'}}>Express Exchange</p>
                    <div style={{display: 'flex', gap: '10px', justifyContent: 'center'}}>
                        <button style={{background: '#008CFF', border: 'none', padding: '0.5rem 1rem', borderRadius: '5px', color: 'white', fontWeight: 'bold', cursor: 'pointer', flex: 1}}>Venmo</button>
                        <button style={{background: 'black', border: '1px solid white', padding: '0.5rem 1rem', borderRadius: '5px', color: 'white', fontWeight: 'bold', cursor: 'pointer', flex: 1}}>Plaid</button>
                    </div>
                    <div style={{margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.8rem'}}>
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
