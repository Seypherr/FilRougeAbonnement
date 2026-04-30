export function FormField({ label, children }) {
  return (
    <label className="grid gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-500">
      <span>{label}</span>
      {children}
    </label>
  );
}
