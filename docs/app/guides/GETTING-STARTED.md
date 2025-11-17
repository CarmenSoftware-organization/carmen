# Getting Started - 15-Minute Quick Start

**Get up and running with Carmen ERP in 15 minutes.** This guide covers installation, basic navigation, and your first code changes.

---

## ⏱️ Time Estimate: 15 Minutes

- **Setup**: 5 minutes
- **Exploration**: 5 minutes
- **First Code Change**: 5 minutes

---

## Prerequisites

```bash
# Required
node --version  # Should be v20.14.0
npm --version   # Should be v10.7.0

# Nice to have
git --version
```

**Knowledge**: Basic JavaScript/TypeScript and React

---

## Step 1: Setup (5 minutes)

### Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd carmen

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected Output**:
```
▲ Next.js 14.x
- Local:    http://localhost:3000
- Ready in 2.5s
```

### Verify Installation

Open **http://localhost:3000** in your browser.

**✅ Success Indicators**:
- Login page displays
- No console errors
- Tailwind CSS styles loaded

**❌ Common Issues**:
- **Port 3000 in use**: `killall node` or change port in package.json
- **Module not found**: Delete `node_modules` and run `npm install` again
- **TypeScript errors**: Run `npm run checktypes` to see details

---

## Step 2: Explore the Application (5 minutes)

### Login

**Credentials**: Any email/password (mock authentication)

**Example**:
- Email: `user@example.com`
- Password: `password`

### Navigate Modules

**Left Sidebar** - 8 Main Modules:

```
📊 Dashboard
💰 Finance Management
📦 Inventory Management
🛒 Procurement Management
🤝 Vendor Management
🏷️ Product Management
🏪 Store Operations
👨‍🍳 Operational Planning
⚙️ System Administration
```

**Try This**:
1. Click **Procurement → Purchase Requests**
2. Click **+ New Purchase Request**
3. Fill out the form (validation in action)
4. Click **Create** (saved to browser state)
5. View the created request in the list

**Key Observations**:
- ✅ Consistent layout across pages
- ✅ Form validation with error messages
- ✅ Sorting and filtering on list pages
- ✅ Responsive design (try resizing)

---

## Step 3: Your First Code Change (5 minutes)

### Change 1: Update Page Title

**File**: `app/(main)/procurement/purchase-requests/page.tsx`

**Before**:
```typescript
<h1 className="text-2xl font-semibold">Purchase Requests</h1>
```

**After**:
```typescript
<h1 className="text-2xl font-semibold">My Purchase Requests</h1>
```

**Save and Check**: Page should hot-reload automatically

---

### Change 2: Add a New Column to the List

**File**: `app/(main)/procurement/purchase-requests/page.tsx`

Find the table headers and add a new column:

**Add after Total column**:
```typescript
<TableHead>Department</TableHead>
```

**Add corresponding cell**:
```typescript
<TableCell>{request.department?.name || 'N/A'}</TableCell>
```

**Save and Check**: New column appears in the table

---

### Verify Your Changes

```bash
# Run type checking
npm run checktypes

# Run linting
npm run lint
```

**✅ All checks should pass**

---

## Next Steps

**Recommended Path**:

1. **Read Full Onboarding** (4 hours):
   - **[DEVELOPER-ONBOARDING.md](../DEVELOPER-ONBOARDING.md)** - Complete onboarding journey

2. **Explore Documentation** (1 hour):
   - **[WIKI-HOME.md](../WIKI-HOME.md)** - Documentation hub
   - **[MODULE-INDEX.md](../MODULE-INDEX.md)** - All 247 documentation files

3. **Understand Architecture** (2 hours):
   - **[ARCHITECTURE-OVERVIEW.md](../ARCHITECTURE-OVERVIEW.md)** - System design
   - **[DATABASE-SCHEMA-GUIDE.md](../DATABASE-SCHEMA-GUIDE.md)** - Database schema

