import type { Transition } from 'framer-motion'

const ease = [0.32, 0.72, 0, 1] as const

export const TRANSITIONS = {
  default: { duration: 0.2, ease } satisfies Transition,
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 } satisfies Transition,
  springFast: { type: 'spring' as const, stiffness: 500, damping: 35 } satisfies Transition,
  slow: { duration: 0.4, ease } satisfies Transition,
}

export const VARIANTS = {
  pageEnter: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: TRANSITIONS.default,
  },
  cardEnter: {
    initial: { opacity: 0, scale: 0.98, y: 12 },
    animate: { opacity: 1, scale: 1, y: 0 },
    transition: { duration: 0.35, ease } satisfies Transition,
  },
  listItem: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: TRANSITIONS.default,
  },
  shake: {
    animate: { x: [0, -6, 6, -4, 4, 0] },
    transition: { duration: 0.35, ease: 'easeInOut' as const } satisfies Transition,
  },
  dropdownEnter: {
    initial: { opacity: 0, scale: 0.95, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -4 },
    transition: TRANSITIONS.springFast,
  },
  messageEnter: {
    initial: { opacity: 0, y: 12, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.25, ease } satisfies Transition,
  },
  slideInRight: {
    initial: { opacity: 0, x: 16 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 16 },
    transition: TRANSITIONS.default,
  },
  jumpToLatest: {
    initial: { opacity: 0, y: 8, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 8, scale: 0.9 },
    transition: TRANSITIONS.spring,
  },
}
