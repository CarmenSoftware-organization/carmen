#!/usr/bin/env python3
"""
Check all TS (Technical Specification) files for complete sitemaps
Verify that each TS has a recursive sitemap including all pages and dialogues
"""

import re
from pathlib import Path

# Find all TS-*.md files
ts_files = list(Path('/Users/peak/Documents/GitHub/carmen/docs').rglob('TS-*.md'))

def check_sitemap_section(file_path):
    """Check if TS file has a complete sitemap section"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Look for sitemap/navigation sections
        has_sitemap = False
        has_pages = False
        has_dialogs = False
        sitemap_section = None

        # Common section headers for sitemap
        sitemap_patterns = [
            r'## (?:Site\s*Map|Sitemap|Navigation Structure|Page Structure|Module Structure)',
            r'### (?:Site\s*Map|Sitemap|Navigation Structure|Page Structure)',
        ]

        for pattern in sitemap_patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                has_sitemap = True
                # Extract the sitemap section (from match to next ## heading or end)
                start = match.start()
                next_section = re.search(r'\n## ', content[start+1:])
                if next_section:
                    end = start + 1 + next_section.start()
                    sitemap_section = content[start:end]
                else:
                    sitemap_section = content[start:]
                break

        if sitemap_section:
            # Check if sitemap mentions pages
            if re.search(r'(?:page|screen|view|list|detail)', sitemap_section, re.IGNORECASE):
                has_pages = True

            # Check if sitemap mentions dialogues/modals
            if re.search(r'(?:dialog|modal|popup|form)', sitemap_section, re.IGNORECASE):
                has_dialogs = True

        return {
            'has_sitemap': has_sitemap,
            'has_pages': has_pages,
            'has_dialogs': has_dialogs,
            'sitemap_complete': has_sitemap and has_pages,
            'sitemap_section': sitemap_section[:500] if sitemap_section else None
        }

    except Exception as e:
        return {
            'error': str(e),
            'has_sitemap': False,
            'has_pages': False,
            'has_dialogs': False,
            'sitemap_complete': False
        }

def main():
    print("CHECKING TS FILES FOR COMPLETE SITEMAPS")
    print("="*80)
    print(f"Checking {len(ts_files)} TS files...\n")

    complete_count = 0
    missing_sitemap = []
    incomplete_sitemap = []
    missing_dialogs = []

    for ts_file in sorted(ts_files):
        rel_path = ts_file.relative_to(Path('/Users/peak/Documents/GitHub/carmen/docs'))

        result = check_sitemap_section(ts_file)

        if 'error' in result:
            print(f"❌ {rel_path}")
            print(f"   Error: {result['error']}")
            continue

        if not result['has_sitemap']:
            missing_sitemap.append(str(rel_path))
            print(f"❌ {rel_path}")
            print(f"   Missing: No sitemap section found")
        elif not result['sitemap_complete']:
            incomplete_sitemap.append(str(rel_path))
            print(f"⚠️  {rel_path}")
            print(f"   Incomplete: Sitemap exists but missing page details")
        else:
            if not result['has_dialogs']:
                missing_dialogs.append(str(rel_path))
                print(f"⚠️  {rel_path}")
                print(f"   Warning: No dialogues/modals mentioned in sitemap")
            else:
                complete_count += 1
                print(f"✅ {rel_path}")

    # Summary
    print(f"\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Total TS files: {len(ts_files)}")
    print(f"✅ Complete sitemaps: {complete_count}")
    print(f"⚠️  Missing dialogues: {len(missing_dialogs)}")
    print(f"⚠️  Incomplete sitemaps: {len(incomplete_sitemap)}")
    print(f"❌ Missing sitemaps: {len(missing_sitemap)}")

    if missing_sitemap:
        print(f"\n{'='*80}")
        print("FILES MISSING SITEMAP SECTION:")
        print(f"{'='*80}")
        for file in missing_sitemap:
            print(f"  • {file}")

    if incomplete_sitemap:
        print(f"\n{'='*80}")
        print("FILES WITH INCOMPLETE SITEMAP:")
        print(f"{'='*80}")
        for file in incomplete_sitemap:
            print(f"  • {file}")

    if missing_dialogs:
        print(f"\n{'='*80}")
        print("FILES MISSING DIALOGUE/MODAL REFERENCES:")
        print(f"{'='*80}")
        for file in missing_dialogs[:10]:  # Show first 10
            print(f"  • {file}")
        if len(missing_dialogs) > 10:
            print(f"  ... and {len(missing_dialogs) - 10} more")

if __name__ == "__main__":
    main()
