import { useState } from 'react'
import { Plus, Edit2, Trash2, Zap, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
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
  useAutomationRules,
  useCreateAutomationRule,
  useUpdateAutomationRule,
  useDeleteAutomationRule,
  getTriggerLabel,
  getActionLabel,
  AUTOMATION_TRIGGERS,
  AUTOMATION_ACTIONS,
} from '@/hooks/useAutomation'
import { useTeam } from '@/hooks/useAgency'
import { useTags } from '@/hooks/useTags'
import { REQUEST_TYPES, REQUEST_PRIORITIES, REQUEST_STATUSES } from '@/lib/constants'
import type { AutomationRule, AutomationTrigger, AutomationAction } from '@/types/database.types'
import type { CreateAutomationRuleRequest, UpdateAutomationRuleRequest, ActionConfig } from '@/types/api.types'

export function AutomationManager() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null)

  const { data: rules, isLoading } = useAutomationRules()
  const createRule = useCreateAutomationRule()
  const updateRule = useUpdateAutomationRule()
  const deleteRule = useDeleteAutomationRule()

  const handleDelete = (rule: AutomationRule) => {
    if (confirm(`Delete automation "${rule.name}"?`)) {
      deleteRule.mutate(rule.id)
    }
  }

  const handleToggleActive = (rule: AutomationRule) => {
    updateRule.mutate({
      ruleId: rule.id,
      data: { is_active: !rule.is_active },
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
          <h3 className="text-lg font-medium">Automation Rules</h3>
          <p className="text-sm text-muted-foreground">
            Automate repetitive tasks when certain events occur.
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <AutomationDialog
            onSubmit={(data) => {
              createRule.mutate(data, {
                onSuccess: () => setCreateDialogOpen(false),
              })
            }}
            isLoading={createRule.isPending}
          />
        </Dialog>
      </div>

      {rules && rules.length > 0 ? (
        <div className="space-y-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className={`flex items-start gap-4 p-4 border rounded-lg ${
                !rule.is_active ? 'opacity-60' : ''
              }`}
            >
              <Zap className={`h-5 w-5 mt-0.5 ${rule.is_active ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{rule.name}</h4>
                  {!rule.is_active && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                {rule.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {rule.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Badge variant="outline">
                    When: {getTriggerLabel(rule.trigger_type)}
                  </Badge>
                  <span className="text-muted-foreground">→</span>
                  <Badge variant="outline">
                    Then: {getActionLabel(rule.action_type)}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggleActive(rule)}
                  title={rule.is_active ? 'Deactivate' : 'Activate'}
                >
                  {rule.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
                <Dialog
                  open={editingRule?.id === rule.id}
                  onOpenChange={(open) => !open && setEditingRule(null)}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingRule(rule)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <AutomationDialog
                    rule={rule}
                    onSubmit={(data) => {
                      updateRule.mutate(
                        { ruleId: rule.id, data },
                        { onSuccess: () => setEditingRule(null) }
                      )
                    }}
                    isLoading={updateRule.isPending}
                  />
                </Dialog>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(rule)}
                  disabled={deleteRule.isPending}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h4 className="font-medium mb-1">No automation rules</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create rules to automate your workflow.
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create First Rule
          </Button>
        </div>
      )}
    </div>
  )
}

interface AutomationDialogProps {
  rule?: AutomationRule
  onSubmit: (data: CreateAutomationRuleRequest | UpdateAutomationRuleRequest) => void
  isLoading: boolean
}

function AutomationDialog({ rule, onSubmit, isLoading }: AutomationDialogProps) {
  const [name, setName] = useState(rule?.name || '')
  const [description, setDescription] = useState(rule?.description || '')
  const [triggerType, setTriggerType] = useState<AutomationTrigger>(
    rule?.trigger_type || 'request_created'
  )
  const [actionType, setActionType] = useState<AutomationAction>(
    rule?.action_type || 'assign_user'
  )
  const [actionConfig, setActionConfig] = useState<ActionConfig>(
    (rule?.action_config as ActionConfig) || {}
  )
  const [isActive, setIsActive] = useState(rule?.is_active ?? true)

  const { data: team } = useTeam()
  const { data: tags } = useTags()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      description: description || undefined,
      trigger_type: triggerType,
      action_type: actionType,
      action_config: actionConfig,
      is_active: isActive,
    })
  }

  const renderActionConfig = () => {
    switch (actionType) {
      case 'assign_user':
        return (
          <div className="space-y-2">
            <Label>Assign To</Label>
            <Select
              value={(actionConfig as any).user_id || ''}
              onValueChange={(v) => setActionConfig({ user_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {team?.filter(m => m.user_id).map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id!}>
                    {member.user?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'set_priority':
        return (
          <div className="space-y-2">
            <Label>Set Priority To</Label>
            <Select
              value={(actionConfig as any).priority || ''}
              onValueChange={(v) => setActionConfig({ priority: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_PRIORITIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'add_tag':
        return (
          <div className="space-y-2">
            <Label>Add Tag</Label>
            <Select
              value={(actionConfig as any).tag_id || ''}
              onValueChange={(v) => setActionConfig({ tag_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                {tags?.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'change_status':
        return (
          <div className="space-y-2">
            <Label>Change Status To</Label>
            <Select
              value={(actionConfig as any).status || ''}
              onValueChange={(v) => setActionConfig({ status: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {REQUEST_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      case 'send_notification':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Notify</Label>
              <Select
                value={(actionConfig as any).user_ids?.[0] || ''}
                onValueChange={(v) => setActionConfig({
                  ...actionConfig,
                  user_ids: [v],
                  message: (actionConfig as any).message || ''
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {team?.filter(m => m.user_id).map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id!}>
                      {member.user?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={(actionConfig as any).message || ''}
                onChange={(e) => setActionConfig({
                  ...actionConfig,
                  message: e.target.value
                })}
                placeholder="Notification message..."
                rows={2}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DialogContent className="max-w-lg">
      <DialogHeader>
        <DialogTitle>
          {rule ? 'Edit Automation' : 'Create Automation'}
        </DialogTitle>
        <DialogDescription>
          {rule
            ? 'Update this automation rule.'
            : 'Create a rule to automate actions when events occur.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Name *</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Auto-assign bugs to John"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this rule do?"
          />
        </div>

        <div className="space-y-2">
          <Label>When (Trigger)</Label>
          <Select value={triggerType} onValueChange={(v) => setTriggerType(v as AutomationTrigger)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTOMATION_TRIGGERS.map((trigger) => (
                <SelectItem key={trigger.value} value={trigger.value}>
                  <div>
                    <span className="font-medium">{trigger.label}</span>
                    <span className="text-muted-foreground ml-2">- {trigger.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Then (Action)</Label>
          <Select
            value={actionType}
            onValueChange={(v) => {
              setActionType(v as AutomationAction)
              setActionConfig({})
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AUTOMATION_ACTIONS.map((action) => (
                <SelectItem key={action.value} value={action.value}>
                  <div>
                    <span className="font-medium">{action.label}</span>
                    <span className="text-muted-foreground ml-2">- {action.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderActionConfig()}

        <div className="flex items-center justify-between">
          <Label htmlFor="isActive">Active</Label>
          <Switch
            id="isActive"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading || !name}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {rule ? 'Save Changes' : 'Create Rule'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
