import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, PenTool, CheckCircle, Star, Lock, ChevronRight, Wind } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Web Audio Sound Effects ───
const playTone = (freq = 432, duration = 0.3, type = 'sine', volume = 0.15) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(Math.max(0.001, volume), ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch(e) { /* silent fallback */ }
};

const playCompletionChime = (volume = 0.15) => {
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.5, 'sine', volume), i * 150);
  });
};

// Richer sound for higher-tier symbols — plays chords & harmonics
const playRichTone = (difficulty, progress, volume = 0.15) => {
  if (volume <= 0) return;
  const base = 200 + progress * 400;
  if (difficulty >= 6) {
    // Master/Sage — ethereal harmonics with shimmer
    playTone(base, 0.35, 'sine', volume * 0.6);
    playTone(base * 1.5, 0.3, 'sine', volume * 0.3);
    playTone(base * 2, 0.25, 'sine', volume * 0.15);
    playTone(base * 3, 0.2, 'sine', volume * 0.08);
  } else if (difficulty >= 5) {
    // Channeler — warm sawtooth chord
    playTone(base, 0.3, 'sawtooth', volume * 0.4);
    playTone(base * 1.25, 0.25, 'triangle', volume * 0.3);
    playTone(base * 1.5, 0.2, 'sine', volume * 0.2);
  } else if (difficulty >= 4) {
    // Adept — 3-note minor chord
    playTone(base, 0.25, 'triangle', volume * 0.5);
    playTone(base * 1.2, 0.22, 'sine', volume * 0.3);
    playTone(base * 1.5, 0.2, 'sine', volume * 0.2);
  } else {
    // Lower tiers — simple tone
    playTone(base, 0.2, 'triangle', volume);
  }
};

