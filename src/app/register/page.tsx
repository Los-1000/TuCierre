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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* LEFT PANEL — same as login */}
      <div style={{ background: '#0f1d3d', padding: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '300px', height: '300px', background: 'rgba(44,77,251,0.12)', borderRadius: '50%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '34px', height: '34px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4D78FF', fontSize: '16px' }}>T</div>
          <span style={{ fontWeight: 700, fontSize: '16px', color: 'white' }}>TuCierre</span>
        </div>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', lineHeight: 1.2, letterSpacing: '-0.5px', marginBottom: '14px' }}>
            Empieza a <span style={{ color: '#4D78FF' }}>cerrar más</span> con menos esfuerzo
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
            Gestiona tus trámites notariales, ahorra en tarifas y cobra comisiones por referidos.
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
            <Link href="/login" style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#97aed4', textDecoration: 'none', display: 'block' }}>Ingresar</Link>
            <div style={{ flex: 1, textAlign: 'center', padding: '7px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#0f1d3d', background: 'white', boxShadow: '0 1px 3px rgba(15,29,61,0.08)' }}>Registrarse</div>
          </div>

          {referredBy && (
            <div style={{ background: '#eff2ff', border: '1px solid #dbe3fe', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '16px' }}>🎁</span>
              <div>
                <div style={{ fontSize: '11px', color: '#2c4dfb', fontWeight: 600 }}>Invitado por un corredor</div>
                <div style={{ fontSize: '10px', color: '#6b8bbf', marginTop: '1px' }}>Empiezas con tu primer trámite bonificado</div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#2a4472', marginBottom: '6px', display: 'block' }}>Nombre completo</label>
              <input
                type="text"
                style={{ width: '100%', height: '40px', border: '1px solid #c3cfe7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0f1d3d', background: '#f4f6fb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Carlos Flores"
                {...register('fullName')}
              />
              {errors.fullName && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.fullName.message}</p>}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#2a4472', marginBottom: '6px', display: 'block' }}>Correo electrónico</label>
              <input
                type="email"
                style={{ width: '100%', height: '40px', border: '1px solid #c3cfe7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0f1d3d', background: '#f4f6fb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="tu@correo.com"
                {...register('email')}
              />
              {errors.email && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#2a4472', marginBottom: '6px', display: 'block' }}>Contraseña</label>
              <input
                type="password"
                style={{ width: '100%', height: '40px', border: '1px solid #c3cfe7', borderRadius: '8px', padding: '0 12px', fontSize: '13px', color: '#0f1d3d', background: '#f4f6fb', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
                placeholder="Mínimo 8 caracteres"
                {...register('password')}
              />
              <p style={{ fontSize: '11px', color: '#97aed4', marginTop: '4px' }}>Mínimo 8 caracteres, una mayúscula y un número</p>
              {errors.password && <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '2px' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', height: '42px', background: '#0f1d3d', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '14px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creando cuenta...</> : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ fontSize: '11px', color: '#97aed4', textAlign: 'center', marginTop: '20px', lineHeight: 1.6 }}>
            Al registrarte aceptas nuestros{' '}
            <Link href="/terminos" style={{ color: '#2c4dfb' }}>Términos de servicio</Link>
            {' '}y{' '}
            <Link href="/privacidad" style={{ color: '#2c4dfb' }}>Política de privacidad</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  )
}
