'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { formatPrice } from '@/lib/utils'
import type { TramiteType } from '@/types/database'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'

// --- Schema ---
const tramiteTypeSchema = z.object({
  name: z.string().min(1, 'Requerido'),
  display_name: z.string().min(1, 'Requerido'),
  description: z.string().optional(),
  base_price: z.number({ invalid_type_error: 'Debe ser un número' }).min(0, 'Mínimo 0'),
  estimated_days: z.number({ invalid_type_error: 'Debe ser un número' }).int().min(1, 'Mínimo 1 día'),
  is_active: z.boolean().default(true),
  required_documents: z
    .array(z.object({ value: z.string().min(1, 'El documento no puede estar vacío') }))
    .min(1, 'Agrega al menos un documento requerido'),
})

type FormValues = z.infer<typeof tramiteTypeSchema>

type EditMode = 'create' | 'edit'

export default function SuperAdminTiposPage() {
  const supabase = createClient()

  const [tipoList, setTipoList] = useState<TramiteType[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<EditMode>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(tramiteTypeSchema),
    defaultValues: {
      name: '',
      display_name: '',
      description: '',
      base_price: 0,
      estimated_days: 1,
      is_active: true,
      required_documents: [{ value: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'required_documents',
  })

  const fetchTipos = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('tramite_types')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      toast.error('Error al cargar tipos de trámite')
    } else {
      setTipoList((data ?? []) as TramiteType[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchTipos()
  }, [fetchTipos])

  function openCreateDialog() {
    setDialogMode('create')
    setEditingId(null)
    reset({
      name: '',
      display_name: '',
      description: '',
      base_price: 0,
      estimated_days: 1,
      is_active: true,
      required_documents: [{ value: '' }],
    })
    setDialogOpen(true)
  }

  function openEditDialog(tipo: TramiteType) {
    setDialogMode('edit')
    setEditingId(tipo.id)

    const docsForForm = Array.isArray(tipo.required_documents) && tipo.required_documents.length > 0
      ? tipo.required_documents.map((d) => ({
          value: typeof d === 'string' ? d : (d as { name: string }).name,
        }))
      : [{ value: '' }]

    reset({
      name: tipo.name,
      display_name: tipo.display_name,
      description: tipo.description ?? '',
      base_price: tipo.base_price,
      estimated_days: tipo.estimated_days,
      is_active: tipo.is_active,
      required_documents: docsForForm,
    })
    setDialogOpen(true)
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true)

    const required_documents = values.required_documents.map((d) => ({
      name: d.value,
      description: '',
    }))

    const payload = {
      name: values.name,
      display_name: values.display_name,
      description: values.description || null,
      base_price: values.base_price,
      estimated_days: values.estimated_days,
      is_active: values.is_active,
      required_documents,
    }

    try {
      if (dialogMode === 'create') {
        const { error } = await supabase.from('tramite_types').insert([payload])
        if (error) throw error
        toast.success('Tipo de trámite creado')
      } else if (editingId) {
        const { error } = await supabase
          .from('tramite_types')
          .update(payload)
          .eq('id', editingId)
        if (error) throw error
        toast.success('Tipo de trámite actualizado')
      }

      setDialogOpen(false)
      fetchTipos()
    } catch (err: unknown) {
      toast.error('Error al guardar el tipo de trámite')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleToggleActive(tipo: TramiteType) {
    setTogglingId(tipo.id)
    const { error } = await supabase
      .from('tramite_types')
      .update({ is_active: !tipo.is_active })
      .eq('id', tipo.id)

    if (error) {
      toast.error('Error al cambiar estado')
    } else {
      setTipoList((prev) =>
        prev.map((t) => (t.id === tipo.id ? { ...t, is_active: !t.is_active } : t))
      )
    }
    setTogglingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tipos de Trámite</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Cargando...' : `${tipoList.length} tipo${tipoList.length !== 1 ? 's' : ''} registrado${tipoList.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus size={16} />
          Nuevo tipo
        </Button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Nombre</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Precio base</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Días estimados</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Documentos</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500">Activo</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-500 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400">
                  <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                  Cargando...
                </TableCell>
              </TableRow>
            ) : tipoList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  No hay tipos de trámite registrados
                </TableCell>
              </TableRow>
            ) : (
              tipoList.map((tipo) => (
                <TableRow key={tipo.id} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{tipo.display_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{tipo.name}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold text-gray-800">
                    {formatPrice(tipo.base_price)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-700">
                    {tipo.estimated_days} día{tipo.estimated_days !== 1 ? 's' : ''}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {Array.isArray(tipo.required_documents) ? tipo.required_documents.length : 0} docs.
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={tipo.is_active}
                      onCheckedChange={() => handleToggleActive(tipo)}
                      disabled={togglingId === tipo.id}
                      aria-label={`Tipo ${tipo.display_name} ${tipo.is_active ? 'activo' : 'inactivo'}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => openEditDialog(tipo)}
                      aria-label={`Editar ${tipo.display_name}`}
                    >
                      <Pencil size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? 'Nuevo tipo de trámite' : 'Editar tipo de trámite'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nombre interno <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('name')}
                  placeholder="ej. compraventa"
                  className={errors.name ? 'border-red-400' : ''}
                />
                {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Nombre visible <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register('display_name')}
                  placeholder="ej. Compraventa de inmueble"
                  className={errors.display_name ? 'border-red-400' : ''}
                />
                {errors.display_name && <p className="text-xs text-red-500">{errors.display_name.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Descripción</label>
              <Textarea
                {...register('description')}
                placeholder="Descripción del tipo de trámite..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Precio base (S/.) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  {...register('base_price', { valueAsNumber: true })}
                  className={errors.base_price ? 'border-red-400' : ''}
                />
                {errors.base_price && <p className="text-xs text-red-500">{errors.base_price.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Días estimados <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  {...register('estimated_days', { valueAsNumber: true })}
                  className={errors.estimated_days ? 'border-red-400' : ''}
                />
                {errors.estimated_days && <p className="text-xs text-red-500">{errors.estimated_days.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(v) => setValue('is_active', v)}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer">
                Tipo activo
              </label>
            </div>

            {/* Required documents */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Documentos requeridos <span className="text-red-500">*</span>
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => append({ value: '' })}
                >
                  <Plus size={12} />
                  Agregar documento
                </Button>
              </div>

              {errors.required_documents && !Array.isArray(errors.required_documents) && (
                <p className="text-xs text-red-500">{errors.required_documents.message}</p>
              )}

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-5 shrink-0 text-right">{index + 1}.</span>
                    <Input
                      {...register(`required_documents.${index}.value`)}
                      placeholder="Nombre del documento requerido"
                      className={
                        errors.required_documents?.[index]?.value ? 'border-red-400' : ''
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 shrink-0 text-gray-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      aria-label="Eliminar documento"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 size={14} className="animate-spin mr-2" />}
                {dialogMode === 'create' ? 'Crear tipo' : 'Guardar cambios'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
