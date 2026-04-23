import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  variant?: 'badge' | 'light'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const imgSizes = {
  sm: { w: 88,  h: 38 },
  md: { w: 116, h: 50 },
  lg: { w: 148, h: 64 },
}

const textSizes = {
  sm: 'text-[12px]',
  md: 'text-[16px]',
  lg: 'text-[21px]',
}

export function Logo({ href = '/dashboard', variant = 'badge', size = 'md', className }: LogoProps) {
  const mark =
    variant === 'badge' ? (
      <Image
        src="/logo.png"
        alt="tucierre.com"
        width={imgSizes[size].w}
        height={imgSizes[size].h}
        className={cn('object-cover select-none', className)}
        priority
      />
    ) : (
      <div
        className={cn(
          'inline-flex flex-col font-black tracking-tight select-none font-sans text-white leading-[1.1]',
          textSizes[size],
          className
        )}
      >
        <span>tucierre</span>
        <span>●com</span>
      </div>
    )

  return href ? <Link href={href}>{mark}</Link> : mark
}
