import React from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className = '' }) {
  return (
    <div className={cn('rounded-lg border border-zinc-800 bg-zinc-900/50', className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={cn('flex flex-col space-y-1.5 p-6', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }) {
  return (
    <p className={cn('text-sm text-zinc-400', className)}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={cn('p-6 pt-0', className)}>
      {children}
    </div>
  );
}