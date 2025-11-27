# Development Environment Setup Guide

**Document Type**: Development Setup & Configuration Manual  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Purpose**: Complete development environment setup for Carmen ERP recreation

---

## 🎯 Overview

This guide provides comprehensive setup instructions for recreating the Carmen ERP development environment. Following this guide ensures consistent development experience across all team members and environments.

### Technology Stack Requirements
- **Runtime**: Node.js v20.14.0+ 
- **Package Manager**: npm v10.7.0+
- **Database**: PostgreSQL 15+ (recommended)
- **Cache**: Redis 6+ (optional for production)
- **Development Tools**: VS Code with specific extensions

---

## 🏗️ System Prerequisites

### Operating System Requirements
```bash
# macOS (Recommended)
macOS 12.0+ (Monterey or later)
Xcode Command Line Tools

# Ubuntu/Debian
Ubuntu 20.04 LTS+ or Debian 11+
build-essential package

# Windows (WSL2 Required)
Windows 10 version 2004+ or Windows 11
WSL2 with Ubuntu 20.04+
```

### Node.js Installation
```bash
# Method 1: Node Version Manager (Recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20.14.0
nvm use 20.14.0
nvm alias default 20.14.0

# Method 2: Direct Download
# Download from https://nodejs.org/en/download/
# Install the LTS version (20.14.0+)

# Verify installation
node --version  # Should output v20.14.0+
npm --version   # Should output 10.7.0+
```

### Git Configuration
```bash
# Configure Git (replace with your details)
git config --global user.name "Your Name"
git config --global user.email "your.email@company.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input  # macOS/Linux
git config --global core.autocrlf true   # Windows

# Optional: Configure Git aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

---

## 🚀 Project Setup

### Repository Clone & Initial Setup
```bash
# Clone the repository
git clone https://github.com/your-org/carmen-erp.git
cd carmen-erp

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Generate initial database schema (if using database)
npm run db:generate

# Start development server
npm run dev
```

### Environment Configuration
Create `.env.local` with the following configuration:

```bash
# =============================================================================
# CARMEN ERP - DEVELOPMENT ENVIRONMENT CONFIGURATION
# =============================================================================

# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3006
PORT=3006

# Database Configuration
DATABASE_URL="postgresql://carmen_user:carmen_pass@localhost:5432/carmen_dev"
DIRECT_URL="postgresql://carmen_user:carmen_pass@localhost:5432/carmen_dev"

# Authentication & Security
NEXTAUTH_URL=http://localhost:3006
NEXTAUTH_SECRET="your-development-secret-key-here"
JWT_SECRET="your-jwt-secret-here"

# Email Configuration (Development)
EMAIL_FROM="noreply@carmen-dev.local"
SMTP_HOST="localhost"
SMTP_PORT=1025
SMTP_USER=""
SMTP_PASSWORD=""

# File Upload & Storage
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760  # 10MB
ALLOWED_FILE_TYPES="image/*,application/pdf,.doc,.docx,.xls,.xlsx"

# Logging & Monitoring
LOG_LEVEL=debug
ENABLE_REQUEST_LOGGING=true

# Development Tools
NEXT_PUBLIC_ENABLE_DEVTOOLS=true
ANALYZE_BUNDLE=false

# Redis (Optional - for caching)
REDIS_URL="redis://localhost:6379"

# Third-party Integrations (Development)
WEBHOOK_SECRET="dev-webhook-secret"
API_RATE_LIMIT=1000  # requests per hour

# Feature Flags
ENABLE_ADVANCED_ANALYTICS=true
ENABLE_EXPERIMENTAL_FEATURES=true
```

### Package.json Dependencies
The project uses these core dependencies:

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.1",
    "@radix-ui/react-alert-dialog": "^1.1.2",
    "@radix-ui/react-avatar": "^1.1.1",
    "@radix-ui/react-checkbox": "^1.1.2",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-popover": "^1.1.2",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.1",
    "@radix-ui/react-tabs": "^1.1.1",
    "@radix-ui/react-toast": "^1.2.2",
    "@radix-ui/react-tooltip": "^1.1.3",
    "@hookform/resolvers": "^3.3.2",
    "@tanstack/react-query": "^5.8.4",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "next": "14.0.3",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-hook-form": "^7.48.2",
    "tailwind-merge": "^2.0.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.22.4",
    "zustand": "^4.4.7"
  },
  "devDependencies": {
    "@types/node": "20.9.0",
    "@types/react": "18.2.37",
    "@types/react-dom": "18.2.15",
    "@typescript-eslint/eslint-plugin": "^6.10.0",
    "@typescript-eslint/parser": "^6.10.0",
    "autoprefixer": "10.4.16",
    "eslint": "8.53.0",
    "eslint-config-next": "14.0.3",
    "postcss": "8.4.31",
    "tailwindcss": "3.3.5",
    "typescript": "5.2.2",
    "vitest": "^0.34.6"
  }
}
```

