'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { ContextCompressionIndicator } from './context-compression-indicator'
import type { Workspace, SharedMemoryEntry, MemoryStrategy } from '@/lib/workspace/types'

const MEMORY_STRATEGY_STYLES: Record<MemoryStrategy, { className: string; label: string }> = {
  conversation: { className: 'memory-conversation', label: 'Conversation' },
  summary: { className: 'memory-summary', label: 'Summary' },
  vector: { className: 'memory-vector', label: 'Vector' },
  hybrid: { className: 'memory-hybrid', label: 'Hybrid' },
}

interface MemoryEntryItemProps {
  entry: SharedMemoryEntry
  strategy: MemoryStrategy
}

function MemoryEntryItem({ entry, strategy }: MemoryEntryItemProps) {
  const [expanded, setExpanded] = useState(false)
  const style = MEMORY_STRATEGY_STYLES[strategy]

  const content =
    typeof entry.value === 'string'
      ? entry.value
      : JSON.stringify(entry.value, null, 2)

  const isLong = content.length > 140

  return (
    <div className="py-2 px-4 border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-muted-foreground">
          {entry.updated_by ?? 'System'}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded ${style.className}`}>
          {style.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground/60">
          {new Date(entry.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <p className={`text-sm text-foreground ${!expanded && isLong ? 'line-clamp-2' : ''}`}>
        {content}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="text-xs text-primary hover:text-primary/80 transition-colors mt-1"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  )
}

interface SharedMemoryPanelProps {
  workspace: Pick<Workspace, 'memory_strategy' | 'compression_enabled' | 'compression_threshold'>
  entries: SharedMemoryEntry[]
  usedTokens?: number
  maxTokens?: number
}

export function SharedMemoryPanel({
  workspace,
  entries,
  usedTokens = 0,
  maxTokens = 200000,
}: SharedMemoryPanelProps) {
  const [collapsed, setCollapsed] = useState(false)
  const strategy = workspace.memory_strategy
  const style = MEMORY_STRATEGY_STYLES[strategy]

  return (
    <div
      className="border-t border-border bg-card/50 backdrop-blur-sm shrink-0"
      style={{ minHeight: collapsed ? undefined : '200px', maxHeight: collapsed ? undefined : '400px' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border/60">
        <span className="text-sm font-semibold">Shared Memory</span>
        <span className={`text-xs px-2 py-0.5 rounded ${style.className}`}>
          {style.label}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <ContextCompressionIndicator
            usedTokens={usedTokens}
            maxTokens={maxTokens}
            compressionEnabled={workspace.compression_enabled}
          />
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="flex items-center justify-center w-6 h-6 rounded hover:bg-surface-3 transition-colors text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? 'Expand shared memory' : 'Collapse shared memory'}
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Content with Framer Motion height animation */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            key="memory-content"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="overflow-hidden"
            style={{ maxHeight: '350px', overflowY: 'auto' }}
          >
            {entries.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Shared memory is empty. It fills as agents collaborate.
                </p>
              </div>
            ) : (
              <div>
                {entries.map((entry) => (
                  <MemoryEntryItem key={entry.id} entry={entry} strategy={strategy} />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
