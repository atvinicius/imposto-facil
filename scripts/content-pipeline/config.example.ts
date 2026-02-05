/**
 * Configuration for the content pipeline
 * Copy this file to config.ts and fill in your API keys
 */

export const config = {
  // ============================================
  // VOICE GENERATION (pick one)
  // ============================================
  
  // ElevenLabs - Best quality PT-BR voices
  // Get API key: https://elevenlabs.io/app/settings/api-keys
  elevenlabs: {
    apiKey: 'your-elevenlabs-api-key',
    voiceId: 'onwK4e9ZLuTAKqWW03F9', // Example: Daniel (works well for PT-BR)
    // Other good PT-BR voices to try:
    // - 'EXAVITQu4vr4xnSDxMaL' (Bella)
    // - 'pNInz6obpgDQGcFmaJgB' (Adam)
    modelId: 'eleven_multilingual_v2', // Best for non-English
  },
  
  // OpenAI TTS - Cheaper alternative
  // Uses your existing OpenAI API key
  openai: {
    apiKey: 'your-openai-api-key',
    voice: 'onyx', // Options: alloy, echo, fable, onyx, nova, shimmer
    model: 'tts-1', // or 'tts-1-hd' for higher quality
  },
  
  // Which TTS provider to use: 'elevenlabs' | 'openai'
  ttsProvider: 'elevenlabs' as const,

  // ============================================
  // VIDEO GENERATION
  // ============================================
  
  // Creatomate - JSON-based video API
  // Get API key: https://creatomate.com/dashboard/settings
  creatomate: {
    apiKey: 'your-creatomate-api-key',
    // Template ID for faceless videos (create in Creatomate dashboard)
    facelessTemplateId: 'your-template-id',
    // Template ID for text-heavy videos
    textTemplateId: 'your-text-template-id',
  },

  // ============================================
  // SOCIAL MEDIA POSTING
  // ============================================
  
  // TikTok Direct API
  // Register app: https://developers.tiktok.com/
  tiktok: {
    clientKey: 'your-tiktok-client-key',
    clientSecret: 'your-tiktok-client-secret',
    accessToken: 'user-access-token', // From OAuth flow
    openId: 'user-open-id',
  },
  
  // Instagram Graph API
  // Setup: https://developers.facebook.com/docs/instagram-api/
  instagram: {
    accessToken: 'your-instagram-access-token',
    businessAccountId: 'your-instagram-business-account-id',
  },
  
  // Ayrshare (multi-platform) - Optional, higher cost
  // Get API key: https://app.ayrshare.com/
  ayrshare: {
    apiKey: 'your-ayrshare-api-key',
    profileKey: 'your-profile-key', // For specific brand
  },
  
  // Which posting method to use: 'direct' | 'ayrshare'
  postingMethod: 'direct' as 'direct' | 'ayrshare',

  // ============================================
  // OUTPUT SETTINGS
  // ============================================
  
  output: {
    audioDir: './output/audio',
    videoDir: './output/video',
    tempDir: './output/temp',
  },
  
  // ============================================
  // VIDEO SETTINGS
  // ============================================
  
  video: {
    width: 1080,
    height: 1920, // 9:16 vertical
    fps: 30,
    format: 'mp4',
  },
  
  // ============================================
  // BRAND SETTINGS
  // ============================================
  
  brand: {
    name: 'ImpostoFacil',
    primaryColor: '#2563eb', // Blue
    secondaryColor: '#1e40af',
    textColor: '#ffffff',
    fontFamily: 'Inter',
    logo: './assets/logo.png',
    watermark: './assets/watermark.png',
  },
};

export type Config = typeof config;
