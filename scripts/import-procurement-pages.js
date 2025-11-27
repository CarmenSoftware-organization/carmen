#!/usr/bin/env node

/**
 * Import All Procurement Documentation to Wiki.js
 *
 * This script imports all procurement module documentation including:
 * - Credit Notes
 * - Goods Received Notes
 * - My Approvals
 * - Purchase Orders
 * - Purchase Request Templates
 *
 * Note: Purchase Requests already imported separately
 *
 * Usage: node import-procurement-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/procurement';

/**
 * GraphQL mutation to create a new page
 */
const CREATE_PAGE_MUTATION = `
mutation CreatePage(
  $content: String!
  $description: String!
  $editor: String!
  $isPublished: Boolean!
  $isPrivate: Boolean!
  $locale: String!
  $path: String!
  $tags: [String]!
  $title: String!
) {
  pages {
    create(
      content: $content
      description: $description
      editor: $editor
      isPublished: $isPublished
      isPrivate: $isPrivate
      locale: $locale
      path: $path
      tags: $tags
      title: $title
    ) {
      responseResult {
        succeeded
        errorCode
        slug
        message
      }
      page {
        id
        path
        title
      }
    }
  }
}
`;

/**
 * Module configurations with landing page content
 */
const MODULES = {
  'credit-note': {
    title: 'Credit Notes',
    description: 'Documentation for Credit Notes management in procurement',
    landingContent: `# Credit Notes

Complete documentation for the Credit Notes module in the Carmen ERP Procurement system.

## Overview

The Credit Notes module manages vendor credit notes for returned goods, price adjustments, and other credit transactions. It ensures accurate financial reconciliation and vendor account management.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-credit-note) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-credit-note) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-credit-note) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-credit-note) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-credit-note) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-credit-note) | Business rules, validation logic, and error handling |

## Key Features

- **Credit Note Creation** - Create credit notes for returns, adjustments, and corrections
- **GRN Linkage** - Link credit notes to original goods received notes
- **Approval Workflow** - Configurable approval process for credit processing
- **Vendor Account Integration** - Update vendor balances and accounts payable
- **Audit Trail** - Complete history of all credit note transactions

## Quick Links

- [View in Application](/procurement/credit-note)
- [Back to Procurement Overview](/en/procurement)
`
  },
  'goods-received-notes': {
    title: 'Goods Received Notes',
    wikiPath: 'goods-received-note',
    description: 'Documentation for Goods Received Notes (GRN) management',
    landingContent: `# Goods Received Notes

Complete documentation for the Goods Received Notes (GRN) module in the Carmen ERP Procurement system.

## Overview

The Goods Received Notes module handles the receiving process for purchased goods. It tracks deliveries against purchase orders, manages quality inspection, and updates inventory levels.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-goods-received-note) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-goods-received-note) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-goods-received-note) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-goods-received-note) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-goods-received-note) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-goods-received-note) | Business rules, validation logic, and error handling |

## Key Features

- **PO-Based Receiving** - Receive goods against purchase orders
- **Quantity Verification** - Track ordered vs received quantities
- **Quality Inspection** - Record inspection results and quality status
- **Partial Receiving** - Support for partial deliveries
- **Inventory Integration** - Automatic inventory updates on confirmation
- **Variance Handling** - Manage over/under deliveries

## Quick Links

- [View in Application](/procurement/goods-received-note)
- [Back to Procurement Overview](/en/procurement)
`
  },
  'my-approvals': {
    title: 'My Approvals',
    description: 'Documentation for the approval workflow dashboard',
    landingContent: `# My Approvals

Complete documentation for the My Approvals module in the Carmen ERP Procurement system.

## Overview

The My Approvals module provides a centralized dashboard for reviewing and processing pending approval requests. It streamlines the approval workflow across all procurement documents.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-my-approvals) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-my-approvals) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-my-approvals) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-my-approvals) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-my-approvals) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-my-approvals) | Business rules, validation logic, and error handling |

## Key Features

- **Unified Dashboard** - View all pending approvals in one place
- **Multi-Document Support** - Approve PRs, POs, GRNs, and Credit Notes
- **Bulk Actions** - Approve or reject multiple items at once
- **Delegation** - Delegate approval authority to other users
- **Mobile Support** - Approve on-the-go from mobile devices
- **Notifications** - Email and in-app notifications for pending items

## Quick Links

- [View in Application](/procurement/my-approvals)
- [Back to Procurement Overview](/en/procurement)
`
  },
  'purchase-orders': {
    title: 'Purchase Orders',
    description: 'Documentation for Purchase Orders management',
    landingContent: `# Purchase Orders

Complete documentation for the Purchase Orders module in the Carmen ERP Procurement system.

## Overview

The Purchase Orders module manages the creation, approval, and tracking of purchase orders to vendors. It converts approved purchase requests into formal orders and tracks fulfillment.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-purchase-orders) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-purchase-orders) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-purchase-orders) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-purchase-orders) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-purchase-orders) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-purchase-orders) | Business rules, validation logic, and error handling |

## Key Features

- **PR Conversion** - Convert approved purchase requests to orders
- **Vendor Selection** - Compare vendors and select best pricing
- **Order Consolidation** - Combine multiple PRs into single PO
- **Approval Workflow** - Multi-level approval based on amount
- **Order Tracking** - Track order status and delivery
- **Amendment Management** - Handle order changes and revisions

## Quick Links

- [View in Application](/procurement/purchase-orders)
- [Back to Procurement Overview](/en/procurement)
`
  },
  'purchase-request-templates': {
    title: 'Purchase Request Templates',
    description: 'Documentation for PR Templates management',
    landingContent: `# Purchase Request Templates

Complete documentation for the Purchase Request Templates module in the Carmen ERP Procurement system.

## Overview

The Purchase Request Templates module enables users to create and manage reusable templates for frequently ordered items. It speeds up PR creation and ensures consistency.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-purchase-request-templates) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-purchase-request-templates) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-purchase-request-templates) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-purchase-request-templates) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-purchase-request-templates) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-purchase-request-templates) | Business rules, validation logic, and error handling |

## Key Features

- **Template Creation** - Create templates from scratch or existing PRs
- **Item Libraries** - Pre-defined item lists for common orders
- **Department Templates** - Department-specific template management
- **Quick PR Generation** - One-click PR creation from templates
- **Template Sharing** - Share templates across departments
- **Version Control** - Track template changes and history

## Quick Links

- [View in Application](/procurement/purchase-request-templates)
- [Back to Procurement Overview](/en/procurement)
`
  }
};

