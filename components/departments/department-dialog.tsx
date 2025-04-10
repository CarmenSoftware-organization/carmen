"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { X } from "lucide-react"
import { UserSearch, UserType } from "./user-search"

// Department interface
export interface Department {
  id?: number
  code: string
  name: string
  accountCode: string
  isActive: boolean
  heads: UserType[]
}

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

// Component props
interface DepartmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  department: Department | null 
  onSave: (department: DepartmentFormValues) => void
}

export default function DepartmentDialog({
  open,
  onOpenChange,
  department,
  onSave,
}: DepartmentDialogProps) {
  const isEditing = !!department
  
  // Initialize the form
  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: "",
      name: "",
      accountCode: "",
      isActive: true,
      heads: [],
    },
  })

  // Reset form when department changes
  useEffect(() => {
    if (department) {
      form.reset({
        code: department.code,
        name: department.name,
        accountCode: department.accountCode,
        isActive: department.isActive,
        heads: department.heads || [],
      })
    } else {
      form.reset({
        code: "",
        name: "",
        accountCode: "",
        isActive: true,
        heads: [],
      })
    }
  }, [department, form])

  // Handle form submission
  function onSubmit(data: DepartmentFormValues) {
    onSave(data)
  }

  // Add a department head
  const addDepartmentHead = (user: UserType) => {
    const currentHeads = form.getValues("heads");
    if (!currentHeads.some(head => head.id === user.id)) {
      form.setValue("heads", [...currentHeads, user]);
    }
  }

  // Remove a department head
  const removeDepartmentHead = (userId: number) => {
    const currentHeads = form.getValues("heads");
    form.setValue("heads", currentHeads.filter(head => head.id !== userId));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Department" : "Add New Department"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the department details below."
              : "Fill in the department details below to create a new department."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Department" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 