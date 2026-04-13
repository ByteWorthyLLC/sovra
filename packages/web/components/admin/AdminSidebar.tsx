'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Building2, Users, FileText, Activity } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/tenants', label: 'Tenants', icon: Building2, exact: false },
  { href: '/admin/users', label: 'Users', icon: Users, exact: false },
  { href: '/admin/audit', label: 'Audit Logs', icon: FileText, exact: false },
  { href: '/admin/system', label: 'System', icon: Activity, exact: false },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] border-r border-border bg-background flex flex-col min-h-screen">
      <p className="text-xs text-muted-foreground px-4 py-2 pt-4 font-medium uppercase tracking-wide">
        Platform
      </p>
      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-2.5 h-[36px] px-3 rounded-md text-sm transition-colors duration-100',
                isActive
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'text-muted-foreground hover:bg-surface-3/60 hover:text-foreground',
              ].join(' ')}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
