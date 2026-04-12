'use client'

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { VARIANTS } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  children: ReactNode
  'aria-label'?: string
  className?: string
}

export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <motion.div
      initial={VARIANTS.cardEnter.initial}
      animate={VARIANTS.cardEnter.animate}
      transition={VARIANTS.cardEnter.transition}
      className={cn(
        'glass-card rounded-xl p-8 max-w-[420px] w-full mx-auto',
        'max-sm:bg-card max-sm:backdrop-blur-0 max-sm:border-border max-sm:shadow-lg max-sm:p-6',
        className
      )}
      aria-label={props['aria-label']}
    >
      {children}
    </motion.div>
  )
}
