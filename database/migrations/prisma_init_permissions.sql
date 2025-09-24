-- =====================================================================================
-- Carmen ERP: Complete ABAC Permission System Migration
-- =====================================================================================
-- This migration initializes the complete Attribute-Based Access Control (ABAC) 
-- permission management system for Carmen ERP
--
-- Generated from: prisma/schema.prisma
-- Compatible with: PostgreSQL 14+
-- Author: Carmen ERP Team
-- Version: 1.0.0
-- =====================================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- For gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "btree_gin";   -- For GIN indexes on regular columns

-- =====================================================================================
-- CORE ENUMS
-- =====================================================================================

DO $$ BEGIN
    CREATE TYPE "PolicyEffect" AS ENUM ('PERMIT', 'DENY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PolicyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CombiningAlgorithm" AS ENUM ('DENY_OVERRIDES', 'PERMIT_OVERRIDES', 'FIRST_APPLICABLE', 'ONLY_ONE_APPLICABLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "SubscriptionPackage" AS ENUM ('BASIC', 'PROFESSIONAL', 'ENTERPRISE', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AccessDecisionStatus" AS ENUM ('PERMIT', 'DENY', 'NOT_APPLICABLE', 'INDETERMINATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================================================
-- DYNAMIC RESOURCE AND ACTION DEFINITIONS
-- =====================================================================================

-- Dynamic resource type definitions - stored as JSON
CREATE TABLE IF NOT EXISTS "abac_resource_definitions" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_resource_definitions_pkey" PRIMARY KEY ("id")
);

-- Create unique index on resourceType
CREATE UNIQUE INDEX IF NOT EXISTS "abac_resource_definitions_resourceType_key" ON "abac_resource_definitions"("resourceType");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_resource_definitions_resourceType_isActive_idx" ON "abac_resource_definitions"("resourceType", "isActive");
CREATE INDEX IF NOT EXISTS "abac_resource_definitions_category_isActive_idx" ON "abac_resource_definitions"("category", "isActive");

-- Dynamic environment definitions
CREATE TABLE IF NOT EXISTS "abac_environment_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "definition" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_environment_definitions_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "abac_environment_definitions_name_key" ON "abac_environment_definitions"("name");
CREATE INDEX IF NOT EXISTS "abac_environment_definitions_name_isActive_idx" ON "abac_environment_definitions"("name", "isActive");

-- =====================================================================================
-- DYNAMIC POLICY SYSTEM
-- =====================================================================================

-- Complete dynamic policy definition
CREATE TABLE IF NOT EXISTS "abac_policies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "priority" INTEGER NOT NULL DEFAULT 500,
    "effect" "PolicyEffect" NOT NULL,
    "status" "PolicyStatus" NOT NULL DEFAULT 'DRAFT',
    "combiningAlgorithm" "CombiningAlgorithm" NOT NULL DEFAULT 'DENY_OVERRIDES',
    "policyData" JSONB NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_policies_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "abac_policies_name_key" ON "abac_policies"("name");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policies_priority_status_idx" ON "abac_policies"("priority", "status");
CREATE INDEX IF NOT EXISTS "abac_policies_effect_status_idx" ON "abac_policies"("effect", "status");
CREATE INDEX IF NOT EXISTS "abac_policies_status_validFrom_validTo_idx" ON "abac_policies"("status", "validFrom", "validTo");
CREATE INDEX IF NOT EXISTS "abac_policies_tags_idx" ON "abac_policies" USING GIN ("tags");

-- =====================================================================================
-- DYNAMIC ROLE SYSTEM
-- =====================================================================================

-- Enhanced dynamic role model
CREATE TABLE IF NOT EXISTS "abac_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "parentId" TEXT,
    "level" INTEGER NOT NULL DEFAULT 0,
    "path" TEXT NOT NULL,
    "roleData" JSONB NOT NULL DEFAULT '{}',
    "isSystemRole" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "color" TEXT,
    "icon" TEXT,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_roles_pkey" PRIMARY KEY ("id")
);

