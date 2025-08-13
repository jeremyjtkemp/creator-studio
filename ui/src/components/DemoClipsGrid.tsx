import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAssets } from '@/lib/assets-context'
import { formatDuration } from '@/lib/assets'
import { formatFirebaseDate } from '@/lib/utils'
import { 
  Play, 
  Eye, 
  MoreVertical, 
  Trash2, 
  Download,
  FileVideo,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DemoClipsGridProps {
  onClipSelect?: (clipId: string) => void
  selectedClips?: string[]
}

export function DemoClipsGrid({ onClipSelect, selectedClips = [] }: DemoClipsGridProps) {
  const { getAssetsByType, deleteAssetById } = useAssets()
  const [deletingClip, setDeletingClip] = useState<string | null>(null)

  // Get demo video assets
  const demoClips = getAssetsByType('demo-video')

  const handleDelete = async (clipId: string, clipName: string) => {
    if (!confirm(`Are you sure you want to delete "${clipName}"?`)) {
      return
    }
    
    setDeletingClip(clipId)
    try {
      await deleteAssetById(clipId)
    } catch (error) {
      console.error('Failed to delete demo clip:', error)
      alert('Failed to delete demo clip. Please try again.')
    } finally {
      setDeletingClip(null)
    }
  }

  const handleClipSelect = (clipId: string) => {
    if (onClipSelect) {
      onClipSelect(clipId)
    }
  }

  if (demoClips.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileVideo className="w-12 h-12 mx-auto mb-4" />
        <p className="mb-2">No demo clips uploaded yet</p>
        <p className="text-xs">Upload demo clips to see them here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Demo Clips ({demoClips.length})</h3>
        <Badge variant="outline" className="text-xs">
          {demoClips.reduce((total, clip) => total + (clip.duration || 0), 0).toFixed(1)}s total
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
        {demoClips.map((clip) => {
          const isSelected = selectedClips.includes(clip.id)
          const isDeleting = deletingClip === clip.id
          
          return (
            <div
              key={clip.id}
              className={`group relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:shadow-md hover:border-primary/50'
              } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={() => handleClipSelect(clip.id)}
            >
              {/* Thumbnail */}
              <div className="aspect-video bg-black relative">
                {clip.thumbnailUrl ? (
                  <img 
                    src={clip.thumbnailUrl} 
                    alt={clip.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileVideo className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(clip.downloadUrl, '_blank')
                    }}
                  >
                    <Play className="w-5 h-5" />
                  </Button>
                </div>

                {/* Duration badge */}
                {clip.duration && (
                  <div className="absolute bottom-1 left-1">
                    <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                      {formatDuration(clip.duration)}
                    </Badge>
                  </div>
                )}

                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute top-1 left-1">
                    <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  </div>
                )}

                {/* Actions menu */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        window.open(clip.downloadUrl, '_blank')
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        const link = document.createElement('a')
                        link.href = clip.downloadUrl
                        link.download = clip.fileName
                        link.click()
                      }}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(clip.id, clip.name)
                        }}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Clip info */}
              <div className="p-2">
                <h4 className="text-sm font-medium truncate">{clip.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {formatFirebaseDate(clip.createdAt)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
