import { 
  VideoComposition, 
  ShotstackRenderRequest, 
  ShotstackTimeline, 
  ShotstackTrack, 
  ShotstackClip,
  getShotstackTextStyle,
  calculateOptimalDurations,
  MINIMUM_DURATIONS
} from './video-composition'

// Shotstack API configuration
const SHOTSTACK_API_URL = 'https://api.shotstack.io'
const SHOTSTACK_STAGE = 'stage' // Use 'v1' for production

interface ShotstackConfig {
  apiKey: string
  ownerId: string
  environment: 'sandbox' | 'production'
}

// Initialize with environment variables
const shotstackConfig: ShotstackConfig = {
  apiKey: import.meta.env.VITE_SHOTSTACK_API_KEY || '2ZlpmYQuGL3oELJc6fcywbHKauKNKPwrp2BrsuZf',
  ownerId: import.meta.env.VITE_SHOTSTACK_OWNER_ID || 'p4onozror8',
  environment: (import.meta.env.VITE_SHOTSTACK_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
}

export interface RenderResponse {
  success: boolean
  message: string
  response?: {
    id: string
    owner: string
    url?: string
    status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
    error?: string
    created: string
    updated: string
  }
}

export interface RenderStatus {
  id: string
  status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
  url?: string
  error?: string
  progress?: number
  created: string
  updated: string
}

// Convert VideoComposition to Shotstack JSON format
export function createShotstackTimeline(composition: VideoComposition): ShotstackTimeline {
  console.log('🚨 FULL COMPOSITION OBJECT AT START:', JSON.stringify(composition, null, 2))
  
  const tracks: ShotstackTrack[] = []
  let currentTime = 0
  
  // Calculate optimal durations with minimum requirements
  const { hookDuration, demoDurations, totalDuration } = calculateOptimalDurations(composition)
  
  console.log('🎬 Video timing calculation:', {
    hookDuration: `${hookDuration}s`,
    demoDurations: demoDurations.map(d => `${d}s`),
    totalDuration: `${totalDuration}s`,
    minimums: MINIMUM_DURATIONS
  })
  
  // Track 1: Video Sequence (Hook first, then Demo clips)
  const videoTrack: ShotstackTrack = { clips: [] }
  
  // Add hook video first (if provided) - trim to minimum 5 seconds
  if (composition.hookVideo) {
    videoTrack.clips.push({
      asset: {
        type: 'video',
        src: composition.hookVideo.downloadUrl,
        // Shotstack video trimming - start from beginning, trim to exact duration
        trim: hookDuration < (composition.hookVideo.duration || 0) ? hookDuration : undefined
      },
      start: currentTime,
      length: hookDuration
      // No fade transitions on hook video so text overlay stays visible
    })
    currentTime += hookDuration
  }
  
  // Add demo clips after hook video (if provided) - trim to minimum 10 seconds each
  if (composition.demoClips.length > 0) {
    composition.demoClips
      .sort((a, b) => a.order - b.order) // Ensure correct order
      .forEach((demoClip, index) => {
        const optimalDuration = demoDurations[index]
        
        videoTrack.clips.push({
          asset: {
            type: 'video',
            src: demoClip.asset.downloadUrl,
            // Shotstack video trimming - start from beginning, trim to exact duration
            trim: optimalDuration < (demoClip.asset.duration || 0) ? optimalDuration : undefined
          },
          start: currentTime,
          length: optimalDuration,
          transition: {
            in: 'fade',
            out: 'fade'
          }
        })
        currentTime += optimalDuration
      })
  }
  
  // REVERSE ORDER TEST: Add text track FIRST to see if layering is backwards
  console.log('🚨 TESTING REVERSED TRACK ORDER - TEXT FIRST!')
  
  // Track 0: TEXT OVERLAY (first = top layer in Shotstack)
  if (composition.hookVideo) {
    // Get hook text with proper error handling and fallback
    const hookText = composition.hookText.text?.trim()
    
    if (!hookText) {
      console.log('⚠️ No hook text provided, skipping text overlay')
    } else if (hookText.length > 200) {
      console.log('⚠️ Hook text too long (>200 chars), truncating:', hookText.length)
    }
    
    // Use provided text or skip if empty
    const textToDisplay = hookText
    
    if (textToDisplay) {
      console.log('🎨 Creating hook text overlay:', textToDisplay.substring(0, 50) + '...')
      
      // Add line breaks using Shotstack's native \n support
      const addLineBreaks = (text: string): string => {
        const words = text.split(' ')
        const lines = []
        let currentLine = []
        
        for (const word of words) {
          currentLine.push(word)
          
          // Break line every 8-10 words or at natural punctuation
          if (currentLine.length >= 8 || word.includes('.') || word.includes('!') || word.includes('?')) {
            lines.push(currentLine.join(' '))
            currentLine = []
          }
        }
        
        // Add remaining words
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '))
        }
        
        return lines.join('\n')
      }
      
      const formattedText = addLineBreaks(textToDisplay)
    const textStyle = getShotstackTextStyle(composition.hookText)
    
    console.log('🎨 Creating text track with proper Shotstack text asset:', {
      text: textToDisplay,
      textLength: textToDisplay.length,
      font: textStyle.font,
      width: textStyle.width,
      height: textStyle.height,
      alignment: textStyle.alignment,
      background: textStyle.background,
      duration: hookDuration
    })
    
    // Log the exact asset structure being sent to Shotstack
    const textAsset = {
      type: 'text',
      text: textToDisplay,
      font: {
        family: textStyle.font.family,
        size: textStyle.font.size,
        color: textStyle.font.color,
        weight: textStyle.font.weight
      },
      width: textStyle.width,
      height: textStyle.height,
      alignment: {
        horizontal: textStyle.alignment.horizontal,
        vertical: textStyle.alignment.vertical
      },
      background: textStyle.background
    }
    console.log('📋 EXACT TEXT ASSET BEING SENT:', JSON.stringify(textAsset, null, 2))
    
      // Create Shotstack text asset following their documentation example
      const textTrack: ShotstackTrack = {
        clips: [
          {
            asset: {
              type: 'text',
              text: formattedText,
              font: {
                family: 'Montserrat ExtraBold',
                size: 42,
                color: '#ffffff',
                lineHeight: 1.4,
                weight: 900
              },
              stroke: {
                color: '#000000',
                width: 2
              }
            },
            start: 0,
            length: hookDuration
          }
        ]
      }
    
    console.log('🚨 USING PROPER TEXT ASSET FROM SHOTSTACK DOCS')
    
      console.log('✅ Adding hook text overlay to timeline (first = top layer)')
      tracks.push(textTrack)
      console.log('🚨 TEXT TRACK ADDED AT INDEX:', tracks.length - 1)
    } else {
      console.log('⚠️ Skipping text overlay - no valid hook text provided')
    }
  } else {
    console.log('⚠️ Skipping text overlay - no hook video found')
  }
  
  // Add demo script as AI voiceover if demo clips exist and script is provided
  if (composition.demoClips.length > 0 && composition.demoScript?.text?.trim()) {
    const demoScriptText = composition.demoScript.text.trim()
    
    // Calculate demo section start time
    const demoStartTime = hookDuration // Demo starts after hook
    
    console.log('🎙️ Creating demo script AI voiceover:', demoScriptText.substring(0, 50) + '...')
    console.log('📍 Demo voiceover timing - Start:', demoStartTime)
    console.log('📝 Demo script text length:', demoScriptText.length, 'characters')
    console.log('📊 Word count:', demoScriptText.split(' ').length, 'words')
    
    // Create demo script voiceover track using Shotstack text-to-speech
    // Calculate estimated duration (approx 150 words per minute for speech)
    const wordCount = demoScriptText.split(' ').length
    const estimatedDuration = Math.max(3, Math.ceil((wordCount / 150) * 60))
    
    const demoVoiceoverTrack: ShotstackTrack = {
      clips: [
        {
          asset: {
            type: 'text-to-speech',
            text: demoScriptText,
            voice: 'Amy' // British English female voice (from documentation)
          },
          start: demoStartTime,
          length: estimatedDuration
        }
      ]
    }
    
    console.log('✅ Adding demo script voiceover to timeline (AI text-to-speech)')
    console.log('🎬 TTS Asset details:', JSON.stringify(demoVoiceoverTrack.clips[0].asset, null, 2))
    console.log('⏱️ Estimated duration:', estimatedDuration, 'seconds')
    tracks.push(demoVoiceoverTrack)
    console.log('🚨 DEMO VOICEOVER TRACK ADDED AT INDEX:', tracks.length - 1)
  }

  // NOW ADD OTHER TRACKS AFTER TEXT
  console.log('🚨 NOW ADDING OTHER TRACKS AFTER TEXT')
  
  // Track 1: Background Music (after text)
  if (composition.backgroundMusic) {
    const { asset, settings } = composition.backgroundMusic
    
    const musicTrack: ShotstackTrack = {
      clips: [{
        asset: {
          type: 'audio',
          src: asset.downloadUrl,
          volume: settings.volume / 100
        },
        start: settings.startTime,
        length: totalDuration - settings.startTime,
        transition: {
          in: settings.fadeIn ? 'fade' : undefined,
          out: settings.fadeOut ? 'fade' : undefined
        }
      }]
    }
    tracks.push(musicTrack)
    console.log('🚨 ADDED MUSIC TRACK AT INDEX:', tracks.length - 1)
  }
  
  // Track 2: Video clips (last)
  if (videoTrack.clips.length > 0) {
    tracks.push(videoTrack)
    console.log('🚨 ADDED VIDEO TRACK LAST AT INDEX:', tracks.length - 1)
  }
  
  console.log('🚨 FINAL TRACK COUNT BEFORE TIMELINE CREATION:', tracks.length)
  console.log('🚨 TRACK ORDER:', tracks.map((track, index) => ({
    index,
    firstClipType: track.clips[0]?.asset?.type,
    isTextTrack: track.clips[0]?.asset?.type === 'text'
  })))
  
  const timeline = {
    background: '#000000', // Black background for TikTok style
    tracks
  }
  
  console.log('🎬 Final timeline structure:', {
    tracksCount: timeline.tracks.length,
    trackTypes: timeline.tracks.map((track, index) => {
      const firstClip = track.clips[0]
      return {
        trackIndex: index,
        clipsCount: track.clips.length,
        firstClipType: firstClip?.asset?.type,
        hasText: firstClip?.asset?.type === 'text' ? firstClip.asset.text : undefined,
        textClipDetails: firstClip?.asset?.type === 'text' ? {
          text: firstClip.asset.text,
          font: firstClip.asset.font,
          stroke: firstClip.asset.stroke,
          start: firstClip.start,
          length: firstClip.length
        } : undefined,
        hasVideoTransitions: firstClip?.asset?.type === 'video' ? !!firstClip.transition : false,
        layer: index === 0 ? 'bottom (audio)' : index === 1 ? 'middle (video)' : 'TOP (text)'
      }
    })
  })
  
  console.log('🚨 FULL TIMELINE JSON FOR SHOTSTACK:', JSON.stringify(timeline, null, 2))
  
  return timeline
}