4. **Learn Patterns** (3 hours):
   - **[COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md)** - Component best practices
   - **[FORM-HANDLING.md](FORM-HANDLING.md)** - Form patterns
   - **[STATE-MANAGEMENT.md](STATE-MANAGEMENT.md)** - State management

5. **Deep Dive One Module** (4 hours):
   - Pick a module (e.g., Procurement)
   - Read all its documentation (DD, BR, TS, UC, FD, VAL)
   - Study the actual code implementation

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm start                # Start production server

# Quality
npm run lint             # Run ESLint
npm run checktypes       # TypeScript type checking
npm run test             # Run tests
npm run analyze          # Run all analysis tools

# Analysis
npm run analyze:types    # Type checking only
npm run analyze:lint     # Linting only
npm run analyze:deps     # Dependency analysis
npm run analyze:dead     # Dead code detection
npm run analyze:bundle   # Bundle analysis
```

---

## Cheat Sheet

### Import Patterns

```typescript
// Types (ALWAYS from centralized location)
import { User, Vendor, PurchaseRequest } from '@/lib/types'

// Mock data
import { mockUsers, mockVendors } from '@/lib/mock-data'

// Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Utilities
import { cn } from '@/lib/utils'
import { formatDate, formatMoney } from '@/lib/formatters'
```

### Form Pattern

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1, 'Required'),
})

const form = useForm({
  resolver: zodResolver(schema),
})
```

### Server Action Pattern

```typescript
'use server'

export async function createItem(data: ItemInput) {
  // Validate
  const validated = schema.parse(data)

  // Create (currently mock data)
  // Future: await prisma.item.create({ data: validated })

  // Revalidate
  revalidatePath('/items')

  return { success: true, id: 'new-id' }
}
```

---

## Common Patterns at a Glance

### List Page

```typescript
export default function ItemsPage() {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() =>
    items.filter(i => i.name.includes(search)),
    [items, search]
  )
  return <DataTable data={filtered} />
}
```

### Detail Page

```typescript
export default async function ItemPage({ params }: Props) {
  const item = await getItemById(params.id)
  if (!item) notFound()
  return <ItemDetail item={item} />
}
```

### Form Page

```typescript
export default function NewItemPage() {
  const form = useForm<ItemInput>({
    resolver: zodResolver(itemSchema)
  })
  async function onSubmit(data: ItemInput) {
    const result = await createItem(data)
    if (result.success) router.push(`/items/${result.id}`)
  }
  return <Form {...form} onSubmit={onSubmit} />
}
```

---

## Troubleshooting

**Problem**: Type errors after changes

**Solution**:
```bash
npm run checktypes  # See detailed errors
```

**Problem**: Linting errors

**Solution**:
```bash
npm run lint -- --fix  # Auto-fix many issues
```

**Problem**: Changes not appearing

**Solution**:
1. Check browser console for errors
2. Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
3. Restart dev server (`npm run dev`)

**Problem**: Module not found

**Solution**:
```bash
rm -rf node_modules .next
npm install
```

---

## Need Help?

**Documentation**:
- **[WIKI-HOME.md](../WIKI-HOME.md)** - Start here
- **[FINDING-DOCUMENTATION.md](FINDING-DOCUMENTATION.md)** - How to navigate docs
- **[DEVELOPER-ONBOARDING.md](../DEVELOPER-ONBOARDING.md)** - Full onboarding

**Code**:
- **[CLAUDE.md](../../../CLAUDE.md)** - Development guidelines
- **[ARCHITECTURE-OVERVIEW.md](../ARCHITECTURE-OVERVIEW.md)** - Architecture guide

**Questions?** Ask your team lead or post in team chat with:
1. What you're trying to do
2. What you've tried
3. Error message (if any)
4. Relevant code snippet

---

**✅ You're Ready!** Start with a small task and gradually explore more complex features.

**🏠 [Back to Wiki](../WIKI-HOME.md)** | **📚 [Full Onboarding](../DEVELOPER-ONBOARDING.md)** | **🗺️ [Module Index](../MODULE-INDEX.md)**
