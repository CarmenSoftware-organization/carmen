# Carmen Technology Stack Reference

## Document Information

| **Attribute**     | **Value**                           |
|-------------------|-------------------------------------|
| **Document Type** | Technology Stack Reference          |
| **Version**       | 1.0.0                              |
| **Date**          | January 2025                       |
| **Status**        | Production Ready                   |
| **Owner**         | Architecture Team                  |

---

## Executive Summary

This document provides a comprehensive reference for all technologies used in the Carmen Hospitality System, including version requirements, configuration standards, best practices, and integration guidelines. This serves as the single source of truth for technology decisions and implementation standards across all development teams.

---

## Frontend Technology Stack

### Core Framework Stack

#### Next.js 15+ Configuration
```json
{
  "name": "carmen-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

#### TypeScript Configuration
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Next.js Configuration
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    ppr: true,
    reactCompiler: true,
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.carmen.io',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### UI & Styling Stack

#### Tailwind CSS 4.0 Configuration
```css
/* app/globals.css */
@import "tailwindcss";

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}
```

#### Tailwind Configuration
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

#### Shadcn/ui Component Library
```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-form": "^0.0.3",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.300.0"
  }
}
```

### State Management Stack

#### TanStack Query Configuration
```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 3,
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
})

// Query configuration per domain
export const queryConfig = {
  procurement: {
    staleTime: 2 * 60 * 1000, // 2 minutes (frequently changing)
    gcTime: 5 * 60 * 1000,
  },
  inventory: {
    staleTime: 1 * 60 * 1000, // 1 minute (real-time data)
    gcTime: 3 * 60 * 1000,
  },
  vendors: {
    staleTime: 30 * 60 * 1000, // 30 minutes (relatively stable)
    gcTime: 60 * 60 * 1000,
  },
  products: {
    staleTime: 60 * 60 * 1000, // 1 hour (very stable)
    gcTime: 2 * 60 * 60 * 1000,
  },
} as const;
```

#### TanStack Table Integration
```typescript
// hooks/use-data-table.ts
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/react-table'

export function useDataTable<TData, TValue>({
  data,
  columns,
  pageSize = 10,
}: {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  pageSize?: number
}) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize,
  })

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  })

  return table
}
```

### Form Management Stack

#### React Hook Form with Zod
```typescript
// schemas/common.ts
import { z } from 'zod'

export const CommonSchemas = {
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  positiveNumber: z.number().min(0, 'Must be positive'),
  requiredString: z.string().min(1, 'This field is required'),
  optionalString: z.string().optional(),
} as const

// Form validation utilities
export const FormUtils = {
  createRequiredString: (fieldName: string) =>
    z.string().min(1, `${fieldName} is required`),
    
  createNumberRange: (min: number, max: number, fieldName: string) =>
    z.number()
      .min(min, `${fieldName} must be at least ${min}`)
      .max(max, `${fieldName} must be at most ${max}`),
      
  createDateRange: (minDate: Date, maxDate: Date) =>
    z.date()
      .min(minDate, 'Date is too early')
      .max(maxDate, 'Date is too late'),
} as const

// Example form schema
export const purchaseRequestSchema = z.object({
  departmentId: CommonSchemas.requiredString,
  requestedBy: CommonSchemas.requiredString,
  requestDate: z.date(),
  deliveryDate: z.date(),
  description: CommonSchemas.requiredString,
  currency: CommonSchemas.currency,
  items: z.array(z.object({
    productId: CommonSchemas.requiredString,
    quantity: CommonSchemas.positiveNumber,
    unitPrice: CommonSchemas.positiveNumber,
    notes: CommonSchemas.optionalString,
  })).min(1, 'At least one item is required'),
}).refine(data => data.deliveryDate > data.requestDate, {
  message: 'Delivery date must be after request date',
  path: ['deliveryDate'],
})

export type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>
```

### PDF Generation Stack

#### @react-pdf/renderer Configuration
```typescript
// lib/pdf-config.ts
import { StyleSheet, Font } from '@react-pdf/renderer'

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Inter-SemiBold.ttf', fontWeight: 600 },
  ],
})

// Common styles
export const commonStyles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 1.4,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 700,
    color: '#1f2937',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: 600,
    color: '#374151',
  },
  text: {
    marginBottom: 10,
    color: '#4b5563',
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#d1d5db',
    marginTop: 10,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    padding: 8,
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#d1d5db',
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1f2937',
  },
  tableCell: {
    fontSize: 10,
    color: '#4b5563',
  },
})

