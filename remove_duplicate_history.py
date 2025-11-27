#!/usr/bin/env python3
"""
Remove duplicate Document History sections (keep only the first one)
"""

from pathlib import Path

def remove_duplicate_document_history(file_path):
    """Remove duplicate Document History sections, keep only first one"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        # Find all Document History sections
        doc_history_lines = []
        for i, line in enumerate(lines):
            if line.strip() == "## Document History":
                doc_history_lines.append(i)

        if len(doc_history_lines) <= 1:
            return "no_duplicates", len(doc_history_lines)

        # Keep first, remove others
        # Work backwards to not mess up line numbers
        for history_line in reversed(doc_history_lines[1:]):
            # Find end of this Document History section
            end_line = history_line + 1
            in_table = False

            for i in range(history_line + 1, len(lines)):
                line = lines[i].strip()

                if line.startswith('|'):
                    in_table = True
                    end_line = i + 1
                    continue

                if in_table and line == '':
                    end_line = i + 1
                    continue

                if in_table and line == '---':
                    end_line = i + 1
                    break

                if line.startswith('##') or (in_table and line and line != '---'):
                    break

                end_line = i + 1

            # Remove this section
            del lines[history_line:end_line]

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)

        return "success", len(doc_history_lines)

    except Exception as e:
        return f"error: {str(e)}", 0

def main():
    docs_app_dir = Path('/Users/peak/Documents/GitHub/carmen/docs/app')

    md_files = [f for f in docs_app_dir.rglob('*.md')
                if 'template-guide' not in str(f)]

    print(f"Checking {len(md_files)} files for duplicate Document History sections...\n")

    removed_count = 0
    checked_count = 0

    for md_file in sorted(md_files):
        result, count = remove_duplicate_document_history(md_file)

        if result == "success" and count > 1:
            removed_count += 1
            relative_path = md_file.relative_to(docs_app_dir)
            print(f"✅ {relative_path}")
            print(f"   Removed {count - 1} duplicate(s)")

        checked_count += 1

    print(f"\n{'='*70}")
    print(f"Checked: {checked_count} files")
    print(f"Fixed: {removed_count} files with duplicates")
    print(f"{'='*70}")

if __name__ == "__main__":
    main()
