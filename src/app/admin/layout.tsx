import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'
import { AdminNav } from '@/components/layout/AdminNav'

async function signOutAction() {
  'use server'
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: brokerResult } = await supabase
    .from('brokers')
    .select('is_admin, full_name')
    .eq('id', user.id)
    .single()

  const broker = brokerResult as { is_admin: boolean; full_name: string } | null
  if (!broker?.is_admin) redirect('/dashboard')

  const initials = (broker.full_name ?? 'A')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen bg-[#F9F9F8]">
      {/* Admin Sidebar — dark, distinct */}
      <aside className="hidden lg:flex w-[240px] flex-col fixed left-0 top-0 h-full bg-[#18181B] z-20">
        {/* Brand */}
        <div className="px-6 pt-8 pb-10">
          <h1 className="text-[18px] font-semibold text-white tracking-tight">TuCierre</h1>
          <span className="inline-block mt-1 px-2 py-0.5 border border-red-500/40 bg-red-500/15 text-red-400 text-[10px] font-bold uppercase tracking-widest rounded-full">
            ADMIN
          </span>
        </div>

        {/* Nav — client component for active detection */}
        <AdminNav />

        {/* Bottom: user + signout */}
        <div className="mt-auto p-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-4 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white leading-tight truncate">{broker.full_name}</p>
              <p className="text-xs text-white/40">Administrador</p>
            </div>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-2.5 w-full text-white/60 hover:text-white hover:bg-white/8 transition-all text-sm font-medium rounded-none"
            >
              <LogOut size={18} className="shrink-0" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-[240px] min-h-screen">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
