#!/usr/bin/env node
/**
 * Create Vendor Management Landing Pages
 *
 * Creates main landing pages for each vendor management submodule
 * that link to all their documentation files.
 *
 * Usage: node create-vendor-landing-pages.js
 */

const API_URL = 'http://dev.blueledgers.com:3993/graphql';
const API_KEY = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGkiOjIsImdycCI6MSwiaWF0IjoxNzYzOTgyMzk4LCJleHAiOjE3OTU1Mzk5OTgsImF1ZCI6InVybjp3aWtpLmpzIiwiaXNzIjoidXJuOndpa2kuanMifQ.HxwsX-8T1uxyiqPfHxgxLYLiALvKseYOq8P9m-TBgPMLhUBt9PAkePgP9mWwg41kafe3zeXwy9AqVE-LisPMJD6kZqsQRkCmD9HyabKmBxmWNfbmDwG07c4mgXnnPqCizOkIRpYd_IYXWA4y_3NszSXaKJj4UV4sFKFlPzYwBV6YehWbyyjaa119pvl9sw9MD2PPWIvKLgm_m-CSO4epYejx1k8105OrQX2yazEVSzkaIfvUjLCiYyIJDUjJ69Lbu2888_Qj8h5C0tS7mNUn9i8h1SY3S4GZHcuLZ0lKnHOOQOl9T4vYa-4jn7GA_vRRWWo-KLx1etCWLfhG0InPUg';

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

// Define landing pages
const landingPages = [
  {
    path: 'vendor-directory',
    title: 'Vendor Directory',
    description: 'Complete documentation for the Vendor Directory module',
    content: `# Vendor Directory

Complete documentation for managing vendor information, contacts, certifications, and relationships.

## Documentation Set

### Core Specifications
- **[Business Requirements](br-vendor-directory)** - Business goals, requirements, and use cases
- **[Technical Specification](ts-vendor-directory)** - Technical architecture and implementation details
- **[Data Dictionary](dd-vendor-directory)** - Database schema and data structures

### Additional Documentation
- **[Flow Diagrams](fd-vendor-directory)** - Process flows and user journeys
- **[Use Cases](uc-vendor-directory)** - Detailed usage scenarios
- **[Validation Rules](val-vendor-directory)** - Business rules and validation logic

## Module Overview

The Vendor Directory module provides comprehensive vendor management capabilities including:

- **Vendor Profiles** - Complete vendor information management
- **Contact Management** - Multiple contacts per vendor
- **Certifications & Compliance** - Track vendor certifications and compliance documents
- **Performance Tracking** - Monitor vendor performance metrics
- **Relationship Management** - Manage vendor relationships and categories

## Quick Links

- [View in Application](/en/vendor-management/vendor-directory)
- [Back to Vendor Management Overview](vendor-management-overview)
`,
    tags: ['vendor-management', 'vendor-directory', 'documentation']
  },
  {
    path: 'pricelist-templates',
    title: 'Pricelist Templates',
    description: 'Complete documentation for the Pricelist Templates module',
    content: `# Pricelist Templates

Documentation for creating and managing reusable pricelist templates for vendor price collection.

## Documentation Set

### Core Specifications
- **[Business Requirements](br-pricelist-templates)** - Business goals, requirements, and use cases
- **[Technical Specification](ts-pricelist-templates)** - Technical architecture and implementation details
- **[Data Dictionary](dd-pricelist-templates)** - Database schema and data structures

### Additional Documentation
- **[Flow Diagrams](fd-pricelist-templates)** - Process flows and user journeys
- **[Use Cases](uc-pricelist-templates)** - Detailed usage scenarios
- **[Validation Rules](val-pricelist-templates)** - Business rules and validation logic

### Page Components
- **[Template List](pages/pc-template-list)** - Template listing interface
- **[Template Detail](pages/pc-template-detail)** - Template detail view
- **[Template Create](pages/pc-template-create)** - Template creation interface
- **[Template Distribution](pages/pc-template-distribution)** - Template distribution to vendors

## Module Overview

The Pricelist Templates module enables:

- **Template Creation** - Design reusable price collection templates
- **Product Selection** - Select products to include in templates
- **Category Management** - Organize products by categories
- **Distribution Management** - Send templates to multiple vendors
- **Response Tracking** - Monitor vendor submissions

## Quick Links

- [View in Application](/en/vendor-management/pricelist-templates)
- [Back to Vendor Management Overview](vendor-management-overview)
`,
    tags: ['vendor-management', 'pricelist-templates', 'documentation']
  },
  {
    path: 'price-lists',
    title: 'Price Lists',
    description: 'Complete documentation for the Price Lists module',
    content: `# Price Lists

Documentation for managing vendor price lists, pricing history, and price comparisons.

## Documentation Set

### Core Specifications
- **[Business Requirements](br-price-lists)** - Business goals, requirements, and use cases
- **[Technical Specification](ts-price-lists)** - Technical architecture and implementation details
- **[Data Dictionary](dd-price-lists)** - Database schema and data structures

### Additional Documentation
- **[Flow Diagrams](fd-price-lists)** - Process flows and user journeys
- **[Use Cases](uc-price-lists)** - Detailed usage scenarios
- **[Validation Rules](val-price-lists)** - Business rules and validation logic

### Page Components
- **[Pricelist List](pages/pc-pricelist-list)** - Pricelist listing interface
- **[Pricelist Detail](pages/pc-pricelist-detail)** - Pricelist detail view
- **[Pricelist Create](pages/pc-pricelist-create)** - Pricelist creation interface
- **[Price Comparison](pages/pc-pricelist-comparison)** - Multi-vendor price comparison
- **[Price History](pages/pc-pricelist-history)** - Historical price tracking
- **[Bulk Operations](pages/pc-pricelist-bulk-operations)** - Bulk update operations
- **[Price Alerts](pages/pc-pricelist-alerts)** - Price change notifications

## Module Overview

The Price Lists module provides:

- **Price Management** - Comprehensive vendor pricing management
- **Historical Tracking** - Track price changes over time
- **Multi-Vendor Comparison** - Compare prices across vendors
- **Bulk Updates** - Update multiple prices efficiently
- **Alert System** - Notifications for price changes
- **Effective Dating** - Manage price effective dates

## Quick Links

- [View in Application](/en/vendor-management/price-lists)
- [Back to Vendor Management Overview](vendor-management-overview)
`,
    tags: ['vendor-management', 'price-lists', 'documentation']
  },
  {
    path: 'requests-for-pricing',
    title: 'Requests for Pricing',
    description: 'Complete documentation for the Requests for Pricing module',
    content: `# Requests for Pricing

Documentation for creating and managing requests for pricing (RFP) from vendors.

## Documentation Set

### Core Specifications
- **[Business Requirements](br-requests-for-pricing)** - Business goals, requirements, and use cases
- **[Technical Specification](ts-requests-for-pricing)** - Technical architecture and implementation details
- **[Data Dictionary](dd-requests-for-pricing)** - Database schema and data structures

### Additional Documentation
- **[Flow Diagrams](fd-requests-for-pricing)** - Process flows and user journeys
- **[Use Cases](uc-requests-for-pricing)** - Detailed usage scenarios
- **[Validation Rules](val-requests-for-pricing)** - Business rules and validation logic

## Module Overview

The Requests for Pricing module enables:

- **RFP Creation** - Create structured price requests
- **Multi-Vendor Distribution** - Send requests to multiple vendors
- **Response Collection** - Collect and organize vendor responses
- **Comparison Analysis** - Compare vendor pricing submissions
- **Award Management** - Select winning vendors
- **Communication** - Track communication with vendors

## Quick Links

- [View in Application](/en/vendor-management/requests-for-pricing)
- [Back to Vendor Management Overview](vendor-management-overview)
`,
    tags: ['vendor-management', 'requests-for-pricing', 'documentation']
  },
  {
    path: 'vendor-portal',
    title: 'Vendor Portal',
    description: 'Complete documentation for the Vendor Portal module',
    content: `# Vendor Portal

Documentation for the vendor-facing portal where vendors can submit prices and respond to requests.

## Documentation Set

### Core Specifications
- **[Business Requirements](br-vendor-portal)** - Business goals, requirements, and use cases
- **[Technical Specification](ts-vendor-portal)** - Technical architecture and implementation details
- **[Data Dictionary](dd-vendor-portal)** - Database schema and data structures

### Additional Documentation
- **[Flow Diagrams](fd-vendor-portal)** - Process flows and user journeys
- **[Use Cases](uc-vendor-portal)** - Detailed usage scenarios
- **[Validation Rules](val-vendor-portal)** - Business rules and validation logic

### Page Components
- **[Campaign List](pages/pc-campaign-list)** - Vendor campaign listing
- **[Campaign Detail](pages/pc-campaign-detail)** - Campaign detail view
- **[Campaign Create](pages/pc-campaign-create)** - Campaign creation
- **[Template Builder](pages/pc-template-builder)** - Custom template builder
- **[Vendor Submission](pages/pc-vendor-portal-submission)** - Vendor price submission interface
- **[Submission Review](pages/pc-submission-review)** - Review vendor submissions

## Module Overview

The Vendor Portal provides:

- **Vendor Access** - Secure portal for vendor logins
- **Campaign Management** - Manage pricing campaigns
- **Template Distribution** - Send templates to vendors
- **Price Submission** - Allow vendors to submit prices
- **Communication** - Two-way communication with vendors
- **Submission Tracking** - Track vendor responses and compliance

## Quick Links

- [View in Application](/en/vendor-management/vendor-portal)
- [Back to Vendor Management Overview](vendor-management-overview)
`,
    tags: ['vendor-management', 'vendor-portal', 'documentation']
  }
];

