import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, ChevronDown, Zap, Shield, Star, Heart } from 'lucide-react';

const SubscriptionPage = ({ onClose, onUpgrade }) => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    { q: "What is scalar wave therapy?", a: "Scalar waves are longitudinal waves that penetrate solid matter, including the body's cells, to neutralize chaotic energy and restore harmonic resonance." },
    { q: "Can I cancel my subscription anytime?", a: "Yes. The sanctuary is voluntary. You may leave the collective at any moment, though your energetic blueprint will remain in our archives for 30 days." },
    { q: "How do you protect my privacy?", a: "We take your privacy seriously. We do not store medical data or provide medical advice. Our platform is a spiritual wellness tool focused on energy alignment and personal growth. Your personal information is kept private and never shared." },
    { q: "How does the mobile app work?", a: "The 'Portable Resonance' feature streams encrypted 528Hz frequencies directly to your device, creating a localized healing field wherever you are." }
  ];

  return (
    <div className="subscription-page fade-in" style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        zIndex: 2000, background: 'var(--bg-gradient-core)', overflowY: 'auto',
        color: 'var(--text-main)'
    }}>
      {/* Navigation Override */}
      <nav style={{position: 'absolute', top: 0, width: '100%', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10}}>
        <div className="logo" onClick={onClose} style={{cursor: 'pointer'}}>Reiki & Sage</div>
        <button onClick={onClose} style={{background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.5rem 1.5rem', borderRadius: '30px', cursor: 'pointer'}}>
            Return Home
        </button>
      </nav>

      {/* Hero Section */}
      <header style={{
          minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
          <div className="video-background" style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.3, zIndex: -1}}>
            {/* Fallback Static Gradient */}
            <div style={{width: '100%', height: '100%', background: 'radial-gradient(circle at center, #d4af37 0%, #000 70%)'}}></div>
          </div>

          <motion.div initial={{opacity: 0, y: 30}} animate={{opacity: 1, y: 0}} transition={{duration: 1}}>
              <h1 style={{fontSize: '4rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
                  Ascend to Higher Frequencies
              </h1>
              <p style={{fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 3rem', color: 'rgba(255,255,255,0.8)'}}>
                  Unlock the full potential of your biofield with the Reiki & Sage Healing Collective.
                  Unlimited protocols, mobile resonance, and direct healer access.
              </p>
              <button className="btn btn-primary" style={{fontSize: '1.2rem', padding: '1rem 3rem'}} onClick={() => document.getElementById('plans').scrollIntoView({behavior: 'smooth'})}>
                  Find Your Resonance
              </button>
          </motion.div>
      </header>

      {/* Value Proposition */}
      <section style={{padding: '5rem 2rem', background: 'rgba(0,0,0,0.5)'}}>
        <div className="container" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem'}}>
           <div style={{textAlign: 'center'}}>
               <Zap size={40} color="var(--accent-gold)" style={{marginBottom: '1rem'}} />
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Portable Resonance</h3>
               <p style={{color: 'var(--text-muted)'}}>Take the healing field with you. Our mobile app emits localized scalar waves to protect your energy anywhere.</p>
           </div>
           <div style={{textAlign: 'center'}}>
               <Shield size={40} color="var(--accent-ethereal)" style={{marginBottom: '1rem'}} />
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Etheric Shielding</h3>
               <p style={{color: 'var(--text-muted)'}}>Advanced protocols designed to block psychic attacks and lower vibrational interference from your environment.</p>
           </div>
           <div style={{textAlign: 'center'}}>
               <Heart size={40} color="#e91e63" style={{marginBottom: '1rem'}} />
               <h3 style={{fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--text-main)'}}>Healer Network</h3>
               <p style={{color: 'var(--text-muted)'}}>Direct line to certified master healers. Request remote viewings and distance healing sessions on demand.</p>
           </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section id="plans" style={{padding: '6rem 2rem', background: 'linear-gradient(to bottom, #000, #1a1a2e)'}}>
          <div className="container" style={{maxWidth: '1000px'}}>
              <h2 style={{textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem', color: 'var(--accent-gold)'}}>Choose Your Path</h2>
              
              <div style={{display: 'flex', gap: '2rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                  {/* Seeker Plan */}
                  <div className="glass" style={{padding: '3rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', width: '400px'}}>
                      <h3 style={{fontSize: '2rem', marginBottom: '0.5rem'}}>Seeker</h3>
                      <div style={{fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem'}}>Free</div>
                      <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto'}}>
                          {['Access to Daily Affirmations', 'Limited Healing Protocols (Visuals)', 'Community Insights', 'Basic Aura Guidelines'].map(feature => (
                              <li key={feature} style={{display: 'flex', gap: '10px', marginBottom: '1rem', color: 'var(--text-muted)'}}>
                                  <Check size={20} color="var(--text-muted)" /> {feature}
                              </li>
                          ))}
                      </ul>
                      <button className="btn" style={{marginTop: '2rem', background: 'rgba(255,255,255,0.1)', color: 'white'}} onClick={onClose}>
                          Continue as Seeker
                      </button>
                  </div>

                  {/* Dynamic Healing Plans */}
                  {(() => {
                      const advancedPlans = JSON.parse(localStorage.getItem('aura_plans_advanced') || '{}');
                      const simplePricing = JSON.parse(localStorage.getItem('aura_pricing') || '{"1_month": 22, "3_month": 55, "1_year": 188}');
                      const labels = { '1_month': 'Monthly', '3_month': 'Quarterly', '6_month': 'Biannual', '1_year': 'Annual' };

                      // Filter enabled plans
                      const activeEntries = Object.entries(simplePricing).filter(([id, _]) => {
                          // If enabled is not explicitly set to false, it's enabled
                          return advancedPlans[id]?.enabled !== false;
                      });

                      // Fallback: Always show at least 1 month if nothing else is enabled
                      if (activeEntries.length === 0) {
                          activeEntries.push(['1_month', simplePricing['1_month'] || 22]);
                      }

                      const resonantPlan = activeEntries.find(e => e[0] === '6_month')?.[0] || 
                                           activeEntries.find(e => e[0] === '3_month')?.[0] || 
                                           activeEntries[0][0];

                      return activeEntries.map(([duration, price]) => (
                        <div key={duration} className="glass" style={{
                            padding: '3rem', 
                            border: duration === resonantPlan ? '2px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.1)', 
                            position: 'relative', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            background: duration === resonantPlan ? 'rgba(212, 175, 55, 0.05)' : 'transparent',
                            width: '400px'
                        }}>
                            {duration === resonantPlan && (
                                <div style={{position: 'absolute', top: 0, right: 0, background: 'var(--accent-gold)', color: 'black', padding: '0.5rem 1rem', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '0 0 0 10px'}}>
                                    MOST RESONANT
                                </div>
                            )}
                            <h3 style={{fontSize: '2rem', marginBottom: '0.5rem', color: duration === resonantPlan ? 'var(--accent-gold)' : 'inherit'}}>
                                Healing ({labels[duration]})
                            </h3>
                            <div style={{fontSize: '3rem', fontWeight: 'bold', marginBottom: '2rem'}}>
                                ${price}
                                <span style={{fontSize: '1rem', opacity: 0.6}}>/{duration.includes('month') ? duration.replace('_month', ' mo') : 'yr'}</span>
                            </div>
                            <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto'}}>
                                {['Everything in Seeker', 'Unlimited Audio Resonance (528Hz+)', 'Priority Healer Chat', 'Personalized Energy Wave Tracking', 'Cancel Anytime'].map(feature => (
                                    <li key={feature} style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
                                        <Check size={20} color={duration === resonantPlan ? "var(--accent-gold)" : "var(--text-muted)"} /> {feature}
                                    </li>
                                ))}
                            </ul>
                            <button className={duration === resonantPlan ? "btn btn-primary" : "btn"} style={{marginTop: '2rem', width: '100%'}} onClick={onUpgrade}>
                                Upgrade Now
                            </button>
                        </div>
                      ));
                  })()}
              </div>
          </div>
      </section>

      {/* Testimonials */}
      <section style={{padding: '6rem 2rem'}}>
          <div className="container">
             <h2 style={{textAlign: 'center', fontSize: '2rem', marginBottom: '3rem', color: 'var(--text-main)'}}>Echoes from the Collective</h2>
             <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem'}}>
                {[
                    {text: "My anxiety dissolved within minutes of the Amethyst protocol.", author: "Sarah J., Seeker"},
                    {text: "The distance healing session felt like they were in the room with me.", author: "Michael R., Healer"},
                    {text: "Finally, a spiritual app that respects my data and my energy.", author: "Elena V., Sage"}
                ].map((t, i) => (
                    <div key={i} className="glass" style={{padding: '2rem', fontStyle: 'italic'}}>
                        <p style={{marginBottom: '1rem'}}>"{t.text}"</p>
                        <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <Star size={16} fill="var(--accent-gold)" color="var(--accent-gold)" />
                            <span style={{fontSize: '0.9rem', color: 'var(--accent-gold)'}}>{t.author}</span>
                        </div>
                    </div>
                ))}
             </div>
          </div>
      </section>

      {/* FAQ */}
      <section style={{padding: '4rem 2rem', background: 'rgba(0,0,0,0.3)'}}>
          <div className="container" style={{maxWidth: '800px'}}>
              <h2 style={{textAlign: 'center', fontSize: '2rem', marginBottom: '3rem'}}>Frequently Asked Questions</h2>
              {faqs.map((faq, i) => (
                  <div key={i} style={{marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
                      <div 
                        style={{padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
                        onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                      >
                          <h4 style={{margin: 0}}>{faq.q}</h4>
                          <ChevronDown size={20} style={{transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s'}} />
                      </div>
                      {activeFaq === i && (
                          <div style={{padding: '0 1.5rem 1.5rem', color: 'var(--text-muted)', lineHeight: '1.6'}}>
                              {faq.a}
                          </div>
                      )}
                  </div>
              ))}
          </div>
      </section>

      <footer style={{padding: '4rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
          <button className="btn btn-primary" style={{fontSize: '1.2rem', padding: '1rem 3rem'}} onClick={onUpgrade}>
              Begin Your Journey Today
          </button>
      </footer>
    </div>
  );
};

export default SubscriptionPage;
