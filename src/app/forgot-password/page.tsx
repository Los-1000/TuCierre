'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
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
      <div className="min-h-screen bg-[#F9F9F8] flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={30} className="text-emerald-600" />
          </div>
          <h2 className="text-3xl font-semibold text-[#18181B] mb-2">Revisa tu correo</h2>
          <p className="text-[#18181B]/50 text-sm mb-7 leading-relaxed">
            Te enviamos un enlace para restablecer tu contraseña. Revisa también la carpeta de spam.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/login">Volver al inicio de sesión</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F9F9F8] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <span className="font-semibold text-xl text-[#18181B] tracking-tight">TuCierre</span>
          </Link>
          <h1 className="text-3xl font-semibold text-[#18181B]">¿Olvidaste tu contraseña?</h1>
          <p className="text-[#18181B]/50 text-sm mt-1.5">
            Ingresa tu email y te enviamos un enlace para restablecerla.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#18181B]/8 shadow-[0_40px_80px_-15px_rgba(24,24,27,0.06)] p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[11px] font-bold uppercase tracking-wider text-[#18181B]/60 block mb-2">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="h-[48px] px-5 rounded-2xl bg-[#F3F4F3] border-transparent focus:border-[#D47151] focus:ring-[#D47151]/30 text-[#18181B] placeholder:text-[#18181B]/30"
                {...register('email')}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full h-[52px] bg-[#D47151] hover:bg-[#A6553A] text-white font-semibold rounded-full shadow-lg shadow-[#D47151]/20 mt-2"
              disabled={loading}
            >
              {loading && <Loader2 size={15} className="animate-spin mr-2" />}
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#18181B]/50 mt-5">
          <Link href="/login" className="text-[#D47151] font-medium hover:opacity-80 transition-opacity inline-flex items-center gap-1">
            <ArrowLeft size={13} />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
