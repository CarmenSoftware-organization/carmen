#!/usr/bin/env node

/**
 * Re-import/Update Vendor Management Documentation in Wiki.js
 *
 * This script reads all markdown files from docs/app/vendor-management
 * and updates corresponding pages in Wiki.js via the GraphQL API,
 * overwriting existing content with the fixed Mermaid diagrams.
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/vendor-management';

/**
 * GraphQL query to get page by path
 */
const GET_PAGE_QUERY = `
query GetPage($path: String!, $locale: String!) {
  pages {
    single(path: $path, locale: $locale) {
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
 * Generate tags from filename
 */
function generateTags(filename, submodule) {
  const tags = ['vendor-management', submodule];

  if (filename.startsWith('BR-')) tags.push('business-requirements');
  if (filename.startsWith('DD-')) tags.push('data-dictionary');
  if (filename.startsWith('FD-')) tags.push('flow-diagrams');
  if (filename.startsWith('TS-')) tags.push('technical-specification');
  if (filename.startsWith('UC-')) tags.push('use-cases');
  if (filename.startsWith('VAL-')) tags.push('validation-rules');
  if (filename.startsWith('PC-')) tags.push('page-components');
  if (filename.startsWith('ARC-')) tags.push('architecture');

  return tags;
}

/**
 * Convert file path to Wiki.js page path
 */
function getPagePath(filePath) {
  const relativePath = path.relative(BASE_DIR, filePath);
  const filename = path.basename(filePath).replace(/\.md$/, '').toLowerCase();

  // Extract submodule from path
  const pathParts = path.dirname(relativePath).split(path.sep);

  // Find the first meaningful directory (submodule)
  const submodule = pathParts.find(part => part && part !== '.' && part !== 'pages');

  // If file is in a submodule directory, use submodule/filename
  // Otherwise just use filename
  if (submodule) {
    return `${submodule}/${filename}`;
  }

  return filename;
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
          path: pagePath,
          locale: 'en'
        }
      })
    });

    const result = await response.json();

    if (result.errors) {
      return null;
    }

    return result.data?.pages?.single?.id || null;

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
      return false;
    }

    const responseResult = result.data?.pages?.update?.responseResult;

    if (responseResult?.succeeded) {
      return true;
    } else {
      console.error(`   ❌ Update failed: ${responseResult?.message}`);
      return false;
    }

  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Process a single markdown file
 */
async function processFile(filePath) {
  const relativePath = path.relative(BASE_DIR, filePath);
  const filename = path.basename(filePath);
  const submodule = path.dirname(relativePath).split(path.sep)[0];

  console.log(`\n📄 Processing: ${relativePath}`);

  // Read file content
  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const tags = generateTags(filename, submodule);
  const pagePath = getPagePath(filePath);

  console.log(`   📝 Title: ${title}`);
  console.log(`   🔗 Path: /en/${pagePath}`);

  // Get existing page ID
  const pageId = await getPageId(pagePath);

  if (!pageId) {
    console.log(`   ⚠️  Page not found - skipping (may need to be created first)`);
    return { success: false, skipped: true };
  }

  console.log(`   🔍 Found page ID: ${pageId}`);

  // Update the page
  const pageData = {
    content,
    description,
    path: pagePath,
    tags,
    title
  };

  const success = await updatePage(pageId, pageData);

  if (success) {
    console.log(`   ✅ Updated successfully`);
    return { success: true, skipped: false };
  } else {
    return { success: false, skipped: false };
  }
}

/**
 * Get all markdown files recursively
 */
function getAllMarkdownFiles(dir) {
  const files = [];

  function traverse(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

/**
 * Main import function
 */
async function reimportAll() {
  console.log('🔄 Re-importing Vendor Management Documentation to Wiki.js\n');
  console.log(`📁 Source directory: ${BASE_DIR}`);
  console.log(`🌐 Wiki.js URL: ${API_URL}`);
  console.log('');

  const files = getAllMarkdownFiles(BASE_DIR);
  console.log(`📋 Found ${files.length} markdown files to update\n`);
  console.log('='.repeat(80));

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const file of files) {
    const result = await processFile(file);

    if (result.success) {
      successCount++;
    } else if (result.skipped) {
      skipCount++;
    } else {
      failCount++;
    }

    // Small delay to avoid overwhelming the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 RE-IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully updated: ${successCount} pages`);
  console.log(`⚠️  Skipped (not found): ${skipCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log(`📈 Total processed: ${files.length} files`);
  console.log('');

  if (successCount > 0) {
    console.log('🎉 Pages updated successfully with fixed Mermaid diagrams!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Visit http://dev.blueledgers.com:3993');
    console.log('   2. Navigate to Vendor Management documentation');
    console.log('   3. Verify Mermaid diagrams render correctly');
    console.log('   4. Check that all <br/> tags have been removed');
  }

  if (skipCount > 0) {
    console.log('\n⚠️  Note: Some pages were skipped because they were not found in Wiki.js');
    console.log('   You may need to create these pages first using the import script');
  }
}

// Run the re-import
reimportAll().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
