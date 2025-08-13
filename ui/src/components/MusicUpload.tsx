import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAssets } from '@/lib/assets-context'
import { validateAudioFile, getAudioDuration, MUSIC_CATEGORIES } from '@/lib/assets'
import { Upload, X, AlertCircle, CheckCircle, Music, Play, Pause } from 'lucide-react'

interface MusicUploadProps {
  onUploadComplete?: () => void
}

export function MusicUpload({ onUploadComplete }: MusicUploadProps) {
  const { uploadGlobalMusic, uploadingAsset } = useAssets()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [musicName, setMusicName] = useState('')
  const [selectedEnergy, setSelectedEnergy] = useState('Medium')
  const [selectedMood, setSelectedMood] = useState('Upbeat')
  const [selectedGenre, setSelectedGenre] = useState('Electronic')
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setError(null)
    setSuccess(null)

    // Validate file
    const validation = validateAudioFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      // Create preview URL
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      
      // Set default name from filename (without extension)
      const defaultName = file.name.replace(/\.[^/.]+$/, "")
      setMusicName(defaultName)

      // Get audio duration
      console.log('Getting audio duration...')
      const duration = await getAudioDuration(file)
      console.log('Audio duration:', duration, 'seconds')

      // Upload to global music library
      await uploadGlobalMusic(file, {
        name: musicName || defaultName,
        fileName: file.name,
        fileSize: file.size,
        duration,
        tags: ['music', selectedEnergy.toLowerCase(), selectedMood.toLowerCase(), selectedGenre.toLowerCase()],
        metadata: {
          energy: selectedEnergy,
          mood: selectedMood,
          genre: selectedGenre
        }
      })

      setSuccess(`Successfully uploaded "${musicName || defaultName}" to global music library`)
      
      // Reset form
      setMusicName('')
      setPreviewUrl(null)
      setIsPlaying(false)
      if (inputRef.current) {
        inputRef.current.value = ''
      }

      // Notify parent component
      onUploadComplete?.()

    } catch (error: any) {
      console.error('Upload error:', error)
      setError(error.message || 'Failed to upload music')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const togglePreview = () => {
    if (!audioRef.current || !previewUrl) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Music className="w-5 h-5" />
          <span>Upload Music to Global Library</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Music uploaded here will be available across all your projects
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <Card 
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          } ${uploadingAsset ? 'pointer-events-none opacity-50' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <CardContent className="p-8">
            <div className="text-center">
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              
              <h3 className="text-lg font-semibold mb-2">
                {uploadingAsset ? 'Uploading...' : 'Upload Music File'}
              </h3>
              
              <p className="text-muted-foreground mb-4">
                {uploadingAsset
                  ? 'Please wait while your music is being uploaded' 
                  : 'Drag and drop your audio file here, or click to browse'
                }
              </p>

              {uploadingAsset && (
                <div className="max-w-xs mx-auto mb-4">
                  <Progress value={undefined} className="h-2" />
                </div>
              )}

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Supported formats: MP3, WAV, M4A, AAC</p>
                <p>Maximum file size: 50MB</p>
                <p>Recommended: High quality, 2-5 minutes duration</p>
              </div>

              {!uploadingAsset && (
                <Button className="mt-4" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Music Preview */}
        {previewUrl && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePreview}
                  className="flex-shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <div className="flex-1">
                  <p className="font-medium">Preview: {musicName || 'Untitled'}</p>
                  <audio
                    ref={audioRef}
                    src={previewUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Music Details Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="music-name">Music Name</Label>
            <Input
              id="music-name"
              value={musicName}
              onChange={(e) => setMusicName(e.target.value)}
              placeholder="Enter music name"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="energy">Energy Level</Label>
            <select
              id="energy"
              value={selectedEnergy}
              onChange={(e) => setSelectedEnergy(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              {MUSIC_CATEGORIES.energy.map(energy => (
                <option key={energy} value={energy}>{energy}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="mood">Mood</Label>
            <select
              id="mood"
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              {MUSIC_CATEGORIES.mood.map(mood => (
                <option key={mood} value={mood}>{mood}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="genre">Genre</Label>
            <select
              id="genre"
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg text-sm"
            >
              {MUSIC_CATEGORIES.genre.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags Preview */}
        <div>
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">music</Badge>
            <Badge variant="outline">{selectedEnergy.toLowerCase()}</Badge>
            <Badge variant="outline">{selectedMood.toLowerCase()}</Badge>
            <Badge variant="outline">{selectedGenre.toLowerCase()}</Badge>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={uploadingAsset}
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              {error}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="h-auto p-1 hover:bg-transparent"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="flex items-center justify-between text-green-800 dark:text-green-200">
              {success}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSuccess(null)}
                className="h-auto p-1 hover:bg-transparent text-green-600 dark:text-green-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