// Create Shotstack render request
export function createRenderRequest(composition: VideoComposition): ShotstackRenderRequest {
  const timeline = createShotstackTimeline(composition)
  
  return {
    timeline,
    output: {
      format: composition.exportSettings.format,
      aspectRatio: '9:16', // TikTok format
      size: composition.exportSettings.resolution === '1080x1920' ? {
        width: 1080,
        height: 1920
      } : {
        width: 720,
        height: 1280
      }
    }
  }
}

// Submit video for rendering
export async function submitRender(composition: VideoComposition): Promise<RenderResponse> {
  try {
    console.log('🎬 Submitting video render to Shotstack...')
    console.log('📹 Composition:', {
      hookVideo: !!composition.hookVideo,
      demoClips: composition.demoClips.length,
      hookText: composition.hookText.text.substring(0, 50) + '...',
      music: !!composition.backgroundMusic
    })
    
    const renderRequest = createRenderRequest(composition)
    console.log('📋 Shotstack Request JSON:')
    console.log(JSON.stringify(renderRequest, null, 2))
    
    // Validate audio clip structure
    if (composition.backgroundMusic) {
      console.log('🎵 Audio settings:', composition.backgroundMusic.settings)
    }
    
    const response = await fetch(`${SHOTSTACK_API_URL}/${SHOTSTACK_STAGE}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': shotstackConfig.apiKey
      },
      body: JSON.stringify(renderRequest)
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Shotstack API Error:', response.status, errorText)
      throw new Error(`Shotstack API Error: ${response.status} - ${errorText}`)
    }
    
    const result = await response.json()
    console.log('✅ Render submitted successfully:', result)
    
    return {
      success: true,
      message: 'Video render submitted successfully',
      response: result.response
    }
    
  } catch (error: any) {
    console.error('❌ Error submitting render:', error)
    return {
      success: false,
      message: error.message || 'Failed to submit video render'
    }
  }
}

// Check render status
export async function getRenderStatus(renderId: string): Promise<RenderStatus | null> {
  try {
    console.log('🔍 Checking render status for:', renderId)
    
    const response = await fetch(`${SHOTSTACK_API_URL}/${SHOTSTACK_STAGE}/render/${renderId}`, {
      headers: {
        'x-api-key': shotstackConfig.apiKey
      }
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Error checking render status:', response.status, errorText)
      return null
    }
    
    const result = await response.json()
    console.log('📊 Render status:', result.response.status)
    
    return result.response
    
  } catch (error: any) {
    console.error('❌ Error checking render status:', error)
    return null
  }
}

// Poll render status until completion
export async function pollRenderStatus(
  renderId: string, 
  onProgress?: (status: RenderStatus) => void,
  maxWaitTime: number = 300000 // 5 minutes
): Promise<RenderStatus | null> {
  const startTime = Date.now()
  const pollInterval = 3000 // 3 seconds
  
  return new Promise((resolve) => {
    const poll = async () => {
      const status = await getRenderStatus(renderId)
      
      if (!status) {
        resolve(null)
        return
      }
      
      // Call progress callback if provided
      if (onProgress) {
        onProgress(status)
      }
      
      // Check if render is complete
      if (status.status === 'done' || status.status === 'failed') {
        resolve(status)
        return
      }
      
      // Check if we've exceeded max wait time
      if (Date.now() - startTime > maxWaitTime) {
        console.warn('⏰ Render polling timed out')
        resolve(status)
        return
      }
      
      // Continue polling
      setTimeout(poll, pollInterval)
    }
    
    poll()
  })
}

// Batch render multiple variations
export async function submitBatchRender(
  baseComposition: VideoComposition,
  variations: Array<{
    hookText?: string
    musicAsset?: any
    name?: string
  }>
): Promise<Array<{ name: string; renderId?: string; error?: string }>> {
  console.log(`🎬 Submitting batch render: ${variations.length} variations`)
  
  const results = await Promise.allSettled(
    variations.map(async (variation, index) => {
      const composition: VideoComposition = {
        ...baseComposition,
        hookText: {
          ...baseComposition.hookText,
          text: variation.hookText || baseComposition.hookText.text
        },
        backgroundMusic: variation.musicAsset ? {
          asset: variation.musicAsset,
          settings: baseComposition.backgroundMusic?.settings || {
            volume: 40, // Lower default to not overpower AI voiceover
            startTime: 0
          }
        } : baseComposition.backgroundMusic,
        updatedAt: new Date()
      }
      
      const result = await submitRender(composition)
      
      if (result.success && result.response) {
        return {
          name: variation.name || `Variation ${index + 1}`,
          renderId: result.response.id
        }
      } else {
        throw new Error(result.message)
      }
    })
  )
  
  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        name: variations[index].name || `Variation ${index + 1}`,
        error: result.reason?.message || 'Unknown error'
      }
    }
  })
}

// Export service configuration for environment variables
export function updateShotstackConfig(config: Partial<ShotstackConfig>) {
  Object.assign(shotstackConfig, config)
}

// Get current configuration (without exposing API key)
export function getShotstackConfig() {
  return {
    ownerId: shotstackConfig.ownerId,
    environment: shotstackConfig.environment,
    hasApiKey: !!shotstackConfig.apiKey
  }
}
