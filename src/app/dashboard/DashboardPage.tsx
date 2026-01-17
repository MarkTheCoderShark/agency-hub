import { Link } from 'react-router-dom'
import {
  Users,
  FolderKanban,
  FileText,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAgencyStats, useActiveClients, useStorageUsage } from '@/hooks/useAgency'
import { useProjects } from '@/hooks/useProjects'
import { useUserAgency } from '@/hooks/useAuth'
import { formatRelativeTime, getStatusColor, formatBytes } from '@/lib/utils'

export function DashboardPage() {
  const { data: agency } = useUserAgency()
  const { data: stats, isLoading: statsLoading } = useAgencyStats()
  const { data: activeClients } = useActiveClients()
  const { data: storage } = useStorageUsage()
  const { data: projects } = useProjects()

  const subscription = agency?.subscription
  const clientLimit = subscription?.active_client_limit_override ?? null
  const storageLimit = subscription?.storage_limit_gb_override ?? null

  const statsCards = [
    {
      title: 'Active Clients',
      value: activeClients?.active_client_count ?? 0,
      limit: clientLimit,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Projects',
      value: stats?.active_projects ?? 0,
      icon: FolderKanban,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Open Requests',
      value: (stats?.submitted_requests ?? 0) + (stats?.in_progress_requests ?? 0),
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'In Progress',
      value: stats?.in_progress_requests ?? 0,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Welcome header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your agency.
          </p>
        </div>
        <Link to="/projects">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-full p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.limit && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {' '}
                    / {stat.limit}
                  </span>
                )}
              </div>
              {stat.limit && (
                <Progress
                  value={(stat.value / stat.limit) * 100}
                  className="mt-2 h-1"
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent projects */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Your most recently updated projects</CardDescription>
            </div>
            <Link to="/projects">
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {projects && projects.length > 0 ? (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Updated {formatRelativeTime(project.updated_at)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">No projects yet</p>
                <Link to="/projects">
                  <Button variant="outline" size="sm" className="mt-4">
                    Create your first project
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage usage */}
        <Card>
          <CardHeader>
            <CardTitle>Storage Usage</CardTitle>
            <CardDescription>Your file storage consumption</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Used</span>
                  <span className="text-sm font-medium">
                    {storage ? formatBytes(storage.total_bytes ?? 0) : '0 B'}
                    {storageLimit && ` / ${storageLimit} GB`}
                  </span>
                </div>
                {storageLimit && (
                  <Progress
                    value={((storage?.total_gb ?? 0) / storageLimit) * 100}
                    className="h-2"
                  />
                )}
              </div>

              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{stats?.complete_requests ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Completed Requests</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-2xl font-bold">{stats?.staff_count ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Team Members</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
