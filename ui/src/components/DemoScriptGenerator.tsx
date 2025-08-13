import React, { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { Skeleton } from './ui/skeleton'
import { useProjects } from '../lib/project-context'
import { useVideoComposition } from '../lib/video-composition-context'
import { api } from '../lib/serverComm'

interface DemoScript {
  id: string
  script: string
  category: string
  tone: string
  createdAt: Date
}

interface DemoScriptGeneratorProps {
  className?: string
}

const DEMO_SCRIPT_CATEGORIES = [
  'Product Demo',
  'Feature Walkthrough', 
  'Tutorial Steps',
  'Benefits Overview',
  'Use Case Examples',
  'Comparison Demo',
  'Problem Solution',
  'How It Works'
]

const DEMO_SCRIPT_TONES = [
  'Professional',
  'Conversational', 
  'Enthusiastic',
  'Educational',
  'Authoritative',
  'Friendly',
  'Technical',
  'Casual'
]

export function DemoScriptGenerator({ className }: DemoScriptGeneratorProps) {
  const { currentProject } = useProjects()
  const { composition, updateDemoScript } = useVideoComposition()
  
  const [demoScripts, setDemoScripts] = useState<DemoScript[]>([])
  const [selectedScript, setSelectedScript] = useState<string>('')
  const [customScript, setCustomScript] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('Product Demo')
  const [selectedTone, setSelectedTone] = useState<string>('Professional')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Load saved demo scripts on component mount
  useEffect(() => {
    if (currentProject) {
      loadDemoScripts()
    }
  }, [currentProject])

  const loadDemoScripts = async () => {
    if (!currentProject) return
    
    try {
      console.log('📜 Loading demo scripts for project:', currentProject.name)
      
      // Auto-generate 5 initial demo scripts for new projects
      if (demoScripts.length === 0) {
        console.log('🤖 Auto-generating 5 initial demo scripts...')
        setIsGenerating(true)
        
        try {
          const data = await api.generateDemoScripts({
            projectName: currentProject.name,
            projectDescription: currentProject.description || '',
            category: 'Product Demo',
            tone: 'Professional',
            count: 5
          })
          
          const initialScripts: DemoScript[] = data.scripts.map((script: string, index: number) => ({
            id: `demo_initial_${Date.now()}_${index}`,
            script: script.trim(),
            category: 'Product Demo',
            tone: 'Professional',
            createdAt: new Date()
          }))

          setDemoScripts(initialScripts)
          console.log('✅ Auto-generated', initialScripts.length, 'initial demo scripts')
        } catch (error) {
          console.error('❌ Failed to auto-generate demo scripts:', error)
          // Set empty array if auto-generation fails
          setDemoScripts([])
        } finally {
          setIsGenerating(false)
        }
      }
    } catch (error) {
      console.error('❌ Error loading demo scripts:', error)
    }
  }

  const generateDemoScripts = async () => {
    if (!currentProject) {
      console.error('❌ No project selected')
      return
    }

    setIsGenerating(true)
    
    try {
      console.log('🤖 Generating demo scripts for:', currentProject.name)
      
      const data = await api.generateDemoScripts({
        projectName: currentProject.name,
        projectDescription: currentProject.description || '',
        category: selectedCategory,
        tone: selectedTone,
        count: 5
      })
      
      const newScripts: DemoScript[] = data.scripts.map((script: string, index: number) => ({
        id: `demo_${Date.now()}_${index}`,
        script: script.trim(),
        category: selectedCategory,
        tone: selectedTone,
        createdAt: new Date()
      }))

      setDemoScripts(prev => [...newScripts, ...prev])
      console.log('✅ Generated', newScripts.length, 'demo scripts')
      
    } catch (error) {
      console.error('❌ Error generating demo scripts:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScriptSelect = (script: string) => {
    setSelectedScript(script)
    setCustomScript('') // Clear custom input when selecting generated script
    setShowCustomInput(false)
    
    // Update video composition with selected demo script
    if (updateDemoScript) {
      updateDemoScript(script)
    }
    
    console.log('🎯 Selected demo script:', script.substring(0, 50) + '...')
  }

  const handleCustomScriptSubmit = () => {
    if (!customScript.trim()) return
    
    const script = customScript.trim()
    setSelectedScript(script)
    
    // Update video composition with custom demo script
    if (updateDemoScript) {
      updateDemoScript(script)
    }
    
    console.log('✏️ Using custom demo script:', script.substring(0, 50) + '...')
  }

  return (
    <Card className={`flex flex-col h-full ${className || ''}`}>
      <CardHeader>
        <CardTitle>Demo Script Generator</CardTitle>
        <CardDescription>
          Generate AI-powered demo scripts or write your own custom script for the demo section
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-auto">
        
        {/* Generation Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {DEMO_SCRIPT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Tone</label>
            <select 
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              {DEMO_SCRIPT_TONES.map(tone => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
          </div>
        </div>

        <Button 
          onClick={generateDemoScripts}
          disabled={isGenerating || !currentProject}
          className="w-full"
        >
          {isGenerating ? 'Generating Demo Scripts...' : 'Generate AI Demo Scripts'}
        </Button>

        {/* Custom Script Input */}
        <div className="border-t pt-4">
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="mb-3"
          >
            {showCustomInput ? 'Hide' : 'Write'} Custom Script
          </Button>
          
          {showCustomInput && (
            <div className="space-y-3">
              <Textarea
                value={customScript}
                onChange={(e) => setCustomScript(e.target.value)}
                placeholder="Write your own demo script here..."
                className="min-h-24"
              />
              <Button
                onClick={handleCustomScriptSubmit}
                disabled={!customScript.trim()}
                size="sm"
              >
                Use Custom Script
              </Button>
            </div>
          )}
        </div>

        {/* Generated Scripts */}
        {isGenerating && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-3 border rounded-md">
                <div className="flex items-center gap-2 mb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {demoScripts.length > 0 && (
          <div className="space-y-3 flex-1">
            <h4 className="font-medium">Generated Demo Scripts</h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {demoScripts.map((script) => (
                <div
                  key={script.id}
                  className={`p-4 border rounded-md cursor-pointer transition-colors ${
                    selectedScript === script.script
                      ? 'border-blue-500 bg-blue-50'
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleScriptSelect(script.script)}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{script.category}</Badge>
                    <Badge variant="outline">{script.tone}</Badge>
                    {selectedScript === script.script && (
                      <Badge variant="default">✓ Selected</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {script.script}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Selection Display */}
        {selectedScript && (
          <div className="border-t pt-4 mt-auto">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <span>Selected Demo Script</span>
              <Badge variant="default" className="text-xs">Active</Badge>
            </h4>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800 leading-relaxed">{selectedScript}</p>
            </div>
          </div>
        )}

        {demoScripts.length === 0 && !isGenerating && currentProject && (
          <div className="text-center py-8 text-gray-500">
            <p>No demo scripts generated yet.</p>
            <p className="text-sm">Click "Generate AI Demo Scripts" to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
