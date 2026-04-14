'use client'

import { createContext, useContext, useState, useCallback } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}

interface ToastContextValue {
  toasts: Toast[]
  toast: (variant: ToastVariant, title: string, description?: string) => void
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

const MAX_TOASTS = 3
const AUTO_DISMISS_MS = 4000

let toastCounter = 0

export function useToastState() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (variant: ToastVariant, title: string, description?: string) => {
      const id = `toast-${++toastCounter}-${Date.now()}`
      setToasts((prev) => {
        const next = [...prev, { id, variant, title, description }]
        return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next
      })

      setTimeout(() => {
        dismiss(id)
      }, AUTO_DISMISS_MS)
    },
    [dismiss]
  )

  return { toasts, toast, dismiss }
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
