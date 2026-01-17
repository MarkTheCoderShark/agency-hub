import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, UserMinus, Mail, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  useUpdateProject,
  useDeleteProject,
  useProjectMembers,
  useAddProjectMember,
  useInviteClient,
  useRemoveProjectMember,
} from '@/hooks/useProjects'
import { useTeam } from '@/hooks/useAgency'
import type { Project } from '@/types/database.types'
import { PROJECT_STATUSES } from '@/lib/constants'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  status: z.string(),
  project_url: z.string().optional(),
  staging_url: z.string().optional(),
  hosting_provider: z.string().optional(),
  tech_stack: z.string().optional(),
  payment_link: z.string().optional(),
})

type ProjectForm = z.infer<typeof projectSchema>

interface ProjectSettingsTabProps {
  project: Project
}

export function ProjectSettingsTab({ project }: ProjectSettingsTabProps) {
  const navigate = useNavigate()
  const [inviteClientOpen, setInviteClientOpen] = useState(false)
  const [addMemberOpen, setAddMemberOpen] = useState(false)
  const [clientEmail, setClientEmail] = useState('')

  const { data: members } = useProjectMembers(project.id)
  const { data: team } = useTeam()
  const updateProject = useUpdateProject()
  const deleteProject = useDeleteProject()
  const addMember = useAddProjectMember()
  const inviteClient = useInviteClient()
  const removeMember = useRemoveProjectMember()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
      status: project.status,
      project_url: project.project_url || '',
      staging_url: project.staging_url || '',
      hosting_provider: project.hosting_provider || '',
      tech_stack: project.tech_stack || '',
      payment_link: project.payment_link || '',
    },
  })

  const onSubmit = (data: ProjectForm) => {
    updateProject.mutate({
      projectId: project.id,
      data: {
        name: data.name,
        description: data.description || null,
        status: data.status as any,
        project_url: data.project_url || null,
        staging_url: data.staging_url || null,
        hosting_provider: data.hosting_provider || null,
        tech_stack: data.tech_stack || null,
        payment_link: data.payment_link || null,
      },
    })
  }

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => navigate('/projects'),
    })
  }

  const handleInviteClient = () => {
    if (!clientEmail.trim()) {
      toast.error('Email is required')
      return
    }

    inviteClient.mutate(
      { projectId: project.id, email: clientEmail },
      {
        onSuccess: () => {
          setInviteClientOpen(false)
          setClientEmail('')
        },
      }
    )
  }

  const handleAddMember = (userId: string, role: 'lead' | 'staff') => {
    addMember.mutate(
      { projectId: project.id, userId, role },
      { onSuccess: () => setAddMemberOpen(false) }
    )
  }

  const staffMembers = members?.filter((m) => m.role !== 'client') ?? []
  const clientMembers = members?.filter((m) => m.role === 'client') ?? []
  const availableTeam = team?.filter(
    (t) => t.user_id && !members?.some((m) => m.user_id === t.user_id)
  ) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Project settings form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Settings</CardTitle>
          <CardDescription>Update project information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  defaultValue={project.status}
                  onValueChange={(v) => setValue('status', v, { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="project_url">Project URL</Label>
                <Input id="project_url" {...register('project_url')} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="staging_url">Staging URL</Label>
                <Input id="staging_url" {...register('staging_url')} placeholder="https://..." />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="hosting_provider">Hosting Provider</Label>
                <Input id="hosting_provider" {...register('hosting_provider')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tech_stack">Tech Stack</Label>
                <Input id="tech_stack" {...register('tech_stack')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_link">Payment Link</Label>
              <Input id="payment_link" {...register('payment_link')} placeholder="https://..." />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || updateProject.isPending}>
                {updateProject.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Team members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Staff assigned to this project</CardDescription>
          </div>
          <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Team Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {availableTeam.length > 0 ? (
                  availableTeam.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.user?.name ? getInitials(member.user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{member.user?.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddMember(member.user_id!, 'staff')}
                        >
                          Staff
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleAddMember(member.user_id!, 'lead')}
                        >
                          Lead
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">All team members are assigned</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {staffMembers.length > 0 ? (
            <div className="space-y-3">
              {staffMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.user?.name ? getInitials(member.user.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user?.name}</p>
                      <Badge variant="secondary">{member.role}</Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember.mutate({ projectId: project.id, memberId: member.id })}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No team members assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clients</CardTitle>
            <CardDescription>Client access to this project</CardDescription>
          </div>
          <Dialog open={inviteClientOpen} onOpenChange={setInviteClientOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Mail className="mr-2 h-4 w-4" />
                Invite Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Client</DialogTitle>
                <DialogDescription>
                  Send an invitation for the client to access this project.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email address</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteClientOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteClient} disabled={inviteClient.isPending}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {clientMembers.length > 0 ? (
            <div className="space-y-3">
              {clientMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.user?.name || member.invitation_email
                          ? getInitials(member.user?.name || member.invitation_email || '')
                          : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user?.name || member.invitation_email}
                      </p>
                      {!member.user_id && (
                        <Badge variant="outline">Pending</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMember.mutate({ projectId: project.id, memberId: member.id })}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No clients invited yet</p>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Delete Project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All requests, messages, and files associated
                  with this project will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
