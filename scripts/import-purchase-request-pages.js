#!/usr/bin/env node

/**
 * Import Purchase Request Documentation to Wiki.js
 *
 * This script reads all markdown files from docs/app/procurement/purchase-requests
 * and creates corresponding pages in Wiki.js via the GraphQL API.
 *
 * It also creates a main landing page that links to all sub-documents.
 *
 * Usage: node import-purchase-request-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/procurement/purchase-requests';

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
 * Main landing page content for Purchase Requests
 */
const LANDING_PAGE_CONTENT = `# Purchase Requests

Complete documentation for the Purchase Requests module in the Carmen ERP Procurement system.

## Overview

The Purchase Requests module enables users to create, manage, and track purchase requests throughout the approval workflow. It provides comprehensive functionality for requesting goods and services with budget control and multi-level approval workflows.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-purchase-requests) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-purchase-requests) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-purchase-requests) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-purchase-requests) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-purchase-requests) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-purchase-requests) | Business rules, validation logic, and error handling |

## Key Features

- **PR Creation** - Create purchase requests with line items, quantities, and specifications
- **Multi-Level Approval** - Configurable approval workflows based on amount thresholds
- **Budget Control** - Real-time budget checking and availability validation
- **Status Tracking** - Track PR status through Draft, In-progress, Approved, Void, Completed, Cancelled
- **Document Management** - Attach supporting documents and specifications
- **Audit Trail** - Complete history of all changes and approvals

## PR Status Lifecycle

| Status | Description |
|--------|-------------|
| Draft | Initial state, PR being created/edited |
| In-progress | PR submitted and in approval workflow |
| Approved | All required approvals obtained |
| Void | PR rejected during approval process |
| Completed | PR converted to Purchase Order |
| Cancelled | PR cancelled by user or admin |

## Implementation Status

| Category | Total | ✅ Done | 🔧 Partial | 🚧 Pending |
|----------|-------|---------|------------|------------|
| Functional Requirements | 25 | 3 | 10 | 12 |
| Business Rules | 65 | 6 | 15 | 44 |
| Use Cases | 26 | 1 | 6 | 19 |
| Validation Rules | 31 | 0 | 16 | 15 |

**Current State**: Frontend prototype with mock data. Backend API and integrations pending development.

## Quick Links

- [View in Application](/procurement/purchase-requests)
- [Back to Procurement Overview](/en/procurement)

## Related Modules

- [Purchase Orders](/en/procurement/purchase-orders) - Convert approved PRs to POs
- [Goods Received Notes](/en/procurement/goods-received-note) - Receive goods against POs
- [My Approvals](/en/procurement/my-approvals) - Review and approve pending requests
`;

/**
 * Extract title from markdown content
 * Looks for first # heading or returns filename-based title
 */
function extractTitle(content, filename) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) {
    return match[1].trim();
  }

  // Fallback to filename without extension
  return filename
    .replace(/\.md$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Extract description from markdown content
 * Looks for content after first heading
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
      if (descLines.length >= 3) break; // Take first 3 non-empty lines
    }
  }

  return descLines.join(' ').substring(0, 200);
}

/**
 * Convert file path to Wiki.js path
 * docs/app/procurement/purchase-requests/BR-purchase-requests.md
 * -> procurement/purchase-requests/br-purchase-requests
 */
function convertToWikiPath(filePath) {
  return filePath
    .replace('docs/app/', '')
    .replace(/\.md$/, '')
    .toLowerCase();
}

/**
 * Determine tags based on file path and name
 */
function determineTags(filePath, filename) {
  const tags = ['procurement', 'purchase-requests'];

  // Add document type tags
  if (filename.startsWith('BR-')) tags.push('business-requirements');
  else if (filename.startsWith('DD-')) tags.push('data-dictionary');
  else if (filename.startsWith('FD-')) tags.push('flow-diagrams');
  else if (filename.startsWith('TS-')) tags.push('technical-specification');
  else if (filename.startsWith('UC-')) tags.push('use-cases');
  else if (filename.startsWith('VAL-')) tags.push('validation-rules');
  else if (filename.startsWith('PC-')) tags.push('page-component');
  else if (filename.startsWith('DS-')) tags.push('data-schema');

  return tags;
}

/**
 * Create a page in Wiki.js
 */
async function createPage(wikiPath, title, description, content, tags) {
  console.log(`\n📄 Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Tags: ${tags.join(', ')}`);

  const variables = {
    content: content,
    description: description || 'Purchase Requests Documentation',
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
 * Create a page from a file
 */
async function createPageFromFile(filePath, content) {
  const filename = path.basename(filePath);
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const wikiPath = convertToWikiPath(filePath);
  const tags = determineTags(filePath, filename);

  return createPage(wikiPath, title, description, content, tags);
}

/**
 * Find all markdown files in the purchase-requests directory
 * Excludes backup files, screenshots, and other non-documentation files
 */
function findMarkdownFiles(dir) {
  const files = [];

  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip directories we don't want to import
    if (entry.isDirectory()) {
      if (['screenshots', 'pages', 'assets', 'images'].includes(entry.name)) {
        continue;
      }
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      // Skip backup files and certain file types
      if (entry.name.includes('.backup') ||
          entry.name.startsWith('SCREENSHOT') ||
          entry.name.startsWith('.')) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main import function
 */
async function importPages() {
  console.log('🚀 Starting Purchase Request documentation import...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  const results = {
    success: [],
    failed: []
  };

  // Step 1: Create the landing page first
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 1: Creating Landing Page');
  console.log('='.repeat(60));

  const landingResult = await createPage(
    'procurement/purchase-requests',
    'Purchase Requests',
    'Complete documentation for the Purchase Requests module in Carmen ERP Procurement system.',
    LANDING_PAGE_CONTENT,
    ['procurement', 'purchase-requests', 'documentation', 'landing-page']
  );

  if (landingResult.success) {
    results.success.push(landingResult);
  } else {
    results.failed.push(landingResult);
  }

  // Add delay before next request
  await new Promise(resolve => setTimeout(resolve, 500));

  // Step 2: Import all documentation files
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 2: Importing Documentation Files');
  console.log('='.repeat(60));

  const files = findMarkdownFiles(BASE_DIR);
  console.log(`\n📋 Found ${files.length} markdown files to import\n`);

  // Process each file
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = await createPageFromFile(filePath, content);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }

    // Add small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 500));
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
  console.log('Main page: http://dev.blueledgers.com:3993/en/procurement/purchase-requests');
  console.log('\n✨ Import complete!\n');
}

// Run the import
importPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
