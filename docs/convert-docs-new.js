#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// HTML template for converted markdown files
const createHTMLTemplate = (title, content, breadcrumb, section) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Carmen ERP Documentation</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/marked-mermaid@latest/dist/css/marked-mermaid.min.css">
    <script src="https://cdn.jsdelivr.net/npm/marked@latest/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/mermaid@latest/dist/mermaid.min.js"></script>
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

        .section-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            background: var(--primary);
            color: white;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            margin-bottom: 1rem;
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

        .back-link {
            display: inline-block;
            color: var(--primary);
            text-decoration: none;
            margin-bottom: 1rem;
        }

        .back-link:hover {
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

        a {
            color: var(--primary);
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        code {
            background: var(--bg-light);
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
            font-family: 'Monaco', 'Courier New', monospace;
        }

        pre {
            background: var(--text-primary);
            color: #f8fafc;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin: 1rem 0;
        }

        pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        ul, ol {
            margin: 1rem 0;
            padding-left: 2rem;
        }

        li {
            margin: 0.5rem 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }

        th, td {
            padding: 0.75rem;
            text-align: left;
            border: 1px solid var(--border);
        }

        th {
            background: var(--bg-light);
            font-weight: 600;
        }

        blockquote {
            border-left: 4px solid var(--primary);
            padding-left: 1rem;
            margin: 1rem 0;
            color: var(--text-secondary);
        }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 0.5rem;
            margin: 1rem 0;
        }

        .mermaid {
            margin: 1.5rem 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="section-badge">${section}</div>
        <div class="breadcrumb">${breadcrumb}</div>
        <a href="../../index.html" class="back-link">← Back to Documentation Home</a>
        <div class="content" id="markdown-content"></div>
    </div>
    <script>
        const markdownContent = ${JSON.stringify(content)};

        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: true,
            theme: 'default'
        });

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

        // Render mermaid diagrams
        mermaid.contentLoaded();
    </script>
</body>
</html>`;

// Section mapping
const SECTIONS = {
    '01-overview': 'Overview',
    '02-architecture': 'Architecture',
    '03-data-model': 'Data Model',
    '04-modules': 'Application Modules',
    '05-cross-cutting': 'Cross-Cutting Concerns',
    '06-api-reference': 'API Reference',
    '07-development': 'Development',
    '08-reference': 'Reference'
};

// Function to get section from file path
function getSection(filePath) {
    const match = filePath.match(/\/(0[1-8]-[^\/]+)\//);
    return match ? SECTIONS[match[1]] || 'Documentation' : 'Documentation';
}

// Function to get breadcrumb based on file path
function getBreadcrumb(filePath) {
    const docsDir = '/Users/peak/Documents/GitHub/carmen/docs/';
    const relativePath = filePath.replace(docsDir, '');
    const parts = relativePath.split('/');

    let breadcrumb = '<a href="../../index.html">Documentation</a>';

    if (parts.length > 0 && parts[0].match(/^0[1-8]-/)) {
        const section = SECTIONS[parts[0]] || parts[0];
        breadcrumb += ` / <a href="../index.html">${section}</a>`;

        if (parts.length > 1) {
            // Handle module path
            if (parts[0] === '04-modules') {
                const module = parts[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                breadcrumb += ` / ${module}`;

                if (parts.length > 2 && parts[2] !== 'README.md') {
                    const submodule = parts[2].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    breadcrumb += ` / ${submodule}`;
                }
            } else if (parts[1] !== 'README.md') {
                const page = parts[parts.length - 1].replace('.md', '').split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                breadcrumb += ` / ${page}`;
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

        // Get breadcrumb and section
        const breadcrumb = getBreadcrumb(mdPath);
        const section = getSection(mdPath);

        // Generate HTML
        const html = createHTMLTemplate(title, mdContent, breadcrumb, section);

        // Write HTML file
        const htmlPath = mdPath.replace(/\.md$/, '.html');
        fs.writeFileSync(htmlPath, html, 'utf8');

        console.log(`✓ Converted: ${path.relative(process.cwd(), mdPath)}`);
        return htmlPath;
    } catch (error) {
        console.error(`✗ Error converting ${mdPath}:`, error.message);
        return null;
    }
}

// Function to find all .md files recursively
function findMarkdownFiles(dir, fileList = []) {
    try {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                // Skip node_modules, .git, and other special directories
                if (!file.startsWith('.') && file !== 'node_modules') {
                    findMarkdownFiles(filePath, fileList);
                }
            } else if (file.endsWith('.md')) {
                fileList.push(filePath);
            }
        });
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error.message);
    }

    return fileList;
}

// Main execution
const docsDir = '/Users/peak/Documents/GitHub/carmen/docs';
const sectionsToConvert = [
    '01-overview',
    '02-architecture',
    '03-data-model',
    '04-modules',
    '05-cross-cutting',
    '06-api-reference',
    '07-development',
    '08-reference'
];

console.log('='.repeat(60));
console.log('Carmen ERP Documentation Converter');
console.log('Converting markdown files to HTML...');
console.log('='.repeat(60));

let totalConverted = 0;
let totalErrors = 0;

sectionsToConvert.forEach(section => {
    const sectionPath = path.join(docsDir, section);
    if (fs.existsSync(sectionPath)) {
        console.log(`\n📁 Processing section: ${SECTIONS[section] || section}`);
        const mdFiles = findMarkdownFiles(sectionPath);
        console.log(`   Found ${mdFiles.length} markdown files`);

        mdFiles.forEach(mdPath => {
            const result = convertFile(mdPath);
            if (result) {
                totalConverted++;
            } else {
                totalErrors++;
            }
        });
    } else {
        console.log(`\n⚠️  Section not found: ${section}`);
    }
});

console.log('\n' + '='.repeat(60));
console.log(`Conversion complete!`);
console.log(`✓ Successfully converted: ${totalConverted} files`);
if (totalErrors > 0) {
    console.log(`✗ Errors: ${totalErrors} files`);
}
console.log('='.repeat(60));
