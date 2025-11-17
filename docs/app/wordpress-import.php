<?php
/**
 * Carmen Documentation WordPress Import Script
 *
 * This script imports all Carmen documentation into WordPress
 * Run from WordPress root or as a WordPress plugin
 *
 * Usage: php wordpress-import.php
 * Or place in WordPress and access via browser with auth
 */

// Prevent direct access for security
define('CARMEN_IMPORT_RUNNING', true);

// Try to load WordPress if not already loaded
if (!defined('ABSPATH')) {
    // Try to find wp-load.php
    $wp_load_paths = [
        __DIR__ . '/../../../../../../wp-load.php',  // If in wp-content/plugins/carmen-import/
        __DIR__ . '/../../../../../wp-load.php',     // Alternative plugin path
        __DIR__ . '/wp-load.php',                    // If running from WP root
        '/Applications/Local Sites/peak/app/public/wp-load.php', // Local by Flywheel default path
    ];

    foreach ($wp_load_paths as $path) {
        if (file_exists($path)) {
            require_once($path);
            break;
        }
    }

    if (!defined('ABSPATH')) {
        die("Error: Could not find WordPress. Please run this script from WordPress root or copy to WordPress directory.\n");
    }
}

// Configuration
$DATA_FILE = __DIR__ . '/wordpress-migration-data.json';
$BATCH_SIZE = 50; // Pages to create per batch
$DRY_RUN = false; // Set to true to test without creating pages

/**
 * Main import class
 */
class CarmenDocumentationImporter {
    private $data;
    private $stats = [
        'created' => 0,
        'updated' => 0,
        'errors' => 0,
        'skipped' => 0
    ];
    private $pageMap = []; // Map slug => page_id
    private $dryRun;

    public function __construct($dataFile, $dryRun = false) {
        $this->dryRun = $dryRun;

        if (!file_exists($dataFile)) {
            throw new Exception("Data file not found: $dataFile");
        }

        $json = file_get_contents($dataFile);
        $this->data = json_decode($json, true);

        if (!$this->data) {
            throw new Exception("Failed to parse JSON data");
        }

        $this->log("Loaded " . count($this->data['pages']) . " pages from data file");
    }

    /**
     * Run the full import
     */
    public function run() {
        $this->log("=" . str_repeat("=", 70));
        $this->log("Carmen Documentation WordPress Import");
        $this->log("=" . str_repeat("=", 70));
        $this->log("");

        if ($this->dryRun) {
            $this->log("⚠️  DRY RUN MODE - No pages will be created");
            $this->log("");
        }

        // Step 1: Create all pages (parent relationship set later)
        $this->log("Step 1: Creating pages...");
        $this->createPages();

        // Step 2: Set up parent-child relationships
        $this->log("\nStep 2: Setting up page hierarchy...");
        $this->setupHierarchy();

        // Step 3: Update internal links
        $this->log("\nStep 3: Updating internal links...");
        $this->updateLinks();

        // Print final statistics
        $this->printStats();

        return $this->stats;
    }

    /**
     * Create all pages
     */
    private function createPages() {
        $total = count($this->data['pages']);
        $created = 0;

        foreach ($this->data['pages'] as $index => $pageData) {
            $progress = ($index + 1) . "/" . $total;
            $this->log("  [{$progress}] Creating: {$pageData['title']}");

            try {
                $pageId = $this->createPage($pageData);
                if ($pageId) {
                    $this->pageMap[$pageData['slug']] = $pageId;
                    $this->stats['created']++;
                    $created++;
                }
            } catch (Exception $e) {
                $this->log("    ❌ Error: " . $e->getMessage());
                $this->stats['errors']++;
            }

            // Progress update every 10 pages
            if ($created % 10 === 0 && $created > 0) {
                $this->log("    ✓ Created $created pages so far...");
            }
        }

        $this->log("  ✅ Created {$created} pages");
    }

    /**
     * Create a single WordPress page
     */
    private function createPage($pageData) {
        if ($this->dryRun) {
            return 'dry-run-' . $pageData['slug'];
        }

        // Check if page already exists
        $existing = get_page_by_path($pageData['slug'], OBJECT, 'page');
        if ($existing) {
            $this->log("    🔄 Page exists, updating content");
            // Prepare updated content
            $content = $this->prepareContent($pageData);

            // Update existing page
            $updated = wp_update_post([
                'ID' => $existing->ID,
                'post_title' => $pageData['title'],
                'post_content' => $content
            ], true);

            if (is_wp_error($updated)) {
                throw new Exception($updated->get_error_message());
            }

            // Update custom fields
            if ($pageData['docType']) {
                update_post_meta($existing->ID, 'carmen_doc_type', $pageData['docType']);
            }
            update_post_meta($existing->ID, 'carmen_level', $pageData['level']);
            update_post_meta($existing->ID, 'carmen_source_file', $pageData['relativePath']);

            $this->stats['updated']++;
            return $existing->ID;
        }

        // Prepare page content
        $content = $this->prepareContent($pageData);

        // Create page
        $page = array(
            'post_title'    => $pageData['title'],
            'post_content'  => $content,
            'post_status'   => 'publish',
            'post_type'     => 'page',
            'post_name'     => $pageData['slug'],
            'comment_status' => 'closed',
            'ping_status'   => 'closed',
        );

        $pageId = wp_insert_post($page, true);

        if (is_wp_error($pageId)) {
            throw new Exception($pageId->get_error_message());
        }

        // Add custom fields
        if ($pageData['docType']) {
            update_post_meta($pageId, 'carmen_doc_type', $pageData['docType']);
        }
        update_post_meta($pageId, 'carmen_level', $pageData['level']);
        update_post_meta($pageId, 'carmen_source_file', $pageData['relativePath']);

        return $pageId;
    }

