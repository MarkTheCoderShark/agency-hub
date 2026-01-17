import { useEffect } from 'react'
import { Outlet, Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { Bell, ChevronDown, LogOut, Settings, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth, useUserProfile, useSignOut } from '@/hooks/useAuth'
import { useUnreadNotificationCount } from '@/hooks/useNotifications'
import { getInitials } from '@/lib/utils'

export function PortalLayout() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading } = useAuth()
  const { data: profile } = useUserProfile()
  const signOut = useSignOut()
  const unreadCount = useUnreadNotificationCount()

  // Fetch agency by slug
  const { data: agency, isLoading: agencyLoading } = useQuery({
    queryKey: ['portal-agency', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Slug is required')
      const { data, error } = await supabase
        .from('agencies')
        .select('*, subscription:agency_subscriptions(*)')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!slug,
  })

  // Fetch client's projects in this agency
  const { data: clientProjects } = useQuery({
    queryKey: ['client-projects', user?.id, agency?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_members')
        .select(`
          project:projects(*)
        `)
        .eq('user_id', user!.id)
        .eq('role', 'client')

      if (error) throw error
      return data
        .map((pm) => pm.project)
        .filter((p) => p && p.agency_id === agency?.id)
    },
    enabled: !!user?.id && !!agency?.id,
  })

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate(`/portal/${slug}/login`, { replace: true })
    }
  }, [authLoading, user, navigate, slug])

  if (authLoading || agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleSignOut = () => {
    signOut.mutate()
  }

  const handleProjectChange = (projectId: string) => {
    // Store selected project and refresh
    // For now just refresh the page
    navigate(`/portal/${slug}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="h-16 border-b bg-background flex items-center justify-between px-4 lg:px-6">
        {/* Agency logo/name */}
        <Link to={`/portal/${slug}`} className="flex items-center gap-2">
          {agency?.logo_url ? (
            <img
              src={agency.logo_url}
              alt={agency.name}
              className="h-8 max-w-[180px] object-contain"
            />
          ) : (
            <span className="font-semibold text-lg">{agency?.name}</span>
          )}
        </Link>

        {/* Project selector (if multiple projects) */}
        {clientProjects && clientProjects.length > 1 && (
          <Select onValueChange={handleProjectChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {clientProjects.map((project) => (
                <SelectItem key={project!.id} value={project!.id}>
                  {project!.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback>
                    {profile?.name ? getInitials(profile.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{profile?.name}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {profile?.email}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate(`/portal/${slug}/settings`)}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet context={{ agency, clientProjects }} />
      </main>

      {/* Footer */}
      {!agency?.subscription?.white_label_enabled && (
        <footer className="h-12 border-t bg-background flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by{' '}
            <a
              href="https://agencyhub.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              AgencyHub
            </a>
          </p>
        </footer>
      )}
    </div>
  )
}
