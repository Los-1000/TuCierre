import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  full_name: z.string().min(3, 'Nombre muy corto').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono inválido').max(15),
  dni: z.string().length(8, 'DNI debe tener 8 dígitos').regex(/^\d+$/, 'Solo números'),
  company_name: z.string().optional(),
  referral_code: z.string().optional(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm_password: z.string(),
}).refine(data => data.password === data.confirm_password, {
  message: 'Las contraseñas no coinciden',
  path: ['confirm_password'],
})

export const partySchema = z.object({
  name: z.string().min(3, 'Nombre requerido'),
  dni: z.string().length(8, 'DNI debe tener 8 dígitos').regex(/^\d+$/, 'Solo números'),
  role: z.enum(['comprador', 'vendedor', 'otro']),
  email: z.string().email('Email inválido'),
  phone: z.string().min(9, 'Teléfono inválido'),
})

export const cotizadorStep2Schema = z.object({
  property_address: z.string().min(5, 'Dirección requerida'),
  property_district: z.string().min(1, 'Distrito requerido'),
  property_value: z.number().min(1000, 'Valor mínimo S/. 1,000').optional(),
  parties: z.array(partySchema).min(1, 'Al menos una parte requerida'),
})

export const priceMatchSchema = z.object({
  competitor_name: z.string().min(3, 'Nombre de notaría requerido'),
  competitor_price: z.number().min(1, 'Precio requerido'),
  evidence_url: z.string().url('URL inválida').optional().or(z.literal('')),
})

export const priceMatchFormSchema = priceMatchSchema.pick({
  competitor_name: true,
  competitor_price: true,
}).extend({
  tramite_type_id: z.string().uuid('Selecciona un tipo de trámite'),
})

export const messageSchema = z.object({
  content: z.string().min(1, 'Mensaje requerido').max(2000),
})

export const tramiteTypeSchema = z.object({
  name: z.string().min(3),
  display_name: z.string().min(3),
  description: z.string().optional(),
  base_price: z.number().min(0),
  estimated_days: z.number().int().min(1),
  is_active: z.boolean(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type CotizadorStep2Input = z.infer<typeof cotizadorStep2Schema>
export type PriceMatchInput = z.infer<typeof priceMatchSchema>
export type PriceMatchFormInput = z.infer<typeof priceMatchFormSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type TramiteTypeInput = z.infer<typeof tramiteTypeSchema>

export const cashoutFormSchema = z.object({
  amount: z.number({ required_error: 'Ingresa el monto' }).positive('El monto debe ser mayor a 0'),
  method: z.enum(['bank_transfer', 'yape', 'plin', 'otros'], {
    required_error: 'Selecciona un método de pago',
  }),
  banco: z.string().optional(),
  cci: z.string().optional(),
  tipo_cuenta: z.enum(['ahorros', 'corriente']).optional(),
  titular: z.string().min(1, 'Ingresa el nombre del titular'),
  telefono: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.method === 'bank_transfer') {
    if (!data.banco || data.banco.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Ingresa el banco', path: ['banco'] })
    }
    if (!data.cci || data.cci.length !== 20 || !/^\d+$/.test(data.cci)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El CCI debe tener exactamente 20 dígitos', path: ['cci'] })
    }
    if (!data.tipo_cuenta) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Selecciona el tipo de cuenta', path: ['tipo_cuenta'] })
    }
  } else {
    if (!data.telefono || data.telefono.length !== 9) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'El teléfono debe tener 9 dígitos', path: ['telefono'] })
    }
  }
})

export type CashoutFormInput = z.infer<typeof cashoutFormSchema>
