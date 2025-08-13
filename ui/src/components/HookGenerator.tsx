import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProjects } from '@/lib/project-context'
import { api, GeneratedHook } from '@/lib/serverComm'
import { 
  Sparkles, 
  RefreshCw, 
  Copy, 
  Heart,
  TrendingUp,
  Filter,
  Wand2,
  Target,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const hookTemplates = {
  curiosity: [
    "This [app type] changed my life in [time period]...",
    "I tried every [category] app until I found this gem",
    "Why I switched from [competitor] to this app",
    "The [feature] everyone's talking about",
    "This app does something no other [category] app can"
  ],
  controversial: [
    "[Profession] hate this [price] [category] secret",
    "Why [popular app] is overrated and this is better",
    "The truth about [common belief] that apps don't tell you",
    "This app proves [industry] experts wrong",
    "Stop using [popular method], try this instead"
  ],
  pov: [
    "POV: You finally found the perfect [category] app",
    "POV: Your [goal] journey just got 10x easier",
    "POV: You discovered the app that actually works",
    "POV: You're about to change your [habit] forever",
    "POV: You found the app everyone's been hiding"
  ],
  emotional: [
    "The app that made me love [activity] again",
    "How this app saved my [aspect of life]",
    "I was skeptical until this app proved me wrong",
    "This app turned my biggest weakness into my strength",
    "The emotional transformation this app gave me"
  ],
  statistical: [
    "[Number]% improvement in [metric] with this app",
    "From [bad stat] to [good stat] in [time period]",
    "[Large number] people can't be wrong about this app",
    "This app increased my [metric] by [percentage]",
    "[Number] reasons this app is better than [competitor]"
  ]
}

const generatedHooks = [
  {
    text: "This fitness app changed my life in 30 days...",
    category: "curiosity",
    engagement: "98%",
    virality: "high",
    variations: 12
  },
  {
    text: "Personal trainers hate this $5/month fitness secret",
    category: "controversial", 
    engagement: "95%",
    virality: "high",
    variations: 8
  },
  {
    text: "POV: You finally found the perfect workout app",
    category: "pov",
    engagement: "87%",
    virality: "medium",
    variations: 6
  },
  {
    text: "I was skeptical until this app proved me wrong",
    category: "emotional",
    engagement: "91%",
    virality: "high",
    variations: 9
  },
  {
    text: "95% improvement in fitness consistency with this app",
    category: "statistical",
    engagement: "89%",
    virality: "medium",
    variations: 4
  }
]

const categoryIcons = {
  curiosity: Lightbulb,
  controversial: Target,
  pov: MessageSquare,
  emotional: Heart,
  statistical: TrendingUp
}

export function HookGenerator() {
  const { currentProject } = useProjects()
  const [appDescription, setAppDescription] = useState("A fitness tracking app that helps users build consistent workout habits with personalized plans and progress tracking")
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [hooks, setHooks] = useState<GeneratedHook[]>(generatedHooks)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Update app description when project changes
  useEffect(() => {
    if (currentProject?.description) {
      setAppDescription(currentProject.description)
    }
  }, [currentProject])

  const generateHooks = async () => {
    if (!appDescription.trim()) {
      setError('Please provide an app description')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(null)
    
    try {
      console.log('🎯 Generating hooks for:', currentProject?.name || 'Unknown project')
      
      const response = await api.generateHooks({
        appDescription: appDescription.trim(),
        projectName: currentProject?.name,
        hookCount: 10
      })
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate hooks')
      }
      
      setHooks(response.hooks)
      setSuccess(`Generated ${response.generated} viral hooks!`)
      console.log(`✅ Generated ${response.generated} hooks successfully`)
      
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

  const filteredHooks = selectedCategory === 'all' 
    ? hooks 
    : hooks.filter(hook => hook.category === selectedCategory)

  const getViralityColor = (virality: string) => {
    switch(virality) {
      case 'high': return 'text-green-500'
      case 'medium': return 'text-yellow-500' 
      case 'low': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wand2 className="w-5 h-5" />
            <span>AI Hook Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">App Description</label>
            <Input
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe your app's main features and benefits..."
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={generateHooks} disabled={isGenerating || !appDescription.trim()} className="flex-1">
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Hooks...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate 10 AI Hooks
                </>
              )}
            </Button>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Templates
            </Button>
          </div>

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
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Hooks</TabsTrigger>
          <TabsTrigger value="curiosity">Curiosity</TabsTrigger>
          <TabsTrigger value="controversial">Controversial</TabsTrigger>
          <TabsTrigger value="pov">POV</TabsTrigger>
          <TabsTrigger value="emotional">Emotional</TabsTrigger>
          <TabsTrigger value="statistical">Statistical</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-3">
          {filteredHooks.map((hook, index) => {
            const CategoryIcon = categoryIcons[hook.category as keyof typeof categoryIcons]
            
            return (
              <Card key={index} className="group hover:ring-2 hover:ring-primary transition-all cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-lg mb-3">{hook.text}</p>
                      
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <CategoryIcon className="w-3 h-3" />
                          <span className="capitalize">{hook.category}</span>
                        </Badge>
                        
                        <div className="flex items-center space-x-1 text-sm">
                          <Heart className="w-4 h-4 text-red-500" />
                          <span>{hook.engagement} engagement</span>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendingUp className={`w-4 h-4 ${getViralityColor(hook.virality)}`} />
                          <span className={getViralityColor(hook.virality)}>
                            {hook.virality} virality
                          </span>
                        </div>
                        
                        <span className="text-sm text-muted-foreground">
                          {hook.variations} variations
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => copyHook(hook.text)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Use Hook
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>

      {/* Hook Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Hook Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curiosity" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="curiosity">Curiosity</TabsTrigger>
              <TabsTrigger value="controversial">Controversial</TabsTrigger>
              <TabsTrigger value="pov">POV</TabsTrigger>
              <TabsTrigger value="emotional">Emotional</TabsTrigger>
              <TabsTrigger value="statistical">Stats</TabsTrigger>
            </TabsList>
            
            {Object.entries(hookTemplates).map(([category, templates]) => (
              <TabsContent key={category} value={category} className="space-y-2">
                {templates.map((template, index) => (
                  <div 
                    key={index} 
                    className="p-3 border rounded-lg hover:bg-secondary transition-colors cursor-pointer group"
                    onClick={() => copyHook(template)}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm">{template}</p>
                      <Copy className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
