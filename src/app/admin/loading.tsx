export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      {/* Admin sidebar skeleton */}
      <div className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-brand-navy z-20">
        <div className="p-6 border-b border-white/10">
          <div className="h-6 w-24 bg-white/15 rounded animate-pulse" />
          <div className="h-3 w-28 bg-white/8 rounded mt-1.5 animate-pulse" />
        </div>
        <div className="flex-1 p-3 space-y-1 pt-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 bg-white/8 rounded-lg animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 lg:ml-60 p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="h-9 w-28 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white border border-gray-200 rounded-xl animate-pulse" style={{ animationDelay: `${i * 70}ms` }} />
          ))}
        </div>
        <div className="h-64 bg-white border border-gray-200 rounded-xl animate-pulse" />
      </div>
    </div>
  )
}
