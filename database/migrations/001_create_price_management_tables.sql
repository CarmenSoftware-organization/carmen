-- Migration: Create Vendor Price Management Tables
-- Description: Sets up the database schema for the vendor pricelist management system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------
-- Table vendor_price_management
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_price_management (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  base_vendor_id UUID NOT NULL,
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
  created_by VARCHAR(255) NOT NULL,
  CONSTRAINT fk_base_vendor FOREIGN KEY (base_vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
  CONSTRAINT chk_status CHECK (status IN ('active', 'inactive', 'suspended')),
  CONSTRAINT chk_reminder_frequency CHECK (reminder_frequency IN ('daily', 'weekly', 'custom'))
);

CREATE INDEX idx_vendor_price_management_base_vendor_id ON vendor_price_management(base_vendor_id);
CREATE INDEX idx_vendor_price_management_status ON vendor_price_management(status);

-- -----------------------------------------------------
-- Table vendor_assigned_categories
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_assigned_categories (
  vendor_id UUID NOT NULL,
  category_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  PRIMARY KEY (vendor_id, category_id),
  CONSTRAINT fk_vendor_category_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_price_management(id) ON DELETE CASCADE
);

CREATE INDEX idx_vendor_assigned_categories_category_id ON vendor_assigned_categories(category_id);

-- -----------------------------------------------------
-- Table price_collection_templates
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS price_collection_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  previous_version_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by VARCHAR(255) NOT NULL,
  CONSTRAINT chk_template_status CHECK (status IN ('draft', 'active', 'archived')),
  CONSTRAINT chk_selection_criteria CHECK (selection_criteria IN ('include', 'exclude')),
  CONSTRAINT fk_previous_version FOREIGN KEY (previous_version_id) REFERENCES price_collection_templates(id) ON DELETE SET NULL
);

CREATE INDEX idx_price_collection_templates_status ON price_collection_templates(status);
CREATE INDEX idx_price_collection_templates_created_by ON price_collection_templates(created_by);

-- -----------------------------------------------------
-- Table template_product_selections
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS template_product_selections (
  template_id UUID NOT NULL,
  selection_type VARCHAR(20) NOT NULL,
  selection_value VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (template_id, selection_type, selection_value),
  CONSTRAINT fk_template_selection FOREIGN KEY (template_id) REFERENCES price_collection_templates(id) ON DELETE CASCADE,
  CONSTRAINT chk_selection_type CHECK (selection_type IN ('category', 'subcategory', 'itemGroup', 'specificItem'))
);

CREATE INDEX idx_template_product_selections_selection_value ON template_product_selections(selection_value);

-- -----------------------------------------------------
-- Table validation_rules
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS validation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL,
  field VARCHAR(255) NOT NULL,
  rule_type VARCHAR(20) NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  error_message TEXT NOT NULL,
  severity VARCHAR(10) NOT NULL DEFAULT 'error',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_validation_template FOREIGN KEY (template_id) REFERENCES price_collection_templates(id) ON DELETE CASCADE,
  CONSTRAINT chk_rule_type CHECK (rule_type IN ('required', 'format', 'range', 'business-rule', 'custom')),
  CONSTRAINT chk_severity CHECK (severity IN ('error', 'warning', 'info'))
);

CREATE INDEX idx_validation_rules_template_id ON validation_rules(template_id);
CREATE INDEX idx_validation_rules_field ON validation_rules(field);

-- -----------------------------------------------------
-- Table collection_campaigns
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS collection_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  template_id UUID NOT NULL,
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
  created_by VARCHAR(255) NOT NULL,
  CONSTRAINT fk_campaign_template FOREIGN KEY (template_id) REFERENCES price_collection_templates(id) ON DELETE RESTRICT,
  CONSTRAINT chk_campaign_status CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT chk_schedule_type CHECK (schedule_type IN ('one-time', 'recurring', 'event-based'))
);

CREATE INDEX idx_collection_campaigns_template_id ON collection_campaigns(template_id);
CREATE INDEX idx_collection_campaigns_status ON collection_campaigns(status);
CREATE INDEX idx_collection_campaigns_date_range ON collection_campaigns(start_date, end_date);

-- -----------------------------------------------------
-- Table campaign_vendors
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_vendors (
  campaign_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (campaign_id, vendor_id),
  CONSTRAINT fk_campaign_vendor_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_campaign_vendor_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_price_management(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table reminder_configs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS reminder_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL,
  reminder_type VARCHAR(20) NOT NULL,
  days_before INTEGER NOT NULL,
  email_template VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_reminder_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT chk_reminder_type CHECK (reminder_type IN ('initial', 'reminder', 'final', 'escalation'))
);

CREATE INDEX idx_reminder_configs_campaign_id ON reminder_configs(campaign_id);

-- -----------------------------------------------------
-- Table vendor_invitations
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_invitation_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_invitation_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_price_management(id) ON DELETE CASCADE,
  CONSTRAINT chk_submission_status CHECK (submission_status IN ('pending', 'in-progress', 'submitted', 'approved', 'rejected', 'expired'))
);

CREATE INDEX idx_vendor_invitations_campaign_id ON vendor_invitations(campaign_id);
CREATE INDEX idx_vendor_invitations_vendor_id ON vendor_invitations(vendor_id);
CREATE INDEX idx_vendor_invitations_token ON vendor_invitations(token);
CREATE INDEX idx_vendor_invitations_status ON vendor_invitations(submission_status);
CREATE INDEX idx_vendor_invitations_expires_at ON vendor_invitations(expires_at);

