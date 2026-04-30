export function MetricCard({ title, value, icon: Icon, compact = false, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wide text-slate-400">{title}</p>
          <p className={`${compact ? "text-2xl" : "text-4xl"} mt-2 font-black tracking-normal text-slate-950`}>{value}</p>
        </div>
        {Icon && (
          <div className="grid size-12 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Icon size={22} />
          </div>
        )}
      </div>
    </section>
  );
}
