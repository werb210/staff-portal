import type { SubmissionMethod } from "@/types/lenderManagement.types";

export const SUBMISSION_METHOD_LABELS: Record<SubmissionMethod, string> = {
  GOOGLE_SHEET: "Google Sheet",
  EMAIL: "Email",
  API: "API",
  MANUAL: "Manual"
};

export const getSubmissionMethodLabel = (method?: SubmissionMethod | string | null) => {
  if (!method) return "Manual";
  if (method in SUBMISSION_METHOD_LABELS) {
    return SUBMISSION_METHOD_LABELS[method as SubmissionMethod];
  }
  return String(method);
};

export const getSubmissionMethodBadgeTone = (method?: SubmissionMethod | string | null) => {
  switch (method) {
    case "GOOGLE_SHEET":
      return "google-sheet";
    case "API":
      return "api";
    case "EMAIL":
      return "email";
    case "MANUAL":
      return "manual";
    default:
      return "manual";
  }
};
