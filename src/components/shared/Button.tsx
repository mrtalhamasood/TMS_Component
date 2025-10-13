import type { ButtonHTMLAttributes, ReactNode } from "react";

const baseStyles = "px-4 py-2 rounded-xl transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<string, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  subtle: "bg-white border border-slate-300 text-slate-800 hover:bg-slate-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-500",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
};

export type ButtonVariant = keyof typeof variants;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
}

export default function Button({ children, className = "", variant = "primary", ...rest }: ButtonProps) {
  const resolvedVariant = variants[variant] ?? variants.primary;
  return (
    <button className={`${baseStyles} ${resolvedVariant} ${className}`.trim()} {...rest}>
      {children}
    </button>
  );
}
