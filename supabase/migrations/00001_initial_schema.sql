-- AgencyHub Database Schema
-- Version: 1.0
-- Date: January 17, 2025
--
-- This schema includes corrections to the PRD schema:
-- 1. Proper table ordering for foreign key dependencies
-- 2. Soft delete support (deleted_at columns)
-- 3. Fixed views for accurate counting
-- 4. Additional indexes for performance
-- 5. User devices table for push notifications

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete support
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted ON users(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- AGENCIES TABLE
-- ============================================================================
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    logo_url TEXT,
    brand_color VARCHAR(7), -- Hex color e.g., #3B82F6
    timezone VARCHAR(50) DEFAULT 'UTC',
    owner_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete support
);

CREATE INDEX idx_agencies_slug ON agencies(slug);
CREATE INDEX idx_agencies_owner ON agencies(owner_id);
CREATE INDEX idx_agencies_deleted ON agencies(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- TIER LIMITS (Reference Table)
-- ============================================================================
CREATE TABLE tier_limits (
    tier VARCHAR(20) PRIMARY KEY,
    active_client_limit INTEGER,
    project_limit INTEGER,
    staff_limit INTEGER,
    storage_limit_gb INTEGER,
    monthly_price_cents INTEGER,
    annual_price_cents INTEGER,
    features JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Insert default tier configurations
INSERT INTO tier_limits (tier, active_client_limit, project_limit, staff_limit, storage_limit_gb, monthly_price_cents, annual_price_cents, features) VALUES
('free', 3, 3, 2, 1, 0, 0, '{"branding_logo": false, "branding_color": false, "csv_import": false, "activity_log": "none", "realtime": false, "api_access": false, "webhooks": false, "export": false}'),
('starter', 10, NULL, 5, 10, 2900, 29000, '{"branding_logo": true, "branding_color": false, "csv_import": false, "activity_log": "basic", "realtime": false, "api_access": false, "webhooks": false, "export": false}'),
('growth', 25, NULL, NULL, 50, 7900, 79000, '{"branding_logo": true, "branding_color": true, "csv_import": true, "activity_log": "advanced", "realtime": true, "api_access": false, "webhooks": false, "export": false}'),
('scale', 50, NULL, NULL, 200, 14900, 149000, '{"branding_logo": true, "branding_color": true, "csv_import": true, "activity_log": "advanced", "realtime": true, "api_access": true, "webhooks": true, "export": true}'),
('enterprise', NULL, NULL, NULL, NULL, NULL, NULL, '{"branding_logo": true, "branding_color": true, "csv_import": true, "activity_log": "advanced", "realtime": true, "api_access": true, "webhooks": true, "export": true, "sso": true, "custom_domain": true}');

-- ============================================================================
-- AGENCY SUBSCRIPTIONS
-- ============================================================================
CREATE TABLE agency_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    tier VARCHAR(20) NOT NULL DEFAULT 'free' REFERENCES tier_limits(tier),
    status VARCHAR(20) NOT NULL DEFAULT 'active', -- active, past_due, canceled, trialing
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    -- Limits (can override tier defaults for enterprise)
    active_client_limit_override INTEGER,
    project_limit_override INTEGER,
    staff_limit_override INTEGER,
    storage_limit_gb_override INTEGER,

    -- Add-ons
    white_label_enabled BOOLEAN DEFAULT FALSE,
    custom_domain VARCHAR(255),
    extra_clients_purchased INTEGER DEFAULT 0,
    extra_storage_gb_purchased INTEGER DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_agency_subscription UNIQUE(agency_id)
);

CREATE INDEX idx_subscriptions_agency ON agency_subscriptions(agency_id);
CREATE INDEX idx_subscriptions_stripe_customer ON agency_subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON agency_subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON agency_subscriptions(status);

-- ============================================================================
-- AGENCY MEMBERS
-- ============================================================================
CREATE TABLE agency_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'staff', -- owner, staff

    -- Invitation tracking
    invitation_email VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Either user_id OR invitation_email must be set
    CONSTRAINT agency_member_user_or_invite CHECK (
        user_id IS NOT NULL OR invitation_email IS NOT NULL
    ),
    CONSTRAINT unique_agency_user UNIQUE(agency_id, user_id),
    CONSTRAINT unique_agency_invite UNIQUE(agency_id, invitation_email)
);

