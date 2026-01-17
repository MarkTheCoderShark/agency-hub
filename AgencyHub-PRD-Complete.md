# AgencyHub - Product Requirements Document

**Version:** 1.0  
**Date:** January 16, 2025  
**Status:** Ready for Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Pricing Strategy](#pricing-strategy)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Feature Specifications](#feature-specifications)
5. [Database Schema](#database-schema)
6. [API Endpoints](#api-endpoints)
7. [Screen Specifications](#screen-specifications)
8. [Wireframes](#wireframes)
9. [Technical Implementation](#technical-implementation)
10. [MVP Scope & Phases](#mvp-scope--phases)
11. [Success Metrics](#success-metrics)

---

## Executive Summary

### Product Overview

AgencyHub is a client management platform designed for digital agencies to centralize project communication, request tracking, and client collaboration. The platform bridges the gap between internal project management tools and client-facing communication, eliminating scattered email threads and providing a professional, branded client portal.

### Problem Statement

Agencies currently use internal tools (Basecamp, Slack, Linear) for team communication, but client communication happens via email. This creates:
- Lost requests in email threads
- No clear status visibility for clients
- Duplicate communication across channels
- No paper trail for disputes
- Unprofessional client experience

### Solution

A single source of truth for agency-client collaboration with clear separation between internal team discussions and client-visible communications.

### Target Users

- Digital agencies (web development, design, marketing)
- Freelancers managing multiple clients
- Software development shops
- Creative studios

### Platforms

| Platform | Technology |
|----------|------------|
| Web Application | React + Tailwind CSS + shadcn/ui |
| iOS Application | Swift + SwiftUI |
| Backend | Supabase (Auth, Database, Storage, Realtime) |

### Core Value Proposition

| For Agencies | For Clients |
|--------------|-------------|
| Centralized request management | Professional portal experience |
| Internal notes hidden from clients | Clear visibility on request status |
| Team assignment & workload view | Easy request submission |
| Branded client experience | Conversation history in one place |

---

## Pricing Strategy

### Pricing Philosophy

**Core Principles:**

1. **Charge on client-facing value, not internal pain**  
   No per-seat pricing. Agencies have fluctuating contractors, over-invite team members, and want to grow without rethinking tooling.

2. **Make expansion automatic**  
   Revenue grows naturally as agencies add clients/projects without forced renegotiations.

3. **Never block first-time setup**  
   The product is most valuable after agencies invite clients. Nothing charges before that activation moment.

### Primary Pricing Axis: Active Clients

**Definition:** An "Active Client" is a client user associated with at least 1 request created or updated in the trailing 30 days.

**Clarifications:**
- Dormant clients (no activity in 30+ days) do not count
- Archived projects do not count toward active clients
- Invited but never-submitted clients do not count
- A client with multiple projects still counts as 1 active client

**Why Active Clients Works:**
- Maps directly to agency revenue
- Easy to explain and measure
- Encourages client onboarding
- Natural expansion lever

---

### Pricing Tiers

#### Free - $0/month (Forever)

*Let agencies try with a real client, create habit formation, seed word-of-mouth*

| Feature | Included |
|---------|----------|
| Active Clients | 3 |
| Projects | 3 |
| Staff Members | 2 |
| Requests | Unlimited |
| Storage | 1 GB |
| Email Notifications | ✓ |
| Client Portal | ✓ |
| Agency Branding (Logo) | ✗ |
| CSV Import | ✗ |

**No watermarks, no "demo" feel - fully functional.**

---

#### Starter - $29/month

*For freelancers and small agencies. "One client pays for this."*

| Feature | Included |
|---------|----------|
| Active Clients | 10 |
| Projects | Unlimited |
| Staff Members | 5 |
| Requests | Unlimited |
| Storage | 10 GB |
| Email Notifications | ✓ |
| Client Portal | ✓ |
| Agency Branding (Logo) | ✓ |
| Activity Log | Basic |
| CSV Import | ✗ |
| Support | Email |

**Annual: $290/year (2 months free)**

---

#### Growth - $79/month

*Most popular tier for established agencies*

| Feature | Included |
|---------|----------|
| Active Clients | 25 |
| Projects | Unlimited |
| Staff Members | Unlimited |
| Requests | Unlimited |
| Storage | 50 GB |
| Email Notifications | ✓ |
| Client Portal | ✓ |
| Agency Branding (Logo + Colors) | ✓ |
| Activity Log | Advanced |
| Realtime Updates | ✓ |
| CSV Import (Projects & Clients) | ✓ |
| Priority Support | Email |

**Annual: $790/year (2 months free)**

---

#### Scale - $149/month

*For larger agencies with high volume*

| Feature | Included |
|---------|----------|
| Active Clients | 50 |
| Projects | Unlimited |
| Staff Members | Unlimited |
| Requests | Unlimited |
| Storage | 200 GB |
| Email Notifications | ✓ |
| Client Portal | ✓ |
| Agency Branding (Full) | ✓ |
| Activity Log | Advanced + Export |
| Realtime Updates | ✓ |
| CSV Import (Projects & Clients) | ✓ |
| API Access | ✓ |
| Webhooks | ✓ |
| Support | Priority + SLA |

**Annual: $1,490/year (2 months free)**

---

#### Enterprise - Custom Pricing

*For agencies with 50+ active clients or special requirements*

| Feature | Included |
|---------|----------|
| Active Clients | Unlimited |
| Projects | Unlimited |
| Staff Members | Unlimited |
| Storage | Custom |
| SSO / SAML | ✓ |
| Custom Domain | ✓ |
| Dedicated Support | ✓ |
| Custom Data Retention | ✓ |
| Security Review | ✓ |
| Bulk CSV Import + Migration Assistance | ✓ |
| Custom Integrations | ✓ |
| SLA | 99.9% Uptime |

**Pricing:** Annual contract, custom quote based on needs.

---

### Expansion Revenue

#### Additional Active Clients

When agencies exceed their tier's active client limit:

| Extra Clients | Monthly Cost |
|---------------|--------------|
| +5 active clients | +$10/month |
| +10 active clients | +$20/month |
| +25 active clients | +$45/month |

*Avoids forcing plan jumps for small overages.*

#### Storage Overages

After included quota:
- **+$10/month per additional 50 GB**

Required due to attachment-heavy workflows.

#### White-Label Add-on - $29/month

Available on Growth tier and above:
- Custom domain (clients.youragency.com)
- Fully branded emails (from your domain)
- "Powered by AgencyHub" removed
- Custom email templates

---

### Trial & Conversion Strategy

**Approach: "Free until you grow"**

- No time-limited trials
- Free tier works indefinitely
- Upgrade prompts only when limits exceeded
- Converts better for agency tools than 7/14-day trials

**Grace Periods:**
- Exceeding active clients: Soft block after 7 days
- Clear warning emails, never break workflows immediately
- Existing requests continue to work, new client invites blocked

---

### Billing Implementation

| Rule | Implementation |
|------|----------------|
| Billing entity | Per agency (not per user) |
| Billing owner | Agency owner (can transfer) |
| Multiple admins | Allowed, but only owner manages billing |
| Proration | Upgrades prorated, downgrades at period end |
| Payment methods | Card (Stripe), annual invoice for Enterprise |
| Failed payment | 3 retry attempts over 7 days, then downgrade to Free |

---

## User Roles & Permissions

### Role Hierarchy

| Role | Scope | Description |
|------|-------|-------------|
| Agency Owner | Agency-wide | Full administrative access, billing, agency settings |
| Staff | Agency-wide | Can be assigned to projects, work on requests |
| Project Lead | Per-project | Point of contact for specific project(s), receives notifications |
| Client | Per-project | External user, limited to their project(s) only |

### Permission Matrix

| Action | Owner | Staff | Project Lead | Client |
|--------|-------|-------|--------------|--------|
| Create/delete agency | ✓ | ✗ | ✗ | ✗ |
| Manage billing | ✓ | ✗ | ✗ | ✗ |
| Invite/remove staff | ✓ | ✗ | ✗ | ✗ |
| Agency settings & branding | ✓ | ✗ | ✗ | ✗ |
| Create projects | ✓ | ✓ | ✗ | ✗ |
| Delete/archive projects | ✓ | ✗ | ✗ | ✗ |
| Edit project settings | ✓ | ✗ | ✓ | ✗ |
| Assign project leads | ✓ | ✗ | ✗ | ✗ |
| Invite clients to project | ✓ | ✓ | ✓ | ✗ |
| View all projects | ✓ | ✓ | ✗ | ✗ |
| View assigned projects | ✓ | ✓ | ✓ | ✓ |
| Add internal notes | ✓ | ✓ | ✓ | ✗ |
| View internal notes | ✓ | ✓ | ✓ | ✗ |
| Submit requests | ✗ | ✗ | ✗ | ✓ |
| View requests | ✓ | ✓ | ✓ | ✓ (own) |
| Update request status | ✓ | ✓ | ✓ | ✗ |
| Assign requests to staff | ✓ | ✓ | ✓ | ✗ |
| Edit request priority | ✓ | ✓ | ✓ | ✗ |
| Reply to requests | ✓ | ✓ | ✓ | ✓ |
| View dashboard stats | ✓ | ✓ | ✓ | ✗ |
| CSV import | ✓ | ✗ | ✗ | ✗ |

---

## Feature Specifications

### 1. Authentication & Onboarding

#### 1.1 Agency Owner Registration
- Email/password registration
- Email verification required
- Agency name setup during registration
- Automatic Free tier assignment

#### 1.2 Staff Invitation Flow
1. Owner sends email invitation with unique link
2. Staff clicks link → creates password → joins agency
3. Invitation expires after 7 days
4. Owner can resend or revoke pending invitations

#### 1.3 Client Invitation Flow
1. Staff/Lead sends project invitation to client email
2. Client clicks link → creates password (or logs in if existing)
3. Client automatically linked to specific project
4. Multiple clients can be invited to same project
5. Client count checked against tier limits before invitation

#### 1.4 Authentication Methods
- Email/password (primary)
- Magic link (passwordless option)
- SSO/SAML (Enterprise tier only)

---

### 2. Agency Management

#### 2.1 Agency Settings
- Agency name
- Agency logo (displayed in client portal)
- Brand color (Growth tier+)
- Default timezone
- Default notification preferences

#### 2.2 Team Management
- View all staff members with status
- Invite new staff (email)
- Remove staff (with confirmation, reassign their work)
- View staff project assignments
- Staff limit enforced per tier

#### 2.3 Branding

| Feature | Free | Starter | Growth | Scale | Enterprise |
|---------|------|---------|--------|-------|------------|
| Logo upload | ✗ | ✓ | ✓ | ✓ | ✓ |
| Brand color | ✗ | ✗ | ✓ | ✓ | ✓ |
| Custom domain | ✗ | ✗ | Add-on | Add-on | ✓ |
| Remove "Powered by" | ✗ | ✗ | Add-on | Add-on | ✓ |
| Custom email templates | ✗ | ✗ | ✗ | ✗ | ✓ |

**Logo specifications:**
- Formats: PNG, JPG, SVG
- Recommended size: 400x100px (scaled proportionally)
- Max file size: 2MB
- Displayed: Client portal header, email notifications, mobile app

---

### 3. Project Management

#### 3.1 Project Creation

**Required Fields:**
- Project name (typically URL or site/app name)

**Optional Fields:**
- Project description
- Project URL (live site)
- Staging URL
- Hosting provider
- Tech stack notes
- Payment link (Stripe, invoice URL, etc.)
- Internal notes

#### 3.2 Project Settings
- Edit all project details
- Assign/remove project leads (multiple allowed)
- Assign/remove staff members (multiple allowed)
- Invite clients (checked against tier limits)
- Set project status
- Delete/archive project (Owner only)

#### 3.3 Project Status

| Status | Visibility | Description |
|--------|------------|-------------|
| Active | Main list | Ongoing work, requests accepted |
| On Hold | Shown with indicator | Paused, requests queued |
| Completed | Completed tab | Work finished, read-only for client |
| Archived | Hidden (Owner can view) | Removed from all active lists |

#### 3.4 Project Dashboard (Agency View)
- Project header: Name, URL, status badge
- Quick stats: Open / In Progress / Completed
- Recent activity feed
- Tabbed navigation:
  - **Requests** (default)
  - **Internal Notes**
  - **Project Details**
  - **Settings**

---

### 4. Request System

#### 4.1 Request Submission (Client)

**Required Fields:**
| Field | Type | Validation |
|-------|------|------------|
| Title | Text | Max 200 characters |
| Type | Dropdown | Bug / Change / New Feature / Question |
| Priority | Dropdown | Normal / Urgent |
| Description | Rich text | Min 10 characters |

**Optional Fields:**
| Field | Type | Limits |
|-------|------|--------|
| Attachments | Files | Max 10 files, 25MB each |

**Supported attachment types:** PNG, JPG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT, ZIP

#### 4.2 Request Views

**Client sees:**
- Title, type, priority, status
- Description and attachments
- Conversation thread (client-visible replies only)
- Timestamps (submitted, last update)

**Agency sees (additional):**
- Assigned staff member(s)
- Internal notes thread (separate tab)
- Status change controls
- Priority edit control
- Assignment controls
- Activity log

#### 4.3 Request Statuses

| Status | Color | Description |
|--------|-------|-------------|
| Submitted | Blue | New, not yet reviewed |
| In Progress | Orange | Being worked on |
| Complete | Green | Work finished |

#### 4.4 Request Assignment
- One or multiple staff can be assigned
- Assignment triggers notification to assigned staff
- Unassigned requests shown in "Unassigned" filter
- Project leads can self-assign or assign others

#### 4.5 Request Conversation Thread

**Structure:**
- Chronological message list
- Each message: Author, timestamp, content, attachments
- Client and agency replies in unified thread
- Agency can see which staff member sent reply
- Client sees replies as agency name (not individual staff)

**Features:**
- Rich text: Bold, italic, links, code blocks
- Attachments: Same limits as initial request
- Edit own message: Within 5 minutes only
- Delete own message: Soft delete, shows "Message deleted"

#### 4.6 Internal Notes (Per Request)
- Separate thread, only visible to agency staff
- Same features as conversation
- Used for internal discussion
- Does NOT notify client

#### 4.7 Request Filters & Sorting

**Filters:**
- Status: All / Submitted / In Progress / Complete
- Type: All / Bug / Change / New Feature / Question
- Priority: All / Normal / Urgent
- Assigned: All / Unassigned / Assigned to me / Specific person

**Sort Options:**
- Newest first (default)
- Oldest first
- Recently updated
- Priority (Urgent first)

---

### 5. Internal Notes (Project Level)

General project notes, separate from per-request notes.

#### 5.1 Note Structure
| Field | Type | Required |
|-------|------|----------|
| Title | Text (255 chars) | No |
| Content | Rich text | Yes |
| Attachments | Files | No |
| Pinned | Boolean | No (default: false) |

#### 5.2 Features
- Pinned notes stay at top
- Edit/delete own notes
- Owner can delete any note
- Search notes by content
- Attachments same limits as requests

#### 5.3 Use Cases
- Login credentials storage
- Deployment instructions
- Client preferences/quirks
- Technical documentation
- Meeting notes

---

### 6. Client Portal

#### 6.1 Portal Access
- URL: app.agencyhub.com/portal/{agency-slug}
- Or custom domain (white-label add-on)
- Client logs in with email/password
- Sees only their project(s)

#### 6.2 Portal Header
- Agency logo (if configured)
- Project selector (if client has multiple)
- Notification bell
- Account dropdown

#### 6.3 Portal Dashboard
- Project name and status
- Quick stats: Open / In Progress / Completed
- "Submit New Request" button (prominent)
- Recent requests list
- "Make Payment" button (if payment link configured)

#### 6.4 Portal Features
- View all their requests with status
- Submit new requests
- Reply to existing conversations
- Upload attachments
- Update account settings

#### 6.5 Portal Design
- Clean, minimal interface
- Mobile responsive
- Agency branding applied
- Professional appearance

---

### 7. Notifications

#### 7.1 Notification Events

| Event | Recipients | Default |
|-------|------------|---------|
| New request submitted | Project Lead(s) | Email + In-app |
| Request assigned to you | Assigned staff | Email + In-app |
| Request status changed | Client | Email + In-app |
| New reply (client → agency) | Assigned + Lead(s) | Email + In-app |
| New reply (agency → client) | Client | Email + In-app |
| Staff invitation | Invited staff | Email only |
| Client invitation | Invited client | Email only |
| Approaching tier limit | Agency owner | Email only |
| Tier limit exceeded | Agency owner | Email only |

#### 7.2 Notification Preferences

**User Level:**
- Email notifications: On/Off globally
- In-app notifications: Always on

**Conversation Level:**
- Mute specific conversation (stops email, keeps in-app)
- Useful for long back-and-forth threads

#### 7.3 Email Content
- Clear subject: "[ProjectName] New request: Title"
- Brief preview of content
- Direct link to request
- Agency branding (logo in header)
- Unsubscribe/manage preferences link

---

### 8. Dashboard & Analytics (Agency)

#### 8.1 Agency Overview Dashboard
- Active clients count (with tier limit indicator)
- Total active projects
- Open requests (all projects)
- Requests by status (donut chart)
- Requests by type (bar chart)
- Recent activity feed (last 20 items)
- Storage usage (with tier limit)

#### 8.2 Project-Level Stats
- Open / In Progress / Completed counts
- Average time to completion (30 days)
- Requests over time (line chart)
- Requests by type breakdown

#### 8.3 Activity Log

**Basic (Starter):**
- Request created
- Status changed
- Request completed

**Advanced (Growth+):**
- All basic events
- Assignment changes
- Priority changes
- Message sent/edited/deleted
- Attachment uploads
- Export to CSV (Scale+)

---

### 9. CSV Import (Growth+ Tiers)

#### 9.1 Import Types

**Projects Import:**
```csv
project_name,project_url,staging_url,description,status
ClientSite.com,https://clientsite.com,https://staging.clientsite.com,Main website,active
```

**Clients Import:**
```csv
project_name,client_email,client_name
ClientSite.com,john@client.com,John Smith
ClientSite.com,jane@client.com,Jane Doe
```

#### 9.2 Import Flow
1. Owner navigates to Settings → Import
2. Downloads template CSV
3. Fills in data
4. Uploads CSV
5. Preview shows parsed data with validation
6. Confirm to process
7. Progress indicator for large imports
8. Summary: X created, Y skipped (with reasons)

#### 9.3 Import Rules
- Duplicate projects (same name) are skipped
- Duplicate clients (same email in project) are skipped
- Invalid emails flagged and skipped
- Client invitations sent automatically (can disable)
- Client count checked against tier limits before processing
- Max 500 rows per import (Enterprise: unlimited)

---

### 10. Payment Integration

#### 10.1 Current Scope (MVP)
- Payment link field per project
- Accepts any URL (Stripe, PayPal, invoice, etc.)
- Client portal shows "Make Payment" button if link exists
- Button opens link in new tab
- No payment processing within platform

#### 10.2 Future Scope (v2+)
- Stripe Connect integration
- Invoice generation
- Payment status tracking
- Billable request tagging

---

## Database Schema

### Entity Relationship Overview

```
agencies
    ├── agency_members (staff)
    ├── agency_subscriptions (billing)
    └── projects
            ├── project_members (leads, staff, clients)
            ├── project_notes
            └── requests
                    ├── request_assignments
                    ├── request_messages
                    ├── request_attachments
                    └── request_activity_log
```

### Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

#### agencies
```sql
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    brand_color VARCHAR(7),
    timezone VARCHAR(50) DEFAULT 'UTC',
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_owner ON agencies(owner_id);
```

#### agency_subscriptions
```sql
CREATE TABLE agency_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free', -- free, starter, growth, scale, enterprise
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, past_due, canceled, trialing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Limits (can override tier defaults for enterprise)
    active_client_limit INTEGER,
    project_limit INTEGER,
    staff_limit INTEGER,
    storage_limit_gb INTEGER,
    
    -- Add-ons
    white_label_enabled BOOLEAN DEFAULT FALSE,
    extra_clients_purchased INTEGER DEFAULT 0,
    extra_storage_gb_purchased INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id)
);

CREATE INDEX idx_subscriptions_agency ON agency_subscriptions(agency_id);
CREATE INDEX idx_subscriptions_stripe ON agency_subscriptions(stripe_customer_id);
```

#### tier_limits (reference table)
```sql
CREATE TABLE tier_limits (
    tier VARCHAR(20) PRIMARY KEY,
    active_client_limit INTEGER,
    project_limit INTEGER,
    staff_limit INTEGER,
    storage_limit_gb INTEGER,
    monthly_price_cents INTEGER,
    annual_price_cents INTEGER,
    features JSONB -- Additional feature flags
);

INSERT INTO tier_limits VALUES
('free', 3, 3, 2, 1, 0, 0, '{"branding_logo": false, "csv_import": false, "activity_log": "none"}'),
('starter', 10, NULL, 5, 10, 2900, 29000, '{"branding_logo": true, "csv_import": false, "activity_log": "basic"}'),
('growth', 25, NULL, NULL, 50, 7900, 79000, '{"branding_logo": true, "branding_color": true, "csv_import": true, "activity_log": "advanced", "realtime": true}'),
('scale', 50, NULL, NULL, 200, 14900, 149000, '{"branding_logo": true, "branding_color": true, "csv_import": true, "activity_log": "advanced", "realtime": true, "api_access": true, "webhooks": true, "export": true}'),
('enterprise', NULL, NULL, NULL, NULL, NULL, NULL, '{"all": true}');
```

#### agency_members
```sql
CREATE TABLE agency_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'staff', -- owner, staff
    
    -- Invitation tracking
    invitation_email VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, user_id),
    UNIQUE(agency_id, invitation_email)
);

CREATE INDEX idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX idx_agency_members_user ON agency_members(user_id);
CREATE INDEX idx_agency_members_token ON agency_members(invitation_token);
```

#### projects
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, on_hold, completed, archived
    
    -- Project details
    project_url TEXT,
    staging_url TEXT,
    hosting_provider VARCHAR(255),
    tech_stack TEXT,
    payment_link TEXT,
    
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_agency ON projects(agency_id);
CREATE INDEX idx_projects_status ON projects(status);
```

#### project_members
```sql
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- lead, staff, client
    
    -- Invitation tracking (for clients)
    invitation_email VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(project_id, user_id),
    UNIQUE(project_id, invitation_email)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_token ON project_members(invitation_token);
```

#### requests
```sql
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    -- Request details
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(20) NOT NULL, -- bug, change, feature, question
    priority VARCHAR(20) NOT NULL DEFAULT 'normal', -- normal, urgent
    status VARCHAR(20) NOT NULL DEFAULT 'submitted', -- submitted, in_progress, complete
    
    -- Tracking
    created_by UUID NOT NULL REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_project ON requests(project_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
```

#### request_assignments
```sql
CREATE TABLE request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(request_id, user_id)
);

CREATE INDEX idx_request_assignments_request ON request_assignments(request_id);
CREATE INDEX idx_request_assignments_user ON request_assignments(user_id);
```

#### request_messages
```sql
CREATE TABLE request_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- TRUE = internal note, not visible to client
    is_deleted BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_request_messages_request ON request_messages(request_id);
CREATE INDEX idx_request_messages_internal ON request_messages(is_internal);
CREATE INDEX idx_request_messages_created ON request_messages(created_at);
```

#### attachments
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Polymorphic: can belong to request, message, or note
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    message_id UUID REFERENCES request_messages(id) ON DELETE CASCADE,
    note_id UUID REFERENCES project_notes(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL, -- bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type
    
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure attachment belongs to exactly one parent
    CONSTRAINT attachment_single_parent CHECK (
        (request_id IS NOT NULL)::int +
        (message_id IS NOT NULL)::int +
        (note_id IS NOT NULL)::int = 1
    )
);

CREATE INDEX idx_attachments_request ON attachments(request_id);
CREATE INDEX idx_attachments_message ON attachments(message_id);
CREATE INDEX idx_attachments_note ON attachments(note_id);
```

#### project_notes
```sql
CREATE TABLE project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    title VARCHAR(255),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_project_notes_project ON project_notes(project_id);
CREATE INDEX idx_project_notes_pinned ON project_notes(is_pinned);
```

#### notifications
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    
    -- Polymorphic reference
    reference_type VARCHAR(50), -- request, project, message
    reference_id UUID,
    
    data JSONB, -- Additional context
    
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read_at);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
```

#### notification_preferences
```sql
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    email_enabled BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

#### conversation_mutes
```sql
CREATE TABLE conversation_mutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, request_id)
);
```

#### request_activity_log
```sql
CREATE TABLE request_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    action VARCHAR(50) NOT NULL, -- created, status_changed, assigned, priority_changed, completed, message_sent
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    metadata JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_request ON request_activity_log(request_id);
CREATE INDEX idx_activity_log_created ON request_activity_log(created_at DESC);
```

### Views

#### active_clients_count
```sql
CREATE VIEW active_clients_count AS
SELECT 
    a.id AS agency_id,
    COUNT(DISTINCT pm.user_id) AS active_client_count
FROM agencies a
JOIN projects p ON p.agency_id = a.id
JOIN project_members pm ON pm.project_id = p.id AND pm.role = 'client'
JOIN requests r ON r.project_id = p.id AND r.created_by = pm.user_id
WHERE r.updated_at > NOW() - INTERVAL '30 days'
  AND p.status != 'archived'
GROUP BY a.id;
```

#### agency_storage_usage
```sql
CREATE VIEW agency_storage_usage AS
SELECT 
    a.id AS agency_id,
    COALESCE(SUM(att.file_size), 0) AS total_bytes,
    COALESCE(SUM(att.file_size) / (1024 * 1024 * 1024.0), 0) AS total_gb
FROM agencies a
LEFT JOIN projects p ON p.agency_id = a.id
LEFT JOIN requests r ON r.project_id = p.id
LEFT JOIN attachments att ON att.request_id = r.id
GROUP BY a.id;
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/signup | Register new user + agency |
| POST | /auth/login | Login |
| POST | /auth/logout | Logout |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password |
| POST | /auth/verify-email | Verify email address |

### Invitations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /invitations/staff | Invite staff to agency |
| POST | /invitations/client | Invite client to project |
| GET | /invitations/:token | Get invitation details |
| POST | /invitations/:token/accept | Accept invitation |
| DELETE | /invitations/:id | Revoke invitation |

### Agencies

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /agencies/me | Get current user's agency |
| PATCH | /agencies/:id | Update agency settings |
| POST | /agencies/:id/logo | Upload agency logo |
| DELETE | /agencies/:id/logo | Remove agency logo |
| GET | /agencies/:id/usage | Get usage stats (clients, storage) |

### Subscriptions & Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /subscriptions/current | Get current subscription |
| POST | /subscriptions/checkout | Create Stripe checkout session |
| POST | /subscriptions/portal | Create Stripe billing portal session |
| POST | /subscriptions/webhook | Stripe webhook handler |
| GET | /subscriptions/limits | Get current tier limits |

### Team

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /team | List agency members |
| DELETE | /team/:userId | Remove member |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects | List all projects |
| POST | /projects | Create project |
| GET | /projects/:id | Get project details |
| PATCH | /projects/:id | Update project |
| DELETE | /projects/:id | Delete project |
| GET | /projects/:id/stats | Get project statistics |

### Project Members

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/members | List project members |
| POST | /projects/:id/members | Add member to project |
| PATCH | /projects/:id/members/:userId | Update member role |
| DELETE | /projects/:id/members/:userId | Remove member |

### Requests

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/requests | List requests (with filters) |
| POST | /projects/:id/requests | Create request |
| GET | /requests/:id | Get request details |
| PATCH | /requests/:id | Update request |
| POST | /requests/:id/assign | Assign staff |
| DELETE | /requests/:id/assign/:userId | Unassign staff |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /requests/:id/messages | Get messages |
| POST | /requests/:id/messages | Add message |
| PATCH | /messages/:id | Edit message |
| DELETE | /messages/:id | Delete message |
| POST | /requests/:id/mute | Mute conversation |
| DELETE | /requests/:id/mute | Unmute conversation |

### Attachments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /attachments/upload | Upload attachment |
| DELETE | /attachments/:id | Delete attachment |

### Project Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/notes | List project notes |
| POST | /projects/:id/notes | Create note |
| PATCH | /notes/:id | Update note |
| DELETE | /notes/:id | Delete note |
| POST | /notes/:id/pin | Toggle pin status |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | Get user notifications |
| PATCH | /notifications/:id/read | Mark as read |
| POST | /notifications/read-all | Mark all as read |
| GET | /notifications/preferences | Get preferences |
| PATCH | /notifications/preferences | Update preferences |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /dashboard | Agency overview stats |
| GET | /projects/:id/dashboard | Project stats |

### Import (Growth+ tiers)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /import/templates/:type | Download CSV template |
| POST | /import/preview | Preview import data |
| POST | /import/execute | Execute import |

---

## Screen Specifications

### Web Application - Agency Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | /login | Email/password form |
| Register | /register | Create agency + account |
| Forgot Password | /forgot-password | Request reset |
| Reset Password | /reset-password/:token | Set new password |
| Dashboard | / | Agency overview |
| Projects List | /projects | All projects |
| Project Detail | /projects/:id | Project with tabs |
| Request Detail | /projects/:id/requests/:requestId | Slide-over panel |
| Team | /team | Staff management |
| Settings | /settings | Agency settings |
| Billing | /settings/billing | Subscription management |
| Import | /settings/import | CSV import (Growth+) |
| Profile | /profile | User settings |

### Web Application - Client Portal Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | /portal/:slug/login | Agency-branded login |
| Dashboard | /portal/:slug | Project overview |
| Requests | /portal/:slug/requests | Request list |
| Request Detail | /portal/:slug/requests/:id | Request + conversation |
| New Request | /portal/:slug/requests/new | Submit request form |
| Settings | /portal/:slug/settings | Account settings |

### iOS Application - Screens

**Agency Staff:**
| Screen | Description |
|--------|-------------|
| Login | Email/password + biometric |
| Projects | List with search/filter |
| Project Detail | Tabs: Requests, Notes, Info |
| Request Detail | Status, assignment, conversation |
| Notifications | Grouped by date |
| Settings | Profile, preferences |

**Client:**
| Screen | Description |
|--------|-------------|
| Login | Agency-branded |
| Home | Project overview + stats |
| Requests | List with filters |
| Request Detail | Conversation thread |
| New Request | Form + attachments |
| Settings | Profile, notifications |

---

## Wireframes

### Web - Agency Dashboard
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] AgencyHub                            [🔔 3] [Avatar ▼]     │
├──────────────┬──────────────────────────────────────────────────────┤
│              │                                                      │
│  Dashboard   │  Welcome back, Mark                                  │
│  ─────────── │                                                      │
│  > Projects  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  Team        │  │  Active     │ │    Open     │ │ In Progress │    │
│  Settings    │  │  Clients    │ │  Requests   │ │             │    │
│              │  │   8 / 25    │ │     34      │ │      8      │    │
│  ─────────── │  │  ████████░░ │ │             │ │             │    │
│  Free → Pro  │  └─────────────┘ └─────────────┘ └─────────────┘    │
│  Upgrade     │                                                      │
│              │  Recent Activity                                     │
│              │  ────────────────────────────────────────────────    │
│              │  • New request from Client A - "Homepage bug" - 2m   │
│              │  • John completed "Update footer" - 15m              │
│              │  • New reply on "API integration" - 1h               │
│              │  • Sarah assigned to "Mobile menu" - 2h              │
│              │                                                      │
│              │  Projects                              [+ New]       │
│              │  ────────────────────────────────────────────────    │
│              │  ┌────────────────────────────────────────────────┐  │
│              │  │ ClientSite.com        ● Active      3 open    │  │
│              │  │ AnotherClient.io      ● Active      1 open    │  │
│              │  │ BigProject.com        ◐ On Hold     0 open    │  │
│              │  └────────────────────────────────────────────────┘  │
│              │                                                      │
└──────────────┴──────────────────────────────────────────────────────┘
```

### Web - Project Requests View with Slide-over
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Logo] AgencyHub                            [🔔 3] [Avatar ▼]     │
├──────────────┬──────────────────────────────────┬───────────────────┤
│              │  ClientSite.com          [⚙]    │ ✕                 │
│  Dashboard   │  ● Active                        │                   │
│  ─────────── │                                  │ Homepage not      │
│  > Projects  │  [Requests] [Notes] [Details]    │ loading on mobile │
│    • Client1 │                                  │ ─────────────────│
│    • Client2 │  [Status ▼] [Type ▼] [Assign ▼]  │ 🔴 Bug   ⚡ Urgent│
│  Team        │                                  │                   │
│  Settings    │  ┌──────────────────────────┐    │ Status            │
│              │  │ 🔴 Homepage not loading  │    │ [Submitted     ▼] │
│              │  │ Bug • Urgent • 2h ago    │ ←──│                   │
│              │  │ → John Smith             │    │ Assigned          │
│              │  └──────────────────────────┘    │ [+ Add assignee]  │
│              │  ┌──────────────────────────┐    │ John Smith    ✕   │
│              │  │ Update contact form      │    │ ─────────────────│
│              │  │ Change • Normal • 1d     │    │ [Chat] [Internal] │
│              │  │ → Sarah Jones            │    │                   │
│              │  └──────────────────────────┘    │ Client (2h ago):  │
│              │  ┌──────────────────────────┐    │ The homepage is   │
│              │  │ Add newsletter popup     │    │ blank on iPhone.  │
│              │  │ Feature • Normal • 3d    │    │ 📎 screenshot.png │
│              │  │ → Unassigned             │    │                   │
│              │  └──────────────────────────┘    │ ─────────────────│
│              │                                  │ [Type reply...  ] │
│              │                                  │ [📎]       [Send] │
└──────────────┴──────────────────────────────────┴───────────────────┘
```

### Web - Client Portal
```
┌─────────────────────────────────────────────────────────────────────┐
│  [Agency Logo]                                     [🔔] [Account ▼] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  MyWebsite.com                                           ● Active   │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │     Open     │  │  In Progress │  │   Completed  │              │
│  │      3       │  │      2       │  │      15      │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              [ + Submit New Request ]                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  Recent Requests                                    [View All →]    │
│  ───────────────────────────────────────────────────────────────   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Homepage not loading on mobile            🔴 Bug  ⚡ Urgent  │   │
│  │ Submitted • 2 hours ago                                      │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Update contact form email                     Change         │   │
│  │ In Progress • 1 day ago                       • 1 new reply  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ Footer links broken                           🔴 Bug         │   │
│  │ Complete • 3 days ago                                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    [ Make Payment ]                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  Powered by AgencyHub                                               │
└─────────────────────────────────────────────────────────────────────┘
```

### iOS - Request List (Agency)
```
┌─────────────────────────────┐
│ ←  ClientSite.com        ⚙ │
├─────────────────────────────┤
│ [Requests] [Notes]  [Info]  │
├─────────────────────────────┤
│ [All ▼] [Type ▼] [Assign ▼] │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 🔴 Homepage not loading │ │
│ │    on mobile            │ │
│ │ Bug • Urgent            │ │
│ │ Submitted • 2h ago    > │ │
│ │ → John Smith            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Update contact form     │ │
│ │    email address        │ │
│ │ Change • Normal         │ │
│ │ In Progress • 1d ago  > │ │
│ │ → Sarah Jones           │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ Add newsletter signup   │ │
│ │    popup                │ │
│ │ Feature • Normal        │ │
│ │ Submitted • 3d ago    > │ │
│ │ → Unassigned            │ │
│ └─────────────────────────┘ │
│                             │
├─────────────────────────────┤
│ [🏠]   [📁]   [🔔]   [⚙]  │
│ Home  Projects Notif  More  │
└─────────────────────────────┘
```

### iOS - Client New Request
```
┌─────────────────────────────┐
│ Cancel   New Request   Send │
├─────────────────────────────┤
│                             │
│ Title *                     │
│ ┌─────────────────────────┐ │
│ │ Enter request title...  │ │
│ └─────────────────────────┘ │
│                             │
│ Type *                      │
│ ┌─────────────────────────┐ │
│ │ Bug                   ▼ │ │
│ └─────────────────────────┘ │
│                             │
│ Priority                    │
│ ┌─────────────────────────┐ │
│ │ ○ Normal   ● Urgent     │ │
│ └─────────────────────────┘ │
│                             │
│ Description *               │
│ ┌─────────────────────────┐ │
│ │                         │ │
│ │ Describe the issue or   │ │
│ │ request in detail...    │ │
│ │                         │ │
│ │                         │ │
│ │                         │ │
│ └─────────────────────────┘ │
│                             │
│ Attachments                 │
│ ┌───────┐ ┌───────┐        │
│ │  📷   │ │  📁   │  [+]   │
│ │Camera │ │Files  │        │
│ └───────┘ └───────┘        │
│                             │
└─────────────────────────────┘
```

---

## Technical Implementation

### Supabase Configuration

#### Authentication
```javascript
// supabase/config.toml
[auth]
site_url = "https://app.agencyhub.com"
additional_redirect_urls = [
  "https://app.agencyhub.com/auth/callback",
  "agencyhub://auth/callback" // iOS deep link
]

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true
```

#### Storage Buckets
| Bucket | Public | Max Size | Allowed Types |
|--------|--------|----------|---------------|
| avatars | Yes | 2MB | image/* |
| logos | Yes | 2MB | image/*, image/svg+xml |
| attachments | No | 25MB | image/*, application/pdf, application/msword, etc. |

#### Row Level Security (Key Policies)

```sql
-- Users can read their own data
CREATE POLICY "Users can read own data" ON users
    FOR SELECT USING (auth.uid() = id);

-- Agency members can read their agency
CREATE POLICY "Members can read agency" ON agencies
    FOR SELECT USING (
        id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

-- Project members can read their projects
CREATE POLICY "Members can read projects" ON projects
    FOR SELECT USING (
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        OR
        agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

-- Clients can only see non-internal messages
CREATE POLICY "Clients see public messages" ON request_messages
    FOR SELECT USING (
        -- Agency staff see all
        EXISTS (
            SELECT 1 FROM agency_members am
            JOIN projects p ON p.agency_id = am.agency_id
            JOIN requests r ON r.project_id = p.id
            WHERE r.id = request_messages.request_id
            AND am.user_id = auth.uid()
        )
        OR
        -- Clients see only non-internal
        (
            is_internal = FALSE
            AND EXISTS (
                SELECT 1 FROM project_members pm
                JOIN requests r ON r.project_id = pm.project_id
                WHERE r.id = request_messages.request_id
                AND pm.user_id = auth.uid()
                AND pm.role = 'client'
            )
        )
    );
```

#### Realtime Subscriptions
- `requests` - Live status updates
- `request_messages` - Live chat
- `notifications` - Real-time alerts

#### Edge Functions
| Function | Trigger | Description |
|----------|---------|-------------|
| send-notification | DB trigger | Send email notifications |
| process-invitation | HTTP | Handle invitation acceptance |
| stripe-webhook | HTTP | Handle Stripe events |
| calculate-usage | Cron (daily) | Update active client counts |
| cleanup-expired | Cron (daily) | Remove expired invitations |

### React Implementation

#### Project Structure
```
src/
├── app/                    # Routes (React Router or Next.js)
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (dashboard)/
│   │   ├── projects/
│   │   ├── team/
│   │   └── settings/
│   └── portal/[slug]/      # Client portal
├── components/
│   ├── ui/                 # shadcn components
│   ├── forms/
│   ├── layouts/
│   └── features/
├── hooks/
├── lib/
│   ├── supabase.ts
│   ├── stripe.ts
│   └── utils.ts
├── stores/                 # Zustand stores
└── types/
```

#### Key Libraries
| Library | Purpose |
|---------|---------|
| @supabase/supabase-js | Database, auth, storage |
| @tanstack/react-query | Data fetching, caching |
| react-hook-form | Form handling |
| zod | Validation |
| zustand | UI state |
| date-fns | Date formatting |
| react-dropzone | File uploads |
| @tiptap/react | Rich text editor |
| recharts | Charts |
| @stripe/stripe-js | Billing |

### iOS Implementation

#### Project Structure
```
AgencyHub/
├── App/
│   └── AgencyHubApp.swift
├── Features/
│   ├── Auth/
│   ├── Projects/
│   ├── Requests/
│   ├── Notifications/
│   └── Settings/
├── Core/
│   ├── Network/
│   ├── Storage/
│   └── Extensions/
├── UI/
│   ├── Components/
│   └── Styles/
└── Resources/
```

#### Architecture
- **Pattern:** MVVM with Combine
- **UI:** SwiftUI
- **Network:** Supabase Swift SDK
- **Storage:** SwiftData for offline cache

#### Push Notifications
1. Configure APNs in Supabase dashboard
2. Request permission on first launch
3. Store device token in `user_devices` table
4. Handle notification tap → deep link to relevant screen

---

## MVP Scope & Phases

### Phase 1: Core MVP (Week 1-2)

**Authentication:**
- [x] Email/password signup + login
- [x] Email verification
- [x] Password reset
- [x] Agency creation during signup

**Agency:**
- [x] Agency settings (name)
- [x] Staff invitation + acceptance
- [x] Staff removal

**Projects:**
- [x] Create / edit / delete projects
- [x] Project status management
- [x] Assign project leads
- [x] Assign staff to projects

**Clients:**
- [x] Invite clients to projects
- [x] Client portal login
- [x] Client dashboard

**Requests:**
- [x] Submit request (client)
- [x] View request list (both roles)
- [x] Update status (agency)
- [x] Assign staff to requests
- [x] Conversation thread
- [x] Internal notes
- [x] Attachments

**Notifications:**
- [x] In-app notifications
- [x] Email notifications (basic)

### Phase 2: Polish (Week 2-3)

- [ ] Logo upload + branding
- [ ] Request filters + sorting
- [ ] Activity log (basic)
- [ ] Conversation muting
- [ ] Edit/delete messages
- [ ] Dashboard stats
- [ ] Project notes
- [ ] Mobile app (iOS) - core flows

### Phase 3: Monetization (Week 3-4)

- [ ] Stripe integration
- [ ] Subscription management
- [ ] Tier limits enforcement
- [ ] Usage tracking
- [ ] Upgrade prompts
- [ ] Billing portal

### Phase 4: Growth Features (Week 4+)

- [ ] CSV import
- [ ] Advanced activity log
- [ ] White-label add-on
- [ ] API access (Scale tier)
- [ ] Webhooks (Scale tier)
- [ ] Export functionality

### Future Roadmap

- Custom domains
- SSO / SAML (Enterprise)
- Stripe Connect for payments
- Time tracking
- SLA monitoring
- Mobile app (Android)
- Desktop app (Electron)

---

## Success Metrics

### Activation
- Agencies with 1+ client invited (7 days)
- Agencies with 1+ request submitted (14 days)

### Engagement
- Daily active agencies
- Requests submitted per week
- Average response time (agency → client)
- Messages per request thread

### Growth
- New agency signups (weekly)
- Free → Paid conversion rate
- Expansion revenue (extra clients purchased)
- Churn rate (monthly)

### Quality
- Request resolution time (median)
- Client return rate (2nd request within 30 days)
- NPS score (quarterly survey)

---

## Appendix

### Glossary

| Term | Definition |
|------|------------|
| Agency | The company/team using AgencyHub |
| Staff | Agency employee with internal access |
| Project Lead | Staff member designated as primary contact |
| Client | External customer with portal access |
| Request | A ticket/issue/task submitted by client |
| Active Client | Client with request activity in last 30 days |
| Internal Notes | Comments visible only to agency staff |

### Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-16 | Claude | Initial PRD with full specifications |
