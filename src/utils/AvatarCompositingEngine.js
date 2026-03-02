/**
 * AvatarCompositingEngine.js
 * ─────────────────────────────────────
 * Layered compositing engine for the Aura Avatar system.
 * 
 * Architecture:
 *   • Z-Index layer system: items render in defined depth order
 *   • Anchor points: each slot maps to a bounding region on the 1024×1024 canvas
 *   • Snap logic: items auto-position into their slot region
 *   • Supports: image src, emoji fallback, color-fill fallback
 *   • Live preview: renders to a visible <canvas> for instant feedback
 */

// ─── Canvas Size (all assets standardized to this) ───
const CANVAS_SIZE = 1024;

// ─── Layer Definitions (z-index order, lowest = drawn first) ───
export const LAYERS = {
  background:  { z: 0,  label: 'Background' },
  aura:        { z: 1,  label: 'Aura / Effects' },
  body:        { z: 2,  label: 'Body Base' },
  feet:        { z: 3,  label: 'Feet / Shoes' },
  legs:        { z: 4,  label: 'Legs / Pants' },
  chest:       { z: 5,  label: 'Chest / Shirt' },
  backbling:   { z: 6,  label: 'Back Bling' },
  neck:        { z: 7,  label: 'Neck / Necklace' },
  accessory:   { z: 8,  label: 'Accessory' },
  hand_right:  { z: 9,  label: 'Right Hand' },
  hand_left:   { z: 10, label: 'Left Hand' },
  hair:        { z: 11, label: 'Hair' },
  head:        { z: 12, label: 'Head / Crown' },
  headgear:    { z: 13, label: 'Headgear / Halo' },
  tattoo:      { z: 14, label: 'Tattoo / Overlay' },
  badge:       { z: 15, label: 'Badge / Frame' },
  // Non-visual slots
  action:      { z: -1, label: 'Action / Pose' },
  expression:  { z: -1, label: 'Expression' },
  ability:     { z: -1, label: 'Ability' },
};

// ─── Anchor Points (proportional to CANVAS_SIZE) ───
// Each defines { x, y, w, h } as fractions of the canvas.
// Items are drawn centered within their anchor region.
export const ANCHORS = {
  background:  { x: 0.00, y: 0.00, w: 1.00, h: 1.00 },
  aura:        { x: 0.05, y: 0.05, w: 0.90, h: 0.90 },
  body:        { x: 0.10, y: 0.02, w: 0.80, h: 0.96 },
  feet:        { x: 0.22, y: 0.82, w: 0.56, h: 0.18 },
  legs:        { x: 0.18, y: 0.52, w: 0.64, h: 0.38 },
  chest:       { x: 0.15, y: 0.22, w: 0.70, h: 0.35 },
  backbling:   { x: 0.00, y: 0.10, w: 1.00, h: 0.60 },
  neck:        { x: 0.30, y: 0.20, w: 0.40, h: 0.12 },
  accessory:   { x: 0.60, y: 0.35, w: 0.30, h: 0.20 },
  hand_right:  { x: 0.62, y: 0.42, w: 0.25, h: 0.22 },
  hand_left:   { x: 0.13, y: 0.42, w: 0.25, h: 0.22 },
  hair:        { x: 0.18, y: 0.00, w: 0.64, h: 0.30 },
  head:        { x: 0.25, y: 0.02, w: 0.50, h: 0.20 },
  headgear:    { x: 0.20, y: 0.00, w: 0.60, h: 0.22 },
  tattoo:      { x: 0.15, y: 0.20, w: 0.70, h: 0.60 },
  badge:       { x: 0.70, y: 0.05, w: 0.25, h: 0.12 },
};

// ─── Image Loader (cached) ───
const imageCache = new Map();

export const loadImage = (src) => new Promise((resolve) => {
  if (!src) return resolve(null);
  if (imageCache.has(src)) return resolve(imageCache.get(src));
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { imageCache.set(src, img); resolve(img); };
  img.onerror = () => resolve(null);
  img.src = src;
});

