'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useChat } from '@ai-sdk/react'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { saveMessage } from '@/lib/chat/actions'
import { MessageList } from './message-list'
import { ChatInput } from './chat-input'
import { DefaultChatTransport, type UIMessage } from 'ai'

interface ChatContainerProps {
  agentId: string
  conversationId: string
  agentName: string
  agentStatus: string
  initialMessages: UIMessage[]
  tenantId: string
}

function AgentStatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          status === 'running' && 'bg-primary agent-status-running',
          status === 'error' && 'bg-destructive',
          status === 'idle' && 'bg-muted-foreground/50'
        )}
      />
      {status}
    </span>
  )
}

export function ChatContainer({
  agentId,
  conversationId,
  agentName,
  agentStatus,
  initialMessages,
  tenantId,
}: ChatContainerProps) {
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: '/api/chat',
      body: { agentId, conversationId },
    }),
    onFinish: async ({ message }) => {
      const content = message.parts
        .filter((part) => part.type === 'text')
        .map((part) => part.text)
        .join('\n')

      if (!content.trim()) return

      await saveMessage({
        conversationId,
        tenantId,
        role: 'assistant',
        content,
      })
    },
  })

  const isLoading = status === 'submitted' || status === 'streaming'

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleStop = () => {
    void stop()
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    await saveMessage({
      conversationId,
      tenantId,
      role: 'user',
      content: text,
    })
    setInput('')
    await sendMessage({ text })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 border-b border-border px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{agentName}</h1>
          <AgentStatusBadge status={isLoading ? 'running' : agentStatus} />
        </div>
        <button
          className="p-2 rounded-lg hover:bg-surface-3 transition-colors text-muted-foreground"
          aria-label="Agent settings"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      <MessageList messages={messages} isLoading={isLoading} />

      <ChatInput
        input={input}
        isLoading={isLoading}
        onInputChange={handleInputChange}
        onSubmit={onSubmit}
        onStop={handleStop}
        agentName={agentName}
      />
    </div>
  )
}
