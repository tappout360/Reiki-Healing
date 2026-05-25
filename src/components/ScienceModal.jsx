import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Zap, Globe, Cpu, Radio, Microscope, X, BookOpen, Leaf, Star, Heart, Clock, Award, Users } from 'lucide-react';
import './ScienceModal.css';

const TABS = [
  { id: 'science', label: 'The Science', icon: Microscope, emoji: '🔬' },
  { id: 'history', label: 'History & Origins', icon: BookOpen, emoji: '📜' },
  { id: 'sage', label: 'The Sage Tradition', icon: Leaf, emoji: '🌿' },
  { id: 'advocates', label: 'Notable Advocates', icon: Star, emoji: '⭐' },
  { id: 'medicine', label: 'In Modern Medicine', icon: Heart, emoji: '🏥' },
];

/* ─── Tab 1: The Science (original content, preserved) ─── */
const ScienceTab = () => {
  const [activeImpact, setActiveImpact] = useState(null);
  return (
    <>
      <section className="science-section">
        <h3><Activity size={20} /> The Biofield Mechanism</h3>
        <p>
          Every living biological system emits an electromagnetic field, scientifically referred to as the <strong>Biofield</strong>.
          According to the Institute of HeartMath, the human heart generates the strongest electromagnetic field in the body—up to 100 times stronger electrically and 5,000 times stronger magnetically than the brain—measurable several feet away using sensitive magnetometers.
        </p>
        <div className="highlight-box">
          <strong>SQUID Magnetometry:</strong> In the 1980s, biophysicist Dr. John Zimmerman utilized a Superconducting Quantum Interference Device (SQUID) to measure the biomagnetic fields of energy healers' hands. He recorded weak pulsating electromagnetic fields sweeping through <strong>0.3 to 30 Hz</strong>, with strong activity in the <strong>7–8 Hz (alpha/theta)</strong> boundary.
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #a1a1a1)', marginTop: '0.5rem', fontStyle: 'italic', lineHeight: '1.4' }}>
          *Note on Replication: While Zimmerman's pioneering work established this range, a 2013 study utilizing advanced magnetic shielding reported that any biomagnetic emissions from the hands did not exceed normal physiological boundaries (e.g., heartbeat harmonics). Hence, biofield interactions are likely subtle and mediated through autonomic nervous system entrainment rather than high-intensity radiation.
        </p>
      </section>

      <section className="science-section">
        <h3><Radio size={20} /> Frequency Precision (528Hz & 432Hz)</h3>
        <p>Sound therapy utilizes specific hertz frequencies to entrain neural oscillations. Our protocols are tuned to these scientifically significant resonances:</p>
        <ul className="science-list">
          <li>
            <span className="freq-tag">528 Hz</span>
            <span>
              <strong>"The Miracle Tone":</strong> Studies suggest this frequency can reduce cortisol (stress hormone) levels and increase oxytocin. It is theorized to influence cellular water structure, potentially aiding in DNA repair mechanisms.
            </span>
          </li>
          <li>
            <span className="freq-tag">432 Hz</span>
            <span>
              <strong>"Verdi's Tuning":</strong> Mathematically consistent with the universe's phi-ratio. Clinical trials have observed lower heart rate and blood pressure in subjects listening to 432Hz compared to standard 440Hz music, indicating a shift to parasympathetic nervous system dominance.
            </span>
          </li>
        </ul>
      </section>

      <section className="science-section">
        <h3><Cpu size={20} /> Quantum Coherence</h3>
        <p>
          Beyond classical electromagnetism, modern theory proposes that consciousness interacts with matter via <strong>Quantum Coherence</strong> within the body's microtubules.
          Energy healing helps restore this coherence, reducing "entropy" (disorder) in the body's information systems.
        </p>
      </section>

      <section className="science-section">
        <h3><Zap size={20} /> Measured Physiological Impact</h3>
        <p style={{fontSize: '0.9rem', marginBottom: '1.5rem'}}>Select a biomarker to view clinical mechanisms.</p>

        <div className="stats-grid">
          <div className="stat-card interactive" onClick={() => setActiveImpact(activeImpact === 'cortisol' ? null : 'cortisol')} style={{borderColor: activeImpact === 'cortisol' ? 'var(--earth-green)' : ''}}>
            <h4>Cortisol</h4><span className="down">▼ Reduced</span><p>Decreased stress markers.</p>
          </div>
          <div className="stat-card interactive" onClick={() => setActiveImpact(activeImpact === 'hrv' ? null : 'hrv')} style={{borderColor: activeImpact === 'hrv' ? 'var(--earth-green)' : ''}}>
            <h4>HRV</h4><span className="up">▲ Increased</span><p>Heart Rate Variability improves.</p>
          </div>
          <div className="stat-card interactive" onClick={() => setActiveImpact(activeImpact === 'brain' ? null : 'brain')} style={{borderColor: activeImpact === 'brain' ? 'var(--earth-green)' : ''}}>
            <h4>Brainwaves</h4><span className="neutral">~ Alpha/Theta</span><p>Shift to Alpha (calm).</p>
          </div>
        </div>

        <AnimatePresence>
          {activeImpact && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="impact-detail-container">
              {activeImpact === 'cortisol' && (
                <div className="impact-detail">
                  <h4>Biochemical Stress Reduction (528 Hz)</h4>
                  <p><strong>Mechanism:</strong> Clinical pilot studies involving 528 Hz exposure demonstrated a statistical reduction in salivary cortisol levels compared to control groups (440 Hz).</p>
                  <p><strong>Outcome:</strong> This reduction correlates with an increase in Oxytocin production, facilitating cellular repair and reducing systemic inflammation caused by chronic fight-or-flight states.</p>
                </div>
              )}
              {activeImpact === 'hrv' && (
                <div className="impact-detail">
                  <h4>Parasympathetic Activation (432 Hz)</h4>
                  <p><strong>Mechanism:</strong> Heart Rate Variability (HRV) is the key marker of autonomic nervous system flexibility. Listening to 432 Hz "Verdi's A" has been shown to significantly lower systolic blood pressure and heart rate.</p>
                  <p><strong>Outcome:</strong> This signals a dominance of the parasympathetic (rest-and-digest) system, essential for deep-tissue regeneration and immune system efficiency.</p>
                </div>
              )}
              {activeImpact === 'brain' && (
                <div className="impact-detail">
                  <h4>Biomagnetic Entrainment (0.3 - 30 Hz)</h4>
                  <p><strong>Mechanism:</strong> SQUID Magnetometer readings of Reiki practitioners' hands show emissions pulsing between 0.3 and 30 Hz.</p>
                  <p><strong>Outcome:</strong> This range precisely sweeps through the brain's regulatory frequencies:<br/><br/>• <strong>2 Hz:</strong> Nerve Regeneration<br/>• <strong>7 Hz:</strong> Bone Growth (Theta)<br/>• <strong>10 Hz:</strong> Ligament Repair (Alpha)</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </>
  );
};

/* ─── Tab 2: History & Origins ─── */
const HistoryTab = () => (
  <>
    <section className="science-section">
      <h3><BookOpen size={20} /> The Birth of Reiki</h3>
      <p>
        The word <strong>Reiki</strong> (霊気) comes from two Japanese kanji: <em>Rei</em> (universal, spiritual) and <em>Ki</em> (life force energy). 
        It is a gentle, hands-on healing practice founded on the principle that a trained practitioner can channel universal life force energy to support the body's natural ability to heal.
      </p>
      <div className="highlight-box">
        "Just for today, do not worry. Just for today, do not anger. Honor your parents, teachers, and elders. Earn your living honestly. Show gratitude to every living thing."<br/>
        <span style={{display:'block', marginTop:'0.75rem', fontStyle:'normal', opacity: 0.7, fontSize:'0.95rem'}}>— The Five Reiki Principles, Mikao Usui</span>
      </div>
    </section>

    <section className="science-section">
      <h3><Clock size={20} /> A Living Lineage</h3>
      <div className="timeline">
        <div className="timeline-item">
          <div className="timeline-year">1865</div>
          <div className="timeline-content">
            <strong>Mikao Usui</strong> is born in Taniai, Gifu Prefecture, Japan. He studies Buddhism, martial arts, and traditional healing throughout his life.
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-year">1922</div>
          <div className="timeline-content">
            After a <strong>21-day meditation and fasting retreat</strong> on Mount Kurama near Kyoto, Usui experiences a profound spiritual awakening and discovers the ability to channel healing energy. He founds the <em>Usui Reiki Ryoho Gakkai</em> (Usui Reiki Healing Society) in Tokyo.
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-year">1925</div>
          <div className="timeline-content">
            <strong>Dr. Chujiro Hayashi</strong>, a retired naval officer and physician, becomes Usui's student. He later systematizes the practice by introducing structured hand positions and opening a dedicated Reiki clinic in Tokyo.
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-year">1937</div>
          <div className="timeline-content">
            <strong>Hawayo Takata</strong>, a Japanese-American woman from Hawaii, trains under Hayashi in Japan. She brings Reiki to the Western world, teaching and practicing in Hawaii and eventually across North America.
          </div>
        </div>
        <div className="timeline-item">
          <div className="timeline-year">1980s</div>
          <div className="timeline-content">
            Takata trains <strong>22 Reiki Masters</strong> before her passing in 1980. Her students spread the practice across the globe, leading to the worldwide Reiki movement we know today.
          </div>
        </div>
        <div className="timeline-item active">
          <div className="timeline-year">Today</div>
          <div className="timeline-content">
            Over <strong>4 million people</strong> worldwide practice Reiki. It is offered in <strong>800+ U.S. hospitals</strong> and recognized by the National Institutes of Health (NIH) as a complementary health approach.
          </div>
        </div>
      </div>
    </section>
  </>
);

/* ─── Tab 3: The Sage Tradition ─── */
const SageTab = () => (
  <>
    <section className="science-section">
      <h3><Leaf size={20} /> Sacred Smoke: An Ancient Practice</h3>
      <p>
        The burning of sacred herbs — known as <strong>smudging</strong> — is one of humanity's oldest spiritual rituals. 
        For thousands of years, indigenous cultures across the Americas, particularly <strong>Native American traditions</strong>, have used White Sage (<em>Salvia apiana</em>) 
        to cleanse spaces, objects, and people of negative or stagnant energy.
      </p>
      <div className="highlight-box">
        Smudging is considered a sacred act of prayer and purification. The rising smoke is believed to carry prayers upward and invite positive energy, clarity, and protection into the space.
      </div>
    </section>

    <section className="science-section">
      <h3><Globe size={20} /> Sage Across Cultures</h3>
      <p>The reverence for sage extends far beyond any single tradition:</p>
      <div className="sage-grid">
        <div className="sage-card">
          <div className="sage-card-icon">🌎</div>
          <strong>Native American</strong>
          <p>White Sage used in purification ceremonies, sweat lodges, and healing rituals. Considered one of the four sacred medicines alongside sweetgrass, tobacco, and cedar.</p>
        </div>
        <div className="sage-card">
          <div className="sage-card-icon">🏛️</div>
          <strong>Ancient Rome & Greece</strong>
          <p>The Latin name <em>Salvia</em> comes from <em>"salvare"</em> — meaning "to save" or "to heal." Romans burned sage for wisdom and purification in temples.</p>
        </div>
        <div className="sage-card">
          <div className="sage-card-icon">🕉️</div>
          <strong>Vedic Traditions</strong>
          <p>The <em>Havan</em> ceremony uses sacred herb blends in fire rituals for spiritual cleansing — a practice documented for over 3,000 years.</p>
        </div>
        <div className="sage-card">
          <div className="sage-card-icon">☯️</div>
          <strong>Traditional Chinese Medicine</strong>
          <p>Chinese sage (<em>Danshen</em>) has been used for millennia to promote circulation, calm the spirit, and support heart health.</p>
        </div>
      </div>
    </section>

    <section className="science-section">
      <h3><Microscope size={20} /> Biochemical Analysis of White Sage</h3>
      <p>
        Modern chromatography and mass spectrometry have mapped the active chemical profile of White Sage (<em>Salvia apiana</em>) essential oil and polar extracts:
      </p>
      <ul className="sage-science-list">
        <li>
          <strong>High 1,8-Cineole (Eucalyptol):</strong> Comprising <strong>26% to 71%</strong> of the essential oil, this monoterpene is known for its refreshing, clearing, and respiratory-soothing properties.
        </li>
        <li>
          <strong>Camphor Content:</strong> Comprising <strong>2% to 22%</strong>, camphor acts as a mild cognitive stimulant and gives white sage its cooling sensory signature.
        </li>
        <li>
          <strong>Absence of Thujone:</strong> Unlike common culinary sage (<em>Salvia officinalis</em>), White Sage essential oil lacks neurotoxic <strong>thujone</strong>, making it safer for inhalation during ceremonies.
        </li>
        <li>
          <strong>Phenolic Diterpenes:</strong> Rich in antioxidants such as <strong>carnosic acid</strong>, <strong>rosmanol</strong>, and <strong>carnosol</strong>, which exhibit strong anti-inflammatory and free-radical scavenging properties in extracts.
        </li>
        <li>
          <strong>In Vitro Antimicrobial Action:</strong> Laboratory studies demonstrate that extracts of <em>Salvia apiana</em> show potent inhibitory and bactericidal efficacy against Gram-positive bacteria, including <em>Staphylococcus aureus</em> and <em>Streptococcus pyogenes</em>, as well as fungal pathogens like <em>Candida albicans</em>.
        </li>
      </ul>
      <div className="highlight-box" style={{ borderLeftColor: 'var(--earth-accent, #c8963e)' }}>
        <strong>Science Fact-Check:</strong> A popular online claim states that burning sage reduces airborne bacteria by 94%. However, the 2007 <em>Journal of Ethnopharmacology</em> study actually tested <strong>havan sámagri</strong> (a traditional Vedic polyherbal blend), not white sage. Although smudging white sage has not been clinically proven to disinfect room air, the ritual remains a highly effective aromatherapy anchor, using volatile terpenes to stimulate the olfactory system and shift cognitive states.
      </div>
    </section>
  </>
);

/* ─── Tab 4: Notable Advocates ─── */
const AdvocatesTab = () => {
  const advocates = [
    { name: 'Dr. Mehmet Oz', role: 'Surgeon & TV Host', note: 'Has featured Reiki on his show and incorporated it into his medical center. Called it "my favorite treatment in the entire operating room."' },
    { name: 'Gwyneth Paltrow', role: 'Actress & Wellness Advocate', note: 'Has spoken about using Reiki to help navigate emotional challenges. Features Reiki practitioners through her Goop wellness platform.' },
    { name: 'Angelina Jolie', role: 'Actress & Humanitarian', note: 'Widely reported as a dedicated Reiki practitioner, using energy healing as part of her holistic wellness routine.' },
    { name: 'Nicole Kidman', role: 'Actress', note: 'Has spoken publicly about her experience with Reiki and its role in supporting emotional balance and calm.' },
    { name: 'Christina Aguilera', role: 'Singer & Performer', note: 'Has shared that she utilized Reiki sessions alongside yoga and a healthy diet to manage the stresses of her career.' },
    { name: 'Erykah Badu', role: 'R&B Artist & Reiki Master', note: 'Not just an advocate — she is a fully trained and certified Reiki Master who actively practices energy healing.' },
    { name: 'Lili Reinhart', role: 'Actress (Riverdale)', note: 'Openly shares her interest in energy healing and has undergone training to become a Reiki Master herself.' },
    { name: 'Phil Mickelson', role: 'Professional Golfer', note: 'Has received Reiki treatments for stress management during tournaments and to help cope with arthritis.' },
    { name: 'Donna Karan', role: 'Fashion Designer', note: 'Founder of the Urban Zen Foundation, which integrates Reiki and holistic practices into healthcare and well-being programs.' },
    { name: 'Shania Twain', role: 'Country Music Icon', note: 'Has spoken about her support for Reiki and featured a Reiki session on her TV show, Why Not? With Shania Twain.' },
    { name: 'Madonna', role: 'Singer & Cultural Icon', note: 'Has long embraced various energy healing modalities, including Reiki, as part of her spiritual and wellness practice.' },
    { name: 'Oprah Winfrey', role: 'Media Mogul', note: 'Has featured Reiki and energy healing on her platform, helping bring awareness of these practices to mainstream audiences.' },
  ];
  return (
    <>
      <section className="science-section">
        <h3><Star size={20} /> Trusted by World-Class Performers</h3>
        <p>
          Reiki has found advocates among some of the world's most recognized names — from Oscar-winning actors to professional athletes. 
          These individuals have publicly shared how energy healing supports their well-being, creativity, and performance.
        </p>
      </section>

      <div className="advocates-grid">
        {advocates.map((person, i) => (
          <motion.div
            key={person.name}
            className="advocate-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="advocate-header">
              <div className="advocate-avatar">{person.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <strong>{person.name}</strong>
                <span className="advocate-role">{person.role}</span>
              </div>
            </div>
            <p>{person.note}</p>
          </motion.div>
        ))}
      </div>

      <section className="science-section" style={{marginTop: '2rem'}}>
        <div className="highlight-box" style={{borderLeftColor: 'var(--earth-accent)'}}>
          <strong>Also reported:</strong> Sandra Bullock, Ellen DeGeneres, Halle Berry, Kate Hudson, Sting, Sheryl Crow, and many more have been connected to Reiki and energy healing practices.
        </div>
      </section>
    </>
  );
};

/* ─── Tab 5: In Modern Medicine ─── */
const MedicineTab = () => {
  const hospitals = [
    { name: 'Cleveland Clinic', location: 'Cleveland, OH', detail: 'Offers Reiki as part of its Healing Services — provided free of charge to patients, families, and employees. Available at the Taussig Cancer Center.' },
    { name: 'Memorial Sloan Kettering', location: 'New York, NY', detail: 'Integrative Medicine Service offers Reiki to support cancer patients with stress, pain, and anxiety during treatment.' },
    { name: 'MD Anderson Cancer Center', location: 'Houston, TX', detail: 'One of the world\'s leading cancer centers, offers complementary therapies including Reiki as part of its Integrative Medicine Center.' },
    { name: 'Dana-Farber Cancer Institute', location: 'Boston, MA', detail: 'Partners with integrative health practitioners to offer Reiki and other modalities to patients undergoing cancer treatment.' },
    { name: 'Johns Hopkins Medicine', location: 'Baltimore, MD', detail: 'Has explored integrative healing modalities including Reiki through its Center for Complementary and Integrative Health.' },
    { name: 'UCLA Health', location: 'Los Angeles, CA', detail: 'The East-West Medicine program integrates Reiki and other complementary approaches with conventional medical care.' },
  ];
  return (
    <>
      <section className="science-section">
        <h3><Heart size={20} /> From Ancient Practice to Modern Healthcare</h3>
        <p>
          Reiki is no longer confined to wellness studios. Today, over <strong>800 hospitals across the United States</strong> offer Reiki as a complementary therapy — 
          integrating it alongside conventional medicine to support patient comfort, reduce anxiety, and improve quality of life.
        </p>
        <div className="medicine-stat-row">
          <div className="medicine-stat">
            <div className="medicine-stat-number">800+</div>
            <div className="medicine-stat-label">U.S. Hospitals</div>
          </div>
          <div className="medicine-stat">
            <div className="medicine-stat-number">4M+</div>
            <div className="medicine-stat-label">Practitioners Worldwide</div>
          </div>
          <div className="medicine-stat">
            <div className="medicine-stat-number">70+</div>
            <div className="medicine-stat-label">Countries Practicing</div>
          </div>
        </div>
      </section>

      <section className="science-section">
        <h3><Award size={20} /> Leading Medical Institutions</h3>
        <div className="hospitals-grid">
          {hospitals.map((h, i) => (
            <motion.div
              key={h.name}
              className="hospital-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="hospital-badge">🏥</div>
              <div className="hospital-info">
                <strong>{h.name}</strong>
                <span className="hospital-location">{h.location}</span>
                <p>{h.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="science-section">
        <h3><Activity size={20} /> Clinical Evidence & Physiological Markers</h3>
        <p>
          Peer-reviewed studies on Reiki explore its impact on the autonomic nervous system (ANS) and pathways governing stress recovery:
        </p>
        <ul className="sage-science-list">
          <li>
            <strong>Autonomic Nervous System Regulation:</strong> Clinical trials show Reiki significantly increases heart rate variability (HRV), particularly the SDNN index. This indicates a robust shift from the sympathetic (fight-or-flight) to the parasympathetic (rest-and-repair) nervous system.
          </li>
          <li>
            <strong>Stress and Pain Management:</strong> Reiki has been shown to reduce perceived pain and anxiety in oncology settings, aiding post-operative healing by facilitating relaxation and elevating patient pain thresholds.
          </li>
          <li>
            <strong>Mixed Biochemical Responses:</strong> While patients consistently report lower anxiety and subjective stress, salivary cortisol levels show mixed results across clinical trials, suggesting that Reiki's pathway of action operates primarily through autonomic pathways rather than immediate endocrine changes.
          </li>
        </ul>
      </section>

      <section className="science-section">
        <h3><Users size={20} /> What the NIH Says</h3>
        <p>
          The <strong>National Center for Complementary and Integrative Health (NCCIH)</strong>, part of the National Institutes of Health, 
          recognizes Reiki as a complementary health approach. Key takeaways from their assessment:
        </p>
        <ul className="sage-science-list">
          <li><strong>Safety:</strong> Reiki is considered safe as it is non-invasive and involves no ingestion of substances.</li>
          <li><strong>Patient Reports:</strong> Many patients report reduced anxiety, improved relaxation, and better overall sense of well-being following Reiki sessions.</li>
          <li><strong>Ongoing Research:</strong> The NIH continues to fund research into biofield therapies as the scientific understanding of energy medicine evolves.</li>
          <li><strong>Complementary Use:</strong> Reiki is recommended as a complement to — not a replacement for — conventional medical treatment.</li>
        </ul>
        <div className="highlight-box" style={{borderLeftColor: '#e5b3bb', background: 'rgba(229, 179, 187, 0.08)'}}>
          <strong>Disclaimer:</strong> Reiki is a complementary wellness practice. It is not intended to diagnose, treat, cure, or prevent any disease. Always consult your healthcare provider for medical advice.
        </div>
      </section>
    </>
  );
};

/* ─── Main Modal Component ─── */
const ScienceModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('science');

  const tabContent = {
    science: <ScienceTab />,
    history: <HistoryTab />,
    sage: <SageTab />,
    advocates: <AdvocatesTab />,
    medicine: <MedicineTab />,
  };

  const activeTabData = TABS.find(t => t.id === activeTab);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="science-modal-overlay"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          className="science-modal-content glass"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="close-button" onClick={onClose}>
            <X size={24} />
          </button>

          <header className="science-header">
            <div className="icon-badge">
              {activeTabData && <activeTabData.icon size={28} color="var(--accent-gold)" />}
            </div>
            <div>
              <h2>{activeTabData?.label || 'The Science of Resonance'}</h2>
              <p>Bridging Ancient Wisdom with Modern Understanding</p>
            </div>
          </header>

          {/* Tab Navigation */}
          <nav className="science-tabs">
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`science-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-emoji">{tab.emoji}</span>
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="science-body">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {tabContent[activeTab]}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="science-footer">
            <p>Our understanding is constantly evolving as new research emerges in the fields of Psychoacoustics, Bioenergetics, and Integrative Medicine.</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScienceModal;
