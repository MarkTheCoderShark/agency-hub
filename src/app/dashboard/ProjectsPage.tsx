import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, FolderKanban, MoreHorizontal, Archive, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useProjects, useCreateProject, useArchiveProject, useDeleteProject } from '@/hooks/useProjects'
import { formatRelativeTime, getStatusColor } from '@/lib/utils'
import { toast } from 'sonner'

export function ProjectsPage() {
  const [search, setSearch] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')

  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()
  const archiveProject = useArchiveProject()
  const deleteProject = useDeleteProject()

  const filteredProjects = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateProject = () => {
    if (!newProjectName.trim()) {
      toast.error('Project name is required')
      return
    }

    createProject.mutate(
      {
        name: newProjectName,
        description: newProjectDescription || undefined,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          setNewProjectName('')
          setNewProjectDescription('')
        },
      }
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your client projects</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Add a new project to start tracking client requests.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Project name</Label>
                <Input
                  id="name"
                  placeholder="e.g., ClientWebsite.com"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project"
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject} disabled={createProject.isPending}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <Link to={`/projects/${project.id}`} className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <FolderKanban className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                      <CardDescription className="truncate">
                        {project.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => archiveProject.mutate(project.id)}
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteProject.mutate(project.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Updated {formatRelativeTime(project.updated_at)}
                  </span>
                </div>
                {project.project_members && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {project.project_members.filter((m) => m.role === 'client').length} clients
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-sm text-muted-foreground">
                      {project.project_members.filter((m) => m.role !== 'client').length} team
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No projects found</h3>
            <p className="mt-2 text-muted-foreground">
              {search
                ? 'Try adjusting your search'
                : 'Create your first project to get started'}
            </p>
            {!search && (
              <Button className="mt-4" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
