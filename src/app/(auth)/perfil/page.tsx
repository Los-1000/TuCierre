'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import ReferralCode from '@/components/shared/ReferralCode'
import { TIER_CONFIG } from '@/lib/constants'
import { generateInitials } from '@/lib/utils'
import { Loader2, User, Phone, Building2, Gift, RefreshCw, Lock, Users, PiggyBank, Landmark } from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import type { Broker } from '@/types/database'

const profileSchema = z.object({
  full_name: z.string().min(3, 'Nombre muy corto').max(100),
  phone: z.string().min(9, 'Teléfono inválido').max(15),
  company_name: z.string().optional(),
})

const bankSchema = z.object({
  bank_cci: z.string().length(20, 'El CCI debe tener 20 dígitos').regex(/^\d+$/, 'Solo números'),
  bank_name: z.string().min(2, 'Ingresa el nombre del banco').max(100),
  bank_titular: z.string().min(3, 'Ingresa el nombre del titular').max(100),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine(d => d.password === d.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

type ProfileInput = z.infer<typeof profileSchema>
type BankInput = z.infer<typeof bankSchema>
type PasswordInput = z.infer<typeof passwordSchema>

export default function PerfilPage() {
  const supabase = createClient()
  const [broker, setBroker] = useState<Broker | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingBank, setSavingBank] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [referralCount, setReferralCount] = useState(0)
  const [referralBonuses, setReferralBonuses] = useState(0)

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  const {
    register: registerBank,
    handleSubmit: handleSubmitBank,
    reset: resetBank,
    formState: { errors: bankErrors, isDirty: isBankDirty },
  } = useForm<BankInput>({ resolver: zodResolver(bankSchema) })

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

      const [brokerResult, referralsResult, bonusResult] = await Promise.all([
        supabase.from('brokers').select('*').eq('id', user.id).single(),
        supabase.from('brokers').select('id', { count: 'exact', head: true }).eq('referred_by', user.id),
        supabase.from('rewards').select('amount').eq('broker_id', user.id).eq('type', 'referral_bonus'),
      ])
      const data = brokerResult.data as Broker | null
      const bonusRows = bonusResult.data as { amount: number }[] | null

      if (data) {
        setBroker(data)
        reset({ full_name: data.full_name, phone: data.phone, company_name: data.company_name ?? '' })
        resetBank({
          bank_cci: data.bank_cci ?? '',
          bank_name: data.bank_name ?? '',
          bank_titular: data.bank_titular ?? '',
        })
      }
      setReferralCount(referralsResult.count ?? 0)
      setReferralBonuses(
        (bonusRows ?? []).reduce((sum, r) => sum + (r.amount ?? 0), 0)
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
      .update({ full_name: data.full_name, phone: data.phone, company_name: data.company_name || null } as never)
      .eq('id', broker.id)
    setSaving(false)
    if (error) { toast.error('Error al guardar'); return }
    setBroker(prev => prev ? { ...prev, ...data } : prev)
    toast.success('Perfil actualizado')
    reset(data)
  }

  async function onSaveBankDetails(data: BankInput) {
    if (!broker) return
    setSavingBank(true)
    const { error } = await supabase
      .from('brokers')
      .update({ bank_cci: data.bank_cci, bank_name: data.bank_name, bank_titular: data.bank_titular } as never)
      .eq('id', broker.id)
    setSavingBank(false)
    if (error) { toast.error('Error al guardar datos bancarios'); return }
    setBroker(prev => prev ? { ...prev, ...data } : prev)
    toast.success('Datos bancarios guardados')
    resetBank(data)
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
    const { error } = await supabase.from('brokers').update({ referral_code: code } as never).eq('id', broker.id)
    setGeneratingCode(false)
    if (error) { toast.error('Error al generar código'); return }
    setBroker(prev => prev ? { ...prev, referral_code: code } : prev)
    toast.success('Código generado')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-[#18181B]/30" />
      </div>
    )
  }

  const tier = broker?.tier ?? 'bronce'
  const tierConfig = TIER_CONFIG[tier]

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi perfil</h1>
        <p className="text-white/50 text-sm mt-1">Gestiona tu información y código de referido.</p>
      </div>

      {/* Avatar + tier */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#18181B]/8 flex items-center justify-center text-[#18181B] font-bold text-xl">
            {broker ? generateInitials(broker.full_name) : '?'}
          </div>
          <div>
            <p className="text-lg font-semibold text-[#18181B]">{broker?.full_name}</p>
            <p className="text-sm text-[#18181B]/50">{broker?.email}</p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold mt-1 text-[#2855E0]">
              {tierConfig.icon} {tierConfig.label}
              {tierConfig.discount > 0 && ` · ${tierConfig.discount}% descuento`}
            </span>
          </div>
        </div>
      </div>

      {/* Profile form */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <User size={16} className="text-[#18181B]/40" />
          <h2 className="text-base font-semibold text-[#18181B]">Información personal</h2>
        </div>
        <form onSubmit={handleSubmit(onSaveProfile)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name" className="text-[#18181B] font-medium">Nombre completo</Label>
              <Input id="full_name" className="mt-1 rounded-xl border-[#18181B]/15" {...register('full_name')} />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="phone" className="text-[#18181B] font-medium">
                <Phone size={13} className="inline mr-1" />Teléfono
              </Label>
              <Input id="phone" className="mt-1 rounded-xl border-[#18181B]/15" {...register('phone')} />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="company_name" className="text-[#18181B] font-medium">
                <Building2 size={13} className="inline mr-1" />Inmobiliaria / empresa
                <span className="text-[#18181B]/40 text-xs ml-1">(opcional)</span>
              </Label>
              <Input id="company_name" className="mt-1 rounded-xl border-[#18181B]/15" {...register('company_name')} />
            </div>
            <div>
              <Label className="text-[#18181B] font-medium">DNI</Label>
              <Input value={broker?.dni ?? ''} disabled className="mt-1 rounded-xl bg-[#18181B]/3 text-[#18181B]/40 border-[#18181B]/8" />
            </div>
            <div>
              <Label className="text-[#18181B] font-medium">Email</Label>
              <Input value={broker?.email ?? ''} disabled className="mt-1 rounded-xl bg-[#18181B]/3 text-[#18181B]/40 border-[#18181B]/8" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 bg-[#18181B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#18181B]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </form>
      </div>

      {/* Referral code */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={16} className="text-[#18181B]/40" />
          <h2 className="text-base font-semibold text-[#18181B]">Código de referido</h2>
        </div>
        <p className="text-sm text-[#18181B]/50 mb-4">
          Comparte tu código con otros brokers. Ganas S/. 50 cada vez que alguien se registra con él y completa un trámite.
        </p>

        {broker?.referral_code ? (
          <ReferralCode code={broker.referral_code} />
        ) : (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-[#18181B]/50">Aún no tienes un código de referido.</p>
            <button
              onClick={generateReferralCode}
              disabled={generatingCode}
              className="inline-flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] text-sm font-medium px-4 py-2 rounded-full hover:bg-[#18181B]/5 transition-colors disabled:opacity-40"
            >
              {generatingCode
                ? <><Loader2 size={14} className="animate-spin" />Generando...</>
                : <><RefreshCw size={14} />Generar mi código</>
              }
            </button>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-slate-50 border border-[#18181B]/8 rounded-2xl p-4 text-center">
            <Users size={15} className="mx-auto text-[#2855E0] mb-1" />
            <p className="text-2xl font-bold text-[#18181B]">{referralCount}</p>
            <p className="text-xs text-[#18181B]/40 mt-0.5">Personas referidas</p>
          </div>
          <div className="bg-slate-50 border border-[#18181B]/8 rounded-2xl p-4 text-center">
            <PiggyBank size={15} className="mx-auto text-[#2855E0] mb-1" />
            <p className="text-lg font-bold text-[#18181B] tabular-nums">{formatPrice(referralBonuses)}</p>
            <p className="text-xs text-[#18181B]/40 mt-0.5">Bonos ganados</p>
          </div>
        </div>
      </div>

      {/* Bank details */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-6">
        <div className="flex items-center gap-2 mb-1">
          <Landmark size={16} className="text-[#18181B]/40" />
          <h2 className="text-base font-semibold text-[#18181B]">Datos bancarios</h2>
        </div>
        <p className="text-sm text-[#18181B]/50 mb-4">
          Se usarán automáticamente al generar tu pago de comisiones mensual.
        </p>
        <form onSubmit={handleSubmitBank(onSaveBankDetails)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="bank_cci" className="text-[#18181B] font-medium">
                Número CCI <span className="text-[#18181B]/40 text-xs">(20 dígitos)</span>
              </Label>
              <Input id="bank_cci" className="mt-1 font-mono rounded-xl border-[#18181B]/15" placeholder="00219300000000000000" maxLength={20} {...registerBank('bank_cci')} />
              {bankErrors.bank_cci && <p className="text-red-500 text-xs mt-1">{bankErrors.bank_cci.message}</p>}
            </div>
            <div>
              <Label htmlFor="bank_name" className="text-[#18181B] font-medium">Banco</Label>
              <Input id="bank_name" className="mt-1 rounded-xl border-[#18181B]/15" placeholder="BCP, Interbank, BBVA..." {...registerBank('bank_name')} />
              {bankErrors.bank_name && <p className="text-red-500 text-xs mt-1">{bankErrors.bank_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="bank_titular" className="text-[#18181B] font-medium">Titular de la cuenta</Label>
              <Input id="bank_titular" className="mt-1 rounded-xl border-[#18181B]/15" placeholder="Nombre completo" {...registerBank('bank_titular')} />
              {bankErrors.bank_titular && <p className="text-red-500 text-xs mt-1">{bankErrors.bank_titular.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingBank || !isBankDirty}
              className="inline-flex items-center gap-2 bg-[#18181B] text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#18181B]/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {savingBank && <Loader2 size={14} className="animate-spin" />}
              Guardar datos bancarios
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="rounded-3xl border border-[#18181B]/8 bg-white p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={16} className="text-[#18181B]/40" />
          <h2 className="text-base font-semibold text-[#18181B]">Cambiar contraseña</h2>
        </div>
        <form onSubmit={handleSubmitPwd(onChangePassword)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="password" className="text-[#18181B] font-medium">Nueva contraseña</Label>
              <Input id="password" type="password" className="mt-1 rounded-xl border-[#18181B]/15" placeholder="Mínimo 8 caracteres" {...registerPwd('password')} />
              {pwdErrors.password && <p className="text-red-500 text-xs mt-1">{pwdErrors.password.message}</p>}
            </div>
            <div>
              <Label htmlFor="confirm_password" className="text-[#18181B] font-medium">Confirmar contraseña</Label>
              <Input id="confirm_password" type="password" className="mt-1 rounded-xl border-[#18181B]/15" placeholder="Repite la contraseña" {...registerPwd('confirm_password')} />
              {pwdErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{pwdErrors.confirm_password.message}</p>}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center gap-2 border border-[#18181B]/15 text-[#18181B] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#18181B]/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {changingPassword && <Loader2 size={14} className="animate-spin" />}
              Actualizar contraseña
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
