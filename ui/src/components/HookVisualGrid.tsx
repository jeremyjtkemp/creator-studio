import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useHookVisuals } from '@/lib/hook-visuals-context'
import { 
  Play, 
  Trash2, 
  Download,
  MoreVertical,
  Clock,
  FileVideo
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HookVisualGrid() {
  const { hookVisuals, loadingHookVisuals, deleteHookVisualById } = useHookVisuals()
  const [playingVideo, setPlayingVideo] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (hookVisualId: string) => {
    if (!confirm('Are you sure you want to delete this hook visual?')) {
      return
    }

    setDeletingId(hookVisualId)
    try {
      await deleteHookVisualById(hookVisualId)
    } catch (error) {
      console.error('Failed to delete hook visual:', error)
      alert('Failed to delete hook visual. Please try again.')
    } finally {
      setDeletingId(null)
    }
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

  if (loadingHookVisuals) {
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
    <div className="grid grid-cols-2 gap-3">
      {hookVisuals.map((hookVisual) => (
        <Card key={hookVisual.id} className="aspect-[9/16] group relative overflow-hidden">
          <CardContent className="p-0 h-full relative">
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
              
              {/* Play overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/20"
                  onClick={() => {
                    if (playingVideo === hookVisual.id) {
                      setPlayingVideo(null)
                    } else {
                      setPlayingVideo(hookVisual.id)
                      // In a real implementation, this would open a video player modal
                      window.open(hookVisual.videoUrl, '_blank')
                    }
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
                      onClick={() => window.open(hookVisual.videoUrl, '_blank')}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = hookVisual.videoUrl
                        link.download = hookVisual.fileName
                        link.click()
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(hookVisual.id)}
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
                <span>
                  {hookVisual.createdAt?.toDate ? 
                    hookVisual.createdAt.toDate().toLocaleDateString() : 
                    'Unknown date'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
