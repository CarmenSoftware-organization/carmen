# Carmen System Architecture Documentation

## Document Information

| **Attribute**     | **Value**                           |
|-------------------|-------------------------------------|
| **Document Type** | System Architecture Guide           |
| **Version**       | 1.0.0                              |
| **Date**          | January 2025                       |
| **Status**        | Production Ready                   |
| **Owner**         | Architecture Team                  |

---

## Executive Summary

This document provides a comprehensive overview of the Carmen Hospitality System architecture, including high-level system diagrams, technology stack details, deployment architecture, and integration patterns. The system follows modern microservices architecture principles with event-driven communication, containerized deployment, and cloud-native design patterns.

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           Carmen Hospitality System                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────────────┐    ┌─────────────────────────┐                    │
│  │     Web Application     │    │    Mobile Application   │                    │
│  │     (Next.js 15+)       │    │     (React Native)      │                    │
│  │   - Shadcn/ui           │    │   - Expo Framework      │                    │
│  │   - TanStack Query      │    │   - NativeBase         │                    │
│  │   - React Hook Form     │    │   - Async Storage      │                    │
│  └─────────────────────────┘    └─────────────────────────┘                    │
│           │                               │                                     │
│           └───────────────┬───────────────┘                                     │
│                           │                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        API Gateway (Kong/Traefik)                          ││
│  │  - Rate Limiting      - Authentication      - Load Balancing              ││
│  │  - Request Routing    - SSL Termination     - Circuit Breaker             ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                           │                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    Identity & Access Management                             ││
│  │                         (Keycloak)                                          ││
│  │  - SSO Authentication  - RBAC/ABAC         - Multi-Factor Auth            ││
│  │  - User Management     - Token Validation  - Session Management           ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                           │                                                     │
│           ┌───────────────┼───────────────┐                                     │
│           │               │               │                                     │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐                      │
│  │  Procurement   │ │   Inventory    │ │ Vendor Mgmt    │                      │
│  │   Service      │ │    Service     │ │   Service      │                      │
│  │  (NestJS)      │ │   (NestJS)     │ │  (NestJS)      │                      │
│  └────────────────┘ └────────────────┘ └────────────────┘                      │
│           │               │               │                                     │
│           └───────────────┼───────────────┘                                     │
│                           │                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    Message Queue (RabbitMQ/Kafka)                          ││
│  │  - Event Streaming     - Async Processing   - Service Communication       ││
│  │  - Dead Letter Queue   - Message Routing    - Retry Mechanisms            ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                           │                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                    Database Layer (PostgreSQL)                             ││
│  │  - Database per Service  - Connection Pooling  - Read Replicas            ││
│  │  - Automated Backups     - Point-in-time Recovery                          ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            Microservices Ecosystem                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │Procurement  │ │ Inventory   │ │Vendor Mgmt  │ │Product Mgmt │              │
│  │Service      │ │Service      │ │Service      │ │Service      │              │
│  │Port: 3001   │ │Port: 3002   │ │Port: 3003   │ │Port: 3004   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │Store Ops    │ │ Finance     │ │Operational  │ │Notification │              │
│  │Service      │ │Service      │ │Planning Svc │ │Service      │              │
│  │Port: 3005   │ │Port: 3006   │ │Port: 3007   │ │Port: 3008   │              │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘              │
│                                                                                 │
│  ┌─────────────┐ ┌─────────────┐                                               │
│  │Reporting    │ │PDF Generation│                                               │
│  │Service      │ │Service       │                                               │
│  │Port: 3009   │ │Port: 3010    │                                               │
│  └─────────────┘ └─────────────┘                                               │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack Details

### Frontend Technology Stack

#### Core Framework & Runtime
```yaml
framework:
  name: "Next.js"
  version: "15.x"
  features:
    - "App Router architecture"
    - "Server Components & Client Components"
    - "Static Site Generation (SSG)"
    - "Incremental Static Regeneration (ISR)"
    - "Partial Prerendering (PPR)"
    - "Turbopack for development"
    - "SWC compiler for production"

runtime:
  name: "Node.js"
  version: "20.x LTS"
  features:
    - "ES2023 support"
    - "Native ES modules"
    - "Performance optimizations"
```

