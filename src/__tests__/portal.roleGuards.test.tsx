// @vitest-environment jsdom
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { renderWithLenderProviders, renderWithProviders } from "@/test/testUtils";
import Sidebar from "@/components/layout/Sidebar";
import RequireRole from "@/components/auth/RequireRole";
import LenderLayout from "@/lender/layout/LenderLayout";

describe("portal role & permission guards", () => {
  it("shows admin navigation items", () => {
    renderWithProviders(
      <MemoryRouter>
        <Sidebar isOpen={false} onClose={vi.fn()} />
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

    expect(screen.getByText("Lenders")).toBeInTheDocument();
    expect(screen.getByText("Lender Products")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows staff navigation items without admin-only links", () => {
    renderWithProviders(
      <MemoryRouter>
        <Sidebar isOpen={false} onClose={vi.fn()} />
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
    expect(screen.getByText("Lender Products")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
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
        <Sidebar isOpen={false} onClose={vi.fn()} />
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

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
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

  it("matches role snapshots", () => {
    const adminRender = renderWithProviders(
      <MemoryRouter>
        <Sidebar isOpen={false} onClose={vi.fn()} />
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
        <Sidebar isOpen={false} onClose={vi.fn()} />
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
        <Sidebar isOpen={false} onClose={vi.fn()} />
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
