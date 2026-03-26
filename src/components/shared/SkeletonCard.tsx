import { Skeleton } from '@/components/ui/skeleton'

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TramiteRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-slate-100">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="h-4 w-32 hidden md:block" />
      <Skeleton className="h-4 w-24 hidden lg:block" />
      <Skeleton className="h-6 w-20 rounded-full ml-auto" />
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <Skeleton className="h-5 w-3/4 mb-3" />
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
