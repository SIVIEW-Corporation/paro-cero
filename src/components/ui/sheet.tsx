'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Sheet({ open, onOpenChange, children }: SheetProps) {
  return <>{children}</>;
}

interface SheetContentProps extends React.ComponentProps<'div'> {
  side?: 'top' | 'right' | 'bottom' | 'left';
  showCloseButton?: boolean;
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isMounted, setIsMounted] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);

  // Get onOpenChange from props or context
  const open = props.open as boolean | undefined;
  const onOpenChange = props.onOpenChange as
    | ((open: boolean) => void)
    | undefined;

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  React.useEffect(() => {
    if (open) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleClose = React.useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, handleClose]);

  const handleBackdropClick = () => {
    handleClose();
  };

  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const sideClasses = {
    right:
      'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm translate-x-full data-[state=open]:translate-x-0',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm -translate-x-full data-[state=open]:translate-x-0',
    top: 'inset-x-0 top-0 h-auto border-b -translate-y-full data-[state=open]:translate-y-0',
    bottom:
      'inset-x-0 bottom-0 h-auto border-t translate-y-full data-[state=open]:translate-y-0',
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 z-50'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-200 data-[state=closed]:opacity-0'
        data-state={open ? 'open' : 'closed'}
        onClick={handleBackdropClick}
        aria-hidden='true'
      />
      {/* Content */}
      <div
        data-slot='sheet-content'
        data-side={side}
        data-state={open ? 'open' : 'closed'}
        className={cn(
          'bg-shGray-800 fixed z-50 flex flex-col gap-4 text-sm shadow-lg transition-transform duration-200 ease-in-out',
          sideClasses[side],
          className,
        )}
        onClick={handleContentClick}
        role='dialog'
        aria-modal='true'
        {...props}
      >
        {children}
        {showCloseButton && (
          <Button
            variant='ghost'
            size='icon-sm'
            className='absolute top-3 right-3'
            onClick={handleClose}
          >
            <XIcon />
            <span className='sr-only'>Close</span>
          </Button>
        )}
      </div>
    </div>,
    document.body,
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-0.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: React.ComponentProps<'h2'>) {
  return (
    <h2
      data-slot='sheet-title'
      className={cn('text-base font-medium text-white/90', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot='sheet-description'
      className={cn('text-sm text-white/50', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
