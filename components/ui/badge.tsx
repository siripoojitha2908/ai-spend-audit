import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(({ className, ...props }, ref) => (
  <span ref={ref} className={cn('inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-200', className)} {...props} />
));
Badge.displayName = 'Badge';
