export function Toast({ toast }) {
  if (!toast) {
    return null;
  }

  const color = toast.type === "error" ? "bg-rose-600" : "bg-emerald-600";

  return (
    <div className={`fixed bottom-24 left-4 right-4 z-50 rounded-2xl px-4 py-3 text-sm font-extrabold text-white shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:w-96 ${color}`}>
      {toast.message}
    </div>
  );
}
