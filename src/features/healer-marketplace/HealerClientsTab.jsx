import React, { useState } from 'react';
import { Users, Mail, Phone, Calendar, Search } from 'lucide-react';

export const HealerClientsTab = ({ clients = [], onSelectClient }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(c => {
    const q = searchQuery.toLowerCase();
    return (c.name || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q);
  });

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search seekers by name or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="glass"
            style={{
              width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.02)', color: '#fff'
            }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', borderRadius: '18px' }}>
          <Users size={36} color="var(--accent-gold)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <p style={{ opacity: 0.7, margin: 0 }}>No seekers found matching your query.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredClients.map((client, idx) => (
            <div
              key={client.email || idx}
              className="glass card-hover"
              onClick={() => onSelectClient && onSelectClient(client)}
              style={{ padding: '1.25rem', borderRadius: '16px', cursor: 'pointer' }}
            >
              <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#fff', marginBottom: '0.4rem' }}>
                {client.name || 'Seeker'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.3rem' }}>
                <Mail size={13} /> {client.email}
              </div>
              {client.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                  <Phone size={13} /> {client.phone}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HealerClientsTab;
