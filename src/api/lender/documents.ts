import { lenderApiClient } from "@/api/lenderClient";

export const fetchDocumentCategories = () => lenderApiClient.get<string[]>(`/lender/documents/categories`);
