export function Label({ children, className = "", ...props }) {
    return (
      <label
        className={`text-sm font-medium text-zinc-300 ${className}`}
        {...props}
      >
        {children}
      </label>
    );
  }