import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { Sparkles, Plus, Folder, BarChart3, Archive, Settings, Loader2, Trash2, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProjects } from "@/lib/project-context"
import { useAuth } from "@/lib/auth-context"
import { deleteProject } from "@/lib/projects"
import { CreateProjectModal } from "@/components/CreateProjectModal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const navigation = [
  { title: "Video Creator", icon: Sparkles, url: "/" },
  { title: "Asset Library", icon: Folder, url: "/assets" },
  { title: "Performance", icon: BarChart3, url: "/analytics" },
  { title: "Archive", icon: Archive, url: "/archive" },
  { title: "Settings", icon: Settings, url: "/settings" },
]

export function AppSidebar() {
  const location = useLocation()
  const { user } = useAuth()
  const {
    projects,
    currentProject,
    loading,
    refreshProjects,
    setCurrentProject,
    createProjectModalOpen,
    setCreateProjectModalOpen,
  } = useProjects()

  const handleProjectSelect = (project: typeof projects[0]) => {
    setCurrentProject(project)
  }

  const handleCreateProject = () => {
    setCreateProjectModalOpen(true)
  }

  const handleDeleteProject = async (project: typeof projects[0], event: React.MouseEvent) => {
    event.stopPropagation() // Prevent project selection
    
    if (!user) {
      alert('You must be logged in to delete projects')
      return
    }

    const confirmMessage = `Are you sure you want to delete "${project.name}"?\n\nThis will permanently delete:\n• The project\n• All hooks\n• All assets\n• All videos\n• All analytics\n\nThis action cannot be undone.`
    
    if (!confirm(confirmMessage)) {
      return
    }

    try {
      await deleteProject(user.uid, project.id)
      
      // If the deleted project was the current project, clear selection
      if (currentProject?.id === project.id) {
        setCurrentProject(null)
      }
      
      // Refresh the projects list
      await refreshProjects()
      
      alert(`"${project.name}" has been deleted successfully.`)
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert(`Failed to delete "${project.name}". Please try again.`)
    }
  }

  const handleProjectCreated = () => {
    refreshProjects()
  }

  return (
    <>
      <Sidebar variant="sidebar" className="border-r border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center space-x-2 px-4 py-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Creator Studio</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2">
          <SidebarGroup>
            <div className="flex items-center justify-between px-2 mb-2">
              <SidebarGroupLabel>Projects</SidebarGroupLabel>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0"
                onClick={handleCreateProject}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <SidebarGroupContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center">
                    <Folder className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">No projects yet</p>
                  <Button size="sm" className="w-full" onClick={handleCreateProject}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-1">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group ${
                        currentProject?.id === project.id
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                          : 'hover:bg-sidebar-accent'
                      }`}
                    >
                      <button
                        onClick={() => handleProjectSelect(project)}
                        className="flex-1 flex items-center space-x-3 text-left min-w-0"
                      >
                        <span className="text-lg">{project.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{project.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">{project.status}</div>
                        </div>
                        {project.status === "active" && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                      
                      {/* Delete Button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteProject(project, e)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              )}
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-6">
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url} className="flex items-center space-x-2">
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <div className="text-xs text-muted-foreground">
            {projects.length === 0 ? (
              <div className="text-center">
                <p>Create your first project to get started</p>
              </div>
            ) : currentProject ? (
              <div>
                <div className="font-medium">Current Project</div>
                <div className="flex items-center space-x-2 mt-1">
                  <span>{currentProject.icon}</span>
                  <span className="truncate">{currentProject.name}</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p>Select a project to get started</p>
              </div>
            )}
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <CreateProjectModal
        open={createProjectModalOpen}
        onOpenChange={setCreateProjectModalOpen}
        onProjectCreated={handleProjectCreated}
      />
    </>
  )
}