CREATE INDEX idx_agency_members_agency ON agency_members(agency_id);
CREATE INDEX idx_agency_members_user ON agency_members(user_id);
CREATE INDEX idx_agency_members_token ON agency_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_agency_members_role ON agency_members(role);

-- ============================================================================
-- PROJECTS
-- ============================================================================
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
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete support
);

CREATE INDEX idx_projects_agency ON projects(agency_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_agency_status ON projects(agency_id, status);
CREATE INDEX idx_projects_deleted ON projects(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- PROJECT MEMBERS
-- ============================================================================
CREATE TABLE project_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- lead, staff, client

    -- Invitation tracking (primarily for clients)
    invitation_email VARCHAR(255),
    invitation_token VARCHAR(255) UNIQUE,
    invitation_expires_at TIMESTAMPTZ,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,

    -- Notification preferences
    email_notifications BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Either user_id OR invitation_email must be set
    CONSTRAINT project_member_user_or_invite CHECK (
        user_id IS NOT NULL OR invitation_email IS NOT NULL
    ),
    CONSTRAINT unique_project_user UNIQUE(project_id, user_id),
    CONSTRAINT unique_project_invite UNIQUE(project_id, invitation_email)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
CREATE INDEX idx_project_members_role ON project_members(role);
CREATE INDEX idx_project_members_token ON project_members(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX idx_project_members_project_role ON project_members(project_id, role);

-- ============================================================================
-- PROJECT NOTES (Created before attachments due to FK dependency)
-- ============================================================================
CREATE TABLE project_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    title VARCHAR(255),
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete support
);

CREATE INDEX idx_project_notes_project ON project_notes(project_id);
CREATE INDEX idx_project_notes_pinned ON project_notes(project_id, is_pinned) WHERE is_pinned = TRUE;
CREATE INDEX idx_project_notes_deleted ON project_notes(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- REQUESTS
-- ============================================================================
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
    updated_by UUID REFERENCES users(id),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete support
);

CREATE INDEX idx_requests_project ON requests(project_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(type);
CREATE INDEX idx_requests_priority ON requests(priority);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_updated_at ON requests(updated_at DESC);
CREATE INDEX idx_requests_project_status ON requests(project_id, status);
CREATE INDEX idx_requests_deleted ON requests(deleted_at) WHERE deleted_at IS NULL;

-- Composite index for common filter combinations
CREATE INDEX idx_requests_project_filters ON requests(project_id, status, type, priority) WHERE deleted_at IS NULL;

-- ============================================================================
-- REQUEST ASSIGNMENTS
-- ============================================================================
CREATE TABLE request_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_request_assignment UNIQUE(request_id, user_id)
);

CREATE INDEX idx_request_assignments_request ON request_assignments(request_id);
CREATE INDEX idx_request_assignments_user ON request_assignments(user_id);

-- ============================================================================
-- REQUEST MESSAGES
-- ============================================================================
CREATE TABLE request_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- TRUE = internal note, not visible to client

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ -- Soft delete - shows "Message deleted" in UI
);

CREATE INDEX idx_request_messages_request ON request_messages(request_id);
CREATE INDEX idx_request_messages_internal ON request_messages(request_id, is_internal);
CREATE INDEX idx_request_messages_created ON request_messages(created_at);
CREATE INDEX idx_request_messages_deleted ON request_messages(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- ATTACHMENTS (Polymorphic - can belong to request, message, or note)
-- ============================================================================
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Polymorphic references
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    message_id UUID REFERENCES request_messages(id) ON DELETE CASCADE,
    note_id UUID REFERENCES project_notes(id) ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Storage path in Supabase
    file_url TEXT NOT NULL,  -- Public or signed URL
    file_size INTEGER NOT NULL, -- bytes
    file_type VARCHAR(100) NOT NULL, -- MIME type

    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure attachment belongs to exactly one parent
    CONSTRAINT attachment_single_parent CHECK (
        (CASE WHEN request_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN message_id IS NOT NULL THEN 1 ELSE 0 END +
         CASE WHEN note_id IS NOT NULL THEN 1 ELSE 0 END) = 1
    )
);

CREATE INDEX idx_attachments_request ON attachments(request_id) WHERE request_id IS NOT NULL;
CREATE INDEX idx_attachments_message ON attachments(message_id) WHERE message_id IS NOT NULL;
CREATE INDEX idx_attachments_note ON attachments(note_id) WHERE note_id IS NOT NULL;
CREATE INDEX idx_attachments_uploaded_by ON attachments(uploaded_by);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    type VARCHAR(50) NOT NULL, -- new_request, status_changed, new_reply, assignment, invitation, etc.
    title VARCHAR(255) NOT NULL,
    body TEXT,

    -- Polymorphic reference for navigation
    reference_type VARCHAR(50), -- request, project, message, agency
    reference_id UUID,

    -- Additional context
    data JSONB DEFAULT '{}'::jsonb,

    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, read_at) WHERE read_at IS NULL;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================================
