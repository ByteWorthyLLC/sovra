'use client'

import { useWorkspaceStore } from '@/lib/realtime/workspace-store'

export function SocketStatusIndicator() {
  const connectionStatus = useWorkspaceStore((s) => s.connectionStatus)

  if (connectionStatus === 'connected') {
    return (
      <div
        className="flex items-center gap-2"
        aria-label="Connection status: connected"
      >
        <span className="w-2 h-2 rounded-full status-dot-online" />
        <span className="text-xs text-muted-foreground hidden sm:inline">Live</span>
      </div>
    )
  }

  if (connectionStatus === 'reconnecting') {
    return (
      <div
        className="flex items-center gap-2"
        aria-label="Connection status: reconnecting"
      >
        <span className="w-2 h-2 rounded-full status-dot-warning status-pulse" />
        <span className="text-xs text-status-warning">Reconnecting...</span>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-2"
      aria-label="Connection status: disconnected"
    >
      <span className="w-2 h-2 rounded-full status-dot-error" />
      <span className="text-xs text-status-error">Offline</span>
    </div>
  )
}
