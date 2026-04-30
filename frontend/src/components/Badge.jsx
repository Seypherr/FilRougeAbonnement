const styles = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  INACTIVE: "bg-amber-50 text-amber-700",
  ARCHIVED: "bg-slate-100 text-slate-500",
  ADMIN: "bg-violet-100 text-violet-700",
  USER: "bg-blue-100 text-blue-700"
};

export function Badge({ children, tone = "ACTIVE", className = "" }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-lg px-3 text-xs font-extrabold uppercase tracking-wide ${styles[tone] ?? styles.ACTIVE} ${className}`}>
      {children}
    </span>
  );
}
