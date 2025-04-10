"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Eye, Save, Edit, X, User } from "lucide-react"
import { Department } from "./department-dialog"
import { UserSearch, UserType } from "./user-search"
import { DepartmentView } from "./department-view"

// Validation schema
const departmentSchema = z.object({
  code: z.string().min(2, {
    message: "Code must be at least 2 characters.",
  }),
  name: z.string().min(3, {
    message: "Name must be at least 3 characters.",
  }),
  accountCode: z.string().min(2, {
    message: "Account code must be at least 2 characters.",
  }),
  isActive: z.boolean().default(true),
  heads: z.array(z.object({
    id: z.number(),
    name: z.string(),
    email: z.string().email(),
    department: z.string().optional(),
  })).default([]),
})

type DepartmentFormValues = z.infer<typeof departmentSchema>

interface DepartmentFormProps {
  department?: Department
  onSubmit: (data: Department) => Promise<void>
  onDelete?: (departmentId: number) => Promise<void>
  isNew?: boolean
}

export function DepartmentForm({ department, onSubmit, onDelete, isNew = false }: DepartmentFormProps) {
  const [isEditMode, setIsEditMode] = useState(isNew)

  // Initialize the form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: department ? {
      code: department.code,
      name: department.name,
      accountCode: department.accountCode,
      isActive: department.isActive,
      heads: department.heads || [],
    } : {
      code: "",
      name: "",
      accountCode: "",
      isActive: true,
      heads: [],
    },
  })

  // Toggle between view and edit modes
  const toggleEditMode = () => {
    if (isEditMode) {
      // Reset form when canceling edit
      form.reset(department ? {
        code: department.code,
        name: department.name,
        accountCode: department.accountCode,
        isActive: department.isActive,
        heads: department.heads || [],
      } : {
        code: "",
        name: "",
        accountCode: "",
        isActive: true,
        heads: [],
      })
    }
    setIsEditMode(!isEditMode)
  }

  // Handle form submission
  async function handleSubmit(data: DepartmentFormValues) {
    await onSubmit({
      ...data,
      id: department?.id,
    })
    if (!isNew) {
      setIsEditMode(false)
    }
  }

  // Add a department head
  const addDepartmentHead = (user: UserType) => {
    const currentHeads = form.getValues("heads")
    if (!currentHeads.some(head => head.id === user.id)) {
      form.setValue("heads", [...currentHeads, user])
    }
  }

  // Remove a department head
  const removeDepartmentHead = (userId: number) => {
    const currentHeads = form.getValues("heads")
    form.setValue("heads", currentHeads.filter(head => head.id !== userId))
  }

  // Handle delete
  const handleDelete = async () => {
    if (department?.id && onDelete) {
      await onDelete(department.id)
    }
  }

  // If not in edit mode and not a new department, show view mode
  if (!isEditMode && !isNew && department) {
    return <DepartmentView 
      department={department} 
      onEdit={toggleEditMode} 
      onDelete={handleDelete} 
    />
  }

  // Edit mode UI
  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isNew ? "Create New Department" : "Edit Department"}</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. FIN-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique identifier for the department.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accountCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. DEPT-FIN-001" {...field} />
                    </FormControl>
                    <FormDescription>
                      The accounting code for this department.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Finance Department" {...field} />
                  </FormControl>
                  <FormDescription>
                    The full name of the department.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="heads"
              render={() => (
                <FormItem>
                  <FormLabel>Department Heads</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 min-h-10 p-2 border rounded-md">
                        {form.watch("heads").length > 0 ? (
                          form.watch("heads").map((head) => (
                            <Badge key={head.id} variant="secondary" className="py-1 px-2">
                              {head.name}
                              <button 
                                type="button" 
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => removeDepartmentHead(head.id)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground py-1">
                            No department heads assigned
                          </p>
                        )}
                      </div>
                      <UserSearch 
                        onSelect={addDepartmentHead} 
                        selectedUsers={form.watch("heads")} 
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Assign one or more users as department heads.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Set whether this department is currently active.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            {!isNew && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={toggleEditMode}
              >
                <Eye className="mr-2 h-4 w-4" />
                View Department
              </Button>
            )}
            <div className="flex space-x-2">
              {isNew ? (
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Create Department
                </Button>
              ) : (
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
} 