#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Function to update .md links to .html links in HTML content
function updateLinksInHTML(content) {
    // Replace href="*.md" with href="*.html"
    return content.replace(/href="([^"]*?)\.md"/g, 'href="$1.html"');
}

// Function to find all .html files recursively
function findHTMLFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git') {
                findHTMLFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to update a single HTML file
function updateHTMLFile(htmlPath) {
    try {
        // Read HTML content
        const content = fs.readFileSync(htmlPath, 'utf8');

        // Count .md links before conversion
        const mdLinksBefore = (content.match(/href="([^"]*?)\.md"/g) || []).length;

        if (mdLinksBefore === 0) {
            // No .md links to convert
            return { path: htmlPath, converted: 0, status: 'skip' };
        }

        // Update .md links to .html
        const updatedContent = updateLinksInHTML(content);

        // Write updated HTML file
        fs.writeFileSync(htmlPath, updatedContent, 'utf8');

        console.log(`✓ Updated: ${htmlPath} (${mdLinksBefore} links converted)`);
        return { path: htmlPath, converted: mdLinksBefore, status: 'success' };
    } catch (error) {
        console.error(`✗ Error updating ${htmlPath}:`, error.message);
        return { path: htmlPath, converted: 0, status: 'error', error: error.message };
    }
}

// Main execution
const docsDir = '/Users/peak/Documents/GitHub/carmen/docs/documents';
console.log('Finding all .html files...');
const htmlFiles = findHTMLFiles(docsDir);
console.log(`Found ${htmlFiles.length} .html files\n`);

console.log('Updating .md links to .html links...\n');
let updated = 0;
let skipped = 0;
let failed = 0;
let totalLinksConverted = 0;

const results = htmlFiles.map(htmlFile => {
    const result = updateHTMLFile(htmlFile);

    if (result.status === 'success') {
        updated++;
        totalLinksConverted += result.converted;
    } else if (result.status === 'skip') {
        skipped++;
    } else if (result.status === 'error') {
        failed++;
    }

    return result;
});

console.log(`\n✓ Link conversion complete!`);
console.log(`  - Updated: ${updated} files`);
console.log(`  - Skipped: ${skipped} files (no .md links)`);
console.log(`  - Failed: ${failed} files`);
console.log(`  - Total links converted: ${totalLinksConverted}`);
console.log(`  - Total HTML files processed: ${htmlFiles.length}`);
