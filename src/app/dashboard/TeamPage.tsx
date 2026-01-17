import { useState } from 'react'
import { Plus, Mail, MoreHorizontal, UserX, RefreshCw, Shield, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useTeam,
  useInviteStaff,
  useRemoveTeamMember,
  useResendInvitation,
} from '@/hooks/useAgency'
import { useAuth, useUserAgency } from '@/hooks/useAuth'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'

export function TeamPage() {
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')

  const { user } = useAuth()
  const { data: agency } = useUserAgency()
  const { data: members, isLoading } = useTeam()
  const inviteStaff = useInviteStaff()
  const removeMember = useRemoveTeamMember()
  const resendInvitation = useResendInvitation()

  const isOwner = agency?.owner_id === user?.id

  const handleInvite = () => {
    if (!inviteEmail.trim()) {
      toast.error('Email is required')
      return
    }

    inviteStaff.mutate(inviteEmail, {
      onSuccess: () => {
        setInviteDialogOpen(false)
        setInviteEmail('')
      },
    })
  }

  const activeMembers = members?.filter((m) => m.user_id) ?? []
  const pendingInvitations = members?.filter((m) => !m.user_id) ?? []

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        {isOwner && (
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your agency.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite} disabled={inviteStaff.isPending}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Active members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/3 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeMembers.length > 0 ? (
            <div className="space-y-4">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {member.user?.name ? getInitials(member.user.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{member.user?.name}</p>
                        {member.role === 'owner' && (
                          <Badge variant="secondary" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Owner
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{member.user?.email}</p>
                    </div>
                  </div>
                  {isOwner && member.role !== 'owner' && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeMember.mutate(member.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-2 text-muted-foreground">No team members yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>
              {pendingInvitations.length} invitation{pendingInvitations.length !== 1 ? 's' : ''} waiting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>
                        <Mail className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{invitation.invitation_email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited {formatRelativeTime(invitation.invited_at!)}
                      </p>
                    </div>
                  </div>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => resendInvitation.mutate(invitation.id)}
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Resend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => removeMember.mutate(invitation.id)}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Cancel
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
