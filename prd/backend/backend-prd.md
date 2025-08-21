# Carmen Backend Architecture PRD

## Document Information

| **Attribute**     | **Value**                           |
|-------------------|-------------------------------------|
| **Document Type** | Backend Architecture PRD            |
| **Version**       | 1.0.0                              |
| **Date**          | January 2025                       |
| **Status**        | Draft                              |
| **Owner**         | Backend Team                       |

---

## Executive Summary

The Carmen Hospitality System backend is built on a modern microservices architecture using NestJS, PostgreSQL, and Keycloak for identity management. This cloud-native approach ensures scalability, maintainability, and enterprise-grade security while supporting the complex workflows of hospitality supply chain management.

---

## Technology Stack

### Core Framework
- **NestJS** (Latest) - Scalable Node.js framework
- **TypeScript 5+** - Type-safe development
- **Node.js 20+ LTS** - Runtime environment
- **Express/Fastify** - HTTP server (configurable)

### Database & ORM
- **PostgreSQL 15+** - Primary database
- **Prisma 5+** - Type-safe ORM
- **Redis 7+** - Caching and session storage
- **Database per Service** - Microservices pattern

### Authentication & Authorization
- **Keycloak** (Latest) - Identity and Access Management
- **JWT (RS256)** - Token-based authentication
- **OAuth 2.0 / OpenID Connect** - Standard protocols
- **RBAC/ABAC** - Role and attribute-based access

### Message Queue & Events
- **RabbitMQ** - Message broker
- **Apache Kafka** - Event streaming (optional)
- **Event-driven architecture** - Microservices communication
- **CQRS pattern** - Command Query Responsibility Segregation

### API & Documentation
- **Swagger/OpenAPI 3.1** - API documentation
- **REST APIs** - Primary interface
- **GraphQL** - Optional for complex queries
- **gRPC** - Service-to-service communication

### Validation & Schema
- **Zod** - Runtime type validation
- **Class Validator** - DTO validation
- **Shared schemas** - Frontend/backend consistency
- **JSON Schema** - API documentation

### Monitoring & Logging
- **Winston** - Structured logging
- **Prometheus** - Metrics collection
- **OpenTelemetry** - Distributed tracing
- **Health checks** - Service monitoring

---

## Microservices Architecture

### Service Decomposition

#### Core Services

**1. Authentication Service**
```typescript
// Purpose: User authentication and session management
// Database: Keycloak PostgreSQL
// Endpoints:
//   - POST /auth/login
//   - POST /auth/refresh
//   - POST /auth/logout
//   - GET /auth/profile
```

**2. User Service**
```typescript
// Purpose: User profile and preference management
// Database: users_db
// Endpoints:
//   - GET /users
//   - POST /users
//   - PUT /users/:id
//   - DELETE /users/:id
```

**3. Procurement Service**
```typescript
// Purpose: Purchase requests, orders, and approvals
// Database: procurement_db
// Endpoints:
//   - /purchase-requests/*
//   - /purchase-orders/*
//   - /goods-received-notes/*
//   - /credit-notes/*
//   - /approvals/*
```

**4. Inventory Service**
```typescript
// Purpose: Stock management and tracking
// Database: inventory_db
// Endpoints:
//   - /inventory/items
//   - /inventory/adjustments
//   - /inventory/movements
//   - /inventory/counts
//   - /inventory/locations
```

**5. Vendor Service**
```typescript
// Purpose: Vendor management and relationships
// Database: vendor_db
// Endpoints:
//   - /vendors
//   - /pricelists
//   - /campaigns
//   - /contracts
//   - /vendor-portal
```

**6. Product Service**
```typescript
// Purpose: Product catalog and specifications
// Database: product_db
// Endpoints:
//   - /products
//   - /categories
//   - /units
//   - /specifications
//   - /attributes
```

**7. Recipe Service**
```typescript
// Purpose: Recipe and menu management
// Database: recipe_db
// Endpoints:
//   - /recipes
//   - /ingredients
//   - /menus
//   - /costing
//   - /nutrition
```

**8. Integration Service**
```typescript
// Purpose: External system integrations
// Database: integration_db
// Endpoints:
//   - /pos/sync
//   - /accounting/export
//   - /payment/process
//   - /webhooks
```

**9. Notification Service**
```typescript
// Purpose: Email, SMS, and push notifications
// Database: notification_db
// Endpoints:
//   - /notifications/email
//   - /notifications/sms
//   - /notifications/push
//   - /templates
```

**10. PDF Service**
```typescript
// Purpose: Document generation and management
// Database: pdf_db
// Endpoints:
//   - /pdf/generate
//   - /pdf/templates
//   - /pdf/storage
//   - /pdf/batch
```