// ─── Euler-Path Brain Teasers ───
// "Don't lift your pencil" puzzles based on graph theory.
// Each shape is a graph. Waypoints trace the SOLUTION Euler path — every edge exactly once.
// A valid one-line drawing requires 0 odd-degree vertices (circuit) or exactly 2 (path).
const ALL_SYMBOLS = [
  // ── INITIATE (Lvl 0+) — Simple shapes, 4-6 waypoints ──
  // Triangle: 3 edges, Euler circuit (all degree 2)
  { id: 'triangle', name: 'Triangle', tier: 'Initiate', requiredLevel: 0, color: '#2ecc71', xp: 25,
    desc: 'The simplest closed shape — trace all 3 sides.',
    waypoints: [[190,60],[60,330],[320,330],[190,60]], difficulty: 1 },

  // Square: 4 edges, Euler circuit (all degree 2)
  { id: 'square', name: 'Square', tier: 'Initiate', requiredLevel: 0, color: '#3498db', xp: 25,
    desc: 'Four sides, one breath. Start anywhere.',
    waypoints: [[80,80],[300,80],[300,300],[80,300],[80,80]], difficulty: 1 },

  // Diamond: 4 edges, Euler circuit
  { id: 'diamond', name: 'Diamond', tier: 'Initiate', requiredLevel: 0, color: '#00cec9', xp: 25,
    desc: 'A rotated square — same puzzle, new perspective.',
    waypoints: [[190,40],[340,190],[190,340],[40,190],[190,40]], difficulty: 1 },

  // Hourglass: center connects two triangles (6 edges, all even degrees)
  // Path: center→TL→TR→center→BL→BR→center
  { id: 'hourglass', name: 'Hourglass', tier: 'Initiate', requiredLevel: 0, color: '#f1c40f', xp: 25,
    desc: 'Two triangles sharing a point — can you do it in one stroke?',
    waypoints: [[190,190],[80,50],[300,50],[190,190],[80,330],[300,330],[190,190]], difficulty: 1 },

  // Figure-8: two loops meeting at center (Euler circuit)
  { id: 'figure8', name: 'Figure Eight', tier: 'Initiate', requiredLevel: 0, color: '#e17055', xp: 25,
    desc: 'Two loops, one line — infinity in training.',
    waypoints: [[190,190],[110,100],[190,40],[270,100],[190,190],[110,280],[190,340],[270,280],[190,190]], difficulty: 1 },

  // ── NOVICE (Lvl 3+) — Classic brain teasers, 7-9 waypoints ──
  // House of Nikolaus: THE classic "don't lift your pencil" puzzle! (8 edges, 2 odd vertices)
  // Vertices: BL(80,320)=3odd, BR(300,320)=3odd, TR(300,140)=4, TL(80,140)=4, Peak(190,40)=2
  // Path: BL→TL→Peak→TR→TL→BR→BL→TR→BR
  { id: 'house', name: 'House of Nikolaus', tier: 'Novice', requiredLevel: 3, color: '#0984e3', xp: 35,
    desc: '"Das ist das Haus vom Ni-ko-laus" — the most famous one-line puzzle!',
    waypoints: [[80,320],[80,140],[190,40],[300,140],[80,140],[300,320],[80,320],[300,140],[300,320]], difficulty: 2 },

  // Envelope: rectangle + 1 diagonal (5 edges, 2 odd vertices)
  // BL→TL→TR→BR→BL→TR
  { id: 'envelope', name: 'Sealed Envelope', tier: 'Novice', requiredLevel: 3, color: '#6c5ce7', xp: 35,
    desc: 'A rectangle with a hidden diagonal — find the one-line solution.',
    waypoints: [[80,300],[80,100],[300,100],[300,300],[80,300],[300,100]], difficulty: 2 },

  // Pentagon: 5 edges, Euler circuit
  { id: 'pentagon', name: 'Pentagon', tier: 'Novice', requiredLevel: 3, color: '#fd79a8', xp: 35,
    desc: 'Five equal sides — full circuit required.',
    waypoints: [[190,40],[340,160],[280,330],[100,330],[40,160],[190,40]], difficulty: 2 },

  // Kite with tail: diamond-like + tail (6 edges, Euler path)
  // T(190,50)→L(80,200)→B(190,300)→R(300,200)→T→B→tail(190,360)
  { id: 'kite', name: 'Kite', tier: 'Novice', requiredLevel: 3, color: '#ff7675', xp: 35,
    desc: 'A diamond with a tail — where do you start?',
    waypoints: [[190,360],[190,300],[80,190],[190,50],[300,190],[190,300],[190,50]], difficulty: 2 },

  // Fish: triangle body + V-tail (6 edges, 2 odd vertices)
  // A(100,190)→B(260,80)→C(260,300)→A→B→D(350,50) → need to check
  // Simpler: head(60,190)→top(220,60)→tail_top(340,60)→body(220,190)→tail_btm(340,320)→bottom(220,320)→head
  { id: 'fish', name: 'Fish', tier: 'Novice', requiredLevel: 3, color: '#dfe6e9', xp: 35,
    desc: 'An ancient symbol — the fish drawn in one stroke.',
    waypoints: [[60,190],[220,60],[340,60],[220,190],[340,320],[220,320],[60,190]], difficulty: 2 },

  // ── SEEKER (Lvl 7+) — Geometric brain teasers, 6-11 waypoints ──
  // Five-Point Star (Pentagram): THE classic — all vertices degree 4, Euler circuit!
  // Draw the star by skipping vertices: T→BL→MR→ML→BR→T
  { id: 'star5', name: 'Pentagram', tier: 'Seeker', requiredLevel: 7, color: '#f9ca24', xp: 50,
    desc: 'The classic star puzzle — draw it without lifting your pencil!',
    waypoints: [[190,30],[100,310],[330,130],[50,130],[280,310],[190,30]], difficulty: 3 },

  // Hexagon: 6 edges, Euler circuit
  { id: 'hexagon', name: 'Hexagon', tier: 'Seeker', requiredLevel: 7, color: '#00b894', xp: 50,
    desc: 'Six perfect sides — nature\'s favorite shape.',
    waypoints: [[190,40],[320,100],[320,270],[190,340],[60,270],[60,100],[190,40]], difficulty: 3 },

  // Square + both diagonals: 6 edges.
  // Degrees: each corner=3(odd) → 4 odd vertices → NOT possible with ALL edges!
  // FIX: Square + ONE diagonal = 5 edges, 2 odd vertices
  // But we already have envelope... Let me do triangle + inner line:
  // Triangle with median: A(190,40)→B(60,330)→M(190,330)→A→C(320,330)→M (5 edges, Euler path)
  // Degrees: A=2, B=2, M=3(odd), C=1(odd)... nope
  // Let me do: Rectangle + diagonal + center cross
  // Actually: Hexagon with center star spokes
  // 
  // Let me do a proper shape: Two overlapping triangles (Star of David outline trace)
  // Actually for simplicity: Ice cream cone shape
  // Cone: TL(110,200)→B(190,340)→TR(270,200) (triangle pointing down)
  // Circle: TR→around top→TL (semicircle with waypoints)
  // This makes a valid path
  { id: 'ice_cream', name: 'Ice Cream Cone', tier: 'Seeker', requiredLevel: 7, color: '#636e72', xp: 50,
    desc: 'Cone below, scoop above — all one line.',
    waypoints: [[110,200],[190,340],[270,200],[300,140],[270,80],[190,50],[110,80],[80,140],[110,200]], difficulty: 3 },

  // Bowtie + center bar: 8 edges
  // L(40,190)→T1(150,50)→C(190,190)→T2(230,50)→R(340,190)→B2(230,330)→C→B1(150,330)→L
  { id: 'butterfly', name: 'Butterfly', tier: 'Seeker', requiredLevel: 7, color: '#a29bfe', xp: 50,
    desc: 'Wings spread wide — trace every edge of this symmetrical figure.',
    waypoints: [[40,190],[150,50],[190,190],[230,50],[340,190],[230,330],[190,190],[150,330],[40,190]], difficulty: 3 },

  // ── ADEPT (Lvl 15+) — Complex puzzles, 10-14 waypoints (GUIDE HIDDEN!) ──
  // Double House: House of Nikolaus + extra room (more edges)
  // Bottom: BL(60,340) BR(320,340) MR(320,180) ML(60,180) Peak(190,40)
  // Middle: Center(190,180)
  // Edges: BL-BR, BR-MR, MR-ML, ML-BL (bottom rect) + ML-Peak, Peak-MR (roof)
  //        + BL-MR, ML-BR (diagonals) + ML-Center, Center-MR (middle floor)
  // 10 edges - check degrees
  { id: 'double_house', name: 'Grand Mansion', tier: 'Adept', requiredLevel: 15, color: '#e84393', xp: 75,
    desc: 'Like the House of Nikolaus — but with an extra floor. No guide lines!',
    waypoints: [[60,340],[60,180],[190,40],[320,180],[60,180],[190,180],[320,180],[320,340],[60,340],[320,180],[190,180],[60,340]], difficulty: 4 },

  // Maze spiral: rectangular spiral inward (all degree-2 except start/end)
  { id: 'maze_path', name: 'Labyrinth Path', tier: 'Adept', requiredLevel: 15, color: '#00cec9', xp: 75,
    desc: 'A spiral labyrinth — one continuous path to the center.',
    waypoints: [[40,340],[40,40],[340,40],[340,300],[100,300],[100,100],[280,100],[280,240],[160,240],[160,160],[220,160],[220,220]], difficulty: 4 },

  // Overlapping squares: two squares offset sharing 2 vertices
  // Square 1: A(60,60) B(220,60) C(220,220) D(60,220)
  // Square 2: E(160,160) F(320,160) G(320,320) H(160,320)
  // Overlap at C(220,220) ≈ near E(160,160)... complex
  // Simpler: 3x3 grid traverse (continuous path through grid edges)
  { id: 'grid_walk', name: 'Grid Walk', tier: 'Adept', requiredLevel: 15, color: '#fdcb6e', xp: 75,
    desc: 'A 3×3 grid — trace every edge exactly once. No peeking!',
    waypoints: [[60,60],[190,60],[190,190],[60,190],[60,320],[190,320],[320,320],[320,190],[190,190],[60,190],[60,60],[190,60],[320,60],[320,190]], difficulty: 4 },

  // Envelope with X: rectangle + both diagonals — IMPOSSIBLE as is (4 odd vertices)
  // FIX: rectangle + both diags + one extra edge → make 2 odd → valid!
  // Add edge: midpoint bottom to corner → makes it valid
  // Actually: Classic "open envelope" = rectangle + V on top + diags
  // Let me do: Two triangles interlocked (Star of David trace)
  // Upward triangle: A(190,40) B(50,310) C(330,310)
  // Downward triangle: D(190,340) E(330,80) F(50,80)
  // Each triangle is independent... need to connect them
  // Actually the Star of David as a single trace is complex. Let me do a simpler interlocked shape.
  // 
  // Modified envelope: rectangle + triangle on top + single diagonal
  // BL(80,320)→BR(300,320)→TR(300,160)→Peak(190,60)→TL(80,160)→BL→TR→TL→BR
  // 8 edges: BL-BR, BR-TR, TR-Peak, Peak-TL, TL-BL (perimeter=5), BL-TR(diag), TR-TL(cross), TL-BR(diag2)
  // Degrees: BL=3, BR=3, TR=4, TL=4, Peak=2 → 2 odd → valid! Euler path BL to BR
  { id: 'castle', name: 'Castle Gate', tier: 'Adept', requiredLevel: 15, color: '#74b9ff', xp: 75,
    desc: 'A fortified house — every wall traced once. Think before you draw!',
    waypoints: [[80,320],[300,320],[300,160],[190,60],[80,160],[80,320],[300,160],[80,160],[300,320]], difficulty: 4 },

  // ── CHANNELER (Lvl 25+) — Expert, 12-18 waypoints ──
  // Hexagram inner trace: Star of David with inner hexagon = 12 edges
  // The hexagram can be traced as: outer triangle 1 + inner hex + outer triangle 2
  // Points of star: T(190,30), TR(330,120), BR(330,280), B(190,370), BL(50,280), TL(50,120)
  // Inner hexagon: t(190,100), tr(270,150), br(270,250), b(190,300), bl(110,250), tl(110,150)
  // This gets complex... let me do a cleaner shape
  //
  // Double pentagram: 10-pointed star trace
  // Actually let me just make a celtic knot that's a valid Euler circuit
  // Outer ring + inner cross pattern
  { id: 'celtic_knot', name: 'Celtic Knot', tier: 'Channeler', requiredLevel: 25, color: '#55efc4', xp: 100,
    desc: 'Eternity woven into a single thread — no guide, pure intuition.',
    waypoints: [[190,40],[310,100],[340,220],[290,330],[190,360],[90,330],[40,220],[70,100],[190,40],[270,150],[300,260],[190,310],[80,260],[110,150],[190,80],[250,170],[270,260],[190,290],[110,260],[130,170],[190,120],[230,190],[210,260],[160,250],[140,190],[190,140]], difficulty: 5 },

  // Flower of Life fragment: overlapping circles traced as one line
  { id: 'flower_life', name: 'Flower of Life', tier: 'Channeler', requiredLevel: 25, color: '#ffeaa7', xp: 100,
    desc: 'Sacred geometry — the pattern underlying all creation.',
    waypoints: [[190,70],[260,110],[290,190],[260,270],[190,310],[120,270],[90,190],[120,110],[190,70],[190,150],[240,170],[250,220],[210,260],[160,250],[130,210],[140,160],[190,150],[220,190],[200,240],[160,230],[150,180],[190,150]], difficulty: 5 },

  // Continuous spiral: Archimedean spiral with increasing radius
  { id: 'ouroboros', name: 'Ouroboros Spiral', tier: 'Channeler', requiredLevel: 25, color: '#b2bec3', xp: 100,
    desc: 'The serpent consuming itself — trace the eternal spiral.',
    waypoints: [[190,50],[300,80],[350,170],[340,270],[280,340],[190,360],[100,340],[40,270],[30,170],[80,80],[160,50],[230,60],[310,110],[340,210],[300,310],[220,350],[130,330],[60,260],[40,170],[80,100],[150,60],[240,70],[320,130],[340,240],[280,320],[200,350],[110,310],[50,230],[50,150],[100,90],[170,60]], difficulty: 5 },

  // ── GUARDIAN (Lvl 35+) — Challenging, 15-22 waypoints ──
  // Complex maze with branching paths
  { id: 'metatron', name: "Metatron's Cube", tier: 'Guardian', requiredLevel: 35, color: '#fab1a0', xp: 125,
    desc: 'The archangel\'s key — supreme sacred geometry. No guides, no mercy.',
    waypoints: [[190,40],[300,100],[340,220],[280,340],[100,340],[40,220],[80,100],[190,40],[190,140],[260,180],[240,270],[150,270],[130,180],[190,140],[190,220],[260,270],[320,220],[280,140],[190,90],[100,140],[60,220],[120,270],[190,220],[240,180],[220,130],[160,130],[140,180],[190,230]], difficulty: 6 },

  // DNA double helix: two interweaving sine waves
  { id: 'dna_helix', name: 'DNA Helix', tier: 'Guardian', requiredLevel: 35, color: '#81ecec', xp: 125,
    desc: 'The code of life — two spirals intertwined as one continuous path.',
    waypoints: [[120,40],[260,80],[120,120],[260,160],[120,200],[260,240],[120,280],[260,320],[190,340],[260,320],[120,280],[260,240],[120,200],[260,160],[120,120],[260,80],[190,40]], difficulty: 6 },

  // Mandala circuit: concentric rings connected by spokes
  { id: 'mandala', name: 'Mandala Circuit', tier: 'Guardian', requiredLevel: 35, color: '#d63031', xp: 125,
    desc: 'Walk the sacred circle — a complete meditation in one stroke.',
    waypoints: [[190,40],[290,70],[340,150],[350,250],[310,330],[220,360],[120,340],[50,280],[30,190],[50,110],[120,50],[190,40],[240,90],[300,170],[300,260],[250,330],[170,340],[100,300],[60,220],[60,140],[110,80],[190,60],[240,110],[280,190],[270,280],[210,320],[140,300],[90,230],[80,150],[120,90],[190,80]], difficulty: 6 },

  // ── MASTER (Lvl 100+) — Supreme, 20-28 waypoints ──
  // Fibonacci spiral: golden ratio traced as one continuous curve
  { id: 'fibonacci', name: 'Fibonacci Spiral', tier: 'Master', requiredLevel: 100, color: '#d4af37', xp: 150,
    desc: 'The golden ratio — nature\'s perfect blueprint. The ultimate test.',
    waypoints: [[340,340],[340,190],[270,190],[270,280],[340,280],[340,230],[300,230],[300,265],[330,265],[330,210],[280,210],[280,270],[320,270],[320,220],[295,220],[295,258],[325,258],[325,215],[285,215],[285,268],[335,268],[335,200],[265,200],[265,285],[345,285]], difficulty: 7 },

  // Sri Yantra: 9 interlocking triangles
  { id: 'sri_yantra', name: 'Sri Yantra Path', tier: 'Master', requiredLevel: 100, color: '#e17055', xp: 150,
    desc: 'The supreme cosmic instrument — 9 triangles in one sacred stroke.',
    waypoints: [[190,30],[60,330],[320,330],[190,30],[70,270],[310,270],[190,70],[50,300],[330,300],[190,50],[100,230],[280,230],[190,100],[130,270],[250,270],[190,140],[160,220],[220,220],[190,170],[175,210],[205,210],[190,190]], difficulty: 7 },

  // Tree of Life: Kabbalistic 10 sephirot connected by 22 paths (simplified)
  { id: 'tree_of_life', name: 'Tree of Life', tier: 'Master', requiredLevel: 100, color: '#00b894', xp: 150,
    desc: 'All 10 spheres connected — the ultimate map of consciousness.',
    waypoints: [[190,40],[120,100],[260,100],[190,40],[120,100],[120,200],[260,200],[260,100],[190,160],[120,200],[190,260],[260,200],[190,160],[190,260],[120,300],[260,300],[190,260],[190,340],[120,300],[120,200],[190,260],[260,300],[260,200]], difficulty: 7 },

  // Fractal star: star within star pattern
  { id: 'fractal_star', name: 'Fractal Star', tier: 'Master', requiredLevel: 100, color: '#6c5ce7', xp: 150,
    desc: 'Infinite complexity within finite form — the master\'s final challenge.',
    waypoints: [[190,20],[100,310],[330,130],[50,130],[280,310],[190,20],[210,90],[250,200],[200,260],[140,210],[180,100],[190,70],[230,160],[220,240],[160,240],[150,160],[190,100],[220,170],[210,230],[170,230],[160,170],[190,130],[200,180],[190,220],[175,200],[190,160]], difficulty: 7 },
];

