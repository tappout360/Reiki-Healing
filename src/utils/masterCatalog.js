/**
 * masterCatalog.js — Gold Store Item Database
 * ════════════════════════════════════════════
 * 100+ items organized by category with costume bundles.
 * Bump CATALOG_VERSION when adding/modifying items.
 */

export const CATALOG_VERSION = 8;

// ─── COSTUMES (Multi-slot bundles) ───
const COSTUMES = [
  { id: 'costume_celestial_healer', name: 'Celestial Healer Set', icon: '🌟', desc: 'Full cosmic healer outfit — robe, crown, boots, and aura.', price: 3500, category: 'costume', rarity: 'legendary', enabled: true,
    costumeSlots: {
      chest:    { name: 'Celestial Robe', icon: '🌟', avatarSlot: 'chest', avatarEmoji: '🥋', avatarStyle: { fill: '#7c3aed' } },
      head:     { name: 'Celestial Crown', icon: '👑', avatarSlot: 'head', avatarEmoji: '👑', avatarStyle: { fill: '#fbbf24' } },
      feet:     { name: 'Celestial Boots', icon: '👢', avatarSlot: 'feet', avatarEmoji: '👢', avatarStyle: { fill: '#7c3aed' } },
      aura:     { name: 'Celestial Aura', icon: '✨', avatarSlot: 'aura', avatarStyle: { fill: '#c084fc' } },
    }},
  { id: 'costume_shadow_monk', name: 'Shadow Monk Set', icon: '🥷', desc: 'Dark meditation attire — hooded cloak, wrappings, and void aura.', price: 2800, category: 'costume', rarity: 'epic', enabled: true,
    costumeSlots: {
      chest:    { name: 'Shadow Cloak', icon: '🥷', avatarSlot: 'chest', avatarEmoji: '🥷', avatarStyle: { fill: '#1e1b4b' } },
      head:     { name: 'Shadow Hood', icon: '🧥', avatarSlot: 'head', avatarEmoji: '🪖', avatarStyle: { fill: '#312e81' } },
      feet:     { name: 'Shadow Wraps', icon: '🩹', avatarSlot: 'feet', avatarStyle: { fill: '#1e1b4b' } },
      legs:     { name: 'Shadow Pants', icon: '👖', avatarSlot: 'legs', avatarStyle: { fill: '#1e1b4b' } },
    }},
  { id: 'costume_forest_druid', name: 'Forest Druid Set', icon: '🌿', desc: 'Earthy druid ensemble — leafy armor, vine crown, and bark boots.', price: 2200, category: 'costume', rarity: 'epic', enabled: true,
    costumeSlots: {
      chest:    { name: 'Leaf Mail', icon: '🍃', avatarSlot: 'chest', avatarEmoji: '🍃', avatarStyle: { fill: '#166534' } },
      head:     { name: 'Vine Crown', icon: '🌿', avatarSlot: 'head', avatarEmoji: '🌿', avatarStyle: { fill: '#15803d' } },
      feet:     { name: 'Bark Boots', icon: '🪵', avatarSlot: 'feet', avatarStyle: { fill: '#78350f' } },
      legs:     { name: 'Moss Leggings', icon: '👖', avatarSlot: 'legs', avatarStyle: { fill: '#14532d' } },
    }},
  { id: 'costume_ocean_shaman', name: 'Ocean Shaman Set', icon: '🐚', desc: 'Tidal healer set — coral vest, shell helm, and sea-foam sandals.', price: 2500, category: 'costume', rarity: 'epic', enabled: true,
    costumeSlots: {
      chest:    { name: 'Coral Vest', icon: '🪸', avatarSlot: 'chest', avatarEmoji: '🪸', avatarStyle: { fill: '#0891b2' } },
      head:     { name: 'Shell Helm', icon: '🐚', avatarSlot: 'head', avatarEmoji: '🐚', avatarStyle: { fill: '#06b6d4' } },
      feet:     { name: 'Tide Sandals', icon: '🌊', avatarSlot: 'feet', avatarStyle: { fill: '#0e7490' } },
      neck:     { name: 'Pearl Strand', icon: '📿', avatarSlot: 'neck', avatarEmoji: '📿', avatarStyle: { fill: '#e0f2fe' } },
    }},
  { id: 'costume_solar_knight', name: 'Solar Knight Set', icon: '☀️', desc: 'Radiant warrior — golden plate, sun shield, and blazing greaves.', price: 4000, category: 'costume', rarity: 'legendary', enabled: true,
    costumeSlots: {
      chest:    { name: 'Solar Plate', icon: '🛡️', avatarSlot: 'chest', avatarEmoji: '🛡️', avatarStyle: { fill: '#ca8a04' } },
      head:     { name: 'Sun Helm', icon: '☀️', avatarSlot: 'head', avatarEmoji: '☀️', avatarStyle: { fill: '#eab308' } },
      feet:     { name: 'Blazing Greaves', icon: '🔥', avatarSlot: 'feet', avatarStyle: { fill: '#b45309' } },
      legs:     { name: 'Golden Cuisses', icon: '👖', avatarSlot: 'legs', avatarStyle: { fill: '#a16207' } },
      accessory:{ name: 'Sun Shield', icon: '🛡️', avatarSlot: 'accessory', avatarEmoji: '🛡️', avatarStyle: { fill: '#fbbf24' } },
    }},
  { id: 'costume_phoenix_ascended', name: 'Phoenix Ascended Set', icon: '🔥', desc: 'Legendary phoenix rebirth — flame wings, ember robe, ash crown.', price: 6000, category: 'costume', rarity: 'legendary', enabled: true,
    costumeSlots: {
      chest:    { name: 'Ember Robe', icon: '🔥', avatarSlot: 'chest', avatarEmoji: '🔥', avatarStyle: { fill: '#dc2626' } },
      head:     { name: 'Ash Crown', icon: '👑', avatarSlot: 'head', avatarEmoji: '👑', avatarStyle: { fill: '#f97316' } },
      backbling: { name: 'Phoenix Wings', icon: '🕊️', avatarSlot: 'backbling', avatarEmoji: '🕊️', avatarStyle: { fill: '#ef4444' } },
      aura:     { name: 'Inferno Aura', icon: '🔥', avatarSlot: 'aura', avatarStyle: { fill: '#dc2626' } },
    }},
  { id: 'costume_frost_sage', name: 'Frost Sage Set', icon: '❄️', desc: 'Ice sage ensemble — crystal robe, frost crown, and permafrost boots.', price: 3200, category: 'costume', rarity: 'legendary', enabled: true,
    costumeSlots: {
      chest:    { name: 'Crystal Robe', icon: '❄️', avatarSlot: 'chest', avatarEmoji: '❄️', avatarStyle: { fill: '#0ea5e9' } },
      head:     { name: 'Frost Crown', icon: '❄️', avatarSlot: 'head', avatarEmoji: '❄️', avatarStyle: { fill: '#38bdf8' } },
      feet:     { name: 'Permafrost Boots', icon: '🥾', avatarSlot: 'feet', avatarStyle: { fill: '#0c4a6e' } },
      neck:     { name: 'Frozen Pendant', icon: '💠', avatarSlot: 'neck', avatarEmoji: '💠', avatarStyle: { fill: '#7dd3fc' } },
    }},
  { id: 'costume_void_walker', name: 'Void Walker Set', icon: '🌑', desc: 'Step between dimensions — void cloak, shadow helm, rift boots.', price: 4500, category: 'costume', rarity: 'legendary', enabled: true,
    costumeSlots: {
      chest:    { name: 'Void Cloak', icon: '🌑', avatarSlot: 'chest', avatarEmoji: '🌑', avatarStyle: { fill: '#0f0520' } },
      head:     { name: 'Rift Mask', icon: '🎭', avatarSlot: 'head', avatarEmoji: '🎭', avatarStyle: { fill: '#2e1065' } },
      feet:     { name: 'Rift Boots', icon: '👢', avatarSlot: 'feet', avatarStyle: { fill: '#1e0540' } },
      backbling: { name: 'Dimension Tear', icon: '🌀', avatarSlot: 'backbling', avatarEmoji: '🌀', avatarStyle: { fill: '#6d28d9' } },
    }},
];

