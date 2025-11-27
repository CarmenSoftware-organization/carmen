#!/usr/bin/env python3
"""
Move all Document History sections from end/middle to beginning
"""

import re
from pathlib import Path

def move_document_history(file_path):
    """Move Document History section from anywhere to beginning"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        lines = content.split('\n')

        # Find Document History section
        doc_history_start = None
        doc_history_end = None

        for i, line in enumerate(lines):
            if line.strip() == "## Document History":
                doc_history_start = i
                break

        if doc_history_start is None:
            return "no_history", None

        # Find the end of Document History section (next ## heading or ---)
        doc_history_end = doc_history_start + 1
        in_table = False

        for i in range(doc_history_start + 1, len(lines)):
            line = lines[i].strip()

            # Check if we're in the table
            if line.startswith('|'):
                in_table = True
                doc_history_end = i + 1
                continue

            # If we were in table and now hit blank line, continue
            if in_table and line == '':
                doc_history_end = i + 1
                continue

            # If we hit --- after table, include it and stop
            if in_table and line == '---':
                doc_history_end = i + 1
                break

            # If we hit another ## heading, stop
            if line.startswith('##'):
                break

            # If we're past the table and hit non-blank, stop
            if in_table and line and line != '---':
                break

            doc_history_end = i + 1

        # Extract Document History section
        doc_history_lines = lines[doc_history_start:doc_history_end]

        # Remove trailing blank lines from extracted section
        while doc_history_lines and doc_history_lines[-1].strip() == '':
            doc_history_lines.pop()

        # Check if Document History is already at the beginning (within first 30 lines)
        if doc_history_start < 30:
            return "already_at_beginning", doc_history_start

        # Remove Document History from current position
        new_lines = lines[:doc_history_start] + lines[doc_history_end:]

        # Find insertion point (after Document Information/Module Information section)
        insertion_index = None

        # Strategy 1: Look for Status line
        for i, line in enumerate(new_lines):
            if ('**Status**:' in line or '**Document Status**:' in line or
                '- **Status**:' in line or '- **Document Status**:' in line):
                insertion_index = i + 1
                # Skip blank lines
                while insertion_index < len(new_lines) and new_lines[insertion_index].strip() == '':
                    insertion_index += 1
                break

        # Strategy 2: Look for --- after document metadata
        if insertion_index is None:
            found_metadata = False
            for i, line in enumerate(new_lines):
                if ('## Module Information' in line or '## Document Information' in line or
                    '**Module**:' in line or '**Document Type**:' in line):
                    found_metadata = True
                elif found_metadata and line.strip() == '---':
                    insertion_index = i
                    break

        # Strategy 3: After first heading if it contains metadata
        if insertion_index is None:
            for i, line in enumerate(new_lines):
                if line.startswith('#') and not line.startswith('##'):
                    # Check next 15 lines for metadata
                    has_metadata = False
                    for j in range(i+1, min(i+15, len(new_lines))):
                        if '**Module**:' in new_lines[j] or '**Version**:' in new_lines[j]:
                            has_metadata = True
                            break
                    if has_metadata:
                        # Find first --- after metadata
                        for j in range(i+1, min(i+30, len(new_lines))):
                            if new_lines[j].strip() == '---':
                                insertion_index = j
                                break
                    break

        # Strategy 4: After first blank section (fallback)
        if insertion_index is None:
            blank_count = 0
            for i, line in enumerate(new_lines):
                if i > 5 and line.strip() == '':
                    blank_count += 1
                    if blank_count >= 2:
                        insertion_index = i
                        break
                else:
                    blank_count = 0

        if insertion_index is None:
            return "no_insertion_point", doc_history_start

        # Insert Document History with proper spacing
        doc_history_text = '\n'.join(doc_history_lines)

        # Add separator if not already there
        if doc_history_text.strip().endswith('---'):
            insert_text = f"\n{doc_history_text}\n"
        else:
            insert_text = f"\n{doc_history_text}\n\n---\n"

        new_lines.insert(insertion_index, insert_text.strip())

        # Join and clean up
        new_content = '\n'.join(new_lines)

        # Clean up multiple consecutive separators
        new_content = re.sub(r'\n---\n+---\n', '\n---\n', new_content)
        new_content = re.sub(r'\n\n\n+', '\n\n', new_content)

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return "success", doc_history_start

    except Exception as e:
        return f"error: {str(e)}", None

def main():
    docs_app_dir = Path('/Users/peak/Documents/GitHub/carmen/docs/app')

    # Get all markdown files, exclude template-guide
    md_files = [f for f in docs_app_dir.rglob('*.md')
                if 'template-guide' not in str(f)]

    print(f"Scanning {len(md_files)} files in docs/app...")
    print(f"Moving Document History sections to beginning...\n")

    success_count = 0
    already_ok = 0
    error_count = 0
    errors = []

    for md_file in sorted(md_files):
        # Check position first
        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                lines = f.read().split('\n')

            doc_history_line = None
            for i, line in enumerate(lines, 1):
                if line.strip() == "## Document History":
                    doc_history_line = i
                    break

            # Skip if already at beginning (first 30 lines) or no history
            if doc_history_line is None or doc_history_line <= 30:
                continue

        except:
            continue

        relative_path = md_file.relative_to(docs_app_dir)
        result, old_line = move_document_history(md_file)

        if result == "success":
            success_count += 1
            print(f"✅ {relative_path}")
            print(f"   Moved from line {old_line}")
        elif result == "already_at_beginning":
            already_ok += 1
        elif result.startswith("error"):
            error_count += 1
            errors.append((relative_path, result))
            print(f"❌ {relative_path}: {result}")
        elif result == "no_insertion_point":
            error_count += 1
            errors.append((relative_path, "Could not find insertion point"))
            print(f"⚠️  {relative_path}: Could not find insertion point")

    print(f"\n{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Successfully moved: {success_count}")
    print(f"✓  Already at beginning: {already_ok}")
    print(f"❌ Errors: {error_count}")
    print(f"{'='*70}")

    if errors:
        print(f"\nFiles with errors:")
        for path, error in errors:
            print(f"  - {path}: {error}")

if __name__ == "__main__":
    main()
