#!/usr/bin/env python3
"""
Fix markdown format errors in BR-*.md files
Specifically target '---' after Document History table
"""

import re
from pathlib import Path

# Find all BR files with errors
br_files = list(Path('/Users/peak/Documents/GitHub/carmen/docs').rglob('BR-*.md'))

def fix_document_history_separator(file_path):
    """Remove '---' separator that appears after Document History table"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        original_content = content

        # Pattern: Look for Document History table followed by '---'
        # Match: ## Document History\n\n| ... |\n|---|...\n| 1.0.0 | ... |\n---
        pattern = r'(## Document History\s*\n\s*\n\|[^\n]+\|\s*\n\|[-:\|]+\|\s*\n(?:\|[^\n]+\|\s*\n)*)\s*---\s*\n'

        # Replace with just the table (remove the '---\n')
        fixed_content = re.sub(pattern, r'\1\n', content)

        if fixed_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            return True, "Fixed"
        else:
            return False, "No Document History separator found"

    except Exception as e:
        return False, f"Error: {str(e)}"

def main():
    print("FIXING DOCUMENT HISTORY MARKDOWN FORMAT ERRORS")
    print("="*80)
    print(f"Checking {len(br_files)} BR files...\n")

    fixed_count = 0
    error_count = 0
    skipped_count = 0

    for file_path in sorted(br_files):
        rel_path = file_path.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))

        success, message = fix_document_history_separator(file_path)

        if success:
            fixed_count += 1
            print(f"✅ {rel_path}")
        elif "Error" in message:
            error_count += 1
            print(f"❌ {rel_path}: {message}")
        else:
            skipped_count += 1
            # Don't print skipped files to reduce noise

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total files checked: {len(br_files)}")
    print(f"✅ Fixed: {fixed_count}")
    print(f"❌ Errors: {error_count}")
    print(f"⏭️  Already OK: {skipped_count}")

if __name__ == "__main__":
    main()
