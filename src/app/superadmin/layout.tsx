import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  ArrowDownCircle,
  GitCompare,
  LogOut,
  ShieldCheck,
} from 'lucide-react'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brokerResult } = await supabase
    .from('brokers')
    .select('is_superadmin, full_name, email')
    .eq('id', user.id)
    .single()

  const broker = brokerResult as {
    is_superadmin: boolean
    full_name: string
    email: string
  } | null

  if (!broker?.is_superadmin) redirect('/dashboard')

  // Use admin client to bypass RLS for counts
  const adminClient = createAdminClient()
  const [cashoutRes, priceMatchRes] = await Promise.all([
    adminClient
      .from('cashout_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    adminClient
      .from('price_match_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const pendingCashouts = cashoutRes.count ?? 0
  const pendingPriceMatch = priceMatchRes.count ?? 0

  const navItems = [
    { href: '/superadmin', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { href: '/superadmin/notarias', label: 'Notarías', icon: Building2, badge: null },
    { href: '/superadmin/brokers', label: 'Brokers', icon: Users, badge: null },
    { href: '/superadmin/tramites', label: 'Trámites', icon: FileText, badge: null },
    {
      href: '/superadmin/cashouts',
      label: 'Cashouts',
      icon: ArrowDownCircle,
      badge: pendingCashouts > 0 ? pendingCashouts : null,
    },
    {
      href: '/superadmin/price-match',
      label: 'Price Match',
      icon: GitCompare,
      badge: pendingPriceMatch > 0 ? pendingPriceMatch : null,
    },
  ]

  return (
    <div className="flex min-h-screen bg-[#F9F9F8]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-full bg-[#18181B] z-20">
        <div className="px-6 h-16 flex items-center justify-between border-b border-white/8">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-[18px] tracking-tight">TuCierre</span>
          </div>
          <span className="text-[10px] font-bold tracking-[0.12em] text-[#D47151] uppercase bg-[#D47151]/10 px-2 py-0.5 rounded-full">
            Super
          </span>
        </div>

        <div className="px-5 py-3 border-b border-white/8">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-[#D47151] shrink-0" />
            <span className="text-white/50 text-xs truncate">{broker.email}</span>
          </div>
        </div>

        <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all border-l-[3px] border-transparent text-white/60 hover:text-white hover:bg-white/6 rounded-r-xl"
            >
              <div className="flex items-center gap-3">
                <item.icon size={16} className="shrink-0" />
                {item.label}
              </div>
              {item.badge != null && (
                <span className="bg-[#D47151] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="px-3 pb-3 border-t border-white/8 pt-3">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-500/8 transition-all"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  )
}