#### Supporting Services

**API Gateway**
```typescript
// Purpose: Request routing, authentication, rate limiting
// Technology: Kong, Traefik, or custom NestJS gateway
// Features:
//   - JWT validation
//   - Request/response transformation
//   - Circuit breaker
//   - Load balancing
```

**Config Service**
```typescript
// Purpose: Centralized configuration management
// Database: config_db
// Features:
//   - Environment-specific configs
//   - Feature flags
//   - A/B testing
//   - Hot reloading
```

---

## NestJS Implementation Patterns

### Module Architecture

#### Core Module Structure
```typescript
// src/procurement/procurement.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseRequest, PurchaseOrder]),
    EventEmitterModule,
    BullModule.registerQueue({
      name: 'procurement-queue',
    }),
  ],
  controllers: [
    PurchaseRequestController,
    PurchaseOrderController,
  ],
  providers: [
    PurchaseRequestService,
    PurchaseOrderService,
    ProcurementEventHandler,
  ],
  exports: [PurchaseRequestService],
})
export class ProcurementModule {}
```

#### Dependency Injection
```typescript
// src/procurement/services/purchase-request.service.ts
@Injectable()
export class PurchaseRequestService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private prRepository: Repository<PurchaseRequest>,
    private eventEmitter: EventEmitter2,
    private configService: ConfigService,
    @Inject('VENDOR_SERVICE') private vendorService: VendorService,
  ) {}

  async createPurchaseRequest(
    data: CreatePurchaseRequestDto,
    user: AuthenticatedUser
  ): Promise<PurchaseRequest> {
    // Business logic
    const pr = this.prRepository.create({
      ...data,
      createdBy: user.id,
      status: PRStatus.DRAFT,
    });

    const savedPR = await this.prRepository.save(pr);

    // Emit event for other services
    this.eventEmitter.emit('purchase-request.created', {
      purchaseRequestId: savedPR.id,
      userId: user.id,
    });

    return savedPR;
  }
}
```

### Authentication & Authorization

#### JWT Guard
```typescript
// src/auth/guards/jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'IS_PUBLIC_KEY',
      [context.getHandler(), context.getClass()]
    );
    
    if (isPublic) {
      return true;
    }
    
    return super.canActivate(context);
  }
}
```

#### Role-Based Authorization
```typescript
// src/auth/decorators/roles.decorator.ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);

// src/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}
```

#### Permission-Based Authorization
```typescript
// src/auth/decorators/permissions.decorator.ts
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata('permissions', permissions);

// Usage in controller
@Controller('purchase-requests')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseRequestController {
  @Post()
  @RequirePermissions('procurement:create')
  async create(@Body() data: CreatePurchaseRequestDto) {
    return this.prService.create(data);
  }

  @Put(':id/approve')
  @RequirePermissions('procurement:approve')
  async approve(@Param('id') id: string) {
    return this.prService.approve(id);
  }
}
```

### Data Validation

#### Zod Schema Integration
```typescript
// src/procurement/schemas/purchase-request.schema.ts
export const createPurchaseRequestSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID'),
  requestedBy: z.string().min(1, 'Requester is required'),
  requestDate: z.coerce.date(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Price cannot be negative'),
    notes: z.string().optional(),
  })).min(1, 'At least one item is required'),
  justification: z.string().min(10, 'Justification must be at least 10 characters'),
});

export type CreatePurchaseRequestDto = z.infer<typeof createPurchaseRequestSchema>;
```

#### Validation Pipe
```typescript
// src/common/pipes/zod-validation.pipe.ts
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }
}

// Usage
@Post()
@UsePipes(new ZodValidationPipe(createPurchaseRequestSchema))
async create(@Body() data: CreatePurchaseRequestDto) {
  return this.prService.create(data);
}
```

---

## Database Architecture

### Database per Service Pattern

#### Service Database Mapping
```yaml
# Database allocation per service
services:
  auth-service:
    database: keycloak_db
    description: "Keycloak managed database"
    
  user-service:
    database: users_db
    tables: [user_profiles, user_preferences, user_sessions]
    
  procurement-service:
    database: procurement_db
    tables: [purchase_requests, purchase_orders, grn, credit_notes, approvals]
    
  inventory-service:
    database: inventory_db
    tables: [inventory_items, stock_movements, adjustments, locations]
    
  vendor-service:
    database: vendor_db
    tables: [vendors, pricelists, campaigns, contracts, vendor_users]
    
  product-service:
    database: product_db
    tables: [products, categories, units, specifications, attributes]
```

### Prisma Schema Examples

