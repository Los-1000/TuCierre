import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard, FileText, Users, Tag, LogOut, Gift, Settings
} from 'lucide-react'

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

  const adminNavItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/tramites', label: 'Trámites', icon: FileText },
    { href: '/admin/brokers', label: 'Brokers', icon: Users },
    { href: '/admin/referidos', label: 'Referidos', icon: Gift },
    { href: '/admin/tipos', label: 'Tipos', icon: Tag },
    { href: '/admin/perfil', label: 'Mi Notaría', icon: Settings },
  ]

  return (
    <div className="flex min-h-screen bg-[#f7fafc]">
      {/* Admin Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col fixed left-0 top-0 h-full bg-brand-navy z-20">
        <div className="p-6 border-b border-white/10">
          <div className="text-white font-bold text-xl">TuCierre</div>
          <div className="text-white/60 text-xs mt-1">PANEL NOTARÍA</div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {adminNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm"
            >
              <LogOut size={18} />
              Cerrar sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-60 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
