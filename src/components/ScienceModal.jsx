import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Globe, Cpu, Radio, Microscope, X } from 'lucide-react';
import './ScienceModal.css';

const ScienceModal = ({ onClose }) => {
  const [activeImpact, setActiveImpact] = useState(null);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="science-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="science-modal-content glass"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>

          <header className="science-header">
            <div className="icon-badge">
              <Microscope size={28} color="var(--accent-gold)" />
            </div>
            <div>
              <h2>The Science of Resonance</h2>
              <p>Bridging Ancient Wisdom with Modern Biophysics</p>
            </div>
          </header>

          <div className="science-body">
            
            {/* Section 1: The Biofield */}
            <section className="science-section">
              <h3><Activity size={20} /> The Biofield Mechanism</h3>
              <p>
                Every living biological system emits an electromagnetic field, scientifically referred to as the <strong>Biofield</strong>. 
                Research in biophysics has detected that the heart generates the strongest electromagnetic field in the body, measurable several feet away.
              </p>
              <div className="highlight-box">
                <strong>Distinct Detail:</strong> SQUID magnetometer studies have recorded biomagnetic pulses from healers' hands in the range of <strong>0.3 to 30 Hz</strong>—precisely overlapping with human brainwaves (alpha/theta) that govern tissue repair and deep relaxation.
              </div>
            </section>

            {/* Section 2: Frequency Precision */}
            <section className="science-section">
              <h3><Radio size={20} /> Frequency Precision (528Hz & 432Hz)</h3>
              <p>
                Sound therapy utilizes specific hertz frequencies to entrain neural oscillations. Our protocols are tuned to these scientifically significant resonances:
              </p>
              <ul className="science-list">
                <li>
                  <span className="freq-tag">528 Hz</span>
                  <span>
                    <strong>"The Miracle Tone":</strong> Studies suggest this frequency can reduce cortisol (stress hormone) levels and increase oxytocin. It is theorized to influence cellular water structure, potentially aiding in DNA repair mechanisms.
                  </span>
                </li>
                <li>
                  <span className="freq-tag">432 Hz</span>
                  <span>
                    <strong>"Verdi's Tuning":</strong> Mathematically consistent with the universe's phi-ratio. Clinical trials have observed lower heart rate and blood pressure in subjects listening to 432Hz compared to standard 440Hz music, indicating a shift to parasympathetic nervous system dominance.
                  </span>
                </li>
              </ul>
            </section>

            {/* Section 3: Quantum Coherence */}
            <section className="science-section">
              <h3><Cpu size={20} /> Quantum Coherence</h3>
              <p>
                 Beyond classical electromagnetism, modern theory proposes that consciousness interacts with matter via <strong>Quantum Coherence</strong> within the body's microtubules. 
                 Energy healing helps restore this coherence, reducing "entropy" (disorder) in the body's information systems.
              </p>
            </section>

            {/* Section 4: Physiological Impact */}
            <section className="science-section">
              <h3><Zap size={20} /> Measured Physiological Impact</h3>
              <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>Select a biomarker to view clinical mechanisms.</p>
              
              <div className="stats-grid">
                <div 
                  className="stat-card interactive" 
                  onClick={() => setActiveImpact(activeImpact === 'cortisol' ? null : 'cortisol')}
                  style={{borderColor: activeImpact === 'cortisol' ? 'var(--earth-green)' : ''}}
                >
                  <h4>Cortisol</h4>
                  <span className="down">▼ Reduced</span>
                  <p>Decreased stress markers.</p>
                </div>
                
                <div 
                  className="stat-card interactive"
                  onClick={() => setActiveImpact(activeImpact === 'hrv' ? null : 'hrv')}
                  style={{borderColor: activeImpact === 'hrv' ? 'var(--earth-green)' : ''}}
                >
                  <h4>HRV</h4>
                  <span className="up">▲ Increased</span>
                  <p>Heart Rate Variability improves.</p>
                </div>
                
                <div 
                  className="stat-card interactive"
                  onClick={() => setActiveImpact(activeImpact === 'brain' ? null : 'brain')}
                  style={{borderColor: activeImpact === 'brain' ? 'var(--earth-green)' : ''}}
                >
                  <h4>Brainwaves</h4>
                  <span className="neutral">~ Alpha/Theta</span>
                  <p>Shift to Alpha (calm).</p>
                </div>
              </div>

              <AnimatePresence>
                {activeImpact && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="impact-detail-container"
                  >
                    {activeImpact === 'cortisol' && (
                      <div className="impact-detail">
                        <h4>Biochemical Stress Reduction (528 Hz)</h4>
                        <p>
                          <strong>Mechanism:</strong> Clinical pilot studies involving 528 Hz exposure demonstrated a statistical reduction in salivary cortisol levels compared to control groups (440 Hz). 
                        </p>
                        <p>
                          <strong>Outcome:</strong> This reduction correlates with an increase in Oxytocin production, facilitating cellular repair and reducing systemic inflammation caused by chronic fight-or-flight states.
                        </p>
                      </div>
                    )}
                    
                    {activeImpact === 'hrv' && (
                      <div className="impact-detail">
                        <h4>Parasympathetic Activation (432 Hz)</h4>
                        <p>
                          <strong>Mechanism:</strong> Heart Rate Variability (HRV) is the key marker of autonomic nervous system flexibility. Listening to 432 Hz "Verdi's A" has been shown to significantly lower systolic blood pressure and heart rate.
                        </p>
                        <p>
                          <strong>Outcome:</strong> This signals a dominance of the parasympathetic (rest-and-digest) system, essential for deep-tissue regeneration and immune system efficiency.
                        </p>
                      </div>
                    )}
                    
                    {activeImpact === 'brain' && (
                      <div className="impact-detail">
                        <h4>Biomagnetic Entrainment (0.3 - 30 Hz)</h4>
                        <p>
                          <strong>Mechanism:</strong> SQUID Magnetometer readings of Reiki practitioners' hands show emissions pulsing between 0.3 and 30 Hz.
                        </p>
                        <p>
                          <strong>Outcome:</strong> This range precisely sweeps through the brain's regulatory frequencies:
                          <br/><br/>
                          • <strong>2 Hz:</strong> Nerve Regeneration<br/>
                          • <strong>7 Hz:</strong> Bone Growth (Theta)<br/>
                          • <strong>10 Hz:</strong> Ligament Repair (Alpha)
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
            
          </div>

          <div className="science-footer">
            <p>Our methodologies are constantly evolving as new research emerges in the fields of Psychoacoustics and Bioenergetics.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScienceModal;
