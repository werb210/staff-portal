import { lenderApiClient } from "@/api/http";

export const fetchDocumentCategories = () => lenderApiClient.get<string[]>(`/lender/documents/categories`);
