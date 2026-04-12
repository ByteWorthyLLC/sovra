'use client'

interface ContextCompressionIndicatorProps {
  usedTokens: number
  maxTokens: number
  compressionEnabled: boolean
}

function getBarColor(pct: number): string {
  if (pct > 0.8) return 'bg-red-500'
  if (pct > 0.6) return 'bg-amber-400'
  return 'bg-blue-500'
}

export function ContextCompressionIndicator({
  usedTokens,
  maxTokens,
  compressionEnabled,
}: ContextCompressionIndicatorProps) {
  const pct = maxTokens > 0 ? usedTokens / maxTokens : 0

  if (!compressionEnabled || pct < 0.5) return null

  const usedK = Math.round(usedTokens / 1000)
  const maxK = Math.round(maxTokens / 1000)
  const barWidth = Math.min(pct * 100, 100)
  const isWarning = pct > 0.8

  return (
    <div
      className="flex items-center gap-2"
      title={isWarning ? 'Context compression active. Older messages condensed to stay within token limits.' : undefined}
      aria-label="Context usage indicator"
    >
      <span className={`text-sm font-mono ${isWarning ? 'text-amber-400' : 'text-foreground'}`}>
        {usedK}K / {maxK}K tokens
      </span>
      <div className="w-[80px] h-1 rounded-full bg-zinc-800" role="progressbar" aria-valuenow={usedK} aria-valuemax={maxK}>
        <div
          className={`h-full rounded-full transition-[width] duration-400 ease-out ${getBarColor(pct)}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
    </div>
  )
}
