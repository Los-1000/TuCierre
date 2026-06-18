'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Home, FileText, Heart, Users, ChevronRight } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice, type Currency } from '@/lib/utils'
import { toast } from 'sonner'

const TRAMITE_TYPES = [
  { value: 'COMPRAVENTA', label: 'Compraventa', desc: 'Transferencia de propiedad entre partes', icon: Home },
  { value: 'HIPOTECA', label: 'Hipoteca', desc: 'Constitución de garantía hipotecaria', icon: FileText },
  { value: 'DONACION', label: 'Donación', desc: 'Donación de inmueble a tercero', icon: Heart },
  { value: 'SUCESION', label: 'Sucesión', desc: 'Declaratoria de herederos o testamento', icon: Users },
]

const DISTRICTS = [
  'Barranco', 'Chorrillos', 'La Molina', 'Lince', 'Magdalena del Mar',
  'Miraflores', 'Pueblo Libre', 'San Borja', 'San Isidro', 'San Miguel',
  'Santiago de Surco', 'Surquillo',
]

const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'PEN', label: 'S/ Soles' },
  { value: 'USD', label: 'US$ Dólares' },
]

function calcFee(propertyValue: number) {
  return Math.max(propertyValue * 0.008, 500)
}

export default function CotizarClient() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [tramiteType, setTramiteType] = useState('')
  const [address, setAddress] = useState('')
  const [district, setDistrict] = useState('')
  const [propertyValue, setPropertyValue] = useState('')
  const [currency, setCurrency] = useState<Currency>('PEN')
  const [submitting, setSubmitting] = useState(false)

  const numValue = parseFloat(propertyValue.replace(/,/g, '')) || 0
  const fee = calcFee(numValue)

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await api.tramites.create({
        tramiteType,
        propertyAddress: address,
        propertyDistrictAddress: district,
        quotedPriceProperty: numValue,
        currency,
      })
      toast.success('Trámite creado correctamente')
      router.push('/tramites')
    } catch {
      toast.error('No se pudo crear el trámite')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-navy-100 text-navy-500 hover:bg-navy-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
        ) : (
          <div className="w-9 h-9" />
        )}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-navy-900 font-inter tracking-tight">Nueva cotización</h1>
          <p className="text-sm text-navy-400">Paso {step} de 3</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className="h-1 flex-1 rounded-full transition-all motion-reduce:transition-none duration-300"
            style={{ background: s <= step ? '#2c4dfb' : '#e1e7f3' }}
          />
        ))}
      </div>

      {/* Step 1: Tramite type — vertical list */}
      {step === 1 && (
        <div className="space-y-2">
          <p className="text-sm text-navy-500">¿Qué tipo de trámite notarial necesitas?</p>
          <div className="space-y-2">
            {TRAMITE_TYPES.map(({ value, label, desc, icon: Icon }) => {
              const selected = tramiteType === value
              return (
                <button
                  key={value}
                  onClick={() => { setTramiteType(value); setStep(2) }}
                  className="w-full bg-white border rounded-xl p-4 text-left transition-all motion-reduce:transition-none hover:border-blue-300 flex items-center gap-4"
                  style={{ borderColor: selected ? '#2c4dfb' : '#e1e7f3', background: selected ? '#f9faff' : 'white' }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: selected ? '#2c4dfb' : '#eff2ff' }}
                  >
                    <Icon size={17} style={{ color: selected ? 'white' : '#2c4dfb' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-navy-900">{label}</div>
                    <div className="text-xs text-navy-400 mt-0.5">{desc}</div>
                  </div>
                  <ChevronRight size={15} className="text-navy-300 shrink-0" />
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 2: Property data + price preview */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-navy-100 p-5 space-y-4">
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">Datos del inmueble</h3>
            <div className="space-y-1">
              <label className="text-xs font-medium text-navy-600">Dirección</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Av. Larco 1234, Miraflores"
                className="w-full h-10 px-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 placeholder:text-navy-300 outline-none focus:border-blue-400"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-navy-600">Distrito</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-10 px-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 outline-none focus:border-blue-400"
              >
                <option value="">Selecciona un distrito</option>
                {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Currency selector */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-navy-600">Moneda</label>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => {
                  const active = currency === c.value
                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCurrency(c.value)}
                      className="h-10 rounded-lg text-sm font-semibold border transition-colors"
                      style={active
                        ? { background: '#eff2ff', borderColor: '#2c4dfb', color: '#2c4dfb' }
                        : { background: '#f8f9fc', borderColor: '#e1e7f3', color: '#6b7fa8' }}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-navy-600">
                Valor del inmueble ({currency === 'USD' ? 'US$' : 'S/'})
              </label>
              <input
                type="number"
                value={propertyValue}
                onChange={(e) => setPropertyValue(e.target.value)}
                placeholder="Ej: 250000"
                min={0}
                className="w-full h-10 px-3 text-sm border border-navy-100 rounded-lg bg-navy-50 text-navy-900 placeholder:text-navy-300 outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {numValue > 0 && (
            <div className="bg-white rounded-xl border border-navy-100 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">Tarifa estimada</h3>
                <span className="text-lg font-bold tabular-nums" style={{ color: '#2c4dfb' }}>
                  {formatPrice(fee, currency)}
                </span>
              </div>
              <p className="text-xs text-navy-300 pt-2">
                Estimado sobre el valor del inmueble. La tarifa final la confirma el notario asignado.
              </p>
            </div>
          )}

          <button
            onClick={() => setStep(3)}
            disabled={!address.trim() || !district || !propertyValue}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: '#2c4dfb' }}
          >
            Continuar <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-navy-100 p-5 space-y-3">
            <h3 className="text-xs font-bold text-navy-500 uppercase tracking-wide">Resumen del trámite</h3>
            {[
              { label: 'Tipo', value: TRAMITE_TYPES.find((t) => t.value === tramiteType)?.label ?? tramiteType },
              { label: 'Dirección', value: address },
              { label: 'Distrito', value: district },
              { label: 'Moneda', value: currency === 'USD' ? 'Dólares (US$)' : 'Soles (S/)' },
              { label: 'Valor del inmueble', value: formatPrice(numValue, currency) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-1 border-b border-navy-50 last:border-0">
                <span className="text-xs text-navy-400">{label}</span>
                <span className="text-xs font-medium text-navy-900">{value}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1">
              <span className="text-xs text-navy-400">Tarifa estimada</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: '#2c4dfb' }}>{formatPrice(fee, currency)}</span>
            </div>
          </div>

          <p className="text-xs text-navy-400 text-center">
            La tarifa final será confirmada por el notario asignado.
          </p>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-50"
            style={{ background: '#2c4dfb' }}
          >
            {submitting ? 'Enviando...' : <><Check size={15} /> Confirmar y enviar</>}
          </button>
        </div>
      )}
    </div>
  )
}
