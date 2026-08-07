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
              
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', justifyContent: 'center'}}>
                  {/* Free Plan */}
                  <div className="glass" style={{padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column'}}>
                      <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>Free</h3>
                      <div style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                          $0<span style={{fontSize: '0.85rem', opacity: 0.6}}>/mo</span>
                      </div>
                      <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto', fontSize: '0.82rem'}}>
                          {['Basic Profile', 'Introductory Video Lessons', 'Soft Upgrade Prompts', 'No Group Sessions', 'No Gamification'].map(feature => (
                              <li key={feature} style={{display: 'flex', gap: '8px', marginBottom: '0.75rem', color: 'var(--text-muted)'}}>
                                  <Check size={16} color="var(--text-muted)" /> {feature}
                              </li>
                          ))}
                      </ul>
                      <button className="btn" style={{marginTop: '1.5rem', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.85rem'}} onClick={onClose}>
                          Current Plan
                      </button>
                  </div>

                  {/* Seeker Plan */}
                  <div className="glass" style={{padding: '2rem', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column'}}>
                      <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem', color: '#50e3c2'}}>Seeker</h3>
                      <div style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem'}}>
                          $11<span style={{fontSize: '0.85rem', opacity: 0.6}}>/mo</span>
                      </div>
                      <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto', fontSize: '0.82rem'}}>
                          {['Full Profile Customization', 'In-App Gamification (Streaks & Badges)', 'Energetic Avatar Progression', 'Expanded Video & Lesson Library', 'Basic Community Access'].map(feature => (
                              <li key={feature} style={{display: 'flex', gap: '8px', marginBottom: '0.75rem'}}>
                                  <Check size={16} color="#50e3c2" /> {feature}
                              </li>
                          ))}
                      </ul>
                      <button className="btn btn-primary" style={{marginTop: '1.5rem', background: '#50e3c2', color: '#000', fontSize: '0.85rem'}} onClick={() => onUpgrade('seeker')}>
                          Upgrade to Seeker
                      </button>
                  </div>

                  {/* Resonant Plan (Highest Consumer Tier) */}
                  <div className="glass" style={{
                      padding: '2rem', 
                      border: '2px solid var(--accent-gold)', 
                      position: 'relative', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      background: 'rgba(212, 175, 55, 0.08)'
                  }}>
                      <div style={{position: 'absolute', top: 0, right: 0, background: 'var(--accent-gold)', color: 'black', padding: '0.3rem 0.8rem', fontSize: '0.7rem', fontWeight: 'bold', borderRadius: '0 0 0 8px'}}>
                          HIGHEST CONSUMER TIER
                      </div>
                      <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--accent-gold)'}}>Resonant</h3>
                      <div style={{fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--accent-gold)'}}>
                          $22<span style={{fontSize: '0.85rem', opacity: 0.6}}>/mo</span>
                      </div>
                      <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto', fontSize: '0.82rem'}}>
                          {['Full Access to ALL Videos & Lessons', 'Create Group Calendar Invites', 'Host Group Video Healing Sessions', 'Max Gamification & Priority Access', 'Unlimited Scalar Wave Audio'].map(feature => (
                              <li key={feature} style={{display: 'flex', gap: '8px', marginBottom: '0.75rem', color: '#fff'}}>
                                  <Check size={16} color="var(--accent-gold)" /> {feature}
                              </li>
                          ))}
                      </ul>
                      <button className="btn btn-primary" style={{marginTop: '1.5rem', width: '100%', fontSize: '0.85rem'}} onClick={() => onUpgrade('1_month')}>
                          Become Resonant
                      </button>
                  </div>

                  {/* Healing Tier (Professional Role) */}
                  <div className="glass" style={{padding: '2rem', border: '1px solid #9b59b6', display: 'flex', flexDirection: 'column'}}>
                      <h3 style={{fontSize: '1.5rem', marginBottom: '0.25rem', color: '#9b59b6'}}>Healing Tier</h3>
                      <div style={{fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#9b59b6'}}>
                          Professional Practitioner
                      </div>
                      <ul style={{listStyle: 'none', padding: 0, marginBottom: 'auto', fontSize: '0.82rem'}}>
                          {['Mandatory Top-Tier Subscription Required', 'Accept 1:1 & Group Client Bookings', 'Direct Stripe Connect Payouts', '100% Tips Retained ($0 App Fee)', 'Personalized Schedule Manager', 'Requires Master Approval'].map(feature => (
                              <li key={feature} style={{display: 'flex', gap: '8px', marginBottom: '0.75rem'}}>
                                  <Check size={16} color="#9b59b6" /> {feature}
                              </li>
                          ))}
                      </ul>
                      <button className="btn" style={{marginTop: '1.5rem', background: 'rgba(155, 89, 182, 0.15)', border: '1px solid #9b59b6', color: '#9b59b6', fontSize: '0.85rem'}} onClick={onClose}>
                          Apply to Join Team (Top Tier)
                      </button>
                  </div>
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
          <button className="btn btn-primary" style={{fontSize: '1.2rem', padding: '1rem 3rem'}} onClick={() => onUpgrade('1_month')}>
              Begin Your Journey Today
          </button>
      </footer>
    </div>
  );
};

export default SubscriptionPage;
