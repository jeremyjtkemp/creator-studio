import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './auth-context'
import { getUserProjects, Project } from './projects'

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  refreshProjects: () => Promise<void>
  setCurrentProject: (project: Project | null) => void
  createProjectModalOpen: boolean
  setCreateProjectModalOpen: (open: boolean) => void
}

const ProjectContext = createContext<ProjectContextType>({
  projects: [],
  currentProject: null,
  loading: true,
  refreshProjects: async () => {},
  setCurrentProject: () => {},
  createProjectModalOpen: false,
  setCreateProjectModalOpen: () => {},
})

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [createProjectModalOpen, setCreateProjectModalOpen] = useState(false)

  const refreshProjects = async () => {
    if (!user) {
      setProjects([])
      setCurrentProject(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const userProjects = await getUserProjects(user.uid)
      setProjects(userProjects)
      
      // Set the first active project as current if none is selected
      if (!currentProject && userProjects.length > 0) {
        const activeProject = userProjects.find(p => p.status === 'active') || userProjects[0]
        setCurrentProject(activeProject)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch projects when user changes
  useEffect(() => {
    refreshProjects()
  }, [user])

  // Clear projects when user signs out
  useEffect(() => {
    if (!user) {
      setProjects([])
      setCurrentProject(null)
      setLoading(false)
    }
  }, [user])

  const value = {
    projects,
    currentProject,
    loading,
    refreshProjects,
    setCurrentProject,
    createProjectModalOpen,
    setCreateProjectModalOpen,
  }

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider')
  }
  return context
}
