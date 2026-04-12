'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Bot, Network, Users, CreditCard, KeyRound } from 'lucide-react'
import { useTenant } from '@/lib/tenant/context'
import { cn } from '@/lib/utils'

import type { LucideIcon } from 'lucide-react'

interface NavItem {
  label: string
  icon: LucideIcon
  path: string
}

const MAIN_NAV: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: 'dashboard' },
  { label: 'Agents', icon: Bot, path: 'agents' },
  { label: 'Workspaces', icon: Network, path: 'workspaces' },
  { label: 'Members', icon: Users, path: 'members' },
]

const SETTINGS_NAV: NavItem[] = [
  { label: 'Billing', icon: CreditCard, path: 'settings/billing' },
  { label: 'API keys', icon: KeyRound, path: 'settings/api-keys' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { tenantSlug } = useTenant()

  function navLink({ label, icon: Icon, path }: NavItem) {
    const href = `/t/${tenantSlug}/${path}`
    const isActive = pathname === href || pathname.startsWith(`${href}/`)

    return (
      <Link
        key={path}
        href={href}
        className={cn(
          'relative flex h-10 items-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors duration-150',
          isActive
            ? "bg-accent/10 text-primary before:content-[''] before:absolute before:left-0 before:h-5 before:w-0.5 before:rounded-full before:bg-primary"
            : 'text-muted-foreground hover:bg-zinc-800/50 hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    )
  }

  return (
    <nav className="flex flex-col gap-1 px-3 py-2 flex-1">
      {MAIN_NAV.map(navLink)}

      <div className="mt-4 mb-1 px-3">
        <span className="text-xs text-muted-foreground/60 uppercase tracking-wider font-semibold">
          Settings
        </span>
      </div>

      {SETTINGS_NAV.map(navLink)}
    </nav>
  )
}
