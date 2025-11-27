#!/usr/bin/env python3
"""
Convert DS (Data Schema) files to DD (Data Definition) files
- Rename DS-*.md files to DD-*.md
- Update references throughout the codebase
- Update document type in file content
"""

import os
import re
from pathlib import Path
import shutil

# DS files to convert
ds_files = [
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/settings/DS-settings.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/permission-management/DS-permission-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/system-integrations/DS-system-integrations.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/business-rules/DS-business-rules.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/workflow/DS-workflow.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/location-management/DS-location-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/user-management/DS-user-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/monitoring/DS-monitoring.md",
]

def update_file_content(file_path):
    """Update DS references to DD within file content"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Update document type references
        content = content.replace('Data Schema', 'Data Definition')
        content = content.replace('Data schema', 'Data definition')
        content = content.replace('data schema', 'data definition')
        content = re.sub(r'\*\*Document Type\*\*:\s*Data Schema', '**Document Type**: Data Definition', content)
        content = re.sub(r'Document Type:\s*Data Schema', 'Document Type: Data Definition', content)

        # Update DS- file references to DD-
        content = re.sub(r'DS-([a-zA-Z-]+)\.md', r'DD-\1.md', content)

        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False

    except Exception as e:
        print(f"Error updating content in {file_path}: {e}")
        return False

def rename_file(old_path):
    """Rename DS file to DD"""
    old_path = Path(old_path)
    new_path = old_path.parent / old_path.name.replace('DS-', 'DD-')

    try:
        if old_path.exists():
            shutil.move(str(old_path), str(new_path))
            return True, new_path
        else:
            return False, None
    except Exception as e:
        print(f"Error renaming {old_path}: {e}")
        return False, None

def find_and_update_references(docs_dir, old_filename, new_filename):
    """Find and update all references to the renamed file"""
    updated_files = []

    # Search all markdown files
    for md_file in Path(docs_dir).rglob('*.md'):
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Check if file contains reference to old filename
            if old_filename in content:
                new_content = content.replace(old_filename, new_filename)

                with open(md_file, 'w', encoding='utf-8') as f:
                    f.write(new_content)

                updated_files.append(md_file)
        except Exception as e:
            continue

    return updated_files

def main():
    print("Converting DS files to DD files...\n")
    print(f"{'='*70}")

    converted = []
    failed = []

    # Step 1: Update content and rename files
    for ds_file in ds_files:
        ds_path = Path(ds_file)
        if not ds_path.exists():
            print(f"⚠️  File not found: {ds_path.name}")
            failed.append(ds_path.name)
            continue

        print(f"\nProcessing: {ds_path.name}")

        # Update content first
        print(f"  → Updating content (DS → DD references)...")
        update_file_content(ds_file)

        # Rename file
        print(f"  → Renaming DS-*.md to DD-*.md...")
        success, new_path = rename_file(ds_file)

        if success:
            converted.append((ds_path.name, new_path.name))
            print(f"  ✅ Renamed: {ds_path.name} → {new_path.name}")
        else:
            failed.append(ds_path.name)
            print(f"  ❌ Failed to rename: {ds_path.name}")

    # Step 2: Update all references throughout the codebase
    print(f"\n{'='*70}")
    print("\nUpdating references throughout documentation...\n")

    docs_dir = "/Users/peak/Documents/GitHub/carmen/docs"
    total_refs_updated = 0

    for old_name, new_name in converted:
        print(f"Searching for references to: {old_name}")
        updated_files = find_and_update_references(docs_dir, old_name, new_name)

        if updated_files:
            print(f"  ✅ Updated {len(updated_files)} file(s)")
            total_refs_updated += len(updated_files)
        else:
            print(f"  ℹ️  No references found")

    # Summary
    print(f"\n{'='*70}")
    print("CONVERSION SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Successfully converted: {len(converted)} files")
    print(f"📝 References updated: {total_refs_updated} files")
    print(f"❌ Failed conversions: {len(failed)} files")
    print(f"{'='*70}")

    if converted:
        print("\nConverted files:")
        for old_name, new_name in converted:
            print(f"  {old_name} → {new_name}")

    if failed:
        print("\nFailed files:")
        for name in failed:
            print(f"  ❌ {name}")

if __name__ == "__main__":
    main()
