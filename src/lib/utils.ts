import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistance, format, isAfter, subDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `S/. ${amount.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const sevenDaysAgo = subDays(new Date(), 7)
  if (isAfter(date, sevenDaysAgo)) {
    return formatDistance(date, new Date(), { addSuffix: true, locale: es })
  }
  return format(date, "d MMM yyyy", { locale: es })
}

export function formatDateTime(dateString: string): string {
  return format(new Date(dateString), "d MMM yyyy · HH:mm", { locale: es })
}

export function formatDateShort(dateString: string): string {
  return format(new Date(dateString), "d MMM", { locale: es })
}

export function generateInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '...'
}
