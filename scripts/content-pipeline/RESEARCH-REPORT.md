# Content Automation Pipeline - Research Report

**Date:** 2026-02-05  
**Project:** ImpostoFacil Video Automation  
**Author:** OpenClaw Content Agent

---

## Executive Summary

After researching video generation, voice synthesis, and social media posting APIs, here's my recommendation for a cost-effective, fully automated pipeline:

| Component | Recommended | Backup Option |
|-----------|-------------|---------------|
| **Voice Generation** | ElevenLabs | OpenAI TTS |
| **Video Generation** | Creatomate | Shotstack |
| **Social Posting** | Ayrshare | TikTok Direct API |

**Estimated Monthly Cost:** $75-150/month for 30-60 videos

---

## 1. Video Generation APIs

### Creatomate ⭐ RECOMMENDED
- **Pricing:** ~$39/month (Growth) = 10,000 credits ≈ 700+ 1-min videos
- **API Quality:** Excellent JSON-based API, well-documented
- **Features:**
  - ✅ Vertical video (9:16) support
  - ✅ Text overlays with animations
  - ✅ Audio sync (voiceover + background music)
  - ✅ Template system
  - ✅ Bulk generation from spreadsheet
- **PT-BR Support:** Works with any language via text overlays
- **Automation:** REST API + webhooks
- **Verdict:** Best balance of price, features, and ease of use

### Shotstack
- **Pricing:** $39/month = 1,000 credits ≈ 1,000 1-min videos
- **API Quality:** Good REST API, comprehensive docs
- **Features:**
  - ✅ Vertical video support
  - ✅ Text overlays
  - ✅ Audio sync
  - ⚠️ More complex JSON schema
- **Verdict:** Good alternative, slightly more complex API

### JSON2Video
- **Pricing:** Website issues (404 on pricing page)
- **Verdict:** SKIP - unreliable website suggests unstable service

### HeyGen (AI Avatars)
- **Pricing:** $29/month Creator = unlimited avatar videos
- **Features:**
  - ✅ AI avatars with PT-BR voices
  - ✅ 175+ languages
  - ✅ Voice cloning
  - ⚠️ Avatar style may feel "corporate"
- **Verdict:** Good for avatar-style videos, use alongside Creatomate

### Synthesia
- **Pricing:** $22/month Starter = 10 min/month = ~20 videos
- **Verdict:** Too limited for our volume needs

### Remotion (Self-hosted)
- **Pricing:** Free for personal use, needs license for commercial
- **Features:**
  - ✅ Full control (React-based)
  - ⚠️ Requires hosting (AWS Lambda or server)
  - ⚠️ More development time
- **Verdict:** Great long-term option, but higher initial setup

---

## 2. Voice Generation APIs

### ElevenLabs ⭐ RECOMMENDED
- **Pricing:** $5/month Starter = 30,000 characters ≈ 15-20 videos
- **Pricing:** $22/month Creator = 100,000 characters ≈ 50-60 videos
- **Quality:** Industry-leading natural voices
- **PT-BR:** Excellent Brazilian Portuguese support
- **Features:**
  - ✅ Most natural-sounding
  - ✅ Multiple PT-BR voices available
  - ✅ Voice cloning (for brand consistency)
  - ✅ Streaming API
- **Verdict:** Best quality for PT-BR, worth the premium

### OpenAI TTS (Backup)
- **Pricing:** $15/1M characters ≈ $0.01-0.02 per video
- **Quality:** Good but less natural than ElevenLabs
- **PT-BR:** Supported (follows Whisper languages)
- **Features:**
  - ✅ Very cheap
  - ✅ Simple API
  - ⚠️ Less emotional range
  - ⚠️ More "robotic" for PT-BR
- **Verdict:** Good budget option, use as fallback

### Google Cloud TTS
- **Pricing:** $4/1M characters (standard), $16/1M (WaveNet)
- **PT-BR:** Available
- **Verdict:** Middle ground, but ElevenLabs sounds better

