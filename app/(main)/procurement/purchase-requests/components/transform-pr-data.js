#!/usr/bin/env node
/**
 * Transform mockPRListData.ts to match TypeScript types
 * This script adds missing required fields to Purchase Request objects
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'mockPRListData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Counter for tracking changes
let prCount = 0;
let itemCount = 0;

console.log('Starting transformation...');

// Transform PR objects section (before line with "as MockPurchaseRequest[]")
// We need to add these fields after refNumber for each PR:
// - requestNumber (same as refNumber)
// - requiredDate (use deliveryDate or 30 days from requestDate)
// - requestType (convert PRType enum to PurchaseRequestType string)
// - priority (add based on status/workflow)
// - departmentId (generate from department)
// - locationId (generate from location)
// - totalItems (count or estimate)
// - estimatedTotal (convert number to Money object)
// - workflowStages (rename from approvals)

// 1. Rename approvals to workflowStages for all PRs
content = content.replace(/\n    approvals: \[/g, (match) => {
  prCount++;
  return '\n    workflowStages: [';
});

console.log(`✓ Renamed ${prCount} approvals → workflowStages`);

// 1b. Also rename other legacy fields: date→requestDate, type→requestType, description→justification, requestorId→requestedBy
content = content.replace(/\n    date: /g, '\n    requestDate: ');
content = content.replace(/\n    type: PRType\./g, '\n    requestType: PRType.');
content = content.replace(/\n    description: /g, '\n    justification: ');
content = content.replace(/\n    requestorId: /g, '\n    requestedBy: ');

// Remove id field from requestor objects
content = content.replace(/\n      id: 'user-[^']+',/g, '');

console.log('✓ Renamed legacy field names');

// 2. Add requestNumber after refNumber for all PRs
content = content.replace(/(\n    refNumber: '([^']+)',)/g, (match, p1, refNum) => {
  return `${p1}\n    requestNumber: '${refNum}',`;
});

console.log('✓ Added requestNumber fields');

// 3. Add requiredDate, priority, departmentId, locationId after requestDate
// This regex finds requestDate and the next line (requestType)
content = content.replace(
  /(\n    requestDate: new Date\('([^']+)'\),)\n(    requestType: )/g,
  (match, dateLine, dateStr, typeLine) => {
    // Calculate requiredDate as 30 days after requestDate
    const reqDate = new Date(dateStr);
    reqDate.setDate(reqDate.getDate() + 30);
    const requiredDateStr = reqDate.toISOString().split('T')[0];

    return `${dateLine}\n    requiredDate: new Date('${requiredDateStr}'),\n    ${typeLine}`;
  }
);

console.log('✓ Added requiredDate fields');

// 4. Convert PRType enum to PurchaseRequestType and add priority
content = content.replace(
  /\n    requestType: PRType\.(\w+),/g,
  (match, prType) => {
    // Map PRType to PurchaseRequestType
    const typeMap = {
      'GeneralPurchase': 'goods',
      'ServiceRequest': 'services',
      'CapitalExpenditure': 'capital',
      'Maintenance': 'maintenance',
      'Emergency': 'emergency'
    };
    const mappedType = typeMap[prType] || 'goods';

    // Determine priority based on type
    const priorityMap = {
      'emergency': 'emergency',
      'Emergency': 'emergency',
      'goods': 'normal',
      'services': 'normal',
      'capital': 'high',
      'maintenance': 'normal'
    };
    const priority = priorityMap[mappedType] || 'normal';

    return `\n    requestType: '${mappedType}' as PurchaseRequestType,\n    priority: '${priority}' as PurchaseRequestPriority,`;
  }
);

console.log('✓ Converted requestType and added priority');

// 5. Add departmentId and locationId after department and location fields
content = content.replace(
  /(\n    department: '([^']+)',)/g,
  (match, deptLine, deptName) => {
    // Generate a simple departmentId from department name
    const deptId = 'dept-' + deptName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return `${deptLine}\n    departmentId: '${deptId}',`;
  }
);

content = content.replace(
  /(\n    location: '([^']+)',)/g,
  (match, locLine, locName) => {
    // Generate a simple locationId from location name
    const locId = 'loc-' + locName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
    return `\n    locationId: '${locId}',${locLine}`;
  }
);

console.log('✓ Added departmentId and locationId fields');

// 6. Add totalItems and convert estimatedTotal to Money object
content = content.replace(
  /(\n    estimatedTotal: )(\d+\.\d+),/g,
  (match, prefix, amount) => {
    // Estimate totalItems based on amount (rough heuristic: 1 item per $3000)
    const totalItems = Math.max(1, Math.ceil(parseFloat(amount) / 3000));
    return `\n    totalItems: ${totalItems},${prefix}{ amount: ${amount}, currency: 'USD' } as Money,`;
  }
);

console.log('✓ Added totalItems and converted estimatedTotal to Money');

// 7. Now handle the items section - transform only the items section
const itemsSectionMarker = 'export const mockPRItemsWithBusinessDimensions = [';
const itemsSectionStart = content.indexOf(itemsSectionMarker);
const itemsSectionEnd = content.indexOf('] as MockPurchaseRequestItem[];', itemsSectionStart);

if (itemsSectionStart !== -1 && itemsSectionEnd !== -1) {
  let beforeItems = content.substring(0, itemsSectionStart + itemsSectionMarker.length);
  let itemsContent = content.substring(itemsSectionStart + itemsSectionMarker.length, itemsSectionEnd);
  let afterItems = content.substring(itemsSectionEnd);

  // Count items
  const itemMatches = itemsContent.match(/\n  \{[^}]*id: "PR-[^"]+"/g);
  if (itemMatches) {
    itemCount = itemMatches.length;
    console.log(`\nFound ${itemCount} items to transform`);
  }

  // Add requestId after id field
  itemsContent = itemsContent.replace(
    /(\n  \{\n    id: "PR-(\d{4}-\d{3})-\d{2}",)/g,
    (match, idLine, prId) => {
      return `${idLine}\n    requestId: 'pr-${prId}',`;
    }
  );

  // Add itemName after name field
  itemsContent = itemsContent.replace(
    /(\n    name: "([^"]+)",)/g,
    (match, nameLine, name) => {
      return `${nameLine}\n    itemName: "${name}",`;
    }
  );

  // Add description if it doesn't exist (check if description already exists on next line)
  itemsContent = itemsContent.replace(
    /(\n    itemName: "[^"]+",)\n(    (?!description:))/g,
    (match, itemNameLine, nextLine) => {
      // Get the item name from itemNameLine
      const itemName = itemNameLine.match(/itemName: "([^"]+)"/)[1];
      return `${itemNameLine}\n    description: "${itemName}",\n${nextLine}`;
    }
  );

  // Add requestedQuantity from quantityRequested
  itemsContent = itemsContent.replace(
    /(\n    quantityRequested: (\d+),)/g,
    (match, qtyLine, qty) => {
      return `${qtyLine}\n    requestedQuantity: ${qty},`;
    }
  );

  // Add deliveryLocationId from location
  itemsContent = itemsContent.replace(
    /(\n    location: "([^"]+)",)/g,
    (match, locLine, location) => {
      const locId = 'loc-' + location.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
      return `${locLine}\n    deliveryLocationId: '${locId}',`;
    }
  );

  // Add requiredDate from deliveryDate
  itemsContent = itemsContent.replace(
    /(\n    deliveryDate: new Date\("([^"]+)"\),)/g,
    (match, deliveryLine, dateStr) => {
      return `${deliveryLine}\n    requiredDate: new Date("${dateStr}"),`;
    }
  );

  // Add priority based on status
  itemsContent = itemsContent.replace(
    /(\n    status: DocumentStatus\.(\w+),)/g,
    (match, statusLine, status) => {
      const priorityMap = {
        'Draft': 'normal',
        'InProgress': 'normal',
        'Approved': 'high',
        'Completed': 'normal',
        'Rejected': 'low',
        'Cancelled': 'low'
      };
      const priority = priorityMap[status] || 'normal';
      return `${statusLine}\n    priority: '${priority}' as PurchaseRequestPriority,`;
    }
  );

  // Add convertedToPO field after priority
  itemsContent = itemsContent.replace(
    /(\n    priority: '[^']+' as PurchaseRequestPriority,)/g,
    (match, priorityLine) => {
      return `${priorityLine}\n    convertedToPO: false,`;
    }
  );

  // Remove invalid financial fields that don't exist in MockPurchaseRequestItem
  const fieldsToRemove = [
    'baseSubTotalPrice',
    'subTotalPrice',
    'baseNetAmount',
    'baseDiscAmount',
    'baseTaxAmount',
    'baseTotalAmount',
    'baseCurrency',
    'currencyRate'
  ];

  fieldsToRemove.forEach(field => {
    const regex = new RegExp(`\\n    ${field}: [^,]+,`, 'g');
    itemsContent = itemsContent.replace(regex, '');
  });

  console.log('✓ Transformed items with required fields');
  console.log('✓ Removed invalid financial fields');

  // Reconstruct the file
  content = beforeItems + itemsContent + afterItems;
}

// Write the transformed content back
fs.writeFileSync(filePath, content, 'utf8');

console.log('\n✅ Transformation complete!');
console.log(`   - ${prCount} Purchase Requests transformed`);
console.log(`   - ${itemCount} Purchase Request Items transformed`);
console.log('\nRun: npm run checktypes to verify');
