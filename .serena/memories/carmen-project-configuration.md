# Carmen Project Configuration

## Development Commands
```bash
# Core Commands
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run checktypes   # TypeScript checking
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)

# Analysis Commands
npm run analyze              # All analysis tools
npm run analyze:types        # TypeScript type checking
npm run analyze:lint         # ESLint analysis
npm run analyze:deps         # Dependency analysis
npm run analyze:dead         # Dead code detection
npm run analyze:bundle       # Bundle analysis
```

## Key Dependencies
### Core Framework
- Next.js 14.2.15 (App Router)
- React 18
- TypeScript 5.0+

### UI & Styling
- Tailwind CSS 3.4.1 + tailwindcss-animate
- Radix UI primitives (40+ components)
- Lucide React icons
- Shadcn/ui component system

### Forms & Validation
- React Hook Form 7.50.0
- Zod 3.25.76 (schema validation)
- @hookform/resolvers 3.10.0

### State Management
- Zustand 5.0.1 (global state)
- @tanstack/react-query 5.59.15 (server state)

### Development Tools
- Vitest 3.2.4 (testing framework)
- ESLint + TypeScript ESLint
- Bundle Analyzer
- depcheck, ts-prune (code analysis)

## TypeScript Configuration
- Strict mode enabled
- Absolute imports with `@/*` prefix
- Next.js plugin integration
- Docs excluded from compilation

## Tailwind Configuration  
- Dark mode support (class-based)
- Custom HSL color system
- Extended border radius variables
- Custom animations (accordion)
- Theme variables for consistent design