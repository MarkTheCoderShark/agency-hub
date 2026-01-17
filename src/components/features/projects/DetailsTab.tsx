import { ExternalLink, Globe, Server, Code, CreditCard } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types/database.types'
import { formatDateTime } from '@/lib/utils'

interface DetailsTabProps {
  project: Project
}

export function DetailsTab({ project }: DetailsTabProps) {
  const details = [
    {
      icon: Globe,
      label: 'Project URL',
      value: project.project_url,
      isLink: true,
    },
    {
      icon: Globe,
      label: 'Staging URL',
      value: project.staging_url,
      isLink: true,
    },
    {
      icon: Server,
      label: 'Hosting Provider',
      value: project.hosting_provider,
    },
    {
      icon: Code,
      label: 'Tech Stack',
      value: project.tech_stack,
    },
    {
      icon: CreditCard,
      label: 'Payment Link',
      value: project.payment_link,
      isLink: true,
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Information about this project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {project.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm">{project.description}</p>
            </div>
          )}

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="space-y-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <detail.icon className="h-4 w-4" />
                  {detail.label}
                </div>
                {detail.value ? (
                  detail.isLink ? (
                    <a
                      href={detail.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {detail.value}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <p className="text-sm">{detail.value}</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground italic">Not set</p>
                )}
              </div>
            ))}
          </div>

          {/* Metadata */}
          <div className="pt-4 border-t">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <span className="text-muted-foreground">Created</span>
                <p>{formatDateTime(project.created_at)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated</span>
                <p>{formatDateTime(project.updated_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
