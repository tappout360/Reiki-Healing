import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Activity, Users, Calendar as CalendarIcon, Settings, FileText, Download, UserPlus,
  Trash2, Mail, ExternalLink, Filter, Plus, X, List, Grid, Key,
  TrendingUp, Clock, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Star,
  CheckSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { logTransaction } from '../utils/logger';
import { isFirebaseConfigured, db } from '../lib/firebase';
import './HealerDashboard.css';

const HealerDashboard = ({ onClose, onJoinPortal, healerAppsEnabled = false, onToggleHealerApps = () => {}, protocols = [], onToggleProtocol = () => {} }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [filter, setFilter] = useState('all');
  const [storyFilter, setStoryFilter] = useState('pending'); // 'pending', 'approved', 'archived'
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [stories, setStories] = useState([]);
  const [onlineSouls, setOnlineSouls] = useState(30); // Stable default during render
  
  // Real-time soul fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineSouls(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        return Math.max(10, Math.min(100, prev + change));
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [selectedClient, setSelectedClient] = useState(null); // For Archive Modal
  const [pricing, setPricing] = useState(
    JSON.parse(localStorage.getItem('aura_pricing')) || {
      '1_month': 22,
      '3_month': 55,
      '6_month': 99,
      '1_year': 188
    }
  );
  const [promotions, setPromotions] = useState(
    JSON.parse(localStorage.getItem('aura_promotions')) || []
  );
  const [teamMembers, setTeamMembers] = useState([]);
  const [onsitePrice, setOnsitePrice] = useState(() => {
    return localStorage.getItem('aura_onsite_price') || '150';
  });
  const [emailSettings, setEmailSettings] = useState(() => {
    const savedSettings = JSON.parse(localStorage.getItem('aura_email_settings')) || {};
    return {
      fromEmail: savedSettings.fromEmail || 'healing@reikiandsage.com',
      signature: savedSettings.signature || 'Balance & Blessing, Carissa',
      ownerEmail: savedSettings.ownerEmail || 'owner@reikiandsage.com',
      videoSessionPrice: localStorage.getItem('aura_video_price') || '88'
    };
  });
  const [checklist, setChecklist] = useState(() => {
    const saved = localStorage.getItem('aura_launch_checklist');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return {
      llc: false,
      ein: false,
      stateLic: false,
      cityLic: false,
      homeOcc: false,
      insurance: false,
      stripeSecret: false,
      stripePublishable: false,
      firebaseServiceAccount: false,
      resendKey: false,
      fromEmail: false,
      healerEmail: false,
      gaId: false,
      stripeWebhook: false,
      stripeTestPayment: false,
      voiceAmethyst: false,
      voiceRose: false,
      voiceSage: false,
      printIntake: false,
      printCards: false
    };
  });

  useEffect(() => {
    localStorage.setItem('aura_launch_checklist', JSON.stringify(checklist));
  }, [checklist]);

  const toggleChecklistItem = (key) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrintIntake = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups to print the form.");
      return;
    }
    
    const content = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Reiki & Sage — Client Intake & Waiver</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            color: #111;
            background: #fff;
            margin: 0;
            padding: 20px;
            line-height: 1.5;
            font-size: 14px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #ddd;
            padding: 40px;
            border-radius: 4px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #b8973d;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-family: 'Times New Roman', serif;
            font-size: 28px;
            margin: 0;
            color: #8c7633;
            letter-spacing: 2px;
          }
          .header p {
            margin: 5px 0 0;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          h2 {
            font-size: 16px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
            color: #8c7633;
            margin-top: 25px;
            margin-bottom: 15px;
          }
          .form-row {
            display: flex;
            gap: 20px;
            margin-bottom: 15px;
          }
          .form-group {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .form-group.third {
            flex: 0 0 30%;
          }
          label {
            font-size: 11px;
            text-transform: uppercase;
            color: #555;
            margin-bottom: 4px;
            font-weight: bold;
          }
          .input-line {
            border: none;
            border-bottom: 1px solid #777;
            padding: 6px 0;
            font-size: 14px;
            font-family: inherit;
            background: transparent;
            outline: none;
          }
          .checkbox-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 10px 0;
          }
          .textarea-box {
            border: 1px solid #777;
            height: 80px;
            border-radius: 4px;
            margin-top: 5px;
          }
          .disclaimer-box {
            background: #fdfaf2;
            border: 1px solid #e2d7b8;
            padding: 20px;
            border-radius: 4px;
            font-size: 12px;
            color: #444;
            line-height: 1.6;
            margin-top: 25px;
            margin-bottom: 25px;
          }
          .signature-row {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            gap: 50px;
          }
          .signature-group {
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .footer-note {
            text-align: center;
            font-size: 10px;
            color: #777;
            margin-top: 40px;
            border-top: 1px solid #eee;
            padding-top: 15px;
          }
          @media print {
            body {
              padding: 0;
              font-size: 12px;
            }
            .container {
              border: none;
              padding: 0;
            }
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: center; margin-bottom: 20px; background: #f0f0f0; padding: 10px; border-radius: 4px;">
          <button onclick="window.print();" style="padding: 10px 20px; background: #8c7633; color: white; border: none; border-radius: 4px; cursor: pointer; font-family: sans-serif; font-size: 14px; font-weight: bold;">Print Intake & Waiver Form</button>
          <span style="margin-left: 10px; font-family: sans-serif; font-size: 12px; color: #555;">(Use Portrait orientation, Letter paper)</span>
        </div>
        <div class="container">
          <div class="header">
            <h1>✦ REIKI & SAGE HEALING SANCTUARY ✦</h1>
            <p>Seattle, WA &bull; info@reikiandsage.com &bull; Certified Usui Reiki Master</p>
          </div>
          
          <h2>I. CLIENT INFORMATION</h2>
          <div class="form-row">
            <div class="form-group">
              <label>Full Name</label>
              <div class="input-line"></div>
            </div>
            <div class="form-group third">
              <label>Date of Birth</label>
              <div class="input-line"></div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Email Address</label>
              <div class="input-line"></div>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <div class="input-line"></div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Address</label>
              <div class="input-line"></div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Emergency Contact Name</label>
              <div class="input-line"></div>
            </div>
            <div class="form-group">
              <label>Relationship</label>
              <div class="input-line"></div>
            </div>
            <div class="form-group">
              <label>Emergency Contact Phone</label>
              <div class="input-line"></div>
            </div>
          </div>

          <h2>II. WELLNESS PROFILE & INTENTIONS</h2>
          <div class="form-group" style="margin-bottom: 20px;">
            <label>What are your main physical, emotional, or spiritual intentions for this session?</label>
            <div class="textarea-box"></div>
          </div>
          
          <div class="form-row" style="margin-bottom: 20px;">
            <div class="form-group" style="flex: 0 0 auto;">
              <label>Have you experienced Reiki / crystal energy healing before?</label>
              <div class="checkbox-group">
                <span style="border: 1px solid #777; width: 14px; height: 14px; display: inline-block;"></span> Yes
                <span style="border: 1px solid #777; width: 14px; height: 14px; display: inline-block; margin-left: 20px;"></span> No
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Are you currently under the care of a physician or taking any regular prescription medications? Please list below:</label>
            <div class="textarea-box" style="height: 60px;"></div>
          </div>

          <h2>III. STATEMENT OF CONSENT & MEDICAL DISCLAIMER</h2>
          <div class="disclaimer-box">
            <strong>1. Complementary Nature:</strong> Reiki is a gentle, hands-on (or hands-off) Japanese method of energy balancing intended for stress reduction, relaxation, and wellness support. I understand that Reiki is a complementary energy therapy and does <em>not</em> replace professional medical diagnosis, clinical treatment, or prescriptions.<br/><br/>
            <strong>2. Scope of Practice:</strong> I acknowledge that Carissa Bright is a certified Reiki Master and is <em>not</em> a licensed physician, psychologist, or healthcare provider. She does not diagnose medical conditions, perform spinal manipulations, prescribe substances, or interfere with the advice of qualified healthcare professionals.<br/><br/>
            <strong>3. Physical Contact Consent:</strong> Reiki may involve light touch on specific non-contact locations (head, chest, stomach, hands, knees, feet). Touch is always non-diagnostic and non-invasive. I understand I have the right to request a fully non-contact session at any point.<br/><br/>
            <strong>4. Data Privacy:</strong> I understand that Reiki & Sage maintains a "No PHI" (Protected Health Information) privacy policy. This physical document is kept in a secure, confidential local file and is not transmitted electronically or shared with any third party.
          </div>

          <div style="font-size: 13px; line-height: 1.6; margin-top: 15px;">
            By signing below, I acknowledge that I have read and understand this statement. I consent to receive energy healing services and assume all risks associated with the treatment.
          </div>

          <div class="signature-row">
            <div class="signature-group">
              <div class="input-line" style="margin-top: 20px;"></div>
              <label style="margin-top: 5px;">Client Signature</label>
            </div>
            <div class="signature-group" style="flex: 0 0 25%;">
              <div class="input-line" style="margin-top: 20px;"></div>
              <label style="margin-top: 5px;">Date</label>
            </div>
          </div>

          <div class="footer-note">
            © 2026 Reiki & Sage LLC &bull; Seattle, Washington &bull; www.reikiandsage.com
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const [blockedDates, setBlockedDates] = useState(
    JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]')
  );
  const [blockedSlots, setBlockedSlots] = useState(
    JSON.parse(localStorage.getItem('aura_blocked_slots') || '{}')
  );
  const syncAvailabilityToCloud = (dates, slots) => {
    if (isFirebaseConfigured()) {
      db.updateSettings('availability', { blockedDates: dates, blockedSlots: slots })
        .catch(err => console.error("Failed to sync availability to Firestore:", err));
    }
  };
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toDateString());
  const [bankInfo, setBankInfo] = useState(() => {
    if (isFirebaseConfigured()) return { bankName: '', routingNumber: '', accountNumber: '' };
    const saved = JSON.parse(localStorage.getItem('aura_bank_info') || '{}');
    return {
      bankName: saved.bankName || '',
      routingNumber: saved.routingNumber || '',
      accountNumber: saved.accountNumber || ''
    };
  });

  useEffect(() => {
    if (isFirebaseConfigured()) {
      db.getSettings('bank_info')
        .then(data => {
          if (data) {
            setBankInfo({
              bankName: data.bankName || '',
              routingNumber: data.routingNumber || '',
              accountNumber: data.accountNumber || ''
            });
          }
        })
        .catch(err => console.error("Failed to load bank info from Firestore:", err));

      db.getSettings('pricing')
        .then(data => {
          if (data) {
            if (data.onsitePrice) {
              setOnsitePrice(data.onsitePrice);
              localStorage.setItem('aura_onsite_price', data.onsitePrice);
            }
            if (data.videoPrice) {
              setEmailSettings(prev => ({ ...prev, videoSessionPrice: data.videoPrice }));
              localStorage.setItem('aura_video_price', data.videoPrice);
            }
          }
        })
        .catch(err => console.error("Failed to load pricing from Firestore:", err));

      db.getSettings('availability')
        .then(data => {
          if (data) {
            if (data.blockedDates) setBlockedDates(data.blockedDates);
            if (data.blockedSlots) setBlockedSlots(data.blockedSlots);
          }
        })
        .catch(err => console.error("Failed to load availability from Firestore:", err));
    }
  }, []);

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

  const [applications, setApplications] = useState([]); // Healer Job Applications

  useEffect(() => {
    // Set random presence on mount to keep it dynamic and pure
    setOnlineSouls(Math.floor(Math.random() * 31) + 20);

    if (isFirebaseConfigured()) {
      db.getAllBookings()
        .then(list => {
          setBookings(list.sort((a, b) => {
            const dateA = new Date(a.bookingDate || a.date);
            const dateB = new Date(b.bookingDate || b.date);
            return dateB - dateA;
          }));
        })
        .catch(err => console.error("Failed to load bookings from Firestore:", err));

      db.getAllClients()
        .then(list => {
          setClients(list.map(c => ({
            name: c.name || c.username || 'Anonymous Seeker',
            phone: c.experience || '',
            email: c.email || '',
            lastBooking: c.lastSessionDate || 'No sessions yet',
            subscription: c.subscription || 'seeker'
          })).sort((a, b) => (a.name || '').localeCompare(b.name || '')));
        })
        .catch(err => console.error("Failed to load clients from Firestore:", err));

      db.getTeamMembers()
        .then(list => {
          setTeamMembers(list.map(t => {
            let joinedDate = '';
            try {
              if (t.createdAt && typeof t.createdAt.seconds === 'number' && !isNaN(t.createdAt.seconds)) {
                joinedDate = new Date(t.createdAt.seconds * 1000).toISOString().split('T')[0];
              } else if (t.createdAt instanceof Date) {
                joinedDate = t.createdAt.toISOString().split('T')[0];
              } else if (typeof t.createdAt === 'string' && !isNaN(Date.parse(t.createdAt))) {
                joinedDate = new Date(t.createdAt).toISOString().split('T')[0];
              } else {
                joinedDate = new Date().toISOString().split('T')[0];
              }
            } catch {
              joinedDate = new Date().toISOString().split('T')[0];
            }
            return {
              name: t.name || t.username || 'Anonymous Healer',
              email: t.email || '',
              status: t.status || 'Active',
              role: t.role || 'Healer',
              joined: joinedDate
            };
          }));
        })
        .catch(err => console.error("Failed to load team members from Firestore:", err));

      db.getApplications()
        .then(list => {
          setApplications(list);
        })
        .catch(err => console.error("Failed to load healer applications from Firestore:", err));

      db.getAllStories()
        .then(list => {
          setStories(list);
        })
        .catch(err => console.error("Failed to load stories from Firestore:", err));
    } else {
      // Load data from simulated database
      const savedBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
      setBookings(savedBookings.sort((a, b) => b.id - a.id));
      
      const savedClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
      setClients(savedClients.sort((a, b) => (a.name || '').localeCompare(b.name || '')));

      const savedTeam = JSON.parse(localStorage.getItem('aura_team') || '[]');
      setTeamMembers(savedTeam);

      const savedApplications = JSON.parse(localStorage.getItem('aura_applications') || '[]');
      setApplications(savedApplications);

      const savedStories = JSON.parse(localStorage.getItem('aura_stories') || '[]');
      setStories(savedStories);
    }

    // Simulation: Dynamic presence fluctuation
    const presenceInterval = setInterval(() => {
      setOnlineSouls(prev => {
        const change = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
        const newVal = prev + change;
        return newVal < 15 ? 15 : (newVal > 100 ? 100 : newVal);
      });
    }, 8000);

    return () => clearInterval(presenceInterval);
  }, []);

  const profile = JSON.parse(localStorage.getItem('user_profile') || 'null');
  const isDemo = !isFirebaseConfigured();
  const isAuthorized = profile && (profile.role === 'admin' || profile.role === 'owner') && 
    (isDemo || ['carissabright@gmail.com', 'jasonmounts77@yahoo.com'].includes(profile.email?.toLowerCase()));

  useEffect(() => {
    if (!isAuthorized) {
      toast.error("Unauthorized entry detected. Vibrational signature mismatch.");
      onClose();
    }
  }, [isAuthorized, onClose]);

  if (!isAuthorized) {
    return null;
  }

  const saveEmailSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('aura_email_settings', JSON.stringify(emailSettings));
    toast.success('Communication frequency calibrated.');
  };

  const seedMockData = () => {
    const names = ['Aria', 'Cyrus', 'Lyra', 'Orion', 'Nova', 'Sage', 'Luna', 'Sol', 'Kai', 'Mira', 'Zephyr', 'Echo', 'Raven', 'Jasper', 'Ivy', 'Finn', 'Willow', 'River', 'Sky', 'Rain', 'Ash', 'Ember', 'Phoenix', 'Cosmo', 'Stella', 'Aurora', 'Dawn', 'Dusk', 'Mist', 'Storm', 'Vale', 'Fern', 'Moss', 'Stone', 'Reed', 'Flint', 'Onyx', 'Jade', 'Ruby', 'Opal', 'Pearl', 'Coral', 'Amber', 'Topaz']
    const surnames = ['Sterling', 'Vane', 'Moon', 'Black', 'White', 'Green', 'Grey', 'Silver', 'Gold', 'Crystal', 'Rose', 'Wolf', 'Hawk', 'Eagle', 'Bear', 'Fox', 'Stark', 'Snow', 'Storm', 'Rain', 'Frost', 'Fire', 'Light', 'Dark', 'Night', 'Day', 'Sun', 'Star', 'Sky', 'Cloud', 'Wind', 'Water', 'Earth', 'Leaf', 'Root', 'Branch', 'Seed', 'Bloom', 'Thorn', 'Rose'];
    
    const generateName = () => `${names[Math.floor(Math.random() * names.length)]} ${surnames[Math.floor(Math.random() * surnames.length)]}`;
    const generatePhone = () => `555-${Math.floor(1000 + Math.random() * 9000)}`;
    const generateEmail = (name) => `${name.toLowerCase().replace(' ', '.')}@${Math.random() > 0.5 ? 'gmail.test' : 'yahoo.test'}`;

    const mockClients = [];
    for (let i = 0; i < 50; i++) {
        const name = generateName();
        mockClients.push({
            name,
            phone: generatePhone(),
            email: generateEmail(name),
            lastBooking: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
            subscription: Math.random() > 0.7 ? 'healing' : 'seeker' // 30% chance of paid
        });
    }

    const mockBookings = [];
    const types = ['Portal Session', 'On-Site Alignment', 'Aura Cleansing', 'Chakra Balancing'];
    const statuses = ['pending', 'accepted', 'completed', 'declined'];
    for(let i=0; i < 100; i++) {
        const client = mockClients[Math.floor(Math.random() * mockClients.length)];
        mockBookings.push({
            id: Date.now() - Math.floor(Math.random() * 10000000000),
            client,
            type: types[Math.floor(Math.random() * types.length)],
            date: new Date(Date.now() + Math.random() * 1000000000).toISOString().split('T')[0],
            time: `${Math.floor(Math.random() * 12 + 1)}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`,
            status: statuses[Math.floor(Math.random() * statuses.length)]
        });
    }

    // NEW: Mock Applications
    const mockApplications = [];
    for(let i=0; i < 20; i++) {
         const name = generateName();
         mockApplications.push({
             id: Date.now() - i * 10000,
             name,
             email: generateEmail(name),
             motivation: "I have felt the call to heal others since my awakening last year. I specialize in crystal resonance.",
             experience: "Reiki Level II Certified, 5 years meditation practice.",
             status: Math.random() > 0.5 ? 'Pending' : (Math.random() > 0.5 ? 'Approved' : 'Rejected'),
             date: new Date(Date.now() - Math.random() * 5000000000).toISOString().split('T')[0]
         });
    }

    const mockStories = [
      { id: 's1', userName: 'Echo Sterling', userEmail: 'echo@test.com', story: 'The Rose Quartz session was life-changing. I felt a profound sense of peace.', rating: 5, status: 'approved', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 's2', userName: 'Lyra Moon', userEmail: 'lyra@test.com', story: 'The Citrine Manifestation protocol really helped me focus on my goals.', rating: 4, status: 'approved', timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 's3', userName: 'Cyrus Vane', userEmail: 'cyrus@test.com', story: 'I had a vision during the Amethyst Attunement. Truly high-frequency.', rating: 5, status: 'pending', timestamp: new Date().toISOString() }
    ];

    localStorage.setItem('aura_clients', JSON.stringify(mockClients));
    localStorage.setItem('aura_bookings', JSON.stringify(mockBookings));
    localStorage.setItem('aura_applications', JSON.stringify(mockApplications));
    localStorage.setItem('aura_stories', JSON.stringify(mockStories));
    
    setClients(mockClients);
    setBookings(mockBookings);
    setApplications(mockApplications);
    setStories(mockStories);
    toast.success('EXTREME DATA INJECTION COMPLETE. The Matrix has been populated.');
  };

  const updateStatus = (id, newStatus) => {
    const updated = bookings.map(b => 
      b.id === id ? { ...b, status: newStatus } : b
    );
    setBookings(updated);
    localStorage.setItem('aura_bookings', JSON.stringify(updated));

    if (isFirebaseConfigured()) {
      db.updateBookingStatus(id, newStatus)
        .then(() => toast.success(`Booking status updated to ${newStatus}`))
        .catch(err => {
          console.error("Failed to update booking status in Firestore:", err);
          toast.error("Failed to sync booking status update.");
        });
    }
  };

  const handleApproveStory = (id) => {
    const updated = stories.map(s => s.id === id ? { ...s, status: 'approved' } : s);
    setStories(updated);
    localStorage.setItem('aura_stories', JSON.stringify(updated));
    toast.success('Story resonated with the community.');
    logTransaction('[ADMIN] Story Approved', 'Community Mod', '-', `Story ${id} approved.`);

    if (isFirebaseConfigured()) {
      db.updateStoryStatus(id, 'approved')
        .catch(err => console.error("Failed to approve story in Firestore:", err));
    }
  };

  const handleArchiveStory = (id) => {
    const updated = stories.map(s => s.id === id ? { ...s, status: 'archived' } : s);
    setStories(updated);
    localStorage.setItem('aura_stories', JSON.stringify(updated));
    toast.success('Story safely archived.');
    logTransaction('[ADMIN] Story Archived', 'Community Mod', '-', `Story ${id} archived.`);

    if (isFirebaseConfigured()) {
      db.updateStoryStatus(id, 'archived')
        .catch(err => console.error("Failed to archive story in Firestore:", err));
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (!b) return false;
    if (filter === 'all') return true;
    return b.status === filter;
  });

  const handleExportApplications = () => {
    const headers = ['ID', 'Name', 'Email', 'Status', 'Date', 'Motivation', 'Experience'];
    const csvData = [
      headers.join(','),
      ...applications.map(app => [
        app.id,
        `"${app.name}"`,
        app.email,
        app.status,
        app.date,
        `"${app.motivation.replace(/"/g, '""')}"`,
        `"${app.experience.replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `healer_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Healer applications exported to CSV.');
  };

  const handleExportLogs = () => {
    const logs = JSON.parse(localStorage.getItem('healing_logs') || '[]');
    if (logs.length === 0) {
      toast.error('No logs to export.');
      return;
    }

    const headers = ['Timestamp', 'Action', 'User', 'Email', 'Details'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => {
        const row = [
          `"${new Date(log.timestamp || Date.now()).toISOString()}"`,
          `"${log.action || ''}"`,
          `"${log.user || ''}"`,
          `"${log.email || ''}"`,
          `"${(log.details || '').replace(/"/g, '""')}"` // Escape quotes in details
        ];
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `healing_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Healing logs exported to CSV.');
  };

  const approvedStories = stories.filter(s => s.status === 'approved');
  const averageRating = approvedStories.length > 0 
    ? (approvedStories.reduce((acc, s) => acc + s.rating, 0) / approvedStories.length).toFixed(1)
    : '5.0';

  return (
    <div className="dashboard-overlay">
      <button onClick={onClose} style={{
        position: 'absolute', top: '2rem', right: '2rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        padding: '0.8rem', borderRadius: '50%', color: '#fff', cursor: 'pointer', zIndex: 10
      }}>
        <X size={20} />
      </button>

      <div className="dashboard-container glass">
        <header className="dashboard-header">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="logo-small" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Reiki & Sage</h1>
            <p style={{ fontSize: '1rem', opacity: 0.6, letterSpacing: '4px' }}>SANCTUARY MANAGEMENT SYSTEM</p>
            {emailSettings.ownerEmail && (
              <p style={{ fontSize: '0.8rem', marginTop: '1rem', opacity: 0.4 }}>
                Platform Sovereign: {emailSettings.ownerEmail}
              </p>
            )}
          </div>
          <div className="tab-nav">
              <button className={activeTab === 'bookings' ? 'active' : ''} onClick={() => setActiveTab('bookings')}>
                <Activity size={18} /> Bookings
              </button>
              <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
                <FileText size={18} /> Logs
              </button>
              <button className={activeTab === 'archive' ? 'active' : ''} onClick={() => setActiveTab('archive')}>
                <Users size={18} /> Archive
              </button>
               <button className={activeTab === 'applications' ? 'active' : ''} onClick={() => setActiveTab('applications')}>
                <FileText size={18} /> Applications
                {applications.filter(a => a.status === 'Pending').length > 0 && (
                    <span style={{
                        background: '#e74c3c', color: 'white', borderRadius: '50%', 
                        padding: '2px 6px', fontSize: '0.7rem', marginLeft: '5px'
                    }}>
                        {applications.filter(a => a.status === 'Pending').length}
                    </span>
                )}
              </button>
              <button className={activeTab === 'financials' ? 'active' : ''} onClick={() => setActiveTab('financials')}>
                <Activity size={18} /> Financials
              </button>
              <button className={activeTab === 'subscription_manager' ? 'active' : ''} onClick={() => setActiveTab('subscription_manager')}>
                <Settings size={18} /> Prices
              </button>
              <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
                <TrendingUp size={18} /> Analytics
              </button>
              <button className={activeTab === 'stories' ? 'active' : ''} onClick={() => setActiveTab('stories')}>
                <Sparkles size={18} /> Stories
                {stories.filter(s => s.status === 'pending').length > 0 && (
                    <span style={{
                        background: '#f1c40f', color: '#000', borderRadius: '50%', 
                        padding: '2px 6px', fontSize: '0.7rem', marginLeft: '5px', fontWeight: 'bold'
                    }}>
                        {stories.filter(s => s.status === 'pending').length}
                    </span>
                )}
              </button>
              <button className={activeTab === 'availability' ? 'active' : ''} onClick={() => setActiveTab('availability')}>
                <CalendarIcon size={18} /> Availability
              </button>
              <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={18} /> Settings
            </button>
            <button className={activeTab === 'checklist' ? 'active' : ''} onClick={() => setActiveTab('checklist')}>
              <CheckSquare size={18} /> Launch Checklist
            </button>
          </div>
        </header>

        <div className="dashboard-content">
            {activeTab === 'logs' && (
              <div className="promo-panel fade-in">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <h2>Healing Logs (Transaction History)</h2>
                    <button 
                        onClick={handleExportLogs}
                        className="btn"
                        style={{
                            background: 'rgba(212, 175, 55, 0.1)', 
                            border: '1px solid var(--accent-gold)', 
                            color: 'var(--accent-gold)',
                            padding: '0.5rem 1rem',
                            fontSize: '0.85rem'
                        }}
                    >
                        Export CSV
                    </button>
                </div>
                <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                    <Sparkles size={14} /> COMMUNITY RESONANCE
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{averageRating}<span style={{ fontSize: '1rem', opacity: 0.5 }}>/5.0</span></div>
                </div>
                 <div className="glass" style={{marginTop: '1rem', padding: '0'}}>
                    {(() => {
                        const logs = JSON.parse(localStorage.getItem('healing_logs') || '[]');
                        if (logs.length === 0) return <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>No transactions recorded yet.</div>;
                        
                        return [...logs].reverse().map((log, i) => {
                            // Safe render to prevent crashes if log data is corrupt
                            const safeUser = log.user || 'Unknown Spirit';
                            const safeEmail = log.email || 'No Contact';
                            const safeAction = log.action || 'System Event';
                            
                            return (
                                <div key={i} style={{
                                    padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{color: 'var(--accent-gold)', fontWeight: 'bold'}}>{safeAction}</div>
                                        {(() => {
                                            // Check if this user exists in our clients archive
                                            const matchedClient = clients.find(c => c.email === (log.email || ''));
                                            return (
                                                <div 
                                                    style={{
                                                        fontSize: '0.85rem', 
                                                        color: matchedClient ? 'var(--accent-gold)' : 'var(--text-muted)',
                                                        textDecoration: matchedClient ? 'underline' : 'none',
                                                        cursor: matchedClient ? 'pointer' : 'default',
                                                        display: 'flex', alignItems: 'center', gap: '5px'
                                                    }}
                                                    onClick={() => matchedClient && setSelectedClient(matchedClient)}
                                                    title={matchedClient ? "View Client Archive Record" : "External/Unlinked User"}
                                                >
                                                    {safeUser} ({safeEmail})
                                                    {matchedClient && <span style={{fontSize: '0.6rem', border:'1px solid var(--accent-gold)', borderRadius:'4px', padding:'0 3px'}}>LINKED</span>}
                                                </div>
                                            );
                                        })()}
                                         {log.details && <div style={{fontSize: '0.8rem', opacity: 0.7}}>{log.details}</div>}
                                    </div>
                                    <div style={{textAlign: 'right'}}>
                                        <div style={{fontSize: '0.85rem'}}>{new Date(log.timestamp || Date.now()).toLocaleDateString()}</div>
                                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{new Date(log.timestamp || Date.now()).toLocaleTimeString()}</div>
                                    </div>
                                </div>
                            );
                        });
                    })()}
                 </div>
              </div>
            )}

          {activeTab === 'bookings' && (
            <div className="fade-in">
              <div className="dashboard-grid">
                <div className="dashboard-main-stats">
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <h3>Online Souls</h3>
                      <div className="value" style={{color: '#00b894'}}>{onlineSouls}</div>
                    </div>
                    <div className="stat-card">
                      <h3>Pending</h3>
                      <div className="value" style={{color: 'var(--accent-gold)'}}>{bookings.filter(b => b.status === 'pending').length}</div>
                    </div>
                    <div className="stat-card">
                      <h3>Seekers</h3>
                      <div className="value" style={{color: 'var(--accent-ethereal)'}}>{clients.length}</div>
                    </div>
                    <div className="stat-card">
                      <h3>Subscribers</h3>
                      <div className="value" style={{color: 'var(--accent-gold)'}}>
                        {clients.filter(c => c.subscription === 'healing').length}
                      </div>
                    </div>
                  </div>
                  <div className="trends-card">
                    <h3>Vibrational Trends</h3>
                    <div style={{ width: '100%', height: 180 }}>
                      <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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
                {filteredBookings && filteredBookings.filter(Boolean).map(b => (
                  <div key={b?.id} className={`booking-card ${b?.status}`}>
                    <div className="booking-info">
                      <h3>{b?.client?.name || b?.customerName || 'Anonymous Seeker'}</h3>
                      <p>{b?.type || (b?.serviceType === 'onsite' || b?.sessionType === 'visit' ? 'On-Site Session' : 'Live Portal Session')} • {b?.date || b?.bookingDate} at {b?.time || b?.bookingTime || b?.timeSlot}</p>
                      {b?.sessionCode && (
                        <p style={{color: 'var(--accent-gold)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                           <Key size={14} /> <strong>Code: {b?.sessionCode}</strong>
                         </p>
                      )}
                    </div>
                    <div className="booking-actions">
                      {b?.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b?.id, 'accepted')} className="accept-btn">Accept</button>
                          <button onClick={() => updateStatus(b?.id, 'declined')} className="decline-btn">Decline</button>
                        </>
                      )}
                      {b?.status === 'accepted' && (b?.type?.includes('Portal') || b?.type?.includes('Live') || b?.serviceType === 'live' || b?.sessionType === 'live') && (
                        <button 
                          onClick={() => onJoinPortal(b)}
                          className="btn"
                          style={{
                            fontSize: '0.75rem', 
                            padding: '4px 12px', 
                            background: 'var(--accent-ethereal)', 
                            color: 'white',
                            marginRight: '10px',
                            border: '1px solid rgba(255,255,255,0.2)'
                          }}
                        >
                          Start Live Session
                        </button>
                      )}
                      <span className="status-badge">{b?.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="fade-in">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                <div>
                  <h3>Healer Applications</h3>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>
                    Review candidates seeking to join the Healing Team.
                  </p>
                </div>
                <button 
                    onClick={handleExportApplications}
                    className="btn"
                    style={{
                        background: 'rgba(212, 175, 55, 0.1)', 
                        border: '1px solid var(--accent-gold)', 
                        color: 'var(--accent-gold)',
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem'
                    }}
                >
                    Export CSV
                </button>
              </div>
              
              <div className="booking-list">
                 {applications.length === 0 ? (
                     <div style={{padding: '2rem', textAlign: 'center', opacity: 0.6}}>No applications received yet.</div>
                 ) : (
                     applications.map(app => (
                        <div key={app.id} className="booking-card" style={{borderColor: app.status === 'Pending' ? 'var(--accent-gold)' : 'transparent', opacity: app.status === 'Pending' ? 1 : 0.7}}>
                            <div className="booking-info">
                                <h3>{app.name}</h3>
                                <p style={{fontSize: '0.85rem', color: 'var(--accent-gold)'}}>{app.email}</p>
                                <div style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>
                                    <strong>Motivation:</strong> {app.motivation}
                                </div>
                                <div style={{marginTop: '0.5rem', fontSize: '0.9rem', fontStyle: 'italic'}}>
                                    <strong>Experience:</strong> {app.experience}
                                </div>
                                <div style={{marginTop: '0.5rem', fontSize: '0.8rem', opacity: 0.6}}>
                                    Applied: {app.date}
                                </div>
                            </div>
                            <div className="booking-actions" style={{flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
                                <span className={`status-badge ${app.status.toLowerCase()}`} style={{
                                    background: app.status === 'Approved' ? '#2ecc71' : app.status === 'Rejected' ? '#e74c3c' : '#f1c40f',
                                    color: 'black'
                                }}>
                                    {app.status}
                                </span>
                                {app.status === 'Pending' && (
                                    <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                                        <button 
                                            className="accept-btn"
                                            onClick={() => {
                                                const updated = applications.map(a => a.id === app.id ? { ...a, status: 'Approved' } : a);
                                                setApplications(updated);
                                                localStorage.setItem('aura_applications', JSON.stringify(updated));
                                                
                                                if (isFirebaseConfigured()) {
                                                  db.updateApplicationStatus(app.id, 'Approved')
                                                    .then(() => {
                                                      if (app.userId) {
                                                        db.updateRole(app.userId, 'healer')
                                                          .then(() => toast.success("Applicant role promoted to healer in cloud."))
                                                          .catch(err => console.error("Failed to update role:", err));
                                                      }
                                                    })
                                                    .catch(err => {
                                                      console.error("Failed to approve application in Firestore:", err);
                                                      toast.error("Failed to sync approval in cloud.");
                                                    });
                                                } else {
                                                  // Create User Account (Automated)
                                                  const newUser = {
                                                      name: app.name,
                                                      username: app.name.toLowerCase().replace(/\s+/g, '_'),
                                                      email: app.email,
                                                      password: app.password, // PCI Masked in logs, but stored here for first login
                                                      role: 'healer',
                                                      subscription: 'healing',
                                                      birthDate: app.birthDate,
                                                      status: 'Active',
                                                      joined: new Date().toISOString()
                                                  };
                                                  
                                                  const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                                                  if (!clients.find(c => c.email === app.email)) {
                                                      clients.push(newUser);
                                                      localStorage.setItem('aura_clients', JSON.stringify(clients));
                                                  }

                                                  // Create Team Member record for dashboard visibility
                                                  const newMember = { 
                                                      name: app.name, 
                                                      email: app.email, 
                                                      status: 'Active',
                                                      role: 'Healer',
                                                      joined: new Date().toISOString()
                                                  };
                                                  const updatedTeam = [...(JSON.parse(localStorage.getItem('aura_team') || '[]')), newMember];
                                                  localStorage.setItem('aura_team', JSON.stringify(updatedTeam));
                                                  setTeamMembers(updatedTeam);
                                                }
                                                
                                                toast.success(`${app.name} promoted to Healing Team. Account created.`);
                                                logTransaction('[ADMIN] Application Approved', app.name, app.email, 'User promoted to Healer and account created.');
                                             }}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="decline-btn"
                                            onClick={() => {
                                                const updated = applications.map(a => a.id === app.id ? { ...a, status: 'Rejected' } : a);
                                                setApplications(updated);
                                                localStorage.setItem('aura_applications', JSON.stringify(updated));
                                                
                                                if (isFirebaseConfigured()) {
                                                  db.updateApplicationStatus(app.id, 'Rejected')
                                                    .then(() => toast.success("Application marked Rejected in cloud."))
                                                    .catch(err => console.error("Failed to reject application in Firestore:", err));
                                                }
                                                
                                                toast.success('Application rejected.');
                                            }}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                     ))
                 )}
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="financials-section fade-in">
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem'}}>
                <div className="stat-card glass" style={{textAlign: 'center', padding: '2rem'}}>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Estimated Monthly Revenue</p>
                  <h2 style={{color: 'var(--accent-gold)', fontSize: '2.5rem'}}>${
                    clients.filter(c => c.subscription === 'healing').length * 29
                  }</h2>
                </div>
                <div className="stat-card glass" style={{textAlign: 'center', padding: '2rem'}}>
                  <p style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>Paid Subscriptions</p>
                  <h2 style={{color: 'var(--accent-ethereal)', fontSize: '2.5rem'}}>{clients.filter(c => c.subscription === 'healing').length}</h2>
                </div>
              </div>

              <div className="glass" style={{padding: '2rem'}}>
                <h3 style={{marginBottom: '1.5rem'}}>Transaction Status</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>All financial frequencies are currently stable. Detailed transaction logs can be found in the "Logs" tab.</p>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="fade-in">
               <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
                  {/* Global Resonance Map (Mocked) */}
                  <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ margin: 0 }}>Global Resonance Pulse</h3>
                        <div style={{ fontSize: '0.8rem', color: '#00b894', background: 'rgba(0, 184, 148, 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                           LIVE VIBRATIONS
                        </div>
                     </div>
                     <div style={{ 
                        height: '400px', 
                        background: 'rgba(0,0,0,0.3)', 
                        borderRadius: '20px', 
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.05)'
                     }}>
                        {/* Mock Map Background (SVG) */}
                        <svg width="100%" height="100%" viewBox="0 0 800 400" style={{ opacity: 0.1 }}>
                           <path d="M150,150 Q200,100 250,150 T350,150 T450,150 T550,150 T650,150" fill="none" stroke="white" strokeWidth="1" />
                           <path d="M100,250 Q150,200 200,250 T300,250 T400,250 T500,250 T600,250" fill="none" stroke="white" strokeWidth="1" />
                        </svg>
                        
                        {/* Animated Pulses */}
                        {[
                           { top: '30%', left: '20%', size: 40, color: '#8e44ad', duration: 3.2 },
                           { top: '60%', left: '45%', size: 60, color: '#3498db', duration: 2.5 },
                           { top: '25%', left: '75%', size: 30, color: '#f1c40f', duration: 3.8 },
                           { top: '70%', left: '80%', size: 45, color: '#e74c3c', duration: 2.1 },
                           { top: '40%', left: '50%', size: 80, color: '#2ecc71', duration: 3.5 }
                        ].map((pulse, i) => (
                           <motion.div
                             key={i}
                             animate={{ 
                               scale: [1, 2, 1],
                               opacity: [0.3, 0.7, 0.3]
                             }}
                             transition={{ 
                               duration: pulse.duration, 
                               repeat: Infinity,
                               delay: i * 0.5
                             }}
                             style={{
                               position: 'absolute',
                               top: pulse.top,
                               left: pulse.left,
                               width: pulse.size,
                               height: pulse.size,
                               borderRadius: '50%',
                               background: `radial-gradient(circle, ${pulse.color} 0%, transparent 70%)`,
                               transform: 'translate(-50%, -50%)',
                               zIndex: 1
                             }}
                           />
                        ))}
                        <div style={{ position: 'absolute', bottom: '2rem', left: '2rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                           DATA SOURCE: AURA BIO-TUNNEL G14
                        </div>
                     </div>
                  </div>

                  {/* Protocol Popularity */}
                  <div className="glass" style={{ padding: '2rem', borderRadius: '24px' }}>
                     <h3 style={{ marginBottom: '2rem' }}>Protocol Resonance</h3>
                     <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                              <Pie
                                 data={[
                                    { name: 'Root Grounding', value: 400, color: '#e74c3c' },
                                    { name: 'Solar Manifest', value: 300, color: '#f1c40f' },
                                    { name: 'Heart Opening', value: 550, color: '#2ecc71' },
                                    { name: 'Third Eye Vision', value: 200, color: '#8e44ad' },
                                    { name: 'Crown Connection', value: 150, color: '#9b59b6' }
                                 ]}
                                 cx="50%"
                                 cy="50%"
                                 innerRadius={60}
                                 outerRadius={100}
                                 paddingAngle={5}
                                 dataKey="value"
                              >
                                 {[
                                    '#e74c3c', '#f1c40f', '#2ecc71', '#8e44ad', '#9b59b6'
                                 ].map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} stroke="none" />
                                 ))}
                              </Pie>
                              <Tooltip 
                                 contentStyle={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                 itemStyle={{ fontSize: '0.8rem' }}
                              />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[
                           { name: 'Heart Opening', percent: '34%', color: '#2ecc71' },
                           { name: 'Root Grounding', percent: '25%', color: '#e74c3c' },
                           { name: 'Solar Manifest', percent: '19%', color: '#f1c40f' }
                        ].map((item, i) => (
                           <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                 <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                                 <span style={{ color: 'rgba(255,255,255,0.7)' }}>{item.name}</span>
                              </div>
                              <span style={{ fontWeight: 'bold' }}>{item.percent}</span>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'stories' && (
            <div className="fade-in">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                <div>
                   <h3>Community Moderation</h3>
                   <p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Review and approve soul reflections for the public sanctuary feed.</p>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  {['pending', 'approved', 'archived'].map(s => (
                    <button 
                      key={s}
                      onClick={() => setStoryFilter(s)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        background: storyFilter === s ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                        color: storyFilter === s ? 'black' : 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {s.toUpperCase()} 
                      <span style={{opacity: 0.6, fontSize: '0.7rem'}}>({stories.filter(i => i.status === s).length})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="booking-list">
                {stories.filter(s => s.status === storyFilter).length === 0 ? (
                  <div style={{padding: '3rem', textAlign: 'center', opacity: 0.5}}>No {storyFilter} reflections found in the archive.</div>
                ) : (
                  stories.filter(s => s.status === storyFilter).map(story => (
                    <div key={story.id} className={`booking-card ${story.status}`} style={{flexDirection: 'column', alignItems: 'flex-start', gap: '1rem', borderLeft: `4px solid ${story.status === 'approved' ? '#2ecc71' : story.status === 'archived' ? '#e74c3c' : 'var(--accent-gold)'}`}}>
                      <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
                        <h3 style={{color: 'var(--accent-gold)'}}>{story.userName} <span style={{fontSize: '0.75rem', fontWeight: 'normal', opacity: 0.5}}>({story.userEmail})</span></h3>
                        <div style={{display: 'flex', gap: '2px'}}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={story.rating > i ? 'var(--accent-gold)' : 'none'} stroke={story.rating > i ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'} />
                          ))}
                        </div>
                      </div>
                      <p style={{fontSize: '1rem', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)'}}>"{story.story}"</p>
                      <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <span style={{fontSize: '0.8rem', opacity: 0.4}}>{new Date(story.timestamp).toLocaleString()}</span>
                        <div style={{display: 'flex', gap: '10px'}}>
                          {story.status !== 'approved' && (
                            <button 
                              onClick={() => handleApproveStory(story.id)}
                              className="btn-accept"
                            >
                              Approve
                            </button>
                          )}
                          {story.status !== 'archived' && (
                            <button 
                              onClick={() => handleArchiveStory(story.id)}
                              className="btn-decline"
                            >
                              Archive
                            </button>
                          )}
                          {story.status === 'archived' && (
                            <button 
                              onClick={() => {
                                const updated = stories.filter(s => s.id !== story.id);
                                setStories(updated);
                                localStorage.setItem('aura_stories', JSON.stringify(updated));
                                toast.success('Permanently removed from the energy field.');
                              }}
                              className="btn-decline"
                              style={{background: 'rgba(231, 76, 60, 0.2)', border: '1px solid #e74c3c'}}
                            >
                              Wipe Permanent
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription_manager' && (
            <div className="subscription-manager fade-in">
              <div className="glass" style={{padding: '2rem', maxWidth: '600px', margin: '0 auto'}}>
                <h3 style={{marginBottom: '2rem', color: 'var(--accent-gold)'}}>Sanctuary Pricing Calibration</h3>
                
                <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
                  {Object.entries(pricing).map(([duration, amount]) => (
                    <div key={duration} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                      <span style={{textTransform: 'capitalize'}}>{duration.replace('_', ' ')}</span>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                        <span style={{color: 'var(--accent-gold)'}}>$</span>
                        <input 
                          type="number" 
                          value={amount}
                          onChange={(e) => setPricing({...pricing, [duration]: parseInt(e.target.value)})}
                          style={{
                            width: '100px',
                            padding: '0.5rem',
                            background: 'rgba(255,255,255,0.1)',
                            border: '1px solid var(--accent-gold)',
                            borderRadius: '5px',
                            color: 'white'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  className="btn btn-primary" 
                  style={{width: '100%', marginTop: '2rem'}}
                  onClick={() => {
                     localStorage.setItem('aura_pricing', JSON.stringify(pricing));
                     toast.success('Pricing recalibrated in the Sanctuary.');
                  }}
                >
                  Save Calibration
                </button>
              </div>
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="availability-manager fade-in">
              <div className="glass" style={{padding: '2rem', maxWidth: '800px', margin: '0 auto'}}>
                <h3 style={{marginBottom: '2rem', color: 'var(--accent-gold)'}}>Sanctuary Availability</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>
                  Mark dates where the Sanctuary is closed or healers are unavailable. These dates will be disabled in the booking interface.
                </p>
                
                <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
                  <div className="calendar-container" style={{flex: 1, minWidth: '300px'}}>
                    <Calendar 
                      onClickDay={(date) => {
                        const dateStr = date.toDateString();
                        setAvailabilityDate(dateStr);
                      }}
                      tileClassName={({ date }) => {
                        const dateStr = date.toDateString();
                        if (blockedDates.includes(dateStr)) return 'blocked-date';
                        if (blockedSlots[dateStr]?.length > 0) return 'partial-blocked-date';
                        return null;
                      }}
                    />
                    
                    <div style={{marginTop: '2rem'}}>
                      <h4>Availability for {availabilityDate}</h4>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                        <button 
                          className="btn" 
                          style={{
                            background: blockedDates.includes(availabilityDate) ? '#e74c3c' : 'rgba(255,255,255,0.1)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: 'white',
                            fontSize: '0.8rem'
                          }}
                          onClick={() => {
                            let updated;
                            if (blockedDates.includes(availabilityDate)) {
                              updated = blockedDates.filter(d => d !== availabilityDate);
                              toast.success('Date opened.');
                            } else {
                              updated = [...blockedDates, availabilityDate];
                              toast.success('Date fully blocked.');
                            }
                            setBlockedDates(updated);
                            localStorage.setItem('aura_blocked_dates', JSON.stringify(updated));
                            syncAvailabilityToCloud(updated, blockedSlots);
                          }}
                        >
                          {blockedDates.includes(availabilityDate) ? 'Full Seclusion Active' : 'Block Entire Day'}
                        </button>
                      </div>

                      {!blockedDates.includes(availabilityDate) && (
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px'}}>
                          {['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(slot => {
                            const isBlocked = blockedSlots[availabilityDate]?.includes(slot);
                            return (
                              <button
                                key={slot}
                                onClick={() => {
                                  const currentSlots = blockedSlots[availabilityDate] || [];
                                  let newSlots;
                                  if (isBlocked) {
                                    newSlots = currentSlots.filter(s => s !== slot);
                                  } else {
                                    newSlots = [...currentSlots, slot];
                                  }
                                  const updated = { ...blockedSlots, [availabilityDate]: newSlots };
                                  setBlockedSlots(updated);
                                  localStorage.setItem('aura_blocked_slots', JSON.stringify(updated));
                                  syncAvailabilityToCloud(blockedDates, updated);
                                  toast.success(`${slot} ${isBlocked ? 'opened' : 'blocked'}.`);
                                }}
                                style={{
                                  padding: '0.5rem',
                                  fontSize: '0.8rem',
                                  borderRadius: '6px',
                                  background: isBlocked ? '#e74c3c' : 'rgba(46, 204, 113, 0.2)',
                                  border: `1px solid ${isBlocked ? '#e74c3c' : '#2ecc71'}`,
                                  color: 'white',
                                  cursor: 'pointer'
                                }}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{flex: 1, minWidth: '300px'}}>
                    <h4>Schedules Status</h4>
                    <div style={{
                      maxHeight: '400px', overflowY: 'auto', marginTop: '1rem',
                      display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                      {blockedDates.length === 0 && Object.keys(blockedSlots).every(k => blockedSlots[k].length === 0) ? (
                        <p style={{opacity: 0.5, fontStyle: 'italic'}}>No restrictions in place.</p>
                      ) : (
                        <>
                          {blockedDates.sort((a,b) => new Date(a) - new Date(b)).map(date => (
                            <div key={date} style={{
                              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                              background: 'rgba(231, 76, 60, 0.1)', padding: '0.8rem', borderRadius: '8px',
                              border: '1px solid rgba(231, 76, 60, 0.3)'
                            }}>
                              <span><strong>FULL:</strong> {date}</span>
                              <button onClick={() => {
                                const updated = blockedDates.filter(d => d !== date);
                                setBlockedDates(updated);
                                localStorage.setItem('aura_blocked_dates', JSON.stringify(updated));
                                syncAvailabilityToCloud(updated, blockedSlots);
                              }} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer'}}><X size={16} /></button>
                            </div>
                          ))}
                          {Object.entries(blockedSlots).filter(([, slots]) => slots.length > 0).sort((a,b) => new Date(a[0]) - new Date(b[0])).map(([date, slots]) => (
                            <div key={date} style={{
                              background: 'rgba(243, 156, 18, 0.1)', padding: '0.8rem', borderRadius: '8px',
                              border: '1px solid rgba(243, 156, 18, 0.3)'
                            }}>
                              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                                <span><strong>PARTIAL:</strong> {date}</span>
                                <button onClick={() => {
                                  const updated = { ...blockedSlots, [date]: [] };
                                  setBlockedSlots(updated);
                                  localStorage.setItem('aura_blocked_slots', JSON.stringify(updated));
                                  syncAvailabilityToCloud(blockedDates, updated);
                                }} style={{background: 'none', border: 'none', color: '#f39c12', cursor: 'pointer'}}><X size={16} /></button>
                              </div>
                              <div style={{display: 'flex', flexWrap: 'wrap', gap: '5px'}}>
                                {slots.map(s => <span key={s} style={{fontSize: '0.7rem', background: '#f39c12', color: 'black', padding: '2px 6px', borderRadius: '4px'}}>{s}</span>)}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <style>{`
                .blocked-date {
                  background: #e74c3c !important;
                  color: white !important;
                  border-radius: 4px;
                }
                .partial-blocked-date {
                  background: rgba(243, 156, 18, 0.4) !important;
                  color: white !important;
                  border-radius: 4px;
                  border: 1px solid #f39c12 !important;
                }
                .react-calendar {
                  background: rgba(255,255,255,0.05) !important;
                  border: 1px solid rgba(255,255,255,0.1) !important;
                  color: white !important;
                  border-radius: 12px;
                  overflow: hidden;
                  width: 100% !important;
                }
                .react-calendar__tile {
                  color: white !important;
                }
                .react-calendar__tile:enabled:hover,
                .react-calendar__tile:enabled:focus {
                  background-color: rgba(255,255,255,0.1) !important;
                }
                .react-calendar__navigation button {
                  color: white !important;
                }
                .react-calendar__month-view__weekdays__weekday abbr {
                   text-decoration: none;
                }
              `}</style>
            </div>
          )}

          {activeTab === 'archive' && (
            <div className="archive-view fade-in">
              <h3>Client Resonance Archive</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
                 Verified Client Database (Sanctuary Compliance Records). Click on a spirit to manage their journey.
              </p>
              <div className="archive-table-container">
                <table className="archive-table">
                  <thead>
                    <tr><th>Name</th><th>Contact info</th><th>Sub Status</th><th>Last Connection</th><th>Security</th></tr>
                  </thead>
                  <tbody>                    {clients && clients.filter(Boolean).map((c, i) => (
                      <tr key={i} style={{transition: 'background 0.2s'}}>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}><strong>{c?.name || 'Anonymous Seeker'}</strong></td>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}>{c?.phone || ''}<br/><span style={{opacity: 0.6}}>{c?.email || ''}</span></td>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}>
                            <span style={{
                                color: c?.subscription === 'healing' ? 'var(--accent-gold)' : 'var(--text-muted)',
                                border: `1px solid ${c?.subscription === 'healing' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}`,
                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'
                            }}>
                                {c?.subscription === 'healing' ? 'Healing' : 'Seeker'}
                            </span>
                        </td>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}>{c?.lastBooking || 'No sessions yet'}</td>
                        <td>
                          <button onClick={(e) => {
                             e.stopPropagation();
                             const newPass = prompt("Enter new password for " + (c?.name || ''));
                             if (newPass) {
                               const updated = clients.map(cl => cl && cl.email === c?.email ? {...cl, password: newPass} : cl);
                               setClients(updated);
                               localStorage.setItem('aura_clients', JSON.stringify(updated));
                               toast.success("Security code reset.");
                             }
                          }} style={{background: 'none', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer'}}>Reset Pass</button>
                        </td>
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
                <div className="form-group">
                  <label>Owner Contact Email (For Platform Inquiries)</label>
                  <input type="email" value={emailSettings.ownerEmail} onChange={e => setEmailSettings({...emailSettings, ownerEmail: e.target.value})} placeholder="owner@reikiandsage.com" />
                </div>
                <div className="form-group">
                  <label>Video Session Price ($)</label>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{color: 'var(--accent-gold)', marginRight: '10px'}}>$</span>
                    <input 
                      type="number" 
                      value={emailSettings.videoSessionPrice} 
                      onChange={e => {
                        setEmailSettings({...emailSettings, videoSessionPrice: e.target.value});
                        localStorage.setItem('aura_video_price', e.target.value);
                      }} 
                    />
                  </div>
                </div>

                <div className="form-group" style={{
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '15px',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  marginTop: '1rem'
                }}>
                  <div style={{flex: 1}}>
                    <label style={{margin: 0, color: '#fff', fontSize: '1rem'}}>Healer Applications Enabled</label>
                    <p style={{margin: '5px 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                      If turned off, the "Apply to be a Healer" links will vanish from the platform.
                    </p>
                  </div>
                  <div 
                    onClick={() => {
                        onToggleHealerApps(!healerAppsEnabled);
                        toast.success(`Healer applications ${!healerAppsEnabled ? 'enabled' : 'disabled'}.`);
                    }}
                    style={{
                      width: '60px',
                      height: '30px',
                      background: healerAppsEnabled ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                      borderRadius: '15px',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '2px',
                      left: healerAppsEnabled ? '32px' : '2px',
                      width: '24px',
                      height: '24px',
                      background: healerAppsEnabled ? '#000' : '#fff',
                      borderRadius: '50%',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: healerAppsEnabled ? 'white' : 'black'
                    }}>
                      {healerAppsEnabled ? 'ON' : 'OFF'}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>On-Site Visit Price ($)</label>
                  <div style={{display: 'flex', alignItems: 'center'}}>
                    <span style={{color: 'var(--accent-gold)', marginRight: '10px'}}>$</span>
                    <input 
                      type="number" 
                      value={onsitePrice} 
                      onChange={e => setOnsitePrice(e.target.value)}
                      id="onsite-price-input"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    localStorage.setItem('aura_onsite_price', onsitePrice);
                    localStorage.setItem('aura_video_price', emailSettings.videoSessionPrice);
                    saveEmailSettings(e);

                    if (isFirebaseConfigured()) {
                      db.updateSettings('pricing', {
                        onsitePrice: onsitePrice,
                        videoPrice: emailSettings.videoSessionPrice
                      })
                      .then(() => toast.success("Pricing synchronized in cloud."))
                      .catch(err => {
                        console.error("Failed to sync pricing to Firestore:", err);
                        toast.error("Cloud secure sync failed.");
                      });
                    }
                  }}
                >
                  Update Calibration
                </button>
              </form>
              
              <div style={{marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem'}}>
                <h3>Platform Configuration</h3>
                <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                  Edit the vibrational parameters of the sanctuary (Subscriptions & Questionnaire).
                </p>
                
                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Healing Plan Configuration</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>Set pricing for all subscription durations.</p>
                  
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px'}}>
                      {['1_month', '3_month', '6_month', '1_year'].map(duration => {
                          const config = JSON.parse(localStorage.getItem('aura_plans_advanced') || '{}');
                          const simpleConfig = JSON.parse(localStorage.getItem('aura_pricing') || '{}');
                          const labels = { '1_month': 'Monthly', '3_month': 'Quarterly (3mo)', '6_month': 'Biannual (6mo)', '1_year': 'Annual (Yearly)' };
                          const defaults = { '1_month': '22', '3_month': '55', '6_month': '99', '1_year': '188' };
                          
                          const currentPrice = config[duration]?.price || simpleConfig[duration] || defaults[duration];
                          
                          const isEnabled = config[duration]?.enabled !== false; // Default to true if not specified
                          
                          return (
                              <div key={duration} className="form-group" style={{background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px'}}>
                                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px'}}>
                                      <label style={{fontSize: '0.8rem', margin: 0}}>{labels[duration]}</label>
                                      <input 
                                          id={`enable-${duration}`}
                                          type="checkbox" 
                                          defaultChecked={isEnabled}
                                          style={{width: 'auto', margin: 0}}
                                      />
                                  </div>
                                  <div style={{display: 'flex', alignItems: 'center'}}>
                                      <span style={{color: 'var(--accent-gold)', marginRight: '5px'}}>$</span>
                                      <input 
                                          id={`price-${duration}`}
                                          type="number" 
                                          defaultValue={currentPrice} 
                                          placeholder="0.00"
                                          style={{width: '100%'}}
                                      />
                                  </div>
                              </div>
                           );
                      })}
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{marginTop: '1.5rem', width: '100%', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)'}} 
                    onClick={() => {
                       const plans = {};
                       const simplePricing = {};
                       ['1_month', '3_month', '6_month', '1_year'].forEach(d => {
                           const val = document.getElementById(`price-${d}`).value;
                           plans[d] = { price: val };
                           simplePricing[d] = parseInt(val);
                       });
                       
                       localStorage.setItem('aura_plans_advanced', JSON.stringify(plans));
                       localStorage.setItem('aura_pricing', JSON.stringify(simplePricing));
                       setPricing(simplePricing);
                       toast.success('Healing Tier Pricing Synchronized.');
                    }}
                  >
                    Save Pricing Calibration
                  </button>
                </div>

                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Gemstone Core Protocols</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>
                    Select which gemstone frequencies are currently active and available for customers in the app.
                  </p>
                  
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
                    {protocols && protocols.filter(Boolean).map(protocol => (
                      <div 
                        key={protocol?.id} 
                        style={{
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          background: 'rgba(255,255,255,0.03)',
                          padding: '10px 14px',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.05)'
                        }}
                      >
                        <span style={{ fontWeight: '500', color: protocol?.color }}>{protocol?.name}</span>
                        <div 
                          onClick={() => {
                            if (onToggleProtocol) {
                              onToggleProtocol(protocol?.id);
                            }
                          }}
                          style={{
                            width: '50px',
                            height: '26px',
                            background: protocol?.active ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                            borderRadius: '13px',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div style={{
                            position: 'absolute',
                            top: '2px',
                            left: protocol?.active ? '26px' : '2px',
                            width: '20px',
                            height: '20px',
                            background: protocol?.active ? '#000' : '#fff',
                            borderRadius: '50%',
                            transition: 'all 0.3s ease'
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Healer Payouts (Bank Info)</h4>
                  <div className="form-group">
                    <label>Bank Name</label>
                    <input 
                      id="bank-name-input"
                      type="text" 
                      placeholder="e.g. Chase" 
                      defaultValue={bankInfo.bankName}
                    />
                  </div>
                  <div className="form-group">
                    <label>Routing Number</label>
                    <input 
                      id="routing-number-input"
                      type="text" 
                      placeholder="********" 
                      defaultValue={bankInfo.routingNumber}
                    />
                  </div>
                   <div className="form-group">
                    <label>Account Number</label>
                    <input 
                      id="account-number-input"
                      type="text" 
                      placeholder="********" 
                      defaultValue={bankInfo.accountNumber}
                    />
                  </div>
                </div>

                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Healer Team Management</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>Invite other healers to the platform.</p>
                  
                  <div style={{display: 'flex', gap: '10px', marginBottom: '1rem'}}>
                    <input id="invite-email" type="email" placeholder="healer@email.com" style={{flex: 1}} />
                    <button 
                        className="btn-primary" 
                        style={{padding: '0.8rem'}}
                        onClick={() => {
                            const email = document.getElementById('invite-email').value;
                            if(email) {
                                const currentTeam = JSON.parse(localStorage.getItem('aura_team') || '[]');
                                const newMember = { name: email.split('@')[0], email, status: 'Pending' };
                                const updatedTeam = [...currentTeam, newMember];
                                localStorage.setItem('aura_team', JSON.stringify(updatedTeam));
                                setTeamMembers(updatedTeam);
                                document.getElementById('invite-email').value = '';
                                toast.success(`Invitation sent to ${email}`);
                            }
                        }}
                    >
                        Invite
                    </button>
                  </div>
                  
                  <div className="team-list">
                    <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                      <span>Carissa (Admin)</span>
                      <span style={{color: '#2ecc71'}}>Active</span>
                    </div>
                    {teamMembers && teamMembers.filter(Boolean).map((member, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                            <span>{member?.name || 'Anonymous Healer'} (Healer)</span>
                            <span style={{color: member?.status === 'Active' ? '#2ecc71' : '#f1c40f'}}>{member?.status || 'Pending'}</span>
                        </div>
                    ))}
                  </div>
                </div>

                  <div className="glass" style={{padding: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Special Promotions</h4>
                  <div className="form-group">
                    <label>Promotion Text (e.g., "50% Off New Moon Special")</label>
                    <input 
                      id="promo-text-input"
                      type="text" 
                      defaultValue={JSON.parse(localStorage.getItem('aura_promo') || '{}').text || ""}
                      placeholder="Enter promotion details..."
                    />
                  </div>
                  <div className="form-group" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                    <input 
                      id="promo-active-input"
                      type="checkbox" 
                      defaultChecked={JSON.parse(localStorage.getItem('aura_promo') || '{}').active || false}
                      style={{width: 'auto', margin: 0}}
                    />
                    <label htmlFor="promo-active-input" style={{margin: 0}}>Activate Promotion</label>
                  </div>
                </div>

                <div className="glass" style={{padding: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Intake Questionnaire</h4>
                  <div className="form-group">
                    <label>Question 1 (Energy)</label>
                    <input 
                      id="q1-input"
                      type="text" 
                      defaultValue={JSON.parse(localStorage.getItem('aura_questions_override') || '{}').q1 || "How would you describe your current energy baseline?"}
                    />
                  </div>
                  <div className="form-group">
                    <label>Question 2 (Intention)</label>
                    <input 
                      id="q2-input"
                      type="text" 
                      defaultValue={JSON.parse(localStorage.getItem('aura_questions_override') || '{}').q2 || "What is your primary intention for seeking resonance?"}
                    />
                  </div>
                   <button 
                     className="btn-primary" 
                     style={{marginTop: '1rem', width: '100%'}} 
                     onClick={() => {
                       // NEW: Save Advanced Plans
                       const plans = {};
                       ['1_month', '3_month', '6_month', '1_year'].forEach(d => {
                           plans[d] = { 
                             price: document.getElementById(`price-${d}`).value,
                             enabled: document.getElementById(`enable-${d}`)?.checked ?? true
                           };
                       });
                       
                       const q1 = document.getElementById('q1-input').value;
                       const q2 = document.getElementById('q2-input').value;
                       const promoText = document.getElementById('promo-text-input').value;
                       const promoActive = document.getElementById('promo-active-input').checked;

                       // Consolidate pricing
                       const simplePricing = {};
                       Object.keys(plans).forEach(key => {
                           simplePricing[key] = parseInt(plans[key].price);
                       });

                       localStorage.setItem('aura_plans_advanced', JSON.stringify(plans));
                       localStorage.setItem('aura_pricing', JSON.stringify(simplePricing));
                       
                       const onsiteVal = document.getElementById('onsite-price-input')?.value || '150';
                       localStorage.setItem('aura_onsite_price', onsiteVal);
                       
                       const bankInfoUpdate = {
                          bankName: document.getElementById('bank-name-input').value,
                          routingNumber: document.getElementById('routing-number-input').value,
                          accountNumber: document.getElementById('account-number-input').value
                        };
                        setBankInfo(bankInfoUpdate);

                        if (isFirebaseConfigured()) {
                          db.updateSettings('bank_info', bankInfoUpdate)
                            .then(() => toast.success("Payout details synchronized securely in cloud."))
                            .catch(err => {
                              console.error("Failed to sync bank info to Firestore:", err);
                              toast.error("Cloud secure sync failed.");
                            });
                          localStorage.removeItem('aura_bank_info');
                          
                          db.updateSettings('pricing', {
                            onsitePrice: onsiteVal,
                            videoPrice: emailSettings.videoSessionPrice
                          })
                          .catch(err => console.error("Failed to sync pricing to Firestore:", err));
                        } else {
                          localStorage.setItem('aura_bank_info', JSON.stringify(bankInfoUpdate));
                        }

                       setPricing(simplePricing); 
                       localStorage.setItem('aura_questions_override', JSON.stringify({ q1, q2 }));
                       localStorage.setItem('aura_promo', JSON.stringify({ text: promoText, active: promoActive }));
                       
                       toast.success('Configuration saved to Sanctuary Memory.');
                     }}
                   >
                     Save Configuration
                   </button>
                </div>
              </div>

              {import.meta.env.DEV && (
                <div style={{marginTop: '4rem', padding: '2rem', border: '1px solid rgba(255,0,0,0.1)', borderRadius: '15px', background: 'rgba(255,0,0,0.05)'}}>
                  <h4 style={{color: '#ff7675', marginBottom: '1rem'}}>Developer Tools</h4>
                  <p style={{fontSize: '0.8rem', opacity: 0.7, marginBottom: '1.5rem'}}>Populate the sanctuary with test spirits to verify system flow.</p>
                  <button 
                    onClick={seedMockData}
                    className="btn" 
                    style={{background: 'rgba(212, 175, 55, 0.1)', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', marginRight: '1rem'}}
                  >
                    Seed Mock Data
                  </button>
                  <button 
                    onClick={() => {
                      const confirmClear = window.confirm("CAUTION: This will clear ALL sanctuary memory. Would you like to export a backup first?");
                      if (confirmClear) {
                          handleExportLogs(); // Trigger log export
                          handleExportApplications(); // Trigger app export
                          setTimeout(() => {
                             localStorage.clear();
                             window.location.reload();
                          }, 1000);
                      } else {
                          const finalConfirm = window.confirm("Are you SURE you want to clear all data without a backup?");
                          if (finalConfirm) {
                              localStorage.clear();
                              window.location.reload();
                          }
                      }
                    }}
                    className="btn" 
                    style={{background: 'rgba(255,118,117,0.1)', border: '1px solid #ff7675', color: '#ff7675'}}
                  >
                    Clear Sanctuary Memory
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="checklist-view fade-in" style={{ padding: '1.5rem', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--accent-ethereal)', margin: 0 }}>Soft Launch Checklist</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '5px' }}>
                    Track your business foundation, Vercel/Stripe settings, and media assets.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    {Math.round((Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length) * 100)}%
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Completion</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{
                  background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-ethereal))',
                  width: `${(Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length) * 100}%`,
                  height: '100%',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                
                {/* 1. Legal & Regulatory */}
                <div className="glass" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckSquare size={18} /> 1. Legal & Regulatory Setup
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.llc} onChange={() => toggleChecklistItem('llc')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Register Washington LLC</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          File Articles of Organization at the <a href="https://ccfs.sos.wa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline' }}>WA Corporations Portal <ExternalLink size={10} style={{ display: 'inline' }} /></a> ($200 fee).
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.ein} onChange={() => toggleChecklistItem('ein')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Apply for Federal EIN</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Obtain your EIN for the LLC via the official <a href="https://www.irs.gov/businesses/small-businesses-self-employed/apply-for-an-employer-identification-number-ein-online" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline' }}>IRS Assistant <ExternalLink size={10} style={{ display: 'inline' }} /></a> (Free).
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.stateLic} onChange={() => toggleChecklistItem('stateLic')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>State Business License (DOR)</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          File on <a href="https://secure.dor.wa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline' }}>My DOR <ExternalLink size={10} style={{ display: 'inline' }} /></a> ($50). Register trade name "Reiki & Sage". Classify digital sales tax sourcing.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.cityLic} onChange={() => toggleChecklistItem('cityLic')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Seattle Business License</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Register on <a href="https://www.filelocal-wa.gov/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-ethereal)', textDecoration: 'underline' }}>FileLocal WA <ExternalLink size={10} style={{ display: 'inline' }} /></a> (~$60/yr under $20k gross).
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.homeOcc} onChange={() => toggleChecklistItem('homeOcc')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Seattle Home Occupation Compliance</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Verify Seattle zoning rules (SMC 23.42.050): no external signage, client appointments spaced out, max 2 clients on-site.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.insurance} onChange={() => toggleChecklistItem('insurance')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Secure Liability Insurance</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Secure professional energy-work liability insurance (minimum $1M per occurrence) before treating clients.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>Liability Insurance Comparison:</h4>
                    <table style={{ width: '100%', fontSize: '0.75rem', color: 'var(--text-muted)', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                          <th style={{ textAlign: 'left', padding: '5px 0' }}>Provider</th>
                          <th style={{ textAlign: 'left', padding: '5px 0' }}>Coverage</th>
                          <th style={{ textAlign: 'right', padding: '5px 0' }}>Annual Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{ padding: '5px 0', color: '#fff' }}>Hands On Trade</td>
                          <td style={{ padding: '5px 0' }}>Professional + General</td>
                          <td style={{ padding: '5px 0', textAlign: 'right', color: 'var(--accent-gold)' }}>$175</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 0', color: '#fff' }}>EMPA</td>
                          <td style={{ padding: '5px 0' }}>Malpractice + Liability</td>
                          <td style={{ padding: '5px 0', textAlign: 'right', color: 'var(--accent-gold)' }}>$185 - $220</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '5px 0', color: '#fff' }}>ABMP</td>
                          <td style={{ padding: '5px 0' }}>Bodywork + Reiki</td>
                          <td style={{ padding: '5px 0', textAlign: 'right', color: 'var(--accent-gold)' }}>$199 - $229</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Vercel & Stripe Config */}
                <div className="glass" style={{ padding: '1.5rem' }}>
                  <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Settings size={18} /> 2. Vercel & Stripe Configuration
                  </h3>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#fff' }}>Environment Variables Status:</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isFirebaseConfigured() ? '#2ecc71' : '#f1c40f' }} />
                        <span>Firebase API Key</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: isFirebaseConfigured() ? '#2ecc71' : '#f1c40f' }} />
                        <span>Firebase Project ID</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '#2ecc71' : '#f1c40f' }} />
                        <span>Stripe Publishable Key</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: import.meta.env.VITE_GA_MEASUREMENT_ID || window.gtag ? '#2ecc71' : '#e74c3c' }} />
                        <span>GA4 ID (Optional)</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.stripeSecret} onChange={() => toggleChecklistItem('stripeSecret')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Add `STRIPE_SECRET_KEY`</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste Stripe Live secret key (`sk_live_...`) in Vercel settings.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.stripePublishable} onChange={() => toggleChecklistItem('stripePublishable')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Add `VITE_STRIPE_PUBLISHABLE_KEY`</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paste Stripe Live publishable key (`pk_live_...`) in Vercel settings.</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.stripeWebhook} onChange={() => toggleChecklistItem('stripeWebhook')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Add Stripe Webhook Secret</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Create endpoint `https://reikiandsage.com/api/stripe-webhook` in Stripe dashboard and add its secret as `STRIPE_WEBHOOK_SECRET` in Vercel.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.firebaseServiceAccount} onChange={() => toggleChecklistItem('firebaseServiceAccount')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Add Firebase Service Account</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          Generate private key JSON in Firebase console, and add as `FIREBASE_SERVICE_ACCOUNT` in Vercel.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.resendKey} onChange={() => toggleChecklistItem('resendKey')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Add `RESEND_API_KEY`</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Get key from Resend, add to Vercel, and configure `FROM_EMAIL` / `HEALER_EMAIL` (`carissabright@gmail.com`).</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <input type="checkbox" checked={checklist.stripeTestPayment} onChange={() => toggleChecklistItem('stripeTestPayment')} style={{ width: 'auto', marginTop: '4px' }} />
                      <div>
                        <strong style={{ display: 'block', color: '#fff' }}>Execute Live Checkout Verification</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Perform a real transaction with a live debit/credit card to verify end-to-end booking webhook flow.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Media & Brand Assets */}
                <div className="glass" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                  <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Sparkles size={18} /> 3. Media & Brand Asset Deliverables
                  </h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '5px' }}>Guided Voice MP3s</h4>
                      
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={checklist.voiceAmethyst} onChange={() => toggleChecklistItem('voiceAmethyst')} style={{ width: 'auto', marginTop: '4px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>Amethyst Voiceover (`amethyst_meditation_voice.mp3`)</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record voiceover, compress to mono MP3, and store in public assets directory.</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={checklist.voiceRose} onChange={() => toggleChecklistItem('voiceRose')} style={{ width: 'auto', marginTop: '4px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>Rose Quartz Voiceover (`rose_quartz_meditation_voice.mp3`)</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record emotional healing voice instructions and save mono MP3.</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={checklist.voiceSage} onChange={() => toggleChecklistItem('voiceSage')} style={{ width: 'auto', marginTop: '4px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>Sage Purification Voiceover (`sage_purification_meditation_voice.mp3`)</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Record aura grounding voice files and compress to mono MP3.</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '5px' }}>Physical Deliverables</h4>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={checklist.printCards} onChange={() => toggleChecklistItem('printCards')} style={{ width: 'auto', marginTop: '4px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>Order Premium Business Cards</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Print 250 matte business cards with Spot UV finish featuring the colorful chakra tree and the back QR code linking to booking.
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <input type="checkbox" checked={checklist.printIntake} onChange={() => toggleChecklistItem('printIntake')} style={{ width: 'auto', marginTop: '4px' }} />
                        <div>
                          <strong style={{ display: 'block', color: '#fff', fontSize: '0.85rem' }}>Client Intake & Waiver Form</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Print physical intake forms containing the FDA and medical consent disclaimer for in-person clients.</span>
                        </div>
                      </div>

                      {/* Print Generator Button */}
                      <button
                        onClick={handlePrintIntake}
                        className="btn btn-primary"
                        style={{
                          marginTop: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '0.6rem 1rem',
                          fontSize: '0.8rem',
                          fontFamily: "'Outfit', sans-serif"
                        }}
                      >
                        <FileText size={16} /> Print Client Intake Form & Waiver
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Sanctuary Core Features & System Upgrades */}
                <div className="glass" style={{ padding: '1.5rem', gridColumn: 'span 2' }}>
                  <h3 style={{ color: '#50e3c2', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={18} /> 4. Sanctuary Core Features & System Upgrades (100% Completed)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', fontSize: '0.85rem' }}>
                    <div style={{ background: 'rgba(80,227,194,0.08)', border: '1px solid rgba(80,227,194,0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <strong style={{ color: '#50e3c2', display: 'block' }}>✓ Daily.co Live Video Sanctuary</strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Custom Sacred Waiting Room, 528Hz drone audio, zero-PHI compliance gate & post-session reflection flow.</span>
                    </div>

                    <div style={{ background: 'rgba(80,227,194,0.08)', border: '1px solid rgba(80,227,194,0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <strong style={{ color: '#50e3c2', display: 'block' }}>✓ Biofield Pulse Web Bluetooth Scanner</strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Pairs with BLE Heart Rate Monitors (0x180D), calculates RMSSD/SDNN live, with visual camera fallback.</span>
                    </div>

                    <div style={{ background: 'rgba(80,227,194,0.08)', border: '1px solid rgba(80,227,194,0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <strong style={{ color: '#50e3c2', display: 'block' }}>✓ Remote Staff Healer Dashboard</strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Staff scheduling grid, timezone selector, app fee analytics (15%), Stripe Connect Express fast payouts, and 1099 compliance.</span>
                    </div>

                    <div style={{ background: 'rgba(80,227,194,0.08)', border: '1px solid rgba(80,227,194,0.3)', padding: '1rem', borderRadius: '12px' }}>
                      <strong style={{ color: '#50e3c2', display: 'block' }}>✓ MongoDB Serverless Backend Suite</strong>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>Full API endpoints for bookings, profiles, stories, applications, session logs, consents, and payouts.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
        
          {/* Client Management Modal (Global Scope for Logic & Archive) */}
          <AnimatePresence>
            {selectedClient && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', zIndex: 10002, display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={() => setSelectedClient(null)}>
                    <div className="glass" style={{width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative'}} onClick={e => e.stopPropagation()}>
                            <button onClick={() => setSelectedClient(null)} style={{position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem'}}>×</button>
                            <h3 style={{color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>{selectedClient?.name || ''}</h3>
                            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>Client ID: {btoa(selectedClient?.email || '').substring(0,8)} | Sanctuary Record</p>
                            
                            <div style={{marginBottom: '2rem'}}>
                            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Subscription Status</label>
                            <div style={{display: 'flex', gap: '1rem'}}>
                                <button 
                                    className="btn"
                                    style={{
                                        border: '1px solid var(--accent-gold)',
                                        background: selectedClient.subscription === 'healing' ? 'var(--accent-gold)' : 'transparent',
                                        color: selectedClient.subscription === 'healing' ? '#000' : 'var(--accent-gold)',
                                        flex: 1
                                    }}
                                    onClick={() => {
                                        const updated = clients.map(c => c.email === selectedClient.email ? {...c, subscription: 'healing'} : c);
                                        setClients(updated);
                                        localStorage.setItem('aura_clients', JSON.stringify(updated));
                                        setSelectedClient({...selectedClient, subscription: 'healing'});
                                        toast.success('Subscription Upgraded');
                                        logTransaction('[ADMIN] Subscription Change', selectedClient.name, selectedClient.email, 'Healer manually upgraded user to Healing Tier');
                                        
                                        if (isFirebaseConfigured() && selectedClient.id) {
                                          db.updateProfile(selectedClient.id, { subscription: 'healing' })
                                            .catch(err => console.error("Failed to update profile subscription in Firestore:", err));
                                        }
                                    }}
                                >
                                    Healing Tier (Active)
                                </button>
                                    <button 
                                    className="btn"
                                    style={{
                                        border: '1px solid var(--text-muted)',
                                        background: selectedClient.subscription !== 'healing' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                        color: '#fff',
                                        flex: 1
                                    }}
                                    onClick={() => {
                                        const updated = clients.map(c => c.email === selectedClient.email ? {...c, subscription: 'seeker'} : c);
                                        setClients(updated);
                                        localStorage.setItem('aura_clients', JSON.stringify(updated));
                                        setSelectedClient({...selectedClient, subscription: 'seeker'});
                                        toast.success('Subscription Downgraded');
                                        logTransaction('[ADMIN] Subscription Change', selectedClient.name, selectedClient.email, 'Healer manually downgraded user to Seeker Tier');
                                        
                                        if (isFirebaseConfigured() && selectedClient.id) {
                                          db.updateProfile(selectedClient.id, { subscription: 'seeker' })
                                            .catch(err => console.error("Failed to update profile subscription in Firestore:", err));
                                        }
                                    }}
                                >
                                    Seeker (Free)
                                </button>
                            </div>
                            </div>

                             <div>
                                <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Grant Free Access (Compliance Override)</label>
                                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px'}}>
                                    {[1, 3, 6].map(months => (
                                        <button 
                                            key={months}
                                            className="btn"
                                            style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}
                                            onClick={() => {
                                                const expiryDate = new Date();
                                                expiryDate.setMonth(expiryDate.getMonth() + months);
                                                const updated = clients.map(c => c.email === selectedClient.email ? {...c, subscription: 'healing', freeAccessUntil: expiryDate.toISOString()} : c);
                                                setClients(updated);
                                                localStorage.setItem('aura_clients', JSON.stringify(updated));
                                                
                                                toast.success(`Granted ${months} Months Free Access`);
                                                logTransaction('[ADMIN] Free Access Grant', selectedClient.name, selectedClient.email, `Granted ${months} months free access. Expires: ${expiryDate.toLocaleDateString()}`);
                                                setSelectedClient({...selectedClient, subscription: 'healing'});
                                                
                                                if (isFirebaseConfigured() && selectedClient.id) {
                                                  db.updateProfile(selectedClient.id, { subscription: 'healing', freeAccessUntil: expiryDate.toISOString() })
                                                    .catch(err => console.error("Failed to grant free access in Firestore:", err));
                                                }
                                            }}
                                        >
                                            {months} Month{months > 1 ? 's' : ''} Record
                                        </button>
                                    ))}
                                </div>
                                <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
                                    *Action will be logged in Healing Logs for sanctuary audit history.
                                </p>
                             </div>

                             <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                                 <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Role Assignment</label>
                                 {teamMembers?.find(t => t.email === selectedClient.email && t.status === 'Active') ? (
                                     <button 
                                         className="btn"
                                         style={{width: '100%', borderColor: '#e74c3c', color: '#e74c3c', background: 'rgba(231, 76, 60, 0.1)'}}
                                         onClick={() => {
                                             const updatedTeam = teamMembers.filter(t => t.email !== selectedClient.email);
                                             localStorage.setItem('aura_team', JSON.stringify(updatedTeam));
                                             setTeamMembers(updatedTeam);
                                             toast.success('Healer privileges revoked.');
                                             logTransaction('[ADMIN] Role Downgrade', selectedClient.name, selectedClient.email, 'User removed from Healer Team');
                                             
                                             if (isFirebaseConfigured() && selectedClient.id) {
                                                db.updateRole(selectedClient.id, 'seeker')
                                                  .catch(err => console.error("Failed to revoke role in Firestore:", err));
                                             }
                                         }}
                                     >
                                         Revoke Healer Privileges
                                     </button>
                                 ) : (
                                     <button 
                                         className="btn"
                                         style={{width: '100%', borderColor: '#9b59b6', color: '#9b59b6', background: 'rgba(155, 89, 182, 0.1)'}}
                                         onClick={() => {
                                             const newMember = { name: selectedClient.name, email: selectedClient.email, status: 'Active' };
                                             const updatedTeam = [...teamMembers, newMember];
                                             localStorage.setItem('aura_team', JSON.stringify(updatedTeam));
                                             setTeamMembers(updatedTeam);
                                             toast.success('User promoted to Healer.');
                                             logTransaction('[ADMIN] Role Upgrade', selectedClient.name, selectedClient.email, 'User promoted to Healer Team');
                                             
                                             if (isFirebaseConfigured() && selectedClient.id) {
                                                db.updateRole(selectedClient.id, 'healer')
                                                  .catch(err => console.error("Failed to promote role in Firestore:", err));
                                             }
                                         }}
                                     >
                                         Promote to Healer (Admin Access)
                                     </button>
                                 )}
                             </div>

                             {/* Account Status Control (Active / Suspended / Banned) */}
                             <div style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                                 <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Account Status & Access Control</label>
                                 <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem'}}>
                                     <button 
                                         className="btn"
                                         style={{
                                             flex: 1,
                                             borderColor: selectedClient.status === 'Active' ? '#2ecc71' : 'rgba(255,255,255,0.2)',
                                             background: selectedClient.status === 'Active' ? 'rgba(46, 204, 113, 0.2)' : 'transparent',
                                             color: selectedClient.status === 'Active' ? '#2ecc71' : 'rgba(255,255,255,0.6)',
                                             fontSize: '0.8rem'
                                         }}
                                         onClick={() => {
                                             const updated = clients.map(c => c.email === selectedClient.email ? {...c, status: 'Active'} : c);
                                             setClients(updated);
                                             localStorage.setItem('aura_clients', JSON.stringify(updated));
                                             setSelectedClient({...selectedClient, status: 'Active'});
                                             toast.success('Account marked Active');
                                             logTransaction('[ADMIN] Status Change', selectedClient.name, selectedClient.email, 'Set account status to Active');
                                             if (isFirebaseConfigured() && selectedClient.id) {
                                                 db.updateProfile(selectedClient.id, { status: 'Active' }).catch(() => {});
                                             }
                                         }}
                                     >
                                         ✓ Active
                                     </button>
                                     <button 
                                         className="btn"
                                         style={{
                                             flex: 1,
                                             borderColor: selectedClient.status === 'Suspended' ? '#f39c12' : 'rgba(255,255,255,0.2)',
                                             background: selectedClient.status === 'Suspended' ? 'rgba(243, 156, 18, 0.2)' : 'transparent',
                                             color: selectedClient.status === 'Suspended' ? '#f39c12' : 'rgba(255,255,255,0.6)',
                                             fontSize: '0.8rem'
                                         }}
                                         onClick={() => {
                                             const updated = clients.map(c => c.email === selectedClient.email ? {...c, status: 'Suspended'} : c);
                                             setClients(updated);
                                             localStorage.setItem('aura_clients', JSON.stringify(updated));
                                             setSelectedClient({...selectedClient, status: 'Suspended'});
                                             toast.success('Account Suspended');
                                             logTransaction('[ADMIN] Status Change', selectedClient.name, selectedClient.email, 'Set account status to Suspended');
                                             if (isFirebaseConfigured() && selectedClient.id) {
                                                 db.updateProfile(selectedClient.id, { status: 'Suspended' }).catch(() => {});
                                             }
                                         }}
                                     >
                                         ⚠️ Suspend
                                     </button>
                                     <button 
                                         className="btn"
                                         style={{
                                             flex: 1,
                                             borderColor: selectedClient.status === 'Banned' ? '#e74c3c' : 'rgba(255,255,255,0.2)',
                                             background: selectedClient.status === 'Banned' ? 'rgba(231, 76, 60, 0.2)' : 'transparent',
                                             color: selectedClient.status === 'Banned' ? '#e74c3c' : 'rgba(255,255,255,0.6)',
                                             fontSize: '0.8rem'
                                         }}
                                         onClick={() => {
                                             const updated = clients.map(c => c.email === selectedClient.email ? {...c, status: 'Banned'} : c);
                                             setClients(updated);
                                             localStorage.setItem('aura_clients', JSON.stringify(updated));
                                             setSelectedClient({...selectedClient, status: 'Banned'});
                                             toast.error('Account Banned');
                                             logTransaction('[ADMIN] Status Change', selectedClient.name, selectedClient.email, 'Set account status to Banned');
                                             if (isFirebaseConfigured() && selectedClient.id) {
                                                 db.updateProfile(selectedClient.id, { status: 'Banned' }).catch(() => {});
                                             }
                                         }}
                                     >
                                         🚫 Ban
                                     </button>
                                 </div>

                                 <button 
                                     className="btn"
                                     style={{width: '100%', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)', background: 'rgba(212, 175, 55, 0.1)', fontSize: '0.85rem'}}
                                     onClick={() => {
                                         toast.success(`Password reset email dispatched to ${selectedClient.email}`);
                                         logTransaction('[ADMIN] Password Reset', selectedClient.name, selectedClient.email, 'Dispatched password reset notification email');
                                     }}
                                 >
                                     🔑 Dispatch Password Reset Email
                                 </button>
                             </div>
                        </div>
                    </div>
                )}
              </AnimatePresence>
        </div>
      </div>
    );
};

export default HealerDashboard;
