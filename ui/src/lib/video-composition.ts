import { Asset } from './assets'

// Video composition interfaces
export interface TextOverlaySettings {
  text: string
  position: 'top' | 'middle' | 'bottom' | 'custom'
  fontSize: 'S' | 'M' | 'L' | 'XL'
  duration: number // seconds
  customPosition?: {
    x: number // percentage from left
    y: number // percentage from top
  }
  style?: {
    fontFamily?: string
    color?: string
    backgroundColor?: string
    outline?: boolean
  }
}

export interface AudioSettings {
  volume: number // 0-100
  startTime: number // seconds
  fadeIn?: number // seconds
  fadeOut?: number // seconds
}

export interface VideoComposition {
  // Project info
  projectId: string
  projectName: string
  
  // Hook elements
  hookVideo?: Asset
  hookText: TextOverlaySettings
  
  // Demo sequence
  demoClips: Array<{
    asset: Asset
    startTime: number
    duration: number
    order: number
  }>
  demoScript?: TextOverlaySettings
  
  // Audio
  backgroundMusic?: {
    asset: Asset
    settings: AudioSettings
  }
  
  // Export settings
  exportSettings: {
    resolution: '1080x1920' | '720x1280' // 9:16 aspect ratios
    framerate: 30 | 60
    quality: 'high' | 'medium' | 'low'
    format: 'mp4' | 'mov'
  }
  
  // Metadata
  createdAt: Date
  updatedAt: Date
}

// Shotstack specific interfaces
export interface ShotstackClip {
  asset: {
    type: 'video' | 'audio' | 'title' | 'image' | 'caption' | 'html' | 'shape' | 'luma' | 'text-to-speech' | 'text-to-image' | 'image-to-video' | 'rich-text' | 'text'
    src?: string
    text?: string
    style?: string
    html?: string // HTML content for html assets
    css?: string // CSS styling for html assets
    font?: {
      family?: string
      size?: number
      color?: string
      lineHeight?: number
      weight?: number
    }
    width?: number
    height?: number
    alignment?: {
      horizontal?: string
      vertical?: string
    }
    background?: {
      color?: string
      padding?: number
      borderRadius?: number
      opacity?: number
    }
    stroke?: {
      color?: string
      width?: number
    }
    volume?: number // Volume is a property of the asset (for audio assets)
    trim?: number // Trim video/audio to specific duration (for video/audio assets)
  }
  start: number
  length: number
  position?: 'top' | 'topRight' | 'right' | 'bottomRight' | 'bottom' | 'bottomLeft' | 'left' | 'topLeft' | 'center'
  offset?: {
    x?: number
    y?: number
  }
  effect?: 'none' | 'zoomIn' | 'zoomInSlow' | 'zoomInFast' | 'zoomOut' | 'zoomOutSlow' | 'zoomOutFast' | 
           'slideLeft' | 'slideLeftSlow' | 'slideLeftFast' | 'slideRight' | 'slideRightSlow' | 'slideRightFast' |
           'slideUp' | 'slideUpSlow' | 'slideUpFast' | 'slideDown' | 'slideDownSlow' | 'slideDownFast'
  transition?: {
    in?: 'fade' | 'wipeLeft' | 'wipeRight' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown'
    out?: 'fade' | 'wipeLeft' | 'wipeRight' | 'slideLeft' | 'slideRight' | 'slideUp' | 'slideDown'
  }
}

export interface ShotstackTrack {
  clips: ShotstackClip[]
}

export interface ShotstackTimeline {
  background?: string
  tracks: ShotstackTrack[]
}

export interface ShotstackRenderRequest {
  timeline: ShotstackTimeline
  output: {
    format: 'mp4' | 'mov'
    resolution?: 'hd' | 'sd' // Optional - conflicts with size
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5'
    size?: {
      width: number
      height: number
    }
  }
}

// Minimum duration requirements for professional TikTok videos
export const MINIMUM_DURATIONS = {
  HOOK_VIDEO: 5,    // Hook clips should be at least 5 seconds
  DEMO_CLIP: 10,    // Demo clips should be at least 10 seconds
  TOTAL_VIDEO: 15   // Minimum total video length
}

// Helper functions
export function getVideoDurationFromClips(clips: VideoComposition['demoClips']): number {
  if (clips.length === 0) return 0
  const lastClip = clips[clips.length - 1]
  return lastClip.startTime + lastClip.duration
}

export function getTotalCompositionDuration(composition: VideoComposition): number {
  const hookDuration = composition.hookVideo?.duration || 0
  const demoDuration = getVideoDurationFromClips(composition.demoClips)
  return Math.max(hookDuration, demoDuration, composition.hookText.duration)
}

