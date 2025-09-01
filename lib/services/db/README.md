# Database Services

This directory contains database services that integrate database operations with calculation services for comprehensive data management.

## Vendor Service

The `VendorService` provides complete CRUD operations for vendor management with integrated performance metrics calculations.

### Features

- **Complete CRUD Operations**: Create, read, update, and delete vendors
- **Advanced Filtering**: Search by status, business type, currency, and more
- **Performance Metrics**: Integrated calculation of vendor performance metrics
- **Pagination Support**: Built-in pagination with sorting options
- **Type Safety**: Full TypeScript support with proper error handling
- **Database Integration**: Uses Prisma client with connection pooling

### Quick Start

```typescript
import { vendorService } from '@/lib/services/db/vendor-service'

// Get all active vendors
const result = await vendorService.getVendors({
  status: ['active'],
  businessType: ['manufacturer', 'distributor']
})

if (result.success) {
  console.log('Vendors:', result.data)
  console.log('Total:', result.metadata.total)
}

// Get vendor with metrics
const vendor = await vendorService.getVendorById('vendor-id')
if (vendor.success) {
  console.log('On-time delivery:', vendor.data.onTimeDeliveryRate)
}

// Create new vendor
const newVendor = await vendorService.createVendor({
  name: 'New Vendor Ltd',
  contactEmail: 'contact@vendor.com',
  businessType: 'manufacturer',
  createdBy: 'user-id'
})
```

### API Integration

The vendor service is exposed via REST API endpoints:

#### Endpoints

- `GET /api/vendors` - List vendors with filtering and pagination
- `POST /api/vendors` - Create new vendor
- `GET /api/vendors/[id]` - Get vendor by ID with metrics
- `PUT /api/vendors/[id]` - Update vendor
- `DELETE /api/vendors/[id]` - Soft delete vendor
- `GET /api/vendors/[id]/metrics` - Get detailed performance metrics
- `PUT /api/vendors/[id]/metrics` - Update vendor metrics
- `GET /api/vendors/stats` - Get vendor statistics

#### Example API Usage

```bash
# List active vendors with pagination
curl "http://localhost:3000/api/vendors?status=active&page=1&limit=10"

# Get vendor with metrics
curl "http://localhost:3000/api/vendors/123e4567-e89b-12d3-a456-426614174000"

# Create new vendor
curl -X POST "http://localhost:3000/api/vendors" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Vendor Ltd",
    "contactEmail": "contact@vendor.com",
    "businessType": "manufacturer",
    "createdBy": "user-123"
  }'

# Get vendor statistics
curl "http://localhost:3000/api/vendors/stats"
```

### Data Transformation

The service automatically transforms between database and application formats:

#### Database Format (PostgreSQL)
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    -- address fields
    status vendor_status DEFAULT 'active',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    -- other fields...
);
```

#### Application Format (TypeScript)
```typescript
interface Vendor {
  id: string
  vendorCode: string
  companyName: string
  businessType: VendorBusinessType
  status: VendorStatus
  addresses: VendorAddress[]
  contacts: VendorContact[]
  // performance metrics
  onTimeDeliveryRate?: number
  qualityRating?: number
  priceCompetitiveness?: number
  // audit trail
  createdAt: Date
  updatedAt: Date
}
```

### Performance Metrics Integration

The service integrates with the `VendorMetrics` calculation service to provide:

- **Delivery Performance**: On-time delivery rates, average delivery times
- **Quality Metrics**: Quality ratings, defect rates, rejection rates
- **Financial Metrics**: Price competitiveness, cost savings
- **Reliability Metrics**: Order fulfillment rates, communication scores
- **Overall Rating**: Weighted performance score (0-5 scale)
- **Risk Assessment**: Risk score based on performance indicators

### Error Handling

All service methods return a consistent result format:

```typescript
interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}
```

### Filtering Options

The `getVendors` method supports comprehensive filtering:

```typescript
interface VendorFilters {
  status?: VendorStatus[]              // Filter by status
  businessType?: VendorBusinessType[]  // Filter by business type
  search?: string                      // Search in name, email, registration
  preferredCurrency?: string[]         // Filter by currency
  hasMetrics?: boolean                 // Include/exclude metrics
  createdAfter?: Date                  // Created after date
  createdBefore?: Date                 // Created before date
}
```

### Pagination Options

```typescript
interface PaginationOptions {
  page?: number                        // Page number (1-based)
  limit?: number                       // Items per page (1-100)
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'status'
  sortOrder?: 'asc' | 'desc'
}
```

### Testing

Run the test suite:

```bash
npm test lib/services/db/__tests__/vendor-service.test.ts
```

The tests cover:
- CRUD operations
- Filtering and pagination
- Error handling
- Data transformation
- Metrics integration

### Database Schema

The service works with the following database tables:

- `vendors` - Main vendor information
- `vendor_metrics` - Performance metrics (separate for performance)
- Related tables for addresses, contacts, certifications, etc.

### Future Enhancements

Planned improvements:
- Vendor address and contact management
- Vendor certification tracking
- Contract management integration
- Advanced analytics and reporting
- Bulk operations support
- Real-time metrics updates

### Dependencies

- `@prisma/client` - Database ORM
- `zod` - Schema validation
- `@/lib/types` - TypeScript interfaces
- `@/lib/services/calculations` - Calculation services

### Configuration

Environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)

The service uses connection pooling and graceful shutdown handling for production environments.