#### Procurement Service Schema
```prisma
// prisma/schema.prisma (Procurement Service)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("PROCUREMENT_DATABASE_URL")
}

model PurchaseRequest {
  id            String   @id @default(uuid())
  number        String   @unique
  departmentId  String
  requestedBy   String
  requestDate   DateTime
  status        PRStatus @default(DRAFT)
  totalAmount   Decimal  @db.Decimal(10,2)
  
  items         PRItem[]
  approvals     Approval[]
  purchaseOrders PurchaseOrder[]
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String
  
  @@map("purchase_requests")
}

model PRItem {
  id              String   @id @default(uuid())
  purchaseRequestId String
  productId       String
  quantity        Int
  unitPrice       Decimal  @db.Decimal(10,2)
  totalAmount     Decimal  @db.Decimal(10,2)
  notes           String?
  
  purchaseRequest PurchaseRequest @relation(fields: [purchaseRequestId], references: [id])
  
  @@map("pr_items")
}

model Approval {
  id                String   @id @default(uuid())
  purchaseRequestId String
  approverId        String
  level             Int
  status            ApprovalStatus
  comments          String?
  approvedAt        DateTime?
  
  purchaseRequest   PurchaseRequest @relation(fields: [purchaseRequestId], references: [id])
  
  @@map("approvals")
}

enum PRStatus {
  DRAFT
  SUBMITTED
  PENDING_APPROVAL
  APPROVED
  REJECTED
  CANCELLED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
}
```

#### Inventory Service Schema
```prisma
// prisma/schema.prisma (Inventory Service)
model InventoryItem {
  id                String   @id @default(uuid())
  productId         String
  locationId        String
  currentStock      Int      @default(0)
  reservedStock     Int      @default(0)
  availableStock    Int      @default(0)
  unitCost          Decimal  @db.Decimal(10,4)
  totalValue        Decimal  @db.Decimal(10,2)
  
  movements         StockMovement[]
  adjustments       StockAdjustment[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@unique([productId, locationId])
  @@map("inventory_items")
}

model StockMovement {
  id              String   @id @default(uuid())
  inventoryItemId String
  type            MovementType
  quantity        Int
  unitCost        Decimal  @db.Decimal(10,4)
  totalValue      Decimal  @db.Decimal(10,2)
  referenceType   String?  // 'PO', 'GRN', 'ADJUSTMENT'
  referenceId     String?
  
  inventoryItem   InventoryItem @relation(fields: [inventoryItemId], references: [id])
  
  createdAt       DateTime @default(now())
  createdBy       String
  
  @@map("stock_movements")
}

enum MovementType {
  IN
  OUT
  ADJUSTMENT
  TRANSFER
}
```

### Migration Strategy

#### Database Migration Workflow
```typescript
// scripts/migrate.ts
import { PrismaClient } from '@prisma/client';

export class MigrationService {
  private prisma = new PrismaClient();

  async runMigrations(service: string) {
    console.log(`Running migrations for ${service} service...`);
    
    try {
      // Deploy migrations
      await this.prisma.$executeRaw`SELECT 1`; // Health check
      
      // Run custom business logic migrations
      await this.migrateBusinessData(service);
      
      console.log(`Migrations completed for ${service}`);
    } catch (error) {
      console.error(`Migration failed for ${service}:`, error);
      throw error;
    }
  }

  private async migrateBusinessData(service: string) {
    // Service-specific data migrations
    switch (service) {
      case 'procurement':
        await this.migrateProcurementData();
        break;
      case 'inventory':
        await this.migrateInventoryData();
        break;
      // ... other services
    }
  }
}
```

---

## Event-Driven Architecture

### Event Bus Implementation

#### Event Emitter Setup
```typescript
// src/common/events/event-emitter.module.ts
@Module({
  imports: [
    EventEmitterModule.forRoot({
      delimiter: '.',
      maxListeners: 10,
      verboseMemoryLeak: false,
    }),
  ],
  exports: [EventEmitterModule],
})
export class CustomEventEmitterModule {}
```

#### Domain Events
```typescript
// src/procurement/events/purchase-request.events.ts
export class PurchaseRequestCreatedEvent {
  constructor(
    public readonly purchaseRequestId: string,
    public readonly departmentId: string,
    public readonly totalAmount: number,
    public readonly createdBy: string,
  ) {}
}

export class PurchaseRequestApprovedEvent {
  constructor(
    public readonly purchaseRequestId: string,
    public readonly approvedBy: string,
    public readonly approvedAt: Date,
  ) {}
}
```

