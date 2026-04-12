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
    dotClass: 'bg-zinc-500',
    badgeClass: '',
  },
  running: {
    label: 'Running',
    dotClass: 'bg-blue-500 agent-status-running',
    badgeClass: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  },
  error: {
    label: 'Error',
    dotClass: 'bg-red-500',
    badgeClass: 'border-red-500/30 bg-red-500/10 text-red-400',
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
