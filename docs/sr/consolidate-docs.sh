#!/bin/bash

# Store Requisition Documentation Consolidation Script
# This script moves original SR documentation files to a backup directory
# and creates a README file explaining the consolidation process.

# Set variables
BACKUP_DIR="../backup/sr-original"
SOURCE_DIR="."
README_FILE="$BACKUP_DIR/README.md"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# List of original files to move
ORIGINAL_FILES=(
  "store-requisition-ba.md"
  "store-requisition-logic.md"
  "store-requisitions.md"
  "store-requisition-prd.md"
  "store-requisition-user-flow.md"
)

# Move original files to backup directory
echo "Moving original files to backup directory..."
for file in "${ORIGINAL_FILES[@]}"; do
  if [ -f "$SOURCE_DIR/$file" ]; then
    echo "Moving $file"
    mv "$SOURCE_DIR/$file" "$BACKUP_DIR/"
  else
    echo "Warning: $file not found in source directory"
  fi
done

# Create README file in backup directory
echo "Creating README file in backup directory..."
cat > "$README_FILE" << EOF
# Original Store Requisition Documentation

This directory contains the original documentation files for the Store Requisition module that were consolidated into a more structured documentation set.

## Consolidation Process

As part of the documentation improvement initiative, the original SR module documentation files were consolidated into a more structured set of documents following the same pattern as the PR module documentation.

The consolidated documentation can be found in the \`/docs/sr/\` directory and includes:

- SR-Overview.md
- SR-Technical-Specification.md
- SR-User-Experience.md
- SR-Component-Specifications.md
- SR-API-Overview.md
- SR-API-Requisition-Endpoints.md
- SR-API-Approval-Endpoints.md
- SR-API-StockMovement-Endpoints.md
- SR-API-JournalEntry-Endpoints.md

## Original Files

The following original files were moved to this backup directory:

$(for file in "${ORIGINAL_FILES[@]}"; do echo "- $file"; done)

## Date of Consolidation

This consolidation was performed on $(date +"%Y-%m-%d").
EOF

echo "Consolidation complete. Original files have been moved to $BACKUP_DIR"
echo "A README file has been created in the backup directory explaining the consolidation process."
echo "Please review the consolidated documentation in the /docs/sr/ directory." 