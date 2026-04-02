'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Email o contraseña incorrectos')
      } else if (error.message.includes('Email not confirmed')) {
        toast.error('Confirma tu email antes de ingresar')
      } else {
        toast.error('Error al iniciar sesión. Intenta de nuevo.')
      }
      return
    }

    if (authData.user) {
      const { data: brokerResult } = await supabase
        .from('brokers')
        .select('is_admin, is_superadmin')
        .eq('id', authData.user.id)
        .single()

      const broker = brokerResult as { is_admin: boolean; is_superadmin: boolean } | null
      if (broker?.is_superadmin) {
        router.push('/superadmin')
        return
      }
      if (broker?.is_admin) {
        router.push('/admin')
        return
      }
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex font-sans overflow-hidden">
      {/* Left panel — dark brand */}
      <section className="hidden lg:flex flex-col justify-between w-1/2 bg-[#18181B] p-16 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D47151] blur-[120px] rounded-full opacity-10 pointer-events-none" />

        {/* Top — wordmark */}
        <div className="flex items-center gap-3 z-10">
          <h1 className="text-white text-[22px] font-semibold tracking-tight">TuCierre</h1>
          <span className="bg-white/10 text-white/60 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10">
            BETA
          </span>
        </div>

        {/* Center — editorial tagline */}
        <div className="z-10 max-w-xl">
          <h2 className="text-white text-[52px] font-semibold leading-[1.1] tracking-tight mb-4">
            No persigas a nadie.
          </h2>
          <p className="text-white/50 text-[36px] italic font-medium leading-tight mb-8">
            Solo cierra.
          </p>
          <div className="w-32 h-[1px] bg-[#D47151]" />
        </div>

        {/* Bottom — trust pills */}
        <div className="flex flex-wrap gap-3 z-10">
          {[
            { icon: '✓', text: '1,000+ trámites cerrados' },
            { icon: '♥', text: 'Gratis para brokers' },
            { icon: '♟', text: '120+ brokers activos' },
          ].map((pill) => (
            <div
              key={pill.text}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full"
            >
              <span className="text-[#D47151] text-sm">{pill.icon}</span>
              <span className="text-white/80 text-sm font-medium">{pill.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Right panel — form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-[#F9F9F8]">
        <div className="w-full max-w-[400px]">
          {/* Mobile wordmark */}
          <div className="mb-10 lg:hidden text-center">
            <h1 className="text-[#18181B] text-[24px] font-bold tracking-tight">TuCierre</h1>
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl p-10 shadow-[0_40px_80px_-15px_rgba(24,24,27,0.06)] border border-[#18181B]/5">
            <div className="mb-8">
              <h3 className="text-[28px] font-semibold text-[#18181B] tracking-tight">Bienvenido</h3>
              <p className="text-[#18181B]/60 text-sm mt-1">Ingresa a tu cuenta para continuar.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#18181B]/60 block ml-1" htmlFor="email">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="h-[48px] px-5 rounded-2xl bg-[#F3F4F3] border-transparent focus:border-[#D47151] focus:ring-[#D47151]/30 text-[#18181B] placeholder:text-[#18181B]/30"
                  {...register('email')}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#18181B]/60 block" htmlFor="password">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold uppercase tracking-wider text-[#D47151] hover:opacity-80 transition-opacity"
                  >
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="h-[48px] px-5 rounded-2xl bg-[#F3F4F3] border-transparent focus:border-[#D47151] focus:ring-[#D47151]/30 text-[#18181B] placeholder:text-[#18181B]/30"
                    {...register('password')}
                  />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                <div className="flex justify-end pt-1">
                  <Link
                    href="/forgot-password"
                    className="text-[13px] font-medium text-[#D47151] hover:underline underline-offset-4 decoration-[#D47151]/30"
                  >
                    Olvidé mi contraseña
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[52px] bg-[#D47151] hover:bg-[#A6553A] text-white font-semibold rounded-full flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D47151]/20 mt-6 disabled:opacity-70"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" />Ingresando...</>
                ) : (
                  <>Ingresar <ArrowRight size={18} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#18181B]/8" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-[#18181B]/30 text-xs font-medium uppercase tracking-widest">o</span>
              </div>
            </div>

            {/* Register link */}
            <div className="text-center">
              <Link
                href="/register"
                className="text-sm font-medium text-[#18181B]/60 hover:text-[#18181B] transition-colors"
              >
                ¿No tienes cuenta?{' '}
                <span className="text-[#D47151] font-semibold">Regístrate gratis</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
