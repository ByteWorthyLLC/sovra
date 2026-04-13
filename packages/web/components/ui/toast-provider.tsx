'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { ToastContext, useToastState, type ToastVariant } from '@/lib/toast'

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-l-4 border-status-online bg-status-online/10',
  error: 'border-l-4 border-status-error bg-status-error/10',
  info: 'border-l-4 border-primary bg-primary/10',
}

const variantIcons: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const state = useToastState()

  return (
    <ToastContext.Provider value={state}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-md:left-1/2 max-md:-translate-x-1/2 max-md:right-auto" aria-live="polite" role="status">
        <AnimatePresence mode="popLayout">
          {state.toasts.map((toast) => {
            const Icon = variantIcons[toast.variant]
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                className={`rounded-lg p-4 shadow-lg bg-card ${variantStyles[toast.variant]} min-w-[300px] max-w-[420px] flex items-start gap-3`}
              >
                <Icon className="h-4 w-4 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{toast.description}</p>
                  )}
                </div>
                <button
                  onClick={() => state.dismiss(toast.id)}
                  className="shrink-0 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