#### UI & Styling
```yaml
styling:
  framework: "Tailwind CSS"
  version: "4.x"
  features:
    - "Container queries"
    - "Cascade layers"
    - "CSS Grid & Flexbox"
    - "Dark mode support"
    - "Custom CSS variables"

components:
  library: "Shadcn/ui"
  version: "latest"
  foundation: "Radix UI primitives"
  utilities:
    - "class-variance-authority"
    - "clsx"
    - "tailwind-merge"
  icons: "Lucide React"
```

#### State Management
```yaml
server-state:
  library: "TanStack Query"
  version: "5.x"
  features:
    - "Caching strategies"
    - "Background refetching"
    - "Optimistic updates"
    - "Infinite queries"

data-tables:
  library: "TanStack Table"
  version: "8.x"
  features:
    - "Virtual scrolling"
    - "Server-side operations"
    - "Column resizing/sorting"
    - "Row selection"

virtualization:
  library: "TanStack Virtual"
  version: "3.x"
  use-cases:
    - "Large data lists"
    - "Performance optimization"

local-state:
  primary: "React Context API"
  secondary: "Zustand (complex state)"
```

#### Forms & Validation
```yaml
forms:
  library: "React Hook Form"
  version: "7.x"
  features:
    - "Performance optimized"
    - "TypeScript support"
    - "Flexible validation"
    - "Field arrays support"

validation:
  library: "Zod"
  version: "3.x"
  features:
    - "TypeScript-first"
    - "Runtime type checking"
    - "Schema inference"
    - "Custom validators"

integration:
  resolver: "@hookform/resolvers/zod"
  shared-schemas: "Frontend/Backend consistency"
```

#### Internationalization
```yaml
i18n:
  framework: "Next.js native i18n"
  supported-locales: ["en", "es", "fr", "de"]
  features:
    - "Automatic locale detection"
    - "Dynamic route localization"
    - "Server-side rendering support"

date-formatting:
  library: "date-fns"
  version: "3.x"
  features:
    - "Locale-aware formatting"
    - "Timezone support"
    - "Tree-shakable"
```

#### PDF Generation
```yaml
client-pdf:
  library: "@react-pdf/renderer"
  version: "3.x"
  features:
    - "React component-based"
    - "Multi-language support"
    - "Chart integration"
    - "Dynamic templates"
```

### Backend Technology Stack

#### Core Framework & Runtime
```yaml
framework:
  name: "NestJS"
  version: "10.x"
  features:
    - "Decorator-based architecture"
    - "Dependency injection"
    - "Modular structure"
    - "Built-in validation"
    - "Exception filters"
    - "Guards and interceptors"

runtime:
  name: "Node.js"
  version: "20.x LTS"
  package-manager: "npm"
```

#### Database & ORM
```yaml
database:
  primary: "PostgreSQL"
  version: "15.x"
  features:
    - "ACID compliance"
    - "JSON/JSONB support"
    - "Full-text search"
    - "Partitioning"
    - "Point-in-time recovery"

orm:
  name: "Prisma"
  version: "5.x"
  features:
    - "Type-safe database access"
    - "Auto-generated client"
    - "Database migrations"
    - "Connection pooling"
    - "Query optimization"

pattern: "Database-per-service"
```

#### Identity & Access Management
```yaml
iam:
  solution: "Keycloak"
  version: "23.x"
  features:
    - "Single Sign-On (SSO)"
    - "Multi-factor authentication"
    - "OAuth 2.0 / OpenID Connect"
    - "RBAC/ABAC authorization"
    - "User federation (LDAP)"
    - "Session management"

authentication:
  tokens: "JWT (RS256)"
  refresh: "Refresh token rotation"
  session: "Distributed session store"
```

#### Validation & Documentation
```yaml
validation:
  library: "Zod"
  integration: "NestJS custom pipes"
  shared-schemas: "Frontend/Backend consistency"

api-documentation:
  framework: "Swagger/OpenAPI"
  version: "3.1"
  features:
    - "Auto-generated schemas"
    - "Interactive testing"
    - "Type-safe client generation"
```

#### Message Queue & Events
```yaml
message-queue:
  primary: "RabbitMQ"
  alternative: "Apache Kafka"
  patterns:
    - "Event-driven architecture"
    - "Async processing"
    - "Service decoupling"
    - "Dead letter queues"

events:
  pattern: "CQRS (Command Query Responsibility Segregation)"
  event-store: "PostgreSQL event tables"
```

