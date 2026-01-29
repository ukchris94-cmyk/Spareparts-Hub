export function Button({ children, className = "", ...props }) {
    return (
      <button
        className={`px-4 py-2 rounded bg-amber-500 text-black hover:bg-amber-400 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }