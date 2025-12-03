import { create } from 'zustand';
import { api } from '../api/client';

export interface LenderProduct {
  id: string;
  lenderName: string;
  productCategory: string;
  amountRange: {
    min: number;
    max: number;
  };
  creditRequirements: string | null;
  requiredDocs: string[];
  disqualifiers: Record<string, any>;
  active: boolean;
  createdAt?: string;
}

interface LenderAdminState {
  lenders: LenderProduct[];
  loading: boolean;
  editing: LenderProduct | null;

  load: () => Promise<void>;
  setEditing: (lender: LenderProduct | null) => void;
  create: (payload: Omit<LenderProduct, 'id' | 'createdAt'>) => Promise<void>;
  update: (id: string, payload: Omit<LenderProduct, 'id' | 'createdAt'>) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useLenderAdminStore = create<LenderAdminState>((set, get) => ({
  lenders: [],
  loading: false,
  editing: null,

  load: async () => {
    set({ loading: true });
    const client = api();
    const res = await client.get('/lenders');
    const data = (res.data || []) as any[];

    const normalized: LenderProduct[] = data.map((row) => ({
      id: row.id,
      lenderName: row.lenderName || row.lender_name,
      productCategory: row.productCategory || row.product_category,
      amountRange: row.amountRange || row.amount_range || { min: 0, max: 0 },
      creditRequirements: row.creditRequirements || row.credit_requirements || null,
      requiredDocs: row.requiredDocs || row.required_docs || [],
      disqualifiers: row.disqualifiers || {},
      active: row.active ?? true,
      createdAt: row.createdAt || row.created_at,
    }));

    set({ lenders: normalized, loading: false });
  },

  setEditing: (lender) => set({ editing: lender }),

  create: async (payload) => {
    const client = api();
    await client.post('/lenders', {
      lenderName: payload.lenderName,
      productCategory: payload.productCategory,
      amountRange: payload.amountRange,
      creditRequirements: payload.creditRequirements,
      requiredDocs: payload.requiredDocs,
      disqualifiers: payload.disqualifiers,
      active: payload.active,
    });
    await get().load();
  },

  update: async (id, payload) => {
    const client = api();
    await client.put(`/lenders/${id}`, {
      lenderName: payload.lenderName,
      productCategory: payload.productCategory,
      amountRange: payload.amountRange,
      creditRequirements: payload.creditRequirements,
      requiredDocs: payload.requiredDocs,
      disqualifiers: payload.disqualifiers,
      active: payload.active,
    });
    await get().load();
  },

  toggleActive: async (id) => {
    const client = api();
    await client.patch(`/lenders/${id}/active`);
    await get().load();
  },
}));
