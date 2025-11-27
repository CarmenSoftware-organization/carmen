#!/usr/bin/env python3
"""
Fix the remaining files that don't have Document History
"""

from pathlib import Path

# Document History template
DOCUMENT_HISTORY = """## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

"""

# Files that need updating
files_to_update = [
    "/Users/peak/Documents/GitHub/carmen/docs/inventory-adjustment/INV-ADJ-Page-Flow.md",
    "/Users/peak/Documents/GitHub/carmen/docs/recipe/recipe_managment.md",
    "/Users/peak/Documents/GitHub/carmen/docs/vendor-pricelist-management/VENDOR_PORTAL_ENHANCEMENT_SUMMARY.md",
    "/Users/peak/Documents/GitHub/carmen/docs/business-analysis/BA Prompt.md",
    "/Users/peak/Documents/GitHub/carmen/docs/platform-notification-service/core-services.md",
    "/Users/peak/Documents/GitHub/carmen/docs/product-management/PROD-Component-Structure.md",
    "/Users/peak/Documents/GitHub/carmen/docs/product-management/PROD-Business-Requirements.md",
    "/Users/peak/Documents/GitHub/carmen/docs/product-management/PROD-Overview.md",
    "/Users/peak/Documents/GitHub/carmen/docs/product-management/PROD-User-Flow-Diagram.md",
    "/Users/peak/Documents/GitHub/carmen/docs/prd/recreate-pr-spec-prompt.md",
]

def add_document_history_to_file(file_path):
    """Add Document History to a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Check if already has Document History
        if "## Document History" in content:
            return "already_has"

        # Handle empty files
        if not content.strip():
            return "empty_file"

        lines = content.split('\n')
        insertion_index = None

        # Find first heading
        for i, line in enumerate(lines):
            if line.strip().startswith('#'):
                insertion_index = i + 1
                # Skip blank lines and any content until we hit --- or another section
                while insertion_index < len(lines) and lines[insertion_index].strip() == '':
                    insertion_index += 1
                break

        if insertion_index is None:
            # No heading found, insert at the beginning
            insertion_index = 0

        # Insert Document History
        lines.insert(insertion_index, DOCUMENT_HISTORY.rstrip())
        new_content = '\n'.join(lines)

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return "updated"

    except Exception as e:
        return f"error: {str(e)}"

def main():
    print("Fixing remaining files...\n")

    updated = 0
    already_has = 0
    empty = 0
    errors = []

    for file_path in files_to_update:
        file = Path(file_path)
        if not file.exists():
            errors.append((file_path, "File not found"))
            continue

        result = add_document_history_to_file(file_path)

        if result == "updated":
            updated += 1
            print(f"✅ Updated: {file.name}")
        elif result == "already_has":
            already_has += 1
            print(f"⏭️  Skipped (already has): {file.name}")
        elif result == "empty_file":
            empty += 1
            print(f"⚠️  Empty file: {file.name}")
        else:
            errors.append((file_path, result))
            print(f"❌ Error: {file.name} - {result}")

    print(f"\n{'='*60}")
    print(f"Updated: {updated}")
    print(f"Already had history: {already_has}")
    print(f"Empty files: {empty}")
    print(f"Errors: {len(errors)}")
    print(f"{'='*60}")

    if errors:
        print("\nErrors:")
        for file_path, error in errors:
            print(f"  - {Path(file_path).name}: {error}")

if __name__ == "__main__":
    main()
