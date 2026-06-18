import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border border-navy-300 bg-white px-3 py-2 text-base text-navy-900 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-navy-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-900/30 focus-visible:border-navy-900 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
