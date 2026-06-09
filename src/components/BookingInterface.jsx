import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingInterface.css';
import { logTransaction } from '../utils/logger';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';

const BookingInterface = ({ type, onClose }) => {
  const { t } = useLanguage();
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(null);
  const [step, setStep] = useState(type === 'onsite' ? 1 : 0);
  const [vibrationMatched, setVibrationMatched] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subType, setSubType] = useState(type === 'onsite' ? 'visit' : 'live'); // 'visit' or 'live' only (recorded removed)
  const [distance, setDistance] = useState('');
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState({});
  const [existingBookings, setExistingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [onsitePrice, setOnsitePrice] = useState('150');
  const [videoPrice, setVideoPrice] = useState('88');

  // Load restrictions and settings from localStorage & Firestore
  useEffect(() => {
    const localBlockedDates = JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]');
    const localBlockedSlots = JSON.parse(localStorage.getItem('aura_blocked_slots') || '{}');
    const localBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    
    setBlockedDates(localBlockedDates);
    setBlockedSlots(localBlockedSlots);
    
    const normalizedLocalBookings = localBookings.map(b => ({
      id: b.id,
      date: b.date || b.bookingDate,
      time: b.time || b.bookingTime || b.timeSlot,
      status: b.status
    }));
    setExistingBookings(normalizedLocalBookings);

    // If Firebase is configured, fetch real-time availability, bookings, and pricing settings
    if (isFirebaseConfigured()) {
      db.getSettings('availability')
        .then(data => {
          if (data) {
            if (data.blockedDates) setBlockedDates(data.blockedDates);
            if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
          }
        })
        .catch(err => console.error("Error loading availability settings:", err));

      db.getAllBookings()
        .then(list => {
          if (list && list.length > 0) {
            // Map Firestore bookingDate and bookingTime keys to date and time fields expected in getAvailableSlots
            setExistingBookings(list.map(b => ({
              id: b.id,
              date: b.bookingDate || b.date,
              time: b.bookingTime || b.time || b.timeSlot,
              status: b.status
            })));
          }
        })
        .catch(err => console.error("Error loading bookings from Firestore:", err));

      db.getSettings('pricing')
        .then(data => {
          if (data) {
            if (data.onsitePrice) setOnsitePrice(data.onsitePrice);
            if (data.videoPrice) setVideoPrice(data.videoPrice);
          }
        })
        .catch(err => console.error("Error loading pricing settings:", err));
    } else {
      setOnsitePrice(localStorage.getItem('aura_onsite_price') || '150');
      setVideoPrice(localStorage.getItem('aura_video_price') || '88');
    }
  }, []);

  // Auto-fill logic for returning clients
  useEffect(() => {
    if (name.length > 2) {
      const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
      const match = clients.find(c => c.name.toLowerCase() === name.toLowerCase());
      if (match) {
        setPhone(match.phone);
        setEmail(match.email);
        toast.success(t('bookingToastWelcomeBack').replace('{name}', match.name));
      }
    }
  }, [name]);

  const timeSlots = [
    '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const getAvailableSlots = () => {
    const dateStr = date.toDateString();
    const dayBookings = existingBookings.filter(b => b.date === dateStr);
    const dayBlockedSlots = (blockedSlots[dateStr] || []).map(s => s.replace(/^0/, ''));
    
    return timeSlots.filter(slot => {
      const normalizedSlot = slot.replace(/^0/, '');
      return !dayBookings.some(b => (b.time || '').replace(/^0/, '') === normalizedSlot) && 
             !dayBlockedSlots.includes(normalizedSlot);
    });
  };

  const isDayBlocked = (d) => {
    return blockedDates.includes(d.toDateString());
  };

  const handleCheckoutRedirect = async () => {
    setLoading(true);
    toast.loading(t('bookingToastInitiating'));
    try {
      const priceVal = subType === 'visit' 
        ? parseInt(onsitePrice) 
        : parseInt(videoPrice);

      // Stripe expects amount in cents
      const priceCents = priceVal * 100;

      const response = await fetch('/api/create-booking-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serviceType: subType === 'visit' ? 'onsite' : 'live',
          price: priceCents,
          customerEmail: email,
          customerName: name,
          bookingDate: date.toDateString(),
          bookingTime: time,
          notes: `Phone: ${phone}${distance ? `, Distance: ${distance} miles` : ''}`
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to initiate payment");
      }

      const data = await response.json();
      toast.dismiss();
      
      // Save tentative booking info to localStorage for recovery/verification
      const tentativeBooking = {
        name, phone, email,
        serviceType: subType === 'visit' ? 'onsite' : 'live',
        date: date.toDateString(),
        time,
        price: priceVal,
        sessionId: data.sessionId
      };
      localStorage.setItem('tentative_booking', JSON.stringify(tentativeBooking));

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      toast.dismiss();
      toast.error(err.message || t('bookingToastFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-overlay">
      <div className="booking-modal">
        <button onClick={onClose} className="booking-close">×</button>

        {step === 0 && (
          <div className="fade-in" style={{ textAlign: 'center' }}>
            <h2 className="booking-header">{t('bookingHeaderResonance')}</h2>
            <div className="type-selector" style={{display: 'flex', gap: '10px', marginBottom: '2rem'}}>
                {type === 'onsite' ? (
                    <div className={`selection-card ${subType === 'visit' ? 'active' : ''}`} onClick={() => setSubType('visit')} style={{flex: 1, padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)'}}>
                        <h4>{t('bookingTypeOnsite')}</h4>
                        <p style={{fontSize: '0.75rem', opacity: 0.7, marginTop: '5px'}}>{t('bookingTypeOnsiteDesc')}</p>
                    </div>
                ) : (
                    <div className={`selection-card ${subType === 'live' ? 'active' : ''}`} onClick={() => setSubType('live')} style={{flex: 1, padding: '1.5rem', border: '1px solid var(--glass-border)', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.03)'}}>
                        <h4>{t('bookingTypeVideo')}</h4>
                        <p style={{fontSize: '0.75rem', opacity: 0.7, marginTop: '5px'}}>{t('bookingTypeVideoDesc')}</p>
                    </div>
                )}
            </div>

            <button 
              onClick={() => {
                setVibrationMatched(true);
                setTimeout(() => setStep(1), 1000);
              }}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              {vibrationMatched ? t('bookingVibrationMatched') : t('bookingConfirmResonance')}
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="fade-in">
            <h2 className="booking-header">{subType === 'visit' ? t('bookingHeaderAvailability') : t('bookingHeaderTiming')}</h2>
            <p style={{color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem'}}>{t('bookingSelectWindow')}</p>
            <Calendar 
              onChange={setDate} 
              value={date} 
              tileDisabled={({date}) => isDayBlocked(date)}
            />
            <div className="time-grid" style={{marginTop: '1.5rem'}}>
              {getAvailableSlots().length === 0 ? (
                <p style={{textAlign: 'center', color: '#e74c3c', width: '100%'}}>{t('bookingNoSlots')}</p>
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
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              {t('bookingContinue')}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <h2 className="booking-header">{t('bookingHeaderDetails')}</h2>
            <p style={{marginBottom: '1.5rem', opacity: 0.7, fontSize: '0.85rem'}}>{t('bookingDetailsDesc')}</p>
            
            <input 
              type="text" placeholder={t('bookingPlaceholderName')} value={name} onChange={e => setName(e.target.value)}
              className="booking-input"
            />
            <input 
              type="tel" placeholder={t('bookingPlaceholderPhone')} value={phone} onChange={e => setPhone(e.target.value)}
              className="booking-input"
            />
            {subType === 'visit' && (
                <input 
                    type="number" placeholder={t('bookingPlaceholderDistance')} value={distance} onChange={e => setDistance(e.target.value)}
                    className="booking-input"
                />
            )}
            <input 
              type="email" placeholder={t('bookingPlaceholderEmail')} value={email} onChange={e => setEmail(e.target.value)}
              className="booking-input"
            />

            <div className="summary-card" style={{marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)'}}>
              <p style={{fontSize: '0.9rem'}}><strong>{t('bookingSummaryService')}</strong> {subType === 'visit' ? t('bookingSummaryInPerson') : t('bookingSummaryVideo')}</p>
              <p style={{fontSize: '0.9rem'}}><strong>{t('bookingSummaryDate')}</strong> {date.toDateString()}</p>
              <p style={{fontSize: '0.9rem'}}><strong>{t('bookingSummaryTime')}</strong> {time}</p>
              
              <div style={{marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                {subType === 'visit' ? (
                   <>
                     <p style={{fontSize: '1.1rem', margin: 0}}><strong>{t('bookingSummaryTotalPrice')}</strong> ${onsitePrice}</p>
                     <p style={{fontSize: '0.95rem', color: 'var(--accent-gold)', margin: '5px 0 0 0'}}><strong>{t('bookingSummaryDeposit')}</strong> ${((parseInt(onsitePrice)) * 0.15).toFixed(2)}</p>
                     <p style={{fontSize: '0.78rem', opacity: 0.7, fontStyle: 'italic', marginTop: '5px'}}>{t('bookingSummaryBalanceNotice')}</p>
                   </>
                ) : (
                   <p style={{fontSize: '1.1rem', margin: 0}}><strong>{t('bookingSummaryTotalFee')}</strong> ${videoPrice}</p>
                )}
              </div>
            </div>

            {subType === 'visit' && parseInt(distance) > 50 && (
                <p style={{color: '#e74c3c', fontSize: '0.8rem', marginBottom: '1rem', marginTop: '1rem'}}>
                    {t('bookingDistanceError')}
                </p>
            )}

            {/* HIPAA Intake Disclaimer */}
            <div style={{ marginTop: '1.25rem', padding: '10px 12px', background: 'rgba(0,184,148,0.05)', border: '1px solid rgba(0,184,148,0.2)', borderRadius: '8px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', color: '#a8d8a8', margin: 0, lineHeight: '1.4' }}>
                <strong>{t('bookingHipaaLabel')}</strong> {t('bookingHipaaDesc')}
              </p>
            </div>

            <button 
              onClick={handleCheckoutRedirect} 
              disabled={!name || !phone || !email || (subType === 'visit' && parseInt(distance) > 50) || loading}
              className="btn-primary"
              style={{width: '100%', marginTop: '1.5rem'}}
            >
              {loading ? t('bookingRoutingStripe') : t('bookingProceedStripe')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingInterface;
