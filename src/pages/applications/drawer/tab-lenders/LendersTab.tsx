import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createLenderSubmission,
  fetchLenderMatches,
  fetchLenderSubmissions,
  retryLenderSubmission,
  retryLenderTransmission,
  type LenderMatch,
  type LenderSubmission,
  type LenderSubmissionStatus
} from "@/api/lenders";
import { ApiError } from "@/lib/api";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import { getErrorMessage } from "@/utils/errors";
import { useAuth } from "@/hooks/useAuth";
import AccessRestricted from "@/components/auth/AccessRestricted";
import Modal from "@/components/ui/Modal";
import { fullStaffRoles, hasRequiredRole, resolveUserRole } from "@/utils/roles";
import { canWrite } from "@/auth/can";
import { getSubmissionMethodBadgeTone, getSubmissionMethodLabel } from "@/utils/submissionMethods";
import { trackPortalEvent } from "@/lib/portalTracking";

type MatchWithMethod = LenderMatch & {
  submissionMethod?: string | null;
  submission_method?: string | null;
  submissionConfig?: { method?: string | null };
};

type ToastState = {
  message: string;
  tone: "success";
};

const LendersTab = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: matches = [], isLoading, error } = useQuery<LenderMatch[]>({
    queryKey: ["lenders", applicationId, "matches"],
    queryFn: ({ signal }) => fetchLenderMatches(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });
  const {
    data: submissions = [],
    isLoading: submissionsLoading,
    error: submissionsError
  } = useQuery<LenderSubmission[]>({
    queryKey: ["lenders", applicationId, "submissions"],
    queryFn: ({ signal }) => fetchLenderSubmissions(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId),
    refetchInterval: 15000
  });

  const [selected, setSelected] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<{ message: string; canRetry: boolean } | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [retryTarget, setRetryTarget] = useState<LenderSubmission | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, tone: "success" });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const mutation = useMutation({
    mutationFn: () => createLenderSubmission(applicationId ?? "", eligibleSelection),
    onSuccess: () => {
      setSelected([]);
      setSubmitError(null);
      setSubmitSuccess("Submission sent successfully.");
      showToast("Submission sent to lender.");
      queryClient.invalidateQueries({ queryKey: ["lenders", applicationId, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    },
    onError: (err) => {
      const nextError = getSubmissionErrorMessage(err);
      setSubmitError(nextError);
      setSubmitSuccess(null);
    }
  });

  const retryMutation = useMutation({
    mutationFn: (transmissionId: string) => retryLenderTransmission(transmissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lenders", applicationId, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    }
  });

  const retrySubmissionMutation = useMutation({
    mutationFn: (submission: LenderSubmission) => retryLenderSubmission(applicationId ?? "", submission.lenderProductId),
    onMutate: async (submission) => {
      await queryClient.cancelQueries({ queryKey: ["lenders", applicationId, "submissions"] });
      const previous = queryClient.getQueryData<LenderSubmission[]>(["lenders", applicationId, "submissions"]);
      queryClient.setQueryData<LenderSubmission[]>(["lenders", applicationId, "submissions"], (current) => {
        if (!current) return current;
        const optimisticTimestamp = new Date().toISOString();
        return current.map((item) =>
          item.id === submission.id
            ? {
                ...item,
                status: "pending_manual",
                updatedAt: optimisticTimestamp,
                errorMessage: null
              }
            : item
        );
      });
      return { previous };
    },
    onError: (_error, _submission, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["lenders", applicationId, "submissions"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["lenders", applicationId, "submissions"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline"] });
    }
  });

  const submissionByProductId = useMemo(
    () =>
      submissions.reduce<Record<string, LenderSubmission>>((acc, submission) => {
        acc[submission.lenderProductId] = submission;
        return acc;
      }, {}),
    [submissions]
  );

  const eligibleSelection = useMemo(
    () => selected.filter((id) => !submissionByProductId[id]),
    [selected, submissionByProductId]
  );

  const resolvedRole = resolveUserRole((user as { role?: string | null } | null)?.role ?? null);
  const canManageSubmissions = canWrite(resolvedRole ?? null) && hasRequiredRole(resolvedRole, fullStaffRoles);

  const submissionRows = useMemo(
    () =>
      submissions.map((submission) => {
        const match = matches.find((item) => item.id === submission.lenderProductId);
        const externalReference =
          submission.externalReference ??
          submission.transmissionId ??
          (submission as { external_reference?: string | null }).external_reference ??
          null;
        return {
          ...submission,
          lenderName: match?.lenderName ?? "Unknown lender",
          method: submission.method ?? (submission as { submission_method?: string | null }).submission_method ?? null,
          externalReference
        };
      }),
    [matches, submissions]
  );

  const getMatchSubmissionMethod = (match: LenderMatch) => {
    const matchWithMethod = match as MatchWithMethod;
    return matchWithMethod.submissionMethod ?? matchWithMethod.submission_method ?? matchWithMethod.submissionConfig?.method ?? null;
  };

  const getMatchLikelihood = (match: LenderMatch) => {
    const raw =
      match.matchPercentage ??
      match.matchPercent ??
      match.matchScore ??
      (match as { match_percentage?: number | string | null }).match_percentage ??
      (match as { match_percent?: number | string | null }).match_percent ??
      null;
    if (raw === null || raw === undefined || raw === "") return "—";
    const numeric = typeof raw === "number" ? raw : Number(raw);
    if (!Number.isNaN(numeric)) {
      const rounded = numeric > 1 ? Math.round(numeric) : Math.round(numeric * 100);
      return `${rounded}%`;
    }
    const trimmed = String(raw).trim();
    return trimmed.endsWith("%") ? trimmed : `${trimmed}%`;
  };

  const googleSheetMatchIds = useMemo(
    () =>
      new Set(
        matches
          .filter((match) => getMatchSubmissionMethod(match) === "GOOGLE_SHEET")
          .map((match) => match.id)
      ),
    [matches]
  );

  const hasGoogleSheetSelection = useMemo(
    () => eligibleSelection.some((id) => googleSheetMatchIds.has(id)),
    [eligibleSelection, googleSheetMatchIds]
  );

  const toggleSelection = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleSendClick = () => {
    if (applicationId) {
      trackPortalEvent("lender_send_initiated", {
        application_id: applicationId,
        lenders_selected: eligibleSelection.length
      });
    }
    if (hasGoogleSheetSelection) {
      setIsConfirmOpen(true);
      return;
    }
    mutation.mutate();
  };

  const handleConfirmSend = () => {
    setIsConfirmOpen(false);
    mutation.mutate();
  };

  if (!applicationId) return <div className="drawer-placeholder">Select an application to view lenders.</div>;
  if (isLoading) return <div className="drawer-placeholder">Loading lenders…</div>;
  if (error) return <div className="drawer-placeholder">{getErrorMessage(error, "Unable to load lenders.")}</div>;
  if (!canManageSubmissions) {
    return <AccessRestricted message="You do not have permission to view lender submissions." />;
  }

  return (
    <div className="drawer-tab drawer-tab__lenders">
      <div className="drawer-section">
        <div className="drawer-section__title">Recommended Lenders</div>
        {submissionsError ? (
          <div className="drawer-placeholder">{getErrorMessage(submissionsError, "Unable to load submission status.")}</div>
        ) : null}
        {submitSuccess ? (
          <div className="drawer-placeholder" role="status">
            {submitSuccess}
          </div>
        ) : null}
        {submitError ? (
          <div className="drawer-placeholder text-red-600" role="alert">
            <div>{submitError.message}</div>
            {submitError.canRetry ? (
              <button
                type="button"
                className="btn btn--secondary mt-2"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !canManageSubmissions}
              >
                Retry send
              </button>
            ) : null}
          </div>
        ) : null}
        {matches.length ? (
          <ul className="drawer-list">
            {matches.map((match) => (
              <li key={match.id} className="lender-row">
                <label>
                  <input
                    type="checkbox"
                    checked={selected.includes(match.id)}
                    onChange={() => toggleSelection(match.id)}
                    disabled={Boolean(submissionByProductId[match.id]) || !canManageSubmissions}
                  />
                  <span className="lender-row__name">{match.lenderName}</span>
                </label>
                <div className="lender-row__meta">
                  <div>Product: {match.productCategory ?? "—"}</div>
                  <div>Terms: {match.terms ?? "—"}</div>
                  <div>Documents: {match.requiredDocsStatus ?? "—"}</div>
                  <div>Likelihood: {getMatchLikelihood(match)}</div>
                  <div>
                    Status:{" "}
                    <SubmissionStatus
                      status={submissionByProductId[match.id]?.status}
                      loading={submissionsLoading}
                    />
                  </div>
                  {submissionByProductId[match.id]?.status === "failed" ? (
                    <button
                      type="button"
                      className="btn btn--secondary"
                      disabled={
                        !canManageSubmissions ||
                        retryMutation.isPending ||
                        !getRetryId(submissionByProductId[match.id])
                      }
                      onClick={() => {
                        const transmissionId = getRetryId(submissionByProductId[match.id]);
                        if (!transmissionId) return;
                        retryMutation.mutate(transmissionId);
                      }}
                    >
                      Retry
                    </button>
                  ) : null}
                  {submissionByProductId[match.id]?.status === "failed" ? (
                    <div className="text-xs text-amber-700">Submission failed — retry available</div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="drawer-placeholder">No lenders available.</div>
        )}
      </div>
      <div className="drawer-section">
        <div className="drawer-section__title">Submissions</div>
        {submissionsLoading ? <div className="drawer-placeholder">Loading submission status…</div> : null}
        {!submissionsLoading && !submissionRows.length ? (
          <div className="drawer-placeholder">No submissions yet.</div>
        ) : null}
        {!submissionsLoading && submissionRows.length ? (
          <div className="drawer-list">
            {submissionRows.map((submission) => {
              const status = formatSubmissionStatus(submission.status);
              const timestamp = formatTimestamp(submission.updatedAt);
              return (
                <div key={submission.id} className="drawer-list__item">
                  <div className="drawer-section">
                    <div className="drawer-section__title">{submission.lenderName}</div>
                    <div className="drawer-section__body">
                      <div className="drawer-kv-list">
                        <div className="drawer-kv-list__item">
                          <dt>Status</dt>
                          <dd>
                            <span className={`status-pill status-pill--${status.tone}`}>{status.label}</span>
                          </dd>
                        </div>
                        <div className="drawer-kv-list__item">
                          <dt>Submitted</dt>
                          <dd>{timestamp}</dd>
                        </div>
                        <div className="drawer-kv-list__item">
                          <dt>Method</dt>
                          <dd>
                            <span
                              className={`status-pill status-pill--submission-${getSubmissionMethodBadgeTone(
                                submission.method
                              )}`}
                            >
                              {getSubmissionMethodLabel(submission.method)}
                            </span>
                          </dd>
                        </div>
                        <div className="drawer-kv-list__item">
                          <dt>External reference</dt>
                          <dd>{submission.externalReference ?? "—"}</dd>
                        </div>
                      </div>
                      {submission.status === "failed" ? (
                        <div className="text-xs text-amber-700 pt-2">Submission failed — retry available</div>
                      ) : null}
                      <div className="flex flex-wrap gap-2 pt-3">
                        {submission.status === "failed" && canManageSubmissions ? (
                          <button
                            type="button"
                            className="btn btn--secondary"
                            disabled={retrySubmissionMutation.isPending}
                            onClick={() => setRetryTarget(submission)}
                          >
                            Retry submission
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
      <div className="drawer-footer-actions">
        <button
          className="btn btn--primary"
          type="button"
          onClick={handleSendClick}
          disabled={!eligibleSelection.length || mutation.isPending || !canManageSubmissions}
        >
          Send to Lender
        </button>
      </div>

      {isConfirmOpen ? (
        <Modal title="Confirm submission" onClose={() => setIsConfirmOpen(false)}>
          <div className="space-y-4">
            <p>This will submit the application to the lender’s Google Sheet.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleConfirmSend}
                disabled={mutation.isPending}
              >
                Confirm
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setIsConfirmOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
      {retryTarget ? (
        <Modal title="Confirm retry" onClose={() => setRetryTarget(null)}>
          <div className="space-y-4">
            <p>Retry submission to this lender?</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  retrySubmissionMutation.mutate(retryTarget);
                  setRetryTarget(null);
                }}
                disabled={retrySubmissionMutation.isPending}
              >
                Confirm retry
              </button>
              <button type="button" className="btn btn--secondary" onClick={() => setRetryTarget(null)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {toast ? (
        <div
          className="fixed bottom-4 right-4 z-50 rounded bg-emerald-600 px-4 py-2 text-sm text-white shadow"
          role="status"
        >
          {toast.message}
        </div>
      ) : null}
    </div>
  );
};

const SubmissionStatus = ({ status, loading }: { status?: LenderSubmissionStatus; loading?: boolean }) => {
  if (loading) return <span className="status-pill status-pill--pending">Refreshing…</span>;
  if (!status) return <span className="status-pill status-pill--idle">Not sent</span>;
  switch (status) {
    case "sent":
      return <span className="status-pill status-pill--sent">Sent</span>;
    case "failed":
      return <span className="status-pill status-pill--failed">Failed</span>;
    case "pending_manual":
      return <span className="status-pill status-pill--pending">Pending manual</span>;
    default:
      return <span className="status-pill status-pill--idle">Unknown</span>;
  }
};

const formatSubmissionStatus = (status?: LenderSubmissionStatus) => {
  switch (status) {
    case "sent":
      return { label: "Submitted", tone: "sent" };
    case "failed":
      return { label: "Failed", tone: "failed" };
    case "pending_manual":
      return { label: "Pending", tone: "pending" };
    default:
      return { label: "Pending", tone: "idle" };
  }
};

const formatTimestamp = (value?: string | null) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString();
};

const getRetryId = (submission?: LenderSubmission) =>
  submission?.transmissionId?.trim() || submission?.id || null;

const getSubmissionErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status >= 500) {
      return { message: "Submission failed due to a server error. Please retry.", canRetry: true };
    }
    if (error.status >= 400) {
      const details = error.details as { message?: string } | undefined;
      return {
        message: details?.message ?? error.message ?? "Submission failed due to invalid data.",
        canRetry: false
      };
    }
  }
  return { message: getErrorMessage(error, "Unable to send to lender."), canRetry: false };
};

export default LendersTab;