-- NOTIFICATION PREFERENCES
-- ============================================================================
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Global email toggle
    email_enabled BOOLEAN DEFAULT TRUE,

    -- Granular preferences (can expand later)
    email_new_request BOOLEAN DEFAULT TRUE,
    email_status_change BOOLEAN DEFAULT TRUE,
    email_new_reply BOOLEAN DEFAULT TRUE,
    email_assignment BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_notification_prefs UNIQUE(user_id)
);

CREATE INDEX idx_notification_prefs_user ON notification_preferences(user_id);

-- ============================================================================
-- CONVERSATION MUTES (Per-request email muting)
-- ============================================================================
CREATE TABLE conversation_mutes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_request_mute UNIQUE(user_id, request_id)
);

CREATE INDEX idx_conversation_mutes_user ON conversation_mutes(user_id);
CREATE INDEX idx_conversation_mutes_request ON conversation_mutes(request_id);

-- ============================================================================
-- REQUEST ACTIVITY LOG
-- ============================================================================
CREATE TABLE request_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),

    action VARCHAR(50) NOT NULL, -- created, status_changed, assigned, unassigned, priority_changed, completed, message_sent, message_edited, message_deleted, attachment_added, attachment_deleted
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    metadata JSONB DEFAULT '{}'::jsonb,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_log_request ON request_activity_log(request_id);
CREATE INDEX idx_activity_log_request_created ON request_activity_log(request_id, created_at DESC);
CREATE INDEX idx_activity_log_action ON request_activity_log(action);

-- ============================================================================
-- USER DEVICES (For push notifications - future iOS support)
-- ============================================================================
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    device_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL, -- ios, android, web
    device_name VARCHAR(255),

    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_user_device_token UNIQUE(user_id, device_token)
);

CREATE INDEX idx_user_devices_user ON user_devices(user_id);
CREATE INDEX idx_user_devices_platform ON user_devices(platform);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Active Clients Count View (Fixed: properly counts active clients in last 30 days)
CREATE OR REPLACE VIEW active_clients_count AS
SELECT
    a.id AS agency_id,
    COUNT(DISTINCT pm.user_id) AS active_client_count
