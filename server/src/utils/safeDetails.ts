export const safeDetails = (val: any): Record<string, unknown> =>
  val && typeof val === "object" ? val : {};
