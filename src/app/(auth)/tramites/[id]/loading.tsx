export default function TramiteDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-[#E0E4F0] rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="h-5 w-24 bg-[#18181B]/8 rounded animate-pulse" />
          <div className="h-5 w-40 bg-[#E0E4F0] rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-32 bg-[#18181B]/8 rounded animate-pulse" />
          <div className="h-5 w-16 bg-[#18181B]/8 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Two-column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tabs skeleton */}
          <div className="h-10 bg-[#18181B]/8 rounded-lg animate-pulse" />
          {/* Timeline skeleton */}
          <div className="space-y-3">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 bg-[#E0E4F0] rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-28 bg-[#E0E4F0] rounded animate-pulse" />
                  <div className="h-3 w-20 bg-[#18181B]/8 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column — chat skeleton */}
        <div className="lg:col-span-5">
          <div className="h-[450px] bg-white border border-[#E0E4F0] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  )
}
