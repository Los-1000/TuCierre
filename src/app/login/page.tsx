'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, Loader2, ArrowRight, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
      const { data: broker } = await supabase
        .from('brokers')
        .select('is_admin')
        .eq('id', authData.user.id)
        .single()

      if (broker?.is_admin) {
        router.push('/admin')
        router.refresh()
        return
      }
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left panel — brand */}
      <div className="hidden lg:flex w-[42%] flex-col bg-brand-navy noise-overlay relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-navy via-brand-navy-mid to-[#0A1930]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,136,14,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,136,14,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        {/* Gold glow */}
        <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-gold rounded-xl flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-[#EDE8DF]">TuCierre</span>
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-display text-4xl font-light text-[#EDE8DF] leading-[1.15] mb-5">
              Gestiona tus<br />
              <em className="text-gold-gradient not-italic font-semibold">trámites notariales</em><br />
              sin caos.
            </h1>
            <p className="text-[#EDE8DF]/50 text-sm leading-relaxed mb-10 max-w-xs">
              La plataforma de los brokers inmobiliarios más productivos de Lima.
            </p>

            {/* Proof points */}
            <div className="space-y-3">
              {[
                'Cotiza en segundos, no días',
                'Price Match contra cualquier notaría',
                'Hasta 10% de descuento por volumen',
              ].map(p => (
                <div key={p} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-gold/20 border border-brand-gold/30 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-brand-gold" />
                  </div>
                  <span className="text-sm text-[#EDE8DF]/55">{p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-2.5">
            <div className="flex -space-x-2">
              {['C', 'M', 'A', 'R'].map((l, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-brand-navy-mid flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: ['#1E3A5F','#2A5298','#1A7A54','#8B4513'][i] }}
                >
                  {l}
                </div>
              ))}
            </div>
            <span className="text-xs text-[#EDE8DF]/40">+2,400 brokers activos</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center bg-parchment px-6 py-12">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 bg-brand-navy rounded-lg flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="font-display font-semibold text-lg text-ink">TuCierre</span>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-semibold text-ink">Bienvenido de vuelta</h2>
            <p className="text-muted-foreground text-sm mt-1.5">Ingresa a tu cuenta para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-ink/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="mt-1.5 bg-white border-border focus:border-brand-gold focus:ring-brand-gold/20 h-11"
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="text-sm font-medium text-ink/80">Contraseña</Label>
                <Link href="/forgot-password" className="text-xs text-brand-gold hover:text-brand-gold-light transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="bg-white border-border focus:border-brand-gold focus:ring-brand-gold/20 h-11 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-brand-navy hover:bg-brand-navy-light text-parchment font-medium gap-2 transition-all"
            >
              {loading
                ? <><Loader2 size={15} className="animate-spin" />Ingresando...</>
                : <><span>Ingresar</span><ArrowRight size={15} /></>
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-brand-gold font-medium hover:text-brand-gold-light transition-colors">
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
