import React from 'react';
import { cn } from '../../lib/utils';

export function Table({ children, className = '' }) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn('w-full caption-bottom text-sm', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <thead className={cn('[&_tr]:border-b', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = '' }) {
  return (
    <tbody className={cn('[&_tr:last-child]:border-0', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={cn('border-b transition-colors hover:bg-zinc-800/50 data-[state=selected]:bg-zinc-800', className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className = '' }) {
  return (
    <th className={cn('h-12 px-4 text-left align-middle font-medium text-zinc-400 [&:has([role=checkbox])]:pr-0', className)}>
      {children}
    </th>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)}>
      {children}
    </td>
  );
}
