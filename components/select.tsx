import * as React from "react"
import { cn } from "@/lib/utils"


export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <select
        className={cn(
          "appearance-none flex h-10 w-64 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right",
          className
        )}
        ref={ref}
        value={value}
        onChange={onChange}
        {...props}
      />
    )
  }
)
Select.displayName = "Select"

export { Select }

