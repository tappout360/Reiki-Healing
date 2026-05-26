import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingInterface.css';
import { logTransaction } from '../utils/logger';
import BillingForm from './BillingForm';

const maskCardData = (number) => {
  if (!number || number.length < 4) return '****';
  return `**** **** **** ${number.slice(-4)}`;
};

const BookingInterface = ({ type, onClose }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);
  const [step, setStep] = useState(type === 'onsite' ? 1 : 0);
  const [vibrationMatched, setVibrationMatched] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subType, setSubType] = useState(type === 'onsite' ? 'visit' : 'live'); // 'visit', 'live', 'recorded'
  const [distance, setDistance] = useState('');
  const [blockedDates] = useState(JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]'));
  const [blockedSlots] = useState(JSON.parse(localStorage.getItem('aura_blocked_slots') || '{}'));
  const [existingBookings] = useState(JSON.parse(localStorage.getItem('aura_bookings') || '[]'));
  const [currentBooking, setCurrentBooking] = useState(null);

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

  const getAvailableSlots = () => {
    const dateStr = date.toDateString();
    const dayBookings = existingBookings.filter(b => b.date === dateStr);
    const dayBlockedSlots = blockedSlots[dateStr] || [];
    
    return timeSlots.filter(slot => 
      !dayBookings.some(b => b.time === slot) && 
      !dayBlockedSlots.includes(slot)
    );
  };

  const isDayBlocked = (d) => {
    return blockedDates.includes(d.toDateString());
  };

  const handleBooking = (paymentData) => {
    const sessionCode = type !== 'onsite' && subType === 'live' 
        ? Math.random().toString(36).substring(2, 8).toUpperCase() 
        : null;

    const booking = {
      id: Date.now(),
      type: type === 'onsite' ? 'On-Site Session' : `Portal Resonance (${subType === 'live' ? 'Live' : 'Recorded'})`,
      subType,
      date: date.toDateString(),
      time: subType === 'recorded' ? 'Instant Access' : time,
      client: { name, phone, email },
      status: subType === 'recorded' ? 'completed' : 'pending',
      sessionCode,
      created: new Date().toISOString(),
      paymentStatus: 'paid'
    };

    setCurrentBooking(booking);

    // Save booking
    const bookingsList = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    localStorage.setItem('aura_bookings', JSON.stringify([...bookingsList, booking]));
    
    // Save/Update client in archive
    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    const clientIdx = clients.findIndex(c => c.name.toLowerCase() === name.toLowerCase());
    const clientData = { 
        name, phone, email, lastBooking: booking.date,
        card: paymentData?.saveCard ? maskCardData(paymentData.number) : null 
    };
    
    if (clientIdx > -1) {
      clients[clientIdx] = clientData;
    } else {
      clients.push(clientData);
    }
    localStorage.setItem('aura_clients', JSON.stringify(clients));
    
    // Simulated email dispatch
    const emailSettings = JSON.parse(localStorage.getItem('aura_email_settings')) || { fromEmail: 'healing@reikiandsage.com', signature: 'Balance & Blessing, Carissa' };
    
    // Log Transaction
    logTransaction(
        'New Appointment',
        name,
        email,
        `${type} on ${date.toDateString()} at ${time}`
    );

    setStep(3);
  };

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <button onClick={onClose} className="booking-close">×</button>

        {step === 0 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 className="booking-header">Resonance Selection</h2>
            <div className="type-selector" style={{display: 'flex', gap: '10px', marginBottom: '2rem'}}>
                {type === 'onsite' ? (
                    <div className={`selection-card ${subType === 'visit' ? 'active' : ''}`} onClick={() => setSubType('visit')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                        <h4>On-Site Visit</h4>
                        <p style={{fontSize: '0.75rem', opacity: 0.7}}>Physical calibration at the Sanctuary.</p>
                    </div>
                ) : (
                    <>
                        <div className={`selection-card ${subType === 'live' ? 'active' : ''}`} onClick={() => setSubType('live')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                            <h4>Live Session</h4>
                            <p style={{fontSize: '0.75rem', opacity: 0.7}}>Video resonance with a live healer.</p>
                        </div>
                        <div className={`selection-card ${subType === 'recorded' ? 'active' : ''}`} onClick={() => setSubType('recorded')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                            <h4>Recorded Access</h4>
                            <p style={{fontSize: '0.75rem', opacity: 0.7}}>Instant vibrational archives.</p>
                        </div>
                    </>
                )}
            </div>

            <button 
              onClick={() => {
                setVibrationMatched(true);
                setTimeout(() => setStep(subType === 'recorded' ? 2 : 1), 1000);
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {vibrationMatched ? 'VIBRATION MATCHED ✓' : 'Confirm Resonance Mode'}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <h2 className="booking-header">{subType === 'visit' ? 'Sanctuary Availability' : 'Live Portal Timing'}</h2>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>Select an open window in the ether.</p>
            <Calendar 
              onChange={setDate} 
              value={date} 
              tileDisabled={({date}) => isDayBlocked(date)}
            />
            <div className="time-grid" style={{marginTop: '1.5rem'}}>
              {getAvailableSlots().length === 0 ? (
                <p style={{textAlign: 'center', color: '#e74c3c', width: '100%'}}>No available slots for this date.</p>
              ) : (
                getAvailableSlots().map(slot => (
                  <button 
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`time-slot ${time === slot ? 'selected' : ''}`}
                  >
                    {slot}
                  </button>
                ))
              )}
            </div>
            <button 
              disabled={!time || getAvailableSlots().length === 0}
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
            {subType === 'visit' && (
                <input 
                    type="number" placeholder="Distance from Sanctuary (miles)" value={distance} onChange={e => setDistance(e.target.value)}
                    className="booking-input"
                />
            )}
            <input 
              type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
              className="booking-input"
            />

            <div className="summary-card" style={{marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}>
              <p><strong>Service:</strong> {subType === 'visit' ? 'In-Person Healing' : (subType === 'live' ? 'Live Portal Session' : 'Recorded Access')}</p>
              {subType !== 'recorded' && (
                  <>
                    <p><strong>Date:</strong> {date.toDateString()}</p>
                    <p><strong>Time:</strong> {time}</p>
                  </>
              )}
              
              <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                {subType === 'visit' ? (
                   <>
                     <p style={{fontSize: '1.1rem'}}><strong>Total:</strong> ${(() => {
                        return localStorage.getItem('aura_onsite_price') || '150';
                     })()}</p>
                     <p style={{fontSize: '0.9rem', color: 'var(--accent-gold)'}}><strong>15% Deposit Required:</strong> ${(() => {
                        const total = parseInt(localStorage.getItem('aura_onsite_price') || '150');
                        return (total * 0.15).toFixed(2);
                     })()}</p>
                     <p style={{fontSize: '0.8rem', opacity: 0.7, fontStyle: 'italic'}}>Balance due on arrival at the Sanctuary.</p>
                   </>
                ) : subType === 'live' ? (
                   <p style={{fontSize: '1.1rem'}}><strong>Session Fee:</strong> ${localStorage.getItem('aura_video_price') || '88'}</p>
                ) : (
                   <p style={{fontSize: '1.1rem'}}><strong>Access Fee:</strong> ${(() => {
                        const savedPricing = JSON.parse(localStorage.getItem('aura_pricing') || '{}');
                        return savedPricing['1_month'] || 22;
                   })()}</p>
                )}
              </div>
            </div>

            {subType === 'visit' && parseInt(distance) > 50 && (
                <p style={{color: '#e74c3c', fontSize: '0.8rem', marginBottom: '1rem', marginTop: '1rem'}}>
                    *On-site visits are only available within a 50-mile radius. Please select "Portal Resonance" for remote healing.
                </p>
            )}

            <button 
              onClick={() => setStep(4)} // Proceed to payment
              disabled={!name || !phone || !email || (subType === 'visit' && parseInt(distance) > 50)}
              className="btn-primary"
              style={{width: '100%', marginTop: '1.5rem'}}
            >
              {subType === 'recorded' ? 'Proceed to Access' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
             <button onClick={() => setStep(2)} className="btn" style={{marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem'}}>← Back to Details</button>
             <BillingForm 
                buttonText={subType === 'visit' ? `Pay 15% Deposit ($${(parseInt(localStorage.getItem('aura_onsite_price') || '150') * 0.15).toFixed(2)})` : `Align with ${subType === 'live' ? 'Live Healer' : 'Archives'}`}
                onSubmit={(paymentData) => handleBooking(paymentData)}
             />
          </div>
        )}

        {step === 3 && (
          <div className="fade-in" style={{textAlign: 'center'}}>
            <div style={{fontSize: '4rem', margin: '1rem 0'}}>✨</div>
            <h2 style={{color: '#2ecc71'}}>Booking Confirmed!</h2>
            <p>Your session has been reserved in our system.</p>
            {currentBooking?.sessionCode && (
                <div className="glass" style={{padding: '1.5rem', margin: '1.5rem 0', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold)'}}>
                    <p style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem'}}>Your Video Portal session code:</p>
                    <h1 style={{color: 'var(--accent-gold)', letterSpacing: '5px'}}>{currentBooking.sessionCode}</h1>
                    <p style={{fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6}}>Keep this code ready for your session.</p>
                </div>
            )}
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
