
"use client"

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
}

export function PolicyProgressBar({ currentStep }: ProgressBarProps) {
  const steps = ["Subject", "Resource", "Actions", "Environment", "Review"];

  return (
    <div className="w-full mt-6">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex-1 text-center">
            <div
              className={cn(
                "mx-auto h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                currentStep > index + 1 ? "bg-green-500 text-white" : "",
                currentStep === index + 1 ? "bg-blue-600 text-white" : "",
                currentStep < index + 1 ? "bg-slate-200 text-slate-500" : ""
              )}
            >
              {currentStep > index + 1 ? '✓' : index + 1}
            </div>
            <p
              className={cn(
                "mt-2 text-xs font-semibold transition-colors",
                currentStep >= index + 1 ? "text-slate-700" : "text-slate-400"
              )}
            >
              {step}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-slate-200 rounded-full h-1.5 mt-2">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
