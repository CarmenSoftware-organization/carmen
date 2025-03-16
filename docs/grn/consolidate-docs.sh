#!/bin/bash

# Goods Received Note Documentation Consolidation Script
# This script moves original GRN documentation files to a backup directory
# and creates a README file explaining the consolidation process.

# Set variables
BACKUP_DIR="../backup/grn-original"
SOURCE_DIR="."
README_FILE="$BACKUP_DIR/README.md"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# List of original files to move
ORIGINAL_FILES=(
  "goods-received-note-ba.md"
  "grn-ba.md"
  "grn-api-sp.md"
  "grn-module-prd.md"
  "grn-page-flow.md"
  "grn-component-structure.md"
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
# Original Goods Received Note Documentation

This directory contains the original documentation files for the Goods Received Note (GRN) module that were consolidated into a more structured documentation set.

## Consolidation Process

As part of the documentation improvement initiative, the original GRN module documentation files were consolidated into a more structured set of documents following the same pattern as the PR and SR module documentation.

The consolidated documentation can be found in the \`/docs/grn/\` directory and includes:

- GRN-Overview.md
- GRN-Technical-Specification.md
- GRN-User-Experience.md
- GRN-Component-Specifications.md
- GRN-API-Overview.md
- GRN-API-Endpoints.md

## Original Files

The following original files were moved to this backup directory:

$(for file in "${ORIGINAL_FILES[@]}"; do echo "- $file"; done)

## Date of Consolidation

This consolidation was performed on $(date +"%Y-%m-%d").
EOF

echo "Consolidation complete. Original files have been moved to $BACKUP_DIR"
echo "A README file has been created in the backup directory explaining the consolidation process."
echo "Please review the consolidated documentation in the /docs/grn/ directory." 