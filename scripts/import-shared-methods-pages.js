#!/usr/bin/env node

/**
 * Import Shared Methods Documentation to Wiki.js
 *
 * This script imports shared methods documentation including:
 * - Inventory Operations
 * - Inventory Valuation
 *
 * Usage: node import-shared-methods-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/shared-methods';

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
 * GraphQL mutation to update an existing page
 */
const UPDATE_PAGE_MUTATION = `
mutation UpdatePage(
  $id: Int!
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
    update(
      id: $id
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
 * GraphQL query to find page by path
 */
const GET_PAGE_BY_PATH_QUERY = `
query GetPageByPath($path: String!, $locale: String!) {
  pages {
    singleByPath(path: $path, locale: $locale) {
      id
      path
      title
    }
  }
}
`;

/**
 * Shared Methods landing page content
 */
const SHARED_METHODS_LANDING = {
  path: 'shared-methods',
  title: 'Shared Methods',
  description: 'Application-wide shared methods and services documentation',
  tags: ['shared-methods', 'documentation', 'services', 'landing-page']
};

/**
 * Module configurations
 */
const MODULES = {
  'inventory-operations': {
    title: 'Inventory Operations',
    description: 'Standardized inventory operations: balance tracking, transaction recording, state management',
    wikiPath: 'inventory-operations',
    files: ['SM-inventory-operations.md']
  },
  'inventory-valuation': {
    title: 'Inventory Valuation',
    description: 'Calculate inventory costs using FIFO or Periodic Average costing methods',
    wikiPath: 'inventory-valuation',
    files: ['SM-inventory-valuation.md', 'SM-costing-methods.md', 'SM-periodic-average.md']
  }
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
  const tags = ['shared-methods', moduleName];

  if (filename.startsWith('SM-')) tags.push('shared-method');
  if (filename.includes('inventory')) tags.push('inventory');
  if (filename.includes('valuation')) tags.push('valuation');
  if (filename.includes('costing')) tags.push('costing');
  if (filename.includes('operations')) tags.push('operations');

  return tags;
}

/**
 * Check if page exists by path
 */
async function getPageByPath(wikiPath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: GET_PAGE_BY_PATH_QUERY,
        variables: {
          path: wikiPath,
          locale: 'en'
        }
      })
    });

    const result = await response.json();

    if (result.data?.pages?.singleByPath) {
      return result.data.pages.singleByPath;
    }
    return null;
  } catch (error) {
    console.error(`   ⚠️ Error checking page:`, error.message);
    return null;
  }
}

/**
 * Create a page in Wiki.js
 */
async function createPage(wikiPath, title, description, content, tags) {
  console.log(`\n📄 Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);

  const variables = {
    content: content,
    description: description || 'Shared Methods Documentation',
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
      console.log(`   ✅ Created! Page ID: ${result.data.pages.create.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.create.page.id, action: 'created' };
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
 * Update an existing page in Wiki.js
 */
async function updatePage(pageId, wikiPath, title, description, content, tags) {
  console.log(`\n📝 Updating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Page ID: ${pageId}`);

  const variables = {
    id: pageId,
    content: content,
    description: description || 'Shared Methods Documentation',
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
        query: UPDATE_PAGE_MUTATION,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`   ❌ GraphQL Error:`, result.errors[0].message);
      return { success: false, path: wikiPath, error: result.errors[0].message };
    }

    if (result.data?.pages?.update?.responseResult?.succeeded) {
      console.log(`   ✅ Updated! Page ID: ${result.data.pages.update.page.id}`);
      return { success: true, path: wikiPath, id: result.data.pages.update.page.id, action: 'updated' };
    } else {
      const errorMsg = result.data?.pages?.update?.responseResult?.message || 'Unknown error';
      console.error(`   ❌ Failed:`, errorMsg);
      return { success: false, path: wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, path: wikiPath, error: error.message };
  }
}

/**
 * Create or update a page
 */
async function upsertPage(wikiPath, title, description, content, tags) {
  // Check if page exists
  const existingPage = await getPageByPath(wikiPath);

  if (existingPage) {
    return await updatePage(existingPage.id, wikiPath, title, description, content, tags);
  } else {
    return await createPage(wikiPath, title, description, content, tags);
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
    const wikiPath = `shared-methods/${wikiBasePath}/${docName}`;
    const tags = determineTags(moduleName, filename);

    const result = await upsertPage(wikiPath, title, description, content, tags);

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
async function importSharedMethods() {
  console.log('🚀 Starting Shared Methods documentation import...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  const results = {
    success: [],
    failed: []
  };

  // Step 1: Create/update main shared-methods landing page (README.md)
  console.log('\n' + '='.repeat(60));
  console.log('📝 STEP 1: Importing Main Shared Methods Landing Page');
  console.log('='.repeat(60));

  const readmePath = path.join(BASE_DIR, 'README.md');
  if (fs.existsSync(readmePath)) {
    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    const mainResult = await upsertPage(
      SHARED_METHODS_LANDING.path,
      SHARED_METHODS_LANDING.title,
      SHARED_METHODS_LANDING.description,
      readmeContent,
      SHARED_METHODS_LANDING.tags
    );

    if (mainResult.success) {
      results.success.push(mainResult);
    } else {
      results.failed.push(mainResult);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
  }

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
  console.log(`✅ Successfully processed: ${results.success.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully processed pages:');
    results.success.forEach(({ path, action }) => {
      console.log(`   - /en/${path} (${action})`);
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
  console.log('Main page: http://dev.blueledgers.com:3993/en/shared-methods');
  console.log('\n✨ Import complete!\n');
}

// Run the import
importSharedMethods().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
