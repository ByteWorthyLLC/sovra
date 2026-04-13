'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { VARIANTS } from '@/lib/motion'

interface ConflictProposal {
  agentId: string
  agentName: string
  text: string
  votes: number
}

interface ConflictResolutionCardProps {
  conflictId: string
  proposals: [ConflictProposal, ConflictProposal]
  pendingVotes: number
  resolved: boolean
}

export function ConflictResolutionCard({
  proposals,
  pendingVotes,
  resolved,
}: ConflictResolutionCardProps) {
  const [expanded, setExpanded] = useState(false)

  const [a, b] = proposals

  const containerClass = resolved
    ? 'bg-status-online/5 border border-status-online/20 rounded-lg'
    : 'bg-status-warning/4 border border-status-warning/20 rounded-lg'

  return (
    <motion.div
      className={`p-4 my-1 ${containerClass}`}
      {...VARIANTS.conflictEnter}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-status-warning">
          Conflict resolution
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            resolved
              ? 'bg-status-online/15 text-status-online'
              : 'bg-status-warning/12 text-status-warning'
          }`}
        >
          {resolved ? 'Resolved' : 'Pending'}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        {[a, b].map((proposal, idx) => (
          <div key={proposal.agentId} className="flex items-start gap-2">
            <span className="text-xs font-semibold text-muted-foreground shrink-0 pt-0.5">
              {String.fromCharCode(65 + idx)}:
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-foreground">{proposal.agentName}</span>
              <p className={`text-sm text-muted-foreground mt-0.5 ${expanded ? '' : 'line-clamp-2'}`}>
                {proposal.text}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Votes:</span>
        <span
          key={`a-${a.votes}`}
          className="px-2 py-1 rounded bg-surface-3 text-xs font-semibold text-foreground"
        >
          A: {a.votes}
        </span>
        <span
          key={`b-${b.votes}`}
          className="px-2 py-1 rounded bg-surface-3 text-xs font-semibold text-foreground"
        >
          B: {b.votes}
        </span>
        {pendingVotes > 0 && (
          <span className="px-2 py-1 rounded bg-surface-3/60 text-xs font-semibold text-muted-foreground">
            Pending: {pendingVotes}
          </span>
        )}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto text-xs text-primary hover:text-primary/80 transition-colors"
        >
          {expanded ? 'Hide proposals' : 'View full proposals'}
        </button>
      </div>

      {resolved && (
        <p className="text-xs text-status-online mt-2">Conflict resolved.</p>
      )}
    </motion.div>
  )
}
