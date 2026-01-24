// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithLenderProviders, renderWithProviders } from "@/test/testUtils";
import Sidebar from "@/components/layout/Sidebar";
import RequireRole from "@/components/auth/RequireRole";
import AdminUsers from "@/pages/AdminUsers";
import LenderLayout from "@/lender/layout/LenderLayout";
import { getUsers } from "@/api/users";

vi.mock("@/api/users", () => ({
  getUsers: vi.fn()
}));

const renderSettingsUsersRoute = (role: "Admin" | "Staff" | "Lender" | "Referrer") =>
  renderWithProviders(
    <MemoryRouter initialEntries={["/settings/users"]}>
      <Routes>
        <Route
          path="/settings/users"
          element={
            <RequireRole roles={["Admin"]}>
              <div>Settings Users</div>
            </RequireRole>
          }
        />
      </Routes>
    </MemoryRouter>,
    {
      auth: {
        user: { id: "u-1", email: "user@example.com", role },
        authState: "authenticated",
        authStatus: "authenticated",
        rolesStatus: "resolved",
        authenticated: true,
        authReady: true
      }
    }
  );

describe("portal role & permission guards", () => {
  it("allows admins to access /settings/users", () => {
    renderSettingsUsersRoute("Admin");
    expect(screen.getByText("Settings Users")).toBeInTheDocument();
  });

  it("blocks staff from /settings/users", () => {
    renderSettingsUsersRoute("Staff");
    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });

  it("blocks lenders from /settings/users", () => {
    renderSettingsUsersRoute("Lender");
    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });

  it("blocks referrers from /settings/users", () => {
    renderSettingsUsersRoute("Referrer");
    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });

  it("shows admin navigation items", () => {
    renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "admin", email: "admin@example.com", role: "Admin" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Lenders")).toBeInTheDocument();
    expect(screen.getByText("Lender Products")).toBeInTheDocument();
  });

  it("shows staff navigation items without admin-only links", () => {
    renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "staff", email: "staff@example.com", role: "Staff" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.getByText("Lenders")).toBeInTheDocument();
    expect(screen.getByText("Applications")).toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Lender Products")).not.toBeInTheDocument();
  });

  it("shows only lender product navigation for lenders", () => {
    renderWithLenderProviders(
      <MemoryRouter initialEntries={["/lender/products"]}>
        <Routes>
          <Route path="/lender" element={<LenderLayout />}>
            <Route path="products" element={<div>Products</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("My Products")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Company Info")).not.toBeInTheDocument();
  });

  it("does not render admin or lender menus for referrers", () => {
    renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "ref-1", email: "ref@example.com", role: "Referrer" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.queryByText("Users")).not.toBeInTheDocument();
    expect(screen.queryByText("Lenders")).not.toBeInTheDocument();
    expect(screen.queryByText("Lender Products")).not.toBeInTheDocument();
  });

  it("guards component-level access for admin-only widgets", () => {
    const UsersTable = () => <div>Users Table</div>;
    const CreateUserModal = () => <div>Create User Modal</div>;
    const EditUserModal = () => <div>Edit User Modal</div>;

    renderWithProviders(
      <>
        <RequireRole roles={["Admin"]}>
          <UsersTable />
        </RequireRole>
        <RequireRole roles={["Admin"]}>
          <CreateUserModal />
        </RequireRole>
        <RequireRole roles={["Admin"]}>
          <EditUserModal />
        </RequireRole>
      </>,
      {
        auth: {
          user: { id: "admin", email: "admin@example.com", role: "Admin" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.getByText("Users Table")).toBeInTheDocument();
    expect(screen.getByText("Create User Modal")).toBeInTheDocument();
    expect(screen.getByText("Edit User Modal")).toBeInTheDocument();
  });

  it("blocks component-level access for non-admin widgets", () => {
    const UsersTable = () => <div>Users Table</div>;

    renderWithProviders(
      <RequireRole roles={["Admin"]}>
        <UsersTable />
      </RequireRole>,
      {
        auth: {
          user: { id: "staff", email: "staff@example.com", role: "Staff" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(screen.getByText("Access restricted")).toBeInTheDocument();
  });

  it("handles forbidden API responses without retries", async () => {
    const getUsersMock = vi.mocked(getUsers);
    getUsersMock.mockRejectedValueOnce({ response: { status: 403 } });
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

    renderWithProviders(<AdminUsers />, {
      auth: {
        user: { id: "admin", email: "admin@example.com", role: "Admin" },
        authState: "authenticated",
        authStatus: "authenticated",
        rolesStatus: "resolved",
        authenticated: true,
        authReady: true
      }
    });

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/permission/i));
    expect(getUsersMock).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledTimes(1);

    consoleSpy.mockRestore();
  });

  it("matches role snapshots", () => {
    const adminRender = renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "admin", email: "admin@example.com", role: "Admin" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    const staffRender = renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "staff", email: "staff@example.com", role: "Staff" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    const lenderRender = renderWithLenderProviders(
      <MemoryRouter initialEntries={["/lender/products"]}>
        <Routes>
          <Route path="/lender" element={<LenderLayout />}>
            <Route path="products" element={<div>Products</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const referrerRender = renderWithProviders(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
      {
        auth: {
          user: { id: "ref", email: "ref@example.com", role: "Referrer" },
          authState: "authenticated",
          authStatus: "authenticated",
          rolesStatus: "resolved",
          authenticated: true,
          authReady: true
        }
      }
    );

    expect(adminRender.container).toMatchSnapshot();
    expect(staffRender.container).toMatchSnapshot();
    expect(lenderRender.container).toMatchSnapshot();
    expect(referrerRender.container).toMatchSnapshot();
  });
});
