'use client'

import { useFieldArray, UseFormReturn } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PARTY_ROLES } from '@/lib/constants'
import type { CotizadorStep2Input } from '@/lib/validations'

interface PartiesFormProps {
  form: UseFormReturn<CotizadorStep2Input>
}

export default function PartiesForm({ form }: PartiesFormProps) {
  const { register, formState: { errors }, setValue, watch } = form
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'parties',
  })

  const addParty = () => {
    append({ name: '', dni: '', role: 'comprador', email: '', phone: '' })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">Partes involucradas</h3>
        <Button type="button" variant="outline" size="sm" onClick={addParty}>
          <Plus size={14} />
          Agregar parte
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
          <p className="text-sm text-slate-500 mb-3">No hay partes agregadas</p>
          <Button type="button" variant="outline" size="sm" onClick={addParty}>
            <Plus size={14} />
            Agregar primera parte
          </Button>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Parte {index + 1}</span>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                aria-label="Eliminar parte"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Name */}
            <div className="col-span-2">
              <Label className="text-xs text-slate-600">
                Nombre completo <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`parties.${index}.name`)}
                placeholder="Juan García Pérez"
                className="mt-1"
              />
              {errors.parties?.[index]?.name && (
                <p className="text-red-600 text-xs mt-0.5">{errors.parties[index]?.name?.message}</p>
              )}
            </div>

            {/* DNI */}
            <div>
              <Label className="text-xs text-slate-600">
                DNI <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register(`parties.${index}.dni`)}
                placeholder="12345678"
                maxLength={8}
                inputMode="numeric"
                className="mt-1"
              />
              {errors.parties?.[index]?.dni && (
                <p className="text-red-600 text-xs mt-0.5">{errors.parties[index]?.dni?.message}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <Label className="text-xs text-slate-600">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch(`parties.${index}.role`)}
                onValueChange={(val) => setValue(`parties.${index}.role`, val as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PARTY_ROLES.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Email */}
            <div>
              <Label className="text-xs text-slate-600">Email</Label>
              <Input
                {...register(`parties.${index}.email`)}
                type="email"
                placeholder="email@ejemplo.com"
                className="mt-1"
              />
              {errors.parties?.[index]?.email && (
                <p className="text-red-600 text-xs mt-0.5">{errors.parties[index]?.email?.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <Label className="text-xs text-slate-600">Teléfono</Label>
              <Input
                {...register(`parties.${index}.phone`)}
                type="tel"
                placeholder="987 654 321"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      ))}
      {errors.parties && typeof errors.parties === 'object' && 'message' in errors.parties && (
        <p className="text-red-600 text-xs">{(errors.parties as any).message}</p>
      )}
    </div>
  )
}