/**
 * Procurement main landing page
 */
const PROCUREMENT_LANDING = {
  path: 'procurement',
  title: 'Procurement',
  description: 'Complete documentation for the Procurement module in Carmen ERP',
  content: `# Procurement

Complete documentation for the Procurement module in the Carmen ERP system.

## Overview

The Procurement module provides end-to-end procurement management from purchase requests through goods receiving and credit notes. It ensures proper authorization, budget control, and vendor management throughout the purchasing process.

## Modules

### Core Procurement Documents

| Module | Description |
|--------|-------------|
| [Purchase Requests](purchase-requests) | Create and manage purchase requests with approval workflows |
| [Purchase Orders](purchase-orders) | Convert approved PRs to formal purchase orders |
| [Goods Received Notes](goods-received-note) | Receive and verify delivered goods |
| [Credit Notes](credit-note) | Manage vendor credits and returns |

### Supporting Functions

| Module | Description |
|--------|-------------|
| [My Approvals](my-approvals) | Centralized approval dashboard |
| [Purchase Request Templates](purchase-request-templates) | Reusable templates for common orders |

## Procurement Workflow

\`\`\`
Purchase Request → Approval → Purchase Order → Goods Receipt → Invoice Match
       ↓              ↓            ↓              ↓
    Draft         In-progress   Ordered       Received
       ↓              ↓            ↓              ↓
   Submitted       Approved     Delivered     Completed
\`\`\`

## Key Features

- **Multi-Level Approval** - Configurable approval workflows based on amount and type
- **Budget Control** - Real-time budget checking and commitment tracking
- **Vendor Management** - Integrated vendor selection and price comparison
- **Document Linking** - Full traceability from PR to PO to GRN
- **Audit Trail** - Complete history of all procurement activities

## Quick Links

- [View Procurement Dashboard](/procurement)
- [Back to Home](/en/home)
`,
  tags: ['procurement', 'documentation', 'landing-page']
};

/**
 * Extract title from markdown content
 */
function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extract description from markdown content
 */
