type ProcessingStatusInput = {
  ocrCompletedAt?: string | null;
  bankingCompletedAt?: string | null;
};

export type ProcessingStatus = {
  headerLabel: string;
  badge: "Pending" | "In progress" | "Complete";
};

const isEmptyTimestamp = (value?: string | null) => value === null || value === "";

export const getProcessingStatus = ({ ocrCompletedAt, bankingCompletedAt }: ProcessingStatusInput): ProcessingStatus | null => {
  if (ocrCompletedAt === undefined && bankingCompletedAt === undefined) {
    return null;
  }

  if (isEmptyTimestamp(ocrCompletedAt)) {
    return { headerLabel: "Processing: Pending", badge: "Pending" };
  }

  if (isEmptyTimestamp(bankingCompletedAt)) {
    return { headerLabel: "Processing: In progress", badge: "In progress" };
  }

  return { headerLabel: "Processing: Complete", badge: "Complete" };
};