// Calculate optimal durations with minimum requirements
export function calculateOptimalDurations(composition: VideoComposition): {
  hookDuration: number
  demoDurations: number[]
  totalDuration: number
} {
  const hookDuration = composition.hookVideo ? 
    Math.max(MINIMUM_DURATIONS.HOOK_VIDEO, composition.hookVideo.duration || MINIMUM_DURATIONS.HOOK_VIDEO) :
    0

  const demoDurations = composition.demoClips.map(clip => 
    Math.max(MINIMUM_DURATIONS.DEMO_CLIP, clip.asset.duration || MINIMUM_DURATIONS.DEMO_CLIP)
  )

  const totalDuration = hookDuration + demoDurations.reduce((sum, duration) => sum + duration, 0)

  return {
    hookDuration,
    demoDurations,
    totalDuration: Math.max(totalDuration, MINIMUM_DURATIONS.TOTAL_VIDEO)
  }
}

// Convert font size to pixels
export function getFontSizeInPixels(size: TextOverlaySettings['fontSize']): number {
  const sizeMap = {
    'S': 36,
    'M': 48,
    'L': 64,
    'XL': 84
  }
  return sizeMap[size]
}

// Convert text settings to Shotstack text asset configuration
export function getShotstackTextStyle(settings: TextOverlaySettings): { 
  font: {
    family: string;
    size: number;
    color: string;
    weight?: number;
  };
  width?: number;
  height?: number;
  alignment: { horizontal: string; vertical: string };
  background?: {
    color: string;
    padding: number;
    borderRadius: number;
    opacity: number;
  };
} {
  // Map font sizes to pixel values optimized for mobile video (per Shotstack docs)
  const fontSizeMap = {
    'S': 36,   // Small, readable on mobile
    'M': 48,   // Medium, good balance
    'L': 64,   // Large, attention-grabbing
    'XL': 80   // Extra large, maximum impact
  }
  
  // Map positions to alignment values (following Shotstack docs)
  const positionToAlignmentMap = {
    'top': { horizontal: 'center', vertical: 'top' },
    'middle': { horizontal: 'center', vertical: 'center' },
    'bottom': { horizontal: 'center', vertical: 'bottom' },
    'custom': { horizontal: 'center', vertical: 'center' }
  }
  
  const fontSize = fontSizeMap[settings.fontSize] || 48
  const alignment = positionToAlignmentMap[settings.position] || positionToAlignmentMap['top']
  
  return {
    font: {
      family: settings.style?.fontFamily || 'Clear Sans', // Use Clear Sans (available by default)
      size: fontSize,
      color: settings.style?.color || '#FFFFFF',          // White text for good visibility
      weight: 700  // Bold weight for better visibility
    },
    // Use default container size (full viewport) unless custom dimensions needed
    width: 800,   // Reasonable width for mobile video
    height: 200,  // Reasonable height for text
    alignment: alignment,
    // Add background for better text visibility
    background: {
      color: settings.style?.backgroundColor || '#000000', // Black background
      padding: 10,
      borderRadius: 8,
      opacity: 0.7  // Semi-transparent background
    }
  }
}

// Create default video composition
export function createDefaultComposition(projectId: string, projectName: string): VideoComposition {
  return {
    projectId,
    projectName,
    hookText: {
      text: '',
      position: 'top',
      fontSize: 'L',
      duration: 5
    },
    demoClips: [],
    exportSettings: {
      resolution: '1080x1920',
      framerate: 30,
      quality: 'medium',
      format: 'mp4'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
}

// Validation functions
export function validateComposition(composition: VideoComposition): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!composition.hookText.text.trim()) {
    errors.push('Hook text is required')
  }
  
  if (!composition.hookVideo && composition.demoClips.length === 0) {
    errors.push('At least one video (hook or demo clip) is required')
  }
  
  if (composition.demoClips.length > 0) {
    const hasInvalidClips = composition.demoClips.some(clip => 
      !clip.asset || clip.duration <= 0 || clip.startTime < 0
    )
    if (hasInvalidClips) {
      errors.push('All demo clips must have valid assets and timing')
    }
    
    // Require demo script when demo clips are present
    if (!composition.demoScript?.text?.trim()) {
      errors.push('Demo script is required when demo clips are added')
    }
  }
  
  const totalDuration = getTotalCompositionDuration(composition)
  if (totalDuration > 60) {
    errors.push('Video duration cannot exceed 60 seconds')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
