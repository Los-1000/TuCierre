'use client'

import { useState } from 'react'

const AVG_TICKET = 900
const CASHBACK = 0.05   // 5% on your own trámites
const REFERRAL = 0.01   // 1% on your referrals' trámites

function fmtSoles(n: number) {
  return 'S/. ' + Math.round(n).toLocaleString('es-PE')
}

export default function CommissionCalculator() {
  const [tramites, setTramites] = useState(5)
  const [referidos, setReferidos] = useState(2)

  const own     = Math.round(tramites * AVG_TICKET * CASHBACK)
  const ref     = Math.round(referidos * AVG_TICKET * REFERRAL)
  const monthly = own + ref
  const annual  = monthly * 12

  const pctOwn = ((tramites - 1) / 19) * 100
  const sliderOwn = `linear-gradient(to right, var(--brand-blue) ${pctOwn}%, rgba(2,9,82,0.12) ${pctOwn}%)`
  const pctRef = (referidos / 20) * 100
  const sliderRef = `linear-gradient(to right, var(--brand-success) ${pctRef}%, rgba(2,9,82,0.12) ${pctRef}%)`

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 32px 64px rgba(0,0,0,0.35)' }}
    >
      {/* Sliders — white card */}
      <div className="p-8 space-y-7 bg-white">

        {/* Your trámites → 5% */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <label htmlFor="calc-own" className="text-base font-semibold text-brand-navy">
              Tus trámites al mes
            </label>
            <span className="font-black tabular-nums text-4xl tracking-tighter text-brand-navy">
              {tramites}
            </span>
          </div>
          <input
            id="calc-own"
            type="range"
            min={1}
            max={20}
            step={1}
            value={tramites}
            onChange={e => setTramites(Number(e.target.value))}
            className="commission-range w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2"
            style={{ background: sliderOwn }}
            aria-valuemin={1}
            aria-valuemax={20}
            aria-valuenow={tramites}
            aria-valuetext={`${tramites} trámites`}
          />
          <p className="text-xs font-medium mt-2 text-brand-navy/55">
            5% de cashback sobre cada trámite que cierras
          </p>
        </div>

        {/* Referral trámites → 1% */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <label htmlFor="calc-ref" className="text-base font-semibold text-brand-navy">
              Trámites de tus referidos
            </label>
            <span className="font-black tabular-nums text-4xl tracking-tighter text-brand-navy">
              {referidos}
            </span>
          </div>
          <input
            id="calc-ref"
            type="range"
            min={0}
            max={20}
            step={1}
            value={referidos}
            onChange={e => setReferidos(Number(e.target.value))}
            className="commission-range w-full h-2 rounded-full appearance-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-success focus-visible:ring-offset-2"
            style={{ background: sliderRef }}
            aria-valuemin={0}
            aria-valuemax={20}
            aria-valuenow={referidos}
            aria-valuetext={`${referidos} trámites de referidos`}
          />
          <p className="text-xs font-medium mt-2 text-brand-navy/55">
            1% adicional por cada trámite que cierran tus referidos
          </p>
        </div>
      </div>

      {/* Result panel — navy */}
      <div className="px-8 py-7 bg-brand-navy">
        <p className="text-xs font-bold uppercase tracking-widest mb-1 text-white/60">
          Cashback mensual estimado
        </p>
        <p
          className="font-black text-white leading-none tabular-nums"
          style={{ fontSize: 'clamp(36px, 5vw, 52px)' }}
        >
          {fmtSoles(monthly)}
        </p>
        <p className="text-xs mt-2 text-white/55">
          {fmtSoles(own)} por tus trámites (5%) + {fmtSoles(ref)} por referidos (1%)
        </p>

        <div className="mt-5 pt-5 border-t border-white/8 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs mb-0.5 text-white/60">Proyección anual</p>
            <p className="text-xl font-bold tabular-nums text-white">{fmtSoles(annual)}</p>
          </div>
          <div className="px-3.5 py-2.5 rounded-xl border bg-brand-success/12 border-brand-success/28">
            <p className="text-xs font-medium text-brand-success/80">Sin niveles</p>
            <p className="text-sm font-black text-brand-emerald-light">5% + 1% fijo</p>
          </div>
        </div>
      </div>
    </div>
  )
}