---

## 🗄️ Database Setup

### PostgreSQL Installation & Configuration
```bash
# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Windows (WSL2)
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo service postgresql start
```

### Database User & Schema Setup
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create Carmen ERP user and database
CREATE USER carmen_user WITH PASSWORD 'carmen_pass';
CREATE DATABASE carmen_dev OWNER carmen_user;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE carmen_dev TO carmen_user;

-- Connect to Carmen database
\c carmen_dev carmen_user

-- Create necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Exit PostgreSQL
\q
```

### Initial Schema Migration
```bash
# Generate Prisma client (if using Prisma)
npx prisma generate

# Run initial migrations
npx prisma db push

# Seed development data
npm run db:seed
```

---

## 🔧 Development Tools Configuration

### VS Code Setup
Install the following essential extensions:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json",
    "redhat.vscode-yaml",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-close-tag"
  ]
}
```

### VS Code Settings
Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  }
}
```

### ESLint Configuration
The project includes a comprehensive ESLint configuration:

```javascript
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-empty-function": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "build/"
  ]
}
```

### Prettier Configuration
Create `.prettierrc`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

---

## 🎨 Styling & UI Development

### Tailwind CSS Configuration
The project uses a comprehensive Tailwind configuration:

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
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

### Shadcn/ui Component Installation
```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Install essential components
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add table
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add tooltip
```

---

## ⚙️ Development Scripts

### Essential Commands
```bash
# Development server (with hot reload)
npm run dev              # Starts on http://localhost:3006

# Production build
npm run build           # Creates optimized production build
npm run start           # Starts production server

# Code quality
npm run lint            # ESLint analysis
npm run lint:fix        # Fix auto-fixable issues
npm run checktypes      # TypeScript type checking

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run tests once
npm run test:coverage   # Generate coverage report

# Analysis
npm run analyze         # Complete code analysis
npm run analyze:bundle  # Bundle size analysis
npm run analyze:deps    # Dependency analysis
npm run analyze:dead    # Dead code detection

# Database operations
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:migrate      # Run migrations
npm run db:seed         # Seed development data
npm run db:reset        # Reset database

# Utilities
npm run clean           # Clean build artifacts
npm run format          # Format code with Prettier
npm run type-check      # Comprehensive type checking
```

### Custom Development Scripts
Create additional helpful scripts in `package.json`:

```json
{
  "scripts": {
    "dev:debug": "NODE_OPTIONS='--inspect' next dev -p 3006",
    "dev:turbo": "next dev --turbo -p 3006",
    "build:analyze": "ANALYZE=true npm run build",
    "start:inspect": "NODE_OPTIONS='--inspect' npm start",
    "db:studio": "npx prisma studio",
    "db:backup": "pg_dump carmen_dev > backup_$(date +%Y%m%d_%H%M%S).sql",
    "clean:all": "rm -rf .next node_modules && npm install",
    "update:deps": "npm update && npm audit fix",
    "check:all": "npm run lint && npm run checktypes && npm run test:run"
  }
}
```

---

## 🔍 Development Workflow

### Daily Development Routine
```bash
# 1. Start your development session
cd carmen-erp
git pull origin main
npm install  # If package.json changed

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Start development server
npm run dev

# 4. Development cycle
# - Write code
# - Check types: npm run checktypes
# - Lint code: npm run lint
# - Test changes: npm run test

# 5. Before committing
npm run check:all  # Runs all quality checks

# 6. Commit and push
git add .
git commit -m "feat: implement your feature"
git push origin feature/your-feature-name
```

### Code Quality Gates
Before any commit, ensure:

```bash
✅ TypeScript compilation passes
✅ ESLint shows no errors
✅ All tests pass
✅ No console.log statements in production code
✅ Import paths use @ alias consistently
✅ Components follow naming conventions
```

### Hot Reload Configuration
The development server supports hot reload for:
- React components
- TypeScript files
- CSS/Tailwind changes
- Environment variables (requires restart)
- Configuration files (requires restart)

---

## 🚀 Performance Optimization

### Development Performance Tips
```bash
# Use Turbo Mode for faster builds
npm run dev:turbo

