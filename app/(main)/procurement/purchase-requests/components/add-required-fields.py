#!/usr/bin/env python3
"""Add required fields to mockPRListData.ts"""

import re
import sys

def main():
    with open('mockPRListData.ts', 'r') as f:
        content = f.read()

    # Split into PR section and items section
    pr_section_end = content.find('] as MockPurchaseRequest[];')
    items_section_start = content.find('export const mockPRItemsWithBusinessDimensions = [')

    before_prs = content[:content.find('export const mockPRListData = [') + len('export const mockPRListData = [')]
    pr_content = content[len(before_prs):pr_section_end]
    between_sections = content[pr_section_end:items_section_start + len('export const mockPRItemsWithBusinessDimensions = [')]
    items_content = content[items_section_start + len('export const mockPRItemsWithBusinessDimensions = ['):content.find('] as MockPurchaseRequestItem[];')]
    after_items = content[content.find('] as MockPurchaseRequestItem[];'):]

    print("Processing PR section...")

    # Process PR objects: add requestNumber, requiredDate, priority, departmentId, locationId, totalItems, convert estimatedTotal
    # Add requestNumber after refNumber
    pr_content = re.sub(
        r"(\n    refNumber: '([^']+)',)",
        r"\1\n    requestNumber: '\2',",
        pr_content
    )

    # Add requiredDate and priority after requestDate
    pr_content = re.sub(
        r"(\n    requestDate: new Date\('([^']+)'\),)",
        lambda m: f"{m.group(1)}\n    requiredDate: new Date('{m.group(2)}'),\n    priority: 'normal' as PurchaseRequestPriority,",
        pr_content
    )

    # Convert requestType from PRType enum to PurchaseRequestType string
    type_map = {
        'GeneralPurchase': 'goods',
        'ServiceRequest': 'services',
        'CapitalExpenditure': 'capital',
        'Maintenance': 'maintenance',
        'Emergency': 'emergency'
    }
    for pr_type, request_type in type_map.items():
        pr_content = pr_content.replace(
            f'requestType: PRType.{pr_type},',
            f"requestType: '{request_type}' as PurchaseRequestType,"
        )

    # Add departmentId after department
    pr_content = re.sub(
        r"(\n    department: '([^']+)',)",
        lambda m: f"{m.group(1)}\n    departmentId: 'dept-{m.group(2).lower().replace(' & ', '-').replace(' ', '-')}',",
        pr_content
    )

    # Add locationId before location
    pr_content = re.sub(
        r"(\n    location: '([^']+)',)",
        lambda m: f"\n    locationId: 'loc-{m.group(2).lower().replace(' ', '-')}',{m.group(1)}",
        pr_content
    )

    # Add totalItems and convert estimatedTotal to Money
    pr_content = re.sub(
        r"(\n    estimatedTotal: )(\d+\.\d+),",
        lambda m: f"\n    totalItems: 5,{m.group(1)}{{ amount: {m.group(2)}, currency: 'USD' }} as Money,",
        pr_content
    )

    print("✓ Transformed PR objects")

    print("Processing items section...")

    # Process items: add requestId, itemName, description, requestedQuantity, deliveryLocationId, requiredDate, priority, convertedToPO
    # Add requestId after id
    items_content = re.sub(
        r'(\n  \{\n    id: "PR-(\d{4}-\d{3})-\d{2}",)',
        lambda m: f"{m.group(1)}\n    requestId: 'pr-{m.group(2)}',",
        items_content
    )

    # Add itemName after name
    items_content = re.sub(
        r'(\n    name: "([^"]+)",)',
        r'\1\n    itemName: "\2",',
        items_content
    )

    # Add description if not present (after itemName, check next line isn't description)
    def add_description(match):
        item_name = match.group(2)
        next_line = match.group(3)
        if 'description:' not in next_line:
            return f'{match.group(1)}\n    description: "{item_name}",\n{next_line}'
        return match.group(0)

    items_content = re.sub(
        r'(\n    itemName: "([^"]+)",)\n(    [^\n]+)',
        add_description,
        items_content
    )

    # Add requestedQuantity after quantityRequested
    items_content = re.sub(
        r'(\n    quantityRequested: (\d+),)',
        r'\1\n    requestedQuantity: \2,',
        items_content
    )

    # Add deliveryLocationId after location
    items_content = re.sub(
        r'(\n    location: "([^"]+)",)',
        lambda m: f"{m.group(1)}\n    deliveryLocationId: 'loc-{m.group(2).lower().replace(' ', '-')}',",
        items_content
    )

    # Add requiredDate after deliveryDate
    items_content = re.sub(
        r'(\n    deliveryDate: new Date\("([^"]+)"\),)',
        r'\1\n    requiredDate: new Date("\2"),',
        items_content
    )

    # Add priority and convertedToPO after status
    items_content = re.sub(
        r'(\n    status: DocumentStatus\.\w+,)',
        r'\1\n    priority: \'normal\' as PurchaseRequestPriority,\n    convertedToPO: false,',
        items_content
    )

    # Remove invalid fields
    invalid_fields = [
        'baseSubTotalPrice', 'subTotalPrice', 'baseNetAmount',
        'baseDiscAmount', 'baseTaxAmount', 'baseTotalAmount',
        'baseCurrency', 'currencyRate'
    ]
    for field in invalid_fields:
        items_content = re.sub(rf'\n\s+{field}: [^,]+,', '', items_content)

    # Fix foc field (should be boolean, not number)
    items_content = re.sub(r'\n\s+foc: 0,', '\n    foc: false,', items_content)
    items_content = re.sub(r'\n\s+foc: 1,', '\n    foc: true,', items_content)

    print("✓ Transformed items")

    # Reassemble the file
    result = before_prs + pr_content + between_sections + items_content + after_items

    with open('mockPRListData.ts', 'w') as f:
        f.write(result)

    print("\n✅ All transformations complete!")
    print("Run: npm run checktypes to verify")

if __name__ == '__main__':
    main()
