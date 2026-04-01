'use client'

import { useState } from 'react'

interface Tier {
  min: number
  max: number
  name: string
  rate: number
  pct: string
  color: string
}

const TIERS: Tier[] = [
  { min: 1,  max: 3,   name: 'Nivel 1', rate: 0.03, pct: '3%', color: '#CD7F32' },
  { min: 4,  max: 7,   name: 'Nivel 2', rate: 0.05, pct: '5%', color: '#6B7280' },
  { min: 8,  max: 999, name: 'Nivel 3', rate: 0.08, pct: '8%', color: '#D47151' },
]

const TICKET_PRESETS = [300, 500, 800, 1000, 1500]

function getTier(tramites: number): Tier {
  for (const t of TIERS) {
    if (tramites >= t.min && tramites <= t.max) return t
  }
  return TIERS[TIERS.length - 1]
}

function fmtSoles(n: number): string {
  const s = String(Math.round(n))
  return 'S/. ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export default function CommissionCalculator() {
  const [tramites, setTramites]         = useState<number>(5)
  const [ticket, setTicket]             = useState<number>(1000)
  const [customTicket, setCustomTicket] = useState<string>('')

  const effectiveTicket = customTicket !== '' ? (parseInt(customTicket, 10) || 0) : ticket
  const tier     = getTier(tramites)
  const nextTier = TIERS.find(t => t.min > tier.min) ?? null
  const toNext   = nextTier ? nextTier.min - tramites : 0
  const monthly  = Math.round(tramites * effectiveTicket * tier.rate)
  const annual   = monthly * 12

  const sliderBg = `linear-gradient(to right, #18181B ${((tramites - 1) / 19) * 100}%, #18181B1a ${((tramites - 1) / 19) * 100}%)`

  return (
    <div className="bg-white rounded-3xl shadow-[0_8px_48px_rgba(18,22,31,0.08)] border border-[#18181B]/6 overflow-hidden">
      <div className="p-6 sm:p-8 space-y-6">

        {/* ── Slider ───────────────────────────────────── */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <label className="text-[15px] font-semibold text-[#18181B]" htmlFor="calc-slider">
              Trámites al mes
            </label>
            <span className="font-display text-[32px] font-bold text-[#18181B] tabular-nums leading-none">
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
            className="commission-range w-full h-2 rounded-full appearance-none cursor-pointer focus:outline-none"
            style={{ background: sliderBg }}
          />
          <div className="flex justify-between text-[11px] text-[#18181B]/25 mt-2 select-none font-medium" aria-hidden="true">
            <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span>
          </div>
        </div>

        {/* ── Ticket presets ───────────────────────────── */}
        <div>
          <p className="text-[15px] font-semibold text-[#18181B] mb-3">Precio promedio del trámite</p>
          <div className="grid grid-cols-5 gap-2 mb-2">
            {TICKET_PRESETS.map(v => {
              const isActive = ticket === v && customTicket === ''
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => { setTicket(v); setCustomTicket('') }}
                  className={
                    'py-2.5 rounded-xl text-[12px] font-semibold transition-all duration-150 ' +
                    (isActive
                      ? 'bg-[#18181B] text-white shadow-sm'
                      : 'bg-[#18181B]/5 text-[#18181B]/50 hover:bg-[#18181B]/10')
                  }
                >
                  {v >= 1000 ? `S/${v / 1000}k` : `S/${v}`}
                </button>
              )
            })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-[#18181B]/30 font-medium shrink-0">Otro:</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#18181B]/35 font-medium pointer-events-none">S/.</span>
              <input
                type="number"
                placeholder="Ingresa precio"
                value={customTicket}
                onChange={e => { setCustomTicket(e.target.value); setTicket(0) }}
                min={100}
                max={20000}
                step={100}
                className="w-full border border-[#18181B]/10 rounded-xl pl-10 pr-3 py-2 text-[13px] font-medium text-[#18181B] focus:outline-none focus:border-[#18181B]/25 bg-[#F4F4F5] placeholder:text-[#18181B]/25"
              />
            </div>
          </div>
        </div>

        {/* ── Tier cards ───────────────────────────────── */}
        <div className="grid grid-cols-3 gap-2">
          {TIERS.map(t => {
            const active = tier.name === t.name
            return (
              <div
                key={t.name}
                className={'rounded-xl p-3 border transition-all duration-200 ' + (active ? 'scale-[1.03] shadow-sm' : 'opacity-40')}
                style={active
                  ? { borderColor: t.color, backgroundColor: t.color + '15' }
                  : { borderColor: '#18181B15' }
                }
              >
                <div className="font-display text-[24px] font-bold leading-none mb-0.5" style={{ color: active ? t.color : '#18181B' }}>
                  {t.pct}
                </div>
                <div className="text-[11px] font-medium text-[#18181B]/50">{t.name}</div>
                <div className="text-[10px] text-[#18181B]/30 mt-0.5">
                  {t.min}–{t.max >= 99 ? '∞' : t.max} / mes
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Result panel ─────────────────────────────── */}
      <div className="bg-[#18181B] px-6 sm:px-8 py-7">
        <div className="text-[11px] text-white/35 font-semibold uppercase tracking-widest mb-1.5">
          Comisión mensual estimada
        </div>
        <div
          className="font-display font-bold text-white leading-none tabular-nums"
          style={{ fontSize: 'clamp(40px, 6vw, 54px)' }}
        >
          {fmtSoles(monthly)}
        </div>
        <div className="text-[11px] text-white/25 mt-2">
          {tramites} trámites × {fmtSoles(effectiveTicket)} × {tier.pct}
        </div>

        <div className="mt-5 pt-5 border-t border-white/6 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-white/25 mb-0.5">Proyección anual</div>
            <div className="font-display text-[20px] font-semibold text-white/60 tabular-nums">
              {fmtSoles(annual)}
            </div>
          </div>
          {toNext > 0 && nextTier ? (
            <div className="text-right">
              <div className="text-[11px] text-white/25 mb-0.5">Próximo nivel</div>
              <div className="text-[13px] text-[#D47151] font-semibold">
                +{toNext} trámite{toNext > 1 ? 's' : ''} → {nextTier.pct}
              </div>
            </div>
          ) : (
            <div className="bg-[#D47151]/15 border border-[#D47151]/20 rounded-xl px-3.5 py-2.5">
              <div className="text-[11px] text-[#D47151]/70 font-medium mb-0.5">Nivel máximo</div>
              <div className="text-[13px] text-[#D47151] font-bold">Nivel 3 · 8%</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
