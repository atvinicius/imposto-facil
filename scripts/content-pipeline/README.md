# ImpostoFacil Content Pipeline

Automated video creation pipeline that transforms scripts into posted TikTok/Instagram Reels.

## 🎯 What It Does

```
Script (Markdown) → Voice (MP3) → Video (MP4) → Posted to TikTok/Instagram
```

Fully automated. You provide API keys, the system does everything else.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd /data/home/.openclaw/workspace/imposto-facil/scripts/content-pipeline
npm install
```

### 2. Configure API Keys

```bash
cp config.example.ts config.ts
# Edit config.ts with your API keys
```

### 3. Run the Pipeline

```bash
# Test with one script (voice only)
npm run test

# Process a specific script
npx tsx pipeline.ts --script=script-03 --skip-post

# Process all scripts
npx tsx pipeline.ts
```

---

## 📋 Required API Keys

### Minimum Setup (~$30/month)

| Service | Purpose | Sign Up | Cost |
|---------|---------|---------|------|
| **ElevenLabs** | Voice generation (PT-BR) | [elevenlabs.io](https://elevenlabs.io) | $5/mo (Starter) |
| **Creatomate** | Video generation | [creatomate.com](https://creatomate.com) | $25/mo (Essential) |

### For Social Media Posting

| Service | Purpose | Sign Up | Cost |
|---------|---------|---------|------|
| **TikTok** | Direct posting | [developers.tiktok.com](https://developers.tiktok.com) | Free |
| **Instagram** | Direct posting | [developers.facebook.com](https://developers.facebook.com) | Free |
| **Ayrshare** (optional) | Multi-platform | [ayrshare.com](https://ayrshare.com) | $149/mo |

---

## 🔧 Setup Instructions

### Step 1: ElevenLabs (Voice)

1. Create account at [elevenlabs.io](https://elevenlabs.io)
2. Go to Settings → API Keys
3. Copy your API key
4. Add to `config.ts`:
   ```ts
   elevenlabs: {
     apiKey: 'your-key-here',
     voiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel works well for PT-BR
     modelId: 'eleven_multilingual_v2',
   }
   ```

**Recommended voices for PT-BR:**
- `onwK4e9ZLuTAKqWW03F9` (Daniel) - Natural male voice
- `EXAVITQu4vr4xnSDxMaL` (Bella) - Natural female voice
- Or clone your own voice for brand consistency

### Step 2: Creatomate (Video)

1. Create account at [creatomate.com](https://creatomate.com)
2. Go to Dashboard → Settings
3. Copy your API key
4. Create a template:
   - Click "Create Template"
   - Choose vertical (1080x1920)
   - Add elements: Background, Text, Audio
   - Save and copy the Template ID
5. Add to `config.ts`:
   ```ts
   creatomate: {
     apiKey: 'your-key-here',
     facelessTemplateId: 'your-template-id',
   }
   ```

### Step 3: TikTok (Posting)

1. Register at [developers.tiktok.com](https://developers.tiktok.com)
2. Create an app
3. Add "Content Posting API" product
4. Enable "Direct Post" configuration
5. Get your Client Key and Secret
6. Implement OAuth to get user access token
7. Add to `config.ts`:
   ```ts
   tiktok: {
     clientKey: 'your-client-key',
     clientSecret: 'your-client-secret',
     accessToken: 'user-access-token',
     openId: 'user-open-id',
   }
   ```

⚠️ **Note:** Unaudited TikTok apps can only post private videos. You need to pass TikTok's audit for public posts.

### Step 4: Instagram (Posting)

1. Create a Facebook App at [developers.facebook.com](https://developers.facebook.com)
2. Add Instagram Graph API
3. Connect your Instagram Business/Creator account
4. Get an access token with `instagram_content_publish` permission
5. Add to `config.ts`:
   ```ts
   instagram: {
     accessToken: 'your-access-token',
     businessAccountId: 'your-account-id',
   }
   ```

---

## 📁 File Structure

```
content-pipeline/
├── README.md              # This file
├── RESEARCH-REPORT.md     # API comparison and recommendations
├── package.json           # Dependencies
├── config.example.ts      # Example configuration
├── config.ts              # Your actual config (gitignored)
├── generate-voice.ts      # Script → Audio
├── generate-video.ts      # Audio + Text → Video
├── post-video.ts          # Video → Social platforms
├── pipeline.ts            # Full orchestration
├── test-voice.ts          # Quick voice test
└── output/
    ├── audio/             # Generated MP3 files
    └── video/             # Generated MP4 files
