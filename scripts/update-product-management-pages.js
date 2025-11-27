#!/usr/bin/env node

/**
 * Update Product Management Documentation in Wiki.js
 *
 * This script reads all markdown files from docs/app/product-management
 * and updates corresponding pages in Wiki.js via the GraphQL API.
 * It updates existing pages with the latest content from the local files.
 *
 * Usage: node update-product-management-pages.js
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/product-management';

/**
 * GraphQL query to get page by path
 */
const GET_PAGE_QUERY = `
query GetPage($path: String!) {
  pages {
    singleByPath(path: $path, locale: "en") {
      id
      path
      title
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
        updatedAt
      }
    }
  }
}
`;

/**
 * GraphQL mutation to create a new page (fallback if page doesn't exist)
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
 * Submodules to process
 */
const SUBMODULES = ['products', 'categories', 'units'];

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
 * Generate tags from filename and submodule
 */
function generateTags(filename, submodule) {
  const tags = ['product-management', submodule];

  if (filename.startsWith('BR-')) tags.push('business-requirements');
  if (filename.startsWith('DD-')) tags.push('data-dictionary');
  if (filename.startsWith('FD-')) tags.push('flow-diagrams');
  if (filename.startsWith('TS-')) tags.push('technical-specification');
  if (filename.startsWith('UC-')) tags.push('use-cases');
  if (filename.startsWith('VAL-')) tags.push('validation-rules');
  if (filename.startsWith('PC-')) tags.push('page-components');

  return tags;
}

/**
 * Get page ID by path
 */
async function getPageId(pagePath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: GET_PAGE_QUERY,
        variables: {
          path: pagePath
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      return null;
    }

    return result.data?.pages?.singleByPath?.id || null;

  } catch (error) {
    console.error(`   ❌ Error getting page ID: ${error.message}`);
    return null;
  }
}

/**
 * Update a page in Wiki.js
 */
async function updatePage(pageId, pageData) {
  try {
    const variables = {
      id: pageId,
      content: pageData.content,
      description: pageData.description,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: pageData.path,
      tags: pageData.tags,
      title: pageData.title
    };

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
      console.error(`   ❌ GraphQL Error: ${result.errors[0].message}`);
      return { success: false, error: result.errors[0].message };
    }

    const responseResult = result.data?.pages?.update?.responseResult;

    if (responseResult?.succeeded) {
      return { success: true };
    } else {
      console.error(`   ❌ Update failed: ${responseResult?.message}`);
      return { success: false, error: responseResult?.message };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Create a page in Wiki.js (fallback for pages that don't exist)
 */
async function createPage(pageData) {
  try {
    const variables = {
      content: pageData.content,
      description: pageData.description,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: pageData.path,
      tags: pageData.tags,
      title: pageData.title
    };

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
      console.error(`   ❌ GraphQL Error: ${result.errors[0].message}`);
      return { success: false, error: result.errors[0].message };
    }

    const responseResult = result.data?.pages?.create?.responseResult;

    if (responseResult?.succeeded) {
      return { success: true, id: result.data.pages.create.page.id };
    } else {
      console.error(`   ❌ Create failed: ${responseResult?.message}`);
      return { success: false, error: responseResult?.message };
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
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
 * Process a single markdown file
 */
async function processFile(filePath, submodule) {
  const filename = path.basename(filePath);
  const docName = filename.replace('.md', '').toLowerCase();
  const wikiPath = `product-management/${submodule}/${docName}`;

  console.log(`\n📄 Processing: ${filename}`);
  console.log(`   🔗 Wiki Path: /en/${wikiPath}`);

  // Read file content
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const tags = generateTags(filename, submodule);

  console.log(`   📝 Title: ${title}`);

  const pageData = {
    content,
    description,
    path: wikiPath,
    tags,
    title
  };

  // Get existing page ID
  const pageId = await getPageId(wikiPath);

  if (pageId) {
    // Update existing page
    console.log(`   🔄 Updating existing page (ID: ${pageId})...`);
    const result = await updatePage(pageId, pageData);

    if (result.success) {
      console.log(`   ✅ Updated successfully!`);
      return { success: true, action: 'updated', path: wikiPath };
    } else {
      return { success: false, action: 'update_failed', path: wikiPath, error: result.error };
    }
  } else {
    // Create new page
    console.log(`   🆕 Page not found, creating new page...`);
    const result = await createPage(pageData);

    if (result.success) {
      console.log(`   ✅ Created successfully! (ID: ${result.id})`);
      return { success: true, action: 'created', path: wikiPath };
    } else {
      return { success: false, action: 'create_failed', path: wikiPath, error: result.error };
    }
  }
}

/**
 * Process a submodule
 */
async function processSubmodule(submodule, results) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 Processing: ${submodule.toUpperCase()}`);
  console.log('='.repeat(60));

  const moduleDir = path.join(BASE_DIR, submodule);
  const files = findMarkdownFiles(moduleDir);

  console.log(`   Found ${files.length} documentation files`);

  for (const filePath of files) {
    const result = await processFile(filePath, submodule);

    if (result.success) {
      results.success.push(result);
    } else {
      results.failed.push(result);
    }

    // Delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting Product Management documentation update...\n');
  console.log(`📂 Base directory: ${BASE_DIR}`);
  console.log(`📝 Submodules to process: ${SUBMODULES.join(', ')}`);

  const results = {
    success: [],
    failed: []
  };

  // Process each submodule
  for (const submodule of SUBMODULES) {
    await processSubmodule(submodule, results);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 UPDATE SUMMARY');
  console.log('='.repeat(60));

  const updated = results.success.filter(r => r.action === 'updated').length;
  const created = results.success.filter(r => r.action === 'created').length;

  console.log(`✅ Successfully processed: ${results.success.length} pages`);
  console.log(`   - Updated: ${updated}`);
  console.log(`   - Created: ${created}`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  if (results.success.length > 0) {
    console.log('\n✅ Successfully processed pages:');
    results.success.forEach(({ path, action }) => {
      const icon = action === 'updated' ? '🔄' : '🆕';
      console.log(`   ${icon} /en/${path}`);
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
  console.log('Products: http://dev.blueledgers.com:3993/en/product-management/products');
  console.log('Categories: http://dev.blueledgers.com:3993/en/product-management/categories');
  console.log('Units: http://dev.blueledgers.com:3993/en/product-management/units');
  console.log('\n✨ Update complete!\n');
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
