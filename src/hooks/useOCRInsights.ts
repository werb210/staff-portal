import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchDocumentRequirements } from "@/api/documents";
import { fetchOcrInsights } from "@/api/ocr.routes";
import { getOcrFieldDefinition } from "@/ocr/OCR_FIELD_REGISTRY";
import { useApplicationDrawerStore } from "@/state/applicationDrawer.store";
import type { DocumentRequirement } from "@/types/documents.types";
import type { OcrMismatchFlag } from "@/ocr/ocrComparator";
import { resolveOcrInsightsCategoryId } from "@/features/ocrInsights/ocrInsightsConfig";

export type OcrInsightRow = {
  fieldKey: string;
  label: string;
  value: string;
  documentId: string;
  documentName: string;
  documentCategory: string;
  conflict: boolean;
  comparisonValues: string[];
};

export type OcrInsightsView = {
  groupedByCategory: Record<string, OcrInsightRow[]>;
  missingRequiredFields: string[];
  mismatches: OcrMismatchFlag[];
  mismatchRows: OcrMismatchRow[];
};

export type OcrMismatchRow = {
  fieldKey: string;
  label: string;
  value: string;
  documentId: string;
  documentName: string;
  comparisonValues: string[];
};

const buildMismatchLookup = (mismatches: OcrMismatchFlag[]) => {
  const lookup = new Map<string, OcrMismatchFlag>();
  mismatches.forEach((mismatch) => {
    lookup.set(`${mismatch.field_key}:${mismatch.document_id}`, mismatch);
  });
  return lookup;
};

const resolveDocumentMeta = (documentId: string, documents: DocumentRequirement[]) => {
  const fallback = { name: "Unknown document", category: "Uncategorized" };
  const doc = documents.find((item) => item.id === documentId);
  if (!doc) return fallback;
  return {
    name: doc.name,
    category: doc.category ?? "Uncategorized"
  };
};

export const useOCRInsights = () => {
  const applicationId = useApplicationDrawerStore((state) => state.selectedApplicationId);

  const ocrQuery = useQuery({
    queryKey: ["ocr", applicationId, "insights"],
    queryFn: () => fetchOcrInsights(applicationId ?? ""),
    enabled: Boolean(applicationId)
  });

  const documentsQuery = useQuery({
    queryKey: ["applications", applicationId, "documents"],
    queryFn: ({ signal }) => fetchDocumentRequirements(applicationId ?? "", { signal }),
    enabled: Boolean(applicationId)
  });

  const view = useMemo<OcrInsightsView>(() => {
    const documents = documentsQuery.data ?? [];
    const ocrData = ocrQuery.data;
    if (!ocrData) {
      return { groupedByCategory: {}, missingRequiredFields: [], mismatches: [], mismatchRows: [] };
    }

    const mismatchLookup = buildMismatchLookup(ocrData.mismatch_flags);
    const groupedByCategory: Record<string, OcrInsightRow[]> = {};

    ocrData.results.forEach((result) => {
      const field = getOcrFieldDefinition(result.field_key);
      if (!field) return;
      const documentMeta = resolveDocumentMeta(result.document_id, documents);
      const mismatch = mismatchLookup.get(`${result.field_key}:${result.document_id}`);
      const categoryId = resolveOcrInsightsCategoryId(result.field_key);
      const row: OcrInsightRow = {
        fieldKey: result.field_key,
        label: field.display_label,
        value: result.extracted_value,
        documentId: result.document_id,
        documentName: documentMeta.name,
        documentCategory: categoryId,
        conflict: Boolean(mismatch),
        comparisonValues: mismatch?.comparison_values ?? []
      };
      if (!groupedByCategory[categoryId]) groupedByCategory[categoryId] = [];
      groupedByCategory[categoryId].push(row);
    });

    const mismatchRows = ocrData.mismatch_flags.map((flag) => {
      const field = getOcrFieldDefinition(flag.field_key);
      const documentMeta = resolveDocumentMeta(flag.document_id, documents);
      return {
        fieldKey: flag.field_key,
        label: field?.display_label ?? flag.field_key,
        value: flag.value,
        documentId: flag.document_id,
        documentName: documentMeta.name,
        comparisonValues: flag.comparison_values
      };
    });

    return {
      groupedByCategory,
      missingRequiredFields: ocrData.missing_required_fields.map(
        (fieldKey) => getOcrFieldDefinition(fieldKey)?.display_label ?? fieldKey
      ),
      mismatches: ocrData.mismatch_flags,
      mismatchRows
    };
  }, [documentsQuery.data, ocrQuery.data]);

  return {
    applicationId,
    isLoading: ocrQuery.isLoading || documentsQuery.isLoading,
    error: ocrQuery.error ?? documentsQuery.error,
    data: view
  };
};
