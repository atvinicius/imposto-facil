/**
 * Social Media Posting Module
 * Posts videos to TikTok and Instagram
 * 
 * Supports:
 * - TikTok Content Posting API (direct)
 * - Instagram Graph API (direct)
 * - Ayrshare (multi-platform)
 */

import fs from 'fs/promises';
import path from 'path';
import { config } from './config.js';

// ============================================
// TYPES
// ============================================

interface PostOptions {
  videoPath: string;
  caption: string;
  hashtags?: string[];
  platforms?: ('tiktok' | 'instagram')[];
  scheduledTime?: Date; // For scheduled posts
}

interface PostResult {
  success: boolean;
  tiktok?: { postId?: string; error?: string };
  instagram?: { postId?: string; error?: string };
  error?: string;
}

// ============================================
// TIKTOK IMPLEMENTATION
// ============================================

/**
 * Post video directly to TikTok
 * 
 * Uses the Content Posting API:
 * https://developers.tiktok.com/doc/content-posting-api-get-started
 * 
 * Note: Unaudited apps post as private by default.
 * You need to pass TikTok's audit for public posts.
 */
async function postToTikTok(
  videoPath: string,
  caption: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const { accessToken } = config.tiktok;
  
  console.log(`📱 Posting to TikTok...`);
  
  // Step 1: Query creator info to get available privacy levels
  const creatorInfoResponse = await fetch(
    'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
    }
  );
  
  if (!creatorInfoResponse.ok) {
    const error = await creatorInfoResponse.text();
    return { success: false, error: `TikTok creator info error: ${error}` };
  }
  
  const creatorInfo = await creatorInfoResponse.json() as {
    data: { privacy_level_options: string[]; max_video_post_duration_sec: number };
    error: { code: string; message: string };
  };
  
  console.log(`   Creator privacy options: ${creatorInfo.data.privacy_level_options.join(', ')}`);
  
  // Step 2: Get video file info
  const videoStats = await fs.stat(videoPath);
  const videoSize = videoStats.size;
  const chunkSize = 10000000; // 10MB chunks
  const totalChunks = Math.ceil(videoSize / chunkSize);
  
  // Step 3: Initialize the upload
  const initResponse = await fetch(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.substring(0, 150), // TikTok caption limit
          privacy_level: creatorInfo.data.privacy_level_options.includes('PUBLIC_TO_EVERYONE')
            ? 'PUBLIC_TO_EVERYONE'
            : 'SELF_ONLY',
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'FILE_UPLOAD',
          video_size: videoSize,
          chunk_size: chunkSize,
          total_chunk_count: totalChunks,
        },
      }),
    }
  );
  
  if (!initResponse.ok) {
    const error = await initResponse.text();
    return { success: false, error: `TikTok init error: ${error}` };
  }
  
  const initResult = await initResponse.json() as {
    data: { publish_id: string; upload_url: string };
    error: { code: string; message: string };
  };
  
  const { publish_id, upload_url } = initResult.data;
  console.log(`   Upload initialized: ${publish_id}`);
  
  // Step 4: Upload the video file
  const videoBuffer = await fs.readFile(videoPath);
  
  const uploadResponse = await fetch(upload_url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
    },
    body: videoBuffer,
  });
  
  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    return { success: false, error: `TikTok upload error: ${error}` };
  }
  
  console.log(`   ✅ Video uploaded to TikTok`);
  console.log(`   Publish ID: ${publish_id}`);
  
  return { success: true, postId: publish_id };
}

// ============================================
// INSTAGRAM IMPLEMENTATION
// ============================================

/**
 * Post video to Instagram Reels
 * 
 * Uses the Instagram Graph API:
 * https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing
 * 
 * Requirements:
 * - Instagram Business or Creator account
 * - Facebook App with Instagram Graph API permissions
 */
