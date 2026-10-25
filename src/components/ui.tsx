import type { ComponentProps, ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {children}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  ...props
}: ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <input
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

export function TextArea({ label, ...props }: ComponentProps<"textarea"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
      />
    </label>
  );
}

export function Select({
  label,
  children,
  ...props
}: ComponentProps<"select"> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <select
        {...props}
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base focus:border-blue-600 focus:outline-none"
      >
        {children}
      </select>
    </label>
  );
}

const buttonStyles = {
  primary: "bg-blue-700 text-onaccent hover:brightness-90",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  danger: "bg-red-600 text-onaccent hover:brightness-90",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles }) {
  return (
    <button
      {...props}
      className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
    />
  );
}

export function ErrorMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>;
}

export function SuccessMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{message}</p>;
}
