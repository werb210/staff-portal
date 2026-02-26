import { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../auth/AuthContext";

interface Props {
  children: ReactNode;
  initialEntries?: string[];
}

export function TestAppWrapper({ children, initialEntries = ["/"] }: Props) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  );
}
