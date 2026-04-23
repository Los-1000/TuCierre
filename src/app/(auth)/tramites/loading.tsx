export default function TramitesLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-40 bg-[#E0E4F0] rounded animate-pulse" />
          <div className="h-6 w-8 bg-[#E0E4F0] rounded-full animate-pulse" />
        </div>
        <div className="h-9 w-40 bg-[#E0E4F0] rounded-lg animate-pulse" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 h-10 bg-white border border-[#E0E4F0] rounded-lg animate-pulse" />
        <div className="w-full sm:w-48 h-10 bg-white border border-[#E0E4F0] rounded-lg animate-pulse" />
        <div className="w-full sm:w-44 h-10 bg-white border border-[#E0E4F0] rounded-lg animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-36 bg-white border border-[#E0E4F0] rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
