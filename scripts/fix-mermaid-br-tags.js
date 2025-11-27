#!/usr/bin/env node
/**
 * Fix Mermaid <br/> Tags for 8.8.2 Compatibility
 *
 * Removes HTML <br/> tags from Mermaid diagrams which are not supported in 8.8.2
 *
 * Usage: node fix-mermaid-br-tags.js
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = 'docs/app/vendor-management';

// Files with <br/> tag issues (from compatibility check)
const FILES_TO_FIX = [
  'docs/app/vendor-management/price-lists/TS-price-lists.md',
  'docs/app/vendor-management/pricelist-templates/FD-pricelist-templates.md',
  'docs/app/vendor-management/pricelist-templates/TS-pricelist-templates.md',
  'docs/app/vendor-management/requests-for-pricing/FD-requests-for-pricing.md',
  'docs/app/vendor-management/requests-for-pricing/TS-requests-for-pricing.md',
  'docs/app/vendor-management/vendor-directory/FD-vendor-directory.md',
  'docs/app/vendor-management/vendor-directory/TS-vendor-directory.md',
  'docs/app/vendor-management/vendor-portal/FD-vendor-portal.md'
];

// Extract Mermaid blocks from content
function extractMermaidBlocks(content) {
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = mermaidRegex.exec(content)) !== null) {
    blocks.push({
      fullMatch: match[0],
      diagramContent: match[1],
      startIndex: match.index,
      endIndex: match.index + match[0].length
    });
  }

  return blocks;
}

// Fix <br/> tags in a single file
function fixFile(filePath) {
  console.log(`\n📄 Processing: ${filePath.replace('docs/app/vendor-management/', '')}`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  File not found: ${filePath}`);
    return { fixed: 0, blocks: 0 };
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const blocks = extractMermaidBlocks(content);

  if (blocks.length === 0) {
    console.log(`   ℹ️  No Mermaid diagrams found`);
    return { fixed: 0, blocks: 0 };
  }

  let newContent = content;
  let totalReplacements = 0;
  let blocksFixed = 0;

  // Process blocks in reverse order to maintain string positions
  for (let i = blocks.length - 1; i >= 0; i--) {
    const block = blocks[i];

    // Check if block contains <br/> tags
    const brTagRegex = /<br\s*\/?>/gi;
    if (brTagRegex.test(block.diagramContent)) {
      // Count replacements
      const matches = block.diagramContent.match(brTagRegex);
      const replacementCount = matches ? matches.length : 0;

      // Remove <br/> tags (replace with space to maintain readability)
      const fixedDiagram = block.diagramContent.replace(brTagRegex, ' ');
      const fixedBlock = '```mermaid\n' + fixedDiagram + '```';

      // Replace in content
      newContent = newContent.substring(0, block.startIndex) +
                   fixedBlock +
                   newContent.substring(block.endIndex);

      totalReplacements += replacementCount;
      blocksFixed++;

      console.log(`   ✅ Fixed block ${i + 1}: Removed ${replacementCount} <br/> tag(s)`);
    }
  }

  if (totalReplacements > 0) {
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`   💾 Saved: ${totalReplacements} <br/> tag(s) removed from ${blocksFixed} block(s)`);
  } else {
    console.log(`   ℹ️  No <br/> tags found in ${blocks.length} diagram(s)`);
  }

  return { fixed: totalReplacements, blocks: blocksFixed };
}

// Main function
function main() {
  console.log('🔧 Fixing Mermaid <br/> tags for 8.8.2 compatibility...\n');
  console.log('📋 Files to process: ' + FILES_TO_FIX.length);

  let totalFixed = 0;
  let totalBlocks = 0;
  let filesProcessed = 0;

  for (const file of FILES_TO_FIX) {
    const result = fixFile(file);
    totalFixed += result.fixed;
    totalBlocks += result.blocks;
    if (result.fixed > 0) {
      filesProcessed++;
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 FIX SUMMARY');
  console.log('='.repeat(80));
  console.log(`Files processed: ${filesProcessed}`);
  console.log(`Total <br/> tags removed: ${totalFixed}`);
  console.log(`Total blocks fixed: ${totalBlocks}`);
  console.log('');

  if (totalFixed > 0) {
    console.log('✅ All <br/> tags have been removed!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Review the changes with git diff');
    console.log('   2. Run the compatibility checker again to verify');
    console.log('   3. Re-import the updated files to Wiki.js');
    console.log('   4. Verify diagrams render correctly in Wiki.js');
  } else {
    console.log('ℹ️  No <br/> tags were found to fix.');
  }
}

// Run the fix
try {
  main();
} catch (error) {
  console.error('❌ Error during fix:', error.message);
  console.error(error.stack);
  process.exit(1);
}