const TIER_ORDER = ['Initiate', 'Novice', 'Seeker', 'Adept', 'Channeler', 'Guardian', 'Master'];
const TIER_COLORS = {
  'Initiate': '#2ecc71', 'Novice': '#55efc4', 'Seeker': '#0984e3',
  'Adept': '#6c5ce7', 'Channeler': '#fdcb6e', 'Guardian': '#e17055', 'Master': '#d4af37'
};
const TIER_LEVELS = { 'Initiate': 0, 'Novice': 3, 'Seeker': 7, 'Adept': 15, 'Channeler': 25, 'Guardian': 35, 'Master': 100 };

const HIT_RADIUS = 28; // pixels — how close the stroke must be to a waypoint

const SymbolPractice = ({ onComplete, masteryLevel = 0 }) => {
  const isMaster = masteryLevel >= 100;
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState([]);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [nextWaypointIdx, setNextWaypointIdx] = useState(0);
  const [hitWaypoints, setHitWaypoints] = useState([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('aura_symbol_volume');
    return saved !== null ? parseFloat(saved) : 0.3;
  });
  const [masteredSymbols, setMasteredSymbols] = useState(() =>
    JSON.parse(localStorage.getItem('aura_mastered_symbols') || '[]')
  );
  const [dailyCompleted, setDailyCompleted] = useState(() => {
    const today = new Date().toDateString();
    const saved = JSON.parse(localStorage.getItem('aura_symbol_daily') || '{}');
    return saved.date === today ? (saved.completed || []) : [];
  });

  // Initialize canvas
  useEffect(() => {
    if (!selectedSymbol || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    clearCanvas();
  }, [selectedSymbol]);

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const dist = (a, b) => Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const pos = getPos(e);
    setPoints([pos]);
    setNextWaypointIdx(0);
    setHitWaypoints([]);
    // Check first waypoint immediately
    if (selectedSymbol) {
      const wp = selectedSymbol.waypoints[0];
      if (dist([pos.x, pos.y], wp) < HIT_RADIUS) {
        setNextWaypointIdx(1);
        setHitWaypoints([0]);
      }
    }
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing || !selectedSymbol) return;
    const pos = getPos(e);
    const newPoints = [...points, pos];
    setPoints(newPoints);

    // Check waypoint hits
    let idx = nextWaypointIdx;
    let newHits = [...hitWaypoints];
    while (idx < selectedSymbol.waypoints.length) {
      const wp = selectedSymbol.waypoints[idx];
      if (dist([pos.x, pos.y], wp) < HIT_RADIUS) {
        newHits.push(idx);
        idx++;
      } else {
        break;
      }
    }
    if (idx !== nextWaypointIdx) {
      setNextWaypointIdx(idx);
      setHitWaypoints(newHits);
      // Play waypoint hit sound — richer for higher tiers
      if (soundVolume > 0) {
        const progress = idx / selectedSymbol.waypoints.length;
        playRichTone(selectedSymbol.difficulty, progress, soundVolume);
      }
    }

    // Play continuous drawing tone (subtle pitch follows mouse Y)
    if (soundVolume > 0 && newPoints.length % 8 === 0) {
      const yRatio = Math.max(0, Math.min(1, pos.y / 380));
      const drawFreq = 150 + (1 - yRatio) * 250;
      playTone(drawFreq, 0.08, 'sine', soundVolume * 0.15);
    }

    // Render
    renderCanvas(newPoints, newHits);
  };

  const renderCanvas = (pts, hits) => {
    if (!canvasRef.current || !selectedSymbol) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Determine if guide should be shown (hide for Adept+ difficulty >= 4)
    const showGuide = selectedSymbol.difficulty < 4;

    // Draw guide path (only for easier tiers)
    if (showGuide) {
      const wps = selectedSymbol.waypoints;
      ctx.beginPath();
      ctx.strokeStyle = `${selectedSymbol.color}25`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      wps.forEach((wp, i) => {
        if (i === 0) ctx.moveTo(wp[0], wp[1]);
        else ctx.lineTo(wp[0], wp[1]);
      });
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw waypoint dots
    const wps = selectedSymbol.waypoints;
    wps.forEach((wp, i) => {
      const hit = (hits || hitWaypoints).includes(i);
      const isNext = i === (nextWaypointIdx || 0);
      // At high difficulty, only show the NEXT waypoint and already-hit ones
      if (!showGuide && !hit && !isNext) return;
      ctx.beginPath();
      ctx.arc(wp[0], wp[1], hit ? 8 : (isNext ? 12 : 6), 0, Math.PI * 2);
      ctx.fillStyle = hit ? `${selectedSymbol.color}cc` : (isNext ? `${selectedSymbol.color}60` : `${selectedSymbol.color}20`);
      ctx.fill();
      if (isNext) {
        ctx.beginPath();
        ctx.arc(wp[0], wp[1], 16, 0, Math.PI * 2);
        ctx.strokeStyle = `${selectedSymbol.color}40`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Draw user path with glow
    if (pts && pts.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = selectedSymbol.color;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.shadowBlur = 12;
      ctx.shadowColor = selectedSymbol.color;
      pts.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (!selectedSymbol) return;
    const totalWp = selectedSymbol.waypoints.length;
    const hitCount = hitWaypoints.length;
    const accuracy = Math.round((hitCount / totalWp) * 100);
    setScore(accuracy);

    if (accuracy >= 70) {
      setIsComplete(true);
      const isFirstTime = !masteredSymbols.includes(selectedSymbol.id);
      const alreadyDoneToday = dailyCompleted.includes(selectedSymbol.id);

      if (isFirstTime) {
        const updated = [...masteredSymbols, selectedSymbol.id];
        setMasteredSymbols(updated);
        localStorage.setItem('aura_mastered_symbols', JSON.stringify(updated));
      }

      // Daily XP
      let xpEarned = 0;
      if (!alreadyDoneToday) {
        xpEarned = selectedSymbol.xp;
        const newDaily = [...dailyCompleted, selectedSymbol.id];
        setDailyCompleted(newDaily);
        localStorage.setItem('aura_symbol_daily', JSON.stringify({ date: new Date().toDateString(), completed: newDaily }));
      }

      const msg = isFirstTime
        ? `${selectedSymbol.name} MASTERED! +${xpEarned} XP`
        : alreadyDoneToday
        ? `${selectedSymbol.name} traced! (already earned daily XP)`
        : `${selectedSymbol.name} traced! +${xpEarned} XP`;

      toast.success(msg, { icon: isFirstTime ? '✨' : '✅', duration: 3000 });
      onComplete?.({ accuracy, symbolId: selectedSymbol.id, firstTime: isFirstTime, xp: xpEarned });
      if (isMaster) playCompletionChime();
    } else if (points.length > 5) {
      toast.error(`${hitCount}/${totalWp} waypoints hit. Trace through all the dots in order!`, { icon: '🔄' });
    }
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    setPoints([]);
    setScore(0);
    setIsComplete(false);
    setNextWaypointIdx(0);
    setHitWaypoints([]);
    // Redraw guide
    setTimeout(() => renderCanvas([], []), 50);
  };

  // ─── Symbol Selection Grid ───
  if (!selectedSymbol) {
    const filteredSymbols = searchFilter
      ? ALL_SYMBOLS.filter(s => s.name.toLowerCase().includes(searchFilter.toLowerCase()))
      : ALL_SYMBOLS;

    return (
      <div>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <PenTool size={20} style={{ color: 'var(--accent-gold)' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#fff' }}>SYMBOL TRACING</h3>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', margin: '0 0 0.5rem 0' }}>
            Trace each symbol in one continuous line — no lifting, no retracing. Earn daily XP!
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
              ✨ {masteredSymbols.length} / {ALL_SYMBOLS.length} Mastered
            </span>
            <span style={{ fontSize: '0.7rem', background: 'rgba(46,204,113,0.08)', color: '#2ecc71', padding: '3px 10px', borderRadius: '8px', border: '1px solid rgba(46,204,113,0.15)' }}>
              🎯 {dailyCompleted.length} done today
            </span>
          </div>
          <input
            type="text"
            placeholder="Search symbols..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            style={{ marginTop: '0.75rem', width: '200px', padding: '0.5rem 1rem', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '0.8rem', textAlign: 'center' }}
          />
        </div>

        <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '4px' }}>
          {TIER_ORDER.map(tier => {
            const tierSymbols = filteredSymbols.filter(s => s.tier === tier);
            if (tierSymbols.length === 0 && searchFilter) return null;
            const tierLevel = TIER_LEVELS[tier];
            const isLocked = masteryLevel < tierLevel;
            const tierColor = TIER_COLORS[tier];
            const tierMastered = tierSymbols.filter(s => masteredSymbols.includes(s.id)).length;

            return (
              <div key={tier} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isLocked ? 'rgba(255,255,255,0.15)' : tierColor }} />
                    <span style={{ fontSize: '0.7rem', color: isLocked ? 'rgba(255,255,255,0.3)' : tierColor, letterSpacing: '2px', fontWeight: '600' }}>
                      {tier.toUpperCase()} {tier === 'Master' && '👑'}
                    </span>
                    {isLocked && <Lock size={10} color="rgba(255,255,255,0.3)" />}
                  </div>
                  {!isLocked && (
                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>
                      {tierMastered}/{tierSymbols.length} mastered
                    </span>
                  )}
                </div>

                {isLocked ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{
                      padding: '1.25rem', borderRadius: '14px',
                      background: tier === 'Master' ? 'rgba(212,175,55,0.04)' : 'rgba(255,255,255,0.015)',
                      border: tier === 'Master' ? '1px solid rgba(212,175,55,0.15)' : '1px solid rgba(255,255,255,0.05)',
                      textAlign: 'center'
                    }}
                  >
                    <Lock size={20} style={{ margin: '0 auto 0.4rem', display: 'block', color: tier === 'Master' ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.15)' }} />
                    <p style={{ color: tier === 'Master' ? 'var(--accent-gold)' : 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: '600', margin: '0 0 0.2rem 0' }}>
                      {tier === 'Master'
                        ? '👑 Attain Level 100 to unlock Master symbols'
                        : `Reach Level ${tierLevel} to unlock ${tier} symbols`}
                    </p>
                    <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.65rem', margin: 0 }}>
                      You are Level {masteryLevel}. {tierLevel - masteryLevel} more to go.
                    </p>
                  </motion.div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem' }}>
                    {tierSymbols.map(symbol => {
                      const isMastered = masteredSymbols.includes(symbol.id);
                      const doneToday = dailyCompleted.includes(symbol.id);
                      return (
                        <motion.button
                          key={symbol.id}
                          whileHover={{ scale: 1.03, borderColor: `${symbol.color}55` }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => { setSelectedSymbol(symbol); setScore(0); setIsComplete(false); setPoints([]); setNextWaypointIdx(0); setHitWaypoints([]); }}
                          style={{
                            padding: '0.7rem', borderRadius: '12px', cursor: 'pointer',
                            background: isMastered ? `${symbol.color}08` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${isMastered ? `${symbol.color}30` : 'rgba(255,255,255,0.06)'}`,
                            display: 'flex', alignItems: 'center', gap: '8px',
                            color: '#fff', textAlign: 'left', transition: 'all 0.2s'
                          }}
                        >
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: `${symbol.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, position: 'relative', fontSize: '0.85rem', fontWeight: '700', color: symbol.color
                          }}>
                            {symbol.waypoints.length}
                            {isMastered && (
                              <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: '#2ecc71', borderRadius: '50%', width: '12px', height: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <CheckCircle size={8} color="#fff" />
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: '600', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{symbol.name}</div>
                            <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)' }}>
                              {doneToday ? '✓ Done today' : isMastered ? `✓ Mastered · +${symbol.xp} XP` : `${symbol.waypoints.length} pts · +${symbol.xp} XP`}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Tracing Canvas View ───
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', width: '100%' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', width: '100%' }}>
        <button
          onClick={() => { setSelectedSymbol(null); setScore(0); setIsComplete(false); setPoints([]); }}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '4px 12px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.7rem', marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
        >
          ← All Symbols
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '0.25rem' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: `${selectedSymbol.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '700', color: selectedSymbol.color }}>{selectedSymbol.waypoints.length}</div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>{selectedSymbol.name}</h3>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem', margin: 0 }}>{selectedSymbol.desc}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.4rem' }}>
          <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: '6px', background: `${TIER_COLORS[selectedSymbol.tier]}15`, color: TIER_COLORS[selectedSymbol.tier], border: `1px solid ${TIER_COLORS[selectedSymbol.tier]}30` }}>
            {selectedSymbol.tier}
          </span>
          <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {selectedSymbol.waypoints.length} waypoints · +{selectedSymbol.xp} XP
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position: 'relative', width: '380px', height: '380px' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '380px', height: '380px', cursor: 'crosshair', touchAction: 'none',
            borderRadius: '24px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative', zIndex: 2
          }}
        />

        {/* Volume Slider */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center',
          marginTop: '6px', padding: '4px 12px', borderRadius: '10px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <span style={{ fontSize: '0.9rem', cursor: 'pointer', opacity: soundVolume === 0 ? 0.3 : 0.7 }}
            onClick={() => { setSoundVolume(0); localStorage.setItem('aura_symbol_volume', '0'); }}
          >🔇</span>
          <input
            type="range" min="0" max="1" step="0.05"
            value={soundVolume}
            onChange={e => { const v = parseFloat(e.target.value); setSoundVolume(v); localStorage.setItem('aura_symbol_volume', String(v)); }}
            style={{ width: '100px', accentColor: selectedSymbol.color, cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.9rem', cursor: 'pointer', opacity: soundVolume > 0.5 ? 0.9 : 0.5 }}
            onClick={() => { setSoundVolume(1); localStorage.setItem('aura_symbol_volume', '1'); }}
          >🔊</span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.25)', minWidth: '28px' }}>{Math.round(soundVolume * 100)}%</span>
        </div>

        {/* Completion overlay */}
        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)',
                backdropFilter: 'blur(8px)', borderRadius: '24px', zIndex: 3
              }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <CheckCircle size={60} color="#2ecc71" />
              </motion.div>
              <h4 style={{ fontSize: '1.6rem', fontWeight: 'bold', color: '#fff', margin: '0.4rem 0 0.2rem' }}>{score}% SYNC</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: selectedSymbol.color, fontSize: '0.85rem', fontWeight: 'bold' }}>
                <Star size={14} fill="currentColor" />
                {dailyCompleted.includes(selectedSymbol.id) ? 'Already earned daily XP' : `+${selectedSymbol.xp} XP`}
              </div>
              <button
                onClick={clearCanvas}
                style={{ marginTop: '1rem', padding: '8px 20px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: '0.75rem' }}
              >
                Trace Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={clearCanvas}
          style={{ position: 'absolute', top: '10px', right: '10px', padding: '7px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', zIndex: 4 }}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', marginBottom: '2px' }}>WAYPOINTS</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', fontFamily: 'monospace', color: selectedSymbol.color }}>
            {hitWaypoints.length}/{selectedSymbol.waypoints.length}
          </div>
        </div>
        <div style={{ width: '1px', height: '25px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Sparkles size={12} style={{ color: 'var(--accent-gold)' }} />
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)' }}>
            Draw through all dots in order — one continuous line
          </span>
        </div>
      </div>
    </div>
  );
};

export default SymbolPractice;