function extractDescription(content) {
  const lines = content.split('\n');
  let descLines = [];
  let foundHeading = false;

  for (let line of lines) {
    if (line.match(/^#/)) {
      foundHeading = true;
      continue;
    }
    if (foundHeading && line.trim()) {
      descLines.push(line.trim());
      if (descLines.length >= 3) break;
    }
  }

  return descLines.join(' ').substring(0, 200);
}

/**
 * Determine tags based on file path and name
 */
function determineTags(moduleName, filename) {
  const tags = ['procurement', moduleName];

  if (filename.startsWith('BR-')) tags.push('business-requirements');
  else if (filename.startsWith('DD-')) tags.push('data-dictionary');
  else if (filename.startsWith('FD-')) tags.push('flow-diagrams');
  else if (filename.startsWith('TS-')) tags.push('technical-specification');
  else if (filename.startsWith('UC-')) tags.push('use-cases');
  else if (filename.startsWith('VAL-')) tags.push('validation-rules');
  else if (filename.startsWith('PC-')) tags.push('page-component');

  return tags;
}

/**
 * Create a page in Wiki.js
 */
async function createPage(wikiPath, title, description, content, tags) {
  console.log(`\n📄 Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);

  const variables = {
    content: content,
    description: description || 'Procurement Documentation',
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: wikiPath,
    tags: tags,
    title: title
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: CREATE_PAGE_MUTATION,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`   ❌ GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.create?.responseResult?.succeeded) {
      console.log(`   ✅ Success! Page ID: ${result.data.pages.create.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.create.page.id };
    } else {
      const errorMsg = result.data?.pages?.create?.responseResult?.message || 'Unknown error';
      console.error(`   ❌ Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, path: wikiPath, error: error.message };
  }
}

/**
 * Find markdown files in a directory (non-recursive)
 */
function findMarkdownFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      if (!entry.name.includes('.backup') && !entry.name.startsWith('.')) {
        files.push(path.join(dir, entry.name));
      }
    }
  }

  return files;
}

/**
 * Import a single module
 */
async function importModule(moduleName, config, results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 IMPORTING: ${config.title}`);
  console.log('='.repeat(60));

  const wikiBasePath = config.wikiPath || moduleName;

  // Create landing page
  const landingResult = await createPage(
    `procurement/${wikiBasePath}`,
    config.title,
    config.description,
    config.landingContent,
    ['procurement', moduleName, 'documentation', 'landing-page']
  );

  if (landingResult.success) {
    results.success.push(landingResult);
  } else {
    results.failed.push(landingResult);
  }

  await new Promise(resolve => setTimeout(resolve, 300));

  // Import documentation files
  const moduleDir = path.join(BASE_DIR, moduleName);
  const files = findMarkdownFiles(moduleDir);

  console.log(`   Found ${files.length} documentation files`);

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(content, filename);
    const description = extractDescription(content);
    const docName = filename.replace('.md', '').toLowerCase();
    const wikiPath = `procurement/${wikiBasePath}/${docName}`;
    const tags = determineTags(moduleName, filename);

    const result = await createPage(wikiPath, title, description, content, tags);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Main import function
 */
async function importAllProcurement() {
  console.log('🚀 Starting Procurement documentation import...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  const results = {
    success: [],
    failed: []
  };

  // Step 1: Create main procurement landing page
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 1: Creating Main Procurement Landing Page');
  console.log('='.repeat(60));

  const mainResult = await createPage(
    PROCUREMENT_LANDING.path,
    PROCUREMENT_LANDING.title,
    PROCUREMENT_LANDING.description,
    PROCUREMENT_LANDING.content,
    PROCUREMENT_LANDING.tags
  );

  if (mainResult.success) {
    results.success.push(mainResult);
  } else {
    results.failed.push(mainResult);
  }

  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 2: Import each module
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 2: Importing Module Documentation');
  console.log('='.repeat(60));

  for (const [moduleName, config] of Object.entries(MODULES)) {
    await importModule(moduleName, config, results);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully imported: ${results.success.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully created pages:');
    results.success.forEach(({ path }) => {
      console.log(`   - /en/${path}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(({ path, error }) => {
      console.log(`   - ${path}: ${error}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('🔗 ACCESS YOUR PAGES');
  console.log('='.repeat(60));
  console.log('Main page: http://dev.blueledgers.com:3993/en/procurement');
  console.log('\n✨ Import complete!\n');
}

// Run the import
importAllProcurement().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
