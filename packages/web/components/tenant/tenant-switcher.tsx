'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Dialog from '@radix-ui/react-dialog'
import { ChevronsUpDown, Check, PlusCircle, X } from 'lucide-react'
import { useTenant } from '@/lib/tenant/context'
import { createSupabaseBrowserClient } from '@/lib/auth/client'
import { createTenant } from '@/lib/tenant/actions'
import { useToast } from '@/lib/toast'
import { VARIANTS } from '@/lib/motion'
import { Button } from '@/components/ui/button'

interface TenantOption {
  id: string
  slug: string
  name: string
}

export function TenantSwitcher() {
  const { tenant } = useTenant()
  const router = useRouter()
  const { toast } = useToast()
  const [tenants, setTenants] = useState<TenantOption[]>([])
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return
      supabase
        .from('tenant_users')
        .select('tenants(id, slug, name)')
        .eq('user_id', data.user.id)
        .then(({ data: rows }) => {
          if (!rows) return
          const mapped = rows
            .map((r) => (r as { tenants: TenantOption | null }).tenants)
            .filter(Boolean) as TenantOption[]
          setTenants(mapped)
        })
    })
  }, [])

  const slug = newName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 48)

  async function handleCreate() {
    if (!newName.trim() || !slug) return
    setCreating(true)
    setCreateError(null)
    const result = await createTenant({ name: newName.trim(), slug })
    setCreating(false)

    if (result.error) {
      setCreateError(result.error)
      return
    }

    toast('success', 'Workspace created')
    setDialogOpen(false)
    setNewName('')
    if (result.tenant) {
      router.push(`/t/${result.tenant.slug}/dashboard`)
    }
  }

  return (
    <>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold rounded-md hover:bg-surface-3/70 transition-colors text-left">
            <span className="truncate flex-1">{tenant.name}</span>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenu.Trigger>

        <AnimatePresence>
          {open && (
            <DropdownMenu.Portal forceMount>
              <DropdownMenu.Content asChild sideOffset={4} align="start" className="z-50">
                <motion.div
                  {...VARIANTS.dropdownEnter}
                  className="min-w-[200px] rounded-lg border border-border bg-card p-1 shadow-lg"
                >
                  {tenants.map((t) => (
                    <DropdownMenu.Item
                      key={t.id}
                      onSelect={() => router.push(`/t/${t.slug}/dashboard`)}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-surface-3/70 transition-colors duration-100 text-sm outline-none"
                    >
                      {t.id === tenant.id ? (
                        <Check className="h-4 w-4 text-primary" />
                      ) : (
                        <span className="w-4" />
                      )}
                      <span className="truncate">{t.name}</span>
                    </DropdownMenu.Item>
                  ))}

                  <DropdownMenu.Separator className="h-px bg-border my-1" />

                  <DropdownMenu.Item
                    onSelect={() => setDialogOpen(true)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground hover:bg-surface-3/70 transition-colors duration-100 text-sm outline-none"
                  >
                    <PlusCircle className="h-4 w-4" />
                    New workspace
                  </DropdownMenu.Item>
                </motion.div>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          )}
        </AnimatePresence>
      </DropdownMenu.Root>

      <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">Create a workspace</Dialog.Title>
              <Dialog.Close asChild>
                <button className="h-6 w-6 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="ws-name" className="text-sm font-semibold">
                  Workspace name
                </label>
                <input
                  id="ws-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My workspace"
                  className="h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                  autoFocus
                />
                {slug && (
                  <p className="text-xs text-muted-foreground">/t/{slug}</p>
                )}
              </div>

              {createError && (
                <p className="text-xs text-destructive">{createError}</p>
              )}

              <Button
                onClick={handleCreate}
                disabled={creating || !newName.trim()}
                className="w-full h-11"
              >
                {creating ? 'Creating...' : 'Create workspace'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
