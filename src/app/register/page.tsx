'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

const signupSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres').regex(/[A-Z]/, 'Debe tener al menos una mayúscula').regex(/[0-9]/, 'Debe tener al menos un número'),
  referralCode: z.string().optional(),
})
type SignupInput = z.infer<typeof signupSchema>

const inputStyle = {
  width: '100%', height: '44px', border: '1px solid #c3cfe7', borderRadius: '10px',
  padding: '0 14px', fontSize: '15px', color: '#0f1d3d', background: '#f4f6fb',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#2a4472', marginBottom: '7px', display: 'block' as const }

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [referredBy, setReferredBy] = useState<string | null>(null)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
  })

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setValue('referralCode', ref)
      setReferredBy(ref)
    }
  }, [searchParams, setValue])

  const onSubmit = async (data: SignupInput) => {
    setLoading(true)
    try {
      await api.auth.signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        referralCode: data.referralCode,
      })
      router.push('/dashboard')
    } catch (err: any) {
      if (err.message?.includes('already registered') || err.message?.includes('409')) {
        toast.error('Este email ya está registrado.')
      } else {
        toast.error('Error al registrarse. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white md:grid md:grid-cols-2" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* LEFT PANEL — desktop only */}
      <div
        className="hidden md:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#0f1d3d' }}
      >
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(44,77,251,0.12)', borderRadius: '50%' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4D78FF', fontSize: '16px' }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>TuCierre</span>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            Empieza a <span style={{ color: '#4D78FF' }}>cerrar más</span> con menos esfuerzo
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Gestiona tus trámites notariales, ahorra en tarifas y cobra comisiones por referidos.
          </p>
          <ul className="space-y-3">
            {['Plataforma gratis para brokers', 'Cotizaciones instantáneas', 'Price match garantizado', 'Tracking en tiempo real'].map(item => (
              <li key={item} className="flex items-center gap-2.5" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="rgba(100,200,120,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 flex gap-7">
          {[{ val: '200+', label: 'Corredores activos' }, { val: 'S/2M+', label: 'Gestionado' }, { val: '28%', label: 'Ahorro máximo' }].map(s => (
            <div key={s.label}>
              <p style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{s.val}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL — full screen on mobile */}
      <div className="flex flex-col min-h-screen md:min-h-0 px-6 py-8 md:flex-none md:flex md:items-center md:justify-center md:p-12">

        {/* Mobile-only top bar */}
        <div className="flex items-center justify-between mb-8 md:hidden">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: '#0f1d3d', color: '#2c4dfb' }}>T</div>
            <span className="font-bold text-sm" style={{ color: '#0f1d3d' }}>TuCierre</span>
          </div>
          <Link href="/" className="text-sm font-medium" style={{ color: '#97aed4' }}>
            ← Inicio
          </Link>
        </div>

        <div className="w-full max-w-sm flex-1 flex flex-col justify-center md:justify-start md:flex-none">

          {/* Mobile heading */}
          <div className="mb-7 md:hidden">
            <h1 className="text-2xl font-bold" style={{ color: '#0f1d3d', letterSpacing: '-0.5px' }}>Crea tu cuenta</h1>
            <p className="text-sm mt-1" style={{ color: '#97aed4' }}>Empieza gratis, sin tarjeta</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f4f6fb', borderRadius: '10px', padding: '3px', marginBottom: '24px' }}>
            <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#97aed4', textDecoration: 'none', display: 'block' }}>
              Ingresar
            </Link>
            <div style={{ flex: 1, textAlign: 'center', padding: '9px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, color: '#0f1d3d', background: 'white', boxShadow: '0 1px 3px rgba(15,29,61,0.08)' }}>
              Registrarse
            </div>
          </div>

          {referredBy && (
            <div style={{ background: '#eff2ff', border: '1px solid #dbe3fe', borderRadius: '10px', padding: '12px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', background: 'rgba(44,77,251,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>🎁</div>
              <div>
                <p style={{ fontSize: '12px', color: '#2c4dfb', fontWeight: 600 }}>Invitado por un corredor</p>
                <p style={{ fontSize: '11px', color: '#6b8bbf', marginTop: '1px' }}>Empiezas con tu primer trámite bonificado</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label style={labelStyle}>Nombre completo</label>
              <input
                type="text"
                autoComplete="name"
                style={inputStyle}
                placeholder="Carlos Flores"
                {...register('fullName')}
              />
              {errors.fullName && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>{errors.fullName.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                style={inputStyle}
                placeholder="tu@correo.com"
                {...register('email')}
              />
              {errors.email && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Contraseña</label>
              <input
                type="password"
                autoComplete="new-password"
                style={inputStyle}
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
              />
              <p style={{ fontSize: '11px', color: '#97aed4', marginTop: '5px' }}>8 caracteres mínimo · una mayúscula · un número</p>
              {errors.password && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '3px' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '50px', background: '#0f1d3d', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Creando cuenta...</> : 'Crear cuenta gratis'}
            </button>
          </form>

          <p style={{ fontSize: '11px', color: '#97aed4', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" style={{ color: '#2c4dfb' }}>Términos de servicio</Link>
            {' '}y{' '}
            <Link href="/privacidad" style={{ color: '#2c4dfb' }}>Política de privacidad</Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-sm text-gray-400">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