```

---

## 🎮 Usage Examples

### Generate voice only
```bash
npx tsx generate-voice.ts "Olá! Teste de voz em português." output/test.mp3
```

### Process single script
```bash
npx tsx pipeline.ts --script=script-03 --skip-post
```

### Dry run (preview without action)
```bash
npx tsx pipeline.ts --dry-run
```

### Full pipeline
```bash
npx tsx pipeline.ts
```

### Skip steps
```bash
# Use existing audio
npx tsx pipeline.ts --skip-voice

# Generate video but don't post
npx tsx pipeline.ts --skip-post
```

---

## 💰 Cost Breakdown

### Per Video (estimated)
| Component | Cost |
|-----------|------|
| ElevenLabs (500 chars) | ~$0.08 |
| Creatomate (1 min video) | ~$0.14 |
| Posting APIs | Free |
| **Total per video** | **~$0.22** |

### Monthly (60 videos/month)
| Service | Plan | Cost |
|---------|------|------|
| ElevenLabs | Creator (100K chars) | $22 |
| Creatomate | Growth (10K credits) | $39 |
| TikTok + IG APIs | Free | $0 |
| **Total** | | **$61/month** |

---

## 🔄 Pipeline Flow

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  1. READ SCRIPT                                        │
│     └─ Parse: scripts-batch-01.md                      │
│     └─ Extract: hook, body, CTA, caption               │
│                                                         │
│  2. GENERATE VOICE                                     │
│     └─ Input: Script text (PT-BR)                      │
│     └─ API: ElevenLabs multilingual_v2                 │
│     └─ Output: output/audio/script-XX.mp3              │
│                                                         │
│  3. GENERATE VIDEO                                     │
│     └─ Input: Audio + Text overlays                    │
│     └─ API: Creatomate                                 │
│     └─ Template: 1080x1920 vertical                    │
│     └─ Output: output/video/script-XX.mp4              │
│                                                         │
│  4. POST TO SOCIAL                                     │
│     └─ TikTok: Content Posting API                     │
│     └─ Instagram: Graph API (Reels)                    │
│     └─ Caption + Hashtags                              │
│                                                         │
│  5. DONE ✓                                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### TikTok Audit
- New TikTok apps can only post **private** videos
- To post **public** videos, you must pass TikTok's audit
- Apply at: https://developers.tiktok.com/application/content-posting-api
- Audit typically takes 2-4 weeks

### Instagram Video Hosting
- Instagram requires videos to be hosted at a **public URL**
- You'll need to upload to S3, CloudFlare R2, or similar first
- The `post-video.ts` has placeholder for this

### ElevenLabs Character Limits
- Starter plan: 30,000 chars/month (~15-20 videos)
- Creator plan: 100,000 chars/month (~50-60 videos)
- Each video script is ~1,500-2,000 characters

### Creatomate Templates
- Create templates in the Creatomate dashboard first
- Use placeholders: `Text-1`, `Text-2`, `Audio-1`, etc.
- The pipeline fills these dynamically

---

## 🐛 Troubleshooting

### "ElevenLabs API error: 401"
- Check your API key is correct
- Ensure you have enough characters remaining

### "Creatomate render failed"
- Verify your template ID exists
- Check the Creatomate dashboard for render logs

### "TikTok init error"
- Ensure Direct Post is enabled in your app
- Check your access token hasn't expired
- Verify video meets TikTok requirements (MP4, H.264)

### "Instagram requires public URL"
- You need to host the video somewhere public
- Options: AWS S3, CloudFlare R2, Vercel Blob

---

## 📚 Resources

- [ElevenLabs API Docs](https://docs.elevenlabs.io/)
- [Creatomate API Docs](https://creatomate.com/docs)
- [TikTok Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing)

---

## 📝 License

Internal use for ImpostoFacil only.
