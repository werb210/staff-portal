export const PIPELINE_TABS = [
  "Application",
  "Banking",
  "Financials",
  "Documents",
  "CreditSummary",
  "Notes",
  "Lenders"
] as const

export type PipelineTab = typeof PIPELINE_TABS[number]

export function validateTabOrder(tabs: string[]) {
  return JSON.stringify(tabs) === JSON.stringify(PIPELINE_TABS)
}
