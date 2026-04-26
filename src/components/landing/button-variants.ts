import { cva } from 'class-variance-authority';

export const landingButtonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out outline-none select-none focus-visible:border-app-brand focus-visible:ring-3 focus-visible:ring-app-brand/20 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  {
    variants: {
      variant: {
        default:
          'bg-app-brand text-white shadow-sm shadow-app-brand/20 hover:bg-app-brand-dark hover:shadow-md hover:shadow-app-brand/20',
        outline:
          'border-app-border-soft bg-app-surface text-app-text-primary hover:border-app-border hover:bg-app-surface-subtle hover:text-app-text-primary aria-expanded:bg-app-surface-subtle aria-expanded:text-app-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