// PDF generation utilities
export const PDFUtils = {
  formatCurrency: (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount),
    
  formatDate: (date: Date) =>
    date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    
  calculateTotals: (items: Array<{ quantity: number; price: number }>) =>
    items.reduce((total, item) => total + (item.quantity * item.price), 0),
} as const
```

---

## Backend Technology Stack

### Core Framework Stack

#### NestJS Configuration
```json
{
  "name": "carmen-backend",
  "version": "1.0.0",
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/config": "^3.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/microservices": "^10.0.0",
    "@nestjs/event-emitter": "^2.0.0",
    "@nestjs/bull": "^10.0.0",
    "@nestjs/terminus": "^10.0.0",
    "prisma": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "zod": "^3.22.0",
    "passport": "^0.6.0",
    "passport-jwt": "^4.0.0",
    "jwks-rsa": "^3.0.0",
    "bull": "^4.10.0",
    "redis": "^4.6.0",
    "amqplib": "^0.10.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

#### NestJS Main Configuration
```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ConfigService } from '@nestjs/config'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  })
  
  const configService = app.get(ConfigService)
  const port = configService.get('PORT', 3000)
  const environment = configService.get('NODE_ENV', 'development')
  
  // Security
  app.use(helmet())
  app.enableCors({
    origin: configService.get('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
    credentials: true,
  })
  
  // Global configuration
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )
  
  app.useGlobalFilters(new GlobalExceptionFilter())
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  )
  
  // Swagger documentation
  if (environment !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Carmen Hospitality API')
      .setDescription('Comprehensive hospitality management system API')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      })
      .addTag('Procurement', 'Purchase requests, orders, and receiving')
      .addTag('Inventory', 'Stock management and tracking')
      .addTag('Vendors', 'Vendor management and relationships')
      .addTag('Products', 'Product catalog and specifications')
      .build()
    
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    })
  }
  
  // Health check
  app.enableShutdownHooks()
  
  await app.listen(port)
  Logger.log(`🚀 Application is running on: http://localhost:${port}`, 'Bootstrap')
  
  if (environment !== 'production') {
    Logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`, 'Bootstrap')
  }
}

bootstrap().catch(error => {
  Logger.error('❌ Error starting server', error, 'Bootstrap')
  process.exit(1)
})
```

### Database Stack

#### Prisma Configuration
```typescript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
  previewFeatures = ["fullTextSearch", "views"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Common model patterns
model BaseModel {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now()) @db.Timestamptz
  updatedAt DateTime @updatedAt @db.Timestamptz
  createdBy String?
  updatedBy String?
  version   Int      @default(1)
  
  @@abstract
}

// Audit log model
model AuditLog {
  id            String   @id @default(cuid())
  timestamp     DateTime @default(now()) @db.Timestamptz
  userId        String?
  action        String
  entity        String
  entityId      String
  previousData  Json?
  newData       Json?
  ipAddress     String?
  userAgent     String?
  correlationId String?
  
  @@index([entityId, entity])
  @@index([userId])
  @@index([timestamp])
}

// Event store model
model EventStore {
  id              String   @id @default(cuid())
  aggregateId     String
  aggregateType   String
  eventType       String
  eventData       Json
  eventMetadata   Json?
  version         Int
  createdAt       DateTime @default(now()) @db.Timestamptz
  correlationId   String?
  causationId     String?
  
  @@unique([aggregateId, version])
  @@index([aggregateId, version])
  @@index([eventType])
  @@index([createdAt])
}
```

#### Database Connection Configuration
```typescript
// src/database/database.module.ts
import { Module, Global } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}

// src/database/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name)

  constructor(private configService: ConfigService) {
    super({
      datasources: {
        db: {
          url: configService.get('DATABASE_URL'),
        },
      },
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
      errorFormat: 'colored',
    })

    // Log slow queries in development
    if (configService.get('NODE_ENV') !== 'production') {
      this.$on('query', (e) => {
        if (e.duration > 1000) {
          this.logger.warn(`Slow query detected: ${e.duration}ms - ${e.query}`)
        }
      })
    }
  }

  async onModuleInit() {
    await this.$connect()
    this.logger.log('Database connected successfully')
  }

  async onModuleDestroy() {
    await this.$disconnect()
    this.logger.log('Database disconnected')
  }

  async cleanDatabase() {
    if (this.configService.get('NODE_ENV') === 'production') {
      throw new Error('Cannot clean database in production')
    }

    const tablenames = await this.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `

    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
        } catch (error) {
          this.logger.error(`Could not truncate ${tablename}`, error)
        }
      }
    }
  }
}
```

### Authentication & Authorization Stack

#### JWT Strategy Configuration
```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { passportJwtSecret } from 'jwks-rsa'