#### Event Handlers
```typescript
// src/inventory/handlers/procurement.handler.ts
@Injectable()
export class ProcurementEventHandler {
  constructor(
    private inventoryService: InventoryService,
    private logger: Logger,
  ) {}

  @OnEvent('purchase-request.approved')
  async handlePurchaseRequestApproved(
    event: PurchaseRequestApprovedEvent
  ) {
    this.logger.log(`Handling PR approved: ${event.purchaseRequestId}`);
    
    // Reserve inventory for approved PR
    await this.inventoryService.reserveInventoryForPR(
      event.purchaseRequestId
    );
  }

  @OnEvent('goods-received-note.created')
  async handleGoodsReceived(event: GoodsReceivedEvent) {
    // Update inventory levels
    await this.inventoryService.receiveGoods(event.items);
  }
}
```

### Message Queue Integration

#### Bull Queue Setup
```typescript
// src/common/queue/queue.module.ts
@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
    }),
    BullModule.registerQueue(
      { name: 'email-queue' },
      { name: 'pdf-queue' },
      { name: 'sync-queue' },
    ),
  ],
})
export class QueueModule {}
```

#### Job Processors
```typescript
// src/notification/processors/email.processor.ts
@Processor('email-queue')
export class EmailProcessor {
  private readonly logger = new Logger(EmailProcessor.name);

  @Process('send-email')
  async handleSendEmail(job: Job<EmailJobData>) {
    this.logger.debug(`Processing email job ${job.id}`);
    
    const { to, subject, template, data } = job.data;
    
    try {
      await this.emailService.sendEmail({
        to,
        subject,
        html: await this.templateService.render(template, data),
      });
      
      this.logger.log(`Email sent successfully to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  @Process('bulk-email')
  async handleBulkEmail(job: Job<BulkEmailJobData>) {
    const { recipients, template, data } = job.data;
    
    for (const recipient of recipients) {
      await this.emailService.sendEmail({
        to: recipient.email,
        subject: data.subject,
        html: await this.templateService.render(template, {
          ...data,
          recipientName: recipient.name,
        }),
      });
    }
  }
}
```

---

## API Design & Documentation

### Swagger Configuration

#### OpenAPI Setup
```typescript
// src/main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Carmen Hospitality API')
    .setDescription('Comprehensive hospitality supply chain management API')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and authorization')
    .addTag('Procurement', 'Purchase requests, orders, and approvals')
    .addTag('Inventory', 'Stock management and tracking')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(3000);
}
```

#### API Decorators
```typescript
// src/procurement/controllers/purchase-request.controller.ts
@ApiTags('Procurement')
@Controller('purchase-requests')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PurchaseRequestController {
  @Post()
  @ApiOperation({ summary: 'Create a new purchase request' })
  @ApiResponse({
    status: 201,
    description: 'Purchase request created successfully',
    type: PurchaseRequestResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async create(
    @Body() data: CreatePurchaseRequestDto,
    @User() user: AuthenticatedUser,
  ): Promise<PurchaseRequestResponseDto> {
    return this.prService.create(data, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get purchase requests with filtering' })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: PRStatus,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'departmentId',
    required: false,
    description: 'Filter by department',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findAll(
    @Query() query: GetPurchaseRequestsQuery,
  ): Promise<PaginatedResponse<PurchaseRequestResponseDto>> {
    return this.prService.findAll(query);
  }
}
```

### Response DTOs

#### Standard Response Format
```typescript
// src/common/dto/response.dto.ts
export class BaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedResponse<T> {
  @ApiProperty()
  data: T[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ErrorResponse {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  details?: any;
}
```

---

## Security Implementation

### Keycloak Integration

#### Keycloak Strategy
```typescript
// src/auth/strategies/keycloak.strategy.ts
@Injectable()
export class KeycloakStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: async (request, rawJwtToken, done) => {
        try {
          const decodedToken = jwt.decode(rawJwtToken, { complete: true });
          const kid = decodedToken.header.kid;
          
          const publicKey = await this.getPublicKey(kid);
          done(null, publicKey);
        } catch (error) {
          done(error, null);
        }
      },
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any): Promise<AuthenticatedUser> {
    return {
      id: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: payload.realm_access?.roles || [],
      permissions: payload.resource_access?.['carmen-backend']?.roles || [],
      tenantId: payload.tenant_id,
    };
  }

  private async getPublicKey(kid: string): Promise<string> {
    // Fetch public key from Keycloak JWKS endpoint
    const jwksUri = `${this.configService.get('KEYCLOAK_URL')}/realms/${this.configService.get('KEYCLOAK_REALM')}/protocol/openid_connect/certs`;
    
    // Implementation to fetch and cache public keys
    return this.keyCache.getPublicKey(kid, jwksUri);
  }
}
```

#### Service-to-Service Authentication
```typescript
// src/common/services/keycloak-admin.service.ts
@Injectable()
export class KeycloakAdminService {
  private adminClient: KcAdminClient;

  constructor(private configService: ConfigService) {
    this.adminClient = new KcAdminClient({
      baseUrl: this.configService.get('KEYCLOAK_URL'),
      realmName: this.configService.get('KEYCLOAK_REALM'),
    });
  }

  async authenticate(): Promise<void> {
    await this.adminClient.auth({
      grantType: 'client_credentials',
      clientId: this.configService.get('KEYCLOAK_CLIENT_ID'),
      clientSecret: this.configService.get('KEYCLOAK_CLIENT_SECRET'),
    });
  }

  async createUser(userData: CreateUserData): Promise<string> {
    await this.authenticate();
    
    const user = await this.adminClient.users.create({
      username: userData.username,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      enabled: true,
      credentials: [{
        type: 'password',
        value: userData.temporaryPassword,
        temporary: true,
      }],
    });

    return user.id;
  }

  async assignRole(userId: string, roleName: string): Promise<void> {
    await this.authenticate();
    
    const role = await this.adminClient.roles.findOneByName({
      name: roleName,
    });

    if (role) {
      await this.adminClient.users.addRealmRoleMappings({
        id: userId,
        roles: [{ id: role.id, name: role.name }],
      });
    }
  }
}
```

### Data Protection

#### Encryption at Rest
```typescript
// src/common/encryption/field-encryption.service.ts
@Injectable()
export class FieldEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    this.key = Buffer.from(
      this.configService.get('ENCRYPTION_KEY'), 
      'hex'
    );
  }

  encrypt(text: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.key);
    cipher.setAAD(Buffer.from('carmen-hospitality', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
    };
  }

  decrypt(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    const decipher = crypto.createDecipher(this.algorithm, this.key);
    decipher.setAAD(Buffer.from('carmen-hospitality', 'utf8'));
    decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

#### Audit Logging
```typescript
// src/common/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    private prisma: PrismaService,
    private logger: Logger,
  ) {}

  async logAction(
    action: AuditAction,
    user: AuthenticatedUser,
    resource: string,
    resourceId?: string,
    metadata?: any,
  ): Promise<void> {
    const auditLog = {
      action,
      userId: user.id,
      username: user.username,
      resource,
      resourceId,
      metadata: metadata ? JSON.stringify(metadata) : null,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      timestamp: new Date(),
    };

    try {
      await this.prisma.auditLog.create({ data: auditLog });
    } catch (error) {
      this.logger.error('Failed to log audit action:', error);
      // Don't throw - audit logging shouldn't break business logic
    }
  }

  @OnEvent('*')
  async handleAllEvents(event: any): Promise<void> {
    // Automatically log domain events
    if (this.shouldLogEvent(event)) {
      await this.logDomainEvent(event);
    }
  }
}

// Usage with decorator
export function Audit(action: AuditAction, resource: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const auditService = this.auditService; // Injected service
      const user = this.getCurrentUser(); // Get from context
      
      try {
        const result = await method.apply(this, args);
        
        await auditService.logAction(
          action,
          user,
          resource,
          result?.id,
          { input: args[0] },
        );
        
        return result;
      } catch (error) {
        await auditService.logAction(
          action + '_FAILED',
          user,
          resource,
          null,
          { error: error.message },
        );
        throw error;
      }
    };
  };
}
```

---

## PDF Generation Service

### Server-side PDF Architecture

#### PDF Service Implementation
```typescript
// src/pdf/pdf.service.ts
@Injectable()
export class PDFService {
  constructor(
    @InjectQueue('pdf-queue') private pdfQueue: Queue,
    private storageService: StorageService,
    private templateService: TemplateService,
  ) {}

  async generatePDF(
    templateName: string,
    data: any,
    options: PDFOptions = {}
  ): Promise<{ pdfUrl: string; pdfId: string }> {
    const pdfId = uuidv4();
    
    if (options.async) {
      // Queue for background processing
      await this.pdfQueue.add('generate-pdf', {
        pdfId,
        templateName,
        data,
        options,
      });
      
      return { pdfId, pdfUrl: `/api/pdf/${pdfId}/status` };
    }
    
    // Synchronous generation
    const pdf = await this.generatePDFDocument(templateName, data, options);
    const pdfUrl = await this.storageService.store(pdf, `${pdfId}.pdf`);
    
    return { pdfId, pdfUrl };
  }

  private async generatePDFDocument(
    templateName: string,
    data: any,
    options: PDFOptions
  ): Promise<Buffer> {
    const template = await this.templateService.getTemplate(templateName);
    const ReactPDFComponent = await this.templateService.renderTemplate(
      template,
      data
    );
    
    return pdf(ReactPDFComponent).toBuffer();
  }

  async generateBatch(requests: PDFBatchRequest[]): Promise<string> {
    const batchId = uuidv4();
    
    await this.pdfQueue.add('generate-batch', {
      batchId,
      requests,
    });
    
    return batchId;
  }
}
```

#### PDF Templates
```typescript
// src/pdf/templates/purchase-order.template.tsx
export const PurchaseOrderTemplate: React.FC<{ data: PurchaseOrderData }> = ({ data }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Purchase Order</Text>
          <Text style={styles.subtitle}>#{data.number}</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vendor Information</Text>
          <Text>Company: {data.vendor.name}</Text>
          <Text>Address: {data.vendor.address}</Text>
          <Text>Phone: {data.vendor.phone}</Text>
        </View>
        
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Item</Text>
            <Text style={styles.tableHeaderCell}>Qty</Text>
            <Text style={styles.tableHeaderCell}>Unit Price</Text>
            <Text style={styles.tableHeaderCell}>Total</Text>
          </View>
          
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.product.name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.tableCell}>{formatCurrency(item.totalPrice)}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.total}>
            Grand Total: {formatCurrency(data.totalAmount)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
```

#### PDF Queue Processor
```typescript
// src/pdf/processors/pdf.processor.ts
@Processor('pdf-queue')
export class PDFProcessor {
  constructor(
    private pdfService: PDFService,
    private notificationService: NotificationService,
  ) {}

  @Process('generate-pdf')
  async handlePDFGeneration(job: Job<PDFJobData>) {
    const { pdfId, templateName, data, options } = job.data;
    
    try {
      await job.progress(10);
      
      const pdf = await this.pdfService.generatePDFDocument(
        templateName, 
        data, 
        options
      );
      
      await job.progress(80);
      
      const pdfUrl = await this.storageService.store(pdf, `${pdfId}.pdf`);
      
      await job.progress(100);
      
      // Notify completion
      await this.notificationService.notifyPDFReady(
        data.userId,
        pdfId,
        pdfUrl
      );
      
    } catch (error) {
      throw new Error(`PDF generation failed: ${error.message}`);
    }
  }

  @Process('generate-batch')
  async handleBatchPDFGeneration(job: Job<PDFBatchJobData>) {
    const { batchId, requests } = job.data;
    const totalRequests = requests.length;
    
    for (let i = 0; i < totalRequests; i++) {
      const request = requests[i];
      
      try {
        await this.pdfService.generatePDFDocument(
          request.templateName,
          request.data,
          request.options
        );
        
        await job.progress((i + 1) / totalRequests * 100);
        
      } catch (error) {
        console.error(`Failed to generate PDF for request ${i}:`, error);
      }
    }
  }
}
```

---

## Performance & Caching

### Redis Caching Strategy

#### Cache Service
```typescript
// src/common/cache/cache.service.ts
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | null> {
    return this.cacheManager.get(key);
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.cacheManager.store.keys(pattern);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }

  // Cache with automatic JSON serialization
  async getJSON<T>(key: string): Promise<T | null> {
    const cached = await this.get<string>(key);
    return cached ? JSON.parse(cached) : null;
  }

  async setJSON<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.set(key, JSON.stringify(value), ttl);
  }
}
```

#### Cache Decorators
```typescript
// src/common/decorators/cache.decorator.ts
export function Cacheable(keyPrefix: string, ttl: number = 3600) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService: CacheService = this.cacheService;
      const cacheKey = `${keyPrefix}:${JSON.stringify(args)}`;
      
      // Check cache first
      const cached = await cacheService.getJSON(cacheKey);
      if (cached) {
        return cached;
      }
      
      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.setJSON(cacheKey, result, ttl);
      
      return result;
    };
  };
}

// Usage
@Injectable()
export class VendorService {
  @Cacheable('vendor-pricelists', 1800) // 30 minutes
  async getVendorPricelists(vendorId: string): Promise<Pricelist[]> {
    return this.prisma.pricelist.findMany({
      where: { vendorId },
      include: { items: true },
    });
  }
}
```

### Database Optimization

#### Query Optimization
```typescript
// src/common/services/query-optimization.service.ts
@Injectable()
export class QueryOptimizationService {
  constructor(private prisma: PrismaService) {}

  // Optimized pagination with cursor-based pagination
  async getPaginatedResults<T>(
    model: any,
    cursor?: string,
    take: number = 10,
    where?: any,
    include?: any
  ): Promise<{ data: T[]; nextCursor?: string; hasMore: boolean }> {
    const results = await model.findMany({
      take: take + 1, // Get one extra to check if there are more
      cursor: cursor ? { id: cursor } : undefined,
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = results.length > take;
    const data = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { data, nextCursor, hasMore };
  }

  // Optimized aggregation queries
  async getInventoryStats(locationId?: string) {
    return this.prisma.inventoryItem.aggregate({
      where: locationId ? { locationId } : undefined,
      _sum: {
        currentStock: true,
        totalValue: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        unitCost: true,
      },
    });
  }

  // Batch operations for better performance
  async batchUpdateInventory(updates: InventoryUpdate[]): Promise<void> {
    const batches = this.chunkArray(updates, 100);
    
    for (const batch of batches) {
      await this.prisma.$transaction(
        batch.map(update =>
          this.prisma.inventoryItem.update({
            where: { id: update.id },
            data: update.data,
          })
        )
      );
    }
  }

  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
```

---

## Monitoring & Health Checks

### Health Check Implementation
```typescript
// src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.checkHealth('redis'),
      () => this.checkKeycloak(),
      () => this.checkExternalServices(),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.checkMigrations(),
    ]);
  }

  private async checkKeycloak(): Promise<HealthIndicatorResult> {
    try {
      const response = await fetch(
        `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}`
      );
      
      if (response.ok) {
        return { keycloak: { status: 'up' } };
      }
      throw new Error('Keycloak not responding');
    } catch (error) {
      return { keycloak: { status: 'down', error: error.message } };
    }
  }
}
```

### Logging Configuration
```typescript
// src/common/logging/logger.service.ts
@Injectable()
export class LoggerService extends Logger {
  private winston: winston.Logger;

  constructor() {
    super();
    this.winston = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      defaultMeta: {
        service: 'carmen-backend',
        version: process.env.APP_VERSION,
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.winston.info(message, { context, ...meta });
    super.log(message, context);
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.winston.error(message, { trace, context, ...meta });
    super.error(message, trace, context);
  }

  warn(message: string, context?: string, meta?: any) {
    this.winston.warn(message, { context, ...meta });
    super.warn(message, context);
  }

  debug(message: string, context?: string, meta?: any) {
    this.winston.debug(message, { context, ...meta });
    super.debug(message, context);
  }
}
```

---

## Deployment & DevOps

### Docker Configuration

#### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy built application and dependencies
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

#### Docker Compose for Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Backend services
  api-gateway:
    build: ./api-gateway
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://carmen:password@postgres:5432/carmen_gateway
    depends_on:
      - postgres
      - redis
      - keycloak

  procurement-service:
    build: ./services/procurement
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://carmen:password@postgres:5432/carmen_procurement
    depends_on:
      - postgres
      - redis

  inventory-service:
    build: ./services/inventory
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://carmen:password@postgres:5432/carmen_inventory
    depends_on:
      - postgres
      - redis

  # Infrastructure
  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=carmen
      - POSTGRES_PASSWORD=password
      - POSTGRES_MULTIPLE_DATABASES=carmen_gateway,carmen_procurement,carmen_inventory,keycloak
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/create-multiple-databases.sh:/docker-entrypoint-initdb.d/create-multiple-databases.sh
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://postgres:5432/keycloak
      - KC_DB_USERNAME=carmen
      - KC_DB_PASSWORD=password
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    command: start-dev

  # Message Queue
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      - RABBITMQ_DEFAULT_USER=carmen
      - RABBITMQ_DEFAULT_PASS=password
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:
```

### Kubernetes Deployment

#### Service Deployment
```yaml
# k8s/procurement-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: procurement-service
  labels:
    app: procurement-service
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: procurement-service
  template:
    metadata:
      labels:
        app: procurement-service
        version: v1
    spec:
      containers:
      - name: procurement-service
        image: carmen/procurement-service:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: procurement-db-secret
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: redis-url
        - name: KEYCLOAK_URL
          value: "http://keycloak-service:8080"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: procurement-service
spec:
  selector:
    app: procurement-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
```

---

## Testing Strategy

### Unit Testing

#### Service Testing
```typescript
// src/procurement/services/__tests__/purchase-request.service.spec.ts
describe('PurchaseRequestService', () => {
  let service: PurchaseRequestService;
  let mockRepository: DeepMockProxy<Repository<PurchaseRequest>>;
  let mockEventEmitter: DeepMockProxy<EventEmitter2>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseRequestService,
        {
          provide: getRepositoryToken(PurchaseRequest),
          useValue: mockDeep<Repository<PurchaseRequest>>(),
        },
        {
          provide: EventEmitter2,
          useValue: mockDeep<EventEmitter2>(),
        },
      ],
    }).compile();

    service = module.get<PurchaseRequestService>(PurchaseRequestService);
    mockRepository = module.get(getRepositoryToken(PurchaseRequest));
    mockEventEmitter = module.get(EventEmitter2);
  });

  describe('createPurchaseRequest', () => {
    it('should create a purchase request successfully', async () => {
      const mockPR = {
        id: 'pr-123',
        number: 'PR-2025-001',
        status: PRStatus.DRAFT,
      } as PurchaseRequest;

      const createData = {
        departmentId: 'dept-1',
        requestedBy: 'user-1',
        items: [
          { productId: 'prod-1', quantity: 10, unitPrice: 5.50 },
        ],
      };

      mockRepository.create.mockReturnValue(mockPR);
      mockRepository.save.mockResolvedValue(mockPR);

      const result = await service.createPurchaseRequest(createData, mockUser);

      expect(result).toEqual(mockPR);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'purchase-request.created',
        expect.objectContaining({
          purchaseRequestId: 'pr-123',
        })
      );
    });

    it('should throw error for invalid data', async () => {
      const invalidData = {
        departmentId: '',
        items: [],
      } as any;

      await expect(
        service.createPurchaseRequest(invalidData, mockUser)
      ).rejects.toThrow();
    });
  });
});
```

### Integration Testing

#### E2E API Testing
```typescript
// test/procurement.e2e-spec.ts
describe('Procurement (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Setup test database
    await setupTestDatabase();
    
    // Get auth token
    authToken = await getTestAuthToken();
  });

  describe('/purchase-requests (POST)', () => {
    it('should create a purchase request', () => {
      const createData = {
        departmentId: 'test-dept',
        requestedBy: 'test-user',
        items: [
          {
            productId: 'test-product',
            quantity: 5,
            unitPrice: 10.00,
          },
        ],
      };

      return request(app.getHttpServer())
        .post('/purchase-requests')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createData)
        .expect(201)
        .expect(res => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.status).toBe('DRAFT');
          expect(res.body.totalAmount).toBe('50.00');
        });
    });

    it('should reject unauthorized requests', () => {
      return request(app.getHttpServer())
        .post('/purchase-requests')
        .send({})
        .expect(401);
    });
  });

  afterAll(async () => {
    await cleanupTestDatabase();
    await app.close();
  });
});
```

### Performance Testing

#### Load Testing Configuration
```typescript
// test/load/purchase-request-load.test.ts
import autocannon from 'autocannon';

