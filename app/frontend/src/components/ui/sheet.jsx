import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export function Sheet({ children }) {
  return <div>{children}</div>;
}

export function SheetTrigger({ children, className = '' }) {
  return <div className={cn('cursor-pointer', className)}>{children}</div>;
}

export function SheetContent({ children, className = '', side = 'left' }) {
  const [open, setOpen] = useState(false);

  const sideClasses = {
    left: 'left-0 top-0 h-full',
    right: 'right-0 top-0 h-full',
    top: 'top-0 left-0 w-full',
    bottom: 'bottom-0 left-0 w-full',
  };

  return (
    <>
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) });
        }
        return null;
      })}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              'fixed z-50 w-80 bg-zinc-900 border-r border-zinc-800 shadow-xl',
              sideClasses[side],
              className
            )}
          >
            {React.Children.toArray(children).slice(1)}
          </div>
        </>
      )}
    </>
  );
}
