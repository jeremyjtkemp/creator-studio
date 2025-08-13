import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useVideoComposition } from '@/lib/video-composition-context'
import { useAssets } from '@/lib/assets-context'
import { MINIMUM_DURATIONS, calculateOptimalDurations } from '@/lib/video-composition'
import { submitRender, pollRenderStatus, submitBatchRender, RenderStatus } from '@/lib/shotstack-service'
import { 
  Download, 
  Copy, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Play,
  Settings,
  Clock,
  FileVideo,
  Music,
  Type
} from 'lucide-react'

interface VideoExportProps {
  onProgressUpdate?: (progress: number) => void
}

export function VideoExport({ onProgressUpdate }: VideoExportProps = {}) {
  const { composition, isReadyForExport, getCompositionSummary, validateCurrentComposition, updateHookText } = useVideoComposition()
  const { getAssetsByType } = useAssets()
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle')
  const [renderProgress, setRenderProgress] = useState<number>(0)
  const [renderStatus, setRenderStatus] = useState<string>('')
  const [exportedVideoUrl, setExportedVideoUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [videoName, setVideoName] = useState('')
  const [isBatchExport, setIsBatchExport] = useState(false)
  const [batchResults, setBatchResults] = useState<Array<{ name: string; url?: string; error?: string }>>([])

  // Initialize video name when composition changes
  React.useEffect(() => {
    if (composition && !videoName) {
      const date = new Date().toISOString().split('T')[0]
      setVideoName(`${composition.projectName}_video_${date}`)
    }
  }, [composition, videoName])

  const summary = getCompositionSummary()
  const validation = validateCurrentComposition()
  const canExport = isReadyForExport()

  const handleSingleExport = async () => {
    if (!composition) return

    setExportStatus('exporting')
    setError(null)
    setRenderProgress(0)
    onProgressUpdate?.(0)
    setRenderStatus('Submitting render...')

    try {
      console.log('🎬 Starting single video export...')
      
      // Submit render to Shotstack
      const renderResult = await submitRender(composition)
      
      if (!renderResult.success || !renderResult.response) {
        throw new Error(renderResult.message)
      }

      setRenderStatus('Rendering video...')
      
      // Poll for completion
      const finalStatus = await pollRenderStatus(
        renderResult.response.id,
        (status: RenderStatus) => {
          setRenderStatus(`Rendering... (${status.status})`)
          // Estimate progress based on status
          const progressMap = {
            'queued': 10,
            'fetching': 25,
            'rendering': 60,
            'saving': 90,
            'done': 100,
            'failed': 0
          }
          const newProgress = progressMap[status.status] || 0
          setRenderProgress(newProgress)
          onProgressUpdate?.(newProgress)
        }
      )

      if (finalStatus?.status === 'done' && finalStatus.url) {
        setExportedVideoUrl(finalStatus.url)
        setExportStatus('success')
        setRenderStatus('Export completed!')
        onProgressUpdate?.(100)
        console.log('✅ Video export completed:', finalStatus.url)
      } else if (finalStatus?.status === 'failed') {
        throw new Error(finalStatus.error || 'Render failed')
      } else {
        throw new Error('Render timed out or failed')
      }

    } catch (error: any) {
      console.error('❌ Export failed:', error)
      setError(error.message || 'Export failed')
      setExportStatus('error')
      setRenderStatus('Export failed')
    }
  }

  const handleBatchExport = async () => {
    if (!composition) return

    setIsBatchExport(true)
    setExportStatus('exporting')
    setError(null)
    setRenderProgress(0)
    setRenderStatus('Preparing batch export...')

    try {
      console.log('🎬 Starting batch video export...')
      
      // Get available music tracks for variations
      const musicTracks = getAssetsByType('music')
      
      // Create variations (up to 10)
      const variations = []
      const maxVariations = Math.min(10, musicTracks.length || 1)
      
      for (let i = 0; i < maxVariations; i++) {
        variations.push({
          name: `${videoName}_variation_${i + 1}`,
          musicAsset: musicTracks[i % musicTracks.length] || undefined
        })
      }

      setRenderStatus(`Submitting ${variations.length} render jobs...`)
      
      // Submit batch renders
      const batchResults = await submitBatchRender(composition, variations)
      
      setRenderStatus('Monitoring batch renders...')
      
      // Poll each render for completion
      const completedRenders = await Promise.allSettled(
        batchResults.map(async (result) => {
          if (result.renderId) {
            const finalStatus = await pollRenderStatus(result.renderId)
            return {
              name: result.name,
              url: finalStatus?.url,
              error: finalStatus?.status === 'failed' ? finalStatus.error : undefined
            }
          } else {
            return {
              name: result.name,
              error: result.error || 'Failed to submit render'
            }
          }
        })
      )

      const results = completedRenders.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            name: batchResults[index].name,
            error: 'Render failed'
          }
        }
      })

      setBatchResults(results)
      setExportStatus('success')
      setRenderStatus(`Batch export completed! ${results.filter(r => r.url).length}/${results.length} successful`)
      console.log('✅ Batch export completed:', results)

    } catch (error: any) {
      console.error('❌ Batch export failed:', error)
      setError(error.message || 'Batch export failed')
      setExportStatus('error')
      setRenderStatus('Batch export failed')
    } finally {
      setIsBatchExport(false)
    }
  }

  const resetExport = () => {
    setExportStatus('idle')
    setRenderProgress(0)
    setRenderStatus('')
    setExportedVideoUrl(null)
    setError(null)
    setBatchResults([])
    setIsBatchExport(false)
  }

  if (!composition) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileVideo className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No video composition available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Video</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Composition Summary */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <h3 className="font-medium text-sm">Video Composition Summary</h3>
          
          {composition && (() => {
            const optimalDurations = calculateOptimalDurations(composition)
            return (
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Total: {optimalDurations.totalDuration}s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileVideo className="w-4 h-4 text-muted-foreground" />
                    <span>Demo clips: {summary.demoClipsCount}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Type className="w-4 h-4 text-muted-foreground" />
                    <span>Hook text: {summary.hasHookText ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Music className="w-4 h-4 text-muted-foreground" />
                    <span>Music: {summary.hasMusic ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {/* Duration Breakdown */}
                <div className="space-y-2">
                  {summary.hasHookVideo && (
                    <div className="flex items-center justify-between text-xs">
                      <span>Hook video:</span>
                      <div className="flex items-center space-x-2">
                        <span>{optimalDurations.hookDuration}s</span>
                        <Badge variant="outline" className="text-xs">
                          Min: {MINIMUM_DURATIONS.HOOK_VIDEO}s
                        </Badge>
                      </div>
                    </div>
                  )}
                  
                  {optimalDurations.demoDurations.map((duration, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span>Demo clip {index + 1}:</span>
                      <div className="flex items-center space-x-2">
                        <span>{duration}s</span>
                        <Badge variant="outline" className="text-xs">
                          Min: {MINIMUM_DURATIONS.DEMO_CLIP}s
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1">
                  {summary.hasHookVideo && (
                    <Badge variant="secondary" className="text-xs">
                      Hook video included
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    Professional timing enforced
                  </Badge>
                </div>
              </>
            )
          })()}
        </div>

        {/* Validation Errors */}
        {!validation.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Cannot export video:</p>
                <ul className="list-disc pl-4 space-y-1">
                  {validation.errors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Text Customization */}
        {canExport && exportStatus === 'idle' && composition?.hookText?.text && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="w-5 h-5" />
                <h3 className="font-medium">Text Display Settings</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Text Size</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {([
                      { size: 'S', label: 'S - Small', description: '36px - Mobile friendly' },
                      { size: 'M', label: 'M - Medium', description: '48px - Balanced size' },
                      { size: 'L', label: 'L - Large', description: '64px - Attention grabbing' },
                      { size: 'XL', label: 'XL - Extra Large', description: '80px - Maximum impact' }
                    ] as const).map(({ size, label, description }) => (
                      <Button 
                        key={size} 
                        variant={composition?.hookText.fontSize === size ? "default" : "outline"} 
                        size="sm" 
                        className="text-xs h-8"
                        onClick={() => updateHookText({ fontSize: size })}
                        title={`Font size: ${description}`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {(['top', 'middle', 'bottom', 'custom'] as const).map((pos) => (
                      <Button 
                        key={pos} 
                        variant={composition?.hookText.position === pos ? "default" : "outline"} 
                        size="sm"
                        onClick={() => updateHookText({ position: pos })}
                      >
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input 
                      type="range" 
                      min="3" 
                      max="10" 
                      value={composition?.hookText.duration || 5}
                      onChange={(e) => updateHookText({ duration: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {composition?.hookText.duration || 5}s
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Export Settings */}
        {canExport && exportStatus === 'idle' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="video-name">Video Name</Label>
              <Input
                id="video-name"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
                placeholder="Enter video name"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                onClick={handleSingleExport}
                disabled={!canExport || exportStatus === 'exporting'}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Single Video
              </Button>
              
              <Button 
                onClick={handleBatchExport}
                disabled={!canExport || exportStatus === 'exporting'}
                variant="outline"
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Batch Export (10 variations)
              </Button>
            </div>
          </div>
        )}

        {/* Export Progress */}
        {exportStatus === 'exporting' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  {isBatchExport ? 'Batch Export Progress' : 'Export Progress'}
                </span>
                <span className="text-sm text-muted-foreground">{renderProgress}%</span>
              </div>
              <Progress value={renderProgress} className="h-2" />
              <p className="text-sm text-muted-foreground mt-2">{renderStatus}</p>
            </div>
            
            <Button 
              onClick={resetExport} 
              variant="outline" 
              size="sm"
              disabled={renderProgress === 0}
            >
              Cancel
            </Button>
          </div>
        )}

        {/* Export Success */}
        {exportStatus === 'success' && (
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                {isBatchExport ? 'Batch export completed!' : 'Video export completed!'}
              </AlertDescription>
            </Alert>

            {/* Single Export Result */}
            {exportedVideoUrl && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{videoName}</p>
                    <p className="text-sm text-muted-foreground">Ready for download</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => window.open(exportedVideoUrl, '_blank')}
                      size="sm"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button 
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = exportedVideoUrl
                        link.download = `${videoName}.mp4`
                        link.click()
                      }}
                      size="sm"
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Batch Export Results */}
            {batchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Batch Export Results</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {batchResults.map((result, index) => (
                    <div key={index} className="p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{result.name}</p>
                          {result.error ? (
                            <p className="text-sm text-destructive">{result.error}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">Ready for download</p>
                          )}
                        </div>
                        {result.url && (
                          <div className="flex space-x-1">
                            <Button 
                              onClick={() => window.open(result.url!, '_blank')}
                              size="sm"
                              variant="outline"
                            >
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button 
                              onClick={() => {
                                const link = document.createElement('a')
                                link.href = result.url!
                                link.download = `${result.name}.mp4`
                                link.click()
                              }}
                              size="sm"
                              variant="outline"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={resetExport} variant="outline" className="w-full">
              Export Another Video
            </Button>
          </div>
        )}

        {/* Export Error */}
        {exportStatus === 'error' && error && (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Export failed:</p>
                  <p className="text-sm">{error}</p>
                </div>
              </AlertDescription>
            </Alert>
            
            <Button onClick={resetExport} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
