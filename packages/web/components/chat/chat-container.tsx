'use client'

import type { Message } from 'ai'

interface ChatContainerProps {
  agentId: string
  conversationId: string
  agentName: string
  agentStatus: string
  initialMessages: Message[]
  tenantId: string
}

export function ChatContainer({
  agentName,
}: ChatContainerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border px-6 flex items-center">
        <span className="text-xl font-semibold tracking-tight">{agentName}</span>
      </div>
      <div className="flex-1" />
    </div>
  )
}
