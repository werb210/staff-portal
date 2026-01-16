import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { usePipelineStore } from "./pipeline.store";

const PipelineFilters = () => {
  const filters = usePipelineStore((state) => state.currentFilters);
  const setFilters = usePipelineStore((state) => state.setFilters);
  const resetFilters = usePipelineStore((state) => state.resetFilters);

  return (
    <div className="pipeline-filters">
      <Input
        label="Search"
        placeholder="Business or applicant name"
        value={filters.searchTerm ?? ""}
        onChange={(event) => setFilters({ searchTerm: event.target.value })}
      />
      <Select
        label="Product Category"
        value={filters.productCategory ?? ""}
        onChange={(event) => setFilters({ productCategory: event.target.value || undefined })}
        options={[
          { value: "", label: "All" },
          { value: "startup", label: "Start-Up" },
          { value: "sba", label: "SBA" },
          { value: "term-loan", label: "Term Loan" }
        ]}
      />
      <Select
        label="Assigned Staff"
        value={filters.assignedStaffId ?? ""}
        onChange={(event) => setFilters({ assignedStaffId: event.target.value || undefined })}
        options={[
          { value: "", label: "Anyone" },
          { value: "me", label: "Me" },
          { value: "team", label: "Team" }
        ]}
      />
      <div className="pipeline-filters__dates">
        <Input
          label="From"
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(event) => setFilters({ dateFrom: event.target.value || undefined })}
        />
        <Input
          label="To"
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(event) => setFilters({ dateTo: event.target.value || undefined })}
        />
      </div>
      <Select
        label="Documents"
        value={filters.docsStatus ?? "all"}
        onChange={(event) => setFilters({ docsStatus: event.target.value as typeof filters.docsStatus })}
        options={[
          { value: "all", label: "All" },
          { value: "complete", label: "Complete" },
          { value: "missing", label: "Missing" }
        ]}
      />
      <Select
        label="Banking"
        value={filters.bankingComplete == null ? "any" : String(filters.bankingComplete)}
        onChange={(event) => {
          const value = event.target.value;
          setFilters({ bankingComplete: value === "any" ? null : value === "true" });
        }}
        options={[
          { value: "any", label: "Any" },
          { value: "true", label: "Complete" },
          { value: "false", label: "Requires Documents" }
        ]}
      />
      <Select
        label="OCR"
        value={filters.ocrComplete == null ? "any" : String(filters.ocrComplete)}
        onChange={(event) => {
          const value = event.target.value;
          setFilters({ ocrComplete: value === "any" ? null : value === "true" });
        }}
        options={[
          { value: "any", label: "Any" },
          { value: "true", label: "Complete" },
          { value: "false", label: "Requires Documents" }
        ]}
      />
      <Select
        label="Sort"
        value={filters.sort ?? "newest"}
        onChange={(event) => setFilters({ sort: event.target.value as typeof filters.sort })}
        options={[
          { value: "newest", label: "Newest" },
          { value: "oldest", label: "Oldest" },
          { value: "highest_amount", label: "Highest Amount" },
          { value: "lowest_amount", label: "Lowest Amount" }
        ]}
      />
      <button className="ui-button ui-button--ghost pipeline-filters__reset" onClick={resetFilters} type="button">
        Reset Filters
      </button>
    </div>
  );
};

export default PipelineFilters;
