import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  FUNDING_TYPES,
  type FundingType,
  type LenderStatus
} from "@/types/lenderManagement.types";

type LenderFormValues = {
  name: string;
  status: LenderStatus;
  regions: string;
  industries: string;
  minDealAmount: string;
  maxDealAmount: string;
  fundingTypes: FundingType[];
  internalNotes: string;
  clientVisible: boolean;
};

const emptyForm: LenderFormValues = {
  name: "",
  status: "active",
  regions: "",
  industries: "",
  minDealAmount: "",
  maxDealAmount: "",
  fundingTypes: [],
  internalNotes: "",
  clientVisible: true
};

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const formatList = (values: string[]) => values.join(", ");

const toggleFundingType = (values: FundingType[], type: FundingType) =>
  values.includes(type) ? values.filter((item) => item !== type) : [...values, type];

const toLenderStatus = (value: string): LenderStatus => (value === "paused" ? "paused" : "active");

const LendersContent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery<Lender[], Error>({
    queryKey: ["lenders"],
    queryFn: fetchLenders
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<LenderFormValues>(emptyForm);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const selectedLender = useMemo(
    () => data?.find((lender) => lender.id === selectedId) ?? null,
    [data, selectedId]
  );

  const resetForm = (values?: LenderFormValues) => {
    setFormValues(values ?? emptyForm);
    setFormErrors({});
  };

  useEffect(() => {
    if (selectedLender) {
      resetForm({
        name: selectedLender.name,
        status: selectedLender.status,
        regions: formatList(selectedLender.regions),
        industries: formatList(selectedLender.industries),
        minDealAmount: String(selectedLender.minDealAmount),
        maxDealAmount: String(selectedLender.maxDealAmount),
        fundingTypes: selectedLender.fundingTypes,
        internalNotes: selectedLender.internalNotes ?? "",
        clientVisible: selectedLender.clientVisible
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
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LenderPayload> }) =>
      updateLender(id, payload),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ["lenders"] });
      setSelectedId(updated.id);
    }
  });

  const mutationError = createMutation.error ?? updateMutation.error;
  const mutationLoading = createMutation.isPending || updateMutation.isPending;

  const validateForm = (values: LenderFormValues) => {
    const nextErrors: Record<string, string> = {};
    if (!values.name.trim()) nextErrors.name = "Name is required.";
    if (!values.status) nextErrors.status = "Status is required.";
    if (!values.regions.trim()) nextErrors.regions = "Regions are required.";
    if (!values.industries.trim()) nextErrors.industries = "Industries are required.";
    if (!values.minDealAmount) nextErrors.minDealAmount = "Minimum deal amount is required.";
    if (!values.maxDealAmount) nextErrors.maxDealAmount = "Maximum deal amount is required.";
    const minAmount = Number(values.minDealAmount);
    const maxAmount = Number(values.maxDealAmount);
    if (Number.isNaN(minAmount)) nextErrors.minDealAmount = "Minimum deal amount must be a number.";
    if (Number.isNaN(maxAmount)) nextErrors.maxDealAmount = "Maximum deal amount must be a number.";
    if (!Number.isNaN(minAmount) && !Number.isNaN(maxAmount) && minAmount > maxAmount) {
      nextErrors.maxDealAmount = "Maximum deal amount must be greater than minimum.";
    }
    if (!values.fundingTypes.length) nextErrors.fundingTypes = "Select at least one funding type.";
    return nextErrors;
  };

  const buildPayload = (values: LenderFormValues): LenderPayload => ({
    name: values.name.trim(),
    status: values.status,
    regions: parseList(values.regions),
    industries: parseList(values.industries),
    minDealAmount: Number(values.minDealAmount),
    maxDealAmount: Number(values.maxDealAmount),
    fundingTypes: values.fundingTypes,
    internalNotes: values.internalNotes.trim() ? values.internalNotes.trim() : null,
    clientVisible: values.clientVisible
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
                setSelectedId(null);
                resetForm(emptyForm);
              }}
            >
              Add Lender
            </Button>
          }
        >
          {isLoading && <AppLoading />}
          {error && <p className="text-red-700">{getErrorMessage(error, "Unable to load lenders.")}</p>}
          {!isLoading && !error && (
            <Table headers={["Name", "Status", "Regions", "Client visible", "Products"]}>
              {data?.map((lender) => (
                <tr
                  key={lender.id}
                  className={
                    lender.status === "paused" ? "management-row management-row--disabled" : "management-row"
                  }
                >
                  <td>
                    <button
                      type="button"
                      className="management-link"
                      onClick={() => setSelectedId(lender.id)}
                    >
                      {lender.name}
                    </button>
                  </td>
                  <td>
                    <span className={`status-pill status-pill--${lender.status}`}>
                      {lender.status === "paused" ? "Paused" : "Active"}
                    </span>
                  </td>
                  <td>{lender.regions.join(", ")}</td>
                  <td>{lender.clientVisible ? "Visible" : "Hidden"}</td>
                  <td>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => navigate(`/lenders/products?lenderId=${lender.id}`)}
                    >
                      Manage products
                    </Button>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td colSpan={5}>No lender profiles available.</td>
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
              const payload = buildPayload(formValues);
              if (selectedLender) {
                updateMutation.mutate({ id: selectedLender.id, payload });
                return;
              }
              createMutation.mutate(payload);
            }}
          >
            <Input
              label="Lender name"
              value={formValues.name}
              onChange={(event) => setFormValues((prev) => ({ ...prev, name: event.target.value }))}
              error={formErrors.name}
            />
            <Select
              label="Status"
              value={formValues.status}
              onChange={(event) =>
                setFormValues((prev) => ({ ...prev, status: toLenderStatus(event.target.value) }))
              }
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
            </Select>
            {formErrors.status && <span className="ui-field__error">{formErrors.status}</span>}
            <Input
              label="Regions (comma-separated)"
              value={formValues.regions}
              onChange={(event) => setFormValues((prev) => ({ ...prev, regions: event.target.value }))}
              error={formErrors.regions}
            />
            <Input
              label="Industries (comma-separated)"
              value={formValues.industries}
              onChange={(event) => setFormValues((prev) => ({ ...prev, industries: event.target.value }))}
              error={formErrors.industries}
            />
            <div className="management-grid__row">
              <Input
                label="Minimum deal amount"
                value={formValues.minDealAmount}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, minDealAmount: event.target.value }))
                }
                error={formErrors.minDealAmount}
              />
              <Input
                label="Maximum deal amount"
                value={formValues.maxDealAmount}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, maxDealAmount: event.target.value }))
                }
                error={formErrors.maxDealAmount}
              />
            </div>
            <div className="management-field">
              <span className="management-field__label">Funding types</span>
              <div className="management-checkbox-grid">
                {FUNDING_TYPES.map((type) => (
                  <label key={type} className="management-checkbox">
                    <input
                      type="checkbox"
                      checked={formValues.fundingTypes.includes(type)}
                      onChange={() =>
                        setFormValues((prev) => ({
                          ...prev,
                          fundingTypes: toggleFundingType(prev.fundingTypes, type)
                        }))
                      }
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
              {formErrors.fundingTypes && <span className="ui-field__error">{formErrors.fundingTypes}</span>}
            </div>
            <label className="ui-field">
              <span className="ui-field__label">Internal notes</span>
              <textarea
                className="ui-input ui-textarea"
                value={formValues.internalNotes}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, internalNotes: event.target.value }))
                }
                rows={4}
              />
            </label>
            <label className="management-toggle">
              <input
                type="checkbox"
                checked={formValues.clientVisible}
                onChange={(event) =>
                  setFormValues((prev) => ({ ...prev, clientVisible: event.target.checked }))
                }
              />
              <span>Client-visible lender</span>
            </label>
            <div className="management-actions">
              {selectedLender && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    updateMutation.mutate({
                      id: selectedLender.id,
                      payload: { status: selectedLender.status === "active" ? "paused" : "active" }
                    })
                  }
                  disabled={mutationLoading}
                >
                  {selectedLender.status === "active" ? "Disable lender" : "Enable lender"}
                </Button>
              )}
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
