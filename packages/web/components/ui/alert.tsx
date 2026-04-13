import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertVariant = 'destructive' | 'success' | 'info'

interface AlertProps {
  variant: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  destructive: 'border-destructive bg-destructive/10 text-destructive',
  success: 'border-status-online bg-status-online/10 text-status-online',
  info: 'border-primary bg-primary/10 text-primary',
}

const variantIcons: Record<AlertVariant, typeof AlertCircle> = {
  destructive: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

export function Alert({ variant, title, children, className }: AlertProps) {
  const Icon = variantIcons[variant]

  return (
    <div
      role="alert"
      className={cn(
        'rounded-md border p-3 text-sm flex gap-2',
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-4 w-4 mt-0.5 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}
