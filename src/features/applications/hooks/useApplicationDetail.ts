import { useQuery } from "@tanstack/react-query";
import {
  getApplicationFull,
  getDocuments,
  getBanking,
  getFinancials,
  getOCR,
  getLenders
} from "@/lib/api/applications";

export function useApplicationDetail(id: string) {
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplicationFull(id)
  });
}

export function useApplicationDocuments(id: string) {
  return useQuery({
    queryKey: ["application", id, "documents"],
    queryFn: () => getDocuments(id)
  });
}

export function useApplicationBanking(id: string) {
  return useQuery({
    queryKey: ["application", id, "banking"],
    queryFn: () => getBanking(id)
  });
}

export function useApplicationFinancials(id: string) {
  return useQuery({
    queryKey: ["application", id, "financials"],
    queryFn: () => getFinancials(id)
  });
}

export function useApplicationOCR(id: string) {
  return useQuery({
    queryKey: ["application", id, "ocr"],
    queryFn: () => getOCR(id)
  });
}

export function useApplicationLenders(id: string) {
  return useQuery({
    queryKey: ["application", id, "lenders"],
    queryFn: () => getLenders(id)
  });
}
