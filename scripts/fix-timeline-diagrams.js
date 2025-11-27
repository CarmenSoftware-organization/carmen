#!/usr/bin/env node
/**
 * Fix Timeline Diagrams for Mermaid 8.8.2
 *
 * Converts timeline diagrams to sequence diagrams for better compatibility
 * with Mermaid 8.8.2
 *
 * Usage: node fix-timeline-diagrams.js
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_FIX = [
  'docs/app/vendor-management/pricelist-templates/FD-pricelist-templates.md',
  'docs/app/vendor-management/requests-for-pricing/FD-requests-for-pricing.md',
  'docs/app/vendor-management/vendor-portal/FD-vendor-portal.md'
];

// Function to convert timeline to sequence diagram
function convertTimelineToSequence(timelineContent) {
  // Timeline diagrams typically show temporal progression
  // We'll convert them to simpler flowcharts with temporal stages

  // Extract title if present
  const titleMatch = timelineContent.match(/title\s+(.+)/);
  const title = titleMatch ? titleMatch[1] : '';

  // Convert to flowchart with left-to-right direction
  let converted = 'flowchart LR\n';
  if (title) {
    converted += `    subgraph "${title}"\n`;
  }

  // Extract timeline sections and convert to flowchart nodes
  const lines = timelineContent.split('\n');
  const nodes = [];
  let nodeId = 1;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and directives
    if (!trimmed || trimmed.startsWith('timeline') || trimmed.startsWith('title')) {
      continue;
    }

    // Timeline section header (date or phase)
    if (trimmed.includes(':') && !trimmed.startsWith(':')) {
      const [phase, ...eventsParts] = trimmed.split(':');
      const events = eventsParts.join(':').trim();

      const currentNode = `N${nodeId}`;
      nodes.push(currentNode);

      // Create node with phase and events
      if (events) {
        converted += `    ${currentNode}["${phase}<br/>${events}"]\n`;
      } else {
        converted += `    ${currentNode}["${phase}"]\n`;
      }

      nodeId++;
    }
    // Standalone event (subitem)
    else if (trimmed.startsWith(':')) {
      // This is a sub-event, add it to the previous node
      // For simplicity, we'll skip standalone events in conversion
      continue;
    }
  }

  // Connect all nodes in sequence
  for (let i = 0; i < nodes.length - 1; i++) {
    converted += `    ${nodes[i]} --> ${nodes[i + 1]}\n`;
  }

  if (title) {
    converted += '    end\n';
  }

  return converted;
}

// Function to extract Mermaid blocks and identify timeline diagrams
function processFile(filePath) {
  console.log(`\n📄 Processing: ${filePath.replace('docs/app/vendor-management/', '')}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;

  let newContent = content;
  let replacements = 0;
  let match;

  // Find all Mermaid blocks
  const matches = [];
  while ((match = mermaidRegex.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      diagramContent: match[1],
      index: match.index
    });
  }

  // Process each block in reverse order (to maintain string positions)
  for (let i = matches.length - 1; i >= 0; i--) {
    const block = matches[i];

    // Check if it's a timeline diagram
    if (block.diagramContent.trim().startsWith('timeline')) {
      console.log(`   ⚠️  Found timeline diagram at position ${block.index}`);

      // Convert to sequence/flowchart
      const converted = convertTimelineToSequence(block.diagramContent);
      const newBlock = '```mermaid\n' + converted + '```';

      // Replace in content
      newContent = newContent.substring(0, block.index) +
                   newBlock +
                   newContent.substring(block.index + block.fullMatch.length);

      replacements++;
      console.log(`   ✅ Converted to flowchart`);
    }
  }

  if (replacements > 0) {
    // Write back to file
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`   💾 Saved ${replacements} conversion(s)`);
  } else {
    console.log(`   ℹ️  No timeline diagrams found`);
  }

  return replacements;
}

// Main function
function main() {
  console.log('🔧 Converting timeline diagrams to Mermaid 8.8.2 compatible format...\n');

  let totalReplacements = 0;

  for (const file of FILES_TO_FIX) {
    if (!fs.existsSync(file)) {
      console.log(`\n⚠️  File not found: ${file}`);
      continue;
    }

    const replacements = processFile(file);
    totalReplacements += replacements;
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 CONVERSION SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total timeline diagrams converted: ${totalReplacements}`);
  console.log('');

  if (totalReplacements > 0) {
    console.log('✅ All timeline diagrams have been converted to flowcharts!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Re-import the updated files to Wiki.js');
    console.log('   2. Verify the diagrams render correctly');
    console.log('   3. Run the compatibility checker again to confirm');
  } else {
    console.log('ℹ️  No timeline diagrams were found in the specified files.');
  }
}

// Run the conversion
try {
  main();
} catch (error) {
  console.error('❌ Error during conversion:', error.message);
  console.error(error.stack);
  process.exit(1);
}
