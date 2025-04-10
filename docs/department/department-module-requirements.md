# Module Requirements Specification
# Department Management Module

## Document Control
**Document Title:** Department Management Module - Technical Requirements  
**Date:** April 9, 2025  
**Version:** 1.2  
**Technology Stack:** Next.js, Shadcn UI, Lucide Icons

## 1. Introduction

### 1.1 Purpose
This document outlines the technical requirements for implementing the Department Management module using Next.js. It provides developers with the necessary specifications to build, test, and deploy the module successfully.

### 1.2 Scope
The requirements defined in this document pertain specifically to the Department Management module, including its components, interfaces, data structures, and integration points.

## 2. Module Architecture

### 2.1 Component Structure
The Department Management module consists of two primary Next.js components:
1. **DepartmentList** - Table view displaying all departments with actions
2. **DepartmentForm** - Form component for creating and editing departments
3. **DepartmentDialog** - Modal dialog for creating and editing departments

### 2.2 Dependencies
- Next.js 14+
- React 18+
- Tailwind CSS
- Shadcn UI component library including:
  - Button
  - Input
  - Label
  - Switch
  - Table components
  - Dialog components
  - Card components
  - Alert components
  - Command (combobox) components
  - Popover components
  - Badge components
  - Scroll Area components
- Lucide React icons
- React Hook Form (for form handling)
- Zod (for validation)

## 3. Component Requirements

### 3.1 DepartmentList Component

#### 3.1.1 Data Structure
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  department?: string;
}

interface Department {
  id: number;
  code: string;
  name: string;
  heads: User[];
  accountCode: string;
  active: boolean;
}

interface DepartmentListState {
  departments: Department[];
  isDialogOpen: boolean;
  editingDepartment: Department | null;
}
```

#### 3.1.2 Required Functions
- `openDialog(department?: Department)`: Opens modal dialog for creating/editing
- `closeDialog()`: Closes modal dialog
- `saveDepartment(data: Omit<Department, 'id'>)`: Saves new or updated department
- `deleteDepartment(id: number)`: Removes department by ID

#### 3.1.3 UI Requirements
- Responsive table with columns for department details
- Action buttons for edit and delete operations
- Modal dialog for department creation/editing
- Confirmation for delete operations

### 3.2 DepartmentDialog Component

#### 3.2.1 Data Structure
```typescript
interface DepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
  onSave: (data: Omit<Department, "id">) => Promise<void>;
}

interface FormData {
  code: string;
  name: string;
  accountCode: string;
  heads: User[];
  active: boolean;
}
```

#### 3.2.2 Required Functions
- `addHead(user: User)`: Adds a user as department head
- `removeHead(userId: number)`: Removes a user from department heads
- `searchUsers(query: string)`: Searches for users based on query
- `handleSubmit(data: FormData)`: Processes form submission

#### 3.2.3 UI Requirements
- Modal dialog with form fields
- User search/lookup functionality with popover
- Display of selected department heads as badges
- Add/remove functionality for department heads
- Validation with error messaging

### 3.3 DepartmentForm Component

#### 3.3.1 Data Structure
```typescript
interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: Omit<Department, "id">) => Promise<void>;
  onCancel: () => void;
}

interface FormData {
  code: string;
  name: string;
  accountCode: string;
  heads: User[];
  active: boolean;
}
```

#### 3.3.2 Required Functions
- `addHead(user: User)`: Adds a user as department head
- `removeHead(userId: number)`: Removes a user from department heads
- `searchUsers(query: string)`: Searches for users based on query
- `handleSubmit(data: FormData)`: Processes form submission
- `toggleEdit()`: Toggles between view and edit modes

#### 3.3.3 UI Requirements
- Card-based layout with form fields
- Toggle between view and edit modes
- User search/lookup functionality with popover in edit mode
- Display of selected department heads as badges
- Add/remove functionality for department heads in edit mode
- Validation with error messaging

## 4. API Requirements

### 4.1 Data Endpoints
The module requires the following API endpoints (Next.js API routes):

1. **GET /api/departments**
   - Returns: Array of department objects
   - Purpose: Retrieve list of departments

2. **POST /api/departments**
   - Payload: Department object (without ID)
   - Returns: Created department with ID
   - Purpose: Create new department

3. **PUT /api/departments/[id]**
   - Payload: Department object
   - Returns: Updated department
   - Purpose: Update existing department

4. **DELETE /api/departments/[id]**
   - Returns: Success status
   - Purpose: Delete department

5. **GET /api/users**
   - Query Parameters: 
     - search: optional search string to filter users
     - limit: optional number of results to return
   - Returns: Array of user objects
   - Purpose: Retrieve users for department head selection

### 4.2 Data Models
Department model should conform to the following structure:
```typescript
interface Department {
  id: number;              // Unique identifier
  code: string;            // Required, department code
  name: string;            // Required, department name
  heads: User[];           // Array of user objects
  accountCode: string;     // Optional
  active: boolean;         // Department status
}

