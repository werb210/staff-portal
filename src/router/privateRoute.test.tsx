import { screen } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { renderWithProviders } from "@/test/testUtils";

describe("Staff private route", () => {
  it("blocks lender role from staff-only routes", () => {
    const router = createMemoryRouter(
      [
        {
          path: "/restricted",
          element: (
            <PrivateRoute>
              <div>Restricted</div>
            </PrivateRoute>
          )
        },
        {
          path: "/login",
          element: <div>Login</div>
        }
      ],
      {
        initialEntries: ["/restricted"],
        future: {
          v7_relativeSplatPath: true
        }
      }
    );
    renderWithProviders(
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
      />,
      { auth: { authStatus: "unauthenticated", rolesStatus: "idle", authenticated: false } }
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
