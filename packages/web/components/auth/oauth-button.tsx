'use client'

import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface OAuthButtonProps {
  provider: 'google' | 'github'
  loading?: boolean
  disabled?: boolean
  onClick: () => void
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853" />
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58Z" fill="#EA4335" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M9 0C4.037 0 0 4.037 0 9c0 3.975 2.578 7.35 6.154 8.541.45.082.614-.196.614-.434 0-.214-.008-.78-.012-1.531-2.503.544-3.032-1.206-3.032-1.206-.41-1.04-.999-1.317-.999-1.317-.816-.558.062-.547.062-.547.903.063 1.378.927 1.378.927.803 1.374 2.106.977 2.62.747.081-.581.314-.977.571-1.201-1.998-.228-4.1-1-4.1-4.448 0-.983.351-1.786.927-2.416-.093-.227-.402-1.143.088-2.382 0 0 .756-.242 2.475.923A8.63 8.63 0 0 1 9 4.365a8.63 8.63 0 0 1 2.254.303c1.718-1.165 2.473-.923 2.473-.923.491 1.24.182 2.155.09 2.382.577.63.925 1.433.925 2.416 0 3.458-2.105 4.217-4.11 4.44.323.278.611.828.611 1.668 0 1.204-.01 2.175-.01 2.471 0 .24.162.52.619.432C15.425 16.346 18 12.972 18 9c0-4.963-4.037-9-9-9Z" />
    </svg>
  )
}

const providerConfig = {
  google: { icon: GoogleIcon, label: 'Sign in with Google' },
  github: { icon: GitHubIcon, label: 'Sign in with GitHub' },
}

export function OAuthButton({ provider, loading, disabled, onClick }: OAuthButtonProps) {
  const config = providerConfig[provider]
  const Icon = config.icon

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'h-10 w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-md border border-border bg-background/50',
        'hover:bg-surface-3 hover:border-ring/40 transition-all duration-150',
        loading && 'opacity-60 cursor-wait',
        (disabled && !loading) && 'pointer-events-none opacity-70'
      )}
    >
      {loading ? (
        <>
          <Spinner size="sm" />
          <span>Connecting...</span>
        </>
      ) : (
        <>
          <Icon />
          <span>{config.label}</span>
        </>
      )}
    </button>
  )
}
