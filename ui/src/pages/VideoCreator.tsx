import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useProjects } from '@/lib/project-context'
import { HookVisualUpload } from '@/components/HookVisualUpload'
import { HookVisualGrid } from '@/components/HookVisualGrid'
import { HookTextGenerator } from '@/components/HookTextGenerator'
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
  Pause,
  RotateCcw,
  Copy,
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
  const [currentStep, setCurrentStep] = useState('hook')
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress] = useState(65)

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Video Creator</h1>
              <p className="text-muted-foreground">Create viral TikTok-style videos for {currentProject.name}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">Draft</Badge>
              <Button variant="outline" size="sm">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
              <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
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
              <div className="grid grid-cols-3 gap-6 h-full">
                {/* Hook Visual Selection */}
                <Card className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="w-5 h-5" />
                      <span>Hook Visuals</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col space-y-4">
                    {/* Upload Section */}
                    <HookVisualUpload />
                    
                    {/* Visuals Grid */}
                    <div className="flex-1">
                      <HookVisualGrid />
                    </div>
                  </CardContent>
                </Card>

                {/* Hook Text Generator */}
                <HookTextGenerator />

                {/* Text Customization */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="w-5 h-5" />
                      <span>Customize</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Text Size</label>
                        <div className="flex space-x-2 mt-2">
                          {['S', 'M', 'L', 'XL'].map((size) => (
                            <Button key={size} variant="outline" size="sm" className="w-10">
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Position</label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['Top', 'Middle', 'Bottom', 'Custom'].map((pos) => (
                            <Button key={pos} variant="outline" size="sm">
                              {pos}
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
                            defaultValue="5" 
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">5s</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="demo" className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Demo Clips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-muted-foreground">
                      <Image className="w-12 h-12 mx-auto mb-4" />
                      <p>Upload demo clips or select from library</p>
                      <Button className="mt-4">Upload Clips</Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-16 h-9 bg-secondary rounded"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Clip {i}</p>
                            <p className="text-xs text-muted-foreground">3.2s</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="music" className="h-full">
              <div className="grid grid-cols-2 gap-6 h-full">
                <Card>
                  <CardHeader>
                    <CardTitle>Music Library</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { name: "Upbeat Workout", energy: "High", duration: "2:14" },
                        { name: "Motivational Rock", energy: "High", duration: "1:58" },
                        { name: "Electronic Vibes", energy: "Medium", duration: "2:45" },
                        { name: "Ambient Focus", energy: "Low", duration: "3:12" },
                      ].map((track, i) => (
                        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <Button variant="ghost" size="sm">
                            <Play className="w-4 h-4" />
                          </Button>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{track.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className="text-xs">{track.energy}</Badge>
                              <span className="text-xs text-muted-foreground">{track.duration}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Audio Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Volume</label>
                        <input type="range" className="w-full mt-2" defaultValue="75" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Start Time</label>
                        <input type="text" placeholder="00:00" className="w-full mt-2 px-3 py-2 border rounded" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="export" className="h-full">
              <Card>
                <CardHeader>
                  <CardTitle>Export Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Video Name</label>
                      <input 
                        type="text" 
                        defaultValue={`${currentProject.name}_curiosity_hook_${new Date().toISOString().split('T')[0]}`}
                        className="w-full mt-2 px-3 py-2 border rounded"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <Button size="lg" className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Export Single Video
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Batch Export (10 variations)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview Panel */}
      <div className="w-80 border-l border-border p-6">
        <div className="sticky top-6">
          <h3 className="font-semibold mb-4">Preview</h3>
          <div className="aspect-[9/16] bg-black rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
              </Button>
            </div>
            
            {/* Mock preview content */}
            <div className="absolute top-4 left-4 right-4">
              <p className="text-white text-lg font-bold text-center">
                This fitness app changed my life in 30 days...
              </p>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 text-center">
              <p className="text-white text-sm">{currentProject.name} Demo</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Duration</span>
              <span>15s</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Format</span>
              <span>9:16 MP4</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Size</span>
              <span>12.4 MB</span>
            </div>
          </div>

          <Button className="w-full mt-4" variant="outline">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Preview
          </Button>
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