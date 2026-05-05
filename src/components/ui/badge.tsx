import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary-600 text-white',
        secondary: 'border-transparent bg-gray-100 text-gray-800',
        normal: 'border-green-200 bg-green-50 text-green-700',
        high: 'border-red-200 bg-red-50 text-red-700',
        low: 'border-yellow-200 bg-yellow-50 text-yellow-700',
        unknown: 'border-gray-200 bg-gray-50 text-gray-600',
        outline: 'text-gray-700 border-gray-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
