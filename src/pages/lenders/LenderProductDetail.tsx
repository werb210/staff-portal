import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import ErrorBanner from "@/components/ui/ErrorBanner";
import AppLoading from "@/components/layout/AppLoading";
import { getErrorMessage } from "@/utils/errors";
import {
  createLenderProductRequirement,
  deleteLenderProductRequirement,
  fetchClientLenderProductRequirements,
  fetchLenderProductById,
  fetchLenders,
  updateLenderProductRequirement,
  type LenderProductRequirement
} from "@/api/lenders";
import { LENDER_PRODUCT_CATEGORY_LABELS } from "@/types/lenderManagement.types";

type RequirementRow = {
  id: string;
  documentType: string;
  required: boolean;
  minAmount: string;
  maxAmount: string;
  isEditing: boolean;
  isNew: boolean;
  error?: string | null;
};

const toOptionalNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const toRow = (requirement: LenderProductRequirement): RequirementRow => ({
  id: requirement.id,
  documentType: requirement.documentType ?? "",
  required: requirement.required,
  minAmount: requirement.minAmount === null ? "" : requirement.minAmount.toString(),
  maxAmount: requirement.maxAmount === null ? "" : requirement.maxAmount.toString(),
  isEditing: false,
  isNew: false,
  error: null
});

const validateRow = (row: RequirementRow) => {
  if (!row.documentType.trim()) return "Document type is required.";
  const minAmount = toOptionalNumber(row.minAmount);
  const maxAmount = toOptionalNumber(row.maxAmount);
  if (row.minAmount.trim() && minAmount === null) return "Minimum amount must be a number.";
  if (row.maxAmount.trim() && maxAmount === null) return "Maximum amount must be a number.";
  if (minAmount !== null && maxAmount !== null && minAmount > maxAmount) {
    return "Minimum amount must be less than or equal to maximum.";
  }
  return null;
};

