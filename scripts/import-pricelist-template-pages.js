#!/usr/bin/env node

/**
 * Import Pricelist Template Page Content Documents to Wiki.js
 *
 * This script imports the 3 PC (Page Content) documents for Pricelist Templates:
 * - PC-template-list.md
 * - PC-template-create.md
 * - PC-template-detail.md
 *
 * Target Wiki.js path: vendor-management/pricelist-templates/pages/
 */

const fs = require('fs');
const path = require('path');

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

const SOURCE_DIR = 'docs/app/vendor-management/pricelist-templates/pages';

// Pages to import with their Wiki.js paths
const PAGES_TO_IMPORT = [
  {
    file: 'PC-template-list.md',
    wikiPath: 'vendor-management/pricelist-templates/pages/template-list',
    title: 'Pricelist Templates List Page'
  },
  {
    file: 'PC-template-create.md',
    wikiPath: 'vendor-management/pricelist-templates/pages/template-create',
    title: 'Create Pricelist Template Page'
  },
  {
    file: 'PC-template-detail.md',
    wikiPath: 'vendor-management/pricelist-templates/pages/template-detail',
    title: 'Pricelist Template Detail Page'
  }
];

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
 * GraphQL query to check if page exists
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
    if (foundHeading && line.trim() && !line.startsWith('|') && !line.startsWith('-')) {
      descLines.push(line.trim());
      if (descLines.length >= 2) break;
    }
  }

  return descLines.join(' ').substring(0, 200) || 'Page Content Documentation for Pricelist Templates';
}

/**
 * Check if a page exists at the given path
 */
async function checkPageExists(wikiPath) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: GET_PAGE_QUERY,
        variables: { path: wikiPath }
      })
    });

    const result = await response.json();
    const page = result.data?.pages?.singleByPath;

    if (page && page.id) {
      return { exists: true, id: page.id };
    }
    return { exists: false, id: null };
  } catch (error) {
    console.error(`   ⚠️ Error checking page: ${error.message}`);
    return { exists: false, id: null };
  }
}

/**
 * Create or update a page in Wiki.js
 */
async function createOrUpdatePage(pageConfig, content) {
  const description = extractDescription(content);
  const tags = ['vendor-management', 'pricelist-templates', 'page-content'];

  console.log(`\n📄 Processing: ${pageConfig.file}`);
  console.log(`   Wiki Path: ${pageConfig.wikiPath}`);
  console.log(`   Title: ${pageConfig.title}`);

  // Check if page already exists
  const { exists, id } = await checkPageExists(pageConfig.wikiPath);

  const variables = {
    content: content,
    description: description,
    editor: 'markdown',
    isPublished: true,
    isPrivate: false,
    locale: 'en',
    path: pageConfig.wikiPath,
    tags: tags,
    title: pageConfig.title
  };

  try {
    let mutation, operationType;

    if (exists) {
      console.log(`   📝 Page exists (ID: ${id}), updating...`);
      mutation = UPDATE_PAGE_MUTATION;
      operationType = 'update';
      variables.id = id;
    } else {
      console.log(`   ➕ Creating new page...`);
      mutation = CREATE_PAGE_MUTATION;
      operationType = 'create';
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: mutation,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`   ❌ GraphQL Error:`, result.errors[0].message);
      return { success: false, path: pageConfig.wikiPath, error: result.errors[0].message };
    }

    const responseResult = result.data?.pages?.[operationType]?.responseResult;
    const pageData = result.data?.pages?.[operationType]?.page;

    if (responseResult?.succeeded) {
      console.log(`   ✅ Success! Page ID: ${pageData?.id || id}`);
      return { success: true, path: pageConfig.wikiPath, id: pageData?.id || id, operation: operationType };
    } else {
      const errorMsg = responseResult?.message || 'Unknown error';
      console.error(`   ❌ Failed:`, errorMsg);
      return { success: false, path: pageConfig.wikiPath, error: errorMsg };
    }
  } catch (error) {
    console.error(`   ❌ Error:`, error.message);
    return { success: false, path: pageConfig.wikiPath, error: error.message };
  }
}

/**
 * Main import function
 */
async function importPages() {
  console.log('🚀 Starting Pricelist Template Pages import to Wiki.js...\n');
  console.log(`📂 Source directory: ${SOURCE_DIR}`);
  console.log(`📋 Pages to import: ${PAGES_TO_IMPORT.length}\n`);
  console.log('='.repeat(60));

  const results = {
    created: [],
    updated: [],
    failed: []
  };

  for (const pageConfig of PAGES_TO_IMPORT) {
    const filePath = path.join(SOURCE_DIR, pageConfig.file);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`\n⚠️ File not found: ${filePath}`);
      results.failed.push({ path: pageConfig.wikiPath, error: 'File not found' });
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const result = await createOrUpdatePage(pageConfig, content);

    if (result.success) {
      if (result.operation === 'create') {
        results.created.push(result);
      } else {
        results.updated.push(result);
      }
    } else {
      results.failed.push(result);
    }

    // Small delay between API calls
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Created: ${results.created.length} pages`);
  console.log(`📝 Updated: ${results.updated.length} pages`);
  console.log(`❌ Failed: ${results.failed.length} pages`);

  if (results.created.length > 0) {
    console.log('\n✅ Created pages:');
    results.created.forEach(({ path }) => {
      console.log(`   - ${path}`);
    });
  }

  if (results.updated.length > 0) {
    console.log('\n📝 Updated pages:');
    results.updated.forEach(({ path }) => {
      console.log(`   - ${path}`);
    });
  }

  if (results.failed.length > 0) {
    console.log('\n❌ Failed pages:');
    results.failed.forEach(({ path, error }) => {
      console.log(`   - ${path}: ${error}`);
    });
  }

  console.log('\n✨ Import complete!\n');
  console.log('Wiki.js URLs:');
  PAGES_TO_IMPORT.forEach(page => {
    console.log(`   http://dev.blueledgers.com:3993/en/${page.wikiPath}`);
  });
}

// Run the import
importPages().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