### Azure TTS
- **Pricing:** Similar to Google
- **PT-BR:** Available
- **Verdict:** No significant advantage over ElevenLabs

---

## 3. Social Media Posting APIs

### Ayrshare ⭐ RECOMMENDED
- **Pricing:** $149/month Premium (1 brand), $299/month Launch (10 brands)
- **Platforms:** TikTok, Instagram, YouTube, Twitter, LinkedIn, etc.
- **Features:**
  - ✅ Multi-platform from one API
  - ✅ Scheduling
  - ✅ Analytics
  - ⚠️ Higher cost
- **Verdict:** Best for multi-platform automation

### TikTok Direct API (for TikTok-first)
- **Pricing:** FREE
- **Requirements:**
  - Register as developer
  - App review required
  - OAuth user authorization
- **Limitations:**
  - Unaudited apps = private posts only
  - Need to pass audit for public posts
- **Verdict:** Use for TikTok if budget is tight

### Instagram Graph API
- **Pricing:** FREE
- **Requirements:**
  - Business/Creator account
  - Facebook App
  - Content Publishing API access
- **Verdict:** Native option for Instagram

### Publer / Buffer
- **Pricing:** $12-24/month
- **Features:** Scheduling, limited API
- **Verdict:** Manual tools, not great for full automation

---

## 4. Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CONTENT PIPELINE                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SCRIPT INPUT (scripts-batch-01.md)                     │
│         │                                                   │
│         ▼                                                   │
│  2. VOICE GENERATION (ElevenLabs)                          │
│         │ → generates: audio/script-01.mp3                 │
│         ▼                                                   │
│  3. VIDEO GENERATION (Creatomate)                          │
│         │ → uses: audio + text overlays + template         │
│         │ → generates: video/script-01.mp4                 │
│         ▼                                                   │
│  4. POST TO SOCIAL (Ayrshare or TikTok API)               │
│         │ → posts to: TikTok + Instagram                   │
│         ▼                                                   │
│  5. DONE ✓                                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Cost Breakdown (Monthly)

### Minimal Setup (30 videos/month)
| Service | Plan | Cost |
|---------|------|------|
| ElevenLabs | Starter | $5 |
| Creatomate | Essential | $25 |
| TikTok API | Free | $0 |
| Instagram API | Free | $0 |
| **Total** | | **~$30/month** |

### Recommended Setup (60 videos/month)
| Service | Plan | Cost |
|---------|------|------|
| ElevenLabs | Creator | $22 |
| Creatomate | Growth | $39 |
| Ayrshare | Premium | $149 |
| **Total** | | **~$210/month** |

### Budget Setup (using OpenAI TTS)
| Service | Plan | Cost |
|---------|------|------|
| OpenAI TTS | Pay-as-you-go | ~$3 |
| Creatomate | Essential | $25 |
| TikTok + IG Direct APIs | Free | $0 |
| **Total** | | **~$28/month** |

---

## 6. Implementation Notes

### For Faceless Videos (Scripts 03, 07, 11)
- Use Creatomate with text animation templates
- Audio from ElevenLabs
- Background music from royalty-free source

### For Avatar Videos (Scripts 01, 02, 04, 06, 09, 10, 12)
- Use HeyGen for natural-looking avatars
- Or use Creatomate with stock footage + voiceover

### For Screen Recording Style (Script 08)
- Can be pre-recorded manually
- Or simulated with Creatomate animations

---

## 7. Final Recommendation

**Start with the Budget Setup:**
1. ElevenLabs Starter ($5/month) - best voice quality
2. Creatomate Essential ($25/month) - easy video generation
3. TikTok + Instagram Direct APIs (free) - direct posting

**Scale up when:**
- Volume exceeds 30 videos/month → upgrade ElevenLabs
- Need multi-platform scheduling → add Ayrshare
- Want avatar videos → add HeyGen ($29/month)

**Total to get started: ~$30/month**
