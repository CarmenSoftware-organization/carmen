"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, FileText, ClipboardList } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CreatePOModalProps {
  onClose?: () => void;
}

export function CreatePOModal({ onClose }: CreatePOModalProps = {}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleCreateBlankPO = () => {
    if (onClose) onClose();
    setIsOpen(false)
    router.push("/procurement/purchase-orders/create")
  }

  const handleNavigateToCreateFromPR = () => {
    if (onClose) onClose();
    setIsOpen(false)
    // Navigate to the existing Create PO from PR page
    router.push("/procurement/purchase-orders/createfrompr")
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open && onClose) onClose();
    }}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Purchase Order
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Choose how you would like to create a new purchase order.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="cursor-pointer hover:border-primary" onClick={handleCreateBlankPO}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  Blank PO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create a new purchase order from scratch.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:border-primary" onClick={handleNavigateToCreateFromPR}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ClipboardList className="mr-2 h-5 w-5" />
                  From PR
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create a purchase order from purchase requests.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={() => {
            setIsOpen(false);
            if (onClose) onClose();
          }}>
            Cancel
          </Button>
        </CardFooter>
      </DialogContent>
    </Dialog>
  )
} 