FROM agencies a
LEFT JOIN projects p ON p.agency_id = a.id AND p.status != 'archived' AND p.deleted_at IS NULL
LEFT JOIN project_members pm ON pm.project_id = p.id AND pm.role = 'client' AND pm.user_id IS NOT NULL
LEFT JOIN requests r ON r.project_id = p.id AND r.deleted_at IS NULL
WHERE a.deleted_at IS NULL
  AND (
    -- Client created a request in last 30 days
    (r.created_by = pm.user_id AND r.created_at > NOW() - INTERVAL '30 days')
    OR
    -- Or a request they're associated with was updated in last 30 days
    (r.updated_at > NOW() - INTERVAL '30 days' AND EXISTS (
      SELECT 1 FROM request_messages rm
      WHERE rm.request_id = r.id
      AND rm.user_id = pm.user_id
      AND rm.created_at > NOW() - INTERVAL '30 days'
    ))
  )
GROUP BY a.id;

-- Agency Storage Usage View (Fixed: includes all attachment sources)
CREATE OR REPLACE VIEW agency_storage_usage AS
SELECT
    a.id AS agency_id,
    COALESCE(SUM(att.file_size), 0) AS total_bytes,
    COALESCE(SUM(att.file_size) / (1024.0 * 1024.0 * 1024.0), 0) AS total_gb
FROM agencies a
LEFT JOIN projects p ON p.agency_id = a.id AND p.deleted_at IS NULL
LEFT JOIN requests r ON r.project_id = p.id AND r.deleted_at IS NULL
LEFT JOIN request_messages rm ON rm.request_id = r.id AND rm.deleted_at IS NULL
LEFT JOIN project_notes pn ON pn.project_id = p.id AND pn.deleted_at IS NULL
LEFT JOIN attachments att ON (
    att.request_id = r.id OR
    att.message_id = rm.id OR
    att.note_id = pn.id
)
WHERE a.deleted_at IS NULL
GROUP BY a.id;

-- Agency Stats View (convenient for dashboard)
CREATE OR REPLACE VIEW agency_stats AS
SELECT
    a.id AS agency_id,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'active') AS active_projects,
    COUNT(DISTINCT p.id) FILTER (WHERE p.status != 'archived') AS total_projects,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'submitted') AS submitted_requests,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'in_progress') AS in_progress_requests,
    COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'complete') AS complete_requests,
    COUNT(DISTINCT am.user_id) FILTER (WHERE am.user_id IS NOT NULL) AS staff_count
