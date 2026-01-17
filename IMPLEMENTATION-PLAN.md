# AgencyHub Web Platform - Implementation Plan

**Version:** 1.0
**Date:** January 17, 2025
**Platform:** Web (React + TypeScript + Supabase)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Analysis & Fixes](#database-schema-analysis--fixes)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Implementation Phases](#implementation-phases)
6. [API Architecture](#api-architecture)
7. [Component Architecture](#component-architecture)
8. [Security Considerations](#security-considerations)

---

## Executive Summary

This document outlines the implementation plan for the AgencyHub web platform. We will build a full-featured client management system for digital agencies using:

- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **Payments:** Stripe
- **State Management:** TanStack Query + Zustand
- **Forms:** React Hook Form + Zod

---

## Database Schema Analysis & Fixes

### Issues Identified in PRD Schema

#### 1. **Table Dependency Order**
The `attachments` table references `project_notes` before it's created. Fixed by reordering.

#### 2. **Missing Soft Delete Support**
Tables lack `deleted_at` columns for soft deletes. Added to:
- `users`
- `agencies`
- `projects`
- `requests`
- `request_messages`
- `project_notes`

#### 3. **Storage Usage View Incomplete**
Original view only counts attachments on requests. Fixed to include message and note attachments.

#### 4. **Active Clients View Logic**
Fixed to track clients based on request updates, not just creation.

#### 5. **Missing User Device Tokens Table**
Needed for push notifications (future iOS support).

#### 6. **Missing Audit Trail**
Added `updated_by` to key tables for accountability.

#### 7. **Index Optimizations**
Added composite indexes for common query patterns.

### Schema Corrections Applied

See `supabase/migrations/` for the corrected schema.

---

## Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.3 | UI Framework |
| typescript | ^5.4 | Type Safety |
| vite | ^5.4 | Build Tool |
| @supabase/supabase-js | ^2.45 | Backend Client |
| @tanstack/react-query | ^5.51 | Data Fetching |
| react-router-dom | ^6.26 | Routing |
| tailwindcss | ^3.4 | Styling |
| @stripe/stripe-js | ^4.3 | Payments |
| zustand | ^4.5 | UI State |
| react-hook-form | ^7.52 | Forms |
| zod | ^3.23 | Validation |
| date-fns | ^3.6 | Dates |
| @tiptap/react | ^2.5 | Rich Text |
| recharts | ^2.12 | Charts |
| lucide-react | ^0.427 | Icons |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| eslint | Linting |
| prettier | Code Formatting |
| vitest | Unit Testing |
| @testing-library/react | Component Testing |
| playwright | E2E Testing |

---

## Project Structure

```
agency-hub/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/                          # Route pages
│   │   ├── (auth)/                   # Auth pages (layout)
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── (dashboard)/              # Agency dashboard (layout)
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── requests/
│   │   │   │   │   ├── notes/
│   │   │   │   │   └── settings/
│   │   │   ├── team/
│   │   │   ├── settings/
│   │   │   │   ├── general/
│   │   │   │   ├── billing/
│   │   │   │   └── import/
│   │   │   └── profile/
│   │   ├── portal/                   # Client portal
│   │   │   └── [slug]/
│   │   │       ├── login/
│   │   │       ├── dashboard/
│   │   │       ├── requests/
│   │   │       │   ├── new/
│   │   │       │   └── [id]/
│   │   │       └── settings/
│   │   └── invitation/               # Invitation acceptance
│   │       └── [token]/
│   ├── components/
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── forms/                    # Form components
│   │   ├── layouts/                  # Layout components
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── PortalLayout.tsx
│   │   └── features/                 # Feature-specific components
│   │       ├── auth/
│   │       ├── projects/
│   │       ├── requests/
│   │       ├── messages/
│   │       ├── notifications/
│   │       └── dashboard/
│   ├── hooks/                        # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useAgency.ts
│   │   ├── useProjects.ts
│   │   ├── useRequests.ts
│   │   ├── useNotifications.ts
│   │   └── useSubscription.ts
│   ├── lib/                          # Utilities & configurations
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── auth.ts
│   │   │   ├── database.ts
│   │   │   └── storage.ts
│   │   ├── stripe.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── stores/                       # Zustand stores
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── notificationStore.ts
│   ├── types/                        # TypeScript types
│   │   ├── database.types.ts         # Generated from Supabase
│   │   ├── api.types.ts
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── supabase/
│   ├── migrations/                   # SQL migrations
│   ├── functions/                    # Edge functions
│   │   ├── send-notification/
│   │   ├── process-invitation/
│   │   ├── stripe-webhook/
│   │   └── calculate-usage/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── .env.local
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## Implementation Phases

### Phase 1: Foundation (Days 1-2)

#### 1.1 Project Setup
- [x] Initialize Vite + React + TypeScript project
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Set up ESLint + Prettier
- [x] Configure path aliases
- [x] Set up environment variables

#### 1.2 Supabase Configuration
- [x] Create Supabase project
- [x] Set up database migrations
- [x] Configure Row Level Security (RLS)
- [x] Create storage buckets
- [x] Set up realtime subscriptions

#### 1.3 Base Components
- [x] Install and configure shadcn/ui components
- [x] Create layout components
- [x] Set up routing structure
- [x] Create loading/error states

---

### Phase 2: Authentication (Days 2-3)

#### 2.1 Auth Foundation
- [ ] Supabase Auth configuration
- [ ] Auth context/provider
- [ ] Protected route component
- [ ] Session management

#### 2.2 Auth Pages
- [ ] Login page (email/password)
- [ ] Register page (creates agency)
- [ ] Forgot password page
- [ ] Reset password page
- [ ] Email verification page

#### 2.3 Invitation System
- [ ] Staff invitation email template
- [ ] Client invitation email template
- [ ] Invitation acceptance page
- [ ] Invitation expiry handling

---

### Phase 3: Agency Core (Days 3-5)

#### 3.1 Agency Management
- [ ] Agency settings page
- [ ] Logo upload functionality
- [ ] Brand color picker (tier-gated)
- [ ] Timezone selection

#### 3.2 Team Management
- [ ] Team members list
- [ ] Invite staff modal
- [ ] Remove staff confirmation
- [ ] Pending invitations view
- [ ] Staff limit enforcement

#### 3.3 Agency Dashboard
- [ ] Overview stats cards
- [ ] Recent activity feed
- [ ] Projects summary
- [ ] Quick actions

---

### Phase 4: Project System (Days 5-7)

#### 4.1 Project CRUD
- [ ] Projects list page
- [ ] Create project modal
- [ ] Project detail page
- [ ] Edit project form
- [ ] Archive/delete project

#### 4.2 Project Members
- [ ] Assign project leads
- [ ] Assign staff members
- [ ] Invite clients to project
- [ ] Remove project members
- [ ] Client limit enforcement

#### 4.3 Project Notes
- [ ] Notes list view
- [ ] Create/edit note
- [ ] Pin/unpin notes
- [ ] Delete notes
- [ ] Attachments on notes

---

### Phase 5: Request System (Days 7-10)

#### 5.1 Request Management
- [ ] Requests list with filters
- [ ] Request slide-over panel
- [ ] Create request (client-side)
- [ ] Update request status
- [ ] Assign staff to requests
- [ ] Priority management

#### 5.2 Conversation Thread
- [ ] Message list component
- [ ] Rich text message input
- [ ] Send message
- [ ] Edit message (within 5 min)
- [ ] Delete message (soft)

#### 5.3 Internal Notes
- [ ] Internal notes tab
- [ ] Add internal note
- [ ] Edit/delete internal notes
- [ ] Visual distinction from public messages

#### 5.4 Attachments
- [ ] File upload component
- [ ] Attachment preview
- [ ] Download attachment
- [ ] Delete attachment
- [ ] Storage limit enforcement

---

### Phase 6: Client Portal (Days 10-12)

#### 6.1 Portal Foundation
- [ ] Agency-branded portal layout
- [ ] Portal login page
- [ ] Portal authentication flow
- [ ] Multi-project selector

#### 6.2 Portal Dashboard
- [ ] Project overview
- [ ] Request statistics
- [ ] Recent requests
- [ ] Submit request button
- [ ] Payment button (if configured)

#### 6.3 Portal Requests
- [ ] Request list view
- [ ] Request detail view
- [ ] New request form
- [ ] Conversation interface
- [ ] File attachments

---

### Phase 7: Notifications (Days 12-13)

#### 7.1 In-App Notifications
- [ ] Notification bell component
- [ ] Notifications dropdown
- [ ] Mark as read
- [ ] Mark all as read
- [ ] Notification preferences

#### 7.2 Email Notifications
- [ ] Email templates
- [ ] Supabase Edge Function for sending
- [ ] Notification triggers (DB triggers)
- [ ] Unsubscribe handling

#### 7.3 Realtime Updates
- [ ] Request status updates
- [ ] New message notifications
- [ ] Presence indicators

---

### Phase 8: Dashboard & Analytics (Days 13-14)

#### 8.1 Agency Dashboard
- [ ] Active clients gauge
- [ ] Storage usage indicator
- [ ] Requests by status chart
- [ ] Requests by type chart
- [ ] Activity timeline

#### 8.2 Project Dashboard
- [ ] Request statistics
- [ ] Average completion time
- [ ] Requests over time chart
- [ ] Request type breakdown

#### 8.3 Activity Log
- [ ] Activity log component
- [ ] Filter by action type
- [ ] Export to CSV (tier-gated)

---

### Phase 9: Billing & Subscriptions (Days 14-16)

#### 9.1 Stripe Integration
- [ ] Stripe configuration
- [ ] Webhook handler (Edge Function)
- [ ] Customer creation

#### 9.2 Subscription Management
- [ ] Pricing page
- [ ] Checkout session creation
- [ ] Billing portal integration
- [ ] Subscription status display

#### 9.3 Tier Enforcement
- [ ] Client limit checks
- [ ] Project limit checks
- [ ] Staff limit checks
- [ ] Storage limit checks
- [ ] Feature gating by tier

---

### Phase 10: Polish & Testing (Days 16-18)

#### 10.1 UI Polish
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Mobile responsiveness
- [ ] Accessibility audit

#### 10.2 Testing
- [ ] Unit tests for utilities
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E tests for critical flows

#### 10.3 Performance
- [ ] Code splitting
- [ ] Image optimization
- [ ] Query optimization
- [ ] Caching strategy

---

## API Architecture

### Supabase Client Configuration

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### Query Patterns with TanStack Query

```typescript
// hooks/useProjects.ts
export function useProjects() {
  const { data: agency } = useAgency()

  return useQuery({
    queryKey: ['projects', agency?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_members (
            user_id,
            role,
            user:users (name, avatar_url)
          ),
          requests (count)
        `)
        .eq('agency_id', agency!.id)
        .neq('status', 'archived')
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!agency?.id,
  })
}
```

### Realtime Subscriptions

```typescript
// hooks/useRealtimeRequests.ts
export function useRealtimeRequests(projectId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel(`requests:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `project_id=eq.${projectId}`,
        },
        (payload) => {
          queryClient.invalidateQueries(['requests', projectId])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, queryClient])
}
```

---

## Component Architecture

### Layout Components

```
DashboardLayout
├── Sidebar
│   ├── Logo
│   ├── Navigation
│   │   ├── NavItem (Dashboard)
│   │   ├── NavItem (Projects)
│   │   ├── NavItem (Team)
│   │   └── NavItem (Settings)
│   └── UpgradeCard
├── Header
│   ├── Search
│   ├── NotificationBell
│   └── UserMenu
└── Main (children)

PortalLayout
├── Header
│   ├── AgencyLogo
│   ├── ProjectSelector
│   ├── NotificationBell
│   └── UserMenu
└── Main (children)
```

### Feature Components

```
ProjectDetail
├── ProjectHeader
│   ├── ProjectTitle
│   ├── ProjectStatus
│   └── ProjectActions
├── TabNavigation
└── TabContent
    ├── RequestsTab
    │   ├── RequestFilters
    │   ├── RequestList
    │   │   └── RequestCard (many)
    │   └── RequestSlideOver
    │       ├── RequestHeader
    │       ├── RequestMeta
    │       ├── ConversationTabs
    │       │   ├── MessagesTab
    │       │   └── InternalNotesTab
    │       └── MessageInput
    ├── NotesTab
    │   ├── NotesList
    │   └── NoteEditor
    └── DetailsTab
        └── ProjectForm
```

---

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring:

1. **Users** can only read their own profile
2. **Agency members** can only access their agency's data
3. **Project members** can only access their assigned projects
4. **Clients** can only see non-internal messages
5. **Attachments** follow parent resource permissions

### Input Validation

- All user inputs validated with Zod schemas
- File uploads validated for type and size
- Rich text sanitized before storage

### Rate Limiting

- Auth endpoints rate limited by Supabase
- API calls rate limited by tier
- File uploads rate limited

### Sensitive Data

- Passwords hashed by Supabase Auth (bcrypt)
- API keys stored in environment variables
- Stripe webhook signatures verified
- Invitation tokens are cryptographically random

---

## Deployment Strategy

### Environment Configuration

```env
# .env.example
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_STRIPE_PUBLISHABLE_KEY=pk_xxx
VITE_APP_URL=https://app.agencyhub.com
```

### CI/CD Pipeline

1. **PR Checks:** Lint, type check, unit tests
2. **Staging:** Auto-deploy on merge to `develop`
3. **Production:** Manual deploy on merge to `main`

### Monitoring

- Error tracking: Sentry
- Analytics: PostHog or Mixpanel
- Uptime monitoring: BetterStack

---

## Next Steps

1. Initialize the project with the defined structure
2. Set up Supabase with corrected database schema
3. Begin Phase 1 implementation
4. Iterate through remaining phases

---

*Document created: January 17, 2025*
