import { FileText, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useActiveRequestTemplates } from '@/hooks/useTemplates'
import { getTypeColor } from '@/lib/utils'
import type { RequestTemplate } from '@/types/database.types'

interface TemplateSelectorProps {
  onSelect: (template: RequestTemplate) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const { data: templates, isLoading } = useActiveRequestTemplates()

  if (isLoading || !templates || templates.length === 0) {
    return null
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="h-4 w-4" />
          Use Template
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <h4 className="font-medium text-sm">Request Templates</h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            Start with a pre-defined template
          </p>
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="p-2">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelect(template)}
                className="w-full text-left p-3 rounded-md hover:bg-muted transition-colors flex items-start gap-3"
              >
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                      {template.name}
                    </span>
                    <Badge
                      variant="outline"
                      className={`${getTypeColor(template.default_type)} text-xs`}
                    >
                      {template.default_type}
                    </Badge>
                  </div>
                  {template.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
