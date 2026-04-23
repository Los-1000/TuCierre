export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin sidebar skeleton */}
      <div className="hidden lg:flex w-[240px] flex-col fixed left-0 top-0 h-full bg-[#18181B] z-20">
        <div className="px-6 pt-8 pb-10">
          <div className="h-5 w-24 bg-white/15 rounded animate-pulse" />
          <div className="h-3 w-14 bg-white/8 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex-1 px-3 space-y-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 lg:ml-[240px] p-6 md:p-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-9 w-40 bg-[#18181B]/8 rounded animate-pulse" />
          <div className="h-9 w-28 bg-[#18181B]/8 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-[#18181B]/8 rounded-3xl animate-pulse" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
        <div className="h-64 bg-white border border-[#18181B]/8 rounded-3xl animate-pulse" />
      </div>
    </div>
  )
}
