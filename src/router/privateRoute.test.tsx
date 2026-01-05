import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { actAsync } from "@/test/testUtils";
import { renderWithProviders } from "@/test/renderHelpers";

describe("Staff private route", () => {
  it("blocks lender role from staff-only routes", async () => {
    await actAsync(() => {
      renderWithProviders(
        <MemoryRouter initialEntries={["/restricted"]}>
          <Routes>
            <Route element={<PrivateRoute allowedRoles={["ADMIN", "STAFF"]} />}>
              <Route path="/restricted" element={<div>Restricted</div>} />
            </Route>
          </Routes>
        </MemoryRouter>,
        { auth: { user: { id: "2", name: "Lender User", email: "lender@example.com", role: "LENDER" } } }
      );
    });

    expect(screen.getByText(/Access Restricted/)).toBeInTheDocument();
  });
});
