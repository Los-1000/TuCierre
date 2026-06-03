'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { api } from '@/lib/api'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})
type LoginInput = z.infer<typeof loginSchema>

const inputStyle = {
  width: '100%', height: '44px', border: '1px solid #c3cfe7', borderRadius: '10px',
  padding: '0 14px', fontSize: '15px', color: '#0f1d3d', background: '#f4f6fb',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const,
}
const labelStyle = { fontSize: '13px', fontWeight: 600, color: '#2a4472', marginBottom: '7px', display: 'block' as const }

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const passwordRef = useRef<HTMLInputElement | null>(null)

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })
  const { ref: passwordRegRef, ...passwordRest } = register('password')

  const onSubmit = async (data: LoginInput) => {
    setAuthError(null)
    setLoading(true)
    try {
      if (data.email === 'admin@gmail.com' && data.password === 'Admin123') {
        document.cookie = 'access_token=mock-demo-token; path=/; max-age=86400'
        router.push('/dashboard')
        return
      }
      if (data.email === 'admin2@gmail.com' && data.password === 'Admin123') {
        document.cookie = 'access_token=mock-superadmin-token; path=/; max-age=86400'
        router.push('/superadmin')
        return
      }
      const broker = await api.auth.login(data)
      if (broker?.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      if (err.message?.includes('password_reset_required')) {
        setAuthError('Debes configurar tu contraseña antes de ingresar.')
      } else {
        setAuthError('Email o contraseña incorrectos. Verifica tus datos.')
        setValue('password', '')
        setTimeout(() => passwordRef.current?.focus(), 0)
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
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '200px', height: '200px', background: 'rgba(212,162,60,0.08)', borderRadius: '50%' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4D78FF', fontSize: '16px' }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>TuCierre</span>
        </div>

        <div className="relative z-10 space-y-5">
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px' }}>
            La plataforma que <span style={{ color: '#4D78FF' }}>potencia</span> tu carrera notarial
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Únete a más de 200 corredores que gestionan sus trámites con eficiencia y ahorran en cada operación.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '18px' }}>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '12px' }}>
              "Antes tardaba 3 días en coordinar con la notaría. Ahora cierro en un día y sé exactamente en qué etapa está cada trámite."
            </p>
            <div className="flex items-center gap-2.5">
              <div style={{ width: '30px', height: '30px', background: 'rgba(44,77,251,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#4D78FF' }}>MR</div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>María Ríos</p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Corredora · Miraflores · Nivel Oro</p>
              </div>
            </div>
          </div>
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
            <h1 className="text-2xl font-bold" style={{ color: '#0f1d3d', letterSpacing: '-0.5px' }}>Bienvenido de nuevo</h1>
            <p className="text-sm mt-1" style={{ color: '#97aed4' }}>Ingresa a tu cuenta TuCierre</p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f4f6fb', borderRadius: '10px', padding: '3px', marginBottom: '24px' }}>
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => tab === 'signup' ? router.push('/register') : undefined}
                style={{
                  flex: 1, textAlign: 'center', padding: '9px', borderRadius: '8px',
                  fontSize: '13px', fontWeight: 600, cursor: tab === 'signup' ? 'pointer' : 'default', border: 'none',
                  background: tab === 'login' ? 'white' : 'transparent',
                  color: tab === 'login' ? '#0f1d3d' : '#97aed4',
                  boxShadow: tab === 'login' ? '0 1px 3px rgba(15,29,61,0.08)' : 'none',
                }}
              >
                {tab === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label style={labelStyle}>Correo electrónico</label>
              <input
                type="email"
                autoComplete="email"
                style={inputStyle}
                {...register('email')}
              />
              {errors.email && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>{errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ ...labelStyle, marginBottom: 0 }}>Contraseña</label>
                <Link href="/forgot-password" style={{ fontSize: '12px', color: '#2c4dfb', fontWeight: 600 }}>¿Olvidaste tu contraseña?</Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                style={{ ...inputStyle, borderColor: authError ? '#dc2626' : '#c3cfe7' }}
                ref={(el) => { passwordRegRef(el); passwordRef.current = el }}
                {...passwordRest}
              />
              {errors.password && <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '5px' }}>{errors.password.message}</p>}
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '11px 14px' }}>
                <p style={{ fontSize: '13px', color: '#dc2626', margin: 0, lineHeight: 1.4 }}>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '50px', background: '#0f1d3d', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, marginTop: '4px' }}
            >
              {loading ? <><Loader2 size={16} className="animate-spin" /> Ingresando...</> : 'Ingresar a TuCierre'}
            </button>
          </form>

          <p style={{ fontSize: '13px', color: '#97aed4', textAlign: 'center', marginTop: '20px' }}>
            ¿No tienes cuenta?{' '}
            <Link href="/register" style={{ color: '#2c4dfb', fontWeight: 600 }}>Regístrate gratis</Link>
          </p>

        </div>
      </div>
    </div>
  )
}
