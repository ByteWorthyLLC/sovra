// TODO: Plan 02-04 will provide the full implementation. Stub with correct exports.
'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { VARIANTS } from '@/lib/motion'

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="w-full max-w-[420px] mx-auto rounded-xl border border-border/80 bg-card/80 backdrop-blur-xl p-8 shadow-xl"
      initial={VARIANTS.cardEnter.initial}
      animate={VARIANTS.cardEnter.animate}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] as [number, number, number, number] }}
    >
      {children}
    </motion.div>
  )
}
