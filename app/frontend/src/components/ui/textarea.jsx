import React from 'react';
import { cn } from '../../lib/utils';

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white',
        'placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
