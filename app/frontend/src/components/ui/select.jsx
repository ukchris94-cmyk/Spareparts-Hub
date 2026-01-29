export function Select({ children, value, onValueChange }) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white"
      >
        {children}
      </select>
    );
  }
  
  export function SelectTrigger({ children, className = "" }) {
    return <div className={className}>{children}</div>;
  }
  
  export function SelectValue({ placeholder }) {
    return <option value="">{placeholder}</option>;
  }
  
  export function SelectContent({ children }) {
    return <>{children}</>;
  }
  
  export function SelectItem({ value, children }) {
    return <option value={value}>{children}</option>;
  }