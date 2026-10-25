"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { useFormStatus } from "react-dom";

const buttonStyles = {
  primary: "bg-blue-700 text-onaccent hover:brightness-90",
  secondary: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
  danger: "bg-red-600 text-onaccent hover:brightness-90",
};

/** A thin moving bar across the top of the screen while a form is saving. */
export function SavingBar() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <div role="status" aria-label="Saving" className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-blue-100">
      <div className="saving-bar h-full w-1/3 bg-blue-600" />
    </div>
  );
}

/**
 * While its form is saving, every button in it is disabled, the one that was
 * pressed says "Saving…", and the saving bar shows at the top of the screen.
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  onClick,
  disabled,
  pendingLabel,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!pending) setPressed(false);
  }, [pending]);
  const submits = props.type !== "button" && props.type !== "reset";

  return (
    <>
      <button
        {...props}
        disabled={disabled || (pending && submits)}
        aria-busy={pending && pressed}
        onClick={(e) => {
          if (submits) setPressed(true);
          onClick?.(e);
        }}
        className={`rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50 ${buttonStyles[variant]} ${className}`}
      >
        {pending && pressed ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" />
            {pendingLabel ?? (variant === "danger" ? "Working…" : "Saving…")}
          </span>
        ) : (
          children
        )}
      </button>
      {submits && <SavingBar />}
    </>
  );
}
