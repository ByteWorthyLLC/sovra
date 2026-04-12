// TODO: Plan 02-04 will provide the full implementation. Stub with correct exports.
import { cn } from '@/lib/utils'

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-zinc-800/60', className)} {...props} />
}
