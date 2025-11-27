#!/usr/bin/env node

/**
 * Import Vendor Management Documentation to Wiki.js
 *
 * This script reads all markdown files from docs/app/vendor-management
 * and creates corresponding pages in Wiki.js via the GraphQL API.
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/vendor-management';

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
 * docs/app/vendor-management/price-lists/BR-price-lists.md
 * -> vendor-management/price-lists/br-price-lists
 */
function convertToWikiPath(filePath) {
  return filePath
    .replace(BASE_DIR + '/', '')
    .replace(/\.md$/, '')
    .toLowerCase();
}

/**
 * Determine tags based on file path and name
 */
function determineTags(filePath, filename) {
  const tags = ['vendor-management'];

  // Add document type tags
  if (filename.startsWith('BR-')) tags.push('business-requirements');
  else if (filename.startsWith('DD-')) tags.push('data-dictionary');
  else if (filename.startsWith('FD-')) tags.push('functional-design');
  else if (filename.startsWith('TS-')) tags.push('technical-specification');
  else if (filename.startsWith('UC-')) tags.push('use-cases');
  else if (filename.startsWith('VAL-')) tags.push('validation-rules');
  else if (filename.startsWith('PC-')) tags.push('page-component');
  else if (filename.startsWith('ARC-')) tags.push('architecture');

  // Add sub-module tags
  if (filePath.includes('/price-lists/')) tags.push('price-lists');
  if (filePath.includes('/pricelist-templates/')) tags.push('pricelist-templates');
  if (filePath.includes('/vendor-portal/')) tags.push('vendor-portal');
  if (filePath.includes('/vendor-directory/')) tags.push('vendor-directory');
  if (filePath.includes('/requests-for-pricing/')) tags.push('requests-for-pricing');

  return tags;
}

/**
 * Create a page in Wiki.js
 */
async function createPage(filePath, content) {
  const filename = path.basename(filePath);
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const wikiPath = convertToWikiPath(filePath);
  const tags = determineTags(filePath, filename);

  console.log(`\n📄 Creating page: ${wikiPath}`);
  console.log(`   Title: ${title}`);
  console.log(`   Tags: ${tags.join(', ')}`);

  const variables = {
    content: content,
    description: description || 'Vendor Management Documentation',
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
 * Find all markdown files recursively
 */
function findMarkdownFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main import function
 */
async function importPages() {
  console.log('🚀 Starting Vendor Management documentation import...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);

  // Find all markdown files
  const files = findMarkdownFiles(BASE_DIR);
  console.log(`\n📋 Found ${files.length} markdown files to import\n`);

  const results = {
    success: [],
    failed: []
  };

  // Process each file
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = await createPage(filePath, content);

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

  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(({ path, error }) => {
      console.log(`   - ${path}: ${error}`);
    });
  }

  console.log('\n✨ Import complete!\n');
}

// Run the import
importPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
