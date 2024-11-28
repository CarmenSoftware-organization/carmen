"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  title: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  className?: string
  onStepClick?: (step: number) => void
}

export function StepIndicator({
  steps,
  currentStep,
  className,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
        {steps.map((step, index) => (
          <li key={step.title} className="md:flex-1">
            <div
              className={cn(
                "group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4",
                index < currentStep
                  ? "border-primary"
                  : index === currentStep
                  ? "border-primary"
                  : "border-border",
                onStepClick && "cursor-pointer"
              )}
              onClick={() => onStepClick?.(index)}
            >
              <span className="text-sm font-medium">
                <span className="flex items-center gap-2">
                  {index < currentStep ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full text-xs",
                        index === currentStep
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                  <span
                    className={cn(
                      index <= currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </span>
                </span>
              </span>
              {step.description && (
                <span
                  className={cn(
                    "text-sm",
                    index <= currentStep
                      ? "text-muted-foreground"
                      : "text-muted-foreground/60"
                  )}
                >
                  {step.description}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>
    </nav>
  )
}
