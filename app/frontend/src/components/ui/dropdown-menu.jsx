import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export function DropdownMenu({ children }) {
  return <div className="relative inline-block">{children}</div>;
}

export function DropdownMenuTrigger({ children, className = '' }) {
  return <div className={cn('cursor-pointer', className)}>{children}</div>;
}

export function DropdownMenuContent({ children, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative">
      {React.Children.map(children, (child, index) => {
        if (index === 0) {
          return React.cloneElement(child, { onClick: () => setOpen(!open) });
        }
        if (index === 1 && open) {
          return (
            <div
              ref={ref}
              className={cn(
                'absolute right-0 mt-2 w-56 rounded-md border border-zinc-800 bg-zinc-900 shadow-lg z-50',
                className
              )}
            >
              {child}
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

export function DropdownMenuLabel({ children, className = '' }) {
  return (
    <div className={cn('px-4 py-2 text-sm font-semibold text-zinc-400', className)}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className = '' }) {
  return <div className={cn('my-1 h-px bg-zinc-800', className)} />;
}

export function DropdownMenuItem({ children, className = '', onClick }) {
  return (
    <div
      className={cn(
        'cursor-pointer px-4 py-2 text-sm text-white hover:bg-zinc-800',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
