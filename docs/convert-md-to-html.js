#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// HTML template for converted markdown files
const createHTMLTemplate = (title, content, breadcrumb) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Carmen ERP Documentation</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        :root {
            --primary: #2563eb;
            --secondary: #64748b;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --bg-light: #f8fafc;
            --bg-white: #ffffff;
            --text-primary: #0f172a;
            --text-secondary: #64748b;
            --border: #e2e8f0;
            --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: var(--bg-light);
            color: var(--text-primary);
            line-height: 1.6;
            padding: 2rem;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
        }

        .breadcrumb {
            color: var(--text-secondary);
            font-size: 0.875rem;
            margin-bottom: 1rem;
        }

        .breadcrumb a {
            color: var(--primary);
            text-decoration: none;
        }

        .breadcrumb a:hover {
            text-decoration: underline;
        }

        .content {
            background: var(--bg-white);
            padding: 2rem;
            border-radius: 0.75rem;
            box-shadow: var(--shadow);
        }

        h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        h2 {
            font-size: 1.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid var(--border);
            color: var(--text-primary);
        }

        h3 {
            font-size: 1.25rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        h4 {
            font-size: 1.125rem;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            color: var(--text-primary);
        }

        p {
            margin-bottom: 1rem;
        }

        ul, ol {
            margin-bottom: 1rem;
            padding-left: 2rem;
        }

        li {
            margin-bottom: 0.5rem;
        }

        code {
            background: var(--bg-light);
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.875rem;
        }

        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin-bottom: 1rem;
        }

        pre code {
            background: transparent;
            padding: 0;
            color: inherit;
        }

        blockquote {
            border-left: 4px solid var(--primary);
            padding-left: 1rem;
            margin: 1rem 0;
            color: var(--text-secondary);
            font-style: italic;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1rem;
        }

        th, td {
            border: 1px solid var(--border);
            padding: 0.75rem;
            text-align: left;
        }

        th {
            background: var(--bg-light);
            font-weight: 600;
        }

        a {
            color: var(--primary);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .back-link {
            display: inline-block;
            margin-bottom: 1rem;
            color: var(--text-secondary);
            text-decoration: none;
            font-size: 0.875rem;
        }

        .back-link:hover {
            color: var(--primary);
        }

        hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 2rem 0;
        }

        .mermaid {
            background: var(--bg-white);
            padding: 1rem;
            border-radius: 0.5rem;
            margin: 1rem 0;
        }
    </style>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
</head>
<body>
    <div class="container">
        <div class="breadcrumb">${breadcrumb}</div>
        <a href="../index.html" class="back-link">← Back to Module</a>
        <div class="content" id="markdown-content"></div>
    </div>
    <script>
        const markdownContent = ${JSON.stringify(content)};

        // Configure marked
        marked.setOptions({
            highlight: function(code, lang) {
                return code;
            },
            breaks: true,
            gfm: true
        });

        // Render markdown
        document.getElementById('markdown-content').innerHTML = marked.parse(markdownContent);
    </script>
</body>
</html>`;

// Function to get breadcrumb based on file path
function getBreadcrumb(filePath) {
    const relativePath = filePath.replace('/Users/peak/Documents/GitHub/carmen/docs/documents/', '');
    const parts = relativePath.split('/');

    let breadcrumb = '<a href="../index.html">Documentation</a>';

    if (parts.length > 1) {
        const module = parts[0];
        breadcrumb += ` / <a href="../${module}/index.html">${module.toUpperCase()}</a>`;

        if (parts.length > 2 && parts[1] === 'features') {
            breadcrumb += ' / Features';
            if (parts.length > 3) {
                const feature = parts[2].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                breadcrumb += ` / ${feature}`;
            }
        }
    }

    return breadcrumb;
}

// Function to convert a single .md file to .html
function convertFile(mdPath) {
    try {
        // Read markdown content
        const mdContent = fs.readFileSync(mdPath, 'utf8');

        // Extract title from first # heading or use filename
        const titleMatch = mdContent.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1] : path.basename(mdPath, '.md');

        // Get breadcrumb
        const breadcrumb = getBreadcrumb(mdPath);

        // Generate HTML
        const html = createHTMLTemplate(title, mdContent, breadcrumb);

        // Write HTML file
        const htmlPath = mdPath.replace(/\.md$/, '.html');
        fs.writeFileSync(htmlPath, html, 'utf8');

        console.log(`✓ Converted: ${mdPath} → ${htmlPath}`);
        return htmlPath;
    } catch (error) {
        console.error(`✗ Error converting ${mdPath}:`, error.message);
        return null;
    }
}

// Function to find all .md files recursively
function findMarkdownFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules and .git directories
            if (file !== 'node_modules' && file !== '.git') {
                findMarkdownFiles(filePath, fileList);
            }
        } else if (file.endsWith('.md')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Main execution
const docsDir = '/Users/peak/Documents/GitHub/carmen/docs/documents';
console.log('Finding all .md files...');
const mdFiles = findMarkdownFiles(docsDir);
console.log(`Found ${mdFiles.length} .md files\n`);

console.log('Converting files...\n');
let converted = 0;
let failed = 0;

mdFiles.forEach(mdFile => {
    const result = convertFile(mdFile);
    if (result) {
        converted++;
    } else {
        failed++;
    }
});

console.log(`\n✓ Conversion complete!`);
console.log(`  - Converted: ${converted} files`);
console.log(`  - Failed: ${failed} files`);
console.log(`  - Total: ${mdFiles.length} files`);
