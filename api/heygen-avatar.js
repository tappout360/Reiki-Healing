// Vercel Serverless Function — HeyGen Avatar Integration Wrapper
// Handles creating avatars from photos, generating talking videos, and checking status securely.

export default async function handler(req, res) {
  // CORS & Security Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    console.error("HeyGen API Key is missing in environment variables.");
    return res.status(500).json({ error: 'HeyGen API is not configured on the server.' });
  }

  try {
    const { action } = req.method === 'POST' ? req.body : req.query;

    if (!action) {
      return res.status(400).json({ error: 'Missing required parameter: action' });
    }

    // 1. Create a Photo Avatar using base64 image data
    if (action === 'create-avatar') {
      const { base64Image, name } = req.body;
      if (!base64Image) {
        return res.status(400).json({ error: 'Missing base64Image for avatar creation.' });
      }

      // Parse data URL if present
      let mediaType = "image/jpeg";
      let base64Data = base64Image;
      const matches = base64Image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mediaType = matches[1];
        base64Data = matches[2];
      }

      console.log(`Sending avatar registration to HeyGen. Name: ${name || 'Seeker Avatar'}, Type: ${mediaType}`);

      const response = await fetch('https://api.heygen.com/v3/avatars', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'photo',
          name: name || 'Seeker Avatar',
          file: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("HeyGen Create Avatar Error:", result);
        return res.status(response.status).json({ error: result.message || 'Failed to create avatar on HeyGen.' });
      }

      // Handle v3 format: usually returns { data: { avatar_id: '...' } }
      const avatarId = result.data?.avatar_id || result.avatar_id;
      return res.status(200).json({ avatarId, rawData: result.data || result });
    }

    // 2. Generate a talking video from an avatar ID and script
    if (action === 'generate-video') {
      const { avatarId, script, voiceId } = req.body;
      if (!avatarId || !script) {
        return res.status(400).json({ error: 'Missing avatarId or script for video generation.' });
      }

      // Use a standard soothing English voice if none specified
      // HeyGen standard: "Sara" or "8b804fd1115e4f44a30e87d46c827c19" (usually standard)
      const selectedVoice = voiceId || '8b804fd1115e4f44a30e87d46c827c19';

      console.log(`Requesting talking video from HeyGen. Avatar: ${avatarId}, Voice: ${selectedVoice}`);

      const response = await fetch('https://api.heygen.com/v3/videos', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'avatar',
          avatar_id: avatarId,
          voice_id: selectedVoice,
          script: script,
          aspect_ratio: '16:9',
          resolution: '1080p'
        })
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("HeyGen Video Generation Error:", result);
        return res.status(response.status).json({ error: result.message || 'Failed to generate video on HeyGen.' });
      }

      const videoId = result.data?.video_id || result.video_id;
      return res.status(200).json({ videoId, rawData: result.data || result });
    }

    // 3. Check status of a video rendering job
    if (action === 'check-status') {
      const videoId = req.method === 'POST' ? req.body.videoId : req.query.videoId;
      if (!videoId) {
        return res.status(400).json({ error: 'Missing videoId for status check.' });
      }

      console.log(`Polling status for video ID: ${videoId}`);

      const response = await fetch(`https://api.heygen.com/v3/videos/${videoId}`, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey
        }
      });

      const result = await response.json();
      if (!response.ok) {
        console.error("HeyGen Check Status Error:", result);
        return res.status(response.status).json({ error: result.message || 'Failed to retrieve video status.' });
      }

      // v3 returns detailed video info in result.data: { status: 'completed' | 'generating' | 'failed', video_url: '...' }
      const data = result.data || result;
      return res.status(200).json({
        status: data.status, // 'completed', 'generating', 'failed'
        videoUrl: data.video_url || null,
        error: data.error || null,
        rawData: data
      });
    }

    return res.status(400).json({ error: `Unsupported action: ${action}` });
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'An unexpected internal error occurred.' });
  }
}