// ─── Draw a single item into its anchor region ───
const drawItemAtAnchor = (ctx, item, slot, size) => {
  const anchor = ANCHORS[slot] || ANCHORS.accessory;
  const ax = anchor.x * size;
  const ay = anchor.y * size;
  const aw = anchor.w * size;
  const ah = anchor.h * size;

  if (item._loadedImage) {
    // Draw image centered within anchor, maintaining aspect ratio
    const img = item._loadedImage;
    const aspect = img.width / img.height;
    let dw = aw, dh = ah;
    if (aspect > aw / ah) { dh = aw / aspect; } else { dw = ah * aspect; }
    const dx = ax + (aw - dw) / 2;
    const dy = ay + (ah - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  } else if (item.avatarEmoji) {
    // Emoji fallback — render centered in anchor
    const fontSize = Math.min(aw, ah) * 0.6;
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.avatarEmoji, ax + aw / 2, ay + ah / 2);
  } else if (item.avatarStyle?.fill) {
    // Color fill fallback
    ctx.fillStyle = item.avatarStyle.fill + '55'; // ~33% opacity
    ctx.beginPath();
    ctx.roundRect(ax + 4, ay + 4, aw - 8, ah - 8, 12);
    ctx.fill();
  }
};

// ─── Main Compositing Function ───
/**
 * Composites the avatar onto a canvas.
 *
 * @param {Object} config
 * @param {string} config.baseSrc — Photo or skin image source
 * @param {string} config.styleFilter — CSS filter to apply to base
 * @param {Object} config.equippedItems — { [slot]: itemData }
 * @param {HTMLCanvasElement} [config.targetCanvas] — Optional existing canvas for live preview
 * @returns {Promise<string>} — data URL of the composited image
 */
export const compositeAvatar = async (config) => {
  const { baseSrc, styleFilter, equippedItems = {}, targetCanvas } = config;
  const size = CANVAS_SIZE;

  const canvas = targetCanvas || document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Clear
  ctx.clearRect(0, 0, size, size);

  // ─── Step 1: Collect all layers and sort by z-index ───
  const layers = [];

  // Background item
  const bgItem = equippedItems.background;
  if (bgItem?.src) {
    const img = await loadImage(bgItem.src);
    if (img) layers.push({ z: LAYERS.background.z, slot: 'background', item: { ...bgItem, _loadedImage: img } });
  }
  if (!bgItem?.src) {
    // Default dark background
    layers.push({ z: -1, slot: '_defaultBg', item: null });
  }

  // Body base
  if (baseSrc) {
    const bodyImg = await loadImage(baseSrc);
    if (bodyImg) layers.push({ z: LAYERS.body.z, slot: 'body', item: { _loadedImage: bodyImg, _isBase: true, _filter: styleFilter } });
  }

  // All equipped items (except background which is handled above)
  for (const [slot, item] of Object.entries(equippedItems)) {
    if (!item || slot === 'background') continue;
    const layerDef = LAYERS[slot] || LAYERS[item.avatarSlot];
    if (!layerDef || layerDef.z < 0) continue; // Skip non-visual slots

    const resolvedItem = { ...item };
    if (item.src) {
      resolvedItem._loadedImage = await loadImage(item.src);
    }
    layers.push({ z: layerDef.z, slot: item.avatarSlot || slot, item: resolvedItem });
  }

  // Sort by z-index (ascending: background first, badges last)
  layers.sort((a, b) => a.z - b.z);

  // ─── Step 2: Render each layer in order ───
  for (const layer of layers) {
    if (layer.slot === '_defaultBg') {
      const grad = ctx.createLinearGradient(0, 0, 0, size);
      grad.addColorStop(0, '#0e0e1a');
      grad.addColorStop(0.5, '#12121f');
      grad.addColorStop(1, '#08080f');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      continue;
    }

    if (layer.item?._isBase) {
      // Body base — draw centered, full canvas
      ctx.save();
      if (layer.item._filter) {
        ctx.filter = layer.item._filter;
      }
      const img = layer.item._loadedImage;
      const aspect = img.width / img.height;
      let dw = size, dh = size;
      if (aspect > 1) { dh = size / aspect; } else { dw = size * aspect; }
      const dx = (size - dw) / 2, dy = (size - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();
      continue;
    }

    drawItemAtAnchor(ctx, layer.item, layer.slot, size);
  }

  return canvas.toDataURL('image/png', 0.92);
};

// ─── Live Preview (renders to a visible canvas ref) ───
export const renderLivePreview = async (canvasRef, config) => {
  if (!canvasRef?.current) return;
  return compositeAvatar({ ...config, targetCanvas: canvasRef.current });
};

// ─── Get layer info for a slot ───
export const getSlotLayer = (slot) => LAYERS[slot] || null;
export const getSlotAnchor = (slot) => ANCHORS[slot] || null;
export const getAllSlots = () => Object.keys(LAYERS).filter(k => LAYERS[k].z >= 0);

export default {
  compositeAvatar,
  renderLivePreview,
  loadImage,
  getSlotLayer,
  getSlotAnchor,
  getAllSlots,
  LAYERS,
  ANCHORS,
  CANVAS_SIZE,
};
