#!/usr/bin/env python3
"""
Check all documents in /docs/app for Document History position
"""

import re
from pathlib import Path

def check_document_history_position(file_path):
    """Check where Document History section is located"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if not content.strip():
            return "empty", 0, 0

        lines = content.split('\n')
        total_lines = len(lines)

        # Find Document History section
        doc_history_line = None
        for i, line in enumerate(lines, 1):
            if line.strip() == "## Document History":
                doc_history_line = i
                break

        if doc_history_line is None:
            return "missing", 0, total_lines

        # Consider "beginning" as first 30 lines
        # Consider "end" as last 100 lines or >50% through document
        if doc_history_line <= 30:
            return "beginning", doc_history_line, total_lines
        elif doc_history_line > (total_lines - 100) or doc_history_line > (total_lines * 0.5):
            return "end", doc_history_line, total_lines
        else:
            return "middle", doc_history_line, total_lines

    except Exception as e:
        return "error", 0, 0

def main():
    docs_app_dir = Path('/Users/peak/Documents/GitHub/carmen/docs/app')

    # Get all markdown files, exclude template-guide
    md_files = [f for f in docs_app_dir.rglob('*.md')
                if 'template-guide' not in str(f)]

    at_end = []
    in_middle = []
    at_beginning = []
    missing = []
    empty = []

    print(f"Scanning {len(md_files)} files in docs/app...\n")

    for md_file in sorted(md_files):
        position, line, total = check_document_history_position(md_file)
        relative_path = md_file.relative_to(docs_app_dir)

        if position == "end":
            at_end.append((relative_path, line, total))
        elif position == "middle":
            in_middle.append((relative_path, line, total))
        elif position == "beginning":
            at_beginning.append((relative_path, line, total))
        elif position == "missing":
            missing.append(relative_path)
        elif position == "empty":
            empty.append(relative_path)

    print(f"{'='*70}")
    print(f"SUMMARY")
    print(f"{'='*70}")
    print(f"✅ Document History at beginning (lines 1-30): {len(at_beginning)}")
    print(f"⚠️  Document History in middle: {len(in_middle)}")
    print(f"❌ Document History at end (needs moving): {len(at_end)}")
    print(f"📝 Missing Document History: {len(missing)}")
    print(f"📄 Empty files: {len(empty)}")
    print(f"{'='*70}\n")

    if at_end:
        print(f"\n❌ FILES WITH DOCUMENT HISTORY AT END (Need to move):")
        print(f"{'='*70}")
        for path, line, total in sorted(at_end):
            print(f"  {path}")
            print(f"    → Line {line} of {total} ({int(line/total*100)}% through file)")

    if in_middle:
        print(f"\n⚠️  FILES WITH DOCUMENT HISTORY IN MIDDLE:")
        print(f"{'='*70}")
        for path, line, total in sorted(in_middle):
            print(f"  {path}")
            print(f"    → Line {line} of {total} ({int(line/total*100)}% through file)")

    if missing:
        print(f"\n📝 FILES MISSING DOCUMENT HISTORY:")
        print(f"{'='*70}")
        for path in sorted(missing)[:20]:  # Show first 20
            print(f"  {path}")
        if len(missing) > 20:
            print(f"  ... and {len(missing) - 20} more")

    if empty:
        print(f"\n📄 EMPTY FILES:")
        print(f"{'='*70}")
        for path in sorted(empty):
            print(f"  {path}")

    return at_end

if __name__ == "__main__":
    files_to_fix = main()

    if files_to_fix:
        print(f"\n{'='*70}")
        print(f"RECOMMENDATION: Move Document History to beginning for {len(files_to_fix)} files")
        print(f"{'='*70}")
