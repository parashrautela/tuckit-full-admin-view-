import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  width?: 'md' | 'lg' | 'xl';
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = 'md',
}) => {
  const widthClass = {
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  }[width];

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent className={cn("p-0 flex flex-col gap-0 border-l border-zinc-200 shadow-xl", widthClass)}>
        <SheetHeader className="px-6 py-4 border-b border-zinc-100 bg-white">
          <SheetTitle className="text-base font-bold tracking-tight text-zinc-900">{title}</SheetTitle>
          {subtitle && (
            <SheetDescription className="text-xs text-zinc-500 mt-0.5">
              {subtitle}
            </SheetDescription>
          )}
        </SheetHeader>
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
};
