import { useMutation } from '@tanstack/react-query';
import { assistantService, type EscalationPayload, type IssueReportPayload } from '../../services/assistantService';

export function useEscalateToHuman() {
  return useMutation({
    mutationFn: (payload: EscalationPayload) => assistantService.escalateToHuman(payload),
  });
}

export function useReportIssue() {
  return useMutation({
    mutationFn: (payload: IssueReportPayload) => assistantService.reportIssue(payload),
  });
}
