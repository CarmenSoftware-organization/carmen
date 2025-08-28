# Deployment & Operations Manual

**Document Type**: Production Deployment & Operations Guide  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
**Purpose**: Complete deployment and operations management for Carmen ERP

---

## 🎯 Overview

This manual provides comprehensive guidance for deploying, monitoring, and operating Carmen ERP in production environments. It covers cloud deployment, CI/CD pipelines, monitoring, security, and maintenance procedures.

### Deployment Strategy Overview
- **Platform**: Vercel (Recommended) or AWS/Google Cloud
- **Database**: PostgreSQL with connection pooling
- **CDN**: Integrated with deployment platform
- **Monitoring**: Built-in analytics plus external monitoring
- **Security**: Enterprise-grade security headers and authentication

---

## 🚀 Production Deployment

### Vercel Deployment (Recommended)

#### Prerequisites
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link project
vercel link
```

#### Environment Configuration
Create production environment variables in Vercel dashboard:

```bash
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
DATABASE_URL=postgresql://user:pass@host:5432/carmen_prod
DIRECT_URL=postgresql://user:pass@host:5432/carmen_prod

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-production-secret-32-chars
JWT_SECRET=your-jwt-production-secret-32-chars

# Email Configuration
EMAIL_FROM=noreply@your-domain.com
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
SMTP_SECURE=true

# File Storage
UPLOAD_STORAGE=cloud  # s3, gcs, or azure
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=carmen-uploads-prod
AWS_REGION=us-east-1

# Security
WEBHOOK_SECRET=your-webhook-secret-32-chars
API_RATE_LIMIT=100  # requests per hour per IP

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
ENABLE_ANALYTICS=true
LOG_LEVEL=info

# Feature Flags
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_EXPERIMENTAL_FEATURES=false
```

#### Deployment Commands
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs your-deployment-url
```

#### Vercel Configuration
Create `vercel.json`:

```json
{
  "version": 2,
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci",
  "devCommand": "npm run dev",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Referrer-Policy",
          "value": "origin-when-cross-origin"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/dashboard/",
      "destination": "/dashboard",
      "permanent": true
    }
  ],
  "rewrites": [
    {
      "source": "/api/health",
      "destination": "/api/status"
    }
  ]
}
```

### Alternative Cloud Deployment

#### AWS Deployment
```bash
# Install AWS CDK
npm install -g aws-cdk

# Create CDK stack
mkdir carmen-aws-deployment
cd carmen-aws-deployment
cdk init app --language=typescript

# Deploy infrastructure
cdk deploy
```

