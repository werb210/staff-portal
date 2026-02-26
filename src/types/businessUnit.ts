export type BusinessUnit = "BF" | "BI" | "SLF";
export type Silo = Lowercase<BusinessUnit>;

export const DEFAULT_BUSINESS_UNIT: BusinessUnit = "BF";

export function normalizeBusinessUnit(value: BusinessUnit | Silo): BusinessUnit {
  return value.toUpperCase() as BusinessUnit;
}
