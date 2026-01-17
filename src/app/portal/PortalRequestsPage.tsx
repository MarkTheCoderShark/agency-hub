import { Link, useParams, useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Plus, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { formatRelativeTime, getStatusColor, getTypeColor } from '@/lib/utils'

export function PortalRequestsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user } = useAuth()
  const { clientProjects } = useOutletContext<any>()

  const project = clientProjects?.[0]

  const { data: requests, isLoading } = useQuery({
    queryKey: ['client-requests-all', project?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('project_id', project.id)
        .eq('created_by', user!.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!project?.id && !!user?.id,
  })

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Requests</h1>
        <Link to={`/portal/${slug}/requests/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Requests list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="h-5 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2 mt-2" />
            </Card>
          ))}
        </div>
      ) : requests && requests.length > 0 ? (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link
              key={request.id}
              to={`/portal/${slug}/requests/${request.id}`}
              className="block"
            >
              <Card className="p-4 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{request.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className={getTypeColor(request.type)}>
                        {request.type}
                      </Badge>
                      {request.priority === 'urgent' && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {formatRelativeTime(request.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {request.description}
                    </p>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status.replace('_', ' ')}
                  </Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No requests yet</h3>
            <p className="mt-2 text-muted-foreground">
              Submit your first request to get started.
            </p>
            <Link to={`/portal/${slug}/requests/new`}>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