    /**
     * Prepare page content
     */
    private function prepareContent($pageData) {
        $content = $pageData['html'];

        // Handle Mermaid diagrams - wrap in shortcode
        $content = preg_replace_callback(
            '/<pre><code class="language-mermaid">(.*?)<\/code><\/pre>/s',
            function($matches) {
                $mermaidCode = html_entity_decode($matches[1]);
                return "[mermaid]\n{$mermaidCode}\n[/mermaid]";
            },
            $content
        );

        return $content;
    }

    /**
     * Setup parent-child page relationships
     */
    private function setupHierarchy() {
        if ($this->dryRun) {
            $this->log("  Skipping hierarchy setup in dry-run mode");
            return;
        }

        $updated = 0;

        foreach ($this->data['pages'] as $pageData) {
            if (!isset($pageData['parentPath'])) {
                continue;
            }

            // Find parent page
            $parentSlug = $this->getSlugFromPath($pageData['parentPath']);
            if (!isset($this->pageMap[$parentSlug])) {
                continue;
            }

            $pageId = $this->pageMap[$pageData['slug']] ?? null;
            $parentId = $this->pageMap[$parentSlug];

            if (!$pageId) {
                continue;
            }

            // Update page with parent
            wp_update_post([
                'ID' => $pageId,
                'post_parent' => $parentId
            ]);

            $updated++;
        }

        $this->log("  ✅ Set up hierarchy for {$updated} pages");
    }

    /**
     * Update internal links to WordPress permalinks
     */
    private function updateLinks() {
        if ($this->dryRun) {
            $this->log("  Skipping link updates in dry-run mode");
            return;
        }

        $updated = 0;

        foreach ($this->pageMap as $slug => $pageId) {
            $page = get_post($pageId);
            if (!$page) continue;

            $content = $page->post_content;
            $originalContent = $content;

            // Replace markdown-style links with WordPress permalinks
            $content = preg_replace_callback(
                '/<a href="([^"]+\.md)">/',
                function($matches) {
                    $mdPath = $matches[1];
                    $slug = $this->getSlugFromPath($mdPath);

                    if (isset($this->pageMap[$slug])) {
                        $permalink = get_permalink($this->pageMap[$slug]);
                        return '<a href="' . $permalink . '">';
                    }

                    return $matches[0]; // Keep original if no match
                },
                $content
            );

            // Only update if content changed
            if ($content !== $originalContent) {
                wp_update_post([
                    'ID' => $pageId,
                    'post_content' => $content
                ]);
                $updated++;
            }
        }

        $this->log("  ✅ Updated links in {$updated} pages");
    }

    /**
     * Get slug from markdown file path
     */
    private function getSlugFromPath($path) {
        $filename = basename($path, '.md');
        $directory = dirname($path);

        $slug = strtolower($filename);
        $slug = preg_replace('/[^a-z0-9]+/', '-', $slug);
        $slug = trim($slug, '-');

        if ($directory !== '.' && $directory !== '') {
            $dirSlug = strtolower(basename($directory));
            $dirSlug = preg_replace('/[^a-z0-9]+/', '-', $dirSlug);
            if (strpos($slug, $dirSlug) !== 0) {
                $slug = $dirSlug . '-' . $slug;
            }
        }

        return $slug;
    }

    /**
     * Print final statistics
     */
    private function printStats() {
        $this->log("");
        $this->log("=" . str_repeat("=", 70));
        $this->log("Import Complete!");
        $this->log("=" . str_repeat("=", 70));
        $this->log("Statistics:");
        $this->log("  Created:  " . $this->stats['created']);
        $this->log("  Updated:  " . $this->stats['updated']);
        $this->log("  Skipped:  " . $this->stats['skipped']);
        $this->log("  Errors:   " . $this->stats['errors']);
        $this->log("");
        $this->log("✨ Visit your WordPress site to see the imported documentation!");
        $this->log("");
    }

    /**
     * Log message
     */
    private function log($message) {
        echo $message . "\n";
        flush();
    }
}

// Run the import
try {
    $importer = new CarmenDocumentationImporter($DATA_FILE, $DRY_RUN);
    $importer->run();
} catch (Exception $e) {
    echo "❌ Fatal Error: " . $e->getMessage() . "\n";
    exit(1);
}
