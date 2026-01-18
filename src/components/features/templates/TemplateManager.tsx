import { useState } from 'react'
import { Plus, Edit2, Trash2, FileText, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useRequestTemplates,
  useCreateRequestTemplate,
  useUpdateRequestTemplate,
  useDeleteRequestTemplate,
} from '@/hooks/useTemplates'
import { getTypeColor, getPriorityColor } from '@/lib/utils'
import { REQUEST_TYPES, REQUEST_PRIORITIES } from '@/lib/constants'
import type { RequestTemplate } from '@/types/database.types'
import type { CreateRequestTemplateRequest, UpdateRequestTemplateRequest } from '@/types/api.types'

export function TemplateManager() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<RequestTemplate | null>(null)

  const { data: templates, isLoading } = useRequestTemplates()
  const createTemplate = useCreateRequestTemplate()
  const updateTemplate = useUpdateRequestTemplate()
  const deleteTemplate = useDeleteRequestTemplate()

  const handleDelete = (template: RequestTemplate) => {
    if (confirm(`Delete template "${template.name}"?`)) {
      deleteTemplate.mutate(template.id)
    }
  }

  const handleToggleActive = (template: RequestTemplate) => {
    updateTemplate.mutate({
      templateId: template.id,
      data: { is_active: !template.is_active },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Request Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-defined templates help clients submit consistent, detailed requests.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <TemplateDialog
            onSubmit={(data) => {
              createTemplate.mutate(data, {
                onSuccess: () => setCreateDialogOpen(false),
              })
            }}
            isLoading={createTemplate.isPending}
          />
        </Dialog>
      </div>

      {templates && templates.length > 0 ? (
        <div className="space-y-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <Badge
                    variant="outline"
                    className={getTypeColor(template.default_type)}
                  >
                    {template.default_type}
                  </Badge>
                  {template.default_priority === 'urgent' && (
                    <Badge
                      variant="outline"
                      className={getPriorityColor(template.default_priority)}
                    >
                      Urgent
                    </Badge>
                  )}
                  {!template.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                )}
                {template.title_template && (
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Title:</span> {template.title_template}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(template)}
                  title={template.is_active ? 'Deactivate' : 'Activate'}
                >
                  {template.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Dialog
                  open={editingTemplate?.id === template.id}
                  onOpenChange={(open) => !open && setEditingTemplate(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTemplate(template)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <TemplateDialog
                    template={template}
                    onSubmit={(data) => {
                      updateTemplate.mutate(
                        { templateId: template.id, data },
                        { onSuccess: () => setEditingTemplate(null) }
                      )
                    }}
                    isLoading={updateTemplate.isPending}
                  />
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(template)}
                  disabled={deleteTemplate.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">No templates yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create templates to help clients submit better requests.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Template
          </Button>
        </div>
      )}
    </div>
  )
}

interface TemplateDialogProps {
  template?: RequestTemplate
  onSubmit: (data: CreateRequestTemplateRequest | UpdateRequestTemplateRequest) => void
  isLoading: boolean
}

function TemplateDialog({ template, onSubmit, isLoading }: TemplateDialogProps) {
  const [name, setName] = useState(template?.name || '')
  const [description, setDescription] = useState(template?.description || '')
  const [defaultType, setDefaultType] = useState(template?.default_type || 'bug')
  const [defaultPriority, setDefaultPriority] = useState(template?.default_priority || 'normal')
  const [titleTemplate, setTitleTemplate] = useState(template?.title_template || '')
  const [descriptionTemplate, setDescriptionTemplate] = useState(
    template?.description_template || ''
  )
  const [isActive, setIsActive] = useState(template?.is_active ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      default_type: defaultType as any,
      default_priority: defaultPriority as any,
      title_template: titleTemplate || undefined,
      description_template: descriptionTemplate,
      is_active: isActive,
    })
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {template ? 'Edit Template' : 'Create Template'}
        </DialogTitle>
        <DialogDescription>
          {template
            ? 'Update this request template.'
            : 'Create a new template to streamline request submissions.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bug Report, Feature Request"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short description for clients"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Default Type</Label>
            <Select value={defaultType} onValueChange={setDefaultType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Default Priority</Label>
            <Select value={defaultPriority} onValueChange={setDefaultPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="titleTemplate">Title Template</Label>
          <Input
            id="titleTemplate"
            value={titleTemplate}
            onChange={(e) => setTitleTemplate(e.target.value)}
            placeholder="e.g., [Bug] or [Feature] - leave blank for free-form"
          />
          <p className="text-xs text-muted-foreground">
            Pre-fill the title field, or leave blank.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="descriptionTemplate">Description Template *</Label>
          <Textarea
            id="descriptionTemplate"
            value={descriptionTemplate}
            onChange={(e) => setDescriptionTemplate(e.target.value)}
            placeholder="## What happened?&#10;&#10;## Steps to reproduce&#10;1. &#10;2. &#10;&#10;## Expected behavior&#10;"
            rows={8}
            required
          />
          <p className="text-xs text-muted-foreground">
            Use markdown formatting. This will pre-fill the description.
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading || !name || !descriptionTemplate}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {template ? 'Save Changes' : 'Create Template'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
