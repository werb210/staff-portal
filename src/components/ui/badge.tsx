import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-900 text-white",
  success: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  warning: "bg-amber-100 text-amber-800 border border-amber-200",
  destructive: "bg-red-100 text-red-700 border border-red-200",
  outline: "border border-slate-300 text-slate-800",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
