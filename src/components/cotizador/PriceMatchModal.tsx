'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Upload } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      })

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>¿Tienes una cotización más baja?</DialogTitle>
          <p className="text-sm text-slate-500">
            Te igualamos el precio. Envíanos la evidencia y respondemos en máximo 2 horas.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="competitor_name">
              Notaría competidora <span className="text-red-500">*</span>
            </Label>
            <Input
              id="competitor_name"
              placeholder="Notaría García & Asociados"
              className="mt-1"
              {...register('competitor_name')}
            />
            {errors.competitor_name && (
              <p className="text-red-600 text-xs mt-1">{errors.competitor_name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="competitor_price">
              Precio cotizado (S/.) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="competitor_price"
              type="number"
              placeholder="1200.00"
              step="0.01"
              min="1"
              className="mt-1"
              {...register('competitor_price', { valueAsNumber: true })}
            />
            {errors.competitor_price && (
              <p className="text-red-600 text-xs mt-1">{errors.competitor_price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="evidence">
              Evidencia <span className="text-slate-400 text-xs">(foto o PDF, máx. 5 MB)</span>
            </Label>
            <label
              htmlFor="evidence"
              className="mt-1 flex items-center gap-2 border-2 border-dashed border-slate-300 rounded-lg p-3 cursor-pointer hover:border-brand-navy/40 transition-colors"
            >
              <Upload size={16} className="text-slate-400" />
              <span className="text-sm text-slate-500">
                {evidenceFile ? evidenceFile.name : 'Seleccionar archivo'}
              </span>
              <input
                id="evidence"
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="sr-only"
              />
            </label>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin" />}
              Enviar solicitud
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