const LenderProductDetail = () => {
  const { productId } = useParams();
  const location = useLocation();
  const queryClient = useQueryClient();
  const requirementsRef = useRef<HTMLDivElement | null>(null);
  const [rows, setRows] = useState<RequirementRow[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    data: product,
    isLoading: productLoading,
    error: productError
  } = useQuery({
    queryKey: ["lender-product", productId],
    queryFn: () => fetchLenderProductById(productId ?? ""),
    enabled: Boolean(productId)
  });

  const {
    data: lenders = [],
    isLoading: lendersLoading,
    error: lendersError
  } = useQuery({
    queryKey: ["lenders"],
    queryFn: ({ signal }) => fetchLenders({ signal }),
    staleTime: 30_000,
    refetchOnWindowFocus: false
  });

  const {
    data: requirementsData,
    isLoading: requirementsLoading,
    error: requirementsError
  } = useQuery({
    queryKey: ["lender-product-requirements", productId],
    queryFn: () => fetchClientLenderProductRequirements(productId ?? ""),
    enabled: Boolean(productId)
  });

  const deleteMutation = useMutation({
    mutationFn: ({ requirementId }: { requirementId: string }) =>
      deleteLenderProductRequirement(productId ?? "", requirementId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["lender-product-requirements", productId] });
    }
  });

  useEffect(() => {
    if (!requirementsData?.requirements) return;
    setRows(requirementsData.requirements.map(toRow));
  }, [requirementsData]);

  useEffect(() => {
    if (!location.pathname.endsWith("/requirements")) return;
    requirementsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.pathname]);

  const lenderName = useMemo(() => {
    if (!product) return "";
    return lenders.find((lender) => lender.id === product.lenderId)?.name ?? "";
  }, [lenders, product]);

  const documentTypeOptions = useMemo(() => {
    const source = new Set<string>();
    requirementsData?.documentTypes?.forEach((type) => source.add(type));
    rows.forEach((row) => {
      if (row.documentType.trim()) source.add(row.documentType.trim());
    });
    return Array.from(source.values()).sort();
  }, [requirementsData, rows]);

  const requiredCount = useMemo(() => rows.filter((row) => row.required).length, [rows]);
  const hasEdits = rows.some((row) => row.isEditing);

  const handleAddRequirement = () => {
    const tempId = `new-${
      typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now().toString()
    }`;
    setRows((prev) => [
      ...prev,
      {
        id: tempId,
        documentType: "",
        required: true,
        minAmount: "",
        maxAmount: "",
        isEditing: true,
        isNew: true,
        error: null
      }
    ]);
  };

  const handleSave = async () => {
    if (!productId) return;
    setSaveError(null);
    const validated = rows.map((row) => ({ ...row, error: row.isEditing ? validateRow(row) : row.error }));
    setRows(validated);
    if (validated.some((row) => row.error)) return;
    if (validated.filter((row) => row.required).length === 0) {
      setSaveError("At least one required document must remain required.");
      return;
    }
    const editedRows = validated.filter((row) => row.isEditing);
    if (!editedRows.length) return;
    setIsSaving(true);

    let hasError = false;
    for (const row of editedRows) {
      try {
        const payload = {
          document_type: row.documentType.trim(),
          required: row.required,
          min_amount: toOptionalNumber(row.minAmount),
          max_amount: toOptionalNumber(row.maxAmount)
        };
        const saved = row.isNew
          ? await createLenderProductRequirement(productId, payload)
          : await updateLenderProductRequirement(productId, row.id, payload);
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? {
                  ...item,
                  id: saved.id,
                  documentType: saved.documentType,
                  required: saved.required,
                  minAmount: saved.minAmount === null ? "" : saved.minAmount.toString(),
                  maxAmount: saved.maxAmount === null ? "" : saved.maxAmount.toString(),
                  isEditing: false,
                  isNew: false,
                  error: null
                }
              : item
          )
        );
      } catch (error) {
        hasError = true;
        setRows((prev) =>
          prev.map((item) =>
            item.id === row.id
              ? { ...item, error: getErrorMessage(error, "Unable to save requirement.") }
              : item
          )
        );
      }
    }
    setIsSaving(false);
    if (!hasError) {
      queryClient.invalidateQueries({ queryKey: ["lender-product-requirements", productId] });
    }
  };

  const handleDelete = async (row: RequirementRow) => {
    if (!productId || row.isNew) {
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      return;
    }
    try {
      await deleteMutation.mutateAsync({ requirementId: row.id });
      setRows((prev) => prev.filter((item) => item.id !== row.id));
    } catch (error) {
      setRows((prev) =>
        prev.map((item) =>
          item.id === row.id
            ? { ...item, error: getErrorMessage(error, "Unable to delete requirement.") }
            : item
        )
      );
    }
  };

  if (productLoading || lendersLoading) {
    return <AppLoading />;
  }

  if (productError) {
    return <ErrorBanner message={getErrorMessage(productError, "Unable to load product.")} />;
  }

  if (!product) {
    return <ErrorBanner message="Product not found." />;
  }

  return (
    <div className="page">
      <Card title="Product Info">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-xs text-slate-500">Name</div>
            <div className="text-sm font-semibold">{product.productName}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Type</div>
            <div className="text-sm font-semibold">{LENDER_PRODUCT_CATEGORY_LABELS[product.category]}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Min / Max Amount</div>
            <div className="text-sm font-semibold">
              ${product.minAmount.toLocaleString()} - ${product.maxAmount.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Status</div>
            <div className="text-sm font-semibold">{product.active ? "Active" : "Inactive"}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Lender Name</div>
            <div className="text-sm font-semibold">{lenderName || "Unknown lender"}</div>
          </div>
        </div>
        {lendersError && <ErrorBanner message={getErrorMessage(lendersError, "Unable to load lender details.")} />}
      </Card>

      <div ref={requirementsRef}>
        <Card title="Document Requirements">
          {requirementsLoading && <AppLoading />}
          {requirementsError && (
            <ErrorBanner message={getErrorMessage(requirementsError, "Unable to load requirements.")} />
          )}
          {saveError && <ErrorBanner message={saveError} />}
          {requiredCount === 0 && (
            <p className="text-sm text-amber-600">
              Warning: this product currently has zero required documents.
            </p>
          )}
          <div className="flex flex-wrap gap-2 py-4">
            <Button type="button" onClick={handleAddRequirement}>
              ➕ Add Requirement
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSave}
              disabled={!hasEdits || isSaving}
            >
              💾 Save Changes
            </Button>
          </div>
          <Table headers={["Document Type", "Required", "Min Amount", "Max Amount", "Actions"]}>
            {rows.map((row) => {
              const isDeleteDisabled = row.required && requiredCount <= 1;
              return (
                <tr key={row.id} className="management-row">
                  <td>
                    {row.isEditing ? (
                      <Select
                        value={row.documentType}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, documentType: event.target.value, isEditing: true }
                                : item
                            )
                          )
                        }
                      >
                        <option value="">Select document type</option>
                        {documentTypeOptions.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </Select>
                    ) : (
                      <span>{row.documentType || "—"}</span>
                    )}
                  </td>
                  <td>
                    <label className="management-toggle">
                      <input
                        type="checkbox"
                        checked={row.required}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, required: event.target.checked, isEditing: true }
                                : item
                            )
                          )
                        }
                      />
                      <span>{row.required ? "Required" : "Optional"}</span>
                    </label>
                  </td>
                  <td>
                    {row.isEditing ? (
                      <Input
                        value={row.minAmount}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, minAmount: event.target.value, isEditing: true }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      <span>{row.minAmount || "—"}</span>
                    )}
                  </td>
                  <td>
                    {row.isEditing ? (
                      <Input
                        value={row.maxAmount}
                        onChange={(event) =>
                          setRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? { ...item, maxAmount: event.target.value, isEditing: true }
                                : item
                            )
                          )
                        }
                      />
                    ) : (
                      <span>{row.maxAmount || "—"}</span>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() =>
                            setRows((prev) =>
                              prev.map((item) =>
                                item.id === row.id ? { ...item, isEditing: true } : item
                              )
                            )
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={isDeleteDisabled || deleteMutation.isPending}
                          onClick={() => handleDelete(row)}
                        >
                          Delete
                        </Button>
                      </div>
                      {isDeleteDisabled && (
                        <span className="text-xs text-slate-500">At least one required doc needed.</span>
                      )}
                      {row.error && <span className="text-xs text-red-600">{row.error}</span>}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length && !requirementsLoading && (
              <tr>
                <td colSpan={5}>No requirements defined yet.</td>
              </tr>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default LenderProductDetail;
