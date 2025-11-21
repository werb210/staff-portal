export const PageSkeleton = () => (
  <div className="space-y-3">
    <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
  </div>
);

export const TableSkeleton = () => (
  <div className="space-y-2">
    <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
    <div className="h-48 w-full animate-pulse rounded bg-slate-100" />
  </div>
);

export const DrawerSkeleton = () => (
  <div className="space-y-4">
    <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
  </div>
);