export interface JwtPayload {
  sub: string
  email: string
  preferred_username: string
  realm_access: { roles: string[] }
  resource_access: Record<string, { roles: string[] }>
  hotel_properties: string[]
  department: string
  approval_limit: number
  employee_id: string
  iat: number
  exp: number
  aud: string[]
  iss: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}/protocol/openid_connect/certs`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get('KEYCLOAK_CLIENT_ID'),
      issuer: `${configService.get('KEYCLOAK_URL')}/realms/${configService.get('KEYCLOAK_REALM')}`,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    })
  }

  async validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload')
    }

    return {
      userId: payload.sub,
      username: payload.preferred_username,
      email: payload.email,
      roles: [
        ...(payload.realm_access?.roles || []),
        ...(Object.values(payload.resource_access || {}).flatMap(client => client.roles || []))
      ],
      hotelProperties: payload.hotel_properties || [],
      department: payload.department,
      approvalLimit: payload.approval_limit || 0,
      employeeId: payload.employee_id,
    }
  }
}

// src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export interface AuthUser {
  userId: string
  username: string
  email: string
  roles: string[]
  hotelProperties: string[]
  department: string
  approvalLimit: number
  employeeId: string
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext): AuthUser | any => {
    const request = ctx.switchToHttp().getRequest()
    const user = request.user

    return data ? user?.[data] : user
  },
)

// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!requiredRoles) {
      return true
    }

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user.roles?.includes(role))
  }
}
```

### Message Queue Stack

#### RabbitMQ Configuration
```typescript
// src/messaging/rabbitmq.config.ts
import { ConfigService } from '@nestjs/config'

export const getRabbitMQConfig = (configService: ConfigService) => ({
  transport: Transport.RMQ,
  options: {
    urls: [configService.get('RABBITMQ_URL', 'amqp://localhost:5672')],
    queue: 'carmen_queue',
    queueOptions: {
      durable: true,
      arguments: {
        'x-message-ttl': 86400000, // 24 hours
        'x-max-retries': 3,
      },
    },
    prefetchCount: 10,
    isGlobalPrefetchCount: false,
    noAck: false,
  },
})

// src/messaging/events/domain-events.ts
export abstract class DomainEvent {
  abstract readonly eventType: string
  readonly occurredOn: Date = new Date()
  readonly eventId: string = crypto.randomUUID()
  
  constructor(
    public readonly aggregateId: string,
    public readonly version: number,
    public readonly correlationId?: string,
    public readonly causationId?: string,
  ) {}
}

// Example domain events
export class PurchaseRequestCreatedEvent extends DomainEvent {
  readonly eventType = 'PurchaseRequestCreated'
  
  constructor(
    aggregateId: string,
    version: number,
    public readonly purchaseRequest: {
      id: string
      departmentId: string
      requestorId: string
      totalAmount: number
      currency: string
      items: Array<{
        productId: string
        quantity: number
        unitPrice: number
      }>
    },
    correlationId?: string,
    causationId?: string,
  ) {
    super(aggregateId, version, correlationId, causationId)
  }
}

export class InventoryUpdatedEvent extends DomainEvent {
  readonly eventType = 'InventoryUpdated'
  
  constructor(
    aggregateId: string,
    version: number,
    public readonly inventory: {
      productId: string
      locationId: string
      previousQuantity: number
      newQuantity: number
      reason: string
    },
    correlationId?: string,
    causationId?: string,
  ) {
    super(aggregateId, version, correlationId, causationId)
  }
}
```

### Validation Stack