# Enable SWC for faster compilation
# (Already configured in next.config.js)

# Optimize node_modules
npm ci  # Use instead of npm install in CI

# Clear Next.js cache if issues
rm -rf .next

# Profile bundle size
npm run build:analyze
```

### Memory Usage Optimization
```bash
# Increase Node.js memory limit if needed
export NODE_OPTIONS="--max-old-space-size=4096"

# Or add to package.json scripts
"dev": "NODE_OPTIONS='--max-old-space-size=4096' next dev -p 3006"
```

---

## 🔐 Security Configuration

### Development Security Setup
```bash
# Generate secure secrets
openssl rand -hex 32  # For NEXTAUTH_SECRET
openssl rand -hex 32  # For JWT_SECRET

# Set file permissions (macOS/Linux)
chmod 600 .env.local  # Restrict access to environment file
chmod 755 uploads/    # Upload directory permissions
```

### Security Headers (Development)
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
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
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

---

## 📱 Mobile Development Setup

### Responsive Development Tools
```bash
# Install Chrome DevTools extensions
# - React Developer Tools
# - Redux DevTools
# - Lighthouse

# Test responsive design
# Use Chrome DevTools device simulation
# Test on actual devices via network IP
```

### Device Testing Configuration
```javascript
// Access development server from mobile devices
// Find your IP address
ip addr show  # Linux
ifconfig      # macOS
ipconfig      # Windows

// Access via: http://YOUR_IP:3006
```

---

## 📊 Monitoring & Debugging

### Development Monitoring Tools
```bash
# Bundle analysis
npm run analyze:bundle

# Performance monitoring
# Use React DevTools Profiler
# Use Chrome DevTools Performance tab

# Database monitoring
npm run db:studio  # Opens Prisma Studio

# Log analysis
# Check console output
# Use debugging breakpoints
```

### Debug Configuration
```javascript
// VS Code launch.json for debugging
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "attach",
      "port": 9229,
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3006"
    }
  ]
}
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

#### Port Already in Use
```bash
# Find process using port 3006
lsof -ti:3006  # macOS/Linux
netstat -ano | findstr :3006  # Windows

# Kill process
kill -9 $(lsof -ti:3006)  # macOS/Linux
```

#### Node Version Issues
```bash
# Check Node version
node --version

# Switch to correct version
nvm use 20.14.0

# Clear npm cache
npm cache clean --force
```

#### TypeScript Errors
```bash
# Restart TypeScript server in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Check TypeScript configuration
npx tsc --noEmit
```

#### Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test connection
psql -U carmen_user -d carmen_dev -h localhost
```

#### Build Failures
```bash
# Clean installation
rm -rf .next node_modules package-lock.json
npm install

# Check for conflicting dependencies
npm ls
```

### Getting Help
- **Documentation**: Check project README and docs/ folder
- **Issues**: Create GitHub issue with reproduction steps
- **Team Chat**: Use designated development channel
- **Debugging**: Use VS Code debugger and Chrome DevTools

---

## ✅ Setup Verification Checklist

### Essential Verification Steps
- [ ] Node.js v20.14.0+ installed and active
- [ ] npm v10.7.0+ available
- [ ] Git configured with user details
- [ ] Repository cloned successfully
- [ ] Dependencies installed without errors
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] Development server starts on port 3006
- [ ] TypeScript compilation passes
- [ ] ESLint runs without errors
- [ ] Hot reload works for components
- [ ] VS Code extensions installed
- [ ] Tailwind CSS IntelliSense working

### Development Features Verification
- [ ] Can create new components
- [ ] Can import from @/ alias paths
- [ ] Can access all application routes
- [ ] Can modify and see live changes
- [ ] Can run tests successfully
- [ ] Can build for production
- [ ] Can access database via Prisma Studio
- [ ] Can generate API documentation

### Performance Verification
- [ ] Development server starts in <10 seconds
- [ ] Hot reload responds in <2 seconds
- [ ] TypeScript compilation completes in <5 seconds
- [ ] Test suite runs in reasonable time
- [ ] No memory leaks during development

---

**Next Steps**: Complete environment setup and proceed to [Deployment & Operations Manual](../10-deployment-operations/deployment-guide.md) for production deployment guidance.

*This setup guide provides complete development environment configuration for Carmen ERP recreation with modern development practices and comprehensive tooling.*