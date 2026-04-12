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

  const containerStyle = resolved
    ? { background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '0.5rem' }
    : { background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '0.5rem' }

  return (
    <motion.div
      className="p-4 my-1"
      style={containerStyle}
      {...VARIANTS.conflictEnter}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-400">
          Conflict resolution
        </span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            resolved
              ? 'bg-green-500/15 text-green-400'
              : 'bg-amber-500/12 text-amber-400'
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
          className="px-2 py-1 rounded bg-zinc-800 text-xs font-semibold text-foreground"
        >
          A: {a.votes}
        </span>
        <span
          key={`b-${b.votes}`}
          className="px-2 py-1 rounded bg-zinc-800 text-xs font-semibold text-foreground"
        >
          B: {b.votes}
        </span>
        {pendingVotes > 0 && (
          <span className="px-2 py-1 rounded bg-zinc-800/60 text-xs font-semibold text-muted-foreground">
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
        <p className="text-xs text-green-400 mt-2">Conflict resolved.</p>
      )}
    </motion.div>
  )
}
