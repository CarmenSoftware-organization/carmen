#!/usr/bin/env node

/**
 * Import All Product Management Documentation to Wiki.js
 *
 * This script imports all product management module documentation including:
 * - Products
 * - Categories
 * - Units
 *
 * Usage: node import-product-management-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/product-management';

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
  'products': {
    title: 'Products',
    description: 'Documentation for Product catalog management',
    landingContent: `# Products

Complete documentation for the Products module in the Carmen ERP Product Management system.

## Overview

The Products module manages the master product catalog including item definitions, specifications, pricing, and inventory parameters. It serves as the central repository for all purchasable and inventory items.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-products) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-products) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-products) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-products) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-products) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-products) | Business rules, validation logic, and error handling |

## Key Features

- **Product Catalog** - Comprehensive product information management
- **Multi-Unit Support** - Base units, purchase units, and recipe units
- **Category Assignment** - Hierarchical category organization
- **Vendor Linkage** - Associate products with approved vendors
- **Inventory Parameters** - Min/max levels, reorder points, lead times
- **Product Specifications** - Detailed specs, images, and attachments

## Quick Links

- [View in Application](/product-management/products)
- [Back to Product Management Overview](/en/product-management)
`
  },
  'categories': {
    title: 'Product Categories',
    description: 'Documentation for Product Categories management',
    landingContent: `# Product Categories

Complete documentation for the Product Categories module in the Carmen ERP Product Management system.

## Overview

The Product Categories module provides hierarchical organization for products. Categories enable logical grouping, reporting, and access control across the product catalog.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-categories) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-categories) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-categories) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-categories) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-categories) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-categories) | Business rules, validation logic, and error handling |

## Key Features

- **Hierarchical Structure** - Multi-level category tree
- **Category Attributes** - Custom attributes per category
- **Product Assignment** - Assign products to categories
- **Access Control** - Category-based permissions
- **Reporting Groups** - Category-based reporting and analytics
- **Bulk Operations** - Mass category assignments

## Quick Links

- [View in Application](/product-management/categories)
- [Back to Product Management Overview](/en/product-management)
`
  },
  'units': {
    title: 'Units of Measure',
    description: 'Documentation for Units of Measure management',
    landingContent: `# Units of Measure

Complete documentation for the Units of Measure module in the Carmen ERP Product Management system.

## Overview

The Units of Measure module manages all measurement units used throughout the system including base units, purchase units, and conversion factors. It ensures accurate quantity management across procurement, inventory, and recipes.

## Documentation Set

### Core Specifications

| Document | Description |
|----------|-------------|
| [Business Requirements](br-units) | Business goals, functional requirements, and acceptance criteria |
| [Technical Specification](ts-units) | Technical architecture, API specifications, and implementation details |
| [Data Dictionary](dd-units) | Database schema, field definitions, and data structures |

### Process & Workflows

| Document | Description |
|----------|-------------|
| [Flow Diagrams](fd-units) | Process flows, state transitions, and workflow diagrams |
| [Use Cases](uc-units) | Detailed usage scenarios and actor interactions |
| [Validation Rules](val-units) | Business rules, validation logic, and error handling |

## Key Features

- **Unit Definitions** - Standard and custom unit definitions
- **Conversion Factors** - Automatic unit conversions
- **Unit Groups** - Group related units (weight, volume, count)
- **Base Unit Management** - Define base units per product
- **Purchase Units** - Different units for purchasing vs inventory
- **Recipe Units** - Cooking/production unit support

## Quick Links

- [View in Application](/product-management/units)
- [Back to Product Management Overview](/en/product-management)
`
  }
};

/**
 * Product Management main landing page
 */
const MAIN_LANDING = {
  path: 'product-management',
  title: 'Product Management',
  description: 'Complete documentation for the Product Management module in Carmen ERP',
  content: `# Product Management

Complete documentation for the Product Management module in the Carmen ERP system.

## Overview

The Product Management module provides comprehensive management of the product catalog, categories, and units of measure. It serves as the foundation for procurement, inventory, and recipe management.

## Modules

| Module | Description |
|--------|-------------|
| [Products](products) | Master product catalog with specifications and parameters |
| [Categories](categories) | Hierarchical product categorization |
| [Units](units) | Units of measure and conversion management |

## Key Features

- **Centralized Catalog** - Single source of truth for all products
- **Flexible Categories** - Multi-level hierarchical organization
- **Unit Conversions** - Automatic conversion between units
- **Vendor Integration** - Link products to approved vendors
- **Inventory Parameters** - Min/max levels and reorder points
- **Recipe Support** - Units and specifications for recipe management

## Module Integration

\`\`\`
Product Management
       │
       ├── Products ──────► Procurement (Purchase Items)
       │                 ├── Inventory (Stock Items)
       │                 └── Recipes (Ingredients)
       │
       ├── Categories ───► Reporting (Category Analysis)
       │                 └── Access Control (Permissions)
       │
       └── Units ────────► All Modules (Quantity Management)
\`\`\`

## Quick Links

- [View Product Dashboard](/product-management/products)
- [Back to Home](/en/home)
`,
  tags: ['product-management', 'documentation', 'landing-page']
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
  const tags = ['product-management', moduleName];

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
    description: description || 'Product Management Documentation',
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

  // Create landing page
  const landingResult = await createPage(
    `product-management/${moduleName}`,
    config.title,
    config.description,
    config.landingContent,
    ['product-management', moduleName, 'documentation', 'landing-page']
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
    const wikiPath = `product-management/${moduleName}/${docName}`;
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
async function importAllProductManagement() {
  console.log('🚀 Starting Product Management documentation import...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  const results = {
    success: [],
    failed: []
  };

  // Step 1: Create main product management landing page
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 1: Creating Main Product Management Landing Page');
  console.log('='.repeat(60));

  const mainResult = await createPage(
    MAIN_LANDING.path,
    MAIN_LANDING.title,
    MAIN_LANDING.description,
    MAIN_LANDING.content,
    MAIN_LANDING.tags
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
  console.log('Main page: http://dev.blueledgers.com:3993/en/product-management');
  console.log('\n✨ Import complete!\n');
}

// Run the import
importAllProductManagement().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
