import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  label: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, i) => {
        const isCompleted = step.number < currentStep
        const isCurrent = step.number === currentStep
        return (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted && 'bg-brand-green text-white',
                  isCurrent && 'bg-brand-navy text-white ring-4 ring-brand-navy/20',
                  !isCompleted && !isCurrent && 'bg-slate-100 text-slate-400'
                )}
              >
                {isCompleted ? <Check size={16} /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium mt-1.5 hidden sm:block',
                  isCurrent ? 'text-brand-navy' : isCompleted ? 'text-brand-green' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-12 sm:w-20 mx-2 mb-4 transition-colors',
                  step.number < currentStep ? 'bg-brand-green' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