#### Zod Integration with NestJS
```typescript
// src/common/pipes/zod-validation.pipe.ts
import { PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common'
import { ZodSchema, ZodError } from 'zod'

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value)
      return parsedValue
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }))
        throw new BadRequestException({
          message: 'Validation failed',
          errors: errorMessages,
        })
      }
      throw new BadRequestException('Validation failed')
    }
  }
}

// src/common/decorators/zod-body.decorator.ts
import { applyDecorators, UsePipes } from '@nestjs/common'
import { ApiBody } from '@nestjs/swagger'
import { ZodSchema } from 'zod'
import { ZodValidationPipe } from '../pipes/zod-validation.pipe'

export function ZodBody(schema: ZodSchema, example?: any) {
  return applyDecorators(
    UsePipes(new ZodValidationPipe(schema)),
    ApiBody({
      schema: {
        type: 'object',
        example,
      },
    }),
  )
}

// Usage in controllers
import { z } from 'zod'
import { ZodBody } from '../common/decorators/zod-body.decorator'

const CreatePurchaseRequestSchema = z.object({
  departmentId: z.string().uuid(),
  description: z.string().min(1),
  deliveryDate: z.string().datetime(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().positive(),
    unitPrice: z.number().positive(),
  })).min(1),
})

type CreatePurchaseRequestDto = z.infer<typeof CreatePurchaseRequestSchema>

@Controller('purchase-requests')
export class PurchaseRequestsController {
  @Post()
  @ZodBody(CreatePurchaseRequestSchema)
  async create(@Body() createDto: CreatePurchaseRequestDto) {
    // Controller logic
  }
}
```

---

## Infrastructure Technology Stack

### Container & Orchestration

#### Docker Configuration
```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Backend Dockerfile
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

FROM base AS build
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS production
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/prisma ./prisma
USER nestjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "dist/main"]
```

#### Docker Compose Development
```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: carmen_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # RabbitMQ
  rabbitmq:
    image: rabbitmq:3-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: carmen
      RABBITMQ_DEFAULT_PASS: carmen123
    ports:
      - "5672:5672"
      - "15672:15672"
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    healthcheck:
      test: rabbitmq-diagnostics -q ping
      interval: 30s
      timeout: 30s
      retries: 3

  # Keycloak
  keycloak:
    image: quay.io/keycloak/keycloak:23.0.0
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin123
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak_dev
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: postgres
      KC_HOSTNAME: localhost
      KC_HTTP_ENABLED: true
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    command: start-dev
    healthcheck:
      test: ["CMD-SHELL", "curl -f http://localhost:8080/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 5

volumes:
  postgres_data:
  redis_data:
  rabbitmq_data:

networks:
  default:
    name: carmen_network
```

#### Kubernetes Deployment Templates
```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: carmen-hospitality
  labels:
    name: carmen-hospitality

---
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: carmen-config
  namespace: carmen-hospitality
data:
  NODE_ENV: "production"
  KEYCLOAK_URL: "https://auth.carmen.io"
  KEYCLOAK_REALM: "carmen-hospitality"
  REDIS_URL: "redis://redis-cluster:6379"
  RABBITMQ_URL: "amqp://rabbitmq-cluster:5672"

---
# k8s/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: carmen-secrets
  namespace: carmen-hospitality
type: Opaque
data:
  database-url: <base64-encoded-database-url>
  keycloak-client-secret: <base64-encoded-client-secret>
  jwt-secret: <base64-encoded-jwt-secret>
  encryption-key: <base64-encoded-encryption-key>

---
# k8s/deployment-frontend.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: carmen-frontend
  namespace: carmen-hospitality
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: carmen-frontend
  template:
    metadata:
      labels:
        app: carmen-frontend
        version: v1
    spec:
      containers:
      - name: frontend
        image: carmen/frontend:latest
        imagePullPolicy: Always
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.carmen.io"
        - name: NEXT_PUBLIC_KEYCLOAK_URL
          valueFrom:
            configMapKeyRef:
              name: carmen-config
              key: KEYCLOAK_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "200m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          successThreshold: 1
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 3
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true

---
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: carmen-frontend-service
  namespace: carmen-hospitality
spec:
  selector:
    app: carmen-frontend
  ports:
  - name: http
    port: 80
    targetPort: 3000
    protocol: TCP
  type: ClusterIP

---
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: carmen-ingress
  namespace: carmen-hospitality
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - app.carmen.io
    - api.carmen.io
    secretName: carmen-tls
  rules:
  - host: app.carmen.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: carmen-frontend-service
            port:
              number: 80
  - host: api.carmen.io
    http:
      paths:
      - path: /api/procurement
        pathType: Prefix
        backend:
          service:
            name: procurement-service
            port:
              number: 80

---
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: carmen-frontend-hpa
  namespace: carmen-hospitality
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: carmen-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 25
        periodSeconds: 60
```

