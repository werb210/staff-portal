import { render } from "@testing-library/react"
import { ReactElement } from "react"
import { TestProviders } from "./TestProviders"

export function renderWithProviders(ui: ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <TestProviders>{children}</TestProviders>,
  })
}
