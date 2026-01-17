import { useState } from 'react'
import { Plus, Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRequests } from '@/hooks/useRequests'
import { useTeam } from '@/hooks/useAgency'
import { formatRelativeTime, getStatusColor, getTypeColor, getPriorityColor } from '@/lib/utils'
import { REQUEST_STATUSES, REQUEST_TYPES, REQUEST_PRIORITIES } from '@/lib/constants'
import type { RequestFilters } from '@/types/api.types'
import { RequestSlideOver } from './RequestSlideOver'

interface RequestsTabProps {
  projectId: string
}

export function RequestsTab({ projectId }: RequestsTabProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [filters, setFilters] = useState<RequestFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { data: requests, isLoading } = useRequests(projectId, {
    ...filters,
    search: searchQuery || undefined,
  })
  const { data: team } = useTeam()

  const hasActiveFilters =
    filters.status || filters.type || filters.priority || filters.assigned

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  return (
    <div className="flex h-full">
      {/* Request list */}
      <div className="flex-1 flex flex-col border-r">
        {/* Filters */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as any })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {REQUEST_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(v) => setFilters({ ...filters, type: v === 'all' ? undefined : v as any })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {REQUEST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.assigned || 'all'}
              onValueChange={(v) => setFilters({ ...filters, assigned: v === 'all' ? undefined : v })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="me">Assigned to me</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Request list */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="p-4 space-y-2">
              {requests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequestId(request.id)}
                  className={`w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors ${
                    selectedRequestId === request.id ? 'ring-2 ring-primary bg-muted' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={getTypeColor(request.type)}>
                          {request.type}
                        </Badge>
                        {request.priority === 'urgent' && (
                          <Badge variant="outline" className={getPriorityColor(request.priority)}>
                            Urgent
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{formatRelativeTime(request.created_at)}</span>
                    {request.assignments && request.assignments.length > 0 && (
                      <span>
                        {request.assignments.map((a) => a.user?.name).join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No requests found</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Request slide-over */}
      {selectedRequestId && (
        <RequestSlideOver
          requestId={selectedRequestId}
          projectId={projectId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  )
}
