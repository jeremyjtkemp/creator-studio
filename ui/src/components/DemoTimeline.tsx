import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAssets } from '@/lib/assets-context'
import { formatDuration } from '@/lib/assets'
import { 
  GripVertical,
  Play,
  Trash2,
  FileVideo,
  Clock
} from 'lucide-react'

interface DemoTimelineProps {
  selectedClips: string[]
  onClipRemove?: (clipId: string) => void
  onClipReorder?: (fromIndex: number, toIndex: number) => void
}

export function DemoTimeline({ selectedClips, onClipRemove, onClipReorder }: DemoTimelineProps) {
  const { allAssets } = useAssets()

  // Get clip details from asset library
  const timelineClips = selectedClips
    .map(clipId => allAssets.find(asset => asset.id === clipId))
    .filter(Boolean) // Remove any undefined clips

  const totalDuration = timelineClips.reduce((total, clip) => total + (clip?.duration || 0), 0)

  if (selectedClips.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileVideo className="w-12 h-12 mx-auto mb-4" />
        <p className="mb-2">No clips in timeline</p>
        <p className="text-xs">Select demo clips to add them to the timeline</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Timeline header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium text-sm">Timeline</h3>
          <Badge variant="outline" className="text-xs">
            {timelineClips.length} clips
          </Badge>
        </div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(totalDuration)} total</span>
        </div>
      </div>

      {/* Timeline clips */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {timelineClips.map((clip, index) => {
          if (!clip) return null
          
          return (
            <div 
              key={`${clip.id}-${index}`} 
              className="flex items-center space-x-3 p-3 border rounded-lg bg-card hover:bg-muted/50 transition-colors group"
            >
              {/* Drag handle */}
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Clip thumbnail */}
              <div className="w-16 h-9 bg-black rounded overflow-hidden flex-shrink-0 relative">
                {clip.thumbnailUrl ? (
                  <img 
                    src={clip.thumbnailUrl} 
                    alt={clip.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <FileVideo className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20 p-1"
                    onClick={() => window.open(clip.downloadUrl, '_blank')}
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Clip info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{clip.name}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    Clip {index + 1}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDuration(clip.duration)}
                  </span>
                </div>
              </div>

              {/* Timeline position indicator */}
              <div className="text-xs text-muted-foreground text-right">
                <div>
                  {formatDuration(
                    timelineClips.slice(0, index).reduce((acc, c) => acc + (c?.duration || 0), 0)
                  )}
                </div>
                <div className="text-xs opacity-60">
                  → {formatDuration(
                    timelineClips.slice(0, index + 1).reduce((acc, c) => acc + (c?.duration || 0), 0)
                  )}
                </div>
              </div>

              {/* Remove button */}
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                onClick={() => onClipRemove?.(clip.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )
        })}
      </div>

      {/* Timeline summary */}
      {timelineClips.length > 0 && (
        <div className="p-3 bg-muted/30 rounded-lg border border-dashed">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Video Duration:</span>
            <span className="font-medium">{formatDuration(totalDuration)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-muted-foreground">Clips in Sequence:</span>
            <span className="font-medium">{timelineClips.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