describe('Purchase Request Load Tests', () => {
  it('should handle concurrent PR creation', async () => {
    const result = await autocannon({
      url: 'http://localhost:3000/purchase-requests',
      connections: 100,
      duration: 30, // 30 seconds
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validPRData),
      method: 'POST',
    });

    expect(result.errors).toBe(0);
    expect(result.timeouts).toBe(0);
    expect(result.requests.average).toBeGreaterThan(100);
    expect(result.latency.p95).toBeLessThan(500);
  });
});
```

---

## Future Enhancements

### Planned Features
1. **Event Sourcing** - Complete audit trail with event replay
2. **CQRS Implementation** - Separate read/write models
3. **GraphQL Federation** - Unified API across microservices
4. **Real-time WebSockets** - Live inventory updates
5. **AI/ML Integration** - Demand forecasting, price optimization

### Technical Improvements
1. **Saga Pattern** - Distributed transaction management
2. **Service Mesh** - Istio for advanced traffic management
3. **API Versioning** - Multiple API versions support
4. **Advanced Caching** - Multi-level caching strategy
5. **Performance Monitoring** - Real-time performance analytics

---

## Appendices

### A. Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/carmen_db
REDIS_URL=redis://localhost:6379

# Keycloak
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=carmen
KEYCLOAK_CLIENT_ID=carmen-backend
KEYCLOAK_CLIENT_SECRET=secret

# External Services
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@carmen.io
SMTP_PASS=password

# Storage
AWS_ACCESS_KEY_ID=access_key
AWS_SECRET_ACCESS_KEY=secret_key
AWS_BUCKET_NAME=carmen-documents

# Monitoring
SENTRY_DSN=https://sentry.io/...
```

### B. API Response Examples

#### Success Response
```json
{
  "success": true,
  "data": {
    "id": "pr-123",
    "number": "PR-2025-001",
    "status": "DRAFT",
    "totalAmount": "150.00",
    "items": [
      {
        "id": "item-1",
        "productId": "prod-123",
        "quantity": 10,
        "unitPrice": "15.00",
        "totalPrice": "150.00"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "1.0"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "items.0.quantity",
        "message": "Quantity must be at least 1"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:00:00Z",
    "version": "1.0"
  }
}
```

---

*This document serves as the comprehensive guide for Carmen backend architecture and implementation. It will be updated as the system evolves and new requirements emerge.*