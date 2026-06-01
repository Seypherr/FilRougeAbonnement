export function StatePanel({ title, message, tone = "neutral", icon = "ph-info" }) {
  const tones = {
    neutral: "border-slate-100 bg-white text-slate-500",
    loading: "border-violet-100 bg-white text-slate-500",
    error: "border-rose-100 bg-rose-50 text-rose-700",
    empty: "border-slate-100 bg-white text-slate-500"
  };

  const iconTones = {
    neutral: "bg-slate-100 text-slate-400",
    loading: "bg-violet-50 text-[#6C51FF]",
    error: "bg-rose-100 text-rose-600",
    empty: "bg-slate-100 text-slate-400"
  };

  return (
    <div className={`flex flex-col items-center justify-center rounded-[20px] border p-6 text-center shadow-[0_4px_20px_-12px_rgba(0,0,0,0.08)] ${tones[tone] ?? tones.neutral}`}>
      <div className={`mb-3 flex size-11 items-center justify-center rounded-2xl ${iconTones[tone] ?? iconTones.neutral}`}>
        <i className={`ph ${icon} text-xl`} />
      </div>
      <p className="text-sm font-bold text-slate-700">{title}</p>
      {message && <p className="mt-1 max-w-sm text-xs font-medium leading-relaxed">{message}</p>}
    </div>
  );
}
