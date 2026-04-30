import { X } from "lucide-react";
import { Button } from "./Button.jsx";

export function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-6">
      <section className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-2xl sm:rounded-3xl">
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-950">{title}</h2>
            {subtitle && <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p>}
          </div>
          <Button type="button" variant="secondary" className="size-10 rounded-full p-0" onClick={onClose}>
            <X size={18} />
          </Button>
        </header>
        {children}
      </section>
    </div>
  );
}
