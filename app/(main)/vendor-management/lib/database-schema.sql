-- Vendor Pricelist Management System Database Schema
-- Based on requirements from .kiro/specs/vendor-pricelist-management/

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE vendor_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE template_status AS ENUM ('draft', 'active', 'archived');
CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'completed', 'cancelled');
CREATE TYPE invitation_status AS ENUM ('pending', 'sent', 'delivered', 'accessed', 'submitted', 'expired', 'cancelled');
CREATE TYPE pricelist_status AS ENUM ('draft', 'submitted', 'approved', 'rejected', 'expired');
CREATE TYPE item_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE validation_severity AS ENUM ('error', 'warning', 'info');
CREATE TYPE rule_type AS ENUM ('validation', 'approval', 'notification', 'assignment');
CREATE TYPE email_template_type AS ENUM ('invitation', 'reminder', 'confirmation', 'approval', 'rejection');
CREATE TYPE notification_frequency AS ENUM ('immediate', 'hourly', 'daily', 'weekly');
CREATE TYPE config_type AS ENUM ('string', 'number', 'boolean', 'object', 'array');
CREATE TYPE config_category AS ENUM ('security', 'performance', 'notifications', 'validation', 'ui');

-- Vendors table
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100),
    status vendor_status DEFAULT 'active',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    payment_terms TEXT,
    company_registration VARCHAR(100),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    business_type VARCHAR(100),
    certifications TEXT[], -- JSON array
    languages TEXT[], -- JSON array
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_currency CHECK (preferred_currency ~ '^[A-Z]{3}$')
);

-- Vendor metrics table (separate for performance)
CREATE TABLE vendor_metrics (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    response_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0, -- in hours
    quality_score DECIMAL(5,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    completed_submissions INTEGER DEFAULT 0,
    average_completion_time DECIMAL(10,2) DEFAULT 0, -- in hours
    last_submission_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_percentages CHECK (
        response_rate >= 0 AND response_rate <= 100 AND
        quality_score >= 0 AND quality_score <= 100 AND
        on_time_delivery_rate >= 0 AND on_time_delivery_rate <= 100
    )
);

-- Pricelist templates table
CREATE TABLE pricelist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_selection JSONB NOT NULL, -- ProductSelection interface
    custom_fields JSONB NOT NULL DEFAULT '[]', -- CustomField[] interface
    instructions TEXT,
    validity_period INTEGER DEFAULT 30, -- days
    status template_status DEFAULT 'draft',
    allow_multi_moq BOOLEAN DEFAULT true,
    require_lead_time BOOLEAN DEFAULT false,
    default_currency VARCHAR(3) DEFAULT 'USD',
    supported_currencies TEXT[] DEFAULT ARRAY['USD'],
    max_items_per_submission INTEGER,
    auto_approve BOOLEAN DEFAULT false,
    notification_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_validity_period CHECK (validity_period > 0),
    CONSTRAINT valid_default_currency CHECK (default_currency ~ '^[A-Z]{3}$')
);

-- Collection campaigns table
CREATE TABLE collection_campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_id UUID NOT NULL REFERENCES pricelist_templates(id) ON DELETE RESTRICT,
    vendor_ids UUID[] NOT NULL,
    schedule JSONB NOT NULL, -- CampaignSchedule interface
    status campaign_status DEFAULT 'draft',
    deadline_buffer INTEGER DEFAULT 24, -- hours
    max_submission_attempts INTEGER DEFAULT 3,
    require_manager_approval BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_deadline_buffer CHECK (deadline_buffer > 0)
);

-- Campaign analytics table (separate for performance)
CREATE TABLE campaign_analytics (
    campaign_id UUID PRIMARY KEY REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    total_vendors INTEGER DEFAULT 0,
    invitations_sent INTEGER DEFAULT 0,
    invitations_delivered INTEGER DEFAULT 0,
    portal_accesses INTEGER DEFAULT 0,
    submissions_started INTEGER DEFAULT 0,
    submissions_completed INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0, -- in hours
    completion_rate DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    vendor_engagement JSONB DEFAULT '[]', -- VendorEngagement[]
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_analytics_percentages CHECK (
        response_rate >= 0 AND response_rate <= 100 AND
        completion_rate >= 0 AND completion_rate <= 100 AND
        quality_score >= 0 AND quality_score <= 100
    )
);

