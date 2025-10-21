#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all image references from markdown files
const imageRefsOutput = execSync(
  'grep -roh "!\\[.*\\](.*\\.png)" /Users/peak/Documents/GitHub/carmen/docs/documents --include="*.md"',
  { encoding: 'utf8' }
);

// Parse image paths
const imageRefs = imageRefsOutput
  .split('\n')
  .filter(line => line.trim())
  .map(line => {
    const match = line.match(/!\[.*\]\((.*\.png)\)/);
    return match ? match[1] : null;
  })
  .filter(Boolean);

// Find where each image is referenced
const imageLocations = {};
const allMarkdownFiles = execSync(
  'find /Users/peak/Documents/GitHub/carmen/docs/documents -name "*.md" -type f',
  { encoding: 'utf8' }
).split('\n').filter(Boolean);

allMarkdownFiles.forEach(mdFile => {
  const content = fs.readFileSync(mdFile, 'utf8');
  const matches = content.matchAll(/!\[.*?\]\((.*?\.png)\)/g);

  for (const match of matches) {
    const imagePath = match[1];
    const dir = path.dirname(mdFile);

    if (!imageLocations[imagePath]) {
      imageLocations[imagePath] = [];
    }
    imageLocations[imagePath].push({
      mdFile: path.relative('/Users/peak/Documents/GitHub/carmen/docs/documents', mdFile),
      mdDir: dir,
      fullPath: imagePath
    });
  }
});

// Check each unique image path
const uniqueImages = [...new Set(imageRefs)];
const missingImages = [];
const existingImages = [];
const placeholderImages = [];

console.log('Checking', uniqueImages.length, 'unique image references...\n');

uniqueImages.forEach(imagePath => {
  // Skip placeholder paths
  if (imagePath.includes('[module]')) {
    placeholderImages.push({
      path: imagePath,
      locations: imageLocations[imagePath] || []
    });
    return;
  }

  const locations = imageLocations[imagePath] || [];

  locations.forEach(location => {
    let absolutePath;

    if (imagePath.startsWith('/')) {
      // Absolute path
      absolutePath = imagePath;
    } else if (imagePath.startsWith('../../assets/')) {
      // Relative to assets
      absolutePath = path.join('/Users/peak/Documents/GitHub/carmen/docs', imagePath.replace('../../assets/', 'assets/'));
    } else {
      // Relative to the markdown file
      absolutePath = path.resolve(location.mdDir, imagePath);
    }

    const exists = fs.existsSync(absolutePath);

    if (exists) {
      existingImages.push({
        imagePath,
        mdFile: location.mdFile,
        absolutePath
      });
    } else {
      missingImages.push({
        imagePath,
        mdFile: location.mdFile,
        absolutePath
      });
    }
  });
});

// Report results
console.log('='.repeat(80));
console.log('📊 IMAGE AUDIT SUMMARY');
console.log('='.repeat(80));
console.log(`✅ Existing images: ${existingImages.length}`);
console.log(`❌ Missing images: ${missingImages.length}`);
console.log(`⚠️  Placeholder references: ${placeholderImages.length}`);
console.log('='.repeat(80));

if (missingImages.length > 0) {
  console.log('\n❌ MISSING IMAGES:\n');

  // Group by markdown file
  const byFile = {};
  missingImages.forEach(item => {
    if (!byFile[item.mdFile]) {
      byFile[item.mdFile] = [];
    }
    byFile[item.mdFile].push(item);
  });

  Object.keys(byFile).sort().forEach(mdFile => {
    console.log(`📄 ${mdFile}`);
    byFile[mdFile].forEach(item => {
      console.log(`   ❌ ${item.imagePath}`);
      console.log(`      Expected at: ${item.absolutePath}`);
    });
    console.log();
  });
}

if (placeholderImages.length > 0) {
  console.log('\n⚠️  PLACEHOLDER REFERENCES (need to be replaced):\n');
  placeholderImages.forEach(item => {
    console.log(`   ${item.path}`);
    item.locations.forEach(loc => {
      console.log(`      in ${loc.mdFile}`);
    });
    console.log();
  });
}

console.log('='.repeat(80));
console.log('Summary:');
console.log(`- Total unique image paths: ${uniqueImages.length}`);
console.log(`- Valid images: ${existingImages.length}`);
console.log(`- Missing images: ${missingImages.length}`);
console.log(`- Placeholder references: ${placeholderImages.length}`);
console.log('='.repeat(80));
