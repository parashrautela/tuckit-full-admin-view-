import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  const maxWidthClass = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '4xl': 'sm:max-w-4xl',
  }[maxWidth];

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className={cn(maxWidthClass, "p-0 overflow-hidden gap-0 border-zinc-200 shadow-lg")}>
        <DialogHeader className="px-6 py-4 border-b border-zinc-100 bg-white">
          <DialogTitle className="text-base font-bold tracking-tight text-zinc-900">{title}</DialogTitle>
          {subtitle && (
            <DialogDescription className="text-xs text-zinc-500 mt-0.5">
              {subtitle}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar bg-white">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};