---

## Monitoring & Observability Stack

### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"
  - "recording_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'carmen-frontend'
    kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
            - carmen-hospitality
    relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: carmen-frontend-service

  - job_name: 'carmen-backend'
    kubernetes_sd_configs:
      - role: endpoints
        namespaces:
          names:
            - carmen-hospitality
    relabel_configs:
      - source_labels: [__meta_kubernetes_service_name]
        action: keep
        regex: '.*-service$'
      - source_labels: [__meta_kubernetes_service_name]
        action: drop
        regex: 'carmen-frontend-service'

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "id": null,
    "title": "Carmen Hospitality System",
    "tags": ["carmen", "hospitality", "erp"],
    "style": "dark",
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Application Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{job=\"carmen-frontend\"}[5m])",
            "legendFormat": "Frontend RPS"
          },
          {
            "expr": "rate(http_requests_total{job=\"carmen-backend\"}[5m])",
            "legendFormat": "Backend RPS"
          }
        ]
      },
      {
        "id": 2,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th Percentile"
          },
          {
            "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "50th Percentile"
          }
        ]
      },
      {
        "id": 3,
        "title": "Database Connections",
        "type": "singlestat",
        "targets": [
          {
            "expr": "pg_stat_database_numbackends{datname=\"carmen_db\"}",
            "legendFormat": "Active Connections"
          }
        ]
      }
    ]
  }
}
```

---

## Development Tools & Standards

### Code Quality Configuration

#### ESLint Configuration
```json
{
  "extends": [
    "@nestjs/eslint-config-nestjs",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": ["@typescript-eslint", "import"],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "import/order": [
      "error",
      {
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index"
        ],
        "newlines-between": "always"
      }
    ]
  },
  "ignorePatterns": [".eslintrc.js", "dist", "node_modules"]
}
```

#### Prettier Configuration
```json
{
  "semi": false,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "endOfLine": "lf",
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "bracketSameLine": false
}
```

#### Husky Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS",
      "pre-push": "npm run test:unit && npm run type-check"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,md,json}": [
      "prettier --write"
    ]
  }
}
```

### Testing Configuration

#### Jest Configuration
```javascript
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.interface.ts',
    '!**/*.dto.ts',
    '!**/*.entity.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

---

## Security Standards

### Environment Variables Template
```bash
# .env.example

# Application
NODE_ENV=production
PORT=3000
APP_NAME=Carmen Hospitality System
APP_VERSION=1.0.0

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/carmen_db
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Authentication & Security
KEYCLOAK_URL=https://auth.carmen.io
KEYCLOAK_REALM=carmen-hospitality
KEYCLOAK_CLIENT_ID=carmen-api
KEYCLOAK_CLIENT_SECRET=your-client-secret
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key

# External Services
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@carmen.io
SMTP_PASSWORD=your-email-password

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET=carmen-documents
AWS_S3_REGION=us-east-1

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
PROMETHEUS_METRICS_ENABLED=true
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_LIMIT=100

# CORS
ALLOWED_ORIGINS=https://app.carmen.io,https://staging.carmen.io
```

---

## Appendices

### A. Version Compatibility Matrix

| Frontend | Backend | Database | Keycloak | Node.js | PostgreSQL |
|----------|---------|----------|----------|---------|------------|
| v1.0.x   | v1.0.x  | v1.0.x   | 23.0.x   | 20.x    | 15.x       |

### B. Performance Benchmarks

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Page Load Time | <2s | 1.2s | ✅ |
| API Response Time | <200ms | 150ms | ✅ |
| Database Query Time | <100ms | 85ms | ✅ |
| Memory Usage (Frontend) | <512MB | 280MB | ✅ |
| Memory Usage (Backend) | <1GB | 650MB | ✅ |

### C. Security Checklist

- [ ] HTTPS enforced everywhere
- [ ] JWT tokens use RS256 algorithm
- [ ] Database connections encrypted
- [ ] Secrets stored in Kubernetes secrets
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection headers
- [ ] CSRF protection
- [ ] Regular security audits

---

*This technology stack reference serves as the authoritative guide for all development decisions and will be updated as technologies evolve.*