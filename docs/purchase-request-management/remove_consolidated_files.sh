#!/bin/bash

# Script to remove original documentation files that have been consolidated
# This script should be run after verifying that all content has been successfully migrated
# to the new consolidated documentation structure.

echo "This script will remove the original documentation files that have been consolidated."
echo "Please ensure you have verified that all content has been successfully migrated."
echo "The following files will be removed:"

# Module Overview and Requirements
echo "- module-prd.md"
echo "- purchase-request-prd.md"
echo "- purchase-request-ba.md"
echo "- module-requirements.md"
echo "- module-implementation.md"
echo "- module-elements.md"

# Technical Documentation
echo "- Schema.md"
echo "- data-models.md"
echo "- business-logic.md"
echo "- item-details-spec.md"
echo "- module-map.md"

# User Experience
echo "- user-flow.md"
echo "- ui-flow-specification.md"
echo "- pr-sitemap.md"

# API Documentation
echo "- purchase-request-api-sp.md"
echo "- api-endpoints.md"
echo "- workflow-api-sp.md"

# Integration
echo "- pr-to-po-traceability.md"

# Prompt for confirmation
read -p "Are you sure you want to proceed with deletion? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Operation cancelled."
    exit 1
fi

# Create backup directory
backup_dir="backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "../$backup_dir"
echo "Creating backup in ../$backup_dir"

# Module Overview and Requirements
[ -f "module-prd.md" ] && cp "module-prd.md" "../$backup_dir/" && rm "module-prd.md" && echo "Removed module-prd.md"
[ -f "purchase-request-prd.md" ] && cp "purchase-request-prd.md" "../$backup_dir/" && rm "purchase-request-prd.md" && echo "Removed purchase-request-prd.md"
[ -f "purchase-request-ba.md" ] && cp "purchase-request-ba.md" "../$backup_dir/" && rm "purchase-request-ba.md" && echo "Removed purchase-request-ba.md"
[ -f "module-requirements.md" ] && cp "module-requirements.md" "../$backup_dir/" && rm "module-requirements.md" && echo "Removed module-requirements.md"
[ -f "module-implementation.md" ] && cp "module-implementation.md" "../$backup_dir/" && rm "module-implementation.md" && echo "Removed module-implementation.md"
[ -f "module-elements.md" ] && cp "module-elements.md" "../$backup_dir/" && rm "module-elements.md" && echo "Removed module-elements.md"

# Technical Documentation
[ -f "Schema.md" ] && cp "Schema.md" "../$backup_dir/" && rm "Schema.md" && echo "Removed Schema.md"
[ -f "data-models.md" ] && cp "data-models.md" "../$backup_dir/" && rm "data-models.md" && echo "Removed data-models.md"
[ -f "business-logic.md" ] && cp "business-logic.md" "../$backup_dir/" && rm "business-logic.md" && echo "Removed business-logic.md"
[ -f "item-details-spec.md" ] && cp "item-details-spec.md" "../$backup_dir/" && rm "item-details-spec.md" && echo "Removed item-details-spec.md"
[ -f "module-map.md" ] && cp "module-map.md" "../$backup_dir/" && rm "module-map.md" && echo "Removed module-map.md"

# User Experience
[ -f "user-flow.md" ] && cp "user-flow.md" "../$backup_dir/" && rm "user-flow.md" && echo "Removed user-flow.md"
[ -f "ui-flow-specification.md" ] && cp "ui-flow-specification.md" "../$backup_dir/" && rm "ui-flow-specification.md" && echo "Removed ui-flow-specification.md"
[ -f "pr-sitemap.md" ] && cp "pr-sitemap.md" "../$backup_dir/" && rm "pr-sitemap.md" && echo "Removed pr-sitemap.md"

# API Documentation
[ -f "purchase-request-api-sp.md" ] && cp "purchase-request-api-sp.md" "../$backup_dir/" && rm "purchase-request-api-sp.md" && echo "Removed purchase-request-api-sp.md"
[ -f "api-endpoints.md" ] && cp "api-endpoints.md" "../$backup_dir/" && rm "api-endpoints.md" && echo "Removed api-endpoints.md"
[ -f "workflow-api-sp.md" ] && cp "workflow-api-sp.md" "../$backup_dir/" && rm "workflow-api-sp.md" && echo "Removed workflow-api-sp.md"

# Integration
[ -f "pr-to-po-traceability.md" ] && cp "pr-to-po-traceability.md" "../$backup_dir/" && rm "pr-to-po-traceability.md" && echo "Removed pr-to-po-traceability.md"

echo "All files have been backed up to ../$backup_dir and removed from the current directory."
echo "If you need to restore any files, you can find them in the backup directory." 