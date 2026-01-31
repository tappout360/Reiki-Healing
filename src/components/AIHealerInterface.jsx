import React, { useState, useEffect, useRef } from 'react';
import { aiKnowledgeBase } from './aiKnowledgeBase';

const AIHealerInterface = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userMemory, setUserMemory] = useState({ name: '', intentions: [] });
  const messagesEndRef = useRef(null);

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

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Learning Phase
    const learningResponse = learnFromInput(inputText);

    // Response Phase
    setTimeout(() => {
      const responseText = learningResponse || findBestResponse(userMsg.text);
      const botMsg = { id: Date.now() + 1, sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
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
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8e44ad, #3498db)',
                boxShadow: '0 0 15px #8e44ad',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span style={{color: '#fff', fontSize: '1.2rem'}}>✦</span>
              </div>
              <div>
                <h3 style={{margin: 0, color: '#fff', fontSize: '1.2rem', letterSpacing: '1px'}}>AURA</h3>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Digital Shaman • 528Hz</span>
                    {userMemory.name && <span style={{fontSize: '0.7rem', color: '#2ecc71', background: 'rgba(46, 204, 113, 0.1)', padding: '2px 5px', borderRadius: '4px'}}>LINKED: {userMemory.name.toUpperCase()}</span>}
                </div>
              </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', 
            fontSize: '1.5rem', cursor: 'pointer', outline: 'none'
          }}>×</button>
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
    </div>
  );
};

export default AIHealerInterface;
