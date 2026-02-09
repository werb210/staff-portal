type ProcessingStatusInput = {
  ocrCompletedAt?: string | null;
  bankingCompletedAt?: string | null;
};

export type ProcessingStatus = {
  headerLabel: string;
  badge: "OCR" | "BANKING" | "DONE";
};

const isEmptyTimestamp = (value?: string | null) => value === null || value === "";

export const getProcessingStatus = ({ ocrCompletedAt, bankingCompletedAt }: ProcessingStatusInput): ProcessingStatus | null => {
  if (ocrCompletedAt === undefined && bankingCompletedAt === undefined) {
    return null;
  }

  if (isEmptyTimestamp(ocrCompletedAt)) {
    return { headerLabel: "Processing: OCR Pending", badge: "OCR" };
  }

  if (isEmptyTimestamp(bankingCompletedAt)) {
    return { headerLabel: "Processing: Banking In Progress", badge: "BANKING" };
  }

  return { headerLabel: "Processing: Complete", badge: "DONE" };
};
