import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Lenders from "../Lenders";
import * as api from "../../api/lenders";

vi.spyOn(api, "fetchClientLenders").mockResolvedValue([
  { id: "1", name: "Test Lender" }
]);

it("renders lenders list", async () => {
  render(<Lenders />);
  expect(await screen.findByText("Test Lender")).toBeInTheDocument();
});
