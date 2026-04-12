// TODO: Plan 02-04 will provide the full implementation. Stub with correct exports.
import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="hidden md:flex w-[45%] bg-zinc-900 flex-col justify-between p-8" />
      <div className="flex flex-1 items-center justify-center auth-bg-gradient">
        {children}
      </div>
    </div>
  )
}
