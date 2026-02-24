export type BIUnderwritingApplication = {
  coverage_type?: string | null;
  loan_amount?: number | string | null;
  status?: string | null;
  referrer_id?: string | number | null;
};

export function calculateBIUnderwritingScore(application: BIUnderwritingApplication) {
  let score = 100;

  if (application.coverage_type === "Unsecured") {
    score -= 15;
  }

  const loanAmount = Number(application.loan_amount ?? 0);
  if (loanAmount > 1000000) {
    score -= 20;
  } else if (loanAmount > 500000) {
    score -= 10;
  }

  if (application.status === "Documents Pending") {
    score -= 25;
  }

  if (application.referrer_id) {
    score += 5;
  }

  if (score > 100) score = 100;
  if (score < 0) score = 0;

  let risk: "Low" | "Medium" | "High" = "Low";

  if (score < 40) risk = "High";
  else if (score < 70) risk = "Medium";

  return { score, risk };
}
