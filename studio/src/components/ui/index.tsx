"use client";
import React, { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
const variants: Record<BtnVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-soft shadow-glow disabled:bg-accent/40",
  secondary: "bg-ink-750 text-ink-100 hover:bg-ink-700 border border-white/[0.06]",
  ghost: "text-ink-200 hover:bg-white/[0.06] hover:text-white",
  danger: "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/20",
  outline: "border border-white/10 text-ink-100 hover:border-accent/50 hover:bg-accent/5",
};

export const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "xs" | "sm" | "md" | "lg"; loading?: boolean; icon?: React.ReactNode }>(
  ({ variant = "secondary", size = "md", loading, icon, className, children, disabled, ...rest }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98] select-none whitespace-nowrap",
        size === "xs" && "h-7 px-2 text-xs rounded-md",
        size === "sm" && "h-8 px-3 text-xs",
        size === "md" && "h-9 px-4 text-sm",
        size === "lg" && "h-11 px-6 text-sm",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  ),
);
Button.displayName = "Button";

export function IconButton({ active, className, title, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      title={title}
      aria-label={title}
      className={cn("inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-300 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-40", active && "bg-accent/15 text-accent-soft", className)}
      {...rest}
    />
  );
}

export function Badge({ children, tone = "default", className }: { children: React.ReactNode; tone?: "default" | "accent" | "success" | "warning" | "danger" | "info"; className?: string }) {
  const tones = {
    default: "bg-white/[0.06] text-ink-200",
    accent: "bg-accent/15 text-accent-soft",
    success: "bg-emerald-400/10 text-emerald-300",
    warning: "bg-amber-400/10 text-amber-300",
    danger: "bg-rose-400/10 text-rose-300",
    info: "bg-cyan-400/10 text-cyan-300",
  };
  return <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

export function Card({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("panel p-5", className)} {...rest}>
      {children}
    </div>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-accent to-glow-cyan transition-[width] duration-500" style={{ width: `${Math.max(2, Math.min(100, value * 100))}%` }} />
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin text-ink-300", className)} />;
}

export function Empty({ icon, title, children, action }: { icon?: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 px-6 py-14 text-center">
      {icon ? <div className="mb-4 rounded-2xl bg-white/[0.04] p-3 text-ink-300">{icon}</div> : null}
      <div className="text-sm font-semibold text-ink-100">{title}</div>
      {children ? <div className="mt-1 max-w-md text-sm text-ink-300">{children}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide, footer }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean; footer?: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={onClose}>
          <motion.div
            role="dialog"
            aria-label={title}
            className={cn("panel flex max-h-[90vh] w-full flex-col overflow-hidden bg-ink-900", wide ? "max-w-3xl" : "max-w-lg")}
            initial={{ y: 16, scale: 0.98 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 8, scale: 0.98 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <div className="text-sm font-semibold">{title}</div>
              <IconButton title="Close" onClick={onClose}>
                <X className="h-4 w-4" />
              </IconButton>
            </div>
            <div className="overflow-y-auto p-5">{children}</div>
            {footer ? <div className="flex justify-end gap-2 border-t border-white/[0.06] px-5 py-3">{footer}</div> : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: React.ReactNode; children: React.ReactNode; className?: string }) {
  // <label> only wraps a single native control; groups (segmented buttons, pickers) get role="group"
  // so the label text doesn't become the accessible name of the first button inside.
  const native = React.isValidElement(children) && typeof children.type === "string" && ["input", "select", "textarea"].includes(children.type);
  const id = React.useId();
  if (native)
    return (
      <label className={cn("block", className)}>
        <span className="label mb-1.5 block">{label}</span>
        {children}
        {hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
      </label>
    );
  return (
    <div role="group" aria-labelledby={id} className={cn("block", className)}>
      <span id={id} className="label mb-1.5 block">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-ink-400">{hint}</span> : null}
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, size = "md" }: { value: T; options: { value: T; label: React.ReactNode }[]; onChange: (v: T) => void; size?: "sm" | "md" }) {
  return (
    <div className="inline-flex rounded-lg bg-ink-850 p-0.5 border border-white/[0.06]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn("rounded-md font-medium transition", size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-xs", value === o.value ? "bg-ink-700 text-white shadow" : "text-ink-300 hover:text-white")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? <div className="label mb-2 text-accent-soft">{eyebrow}</div> : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-ink-300">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function Notice({ tone = "info", title, children, action }: { tone?: "info" | "warning" | "danger" | "success"; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  const t = { info: "border-cyan-400/20 bg-cyan-400/[0.05]", warning: "border-amber-400/25 bg-amber-400/[0.06]", danger: "border-rose-400/25 bg-rose-400/[0.06]", success: "border-emerald-400/25 bg-emerald-400/[0.06]" }[tone];
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3", t)}>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        {children ? <div className="mt-0.5 text-xs leading-relaxed text-ink-300">{children}</div> : null}
      </div>
      {action}
    </div>
  );
}
