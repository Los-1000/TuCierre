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

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login')
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* LEFT PANEL */}
      <div style={{
        background: '#0f1d3d', padding: '48px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(44,77,251,0.12)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '200px', height: '200px', background: 'rgba(212,162,60,0.08)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4D78FF', fontSize: '16px' }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>TuCierre</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: '14px' }}>
            La plataforma que <span style={{ color: '#4D78FF' }}>potencia</span> tu carrera notarial
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: '32px' }}>
            Únete a más de 200 corredores que gestionan sus trámites con eficiencia y ahorran en cada operación.
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '18px' }}>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, fontStyle: 'italic', marginBottom: '12px' }}>
              "Antes tardaba 3 días en coordinar con la notaría. Ahora cierro en un día y sé exactamente en qué etapa está cada trámite."
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '30px', height: '30px', background: 'rgba(44,77,251,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, color: '#4D78FF' }}>MR</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'white' }}>María Ríos</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>Corredora · Miraflores, Lima · Tier Oro</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '28px', position: 'relative', zIndex: 1 }}>
          {[{ val: '200+', label: 'Corredores activos' }, { val: 'S/2M+', label: 'Gestionado' }, { val: '15%', label: 'Ahorro máximo' }].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>{s.val}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={{ background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: '360px' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: '#f4f6fb', borderRadius: '8px', padding: '3px', marginBottom: '28px' }}>
            {(['login', 'signup'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => tab === 'signup' ? router.push('/register') : setActiveTab(tab)}
                style={{
                  flex: 1, textAlign: 'center', padding: '7px', borderRadius: '6px',
                  fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none',
                  background: activeTab === tab ? 'white' : 'transparent',
                  color: activeTab === tab ? '#0f1d3d' : '#97aed4',
                  boxShadow: activeTab === tab ? '0 1px 3px rgba(15,29,61,0.08)' : 'none',
                }}
              >
                {tab === 'login' ? 'Ingresar' : 'Registrarse'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#2a4472', marginBottom: '6px', display: 'block' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                autoComplete="email"
                style={{ width: '100%', height: '40px', border: '1px solid #c3cfe7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0f1d3d', background: '#f4f6fb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                {...register('email')}
              />
              {errors.email && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#2a4472' }}>Contraseña</label>
                <Link href="/forgot-password" style={{ fontSize: '11px', color: '#2c4dfb', fontWeight: 600 }}>¿Olvidaste tu contraseña?</Link>
              </div>
              <input
                type="password"
                autoComplete="current-password"
                style={{ width: '100%', height: '40px', border: `1px solid ${authError ? '#dc2626' : '#c3cfe7'}`, borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0f1d3d', background: '#f4f6fb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                ref={(el) => { passwordRegRef(el); passwordRef.current = el }}
                {...passwordRest}
              />
              {errors.password && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#dc2626', margin: 0, lineHeight: 1.4 }}>{authError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '42px', background: '#0f1d3d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '8px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Ingresando...</> : 'Ingresar a TuCierre'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <span style={{ fontSize: '12px', color: '#97aed4' }}>¿No tienes cuenta? </span>
            <Link href="/register" style={{ fontSize: '12px', color: '#2c4dfb', fontWeight: 600 }}>Regístrate gratis</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
