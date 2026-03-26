'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cashoutFormSchema, type CashoutFormInput } from '@/lib/validations'
import { formatPrice, cn } from '@/lib/utils'
import { Banknote } from 'lucide-react'
import type { CashoutMethod, BankTransferDetails, WalletDetails } from '@/types/database'

interface CashoutDialogProps {
  availableBalance: number
  brokerId: string
  onSuccess: () => void
}

export default function CashoutDialog({
  availableBalance,
  brokerId,
  onSuccess,
}: CashoutDialogProps) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CashoutFormInput>({
    resolver: zodResolver(cashoutFormSchema),
  })

  const method = watch('method') as CashoutMethod | undefined

  const onSubmit = async (data: CashoutFormInput) => {
    let payment_details: BankTransferDetails | WalletDetails

    if (data.method === 'bank_transfer') {
      payment_details = {
        banco: data.banco!,
        cci: data.cci!,
        titular: data.titular,
        tipo_cuenta: data.tipo_cuenta!,
      }
    } else {
      payment_details = {
        titular: data.titular,
        telefono: data.telefono!,
      }
    }

    const { error } = await supabase.from('cashout_requests').insert({
      broker_id: brokerId,
      amount: data.amount,
      method: data.method,
      payment_details,
      status: 'pending' as const,
    })

    if (error) {
      toast.error('Error al enviar la solicitud. Intenta de nuevo.')
      return
    }

    toast.success('Solicitud de retiro enviada correctamente.')
    reset()
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={availableBalance <= 0}
          className="bg-brand-navy hover:bg-brand-navy-light text-white gap-2"
        >
          <Banknote size={16} />
          Solicitar retiro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar retiro de referidos</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Amount */}
          <div className="space-y-1.5">
            <Label>Monto a retirar</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 font-mono pointer-events-none">
                S/.
              </span>
              <Input
                type="number"
                min="1"
                max={availableBalance}
                step="0.01"
                placeholder="0.00"
                className={cn('pl-10 font-mono tabular-nums', errors.amount && 'border-red-400')}
                onChange={(e) =>
                  setValue('amount', parseFloat(e.target.value) || 0, { shouldValidate: true })
                }
              />
            </div>
            <p className="text-xs text-slate-500">
              Disponible:{' '}
              <span className="font-semibold text-brand-green tabular-nums">
                {formatPrice(availableBalance)}
              </span>
            </p>
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

          {/* Method */}
          <div className="space-y-1.5">
            <Label>Método de pago</Label>
            <Select
              onValueChange={(val) =>
                setValue('method', val as CashoutMethod, { shouldValidate: true })
              }
            >
              <SelectTrigger className={cn(errors.method && 'border-red-400')}>
                <SelectValue placeholder="Selecciona un método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank_transfer">🏦 Transferencia bancaria</SelectItem>
                <SelectItem value="yape">💜 Yape</SelectItem>
                <SelectItem value="plin">💚 Plin</SelectItem>
                <SelectItem value="otros">📱 Otros</SelectItem>
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-xs text-red-500">{errors.method.message}</p>
            )}
          </div>

          {/* Bank transfer fields */}
          {method === 'bank_transfer' && (
            <>
              <div className="space-y-1.5">
                <Label>Banco</Label>
                <Input
                  placeholder="Ej: BCP, Interbank, BBVA"
                  {...register('banco')}
                  className={cn(errors.banco && 'border-red-400')}
                />
                {errors.banco && (
                  <p className="text-xs text-red-500">{errors.banco.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>CCI (20 dígitos)</Label>
                <Input
                  placeholder="00219300000000000000"
                  maxLength={20}
                  className={cn('font-mono tracking-wider', errors.cci && 'border-red-400')}
                  {...register('cci')}
                />
                {errors.cci && (
                  <p className="text-xs text-red-500">{errors.cci.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Titular de la cuenta</Label>
                <Input
                  placeholder="Nombre completo"
                  {...register('titular')}
                  className={cn(errors.titular && 'border-red-400')}
                />
                {errors.titular && (
                  <p className="text-xs text-red-500">{errors.titular.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Tipo de cuenta</Label>
                <Select
                  onValueChange={(val) =>
                    setValue('tipo_cuenta', val as 'ahorros' | 'corriente', {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className={cn(errors.tipo_cuenta && 'border-red-400')}>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ahorros">Ahorros</SelectItem>
                    <SelectItem value="corriente">Corriente</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_cuenta && (
                  <p className="text-xs text-red-500">{errors.tipo_cuenta.message}</p>
                )}
              </div>
            </>
          )}

          {/* Yape / Plin / Otros fields */}
          {(method === 'yape' || method === 'plin' || method === 'otros') && (
            <>
              <div className="space-y-1.5">
                <Label>Titular</Label>
                <Input
                  placeholder="Nombre completo"
                  {...register('titular')}
                  className={cn(errors.titular && 'border-red-400')}
                />
                {errors.titular && (
                  <p className="text-xs text-red-500">{errors.titular.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Teléfono (9 dígitos)</Label>
                <Input
                  placeholder="987654321"
                  maxLength={9}
                  className={cn('font-mono', errors.telefono && 'border-red-400')}
                  {...register('telefono')}
                />
                {errors.telefono && (
                  <p className="text-xs text-red-500">{errors.telefono.message}</p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); setOpen(false) }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !method}
              className="bg-brand-navy hover:bg-brand-navy-light text-white"
            >
              {isSubmitting ? 'Enviando...' : 'Confirmar solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
