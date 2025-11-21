import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials?: string;
  src?: string;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(({ className, initials, src, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold", className)}
    {...props}
  >
    {src ? <img src={src} alt={initials} className="h-full w-full rounded-full object-cover" /> : initials}
  </div>
));
Avatar.displayName = "Avatar";