-- Vendor invitations table
CREATE TABLE vendor_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    pricelist_id UUID, -- Will reference vendor_pricelists after creation
    campaign_id UUID NOT NULL REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    sent_at TIMESTAMP WITH TIME ZONE,
    accessed_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status invitation_status DEFAULT 'pending',
    delivery_status JSONB DEFAULT '{}',
    reminders_sent INTEGER DEFAULT 0,
    last_reminder_sent TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_token_length CHECK (LENGTH(token) >= 32),
    CONSTRAINT valid_expires_at CHECK (expires_at > CURRENT_TIMESTAMP)
);

-- Vendor pricelists table
CREATE TABLE vendor_pricelists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES pricelist_templates(id) ON DELETE RESTRICT,
    invitation_id UUID NOT NULL REFERENCES vendor_invitations(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL,
    status pricelist_status DEFAULT 'draft',
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    approved_by UUID,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    last_auto_save TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submission_notes TEXT,
    internal_notes TEXT,
    version INTEGER DEFAULT 1,
    parent_pricelist_id UUID REFERENCES vendor_pricelists(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_currency_code CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_date_range CHECK (valid_to > valid_from),
    CONSTRAINT valid_completion_percentage CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- Add foreign key after pricelist table creation
ALTER TABLE vendor_invitations 
ADD CONSTRAINT fk_pricelist_id 
FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE SET NULL;

-- Pricelist items table
CREATE TABLE pricelist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id) ON DELETE CASCADE,
    product_id UUID NOT NULL,
    product_code VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    currency VARCHAR(3) NOT NULL,
    lead_time INTEGER, -- in days
    notes TEXT,
    custom_field_values JSONB DEFAULT '{}',
    status item_status DEFAULT 'draft',
    quality_score DECIMAL(5,2),
    validation_errors JSONB DEFAULT '[]', -- ValidationError[]
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_currency_code CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_lead_time CHECK (lead_time >= 0),
    CONSTRAINT valid_quality_score CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 100))
);

-- MOQ pricing table
CREATE TABLE moq_pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES pricelist_items(id) ON DELETE CASCADE,
    moq INTEGER NOT NULL,
    unit VARCHAR(50) NOT NULL,
    unit_price DECIMAL(12,4) NOT NULL,
    conversion_factor DECIMAL(10,4) DEFAULT 1.0,
    lead_time INTEGER, -- in days
    notes TEXT,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_moq CHECK (moq > 0),
    CONSTRAINT valid_unit_price CHECK (unit_price >= 0),
    CONSTRAINT valid_conversion_factor CHECK (conversion_factor > 0),
    CONSTRAINT valid_lead_time CHECK (lead_time IS NULL OR lead_time >= 0),
    CONSTRAINT valid_date_range CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to > valid_from),
    CONSTRAINT unique_moq_per_item UNIQUE (item_id, moq)
);

-- Portal sessions table
CREATE TABLE portal_sessions (
    token VARCHAR(255) PRIMARY KEY,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    invitation_id UUID NOT NULL REFERENCES vendor_invitations(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    max_concurrent_sessions INTEGER DEFAULT 1,
    session_timeout INTEGER DEFAULT 120, -- minutes
    extended_count INTEGER DEFAULT 0,
    max_extensions INTEGER DEFAULT 3,
    security_flags JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_access_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_token_length CHECK (LENGTH(token) >= 32),
    CONSTRAINT valid_expires_at CHECK (expires_at > CURRENT_TIMESTAMP),
    CONSTRAINT valid_session_timeout CHECK (session_timeout > 0),
    CONSTRAINT valid_max_extensions CHECK (max_extensions >= 0)
);

-- Session activity table
CREATE TABLE session_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR(255) NOT NULL REFERENCES portal_sessions(token) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}',
    ip_address INET NOT NULL,
    user_agent TEXT,
    duration INTEGER, -- in seconds
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
    -- Constraints
    CONSTRAINT valid_duration CHECK (duration IS NULL OR duration >= 0)
);

-- Business rules table
CREATE TABLE business_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type rule_type NOT NULL,
    conditions JSONB NOT NULL,
    actions JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);

-- Email templates table
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type email_template_type NOT NULL,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT NOT NULL,
    variables TEXT[] DEFAULT ARRAY[]::TEXT[],
    language VARCHAR(10) DEFAULT 'en',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    -- Constraints
    CONSTRAINT unique_default_per_type_language UNIQUE (type, language, is_default) WHERE is_default = true
);

-- Notification settings table
CREATE TABLE notification_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    preferences JSONB DEFAULT '{}',
    quiet_hours JSONB DEFAULT '{}',
    frequency notification_frequency DEFAULT 'immediate',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    context JSONB DEFAULT '{}'
);

-- System configuration table
CREATE TABLE system_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) NOT NULL UNIQUE,
    value JSONB NOT NULL,
    type config_type NOT NULL,
    description TEXT,
    category config_category NOT NULL,
    is_editable BOOLEAN DEFAULT true,
    default_value JSONB,
    validation_rules JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_by UUID
);

