import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingInterface.css';
import { logTransaction } from '../utils/logger';
import ActionButler from '../utils/actionButler';
import PaymentLedger from '../utils/paymentLedger';
import BillingForm, { maskCardData } from './BillingForm';

const BookingInterface = ({ type, onClose, user }) => {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);
  const [step, setStep] = useState(type === 'onsite' ? 1 : 0);
  const [vibrationMatched, setVibrationMatched] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const [subType, setSubType] = useState(type === 'onsite' ? 'visit' : (type === 'circle' ? 'circle' : 'live'));
  const [distance, setDistance] = useState('');
  const [includePet, setIncludePet] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  // Separate storage keys for each service
  const BOOKING_KEY = 'aura_bookings';        // Portable Resonance + On-Site
  const CIRCLE_KEY = 'aura_circle_events';    // Community Circle (separate)
  const storageKey = type === 'circle' ? CIRCLE_KEY : BOOKING_KEY;

  const [blockedDates] = useState(JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]'));
  const [blockedSlots] = useState(JSON.parse(localStorage.getItem('aura_blocked_slots') || '{}'));
  const [existingBookings] = useState(JSON.parse(localStorage.getItem(storageKey) || '[]'));
  const [currentBooking, setCurrentBooking] = useState(null);

  // Pet portfolio from user data
  const userPets = JSON.parse(localStorage.getItem(`aura_pets_${user?.email}`) || '[]');

  // Subscription gate for Community Circle
  const isHealingTier = user?.subscription === 'healing' || user?.subscription === '3_month' || user?.subscription === '6_month' || user?.subscription === '12_month';

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

  // Community Circle has different time slots (group sessions)
  const circleTimeSlots = [
    '11:00 AM', '2:00 PM', '6:00 PM', '7:30 PM'
  ];

  const getAvailableSlots = () => {
    const dateStr = date.toDateString();
    const dayBookings = existingBookings.filter(b => b.date === dateStr);
    const dayBlockedSlots = blockedSlots[dateStr] || [];
    const slots = type === 'circle' ? circleTimeSlots : timeSlots;
    
    return slots.filter(slot => 
      !dayBookings.some(b => b.time === slot) && 
      !dayBlockedSlots.includes(slot)
    );
  };

  const isDayBlocked = (d) => {
    return blockedDates.includes(d.toDateString());
  };

  // Generate service-specific codes
  const generateSessionCode = () => {
    const prefix = type === 'circle' ? 'CC' : 'PR';
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${code}`;
  };

  // ─── Pricing helpers ───
  const getBookingAmount = () => {
    if (type === 'circle') return 0; // included in subscription
    if (subType === 'visit') {
      const total = parseInt(localStorage.getItem('aura_onsite_price') || '150');
      return parseFloat((total * 0.15).toFixed(2)); // 15% deposit
    }
    if (subType === 'live') return parseFloat(localStorage.getItem('aura_video_price') || '88');
    // recorded
    const savedPricing = JSON.parse(localStorage.getItem('aura_pricing') || '{}');
    return parseFloat(savedPricing['1_month'] || 22);
  };

  const getBookingServiceName = () => {
    if (type === 'circle') return 'Community Circle (Included)';
    if (subType === 'visit') return 'On-Site Alignment — 15% Deposit';
    if (subType === 'live') return 'Portable Resonance — Live 1-on-1';
    return 'Portable Resonance — Recorded Access';
  };

  const handleBooking = (paymentData) => {
    const needsCode = (type === 'portal' && subType === 'live') || type === 'circle';
    const sessionCode = needsCode ? generateSessionCode() : null;

    const serviceLabel = type === 'circle' 
      ? 'Community Circle' 
      : type === 'onsite' 
        ? 'On-Site Alignment' 
        : `Portable Resonance (${subType === 'live' ? 'Live' : 'Recorded'})`;

    // ─── Record in Payment Ledger ───
    const bookingAmount = getBookingAmount();
    const txnType = type === 'circle' ? 'booking_circle' 
      : type === 'onsite' ? 'booking_onsite' 
      : 'booking_portal';

    let txn;
    if (type === 'circle') {
      txn = PaymentLedger.recordZeroTransaction({
        email,
        type: txnType,
        description: `${serviceLabel} — ${date.toDateString()} at ${time}`,
        metadata: { sessionCode, date: date.toDateString(), time }
      });
    } else {
      txn = PaymentLedger.recordTransaction({
        email,
        type: txnType,
        description: `${serviceLabel} — ${date.toDateString()}${time ? ` at ${time}` : ''}`,
        subtotal: bookingAmount,
        paymentMethod: paymentData?.paymentMethod || 'Card •••• ****',
        metadata: { sessionCode, date: date.toDateString(), time, subType }
      });
    }

    const booking = {
      id: Date.now(),
      type: serviceLabel,
      subType,
      date: date.toDateString(),
      time: subType === 'recorded' ? 'Instant Access' : time,
      client: { name, phone, email },
      status: subType === 'recorded' ? 'completed' : 'pending',
      sessionCode,
      created: new Date().toISOString(),
      paymentStatus: 'paid',
      transactionId: txn.id,
      receiptId: txn.receiptId,
      amountPaid: txn.total,
      includePet,
      petInfo: includePet && selectedPet ? { name: selectedPet.name, type: selectedPet.type } : null
    };

    setCurrentBooking(booking);

    // Save to the correct storage key
    const bookingsList = JSON.parse(localStorage.getItem(storageKey) || '[]');
    localStorage.setItem(storageKey, JSON.stringify([...bookingsList, booking]));
    
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
    
    // Log Transaction
    logTransaction('New Appointment', name, email, `${serviceLabel} on ${date.toDateString()} at ${time}`);

    // ActionButler dispatch
    ActionButler.dispatch(email, {
      category: 'session',
      type: type === 'circle' ? 'community_circle_booked' : (type === 'onsite' ? 'onsite_booked' : 'portable_resonance_booked'),
      description: `Booked ${serviceLabel}${includePet ? ` (with pet: ${selectedPet?.name})` : ''}`,
      metadata: { serviceType: type, date: booking.date, time: booking.time, sessionCode, includePet, petInfo: booking.petInfo }
    });

    setStep(3);
  };

  // ─── Community Circle Subscription Gate ───
  if (type === 'circle' && !isHealingTier) {
    return (
      <div className="booking-overlay">
        <div className="booking-modal">
          <button onClick={onClose} className="booking-close">×</button>
          <div className="fade-in" style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔒</div>
            <h2 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Community Circle</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2rem', lineHeight: 1.7 }}>
              Community Circle is a sacred space for Healing subscribers to connect through shared stories, 
              group healing sessions, and spiritual activities. Upgrade to a Healing tier to join.
            </p>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(212,175,55,0.2)' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.5rem' }}>What you'll get:</p>
              <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
                <li style={{ marginBottom: '0.5rem' }}>🌐 Group video sessions with fellow seekers</li>
                <li style={{ marginBottom: '0.5rem' }}>📖 Share and hear healing stories</li>
                <li style={{ marginBottom: '0.5rem' }}>🧘 Suggested spiritual activities</li>
                <li style={{ marginBottom: '0.5rem' }}>💫 Guided group meditations</li>
                <li>🤝 Build lasting spiritual connections</li>
              </ul>
            </div>
            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              Return & Explore Healing Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <button onClick={onClose} className="booking-close">×</button>

        {step === 0 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 className="booking-header">
              {type === 'circle' ? 'Community Circle Sign-Up' : 'Resonance Selection'}
            </h2>

            {type === 'circle' ? (
              /* Community Circle — no sub-type selection needed */
              <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', marginBottom: '2rem', textAlign: 'left', border: '1px solid rgba(46,204,113,0.2)' }}>
                <p style={{ fontSize: '0.9rem', color: '#2ecc71', fontWeight: '600', marginBottom: '0.5rem' }}>🌐 Community Circle</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Join a group video session with fellow Healing members. Share stories, participate in guided activities, 
                  and connect spiritually with your community. Select a day and time below.
                </p>
              </div>
            ) : (
              /* Portable Resonance — sub-type selection */
              <div className="type-selector" style={{display: 'flex', gap: '10px', marginBottom: '2rem'}}>
                {type === 'onsite' ? (
                  <div className={`selection-card ${subType === 'visit' ? 'active' : ''}`} onClick={() => setSubType('visit')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                    <h4>On-Site Visit</h4>
                    <p style={{fontSize: '0.75rem', opacity: 0.7}}>Physical calibration at the Sanctuary. You & your pet welcome.</p>
                  </div>
                ) : (
                  <>
                    <div className={`selection-card ${subType === 'live' ? 'active' : ''}`} onClick={() => setSubType('live')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                      <h4>Live 1-on-1</h4>
                      <p style={{fontSize: '0.75rem', opacity: 0.7}}>Private video with Carissa or a healer. Pets welcome.</p>
                    </div>
                    <div className={`selection-card ${subType === 'recorded' ? 'active' : ''}`} onClick={() => setSubType('recorded')} style={{flex: 1, padding: '1rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer'}}>
                      <h4>Recorded Access</h4>
                      <p style={{fontSize: '0.75rem', opacity: 0.7}}>Instant vibrational archives.</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <button 
              onClick={() => {
                setVibrationMatched(true);
                setTimeout(() => setStep(subType === 'recorded' ? 2 : 1), 1000);
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {vibrationMatched ? 'VIBRATION MATCHED ✓' : (type === 'circle' ? 'Choose Date & Time' : 'Confirm Resonance Mode')}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <h2 className="booking-header">
              {type === 'circle' ? 'Community Circle Schedule' : subType === 'visit' ? 'Sanctuary Availability' : 'Live Portal Timing'}
            </h2>
            <p style={{color: '#666', marginBottom: '1.5rem'}}>
              {type === 'circle' ? 'Select a community gathering time.' : 'Select an open window in the ether.'}
            </p>
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

            {/* Pet inclusion — On-Site + Portable Resonance */}
            {(type === 'onsite' || (type === 'portal' && subType === 'live')) && (
              <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={includePet} 
                    onChange={e => { setIncludePet(e.target.checked); if (!e.target.checked) setSelectedPet(null); }}
                    style={{ accentColor: 'var(--accent-gold)' }}
                  />
                  🐾 Include my pet in this session
                </label>
                {includePet && (
                  <div style={{ marginTop: '0.75rem', paddingLeft: '1.5rem' }}>
                    {userPets.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {userPets.map(pet => (
                          <button
                            key={pet.id}
                            onClick={() => setSelectedPet(pet)}
                            style={{
                              padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem',
                              background: selectedPet?.id === pet.id ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                              border: selectedPet?.id === pet.id ? '1px solid var(--accent-gold)' : '1px solid rgba(255,255,255,0.08)',
                              color: selectedPet?.id === pet.id ? 'var(--accent-gold)' : 'rgba(255,255,255,0.5)'
                            }}
                          >
                            {pet.name} ({pet.type})
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                        No pets registered yet. Add a pet in your dashboard first!
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="summary-card" style={{marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px'}}>
              <p><strong>Service:</strong> {
                type === 'circle' ? 'Community Circle (Group Video)' :
                subType === 'visit' ? 'On-Site Alignment (In-Person)' : 
                (subType === 'live' ? 'Portable Resonance (1-on-1 Live)' : 'Recorded Access')
              }</p>
              {subType !== 'recorded' && (
                  <>
                    <p><strong>Date:</strong> {date.toDateString()}</p>
                    <p><strong>Time:</strong> {time}</p>
                  </>
              )}
              {includePet && selectedPet && (
                <p><strong>Pet:</strong> 🐾 {selectedPet.name} ({selectedPet.type})</p>
              )}
              
              <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                {type === 'circle' ? (
                  <p style={{fontSize: '1.1rem', color: '#2ecc71'}}><strong>Included with Healing subscription</strong></p>
                ) : subType === 'visit' ? (
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
                    *On-site visits are only available within a 50-mile radius. Please select "Portable Resonance" for remote healing.
                </p>
            )}

            <button 
              onClick={() => type === 'circle' ? handleBooking(null) : setStep(4)}
              disabled={!name || !phone || !email || (subType === 'visit' && parseInt(distance) > 50) || (includePet && !selectedPet && userPets.length > 0)}
              className="btn-primary"
              style={{width: '100%', marginTop: '1.5rem'}}
            >
              {type === 'circle' ? 'Join Community Circle' : subType === 'recorded' ? 'Proceed to Access' : 'Proceed to Payment'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="fade-in">
             <button onClick={() => setStep(2)} className="btn" style={{marginBottom: '1rem', padding: '0.5rem 1rem', fontSize: '0.8rem'}}>← Back to Details</button>
             <BillingForm 
                amount={getBookingAmount()}
                serviceName={getBookingServiceName()}
                serviceType={type}
                buttonText={subType === 'visit' ? 'Pay Deposit' : subType === 'live' ? 'Pay & Book Session' : 'Purchase Access'}
                onSubmit={(paymentData) => handleBooking(paymentData)}
             />
          </div>
        )}

        {step === 3 && (
          <div className="fade-in" style={{textAlign: 'center'}}>
            <div style={{fontSize: '4rem', margin: '1rem 0'}}>{type === 'circle' ? '🌐' : '✨'}</div>
            <h2 style={{color: '#2ecc71'}}>
              {type === 'circle' ? 'Circle Session Reserved!' : 'Payment Confirmed!'}
            </h2>
            <p>{type === 'circle' ? 'You\'re signed up for the Community Circle.' : 'Your session has been reserved and payment processed.'}</p>
            
            {/* Receipt Card */}
            {currentBooking?.receiptId && (
              <div className="glass" style={{ padding: '1.2rem', margin: '1rem 0', background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '16px', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>Receipt</span>
                  <span style={{ fontSize: '0.75rem', color: '#2ecc71', fontFamily: 'monospace' }}>{currentBooking.receiptId}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>{currentBooking.type}</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-gold)', fontWeight: '600' }}>${(currentBooking.amountPaid || 0).toFixed(2)}</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  Transaction ID: {currentBooking.transactionId}
                </div>
              </div>
            )}

            {currentBooking?.sessionCode && (
                <div className="glass" style={{padding: '1.5rem', margin: '1rem 0', background: type === 'circle' ? 'rgba(46,204,113,0.1)' : 'rgba(212, 175, 55, 0.1)', border: `1px solid ${type === 'circle' ? '#2ecc71' : 'var(--accent-gold)'}`}}>
                    <p style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.5rem'}}>
                      {type === 'circle' ? 'Your Community Circle access code:' : 'Your Video Portal session code:'}
                    </p>
                    <h1 style={{color: type === 'circle' ? '#2ecc71' : 'var(--accent-gold)', letterSpacing: '5px'}}>{currentBooking.sessionCode}</h1>
                    <p style={{fontSize: '0.75rem', marginTop: '0.5rem', opacity: 0.6}}>Keep this code ready for your session.</p>
                </div>
            )}
            {currentBooking?.petInfo && (
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                🐾 <strong>{currentBooking.petInfo.name}</strong> is registered for this session
              </p>
            )}
            <p>A confirmation has been sent to <strong>{email}</strong>.</p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.5rem' }}>
              This is a wellness service receipt. No protected health information is included (HIPAA compliant).
            </p>
            <p style={{marginTop: '1.5rem', fontStyle: 'italic', color: '#888', fontSize: '0.85rem'}}>
              {type === 'circle' ? '"Together we heal. Together we grow."' : '"The universe has aligned this time for you."'}
            </p>
            <button 
              onClick={onClose}
              className="btn-primary"
              style={{background: '#2ecc71', marginTop: '1.5rem'}}
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
