-- Migration 001: Initial schema for Vendor Pricelist Management System
-- Created: January 2025
-- Description: Creates all tables, indexes, and triggers for the initial system

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
    preferred_currency VARCHAR(3) DEFAULT 'BHT',
    payment_terms TEXT,
    company_registration VARCHAR(100),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    business_type VARCHAR(100),
    certifications TEXT[],
    languages TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_currency CHECK (preferred_currency ~ '^[A-Z]{3}$')
);

-- Vendor metrics table
CREATE TABLE vendor_metrics (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    response_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    completed_submissions INTEGER DEFAULT 0,
    average_completion_time DECIMAL(10,2) DEFAULT 0,
    last_submission_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    product_selection JSONB NOT NULL,
    custom_fields JSONB NOT NULL DEFAULT '[]',
    instructions TEXT,
    validity_period INTEGER DEFAULT 30,
    status template_status DEFAULT 'draft',
    allow_multi_moq BOOLEAN DEFAULT true,
    require_lead_time BOOLEAN DEFAULT false,
    default_currency VARCHAR(3) DEFAULT 'BHT',
    supported_currencies TEXT[] DEFAULT ARRAY['BHT'],
    max_items_per_submission INTEGER,
    auto_approve BOOLEAN DEFAULT false,
    notification_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
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
    schedule JSONB NOT NULL,
    status campaign_status DEFAULT 'draft',
    deadline_buffer INTEGER DEFAULT 24,
    max_submission_attempts INTEGER DEFAULT 3,
    require_manager_approval BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL,
    
    CONSTRAINT valid_deadline_buffer CHECK (deadline_buffer > 0)
);

-- Campaign analytics table
CREATE TABLE campaign_analytics (
    campaign_id UUID PRIMARY KEY REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    total_vendors INTEGER DEFAULT 0,
    invitations_sent INTEGER DEFAULT 0,
    invitations_delivered INTEGER DEFAULT 0,
    portal_accesses INTEGER DEFAULT 0,
    submissions_started INTEGER DEFAULT 0,
    submissions_completed INTEGER DEFAULT 0,
    response_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0,
    completion_rate DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    vendor_engagement JSONB DEFAULT '[]',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
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
    pricelist_id UUID,
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
    
    CONSTRAINT valid_currency_code CHECK (currency ~ '^[A-Z]{3}$'),
    CONSTRAINT valid_date_range CHECK (valid_to > valid_from),
    CONSTRAINT valid_completion_percentage CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    CONSTRAINT valid_quality_score CHECK (quality_score >= 0 AND quality_score <= 100)
);

-- Add foreign key after pricelist table creation
ALTER TABLE vendor_invitations 
ADD CONSTRAINT fk_pricelist_id 
FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE SET NULL;

-- Remaining tables...
-- (Rest of the schema from the main file)

-- Create basic indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_email ON vendors(contact_email);
CREATE INDEX idx_vendors_created_at ON vendors(created_at);

CREATE INDEX idx_templates_status ON pricelist_templates(status);
CREATE INDEX idx_templates_created_by ON pricelist_templates(created_by);

CREATE INDEX idx_campaigns_status ON collection_campaigns(status);
CREATE INDEX idx_campaigns_template_id ON collection_campaigns(template_id);

CREATE INDEX idx_invitations_vendor_id ON vendor_invitations(vendor_id);
CREATE INDEX idx_invitations_campaign_id ON vendor_invitations(campaign_id);
CREATE INDEX idx_invitations_status ON vendor_invitations(status);

CREATE INDEX idx_pricelists_vendor_id ON vendor_pricelists(vendor_id);
CREATE INDEX idx_pricelists_campaign_id ON vendor_pricelists(campaign_id);
CREATE INDEX idx_pricelists_status ON vendor_pricelists(status);

-- Create triggers
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