import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingInterface.css';

const BookingInterface = ({ type, onClose }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);
  const [step, setStep] = useState(0);
  const [vibrationMatched, setVibrationMatched] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Auto-fill logic for returning clients
  useEffect(() => {
    if (name.length > 2) {
      const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
      const match = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (match) {
        setPhone(match.phone);
        setEmail(match.email);
        toast.success(`Welcome back, ${match.name}. Resonance matched.`);
      }
    }
  }, [name]);

  const timeSlots = [
    '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const handleBooking = () => {
    const booking = {
      id: Date.now(),
      type: type === 'onsite' ? 'On-Site Session' : 'Portal Resonance',
      date: date.toDateString(),
      time,
      client: { name, phone, email },
      status: 'pending',
      created: new Date().toISOString()
    };

    // Save booking
    const existingBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    localStorage.setItem('aura_bookings', JSON.stringify([...existingBookings, booking]));
    
    // Save/Update client in archive
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const clientIdx = clients.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    const clientData = { name, phone, email, lastBooking: booking.date };
    
    if (clientIdx > -1) {
      clients[clientIdx] = clientData;
    } else {
      clients.push(clientData);
    }
    localStorage.setItem('aura_clients', JSON.stringify(clients));
    
    // Simulated email dispatch
    const emailSettings = JSON.parse(localStorage.getItem('aura_email_settings')) || { fromEmail: 'healing@reikiandsage.com', signature: 'Balance & Blessing, Carissa' };
    console.log(`[AURA SIMULATION] Email sent from ${emailSettings.fromEmail} to ${email}. Subject: Appointment Confirmed. Signature: ${emailSettings.signature}`);
    
    setStep(3);
  };

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <button onClick={onClose} className="booking-close">×</button>

        {step === 0 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 className="booking-header">Vibrational Pre-Check</h2>
            <div style={{ margin: '2rem 0', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
              {[...Array(12)].map((_, i) => (
                <div key={i} className="vibration-dot" style={{ 
                  width: '10px', height: '10px', background: 'var(--accent-ethereal)', borderRadius: '50%',
                  animation: `auraPulse ${1 + Math.random()}s infinite ease-in-out`,
                  opacity: 0.3 + Math.random() * 0.7
                }} />
              ))}
            </div>
            <p style={{ color: '#666', marginBottom: '2rem' }}>We are scanning the current etheric load... <br/><strong>{Math.floor(Math.random() * 5) + 2}</strong> souls are currently in the sanctuary.</p>
            <button 
              onClick={() => {
                setVibrationMatched(true);
                setTimeout(() => setStep(1), 1000);
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {vibrationMatched ? 'VIBRATION MATCHED ✓' : 'Match My Frequency'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <h2 className="booking-header">{type === 'onsite' ? 'Book On-Site Healing' : 'Schedule Portal Resonance'}</h2>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>Select a date for your session.</p>
            <Calendar 
              onChange={setDate} 
              value={date} 
            />
            <div className="time-grid">
              {timeSlots.map(slot => (
                <button 
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`time-slot ${time === slot ? 'selected' : ''}`}
                >
                  {slot}
                </button>
              ))}
            </div>
            <button 
              disabled={!time}
              onClick={() => setStep(2)}
              className="btn-primary"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h2 className="booking-header">Your Details</h2>
            <p style={{marginBottom: '1.5rem', opacity: 0.7}}>So we can contact you.</p>
            
            <input 
              type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)}
              className="booking-input"
            />
            <input 
              type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)}
              className="booking-input"
            />
            <input 
              type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
              className="booking-input"
            />

            <div className="summary-card">
              <p><strong>Service:</strong> {type === 'onsite' ? 'In-Person Healing' : 'Remote Portal Session'}</p>
              <p><strong>Date:</strong> {date.toDateString()}</p>
              <p><strong>Time:</strong> {time}</p>
            </div>

            <button 
              onClick={handleBooking}
              disabled={!name || !phone || !email}
              className="btn-primary"
            >
              Confirm Appointment
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="fade-in" style={{textAlign: 'center'}}>
            <div style={{fontSize: '4rem', margin: '1rem 0'}}>✨</div>
            <h2 style={{color: '#2ecc71'}}>Booking Confirmed!</h2>
            <p>Your session has been reserved in our system.</p>
            <p>We have sent a confirmation to <strong>{email}</strong>.</p>
            <p style={{marginTop: '2rem', fontStyle: 'italic', color: '#888'}}>
              "The universe has aligned this time for you."
            </p>
            <button 
              onClick={onClose}
              className="btn-primary"
              style={{background: '#2ecc71', marginTop: '2rem'}}
            >
              Return into Light
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingInterface;
