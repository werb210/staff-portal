import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import {
  createLender,
  fetchLenders,
  updateLender,
  type Lender,
  type LenderPayload
} from "@/api/lenders";
import AppLoading from "@/components/layout/AppLoading";
import { getErrorMessage } from "@/utils/errors";
import RequireRole from "@/components/auth/RequireRole";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { SUBMISSION_METHODS, type SubmissionMethod } from "@/types/lenderManagement.types";

type LenderFormValues = {
  name: string;
  active: boolean;
  street: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone: string;
  website: string;
  description: string;
  internalNotes: string;
  processingNotes: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactMobile: string;
  submissionMethod: SubmissionMethod;
  apiBaseUrl: string;
  apiClientId: string;
  apiUsername: string;
  apiPassword: string;
  submissionEmail: string;
  maxLendingLimit: string;
  maxLtv: string;
  maxLoanTerm: string;
  maxAmortization: string;
};

type LenderSubmissionConfig = LenderPayload["submissionConfig"];

const emptyForm: LenderFormValues = {
  name: "",
  active: true,
  street: "",
  city: "",
  stateProvince: "",
  postalCode: "",
  country: "",
  phone: "",
  website: "",
  description: "",
  internalNotes: "",
  processingNotes: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  primaryContactMobile: "",
  submissionMethod: "MANUAL",
  apiBaseUrl: "",
  apiClientId: "",
  apiUsername: "",
  apiPassword: "",
  submissionEmail: "",
  maxLendingLimit: "",
  maxLtv: "",
  maxLoanTerm: "",
  maxAmortization: ""
};

const optionalString = (value: string) => (value.trim() ? value.trim() : null);

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const isValidEmail = (value: string) => value.includes("@");

