'use client'

import { useState } from 'react'

// Average ticket price based on common notarial services in Lima
const AVG_TICKET = 900

const TIERS = [
  { min: 1, max: 3,   name: 'Nivel 1', rate: 0.03, pct: '3%',  color: '#b5540e' },
  { min: 4, max: 7,   name: 'Nivel 2', rate: 0.05, pct: '5%',  color: '#d06d0d' },
  { min: 8, max: 999, name: 'Nivel 3', rate: 0.08, pct: '8%',  color: '#22c55e' },
]

function getTier(tramites: number) {
  return TIERS.find(t => tramites >= t.min && tramites <= t.max) ?? TIERS[TIERS.length - 1]
}

function fmtSoles(n: number) {
  return 'S/. ' + Math.round(n).toLocaleString('es-PE')
}

export default function CommissionCalculator() {
  const [tramites, setTramites] = useState(5)

  const tier    = getTier(tramites)
  const monthly = Math.round(tramites * AVG_TICKET * tier.rate)
  const annual  = monthly * 12
  const nextTier = TIERS.find(t => t.min > tier.min) ?? null
  const toNext   = nextTier ? nextTier.min - tramites : 0

  const sliderBg = `linear-gradient(to right, #0a1f44 ${((tramites - 1) / 19) * 100}%, #0a1f4430 ${((tramites - 1) / 19) * 100}%)`

  return (
    <div className="bg-white rounded-2xl shadow-[0_8px_48px_rgba(10,31,68,0.10)] border border-[#0a1f44]/8 overflow-hidden">

      {/* Slider */}
      <div className="p-8 space-y-6">
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <label htmlFor="calc-slider" className="text-base font-semibold" style={{ color: '#00081e' }}>
              Trámites que cierras al mes
            </label>
            <span className="font-black tabular-nums text-4xl" style={{ color: '#0a1f44' }}>
              {tramites}
            </span>
          </div>

          <input
            id="calc-slider"
            type="range"
            min={1}
            max={20}
            step={1}
            value={tramites}
            onChange={e => setTramites(Number(e.target.value))}
            className="commission-range w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d06d0d] focus-visible:ring-offset-2"
            style={{ background: sliderBg }}
            aria-valuemin={1}
            aria-valuemax={20}
            aria-valuenow={tramites}
            aria-valuetext={`${tramites} trámites`}
          />

          <div className="flex justify-between text-xs font-medium mt-2 select-none" style={{ color: '#0a1f4440' }} aria-hidden="true">
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
          </div>
        </div>

        {/* Tier indicator */}
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map(t => {
            const active = tier.name === t.name
            return (
              <div
                key={t.name}
                className="rounded-xl p-3 border transition-all duration-200"
                style={active
                  ? { borderColor: t.color, background: `${t.color}15`, transform: 'scale(1.03)' }
                  : { borderColor: '#0a1f4415', background: 'transparent', opacity: 0.4 }
                }
              >
                <div className="font-black text-2xl leading-none tabular-nums" style={{ color: active ? t.color : '#00081e' }}>
                  {t.pct}
                </div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: '#44464e' }}>{t.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#44464e80' }}>
                  {t.min}–{t.max >= 99 ? '∞' : t.max}/mes
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Result */}
      <div className="px-8 py-7" style={{ background: '#0a1f44' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#7f9fc2' }}>
          Comisión mensual estimada
        </p>
        <p className="font-black text-white leading-none tabular-nums" style={{ fontSize: 'clamp(36px,5vw,52px)' }}>
          {fmtSoles(monthly)}
        </p>
        <p className="text-xs mt-2" style={{ color: '#7f9fc270' }}>
          {tramites} trámites × S/. {AVG_TICKET.toLocaleString('es-PE')} promedio × {tier.pct}
        </p>

        <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs mb-0.5" style={{ color: '#7f9fc250' }}>Proyección anual</p>
            <p className="text-xl font-bold tabular-nums" style={{ color: '#ffffff80' }}>
              {fmtSoles(annual)}
            </p>
          </div>

          {toNext > 0 && nextTier ? (
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: '#7f9fc250' }}>Próximo nivel</p>
              <p className="text-sm font-bold" style={{ color: '#d06d0d' }}>
                +{toNext} trámite{toNext > 1 ? 's' : ''} → {nextTier.pct}
              </p>
            </div>
          ) : (
            <div
              className="px-3.5 py-2.5 rounded-xl border"
              style={{ background: '#22c55e15', borderColor: '#22c55e30' }}
            >
              <p className="text-xs font-medium" style={{ color: '#22c55e80' }}>Nivel máximo</p>
              <p className="text-sm font-black" style={{ color: '#22c55e' }}>Nivel 3 · 8%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
