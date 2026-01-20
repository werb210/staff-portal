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
import { getRequestId } from "@/utils/requestId";
import RequireRole from "@/components/auth/RequireRole";
import { emitUiTelemetry } from "@/utils/uiTelemetry";
import { SUBMISSION_METHODS, type SubmissionMethod } from "@/types/lenderManagement.types";

type LenderFormValues = {
  name: string;
  active: boolean;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  phone: string;
  website: string;
  description: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  submissionMethod: SubmissionMethod;
  submissionEmail: string;
};

const emptyForm: LenderFormValues = {
  name: "",
  active: true,
  street: "",
  city: "",
  region: "",
  postalCode: "",
  country: "CA",
  phone: "",
  website: "",
  description: "",
  primaryContactName: "",
  primaryContactEmail: "",
  primaryContactPhone: "",
  submissionMethod: "MANUAL",
  submissionEmail: ""
};

const optionalString = (value: string) => (value.trim() ? value.trim() : null);

const isValidEmail = (value: string) => value.includes("@");

const COUNTRIES = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" }
];

const PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "YT", label: "Yukon" }
];

const STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" }
];

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
        region: selectedLender.address.stateProvince,
        postalCode: selectedLender.address.postalCode,
        country: selectedLender.address.country,
        phone: selectedLender.phone,
        website: selectedLender.website ?? "",
        description: selectedLender.description ?? "",
        primaryContactName: selectedLender.primaryContact.name,
        primaryContactEmail: selectedLender.primaryContact.email,
        primaryContactPhone: selectedLender.primaryContact.phone,
        submissionMethod: selectedLender.submissionConfig.method,
        submissionEmail: selectedLender.submissionConfig.submissionEmail ?? ""
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
    if (!values.region.trim()) nextErrors.region = "State/province is required.";
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
    if (values.submissionMethod === "EMAIL" && !values.submissionEmail.trim()) {
      nextErrors.submissionEmail = "Submission email is required.";
    }
    return nextErrors;
  };

  const buildCreatePayload = (values: LenderFormValues): LenderPayload => ({
    name: values.name.trim(),
    active: values.active,
    phone: values.phone.trim(),
    website: optionalString(values.website),
    description: optionalString(values.description),
    street: values.street.trim(),
    city: values.city.trim(),
    region: values.region.trim(),
    country: values.country.trim(),
    postal_code: values.postalCode.trim(),
    contact_name: values.primaryContactName.trim(),
    contact_email: values.primaryContactEmail.trim(),
    contact_phone: values.primaryContactPhone.trim(),
    submission_method: values.submissionMethod,
    submission_email:
      values.submissionMethod === "EMAIL" ? optionalString(values.submissionEmail) : null
  });

  const buildUpdatePayload = (values: LenderFormValues): Partial<LenderPayload> => ({
    ...buildCreatePayload(values)
  });

  useEffect(() => {
    if (error) {
      console.error("Failed to load lenders", { requestId: getRequestId(), error });
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
                <Select
                  label="State / Province"
                  value={formValues.region}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, region: event.target.value }))}
                >
                  <option value="">
                    Select {formValues.country === "US" ? "state" : "province"}
                  </option>
                  {(formValues.country === "US" ? STATES : PROVINCES).map((region) => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </Select>
                {formErrors.region && <span className="ui-field__error">{formErrors.region}</span>}
              </div>
              <div className="management-grid__row">
                <Input
                  label="Postal code"
                  value={formValues.postalCode}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, postalCode: event.target.value }))}
                  error={formErrors.postalCode}
                />
                <Select
                  label="Country"
                  value={formValues.country}
                  onChange={(event) =>
                    setFormValues((prev) => ({
                      ...prev,
                      country: event.target.value,
                      region: prev.country === event.target.value ? prev.region : ""
                    }))
                  }
                >
                  {COUNTRIES.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </Select>
                {formErrors.country && <span className="ui-field__error">{formErrors.country}</span>}
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
              {formValues.submissionMethod === "EMAIL" && (
                <Input
                  label="Submission email"
                  value={formValues.submissionEmail}
                  onChange={(event) => setFormValues((prev) => ({ ...prev, submissionEmail: event.target.value }))}
                  error={formErrors.submissionEmail}
                />
              )}
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
