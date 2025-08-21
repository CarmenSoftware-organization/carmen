-- Migration 003: Business logic triggers and functions
-- Created: January 2025
-- Description: Creates triggers and functions for business logic automation

-- Function to update vendor metrics
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
    
    -- Update completion percentage
    IF NEW.completed_items != OLD.completed_items OR NEW.total_items != OLD.total_items THEN
        NEW.completion_percentage = CASE 
            WHEN NEW.total_items = 0 THEN 0
            ELSE (NEW.completed_items::DECIMAL / NEW.total_items) * 100
        END;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vendor_metrics_trigger AFTER UPDATE ON vendor_pricelists
    FOR EACH ROW EXECUTE FUNCTION update_vendor_metrics();

-- Function to update campaign analytics
CREATE OR REPLACE FUNCTION update_campaign_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update campaign analytics when invitation status changes
    IF TG_OP = 'UPDATE' AND NEW.status != OLD.status THEN
        INSERT INTO campaign_analytics (campaign_id) VALUES (NEW.campaign_id)
        ON CONFLICT (campaign_id) DO UPDATE SET
            invitations_sent = CASE 
                WHEN NEW.status = 'sent' AND OLD.status = 'pending' 
                THEN campaign_analytics.invitations_sent + 1 
                ELSE campaign_analytics.invitations_sent 
            END,
            invitations_delivered = CASE 
                WHEN NEW.status = 'delivered' AND OLD.status = 'sent' 
                THEN campaign_analytics.invitations_delivered + 1 
                ELSE campaign_analytics.invitations_delivered 
            END,
            portal_accesses = CASE 
                WHEN NEW.status = 'accessed' AND OLD.status = 'delivered' 
                THEN campaign_analytics.portal_accesses + 1 
                ELSE campaign_analytics.portal_accesses 
            END,
            submissions_completed = CASE 
                WHEN NEW.status = 'submitted' AND OLD.status = 'accessed' 
                THEN campaign_analytics.submissions_completed + 1 
                ELSE campaign_analytics.submissions_completed 
            END,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- Update analytics on insert
    IF TG_OP = 'INSERT' THEN
        INSERT INTO campaign_analytics (campaign_id, total_vendors) 
        VALUES (NEW.campaign_id, 1)
        ON CONFLICT (campaign_id) DO UPDATE SET
            total_vendors = campaign_analytics.total_vendors + 1,
            updated_at = CURRENT_TIMESTAMP;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campaign_analytics_trigger 
AFTER INSERT OR UPDATE ON vendor_invitations
    FOR EACH ROW EXECUTE FUNCTION update_campaign_analytics();

-- Function to auto-expire invitations
CREATE OR REPLACE FUNCTION auto_expire_invitations()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-expire invitations that have passed their expiry date
    UPDATE vendor_invitations 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND status NOT IN ('submitted', 'expired', 'cancelled');
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Create a trigger to run periodically (would typically be called by a cron job)
CREATE TRIGGER auto_expire_invitations_trigger
AFTER INSERT OR UPDATE ON vendor_invitations
    FOR EACH STATEMENT EXECUTE FUNCTION auto_expire_invitations();

-- Function to validate MOQ pricing logic
CREATE OR REPLACE FUNCTION validate_moq_pricing()
RETURNS TRIGGER AS $$
DECLARE
    existing_moq INTEGER;
    existing_price DECIMAL;
