import React, { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useAssets } from '@/lib/assets-context'
import { validateVideoFile, getVideoDuration, generateThumbnail } from '@/lib/hook-visuals'
import { Upload, X, AlertCircle, CheckCircle, FileVideo } from 'lucide-react'

export function DemoClipsUpload() {
  const { uploadAssetFile, uploadingAsset } = useAssets()
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    setError(null)
    setSuccess(null)

    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      return
    }

    try {
      // Get video metadata
      console.log('Getting demo video duration...')
      const duration = await getVideoDuration(file)
      console.log('Demo video duration:', duration, 'seconds')

      // Generate thumbnail
      console.log('Generating demo video thumbnail...')
      const thumbnailUrl = await generateThumbnail(file)
      console.log('Demo video thumbnail generated')

      // Upload as demo-video asset
      await uploadAssetFile(file, {
        type: 'demo-video',
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        fileName: file.name,
        fileSize: file.size,
        duration,
        thumbnailUrl,
        tags: ['demo', 'video', 'b-roll']
      })

      setSuccess(`Successfully uploaded "${file.name}"`)
      
      // Clear the input
      if (inputRef.current) {
        inputRef.current.value = ''
      }

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)

    } catch (error: any) {
      console.error('Demo clip upload error:', error)
      setError(error.message || 'Failed to upload demo clip')
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

  return (
    <div className="space-y-4">
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
        <CardContent className="p-6">
          <div className="text-center">
            <FileVideo className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            
            <h3 className="text-lg font-semibold mb-2">
              {uploadingAsset ? 'Uploading...' : 'Upload Demo Clips'}
            </h3>
            
            <p className="text-muted-foreground mb-4">
              {uploadingAsset
                ? 'Please wait while your demo clip is being uploaded' 
                : 'Drag and drop your demo video file here, or click to browse'
              }
            </p>

            {uploadingAsset && (
              <div className="max-w-xs mx-auto mb-4">
                <Progress value={undefined} className="h-2" />
              </div>
            )}

            <div className="text-sm text-muted-foreground space-y-1">
              <p>Supported formats: MP4, MOV, AVI</p>
              <p>Maximum file size: 200MB</p>
              <p>Recommended: App screenshots, b-roll footage, UI demos</p>
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

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
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
    </div>
  )
}