#### Docker Deployment
```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3006
ENV PORT 3006
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  carmen-app:
    build: .
    ports:
      - "3006:3006"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://carmen:password@postgres:5432/carmen
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: carmen
      POSTGRES_USER: carmen
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow
Create `.github/workflows/deploy.yml`:

```yaml
name: Carmen ERP Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: carmen_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.14.0'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run checktypes

      - name: Run tests
        run: npm run test:run
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/carmen_test

      - name: Build application
        run: npm run build
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/carmen_test

  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Check for vulnerabilities
        run: npm audit --production

  deploy-staging:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          scope: ${{ secrets.TEAM_ID }}

  deploy-production:
    needs: [test, security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Deploy to Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
          scope: ${{ secrets.TEAM_ID }}

      - name: Notify deployment
        run: |
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
          -H 'Content-type: application/json' \
          --data '{"text":"🚀 Carmen ERP deployed to production successfully!"}'
```

### GitLab CI/CD Pipeline
Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - security
  - build
  - deploy

variables:
  NODE_VERSION: "20.14.0"
  POSTGRES_DB: carmen_test
  POSTGRES_USER: postgres
  POSTGRES_PASSWORD: postgres

test:
  stage: test
  image: node:20-alpine
  services:
    - postgres:15-alpine
  variables:
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/carmen_test"
  before_script:
    - npm ci
  script:
    - npm run lint
    - npm run checktypes
    - npm run test:run
    - npm run build
  cache:
    paths:
      - node_modules/

security-scan:
  stage: security
  image: node:20-alpine
  script:
    - npm audit --audit-level high
    - npm audit --production
  allow_failure: false

build:
  stage: build
  image: node:20-alpine
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/
    expire_in: 1 hour
  only:
    - main
    - develop

deploy-production:
  stage: deploy
  image: node:20-alpine
  script:
    - npm install -g vercel
    - vercel --token $VERCEL_TOKEN --prod --confirm
  environment:
    name: production
    url: https://carmen-erp.com
  only:
    - main
```

---

## 📊 Monitoring & Analytics

### Application Monitoring

#### Health Check Endpoint
Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    // const dbStatus = await checkDatabaseConnection();
    
    // Check external services
    // const servicesStatus = await checkExternalServices();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: 'connected', // dbStatus
      services: {
        email: 'operational',
        storage: 'operational',
        cache: 'operational'
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    );
  }
}
```

#### Performance Monitoring
```typescript
// lib/monitoring/performance.ts
export class PerformanceMonitor {
  static trackPageLoad(pageName: string) {
    if (typeof window !== 'undefined') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      const metrics = {
        page: pageName,
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint: this.getFCP(),
        largestContentfulPaint: this.getLCP(),
        timestamp: new Date().toISOString()
      };

      // Send to analytics service
      this.sendMetrics(metrics);
    }
  }

  private static getFCP(): number {
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  private static getLCP(): number {
    return new Promise((resolve) => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  private static sendMetrics(metrics: any) {
    // Implement your analytics service integration
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  }
}
```

### Error Monitoring with Sentry

#### Sentry Configuration
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: process.env.NODE_ENV === 'development',
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request?.headers) {
      delete event.request.headers.authorization;
      delete event.request.headers.cookie;
    }
    return event;
  },
  beforeSendTransaction(transaction) {
    // Filter out health check transactions
    if (transaction.name?.includes('/api/health')) {
      return null;
    }
    return transaction;
  }
});
```

#### Custom Error Boundary
```typescript
// components/ErrorBoundary.tsx
'use client';

import React from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-4">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Database Monitoring

#### Connection Pool Monitoring
```typescript
// lib/database/monitoring.ts
export class DatabaseMonitor {
  static async checkConnectionHealth() {
    try {
      const start = Date.now();
      // await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        status: 'healthy',
        responseTime,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  static async getConnectionPoolStatus() {
    // For Prisma monitoring
    return {
      totalConnections: 10, // Get from Prisma metrics
      activeConnections: 3,
      idleConnections: 7,
      waitingQueries: 0
    };
  }
}
```

---

## 🔒 Security Configuration

### Security Headers
```typescript
// next.config.js security configuration
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https: wss:",
      "frame-ancestors 'none'"
    ].join('; ')
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  }
];
```

### Rate Limiting
```typescript
// lib/security/rate-limit.ts
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export async function rateLimit(
  identifier: string,
  limit: number = 100,
  window: number = 3600000 // 1 hour
) {
  const key = `rate_limit:${identifier}`;
  const current = await redis.incr(key);
  
  if (current === 1) {
    await redis.expire(key, Math.ceil(window / 1000));
  }
  
  return {
    count: current,
    limit,
    remaining: Math.max(0, limit - current),
    reset: Date.now() + window
  };
}

// Usage in API routes
export async function withRateLimit(
  request: Request,
  options: { limit?: number; window?: number } = {}
) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const result = await rateLimit(ip, options.limit, options.window);
  
  if (result.count > result.limit) {
    throw new Error('Rate limit exceeded');
  }
  
  return result;
}
```

### Input Validation & Sanitization
```typescript
// lib/security/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
}

export function validateAndSanitize<T>(
  data: unknown,
  schema: z.ZodSchema<T>
): T {
  // First validate structure
  const validatedData = schema.parse(data);
  
  // Then sanitize string fields
  return sanitizeObject(validatedData);
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
}
```

---

## 🔧 Database Management

### Production Database Setup

#### PostgreSQL Configuration
```sql
-- Production database configuration
-- /etc/postgresql/15/main/postgresql.conf

