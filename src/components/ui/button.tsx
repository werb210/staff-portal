import * as React from "react";
import { cn } from "../../lib/utils";

export function Button({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium",
        className
      )}
      {...props}
    />
  );
}
