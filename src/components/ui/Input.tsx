import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, type = "text", className = "", ...props }, ref) => {
    return (
      <div className="w-full mb-4">
        {label && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border rounded-lg shadow-sm outline-none transition-all duration-150
            ${
              error
                ? "border-red-550 focus:border-red-550 focus:ring-1 focus:ring-red-550"
                : "border-slate-300 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            }
            placeholder:text-slate-400 dark:text-slate-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
