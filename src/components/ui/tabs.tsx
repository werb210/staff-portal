import * as React from "react";
import { cn } from "../../lib/utils";

interface TabsContextProps {
  value: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextProps>({ value: "" });

export function Tabs({ value, onValueChange, children }: TabsContextProps & { children: React.ReactNode }) {
  return <TabsContext.Provider value={{ value, onValueChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2 border-b px-6", className)} {...props} />;
}

export function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  const active = ctx.value === value;
  return (
    <button
      className={cn(
        "relative px-3 py-2 text-sm font-medium text-slate-700 transition",
        active ? "text-slate-900" : "hover:text-slate-900"
      )}
      onClick={() => ctx.onValueChange?.(value)}
    >
      {children}
      {active && <span className="absolute inset-x-0 -bottom-[1px] h-0.5 bg-slate-900" />}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = React.useContext(TabsContext);
  if (ctx.value !== value) return null;
  return <div className="px-6 py-4">{children}</div>;
}
