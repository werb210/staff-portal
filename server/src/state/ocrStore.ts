import { create } from 'zustand';
import { api } from '../api/client';

export interface OcrFieldEntry {
  documentId: string;
  field: string;
  value: string;
}

export interface GroupedFields {
  [field: string]: {
    values: { documentId: string; value: string }[];
    conflict: boolean;
  };
}

export type GroupKey =
  | "BALANCE_SHEET"
  | "INCOME"
  | "CASHFLOW"
  | "TAXES"
  | "CONTRACTS"
  | "INVOICES";

const GROUPS: Record<GroupKey, string[]> = {
  BALANCE_SHEET: ["Balance Sheet", "BalanceSheet", "BS"],
  INCOME: ["Income Statement", "Income", "IS"],
  CASHFLOW: ["Cash Flow", "CashFlow"],
  TAXES: ["Taxes", "TaxReturn"],
  CONTRACTS: ["Contract", "Agreement"],
  INVOICES: ["Invoice", "Receivable"],
};

export type DocumentGroupMap = Record<GroupKey | "OTHER", GroupedFields>;

export interface OcrState {
  grouped: DocumentGroupMap;
  load: (applicationId: string) => Promise<void>;
}

export const useOcrStore = create<OcrState>((set) => ({
  grouped: {
    BALANCE_SHEET: {},
    INCOME: {},
    CASHFLOW: {},
    TAXES: {},
    CONTRACTS: {},
    INVOICES: {},
    OTHER: {},
  },

  load: async (applicationId: string) => {
    const client = api();
    const res = await client.get(`/ocr/application/${applicationId}`);
    const raw = res.data;

    const byGroup: DocumentGroupMap = {
      BALANCE_SHEET: {},
      INCOME: {},
      CASHFLOW: {},
      TAXES: {},
      CONTRACTS: {},
      INVOICES: {},
      OTHER: {},
    };

    for (const doc of raw) {
      const docName = doc.documentCategory || doc.documentType || "Other";
      let group: GroupKey | "OTHER" = "OTHER";

      for (const key of Object.keys(GROUPS) as GroupKey[]) {
        if (GROUPS[key].some((label: string) => docName.includes(label))) {
          group = key;
          break;
        }
      }

      // Iterate all extracted fields
      for (const field of Object.keys(doc.fields || {})) {
        const value = doc.fields[field];

        if (!byGroup[group][field]) {
          byGroup[group][field] = {
            values: [],
            conflict: false,
          };
        }

        byGroup[group][field].values.push({
          documentId: doc.documentId,
          value,
        });
      }
    }

    // conflict detection
    for (const group of Object.keys(byGroup) as (GroupKey | "OTHER")[]) {
      for (const field of Object.keys(byGroup[group])) {
        const values = byGroup[group][field].values.map((v) => v.value);
        const unique = [...new Set(values)];
        if (unique.length > 1) {
          byGroup[group][field].conflict = true;
        }
      }
    }

    set({ grouped: byGroup });
  },
}));