async function createPage(pageData) {
  try {
    const variables = {
      content: pageData.content,
      description: pageData.description,
      editor: 'markdown',
      isPublished: true,
      isPrivate: false,
      locale: 'en',
      path: pageData.path,
      tags: pageData.tags,
      title: pageData.title
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        query: CREATE_PAGE_MUTATION,
        variables: variables
      })
    });

    const result = await response.json();

    if (result.errors) {
      console.error(`❌ GraphQL Error for ${pageData.path}:`, result.errors[0].message);
      return false;
    }

    const responseResult = result.data?.pages?.create?.responseResult;

    if (responseResult?.succeeded) {
      console.log(`✅ Created: ${pageData.path}`);
      return true;
    } else {
      console.error(`❌ Failed: ${pageData.path} - ${responseResult?.message}`);
      return false;
    }

  } catch (error) {
    console.error(`❌ Error creating ${pageData.path}:`, error.message);
    return false;
  }
}

async function createAllPages() {
  console.log('🔧 Creating Vendor Management landing pages...');
  console.log(`Total pages to create: ${landingPages.length}\n`);

  let successCount = 0;
  let failCount = 0;

  for (const page of landingPages) {
    const success = await createPage(page);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 CREATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully created: ${successCount} pages`);
  console.log(`❌ Failed: ${failCount} pages`);
  console.log('');

  if (successCount > 0) {
    console.log('🎉 Landing pages created successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('   1. Run the navigation update script to link to these pages');
    console.log('   2. Verify the pages load correctly in Wiki.js');
    console.log('   3. Check that all documentation links work');
  }
}

// Run the creation
createAllPages();
