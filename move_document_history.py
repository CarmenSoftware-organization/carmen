#!/usr/bin/env python3
"""
Move Document History sections from end to beginning of files
"""

import re
from pathlib import Path

files_to_process = [
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/BR-vendor-portal.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/DD-vendor-portal.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/FD-vendor-portal.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/TS-vendor-portal.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/vendor-management/vendor-portal/UC-vendor-portal.md",
]

def move_document_history(file_path):
    """Move Document History section from end to beginning"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find Document History section (it's usually at the end)
        # Pattern: ## Document History followed by table and content until --- or end
        pattern = r'\n---\n\n## Document History\n\n\|[^\n]+\n\|[^\n]+\n(?:\|[^\n]+\n)*\n(?:---\n)?'

        match = re.search(pattern, content)
        if not match:
            # Try alternative pattern without leading ---
            pattern = r'\n## Document History\n\n\|[^\n]+\n\|[^\n]+\n(?:\|[^\n]+\n)*\n(?:---\n)?'
            match = re.search(pattern, content)

        if not match:
            return "no_match", None

        # Extract the Document History section
        doc_history = match.group(0).strip()

        # Remove leading --- if present
        if doc_history.startswith('---'):
            doc_history = doc_history[3:].strip()

        # Remove trailing --- if present
        if doc_history.endswith('---'):
            doc_history = doc_history[:-3].strip()

        # Remove the Document History from its current position
        new_content = content[:match.start()] + content[match.end():]

        # Find insertion point (after Document Information or Status section)
        lines = new_content.split('\n')
        insertion_index = None

        # Look for the end of Document Information section
        for i, line in enumerate(lines):
            if line.strip().startswith('**Document Status**:') or line.strip().startswith('- **Document Status**:'):
                # Insert after this line and any blank lines, before ---
                insertion_index = i + 1
                while insertion_index < len(lines) and lines[insertion_index].strip() == '':
                    insertion_index += 1
                break

        if insertion_index is None:
            # Try to find --- after Document Information
            in_doc_info = False
            for i, line in enumerate(lines):
                if '## Document Information' in line or '## Module Information' in line:
                    in_doc_info = True
                elif in_doc_info and line.strip() == '---':
                    insertion_index = i
                    break

        if insertion_index is None:
            return "no_insertion_point", doc_history

        # Insert Document History at the beginning
        doc_history_with_spacing = f"\n{doc_history}\n\n---"
        lines.insert(insertion_index, doc_history_with_spacing)

        # Join back
        new_content = '\n'.join(lines)

        # Clean up multiple consecutive --- separators
        new_content = re.sub(r'\n---\n+---\n', '\n---\n', new_content)

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return "success", doc_history

    except Exception as e:
        return f"error: {str(e)}", None

def main():
    print("Moving Document History sections to beginning of files...\n")

    success_count = 0
    error_count = 0

    for file_path in files_to_process:
        file = Path(file_path)
        print(f"Processing: {file.name}")

        result, doc_history = move_document_history(file_path)

        if result == "success":
            success_count += 1
            print(f"  ✅ Moved Document History to beginning")
        elif result == "no_match":
            print(f"  ⚠️  Could not find Document History section")
        elif result == "no_insertion_point":
            print(f"  ⚠️  Could not find insertion point")
            print(f"     Found history: {doc_history[:50]}...")
        else:
            error_count += 1
            print(f"  ❌ {result}")

        print()

    print(f"{'='*60}")
    print(f"Successfully moved: {success_count}")
    print(f"Errors: {error_count}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
