'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type AgentStatus = 'idle' | 'running' | 'error'

interface AgentStatusBadgeProps {
  status: AgentStatus
}

const STATUS_CONFIG: Record<AgentStatus, { label: string; dotClass: string; badgeClass: string }> = {
  idle: {
    label: 'Idle',
    dotClass: 'status-dot-idle',
    badgeClass: '',
  },
  running: {
    label: 'Running',
    dotClass: 'status-dot-online agent-status-running',
    badgeClass: 'text-status-online border-status-online/30 bg-status-online/10',
  },
  error: {
    label: 'Error',
    dotClass: 'status-dot-error',
    badgeClass: 'border-status-error/30 bg-status-error/10 text-status-error',
  },
}

export function AgentStatusBadge({ status }: AgentStatusBadgeProps) {
  const config = STATUS_CONFIG[status]

  return (
    <Badge
      variant={status === 'error' ? 'destructive' : 'secondary'}
      className={cn('gap-1.5', config.badgeClass)}
    >
      <span
        className={cn('w-1.5 h-1.5 rounded-full', config.dotClass)}
        aria-label={`Agent status: ${status}`}
      />
      {config.label}
    </Badge>
  )
}
