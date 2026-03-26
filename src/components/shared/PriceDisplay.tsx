import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/utils'

interface PriceDisplayProps {
  amount: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  strikethrough?: boolean
}

export default function PriceDisplay({ amount, size = 'md', className, strikethrough }: PriceDisplayProps) {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg font-semibold',
    lg: 'text-2xl font-bold',
    xl: 'text-3xl font-bold',
  }
  return (
    <span
      className={cn(
        'tabular-nums font-mono',
        sizeClasses[size],
        strikethrough && 'line-through text-slate-400',
        className
      )}
    >
      {formatPrice(amount)}
    </span>
  )
}

interface PriceBreakdownRowProps {
  label: string
  amount: number
  isDiscount?: boolean
  isTotal?: boolean
}

export function PriceBreakdownRow({ label, amount, isDiscount, isTotal }: PriceBreakdownRowProps) {
  return (
    <div className={cn('flex justify-between items-center py-2', isTotal && 'border-t border-slate-200 pt-3 mt-1')}>
      <span className={cn('text-sm', isTotal ? 'font-semibold text-slate-900' : 'text-slate-600')}>
        {label}
      </span>
      <span
        className={cn(
          'tabular-nums font-medium text-sm',
          isDiscount && 'text-brand-green',
          isTotal && 'text-xl font-bold text-brand-green'
        )}
      >
        {isDiscount ? '- ' : ''}{formatPrice(amount)}
      </span>
    </div>
  )
}
