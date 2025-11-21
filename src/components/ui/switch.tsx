import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => (
  <label className="inline-flex cursor-pointer items-center gap-2">
    <input ref={ref} type="checkbox" className="hidden" {...props} />
    <span
      className={cn(
        "relative inline-block h-5 w-9 rounded-full bg-gray-300 transition-colors",
        props.checked && "bg-emerald-500",
        className
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 m-[2px] h-4 w-4 rounded-full bg-white shadow transition-transform",
          props.checked && "translate-x-4"
        )}
      />
    </span>
  </label>
));
Switch.displayName = "Switch";