-- Create unique index on name
CREATE UNIQUE INDEX IF NOT EXISTS "abac_roles_name_key" ON "abac_roles"("name");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_roles_parentId_level_idx" ON "abac_roles"("parentId", "level");
CREATE INDEX IF NOT EXISTS "abac_roles_isActive_isSystemRole_idx" ON "abac_roles"("isActive", "isSystemRole");
CREATE INDEX IF NOT EXISTS "abac_roles_path_idx" ON "abac_roles"("path");

-- Add foreign key constraint for role hierarchy
ALTER TABLE "abac_roles" DROP CONSTRAINT IF EXISTS "abac_roles_parentId_fkey";
ALTER TABLE "abac_roles" ADD CONSTRAINT "abac_roles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "abac_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Dynamic User model for ABAC subjects
CREATE TABLE IF NOT EXISTS "abac_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userData" JSONB NOT NULL DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_users_pkey" PRIMARY KEY ("id")
);

-- Create unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS "abac_users_name_key" ON "abac_users"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "abac_users_email_key" ON "abac_users"("email");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_users_name_isActive_idx" ON "abac_users"("name", "isActive");
CREATE INDEX IF NOT EXISTS "abac_users_email_idx" ON "abac_users"("email");
CREATE INDEX IF NOT EXISTS "abac_users_isActive_lastLoginAt_idx" ON "abac_users"("isActive", "lastLoginAt");

-- User-Role Assignment with dynamic context
CREATE TABLE IF NOT EXISTS "abac_user_role_assignments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "context" JSONB NOT NULL DEFAULT '{}',
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_user_role_assignments_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId, roleId combination
CREATE UNIQUE INDEX IF NOT EXISTS "abac_user_role_assignments_userId_roleId_key" ON "abac_user_role_assignments"("userId", "roleId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_user_role_assignments_userId_idx" ON "abac_user_role_assignments"("userId");
CREATE INDEX IF NOT EXISTS "abac_user_role_assignments_roleId_idx" ON "abac_user_role_assignments"("roleId");
CREATE INDEX IF NOT EXISTS "abac_user_role_assignments_isActive_idx" ON "abac_user_role_assignments"("isActive");

-- Add foreign key constraints
ALTER TABLE "abac_user_role_assignments" DROP CONSTRAINT IF EXISTS "abac_user_role_assignments_userId_fkey";
ALTER TABLE "abac_user_role_assignments" ADD CONSTRAINT "abac_user_role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "abac_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "abac_user_role_assignments" DROP CONSTRAINT IF EXISTS "abac_user_role_assignments_roleId_fkey";
ALTER TABLE "abac_user_role_assignments" ADD CONSTRAINT "abac_user_role_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "abac_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Role-Policy Assignment
CREATE TABLE IF NOT EXISTS "abac_role_policy_assignments" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "context" JSONB NOT NULL DEFAULT '{}',
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_role_policy_assignments_pkey" PRIMARY KEY ("id")
);