#### Caching & Performance
```yaml
caching:
  distributed: "Redis"
  local: "Node.js memory cache"
  strategies:
    - "Read-through"
    - "Write-behind"
    - "Cache invalidation"

performance:
  connection-pooling: "PgBouncer"
  compression: "gzip/brotli"
  clustering: "Node.js cluster module"
```

#### PDF Generation
```yaml
server-pdf:
  library: "@react-pdf/renderer"
  version: "3.x"
  use-cases:
    - "Server-side document generation"
    - "Scheduled reports"
    - "Bulk document processing"
```

---

## Deployment Architecture

### Container Architecture

```yaml
containerization:
  platform: "Docker"
  orchestration: "Kubernetes"
  registry: "Harbor/AWS ECR"

images:
  frontend:
    base: "node:20-alpine"
    build: "Multi-stage build"
    optimization: "Static file optimization"
    size: "~150MB"
    
  backend:
    base: "node:20-alpine"
    build: "Multi-stage build"
    optimization: "Tree-shaking"
    size: "~200MB per service"
    
  keycloak:
    base: "quay.io/keycloak/keycloak:23"
    customization: "Custom themes and SPI"
    
  database:
    base: "postgres:15-alpine"
    extensions: "pg_stat_statements, pg_trgm"
```

### Kubernetes Deployment

```yaml
# Frontend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: carmen-frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: carmen-frontend
  template:
    metadata:
      labels:
        app: carmen-frontend
    spec:
      containers:
      - name: frontend
        image: carmen/frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "https://api.carmen.io"
        - name: NEXT_PUBLIC_KEYCLOAK_URL
          value: "https://auth.carmen.io"
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
        readinessProbe:
          httpGet:
            path: /api/ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---

# Backend Service Template
apiVersion: apps/v1
kind: Deployment
metadata:
  name: carmen-procurement-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: procurement-service
  template:
    metadata:
      labels:
        app: procurement-service
    spec:
      containers:
      - name: procurement
        image: carmen/procurement-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secrets
              key: procurement-db-url
        - name: KEYCLOAK_URL
          value: "https://auth.carmen.io"
        - name: REDIS_URL
          value: "redis://redis-cluster:6379"
        resources:
          requests:
            memory: "512Mi"
            cpu: "300m"
          limits:
            memory: "1Gi"
            cpu: "800m"
```

### Load Balancer Configuration

```yaml
# API Gateway (Kong)
apiVersion: v1
kind: ConfigMap
metadata:
  name: kong-config
data:
  kong.yaml: |
    _format_version: "3.0"
    services:
      - name: carmen-frontend
        url: http://carmen-frontend:3000
        routes:
          - name: frontend-route
            paths: ["/"]
            
      - name: procurement-service
        url: http://procurement-service:3001
        routes:
          - name: procurement-route
            paths: ["/api/procurement"]
        plugins:
          - name: rate-limiting
            config:
              minute: 100
              hour: 1000
          - name: cors
            config:
              origins: ["https://app.carmen.io"]
              
      - name: keycloak-service
        url: http://keycloak:8080
        routes:
          - name: auth-route
            paths: ["/auth"]
```

---

## Data Architecture

### Database Schema Design

```yaml
database-per-service:
  procurement_db:
    tables:
      - purchase_requests
      - purchase_orders
      - goods_received_notes
      - credit_notes
      - workflow_states
    owner: "procurement_service"
    
  inventory_db:
    tables:
      - inventory_items
      - stock_movements
      - locations
      - adjustments
      - physical_counts
    owner: "inventory_service"
    
  vendor_db:
    tables:
      - vendors
      - vendor_contacts
      - price_lists
      - campaigns
      - performance_metrics
    owner: "vendor_service"
    
  shared_db:
    tables:
      - products
      - categories
      - units_of_measure
      - currencies
      - exchange_rates
    owner: "product_service"
```

### Event Store Schema

