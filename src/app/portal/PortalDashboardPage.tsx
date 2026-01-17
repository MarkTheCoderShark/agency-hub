import { Link, useParams, useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, FileText, ExternalLink } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime, getStatusColor, getTypeColor } from '@/lib/utils'

export function PortalDashboardPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { agency, clientProjects } = useOutletContext<any>()

  const project = clientProjects?.[0] // For now, use first project

  const { data: requests } = useQuery({
    queryKey: ['client-requests', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('project_id', project.id)
        .eq('created_by', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data
    },
    enabled: !!project?.id && !!user?.id,
  })

  const { data: stats } = useQuery({
    queryKey: ['client-stats', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('status')
        .eq('project_id', project.id)
        .eq('created_by', user!.id)
        .is('deleted_at', null)

      if (error) throw error

      return {
        submitted: data.filter((r) => r.status === 'submitted').length,
        in_progress: data.filter((r) => r.status === 'in_progress').length,
        complete: data.filter((r) => r.status === 'complete').length,
      }
    },
    enabled: !!project?.id && !!user?.id,
  })

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">No projects found</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Project header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">{stats?.submitted ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">{stats?.in_progress ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.complete ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Submit request button */}
      <Link to={`/portal/${slug}/requests/new`}>
        <Button size="lg" className="w-full">
          <Plus className="mr-2 h-5 w-5" />
          Submit New Request
        </Button>
      </Link>

      {/* Recent requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Requests</CardTitle>
            <CardDescription>Your latest submissions</CardDescription>
          </div>
          <Link to={`/portal/${slug}/requests`}>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {requests && requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/portal/${slug}/requests/${request.id}`}
                  className="block p-4 border rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getTypeColor(request.type)}>
                          {request.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatRelativeTime(request.created_at)}
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No requests yet</p>
              <Link to={`/portal/${slug}/requests/new`}>
                <Button variant="outline" size="sm" className="mt-4">
                  Submit your first request
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment button */}
      {project.payment_link && (
        <a href={project.payment_link} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg" className="w-full">
            <ExternalLink className="mr-2 h-5 w-5" />
            Make Payment
          </Button>
        </a>
      )}
    </div>
  )
}
