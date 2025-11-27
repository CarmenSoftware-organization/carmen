#!/usr/bin/env python3
"""
Script to add Document History section to all documentation files
that don't already have one.
"""

import os
import re
from pathlib import Path

# Document History template
DOCUMENT_HISTORY = """## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

"""

def has_document_history(content):
    """Check if content already has Document History section"""
    return "## Document History" in content

def add_document_history(content):
    """Add Document History section to content"""
    lines = content.split('\n')

    # Find insertion point
    insertion_index = None

    # Pattern 1: After **Status**: line
    for i, line in enumerate(lines):
        if line.strip().startswith('**Status**:'):
            # Insert after this line and any blank lines
            insertion_index = i + 1
            while insertion_index < len(lines) and lines[insertion_index].strip() == '':
                insertion_index += 1
            break

    # Pattern 2: After **Last Updated**: line
    if insertion_index is None:
        for i, line in enumerate(lines):
            if line.strip().startswith('**Last Updated**:'):
                insertion_index = i + 1
                while insertion_index < len(lines) and lines[insertion_index].strip() == '':
                    insertion_index += 1
                break

    # Pattern 3: Before first --- separator
    if insertion_index is None:
        for i, line in enumerate(lines):
            if line.strip() == '---':
                insertion_index = i
                break

    # Pattern 4: After first heading (fallback)
    if insertion_index is None:
        for i, line in enumerate(lines):
            if line.strip().startswith('#'):
                insertion_index = i + 1
                # Skip blank lines and welcome messages
                while insertion_index < len(lines) and (lines[insertion_index].strip() == '' or lines[insertion_index].strip().startswith('**')):
                    insertion_index += 1
                break

    if insertion_index is not None:
        # Insert the Document History section
        lines.insert(insertion_index, DOCUMENT_HISTORY.rstrip())
        return '\n'.join(lines)

    return content

def process_files():
    """Process all markdown files"""
    docs_dir = Path('/Users/peak/Documents/GitHub/carmen/docs/app')
    template_dir = Path('/Users/peak/Documents/GitHub/carmen/docs/app/template-guide')

    md_files = list(docs_dir.rglob('*.md'))

    # Exclude template files
    md_files = [f for f in md_files if not str(f).startswith(str(template_dir))]

    total_files = len(md_files)
    updated_files = 0
    skipped_files = 0

    print(f"Found {total_files} documentation files")
    print("Processing...\n")

    for md_file in md_files:
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            if has_document_history(content):
                skipped_files += 1
                continue

            # Add Document History
            new_content = add_document_history(content)

            # Write back
            with open(md_file, 'w', encoding='utf-8') as f:
                f.write(new_content)

            updated_files += 1
            print(f"✅ Updated: {md_file.relative_to(docs_dir)}")

        except Exception as e:
            print(f"❌ Error processing {md_file}: {e}")

    print(f"\n{'='*60}")
    print(f"Total files processed: {total_files}")
    print(f"Files updated: {updated_files}")
    print(f"Files skipped (already have history): {skipped_files}")
    print(f"{'='*60}")

if __name__ == "__main__":
    process_files()
