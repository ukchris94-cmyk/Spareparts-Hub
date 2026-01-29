import React from 'react';
import { cn } from '../../lib/utils';

export function Select({ children, value, onValueChange, className = '' }) {
  // Extract SelectContent children (SelectItems)
  const childrenArray = React.Children.toArray(children);
  const content = childrenArray.find(child => 
    React.isValidElement(child) && child.type === SelectContent
  );
  
  const selectItems = content ? React.Children.toArray(content.props.children) : childrenArray.filter(
    child => React.isValidElement(child) && child.type === SelectItem
  );

  return (
    <select
      value={value || ''}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        'w-full rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-white',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {selectItems}
    </select>
  );
}

export function SelectTrigger({ children, className = '' }) {
  // This is just a wrapper for styling, not rendered in the DOM
  return null;
}

export function SelectValue({ placeholder, value }) {
  if (value) return null;
  return <option value="">{placeholder}</option>;
}

export function SelectContent({ children }) {
  // Just a wrapper to group SelectItems
  return <>{children}</>;
}

export function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>;
}
