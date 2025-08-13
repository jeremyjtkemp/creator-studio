import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useProjects } from '@/lib/project-context'
import { useAuth } from '@/lib/auth-context'
import { api, GeneratedHook } from '@/lib/serverComm'
import { getProjectHooks, saveProjectHooks, ProjectHook } from '@/lib/hooks'
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Heart,
  TrendingUp,
  Type,
  Target,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Wand2
} from 'lucide-react'

const categoryIcons = {
  curiosity: Lightbulb,
  controversial: Target,
  pov: MessageSquare,
  emotional: Heart,
  statistical: TrendingUp
}

const mockHooks: GeneratedHook[] = [
  {
    text: "This fitness app changed my life in 30 days...",
    category: "curiosity",
    estimatedEngagement: "96%",
    viralityScore: "high",
    variations: 12
  },
  {
    text: "I tried every workout app until I found this gem",
    category: "curiosity", 
    estimatedEngagement: "89%",
    viralityScore: "medium",
    variations: 7
  },
  {
    text: "Personal trainers hate this $5/month fitness secret",
    category: "controversial",
    estimatedEngagement: "94%",
    viralityScore: "high",
    variations: 8
  },
  {
    text: "POV: You finally found the perfect workout app",
    category: "pov",
    estimatedEngagement: "87%",
    viralityScore: "medium",
    variations: 6
  }
]

export function HookTextGenerator() {
  const { currentProject } = useProjects()
  const { user } = useAuth()
  const [hooks, setHooks] = useState<ProjectHook[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedHook, setSelectedHook] = useState<ProjectHook | null>(null)

  // Load hooks when project changes
  useEffect(() => {
    if (currentProject && user) {
      loadProjectHooks()
    } else {
      setHooks([])
      setSelectedHook(null)
    }
  }, [currentProject, user])

  const loadProjectHooks = async () => {
    if (!currentProject || !user) return

    setIsLoading(true)
    try {
      const projectHooks = await getProjectHooks(user.uid, currentProject.id)
      setHooks(projectHooks)
      console.log(`📚 Loaded ${projectHooks.length} hooks for project ${currentProject.name}`)
    } catch (error) {
      console.error('Failed to load project hooks:', error)
      setError('Failed to load hooks for this project')
    } finally {
      setIsLoading(false)
    }
  }

  const generateHooks = async () => {
    if (!currentProject?.description) {
      setError('Project needs a description to generate hooks')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)
    
    try {
      console.log('🎯 Generating hooks for:', currentProject.name)
      
      const response = await api.generateHooks({
        appDescription: currentProject.description,
        projectName: currentProject.name,
        hookCount: 10
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate hooks')
      }
      
      // Save the new hooks to Firestore
      await saveProjectHooks(user!.uid, currentProject.id, response.hooks)
      
      // Reload hooks to get the saved ones with proper IDs
      await loadProjectHooks()
      
      setSuccess(`Generated ${response.generated} viral hooks!`)
      console.log(`✅ Generated ${response.generated} hooks successfully`)
      
      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (error) {
      console.error('❌ Hook generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate hooks'
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyHook = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getViralityColor = (virality: string) => {
    switch(virality) {
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500' 
      case 'low': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5" />
            <span>Hook Text</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={generateHooks}
            disabled={isGenerating || !currentProject?.description}
          >
            {isGenerating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-4">
        {/* Generate Button */}
        <Button 
          onClick={generateHooks} 
          disabled={isGenerating || !currentProject?.description} 
          className="w-full"
          variant={hooks.length === mockHooks.length ? "default" : "outline"}
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating AI Hooks...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate 10 AI Hooks
            </>
          )}
        </Button>

        {/* Success/Error Messages */}
        {success && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">{success}</span>
          </div>
        )}
        
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {!currentProject?.description && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Add a project description to generate AI hooks</span>
          </div>
        )}

        {/* Hook List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading hooks for {currentProject?.name}...</p>
            </div>
          ) : hooks.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">No hooks generated yet for this project</p>
              <p className="text-xs text-muted-foreground">Click "Generate 10 AI Hooks" to create your first batch!</p>
            </div>
          ) : (
            hooks.map((hook, i) => {
            const CategoryIcon = categoryIcons[hook.category as keyof typeof categoryIcons]
            const isSelected = selectedHook?.text === hook.text
            
            return (
              <div 
                key={i} 
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  isSelected ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-secondary'
                }`}
                onClick={() => setSelectedHook(hook)}
              >
                <p className="text-sm font-medium mb-2">{hook.text}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1 text-xs">
                      <CategoryIcon className="w-3 h-3" />
                      <span className="capitalize">{hook.category}</span>
                    </Badge>
                    
                    <div className="flex items-center space-x-1 text-xs">
                      <Heart className="w-3 h-3 text-red-500" />
                      <span>{hook.estimatedEngagement}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1 text-xs">
                      <TrendingUp className={`w-3 h-3 ${getViralityColor(hook.viralityScore)}`} />
                      <span className={getViralityColor(hook.viralityScore)}>
                        {hook.viralityScore}
                      </span>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyHook(hook.text)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )
          })
          )}
        </div>

        {/* Selected Hook Preview */}
        {selectedHook && (
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">Selected Hook:</div>
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="font-medium text-sm">{selectedHook.text}</p>
              <div className="flex items-center justify-between mt-2">
                <Badge variant="outline" className="text-xs">
                  {selectedHook.category}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {selectedHook.estimatedEngagement} engagement • {selectedHook.viralityScore} virality
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
