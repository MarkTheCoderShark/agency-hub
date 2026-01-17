import { useState } from 'react'
import { useParams, useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Settings,
  FileText,
  StickyNote,
  Info,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useProject } from '@/hooks/useProjects'
import { getStatusColor } from '@/lib/utils'

// Import tab components
import { RequestsTab } from '@/components/features/projects/RequestsTab'
import { NotesTab } from '@/components/features/projects/NotesTab'
import { DetailsTab } from '@/components/features/projects/DetailsTab'
import { ProjectSettingsTab } from '@/components/features/projects/ProjectSettingsTab'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { data: project, isLoading } = useProject(projectId)

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname.includes('/notes')) return 'notes'
    if (location.pathname.includes('/details')) return 'details'
    if (location.pathname.includes('/settings')) return 'settings'
    return 'requests'
  }

  const activeTab = getActiveTab()

  const handleTabChange = (value: string) => {
    if (value === 'requests') {
      navigate(`/projects/${projectId}`)
    } else {
      navigate(`/projects/${projectId}/${value}`)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-medium">Project not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              {project.project_url && (
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  {project.project_url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="requests" className="gap-2">
                <FileText className="h-4 w-4" />
                Requests
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <StickyNote className="h-4 w-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-2">
                <Info className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<RequestsTab projectId={projectId!} />} />
          <Route path="notes" element={<NotesTab projectId={projectId!} />} />
          <Route path="details" element={<DetailsTab project={project} />} />
          <Route path="settings" element={<ProjectSettingsTab project={project} />} />
        </Routes>
      </div>
    </div>
  )
}
