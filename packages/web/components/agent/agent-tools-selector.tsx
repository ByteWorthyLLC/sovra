'use client'

import { AVAILABLE_TOOLS } from '@/lib/agent/types'

interface AgentToolsSelectorProps {
  selectedTools: string[]
  onChange: (tools: string[]) => void
}

export function AgentToolsSelector({ selectedTools, onChange }: AgentToolsSelectorProps) {
  if ((AVAILABLE_TOOLS as readonly string[]).length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        No tools available yet
      </p>
    )
  }

  function handleToggle(tool: string) {
    if (selectedTools.includes(tool)) {
      onChange(selectedTools.filter((t) => t !== tool))
    } else {
      onChange([...selectedTools, tool])
    }
  }

  return (
    <div className="space-y-2">
      {AVAILABLE_TOOLS.map((tool) => (
        <label key={tool} className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={selectedTools.includes(tool)}
            onChange={() => handleToggle(tool)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
            {tool}
          </span>
        </label>
      ))}
    </div>
  )
}