```sql
-- Event Store Table
CREATE TABLE event_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    event_metadata JSONB,
    version INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    correlation_id UUID,
    causation_id UUID,
    
    UNIQUE(aggregate_id, version),
    INDEX(aggregate_id, version),
    INDEX(event_type),
    INDEX(created_at),
    INDEX(correlation_id)
);

-- Event Projections
CREATE TABLE procurement_projections (
    id UUID PRIMARY KEY,
    data JSONB NOT NULL,
    version INTEGER NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Security Architecture

### Network Security

```yaml
network-security:
  ingress:
    controller: "NGINX/Traefik"
    ssl-termination: "Let's Encrypt"
    protocols: ["TLSv1.3", "TLSv1.2"]
    
  service-mesh:
    technology: "Istio (optional)"
    features:
      - "mTLS between services"
      - "Traffic management"
      - "Observability"
      
  firewall:
    type: "Network policies"
    rules:
      - "Frontend → API Gateway only"
      - "API Gateway → Services only"
      - "Services → Database only"
      - "External → Frontend/Auth only"
```

### Application Security

```yaml
authentication:
  provider: "Keycloak"
  protocols: ["OAuth 2.0", "OpenID Connect"]
  tokens: "JWT with RS256"
  
authorization:
  model: "RBAC + ABAC hybrid"
  enforcement: "NestJS Guards"
  policies: "Attribute-based rules"
  
data-protection:
  encryption-at-rest: "AES-256"
  encryption-in-transit: "TLS 1.3"
  key-management: "AWS KMS/Azure Key Vault"
  
audit:
  events: "All CRUD operations"
  storage: "Immutable audit log"
  retention: "7 years"
```

---

## Monitoring & Observability

### Monitoring Stack

```yaml
metrics:
  collector: "Prometheus"
  visualization: "Grafana"
  alerting: "AlertManager"
  
logging:
  aggregation: "ELK Stack"
  components:
    - "Elasticsearch (storage)"
    - "Logstash (processing)"
    - "Kibana (visualization)"
    - "Filebeat (shipping)"
    
tracing:
  system: "Jaeger/Zipkin"
  instrumentation: "OpenTelemetry"
  
error-tracking:
  service: "Sentry"
  integration: "All applications"
```

### Health Checks

```yaml
health-endpoints:
  frontend: "/api/health"
  backend: "/health"
  database: "pg_isready"
  keycloak: "/health/ready"
  
monitoring-intervals:
  liveness: "10s"
  readiness: "5s"
  metrics: "15s"
```

---

## Integration Patterns

### External System Integration

```yaml
pos-systems:
  oracle-simphony:
    protocol: "REST API"
    authentication: "API Key"
    sync-frequency: "Real-time"
    
  micros:
    protocol: "SOAP/REST"
    authentication: "Basic Auth"
    sync-frequency: "Every 5 minutes"
    
accounting-systems:
  quickbooks:
    protocol: "REST API"
    authentication: "OAuth 2.0"
    sync-frequency: "Daily batch"
    
  sap:
    protocol: "SAP RFC"
    authentication: "Service User"
    sync-frequency: "Real-time"
    
payment-gateways:
  stripe:
    protocol: "REST API"
    authentication: "API Key"
    webhooks: "Event-driven"
```

### Message Queue Patterns

```yaml
event-patterns:
  command-query-separation:
    commands: "Write operations"
    queries: "Read operations"
    
  event-sourcing:
    events: "Domain events"
    projections: "Read models"
    
  saga-pattern:
    orchestration: "Centralized"
    compensation: "Rollback logic"
    
queue-configuration:
  exchanges:
    - name: "procurement.events"
      type: "topic"
    - name: "inventory.events"
      type: "topic"
      
  queues:
    - name: "purchase-request.created"
      routing-key: "procurement.purchase-request.created"
    - name: "inventory.updated"
      routing-key: "inventory.stock.updated"
```

---

## Performance Specifications

### Response Time Requirements

```yaml
frontend:
  page-load: "<2 seconds (SSG)"
  interaction: "<200ms"
  search: "<500ms"
  
backend:
  api-response: "<200ms (p95)"
  database-query: "<100ms (p95)"
  pdf-generation: "<2 seconds"
  
system:
  concurrent-users: "10,000+"
  transactions-per-day: "1,000,000+"
  uptime-sla: "99.9%"
