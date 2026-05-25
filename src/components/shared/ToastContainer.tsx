import React from "react";
import { useToastStore } from "@/store/toastStore";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="text-emerald-555" size={18} />,
    error: <AlertCircle className="text-red-555" size={18} />,
    warning: <AlertTriangle className="text-amber-555" size={18} />,
    info: <Info className="text-indigo-555" size={18} />,
  };

  const colors = {
    success: "border-emerald-200 bg-emerald-50/90 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/80 dark:text-emerald-250",
    error: "border-red-200 bg-red-50/90 text-red-900 dark:border-red-900/50 dark:bg-red-950/80 dark:text-red-250",
    warning: "border-amber-200 bg-amber-50/90 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/80 dark:text-amber-250",
    info: "border-indigo-200 bg-indigo-50/90 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/80 dark:text-indigo-255",
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-auto">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 border rounded-xl shadow-xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-right-10 duration-200 ${colors[toast.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 text-sm font-semibold leading-relaxed">
            {toast.message}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition-colors focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
