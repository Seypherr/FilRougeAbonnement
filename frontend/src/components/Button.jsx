export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-violet-600 text-white shadow-lg shadow-violet-200 hover:bg-violet-700",
    secondary: "border border-line bg-white text-ink hover:bg-gray-50",
    ghost: "bg-transparent text-slate-600 hover:bg-violet-50 hover:text-violet-700",
    danger: "bg-rose-600 text-white shadow-lg shadow-rose-100 hover:bg-rose-700"
  };

  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
