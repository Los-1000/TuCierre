'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import ReferralCode from '@/components/shared/ReferralCode'
import { TIER_CONFIG } from '@/lib/constants'
import { generateInitials } from '@/lib/utils'
import { Loader2, User, Phone, Building2, Gift, RefreshCw, Lock, Users, PiggyBank } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Broker } from '@/types/database'

const profileSchema = z.object({
  full_name: z.string().min(3, 'Nombre muy corto').max(100),
  phone: z.string().min(9, 'Teléfono inválido').max(15),
  company_name: z.string().optional(),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type ProfileInput = z.infer<typeof profileSchema>
type PasswordInput = z.infer<typeof passwordSchema>

export default function PerfilPage() {
  const supabase = createClient()
  const [broker, setBroker] = useState<Broker | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const [referralBonuses, setReferralBonuses] = useState(0)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data }, referralsResult, bonusResult] = await Promise.all([
        supabase.from('brokers').select('*').eq('id', user.id).single(),
        supabase.from('brokers').select('id', { count: 'exact', head: true }).eq('referred_by', user.id),
        supabase.from('rewards').select('amount').eq('broker_id', user.id).eq('type', 'referral_bonus'),
      ])

      if (data) {
        setBroker(data as Broker)
        reset({ full_name: data.full_name, phone: data.phone, company_name: data.company_name ?? '' })
      }
      setReferralCount(referralsResult.count ?? 0)
      setReferralBonuses(
        (bonusResult.data ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0)
      )
      setLoading(false)
    }
    load()
  }, [])

  async function onSaveProfile(data: ProfileInput) {
    if (!broker) return
    setSaving(true)
    const { error } = await supabase
      .from('brokers')
      .update({ full_name: data.full_name, phone: data.phone, company_name: data.company_name || null })
      .eq('id', broker.id)
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    setBroker(prev => prev ? { ...prev, ...data } : prev)
    toast.success('Perfil actualizado')
    reset(data)
  }

  async function onChangePassword(data: PasswordInput) {
    setChangingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: data.password })
    setChangingPassword(false)
    if (error) { toast.error('Error al cambiar contraseña'); return }
    toast.success('Contraseña actualizada')
    resetPwd()
  }

  async function generateReferralCode() {
    if (!broker) return
    setGeneratingCode(true)
    const code = 'TC-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    const { error } = await supabase.from('brokers').update({ referral_code: code }).eq('id', broker.id)
    setGeneratingCode(false)
    if (error) { toast.error('Error al generar código'); return }
    setBroker(prev => prev ? { ...prev, referral_code: code } : prev)
    toast.success('Código generado')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    )
  }

  const tier = broker?.tier ?? 'bronce'
  const tierConfig = TIER_CONFIG[tier]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi perfil</h1>
        <p className="text-slate-500 text-sm mt-1">Gestiona tu información y código de referido.</p>
      </div>

      {/* Avatar + tier */}
      <Card className="shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold text-xl">
              {broker ? generateInitials(broker.full_name) : '?'}
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-900">{broker?.full_name}</p>
              <p className="text-sm text-slate-500">{broker?.email}</p>
              <span className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${tierConfig.color}`}>
                {tierConfig.icon} {tierConfig.label}
                {tierConfig.discount > 0 && ` · ${tierConfig.discount}% descuento`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile form */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User size={16} className="text-slate-500" />
            Información personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input id="full_name" className="mt-1" {...register('full_name')} />
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone">
                  <Phone size={13} className="inline mr-1" />Teléfono
                </Label>
                <Input id="phone" className="mt-1" {...register('phone')} />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="company_name">
                  <Building2 size={13} className="inline mr-1" />Inmobiliaria / empresa
                  <span className="text-slate-400 text-xs ml-1">(opcional)</span>
                </Label>
                <Input id="company_name" className="mt-1" {...register('company_name')} />
              </div>
              <div>
                <Label>DNI</Label>
                <Input value={broker?.dni ?? ''} disabled className="mt-1 bg-slate-50 text-slate-500" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={broker?.email ?? ''} disabled className="mt-1 bg-slate-50 text-slate-500" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving || !isDirty}>
                {saving && <Loader2 size={14} className="animate-spin mr-2" />}
                Guardar cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Referral code */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Gift size={16} className="text-slate-500" />
            Código de referido
          </CardTitle>
          <p className="text-sm text-slate-500 mt-1">
            Comparte tu código con otros brokers. Ganas S/. 50 cada vez que alguien se registra con él y completa un trámite.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {broker?.referral_code ? (
            <ReferralCode code={broker.referral_code} />
          ) : (
            <div className="text-center py-4 space-y-3">
              <p className="text-sm text-slate-500">Aún no tienes un código de referido.</p>
              <Button variant="outline" onClick={generateReferralCode} disabled={generatingCode}>
                {generatingCode
                  ? <><Loader2 size={14} className="animate-spin mr-2" />Generando...</>
                  : <><RefreshCw size={14} className="mr-2" />Generar mi código</>
                }
              </Button>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <Users size={15} className="text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{referralCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">Personas referidas</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
              <div className="flex items-center justify-center mb-1">
                <PiggyBank size={15} className="text-brand-emerald" />
              </div>
              <p className="text-lg font-bold text-slate-900 tabular-nums">{formatPrice(referralBonuses)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Bonos ganados</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock size={16} className="text-slate-500" />
            Cambiar contraseña
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input id="password" type="password" className="mt-1" placeholder="Mínimo 8 caracteres" {...registerPwd('password')} />
                {pwdErrors.password && <p className="text-red-500 text-xs mt-1">{pwdErrors.password.message}</p>}
              </div>
              <div>
                <Label htmlFor="confirm_password">Confirmar contraseña</Label>
                <Input id="confirm_password" type="password" className="mt-1" placeholder="Repite la contraseña" {...registerPwd('confirm_password')} />
                {pwdErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirm_password.message}</p>}
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline" disabled={changingPassword}>
                {changingPassword && <Loader2 size={14} className="animate-spin mr-2" />}
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
