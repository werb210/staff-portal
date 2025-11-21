import * as React from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape" && open) {
        onOpenChange?.(false);
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40" onClick={() => onOpenChange?.(false)}>
      {children}
    </div>
  );
}

export const SheetContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-full w-full max-w-xl translate-x-0 overflow-y-auto bg-white shadow-2xl transition",
      className
    )}
    onClick={(event) => event.stopPropagation()}
    {...props}
  />
));
SheetContent.displayName = "SheetContent";
