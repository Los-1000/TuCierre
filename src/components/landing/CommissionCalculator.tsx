'use client'

import { useState } from 'react'

const AVG_TICKET = 900

const TIERS = [
  { min: 1,  max: 3,   name: 'Nivel 1', rate: 0.03, pct: '3%', color: '#4D78FF' },
  { min: 4,  max: 7,   name: 'Nivel 2', rate: 0.05, pct: '5%', color: '#020952' },
  { min: 8,  max: 999, name: 'Nivel 3', rate: 0.08, pct: '8%', color: '#1C7A52' },
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

  const pct = ((tramites - 1) / 19) * 100
  const sliderBg = `linear-gradient(to right, #4D78FF ${pct}%, rgba(2,9,82,0.12) ${pct}%)`

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.35)' }}
    >
      {/* Slider + tiers — white card */}
      <div className="p-8 space-y-6 bg-white">

        {/* Slider */}
        <div>
          <div className="flex items-baseline justify-between mb-5">
            <label htmlFor="calc-slider" className="text-base font-semibold" style={{ color: '#020952' }}>
              Trámites al mes
            </label>
            <span className="font-black tabular-nums text-4xl tracking-tighter" style={{ color: '#020952' }}>
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
            className="commission-range w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4D78FF] focus-visible:ring-offset-2"
            style={{ background: sliderBg }}
            aria-valuemin={1}
            aria-valuemax={20}
            aria-valuenow={tramites}
            aria-valuetext={`${tramites} trámites`}
          />

          <div
            className="flex justify-between text-xs font-medium mt-2 select-none"
            style={{ color: 'rgba(2,9,82,0.3)' }}
            aria-hidden="true"
          >
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
          </div>
        </div>

        {/* Tier indicators */}
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map(t => {
            const active = tier.name === t.name
            return (
              <div
                key={t.name}
                className="rounded-xl p-3 border transition-all duration-200"
                style={
                  active
                    ? { borderColor: t.color, background: `${t.color}12`, transform: 'scale(1.03)' }
                    : { borderColor: 'rgba(2,9,82,0.1)', background: 'rgba(2,9,82,0.02)' }
                }
              >
                <div className="font-black text-2xl leading-none tabular-nums" style={{ color: active ? t.color : 'rgba(2,9,82,0.25)' }}>
                  {t.pct}
                </div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: active ? 'rgba(2,9,82,0.7)' : 'rgba(2,9,82,0.35)' }}>
                  {t.name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: 'rgba(2,9,82,0.3)' }}>
                  {t.min}–{t.max >= 99 ? '∞' : t.max}/mes
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Result panel — navy */}
      <div className="px-8 py-7" style={{ background: '#020952' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Comisión mensual estimada
        </p>
        <p
          className="font-black text-white leading-none tabular-nums"
          style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
        >
          {fmtSoles(monthly)}
        </p>
        <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {tramites} trámites × S/. {AVG_TICKET.toLocaleString('es-PE')} promedio × {tier.pct}
        </p>

        <div
          className="mt-5 pt-5 border-t flex items-center justify-between gap-4"
          style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        >
          <div>
            <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Proyección anual</p>
            <p className="text-xl font-bold tabular-nums text-white">{fmtSoles(annual)}</p>
          </div>

          {toNext > 0 && nextTier ? (
            <div className="text-right">
              <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Para subir de nivel</p>
              <p className="text-sm font-bold text-white">
                +{toNext} trámite{toNext > 1 ? 's' : ''} → {nextTier.pct}
              </p>
            </div>
          ) : (
            <div className="px-3.5 py-2.5 rounded-xl border" style={{ background: 'rgba(28,122,82,0.12)', borderColor: 'rgba(28,122,82,0.28)' }}>
              <p className="text-xs font-medium" style={{ color: 'rgba(28,122,82,0.8)' }}>Nivel máximo</p>
              <p className="text-sm font-black" style={{ color: '#22A06B' }}>Nivel 3 · 8%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
