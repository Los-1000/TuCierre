'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload, X } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { priceMatchSchema, type PriceMatchInput } from '@/lib/validations'
import { toast } from 'sonner'

interface PriceMatchModalProps {
  open: boolean
  onClose: () => void
  tramiteTypeId: string
}

export default function PriceMatchModal({ open, onClose, tramiteTypeId }: PriceMatchModalProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PriceMatchInput>({
    resolver: zodResolver(priceMatchSchema),
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('El archivo no puede ser mayor a 5 MB')
        return
      }
      setEvidenceFile(file)
    }
  }

  const onSubmit = async (data: PriceMatchInput) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { toast.error('Sesión expirada'); return }

      let evidenceUrl: string | null = null
      if (evidenceFile) {
        const path = `price-match/${user.id}/${Date.now()}-${evidenceFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(path, evidenceFile)
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('documents').getPublicUrl(path)
          evidenceUrl = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('price_match_requests').insert({
        broker_id: user.id,
        tramite_type_id: tramiteTypeId,
        competitor_name: data.competitor_name,
        competitor_price: data.competitor_price,
        evidence_url: evidenceUrl,
      } as never)

      if (error) throw error

      toast.success('Solicitud enviada. Responderemos en máximo 2 horas.')
      reset()
      setEvidenceFile(null)
      onClose()
    } catch {
      toast.error('Error al enviar la solicitud')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-[#18181B]/8 shadow-[0_8px_48px_rgba(18,18,27,0.12)] p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#18181B]/8">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-[#18181B]">
                ¿Tienes una cotización más baja?
              </DialogTitle>
              <p className="text-sm text-[#18181B]/50 mt-1">
                Te igualamos el precio en máximo 2 horas.
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#18181B]/6 transition-colors text-[#18181B]/40"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Competitor name */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
              Notaría competidora <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="Notaría García & Asociados"
              className="w-full h-11 px-4 rounded-2xl border border-[#18181B]/15 bg-white text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 focus:border-[#2855E0] transition-colors placeholder:text-[#18181B]/30"
              {...register('competitor_name')}
            />
            {errors.competitor_name && (
              <p className="text-red-500 text-xs mt-1">{errors.competitor_name.message}</p>
            )}
          </div>

          {/* Competitor price */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
              Precio cotizado (S/.) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              placeholder="1200.00"
              step="0.01"
              min="1"
              className="w-full h-11 px-4 rounded-2xl border border-[#18181B]/15 bg-white text-sm text-[#18181B] focus:outline-none focus:ring-2 focus:ring-[#2855E0]/30 focus:border-[#2855E0] transition-colors placeholder:text-[#18181B]/30 font-mono"
              {...register('competitor_price', { valueAsNumber: true })}
            />
            {errors.competitor_price && (
              <p className="text-red-500 text-xs mt-1">{errors.competitor_price.message}</p>
            )}
          </div>

          {/* Evidence file upload */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-[#18181B]/50 block mb-1.5">
              Evidencia <span className="text-[#18181B]/30 text-xs font-normal normal-case">(foto o PDF, máx. 5 MB)</span>
            </label>
            <label
              htmlFor="evidence-modal"
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#18181B]/20 rounded-2xl p-6 cursor-pointer hover:border-[#2855E0]/40 hover:bg-[#2855E0]/3 transition-all"
            >
              <Upload size={22} className="text-[#2855E0]" />
              <span className="text-sm text-[#18181B]/60">
                {evidenceFile ? evidenceFile.name : 'Haz clic para subir la cotización'}
              </span>
              {!evidenceFile && (
                <span className="text-xs text-[#18181B]/40">PDF, JPG, PNG — máx. 5 MB</span>
              )}
              <input
                id="evidence-modal"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 border border-[#18181B]/15 text-[#18181B] rounded-full font-semibold text-sm hover:bg-[#18181B]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 flex items-center justify-center gap-2 bg-[#18181B] text-white rounded-full font-semibold text-sm hover:bg-[#18181B]/90 transition-colors disabled:opacity-60"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Enviar solicitud
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
