export default function CotizarLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title skeleton */}
      <div>
        <div className="h-7 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-72 bg-slate-100 rounded mt-2 animate-pulse" />
      </div>

      {/* Step bar skeleton */}
      <div className="flex items-center gap-0 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-8 h-8 bg-slate-200 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 100}ms` }}
              />
              <div className="h-3 w-14 bg-slate-100 rounded animate-pulse" />
            </div>
            {i < 2 && <div className="h-px flex-1 mx-2 mb-5 bg-slate-200" />}
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="h-5 w-56 bg-slate-200 rounded animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 bg-white border border-slate-200 rounded-xl animate-pulse"
            style={{ animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>

      {/* Button skeleton */}
      <div className="h-10 w-32 bg-slate-200 rounded-lg animate-pulse mt-4" />
    </div>
  )
}
