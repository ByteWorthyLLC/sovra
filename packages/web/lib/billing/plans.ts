export const PLANS = {
  free: {
    agents: 2,
    apiCalls: 1000,
    storageMb: 100,
    workspaces: 1,
  },
  pro: {
    agents: 20,
    apiCalls: 50000,
    storageMb: 10000,
    workspaces: 5,
  },
  enterprise: {
    agents: -1,
    apiCalls: -1,
    storageMb: -1,
    workspaces: -1,
  },
} as const

export type PlanId = keyof typeof PLANS

export type PlanLimits = (typeof PLANS)[PlanId]

export function getPlanLimits(planId: string): PlanLimits {
  if (planId in PLANS) {
    return PLANS[planId as PlanId]
  }
  return PLANS.free
}

export const PLAN_DISPLAY: Record<
  PlanId,
  { name: string; price: number | 'custom'; badgeClass: string }
> = {
  free: {
    name: 'Free',
    price: 0,
    badgeClass: 'bg-gray-100 text-gray-700',
  },
  pro: {
    name: 'Pro',
    price: 29,
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
}
