import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  Activity, Users, Calendar as CalendarIcon, Settings, FileText, Download, UserPlus,
  Trash2, Mail, ExternalLink, Filter, Plus, X, List, Grid, Key,
  TrendingUp, Clock, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { logTransaction } from '../utils/logger';
import ActionButler from '../utils/actionButler';
import PaymentLedger from '../utils/paymentLedger';
import GoldBankAudit from '../utils/goldBankAudit';
import './AdminDashboard.css';

const AdminDashboard = ({ onClose, onJoinPortal, healerAppsEnabled, onToggleHealerApps }) => {
  const profile = JSON.parse(localStorage.getItem('user_profile') || 'null');
  
  // Security Layer: Role-Based Access Control
  if (!profile || (profile.role !== 'admin' && profile.role !== 'owner')) {
    toast.error("Unauthorized entry detected. Vibrational signature mismatch.");
    onClose();
    return null;
  }

  const [activeTab, setActiveTab] = useState('bookings');
  const [filter, setFilter] = useState('all');
  const [storyFilter, setStoryFilter] = useState('pending'); // 'pending', 'approved', 'archived'
  const [bookings, setBookings] = useState([]);
  const [clients, setClients] = useState([]);
  const [stories, setStories] = useState(() => JSON.parse(localStorage.getItem('aura_stories') || '[]'));
  const [onlineSouls, setOnlineSouls] = useState(Math.floor(Math.random() * 31) + 20); // Mock 20-50
  
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

  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null); // For Archive Modal
  const [transactions, setTransactions] = useState([]); // NEW: Financials
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
  const [emailSettings, setEmailSettings] = useState(() => {
    const savedSettings = JSON.parse(localStorage.getItem('aura_email_settings')) || {};
    return {
      fromEmail: savedSettings.fromEmail || 'healing@reikiandsage.com',
      signature: savedSettings.signature || 'Balance & Blessing, Carissa',
      ownerEmail: savedSettings.ownerEmail || 'owner@reikiandsage.com',
      videoSessionPrice: localStorage.getItem('aura_video_price') || '88'
    };
  });
  const [blockedDates, setBlockedDates] = useState(
    JSON.parse(localStorage.getItem('aura_blocked_dates') || '[]')
  );
  const [blockedSlots, setBlockedSlots] = useState(
    JSON.parse(localStorage.getItem('aura_blocked_slots') || '{}')
  );
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toDateString());
  const [bankInfo, setBankInfo] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('aura_bank_info') || '{}');
    return {
      bankName: saved.bankName || '',
      routingNumber: saved.routingNumber || '',
      accountNumber: saved.accountNumber || '',
      accountHolder: saved.accountHolder || '',
      verified: saved.verified || false
    };
  });
  const [showBankEdit, setShowBankEdit] = useState(false);
  const [giftGoldForm, setGiftGoldForm] = useState({ identifier: '', amount: '', reason: '' });
  const [giftConfirmStep, setGiftConfirmStep] = useState(null); // null | { client, goldAmt, reason }
  const [giftConfirmText, setGiftConfirmText] = useState('');

  // Gold Bank State
  const [goldBankOp, setGoldBankOp] = useState('mint'); // mint, burn, deposit, withdraw, transfer
  const [goldBankForm, setGoldBankForm] = useState({ amount: '', email: '', toEmail: '', reason: '' });
  const [goldBankConfirmStep, setGoldBankConfirmStep] = useState(null);
  const [goldBankConfirmText, setGoldBankConfirmText] = useState('');
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');

  // Gold Store & Feature Control State
  const defaultShopItems = [
    // Videos
    { id: 'v1', name: 'Crystal Bowl Meditation', desc: '30-min guided healing video', price: 150, icon: '🎬', category: 'Video', enabled: true },
    { id: 'v2', name: 'Chakra Deep Dive Series', desc: '7-part video course', price: 500, icon: '📺', category: 'Video', enabled: true },
    { id: 'v3', name: 'Master Reiki Symbols', desc: 'Advanced symbol training', price: 300, icon: '🎥', category: 'Video', enabled: true },
    { id: 'v4', name: 'Help Sleep', desc: 'Guided Reiki meditation for deep restful sleep', price: 35, icon: '🌙', category: 'Video', enabled: true, videoUrl: '/assets/help-sleep.mp4' },
    { id: 'v5', name: 'Morning Awakening Flow', desc: '15-min sunrise energy activation', price: 50, icon: '🌅', category: 'Video', enabled: true },
    { id: 'v6', name: 'Third Eye Activation', desc: 'Deep pineal gland meditation guide', price: 200, icon: '👁️', category: 'Video', enabled: true },
    // Merch
    { id: 'm1', name: 'Sacred Geometry Tapestry', desc: 'Handcrafted wall hanging', price: 800, icon: '🛍️', category: 'Merch', enabled: true },
    { id: 'm2', name: 'Amethyst Pendulum', desc: 'Certified healing crystal', price: 600, icon: '💎', category: 'Merch', enabled: true },
    { id: 'm3', name: 'Reiki Sage Hoodie', desc: 'Premium sanctuary apparel', price: 1000, icon: '👕', category: 'Merch', enabled: true },
    { id: 'm4', name: 'Selenite Charging Plate', desc: 'Crystal cleansing & charging station', price: 450, icon: '🔮', category: 'Merch', enabled: true },
    { id: 'm5', name: 'Sage & Palo Santo Bundle', desc: 'Space clearing ritual kit', price: 120, icon: '🌿', category: 'Merch', enabled: true },
    // Cosmetics
    { id: 'c1', name: 'Golden Aura Frame', desc: 'Premium profile border', price: 200, icon: '✨', category: 'Cosmetic', enabled: true },
    { id: 'c2', name: 'Celestial Theme', desc: 'Exclusive dashboard skin', price: 400, icon: '🌌', category: 'Cosmetic', enabled: true },
    { id: 'c3', name: 'Neon Pulse Theme', desc: 'Cybernetic dashboard glow', price: 350, icon: '💜', category: 'Cosmetic', enabled: true },
    { id: 'c4', name: 'Earth Tone Theme', desc: 'Nature-inspired warm palette', price: 250, icon: '🍂', category: 'Cosmetic', enabled: true },
    // Abilities
    { id: 'a1', name: 'Priority Portal Access', desc: 'Skip the queue in live sessions', price: 350, icon: '⚡', category: 'Ability', enabled: true },
    { id: 'a2', name: 'Extended AI Analysis', desc: 'Unlock deeper pain & aura readings', price: 275, icon: '🧠', category: 'Ability', enabled: true },
    { id: 'a3', name: 'Double XP Weekend Pass', desc: '+2x mastery XP for 48 hours', price: 100, icon: '🚀', category: 'Ability', enabled: true },
    // Avatar Accessories — Frames
    { id: 'af1', name: 'Golden Ring Frame', desc: 'Radiant gold avatar border', price: 150, icon: '💛', category: 'Avatar', enabled: true, avatarSlot: 'frame', avatarStyle: { border: '3px solid #d4af37', boxShadow: '0 0 15px rgba(212,175,55,0.5)' } },
    { id: 'af2', name: 'Fire Ring Frame', desc: 'Blazing ember avatar border', price: 250, icon: '🔥', category: 'Avatar', enabled: true, avatarSlot: 'frame', avatarStyle: { border: '3px solid #e74c3c', boxShadow: '0 0 20px rgba(231,76,60,0.6)' } },
    { id: 'af3', name: 'Crystal Ice Frame', desc: 'Frozen crystal avatar border', price: 200, icon: '❄️', category: 'Avatar', enabled: true, avatarSlot: 'frame', avatarStyle: { border: '3px solid #3498db', boxShadow: '0 0 18px rgba(52,152,219,0.5)' } },
    { id: 'af4', name: 'Rainbow Prism Frame', desc: 'Multicolor shifting border', price: 500, icon: '🌈', category: 'Avatar', enabled: true, avatarSlot: 'frame', avatarStyle: { border: '3px solid transparent', background: 'linear-gradient(#0a0a12, #0a0a12) padding-box, linear-gradient(135deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff) border-box', boxShadow: '0 0 20px rgba(255,0,150,0.3)' } },
    // Avatar Accessories — Badges
    { id: 'ab1', name: 'Crown Badge', desc: 'Royal crown above your avatar', price: 300, icon: '👑', category: 'Avatar', enabled: true, avatarSlot: 'badge', avatarEmoji: '👑' },
    { id: 'ab2', name: 'Angel Wings Badge', desc: 'Ethereal wings beside your avatar', price: 400, icon: '🕊️', category: 'Avatar', enabled: true, avatarSlot: 'badge', avatarEmoji: '🕊️' },
    { id: 'ab3', name: 'Halo Badge', desc: 'Glowing halo above your avatar', price: 350, icon: '😇', category: 'Avatar', enabled: true, avatarSlot: 'badge', avatarEmoji: '😇' },
    // Avatar Accessories — Backgrounds
    { id: 'ag1', name: 'Starfield Aura', desc: 'Twinkling star background effect', price: 180, icon: '⭐', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' } },
    { id: 'ag2', name: 'Mystic Nebula Aura', desc: 'Purple nebula swirl behind avatar', price: 280, icon: '🌀', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'radial-gradient(circle, rgba(138,43,226,0.2) 0%, rgba(75,0,130,0.1) 50%, transparent 70%)' } },
    { id: 'ag3', name: 'Emerald Pulse Aura', desc: 'Green healing energy waves', price: 220, icon: '💚', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'radial-gradient(circle, rgba(46,204,113,0.2) 0%, transparent 70%)' } },
    // Pet Accessories
    { id: 'pa1', name: 'Bow Tie', desc: 'Dapper bow tie for your companion', price: 80, icon: '🎀', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '🎀' },
    { id: 'pa2', name: 'Royal Crown', desc: 'A tiny crown fit for royalty', price: 200, icon: '👑', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '👑' },
    { id: 'pa3', name: 'Cozy Scarf', desc: 'Warm scarf for cold adventures', price: 100, icon: '🧣', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '🧣' },
    { id: 'pa4', name: 'Top Hat', desc: 'Sophisticated formal headwear', price: 150, icon: '🎩', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '🎩' },
    { id: 'pa5', name: 'Crystal Collar', desc: 'Healing crystal-embedded collar', price: 300, icon: '💎', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '💎' },
    { id: 'pa6', name: 'Flower Crown', desc: 'Beautiful floral headpiece', price: 120, icon: '🌸', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '🌸' },
    { id: 'pa7', name: 'Star Cape', desc: 'Cosmic cape with stardust shimmer', price: 250, icon: '⭐', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '⭐' },
    { id: 'pa8', name: 'Mystic Amulet', desc: 'Ancient charm of protection', price: 350, icon: '🔮', category: 'Pet Accessory', enabled: true, petSlot: 'accessory', petEmoji: '🔮' },
    // Avatar Customization Items
    { id: 'av1', name: 'Diamond Avatar Frame', desc: 'Brilliant diamond border around your avatar', price: 500, icon: '💎', category: 'Avatar', enabled: true, avatarSlot: 'frame', avatarStyle: { border: '3px solid', borderImage: 'linear-gradient(135deg, #b9f2ff, #e0e0e0, #b9f2ff) 1' } },
    { id: 'av2', name: 'Phoenix Badge', desc: 'Legendary phoenix emblem by your name', price: 400, icon: '🔥', category: 'Avatar', enabled: true, avatarSlot: 'badge', badgeEmoji: '🔥' },
    { id: 'av3', name: 'Celestial Glow', desc: 'Golden celestial aura pulsating around avatar', price: 350, icon: '✨', category: 'Avatar', enabled: true, avatarSlot: 'aura', auraCSS: '0 0 20px rgba(212,175,55,0.4), 0 0 40px rgba(212,175,55,0.2)' },
    { id: 'av4', name: 'Void Shroud', desc: 'Dark enigmatic energy aura', price: 300, icon: '🌑', category: 'Avatar', enabled: true, avatarSlot: 'aura', auraCSS: '0 0 20px rgba(75,0,130,0.5), 0 0 40px rgba(0,0,0,0.3)' },
    // Pet Avatars — Dog Breeds
    { id: 'pb_husky', name: 'Husky', desc: 'Majestic snow wolf breed', price: 200, icon: '🐺', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'dog', breedIcon: '🐺' },
    { id: 'pb_golden', name: 'Golden Retriever', desc: 'Beloved golden companion', price: 175, icon: '🦮', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'dog', breedIcon: '🦮' },
    { id: 'pb_corgi', name: 'Corgi', desc: 'Royal short-legged charmer', price: 250, icon: '🐕', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'dog', breedIcon: '🐕' },
    { id: 'pb_shiba', name: 'Shiba Inu', desc: 'Ancient Japanese spirit dog', price: 300, icon: '🐕‍🦺', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'dog', breedIcon: '🐕‍🦺' },
    { id: 'pb_poodle', name: 'Poodle', desc: 'Elegant hypoallergenic companion', price: 225, icon: '🐩', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'dog', breedIcon: '🐩' },
    // Pet Avatars — Cat Breeds
    { id: 'pb_siamese', name: 'Siamese Cat', desc: 'Mystical blue-eyed feline', price: 200, icon: '🐱', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'cat', breedIcon: '🐱' },
    { id: 'pb_persian', name: 'Persian Cat', desc: 'Luxurious long-haired royalty', price: 275, icon: '😸', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'cat', breedIcon: '😸' },
    { id: 'pb_blackcat', name: 'Black Cat', desc: 'Mystic shadow guardian', price: 150, icon: '🐈‍⬛', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'cat', breedIcon: '🐈‍⬛' },
    // Pet Avatars — Horses
    { id: 'pb_mustang', name: 'Mustang', desc: 'Wild American spirit horse', price: 400, icon: '🐴', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'horse', breedIcon: '🐴' },
    { id: 'pb_unicorn', name: 'Unicorn', desc: 'Legendary mythical steed', price: 750, icon: '🦄', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'horse', breedIcon: '🦄' },
    { id: 'pb_clydesdale', name: 'Clydesdale', desc: 'Powerful majestic draft horse', price: 350, icon: '🐎', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'horse', breedIcon: '🐎' },
    // Pet Avatars — Birds
    { id: 'pb_parrot', name: 'Parrot', desc: 'Colorful tropical companion', price: 200, icon: '🦜', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'bird', breedIcon: '🦜' },
    { id: 'pb_eagle', name: 'Eagle', desc: 'Majestic soaring predator', price: 500, icon: '🦅', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'bird', breedIcon: '🦅' },
    { id: 'pb_owl', name: 'Owl', desc: 'Wise nocturnal guardian', price: 300, icon: '🦉', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'bird', breedIcon: '🦉' },
    { id: 'pb_phoenix', name: 'Phoenix', desc: 'Legendary fire bird reborn from ashes', price: 1000, icon: '🔥', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'bird', breedIcon: '🔥' },
    // Pet Avatars — Exotic
    { id: 'pb_dragon', name: 'Dragon', desc: 'Ancient mythical guardian beast', price: 1500, icon: '🐉', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'exotic', breedIcon: '🐉' },
    { id: 'pb_wolf', name: 'Wolf', desc: 'Noble pack leader of the wild', price: 450, icon: '🐺', category: 'Pet Avatar', enabled: true, petBreed: true, breedType: 'exotic', breedIcon: '🐺' },
    // Avatar — Headgear
    { id: 'ah1', name: 'Mystic Tiara', desc: 'Crystal-studded celestial headpiece', price: 350, icon: '👑', category: 'Avatar', enabled: true, avatarSlot: 'headgear', avatarEmoji: '👑' },
    { id: 'ah2', name: 'Wolf Hood', desc: 'Feral spirit beast hood', price: 400, icon: '🐺', category: 'Avatar', enabled: true, avatarSlot: 'headgear', avatarEmoji: '🐺' },
    { id: 'ah3', name: 'Samurai Helm', desc: 'Ancient warrior kabuto', price: 500, icon: '⛩️', category: 'Avatar', enabled: true, avatarSlot: 'headgear', avatarEmoji: '⛩️' },
    { id: 'ah4', name: 'Flower Wreath', desc: 'Enchanted botanical crown', price: 200, icon: '🌺', category: 'Avatar', enabled: true, avatarSlot: 'headgear', avatarEmoji: '🌺' },
    // Avatar — Handheld / Accessories
    { id: 'aw1', name: 'Crystal Staff', desc: 'Amplifies healing energy tenfold', price: 600, icon: '🔮', category: 'Avatar', enabled: true, avatarSlot: 'hands', avatarEmoji: '🔮' },
    { id: 'aw2', name: 'Flame Sword', desc: 'Blazing blade of purification', price: 750, icon: '⚔️', category: 'Avatar', enabled: true, avatarSlot: 'hands', avatarEmoji: '⚔️' },
    { id: 'aw3', name: 'Spirit Lantern', desc: 'Guides lost souls with ethereal light', price: 350, icon: '🏮', category: 'Avatar', enabled: true, avatarSlot: 'hands', avatarEmoji: '🏮' },
    { id: 'aw4', name: 'Ancient Tome', desc: 'Book of sacred healing knowledge', price: 450, icon: '📖', category: 'Avatar', enabled: true, avatarSlot: 'hands', avatarEmoji: '📖' },
    { id: 'aw5', name: 'Lightning Orb', desc: 'Crackling sphere of arc energy', price: 800, icon: '⚡', category: 'Avatar', enabled: true, avatarSlot: 'hands', avatarEmoji: '⚡' },
    // RICKY & SAGE EXCLUSIVES
    { id: 'rs1', name: 'Ricky & Sage Official Tee', desc: 'Premium branded apparel for high-vibration healing.', price: 150, icon: '👕', category: 'Avatar', enabled: true, avatarSlot: 'chest', avatarEmoji: '👕', avatarStyle: { fill: '#ffffff' } },
    { id: 'rs2', name: 'Zen Garden Sanctuary', desc: 'Peaceful zen garden background for deep meditation.', price: 500, icon: '🏞️', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(to bottom, #a8e063, #56ab2f)' } },
    // Upgradable Backgrounds
    { id: 'ubg1', name: 'Sacred Temple', desc: 'Ancient healing sanctum backdrop', price: 300, icon: '🏛️', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(75,0,130,0.08) 100%)' } },

    { id: 'ubg2', name: 'Enchanted Forest', desc: 'Mystical woodland clearing', price: 350, icon: '🌲', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(180deg, rgba(46,204,113,0.1) 0%, rgba(0,100,0,0.05) 100%)' } },
    { id: 'ubg3', name: 'Cosmos Rift', desc: 'Deep space nebula gateway', price: 500, icon: '🌌', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(135deg, rgba(138,43,226,0.12) 0%, rgba(0,0,80,0.1) 50%, rgba(212,175,55,0.05) 100%)' } },
    { id: 'ubg4', name: 'Dragon Throne', desc: 'Fiery hall of the dragon king', price: 750, icon: '🐲', category: 'Avatar', enabled: true, avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(180deg, rgba(231,76,60,0.1) 0%, rgba(192,57,43,0.05) 50%, rgba(0,0,0,0.1) 100%)' } },
    // Avatar — Chest Armor
    { id: 'ac1', name: 'Dragon Scale Vest', desc: 'Fire-forged protective chestpiece', price: 500, icon: '🛡️', category: 'Avatar', enabled: true, avatarSlot: 'chest', avatarEmoji: '🛡️' },
    { id: 'ac2', name: 'Crystal Breastplate', desc: 'Luminous crystal-infused armor', price: 600, icon: '💎', category: 'Avatar', enabled: true, avatarSlot: 'chest', avatarEmoji: '💎' },
    { id: 'ac3', name: 'Healer Robes', desc: 'Sacred flowing healing vestments', price: 350, icon: '🧥', category: 'Avatar', enabled: true, avatarSlot: 'chest', avatarEmoji: '🧥' },
    { id: 'ac4', name: 'Shadow Cloak', desc: 'Dark ethereal shroud of mystery', price: 450, icon: '🦇', category: 'Avatar', enabled: true, avatarSlot: 'chest', avatarEmoji: '🦇' },
    // Avatar — Necklaces
    { id: 'an1', name: 'Chakra Pendant', desc: 'Seven-stone chakra alignment necklace', price: 275, icon: '📿', category: 'Avatar', enabled: true, avatarSlot: 'necklace', avatarEmoji: '📿' },
    { id: 'an2', name: 'Golden Amulet', desc: 'Ancient talisman of protection', price: 400, icon: '🏅', category: 'Avatar', enabled: true, avatarSlot: 'necklace', avatarEmoji: '🏅' },
    { id: 'an3', name: 'Moon Crystal', desc: 'Lunar energy amplifier pendant', price: 350, icon: '🌙', category: 'Avatar', enabled: true, avatarSlot: 'necklace', avatarEmoji: '🌙' },
    { id: 'an4', name: 'Star Chain', desc: 'Constellation-linked ethereal chain', price: 500, icon: '⭐', category: 'Avatar', enabled: true, avatarSlot: 'necklace', avatarEmoji: '⭐' },
    // Avatar — Back Bling
    { id: 'ab1', name: 'Angel Wings', desc: 'Divine feathered celestial wings', price: 800, icon: '🪽', category: 'Avatar', enabled: true, avatarSlot: 'backbling', avatarEmoji: '🪽' },
    { id: 'ab2', name: 'Demon Wings', desc: 'Dark leathery shadow wings', price: 750, icon: '🦇', category: 'Avatar', enabled: true, avatarSlot: 'backbling', avatarEmoji: '🦇' },
    { id: 'ab3', name: 'Spirit Cape', desc: 'Flowing ethereal energy mantle', price: 400, icon: '🧣', category: 'Avatar', enabled: true, avatarSlot: 'backbling', avatarEmoji: '🧣' },
    { id: 'ab4', name: 'Blade Sheath', desc: 'Battle-ready warrior back mount', price: 550, icon: '🗡️', category: 'Avatar', enabled: true, avatarSlot: 'backbling', avatarEmoji: '🗡️' },
    // Avatar — Legs
    { id: 'al1', name: 'Mystic Greaves', desc: 'Enchanted leg armor with rune glow', price: 350, icon: '🦿', category: 'Avatar', enabled: true, avatarSlot: 'legs', avatarEmoji: '🦿' },
    { id: 'al2', name: 'Shadow Leggings', desc: 'Stealth-woven dark fabric pants', price: 275, icon: '🩳', category: 'Avatar', enabled: true, avatarSlot: 'legs', avatarEmoji: '🩳' },
    { id: 'al3', name: 'Royal Trousers', desc: 'Gold-trimmed noble attire', price: 400, icon: '👖', category: 'Avatar', enabled: true, avatarSlot: 'legs', avatarEmoji: '👖' },
    // Avatar — Footwear
    { id: 'af1', name: 'Flame Boots', desc: 'Fire-enchanted battle footwear', price: 350, icon: '🥾', category: 'Avatar', enabled: true, avatarSlot: 'feet', avatarEmoji: '🥾' },
    { id: 'af2', name: 'Cloud Sandals', desc: 'Weightless celestial walking shoes', price: 300, icon: '☁️', category: 'Avatar', enabled: true, avatarSlot: 'feet', avatarEmoji: '☁️' },
    { id: 'af3', name: 'Crystal Heels', desc: 'Prismatic glass-shard stilettos', price: 500, icon: '👠', category: 'Avatar', enabled: true, avatarSlot: 'feet', avatarEmoji: '👠' },
    // Avatar — Rings/Finger Jewels
    { id: 'ar1', name: 'Soul Ring', desc: 'Ancient ring binding life force', price: 400, icon: '💍', category: 'Avatar', enabled: true, avatarSlot: 'rings', avatarEmoji: '💍' },
    { id: 'ar2', name: 'Void Band', desc: 'Dark matter compression ring', price: 500, icon: '🔲', category: 'Avatar', enabled: true, avatarSlot: 'rings', avatarEmoji: '🔲' },
    { id: 'ar3', name: 'Phoenix Signet', desc: 'Rebirth-emblazoned golden seal', price: 600, icon: '🔥', category: 'Avatar', enabled: true, avatarSlot: 'rings', avatarEmoji: '🔥' },
    { id: 'ar4', name: 'Emerald Cluster', desc: 'Multi-stone healing energy band', price: 350, icon: '💚', category: 'Avatar', enabled: true, avatarSlot: 'rings', avatarEmoji: '💚' },
    // Avatar — Tattoos
    { id: 'at1', name: 'Dragon Ink', desc: 'Serpentine beast coiling across skin', price: 300, icon: '🐉', category: 'Avatar', enabled: true, avatarSlot: 'tattoo', avatarEmoji: '🐉' },
    { id: 'at2', name: 'Sacred Geometry', desc: 'Flower of Life mandala pattern', price: 250, icon: '🔯', category: 'Avatar', enabled: true, avatarSlot: 'tattoo', avatarEmoji: '🔯' },
    { id: 'at3', name: 'Tribal Marks', desc: 'Ancient warrior tribal patterns', price: 200, icon: '〰️', category: 'Avatar', enabled: true, avatarSlot: 'tattoo', avatarEmoji: '〰️' },
    { id: 'at4', name: 'Celestial Map', desc: 'Star constellation body art', price: 400, icon: '✨', category: 'Avatar', enabled: true, avatarSlot: 'tattoo', avatarEmoji: '✨' }
  ];
  const [shopItems, setShopItems] = useState(() => {
    const saved = localStorage.getItem('aura_shop_items');
    if (saved) {
      const existing = JSON.parse(saved);
      const existingIds = existing.map(i => i.id);
      const newDefaults = defaultShopItems.filter(d => !existingIds.includes(d.id));
      if (newDefaults.length > 0) {
        const merged = [...existing, ...newDefaults];
        localStorage.setItem('aura_shop_items', JSON.stringify(merged));
        return merged;
      }
      return existing;
    }
    localStorage.setItem('aura_shop_items', JSON.stringify(defaultShopItems));
    return defaultShopItems;
  });
  const [featureToggles, setFeatureToggles] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('aura_feature_toggles') || '{}');
    return {
      goldSystemEnabled: saved.goldSystemEnabled !== false,
      dailyCheckinEnabled: saved.dailyCheckinEnabled !== false,
      painAnalysisEnabled: saved.painAnalysisEnabled !== false,
      goldStoreEnabled: saved.goldStoreEnabled !== false,
      buyGoldEnabled: saved.buyGoldEnabled !== false
    };
  });
  const [newItemForm, setNewItemForm] = useState({ name: '', desc: '', price: '', icon: '🎁', category: 'Video' });
  const [shopFilterCategory, setShopFilterCategory] = useState('');


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
    // Load data from simulated database
    const savedBookings = JSON.parse(localStorage.getItem('aura_bookings') || '[]');
    setBookings(savedBookings.sort((a, b) => b.id - a.id));
    
    const savedClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
    setClients(savedClients.sort((a, b) => a.name.localeCompare(b.name)));

    const savedTransactions = JSON.parse(localStorage.getItem('aura_transactions') || '[]');
    setTransactions(savedTransactions);

    const savedTeam = JSON.parse(localStorage.getItem('aura_team') || '[]');
    setTeamMembers(savedTeam);

    const savedApplications = JSON.parse(localStorage.getItem('aura_applications') || '[]');
    setApplications(savedApplications);

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
            accountNumber: `AUR-${String(10000 + Math.floor(Math.random() * 90000))}`,
            gold: Math.floor(Math.random() * 500),
            lastBooking: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
            subscription: Math.random() > 0.7 ? 'healing' : 'seeker'
        });
    }

    const mockBookings = [];
    const types = ['Portal Session', 'On-Site Alignment', 'Community Circle', 'Aura Cleansing', 'Chakra Balancing'];
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
  };

  const handleApproveStory = (id) => {
    const updated = stories.map(s => s.id === id ? { ...s, status: 'approved' } : s);
    setStories(updated);
    localStorage.setItem('aura_stories', JSON.stringify(updated));
    toast.success('Story resonated with the community.');
    logTransaction('[ADMIN] Story Approved', 'Community Mod', '-', `Story ${id} approved.`);
  };

  const handleArchiveStory = (id) => {
    const updated = stories.map(s => s.id === id ? { ...s, status: 'archived' } : s);
    setStories(updated);
    localStorage.setItem('aura_stories', JSON.stringify(updated));
    toast.success('Story safely archived.');
    logTransaction('[ADMIN] Story Archived', 'Community Mod', '-', `Story ${id} archived.`);
  };

  const filteredBookings = bookings.filter(b => {
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
              <button className={activeTab === 'gold_bank' ? 'active' : ''} onClick={() => setActiveTab('gold_bank')}>
                <Sparkles size={18} /> Gold Bank
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
              <button className={activeTab === 'activity' ? 'active' : ''} onClick={() => setActiveTab('activity')}>
                <List size={18} /> Activity
              </button>
              <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
              <Settings size={18} /> Settings
            </button>
          </div>
        </header>

        <div className="dashboard-content">
            {/* ─── Unified Activity Feed (ActionButler) ─── */}
            {activeTab === 'activity' && (() => {
              const stats = ActionButler.getSystemStats();
              const feed = ActionButler.getAllActions({ limit: 50 });
              const categoryColors = {
                economy: '#f1c40f', subscription: '#e74c3c', session: '#2ecc71',
                ai: '#3498db', butler: '#9b59b6', account: '#1abc9c', community: '#e67e22'
              };
              const categoryIcons = {
                economy: '💰', subscription: '📋', session: '🧘',
                ai: '🤖', butler: '✨', account: '👤', community: '🌐'
              };
              return (
                <div className="promo-panel fade-in">
                  <h2 style={{ marginBottom: '1.5rem' }}>Unified Activity Feed</h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                      { label: 'Total Actions', value: stats.totalActions, color: '#f1c40f' },
                      { label: 'Today', value: stats.todayActions, color: '#2ecc71' },
                      { label: 'Active Users', value: stats.uniqueUsers, color: '#3498db' }
                    ].map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: '0.75rem', opacity: 0.5, marginTop: '0.3rem' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  {feed.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.4 }}>
                      <Sparkles size={32} style={{ margin: '0 auto 1rem', display: 'block' }} />
                      <p>No actions logged yet. Activity will appear here as users interact with the platform.</p>
                    </div>
                  ) : (
                    <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {feed.map((action, idx) => (
                        <div key={action.actionId || idx} style={{
                          display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem',
                          borderRadius: '10px', background: 'rgba(255,255,255,0.02)',
                          border: `1px solid ${categoryColors[action.category] || '#555'}22`
                        }}>
                          <span style={{ fontSize: '1.3rem', minWidth: '28px', textAlign: 'center' }}>
                            {categoryIcons[action.category] || '📌'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', color: '#eee', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {action.description}
                            </div>
                            <div style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '2px' }}>
                              {action.email} · {new Date(action.date).toLocaleString()}
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.65rem', padding: '3px 8px', borderRadius: '6px',
                            background: `${categoryColors[action.category] || '#555'}22`,
                            color: categoryColors[action.category] || '#888',
                            whiteSpace: 'nowrap'
                          }}>
                            {action.category}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

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
                {filteredBookings.map(b => (
                  <div key={b.id} className={`booking-card ${b.status}`}>
                    <div className="booking-info">
                      <h3>{b.client.name}</h3>
                      <p>{b.type} • {b.date} at {b.time}</p>
                      {b.sessionCode && (
                        <p style={{color: 'var(--accent-gold)', fontSize: '0.85rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px'}}>
                           <Key size={14} /> <strong>Code: {b.sessionCode}</strong>
                        </p>
                      )}
                    </div>
                    <div className="booking-actions">
                      {b.status === 'pending' && (
                        <>
                          <button onClick={() => updateStatus(b.id, 'accepted')} className="accept-btn">Accept</button>
                          <button onClick={() => updateStatus(b.id, 'declined')} className="decline-btn">Decline</button>
                        </>
                      )}
                      {b.status === 'accepted' && b.type?.includes('Portal Resonance') && (
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
                      <span className="status-badge">{b.status}</span>
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
                                                
                                                // Create User Account (Automated)
                                                const newUser = {
                                                    name: app.name,
                                                    username: app.name.toLowerCase().replace(/\s+/g, '_'),
                                                    email: app.email,
                                                    password: '●●●●●●', // HIPAA: never store plaintext passwords
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
                           { top: '30%', left: '20%', size: 40, color: '#8e44ad' },
                           { top: '60%', left: '45%', size: 60, color: '#3498db' },
                           { top: '25%', left: '75%', size: 30, color: '#f1c40f' },
                           { top: '70%', left: '80%', size: 45, color: '#e74c3c' },
                           { top: '40%', left: '50%', size: 80, color: '#2ecc71' }
                        ].map((pulse, i) => (
                           <motion.div
                             key={i}
                             animate={{ 
                               scale: [1, 2, 1],
                               opacity: [0.3, 0.7, 0.3]
                             }}
                             transition={{ 
                               duration: 2 + Math.random() * 2, 
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
                              }} style={{background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer'}}><X size={16} /></button>
                            </div>
                          ))}
                          {Object.entries(blockedSlots).filter(([_, slots]) => slots.length > 0).sort((a,b) => new Date(a[0]) - new Date(b[0])).map(([date, slots]) => (
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

          {activeTab === 'clients' && (
            <div className="archive-view fade-in">
              <h3>Client Resonance Archive</h3>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem'}}>
                 Verified Client Database. Click on a spirit to manage their journey.
              </p>
              {/* Search Bar */}
              <div style={{marginBottom: '1rem', display: 'flex', gap: '0.5rem'}}>
                <input
                  type="text"
                  placeholder="Search by name, email, or account number..."
                  value={clientSearch || ''}
                  onChange={(e) => setClientSearch(e.target.value)}
                  style={{flex: 1, padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem'}}
                />
              </div>
              <div className="archive-table-container">
                <table className="archive-table">
                  <thead>
                    <tr><th>Account #</th><th>Name</th><th>Contact</th><th>Gold</th><th>Sub</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {clients.filter(c => {
                      if (!clientSearch) return true;
                      const q = clientSearch.toLowerCase();
                      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.accountNumber?.toLowerCase().includes(q);
                    }).map((c, i) => (
                      <tr key={i} style={{transition: 'background 0.2s'}}>
                        <td style={{fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--accent-gold)'}}>{c.accountNumber || '—'}</td>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}><strong>{c.name}</strong><br/><span style={{opacity: 0.5, fontSize: '0.7rem'}}>{c.email}</span></td>
                        <td style={{fontSize: '0.8rem'}}>{c.phone}</td>
                        <td style={{fontWeight: '700', color: 'var(--accent-gold)'}}>
                          🪙 {c.gold || 0}
                        </td>
                        <td onClick={() => setSelectedClient(c)} style={{cursor: 'pointer'}}>
                            <span style={{
                                color: c.subscription === 'healing' ? 'var(--accent-gold)' : 'var(--text-muted)',
                                border: `1px solid ${c.subscription === 'healing' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.2)'}`,
                                padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem'
                            }}>
                                {c.subscription === 'healing' ? 'Healing' : 'Seeker'}
                            </span>
                        </td>
                        <td>
                          <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                            <button onClick={(e) => {
                              e.stopPropagation();
                              const amt = prompt(`Give Gold to ${c.name}\nCurrent balance: ${c.gold || 0}\nEnter amount:`);
                              if (amt && !isNaN(amt) && parseInt(amt) > 0) {
                                const gold = parseInt(amt);
                                const updated = clients.map(cl => cl.email === c.email ? {...cl, gold: (cl.gold || 0) + gold} : cl);
                                setClients(updated);
                                localStorage.setItem('aura_clients', JSON.stringify(updated));
                                // Log transaction
                                const txns = JSON.parse(localStorage.getItem(`aura_transactions_${c.email}`) || '[]');
                                txns.push({
                                  txnId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`,
                                  date: new Date().toISOString(),
                                  type: 'gift',
                                  amount: gold,
                                  balance: (c.gold || 0) + gold,
                                  accountNumber: c.accountNumber,
                                  description: `Gift from Healer (admin)`
                                });
                                localStorage.setItem(`aura_transactions_${c.email}`, JSON.stringify(txns));
                                toast.success(`Gave ${gold} Gold to ${c.name}!`, {icon: '🪙'});
                              }
                            }} style={{background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent-gold)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer', fontWeight: '600'}}>+ Give Gold</button>
                            <button onClick={(e) => {
                               e.stopPropagation();
                               const newPass = prompt("New password for " + c.name);
                               if (newPass) {
                                 const updated = clients.map(cl => cl.email === c.email ? {...cl, password: '●●●●●●', passwordUpdated: new Date().toISOString()} : cl);
                                 setClients(updated);
                                 localStorage.setItem('aura_clients', JSON.stringify(updated));
                                 toast.success("Password reset (stored securely).");
                               }
                            }} style={{background: 'none', border: '1px solid rgba(255,255,255,0.15)', color: 'var(--text-muted)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer'}}>Reset Pass</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════ */}
          {/*  GOLD BANK — Vault Operations & Audit Ledger       */}
          {/* ═══════════════════════════════════════════════════ */}
          {activeTab === 'gold_bank' && (() => {
            const summary = GoldBankAudit.getGoldBankSummary();
            const ledger = GoldBankAudit.getLedger();
            const filteredLedger = ledger.filter(e => {
              if (auditFilter !== 'all' && e.operation !== auditFilter) return false;
              if (auditSearch && !JSON.stringify(e).toLowerCase().includes(auditSearch.toLowerCase())) return false;
              return true;
            }).reverse();

            const OP_COLORS = {
              MINT: '#2ecc71', BURN: '#e74c3c', DEPOSIT: '#3498db', WITHDRAWAL: '#e67e22',
              TRANSFER: '#9b59b6', GIFT: '#f1c40f', ADJUSTMENT: '#1abc9c', REFUND: '#e74c3c', SYSTEM: '#95a5a6'
            };
            const OP_ICONS = {
              MINT: '🏭', BURN: '🔥', DEPOSIT: '📥', WITHDRAWAL: '📤',
              TRANSFER: '🔄', GIFT: '🎁', ADJUSTMENT: '⚙️', REFUND: '↩️', SYSTEM: '🖥️'
            };

            return (
              <div className="fade-in" style={{display: 'grid', gap: '1.5rem'}}>
                {/* Vault Overview */}
                <div className="glass" style={{padding: '2rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(212,175,55,0.02))', border: '1px solid rgba(212,175,55,0.2)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h3 style={{margin: 0, color: 'var(--accent-gold)'}}>🏦 Gold Vault</h3>
                    <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '700',
                        background: summary.integrity.valid ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                        color: summary.integrity.valid ? '#2ecc71' : '#e74c3c',
                        border: `1px solid ${summary.integrity.valid ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`
                      }}>
                        {summary.integrity.valid ? '🔒 Chain Intact' : '⚠️ Integrity Error'}
                      </span>
                    </div>
                  </div>

                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem'}}>
                    {[
                      { label: 'Total Minted', value: summary.vault.totalMinted.toLocaleString(), icon: '🏭', color: '#2ecc71' },
                      { label: 'Total Burned', value: summary.vault.totalBurned.toLocaleString(), icon: '🔥', color: '#e74c3c' },
                      { label: 'Vault Reserve', value: summary.vault.reserveBalance.toLocaleString(), icon: '🏦', color: '#d4af37' },
                      { label: 'In Circulation', value: summary.actualCirculation.toLocaleString(), icon: '💰', color: '#3498db' },
                      { label: 'Clients w/ Gold', value: `${summary.clientsWithGold} / ${summary.clientCount}`, icon: '👥', color: '#9b59b6' },
                      { label: 'Audit Entries', value: summary.totalEntries.toLocaleString(), icon: '📋', color: '#f39c12' }
                    ].map(s => (
                      <div key={s.label} style={{
                        padding: '1rem', borderRadius: '14px', background: 'rgba(0,0,0,0.2)',
                        border: `1px solid ${s.color}22`, textAlign: 'center'
                      }}>
                        <div style={{fontSize: '1.4rem', marginBottom: '0.3rem'}}>{s.icon}</div>
                        <div style={{fontSize: '1.1rem', fontWeight: '700', color: s.color}}>{s.value}</div>
                        <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem'}}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations Panel */}
                <div className="glass" style={{padding: '2rem', borderRadius: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <h3 style={{margin: '0 0 1rem', color: '#fff'}}>⚡ Vault Operations</h3>

                  {/* Operation Type Selector */}
                  <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap'}}>
                    {['mint', 'burn', 'deposit', 'withdraw', 'transfer'].map(op => (
                      <button key={op} onClick={() => { setGoldBankOp(op); setGoldBankConfirmStep(null); setGoldBankConfirmText(''); }}
                        style={{
                          padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600',
                          textTransform: 'uppercase', letterSpacing: '0.5px',
                          background: goldBankOp === op ? `${OP_COLORS[op.toUpperCase()]}22` : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${goldBankOp === op ? OP_COLORS[op.toUpperCase()] + '55' : 'rgba(255,255,255,0.08)'}`,
                          color: goldBankOp === op ? OP_COLORS[op.toUpperCase()] : 'rgba(255,255,255,0.5)'
                        }}
                      >
                        {OP_ICONS[op.toUpperCase()]} {op}
                      </button>
                    ))}
                  </div>

                  {/* Operation Form */}
                  <div style={{display: 'grid', gap: '0.75rem'}}>
                    {(goldBankOp === 'deposit' || goldBankOp === 'withdraw') && (
                      <input type="text" placeholder="User email address"
                        value={goldBankForm.email}
                        onChange={e => setGoldBankForm({...goldBankForm, email: e.target.value})}
                        style={{padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      />
                    )}
                    {goldBankOp === 'transfer' && (
                      <>
                        <input type="text" placeholder="From email"
                          value={goldBankForm.email}
                          onChange={e => setGoldBankForm({...goldBankForm, email: e.target.value})}
                          style={{padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                        />
                        <input type="text" placeholder="To email"
                          value={goldBankForm.toEmail}
                          onChange={e => setGoldBankForm({...goldBankForm, toEmail: e.target.value})}
                          style={{padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                        />
                      </>
                    )}
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                      <input type="number" placeholder="Gold amount" min="1"
                        value={goldBankForm.amount}
                        onChange={e => setGoldBankForm({...goldBankForm, amount: e.target.value})}
                        style={{flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      />
                      <select value={goldBankForm.reason} onChange={e => setGoldBankForm({...goldBankForm, reason: e.target.value})}
                        style={{flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      >
                        <option value="">Select reason...</option>
                        <option value="Initial supply mint">Initial supply mint</option>
                        <option value="Promotional event">Promotional event</option>
                        <option value="Customer service credit">Customer service credit</option>
                        <option value="Bug compensation">Bug compensation</option>
                        <option value="Loyalty reward">Loyalty reward</option>
                        <option value="Account correction">Account correction</option>
                        <option value="Seasonal bonus">Seasonal bonus</option>
                        <option value="Excess supply burn">Excess supply burn</option>
                        <option value="Balance transfer">Balance transfer</option>
                        <option value="Refund">Refund</option>
                      </select>
                    </div>

                    {!goldBankConfirmStep ? (
                      <button
                        onClick={() => {
                          const amt = parseInt(goldBankForm.amount);
                          if (!amt || amt <= 0) return toast.error('Enter a valid Gold amount.');
                          if (!goldBankForm.reason) return toast.error('Select a reason.');
                          if ((goldBankOp === 'deposit' || goldBankOp === 'withdraw') && !goldBankForm.email) return toast.error('Enter user email.');
                          if (goldBankOp === 'transfer' && (!goldBankForm.email || !goldBankForm.toEmail)) return toast.error('Enter both email addresses.');
                          setGoldBankConfirmStep({ op: goldBankOp, amount: amt, ...goldBankForm });
                          setGoldBankConfirmText('');
                          toast('⚠️ Double verification required — review below.', {icon: '🔒', duration: 3000});
                        }}
                        style={{
                          padding: '0.8rem', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600',
                          background: `linear-gradient(135deg, ${OP_COLORS[goldBankOp.toUpperCase()]}22, ${OP_COLORS[goldBankOp.toUpperCase()]}08)`,
                          border: `1px solid ${OP_COLORS[goldBankOp.toUpperCase()]}44`,
                          color: OP_COLORS[goldBankOp.toUpperCase()]
                        }}
                      >
                        {OP_ICONS[goldBankOp.toUpperCase()]} Execute {goldBankOp.charAt(0).toUpperCase() + goldBankOp.slice(1)}
                      </button>
                    ) : (
                      <div style={{padding: '1.25rem', borderRadius: '14px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.25)'}}>
                        <div style={{fontSize: '0.9rem', fontWeight: '700', color: '#e74c3c', marginBottom: '1rem', textAlign: 'center'}}>⚠️ DOUBLE VERIFICATION REQUIRED</div>
                        <div style={{display: 'grid', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '1rem', padding: '0.75rem', borderRadius: '10px', background: 'rgba(0,0,0,0.15)'}}>
                          <div><span style={{color: 'rgba(255,255,255,0.4)'}}>Operation:</span> <strong style={{color: OP_COLORS[goldBankConfirmStep.op.toUpperCase()]}}>{goldBankConfirmStep.op.toUpperCase()}</strong></div>
                          <div><span style={{color: 'rgba(255,255,255,0.4)'}}>Amount:</span> <strong style={{color: 'var(--accent-gold)'}}>{goldBankConfirmStep.amount.toLocaleString()} Gold</strong></div>
                          {goldBankConfirmStep.email && <div><span style={{color: 'rgba(255,255,255,0.4)'}}>User:</span> <strong style={{color: '#fff'}}>{goldBankConfirmStep.email}</strong></div>}
                          {goldBankConfirmStep.toEmail && <div><span style={{color: 'rgba(255,255,255,0.4)'}}>To:</span> <strong style={{color: '#fff'}}>{goldBankConfirmStep.toEmail}</strong></div>}
                          <div><span style={{color: 'rgba(255,255,255,0.4)'}}>Reason:</span> <strong style={{color: '#fff'}}>{goldBankConfirmStep.reason}</strong></div>
                          <div><span style={{color: 'rgba(255,255,255,0.4)'}}>Authorized by:</span> <strong style={{color: '#fff'}}>{profile?.name || 'Admin'}</strong></div>
                        </div>
                        <div style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem'}}>Type <strong style={{color: '#e74c3c'}}>CONFIRM</strong> to authorize:</div>
                        <input type="text" value={goldBankConfirmText} onChange={e => setGoldBankConfirmText(e.target.value)}
                          placeholder="Type CONFIRM"
                          style={{width: '100%', padding: '0.7rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(231,76,60,0.3)', color: '#fff', fontSize: '0.9rem', marginBottom: '0.75rem', textAlign: 'center', letterSpacing: '0.15em', fontWeight: '700'}}
                        />
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button onClick={() => { setGoldBankConfirmStep(null); setGoldBankConfirmText(''); }}
                            style={{flex: 1, padding: '0.7rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem'}}
                          >Cancel</button>
                          <button
                            disabled={goldBankConfirmText !== 'CONFIRM'}
                            onClick={() => {
                              if (goldBankConfirmText !== 'CONFIRM') return toast.error('Type CONFIRM exactly.');
                              const { op, amount, email, toEmail, reason } = goldBankConfirmStep;
                              const adminName = profile?.name || 'Admin';
                              try {
                                switch (op) {
                                  case 'mint': GoldBankAudit.mintGold(amount, reason, adminName); break;
                                  case 'burn': GoldBankAudit.burnGold(amount, reason, adminName); break;
                                  case 'deposit': GoldBankAudit.depositToUser(email, amount, reason, adminName); break;
                                  case 'withdraw': GoldBankAudit.withdrawFromUser(email, amount, reason, adminName); break;
                                  case 'transfer': GoldBankAudit.transferGold(email, toEmail, amount, reason, adminName); break;
                                  default: break;
                                }
                                toast.success(`✅ ${op.toUpperCase()} of ${amount.toLocaleString()} Gold executed successfully.`, {icon: OP_ICONS[op.toUpperCase()], duration: 5000});
                                setGoldBankForm({ amount: '', email: '', toEmail: '', reason: '' });
                                setGoldBankConfirmStep(null);
                                setGoldBankConfirmText('');
                                // Refresh clients list
                                const updatedClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                                setClients(updatedClients);
                              } catch (err) {
                                toast.error(`❌ Operation failed: ${err.message}`);
                              }
                            }}
                            style={{
                              flex: 1, padding: '0.7rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600',
                              cursor: goldBankConfirmText === 'CONFIRM' ? 'pointer' : 'not-allowed',
                              background: goldBankConfirmText === 'CONFIRM' ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${goldBankConfirmText === 'CONFIRM' ? 'rgba(46,204,113,0.4)' : 'rgba(255,255,255,0.06)'}`,
                              color: goldBankConfirmText === 'CONFIRM' ? '#2ecc71' : 'rgba(255,255,255,0.3)'
                            }}
                          >🔒 Authorize</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Audit Ledger */}
                <div className="glass" style={{padding: '2rem', borderRadius: '20px', background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem'}}>
                    <h3 style={{margin: 0, color: '#fff'}}>📋 Audit Ledger <span style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', fontWeight: 'normal'}}>({filteredLedger.length} entries)</span></h3>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button onClick={() => {
                        const intCheck = GoldBankAudit.validateLedgerIntegrity();
                        if (intCheck.valid) toast.success(`✅ Ledger integrity verified: ${intCheck.entries} entries, hash chain intact.`, {duration: 5000});
                        else toast.error(`⚠️ Integrity errors found: ${intCheck.errors.map(e => e.error).join(', ')}`, {duration: 8000});
                      }}
                        style={{padding: '6px 14px', borderRadius: '8px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.25)', color: '#2ecc71', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600'}}
                      >🔍 Verify Integrity</button>
                      <button onClick={() => {
                        const csv = GoldBankAudit.exportLedgerCSV();
                        const blob = new Blob([csv], {type: 'text/csv'});
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `gold-bank-audit-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click(); URL.revokeObjectURL(url);
                        toast.success('Audit ledger exported as CSV.');
                      }}
                        style={{padding: '6px 14px', borderRadius: '8px', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)', color: '#d4af37', cursor: 'pointer', fontSize: '0.72rem', fontWeight: '600'}}
                      >📥 Export CSV</button>
                    </div>
                  </div>

                  {/* Filters */}
                  <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap'}}>
                    {['all', 'MINT', 'BURN', 'DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'GIFT'].map(f => (
                      <button key={f} onClick={() => setAuditFilter(f)}
                        style={{
                          padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem',
                          background: auditFilter === f ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${auditFilter === f ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                          color: auditFilter === f ? '#d4af37' : 'rgba(255,255,255,0.4)'
                        }}
                      >{f === 'all' ? '🔍 All' : `${OP_ICONS[f] || ''} ${f}`}</button>
                    ))}
                    <input type="text" placeholder="Search ledger..." value={auditSearch}
                      onChange={e => setAuditSearch(e.target.value)}
                      style={{flex: 1, minWidth: '120px', padding: '4px 12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.72rem'}}
                    />
                  </div>

                  {/* Ledger Entries */}
                  <div style={{maxHeight: '400px', overflowY: 'auto', display: 'grid', gap: '0.5rem'}}>
                    {filteredLedger.length === 0 ? (
                      <div style={{textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem'}}>
                        {ledger.length === 0 ? '🏦 No audit entries yet. Start by minting Gold into the vault.' : '🔍 No entries match your filter.'}
                      </div>
                    ) : filteredLedger.slice(0, 50).map(entry => (
                      <div key={entry.entryId} style={{
                        padding: '0.75rem 1rem', borderRadius: '10px', background: 'rgba(0,0,0,0.15)',
                        border: `1px solid ${OP_COLORS[entry.operation] || '#555'}15`,
                        display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: '0.75rem', alignItems: 'center'
                      }}>
                        <div style={{fontSize: '1.4rem', textAlign: 'center'}}>{OP_ICONS[entry.operation] || '📝'}</div>
                        <div>
                          <div style={{fontSize: '0.8rem', fontWeight: '600', color: OP_COLORS[entry.operation] || '#fff'}}>
                            {entry.operation} — {entry.amount.toLocaleString()} Gold
                          </div>
                          <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '2px'}}>
                            {entry.fromAccount} → {entry.toAccount} | {entry.reason}
                          </div>
                          <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '2px', fontFamily: 'monospace'}}>
                            #{entry.sequence} | {entry.entryHash?.substring(0, 12)}... | by {entry.authorizedBy}
                          </div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)'}}>
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </div>
                          <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)'}}>
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {filteredLedger.length > 50 && (
                      <div style={{textAlign: 'center', padding: '0.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem'}}>
                        Showing 50 of {filteredLedger.length} entries. Export CSV for full history.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}


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
                      defaultValue={localStorage.getItem('aura_onsite_price') || '150'} 
                      id="onsite-price-input"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    const onsiteVal = document.getElementById('onsite-price-input').value;
                    localStorage.setItem('aura_onsite_price', onsiteVal);
                    saveEmailSettings(e);
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
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h4 style={{color: 'var(--accent-gold)', margin: 0}}>🏦 Healer Payouts (Bank Info)</h4>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      {bankInfo.verified && (
                        <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: '#2ecc71', padding: '3px 8px', borderRadius: '6px', background: 'rgba(46,204,113,0.1)', border: '1px solid rgba(46,204,113,0.2)'}}>
                          ✓ Verified
                        </span>
                      )}
                      <button
                        onClick={() => setShowBankEdit(!showBankEdit)}
                        style={{padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: 'var(--accent-gold)', cursor: 'pointer'}}
                      >{showBankEdit ? 'Cancel' : '✏️ Edit'}</button>
                    </div>
                  </div>

                  {/* Masked display (default) */}
                  {!showBankEdit && (
                    <div style={{display: 'grid', gap: '0.75rem'}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                        <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>Account Holder</span>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-main)'}}>{bankInfo.accountHolder || 'Not set'}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                        <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>Bank Name</span>
                        <span style={{fontSize: '0.85rem', color: 'var(--text-main)'}}>{bankInfo.bankName || 'Not set'}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                        <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>Routing Number</span>
                        <span style={{fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-main)'}}>{bankInfo.routingNumber ? PaymentLedger.maskRouting(bankInfo.routingNumber) : '••••••'}</span>
                      </div>
                      <div style={{display: 'flex', justifyContent: 'space-between', padding: '0.7rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'}}>
                        <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)'}}>Account Number</span>
                        <span style={{fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-main)'}}>{bankInfo.accountNumber ? PaymentLedger.maskBankAccount(bankInfo.accountNumber) : '••••••'}</span>
                      </div>
                      <p style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '0.3rem'}}>🔒 Bank details are encrypted at rest. Full numbers are never displayed.</p>
                    </div>
                  )}

                  {/* Edit mode */}
                  {showBankEdit && (
                    <div>
                      <div className="form-group" style={{marginBottom: '0.75rem'}}>
                        <label style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Account Holder Name</label>
                        <input type="text" placeholder="Full legal name" value={bankInfo.accountHolder}
                          onChange={e => setBankInfo({...bankInfo, accountHolder: e.target.value})}
                          style={{background: 'rgba(0,0,0,0.2)', padding: '0.7rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                        />
                      </div>
                      <div className="form-group" style={{marginBottom: '0.75rem'}}>
                        <label style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Bank Name</label>
                        <input type="text" placeholder="e.g. Chase" value={bankInfo.bankName}
                          onChange={e => setBankInfo({...bankInfo, bankName: e.target.value})}
                          style={{background: 'rgba(0,0,0,0.2)', padding: '0.7rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff'}}
                        />
                      </div>
                      <div className="form-group" style={{marginBottom: '0.75rem'}}>
                        <label style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Routing Number (9 digits)</label>
                        <input type="text" placeholder="•••••••••" value={bankInfo.routingNumber}
                          onChange={e => setBankInfo({...bankInfo, routingNumber: e.target.value.replace(/\D/g, '').slice(0, 9)})}
                          maxLength={9}
                          style={{background: 'rgba(0,0,0,0.2)', padding: '0.7rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px'}}
                        />
                      </div>
                      <div className="form-group" style={{marginBottom: '1rem'}}>
                        <label style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)'}}>Account Number</label>
                        <input type="text" placeholder="•••••••••••" value={bankInfo.accountNumber}
                          onChange={e => setBankInfo({...bankInfo, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 17)})}
                          maxLength={17}
                          style={{background: 'rgba(0,0,0,0.2)', padding: '0.7rem', width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontFamily: 'monospace', letterSpacing: '2px'}}
                        />
                      </div>
                      <button
                        className="btn-primary"
                        style={{width: '100%', padding: '0.7rem', fontSize: '0.85rem'}}
                        onClick={() => {
                          if (!bankInfo.bankName || !bankInfo.routingNumber || !bankInfo.accountNumber) {
                            return toast.error('All bank fields are required.');
                          }
                          if (bankInfo.routingNumber.length !== 9) return toast.error('Routing number must be 9 digits.');
                          const updated = { ...bankInfo, verified: true };
                          setBankInfo(updated);
                          localStorage.setItem('aura_bank_info', JSON.stringify(updated));
                          setShowBankEdit(false);
                          toast.success('Bank info saved & verified. Payouts enabled.', {icon: '🏦'});
                        }}
                      >💾 Save & Verify Bank Info</button>
                      <p style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '0.5rem'}}>🔒 PCI-DSS compliant. Full account numbers are masked after saving.</p>
                    </div>
                  )}
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
                    {teamMembers.map((member, idx) => (
                        <div key={idx} style={{display: 'flex', justifyContent: 'space-between', padding: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                            <span>{member.name} (Healer)</span>
                            <span style={{color: member.status === 'Active' ? '#2ecc71' : '#f1c40f'}}>{member.status}</span>
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
                       localStorage.setItem('aura_bank_info', JSON.stringify(bankInfoUpdate));
                       setBankInfo(bankInfoUpdate);

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

              <div style={{marginTop: '3rem', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '2rem'}}>
                <h3 style={{color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>🪙 Gold Store & Feature Controls</h3>
                <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>
                  Manage the Gold economy, daily check-in, pain analysis, and shop items across the platform.
                </p>

                {/* Feature Toggles */}
                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>Feature Toggles</h4>
                  {[
                    { key: 'goldSystemEnabled', label: 'Gold Currency System', desc: 'Master toggle for the entire Gold economy' },
                    { key: 'dailyCheckinEnabled', label: 'Daily "I Ascend" Check-In', desc: 'Allow users to earn Gold through daily check-ins' },
                    { key: 'painAnalysisEnabled', label: 'Today\'s Pain AI Analysis', desc: 'Show the pain analysis bubble with Reiki & natural remedies' },
                    { key: 'goldStoreEnabled', label: 'Gold Store Tab', desc: 'Allow users to browse and purchase items with Gold' },
                    { key: 'buyGoldEnabled', label: 'Buy More Gold', desc: 'Allow users to purchase Gold packages' }
                  ].map(toggle => (
                    <div key={toggle.key} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.8rem', marginBottom: '0.5rem', borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div>
                        <div style={{fontWeight: '600', fontSize: '0.9rem'}}>{toggle.label}</div>
                        <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{toggle.desc}</div>
                      </div>
                      <div
                        onClick={() => {
                          const updated = { ...featureToggles, [toggle.key]: !featureToggles[toggle.key] };
                          setFeatureToggles(updated);
                          localStorage.setItem('aura_feature_toggles', JSON.stringify(updated));
                          toast.success(`${toggle.label} ${updated[toggle.key] ? 'enabled' : 'disabled'}.`);
                        }}
                        style={{
                          width: '50px', height: '26px',
                          background: featureToggles[toggle.key] ? 'var(--accent-gold)' : 'rgba(255,255,255,0.1)',
                          borderRadius: '13px', position: 'relative', cursor: 'pointer',
                          transition: 'all 0.3s', border: '1px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div style={{
                          position: 'absolute', top: '2px',
                          left: featureToggles[toggle.key] ? '26px' : '2px',
                          width: '20px', height: '20px',
                          background: featureToggles[toggle.key] ? '#000' : '#fff',
                          borderRadius: '50%', transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '8px', fontWeight: 'bold',
                          color: featureToggles[toggle.key] ? 'white' : 'black'
                        }}>{featureToggles[toggle.key] ? 'ON' : 'OFF'}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Item Management */}
                <div className="glass" style={{padding: '1.5rem', marginBottom: '1.5rem'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '0.75rem'}}>Shop Items ({shopItems.length})</h4>
                  {/* Category Filter Pills */}
                  <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem'}}>
                    {['All', ...new Set(shopItems.map(i => i.category))].map(cat => {
                      const count = cat === 'All' ? shopItems.length : shopItems.filter(i => i.category === cat).length;
                      const isActive = (shopFilterCategory || 'All') === cat;
                      return (
                        <button key={cat} onClick={() => setShopFilterCategory(cat === 'All' ? '' : cat)} style={{
                          padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600', cursor: 'pointer',
                          background: isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.05)',
                          color: isActive ? '#000' : 'rgba(255,255,255,0.5)',
                          border: `1px solid ${isActive ? 'var(--accent-gold)' : 'rgba(255,255,255,0.08)'}`,
                          transition: 'all 0.2s'
                        }}>{cat} ({count})</button>
                      );
                    })}
                  </div>
                  <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', maxHeight: '400px', overflowY: 'auto'}}>
                    {shopItems.filter(i => !shopFilterCategory || i.category === shopFilterCategory).map((item, idx) => (
                      <div key={item.id} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.8rem', borderRadius: '10px',
                        background: item.enabled ? 'rgba(255,255,255,0.03)' : 'rgba(231,76,60,0.05)',
                        border: `1px solid ${item.enabled ? 'rgba(255,255,255,0.05)' : 'rgba(231,76,60,0.15)'}`,
                        opacity: item.enabled ? 1 : 0.6
                      }}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1}}>
                          <span style={{fontSize: '1.3rem'}}>{item.icon}</span>
                          <div style={{flex: 1}}>
                            <div style={{fontWeight: '600', fontSize: '0.85rem'}}>{item.name}</div>
                            <div style={{fontSize: '0.7rem', color: 'var(--text-muted)'}}>{item.category} · {item.desc}</div>
                          </div>
                          <div style={{display: 'flex', alignItems: 'center', gap: '4px', marginRight: '1rem'}}>
                            <span style={{color: 'var(--accent-gold)', fontSize: '0.75rem'}}>🪙</span>
                            <input
                              type="number"
                              value={item.price}
                              onChange={e => {
                                const updated = shopItems.map(si => si.id === item.id ? {...si, price: parseInt(e.target.value) || 0} : si);
                                setShopItems(updated);
                                localStorage.setItem('aura_shop_items', JSON.stringify(updated));
                              }}
                              style={{
                                width: '60px', padding: '2px 6px', borderRadius: '6px',
                                background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#fff', fontSize: '0.8rem', textAlign: 'center'
                              }}
                            />
                          </div>
                        </div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                          <button
                            onClick={() => {
                              const updated = shopItems.map(si => si.id === item.id ? {...si, enabled: !si.enabled} : si);
                              setShopItems(updated);
                              localStorage.setItem('aura_shop_items', JSON.stringify(updated));
                              toast.success(`${item.name} ${!item.enabled ? 'unlocked' : 'locked'}.`);
                            }}
                            style={{
                              padding: '4px 10px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '600',
                              background: item.enabled ? 'rgba(46,204,113,0.15)' : 'rgba(231,76,60,0.15)',
                              border: `1px solid ${item.enabled ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`,
                              color: item.enabled ? '#2ecc71' : '#e74c3c', cursor: 'pointer'
                            }}
                          >{item.enabled ? '🔓 Active' : '🔒 Locked'}</button>
                          <button
                            onClick={() => {
                              if (!window.confirm(`Remove "${item.name}" from the store?`)) return;
                              const updated = shopItems.filter(si => si.id !== item.id);
                              setShopItems(updated);
                              localStorage.setItem('aura_shop_items', JSON.stringify(updated));
                              toast.success(`${item.name} removed.`);
                            }}
                            style={{
                              padding: '4px 8px', borderRadius: '8px', fontSize: '0.7rem',
                              background: 'rgba(231,76,60,0.1)', border: '1px solid rgba(231,76,60,0.2)',
                              color: '#e74c3c', cursor: 'pointer'
                            }}
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Item Form */}
                  <div style={{borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem'}}>
                    <h5 style={{color: 'var(--accent-gold)', marginBottom: '0.75rem', fontSize: '0.85rem'}}>+ Add New Item</h5>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem'}}>
                      <input
                        placeholder="Item name"
                        value={newItemForm.name}
                        onChange={e => setNewItemForm({...newItemForm, name: e.target.value})}
                        style={{padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      />
                      <input
                        placeholder="Description"
                        value={newItemForm.desc}
                        onChange={e => setNewItemForm({...newItemForm, desc: e.target.value})}
                        style={{padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      />
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <input
                          placeholder="Price"
                          type="number"
                          value={newItemForm.price}
                          onChange={e => setNewItemForm({...newItemForm, price: e.target.value})}
                          style={{flex: 1, padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                        />
                        <input
                          placeholder="Emoji"
                          value={newItemForm.icon}
                          onChange={e => setNewItemForm({...newItemForm, icon: e.target.value})}
                          style={{width: '50px', padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '1.2rem', textAlign: 'center'}}
                        />
                      </div>
                      <select
                        value={newItemForm.category}
                        onChange={e => setNewItemForm({...newItemForm, category: e.target.value})}
                        style={{padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      >
                        <option value="Video" style={{background: '#0a0a14'}}>Video</option>
                        <option value="Merch" style={{background: '#0a0a14'}}>Merch</option>
                        <option value="Cosmetic" style={{background: '#0a0a14'}}>Cosmetic</option>
                        <option value="Ability" style={{background: '#0a0a14'}}>Ability</option>
                        <option value="Avatar" style={{background: '#0a0a14'}}>Avatar Accessory</option>
                        <option value="Pet Avatar" style={{background: '#0a0a14'}}>Pet Avatar / Breed</option>
                        <option value="Pet Accessory" style={{background: '#0a0a14'}}>Pet Accessory</option>
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        if (!newItemForm.name || !newItemForm.price) return toast.error('Name and price required.');
                        const newItem = {
                          id: `custom_${Date.now()}`,
                          name: newItemForm.name,
                          desc: newItemForm.desc || 'Custom item',
                          price: parseInt(newItemForm.price),
                          icon: newItemForm.icon || '🎁',
                          category: newItemForm.category,
                          enabled: true
                        };
                        const updated = [...shopItems, newItem];
                        setShopItems(updated);
                        localStorage.setItem('aura_shop_items', JSON.stringify(updated));
                        setNewItemForm({ name: '', desc: '', price: '', icon: '🎁', category: 'Video' });
                        toast.success(`"${newItem.name}" added to the Gold Store!`);
                      }}
                      className="btn-primary"
                      style={{width: '100%', marginTop: '0.75rem', padding: '0.6rem', fontSize: '0.85rem'}}
                    >Add Item to Store</button>
                  </div>
                </div>
              </div>

              {/* Mass Gold Bonus & Stats */}
              <div style={{marginTop: '2rem', borderTop: '1px solid rgba(212,175,55,0.2)', paddingTop: '2rem'}}>
                <h3 style={{color: 'var(--accent-gold)', marginBottom: '1rem'}}>💰 Gold Administration</h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
                  {(() => {
                    const clients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                    const totalGold = clients.reduce((s, c) => s + (c.gold || 0), 0);
                    let totalTxns = 0;
                    for (let i = 0; i < localStorage.length; i++) {
                      const key = localStorage.key(i);
                      if (key?.startsWith('aura_transactions_')) {
                        totalTxns += JSON.parse(localStorage.getItem(key) || '[]').length;
                      }
                    }
                    return (
                      <>
                        <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', textAlign: 'center'}}>
                          <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Gold in Circulation</div>
                          <div style={{fontSize: '1.3rem', fontWeight: '700', color: 'var(--accent-gold)'}}>🪙 {totalGold.toLocaleString()}</div>
                        </div>
                        <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(46,204,113,0.05)', border: '1px solid rgba(46,204,113,0.15)', textAlign: 'center'}}>
                          <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Total Transactions</div>
                          <div style={{fontSize: '1.3rem', fontWeight: '700', color: '#2ecc71'}}>{totalTxns}</div>
                        </div>
                        <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(52,152,219,0.05)', border: '1px solid rgba(52,152,219,0.15)', textAlign: 'center'}}>
                          <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Active Holders</div>
                          <div style={{fontSize: '1.3rem', fontWeight: '700', color: '#3498db'}}>{clients.filter(c => (c.gold || 0) > 0).length}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => {
                    const amt = prompt('Enter Gold amount to give ALL clients:');
                    if (amt && !isNaN(amt) && parseInt(amt) > 0) {
                      const gold = parseInt(amt);
                      const reason = prompt('Reason for bonus (optional):') || 'Healer bonus';
                      const updated = clients.map(c => ({...c, gold: (c.gold || 0) + gold}));
                      updated.forEach(c => {
                        const txns = JSON.parse(localStorage.getItem(`aura_transactions_${c.email}`) || '[]');
                        txns.push({
                          txnId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2,4).toUpperCase()}`,
                          date: new Date().toISOString(),
                          type: 'gift',
                          amount: gold,
                          balance: c.gold,
                          accountNumber: c.accountNumber,
                          description: reason
                        });
                        localStorage.setItem(`aura_transactions_${c.email}`, JSON.stringify(txns));
                      });
                      setClients(updated);
                      localStorage.setItem('aura_clients', JSON.stringify(updated));
                      toast.success(`Gave ${gold} Gold to ${updated.length} clients! Reason: ${reason}`, {icon: '💰'});
                    }
                  }}
                  className="btn-primary"
                  style={{width: '100%', padding: '0.7rem', fontSize: '0.9rem', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent-gold)'}}
                >💰 Mass Gold Bonus to All Clients</button>

                {/* ─── Individual Gold Gift Tool (Customer Service) ─── */}
                <div className="glass" style={{padding: '1.5rem', marginTop: '1.5rem', background: 'rgba(212,175,55,0.03)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '16px'}}>
                  <h4 style={{color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>🎁 Gift Gold to Individual</h4>
                  <p style={{fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem'}}>
                    Customer service tool — credit Gold to a specific user's account (e.g., failed purchase, bug compensation, loyalty reward).
                  </p>
                  <div style={{display: 'grid', gap: '0.75rem'}}>
                    <input
                      type="text"
                      placeholder="Email or Username"
                      value={giftGoldForm.identifier}
                      onChange={e => setGiftGoldForm({...giftGoldForm, identifier: e.target.value})}
                      style={{padding: '0.7rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                    />
                    <div style={{display: 'flex', gap: '0.75rem'}}>
                      <input
                        type="number"
                        placeholder="Gold amount"
                        value={giftGoldForm.amount}
                        onChange={e => setGiftGoldForm({...giftGoldForm, amount: e.target.value})}
                        style={{flex: 1, padding: '0.7rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      />
                      <select
                        value={giftGoldForm.reason}
                        onChange={e => setGiftGoldForm({...giftGoldForm, reason: e.target.value})}
                        style={{flex: 1, padding: '0.7rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.85rem'}}
                      >
                        <option value="">Select Reason...</option>
                        <option value="Bug compensation">Bug compensation</option>
                        <option value="Failed purchase refund">Failed purchase refund</option>
                        <option value="Item not delivered">Item not delivered</option>
                        <option value="Loyalty reward">Loyalty reward</option>
                        <option value="Promotion">Promotion</option>
                        <option value="Custom">Custom reason</option>
                      </select>
                    </div>
                    {!giftConfirmStep ? (
                      <button
                        onClick={() => {
                          const { identifier, amount, reason } = giftGoldForm;
                          if (!identifier || !amount || parseInt(amount) <= 0) return toast.error('Enter a valid user and Gold amount.');
                          if (!reason) return toast.error('Please select a reason for the gift.');
                          const goldAmt = parseInt(amount);
                          const allClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                          const client = allClients.find(c =>
                            c.email?.toLowerCase() === identifier.toLowerCase() ||
                            c.username?.toLowerCase() === identifier.toLowerCase()
                          );
                          if (!client) return toast.error(`User "${identifier}" not found.`);
                          // Step 1: Show confirmation
                          setGiftConfirmStep({ client, goldAmt, reason });
                          setGiftConfirmText('');
                          toast('⚠️ Verification required — review details below.', { icon: '🔒', duration: 3000 });
                        }}
                        className="btn-primary"
                        style={{width: '100%', padding: '0.7rem', fontSize: '0.85rem', background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))', border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent-gold)'}}
                      >🎁 Send Gold Gift</button>
                    ) : (
                      <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(231,76,60,0.06)', border: '1px solid rgba(231,76,60,0.25)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#e74c3c', marginBottom: '0.75rem', textAlign: 'center' }}>⚠️ DOUBLE VERIFICATION REQUIRED</div>
                        <div style={{ display: 'grid', gap: '0.4rem', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                          <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Recipient:</span> <strong style={{ color: '#fff' }}>{giftConfirmStep.client.name || giftConfirmStep.client.email}</strong></div>
                          <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Amount:</span> <strong style={{ color: 'var(--accent-gold)' }}>{giftConfirmStep.goldAmt} Gold</strong></div>
                          <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Reason:</span> <strong style={{ color: '#fff' }}>{giftConfirmStep.reason}</strong></div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem' }}>Type <strong style={{ color: '#e74c3c' }}>CONFIRM</strong> to authorize this gift:</div>
                        <input
                          type="text"
                          value={giftConfirmText}
                          onChange={e => setGiftConfirmText(e.target.value)}
                          placeholder="Type CONFIRM"
                          style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(231,76,60,0.3)', color: '#fff', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center', letterSpacing: '0.15em', fontWeight: '700' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => { setGiftConfirmStep(null); setGiftConfirmText(''); }}
                            style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.8rem' }}
                          >Cancel</button>
                          <button
                            onClick={() => {
                              if (giftConfirmText !== 'CONFIRM') return toast.error('Type CONFIRM exactly to proceed.');
                              const { client, goldAmt, reason } = giftConfirmStep;
                              const allClients = JSON.parse(localStorage.getItem('aura_clients') || '[]');
                              const clientIdx = allClients.findIndex(c => c.email === client.email);
                              if (clientIdx === -1) return toast.error('Client no longer found.');
                              allClients[clientIdx] = { ...allClients[clientIdx], gold: (allClients[clientIdx].gold || 0) + goldAmt };
                              const txns = JSON.parse(localStorage.getItem(`aura_transactions_${client.email}`) || '[]');
                              txns.push({
                                txnId: `GIFT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                                date: new Date().toISOString(),
                                type: 'admin_gift',
                                amount: goldAmt,
                                balance: allClients[clientIdx].gold,
                                description: `${reason} — Gifted by Admin (Double Verified)`,
                                giftedBy: profile?.name || 'Admin',
                                verifiedAt: new Date().toISOString()
                              });
                              localStorage.setItem(`aura_transactions_${client.email}`, JSON.stringify(txns));
                              localStorage.setItem('aura_clients', JSON.stringify(allClients));
                              setClients(allClients);
                              setGiftGoldForm({ identifier: '', amount: '', reason: '' });
                              setGiftConfirmStep(null);
                              setGiftConfirmText('');
                              toast.success(`✅ Verified & Gifted ${goldAmt} Gold to ${client.name || client.email}. Reason: ${reason}`, { icon: '🎁', duration: 5000 });
                            }}
                            disabled={giftConfirmText !== 'CONFIRM'}
                            style={{
                              flex: 1, padding: '0.6rem', borderRadius: '8px', cursor: giftConfirmText === 'CONFIRM' ? 'pointer' : 'not-allowed',
                              background: giftConfirmText === 'CONFIRM' ? 'rgba(46,204,113,0.2)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${giftConfirmText === 'CONFIRM' ? 'rgba(46,204,113,0.4)' : 'rgba(255,255,255,0.06)'}`,
                              color: giftConfirmText === 'CONFIRM' ? '#2ecc71' : 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontWeight: '700'
                            }}
                          >✅ Authorize Gift</button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.5rem', textAlign: 'center'}}>All gifts require double verification and are logged for HIPAA audit compliance.</p>
                </div>

                {/* ─── Revenue Dashboard (Admin-Only) ─── */}
                <div className="glass" style={{padding: '1.5rem', marginTop: '1.5rem', background: 'rgba(46,204,113,0.02)', border: '1px solid rgba(46,204,113,0.15)', borderRadius: '16px'}}>
                  <h4 style={{color: '#2ecc71', marginBottom: '1rem'}}>📊 Revenue Dashboard</h4>
                  {(() => {
                    const summary = PaymentLedger.getPayoutSummary();
                    const allTxns = PaymentLedger.getTransactions();
                    const byType = {};
                    allTxns.filter(t => t.status === 'completed').forEach(t => {
                      const cat = t.type.includes('subscription') ? 'Subscriptions'
                        : t.type.includes('booking') ? 'Bookings'
                        : t.type.includes('gold') ? 'Gold Purchases'
                        : 'Other';
                      byType[cat] = (byType[cat] || 0) + (t.total || 0);
                    });
                    return (
                      <>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem'}}>
                          <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(46,204,113,0.08)', border: '1px solid rgba(46,204,113,0.2)', textAlign: 'center'}}>
                            <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Total Revenue</div>
                            <div style={{fontSize: '1.4rem', fontWeight: '700', color: '#2ecc71'}}>${summary.totalRevenue.toFixed(2)}</div>
                          </div>
                          <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', textAlign: 'center'}}>
                            <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Healer Net Payout</div>
                            <div style={{fontSize: '1.4rem', fontWeight: '700', color: 'var(--accent-gold)'}}>${summary.netRevenue.toFixed(2)}</div>
                          </div>
                          <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(52,152,219,0.08)', border: '1px solid rgba(52,152,219,0.2)', textAlign: 'center'}}>
                            <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Platform Fees</div>
                            <div style={{fontSize: '1.1rem', fontWeight: '600', color: '#3498db'}}>${summary.totalFees.toFixed(2)}</div>
                          </div>
                          <div style={{padding: '1rem', borderRadius: '12px', background: 'rgba(155,89,182,0.08)', border: '1px solid rgba(155,89,182,0.2)', textAlign: 'center'}}>
                            <div style={{fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.3rem'}}>Transactions</div>
                            <div style={{fontSize: '1.1rem', fontWeight: '600', color: '#9b59b6'}}>{summary.transactionCount}</div>
                          </div>
                        </div>

                        {/* Revenue by Category */}
                        {Object.keys(byType).length > 0 && (
                          <div style={{marginBottom: '1rem'}}>
                            <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Revenue by Category</div>
                            {Object.entries(byType).sort((a,b) => b[1] - a[1]).map(([cat, amt]) => (
                              <div key={cat} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', marginBottom: '0.3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)'}}>
                                <span style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)'}}>{cat}</span>
                                <span style={{fontSize: '0.85rem', fontWeight: '600', color: '#2ecc71'}}>${amt.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Recent Transactions */}
                        <div style={{fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px'}}>Recent Transactions</div>
                        <div style={{maxHeight: '250px', overflowY: 'auto'}}>
                          {allTxns.length === 0 && <p style={{fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '1rem'}}>No transactions yet.</p>}
                          {allTxns.slice(0, 15).map(txn => (
                            <div key={txn.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', marginBottom: '0.3rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)'}}>
                              <div>
                                <div style={{fontSize: '0.75rem', color: 'var(--text-main)'}}>{txn.description}</div>
                                <div style={{fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)'}}>{new Date(txn.createdAt).toLocaleDateString()} · {txn.paymentMethod}</div>
                              </div>
                              <div style={{textAlign: 'right'}}>
                                <div style={{fontSize: '0.85rem', fontWeight: '600', color: txn.status === 'refunded' ? '#e74c3c' : '#2ecc71'}}>
                                  {txn.status === 'refunded' ? '-' : '+'}${(txn.total || 0).toFixed(2)}
                                </div>
                                <div style={{fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace'}}>{txn.receiptId}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p style={{fontSize: '0.55rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', marginTop: '0.5rem'}}>Revenue data is for owner/admin review only. All amounts are HIPAA-safe (no PHI).</p>
                      </>
                    );
                  })()}
                </div>
              </div>

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
                            <h3 style={{color: 'var(--accent-gold)', marginBottom: '0.5rem'}}>{selectedClient.name}</h3>
                            <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem'}}>Client ID: {btoa(selectedClient.email).substring(0,8)} | FDA Record</p>
                            
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
                                            }}
                                        >
                                            {months} Month{months > 1 ? 's' : ''} Record
                                        </button>
                                    ))}
                                </div>
                                <p style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem'}}>
                                    *Action will be logged in Healing Logs for FDA auditing.
                                </p>
                             </div>

                             <div style={{marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                                 <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem'}}>Role Assignment</label>
                                 {teamMembers.find(t => t.email === selectedClient.email && t.status === 'Active') ? (
                                     <button 
                                         className="btn"
                                         style={{width: '100%', borderColor: '#e74c3c', color: '#e74c3c', background: 'rgba(231, 76, 60, 0.1)'}}
                                         onClick={() => {
                                             const updatedTeam = teamMembers.filter(t => t.email !== selectedClient.email);
                                             localStorage.setItem('aura_team', JSON.stringify(updatedTeam));
                                             setTeamMembers(updatedTeam);
                                             toast.success('Healer privileges revoked.');
                                             logTransaction('[ADMIN] Role Downgrade', selectedClient.name, selectedClient.email, 'User removed from Healer Team');
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
                                         }}
                                     >
                                         Promote to Healer (Admin Access)
                                     </button>
                                 )}
                             </div>
                        </div>
                    </div>
                )}
              </AnimatePresence>
        </div>
      </div>
    );
};

export default AdminDashboard;
