import React, { useState, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';

const DialogContext = createContext({ open: false, setOpen: () => {} });

export function Dialog({ children, open: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange : setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, className = '', asChild, onClick }) {
  const { setOpen } = useContext(DialogContext);
  
  const handleClick = (e) => {
    onClick?.(e);
    if (!e.defaultPrevented) {
      setOpen(true);
    }
  };
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
      className: cn(children.props.className, className),
    });
  }
  
  return (
    <div className={cn('inline-block', className)} onClick={handleClick}>
      {children}
    </div>
  );
}

export function DialogContent({ children, className = '' }) {
  const { open, setOpen } = useContext(DialogContext);
  
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'relative z-50 w-full max-w-lg rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-xl',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ children, className = '' }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function DialogTitle({ children, className = '' }) {
  return (
    <h2 className={cn('text-2xl font-bold', className)}>
      {children}
    </h2>
  );
}

export function DialogDescription({ children, className = '' }) {
  return (
    <p className={cn('text-sm text-zinc-400', className)}>
      {children}
    </p>
  );
}