FROM agencies a
LEFT JOIN projects p ON p.agency_id = a.id AND p.deleted_at IS NULL
LEFT JOIN requests r ON r.project_id = p.id AND r.deleted_at IS NULL
LEFT JOIN agency_members am ON am.agency_id = a.id AND am.role = 'staff'
WHERE a.deleted_at IS NULL
GROUP BY a.id;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate a unique slug for agencies
CREATE OR REPLACE FUNCTION generate_agency_slug(agency_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert to lowercase, replace spaces with hyphens, remove special chars
    base_slug := lower(regexp_replace(agency_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
    base_slug := regexp_replace(base_slug, '-+', '-', 'g');
    base_slug := trim(both '-' from base_slug);

    -- Start with base slug
    final_slug := base_slug;

    -- Check for uniqueness, append number if needed
    WHILE EXISTS (SELECT 1 FROM agencies WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;

    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to generate secure invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to check tier limits
CREATE OR REPLACE FUNCTION check_agency_limits(
    p_agency_id UUID,
    p_limit_type TEXT -- 'clients', 'projects', 'staff', 'storage'
)
RETURNS TABLE (
    current_count INTEGER,
    limit_value INTEGER,
    within_limit BOOLEAN
) AS $$
DECLARE
    v_tier VARCHAR(20);
    v_override INTEGER;
    v_extra INTEGER;
    v_base_limit INTEGER;
    v_current INTEGER;
    v_total_limit INTEGER;
BEGIN
    -- Get subscription details
    SELECT
        s.tier,
        CASE p_limit_type
            WHEN 'clients' THEN s.active_client_limit_override
            WHEN 'projects' THEN s.project_limit_override
            WHEN 'staff' THEN s.staff_limit_override
            WHEN 'storage' THEN s.storage_limit_gb_override
        END,
        CASE p_limit_type
            WHEN 'clients' THEN s.extra_clients_purchased
            ELSE 0
        END
    INTO v_tier, v_override, v_extra
    FROM agency_subscriptions s
    WHERE s.agency_id = p_agency_id;

    -- Get tier base limit
    SELECT
        CASE p_limit_type
            WHEN 'clients' THEN t.active_client_limit
            WHEN 'projects' THEN t.project_limit
            WHEN 'staff' THEN t.staff_limit
            WHEN 'storage' THEN t.storage_limit_gb
        END
    INTO v_base_limit
    FROM tier_limits t
    WHERE t.tier = v_tier;

    -- Calculate total limit (override takes precedence, then base + extra)
    v_total_limit := COALESCE(v_override, COALESCE(v_base_limit, 0) + COALESCE(v_extra, 0));

    -- Get current count
    CASE p_limit_type
        WHEN 'clients' THEN
            SELECT COALESCE(active_client_count, 0) INTO v_current
            FROM active_clients_count WHERE agency_id = p_agency_id;
        WHEN 'projects' THEN
            SELECT COUNT(*) INTO v_current
            FROM projects WHERE agency_id = p_agency_id AND status != 'archived' AND deleted_at IS NULL;
        WHEN 'staff' THEN
            SELECT COUNT(*) INTO v_current
            FROM agency_members WHERE agency_id = p_agency_id AND user_id IS NOT NULL;
        WHEN 'storage' THEN
            SELECT COALESCE(CEIL(total_gb), 0)::INTEGER INTO v_current
            FROM agency_storage_usage WHERE agency_id = p_agency_id;
    END CASE;

    v_current := COALESCE(v_current, 0);

    RETURN QUERY SELECT
        v_current,
        v_total_limit,
        (v_total_limit IS NULL OR v_current < v_total_limit);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agency_subscriptions_updated_at BEFORE UPDATE ON agency_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_notes_updated_at BEFORE UPDATE ON project_notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_request_messages_updated_at BEFORE UPDATE ON request_messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate slug for new agencies
CREATE OR REPLACE FUNCTION auto_generate_agency_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_agency_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_agency_slug_trigger BEFORE INSERT ON agencies
    FOR EACH ROW EXECUTE FUNCTION auto_generate_agency_slug();

-- Auto-create subscription for new agencies
CREATE OR REPLACE FUNCTION auto_create_agency_subscription()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agency_subscriptions (agency_id, tier, status)
    VALUES (NEW.id, 'free', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_agency_subscription_trigger AFTER INSERT ON agencies
    FOR EACH ROW EXECUTE FUNCTION auto_create_agency_subscription();

-- Auto-add owner as agency member
CREATE OR REPLACE FUNCTION auto_add_agency_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO agency_members (agency_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_agency_owner_trigger AFTER INSERT ON agencies
    FOR EACH ROW EXECUTE FUNCTION auto_add_agency_owner();

-- Auto-create notification preferences for new users
CREATE OR REPLACE FUNCTION auto_create_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_notification_prefs_trigger AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION auto_create_notification_preferences();

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_mutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Agency members can see each other's basic info
CREATE POLICY "Agency members can read other members" ON users
    FOR SELECT USING (
        id IN (
            SELECT am2.user_id FROM agency_members am1
            JOIN agency_members am2 ON am1.agency_id = am2.agency_id
            WHERE am1.user_id = auth.uid() AND am2.user_id IS NOT NULL
        )
        OR
        id IN (
            SELECT pm2.user_id FROM project_members pm1
            JOIN project_members pm2 ON pm1.project_id = pm2.project_id
            WHERE pm1.user_id = auth.uid() AND pm2.user_id IS NOT NULL
        )
    );

-- Agencies policies
CREATE POLICY "Members can read agency" ON agencies
    FOR SELECT USING (
        id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Owner can update agency" ON agencies
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Users can create agency" ON agencies
    FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Agency subscriptions policies
CREATE POLICY "Members can read subscription" ON agency_subscriptions
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Owner can update subscription" ON agency_subscriptions
    FOR UPDATE USING (
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    );

-- Agency members policies
CREATE POLICY "Members can read agency members" ON agency_members
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Owner can manage agency members" ON agency_members
    FOR ALL USING (
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    );

-- Allow reading pending invitations by token
CREATE POLICY "Can read own invitation by token" ON agency_members
    FOR SELECT USING (invitation_token IS NOT NULL);

-- Projects policies
CREATE POLICY "Agency members can read projects" ON projects
    FOR SELECT USING (
        agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Project members can read their projects" ON projects
    FOR SELECT USING (
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Staff can create projects" ON projects
    FOR INSERT WITH CHECK (
        agency_id IN (SELECT agency_id FROM agency_members WHERE user_id = auth.uid())
    );

CREATE POLICY "Owner and leads can update projects" ON projects
    FOR UPDATE USING (
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
        OR
        id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'lead')
    );

CREATE POLICY "Owner can delete projects" ON projects
    FOR DELETE USING (
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    );

-- Project members policies
CREATE POLICY "Project participants can read members" ON project_members
    FOR SELECT USING (
        project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        OR
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Staff can manage project members" ON project_members
    FOR ALL USING (
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
    );

-- Allow reading pending invitations by token
CREATE POLICY "Can read own project invitation by token" ON project_members
    FOR SELECT USING (invitation_token IS NOT NULL);

-- Project notes policies (agency only)
CREATE POLICY "Agency members can read notes" ON project_notes
    FOR SELECT USING (
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Agency members can create notes" ON project_notes
    FOR INSERT WITH CHECK (
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
        AND user_id = auth.uid()
    );

CREATE POLICY "Note author can update notes" ON project_notes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Note author or owner can delete notes" ON project_notes
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
        ))
    );

-- Requests policies
CREATE POLICY "Project participants can read requests" ON requests
    FOR SELECT USING (
        project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
        OR
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Clients can create requests" ON requests
    FOR INSERT WITH CHECK (
        project_id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'client')
        AND created_by = auth.uid()
    );

CREATE POLICY "Agency staff can update requests" ON requests
    FOR UPDATE USING (
        project_id IN (SELECT id FROM projects WHERE agency_id IN (
            SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
        ))
    );

-- Request assignments policies
CREATE POLICY "Project participants can read assignments" ON request_assignments
    FOR SELECT USING (
        request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        ))
        OR
        request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT id FROM projects WHERE agency_id IN (
                SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
            )
        ))
    );

CREATE POLICY "Agency staff can manage assignments" ON request_assignments
    FOR ALL USING (
        request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT id FROM projects WHERE agency_id IN (
                SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
            )
        ))
    );

-- Request messages policies
CREATE POLICY "Agency staff see all messages" ON request_messages
    FOR SELECT USING (
        request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT id FROM projects WHERE agency_id IN (
                SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
            )
        ))
    );

