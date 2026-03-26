// Instant loading skeleton shown while (auth)/layout.tsx fetches broker data from Supabase.
// Next.js streams this immediately — users see layout instead of blank screen.

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen bg-parchment">
      {/* Sidebar skeleton */}
      <div className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-brand-navy/95 z-20">
        <div className="p-5 border-b border-white/10">
          <div className="h-6 w-28 bg-white/10 rounded animate-pulse" />
          <div className="h-3 w-16 bg-white/6 rounded mt-2 animate-pulse" />
        </div>
        <div className="flex-1 p-3 space-y-1.5 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-white/6 rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 lg:ml-60">
        {/* TopBar skeleton */}
        <div className="h-14 border-b border-border bg-white/80 flex items-center px-4 gap-3">
          <div className="h-7 w-7 bg-muted rounded-lg animate-pulse" />
          <div className="flex-1" />
          <div className="h-7 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        </div>
        {/* Page skeleton */}
        <div className="p-4 md:p-6 lg:p-8 space-y-6">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white border border-border rounded-xl animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
          <div className="h-40 bg-white border border-border rounded-xl animate-pulse" />
          <div className="space-y-2.5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-white border border-border rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
