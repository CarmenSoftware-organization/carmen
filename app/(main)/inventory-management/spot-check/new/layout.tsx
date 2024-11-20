"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const steps = [
  { id: "setup", label: "Setup", path: "/zones" },
  { id: "location", label: "Location Selection", path: "/location" },
  { id: "items", label: "Item Selection", path: "/items" },
  { id: "review", label: "Review & Start", path: "/review" },
];

export default function NewSpotCheckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const currentPath = pathname?.split("/").pop() || "zones";
  const currentStepIndex = Math.max(
    0,
    steps.findIndex(step => step.path.includes(currentPath))
  );
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="flex flex-col min-h-screen space-y-8 p-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">New Spot Check</h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{format(new Date(), "PPP")}</span>
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>John Doe</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            {steps.map((step, index) => (
              <span
                key={step.id}
                className={cn(
                  "transition-colors",
                  currentStepIndex === index
                    ? "text-primary font-medium"
                    : index < currentStepIndex
                    ? "text-primary"
                    : ""
                )}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
