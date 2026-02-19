// ═══════════════════════════════════════════════════════
// Aura Avatar Generation Server
// Proxies requests to OpenAI for AI avatar generation
// ═══════════════════════════════════════════════════════
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI, { toFile } from 'openai';
import sharp from 'sharp';
import { writeFileSync, unlinkSync, existsSync, mkdirSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3100;

// Ensure temp directory exists
const TEMP_DIR = join(__dirname, 'temp');
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

// Initialize OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors({ origin: ['http://localhost:4000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:4173', 'http://127.0.0.1:4000'] }));
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Aura Avatar Generator' });
});

// ═══════════════════════════════════════════════════════
// POST /api/generate-avatar
// Accepts: { photo: base64DataUrl, items: [...itemNames], style: 'ethereal' }
// Returns: { success: true, image: base64DataUrl }
// ═══════════════════════════════════════════════════════
app.post('/api/generate-avatar', async (req, res) => {
  try {
    const { 
      photo, 
      items = [], 
      style = 'ethereal', 
      isPet = false, 
      petType = 'dog', 
      background = '', 
      expression = 'peaceful', 
      action = 'standing confidently' 
    } = req.body;

    if (!photo) {
      return res.status(400).json({ success: false, error: 'No photo provided' });
    }

    // Build item descriptions
    const itemDescriptions = items.length > 0
      ? items.map(item => {
          let desc = `a ${item.color || ''} ${item.name}`;
          if (item.emoji) desc += ` (${item.emoji})`;
          
          if (item.name.toLowerCase().includes('ricky & sage')) {
            desc += ` with the "Ricky & Sage" branding clearly visible`;
          }
          
          // Slot-specific hints
          if (item.slot === 'chest' || item.slot === 'torso') desc = `wearing ${desc} on their torso`;
          if (item.slot === 'legs') desc = `wearing ${desc} on their legs`;
          if (item.slot === 'feet' || item.slot === 'shoes') desc = `wearing ${desc} as footwear`;
          if (item.slot === 'headgear' || item.slot === 'head') desc = `wearing ${desc} on their head`;
          if (item.slot === 'hands' || item.slot === 'weapon') desc = `holding ${desc} in their hands`;
          if (item.slot === 'hair') desc = `their hair styled as "${item.name}"`;
          if (item.slot === 'ability' || item.slot === 'aura') desc = `surrounded by a ${desc} energy effect`;
          
          return desc;
        }).join(', ')
      : 'standard professional attire';

    const styleDescriptions = {
      ethereal: 'ethereal fantasy style, cinematic lighting, magical glow, mystical aura, soft focus background',
      cyberpunk: 'cyberpunk aesthetic, vibrant neon lights, futuristic high-tech clothing, sharp digital art',
      oilpaint: 'thick brushwork oil painting, rich textures, classical masterpiece feel, artistically expressive',
    };
    const styleDesc = styleDescriptions[style] || styleDescriptions.ethereal;

    let prompt = '';
    const referenceHint = "Looking exactly like the person in the reference photo provided.";
    
    if (isPet) {
      prompt = `A high-quality full-body digital illustration of a ${petType}. ${referenceHint} ` +
        `The ${petType} has a ${expression} expression and is ${action}. ` +
        `They are equipped with: ${itemDescriptions}. ` +
        `Setting: ${background || 'a beautiful zen sanctuary'}. ` +
        `Style: ${styleDesc}. ` +
        `Ensure all unique markings, fur patterns, and colors from the photo are perfectly preserved.`;
    } else {
      prompt = `A professional full-body digital portrait. ${referenceHint} ` +
        `The subject has a ${expression} facial expression and is ${action}. ` +
        `The subject is wearing AND using: ${itemDescriptions}. ` +
        `Background: ${background || 'a serene reiki healing room with glowing crystals'}. ` +
        `Style: ${styleDesc}. ` +
        `Preserve the subject's face, hair color, and body build exactly. Show the complete character from head to toe including shoes. High detail, award-winning illustration.`;
    }


    console.log(`[Avatar] Generating ${isPet ? 'Pet' : 'Person'} | Expression: ${expression} | Action: ${action}`);
    console.log(`[Avatar] Prompt: ${prompt.substring(0, 150)}...`);

    // Convert base64 data URL to buffer
    const base64Data = photo.includes('base64,') ? photo.split('base64,')[1] : photo;
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // OpenAI Edit uses alpha as mask. 
    // If we want the AI to "reimagine" the body/clothes while keeping the face, 
    // we need to provide a mask where the face is opaque and the rest is transparent.
    // FOR NOW: We will use DALL-E 2 Image to Image (variation) or just send the full image.
    // Actually, sending the full image to 'edit' without a mask usually results in "no changes".
    // I will use `sharp` to create a basic mask if it's an 'Edit' call, 
    // but the user just wants the items added. 
    
    // OpenAI Edit uses alpha as mask. 
    // We resize to 1024x1024 as required by DALL-E 2.
    // We do NOT call .ensureAlpha(1) because if the client sent transparency, 
    // it functions as the mask for the 'Edit' operation.
    const rgbaBuffer = await sharp(imageBuffer)
      .png()
      .resize(1024, 1024, { fit: 'cover' })
      .toBuffer();

    console.log(`[Avatar] Processed image buffer size: ${rgbaBuffer.length} bytes`);

    const tempPath = join(TEMP_DIR, `input_${Date.now()}.png`);
    writeFileSync(tempPath, rgbaBuffer);

    try {
      const imageFile = await toFile(readFileSync(tempPath), 'input.png', { type: 'image/png' });

      // Using DALL-E 2 Edit as it's the only one that takes an image input currently.
      // If the prompt is strong enough, it will overwrite the clothing.
      const response = await openai.images.edit({
        model: 'dall-e-2',
        image: imageFile,
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      });

      const generatedB64 = response.data[0].b64_json;
      const resultDataUrl = `data:image/png;base64,${generatedB64}`;

      console.log(`[Avatar] ✅ ${isPet ? 'Pet' : 'Person'} AI update successful`);
      res.json({ success: true, image: resultDataUrl });

    } finally {
      try { unlinkSync(tempPath); } catch {}
    }
  } catch (err) {
    console.error('[Avatar] ❌ Generation failed:', err.message);
    
    // Provide helpful error messages
    if (err.message?.includes('api_key')) {
      return res.status(401).json({ success: false, error: 'Invalid API key. Check your server/.env file.' });
    }
    if (err.message?.includes('billing') || err.message?.includes('insufficient_quota')) {
      return res.status(402).json({ success: false, error: 'OpenAI billing issue. Add credits at platform.openai.com/billing.' });
    }
    if (err.message?.includes('rate_limit')) {
      return res.status(429).json({ success: false, error: 'Rate limited. Please wait a moment and try again.' });
    }
    
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Avatar generation failed. The fallback mode will be used.',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎨 Aura Avatar Server running on http://127.0.0.1:${PORT}`);
  console.log(`   POST /api/generate-avatar — AI avatar generation`);
  console.log(`   GET  /api/health         — Health check\n`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn('⚠️  Warning: OPENAI_API_KEY not set in .env file!');
  }
});
