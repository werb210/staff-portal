import { ReactNode } from "react"
import { AuthProvider } from "@/context/AuthContext"

export function TestProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
