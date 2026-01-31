import type { ProductDocumentRequirement, LenderProduct } from "@/types/lenderManagement.models";
import {
  DOCUMENT_TYPES,
  DOCUMENT_TYPE_LABELS,
  LENDER_PRODUCT_CATEGORY_LABELS,
  type LenderProductCategory,
  type RateType
} from "@/types/lenderManagement.types";

type DocumentOption = {
  value: string;
  label: string;
  locked?: boolean;
};

export const PRODUCT_DOCUMENT_OPTIONS: DocumentOption[] = [
  { value: "six_month_bank_statements", label: "6 months bank statements", locked: true },
  ...DOCUMENT_TYPES.map((docType) => ({
    value: docType,
    label: DOCUMENT_TYPE_LABELS[docType]
  }))
];

const normalizeDocKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export const getDefaultRequiredDocuments = () =>
  PRODUCT_DOCUMENT_OPTIONS.filter((option) => option.locked).map((option) => option.value);

export const mapRequiredDocumentsToValues = (docs: ProductDocumentRequirement[] = []) => {
  if (!docs.length) return getDefaultRequiredDocuments();
  const optionMap = new Map(PRODUCT_DOCUMENT_OPTIONS.map((option) => [normalizeDocKey(option.label), option.value]));
  const selected = new Set(getDefaultRequiredDocuments());
  docs.forEach((doc) => {
    const label = doc.category?.trim() || "";
    const mapped = optionMap.get(normalizeDocKey(label));
    selected.add(mapped ?? label);
  });
  return Array.from(selected);
};

export const buildRequiredDocumentsPayload = (values: string[]): ProductDocumentRequirement[] => {
  const selections = new Set([...getDefaultRequiredDocuments(), ...values]);
  return Array.from(selections).map((value) => {
    const option = PRODUCT_DOCUMENT_OPTIONS.find((item) => item.value === value);
    return {
      category: option?.label ?? value,
      required: true,
      description: null
    };
  });
};

export const deriveProductName = (category: LenderProductCategory) => LENDER_PRODUCT_CATEGORY_LABELS[category];

export const deriveCurrency = (country: string, fallback?: string | null) => {
  const normalized = country.trim().toUpperCase();
  if (normalized === "US") return "USD";
  if (normalized === "CA") return "CAD";
  if (normalized === "BOTH") return "CAD/USD";
  return fallback ?? "USD";
};

export const resolveRateType = (rateType?: RateType) =>
  rateType === "variable" || rateType === "fixed" ? rateType : "fixed";

export const getRateDefaults = (product?: LenderProduct | null) => {
  const resolvedRateType = resolveRateType(product?.rateType);
  const minRate = typeof product?.interestRateMin === "number" ? product.interestRateMin : null;
  const maxRate = typeof product?.interestRateMax === "number" ? product.interestRateMax : null;
  if (resolvedRateType === "variable") {
    const baseRate = minRate ?? 0;
    const spread = maxRate !== null && minRate !== null ? maxRate - minRate : 0;
    return {
      rateType: resolvedRateType,
      fixedRate: "",
      primeRate: baseRate ? String(baseRate) : "",
      rateSpread: spread ? String(spread) : ""
    };
  }
  const fixed = minRate ?? maxRate ?? 0;
  return {
    rateType: resolvedRateType,
    fixedRate: fixed ? String(fixed) : "",
    primeRate: "",
    rateSpread: ""
  };
};
