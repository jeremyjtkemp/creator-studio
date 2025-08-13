import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useProjects } from '@/lib/project-context'
import { useAssets } from '@/lib/assets-context'
import { useVideoComposition } from '@/lib/video-composition-context'
import { formatDuration } from '@/lib/assets'
import { HookVisualUpload } from '@/components/HookVisualUpload'
import { HookVisualGrid } from '@/components/HookVisualGrid'
import { HookTextGenerator } from '@/components/HookTextGenerator'
import { DemoClipsUpload } from '@/components/DemoClipsUpload'
import { DemoClipsGrid } from '@/components/DemoClipsGrid'
import { DemoTimeline } from '@/components/DemoTimeline'
import { DemoScriptGenerator } from '@/components/DemoScriptGenerator'
import { VideoExport } from '@/components/VideoExport'
import { 
  Plus, 
  Sparkles, 
  Image, 
  Music, 
  Download,
  Folder,
  Upload,
  Wand2,
  Play,
  Type,
  Settings
} from 'lucide-react'

const steps = [
  { id: 'hook', label: 'Hook', icon: Wand2 },
  { id: 'demo', label: 'Demo', icon: Image },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'export', label: 'Export', icon: Download },
]

export function VideoCreator() {
  const { projects, currentProject, setCreateProjectModalOpen } = useProjects()
  const { assets, getAssetsByType } = useAssets()
  const { 
    composition, 
    updateHookText, 
    updateDemoClips, 
    updateBackgroundMusic,
    getCompositionSummary 
  } = useVideoComposition()
  const [currentStep, setCurrentStep] = useState('hook')
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null)
  const [selectedDemoClips, setSelectedDemoClips] = useState<string[]>([])
  const [exportProgress, setExportProgress] = useState(0)

  // Get music assets (includes global music)
  const musicAssets = getAssetsByType('music')
  
  // Get demo video assets
  const demoClips = getAssetsByType('demo-video')
  
  // Get hook visual assets
  const hookVisuals = getAssetsByType('hook-visual')

  // Handle demo clip selection
  const handleDemoClipSelect = (clipId: string) => {
    if (selectedDemoClips.includes(clipId)) {
      // Remove if already selected
      setSelectedDemoClips(prev => prev.filter(id => id !== clipId))
    } else {
      // Add to selection
      setSelectedDemoClips(prev => [...prev, clipId])
    }
  }

  // Handle clip removal from timeline
  const handleClipRemove = (clipId: string) => {
    setSelectedDemoClips(prev => prev.filter(id => id !== clipId))
  }

  // Handle music selection
  const handleMusicSelect = (musicId: string) => {
    setSelectedMusic(musicId)
    const selectedMusicAsset = musicAssets.find(asset => asset.id === musicId)
    if (selectedMusicAsset) {
      updateBackgroundMusic(selectedMusicAsset, {
        volume: 40, // Lower default volume to not overpower voiceover
        startTime: 0,
        fadeIn: 1,
        fadeOut: 1
      })
    }
  }

  // Handle music volume change
  const handleVolumeChange = (volume: number) => {
    if (composition?.backgroundMusic) {
      updateBackgroundMusic(composition.backgroundMusic.asset, {
        ...composition.backgroundMusic.settings,
        volume
      })
    }
  }

  // Calculate dynamic progress based on current step and completion
  const calculateProgress = () => {
    const baseProgress = {
      'hook': 25,
      'demo': 50,
      'music': 75,
      'export': 95
    }
    
    let currentProgress = baseProgress[currentStep as keyof typeof baseProgress] || 25
    
    // Add export progress if on export step
    if (currentStep === 'export' && exportProgress > 0) {
      currentProgress = 95 + (exportProgress * 0.05) // 95% + up to 5% for export completion
    }
    
    return Math.min(100, currentProgress)
  }

  const progress = calculateProgress()

  // Reset export progress when switching away from export tab
  React.useEffect(() => {
    if (currentStep !== 'export') {
      setExportProgress(0)
    }
  }, [currentStep])

  // Update video composition when demo clips change
  React.useEffect(() => {
    const clips = selectedDemoClips.map((clipId, index) => {
      const asset = demoClips.find(clip => clip.id === clipId)
      if (!asset) return null
      
      const startTime = index * (asset.duration || 5) // Sequential timing
      return {
        asset,
        startTime,
        duration: asset.duration || 5,
        order: index
      }
    }).filter(Boolean) as any[]
    
    updateDemoClips(clips)
  }, [selectedDemoClips, demoClips, updateDemoClips])

  // Get composition summary for progress calculation
  const compositionSummary = getCompositionSummary()

  // Show welcome screen if no projects exist
  if (projects.length === 0) {
    return <WelcomeScreen setCreateProjectModalOpen={setCreateProjectModalOpen} />
  }

  // Show project selection prompt if projects exist but none selected
  if (!currentProject) {
    return <SelectProjectScreen />
  }

  // Show main video creator interface
  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-6">
          <div>
            <h1 className="text-2xl font-semibold">Video Creator</h1>
            <p className="text-muted-foreground">Create viral TikTok-style videos for {currentProject.name}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    currentStep === step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <step.icon className="w-4 h-4" />
                  <span className="font-medium">{step.label}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-border mx-2" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 p-6">
          <Tabs value={currentStep} onValueChange={setCurrentStep} className="h-full">
            <TabsContent value="hook" className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Hook Visuals - Left Column */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Image className="w-5 h-5" />
                        <span>Hook Visuals</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {hookVisuals.length} clips
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Upload Section */}
                    <HookVisualUpload />
                    
                    {/* Visuals Grid */}
                    <div className="flex-1">
                      <HookVisualGrid />
                    </div>
                    
                    {/* Selected Visual Summary */}
                    {composition?.hookVideo && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Selected Hook Visual</h4>
                        <div className="flex items-center justify-between text-sm">
                          <span>{hookVisuals.find(h => h.id === composition.hookVideo?.id)?.name || 'Unknown clip'}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateHookVideo(null)}
                            className="h-6 w-6 p-0"
                          >
                            ×
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Hook Text Generator - Right Column */}
                <HookTextGenerator />
              </div>
            </TabsContent>

            <TabsContent value="demo" className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full">
                {/* Demo Clips - Left Column */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Demo Clips</span>
                      <Badge variant="outline" className="text-xs">
                        {demoClips.length} clips
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Upload Section */}
                    <DemoClipsUpload />
                    
                    {/* Clips Grid */}
                    <div className="flex-1">
                      <DemoClipsGrid 
                        onClipSelect={handleDemoClipSelect}
                        selectedClips={selectedDemoClips}
                      />
                    </div>
                    
                    {/* Selected Clips Summary */}
                    {selectedDemoClips.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Selected Clips ({selectedDemoClips.length})</h4>
                        <div className="space-y-2">
                          {selectedDemoClips.map((clipId, index) => {
                            const clip = demoClips.find(c => c.id === clipId)
                            return clip ? (
                              <div key={clipId} className="flex items-center justify-between text-sm">
                                <span>{index + 1}. {clip.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleClipRemove(clipId)}
                                  className="h-6 w-6 p-0"
                                >
                                  ×
                                </Button>
                              </div>
                            ) : null
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Demo Scripts - Right Column */}
                <DemoScriptGenerator />
              </div>
            </TabsContent>

            <TabsContent value="music" className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Music Library</span>
                      <Badge variant="outline" className="text-xs">
                        {musicAssets.length} tracks
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {musicAssets.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Music className="w-12 h-12 mx-auto mb-4" />
                        <p className="mb-2">No music in your library</p>
                        <p className="text-xs">Go to Asset Library to upload music</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {musicAssets.map((track) => (
                          <div 
                            key={track.id} 
                            className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-secondary ${
                              selectedMusic === track.id ? 'ring-2 ring-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handleMusicSelect(track.id)}
                          >
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                // TODO: Implement audio preview
                                window.open(track.downloadUrl, '_blank')
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-medium truncate">{track.name}</p>
                                {track.projectId === null && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-400">
                                    Global
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {track.metadata?.energy && (
                                  <Badge variant="outline" className="text-xs">
                                    {track.metadata.energy}
                                  </Badge>
                                )}
                                {track.metadata?.mood && (
                                  <Badge variant="secondary" className="text-xs">
                                    {track.metadata.mood}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {formatDuration(track.duration)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audio Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMusic ? (
                      (() => {
                        const selectedTrack = musicAssets.find(track => track.id === selectedMusic)
                        return selectedTrack ? (
                          <div className="space-y-4">
                            {/* Selected Track Info */}
                            <div className="p-3 bg-secondary/50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">{selectedTrack.name}</p>
                                <Badge variant="outline" className="text-xs">
                                  {formatDuration(selectedTrack.duration)}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-2">
                                {selectedTrack.metadata?.energy && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedTrack.metadata.energy}
                                  </Badge>
                                )}
                                {selectedTrack.metadata?.mood && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedTrack.metadata.mood}
                                  </Badge>
                                )}
                                {selectedTrack.metadata?.genre && (
                                  <Badge variant="secondary" className="text-xs">
                                    {selectedTrack.metadata.genre}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Audio Controls */}
                            <div>
                              <label className="text-sm font-medium">Volume</label>
                              <input 
                                type="range" 
                                className="w-full mt-2" 
                                min="0" 
                                max="100" 
                                value={composition?.backgroundMusic?.settings.volume || 40}
                                onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>0%</span>
                                <span>{composition?.backgroundMusic?.settings.volume || 40}%</span>
                                <span>100%</span>
                              </div>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Start Time</label>
                              <input 
                                type="text" 
                                placeholder="00:00" 
                                className="w-full mt-2 px-3 py-2 border rounded" 
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                When to start playing this music in the video
                              </p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Fade In/Out</label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                <input 
                                  type="number" 
                                  placeholder="Fade in (s)"
                                  className="px-3 py-2 border rounded text-sm"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                />
                                <input 
                                  type="number" 
                                  placeholder="Fade out (s)"
                                  className="px-3 py-2 border rounded text-sm"
                                  min="0"
                                  max="5"
                                  step="0.1"
                                />
                              </div>
                            </div>
                          </div>
                        ) : null
                      })()
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Music className="w-8 h-8 mx-auto mb-3" />
                        <p className="text-sm">Select a music track to configure audio settings</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="h-full">
              <VideoExport onProgressUpdate={setExportProgress} />
            </TabsContent>
          </Tabs>
        </div>
      </div>


    </div>
  )
}

// Welcome screen for when no projects exist
function WelcomeScreen({ setCreateProjectModalOpen }: { setCreateProjectModalOpen: (open: boolean) => void }) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Video Creator</h1>
            <p className="text-muted-foreground">Create viral TikTok-style videos for your apps</p>
          </div>
          <Button variant="outline" onClick={() => setCreateProjectModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project First
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <h2 className="text-3xl font-bold mb-4">Welcome to Creator Studio</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            Create viral TikTok-style videos at scale with AI-powered hooks, automated editing, and performance tracking.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                  <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">1. Create a Project</h3>
                <p className="text-sm text-muted-foreground">
                  Set up a project for each app you want to create content for. Each project has its own assets and videos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-semibold mb-2">2. Upload Assets</h3>
                <p className="text-sm text-muted-foreground">
                  Add hook videos, demo clips, and music to your asset library. Sync with Google Drive for easy management.
                </p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
                  <Wand2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-semibold mb-2">3. Create Videos</h3>
                <p className="text-sm text-muted-foreground">
                  Use AI to generate viral hooks, combine with your demo footage, and export multiple variations instantly.
                </p>
              </CardContent>
            </Card>
          </div>

          <Button 
            size="lg" 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            onClick={() => setCreateProjectModalOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Project
          </Button>
        </div>
      </div>
    </div>
  )
}

// Screen for when projects exist but none selected
function SelectProjectScreen() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Video Creator</h1>
            <p className="text-muted-foreground">Select a project from the sidebar to start creating videos</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
            <Folder className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Select a Project</h2>
          <p className="text-muted-foreground mb-6">
            Choose a project from the sidebar to start creating viral videos for that app.
          </p>
          
          <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">
              💡 Tip: Each project has its own assets, videos, and analytics to keep your content organized.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}