async function postToInstagram(
  videoPath: string,
  caption: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const { accessToken, businessAccountId } = config.instagram;
  
  console.log(`📸 Posting to Instagram...`);
  
  // For Instagram, we need to host the video at a public URL
  // In production, you'd upload to S3/CloudFlare/etc first
  // For now, we'll use a placeholder approach
  
  // Option 1: If you have a public URL
  // const videoUrl = await uploadToCloudStorage(videoPath);
  
  // Option 2: Use Instagram's container approach (requires video URL)
  console.log(`   ⚠️ Instagram requires video to be hosted at a public URL`);
  console.log(`   Please upload ${videoPath} to a cloud service first`);
  
  // Example flow (when you have a video URL):
  /*
  // Step 1: Create media container
  const containerResponse = await fetch(
    `https://graph.facebook.com/v18.0/${businessAccountId}/media`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        media_type: 'REELS',
        video_url: videoUrl,
        caption: caption,
      }),
    }
  );
  
  const container = await containerResponse.json();
  const containerId = container.id;
  
  // Step 2: Wait for container to be ready
  // Poll /media?fields=status_code until FINISHED
  
  // Step 3: Publish the container
  const publishResponse = await fetch(
    `https://graph.facebook.com/v18.0/${businessAccountId}/media_publish`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        creation_id: containerId,
      }),
    }
  );
  */
  
  return { 
    success: false, 
    error: 'Instagram posting requires video to be hosted at a public URL. Implement cloud upload first.',
  };
}

// ============================================
// AYRSHARE IMPLEMENTATION
// ============================================

/**
 * Post to multiple platforms using Ayrshare
 * 
 * Pros: One API for all platforms
 * Cons: Higher cost ($149+/month)
 */
async function postWithAyrshare(
  videoPath: string,
  caption: string,
  platforms: string[]
): Promise<PostResult> {
  const { apiKey, profileKey } = config.ayrshare;
  
  console.log(`🌐 Posting with Ayrshare...`);
  console.log(`   Platforms: ${platforms.join(', ')}`);
  
  // Read video as base64
  const videoBuffer = await fs.readFile(videoPath);
  const videoBase64 = videoBuffer.toString('base64');
  
  const response = await fetch('https://api.ayrshare.com/api/post', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      post: caption,
      platforms,
      mediaUrls: [`data:video/mp4;base64,${videoBase64}`],
      profileKey,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    return {
      success: false,
      error: `Ayrshare error: ${error}`,
    };
  }
  
  const result = await response.json() as { id: string; status: string };
  
  console.log(`   ✅ Posted via Ayrshare`);
  console.log(`   Post ID: ${result.id}`);
  
  return {
    success: true,
  };
}

// ============================================
// MAIN EXPORT
// ============================================

export async function postVideo(options: PostOptions): Promise<PostResult> {
  const platforms = options.platforms || ['tiktok', 'instagram'];
  const caption = options.hashtags
    ? `${options.caption}\n\n${options.hashtags.map(t => `#${t}`).join(' ')}`
    : options.caption;
  
  console.log(`\n📤 Posting video to social media`);
  console.log(`   Video: ${options.videoPath}`);
  console.log(`   Platforms: ${platforms.join(', ')}`);
  
  // Use Ayrshare if configured
  if (config.postingMethod === 'ayrshare') {
    return await postWithAyrshare(options.videoPath, caption, platforms);
  }
  
  // Otherwise, post directly to each platform
  const result: PostResult = { success: true };
  
  if (platforms.includes('tiktok')) {
    result.tiktok = await postToTikTok(options.videoPath, caption);
    if (!result.tiktok.success) result.success = false;
  }
  
  if (platforms.includes('instagram')) {
    result.instagram = await postToInstagram(options.videoPath, caption);
    if (!result.instagram.success) result.success = false;
  }
  
  return result;
}

// ============================================
// CLI USAGE
// ============================================

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: npx tsx post-video.ts <video.mp4> <caption> [--tiktok] [--instagram]');
    console.log('');
    console.log('Examples:');
    console.log('  npx tsx post-video.ts output/video.mp4 "Check this out! #tax"');
    console.log('  npx tsx post-video.ts output/video.mp4 "Tax tips!" --tiktok');
    process.exit(1);
  }
  
  const videoPath = args[0];
  const caption = args[1];
  
  const platforms: ('tiktok' | 'instagram')[] = [];
  if (args.includes('--tiktok')) platforms.push('tiktok');
  if (args.includes('--instagram')) platforms.push('instagram');
  if (platforms.length === 0) platforms.push('tiktok', 'instagram');
  
  const result = await postVideo({ videoPath, caption, platforms });
  
  if (!result.success) {
    console.error(`\n❌ Some posts failed`);
    if (result.tiktok?.error) console.error(`   TikTok: ${result.tiktok.error}`);
    if (result.instagram?.error) console.error(`   Instagram: ${result.instagram.error}`);
    process.exit(1);
  }
  
  console.log(`\n✅ Posted successfully!`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