```

### Scalability Targets

```yaml
horizontal-scaling:
  frontend: "Auto-scaling 2-20 pods"
  backend: "Auto-scaling 2-10 pods per service"
  database: "Read replicas (3+)"
  
resource-allocation:
  frontend-pod: "256Mi-512Mi RAM, 200m-500m CPU"
  backend-pod: "512Mi-1Gi RAM, 300m-800m CPU"
  database: "16GB RAM, 8 CPU cores"
```

---

## Development & CI/CD Pipeline

### Development Workflow

```yaml
version-control:
  system: "Git"
  branching: "GitFlow"
  main-branches: ["main", "develop"]
  
ci-cd:
  platform: "GitHub Actions"
  stages:
    1. "Code quality checks"
    2. "Unit tests"
    3. "Integration tests"
    4. "Security scanning"
    5. "Build Docker images"
    6. "Deploy to staging"
    7. "E2E tests"
    8. "Deploy to production"
    
environments:
  development: "Local Docker Compose"
  staging: "Kubernetes cluster"
  production: "Multi-zone Kubernetes"
```

### Pipeline Configuration

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: carmen/app:${{ github.sha }}
          
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: azure/k8s-deploy@v1
        with:
          manifests: |
            k8s/deployment.yaml
            k8s/service.yaml
```

---

## Disaster Recovery & Business Continuity

### Backup Strategy

```yaml
databases:
  frequency: "Continuous WAL + Daily full backup"
  retention: "30 days point-in-time, 7 years yearly"
  testing: "Monthly restore tests"
  
application-data:
  frequency: "Real-time replication"
  retention: "7 days"
  
configurations:
  frequency: "Git-based versioning"
  backup: "Infrastructure as Code"
```

### Recovery Procedures

```yaml
rto-targets:
  database: "15 minutes"
  application: "30 minutes"
  full-system: "1 hour"
  
rpo-targets:
  database: "5 minutes"
  application-data: "1 minute"
  configurations: "0 (Git-based)"
```

---

## Appendices

### A. Technology Version Matrix

| Component | Technology | Version | Status |
|-----------|------------|---------|--------|
| Frontend Framework | Next.js | 15.x | Production |
| UI Library | Shadcn/ui | Latest | Production |
| Backend Framework | NestJS | 10.x | Production |
| Database | PostgreSQL | 15.x | Production |
| ORM | Prisma | 5.x | Production |
| Authentication | Keycloak | 23.x | Production |
| Message Queue | RabbitMQ | 3.12.x | Production |
| Container Runtime | Docker | 24.x | Production |
| Orchestration | Kubernetes | 1.28.x | Production |
| Monitoring | Prometheus | 2.45.x | Production |

### B. Port Allocation

| Service | Port | Protocol | Access |
|---------|------|----------|---------|
| Frontend | 3000 | HTTP/HTTPS | Public |
| API Gateway | 80/443 | HTTP/HTTPS | Public |
| Keycloak | 8080/8443 | HTTP/HTTPS | Public |
| Procurement Service | 3001 | HTTP | Internal |
| Inventory Service | 3002 | HTTP | Internal |
| Vendor Service | 3003 | HTTP | Internal |
| Product Service | 3004 | HTTP | Internal |
| PostgreSQL | 5432 | TCP | Internal |
| Redis | 6379 | TCP | Internal |
| RabbitMQ | 5672/15672 | AMQP/HTTP | Internal |

### C. Environment Variables

```yaml
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=https://api.carmen.io
NEXT_PUBLIC_KEYCLOAK_URL=https://auth.carmen.io
NEXT_PUBLIC_KEYCLOAK_REALM=carmen-hospitality
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=carmen-web-app

# Backend Environment Variables
DATABASE_URL=postgresql://user:pass@localhost:5432/carmen_db
KEYCLOAK_URL=https://auth.carmen.io
KEYCLOAK_REALM=carmen-hospitality
KEYCLOAK_CLIENT_ID=carmen-api
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672

# Security
JWT_SECRET=${JWT_SECRET}
ENCRYPTION_KEY=${ENCRYPTION_KEY}
DATABASE_ENCRYPTION_KEY=${DB_ENCRYPTION_KEY}
```

---

*This architecture document serves as the definitive technical reference for the Carmen Hospitality System and will be updated as the system evolves.*