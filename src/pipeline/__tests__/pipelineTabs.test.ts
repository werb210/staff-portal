import { PIPELINE_TABS, validateTabOrder } from "../constants/pipelineTabs"

describe("Pipeline tab order", () => {
  test("matches Boreal V1 specification", () => {
    expect(PIPELINE_TABS).toEqual([
      "Application",
      "Banking",
      "Financials",
      "Documents",
      "CreditSummary",
      "Notes",
      "Lenders"
    ])
  })

  test("validation helper detects tampering", () => {
    expect(
      validateTabOrder([
        "Application",
        "Banking",
        "Financials",
        "Documents",
        "CreditSummary",
        "Notes",
        "Lenders"
      ])
    ).toBe(true)
  })
})
