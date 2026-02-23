export interface SLFDeal {
  id: string;
  external_id: string;
  product_family: string;
  status: "received" | "processing" | "completed" | "rejected";
  created_at: string;
}
