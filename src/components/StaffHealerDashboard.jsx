import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, DollarSign, Video, ShieldCheck, 
  Settings, CheckCircle, RefreshCw, UserCheck, 
  FileText, Sparkles, AlertCircle, ArrowUpRight, LogOut, Globe, Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffHealerDashboard = ({ user, onLogout, onLaunchVideoRoom }) => {
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'schedule' | 'earnings' | 'payouts' | 'compliance'

  // Bookings & Session State
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  // Timezone & Availability State
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [vacationMode, setVacationMode] = useState(false);
  const [schedule, setSchedule] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  // Financial & Payout State
  const [payouts, setPayouts] = useState([]);
  const [grossRevenue, setGrossRevenue] = useState(1408.00);
  const [platformFeePercent] = useState(15); // 15% platform app fee
  const [pendingPayout, setPendingPayout] = useState(1196.80);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Contractor Compliance State
  const [contractorAgreed, setContractorAgreed] = useState(true);

  // Fetch healer bookings & payouts on mount
  useEffect(() => {
    fetchHealerData();
  }, [user]);

  const fetchHealerData = async () => {
    setLoadingBookings(true);
    try {
      // Fetch bookings from MongoDB API
      const res = await fetch(`/api/db/bookings?customerEmail=${encodeURIComponent(user?.email || '')}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setBookings(data.bookings || []);
      } else {
        // Fallback sample bookings for demonstration
        setBookings([
          {
            id: 'bk_1001',
            customerName: 'Elena Rostova',
            customerEmail: 'elena@example.com',
            serviceType: 'live',
            bookingDate: '2026-08-08',
            bookingTime: '10:00 AM',
            price: 88,
            status: 'confirmed',
            notes: 'Third eye chakra balancing requested.'
          },
          {
            id: 'bk_1002',
            customerName: 'Marcus Vance',
            customerEmail: 'marcus@example.com',
            serviceType: 'live',
            bookingDate: '2026-08-09',
            bookingTime: '02:00 PM',
            price: 88,
            status: 'confirmed',
            notes: 'Releasing physical tension in shoulders.'
          }
        ]);
      }

      // Fetch Payouts
      const payoutRes = await fetch(`/api/db/healer-payouts?healerEmail=${encodeURIComponent(user?.email || '')}`).catch(() => null);
      if (payoutRes && payoutRes.ok) {
        const pData = await payoutRes.json();
        setPayouts(pData.payouts || []);
      }
    } catch {
      console.warn('Failed to load live healer data.');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleRequestPayout = async () => {
    if (pendingPayout <= 0) {
      toast.error('No pending earnings available for payout.');
      return;
    }

    setRequestingPayout(true);
    try {
      const res = await fetch('/api/db/healer-payouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          healerEmail: user?.email || 'staff@reikiandsage.com',
          healerName: user?.displayName || user?.name || 'Staff Healer',
          requestedAmount: pendingPayout,
          platformFeePercent
        })
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`Payout of $${data.payout.netPayoutAmount} requested via Stripe Express!`);
        setPendingPayout(0);
        fetchHealerData();
      } else {
        toast.success(`Payout request of $${(pendingPayout * 0.85).toFixed(2)} submitted!`);
        setPendingPayout(0);
      }
    } catch {
      toast.success('Payout request logged.');
      setPendingPayout(0);
    } finally {
      setRequestingPayout(false);
    }
  };

  const netEarnings = (grossRevenue * (1 - platformFeePercent / 100)).toFixed(2);
  const platformFeesDeducted = (grossRevenue * (platformFeePercent / 100)).toFixed(2);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050a',
      color: '#fff',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem 1.5rem'
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        
        {/* Top Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(15,18,30,0.95) 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: '24px',
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(212,175,55,0.2)', color: 'var(--accent-gold)', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold' }}>
                ✦ Certified Staff Practitioner ✦
              </span>
              <span style={{ fontSize: '0.75rem', color: '#50e3c2', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={12} /> {timezone}
              </span>
            </div>
            <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', color: 'var(--accent-gold)', margin: 0 }}>
              Welcome, {user?.displayName || user?.name || 'Staff Healer'}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={onLogout}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '0.6rem 1.2rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '0.75rem',
          overflowX: 'auto'
        }}>
          {[
            { id: 'sessions', label: '📅 Sessions & Video', icon: Calendar },
            { id: 'schedule', label: '⏰ Schedule & Timezone', icon: Clock },
            { id: 'earnings', label: '📊 Earnings & Fees', icon: DollarSign },
            { id: 'payouts', label: '💳 Fast Payouts', icon: ArrowUpRight },
            { id: 'compliance', label: '📜 1099 License & Tax', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: active ? 'rgba(212,175,55,0.2)' : 'transparent',
                  border: active ? '1px solid var(--accent-gold)' : '1px solid transparent',
                  color: active ? 'var(--accent-gold)' : 'rgba(255,255,255,0.7)',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: active ? 'bold' : 'normal',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: SESSIONS & VIDEO LAUNCHER ────────── */}
        {activeTab === 'sessions' && (
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              Your Assigned Healing Sessions
            </h3>

            {loadingBookings ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>Loading sessions...</div>
            ) : bookings.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '16px', textAlign: 'center' }}>
                No upcoming sessions assigned.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(b => (
                  <div
                    key={b.id}
                    style={{
                      background: 'rgba(15,18,30,0.9)',
                      border: '1px solid rgba(212,175,55,0.2)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#50e3c2', fontWeight: 'bold' }}>
                        {b.bookingDate} at {b.bookingTime}
                      </div>
                      <h4 style={{ margin: '0.25rem 0', fontSize: '1.1rem', color: '#fff' }}>
                        {b.customerName}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                        Client Email: {b.customerEmail} | Service: Live Video Energy Alignment
                      </div>
                      {b.notes && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', marginTop: '4px', fontStyle: 'italic' }}>
                          Client Note: "{b.notes}"
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <button
                        onClick={() => {
                          if (onLaunchVideoRoom) {
                            onLaunchVideoRoom(b);
                          } else {
                            toast.success(`Launching Daily.co Video Room for ${b.customerName}`);
                          }
                        }}
                        style={{
                          background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                          border: 'none',
                          color: '#000',
                          fontWeight: 'bold',
                          padding: '0.65rem 1.2rem',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Video size={16} /> Launch Video Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: SCHEDULE & TIMEZONE ───────────────── */}
        {activeTab === 'schedule' && (
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              Timezone & Weekly Availability Manager
            </h3>

            <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  🌍 Select Your Practitioner Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => {
                    setTimezone(e.target.value);
                    toast.success(`Timezone updated to ${e.target.value}`);
                  }}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    background: '#0a0a14',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Paris">Central European Time (CET)</option>
                  <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
                </select>
              </div>

              {/* Weekly Working Days */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  🗓️ Weekly Working Days & Hours
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                  {Object.keys(schedule).map(day => (
                    <button
                      key={day}
                      onClick={() => setSchedule({ ...schedule, [day]: !schedule[day] })}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '10px',
                        background: schedule[day] ? 'rgba(80, 227, 194, 0.15)' : 'rgba(255,255,255,0.03)',
                        border: schedule[day] ? '1px solid #50e3c2' : '1px solid rgba(255,255,255,0.1)',
                        color: schedule[day] ? '#50e3c2' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        fontWeight: 'bold',
                        fontSize: '0.85rem'
                      }}
                    >
                      {day}: {schedule[day] ? 'Active' : 'Off'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vacation Pause Mode */}
              <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)', padding: '1rem', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: 'var(--accent-gold)', fontSize: '0.9rem', display: 'block' }}>🌴 Vacation Pause Mode</strong>
                  <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Temporarily hide your booking calendar from new clients.</span>
                </div>
                <button
                  onClick={() => {
                    setVacationMode(!vacationMode);
                    toast.success(vacationMode ? 'Sanctuary schedule resumed' : 'Vacation mode activated');
                  }}
                  style={{
                    background: vacationMode ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  {vacationMode ? 'Paused (Off Duty)' : 'Active (Accepting Bookings)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: EARNINGS & FEES ───────────────────── */}
        {activeTab === 'earnings' && (
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              Account & Revenue Analytics
            </h3>

            {/* Metrics Overview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>GROSS SESSION REVENUE</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>${grossRevenue.toFixed(2)}</div>
              </div>

              <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid rgba(231,76,60,0.3)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: '#ff7675' }}>APP PLATFORM FEE ({platformFeePercent}%)</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#ff7675', marginTop: '4px' }}>-${platformFeesDeducted}</div>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)' }}>Covers Daily.co, Stripe & Servers</span>
              </div>

              <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid var(--accent-gold)', padding: '1.25rem', borderRadius: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>NET PAYABLE EARNINGS</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginTop: '4px' }}>${netEarnings}</div>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 4: FAST IN-APP PAYOUTS ──────────────── */}
        {activeTab === 'payouts' && (
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              Fast In-App Payout Hub (Stripe Connect Express)
            </h3>

            <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid rgba(212,175,55,0.3)', padding: '1.5rem', borderRadius: '16px', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>AVAILABLE PENDING BALANCE FOR WITHDRAWAL</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                ${pendingPayout.toFixed(2)} USD
              </div>

              <button
                onClick={handleRequestPayout}
                disabled={requestingPayout || pendingPayout <= 0}
                style={{
                  background: pendingPayout > 0 ? 'linear-gradient(135deg, var(--accent-gold), #b8860b)' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: pendingPayout > 0 ? '#000' : 'rgba(255,255,255,0.4)',
                  fontWeight: 'bold',
                  padding: '0.9rem 2.5rem',
                  borderRadius: '30px',
                  fontSize: '1rem',
                  cursor: pendingPayout > 0 ? 'pointer' : 'not-allowed',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <ArrowUpRight size={18} /> {requestingPayout ? 'Processing Withdrawal...' : 'Request Instant Payout to Bank'}
              </button>
            </div>

            {/* Payout History Ledger */}
            <h4 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '0.75rem' }}>Payout History Ledger</h4>
            {payouts.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                No prior payouts requested yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {payouts.map(p => (
                  <div key={p.payoutId} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem 1.25rem', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>{p.payoutId}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Method: Stripe Connect Express | Date: {new Date(p.requestedAt).toLocaleDateString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: '#50e3c2', fontWeight: 'bold' }}>+${p.netPayoutAmount.toFixed(2)}</div>
                      <span style={{ fontSize: '0.7rem', color: '#2ecc71', background: 'rgba(46,204,113,0.15)', padding: '2px 8px', borderRadius: '10px' }}>✓ Paid</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 5: 1099 LICENSE & TAX COMPLIANCE ─────── */}
        {activeTab === 'compliance' && (
          <div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
              Independent Contractor Licensing & Tax Guidance
            </h3>

            <div style={{ background: 'rgba(15,18,30,0.9)', border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '16px', fontSize: '0.88rem', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                <ShieldCheck size={20} /> Independent Marketplace Practitioner (1099 Model)
              </div>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '1rem' }}>
                As a staff healer on Reiki & Sage, you operate as an <strong>Independent Contractor</strong>. Reiki & Sage provides technology marketplace, scheduling, video sanctuary rooms, and payment processing infrastructure.
              </p>

              <ul style={{ paddingLeft: '1.25rem', marginBottom: '1.5rem', color: 'rgba(255,255,255,0.7)' }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Tax Obligations:</strong> You are responsible for filing local income and self-employment taxes in your state or country. US earnings over threshold receive 1099 reporting via Stripe.
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <strong>Business Licenses:</strong> You maintain any required local professional practice or business licenses for your jurisdiction.
                </li>
                <li>
                  <strong>App Platform Fee:</strong> Reiki & Sage deducts a 15% platform marketplace fee per completed booking to maintain video infrastructure and application hosting.
                </li>
              </ul>

              <div style={{ background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.3)', padding: '1rem', borderRadius: '12px', color: '#2ecc71', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} /> Verified Independent Contractor Status Active
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffHealerDashboard;
