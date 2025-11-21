import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  runBankingAnalysis,
  getBankingSummary,
  getBankingTransactions,
} from "../api/banking";

export function useBankingSummary(applicationId: string) {
  return useQuery({
    queryKey: ["banking-summary", applicationId],
    queryFn: () => getBankingSummary(applicationId),
    enabled: !!applicationId,
  });
}

export function useBankingTransactions(applicationId: string) {
  return useQuery({
    queryKey: ["banking-transactions", applicationId],
    queryFn: () => getBankingTransactions(applicationId),
    enabled: !!applicationId,
  });
}

export function useRunBankingAnalysis(applicationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => runBankingAnalysis(applicationId),
    onSuccess: () => {
      qc.invalidateQueries(["banking-summary", applicationId]);
      qc.invalidateQueries(["banking-transactions", applicationId]);
    },
  });
}
