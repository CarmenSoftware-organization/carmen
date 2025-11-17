# Developer Onboarding Guide

**Welcome to the Carmen ERP development team!** This guide will help you get up to speed with the Carmen hospitality ERP system in a structured, step-by-step manner.

---

## 📋 Table of Contents

1. [Before You Start](#before-you-start)
2. [Day 1: Environment Setup](#day-1-environment-setup)
3. [Day 2-3: Understanding the System](#day-2-3-understanding-the-system)
4. [Week 1: First Contributions](#week-1-first-contributions)
5. [Week 2-4: Deep Dive](#week-2-4-deep-dive)
6. [Ongoing Learning](#ongoing-learning)

---

## Before You Start

### Prerequisites

**Required Knowledge**:
- ✅ JavaScript/TypeScript fundamentals
- ✅ React basics (hooks, components, state)
- ✅ Basic Git workflow
- ✅ Command line proficiency

**Nice to Have**:
- Next.js experience
- Database concepts (SQL, ORMs)
- Tailwind CSS
- Form handling libraries

### What You'll Learn

By the end of onboarding, you'll be able to:
- Navigate the codebase confidently
- Understand the business domain (hospitality ERP)
- Create and modify components following our patterns
- Work with our type system and mock data
- Find and use our documentation effectively

---

## Day 1: Environment Setup

### Step 1: Clone and Install (30 minutes)

```bash
# Clone the repository
git clone <repository-url>
cd carmen

# Check Node version (should be v20.14.0)
node --version

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Result**: Development server running at `http://localhost:3000`

**Troubleshooting**: See [CLAUDE.md Development Commands](../../CLAUDE.md#development-commands)

---

### Step 2: Explore the Application (1 hour)

**Login and Navigate**:
1. Open `http://localhost:3000`
2. Use any credentials (mock authentication)
3. Explore each module in the sidebar

**Modules to Visit**:
- 📊 Dashboard - Overview and metrics
- 🛒 Procurement - Purchase requests, orders, GRN
- 📦 Inventory Management - Stock, adjustments
- 🤝 Vendor Management - Vendor profiles, price lists
- 🏷️ Product Management - Product catalog
- 👨‍🍳 Operational Planning - Recipes, menu engineering
- 🏪 Store Operations - Requisitions, wastage
- 💰 Finance - Currencies, exchange rates, departments
- ⚙️ System Administration - Users, roles, permissions

**Key Observations**:
- Note the consistent layout and navigation
- Try creating/editing records (they're saved in browser state)
- Notice form validation and error handling
- Explore list views with sorting and filtering

---

### Step 3: Review Project Structure (1 hour)

```bash
# Explore the directory structure
ls -la
ls app/
ls components/
ls lib/
```

**Key Directories**:

```
carmen/
├── app/                          # Next.js 14 App Router
│   ├── (auth)/                   # Authentication routes
│   └── (main)/                   # Main application
│       ├── dashboard/
│       ├── procurement/
│       ├── inventory-management/
│       ├── vendor-management/
│       ├── product-management/
│       ├── operational-planning/
│       ├── store-operations/
│       ├── finance/
│       └── system-administration/
├── components/
│   ├── ui/                       # Shadcn/ui components
│   └── Sidebar.tsx               # Main navigation
├── lib/
│   ├── types/                    # Centralized TypeScript types
│   ├── mock-data/                # Mock data and factories
│   ├── context/                  # React contexts
│   ├── hooks/                    # Custom hooks
│   └── utils/                    # Utility functions
├── prisma/
│   └── schema.prisma             # ABAC permission schema (18 tables)
├── docs/
│   └── app/                      # Business documentation (247 files)
│       ├── data-struc/schema.prisma  # ERP schema (68 tables)
│       ├── finance/
│       ├── inventory-management/
│       ├── procurement/
│       ├── vendor-management/
│       ├── product-management/
│       ├── operational-planning/
│       ├── store-operations/
│       └── system-administration/
└── public/                       # Static assets
```

**Read These Files**:
- [`CLAUDE.md`](../../CLAUDE.md) - Development guidelines (15 min)
- [`README.md`](../../README.md) - Project overview (10 min)
- [`package.json`](../../package.json) - Dependencies (5 min)

---

### Step 4: Run Analysis Tools (30 minutes)

```bash
# Type checking
npm run checktypes

# Linting
npm run lint

# Run all analysis
npm run analyze
```

**Expected Results**:
- ✅ No type errors (or understand existing ones)
- ✅ No linting errors
- ✅ Clean dependency analysis

**If Issues**: Ask your team lead for guidance

---

## Day 2-3: Understanding the System

### Understanding the Business Domain (4 hours)

**Carmen ERP Purpose**: Hospitality-focused ERP for restaurants, hotels, and catering businesses

**Core Business Workflows**:

1. **Procurement Flow**:
   ```
   Purchase Request → Approval → Purchase Order → GRN (Goods Receipt) → Inventory Update
   ```
   **Read**: [PROCESS-procurement.md](procurement/PROCESS-procurement.md) (30 min)

2. **Inventory Flow**:
   ```
   Receive Goods → Update Stock → Cost Calculation (FIFO) → Track Lot Numbers → Stock Valuation
   ```
   **Read**: [DD-lot-based-costing.md](inventory-management/lot-based-costing/DD-lot-based-costing.md) (30 min)

3. **Recipe & Production**:
   ```
   Create Recipe → Calculate Costs → Plan Production → Issue Ingredients → Track Wastage
   ```
   **Read**: [DD-recipes.md](operational-planning/recipe-management/recipes/DD-recipes.md) (30 min)

4. **Vendor Management**:
   ```
   Onboard Vendor → Request Pricing → Compare Quotes → Award Contract → Monitor Performance
   ```
   **Read**: [DD-vendor-directory.md](vendor-management/vendor-directory/DD-vendor-directory.md) (30 min)

**Business Concepts to Understand**:
- **FIFO Costing**: First-In-First-Out lot-based inventory costing
- **Fractional Inventory**: Support for 0.5 kg, 2.3 liters (not just whole numbers)
- **Multi-Currency**: Transactions in different currencies with exchange rates
- **Department Allocation**: Costs allocated to specific departments
- **Approval Workflows**: Multi-level approvals for purchases
- **Menu Engineering**: Star/Plow-horse/Puzzle/Dog classification

**Exercise**: Pick one module and read all its DD documents (2 hours)

---

### Understanding the Type System (2 hours)

**Carmen uses centralized types** in `lib/types/`:

```typescript
// ALWAYS import from centralized location
import {
  User,
  Vendor,
  PurchaseRequest,
  InventoryItem,
  DocumentStatus
} from '@/lib/types'
```

**Type Organization**:

| File | Purpose | Example Types |
|------|---------|---------------|
| `common.ts` | Shared types | Money, DocumentStatus, AuditFields |
| `user.ts` | User system | User, Role, Department, Location |
| `inventory.ts` | Inventory | InventoryItem, StockLevel, LotCost |
| `procurement.ts` | Procurement | PurchaseRequest, PurchaseOrder, GRN |
| `vendor.ts` | Vendors | Vendor, VendorContact, PriceList |
| `product.ts` | Products | Product, Category, Unit |
| `recipe.ts` | Recipes | Recipe, RecipeIngredient, MenuEngineering |
| `finance.ts` | Finance | Currency, ExchangeRate, AccountCode |
| `guards.ts` | Type guards | isUser(), isPurchaseRequest() |
| `converters.ts` | Converters | purchaseRequestToPurchaseOrder() |
| `validators.ts` | Validators | validatePurchaseRequest() |

**Key Pattern - Money Type**:
```typescript
interface Money {
  amount: number;
  currency: string;  // ISO 4217 code (USD, EUR, GBP)
}

// Usage
const price: Money = {
  amount: 100.50,
  currency: 'USD'
};
```

**Exercise**:
1. Open `lib/types/index.ts` and explore exports (15 min)
2. Read `lib/types/common.ts` for shared patterns (20 min)
3. Pick a domain type file and understand its structure (25 min)

**📖 [Detailed Type System Guide](guides/WORKING-WITH-TYPES.md)**

---

### Understanding Mock Data (2 hours)

**Carmen currently uses mock data** (no database connection yet)

**Mock Data Location**: `lib/mock-data/`

```typescript
// Import mock data
import {
  mockUsers,
  mockVendors,
  mockInventoryItems,
  mockPurchaseRequests
} from '@/lib/mock-data'

// Use factories to create test data
import {
  createMockVendor,
  createMockUser
} from '@/lib/mock-data/factories'

const vendor = createMockVendor({
  companyName: 'Test Supplier',
  isActive: true
});
```

**Mock Data Organization**:

| File | Purpose | Example Data |
|------|---------|--------------|
| `users.ts` | Users, roles, departments | mockUsers, mockDepartments |
| `vendors.ts` | Vendor profiles | mockVendors, mockVendorContacts |
| `inventory.ts` | Inventory items | mockInventoryItems, mockStockLevels |
| `procurement.ts` | Purchase data | mockPurchaseRequests, mockPurchaseOrders |
| `products.ts` | Product catalog | mockProducts, mockCategories |
| `recipes.ts` | Recipes | mockRecipes, mockRecipeIngredients |
| `finance.ts` | Financial data | mockCurrencies, mockExchangeRates |
| `factories.ts` | Factory functions | createMock*() functions |

**Exercise**:
1. Browse `lib/mock-data/index.ts` (10 min)
2. Look at a factory function in `factories.ts` (20 min)
3. Create a custom mock object using a factory (30 min)

**📖 [Detailed Mock Data Guide](guides/WORKING-WITH-MOCK-DATA.md)**

---

### Understanding Component Patterns (3 hours)

**Carmen follows consistent component patterns**:

#### 1. List Component Pattern

```typescript
// Standard list structure
import { useMemo, useState } from 'react';

interface SortConfig {
  field: keyof Item;
  direction: 'asc' | 'desc';
}

export function ItemList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'name',
    direction: 'asc'
  });

  // Use useMemo for performance
  const filteredItems = useMemo(() => {
    return items
      .filter(item => /* filtering logic */)
      .sort(/* sorting logic */);
  }, [items, searchTerm, sortConfig]);

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      {/* Sorted table/grid */}
    </div>
  );
}
```

**Example**: `app/(main)/vendor-management/vendors/page.tsx`

#### 2. Form Component Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema
const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
});

type FormData = z.infer<typeof schema>;

export function ItemForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    // Handle submission
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

**Example**: `app/(main)/procurement/purchase-requests/[id]/page.tsx`

#### 3. Detail View Pattern

```typescript
export async function ItemDetail({ params }: { params: { id: string } }) {
  // Fetch/get item data
  const item = mockItems.find(i => i.id === params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      {/* Info sections */}
      {/* Related data */}
    </div>
  );
}
```

**Exercise**:
1. Read a list component: `app/(main)/procurement/purchase-requests/page.tsx` (30 min)
2. Read a form component: `app/(main)/vendor-management/vendors/new/page.tsx` (30 min)
3. Read a detail view: `app/(main)/inventory-management/inventory-overview/[id]/page.tsx` (30 min)

**📖 [Detailed Component Patterns Guide](guides/COMPONENT-PATTERNS.md)**

---

## Week 1: First Contributions

### Day 4: Small Fix or Enhancement (4 hours)

**Choose a Starter Task**:
1. Add a new field to an existing form
2. Add sorting/filtering to a list view
3. Fix a TypeScript type error
4. Improve validation on a form
5. Add a missing UI element

**Steps**:
1. **Pick**: Choose from team backlog or ask team lead
2. **Research**: Read related DD, BR, TS documents
3. **Plan**: Outline your approach
4. **Code**: Make changes following patterns
5. **Test**: Test manually and run `npm run checktypes && npm run lint`
6. **Review**: Request code review from team

**Example Task**: "Add sorting by date to Purchase Requests list"

**Approach**:
1. Read `app/(main)/procurement/purchase-requests/page.tsx`
2. Find the sort logic
3. Add date field to SortConfig type
4. Add date column header with sort controls
5. Test sorting works correctly

---

### Day 5: Documentation Deep Dive (4 hours)

**Pick ONE module and read ALL documentation**:

**Recommended for First Deep Dive**: **Procurement** (simpler than Inventory)

**Reading Order**:
1. **DD-purchase-requests.md** - Data model (30 min)
2. **BR-purchase-requests.md** - Business requirements (30 min)
3. **UC-purchase-requests.md** - Use cases and workflows (30 min)
4. **TS-purchase-requests.md** - Technical implementation (30 min)
5. **FD-purchase-requests.md** - Flow diagrams (20 min)
6. **VAL-purchase-requests.md** - Validation rules (20 min)

**Exercise**: Write a summary in your own words (30 min)

**Question to Answer**:
- What data model is used?
- What are the key business rules?
- What are the main user workflows?
- How is it implemented technically?
- What validations are enforced?

---

## Week 2-4: Deep Dive

### Week 2: Module Expertise

**Goal**: Become an expert in ONE module

**Choose Your Module**:
- **Procurement** - Purchase requests, orders, GRN (recommended for beginners)
- **Inventory** - Stock management, costing (more complex)
- **Vendor Management** - Vendor profiles, price lists
- **Product Management** - Product catalog (simpler)
- **Operational Planning** - Recipes, menu engineering

**Weekly Plan**:
- **Monday**: Read all DD documents for the module
- **Tuesday**: Read all BR and UC documents
- **Wednesday**: Read TS and FD documents
- **Thursday**: Study the actual code implementation
- **Friday**: Complete a medium-complexity task in this module

**Deliverable**: Present module overview to team (15-minute presentation)

---

### Week 3: Cross-Module Integration

**Goal**: Understand how modules interact

**Study These Integration Points**:

1. **Procurement → Inventory**:
   - GRN creates inventory transactions
   - Lot numbers assigned on receiving
   - Stock levels updated
   - Read: `DD-purchase-orders.md` + `DD-inventory-overview.md`

2. **Vendor → Procurement**:
   - Vendor price lists used in purchase requests
   - Vendor selection in purchase orders
   - Read: `DD-price-lists.md` + `DD-purchase-requests.md`

3. **Recipe → Inventory**:
   - Recipe ingredients require inventory items
   - Recipe costing uses inventory costs
   - Production issues ingredients from inventory
   - Read: `DD-recipes.md` + `DD-inventory-overview.md`

4. **Finance → Procurement**:
   - Multi-currency purchase orders
   - Exchange rate conversion
   - Department allocation
   - Read: `DD-currency-management.md` + `DD-purchase-orders.md`

**Exercise**: Create a diagram showing data flow between 2 modules (2 hours)

**📖 [Module Dependencies Reference](reference/MODULE-DEPENDENCIES.md)**

---

### Week 4: Advanced Topics

**Topics to Master**:

1. **State Management** (4 hours)
   - Zustand for global state
   - React Query for server state
   - Context API for user context
   - **Exercise**: Add a new global state slice
   - **Read**: [guides/STATE-MANAGEMENT.md](guides/STATE-MANAGEMENT.md)

2. **Form Handling** (4 hours)
   - React Hook Form patterns
   - Zod validation schemas
   - Error handling and display
   - **Exercise**: Create a complex multi-step form
   - **Read**: [guides/FORM-HANDLING.md](guides/FORM-HANDLING.md)

3. **Database Schema** (4 hours)
   - Understanding Prisma schema
   - Two schema files (ABAC vs ERP)
   - Missing tables and implementation plan
   - **Exercise**: Study one proposed missing table
   - **Read**: [DATABASE-SCHEMA-GUIDE.md](DATABASE-SCHEMA-GUIDE.md)

4. **Performance Optimization** (4 hours)
   - useMemo and useCallback usage
   - React Server Components vs Client Components
   - Code splitting patterns
   - **Exercise**: Optimize a slow component
   - **Read**: [ARCHITECTURE-OVERVIEW.md](ARCHITECTURE-OVERVIEW.md)

---

## Ongoing Learning

### Daily Practices

**Every Day**:
- ✅ Read at least one documentation file
- ✅ Review one component in depth
- ✅ Run `npm run checktypes` before committing
- ✅ Follow the code review checklist

**Every Week**:
- ✅ Complete one module's documentation
- ✅ Contribute to at least one PR review
- ✅ Ask at least one question in team chat
- ✅ Share one thing you learned

**Every Month**:
- ✅ Master one new module
- ✅ Improve documentation (add examples, fix typos)
- ✅ Complete one medium-large feature
- ✅ Mentor a newer team member

---

### Resources

**Essential Reading**:
- **[WIKI-HOME.md](WIKI-HOME.md)** - Documentation hub
- **[MODULE-INDEX.md](MODULE-INDEX.md)** - All 247 documentation files
- **[ARCHITECTURE-OVERVIEW.md](ARCHITECTURE-OVERVIEW.md)** - System architecture
- **[DATABASE-SCHEMA-GUIDE.md](DATABASE-SCHEMA-GUIDE.md)** - Database schema
- **[CLAUDE.md](../../CLAUDE.md)** - Development guidelines

**Practical Guides**:
- **[guides/GETTING-STARTED.md](guides/GETTING-STARTED.md)** - 15-minute quick start
- **[guides/FINDING-DOCUMENTATION.md](guides/FINDING-DOCUMENTATION.md)** - Navigate docs
- **[guides/WORKING-WITH-TYPES.md](guides/WORKING-WITH-TYPES.md)** - Type system
- **[guides/WORKING-WITH-MOCK-DATA.md](guides/WORKING-WITH-MOCK-DATA.md)** - Mock data
- **[guides/COMPONENT-PATTERNS.md](guides/COMPONENT-PATTERNS.md)** - Component patterns
- **[guides/FORM-HANDLING.md](guides/FORM-HANDLING.md)** - Form handling
- **[guides/STATE-MANAGEMENT.md](guides/STATE-MANAGEMENT.md)** - State management

**Reference**:
- **[reference/DOCUMENT-TYPES-EXPLAINED.md](reference/DOCUMENT-TYPES-EXPLAINED.md)** - DD, BR, TS, UC, FD, VAL
- **[reference/NAMING-CONVENTIONS.md](reference/NAMING-CONVENTIONS.md)** - Naming standards
- **[reference/MODULE-DEPENDENCIES.md](reference/MODULE-DEPENDENCIES.md)** - Module relationships
- **[reference/GLOSSARY.md](reference/GLOSSARY.md)** - Terminology

**External Resources**:
- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)

---

### Getting Help

**Questions?** Ask in this order:

1. **Search Documentation**: Use [WIKI-HOME.md](WIKI-HOME.md) search
2. **Check CLAUDE.md**: Read [development guidelines](../../CLAUDE.md)
3. **Ask Team Chat**: Post specific questions with context
4. **Request Code Review**: Get feedback on your approach
5. **Schedule Pairing**: Pair program with senior developers

**Common Questions**:
- "Where do I find X?" → [guides/FINDING-DOCUMENTATION.md](guides/FINDING-DOCUMENTATION.md)
- "How do I implement X?" → Search TS documents for similar features
- "What's the business rule for X?" → Check BR documents
- "What data model is used?" → Check DD documents
- "What's this terminology mean?" → [reference/GLOSSARY.md](reference/GLOSSARY.md)

---

## Checklist: Am I Ready?

After 4 weeks, you should be able to:

**Understanding** (Knowledge):
- [ ] Explain the purpose of Carmen ERP
- [ ] List all 8 business modules
- [ ] Understand the difference between DD, BR, TS, UC, FD, VAL documents
- [ ] Explain the type system and mock data approach
- [ ] Describe the component patterns used
- [ ] Navigate the documentation system confidently

**Skills** (Ability):
- [ ] Create a new list component from scratch
- [ ] Build a form with validation
- [ ] Import types and mock data correctly
- [ ] Find documentation for any feature
- [ ] Debug TypeScript errors
- [ ] Use development tools (checktypes, lint, analyze)

**Contributions** (Delivery):
- [ ] Completed at least 3 small tasks
- [ ] Completed at least 1 medium task
- [ ] Reviewed at least 2 PRs
- [ ] Updated/improved at least 1 documentation file
- [ ] Presented one module overview to team

**If YES to all**: Congratulations! You're ready to take on larger features independently. 🎉

**If NO to some**: That's OK! Focus on those areas and ask for help. Everyone learns at their own pace.

---

## Next Steps

**After Onboarding**:
1. Choose a specialty area (Frontend, Backend, Full-stack)
2. Lead a feature implementation
3. Become the expert for 2-3 modules
4. Mentor new developers

**Welcome to the team!** 🚀

---

**📚 [Back to Wiki Home](WIKI-HOME.md)** | **🗺️ [Module Index](MODULE-INDEX.md)** | **🏗️ [Architecture Guide](ARCHITECTURE-OVERVIEW.md)**