const LendersContent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { lenderId } = useParams();
  const { data, isLoading, error } = useQuery<Lender[], Error>({
    queryKey: ["lenders"],
    queryFn: fetchLenders
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<LenderFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const isNewRoute = location.pathname.endsWith("/new");
  const selectedLender = useMemo(
    () => data?.find((lender) => lender.id === selectedId) ?? null,
    [data, selectedId]
  );

  const resetForm = (values?: LenderFormValues) => {
    setFormValues(values ?? emptyForm);
    setFormErrors({});
  };

  useEffect(() => {
    if (isNewRoute) {
      setSelectedId(null);
      resetForm(emptyForm);
      return;
    }
    if (lenderId) {
      setSelectedId(lenderId);
      return;
    }
    setSelectedId(null);
  }, [isNewRoute, lenderId]);

  useEffect(() => {
    if (selectedLender) {
      resetForm({
        name: selectedLender.name,
        active: selectedLender.active,
        street: selectedLender.address.street,
        city: selectedLender.address.city,
        stateProvince: selectedLender.address.stateProvince,
        postalCode: selectedLender.address.postalCode,
        country: selectedLender.address.country,
        phone: selectedLender.phone,
        website: selectedLender.website ?? "",
        description: selectedLender.description ?? "",
        internalNotes: selectedLender.internalNotes ?? "",
        processingNotes: selectedLender.processingNotes ?? "",
        primaryContactName: selectedLender.primaryContact.name,
        primaryContactEmail: selectedLender.primaryContact.email,
        primaryContactPhone: selectedLender.primaryContact.phone,
        primaryContactMobile: selectedLender.primaryContact.mobilePhone,
        submissionMethod: selectedLender.submissionConfig.method,
        apiBaseUrl: selectedLender.submissionConfig.apiBaseUrl ?? "",
        apiClientId: "",
        apiUsername: "",
        apiPassword: "",
        submissionEmail: selectedLender.submissionConfig.submissionEmail ?? "",
        maxLendingLimit: selectedLender.operationalLimits.maxLendingLimit?.toString() ?? "",
        maxLtv: selectedLender.operationalLimits.maxLtv?.toString() ?? "",
        maxLoanTerm: selectedLender.operationalLimits.maxLoanTerm?.toString() ?? "",
        maxAmortization: selectedLender.operationalLimits.maxAmortization?.toString() ?? ""
      });
      return;
    }
    resetForm();
  }, [selectedLender]);

  const createMutation = useMutation({
    mutationFn: (payload: LenderPayload) => createLender(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setSelectedId(null);
      navigate("/lenders");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LenderPayload> }) =>
      updateLender(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setSelectedId(null);
      navigate("/lenders");
    }
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => updateLender(id, { active }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
    }
  });

  const mutationError = createMutation.error ?? updateMutation.error;
  const mutationLoading = createMutation.isPending || updateMutation.isPending;

  const validateForm = (values: LenderFormValues) => {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.street.trim()) nextErrors.street = "Street is required.";
    if (!values.city.trim()) nextErrors.city = "City is required.";
    if (!values.stateProvince.trim()) nextErrors.stateProvince = "State/province is required.";
    if (!values.postalCode.trim()) nextErrors.postalCode = "Postal code is required.";
    if (!values.country.trim()) nextErrors.country = "Country is required.";
    if (!values.phone.trim()) nextErrors.phone = "Phone is required.";
    if (!values.primaryContactName.trim()) nextErrors.primaryContactName = "Primary contact name is required.";
    if (!values.primaryContactEmail.trim()) {
      nextErrors.primaryContactEmail = "Primary contact email is required.";
    } else if (!isValidEmail(values.primaryContactEmail)) {
      nextErrors.primaryContactEmail = "Enter a valid email.";
    }
    if (!values.submissionMethod) nextErrors.submissionMethod = "Submission method is required.";
    if (values.submissionMethod === "API") {
      if (!values.apiBaseUrl.trim()) nextErrors.apiBaseUrl = "API base URL is required.";
      const isEditing = Boolean(selectedLender);
      const hasCredentialUpdates =
        Boolean(values.apiClientId.trim()) || Boolean(values.apiUsername.trim()) || Boolean(values.apiPassword.trim());
      if (!isEditing || hasCredentialUpdates) {
        if (!values.apiClientId.trim()) nextErrors.apiClientId = "API client ID is required.";
        if (!values.apiUsername.trim()) nextErrors.apiUsername = "API username is required.";
        if (!values.apiPassword.trim()) nextErrors.apiPassword = "API password is required.";
      }
    }
    if (values.submissionMethod === "EMAIL" && !values.submissionEmail.trim()) {
      nextErrors.submissionEmail = "Submission email is required.";
    }
    const maxLendingLimit = toOptionalNumber(values.maxLendingLimit);
    if (values.maxLendingLimit.trim() && maxLendingLimit === null) {
      nextErrors.maxLendingLimit = "Max lending limit must be a number.";
    }
    const maxLtv = toOptionalNumber(values.maxLtv);
    if (values.maxLtv.trim() && maxLtv === null) {
      nextErrors.maxLtv = "Max LTV must be a number.";
    }
    if (maxLtv !== null && (maxLtv < 0 || maxLtv > 100)) {
      nextErrors.maxLtv = "Max LTV must be between 0 and 100.";
    }
    const maxLoanTerm = toOptionalNumber(values.maxLoanTerm);
    if (values.maxLoanTerm.trim() && maxLoanTerm === null) {
      nextErrors.maxLoanTerm = "Max loan term must be a number.";
    }
    const maxAmortization = toOptionalNumber(values.maxAmortization);
    if (values.maxAmortization.trim() && maxAmortization === null) {
      nextErrors.maxAmortization = "Max amortization must be a number.";
    }
    return nextErrors;
  };

  const buildSubmissionConfig = (
    values: LenderFormValues,
    existing?: LenderSubmissionConfig | null
  ): LenderSubmissionConfig => {
    if (values.submissionMethod === "API") {
      return {
        method: values.submissionMethod,
        apiBaseUrl: optionalString(values.apiBaseUrl),
        apiClientId: optionalString(values.apiClientId) ?? existing?.apiClientId ?? null,
        apiUsername: optionalString(values.apiUsername) ?? existing?.apiUsername ?? null,
        apiPassword: optionalString(values.apiPassword) ?? existing?.apiPassword ?? null,
        submissionEmail: null
      };
    }
    if (values.submissionMethod === "EMAIL") {
      return {
        method: values.submissionMethod,
        apiBaseUrl: null,
        apiClientId: null,
        apiUsername: null,
        apiPassword: null,
        submissionEmail: optionalString(values.submissionEmail)
      };
    }
    return {
      method: values.submissionMethod,
      apiBaseUrl: null,
      apiClientId: null,
      apiUsername: null,
      apiPassword: null,
      submissionEmail: null
    };
  };

  const buildCreatePayload = (values: LenderFormValues): LenderPayload => ({
    name: values.name.trim(),
    active: values.active,
    address: {
      street: values.street.trim(),
      city: values.city.trim(),
      stateProvince: values.stateProvince.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim()
    },
    phone: values.phone.trim(),
    website: optionalString(values.website),
    description: optionalString(values.description),
    internalNotes: optionalString(values.internalNotes),
    processingNotes: optionalString(values.processingNotes),
    primaryContact: {
      name: values.primaryContactName.trim(),
      email: values.primaryContactEmail.trim(),
      phone: values.primaryContactPhone.trim(),
      mobilePhone: values.primaryContactMobile.trim()
    },
    submissionConfig: buildSubmissionConfig(values),
    operationalLimits: {
      maxLendingLimit: toOptionalNumber(values.maxLendingLimit),
      maxLtv: toOptionalNumber(values.maxLtv),
      maxLoanTerm: toOptionalNumber(values.maxLoanTerm),
      maxAmortization: toOptionalNumber(values.maxAmortization)
    }
  });

  const buildUpdatePayload = (values: LenderFormValues): Partial<LenderPayload> => ({
    ...buildCreatePayload(values),
    submissionConfig: buildSubmissionConfig(values, selectedLender?.submissionConfig)
  });

  useEffect(() => {
    if (error) {
      console.error("Failed to load lenders", error);
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && !error) {
      emitUiTelemetry("data_loaded", { view: "lenders", count: data?.length ?? 0 });
    }
  }, [data?.length, error, isLoading]);

  return (
    <div className="page">
      <div className="management-grid">
        <Card
          title="Lenders"
          actions={
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                navigate("/lenders/new");
              }}
            >
              Add Lender
            </Button>
          }
        >
          {isLoading && <AppLoading />}
          {error && <p className="text-red-700">{getErrorMessage(error, "Unable to load lenders.")}</p>}
          {!isLoading && !error && (
            <Table headers={["Name", "Status", "Country", "Primary contact", "Submission", "Products"]}>
              {data?.map((lender) => (
                <tr
                  key={lender.id}
                  className={lender.active ? "management-row" : "management-row management-row--disabled"}
                >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => navigate(`/lenders/${lender.id}/edit`)}
                    >
                      {lender.name}
                    </button>
                  </td>
                  <td>
                    <div className="flex flex-col gap-2">
                      <span className={`status-pill status-pill--${lender.active ? "active" : "paused"}`}>
                        {lender.active ? "Active" : "Inactive"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => toggleMutation.mutate({ id: lender.id, active: !lender.active })}
                        disabled={toggleMutation.isPending}
                      >
                        {lender.active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                  <td>{lender.address.country}</td>
                  <td>
                    <div className="text-sm font-semibold">{lender.primaryContact.name}</div>
                    <div className="text-xs text-slate-500">{lender.primaryContact.email}</div>
                  </td>
                  <td>{lender.submissionConfig.method}</td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(`/lender-products?lenderId=${lender.id}`)}
                    >
                      Manage products
                    </Button>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td colSpan={6}>No lender profiles available.</td>
                </tr>
              )}
            </Table>
          )}
        </Card>

        <Card title={selectedLender ? "Edit lender" : "Create lender"}>
          {mutationError && (
            <p className="text-red-700">{getErrorMessage(mutationError, "Unable to save lender.")}</p>
          )}
          <form
            className="management-form"
            onSubmit={(event) => {
              event.preventDefault();
              const nextErrors = validateForm(formValues);
              setFormErrors(nextErrors);
              if (Object.keys(nextErrors).length) return;
              if (selectedLender) {
                updateMutation.mutate({ id: selectedLender.id, payload: buildUpdatePayload(formValues) });
                return;
              }
              createMutation.mutate(buildCreatePayload(formValues));
            }}
          >
            <div className="management-field">
              <span className="management-field__label">Lender profile</span>
              <Input
                label="Name"
                value={formValues.name}
                onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
                error={formErrors.name}
              />
              <label className="management-toggle">
                <input
                  type="checkbox"
                  checked={formValues.active}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, active: event.target.checked }))}
                />
                <span>Active lender</span>
              </label>
              <Input
                label="Phone"
                value={formValues.phone}
                onChange={(event) => setFormValues((prev) => ({ ...prev, phone: event.target.value }))}
                error={formErrors.phone}
              />
              <Input
                label="Website"
                value={formValues.website}
                onChange={(event) => setFormValues((prev) => ({ ...prev, website: event.target.value }))}
              />
              <label className="ui-field">
                <span className="ui-field__label">Description</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={formValues.description}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, description: event.target.value }))}
                  rows={3}
                />
              </label>
            </div>

            <div className="management-field">
              <span className="management-field__label">Address</span>
              <Input
                label="Street"
                value={formValues.street}
                onChange={(event) => setFormValues((prev) => ({ ...prev, street: event.target.value }))}
                error={formErrors.street}
              />
              <div className="management-grid__row">
                <Input
                  label="City"
                  value={formValues.city}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, city: event.target.value }))}
                  error={formErrors.city}
                />
                <Input
                  label="State / Province"
                  value={formValues.stateProvince}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, stateProvince: event.target.value }))}
                  error={formErrors.stateProvince}
                />
              </div>
              <div className="management-grid__row">
                <Input
                  label="Postal code"
                  value={formValues.postalCode}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, postalCode: event.target.value }))}
                  error={formErrors.postalCode}
                />
                <Input
                  label="Country"
                  value={formValues.country}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, country: event.target.value }))}
                  error={formErrors.country}
                />
              </div>
            </div>

            <div className="management-field">
              <span className="management-field__label">Primary contact</span>
              <Input
                label="Contact name"
                value={formValues.primaryContactName}
                onChange={(event) => setFormValues((prev) => ({ ...prev, primaryContactName: event.target.value }))}
                error={formErrors.primaryContactName}
              />
              <Input
                label="Contact email"
                value={formValues.primaryContactEmail}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, primaryContactEmail: event.target.value }))
                }
                error={formErrors.primaryContactEmail}
              />
              <div className="management-grid__row">
                <Input
                  label="Contact phone"
                  value={formValues.primaryContactPhone}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, primaryContactPhone: event.target.value }))
                  }
                />
                <Input
                  label="Mobile phone"
                  value={formValues.primaryContactMobile}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, primaryContactMobile: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className="management-field">
              <span className="management-field__label">Submission configuration</span>
              <Select
                label="Submission method"
                value={formValues.submissionMethod}
                onChange={(event) =>
                  setFormValues((prev) => ({
                    ...prev,
                    submissionMethod: event.target.value as SubmissionMethod
                  }))
                }
              >
                {SUBMISSION_METHODS.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </Select>
              {formErrors.submissionMethod && <span className="ui-field__error">{formErrors.submissionMethod}</span>}
              {formValues.submissionMethod === "API" && (
                <>
                  <Input
                    label="API base URL"
                    value={formValues.apiBaseUrl}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, apiBaseUrl: event.target.value }))}
                    error={formErrors.apiBaseUrl}
                  />
                  <Input
                    label="API client ID"
                    value={formValues.apiClientId}
                    onChange={(event) => setFormValues((prev) => ({ ...prev, apiClientId: event.target.value }))}
                    error={formErrors.apiClientId}
                  />
                  <div className="management-grid__row">
                    <Input
                      label="API username"
                      value={formValues.apiUsername}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, apiUsername: event.target.value }))}
                      error={formErrors.apiUsername}
                    />
                    <Input
                      label="API password"
                      type="password"
                      value={formValues.apiPassword}
                      onChange={(event) => setFormValues((prev) => ({ ...prev, apiPassword: event.target.value }))}
                      error={formErrors.apiPassword}
                    />
                  </div>
                  {selectedLender && (
                    <p className="text-xs text-slate-500">
                      API credentials are stored securely and never displayed. Enter new values to rotate them.
                    </p>
                  )}
                </>
              )}
              {formValues.submissionMethod === "EMAIL" && (
                <Input
                  label="Submission email"
                  value={formValues.submissionEmail}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, submissionEmail: event.target.value }))}
                  error={formErrors.submissionEmail}
                />
              )}
            </div>

            <div className="management-field">
              <span className="management-field__label">Operational limits</span>
              <div className="management-grid__row">
                <Input
                  label="Max lending limit"
                  value={formValues.maxLendingLimit}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, maxLendingLimit: event.target.value }))
                  }
                  error={formErrors.maxLendingLimit}
                />
                <Input
                  label="Max LTV (%)"
                  value={formValues.maxLtv}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, maxLtv: event.target.value }))}
                  error={formErrors.maxLtv}
                />
              </div>
              <div className="management-grid__row">
                <Input
                  label="Max loan term (months)"
                  value={formValues.maxLoanTerm}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, maxLoanTerm: event.target.value }))}
                  error={formErrors.maxLoanTerm}
                />
                <Input
                  label="Max amortization (months)"
                  value={formValues.maxAmortization}
                  onChange={(event) =>
                    setFormValues((prev) => ({ ...prev, maxAmortization: event.target.value }))
                  }
                  error={formErrors.maxAmortization}
                />
              </div>
            </div>

            <div className="management-field">
              <span className="management-field__label">Staff notes</span>
              <label className="ui-field">
                <span className="ui-field__label">Internal notes</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={formValues.internalNotes}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, internalNotes: event.target.value }))}
                  rows={3}
                />
              </label>
              <label className="ui-field">
                <span className="ui-field__label">Processing notes</span>
                <textarea
                  className="ui-input ui-textarea"
                  value={formValues.processingNotes}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, processingNotes: event.target.value }))}
                  rows={3}
                />
              </label>
            </div>

            <div className="management-actions">
              <Button type="submit" disabled={mutationLoading}>
                {selectedLender ? "Save changes" : "Create lender"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

const LendersPage = () => (
  <RequireRole roles={["Admin", "Staff"]}>
    <LendersContent />
  </RequireRole>
);

export default LendersPage;
