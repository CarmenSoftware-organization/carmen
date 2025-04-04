"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, ClipboardList } from "lucide-react";

export function CreatePOModal() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleCreateBlankPO = () => {
    setIsOpen(false);
    router.push("/procurement/purchase-orders/create");
  };

  const handleNavigateToCreateFromPR = () => {
    setIsOpen(false);
    // Navigate to the existing Create PO from PR page
    router.push("/procurement/purchase-orders/createfrompr");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New PO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Purchase Order</DialogTitle>
          <DialogDescription>
            Choose how you want to create your new Purchase Order
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
          <Card className="cursor-pointer hover:border-primary" onClick={handleCreateBlankPO}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Blank PO</CardTitle>
              <CardDescription>Create a new blank Purchase Order</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <FileText className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCreateBlankPO}>
                Create Blank PO
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="cursor-pointer hover:border-primary" onClick={handleNavigateToCreateFromPR}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">From Purchase Requests</CardTitle>
              <CardDescription>Create a PO from existing PRs</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-2">
              <ClipboardList className="h-16 w-16 text-muted-foreground" />
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleNavigateToCreateFromPR}>
                Select Purchase Requests
              </Button>
            </CardFooter>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
} 