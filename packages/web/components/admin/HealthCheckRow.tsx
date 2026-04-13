interface HealthCheckRowProps {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  latencyMs?: number
  lastChecked: string
}

const STATUS_DOT_COLOR: Record<HealthCheckRowProps['status'], string> = {
  healthy: 'status-dot-online',
  degraded: 'status-dot-warning',
  down: 'status-dot-error',
}

const STATUS_LABEL: Record<HealthCheckRowProps['status'], string> = {
  healthy: 'Healthy',
  degraded: 'Degraded',
  down: 'Down',
}

export function HealthCheckRow({ name, status, latencyMs, lastChecked }: HealthCheckRowProps) {
  return (
    <div className="py-3 flex items-center gap-3">
      <span
        className={['w-2 h-2 rounded-full shrink-0 transition-colors duration-200', STATUS_DOT_COLOR[status]].join(' ')}
      />
      <span className="text-sm font-semibold flex-1">{name}</span>
      <span className="text-xs text-muted-foreground">{STATUS_LABEL[status]}</span>
      {latencyMs != null && status === 'healthy' && (
        <span className="text-xs text-muted-foreground">({latencyMs}ms)</span>
      )}
      <span className="text-xs text-muted-foreground/60 ml-2">{lastChecked}</span>
    </div>
  )
}
