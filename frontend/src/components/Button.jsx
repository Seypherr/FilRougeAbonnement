export function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-ink text-white hover:bg-gray-700",
    secondary: "border border-line bg-white text-ink hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