-- Create indexes for performance
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_email ON vendors(contact_email);
CREATE INDEX idx_vendors_created_at ON vendors(created_at);

CREATE INDEX idx_templates_status ON pricelist_templates(status);
CREATE INDEX idx_templates_created_by ON pricelist_templates(created_by);

CREATE INDEX idx_campaigns_status ON collection_campaigns(status);
CREATE INDEX idx_campaigns_template_id ON collection_campaigns(template_id);
CREATE INDEX idx_campaigns_created_at ON collection_campaigns(created_at);

CREATE INDEX idx_invitations_vendor_id ON vendor_invitations(vendor_id);
CREATE INDEX idx_invitations_campaign_id ON vendor_invitations(campaign_id);
CREATE INDEX idx_invitations_status ON vendor_invitations(status);
CREATE INDEX idx_invitations_expires_at ON vendor_invitations(expires_at);

CREATE INDEX idx_pricelists_vendor_id ON vendor_pricelists(vendor_id);
CREATE INDEX idx_pricelists_campaign_id ON vendor_pricelists(campaign_id);
CREATE INDEX idx_pricelists_status ON vendor_pricelists(status);
CREATE INDEX idx_pricelists_valid_from ON vendor_pricelists(valid_from);
CREATE INDEX idx_pricelists_valid_to ON vendor_pricelists(valid_to);

CREATE INDEX idx_items_pricelist_id ON pricelist_items(pricelist_id);
CREATE INDEX idx_items_product_id ON pricelist_items(product_id);
CREATE INDEX idx_items_status ON pricelist_items(status);
CREATE INDEX idx_items_category ON pricelist_items(category);

CREATE INDEX idx_moq_item_id ON moq_pricing(item_id);
CREATE INDEX idx_moq_moq_value ON moq_pricing(moq);

CREATE INDEX idx_sessions_vendor_id ON portal_sessions(vendor_id);
CREATE INDEX idx_sessions_expires_at ON portal_sessions(expires_at);
CREATE INDEX idx_sessions_is_active ON portal_sessions(is_active);

CREATE INDEX idx_activities_session_token ON session_activities(session_token);
CREATE INDEX idx_activities_timestamp ON session_activities(timestamp);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- Create composite indexes for common queries
CREATE INDEX idx_pricelists_vendor_campaign ON vendor_pricelists(vendor_id, campaign_id);
CREATE INDEX idx_invitations_vendor_campaign ON vendor_invitations(vendor_id, campaign_id);
CREATE INDEX idx_items_pricelist_status ON pricelist_items(pricelist_id, status);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON pricelist_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON collection_campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON vendor_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricelists_updated_at BEFORE UPDATE ON vendor_pricelists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON business_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update vendor metrics
CREATE OR REPLACE FUNCTION update_vendor_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update vendor metrics when a pricelist is submitted
    IF NEW.status = 'submitted' AND OLD.status != 'submitted' THEN
        INSERT INTO vendor_metrics (vendor_id) VALUES (NEW.vendor_id)
        ON CONFLICT (vendor_id) DO UPDATE SET
            completed_submissions = vendor_metrics.completed_submissions + 1,
            last_submission_date = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_metrics_trigger AFTER UPDATE ON vendor_pricelists
    FOR EACH ROW EXECUTE FUNCTION update_vendor_metrics();

-- Create function to update campaign analytics
CREATE OR REPLACE FUNCTION update_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update campaign analytics when invitation status changes
    IF NEW.status != OLD.status THEN
        INSERT INTO campaign_analytics (campaign_id) VALUES (NEW.campaign_id)
        ON CONFLICT (campaign_id) DO UPDATE SET
            invitations_sent = CASE WHEN NEW.status = 'sent' THEN campaign_analytics.invitations_sent + 1 ELSE campaign_analytics.invitations_sent END,
            invitations_delivered = CASE WHEN NEW.status = 'delivered' THEN campaign_analytics.invitations_delivered + 1 ELSE campaign_analytics.invitations_delivered END,
            portal_accesses = CASE WHEN NEW.status = 'accessed' THEN campaign_analytics.portal_accesses + 1 ELSE campaign_analytics.portal_accesses END,
            submissions_completed = CASE WHEN NEW.status = 'submitted' THEN campaign_analytics.submissions_completed + 1 ELSE campaign_analytics.submissions_completed END,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_analytics_trigger AFTER UPDATE ON vendor_invitations
    FOR EACH ROW EXECUTE FUNCTION update_campaign_analytics();