import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAssets } from '@/lib/assets-context'
import { useVideoComposition } from '@/lib/video-composition-context'
import { formatFirebaseDate } from '@/lib/utils'
import { 
  Play, 
  Trash2, 
  Download,
  MoreVertical,
  Clock,
  FileVideo,
  Check,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HookVisualGrid() {
  const { getAssetsByType, deleteAssetById, loadingAssets } = useAssets()
  const { composition, updateHookVideo } = useVideoComposition()
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Get hook videos from assets
  const hookVisuals = getAssetsByType('hook-visual')

  const handleDelete = async (hookVisualId: string, hookVisualName: string) => {
    if (!confirm(`Are you sure you want to delete "${hookVisualName}"?`)) {
      return
    }

    setDeletingId(hookVisualId)
    try {
      await deleteAssetById(hookVisualId)
    } catch (error) {
      console.error('Failed to delete hook visual:', error)
      alert('Failed to delete hook visual. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSelectHookVideo = (hookVisual: any) => {
    updateHookVideo(hookVisual)
    console.log('🎯 Selected hook video:', hookVisual.name)
  }

  const isSelected = (hookVisual: any) => {
    return composition?.hookVideo?.id === hookVisual.id
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return 'Unknown'
    if (seconds < 60) return `${Math.round(seconds)}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.round(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loadingAssets) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="aspect-[9/16]">
            <CardContent className="p-4 h-full flex items-center justify-center">
              <div className="animate-pulse bg-muted rounded-lg w-full h-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (hookVisuals.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileVideo className="w-12 h-12 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">No hook visuals yet</p>
        <p className="text-sm">Upload your first hook video to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Hook Videos ({hookVisuals.length})</h3>
        {composition?.hookVideo && (
          <Badge variant="secondary" className="text-xs">
            Selected: {composition.hookVideo.name}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {hookVisuals.map((hookVisual) => {
        const selected = isSelected(hookVisual)
        const isDeleting = deletingId === hookVisual.id
        
        return (
          <Card 
            key={hookVisual.id} 
            className={`aspect-[9/16] group relative overflow-hidden cursor-pointer transition-all ${
              selected ? 'ring-2 ring-primary bg-primary/5' : 'hover:shadow-md hover:border-primary/50'
            } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => handleSelectHookVideo(hookVisual)}
          >
            <CardContent className="p-0 h-full relative">
              {/* Deletion overlay */}
              {isDeleting && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Deleting...</p>
                  </div>
                </div>
              )}
              
              {/* Video thumbnail/preview */}
              <div className="w-full h-full bg-black relative">
                {hookVisual.thumbnailUrl ? (
                  <img 
                    src={hookVisual.thumbnailUrl} 
                    alt={hookVisual.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileVideo className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              
              {/* Selection indicator */}
              {selected && (
                <div className="absolute top-2 left-2">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}

              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(hookVisual.downloadUrl, '_blank')
                  }}
                >
                  <Play className="w-8 h-8" />
                </Button>
              </div>

              {/* Duration badge */}
              {hookVisual.duration && (
                <div className="absolute bottom-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatDuration(hookVisual.duration)}
                  </Badge>
                </div>
              )}

              {/* Actions menu */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(hookVisual.downloadUrl, '_blank')
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = hookVisual.downloadUrl
                        link.download = hookVisual.fileName
                        link.click()
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(hookVisual.id, hookVisual.name)
                      }}
                      disabled={deletingId === hookVisual.id}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {deletingId === hookVisual.id ? 'Deleting...' : 'Delete'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Video info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <h4 className="text-white text-sm font-medium truncate mb-1">
                {hookVisual.name}
              </h4>
              <div className="flex items-center justify-between text-xs text-white/80">
                <span>{formatFileSize(hookVisual.fileSize)}</span>
                <span>{formatFirebaseDate(hookVisual.createdAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        )
      })}
      </div>
    </div>
  )
}
