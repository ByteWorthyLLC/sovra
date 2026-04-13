import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  'data-error'?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground/60',
          'hover:border-ring/50 transition-colors duration-150',
          'focus-visible:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring focus-visible:bg-background focus-visible:shadow-glow-sm',
          'data-[error=true]:border-destructive data-[error=true]:ring-1 data-[error=true]:ring-destructive/50 data-[error=true]:bg-destructive/5',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-muted/30',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
