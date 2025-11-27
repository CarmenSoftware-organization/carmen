#!/usr/bin/env python3
"""
Check all BR-*.md files for markdown format errors
Specifically looking for '---' after Document History table
"""

import re
from pathlib import Path

# Find all BR-*.md files
br_files = list(Path('/Users/peak/Documents/GitHub/carmen/docs').rglob('BR-*.md'))

def check_document_history_format(file_path):
    """Check if file has '---' after Document History table"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.split('\n')

        # Look for pattern: table row followed by '---'
        has_error = False
        error_line = None

        for i, line in enumerate(lines, 1):
            # Check if line is end of a table (contains pipes)
            if '|' in line and i < len(lines):
                # Check next non-empty line
                next_line_idx = i
                while next_line_idx < len(lines) and not lines[next_line_idx].strip():
                    next_line_idx += 1

                if next_line_idx < len(lines):
                    next_line = lines[next_line_idx].strip()
                    # If next line is '---' and not part of table separator
                    if next_line == '---' and not lines[i-1].strip().startswith('|---'):
                        has_error = True
                        error_line = next_line_idx + 1
                        break

        return has_error, error_line

    except Exception as e:
        return None, str(e)

def main():
    print(f"Checking {len(br_files)} BR-*.md files for markdown format errors...")
    print("="*80)

    files_with_errors = []
    files_checked = 0
    files_with_issues = 0

    for br_file in sorted(br_files):
        has_error, error_info = check_document_history_format(br_file)

        if has_error is None:
            print(f"⚠️  Error reading: {br_file.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))}")
            print(f"   {error_info}")
        elif has_error:
            files_with_issues += 1
            rel_path = br_file.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))
            print(f"\n❌ {rel_path}")
            print(f"   Line {error_info}: Found '---' after table")
            files_with_errors.append(str(br_file))

        files_checked += 1

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Files checked: {files_checked}")
    print(f"Files with errors: {files_with_issues}")
    print(f"Files OK: {files_checked - files_with_issues}")

    if files_with_errors:
        print(f"\n{'='*80}")
        print("FILES NEEDING FIX:")
        print(f"{'='*80}")
        for file_path in files_with_errors:
            print(f"  • {Path(file_path).relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))}")

if __name__ == "__main__":
    main()
