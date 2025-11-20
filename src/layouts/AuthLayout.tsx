import { PropsWithChildren } from "react";

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Staff Portal</h1>
          <p className="text-sm text-slate-600">Sign in to continue</p>
        </div>
        {children}
      </div>
    </div>
  );
}