CREATE POLICY "Clients see non-internal messages" ON request_messages
    FOR SELECT USING (
        is_internal = FALSE
        AND request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'client'
        ))
    );

CREATE POLICY "Project participants can send messages" ON request_messages
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
        AND (
            -- Agency members can send to any request in their agency
            request_id IN (SELECT id FROM requests WHERE project_id IN (
                SELECT id FROM projects WHERE agency_id IN (
                    SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
                )
            ))
            OR
            -- Clients can only send non-internal messages to their requests
            (is_internal = FALSE AND request_id IN (SELECT id FROM requests WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role = 'client'
            )))
        )
    );

CREATE POLICY "Author can update own message" ON request_messages
    FOR UPDATE USING (user_id = auth.uid());

-- Attachments policies
CREATE POLICY "Can read attachments of accessible resources" ON attachments
    FOR SELECT USING (
        -- Request attachments
        (request_id IS NOT NULL AND request_id IN (
            SELECT id FROM requests WHERE project_id IN (
                SELECT project_id FROM project_members WHERE user_id = auth.uid()
            ) OR project_id IN (
                SELECT id FROM projects WHERE agency_id IN (
                    SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
                )
            )
        ))
        OR
        -- Message attachments (follow message visibility)
        (message_id IS NOT NULL AND message_id IN (
            SELECT id FROM request_messages rm WHERE
            (rm.is_internal = FALSE OR EXISTS (
                SELECT 1 FROM requests r
                JOIN projects p ON r.project_id = p.id
                JOIN agency_members am ON p.agency_id = am.agency_id
                WHERE r.id = rm.request_id AND am.user_id = auth.uid()
            ))
        ))
        OR
        -- Note attachments (agency only)
        (note_id IS NOT NULL AND note_id IN (
            SELECT id FROM project_notes WHERE project_id IN (
                SELECT id FROM projects WHERE agency_id IN (
                    SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
                )
            )
        ))
    );

