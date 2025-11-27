#!/usr/bin/env node

/**
 * Delete and Re-import Vendor Management Documentation
 *
 * This script deletes and re-creates all vendor management pages in Wiki.js
 * to update them with the fixed Mermaid diagrams (no <br/> tags).
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const BASE_DIR = 'docs/app/vendor-management';

// GraphQL mutations
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

const DELETE_PAGE_MUTATION = `
mutation DeletePage($id: Int!) {
  pages {
    delete(id: $id) {
      responseResult {
        succeeded
        errorCode
        message
      }
    }
  }
}
`;

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

function generateTags(filename, submodule) {
  const tags = ['vendor-management'];

  if (submodule) {
    tags.push(submodule);
  }

  if (filename.startsWith('BR-')) tags.push('business-requirements');
  if (filename.startsWith('DD-')) tags.push('data-dictionary');
  if (filename.startsWith('FD-')) tags.push('functional-design');
  if (filename.startsWith('TS-')) tags.push('technical-specification');
  if (filename.startsWith('UC-')) tags.push('use-cases');
  if (filename.startsWith('VAL-')) tags.push('validation-rules');
  if (filename.startsWith('PC-')) tags.push('page-component');
  if (filename.startsWith('ARC-')) tags.push('architecture');

  return tags;
}

function getPagePath(filePath) {
  const relativePath = path.relative(BASE_DIR, filePath);
  return relativePath
    .replace(/\.md$/, '')
    .replace(/\\/g, '/')
    .replace(/\/pages\//g, '/pages/')
    .toLowerCase();
}

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
    return result.data?.pages?.single?.id || null;

  } catch (error) {
    return null;
  }
}

async function deletePage(pageId) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: DELETE_PAGE_MUTATION,
        variables: { id: pageId }
      })
    });

    const result = await response.json();
    const responseResult = result.data?.pages?.delete?.responseResult;
    return responseResult?.succeeded || false;

  } catch (error) {
    return false;
  }
}

async function createPage(pageData) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: CREATE_PAGE_MUTATION,
        variables: pageData
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.log(`   ⚠️  GraphQL Error: ${result.errors[0].message}`);
      return false;
    }

    const responseResult = result.data?.pages?.create?.responseResult;

    if (!responseResult?.succeeded && responseResult?.message) {
      console.log(`   ⚠️  ${responseResult.message}`);
    }

    return responseResult?.succeeded || false;

  } catch (error) {
    console.log(`   ⚠️  Exception: ${error.message}`);
    return false;
  }
}

async function processFile(filePath) {
  const relativePath = path.relative(BASE_DIR, filePath);
  const filename = path.basename(filePath);

  console.log(`\n📄 Processing: ${relativePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const title = extractTitle(content, filename);
  const description = extractDescription(content);
  const pagePath = getPagePath(filePath);

  // Extract submodule
  const pathParts = path.dirname(relativePath).split(path.sep);
  const submodule = pathParts.find(part => part && part !== '.' && part !== 'pages');

  const tags = generateTags(filename, submodule);

  console.log(`   🔗 Path: /en/${pagePath}`);

  // Get existing page ID
  const pageId = await getPageId(pagePath);

  if (pageId) {
    console.log(`   🗑️  Deleting old page (ID: ${pageId})`);
    const deleted = await deletePage(pageId);

    if (!deleted) {
      console.log(`   ❌ Failed to delete`);
      return { success: false };
    }

    // Wait a bit after deletion
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Create new page
  console.log(`   ➕ Creating new page`);

  const pageData = {
    content,
    description,
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: pagePath,
    tags,
    title
  };

  const created = await createPage(pageData);

  if (created) {
    console.log(`   ✅ Updated successfully`);
    return { success: true };
  } else {
    console.log(`   ❌ Failed to create`);
    return { success: false };
  }
}

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

async function main() {
  console.log('🔄 Delete and Re-import Vendor Management Documentation\n');
  console.log('⚠️  This will delete and recreate all pages with fixed Mermaid diagrams\n');

  const files = getAllMarkdownFiles(BASE_DIR);
  console.log(`📋 Found ${files.length} markdown files to process\n`);
  console.log('='.repeat(80));

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    const result = await processFile(file);

    if (result.success) {
      successCount++;
    } else {
      failCount++;
    }

    // Delay between operations
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 RE-IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully updated: ${successCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log(`📈 Total processed: ${files.length} files`);
  console.log('');

  if (successCount > 0) {
    console.log('🎉 All pages updated with fixed Mermaid diagrams!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Visit http://dev.blueledgers.com:3993');
    console.log('   2. Navigate to Vendor Management documentation');
    console.log('   3. Verify Mermaid diagrams render correctly (no <br/> tags)');
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
