-- Price Management Database Schema
-- This file provides a summary of the database schema for the vendor pricelist management system

-- Vendor Price Management
-- Extends the base vendor model with price management specific fields
CREATE TABLE vendor_price_management (
  id UUID PRIMARY KEY,
  base_vendor_id UUID NOT NULL REFERENCES vendors(id),
  preferred_currency VARCHAR(3) NOT NULL,
  default_lead_time INTEGER NOT NULL,
  communication_language VARCHAR(10) NOT NULL,
  email_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  reminder_frequency VARCHAR(10) NOT NULL DEFAULT 'weekly',
  escalation_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  escalation_days INTEGER NOT NULL DEFAULT 3,
  preferred_contact_time VARCHAR(5),
  response_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  average_response_time DECIMAL(10,2) NOT NULL DEFAULT 0,
  data_quality_score INTEGER NOT NULL DEFAULT 0,
  last_submission_date TIMESTAMP WITH TIME ZONE,
  total_campaigns_invited INTEGER NOT NULL DEFAULT 0,
  total_campaigns_completed INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(10) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

-- Vendor Assigned Categories
-- Many-to-many relationship between vendors and product categories
CREATE TABLE vendor_assigned_categories (
  vendor_id UUID NOT NULL REFERENCES vendor_price_management(id),
  category_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  PRIMARY KEY (vendor_id, category_id)
);

-- Price Collection Templates
-- Templates for collecting prices from vendors
CREATE TABLE price_collection_templates (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  selection_criteria VARCHAR(10) NOT NULL DEFAULT 'include',
  supported_currencies JSONB NOT NULL DEFAULT '["USD"]',
  required_fields JSONB NOT NULL DEFAULT '["unitPrice", "moq"]',
  validity_period INTEGER NOT NULL DEFAULT 90,
  max_moq_tiers INTEGER NOT NULL DEFAULT 5,
  allow_partial_submission BOOLEAN NOT NULL DEFAULT TRUE,
  custom_instructions TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,
  previous_version_id UUID REFERENCES price_collection_templates(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

-- Template Product Selections
-- Products included in a template
CREATE TABLE template_product_selections (
  template_id UUID NOT NULL REFERENCES price_collection_templates(id),
  selection_type VARCHAR(20) NOT NULL,
  selection_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (template_id, selection_type, selection_value)
);

-- Validation Rules
-- Rules for validating price submissions
CREATE TABLE validation_rules (
  id UUID PRIMARY KEY,
  template_id UUID NOT NULL REFERENCES price_collection_templates(id),
  field VARCHAR(255) NOT NULL,
  rule_type VARCHAR(20) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  error_message TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL DEFAULT 'error',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Collection Campaigns
-- Price collection campaigns targeting specific vendors
CREATE TABLE collection_campaigns (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID NOT NULL REFERENCES price_collection_templates(id),
  schedule_type VARCHAR(20) NOT NULL DEFAULT 'one-time',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
  allow_extensions BOOLEAN NOT NULL DEFAULT TRUE,
  max_extension_days INTEGER NOT NULL DEFAULT 7,
  require_approval BOOLEAN NOT NULL DEFAULT FALSE,
  allow_late_submissions BOOLEAN NOT NULL DEFAULT TRUE,
  auto_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  max_extensions INTEGER NOT NULL DEFAULT 2,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL
);

-- Campaign Vendors
-- Many-to-many relationship between campaigns and vendors
CREATE TABLE campaign_vendors (
  campaign_id UUID NOT NULL REFERENCES collection_campaigns(id),
  vendor_id UUID NOT NULL REFERENCES vendor_price_management(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, vendor_id)
);

-- Reminder Configurations
-- Reminder settings for campaigns
CREATE TABLE reminder_configs (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES collection_campaigns(id),
  reminder_type VARCHAR(20) NOT NULL,
  days_before INTEGER NOT NULL,
  email_template VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Vendor Invitations
-- Invitations sent to vendors for price submission
CREATE TABLE vendor_invitations (
  id UUID PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES collection_campaigns(id),
  vendor_id UUID NOT NULL REFERENCES vendor_price_management(id),
  token VARCHAR(255) NOT NULL UNIQUE,
  pricelist_id UUID,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced BOOLEAN NOT NULL DEFAULT FALSE,
  bounce_reason TEXT,
  first_access_at TIMESTAMP WITH TIME ZONE,
  last_access_at TIMESTAMP WITH TIME ZONE,
  session_count INTEGER NOT NULL DEFAULT 0,
  submission_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reminders_sent INTEGER NOT NULL DEFAULT 0,
  extensions_granted INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Invitation IP Addresses
-- IP addresses used to access invitations
CREATE TABLE invitation_ip_addresses (
  invitation_id UUID NOT NULL REFERENCES vendor_invitations(id),
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (invitation_id, ip_address)
);

-- Vendor Pricelists
-- Price submissions from vendors
CREATE TABLE vendor_pricelists (
  id UUID PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendor_price_management(id),
  campaign_id UUID NOT NULL REFERENCES collection_campaigns(id),
  template_id UUID NOT NULL REFERENCES price_collection_templates(id),
  currency VARCHAR(3) NOT NULL,
  submission_method VARCHAR(10) NOT NULL DEFAULT 'online',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  quality_score INTEGER NOT NULL DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by VARCHAR(255),
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Pricelist Items
-- Individual items in a pricelist
CREATE TABLE pricelist_items (
  id UUID PRIMARY KEY,
  pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id),
  product_id VARCHAR(255) NOT NULL,
  product_code VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  category VARCHAR(255) NOT NULL,
  subcategory VARCHAR(255) NOT NULL,
  description TEXT,
  specifications JSONB,
  lead_time INTEGER,
  notes TEXT,
  validation_status VARCHAR(10) NOT NULL DEFAULT 'valid',
  validation_messages JSONB NOT NULL DEFAULT '[]',
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- MOQ Pricing
-- Minimum Order Quantity pricing tiers
CREATE TABLE moq_pricing (
  id UUID PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES pricelist_items(id),
  moq INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(15,5) NOT NULL,
  conversion_factor DECIMAL(15,5) NOT NULL DEFAULT 1.0,
  effective_unit_price DECIMAL(15,5) NOT NULL,
  lead_time INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- File Attachments
-- Files attached to pricelists
CREATE TABLE file_attachments (
  id UUID PRIMARY KEY,
  pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id),
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  download_url VARCHAR(1024) NOT NULL
);

-- Validation Results
-- Results of validation checks on pricelists
CREATE TABLE validation_results (
  id UUID PRIMARY KEY,
  pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id),
  is_valid BOOLEAN NOT NULL,
  quality_score INTEGER NOT NULL,
  errors JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  validated_by VARCHAR(255)
);

-- Portal Sessions
-- Vendor portal access sessions
CREATE TABLE portal_sessions (
  token VARCHAR(255) PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES vendor_price_management(id),
  pricelist_id UUID NOT NULL REFERENCES vendor_pricelists(id),
  campaign_id UUID NOT NULL REFERENCES collection_campaigns(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  ip_whitelist JSONB,
  max_concurrent_sessions INTEGER NOT NULL DEFAULT 1,
  max_session_duration INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_access_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Session Activities
-- Activities performed during portal sessions
CREATE TABLE session_activities (
  id UUID PRIMARY KEY,
  session_token VARCHAR(255) NOT NULL REFERENCES portal_sessions(token),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT
);

-- Campaign Analytics
-- Analytics data for campaigns
CREATE TABLE campaign_analytics (
  campaign_id UUID PRIMARY KEY REFERENCES collection_campaigns(id),
  total_vendors INTEGER NOT NULL DEFAULT 0,
  invitations_sent INTEGER NOT NULL DEFAULT 0,
  invitations_delivered INTEGER NOT NULL DEFAULT 0,
  portal_access_count INTEGER NOT NULL DEFAULT 0,
  submissions_received INTEGER NOT NULL DEFAULT 0,
  submissions_approved INTEGER NOT NULL DEFAULT 0,
  average_response_time DECIMAL(10,2) NOT NULL DEFAULT 0,
  average_quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  completion_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  on_time_submission_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);