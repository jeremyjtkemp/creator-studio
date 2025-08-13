import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/lib/auth-context'
import { createProject, PROJECT_TEMPLATES, CreateProjectData } from '@/lib/projects'
import { autoGenerateProjectHooks } from '@/lib/hooks'
import { Loader2, Plus, Sparkles } from 'lucide-react'

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectCreated: () => void
}

export function CreateProjectModal({ open, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [generatingHooks, setGeneratingHooks] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PROJECT_TEMPLATES[0] | null>(null)
  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    icon: '📱',
    description: '',
    status: 'active'
  })

  const handleTemplateSelect = (template: typeof PROJECT_TEMPLATES[0]) => {
    setSelectedTemplate(template)
    setFormData({
      name: template.name,
      icon: template.icon,
      description: template.description,
      status: 'active'
    })
  }

  const handleCustomProject = () => {
    setSelectedTemplate(null)
    setFormData({
      name: '',
      icon: '📱',
      description: '',
      status: 'active'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      console.error('No user found when creating project')
      return
    }

    setLoading(true)
    try {
      console.log('Creating project with data:', formData)
      console.log('User ID:', user.uid)
      
      const projectId = await createProject(user.uid, formData)
      console.log('Project created successfully with ID:', projectId)
      
      // Auto-generate hooks for the new project
      setGeneratingHooks(true)
      try {
        console.log('🤖 Auto-generating hooks for new project...')
        await autoGenerateProjectHooks(
          user.uid,
          projectId,
          formData.name,
          formData.description
        )
        console.log('✅ Auto-generated hooks successfully')
      } catch (hookError) {
        console.error('⚠️ Failed to auto-generate hooks (project still created):', hookError)
        // Don't fail the entire process if hook generation fails
      }
      setGeneratingHooks(false)
      
      onProjectCreated()
      onOpenChange(false)
      
      // Reset form
      setFormData({
        name: '',
        icon: '📱',
        description: '',
        status: 'active'
      })
      setSelectedTemplate(null)
    } catch (error: any) {
      console.error('Failed to create project:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      alert(`Failed to create project: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name.trim().length > 0 && formData.description.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up a project for one of your apps. Each project will have its own assets, videos, and analytics.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!selectedTemplate ? (
            <div>
              <h3 className="font-medium mb-4">Choose a template or create custom</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {PROJECT_TEMPLATES.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleTemplateSelect(template)}
                    className="p-4 border rounded-lg hover:bg-secondary transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{template.category}</div>
                  </button>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleCustomProject}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Custom Project
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{selectedTemplate.icon}</span>
                  <div>
                    <h3 className="font-medium">{selectedTemplate.name}</h3>
                    <Badge variant="outline" className="text-xs">{selectedTemplate.category}</Badge>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Change Template
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter project name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="project-icon">Icon (Emoji)</Label>
                  <Input
                    id="project-icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="📱"
                    maxLength={2}
                    className="w-24"
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe your app and its main features..."
                    rows={3}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This description will be used to generate AI-powered hooks for your videos
                  </p>
                </div>
              </div>
            </div>
          )}

          {selectedTemplate && (
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? (
                  generatingHooks ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                      Generating AI Hooks...
                    </>
                  ) : (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Project...
                    </>
                  )
                ) : (
                  'Create Project'
                )}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
