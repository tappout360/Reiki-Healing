import React from 'react';
import './AuraGuide.css';

const AuraGuide = ({ onClose, onConsult }) => {
  return (
    <div className="aura-guide-overlay" onClick={onClose}>
      <div className="aura-guide-modal" onClick={e => e.stopPropagation()}>
        <button className="aura-guide-close" onClick={onClose}>×</button>
        
        <h2 className="aura-guide-header">Consult Aura</h2>
        <div style={{width: '60px', height: '2px', background: 'var(--accent-gold)', margin: '0.5rem auto 2rem'}}></div>
        
        <p style={{fontSize: '1rem', fontStyle: 'italic', opacity: 0.8, marginBottom: '2rem'}}>
          "Your digital spiritual guide to resonance and clarity."
        </p>

        <div className="aura-keyword-grid">
          <div className="keyword-card">
            <div className="aura-section-title">Activation Keywords</div>
            <ul className="prompt-list" style={{padding: 0, margin: 0}}>
              <li><strong>Chakras:</strong> (Heart, Root, Throat...)</li>
              <li><strong>Crystals:</strong> (Amethyst, Rose Quartz)</li>
              <li><strong>States:</strong> (Anxiety, Stress, Sleep)</li>
              <li><strong>Symbols:</strong> (Cho Ku Rei, Sei He Ki)</li>
            </ul>
          </div>
          
          <div className="keyword-card">
            <div className="aura-section-title">Resonance Prompts</div>
            <ul className="prompt-list" style={{padding: 0, margin: 0}}>
              <li>"How do I handle grief?"</li>
              <li>"My name is [Name], help me ground."</li>
              <li>"What does 528Hz do?"</li>
              <li>"Clear my energy field."</li>
            </ul>
          </div>
        </div>

        <button 
          className="btn-primary" 
          onClick={onConsult}
          style={{padding: '0.8rem 3rem', fontSize: '1rem'}}
        >
          Begin Consultation
        </button>
      </div>
    </div>
  );
};

export default AuraGuide;
