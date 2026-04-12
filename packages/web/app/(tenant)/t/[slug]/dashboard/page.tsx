'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useTenant } from '@/lib/tenant/context'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const { tenant, tenantSlug } = useTenant()

  return (
    <div>
      {/* Welcome card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
        className="bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-border/50 rounded-xl p-8"
      >
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome to {tenant.name}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Get started by creating your first agent or inviting your team.
        </p>
        <div className="flex gap-3 mt-6">
          <Button
            variant="ghost"
            disabled
            className="opacity-50 cursor-not-allowed"
            title="Coming in next release"
          >
            Create an agent
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
          <Link href={`/t/${tenantSlug}/members`}>
            <Button variant="ghost">
              Invite team members
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { title: 'Agents', value: '0' },
          { title: 'Workspaces', value: '0' },
          { title: 'Conversations', value: '0' },
        ].map(({ title, value }) => (
          <div key={title} className="bg-card rounded-xl border border-border p-6">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </div>
        ))}
      </div>
    </div>
  )
}
