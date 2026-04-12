export const TRANSITIONS = {
  default: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
  spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
  springFast: { type: 'spring' as const, stiffness: 500, damping: 35 },
  slow: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
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
    transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
  },
  listItem: {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0 },
    transition: TRANSITIONS.default,
  },
  shake: {
    animate: { x: [0, -6, 6, -4, 4, 0] },
    transition: { duration: 0.35, ease: 'easeInOut' as const },
  },
  dropdownEnter: {
    initial: { opacity: 0, scale: 0.95, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: -4 },
    transition: TRANSITIONS.springFast,
  },
}