BEGIN
    -- Check for duplicate MOQ values
    SELECT moq, unit_price INTO existing_moq, existing_price
    FROM moq_pricing 
    WHERE item_id = NEW.item_id 
    AND moq = NEW.moq 
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID);
    
    IF existing_moq IS NOT NULL THEN
        RAISE EXCEPTION 'Duplicate MOQ value % for item %', NEW.moq, NEW.item_id;
    END IF;
    
    -- Validate price logic (higher MOQ should typically have lower unit price)
    IF EXISTS (
        SELECT 1 FROM moq_pricing 
        WHERE item_id = NEW.item_id 
        AND moq < NEW.moq 
        AND unit_price < NEW.unit_price
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        -- This is a warning, not an error - business might have valid reasons
        RAISE NOTICE 'Warning: MOQ % has higher unit price than lower MOQ tiers', NEW.moq;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER validate_moq_pricing_trigger BEFORE INSERT OR UPDATE ON moq_pricing
    FOR EACH ROW EXECUTE FUNCTION validate_moq_pricing();

-- Function to update pricelist item counts
CREATE OR REPLACE FUNCTION update_pricelist_item_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_items and completed_items in parent pricelist
    IF TG_OP = 'INSERT' THEN
        UPDATE vendor_pricelists 
        SET total_items = total_items + 1,
            completed_items = CASE 
                WHEN NEW.status = 'submitted' THEN completed_items + 1 
                ELSE completed_items 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.pricelist_id;
    END IF;
    
    IF TG_OP = 'UPDATE' THEN
        UPDATE vendor_pricelists 
        SET completed_items = completed_items + 
            CASE 
                WHEN NEW.status = 'submitted' AND OLD.status != 'submitted' THEN 1
                WHEN OLD.status = 'submitted' AND NEW.status != 'submitted' THEN -1
                ELSE 0
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.pricelist_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        UPDATE vendor_pricelists 
        SET total_items = total_items - 1,
            completed_items = CASE 
                WHEN OLD.status = 'submitted' THEN completed_items - 1 
                ELSE completed_items 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = OLD.pricelist_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_pricelist_item_counts_trigger 
AFTER INSERT OR UPDATE OR DELETE ON pricelist_items
    FOR EACH ROW EXECUTE FUNCTION update_pricelist_item_counts();

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    -- Create audit log entry for all changes
    INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        old_values,
        new_values,
        timestamp,
        success
    ) VALUES (
        COALESCE(NEW.created_by, NEW.updated_by, OLD.created_by, OLD.updated_by),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END,
        CURRENT_TIMESTAMP,
        true
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create audit triggers for important tables
CREATE TRIGGER audit_vendors_trigger 
AFTER INSERT OR UPDATE OR DELETE ON vendors
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_campaigns_trigger 
AFTER INSERT OR UPDATE OR DELETE ON collection_campaigns
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_pricelists_trigger 
AFTER INSERT OR UPDATE OR DELETE ON vendor_pricelists
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_templates_trigger 
AFTER INSERT OR UPDATE OR DELETE ON pricelist_templates
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- Function to calculate campaign response rates
CREATE OR REPLACE FUNCTION calculate_campaign_response_rate()
RETURNS TRIGGER AS $$
DECLARE
    total_count INTEGER;
    completed_count INTEGER;
    response_rate DECIMAL;
BEGIN
    -- Calculate response rate for the campaign
    SELECT COUNT(*), COUNT(CASE WHEN status = 'submitted' THEN 1 END)
    INTO total_count, completed_count
    FROM vendor_invitations
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
    response_rate := CASE 
        WHEN total_count = 0 THEN 0
        ELSE (completed_count::DECIMAL / total_count) * 100
    END;
    
    -- Update campaign analytics
    UPDATE campaign_analytics 
    SET response_rate = response_rate,
        updated_at = CURRENT_TIMESTAMP
    WHERE campaign_id = COALESCE(NEW.campaign_id, OLD.campaign_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_campaign_response_rate_trigger 
AFTER UPDATE ON vendor_invitations
    FOR EACH ROW EXECUTE FUNCTION calculate_campaign_response_rate();

-- Function to automatically update session last access time
CREATE OR REPLACE FUNCTION update_session_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Update last access time for the session
    UPDATE portal_sessions 
    SET last_access_at = CURRENT_TIMESTAMP
    WHERE token = NEW.session_token;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_access_trigger 
AFTER INSERT ON session_activities
    FOR EACH ROW EXECUTE FUNCTION update_session_access();

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TRIGGER AS $$
BEGIN
    -- Deactivate expired sessions
    UPDATE portal_sessions 
    SET is_active = false
    WHERE expires_at < CURRENT_TIMESTAMP 
    AND is_active = true;
    
    RETURN NULL;
END;
$$ language 'plpgsql';

-- This would typically be called by a scheduled job, not a trigger
-- But we'll create it for completeness
CREATE TRIGGER cleanup_expired_sessions_trigger
AFTER INSERT ON session_activities
    FOR EACH STATEMENT EXECUTE FUNCTION cleanup_expired_sessions();