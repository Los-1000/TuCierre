'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Shield, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const schema = z.object({
  email: z.string().email('Email inválido'),
})

export default function ForgotPasswordPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: { email: string }) => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)
    if (error) {
      toast.error('Error al enviar el correo. Intenta de nuevo.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4 font-sans">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-2">Revisa tu correo</h2>
          <p className="text-muted-foreground text-sm mb-7 leading-relaxed">
            Te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-parchment flex flex-col items-center justify-center px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-9 h-9 bg-brand-navy rounded-xl flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <span className="font-display font-semibold text-xl text-ink">TuCierre</span>
          </Link>
          <h1 className="font-display text-3xl font-semibold text-ink">¿Olvidaste tu contraseña?</h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Ingresa tu email y te enviamos un enlace para restablecerla.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-ink/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="mt-1.5 bg-white border-border focus:border-brand-gold h-11"
                {...register('email')}
              />
              {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full h-11 bg-brand-navy hover:bg-brand-navy-light text-parchment font-medium" disabled={loading}>
              {loading && <Loader2 size={15} className="animate-spin mr-2" />}
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          <Link href="/login" className="text-brand-gold font-medium hover:text-brand-gold-light transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={13} />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
