import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'react-hot-toast';
import './HealerDashboard.css';

const HealerDashboard = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [emailSettings, setEmailSettings] = useState(
    JSON.parse(localStorage.getItem('aura_email_settings')) || {
      fromEmail: 'healing@reikiandsage.com',
      signature: 'Balance & Blessing, Carissa'
    }
  );
  const [filter, setFilter] = useState('all');

  // Simulated trend data based on bookings
  const trendData = [
    { name: 'Mon', vibrations: 4 },
    { name: 'Tue', vibrations: 7 },
    { name: 'Wed', vibrations: 5 },
    { name: 'Thu', vibrations: 10 },
    { name: 'Fri', vibrations: 12 },
    { name: 'Sat', vibrations: 15 },
    { name: 'Sun', vibrations: 8 },
  ];

  useEffect(() => {
    // Load data from simulated database
    const savedBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    setBookings(savedBookings.sort((a, b) => b.id - a.id));
    
    const savedClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    setClients(savedClients.sort((a, b) => a.name.localeCompare(b.name)));
  }, []);

  const saveEmailSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('aura_email_settings', JSON.stringify(emailSettings));
    toast.success('Communication frequency calibrated.');
  };

  const seedMockData = () => {
    const mockClients = [
      { name: 'Aria Sterling', phone: '555-0101', email: 'aria@ethereal.test', lastBooking: '2026-01-28' },
      { name: 'Cyrus Vane', phone: '555-0202', email: 'cyrus@void.test', lastBooking: '2026-01-30' },
      { name: 'Lyra Moon', phone: '555-0303', email: 'lyra@lunar.test', lastBooking: '2026-01-31' }
    ];
    const mockBookings = [
      { id: Date.now() - 86400000, client: mockClients[0], type: 'Portal Session', date: '2026-02-02', time: '10:00 AM', status: 'accepted' },
      { id: Date.now() - 43200000, client: mockClients[1], type: 'On-Site Alignment', date: '2026-02-03', time: '1:00 PM', status: 'pending' }
    ];
    localStorage.setItem('aura_clients', JSON.stringify(mockClients));
    localStorage.setItem('aura_bookings', JSON.stringify(mockBookings));
    
    setClients(mockClients);
    setBookings(mockBookings);
    toast.success('Sanctuary data seeded. Mock spirits summoned.');
  };

  const updateStatus = (id, newStatus) => {
    const updated = bookings.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    );
    setBookings(updated);
    localStorage.setItem('aura_bookings', JSON.stringify(updated));
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="dashboard-overlay">
      <div className="dashboard-container glass">
        <header className="dashboard-header">
          <div>
            <h1 className="logo-small">Reiki & Sage</h1>
            <p style={{fontSize: '0.8rem', opacity: 0.6}}>Sanctuary Management System v1.2</p>
          </div>
          <div className="tab-nav">
            <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>Bookings</button>
            <button className={activeTab === 'clients' ? 'active' : ''} onClick={() => setActiveTab('clients')}>Archive</button>
            <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>Settings</button>
          </div>
          <button onClick={onClose} className="close-btn">×</button>
        </header>

        <div className="dashboard-content">
          {activeTab === 'bookings' && (
            <div className="fade-in">
              <div className="dashboard-grid">
                <div className="dashboard-main-stats">
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <h3>Pending</h3>
                      <div className="value" style={{color: 'var(--accent-gold)'}}>{bookings.filter(b => b.status === 'pending').length}</div>
                    </div>
                    <div className="stat-card">
                      <h3>Confirmed</h3>
                      <div className="value" style={{color: '#2ecc71'}}>{bookings.filter(b => b.status === 'accepted').length}</div>
                    </div>
                    <div className="stat-card"><h3>Total</h3><div className="value">{bookings.length}</div></div>
                  </div>
                  <div className="trends-card">
                    <h3>Vibrational Trends</h3>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                          <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '10px' }} />
                          <Line type="monotone" dataKey="vibrations" stroke="var(--accent-ethereal)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                <div className="energy-insights">
                  <h3>Energy Core</h3>
                  <div className="insight-item">
                    <span>Stability</span>
                    <div className="insight-progress"><div className="progress-fill" style={{width: '92%'}}></div></div>
                  </div>
                  <div className="insight-item">
                    <span>Flow</span>
                    <div className="insight-progress"><div className="progress-fill" style={{width: '74%'}}></div></div>
                  </div>
                </div>
              </div>

              <div className="filter-bar">
                <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                <button className={filter === 'pending' ? 'active' : ''} onClick={() => setFilter('pending')}>Pending</button>
                <button className={filter === 'accepted' ? 'active' : ''} onClick={() => setFilter('accepted')}>Confirmed</button>
              </div>

              <div className="booking-list">
                {filteredBookings.map(b => (
                  <div key={b.id} className={`booking-card ${b.status}`}>
                    <div className="booking-info">
                      <h3>{b.client.name}</h3>
                      <p>{b.type} • {b.date} at {b.time}</p>
                    </div>
                    <div className="booking-actions">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'accepted')} className="accept-btn">Accept</button>
                          <button onClick={() => updateStatus(b.id, 'declined')} className="decline-btn">Decline</button>
                        </>
                      )}
                      <span className="status-badge">{b.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="archive-view fade-in">
              <h3>Client Resonance Archive</h3>
              <div className="archive-table-container">
                <table className="archive-table">
                  <thead>
                    <tr><th>Name</th><th>Contact info</th><th>Last Connection</th></tr>
                  </thead>
                  <tbody>
                    {clients.map((c, i) => (
                      <tr key={i}>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.phone}<br/><span style={{opacity: 0.6}}>{c.email}</span></td>
                        <td>{c.lastBooking}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="settings-view fade-in">
              <h3>Communication Identity</h3>
              <form onSubmit={saveEmailSettings} className="settings-form">
                <div className="form-group">
                  <label>From Identity (Email)</label>
                  <input type="email" value={emailSettings.fromEmail} onChange={e => setEmailSettings({...emailSettings, fromEmail: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Vibrational Signature (Signature)</label>
                  <textarea rows="4" value={emailSettings.signature} onChange={e => setEmailSettings({...emailSettings, signature: e.target.value})} />
                </div>
                <button type="submit" className="btn-primary">Update Calibration</button>
              </form>
              
              <div style={{marginTop: '4rem', padding: '2rem', border: '1px solid rgba(255,0,0,0.1)', borderRadius: '15px', background: 'rgba(255,0,0,0.05)'}}>
                <h4 style={{color: '#ff7675', marginBottom: '1rem'}}>Developer Tools</h4>
                <p style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.5rem'}}>Populate the sanctuary with test spirits to verify system flow.</p>
                <button 
                  onClick={seedMockData}
                  className="btn" 
                  style={{background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff'}}
                >
                  Seed Mock Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealerDashboard;
