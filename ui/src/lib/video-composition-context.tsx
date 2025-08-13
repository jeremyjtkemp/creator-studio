import React, { createContext, useContext, useState, useCallback } from 'react'
import { VideoComposition, createDefaultComposition, validateComposition, TextOverlaySettings, AudioSettings } from './video-composition'
import { Asset } from './assets'
import { useProjects } from './project-context'

type VideoCompositionContextType = {
  // Current composition
  composition: VideoComposition | null
  
  // State management
  initializeComposition: (projectId: string, projectName: string) => void
  updateHookVideo: (asset: Asset | undefined) => void
  updateHookText: (settings: Partial<TextOverlaySettings>) => void
  updateDemoClips: (clips: Array<{ asset: Asset; startTime: number; duration: number; order: number }>) => void
  updateDemoScript: (script: string) => void
  updateBackgroundMusic: (asset: Asset | undefined, settings?: AudioSettings) => void
  updateExportSettings: (settings: Partial<VideoComposition['exportSettings']>) => void
  
  // Validation
  validateCurrentComposition: () => { isValid: boolean; errors: string[] }
  
  // Export readiness
  isReadyForExport: () => boolean
  getCompositionSummary: () => {
    totalDuration: number
    hasHookVideo: boolean
    hasHookText: boolean
    demoClipsCount: number
    hasMusic: boolean
  }
  
  // Reset
  resetComposition: () => void
}

const VideoCompositionContext = createContext<VideoCompositionContextType | undefined>(undefined)

export function VideoCompositionProvider({ children }: { children: React.ReactNode }) {
  const { currentProject } = useProjects()
  const [composition, setComposition] = useState<VideoComposition | null>(null)

  const initializeComposition = useCallback((projectId: string, projectName: string) => {
    const newComposition = createDefaultComposition(projectId, projectName)
    setComposition(newComposition)
    console.log('🎬 Initialized video composition for project:', projectName)
  }, [])

  const updateHookVideo = useCallback((asset: Asset | undefined) => {
    setComposition(prev => {
      if (!prev) return prev
      return {
        ...prev,
        hookVideo: asset,
        updatedAt: new Date()
      }
    })
  }, [])

  const updateHookText = useCallback((settings: Partial<TextOverlaySettings>) => {
    setComposition(prev => {
      if (!prev) return prev
      return {
        ...prev,
        hookText: {
          ...prev.hookText,
          ...settings
        },
        updatedAt: new Date()
      }
    })
  }, [])

  const updateDemoClips = useCallback((clips: Array<{ asset: Asset; startTime: number; duration: number; order: number }>) => {
    setComposition(prev => {
      if (!prev) return prev
      return {
        ...prev,
        demoClips: clips,
        updatedAt: new Date()
      }
    })
  }, [])

  const updateDemoScript = useCallback((script: string) => {
    setComposition(prev => {
      if (!prev) return prev
      return {
        ...prev,
        demoScript: {
          text: script,
          position: 'bottom',
          fontSize: 'M',
          duration: 5, // Default duration, will be calculated based on demo clips
          style: {
            fontFamily: 'Montserrat ExtraBold',
            color: '#FFFFFF',
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        },
        updatedAt: new Date()
      }
    })
  }, [])

  const updateBackgroundMusic = useCallback((asset: Asset | undefined, settings?: AudioSettings) => {
    setComposition(prev => {
      if (!prev) return prev
      
      if (!asset) {
        return {
          ...prev,
          backgroundMusic: undefined,
          updatedAt: new Date()
        }
      }
      
      const defaultSettings: AudioSettings = {
        volume: 40, // Lower default to not overpower AI voiceover
        startTime: 0,
        fadeIn: 1,
        fadeOut: 1
      }
      
      return {
        ...prev,
        backgroundMusic: {
          asset,
          settings: settings || prev.backgroundMusic?.settings || defaultSettings
        },
        updatedAt: new Date()
      }
    })
  }, [])

  const updateExportSettings = useCallback((settings: Partial<VideoComposition['exportSettings']>) => {
    setComposition(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exportSettings: {
          ...prev.exportSettings,
          ...settings
        },
        updatedAt: new Date()
      }
    })
  }, [])

  const validateCurrentComposition = useCallback(() => {
    if (!composition) {
      return { isValid: false, errors: ['No composition initialized'] }
    }
    return validateComposition(composition)
  }, [composition])

  const isReadyForExport = useCallback(() => {
    const validation = validateCurrentComposition()
    return validation.isValid
  }, [validateCurrentComposition])

  const getCompositionSummary = useCallback(() => {
    if (!composition) {
      return {
        totalDuration: 0,
        hasHookVideo: false,
        hasHookText: false,
        demoClipsCount: 0,
        hasMusic: false
      }
    }

    const hookDuration = composition.hookVideo?.duration || 0
    const demoDuration = composition.demoClips.reduce((total, clip) => Math.max(total, clip.startTime + clip.duration), 0)
    const textDuration = composition.hookText.duration || 0
    
    return {
      totalDuration: Math.max(hookDuration, demoDuration, textDuration),
      hasHookVideo: !!composition.hookVideo,
      hasHookText: !!composition.hookText.text.trim(),
      demoClipsCount: composition.demoClips.length,
      hasMusic: !!composition.backgroundMusic
    }
  }, [composition])

  const resetComposition = useCallback(() => {
    if (currentProject) {
      initializeComposition(currentProject.id, currentProject.name)
    } else {
      setComposition(null)
    }
  }, [currentProject, initializeComposition])

  // Auto-initialize composition when project changes
  React.useEffect(() => {
    if (currentProject && (!composition || composition.projectId !== currentProject.id)) {
      initializeComposition(currentProject.id, currentProject.name)
    }
  }, [currentProject, composition, initializeComposition])

  return (
    <VideoCompositionContext.Provider
      value={{
        composition,
        initializeComposition,
        updateHookVideo,
        updateHookText,
        updateDemoClips,
        updateDemoScript,
        updateBackgroundMusic,
        updateExportSettings,
        validateCurrentComposition,
        isReadyForExport,
        getCompositionSummary,
        resetComposition
      }}
    >
      {children}
    </VideoCompositionContext.Provider>
  )
}

export const useVideoComposition = () => {
  const context = useContext(VideoCompositionContext)
  if (context === undefined) {
    throw new Error('useVideoComposition must be used within a VideoCompositionProvider')
  }
  return context
}
