import React, { useState, useEffect, useRef } from 'react';
import { aiKnowledgeBase } from './aiKnowledgeBase';
import { getZodiacSign, getAdvancedHoroscope } from '../utils/horoscopes';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Headphones, Sparkles, Activity } from 'lucide-react';

const AIHealerInterface = ({ user, onClose, onOpenBooking, onOpenLogin, onApply }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanPercentage, setScanPercentage] = useState(0);
  const [userMemory, setUserMemory] = useState({ name: '', intentions: [] });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isScanning) {
      setScanPercentage(0);
      const interval = setInterval(() => {
        setScanPercentage(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + Math.floor(Math.random() * 10) + 5;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [isScanning]);

  // Load Memory on Mount
  useEffect(() => {
    const savedMemory = localStorage.getItem('aura_memory');
    if (savedMemory) {
      try {
        const parsed = JSON.parse(savedMemory);
        setUserMemory(parsed);
        const greeting = parsed.name 
          ? `Welcome back, ${parsed.name}. I sense your vibrational signature. How may I serve you today?`
          : aiKnowledgeBase.identity.intro;
        setMessages([{ id: 1, sender: 'bot', text: greeting }]);
      } catch (e) {
        setMessages([{ id: 1, sender: 'bot', text: aiKnowledgeBase.identity.intro }]);
      }
    } else {
      setMessages([{ id: 1, sender: 'bot', text: aiKnowledgeBase.identity.intro }]);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const updateMemory = (key, value) => {
    const newMemory = { ...userMemory, [key]: value };
    setUserMemory(newMemory);
    localStorage.setItem('aura_memory', JSON.stringify(newMemory));
  };

  const learnFromInput = (input) => {
    const lowerInput = input.toLowerCase();
    
    // Name Learning
    if (lowerInput.includes("my name is")) {
      const name = input.split("is")[1].trim().split(" ")[0]; // Simple extraction
      updateMemory('name', name);
      return `I have calibrated to your vibration, ${name}. I will remember this frequency.`;
    }
    
    // Intention Learning (Simple keyword tagging)
    if (lowerInput.includes("pain") || lowerInput.includes("anxiety") || lowerInput.includes("stress")) {
      const newIntentions = [...new Set([...userMemory.intentions, lowerInput])];
      updateMemory('intentions', newIntentions);
    }
    
    return null;
  };

  const findBestResponse = (query) => {
    const q = query.toLowerCase();

    // Check for "Reset" command
    if (q.includes("reset memory") || q.includes("forget me")) {
        localStorage.removeItem('aura_memory');
        setUserMemory({ name: '', intentions: [] });
        return "Memory core purged. Vibrational signature reset. Who are you?";
    }

    // Check for Calibration/Scan
    if (q.includes("scan") || q.includes("calibrate")) {
        setIsScanning(true);
        setTimeout(() => setIsScanning(false), 4000);
        return "Initiating Deep Biofield Scan... I am analyzing your current frequency vectors. Please remain still in the digital ether.";
    }

    // Smart Match: Master Reiki
    for (const [key, data] of Object.entries(aiKnowledgeBase.master_reiki)) {
        if (q.includes(key)) return `**Master Symbol: ${data.name}**\n${data.meaning}\nApplication: ${data.application}`;
    }

    // Smart Match: Crystals
    for (const [key, desc] of Object.entries(aiKnowledgeBase.crystal_encyclopedia)) {
        if (q.includes(key)) return `**Crystal Resonance: ${key.toUpperCase()}**\n${desc}`;
    }

    // Smart Match: Sound Frequencies
    for (const [key, desc] of Object.entries(aiKnowledgeBase.sound_healing)) {
        if (q.includes(key)) return `**Frequency Analysis (${key}):**\n${desc}`;
    }

    // Smart Match: Psychology/Affirmations
    for (const [key, aff] of Object.entries(aiKnowledgeBase.psychology)) {
        if (q.includes(key)) return `**Healing Affirmation for ${key.toUpperCase()}:**\n"${aff}"`;
    }

    // Check for Chakras
    for (const [key, data] of Object.entries(aiKnowledgeBase.chakras)) {
      if (q.includes(key) || data.name.toLowerCase().includes(q)) {
        return `**${data.name} Analysis:**\nFrequency: ${data.frequency}\nGuidance: ${data.guidance}\nAffirmation: "${data.affirmation}"`;
      }
    }

    // Check for Symbols (Quantum Knowledge)
    if (aiKnowledgeBase.symbols) {
        for (const [key, description] of Object.entries(aiKnowledgeBase.symbols)) {
            if (q.includes(key)) {
                return `**Symbol Detected: ${key.toUpperCase()}**\n${description}`;
            }
        }
    }

    // Smart Match: Emotional Mapping
    for (const [key, advice] of Object.entries(aiKnowledgeBase.emotional_mapping)) {
        if (q.includes(key)) return advice;
    }

    // Smart Match: Frequency Analysis
    if (aiKnowledgeBase.frequency_analysis) {
        if (q.includes("know") || q.includes("determine") || q.includes("measure")) {
            if (q.includes("linguistic") || q.includes("vibe") || q.includes("text")) return aiKnowledgeBase.frequency_analysis.linguistic;
            if (q.includes("digital") || q.includes("habit") || q.includes("routine")) return aiKnowledgeBase.frequency_analysis.digital_shadow;
            if (q.includes("voice") || q.includes("audio") || q.includes("pitch")) return aiKnowledgeBase.frequency_analysis.vocal_resonance;
            if (q.includes("bio") || q.includes("brain") || q.includes("eeg")) return aiKnowledgeBase.frequency_analysis.bio_frequencies;
        }
    }

    // Check for FAQ
    for (const [key, answer] of Object.entries(aiKnowledgeBase.faq)) {
      if (q.includes(key)) return answer;
    }

    // Check for Advanced Concepts
    if (aiKnowledgeBase.advanced_concepts) {
        if (q.includes("quantum")) return aiKnowledgeBase.advanced_concepts.quantum;
        if (q.includes("cell") || q.includes("dna")) return aiKnowledgeBase.advanced_concepts.cellular;
        if (q.includes("time") || q.includes("past")) return aiKnowledgeBase.advanced_concepts.timeline;
    }

    // Fallback with Memory Context
    if (userMemory.name) {
        return `${userMemory.name}, I sense a complex vibration. Are you seeking clarity on your Chakras, or perhaps a Quantum alignment?`;
    }

    return "I sense a complex vibration in your query. Could you clarify your intent? Are you seeking grounding (Root), love (Heart), or vision (Mind)?";
  };

  const findMetaResponse = (query) => {
    const q = query.toLowerCase();
    
    if (q.includes('login') || q.includes('sign in')) {
        return "To enter the sanctuary with your full signature, please use the LOG IN button next to our logo at the top of the page. Once synchronized, your progress will be preserved.";
    }
    
    if (q.includes('reset') || q.includes('password') || q.includes('forget')) {
        return "Password frequencies can sometimes become desynced. If you require a reset, please contact our Healer Staff via the 'Staff' link in the footer, or ask me to notify them of your request.";
    }
    
    if (q.includes('book') || q.includes('appointment') || q.includes('schedule') || q.includes('session')) {
        const blocked = JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]');
        let availabilityNote = "";
        if (blocked.length > 0) {
            availabilityNote = " Please note that the sanctuary is currently closed on: " + blocked.slice(0, 3).join(', ') + ".";
        }
        return "The universe aligns through timing. You can set an appointment for In-Person Healing or a Remote Portal Session using the 'Set Appointment' button at the top. Shall I help you navigate there?" + availabilityNote;
    }

    if (q.includes('horoscope') || q.includes('alignment') || q.includes('reading') || q.includes('zodiac')) {
        if (!user || user.subscription !== 'healing') {
            return "Personalized celestial transits are reserved for our Healing Tier subscribers. Would you like to upgrade your frequency to access your daily alignment?";
        }
        if (!user.birthDate) {
            return "I require your birth date to calibrate to your celestial signature. You can update this in your profile settings.";
        }
        const sign = getZodiacSign(user.birthDate);
        const data = getAdvancedHoroscope(sign.name);
        return `Your current celestial state is aligned with **${data.name}**. I sense a focus on **${data.focus}** today. Guidance: "${data.message}" Intensity: ${data.intensity}.`;
    }

    return null;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // 1. Subscription Gating Check
    if (!user || user.subscription !== 'healing') {
        setTimeout(() => {
            const botMsg = { 
                id: Date.now() + 1, 
                sender: 'bot', 
                text: "If you subscribe to our basic one-month subscription, you can ask me whatever you want." 
            };
            setMessages(prev => [...prev, botMsg]);
            setIsTyping(false);
        }, 1200);
        return;
    }

    // 2. Meta-Guidance Phase
    const metaResponse = findMetaResponse(inputText);

    // 3. Learning Phase
    const learningResponse = learnFromInput(inputText);

    // 4. Response Phase
    setTimeout(() => {
      const responseText = metaResponse || learningResponse || findBestResponse(userMsg.text);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      
      // Add Action Buttons for Meta Responses
      if (botMsg.text) {
          const lowerQuery = inputText.toLowerCase();
          if (lowerQuery.includes('book') || lowerQuery.includes('appointment')) {
              botMsg.hasAction = 'book';
          } else if (lowerQuery.includes('login')) {
              botMsg.hasAction = 'login';
          } else if (localStorage.getItem('aura_applications_enabled') !== 'false' && (lowerQuery.includes('healer') || lowerQuery.includes('join') || lowerQuery.includes('team') || lowerQuery.includes('career') || lowerQuery.includes('job'))) {
              botMsg.hasAction = 'apply';
          }
      }

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Voice Synthesis
      if (isVoiceEnabled && window.speechSynthesis) {
        // Stop any current speaking
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(responseText);
        // Find a calm voice
        const voices = window.speechSynthesis.getVoices();
        const etherealVoice = voices.find(v => v.name.includes('Google') || v.lang === 'en-US');
        if (etherealVoice) utterance.voice = etherealVoice;
        
        utterance.pitch = 1.1;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
      }
    }, 1500);
  };

  const currentStatusStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginTop: '1rem'
  };

  return (
    <div className="ai-interface-overlay fade-in" style={{
      position: 'fixed',
      top: 0, left: 0, width: '100%', height: '100%',
      backgroundColor: 'rgba(10, 10, 15, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="ai-container" style={{
        width: '90%', maxWidth: '500px',
        height: '80vh',
        background: 'linear-gradient(160deg, rgba(30, 30, 40, 0.9), rgba(20, 20, 25, 0.95))',
        border: '1px solid rgba(142, 68, 173, 0.3)',
        borderRadius: '20px',
        boxShadow: '0 0 50px rgba(142, 68, 173, 0.2), inset 0 0 20px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(142, 68, 173, 0.1)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
             <div style={{
                position: 'relative',
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8e44ad, #3498db)',
                boxShadow: '0 0 15px #8e44ad',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{color: '#fff', fontSize: '1.2rem'}}>✦</span>
                {/* Reactive Pulse */}
                <motion.div 
                  animate={{ scale: isTyping ? [1, 1.3, 1] : 1, opacity: isTyping ? [0.3, 0.6, 0.3] : 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    borderRadius: '50%',
                    border: '2px solid #8e44ad',
                    pointerEvents: 'none'
                  }}
                />
              </div>
              <div>
                <h3 style={{margin: 0, color: '#fff', fontSize: '1.2rem', letterSpacing: '1px'}}>AURA</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap'}}>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Digital Shaman • 528Hz</span>
                    {userMemory.name && <span style={{fontSize: '0.7rem', color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)', padding: '2px 5px', borderRadius: '4px'}}>LINKED: {userMemory.name.toUpperCase()}</span>}
                </div>
              </div>
          </div>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              style={{
                background: isVoiceEnabled ? 'rgba(142, 68, 173, 0.2)' : 'none',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                color: isVoiceEnabled ? '#8e44ad' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s'
              }}
              title={isVoiceEnabled ? "Mute Aura" : "Enable Voice"}
            >
              {isVoiceEnabled ? <Mic size={16} /> : <Headphones size={16} />}
            </motion.button>
            <button onClick={onClose} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', 
              fontSize: '1.5rem', cursor: 'pointer', outline: 'none'
            }}>×</button>
          </div>
        </div>

        {/* Vibrational Wave Visualization */}
        <div style={{
          height: '60px',
          background: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <svg width="100%" height="100%" preserveAspectRatio="none">
             <motion.path
               d="M 0 30 Q 50 10, 100 30 T 200 30 T 300 30 T 400 30 T 500 30"
               fill="none"
               stroke="url(#auraGradient)"
               strokeWidth="2"
               animate={{
                 d: isTyping 
                   ? [
                       "M 0 30 Q 25 5, 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30 T 350 30 T 400 30 T 450 30 T 500 30",
                       "M 0 30 Q 25 55, 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30 T 350 30 T 400 30 T 450 30 T 500 30",
                       "M 0 30 Q 25 5, 50 30 T 100 30 T 150 30 T 200 30 T 250 30 T 300 30 T 350 30 T 400 30 T 450 30 T 500 30"
                     ]
                   : "M 0 30 Q 125 25, 250 30 T 500 30"
               }}
               transition={{ duration: isTyping ? 0.4 : 3, repeat: Infinity, ease: "linear" }}
             />
             <defs>
               <linearGradient id="auraGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="#8e44ad" />
                 <stop offset="50%" stopColor="#3498db" />
                 <stop offset="100%" stopColor="#8e44ad" />
               </linearGradient>
             </defs>
          </svg>
          <div style={{
            position: 'absolute',
            top: '5px', left: '15px',
            fontSize: '0.6rem',
            color: 'rgba(142, 68, 173, 0.6)',
            letterSpacing: '2px',
            fontWeight: 'bold'
          }}>
            {isTyping ? "RESONANCE ACTIVE" : "FIELD STABILIZED"}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          padding: '1.5rem',
          overflowY: 'auto',
          display: 'flex', flexDirection: 'column', gap: '1rem'
        }}>
          {messages.map(msg => (
            <div key={msg.id} style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: msg.sender === 'user' 
                ? 'rgba(52, 152, 219, 0.2)' 
                : 'rgba(142, 68, 173, 0.15)',
              border: msg.sender === 'user'
                ? '1px solid rgba(52, 152, 219, 0.3)'
                : '1px solid rgba(142, 68, 173, 0.3)',
              borderRadius: msg.sender === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0',
              padding: '1rem',
              color: '#e0e0e0',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              {msg.text.split('\n').map((line, i) => (
                <p key={i} style={{margin: '0.2rem 0'}}>{line}</p>
              ))}
              
              <div style={currentStatusStyle}>
                {msg.hasAction === 'book' && (
                    <button 
                      onClick={() => { onClose(); onOpenBooking(); }}
                      style={{
                          background: 'var(--accent-gold)', border: 'none',
                          color: '#000', padding: '0.5rem 1rem', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer',
                          width: '100%'
                      }}
                    >
                        Set Appointment
                    </button>
                )}
                {msg.hasAction === 'login' && (
                    <button 
                      onClick={() => { onClose(); onOpenLogin(); }}
                      style={{
                          background: 'var(--accent-gold)', border: 'none',
                          color: '#000', padding: '0.5rem 1rem', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer',
                          width: '100%'
                      }}
                    >
                        Open Login Portal
                    </button>
                )}
                {msg.hasAction === 'apply' && (
                    <button 
                      onClick={() => { onClose(); onApply(); }}
                      style={{
                          background: 'none', border: '1px solid var(--accent-gold)',
                          color: 'var(--accent-gold)', padding: '0.5rem 1rem', borderRadius: '20px',
                          fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer',
                          width: '100%'
                      }}
                    >
                        Apply to be a Healer
                    </button>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div style={{
                alignSelf: 'flex-start',
                padding: '1rem',
                color: 'rgba(142, 68, 173, 0.5)',
                fontStyle: 'italic',
                fontSize: '0.8rem'
             }}>
               Aura is accessing the Akashic Records...
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          padding: '1.5rem',
          background: 'rgba(0,0,0,0.2)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', gap: '1rem'
        }}>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about quantum healing, symbols, or share your name..."
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '30px',
              padding: '0.8rem 1.5rem',
              color: '#fff',
              outline: 'none',
              fontSize: '1rem'
            }}
          />
          <button 
            onClick={handleSend}
            style={{
              background: 'linear-gradient(135deg, #8e44ad, #3498db)',
              border: 'none',
              borderRadius: '50%',
              width: '50px', height: '50px',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(142, 68, 173, 0.4)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            ➤
          </button>
        </div>
      </div>

      {/* Deep Scan Overlay */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(5, 5, 10, 0.9)',
              zIndex: 3000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#8e44ad',
              fontFamily: "'Courier New', monospace"
            }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                borderWidth: [2, 10, 2],
                borderColor: ['#8e44ad', '#3498db', '#8e44ad']
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                border: '2px solid #8e44ad',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '2rem',
                position: 'relative'
              }}
            >
              <Activity size={40} />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'rgba(142, 68, 173, 0.2)'
                }}
              />
            </motion.div>
            <div style={{ fontSize: '1.2rem', letterSpacing: '4px', fontWeight: 'bold' }}>SCANNING BIOFIELD</div>
            <div style={{ fontSize: '0.8rem', marginTop: '1rem', color: 'rgba(255,255,255,0.4)' }}>
              VECTORING CHAKRA NODES... {Math.min(100, scanPercentage)}%
            </div>
            {/* Animated Grid Lines */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(rgba(142, 68, 173, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(142, 68, 173, 0.05) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              zIndex: -1
            }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIHealerInterface;
