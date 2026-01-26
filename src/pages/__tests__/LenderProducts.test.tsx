import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import LenderProducts from "../LenderProducts";
import * as api from "../../api/lenders";

vi.spyOn(api, "fetchClientLenderProducts").mockResolvedValue([
  {
    id: "p1",
    name: "LOC",
    product_type: "LOC",
    min_amount: 10000,
    max_amount: 500000,
    lender_id: "l1",
    lender_name: "Test Lender"
  }
]);

it("renders lender products table", async () => {
  render(<LenderProducts />);
  const matches = await screen.findAllByText("LOC");
  expect(matches.length).toBeGreaterThan(0);
});
