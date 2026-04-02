'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Shield, Eye, EyeOff, Loader2, CheckCircle2, ArrowRight, Check, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const refCode = watch('referral_code')

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) setValue('referral_code', ref)
  }, [searchParams, setValue])

  const onSubmit = async (data: RegisterInput) => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone: data.phone,
          dni: data.dni,
          company_name: data.company_name || null,
          referral_code_used: data.referral_code || null,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Este email ya está registrado. Intenta iniciar sesión.')
      } else {
        console.error('Sign up error:', error)
        toast.error(`Error al registrarse: ${error.message}`)
      }
      return
    }
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F9F9F8] flex flex-col items-center justify-center px-4 font-sans">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <h2 className="font-display text-3xl font-semibold text-[#18181B] mb-2">¡Casi listo!</h2>
          <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
            Te enviamos un email de confirmación. Revisa tu bandeja de entrada y confirma tu cuenta para comenzar.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Ir a iniciar sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex font-sans">
      {/* Left brand panel */}
      <div className="hidden lg:flex w-[38%] flex-col bg-[#18181B] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0D1628] to-[#18181B]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(201,136,14,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,136,14,0.5) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="absolute top-1/3 right-0 w-64 h-64 bg-[#D47151]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#D47151] rounded-xl flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-[#EDE8DF]">TuCierre</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h1 className="font-display text-3xl font-light text-[#EDE8DF] leading-[1.2] mb-4">
              Únete a los brokers<br />
              que cierran<br />
              <em className="text-gold-gradient not-italic font-semibold">más rápido.</em>
            </h1>
            <p className="text-[#EDE8DF]/45 text-sm leading-relaxed mb-8 max-w-[220px]">
              Gratis para siempre. Sin comisión de plataforma.
            </p>
            <div className="space-y-3">
              {[
                'Cotización en menos de 1 minuto',
                'Seguimiento en tiempo real',
                'Price Match garantizado',
                'Gana bonos por referidos',
              ].map(p => (
                <div key={p} className="flex items-start gap-2.5">
                  <Check size={12} className="text-[#D47151] mt-0.5 shrink-0" />
                  <span className="text-xs text-[#EDE8DF]/50 leading-relaxed">{p}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-[#EDE8DF]/25 leading-relaxed">
            Al registrarte aceptas los{' '}
            <Link href="/terminos" className="text-[#EDE8DF]/45 hover:text-[#EDE8DF] underline">Términos</Link>
            {' '}y la{' '}
            <Link href="/privacidad" className="text-[#EDE8DF]/45 hover:text-[#EDE8DF] underline">Política de privacidad</Link>.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 bg-[#F9F9F8] overflow-y-auto">
        <div className="min-h-full flex flex-col items-center justify-center px-6 py-10">
          <Link href="/" className="flex items-center gap-2 mb-7 lg:hidden">
            <div className="w-8 h-8 bg-[#18181B] rounded-lg flex items-center justify-center">
              <Shield size={15} className="text-white" />
            </div>
            <span className="font-display font-semibold text-lg text-[#18181B]">TuCierre</span>
          </Link>

          <div className="w-full max-w-md">
            <div className="mb-7">
              <h2 className="font-display text-3xl font-semibold text-[#18181B]">Crea tu cuenta</h2>
              <p className="text-muted-foreground text-sm mt-1.5">Gratis para brokers inmobiliarios</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
              {/* Name + DNI */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Label htmlFor="full_name" className="text-sm font-medium text-[#18181B]/80">
                    Nombre completo <span className="text-destructive">*</span>
                  </Label>
                  <Input id="full_name" type="text" placeholder="Juan García Pérez" autoComplete="name"
                    className="mt-1.5 bg-white border-border focus:border-[#D47151] h-10" {...register('full_name')} />
                  {errors.full_name && <p className="text-destructive text-xs mt-1">{errors.full_name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="dni" className="text-sm font-medium text-[#18181B]/80">
                    DNI <span className="text-destructive">*</span>
                  </Label>
                  <Input id="dni" type="text" placeholder="12345678" maxLength={8} inputMode="numeric"
                    className="mt-1.5 bg-white border-border focus:border-[#D47151] h-10 font-mono" {...register('dni')} />
                  {errors.dni && <p className="text-destructive text-xs mt-1">{errors.dni.message}</p>}
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-[#18181B]/80">
                    Teléfono <span className="text-destructive">*</span>
                  </Label>
                  <Input id="phone" type="tel" placeholder="987 654 321" autoComplete="tel"
                    className="mt-1.5 bg-white border-border focus:border-[#D47151] h-10" {...register('phone')} />
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-[#18181B]/80">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" placeholder="tu@email.com" autoComplete="email"
                  className="mt-1.5 bg-white border-border focus:border-[#D47151] h-10" {...register('email')} />
                {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
              </div>

              {/* Company (optional) */}
              <div>
                <Label htmlFor="company_name" className="text-sm font-medium text-[#18181B]/80">
                  Inmobiliaria / empresa <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <Input id="company_name" type="text" placeholder="Inmobiliaria XYZ S.A.C."
                  className="mt-1.5 bg-white border-border focus:border-[#D47151] h-10" {...register('company_name')} />
              </div>

              {/* Referral code */}
              <div>
                <Label htmlFor="referral_code" className="text-sm font-medium text-[#18181B]/80 flex items-center gap-1.5">
                  <Gift size={13} className="text-[#D47151]" />
                  Código de referido <span className="text-muted-foreground text-xs">(opcional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input id="referral_code" type="text" placeholder="TC-ABC123"
                    className={cn(
                      'bg-white border-border focus:border-[#D47151] h-10 font-mono uppercase',
                      refCode && 'border-[#D47151]/50 bg-amber-50/50'
                    )}
                    {...register('referral_code')}
                  />
                  {refCode && (
                    <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#D47151]" />
                  )}
                </div>
                {refCode && (
                  <p className="text-xs text-[#D47151] mt-1 flex items-center gap-1">
                    <Check size={11} />Código aplicado — ganarás S/. 50 de bono al completar tu primer trámite
                  </p>
                )}
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="password" className="text-sm font-medium text-[#18181B]/80">
                    Contraseña <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mín. 8 caracteres"
                      autoComplete="new-password"
                      className="bg-white border-border focus:border-[#D47151] h-10 pr-9" {...register('password')} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#18181B] transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div>
                  <Label htmlFor="confirm_password" className="text-sm font-medium text-[#18181B]/80">
                    Confirmar <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative mt-1.5">
                    <Input id="confirm_password" type={showConfirm ? 'text' : 'password'} placeholder="Repite"
                      autoComplete="new-password"
                      className="bg-white border-border focus:border-[#D47151] h-10 pr-9" {...register('confirm_password')} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#18181B] transition-colors">
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirm_password && <p className="text-destructive text-xs mt-1">{errors.confirm_password.message}</p>}
                </div>
              </div>

              <Button type="submit" disabled={loading}
                className="w-full h-11 bg-[#18181B] hover:bg-[#2D2D30] text-white font-medium gap-2">
                {loading
                  ? <><Loader2 size={15} className="animate-spin" />Creando cuenta...</>
                  : <><span>Crear cuenta gratis</span><ArrowRight size={15} /></>
                }
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-5">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-[#D47151] font-medium hover:text-[#A6553A] transition-colors">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}
