import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './BookingInterface.css';
import { isFirebaseConfigured, db } from '../lib/firebase';
import { useLanguage } from '../contexts/LanguageContext';
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in miles
};

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

  // Geocoding & Address states
  const [address, setAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [distanceError, setDistanceError] = useState('');
  const [waiverAccepted, setWaiverAccepted] = useState(false);

  const verifyAddress = async (addrQuery) => {
    if (!addrQuery.trim()) return;
    setGeocoding(true);
    setDistanceError('');
    setAddressVerified(false);
    try {
      const formattedQuery = /^\d{5}$/.test(addrQuery.trim()) ? `${addrQuery.trim()}, USA` : addrQuery.trim();
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(formattedQuery)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ReikiSageSanctuary/1.0'
          }
        }
      );
      if (!response.ok) throw new Error("Geocoding failed");
      const data = await response.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        
        const spaceNeedleLat = 47.6205;
        const spaceNeedleLon = -122.3493;
        
        const dist = calculateHaversineDistance(spaceNeedleLat, spaceNeedleLon, lat, lon);
        
        if (dist <= 50) {
          setDistance(dist.toFixed(1));
          setAddressVerified(true);
          toast.success(`Address verified: ${dist.toFixed(1)} miles from Seattle.`);
        } else {
          setDistance(dist.toFixed(1));
          setDistanceError(`Out of Range: Your location is ${dist.toFixed(1)} miles away. Max limit is 50 miles.`);
          toast.error("Address is outside our 50-mile service radius.");
        }
      } else {
        setDistanceError("Address not found. Please try a more specific address including city and zip code.");
        toast.error("Address verification failed.");
      }
    } catch (err) {
      console.error(err);
      setDistanceError("Verification service temporarily unavailable. Please enter your address again.");
    } finally {
      setGeocoding(false);
    }
  };

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
  }, [name, t]);

  const timeSlots = [
    '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'
  ];

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return 0;
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const getTravelBuffer = (miles) => {
    if (!miles) return 0;
    const roadMiles = parseFloat(miles) * 1.3;
    return Math.round((roadMiles / 30) * 60 + 15);
  };

  const getAvailableSlots = () => {
    const dateStr = date.toDateString();
    const dayBookings = existingBookings.filter(b => b.date === dateStr);
    const dayBlockedSlots = (blockedSlots[dateStr] || []).map(s => s.replace(/^0/, ''));
    
    const currentIsOnsite = subType === 'visit';
    const currentBuffer = currentIsOnsite ? getTravelBuffer(distance) : 0;

    return timeSlots.filter(slot => {
      const normalizedSlot = slot.replace(/^0/, '');
      if (dayBlockedSlots.includes(normalizedSlot)) return false;

      const slotStart = parseTimeToMinutes(normalizedSlot);
      const slotEnd = slotStart + 60; // Assume 1-hour sessions

      // Check conflicts with all existing bookings on the same day
      for (const b of dayBookings) {
        const bTime = (b.time || '').replace(/^0/, '');
        const bStart = parseTimeToMinutes(bTime);
        const bEnd = bStart + 60;

        // Determine if existing booking is on-site and its buffer
        const bIsOnsite = b.serviceType === 'onsite' || b.type?.toLowerCase().includes('visit') || (b.notes && b.notes.toLowerCase().includes('address'));
        let bDistance = 0;
        if (b.notes) {
          const matchDist = b.notes.match(/Distance:\s*([\d.]+)\s*miles/i);
          if (matchDist) bDistance = parseFloat(matchDist[1]);
        }
        const bBuffer = bIsOnsite ? getTravelBuffer(bDistance) : 0;

        // Calculate required separation
        const requiredSeparation = currentIsOnsite && bIsOnsite
          ? currentBuffer + bBuffer
          : (currentIsOnsite ? currentBuffer : bBuffer);

        // Check if there is enough time between the two slots
        if (slotStart >= bStart) {
          const separation = slotStart - bEnd;
          if (separation < requiredSeparation) return false;
        } else {
          const separation = bStart - slotEnd;
          if (separation < requiredSeparation) return false;
        }
      }

      return true;
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

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'begin_checkout', {
          value: priceVal,
          currency: 'USD',
          items: [{
            item_id: subType === 'visit' ? 'onsite_session' : 'live_session',
            item_name: subType === 'visit' ? 'On-Site Healing Session' : 'Live Video Portal Session',
            price: priceVal,
            quantity: 1
          }]
        });
      }

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
          notes: `Phone: ${phone}${distance ? `, Distance: ${distance} miles` : ''}${address ? `, Address: ${address}` : ''}`
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
        name, phone, email, address,
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
            <h2 className="booking-header">{subType === 'visit' ? 'In-Person Healer Search & Scheduling' : t('bookingHeaderTiming')}</h2>
            
            {/* ZIP Code & Proximity Matchmaker */}
            <div className="glass" style={{ padding: '1rem', borderRadius: '16px', border: '1px solid var(--accent-gold)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                📍 Find Healers In Your Area (Seattle Metro & Global Distance)
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="Enter ZIP code or city (e.g. 98101, Bellevue, Seattle)..."
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (e.target.value.length >= 5) {
                      verifyAddress(e.target.value);
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '0.65rem 1rem',
                    borderRadius: '10px',
                    background: 'rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
                <button
                  onClick={() => verifyAddress(address || '98101')}
                  disabled={geocoding}
                  style={{
                    background: 'var(--accent-gold)',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#000',
                    fontWeight: 'bold',
                    padding: '0 1rem',
                    cursor: 'pointer',
                    fontSize: '0.82rem'
                  }}
                >
                  {geocoding ? 'Searching...' : 'Search Nearby'}
                </button>
              </div>

              {/* Seattle Quick Neighborhood Clusters */}
              <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {[
                  { label: '📍 Capitol Hill (98101)', zip: '98101, Seattle, WA' },
                  { label: '📍 Eastside / Bellevue (98004)', zip: '98004, Bellevue, WA' },
                  { label: '📍 North Sound / Ballard (98107)', zip: '98107, Seattle, WA' },
                  { label: '📍 South Sound / Tacoma (98402)', zip: '98402, Tacoma, WA' }
                ].map(cluster => (
                  <button
                    key={cluster.zip}
                    onClick={() => {
                      setAddress(cluster.zip);
                      verifyAddress(cluster.zip);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.8)',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {cluster.label}
                  </button>
                ))}
              </div>

              {addressVerified && (
                <div style={{ fontSize: '0.78rem', color: '#50e3c2', marginTop: '0.5rem' }}>
                  ✓ Match verified: {distance} miles from your location. Local practitioners ready.
                </div>
              )}
              {distanceError && (
                <div style={{ fontSize: '0.78rem', color: '#ff7675', marginTop: '0.5rem' }}>
                  {distanceError}
                </div>
              )}
            </div>

            {/* Timezone Autoconversion Banner */}
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              🌍 Slots automatically displayed in your local timezone: <strong>{Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Los_Angeles'}</strong>
            </div>

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
                    onClick={async () => {
                      setTime(slot);
                      toast.loading('Granting 10-minute slot hold lock...', { id: 'lock_toast' });
                      
                      // Dispatch Atomic Slot Hold Lock (Prevents Double Booking)
                      try {
                        const res = await fetch('/api/db/bookings', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            action: 'RESERVE_LOCK',
                            healerId: 'carissabright@gmail.com',
                            slotStartTime: `${date.toDateString()} ${slot}`,
                            customerEmail: email || 'seeker@reikiandsage.com'
                          })
                        });
                        if (res.ok) {
                          toast.success('🔒 10-Minute Hold Lock Granted. Slot reserved for you.', { id: 'lock_toast' });
                        } else {
                          toast.dismiss('lock_toast');
                        }
                      } catch {
                        toast.dismiss('lock_toast');
                      }
                    }}
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
              id="booking-name-input"
              name="name"
              type="text" placeholder={t('bookingPlaceholderName')} value={name} onChange={e => setName(e.target.value)}
              className="booking-input"
            />
            <input 
              id="booking-phone-input"
              name="phone"
              type="tel" placeholder={t('bookingPlaceholderPhone')} value={phone} onChange={e => setPhone(e.target.value)}
              className="booking-input"
            />
            {subType === 'visit' && (
              <div style={{ marginBottom: '1rem' }}>
                <input 
                  id="booking-address-input"
                  name="address"
                  type="text" 
                  placeholder={t('bookingPlaceholderAddress')} 
                  value={address} 
                  onChange={e => setAddress(e.target.value)}
                  onBlur={() => verifyAddress(address)}
                  className="booking-input"
                  style={{ marginBottom: '0.5rem' }}
                />
                {geocoding && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', margin: '0 0 0.5rem 0' }}>
                    ⏳ {t('bookingVerifyingAddress')}
                  </p>
                )}
                {addressVerified && !geocoding && (
                  <p style={{ fontSize: '0.8rem', color: '#2ecc71', margin: '0 0 0.5rem 0' }}>
                    ✓ {t('bookingAddressVerified').replace('{distance}', distance)}
                  </p>
                )}
                {distanceError && !geocoding && (
                  <p style={{ fontSize: '0.8rem', color: '#e74c3c', margin: '0 0 0.5rem 0' }}>
                    ⚠ {distanceError}
                  </p>
                )}
              </div>
            )}
            <input 
              id="booking-email-input"
              name="email"
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

            {/* Liability Waiver Checkbox */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '10px', 
              marginTop: '1.25rem', 
              padding: '10px 12px', 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid rgba(255,255,255,0.08)', 
              borderRadius: '8px', 
              textAlign: 'left' 
            }}>
              <input 
                id="booking-waiver-checkbox"
                type="checkbox" 
                checked={waiverAccepted}
                onChange={e => setWaiverAccepted(e.target.checked)}
                style={{ marginTop: '3px', cursor: 'pointer' }}
              />
              <label 
                htmlFor="booking-waiver-checkbox"
                style={{ fontSize: '0.75rem', opacity: 0.8, cursor: 'pointer', userSelect: 'none', lineHeight: '1.4' }}
              >
                {t('bookingWaiverText')}
              </label>
            </div>

            {/* HIPAA Intake Disclaimer */}
            <div style={{ marginTop: '1.25rem', padding: '10px 12px', background: 'rgba(0,184,148,0.05)', border: '1px solid rgba(0,184,148,0.2)', borderRadius: '8px', textAlign: 'left' }}>
              <p style={{ fontSize: '0.7rem', color: '#a8d8a8', margin: 0, lineHeight: '1.4' }}>
                <strong>{t('bookingHipaaLabel')}</strong> {t('bookingHipaaDesc')}
              </p>
            </div>

            <button 
              onClick={handleCheckoutRedirect} 
              disabled={
                !name || 
                !phone || 
                !email || 
                (subType === 'visit' && (!addressVerified || parseFloat(distance) > 50)) || 
                !waiverAccepted || 
                loading
              }
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
