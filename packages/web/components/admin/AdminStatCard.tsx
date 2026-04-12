import type { LucideIcon } from 'lucide-react'

interface Delta {
  value: number
  positive: boolean
}

interface AdminStatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  delta?: Delta
}

export function AdminStatCard({ label, value, icon: Icon, delta }: AdminStatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-zinc-700 transition-colors duration-150">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-semibold mt-2">{value}</p>
      {delta && (
        <p className={['text-xs mt-1', delta.positive ? 'text-green-400' : 'text-red-400'].join(' ')}>
          {delta.positive ? '↑' : '↓'} {Math.abs(delta.value)}% from last period
        </p>
      )}
    </div>
  )
}