CREATE POLICY "Can upload attachments" ON attachments
    FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Uploader can delete attachment" ON attachments
    FOR DELETE USING (uploaded_by = auth.uid());

-- Notifications policies
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System can create notifications (via service role)
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (TRUE);

-- Notification preferences policies
CREATE POLICY "Users can read own preferences" ON notification_preferences
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON notification_preferences
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Auto-create preferences" ON notification_preferences
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Conversation mutes policies
CREATE POLICY "Users can manage own mutes" ON conversation_mutes
    FOR ALL USING (user_id = auth.uid());

-- Activity log policies
CREATE POLICY "Project participants can read activity" ON request_activity_log
    FOR SELECT USING (
        request_id IN (SELECT id FROM requests WHERE project_id IN (
            SELECT project_id FROM project_members WHERE user_id = auth.uid()
        ) OR project_id IN (
            SELECT id FROM projects WHERE agency_id IN (
                SELECT agency_id FROM agency_members WHERE user_id = auth.uid()
            )
        ))
    );

-- System creates activity logs
CREATE POLICY "System can create activity logs" ON request_activity_log
    FOR INSERT WITH CHECK (TRUE);

-- User devices policies
CREATE POLICY "Users can manage own devices" ON user_devices
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on all sequences (for inserts)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant access to tier_limits for all (read-only reference data)
GRANT SELECT ON tier_limits TO anon, authenticated;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'User accounts for both agency staff and clients';
COMMENT ON TABLE agencies IS 'Agency organizations that use the platform';
COMMENT ON TABLE agency_subscriptions IS 'Subscription and billing info per agency';
COMMENT ON TABLE tier_limits IS 'Reference table for tier-based limits and features';
COMMENT ON TABLE agency_members IS 'Staff members belonging to an agency';
COMMENT ON TABLE projects IS 'Client projects managed by agencies';
COMMENT ON TABLE project_members IS 'Users assigned to projects (leads, staff, clients)';
COMMENT ON TABLE project_notes IS 'Internal notes for projects (agency-only)';
COMMENT ON TABLE requests IS 'Client requests/tickets within projects';
COMMENT ON TABLE request_assignments IS 'Staff assignments to requests';
COMMENT ON TABLE request_messages IS 'Conversation messages on requests';
COMMENT ON TABLE attachments IS 'File attachments (polymorphic: request, message, or note)';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE notification_preferences IS 'User notification settings';
COMMENT ON TABLE conversation_mutes IS 'Per-request email muting';
COMMENT ON TABLE request_activity_log IS 'Audit trail for request changes';
COMMENT ON TABLE user_devices IS 'Device tokens for push notifications';
