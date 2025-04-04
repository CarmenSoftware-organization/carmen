## Carmen Project Guidelines

### Build & Validation Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint linting
- `npm run analyze:types` - Check TypeScript types
- `npm run analyze:deps` - Check dependencies with depcheck
- `npm run analyze:dead` - Find dead code with ts-prune

### Code Style
- **Components**: PascalCase, one per file, forwardRef when needed
- **Functions/Variables**: camelCase, descriptive names
- **Types**: Interfaces for component props, type aliases for utilities
- **Imports**: External deps first, internal modules second, UI components grouped
- **Error Handling**: try/catch with toast notifications, loading states for async
- **Structure**: Early returns for guards, JSX at end, local components when needed

### Next.js Patterns
- "use client" directive for client components
- Follow App Router conventions for file organization
- Use Shadcn components with `npx shadcn@latest add <component-name>`
- Prefer server components where possible

### TypeScript Usage
- Use explicit return types for functions
- Avoid enums, use const objects with 'as const'
- Use Zod for schema validation
- Prefer interfaces for reusable component props