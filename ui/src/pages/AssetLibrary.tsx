import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjects } from '@/lib/project-context'
import { useAssets } from '@/lib/assets-context'
import { AssetType, formatFileSize, formatDuration } from '@/lib/assets'
import { MigrateAssetsButton } from '@/components/MigrateAssetsButton'
import { 
  Upload, 
  FolderOpen,
  Folder,
  Image,
  Music,
  Video,
  Sparkles,
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  Play,
  Download,
  Trash2,
  MoreVertical,
  Eye,
  FileVideo,
  FileImage,
  FileAudio,
  File
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const assetTypeConfig: Record<AssetType, { icon: React.ComponentType<any>, label: string, color: string, description: string }> = {
  'hook-visual': { icon: Video, label: 'Hook Videos', color: 'text-blue-500', description: 'Talking head clips for viral hooks' },
  'demo-video': { icon: FileVideo, label: 'Demo Videos', color: 'text-green-500', description: 'App screenshots and b-roll footage' },
  'image': { icon: FileImage, label: 'Images', color: 'text-purple-500', description: 'Screenshots, thumbnails, and graphics' },
  'music': { icon: FileAudio, label: 'Music', color: 'text-orange-500', description: 'Background music and sound effects' },
  'other': { icon: File, label: 'Other', color: 'text-gray-500', description: 'Other file types' }
}

export function AssetLibrary() {
  const { projects, currentProject } = useProjects()
  const { assets, allAssets, loadingAssets, deleteAssetById, getTotalAssetsCount } = useAssets()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<AssetType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter assets based on type and search
  const filteredAssets = allAssets.filter(asset => {
    const matchesType = selectedType === 'all' || asset.type === selectedType
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesType && matchesSearch
  })

  const handleDelete = async (assetId: string, assetName: string) => {
    if (!confirm(`Are you sure you want to delete "${assetName}"?`)) {
      return
    }
    
    try {
      await deleteAssetById(assetId)
    } catch (error) {
      console.error('Failed to delete asset:', error)
      alert('Failed to delete asset. Please try again.')
    }
  }

  // Show welcome screen if no projects exist
  if (projects.length === 0) {
    return <AssetLibraryWelcomeScreen />
  }

  // Show project selection if projects exist but none selected
  if (!currentProject) {
    return <AssetLibrarySelectProject />
  }

  const totalAssets = getTotalAssetsCount()

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Asset Library</h1>
            <p className="text-muted-foreground">
              {totalAssets > 0 
                ? `${totalAssets} assets in ${currentProject.name}`
                : `Manage assets for ${currentProject.name}`
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <MigrateAssetsButton />
            <Button variant="outline" disabled>
              <FolderOpen className="w-4 h-4 mr-2" />
              Sync Drive
            </Button>
            <Button disabled>
              <Upload className="w-4 h-4 mr-2" />
              Upload Assets
            </Button>
          </div>
        </div>
      </div>

      {totalAssets === 0 ? (
        <AssetLibraryEmptyState />
      ) : (
        <>
          {/* Controls */}
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    className="pl-10 pr-4 py-2 border rounded-lg w-64 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as AssetType | 'all')}
                  className="px-3 py-2 border rounded-lg text-sm"
                >
                  <option value="all">All Types ({allAssets.length})</option>
                  {Object.entries(assetTypeConfig).map(([type, config]) => (
                    <option key={type} value={type}>
                      {config.label} ({assets[type as AssetType]?.length || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Assets Display */}
          <div className="flex-1 p-6">
            {loadingAssets ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Card key={i} className="aspect-square">
                    <CardContent className="p-4 h-full flex items-center justify-center">
                      <div className="animate-pulse bg-muted rounded-lg w-full h-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="text-center py-12">
                <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">No assets found</p>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search or filters' : 'Upload some assets to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredAssets.map((asset) => (
                  <AssetGridItem key={asset.id} asset={asset} onDelete={handleDelete} />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAssets.map((asset) => (
                  <AssetListItem key={asset.id} asset={asset} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Asset Grid Item Component
function AssetGridItem({ asset, onDelete }: { asset: any, onDelete: (id: string, name: string) => void }) {
  const config = assetTypeConfig[asset.type] || assetTypeConfig.other
  const IconComponent = config.icon

  return (
    <Card className="group relative overflow-hidden">
      <CardContent className="p-0 aspect-square relative">
        {/* Thumbnail */}
        <div className="w-full h-full bg-black relative">
          {asset.thumbnailUrl ? (
            <img 
              src={asset.thumbnailUrl} 
              alt={asset.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <IconComponent className={`w-8 h-8 ${config.color}`} />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-white/20"
              onClick={() => window.open(asset.downloadUrl, '_blank')}
            >
              {asset.type.includes('video') ? <Play className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
            </Button>
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>

          {/* Duration Badge */}
          {asset.duration && (
            <div className="absolute bottom-2 left-2">
              <Badge variant="secondary" className="text-xs bg-black/70 text-white">
                {formatDuration(asset.duration)}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => window.open(asset.downloadUrl, '_blank')}>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const link = document.createElement('a')
                  link.href = asset.downloadUrl
                  link.download = asset.fileName
                  link.click()
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(asset.id, asset.name)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Asset Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h4 className="text-white text-sm font-medium truncate mb-1">
            {asset.name}
          </h4>
          <div className="flex items-center justify-between text-xs text-white/80">
            <span>{formatFileSize(asset.fileSize)}</span>
            <span>
              {asset.createdAt?.toDate ? 
                asset.createdAt.toDate().toLocaleDateString() : 
                'Unknown'
              }
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Asset List Item Component
function AssetListItem({ asset, onDelete }: { asset: any, onDelete: (id: string, name: string) => void }) {
  const config = assetTypeConfig[asset.type] || assetTypeConfig.other
  const IconComponent = config.icon

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
            {asset.thumbnailUrl ? (
              <img 
                src={asset.thumbnailUrl} 
                alt={asset.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <IconComponent className={`w-6 h-6 ${config.color}`} />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{asset.name}</h4>
            <p className="text-sm text-muted-foreground truncate">{asset.fileName}</p>
            <div className="flex items-center space-x-4 mt-1">
              <Badge variant="outline" className="text-xs">
                {config.label}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatFileSize(asset.fileSize)}
              </span>
              {asset.duration && (
                <span className="text-xs text-muted-foreground">
                  {formatDuration(asset.duration)}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {asset.createdAt?.toDate ? 
                  asset.createdAt.toDate().toLocaleDateString() : 
                  'Unknown'
                }
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(asset.downloadUrl, '_blank')}
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const link = document.createElement('a')
                link.href = asset.downloadUrl
                link.download = asset.fileName
                link.click()
              }}
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(asset.id, asset.name)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Welcome Screen Component
function AssetLibraryWelcomeScreen() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Asset Library</h1>
            <p className="text-muted-foreground">Manage your videos, images, and music</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-xl mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
            <Folder className="w-10 h-10 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Welcome to Asset Library</h2>
          <p className="text-muted-foreground mb-8">
            Create a project first to start uploading and managing your assets.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {Object.entries(assetTypeConfig).slice(0, 3).map(([type, config]) => {
              const IconComponent = config.icon
              return (
                <Card key={type} className="text-center p-4">
                  <IconComponent className={`w-8 h-8 mx-auto mb-2 ${config.color}`} />
                  <h3 className="font-medium text-sm">{config.label}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Select Project Screen Component
function AssetLibrarySelectProject() {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Asset Library</h1>
            <p className="text-muted-foreground">Select a project to view its assets</p>
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
            Choose a project from the sidebar to view and manage its assets.
          </p>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function AssetLibraryEmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-muted flex items-center justify-center">
          <Folder className="w-10 h-10 text-muted-foreground" />
        </div>
        
        <h2 className="text-2xl font-bold mb-4">No Assets Yet</h2>
        <p className="text-muted-foreground mb-8">
          Start by uploading hook videos in the Video Creator, or use the upload buttons above.
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(assetTypeConfig).slice(0, 3).map(([type, config]) => {
            const IconComponent = config.icon
            return (
              <Card key={type} className="text-center p-4">
                <IconComponent className={`w-8 h-8 mx-auto mb-2 ${config.color}`} />
                <h3 className="font-medium text-sm">{config.label}</h3>
                <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
              </Card>
            )
          })}
        </div>

        <div className="p-4 bg-muted/50 rounded-lg border border-dashed">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Pro tip: Upload hook videos in the Video Creator to see them here</span>
          </div>
        </div>
      </div>
    </div>
  )
}