-- -----------------------------------------------------
-- Table invitation_ip_addresses
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS invitation_ip_addresses (
  invitation_id UUID NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (invitation_id, ip_address),
  CONSTRAINT fk_ip_invitation FOREIGN KEY (invitation_id) REFERENCES vendor_invitations(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Table vendor_pricelists
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS vendor_pricelists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  template_id UUID NOT NULL,
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
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pricelist_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_price_management(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricelist_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_pricelist_template FOREIGN KEY (template_id) REFERENCES price_collection_templates(id) ON DELETE RESTRICT,
  CONSTRAINT chk_pricelist_status CHECK (status IN ('draft', 'submitted', 'under-review', 'approved', 'rejected')),
  CONSTRAINT chk_submission_method CHECK (submission_method IN ('online', 'upload', 'email'))
);

CREATE INDEX idx_vendor_pricelists_vendor_id ON vendor_pricelists(vendor_id);
CREATE INDEX idx_vendor_pricelists_campaign_id ON vendor_pricelists(campaign_id);
CREATE INDEX idx_vendor_pricelists_status ON vendor_pricelists(status);
CREATE INDEX idx_vendor_pricelists_validity ON vendor_pricelists(valid_from, valid_to);

-- -----------------------------------------------------
-- Table pricelist_items
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS pricelist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricelist_id UUID NOT NULL,
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
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_item_pricelist FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE CASCADE,
  CONSTRAINT chk_validation_status CHECK (validation_status IN ('valid', 'warning', 'error'))
);

CREATE INDEX idx_pricelist_items_pricelist_id ON pricelist_items(pricelist_id);
CREATE INDEX idx_pricelist_items_product_id ON pricelist_items(product_id);
CREATE INDEX idx_pricelist_items_validation_status ON pricelist_items(validation_status);

-- -----------------------------------------------------
-- Table moq_pricing
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS moq_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL,
  moq INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL,
  unit_price DECIMAL(15,5) NOT NULL,
  conversion_factor DECIMAL(15,5) NOT NULL DEFAULT 1.0,
  effective_unit_price DECIMAL(15,5) NOT NULL,
  lead_time INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_pricing_item FOREIGN KEY (item_id) REFERENCES pricelist_items(id) ON DELETE CASCADE
);

CREATE INDEX idx_moq_pricing_item_id ON moq_pricing(item_id);
CREATE UNIQUE INDEX idx_moq_pricing_item_moq ON moq_pricing(item_id, moq) WHERE is_active = TRUE;

-- -----------------------------------------------------
-- Table file_attachments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS file_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricelist_id UUID NOT NULL,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(255) NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  download_url VARCHAR(1024) NOT NULL,
  CONSTRAINT fk_attachment_pricelist FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE CASCADE
);

CREATE INDEX idx_file_attachments_pricelist_id ON file_attachments(pricelist_id);

-- -----------------------------------------------------
-- Table validation_results
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS validation_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pricelist_id UUID NOT NULL,
  is_valid BOOLEAN NOT NULL,
  quality_score INTEGER NOT NULL,
  errors JSONB NOT NULL DEFAULT '[]',
  warnings JSONB NOT NULL DEFAULT '[]',
  suggestions JSONB NOT NULL DEFAULT '[]',
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  validated_by VARCHAR(255),
  CONSTRAINT fk_validation_pricelist FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE CASCADE
);

CREATE INDEX idx_validation_results_pricelist_id ON validation_results(pricelist_id);

-- -----------------------------------------------------
-- Table portal_sessions
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS portal_sessions (
  token VARCHAR(255) PRIMARY KEY,
  vendor_id UUID NOT NULL,
  pricelist_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  permissions JSONB NOT NULL DEFAULT '[]',
  ip_whitelist JSONB,
  max_concurrent_sessions INTEGER NOT NULL DEFAULT 1,
  max_session_duration INTEGER NOT NULL DEFAULT 120,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_access_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT fk_session_vendor FOREIGN KEY (vendor_id) REFERENCES vendor_price_management(id) ON DELETE CASCADE,
  CONSTRAINT fk_session_pricelist FOREIGN KEY (pricelist_id) REFERENCES vendor_pricelists(id) ON DELETE CASCADE,
  CONSTRAINT fk_session_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE
);

CREATE INDEX idx_portal_sessions_vendor_id ON portal_sessions(vendor_id);
CREATE INDEX idx_portal_sessions_expires_at ON portal_sessions(expires_at);
CREATE INDEX idx_portal_sessions_is_active ON portal_sessions(is_active);

-- -----------------------------------------------------
-- Table session_activities
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS session_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_token VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  action VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  CONSTRAINT fk_activity_session FOREIGN KEY (session_token) REFERENCES portal_sessions(token) ON DELETE CASCADE
);

CREATE INDEX idx_session_activities_session_token ON session_activities(session_token);
CREATE INDEX idx_session_activities_timestamp ON session_activities(timestamp);

-- -----------------------------------------------------
-- Table campaign_analytics
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS campaign_analytics (
  campaign_id UUID PRIMARY KEY,
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
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT fk_analytics_campaign FOREIGN KEY (campaign_id) REFERENCES collection_campaigns(id) ON DELETE CASCADE
);

-- Add triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW(); 
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vendor_price_management_timestamp
BEFORE UPDATE ON vendor_price_management
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_price_collection_templates_timestamp
BEFORE UPDATE ON price_collection_templates
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_validation_rules_timestamp
BEFORE UPDATE ON validation_rules
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_collection_campaigns_timestamp
BEFORE UPDATE ON collection_campaigns
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_vendor_invitations_timestamp
BEFORE UPDATE ON vendor_invitations
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_vendor_pricelists_timestamp
BEFORE UPDATE ON vendor_pricelists
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_moq_pricing_timestamp
BEFORE UPDATE ON moq_pricing
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();