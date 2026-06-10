import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import {
  BookOpen, Search, ChevronDown, Play, X,
  Shield, Sparkles, Heart, Brain, Gem, Activity,
  Star, Building2, Users, Leaf, Eye, AlertTriangle
} from 'lucide-react';
import './LearnSection.css';

/* ═══════════════════════════════════════════
   LEARNING LIBRARY DATA
   All facts verified — anecdotal items marked
   ═══════════════════════════════════════════ */

const SECTIONS = [
  /* ──────────── 1. UNDERSTANDING REIKI ──────────── */
  {
    id: 'reiki',
    title: 'Understanding Reiki',
    subtitle: 'History, principles & evidence-based insights',
    emoji: '🙌',
    iconBg: 'linear-gradient(135deg, rgba(160,210,235,0.2), rgba(142,68,173,0.15))',
    category: 'reiki',
    content: (
      <>
        {/* What is Reiki */}
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Sparkles size={14} /> What Is Reiki?
          </div>
          <p>
            Reiki is a Japanese energy healing technique developed by <strong>Mikao Usui in 1922</strong> in Japan. The word "Reiki" comes from two Japanese words: <em>Rei</em> (universal) and <em>Ki</em> (life force energy). Practitioners channel this energy through their hands to support the body's natural healing processes.
          </p>
          <p>
            During a session, a trained practitioner gently places their hands on or slightly above the recipient's body. Reiki is <strong>non-invasive</strong> and the recipient remains fully clothed. Sessions typically last 30–60 minutes.
          </p>
        </div>

        {/* The 5 Principles */}
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Star size={14} /> The Five Reiki Principles
          </div>
          <p>Mikao Usui taught five guiding principles (Gokai) as the spiritual foundation of Reiki practice:</p>
          <ol className="learn-principles-list">
            <li><strong>Just for today, I will not worry.</strong> — Release anxiety and trust the present moment.</li>
            <li><strong>Just for today, I will not be angry.</strong> — Cultivate inner peace and patience.</li>
            <li><strong>Just for today, I will be grateful.</strong> — Embrace gratitude for all blessings.</li>
            <li><strong>Just for today, I will do my work honestly.</strong> — Live with integrity and purpose.</li>
            <li><strong>Just for today, I will be kind to every living thing.</strong> — Practice compassion toward all beings.</li>
          </ol>
        </div>

        {/* How it works */}
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Activity size={14} /> How Reiki Works
          </div>
          <p>
            Reiki practitioners believe they serve as channels for universal life force energy. The practitioner does not use their own energy — instead, they act as a conduit, allowing energy to flow to areas where it is needed most.
          </p>
          <p>
            While the exact mechanisms are still being studied, recipients commonly report experiencing <strong>deep relaxation</strong>, warmth, tingling, and an overall sense of calm. Reiki is used as a <strong>complementary therapy</strong> — it works alongside, not as a replacement for, conventional medical treatment.
          </p>
        </div>

        {/* Scientific Recognition */}
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Brain size={14} /> Scientific Recognition
          </div>
          <p>
            The <strong>National Institutes of Health (NIH)</strong> and its <strong>National Center for Complementary and Integrative Health (NCCIH)</strong> classify Reiki as a complementary health approach. While the NCCIH notes that scientific evidence for Reiki's effectiveness is limited and more rigorous studies are needed, they recognize it as part of the broader landscape of complementary therapies.
          </p>
          <div className="learn-highlight-box">
            <strong>Key Finding:</strong> Multiple preliminary studies suggest Reiki may help reduce stress, promote relaxation, and support emotional well-being. The NCCIH continues to support research into complementary approaches including energy therapies.
          </div>
          <p>
            Reiki has been adopted as a complementary offering in numerous hospitals across the United States, including programs at <strong>Hartford Hospital</strong>, <strong>Cleveland Clinic</strong>, <strong>Memorial Sloan Kettering Cancer Center</strong>, and <strong>Yale-New Haven Hospital</strong>.
          </p>
        </div>

        {/* Benefits */}
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Heart size={14} /> Commonly Reported Benefits
          </div>
          <ul className="learn-info-list">
            <li><strong>Stress Reduction</strong> — Promotes deep relaxation and calm</li>
            <li><strong>Emotional Support</strong> — May help with anxiety, grief, and emotional balance</li>
            <li><strong>Relaxation</strong> — Recipients often report improved sleep quality</li>
            <li><strong>Complementary Pain Support</strong> — Used alongside medical treatment to support comfort</li>
            <li><strong>Sense of Well-Being</strong> — Many recipients describe feeling centered and peaceful after sessions</li>
          </ul>
          <div className="learn-highlight-box">
            <em>Note:</em> These are commonly reported subjective experiences. Reiki is a complementary therapy and individual results vary. It is not a substitute for professional medical treatment.
          </div>
        </div>
      </>
    ),
  },

  /* ──────────── 2. CRYSTAL HEALING GUIDE ──────────── */
  {
    id: 'crystals',
    title: 'Crystal Healing Guide',
    subtitle: 'Stones, properties & energy work basics',
    emoji: '💎',
    iconBg: 'linear-gradient(135deg, rgba(229,179,187,0.2), rgba(142,68,173,0.15))',
    category: 'crystals',
    content: (
      <>
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Gem size={14} /> How Crystals Are Used in Energy Work
          </div>
          <p>
            Crystal healing is a holistic practice in which stones and minerals are placed on or around the body. Practitioners believe that crystals carry unique vibrational frequencies that may interact with the body's energy field to promote balance and well-being.
          </p>
          <p>
            While scientific evidence for crystal healing's effectiveness is limited, the practice has been used across many cultures for thousands of years and remains popular as a complementary wellness tool. Many people find comfort and focus through working with crystals as part of meditation and mindfulness practices.
          </p>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Sparkles size={14} /> Key Crystals & Their Traditional Associations
          </div>
          <div className="learn-crystal-grid">
            {[
              { emoji: '🔮', name: 'Amethyst', prop: 'Spiritual clarity & calm' },
              { emoji: '💗', name: 'Rose Quartz', prop: 'Heart healing & love' },
              { emoji: '🤍', name: 'Clear Quartz', prop: 'Amplification & focus' },
              { emoji: '💙', name: 'Lapis Lazuli', prop: 'Wisdom & truth' },
              { emoji: '🌟', name: 'Citrine', prop: 'Abundance & positivity' },
              { emoji: '🖤', name: 'Black Tourmaline', prop: 'Grounding & protection' },
            ].map((crystal) => (
              <motion.div
                key={crystal.name}
                className="learn-crystal-card"
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <span className="learn-crystal-emoji">{crystal.emoji}</span>
                <div>
                  <div className="learn-crystal-name">{crystal.name}</div>
                  <div className="learn-crystal-prop">{crystal.prop}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="learn-highlight-box">
            <strong>Note about Sage:</strong> White sage (<em>Salvia apiciana</em>) is an herb — not a crystal — traditionally used in purification and smudging ceremonies. It has been used by Indigenous peoples of North America for centuries. If you practice smudging, please source sage ethically and respectfully.
          </div>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Heart size={14} /> Choosing & Caring for Crystals
          </div>
          <ul className="learn-info-list">
            <li><strong>Choosing:</strong> Many practitioners recommend selecting a crystal intuitively — the stone that "calls" to you or catches your eye</li>
            <li><strong>Cleansing:</strong> Common methods include placing crystals under moonlight, using sound (singing bowls), or rinsing in running water (note: some crystals are water-sensitive)</li>
            <li><strong>Charging:</strong> Place in sunlight or moonlight, or set near Clear Quartz to recharge energy</li>
            <li><strong>Setting Intentions:</strong> Hold the crystal during meditation and focus on your intention for working with it</li>
            <li><strong>Storage:</strong> Keep crystals in a soft cloth or pouch to protect them from scratches and absorbing unwanted energies</li>
          </ul>
        </div>
      </>
    ),
  },

  /* ──────────── 3. THE CHAKRA SYSTEM ──────────── */
  {
    id: 'chakras',
    title: 'The Chakra System',
    subtitle: '7 energy centers of the body explained',
    emoji: '🌈',
    iconBg: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(229,179,187,0.15))',
    category: 'chakras',
    content: (
      <>
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Eye size={14} /> Understanding Chakras
          </div>
          <p>
            The chakra system originates from ancient Indian spiritual traditions and refers to seven main energy centers believed to run along the spine. The word "chakra" comes from Sanskrit, meaning "wheel" or "disc." Each chakra is associated with specific physical, emotional, and spiritual aspects of well-being.
          </p>
          <p>
            In Reiki and other energy healing modalities, practitioners often focus on balancing these energy centers. The gemstone protocols in this app are inspired by the traditional associations between crystals and chakra points.
          </p>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Sparkles size={14} /> The 7 Main Chakras
          </div>
          <div className="learn-chakra-grid">
            {[
              { name: 'Crown Chakra (Sahasrara)', color: '#9b59b6', location: 'Top of head', assoc: 'Spiritual connection, consciousness, enlightenment', sign: 'Balanced: clarity, wisdom | Imbalanced: disconnection, apathy' },
              { name: 'Third Eye Chakra (Ajna)', color: '#4a69bd', location: 'Between eyebrows', assoc: 'Intuition, perception, imagination', sign: 'Balanced: insight, focus | Imbalanced: confusion, poor judgment' },
              { name: 'Throat Chakra (Vishuddha)', color: '#45b7d1', location: 'Throat area', assoc: 'Communication, self-expression, truth', sign: 'Balanced: clear speech | Imbalanced: difficulty expressing feelings' },
              { name: 'Heart Chakra (Anahata)', color: '#2ecc71', location: 'Center of chest', assoc: 'Love, compassion, emotional balance', sign: 'Balanced: empathy, joy | Imbalanced: jealousy, isolation' },
              { name: 'Solar Plexus Chakra (Manipura)', color: '#f1c40f', location: 'Upper abdomen', assoc: 'Confidence, personal power, self-esteem', sign: 'Balanced: motivation | Imbalanced: low self-worth, indecisiveness' },
              { name: 'Sacral Chakra (Svadhisthana)', color: '#e67e22', location: 'Below navel', assoc: 'Creativity, emotions, pleasure', sign: 'Balanced: passion, joy | Imbalanced: emotional instability' },
              { name: 'Root Chakra (Muladhara)', color: '#e74c3c', location: 'Base of spine', assoc: 'Security, grounding, survival instincts', sign: 'Balanced: stability | Imbalanced: anxiety, insecurity' },
            ].map((chakra) => (
              <motion.div
                key={chakra.name}
                className="learn-chakra-item"
                whileHover={{ x: 4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="learn-chakra-dot" style={{ background: chakra.color, boxShadow: `0 0 12px ${chakra.color}44` }}>
                </div>
                <div className="learn-chakra-info">
                  <div className="learn-chakra-name">{chakra.name}</div>
                  <div className="learn-chakra-detail">
                    📍 {chakra.location} · {chakra.assoc}
                  </div>
                  <div className="learn-chakra-detail" style={{ marginTop: 2, opacity: 0.6 }}>
                    {chakra.sign}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Gem size={14} /> Chakras & Gemstone Protocols
          </div>
          <p>
            The gemstone healing protocols in this app draw from traditional associations between specific crystals and chakra energy centers. For example, <em>Amethyst</em> is traditionally linked to the Crown Chakra, while <em>Rose Quartz</em> corresponds to the Heart Chakra.
          </p>
          <div className="learn-highlight-box">
            These associations come from traditional healing practices and are offered for spiritual and meditative use. They are not medical prescriptions. Always consult a healthcare provider for medical concerns.
          </div>
        </div>
      </>
    ),
  },

  /* ──────────── 4. REIKI IN HEALTHCARE ──────────── */
  {
    id: 'healthcare',
    title: 'Reiki in Healthcare',
    subtitle: 'Hospital adoption & integration with medicine',
    emoji: '🏥',
    iconBg: 'linear-gradient(135deg, rgba(0,184,148,0.2), rgba(160,210,235,0.15))',
    category: 'healthcare',
    content: (
      <>
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Building2 size={14} /> Hospital Adoption
          </div>
          <p>
            Reiki has been increasingly integrated into hospital settings across the United States. According to data from the American Hospital Association, an estimated <strong>over 60 U.S. hospitals</strong> have offered Reiki as part of their complementary care programs.
          </p>
          <div className="learn-stat-row">
            <div className="learn-stat-card">
              <div className="learn-stat-number">60+</div>
              <div className="learn-stat-label">U.S. Hospitals</div>
            </div>
            <div className="learn-stat-card">
              <div className="learn-stat-number">1922</div>
              <div className="learn-stat-label">Year Founded</div>
            </div>
            <div className="learn-stat-card">
              <div className="learn-stat-number">800K+</div>
              <div className="learn-stat-label">U.S. Practitioners (est.)</div>
            </div>
          </div>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Heart size={14} /> Notable Hospital Programs
          </div>
          <div className="learn-hospital-list">
            {[
              { icon: '🏥', name: 'Cleveland Clinic', detail: 'Offers Reiki as part of its Integrative Medicine program' },
              { icon: '🏥', name: 'Memorial Sloan Kettering Cancer Center', detail: 'Provides Reiki for cancer patients as supportive care' },
              { icon: '🏥', name: 'Hartford Hospital', detail: 'Pioneering Reiki volunteer program for patients' },
              { icon: '🏥', name: 'Yale-New Haven Hospital', detail: 'Integrates Reiki into patient wellness offerings' },
              { icon: '🏥', name: 'Johns Hopkins Medicine', detail: 'Has explored integrative medicine including energy therapies' },
            ].map((hospital) => (
              <motion.div
                key={hospital.name}
                className="learn-hospital-card"
                whileHover={{ x: 3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <span className="learn-hospital-icon">{hospital.icon}</span>
                <div>
                  <div className="learn-hospital-name">{hospital.name}</div>
                  <div className="learn-hospital-detail">{hospital.detail}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Activity size={14} /> How Reiki Is Used in Hospitals
          </div>
          <ul className="learn-info-list">
            <li><strong>Stress & Anxiety Reduction:</strong> Offered to patients before and after surgery to promote relaxation</li>
            <li><strong>Pain Management Support:</strong> Used alongside conventional pain management as a complementary approach</li>
            <li><strong>Emotional Comfort:</strong> Provided to patients undergoing chemotherapy, radiation, and other intensive treatments</li>
            <li><strong>End-of-Life Care:</strong> Offered in palliative and hospice settings for patient comfort</li>
            <li><strong>Staff Wellness:</strong> Some hospitals offer Reiki to healthcare workers for stress relief</li>
          </ul>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Brain size={14} /> Research & the Center for Reiki Research
          </div>
          <p>
            The <strong>Center for Reiki Research</strong> maintains a database of peer-reviewed Reiki studies and promotes rigorous scientific examination of Reiki's effects. While many studies are preliminary or have small sample sizes, there is a growing body of research exploring Reiki's potential benefits for stress reduction and quality of life.
          </p>
          <div className="learn-highlight-box">
            Reiki research is still evolving. While promising preliminary results exist, the scientific community generally agrees that more large-scale, rigorous studies are needed to draw definitive conclusions.
          </div>
        </div>
      </>
    ),
  },

  /* ──────────── 5. PRACTITIONERS & SUPPORTERS ──────────── */
  {
    id: 'practitioners',
    title: 'Practitioners & Supporters',
    subtitle: 'Verified public figures & holistic healing advocates',
    emoji: '🌟',
    iconBg: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(142,68,173,0.15))',
    category: 'practitioners',
    content: (
      <>
        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Users size={14} /> Public Figures & Holistic Healing
          </div>
          <p>
            Several well-known figures have publicly discussed or advocated for complementary healing practices including Reiki. The following information is based on verified public statements and reports.
          </p>
          <div className="learn-practitioner-grid">
            {/* Dr. Oz — verified public statements */}
            <motion.div
              className="learn-practitioner-card"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="learn-practitioner-avatar" style={{ background: 'linear-gradient(135deg, #4a69bd, #6a89cc)' }}>
                🩺
              </div>
              <div className="learn-practitioner-info">
                <div className="learn-practitioner-name">Dr. Mehmet Oz</div>
                <div className="learn-practitioner-role">Cardiothoracic Surgeon, TV Personality</div>
                <div className="learn-practitioner-desc">
                  Dr. Oz has discussed Reiki on his nationally televised show and publicly mentioned that Reiki has been used at Columbia University Medical Center. He has called Reiki "one of my favorites" among complementary healing techniques in his public media appearances.
                </div>
              </div>
            </motion.div>

            {/* Pamela Miles — verified Reiki authority */}
            <motion.div
              className="learn-practitioner-card"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="learn-practitioner-avatar" style={{ background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)' }}>
                ✨
              </div>
              <div className="learn-practitioner-info">
                <div className="learn-practitioner-name">Pamela Miles</div>
                <div className="learn-practitioner-role">Reiki Master, Author & Researcher</div>
                <div className="learn-practitioner-desc">
                  Pamela Miles is one of the foremost Reiki practitioners in the U.S. She has brought Reiki into hospital settings including Yale-New Haven Hospital and has published peer-reviewed articles on Reiki's role in healthcare. She authored the book <em>"Reiki: A Comprehensive Guide."</em>
                </div>
              </div>
            </motion.div>

            {/* Military / VA */}
            <motion.div
              className="learn-practitioner-card"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="learn-practitioner-avatar" style={{ background: 'linear-gradient(135deg, #00b894, #55efc4)' }}>
                🎖️
              </div>
              <div className="learn-practitioner-info">
                <div className="learn-practitioner-name">U.S. Military & VA</div>
                <div className="learn-practitioner-role">Complementary Therapy Programs</div>
                <div className="learn-practitioner-desc">
                  The U.S. Department of Veterans Affairs and Department of Defense have explored complementary and integrative health approaches for veterans, including energy healing modalities. The VA's Whole Health program includes a range of complementary therapies to support veterans' well-being.
                </div>
              </div>
            </motion.div>

            {/* Athletes */}
            <motion.div
              className="learn-practitioner-card"
              whileHover={{ x: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="learn-practitioner-avatar" style={{ background: 'linear-gradient(135deg, #fdcb6e, #e17055)' }}>
                🏅
              </div>
              <div className="learn-practitioner-info">
                <div className="learn-practitioner-name">Athletes & Wellness</div>
                <div className="learn-practitioner-role">Alternative Recovery Modalities</div>
                <div className="learn-practitioner-desc">
                  Various professional athletes have publicly discussed incorporating alternative and complementary healing modalities into their recovery routines, including meditation, acupuncture, and energy work. These practices are increasingly common in professional sports wellness programs.
                </div>
                <span className="learn-reported-tag">General trend — individual claims vary</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="learn-subsection">
          <div className="learn-subsection-title">
            <Building2 size={14} /> Growing Mainstream Acceptance
          </div>
          <p>
            Reiki and other complementary therapies have seen growing mainstream acceptance over the past two decades. According to the <strong>National Health Interview Survey</strong>, millions of Americans use complementary health approaches each year. The growing number of hospital-based Reiki programs reflects an expanding recognition of integrative approaches to patient care.
          </p>
          <div className="learn-highlight-box">
            <strong>Important:</strong> The inclusion of any public figure here reflects their publicly documented statements or actions. It does not constitute a medical endorsement of Reiki or any other complementary therapy.
          </div>
        </div>
      </>
    ),
  },
];

/* ──────────── VIDEO DATA ──────────── */
const VIDEOS = [];

/* Category / tab config */
const TABS = [
  { id: 'all', label: 'All Topics', emoji: '📚' },
  { id: 'reiki', label: 'Reiki', emoji: '🙌' },
  { id: 'crystals', label: 'Crystals', emoji: '💎' },
  { id: 'chakras', label: 'Chakras', emoji: '🌈' },
  { id: 'healthcare', label: 'Healthcare', emoji: '🏥' },
  { id: 'practitioners', label: 'People', emoji: '🌟' },
];

/* ═══════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════ */
const LearnSection = ({ isMobileLayout = false }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('all');

  const getTabLabel = (id) => {
    switch (id) {
      case 'all': return t('topicAll');
      case 'reiki': return t('topicReiki');
      case 'crystals': return t('topicCrystals');
      case 'chakras': return t('topicChakras');
      case 'healthcare': return t('topicHealthcare');
      case 'practitioners': return t('topicPeople');
      default: return id;
    }
  };
  const [expandedCards, setExpandedCards] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);

  /* Toggle card expand/collapse */
  const toggleCard = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  /* Filter sections by tab & search */
  const filteredSections = useMemo(() => {
    let results = SECTIONS;
    if (activeTab !== 'all') {
      results = results.filter((s) => s.category === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.subtitle.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }
    return results;
  }, [activeTab, searchQuery]);

  /* Filter videos by tab */
  const filteredVideos = useMemo(() => {
    if (activeTab === 'all') return VIDEOS;
    return VIDEOS.filter((v) => v.category === activeTab);
  }, [activeTab]);

  /* ─── Animation variants ─── */
  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  return (
    <div className={`learn-section${isMobileLayout ? ' mobile' : ''}`}>
      {/* ──── Header ──── */}
      <motion.div
        className="learn-header"
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="learn-header-icon">
          <BookOpen size={28} />
        </div>
        <h2>{t('libraryTitle')}</h2>
        <p>
          {t('librarySub')}
        </p>
      </motion.div>

      {/* ──── Search ──── */}
      <motion.div
        className="learn-search-container"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
      >
        <Search size={16} className="learn-search-icon" />
        <input
          id="library-search-input"
          name="search"
          type="text"
          className="learn-search-input"
          placeholder={t('librarySearch')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </motion.div>

      {/* ──── Tabs ──── */}
      <motion.div
        className="learn-tabs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`learn-tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="learn-tab-emoji">{tab.emoji}</span>
            {getTabLabel(tab.id)}
          </button>
        ))}
      </motion.div>

      {/* ──── Cards ──── */}
      <motion.div
        className="learn-cards-container"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        key={activeTab + searchQuery}
      >
        {filteredSections.length === 0 ? (
          <motion.div className="learn-no-results" variants={cardVariants}>
            <div className="learn-no-results-icon">🔍</div>
            <p>{t('learnNoResults')}</p>
          </motion.div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = !!expandedCards[section.id];
            return (
              <motion.div
                key={section.id}
                className={`learn-card${isExpanded ? ' expanded' : ''}`}
                variants={cardVariants}
                layout
              >
                <div className="learn-card-header" onClick={() => toggleCard(section.id)}>
                  <div
                    className="learn-card-icon-badge"
                    style={{ background: section.iconBg }}
                  >
                    {section.emoji}
                  </div>
                  <div className="learn-card-title-area">
                    <div className="learn-card-title">{section.title}</div>
                    <div className="learn-card-subtitle">{section.subtitle}</div>
                  </div>
                  <ChevronDown size={18} className="learn-card-chevron" />
                </div>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      className="learn-card-body"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                    >
                      {section.content}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* ──── Video Section ──── */}
      {filteredVideos.length > 0 && (
        <motion.div
          className="learn-subsection"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginTop: '2rem', position: 'relative', zIndex: 1 }}
        >
          <div className="learn-subsection-title">
            <Play size={14} /> Educational Videos
          </div>
          <div className="learn-video-grid">
            {filteredVideos.map((video) => (
              <motion.div
                key={video.id}
                className="learn-video-card"
                onClick={() => setActiveVideo(video)}
                whileHover={{ y: -3 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div
                  className="learn-video-thumb"
                  style={{
                    backgroundImage: `url(https://img.youtube.com/vi/${video.id}/mqdefault.jpg)`,
                  }}
                >
                  <div className="learn-video-play-btn">
                    <Play size={16} />
                  </div>
                </div>
                <div className="learn-video-label">{video.title}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ──── Video Modal ──── */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="learn-video-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="learn-video-modal"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="learn-video-modal-header">
                <span className="learn-video-modal-title">{activeVideo.title}</span>
                <button
                  className="learn-video-modal-close"
                  onClick={() => setActiveVideo(null)}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="learn-video-embed">
                <iframe
                  src={`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──── Disclaimer ──── */}
      <motion.div
        className="learn-disclaimer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <div className="learn-disclaimer-title">
          <AlertTriangle size={14} /> {t('learnDisclaimerTitle')}
        </div>
        <p>
          {t('learnDisclaimerText1')}
        </p>
        <p>
          {t('learnDisclaimerText2')}
        </p>
        <div className="learn-hipaa-badge">
          <Shield size={12} />
          {t('learnDisclaimerHIPAA')}
        </div>
      </motion.div>
    </div>
  );
};

export default LearnSection;