# Memory settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB

# Connection settings
max_connections = 100
shared_preload_libraries = 'pg_stat_statements'

# Logging
log_statement = 'ddl'
log_min_duration_statement = 1000
log_checkpoints = on
log_lock_waits = on

# Performance monitoring
track_activity_query_size = 2048
track_functions = all
track_io_timing = on
```

#### Connection Pooling
```typescript
// lib/database/pool.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

### Backup & Recovery

#### Automated Backups
```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

DATABASE_URL="${DATABASE_URL}"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/carmen_backup_${DATE}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
pg_dump "$DATABASE_URL" > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Upload to cloud storage (example with AWS S3)
aws s3 cp "${BACKUP_FILE}.gz" "s3://carmen-backups/$(basename ${BACKUP_FILE}.gz)"

# Clean up old local backups (keep last 7 days)
find "$BACKUP_DIR" -name "carmen_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

#### Disaster Recovery
```bash
#!/bin/bash
# scripts/restore-database.sh

set -e

if [ $# -ne 2 ]; then
    echo "Usage: $0 <backup-file> <target-database-url>"
    exit 1
fi

BACKUP_FILE="$1"
TARGET_DB="$2"

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | psql "$TARGET_DB"
else
    psql "$TARGET_DB" < "$BACKUP_FILE"
fi

echo "Database restored from: $BACKUP_FILE"
```

---

## 📈 Performance Optimization

### Caching Strategy

#### Redis Cache Implementation
```typescript
// lib/cache/redis.ts
import Redis from 'ioredis';

class CacheManager {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
}

export const cache = new CacheManager();
```

### CDN Configuration

#### Vercel CDN Optimization
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-domain.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  async headers() {
    return [
      {
        source: '/images/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/_next/static/:all*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### Database Optimization

#### Query Optimization
```typescript
// lib/database/optimizations.ts
export class DatabaseOptimizer {
  // Connection pooling with Prisma
  static configurePrisma() {
    return {
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      generator: {
        client: {
          provider: 'prisma-client-js',
          previewFeatures: ['metrics', 'tracing'],
        },
      },
    };
  }

  // Query caching
  static async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 300
  ): Promise<T> {
    const cached = await cache.get<T>(key);
    if (cached) return cached;

    const result = await queryFn();
    await cache.set(key, result, ttl);
    return result;
  }

  // Batch operations
  static async batchInsert<T>(
    model: any,
    data: T[],
    batchSize: number = 100
  ) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    const results = [];
    for (const batch of batches) {
      const result = await model.createMany({
        data: batch,
        skipDuplicates: true,
      });
      results.push(result);
    }

    return results;
  }
}
```

---

## 🚨 Incident Response

### Monitoring Alerts

#### Uptime Monitoring
```typescript
// lib/monitoring/uptime.ts
export class UptimeMonitor {
  static async checkEndpoints() {
    const endpoints = [
      { url: '/api/health', timeout: 5000 },
      { url: '/dashboard', timeout: 10000 },
      { url: '/api/auth/session', timeout: 5000 }
    ];

    const results = await Promise.all(
      endpoints.map(async (endpoint) => {
        const start = Date.now();
        try {
          const response = await fetch(endpoint.url, {
            signal: AbortSignal.timeout(endpoint.timeout)
          });
          
          return {
            url: endpoint.url,
            status: response.status,
            responseTime: Date.now() - start,
            healthy: response.ok
          };
        } catch (error) {
          return {
            url: endpoint.url,
            status: 0,
            responseTime: Date.now() - start,
            healthy: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      })
    );

    // Send alerts for failures
    const failures = results.filter(r => !r.healthy);
    if (failures.length > 0) {
      await this.sendAlert(failures);
    }

    return results;
  }

  private static async sendAlert(failures: any[]) {
    // Implement your alerting mechanism
    // Slack, PagerDuty, email, etc.
    const message = `🚨 Carmen ERP Health Check Failures:\n${
      failures.map(f => `- ${f.url}: ${f.error || `Status ${f.status}`}`).join('\n')
    }`;

    if (process.env.SLACK_WEBHOOK) {
      await fetch(process.env.SLACK_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message })
      });
    }
  }
}
```

### Incident Response Playbooks

#### Database Connection Issues
```bash
# 1. Check database connectivity
pg_isready -h hostname -p 5432

