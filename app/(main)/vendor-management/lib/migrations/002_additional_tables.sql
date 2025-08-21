-- Migration 002: Additional tables for complete system
-- Created: January 2025
-- Description: Adds remaining tables for pricing, sessions, rules, and audit

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
    lead_time INTEGER,
    notes TEXT,
    custom_field_values JSONB DEFAULT '{}',
    status item_status DEFAULT 'draft',
    quality_score DECIMAL(5,2),
    validation_errors JSONB DEFAULT '[]',
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    lead_time INTEGER,
    notes TEXT,
    valid_from TIMESTAMP WITH TIME ZONE,
    valid_to TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    session_timeout INTEGER DEFAULT 120,
    extended_count INTEGER DEFAULT 0,
    max_extensions INTEGER DEFAULT 3,
    security_flags JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_access_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    duration INTEGER,
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    
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

-- Additional indexes for new tables
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

-- Composite indexes for common queries
CREATE INDEX idx_pricelists_vendor_campaign ON vendor_pricelists(vendor_id, campaign_id);
CREATE INDEX idx_invitations_vendor_campaign ON vendor_invitations(vendor_id, campaign_id);
CREATE INDEX idx_items_pricelist_status ON pricelist_items(pricelist_id, status);

-- Additional triggers for new tables
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON business_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();