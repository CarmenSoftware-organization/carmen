"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Pencil, Trash2, User } from "lucide-react"
import { Department } from "./department-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DepartmentViewProps {
  department: Department
  onEdit: () => void
  onDelete: () => void
}

export function DepartmentView({ department, onEdit, onDelete }: DepartmentViewProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl">{department.name}</CardTitle>
            <CardDescription>Department Details</CardDescription>
          </div>
          <Badge variant={department.isActive ? "default" : "secondary"}>
            {department.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Department Code</h3>
            <p className="text-base font-medium">{department.code}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Account Code</h3>
            <p className="text-base font-medium">{department.accountCode || "Not assigned"}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Department Heads</h3>
          {department.heads && department.heads.length > 0 ? (
            <div className="space-y-2">
              {department.heads.map((head) => (
                <div key={head.id} className="flex items-center gap-2 p-2 rounded-md border">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{head.name}</p>
                    <p className="text-sm text-muted-foreground">{head.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No department heads assigned</p>
          )}
        </div>
        
        {/* Edit mode callout */}
        <div className="bg-muted/50 p-4 rounded-md flex items-center justify-between">
          <div>
            <h3 className="font-medium">Need to make changes?</h3>
            <p className="text-sm text-muted-foreground">Switch to edit mode to update department details.</p>
          </div>
          <Button onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Switch to Edit Mode
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Department
        </Button>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Department
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {department.name} department from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
} 