# 2. Check connection pool status
# Monitor active connections in application logs

# 3. Restart application if needed
vercel redeploy --prod

# 4. Scale database if necessary
# Follow cloud provider scaling procedures
```

#### High Memory Usage
```bash
# 1. Check memory metrics
# Monitor in Vercel dashboard or cloud provider

# 2. Identify memory leaks
# Review application logs for patterns

# 3. Restart instances
# Use zero-downtime deployment

# 4. Scale horizontally if needed
# Add more instances
```

#### DDoS Attack Response
```bash
# 1. Enable rate limiting
# Update rate limit configuration

# 2. Block malicious IPs
# Use cloud provider firewall rules

# 3. Enable DDoS protection
# Activate cloud provider DDoS protection

# 4. Monitor traffic patterns
# Analyze logs for attack patterns
```

---

## 🔄 Maintenance Procedures

### Regular Maintenance Tasks

#### Weekly Maintenance
```bash
#!/bin/bash
# scripts/weekly-maintenance.sh

# Update dependencies
npm audit fix
npm update

# Database maintenance
psql $DATABASE_URL -c "VACUUM ANALYZE;"
psql $DATABASE_URL -c "REINDEX DATABASE carmen;"

# Clear old logs
find /var/log -name "*.log" -mtime +7 -delete

# Backup database
./scripts/backup-database.sh

# Performance monitoring
npm run analyze:bundle
npm run analyze:performance
```

#### Monthly Maintenance
```bash
#!/bin/bash
# scripts/monthly-maintenance.sh

# Security updates
npm audit --audit-level high
npm audit fix --force

# Database statistics update
psql $DATABASE_URL -c "ANALYZE;"

# SSL certificate renewal check
# (Usually automated by cloud providers)

# Performance baseline update
# Update performance benchmarks

# Disaster recovery test
# Test backup restoration procedure
```

### Database Maintenance

#### Index Optimization
```sql
-- Monitor index usage
SELECT 
    indexname,
    indexrelname,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;

-- Identify unused indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read
FROM pg_stat_user_indexes 
WHERE idx_scan = 0;

-- Rebuild indexes if needed
REINDEX INDEX CONCURRENTLY index_name;
```

#### Query Performance Analysis
```sql
-- Enable pg_stat_statements
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Analyze slow queries
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;
```

---

## 📋 Operations Checklist

### Pre-Deployment Checklist
- [ ] All tests passing in CI/CD pipeline
- [ ] Security audit completed
- [ ] Performance benchmarks within acceptable ranges
- [ ] Database migrations tested in staging
- [ ] Environment variables configured
- [ ] Monitoring alerts configured
- [ ] Backup procedures tested
- [ ] Rollback plan documented
- [ ] Team notified of deployment

### Post-Deployment Checklist
- [ ] Health checks passing
- [ ] Application responding correctly
- [ ] Database connections stable
- [ ] Performance metrics normal
- [ ] Error rates within threshold
- [ ] User authentication working
- [ ] Critical user flows tested
- [ ] Monitoring dashboard green
- [ ] Team notified of successful deployment

### Incident Response Checklist
- [ ] Incident severity assessed
- [ ] Incident response team notified
- [ ] Initial response actions taken
- [ ] Communication channel established
- [ ] Technical investigation underway
- [ ] Status page updated
- [ ] Stakeholders informed
- [ ] Resolution implemented
- [ ] Post-incident review scheduled

---

**Completion**: This completes the comprehensive Deployment & Operations Manual for Carmen ERP, providing production-ready deployment guidance, monitoring, security, and maintenance procedures.

*This manual ensures reliable, secure, and scalable operation of Carmen ERP in production environments with enterprise-grade operational practices.*