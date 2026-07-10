import { ButtonHTMLAttributes } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary:
    "bg-brand text-white shadow-[0_12px_30px_rgba(0,106,252,0.18)] hover:bg-brand-dark",
  secondary:
    "bg-white text-foreground ring-1 ring-inset ring-border shadow-[0_10px_22px_rgba(0,0,0,0.06)] hover:bg-[rgba(232,242,255,0.8)] hover:text-brand",
  ghost: "text-foreground hover:bg-white",
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
}) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