interface User {
  id: number;              // Unique identifier
  name: string;            // User's full name
  email: string;           // User's email address
  department?: string;     // Optional user's current department
}
```

## 5. Validation Requirements

### 5.1 Department Code
- Required field
- Must be unique within the system
- Max length: 10 characters
- Alphanumeric characters only

### 5.2 Department Name
- Required field
- Max length: 100 characters

### 5.3 Department Heads
- Optional
- Each entry must be a valid user from the system
- Users must have id, name, and email properties

### 5.4 Account Code
- Optional
- Alphanumeric format

## 6. State Management

### 6.1 Local State
- Department list maintained using React state (useState hook)
- Form data handled with React Hook Form
- Dialog open/close state controlled by useState hook
- User search state with query and results

### 6.2 Server State Management
- Optional integration with SWR or React Query for data fetching and caching
- Optimistic updates for improved UX

### 6.3 Events
- Form submission triggers `onSubmit` callback
- Cancel action triggers `onCancel` callback
- Department deletion requires confirmation
- User selection triggers addition to department heads
- Department head removal updates head list

## 7. Error Handling

### 7.1 Form Validation
- Client-side validation using Zod schemas
- Error messages displayed inline
- Form state management with React Hook Form

### 7.2 API Errors
- Error handling for API failures using try/catch
- User-friendly error messages displayed in toast notifications or alert dialogs
- Error state management

## 8. Performance Considerations

### 8.1 Optimization
- Implement server-side pagination for large department lists
- Use Next.js data fetching patterns (getServerSideProps or Server Components)
- Optimize form validation to prevent unnecessary re-renders
- Implement proper memoization using useMemo and useCallback
- Debounce user search queries to prevent excessive API calls

### 8.2 Responsive Design
- Adapt to different screen sizes using Tailwind CSS
- Maintain usability on tablet devices
- Responsive table layout with potential mobile-specific views
- Ensure user lookup dropdown is usable on mobile devices

## 9. Security Requirements

### 9.1 Input Validation
- Sanitize all user inputs
- Validate data types and formats using Zod
- Prevent XSS attacks

### 9.2 Authorization
- Restricted access to authorized users using Next.js middleware
- Role-based permissions for department management
- CSRF protection

## 10. Testing Requirements

### 10.1 Unit Tests
- Test all component functions
- Validate form submission logic
- Test user search and selection functionality

### 10.2 Integration Tests
- Test component integration
- Verify API interactions
- Validate state management
- Test user lookup integration

### 10.3 End-to-End Tests
- Verify all CRUD operations
- Test user search and selection
- Confirm usability requirements
- Validate error handling

## 11. Implementation Guidelines

### 11.1 Code Structure
```
app/
├── api/
│   ├── departments/
│   │   ├── route.ts
│   │   └── [id]/
│   │       └── route.ts
│   └── users/
│       └── route.ts
├── departments/
│   ├── page.tsx
│   ├── [id]/
│   │   └── page.tsx
│   └── new/
│       └── page.tsx
└── components/
    └── departments/
        ├── department-list.tsx
        ├── department-form.tsx
        ├── department-dialog.tsx
        ├── user-search.tsx
        └── department-actions.tsx
```

### 11.2 Styling
- Utilize Tailwind CSS for styling
- Follow shadcn/ui design patterns
- Ensure accessibility compliance
- Use CSS variables for theming

### 11.3 Best Practices
- Implement proper TypeScript types
- Use Next.js Server Components where appropriate
- Separate client and server concerns clearly
- Follow React best practices for hooks and state management
- Create reusable components for user search functionality

## 12. Documentation Requirements

### 12.1 Code Documentation
- Document component purpose and usage
- Document props and functions
- Include TypeScript type definitions
- Document integration points with user management system

### 12.2 User Documentation
- Provide instructions for department management
- Document user lookup functionality
- Document validation rules
- Include troubleshooting information

## Appendix A: Component Implementation Examples

### Example: User Search Component
```tsx
// components/departments/user-search.tsx
"use client";

import { useState, useEffect } from "react";
import { User, SearchIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UserSearchProps {
  onSelect: (user: { id: number; name: string; email: string }) => void;
  selectedUsers: { id: number; name: string; email: string }[];
}

export function UserSearch({ onSelect, selectedUsers }: UserSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users based on search query
  useEffect(() => {
    const fetchUsers = async () => {
      if (!searchQuery) return;
      
      setLoading(true);
      try {
        const response = await fetch(`/api/users?search=${searchQuery}`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Check if user is already selected
  const isUserSelected = (userId: number) => {
    return selectedUsers.some(user => user.id === userId);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full">
          <SearchIcon className="mr-2 h-4 w-4" />
          Search users
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          {loading ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                <ScrollArea className="h-[200px]">
                  {users.map((user) => (
                    <CommandItem
                      key={user.id}
                      onSelect={() => {
                        onSelect(user);
                        setOpen(false);
                      }}
                      disabled={isUserSelected(user.id)}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{user.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </ScrollArea>
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Appendix B: Implementation Checklist

- [ ] Set up Next.js project with TypeScript and Tailwind CSS
- [ ] Install and configure shadcn/ui components
- [ ] Create API routes for department management
- [ ] Create API routes for user lookup/search
- [ ] Implement data models and validation schemas
- [ ] Build DepartmentList component
- [ ] Build DepartmentDialog component with user lookup
- [ ] Build DepartmentForm component with user lookup
- [ ] Create reusable UserSearch component
- [ ] Implement form validation logic
- [ ] Add error handling
- [ ] Create unit and integration tests
- [ ] Implement server-side rendering for department pages
- [ ] Add authorization middleware
- [ ] Document usage and implementation
