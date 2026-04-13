import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  heading: string
  body: string
  action?: ReactNode
}

export function EmptyState({ icon, heading, body, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-surface-3 rounded-2xl p-4 text-primary mb-4">{icon}</div>
      <h3 className="text-lg font-semibold">{heading}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mt-1">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