// ─── TOPS / CHEST ───
const TOPS = [
  { id: 'free_tshirt', name: 'Basic T-Shirt', icon: '👕', desc: 'A simple, comfortable tee.', price: 0, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#5b7fa5' }, enabled: true },
  { id: 'tank_top_white', name: 'White Tank Top', icon: '🩳', desc: 'Breezy and lightweight.', price: 0, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#f0f0f0' }, enabled: true },
  { id: 'polo_navy', name: 'Navy Polo', icon: '👕', desc: 'Smart casual energy.', price: 50, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#1e3a5f' }, enabled: true },
  { id: 'hoodie_gray', name: 'Gray Hoodie', icon: '🧥', desc: 'Cozy inner warmth.', price: 75, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#6b7280' }, enabled: true },
  { id: 'kimono_white', name: 'White Kimono', icon: '👘', desc: 'Traditional Reiki attire.', price: 150, category: 'clothing', avatarSlot: 'chest', avatarEmoji: '👘', avatarStyle: { fill: '#fafafa' }, enabled: true },
  { id: 'vest_leather', name: 'Leather Vest', icon: '🦺', desc: 'Rugged earth energy.', price: 200, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#78350f' }, enabled: true },
  { id: 'tunic_linen', name: 'Linen Tunic', icon: '👕', desc: 'Natural fiber, natural flow.', price: 120, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#d4c5a9' }, enabled: true },
  { id: 'crop_top_pink', name: 'Pink Crop Top', icon: '👙', desc: 'Heart chakra color.', price: 80, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#ec4899' }, enabled: true },
  { id: 'amethyst_robe', name: 'Amethyst Robe', icon: '🧙', desc: 'A robe woven from violet light.', price: 500, category: 'clothing', avatarSlot: 'chest', rarity: 'rare', enabled: true },
  { id: 'sage_cloak', name: 'Sage Forest Cloak', icon: '🧥', desc: 'Infused with pine and peace.', price: 750, category: 'clothing', avatarSlot: 'chest', rarity: 'rare', enabled: true },
  { id: 'healer_robe_gold', name: 'Golden Healer Regalia', icon: '✨', desc: 'Highest frequency garment.', price: 1500, category: 'clothing', avatarSlot: 'chest', rarity: 'epic', enabled: true },
  { id: 'turtleneck_black', name: 'Black Turtleneck', icon: '🖤', desc: 'Sleek root chakra energy.', price: 100, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#1a1a1a' }, enabled: true },
  { id: 'hawaiian_shirt', name: 'Tropical Spirit Shirt', icon: '🌺', desc: 'Island healing vibes.', price: 90, category: 'clothing', avatarSlot: 'chest', avatarStyle: { fill: '#0ea5e9' }, enabled: true },
  { id: 'official_tee_rs', name: 'Ricky & Sage Official Tee', icon: '👕', desc: 'Premium branded apparel.', price: 50, category: 'clothing', avatarSlot: 'chest', enabled: true },
];

// ─── BOTTOMS / LEGS ───
const BOTTOMS = [
  { id: 'free_jeans', name: 'Basic Jeans', icon: '👖', desc: 'Simple blue jeans.', price: 0, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#3b5a85' }, enabled: true },
  { id: 'joggers_gray', name: 'Gray Joggers', icon: '👖', desc: 'Comfort for meditation.', price: 50, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#6b7280' }, enabled: true },
  { id: 'cargo_olive', name: 'Olive Cargo Pants', icon: '👖', desc: 'Grounded earth style.', price: 80, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#4d7c0f' }, enabled: true },
  { id: 'hakama_white', name: 'White Hakama', icon: '👖', desc: 'Traditional flowing pants.', price: 180, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#f8fafc' }, rarity: 'rare', enabled: true },
  { id: 'skirt_flowy', name: 'Flowy Skirt', icon: '👗', desc: 'Free-flowing feminine energy.', price: 100, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#c084fc' }, enabled: true },
  { id: 'shorts_denim', name: 'Denim Shorts', icon: '🩳', desc: 'Casual summer energy.', price: 40, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#60a5fa' }, enabled: true },
  { id: 'leggings_black', name: 'Black Leggings', icon: '👖', desc: 'Flexible and grounded.', price: 60, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#171717' }, enabled: true },
  { id: 'sarong_teal', name: 'Teal Sarong', icon: '🧣', desc: 'Throat chakra wrap.', price: 120, category: 'clothing', avatarSlot: 'legs', avatarStyle: { fill: '#0d9488' }, enabled: true },
];

// ─── FOOTWEAR ───
const SHOES = [
  { id: 'free_sandals', name: 'Handmade Sandals', icon: '👡', desc: 'Lightweight and natural.', price: 0, category: 'clothing', avatarSlot: 'feet', avatarStyle: { fill: '#8b5a2b' }, enabled: true },
  { id: 'astral_sandals', name: 'Astral Sandals', icon: '👡', desc: 'Walk on stardust.', price: 200, category: 'clothing', avatarSlot: 'feet', enabled: true },
  { id: 'divine_boots', name: 'Divine Boots', icon: '👢', desc: 'Grounded in holiness.', price: 450, category: 'clothing', avatarSlot: 'feet', rarity: 'rare', enabled: true },
  { id: 'barefoot_anklet', name: 'Barefoot + Anklet', icon: '🦶', desc: 'Grounding with the Earth.', price: 0, category: 'clothing', avatarSlot: 'feet', avatarEmoji: '🦶', enabled: true },
  { id: 'sneakers_white', name: 'White Sneakers', icon: '👟', desc: 'Clean energy.', price: 60, category: 'clothing', avatarSlot: 'feet', avatarStyle: { fill: '#ffffff' }, enabled: true },
  { id: 'moccasins', name: 'Earth Moccasins', icon: '🥿', desc: 'Handcrafted soft leather.', price: 150, category: 'clothing', avatarSlot: 'feet', avatarStyle: { fill: '#92400e' }, enabled: true },
  { id: 'combat_boots', name: 'Crystal Combat Boots', icon: '🥾', desc: 'Strong foundation energy.', price: 300, category: 'clothing', avatarSlot: 'feet', rarity: 'rare', avatarStyle: { fill: '#1c1917' }, enabled: true },
];

// ─── HEADGEAR ───
const HEADGEAR = [
  { id: 'sacred_diadem', name: 'Sacred Diadem', icon: '👑', desc: 'A crown of light.', price: 400, category: 'clothing', avatarSlot: 'head', rarity: 'rare', enabled: true },
  { id: 'ethereal_circlet', name: 'Ethereal Circlet', icon: '💍', desc: 'Focuses mental clarity.', price: 350, category: 'clothing', avatarSlot: 'head', rarity: 'rare', enabled: true },
  { id: 'beanie_warm', name: 'Warm Beanie', icon: '🧢', desc: 'Cozy crown energy.', price: 30, category: 'clothing', avatarSlot: 'head', avatarStyle: { fill: '#6b7280' }, enabled: true },
  { id: 'headband_sweat', name: 'Sweatband', icon: '🎽', desc: 'Focus during practice.', price: 20, category: 'clothing', avatarSlot: 'head', avatarStyle: { fill: '#ef4444' }, enabled: true },
  { id: 'turban_silk', name: 'Silk Turban', icon: '🧕', desc: 'Crown chakra covering.', price: 250, category: 'clothing', avatarSlot: 'head', avatarStyle: { fill: '#7c3aed' }, rarity: 'rare', enabled: true },
  { id: 'flower_crown', name: 'Flower Crown', icon: '🌸', desc: 'Natural beauty.', price: 100, category: 'clothing', avatarSlot: 'head', avatarEmoji: '🌸', enabled: true },
  { id: 'straw_hat', name: 'Straw Hat', icon: '👒', desc: 'Sun protection energy.', price: 50, category: 'clothing', avatarSlot: 'head', avatarEmoji: '👒', enabled: true },
  { id: 'third_eye_band', name: 'Third Eye Band', icon: '🔮', desc: 'Activates the Ajna.', price: 500, category: 'clothing', avatarSlot: 'head', rarity: 'epic', avatarEmoji: '🔮', avatarStyle: { fill: '#4c1d95' }, enabled: true },
];

// ─── HAIRSTYLES ───
const HAIRSTYLES = [
  { id: 'hair_flowing_light', name: 'Flowing Light', icon: '💇', desc: 'Energy-infused hair.', price: 600, category: 'hair', avatarSlot: 'hair', rarity: 'rare', enabled: true },
  { id: 'hair_braids_wisdom', name: 'Braids of Wisdom', icon: '👱', desc: 'Ancient style.', price: 400, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_pixie', name: 'Pixie Cut', icon: '💇‍♀️', desc: 'Short and spirited.', price: 150, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_long_waves', name: 'Long Waves', icon: '🌊', desc: 'Flowing like water.', price: 200, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_afro', name: 'Natural Afro', icon: '💇', desc: 'Crown of glory.', price: 250, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_mohawk_fire', name: 'Fire Mohawk', icon: '🔥', desc: 'Blazing energy crest.', price: 500, category: 'hair', avatarSlot: 'hair', rarity: 'rare', enabled: true },
  { id: 'hair_bald_glow', name: 'Bald + Glow', icon: '✨', desc: 'Pure crown chakra.', price: 100, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_dreads', name: 'Dreadlocks', icon: '🧑‍🎤', desc: 'Spiritual locks.', price: 300, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_twin_tails', name: 'Twin Tails', icon: '👧', desc: 'Playful duality.', price: 180, category: 'hair', avatarSlot: 'hair', enabled: true },
  { id: 'hair_slick_back', name: 'Slicked Back', icon: '💇‍♂️', desc: 'Sharp discipline.', price: 120, category: 'hair', avatarSlot: 'hair', enabled: true },
];

// ─── JEWELRY & ARTIFACTS ───
const JEWELRY = [
  { id: 'free_amulet', name: 'Quartz Amulet', icon: '💎', desc: 'A protective charm.', price: 0, category: 'jewelry', avatarSlot: 'neck', enabled: true },
  { id: 'crystal_staff', name: 'Resonance Staff', icon: '🪄', desc: 'Focuses healing energy.', price: 1200, category: 'jewelry', avatarSlot: 'hand_right', rarity: 'epic', enabled: true },
  { id: 'sacred_orb', name: 'Amethyst Core Orb', icon: '🔮', desc: 'Pure resonance orb.', price: 1000, category: 'jewelry', avatarSlot: 'accessory', rarity: 'rare', enabled: true },
  { id: 'necklace_moon', name: 'Moon Pendant', icon: '🌙', desc: 'Lunar energy charge.', price: 180, category: 'jewelry', avatarSlot: 'neck', avatarEmoji: '🌙', enabled: true },
  { id: 'bracelet_mala', name: 'Mala Bracelet', icon: '📿', desc: '108 beads of intention.', price: 100, category: 'jewelry', avatarSlot: 'accessory', avatarEmoji: '📿', enabled: true },
  { id: 'ring_opal', name: 'Opal Ring', icon: '💍', desc: 'Shifts with your mood.', price: 250, category: 'jewelry', avatarSlot: 'accessory', avatarEmoji: '💍', enabled: true },
  { id: 'ring_sigil', name: 'Sigil Ring', icon: '💍', desc: 'Ancient protection glyph.', price: 600, category: 'jewelry', avatarSlot: 'accessory', rarity: 'rare', avatarEmoji: '💍', avatarStyle: { fill: '#78350f' }, enabled: true },
  { id: 'ankh_pendant', name: 'Ankh of Life', icon: '☥', desc: 'Egyptian eternal life.', price: 800, category: 'jewelry', avatarSlot: 'neck', rarity: 'epic', avatarEmoji: '☥', enabled: true },
  { id: 'dreamcatcher', name: 'Dreamcatcher Charm', icon: '🕸️', desc: 'Filters negative energy.', price: 300, category: 'jewelry', avatarSlot: 'accessory', avatarEmoji: '🕸️', enabled: true },
  { id: 'singing_bowl', name: 'Singing Bowl', icon: '🥣', desc: 'Hand-held sound healing.', price: 400, category: 'jewelry', avatarSlot: 'hand_right', avatarEmoji: '🥣', enabled: true },
  { id: 'wand_selenite', name: 'Selenite Wand', icon: '🪄', desc: 'Cleansing light rod.', price: 550, category: 'jewelry', avatarSlot: 'hand_right', rarity: 'rare', avatarEmoji: '🪄', enabled: true },
];

// ─── BACKGROUNDS ───
const BACKGROUNDS = [
  { id: 'free_bg_temple', name: 'Ether Temple', icon: '🏛️', desc: 'Peaceful meditation space.', price: 0, category: 'background', avatarSlot: 'background', avatarStyle: { background: 'linear-gradient(180deg, #1a1a2e 0%, #0a0a0f 100%)' }, enabled: true },
  { id: 'bg_crystal_cave', name: 'Crystal Sanctuary', icon: '💎', desc: 'Deep within a glowing cavern.', price: 300, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_ethereal_forest', name: 'Ethereal Forest', icon: '🌲', desc: 'A path through spirit woods.', price: 300, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_starry_night', name: 'Starry Night', icon: '🌌', desc: 'A vast cosmic night sky.', price: 200, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_sacred_temple', name: 'Sacred Temple', icon: '🏛️', desc: 'An ancient spiritual temple.', price: 250, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'zen_garden_rs', name: 'Zen Garden Sanctuary', icon: '🎋', desc: 'Official R&S background.', price: 100, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_cherry_blossom', name: 'Cherry Blossom Path', icon: '🌸', desc: 'Gentle petals falling.', price: 250, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_underwater_reef', name: 'Underwater Reef', icon: '🐠', desc: 'Oceanic tranquility.', price: 350, category: 'background', avatarSlot: 'background', rarity: 'rare', enabled: true },
  { id: 'bg_volcano_core', name: 'Volcano Core', icon: '🌋', desc: 'Primal fire energy.', price: 400, category: 'background', avatarSlot: 'background', rarity: 'rare', enabled: true },
  { id: 'bg_aurora_borealis', name: 'Aurora Borealis', icon: '🌈', desc: 'Northern lights dancing.', price: 500, category: 'background', avatarSlot: 'background', rarity: 'epic', enabled: true },
  { id: 'bg_midnight_desert', name: 'Midnight Desert', icon: '🏜️', desc: 'Starlit sand dunes.', price: 200, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_floating_islands', name: 'Floating Islands', icon: '🏝️', desc: 'Gravity-defying paradise.', price: 600, category: 'background', avatarSlot: 'background', rarity: 'epic', enabled: true },
  { id: 'bg_bamboo_dojo', name: 'Bamboo Dojo', icon: '🎍', desc: 'Training in tranquility.', price: 180, category: 'background', avatarSlot: 'background', enabled: true },
  { id: 'bg_cloud_kingdom', name: 'Cloud Kingdom', icon: '☁️', desc: 'Above the earthly plane.', price: 450, category: 'background', avatarSlot: 'background', rarity: 'rare', enabled: true },
];

// ─── ACTIONS & EXPRESSIONS ───
const ACTIONS_EXPRESSIONS = [
  { id: 'act_praying', name: 'Sacred Prayer', icon: '🙏', desc: 'A peaceful praying pose.', price: 150, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'act_channeling', name: 'Aura Channeling', icon: '⚡', desc: 'Channeling pure light.', price: 200, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'act_meditation', name: 'Deep Meditation', icon: '🧘', desc: 'Lotus position mastery.', price: 150, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'act_tai_chi', name: 'Tai Chi Flow', icon: '🥋', desc: 'Moving meditation.', price: 180, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'act_levitate', name: 'Levitation', icon: '🕴️', desc: 'Defy gravity itself.', price: 500, category: 'action', avatarSlot: 'action', rarity: 'epic', enabled: true },
  { id: 'act_dance', name: 'Sacred Dance', icon: '💃', desc: 'Movement as prayer.', price: 120, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'act_warrior', name: 'Warrior Stance', icon: '⚔️', desc: 'Standing firm in power.', price: 200, category: 'action', avatarSlot: 'action', enabled: true },
  { id: 'exp_compassion', name: 'Compassion', icon: '💖', desc: 'Heart-centered love.', price: 100, category: 'expression', avatarSlot: 'expression', enabled: true },
  { id: 'exp_joyful', name: 'Pure Joy', icon: '😊', desc: 'Radiant joyful energy.', price: 100, category: 'expression', avatarSlot: 'expression', enabled: true },
  { id: 'exp_serene', name: 'Serene Peace', icon: '😌', desc: 'Total inner stillness.', price: 80, category: 'expression', avatarSlot: 'expression', enabled: true },
  { id: 'exp_fierce', name: 'Fierce Determination', icon: '😤', desc: 'Unshakeable will.', price: 120, category: 'expression', avatarSlot: 'expression', enabled: true },
  { id: 'exp_mysterious', name: 'Mysterious Aura', icon: '🌑', desc: 'Enigmatic presence.', price: 150, category: 'expression', avatarSlot: 'expression', rarity: 'rare', enabled: true },
];

// ─── ABILITIES & EFFECTS ───
const ABILITIES = [
  { id: 'abi_chrono_vision', name: 'Chrono-Vision', icon: '👁️', desc: 'See through time.', price: 2000, category: 'ability', avatarSlot: 'ability', rarity: 'epic', enabled: true },
  { id: 'abi_aura_blast', name: 'Aura Blast', icon: '💥', desc: 'Release pure energy.', price: 1500, category: 'ability', avatarSlot: 'ability', rarity: 'epic', enabled: true },
  { id: 'abi_healing_wave', name: 'Healing Wave', icon: '🌊', desc: 'Send a ripple of recovery.', price: 800, category: 'ability', avatarSlot: 'ability', rarity: 'rare', enabled: true },
  { id: 'abi_shield_light', name: 'Light Shield', icon: '🛡️', desc: 'Protective barrier.', price: 700, category: 'ability', avatarSlot: 'ability', rarity: 'rare', enabled: true },
  { id: 'abi_teleport', name: 'Astral Teleport', icon: '🌀', desc: 'Shift between planes.', price: 2500, category: 'ability', avatarSlot: 'ability', rarity: 'legendary', enabled: true },
  { id: 'abi_nature_call', name: 'Nature\'s Call', icon: '🌱', desc: 'Summon earth spirits.', price: 1000, category: 'ability', avatarSlot: 'ability', rarity: 'rare', enabled: true },
  { id: 'abi_thunder', name: 'Storm Calling', icon: '⛈️', desc: 'Summon the elements.', price: 1800, category: 'ability', avatarSlot: 'ability', rarity: 'epic', enabled: true },
];

// ─── BACK BLING ───
const BACKBLING = [
  { id: 'bb_small_wings', name: 'Fairy Wings', icon: '🧚', desc: 'Delicate shimmering wings.', price: 300, category: 'clothing', avatarSlot: 'backbling', avatarEmoji: '🧚', enabled: true },
  { id: 'bb_cape_red', name: 'Hero Cape', icon: '🦸', desc: 'Flowing crimson cape.', price: 250, category: 'clothing', avatarSlot: 'backbling', avatarStyle: { fill: '#dc2626' }, enabled: true },
  { id: 'bb_quiver', name: 'Crystal Quiver', icon: '🏹', desc: 'Arrows of light.', price: 400, category: 'clothing', avatarSlot: 'backbling', rarity: 'rare', avatarEmoji: '🏹', enabled: true },
  { id: 'bb_angel_wings', name: 'Angel Wings', icon: '😇', desc: 'Sacred white wings.', price: 1000, category: 'clothing', avatarSlot: 'backbling', rarity: 'epic', avatarEmoji: '😇', enabled: true },
  { id: 'bb_demon_wings', name: 'Shadow Wings', icon: '🦇', desc: 'Dark yet balanced.', price: 800, category: 'clothing', avatarSlot: 'backbling', rarity: 'rare', avatarEmoji: '🦇', enabled: true },
  { id: 'bb_backpack_travel', name: 'Traveling Pack', icon: '🎒', desc: 'Journey essentials.', price: 100, category: 'clothing', avatarSlot: 'backbling', avatarEmoji: '🎒', enabled: true },
];

// ─── PET ACCESSORIES ───
const PET_ITEMS = [
  { id: 'pet_collar_gold', name: 'Golden Collar', icon: '🥇', desc: 'For your companion.', price: 200, category: 'pet', petSlot: 'collar', petEmoji: '🥇', enabled: true },
  { id: 'pet_bandana', name: 'Spirit Bandana', icon: '🧣', desc: 'Cute and mystical.', price: 100, category: 'pet', petSlot: 'bandana', petEmoji: '🧣', enabled: true },
  { id: 'pet_crown', name: 'Pet Crown', icon: '👑', desc: 'Royal companion.', price: 350, category: 'pet', petSlot: 'hat', petEmoji: '👑', rarity: 'rare', enabled: true },
  { id: 'pet_wings_tiny', name: 'Tiny Wings', icon: '🪶', desc: 'Feathered flutter.', price: 250, category: 'pet', petSlot: 'backbling', petEmoji: '🪶', enabled: true },
  { id: 'pet_sweater', name: 'Cozy Pet Sweater', icon: '🧶', desc: 'Warm and snug.', price: 80, category: 'pet', petSlot: 'outfit', petEmoji: '🧶', enabled: true },
];

// ─── REIKI & SAGE COLLECTION (6-Tier) ───
const REIKI_SAGE = [
  { id: 'rs_sage_amulet', name: '🌿 Sage Amulet', icon: '🔮', desc: 'Tier 1 — Crystal amulet with sage energy.', price: 0, category: 'reiki_sage', avatarSlot: 'neck', src: '/assets/rs_tier1_sage_amulet.png', rarity: 'common', tier: 1, tierName: 'Good', tierColor: '#6ee7b7', collection: 'reiki_sage', enabled: true },
  { id: 'rs_sage_shield', name: '🛡️ Sage Shield', icon: '🛡️', desc: 'Tier 2 — Woven sage shield.', price: 250, category: 'reiki_sage', avatarSlot: 'accessory', src: '/assets/rs_tier2_sage_shield.png', rarity: 'common', tier: 2, tierName: 'Above Average', tierColor: '#60a5fa', collection: 'reiki_sage', enabled: true },
  { id: 'rs_healing_crown', name: '👑 Healing Crown', icon: '👑', desc: 'Tier 3 — Ornate amethyst crown.', price: 750, category: 'reiki_sage', avatarSlot: 'head', src: '/assets/rs_tier3_healing_crown.png', rarity: 'rare', tier: 3, tierName: 'Great', tierColor: '#a78bfa', collection: 'reiki_sage', enabled: true },
  { id: 'rs_sacred_garden_bg', name: '🌸 Sacred Garden', icon: '🌸', desc: 'Tier 3 — Mystical garden sanctuary.', price: 500, category: 'reiki_sage', avatarSlot: 'background', src: '/assets/rs_bg_sacred_garden.png', rarity: 'rare', tier: 3, tierName: 'Great', tierColor: '#a78bfa', collection: 'reiki_sage', avatarStyle: { background: 'linear-gradient(180deg, #1a2a1e 0%, #0a150a 100%)' }, enabled: true },
  { id: 'rs_chakra_wings', name: '🦋 Chakra Wings', icon: '🦋', desc: 'Tier 4 — Rainbow chakra wings.', price: 1500, category: 'reiki_sage', avatarSlot: 'backbling', src: '/assets/rs_tier4_chakra_wings.png', rarity: 'epic', tier: 4, tierName: 'Excellent', tierColor: '#f472b6', collection: 'reiki_sage', enabled: true },
  { id: 'rs_cosmic_mantle', name: '🌌 Cosmic Mantle', icon: '🌌', desc: 'Tier 5 — Cosmic nebula cloak.', price: 3000, category: 'reiki_sage', avatarSlot: 'chest', src: '/assets/rs_tier5_cosmic_mantle.png', rarity: 'legendary', tier: 5, tierName: 'Superior', tierColor: '#fb923c', collection: 'reiki_sage', enabled: true },
  { id: 'rs_crystal_cave_bg', name: '💎 Crystal Cave', icon: '💎', desc: 'Tier 5 — Crystal healing grotto.', price: 2000, category: 'reiki_sage', avatarSlot: 'background', src: '/assets/rs_bg_crystal_cave.png', rarity: 'legendary', tier: 5, tierName: 'Superior', tierColor: '#fb923c', collection: 'reiki_sage', avatarStyle: { background: 'linear-gradient(180deg, #120a2e 0%, #050208 100%)' }, enabled: true },
  { id: 'rs_divine_halo', name: '✨ Divine Halo', icon: '✨', desc: 'Tier 6 — OUTSTANDING — Celestial healing halo.', price: 5000, category: 'reiki_sage', avatarSlot: 'headgear', src: '/assets/rs_tier6_outstanding_halo.png', rarity: 'legendary', tier: 6, tierName: 'Outstanding', tierColor: '#fbbf24', collection: 'reiki_sage', enabled: true },
];

// ─── Assemble full catalog ───
export const MASTER_CATALOG = [
  ...COSTUMES,
  ...TOPS,
  ...BOTTOMS,
  ...SHOES,
  ...HEADGEAR,
  ...HAIRSTYLES,
  ...JEWELRY,
  ...BACKGROUNDS,
  ...ACTIONS_EXPRESSIONS,
  ...ABILITIES,
  ...BACKBLING,
  ...PET_ITEMS,
  ...REIKI_SAGE,
];

// Total: 8 costumes + 14 tops + 8 bottoms + 7 shoes + 8 headgear + 10 hair + 11 jewelry + 14 backgrounds + 12 actions/expressions + 7 abilities + 6 backbling + 5 pet items + 8 R&S = 118 items

export default MASTER_CATALOG;
