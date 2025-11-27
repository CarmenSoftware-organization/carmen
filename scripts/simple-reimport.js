#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const BASE_DIR = 'docs/app/vendor-management';

// Get all markdown files
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
  console.log('🔄 Simplified re-import: Delete all pages and recreate\n');

  const files = getAllMarkdownFiles(BASE_DIR);
  console.log(`📋 Found ${files.length} files\n`);

  console.log('⚠️  Please manually delete all vendor management pages in Wiki.js UI first');
  console.log('   Then run: node scripts/import-vendor-management-pages.js\n');
  console.log('Or run this command to create/overwrite:\n');
  console.log('node scripts/import-vendor-management-pages.js');
}

main();