-- Create unique index on roleId, policyId combination
CREATE UNIQUE INDEX IF NOT EXISTS "abac_role_policy_assignments_roleId_policyId_key" ON "abac_role_policy_assignments"("roleId", "policyId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_role_policy_assignments_roleId_idx" ON "abac_role_policy_assignments"("roleId");
CREATE INDEX IF NOT EXISTS "abac_role_policy_assignments_policyId_idx" ON "abac_role_policy_assignments"("policyId");

-- Add foreign key constraints
ALTER TABLE "abac_role_policy_assignments" DROP CONSTRAINT IF EXISTS "abac_role_policy_assignments_roleId_fkey";
ALTER TABLE "abac_role_policy_assignments" ADD CONSTRAINT "abac_role_policy_assignments_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "abac_roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "abac_role_policy_assignments" DROP CONSTRAINT IF EXISTS "abac_role_policy_assignments_policyId_fkey";
ALTER TABLE "abac_role_policy_assignments" ADD CONSTRAINT "abac_role_policy_assignments_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "abac_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================================
-- DYNAMIC ATTRIBUTE MANAGEMENT
-- =====================================================================================

-- Universal attribute storage for subjects, resources, and environment
CREATE TABLE IF NOT EXISTS "abac_attributes" (
    "id" TEXT NOT NULL,
    "attributeType" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "context" JSONB DEFAULT '{}',
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_attributes_pkey" PRIMARY KEY ("id")
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS "abac_attributes_attributeType_entityType_entityId_name_key" ON "abac_attributes"("attributeType", "entityType", "entityId", "name");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_attributes_attributeType_entityType_idx" ON "abac_attributes"("attributeType", "entityType");
CREATE INDEX IF NOT EXISTS "abac_attributes_entityId_name_idx" ON "abac_attributes"("entityId", "name");
CREATE INDEX IF NOT EXISTS "abac_attributes_name_idx" ON "abac_attributes"("name");

-- =====================================================================================
-- ACCESS CONTROL AND EVALUATION
-- =====================================================================================

-- Dynamic access request with full context
CREATE TABLE IF NOT EXISTS "abac_access_requests" (
    "id" TEXT NOT NULL,
    "requestType" TEXT NOT NULL,
    "sessionId" TEXT,
    "requestData" JSONB NOT NULL,
    "evaluationResult" JSONB NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "evaluationTime" INTEGER,
    "processingTime" INTEGER,
    "decision" "AccessDecisionStatus" NOT NULL,
    "matchedPolicies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "evaluationMetadata" JSONB,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_access_requests_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_access_requests_requestType_idx" ON "abac_access_requests"("requestType");
CREATE INDEX IF NOT EXISTS "abac_access_requests_decision_idx" ON "abac_access_requests"("decision");
CREATE INDEX IF NOT EXISTS "abac_access_requests_createdAt_idx" ON "abac_access_requests"("createdAt");

-- Policy evaluation log with dynamic data
CREATE TABLE IF NOT EXISTS "abac_policy_evaluation_logs" (
    "id" TEXT NOT NULL,
    "accessRequestId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "evaluationData" JSONB NOT NULL,
    "finalDecision" "AccessDecisionStatus" NOT NULL,
    "evaluationTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_policy_evaluation_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policy_evaluation_logs_accessRequestId_idx" ON "abac_policy_evaluation_logs"("accessRequestId");
CREATE INDEX IF NOT EXISTS "abac_policy_evaluation_logs_policyId_finalDecision_idx" ON "abac_policy_evaluation_logs"("policyId", "finalDecision");
CREATE INDEX IF NOT EXISTS "abac_policy_evaluation_logs_createdAt_idx" ON "abac_policy_evaluation_logs"("createdAt");

-- Add foreign key constraints
ALTER TABLE "abac_policy_evaluation_logs" DROP CONSTRAINT IF EXISTS "abac_policy_evaluation_logs_accessRequestId_fkey";
ALTER TABLE "abac_policy_evaluation_logs" ADD CONSTRAINT "abac_policy_evaluation_logs_accessRequestId_fkey" FOREIGN KEY ("accessRequestId") REFERENCES "abac_access_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "abac_policy_evaluation_logs" DROP CONSTRAINT IF EXISTS "abac_policy_evaluation_logs_policyId_fkey";
ALTER TABLE "abac_policy_evaluation_logs" ADD CONSTRAINT "abac_policy_evaluation_logs_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "abac_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- =====================================================================================
-- SUBSCRIPTION AND PACKAGE MANAGEMENT
-- =====================================================================================

-- Dynamic subscription configuration
CREATE TABLE IF NOT EXISTS "abac_subscription_configs" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "packageType" "SubscriptionPackage" NOT NULL,
    "packageName" TEXT NOT NULL,
    "packageDescription" TEXT,
    "subscriptionData" JSONB NOT NULL,
    "subscriptionStart" TIMESTAMP(3) NOT NULL,
    "subscriptionEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_subscription_configs_pkey" PRIMARY KEY ("id")
);

-- Create unique index on organizationId
CREATE UNIQUE INDEX IF NOT EXISTS "abac_subscription_configs_organizationId_key" ON "abac_subscription_configs"("organizationId");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_subscription_configs_organizationId_isActive_idx" ON "abac_subscription_configs"("organizationId", "isActive");
CREATE INDEX IF NOT EXISTS "abac_subscription_configs_packageType_idx" ON "abac_subscription_configs"("packageType");

-- =====================================================================================
-- TESTING AND VALIDATION
-- =====================================================================================

-- Dynamic policy test scenarios
CREATE TABLE IF NOT EXISTS "abac_policy_test_scenarios" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "scenarioData" JSONB NOT NULL,
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_policy_test_scenarios_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policy_test_scenarios_category_idx" ON "abac_policy_test_scenarios"("category");
CREATE INDEX IF NOT EXISTS "abac_policy_test_scenarios_tags_idx" ON "abac_policy_test_scenarios" USING GIN ("tags");
CREATE INDEX IF NOT EXISTS "abac_policy_test_scenarios_createdBy_idx" ON "abac_policy_test_scenarios"("createdBy");

-- Dynamic policy test results
CREATE TABLE IF NOT EXISTS "abac_policy_test_results" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executedBy" TEXT NOT NULL,
    "resultData" JSONB NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "executionTime" INTEGER NOT NULL,

    CONSTRAINT "abac_policy_test_results_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policy_test_results_testRunId_idx" ON "abac_policy_test_results"("testRunId");
CREATE INDEX IF NOT EXISTS "abac_policy_test_results_scenarioId_policyId_idx" ON "abac_policy_test_results"("scenarioId", "policyId");
CREATE INDEX IF NOT EXISTS "abac_policy_test_results_passed_executedAt_idx" ON "abac_policy_test_results"("passed", "executedAt");
CREATE INDEX IF NOT EXISTS "abac_policy_test_results_score_idx" ON "abac_policy_test_results"("score");

-- Add foreign key constraints
ALTER TABLE "abac_policy_test_results" DROP CONSTRAINT IF EXISTS "abac_policy_test_results_scenarioId_fkey";
ALTER TABLE "abac_policy_test_results" ADD CONSTRAINT "abac_policy_test_results_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "abac_policy_test_scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "abac_policy_test_results" DROP CONSTRAINT IF EXISTS "abac_policy_test_results_policyId_fkey";
ALTER TABLE "abac_policy_test_results" ADD CONSTRAINT "abac_policy_test_results_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "abac_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =====================================================================================
-- PERFORMANCE AND ANALYTICS
-- =====================================================================================

-- Dynamic policy performance metrics
CREATE TABLE IF NOT EXISTS "abac_policy_performance_metrics" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "metricDate" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'daily',
    "performanceData" JSONB NOT NULL,

    CONSTRAINT "abac_policy_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- Create unique index on policyId, metricDate, periodType combination
CREATE UNIQUE INDEX IF NOT EXISTS "abac_policy_performance_metrics_policyId_metricDate_periodType_key" ON "abac_policy_performance_metrics"("policyId", "metricDate", "periodType");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policy_performance_metrics_metricDate_periodType_idx" ON "abac_policy_performance_metrics"("metricDate", "periodType");
CREATE INDEX IF NOT EXISTS "abac_policy_performance_metrics_policyId_idx" ON "abac_policy_performance_metrics"("policyId");

-- Add foreign key constraint
ALTER TABLE "abac_policy_performance_metrics" DROP CONSTRAINT IF EXISTS "abac_policy_performance_metrics_policyId_fkey";
ALTER TABLE "abac_policy_performance_metrics" ADD CONSTRAINT "abac_policy_performance_metrics_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "abac_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Dynamic user access analytics
CREATE TABLE IF NOT EXISTS "abac_user_access_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "analyticDate" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'daily',
    "analyticData" JSONB NOT NULL,

    CONSTRAINT "abac_user_access_analytics_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId, analyticDate, periodType combination
CREATE UNIQUE INDEX IF NOT EXISTS "abac_user_access_analytics_userId_analyticDate_periodType_key" ON "abac_user_access_analytics"("userId", "analyticDate", "periodType");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_user_access_analytics_userId_analyticDate_idx" ON "abac_user_access_analytics"("userId", "analyticDate");
CREATE INDEX IF NOT EXISTS "abac_user_access_analytics_analyticDate_periodType_idx" ON "abac_user_access_analytics"("analyticDate", "periodType");

-- =====================================================================================
-- AUDIT AND COMPLIANCE
-- =====================================================================================

-- Comprehensive dynamic audit log
CREATE TABLE IF NOT EXISTS "abac_audit_logs" (
    "id" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "eventData" JSONB NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "complianceFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "retentionDate" TIMESTAMP(3),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL DEFAULT 'system',

    CONSTRAINT "abac_audit_logs_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_audit_logs_eventType_eventCategory_idx" ON "abac_audit_logs"("eventType", "eventCategory");
CREATE INDEX IF NOT EXISTS "abac_audit_logs_timestamp_idx" ON "abac_audit_logs"("timestamp");
CREATE INDEX IF NOT EXISTS "abac_audit_logs_complianceFlags_idx" ON "abac_audit_logs" USING GIN ("complianceFlags");

-- =====================================================================================
-- CACHE AND OPTIMIZATION
-- =====================================================================================

-- Dynamic permission cache
CREATE TABLE IF NOT EXISTS "abac_permission_cache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contextHash" TEXT NOT NULL,
    "decisionData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_permission_cache_pkey" PRIMARY KEY ("id")
);

-- Create unique index on userId, contextHash combination
CREATE UNIQUE INDEX IF NOT EXISTS "abac_permission_cache_userId_contextHash_key" ON "abac_permission_cache"("userId", "contextHash");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_permission_cache_userId_expiresAt_idx" ON "abac_permission_cache"("userId", "expiresAt");
CREATE INDEX IF NOT EXISTS "abac_permission_cache_expiresAt_idx" ON "abac_permission_cache"("expiresAt");
CREATE INDEX IF NOT EXISTS "abac_permission_cache_lastAccessed_idx" ON "abac_permission_cache"("lastAccessed");

-- =====================================================================================
-- MIGRATION AND SYSTEM MANAGEMENT
-- =====================================================================================

-- Dynamic policy migration tracking
CREATE TABLE IF NOT EXISTS "abac_policy_migrations" (
    "id" TEXT NOT NULL,
    "migrationName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "fromVersion" TEXT NOT NULL,
    "toVersion" TEXT NOT NULL,
    "migrationType" TEXT NOT NULL,
    "migrationData" JSONB,
    "executedAt" TIMESTAMP(3),
    "executedBy" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "abac_policy_migrations_pkey" PRIMARY KEY ("id")
);

-- Create unique index on migrationName
CREATE UNIQUE INDEX IF NOT EXISTS "abac_policy_migrations_migrationName_key" ON "abac_policy_migrations"("migrationName");

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "abac_policy_migrations_migrationName_success_idx" ON "abac_policy_migrations"("migrationName", "success");
CREATE INDEX IF NOT EXISTS "abac_policy_migrations_migrationType_idx" ON "abac_policy_migrations"("migrationType");

-- =====================================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================================================

-- Function to update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updatedAt column
CREATE TRIGGER update_abac_resource_definitions_updated_at BEFORE UPDATE ON "abac_resource_definitions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_environment_definitions_updated_at BEFORE UPDATE ON "abac_environment_definitions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_policies_updated_at BEFORE UPDATE ON "abac_policies" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_roles_updated_at BEFORE UPDATE ON "abac_roles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_users_updated_at BEFORE UPDATE ON "abac_users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_user_role_assignments_updated_at BEFORE UPDATE ON "abac_user_role_assignments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_role_policy_assignments_updated_at BEFORE UPDATE ON "abac_role_policy_assignments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_attributes_updated_at BEFORE UPDATE ON "abac_attributes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_subscription_configs_updated_at BEFORE UPDATE ON "abac_subscription_configs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_policy_test_scenarios_updated_at BEFORE UPDATE ON "abac_policy_test_scenarios" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_abac_policy_migrations_updated_at BEFORE UPDATE ON "abac_policy_migrations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================================
-- UTILITY FUNCTIONS
-- =====================================================================================

-- Function to generate CUID-like IDs
CREATE OR REPLACE FUNCTION generate_cuid() RETURNS TEXT AS $$
BEGIN
    RETURN 'c' || encode(gen_random_bytes(12), 'base64')::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache() RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM "abac_permission_cache" WHERE "expiresAt" < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned % expired cache entries', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================================================
-- FINAL VERIFICATION AND DOCUMENTATION
-- =====================================================================================

-- Verify all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
    expected_tables INTEGER := 16; -- Expected number of tables
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name LIKE 'abac_%';
    
    IF table_count = expected_tables THEN
        RAISE NOTICE 'SUCCESS: All % ABAC permission management tables created successfully', expected_tables;
    ELSE
        RAISE WARNING 'WARNING: Expected % tables, but found %', expected_tables, table_count;
    END IF;
    
    RAISE NOTICE 'Carmen ERP ABAC Permission Management System initialized';
    RAISE NOTICE 'Tables: Resource Definitions, Environment Definitions, Policies, Roles, Users';
    RAISE NOTICE 'Features: Role Assignments, Policy Assignments, Attributes, Access Requests';
    RAISE NOTICE 'Analytics: Performance Metrics, User Analytics, Audit Logs, Test Results';
    RAISE NOTICE 'Optimization: Permission Cache, Policy Migrations, Subscription Management';
END $$;

-- Add table comments for documentation
COMMENT ON TABLE "abac_resource_definitions" IS 'Dynamic resource type definitions with JSON-based action and attribute schemas';
COMMENT ON TABLE "abac_environment_definitions" IS 'Environment context definitions for time, location, and system state attributes';
COMMENT ON TABLE "abac_policies" IS 'Complete ABAC policies with JSON-based rules, targets, obligations, and advice';
COMMENT ON TABLE "abac_roles" IS 'Hierarchical role definitions with inheritance and JSON-based attributes';
COMMENT ON TABLE "abac_users" IS 'User subjects with JSON-based profile and context attributes';
COMMENT ON TABLE "abac_user_role_assignments" IS 'User-to-role assignments with contextual scope and constraints';
COMMENT ON TABLE "abac_role_policy_assignments" IS 'Role-to-policy assignments with priority and scope configuration';
COMMENT ON TABLE "abac_attributes" IS 'Universal attribute storage for subjects, resources, and environment contexts';
COMMENT ON TABLE "abac_access_requests" IS 'Complete access evaluation requests with context and results';
COMMENT ON TABLE "abac_policy_evaluation_logs" IS 'Detailed logs of policy evaluation steps and decisions';
COMMENT ON TABLE "abac_subscription_configs" IS 'Subscription package configurations with feature and limit definitions';
COMMENT ON TABLE "abac_policy_test_scenarios" IS 'Test scenarios for policy validation and regression testing';
COMMENT ON TABLE "abac_policy_test_results" IS 'Results of policy test executions with scoring and analysis';
COMMENT ON TABLE "abac_policy_performance_metrics" IS 'Performance analytics for policy evaluation efficiency';
COMMENT ON TABLE "abac_user_access_analytics" IS 'User access pattern analytics and behavioral insights';
COMMENT ON TABLE "abac_audit_logs" IS 'Comprehensive audit trail for all permission system activities';
COMMENT ON TABLE "abac_permission_cache" IS 'High-performance cache for frequently accessed permission decisions';
COMMENT ON TABLE "abac_policy_migrations" IS 'Migration tracking for policy and schema version management';