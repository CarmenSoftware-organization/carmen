#!/usr/bin/env python3
"""
Verify DD (Data Definition) files against Prisma schema
- Extract models and fields from Prisma schema
- Compare with data structures in DD files
- Highlight differences
"""

import re
from pathlib import Path
from collections import defaultdict

# DD files to verify
dd_files = [
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/settings/DD-settings.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/permission-management/DD-permission-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/system-integrations/DD-system-integrations.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/business-rules/DD-business-rules.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/workflow/DD-workflow.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/location-management/DD-location-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/user-management/DD-user-management.md",
    "/Users/peak/Documents/GitHub/carmen/docs/app/system-administration/monitoring/DD-monitoring.md",
]

schema_path = "/Users/peak/Documents/GitHub/carmen/docs/app/data-struc/schema.prisma"

def parse_prisma_schema(schema_path):
    """Parse Prisma schema to extract models and their fields"""
    models = {}

    with open(schema_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find all model definitions
    model_pattern = r'model\s+(\w+)\s*\{([^\}]+)\}'
    matches = re.finditer(model_pattern, content, re.MULTILINE | re.DOTALL)

    for match in matches:
        model_name = match.group(1)
        model_body = match.group(2)

        # Extract fields from model body
        fields = []
        field_pattern = r'^\s*(\w+)\s+(\w+)'
        for line in model_body.split('\n'):
            field_match = re.match(field_pattern, line.strip())
            if field_match and not line.strip().startswith('//'):
                field_name = field_match.group(1)
                field_type = field_match.group(2)
                # Skip relation fields (@@, @@index, @@unique)
                if not field_name.startswith('@@'):
                    fields.append(field_name)

        models[model_name] = fields

    return models

def extract_tables_from_dd(dd_path):
    """Extract table/model references from DD file"""
    tables_mentioned = set()
    fields_by_table = defaultdict(set)

    with open(dd_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for table references in various formats:
    # 1. Explicit table names: tb_*, Table:
    # 2. Field references: table.field
    # 3. Code blocks with SQL or Prisma syntax

    # Pattern 1: tb_* table names
    table_pattern = r'\b(tb_\w+)\b'
    for match in re.finditer(table_pattern, content):
        tables_mentioned.add(match.group(1))

    # Pattern 2: Field references (table.field)
    field_pattern = r'\b(tb_\w+)\.(\w+)\b'
    for match in re.finditer(field_pattern, content):
        table = match.group(1)
        field = match.group(2)
        tables_mentioned.add(table)
        fields_by_table[table].add(field)

    # Pattern 3: Look for field lists in tables/documentation
    # This is more complex and context-dependent, so we'll skip for now

    return tables_mentioned, fields_by_table

def verify_dd_file(dd_path, schema_models):
    """Verify a single DD file against Prisma schema"""
    print(f"\n{'='*80}")
    print(f"VERIFYING: {Path(dd_path).name}")
    print(f"{'='*80}\n")

    tables_mentioned, fields_by_table = extract_tables_from_dd(dd_path)

    if not tables_mentioned:
        print("⚠️  No table references found in this DD file")
        return

    # Check tables
    missing_tables = []
    existing_tables = []

    for table in sorted(tables_mentioned):
        if table not in schema_models:
            missing_tables.append(table)
        else:
            existing_tables.append(table)

    # Report tables
    if existing_tables:
        print("✅ TABLES FOUND IN SCHEMA:")
        for table in existing_tables:
            print(f"   • {table}")

    if missing_tables:
        print("\n❌ TABLES NOT FOUND IN SCHEMA:")
        for table in missing_tables:
            print(f"   • {table}")

    # Check fields for existing tables
    if fields_by_table:
        print("\n📋 FIELD VERIFICATION:")
        for table in sorted(fields_by_table.keys()):
            if table in schema_models:
                schema_fields = set(schema_models[table])
                mentioned_fields = fields_by_table[table]

                missing_fields = mentioned_fields - schema_fields
                existing_fields = mentioned_fields & schema_fields

                print(f"\n   Table: {table}")
                if existing_fields:
                    print(f"   ✅ Found fields: {', '.join(sorted(existing_fields))}")
                if missing_fields:
                    print(f"   ❌ Missing fields: {', '.join(sorted(missing_fields))}")
                    print(f"   📌 Available fields in schema: {', '.join(sorted(schema_fields)[:10])}...")

    print()

def main():
    print("VERIFYING DD FILES AGAINST PRISMA SCHEMA")
    print(f"{'='*80}\n")

    # Parse schema
    print("📖 Parsing Prisma schema...")
    schema_models = parse_prisma_schema(schema_path)
    print(f"   Found {len(schema_models)} models in schema\n")

    # Verify each DD file
    all_issues = []

    for dd_file in dd_files:
        dd_path = Path(dd_file)
        if not dd_path.exists():
            print(f"⚠️  File not found: {dd_path.name}")
            continue

        verify_dd_file(dd_file, schema_models)

    # Summary
    print(f"\n{'='*80}")
    print("VERIFICATION COMPLETE")
    print(f"{'='*80}")
    print(f"Total DD files verified: {len(dd_files)}")
    print(f"Total models in schema: {len(schema_models)}")

if __name__ == "__main__":
    main()
