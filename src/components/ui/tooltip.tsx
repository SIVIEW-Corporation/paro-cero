'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
}

function Tooltip({ children }: TooltipProps) {
  return <>{children}</>;
}

interface TooltipTriggerProps {
  children: React.ReactElement;
  tooltip: string;
  className?: string;
}

function TooltipTrigger({ children, tooltip, className }: TooltipTriggerProps) {
  return (
    <div className={cn('group relative inline-block', className)}>
      {children}
      <span className='invisible absolute top-1/2 left-full z-50 -translate-y-1/2 rounded-md bg-black/80 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover:visible group-hover:opacity-100'>
        {tooltip}
        {/* Arrow */}
        <span className='absolute top-1/2 right-full -translate-y-1/2 border-4 border-transparent border-r-black/80' />
      </span>
    </div>
  );
}

interface TooltipContentProps extends React.ComponentProps<'div'> {
  children: React.ReactNode;
}

function TooltipContent({
  className,
  children,
  ...props
}: TooltipContentProps) {
  return (
    <div
      data-slot='tooltip-content'
      className={cn(
        'z-50 inline-flex w-fit max-w-xs items-center gap-1.5 rounded-md bg-black/80 px-3 py-1.5 text-xs text-white',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent };
