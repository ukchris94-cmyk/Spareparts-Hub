export function Input({ className = "", ...props }) {
    return (
      <input
        className={`w-full rounded border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-400 focus:border-amber-500 focus:outline-none ${className}`}
        {...props}
      />
    );
  }